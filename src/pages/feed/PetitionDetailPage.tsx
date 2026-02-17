import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { petitionService } from '../../services/petition.service';
import { postulationService } from '../../services/postulation.service';
import { chatService } from '../../services/chat.service';
import type { PetitionResponse } from '../../types/petition.types';
import type { PostulationResponse } from '../../types/postulation.types';
import { format, formatDistanceToNow, isAfter, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

// Importamos el componente de calificaciones y la nueva validación
import { RateProviderForm } from '../../components/reviews/RateProviderForm';
import { RateCustomerForm } from '../../components/reviews/RateCustomerForm';
import { checkIfProviderRated, getCustomerRatingStatus } from '../../services/grade.service';

interface ApiErrorPayload {
  message?: string;
}

interface TimelineStep {
  key: string;
  label: string;
}

const parseBudgetValue = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const sanitized = value
      .trim()
      .replace(/\s+/g, '')
      .replace(/[^\d,.-]/g, '');

    if (!sanitized) return null;

    const hasDot = sanitized.includes('.');
    const hasComma = sanitized.includes(',');
    let normalized = sanitized;

    if (hasDot && hasComma) {
      const lastDot = sanitized.lastIndexOf('.');
      const lastComma = sanitized.lastIndexOf(',');
      if (lastDot > lastComma) {
        normalized = sanitized.replace(/,/g, '');
      } else {
        normalized = sanitized.replace(/\./g, '').replace(',', '.');
      }
    } else if (hasComma) {
      const commaCount = (sanitized.match(/,/g) ?? []).length;
      const [left, right = ''] = sanitized.split(',');
      const isThousands = commaCount > 1 || (right.length === 3 && left.length >= 1);
      normalized = isThousands ? sanitized.replace(/,/g, '') : sanitized.replace(',', '.');
    } else if (hasDot) {
      const dotCount = (sanitized.match(/\./g) ?? []).length;
      const [left, right = ''] = sanitized.split('.');
      const isThousands = dotCount > 1 || (right.length === 3 && left.length >= 1);
      normalized = isThousands ? sanitized.replace(/\./g, '') : sanitized;
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const resolvePostulationBudget = (postulation: PostulationResponse): number | null => {
  const directBudget = parseBudgetValue(postulation.budget);
  if (directBudget !== null) return directBudget;

  const maybePostulation = postulation as PostulationResponse & {
    proposal?: string;
    offer?: string;
  };
  const candidateText = [maybePostulation.proposal, maybePostulation.offer, postulation.description]
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .join(' ');

  const match = candidateText.match(/(?:presupuesto|monto|total|\$)\s*[:\-]?\s*\$?\s*([\d.,]+)/i);
  return match ? parseBudgetValue(match[1]) : null;
};

const resolvePostulationDescription = (postulation: PostulationResponse): string => {
  const rawDescription = postulation.description ?? '';
  return rawDescription
    // Casos como: "Presupuesto: $123 | Detalle: ..."
    .replace(/^\s*(?:presupuesto|monto|total)\s*:?\s*\$?\s*[\d.,]+\s*(?:[|,-]\s*)?/i, '')
    .replace(/^\s*detalle\s*:?\s*/i, '')
    // Casos como: "... | Presupuesto: $123"
    .replace(/\s*(?:[|,-]\s*)?(?:presupuesto|monto|total)\s*:?\s*\$?\s*[\d.,]+\s*$/i, '')
    .trim();
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'object' && error !== null) {
    const maybeError = error as { response?: { data?: ApiErrorPayload } };
    return maybeError.response?.data?.message ?? fallback;
  }
  return fallback;
};

export const PetitionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  const [petition, setPetition] = useState<PetitionResponse | null>(null);
  const [postulations, setPostulations] = useState<PostulationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isAccepting, setIsAccepting] = useState<number | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  const [startingChatId, setStartingChatId] = useState<number | null>(null);

  const [showRatingForm, setShowRatingForm] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [submittedReview, setSubmittedReview] = useState<{rating: number, comment: string} | null>(null);
  // Nuevo estado para que el proveedor sepa si puede evaluar al cliente
  const [customerRatingStatus, setCustomerRatingStatus] = useState<{ canRate: boolean; hasRated: boolean; customerId: number; customerName: string } | null>(null);

  const [offer, setOffer] = useState({ description: '', budget: '' });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const returnPath = role === 'PROVIDER' ? '/feed' : '/client-home';

  const loadData = useCallback(
    async (idPetition: number) => {
      try {
        setLoading(true);
        setFeedback(null);

        const [petitionData, postulationsData, hasApplied] = await Promise.all([
          petitionService.getById(idPetition),
          role === 'CUSTOMER' ? postulationService.getByPetition(idPetition) : Promise.resolve([]),
          role === 'PROVIDER' ? postulationService.checkIfApplied(idPetition) : Promise.resolve(false),
        ]);

        setPetition(petitionData);
        setPostulations(postulationsData);
        setAlreadyApplied(hasApplied);

        if (role === 'CUSTOMER' && petitionData.stateName === 'FINALIZADA') {
          const winner = postulationsData.find((p) => p.isWinner);
          if (winner?.providerId) {
            const yaCalifico = await checkIfProviderRated(winner.providerId, petitionData.idPetition);
            setHasRated(yaCalifico);
          }
        }

        // --- NUEVO: Si es proveedor y está finalizada, averiguamos si puede calificar al cliente
        if (role === 'PROVIDER' && petitionData.stateName === 'FINALIZADA') {
          const ratingStatus = await getCustomerRatingStatus(idPetition);
          if (ratingStatus) {
            setCustomerRatingStatus(ratingStatus);
            if (ratingStatus.hasRated) {
              setHasRated(true); // Reusamos este estado visual
            }
          }
        }

      } catch (error) {
        console.error('Error al cargar datos:', error);
        setFeedback({ type: 'error', message: 'No se pudo cargar la solicitud.' });
      } finally {
        setLoading(false);
      }
    },
    [role]
  );

  useEffect(() => {
    if (!id) return;
    const petitionId = Number(id);
    if (Number.isNaN(petitionId)) {
      navigate(returnPath);
      return;
    }
    void loadData(petitionId);
  }, [id, loadData, navigate, returnPath]);

  const isAdjudicada = petition?.stateName === 'ADJUDICADA';
  const isFinalizada = petition?.stateName === 'FINALIZADA';
  const isCancelada = petition?.stateName === 'CANCELADA';
  const isPublicada = petition?.stateName === 'PUBLICADA';
  
  const isExpired = useMemo(() => {
    if (!petition?.dateUntil) return false;
    return isAfter(startOfDay(new Date()), new Date(petition.dateUntil));
  }, [petition?.dateUntil]);

  const canApply = role === 'PROVIDER' && isPublicada && !alreadyApplied && !isExpired;
  const canComplete = role === 'CUSTOMER' && isAdjudicada;
  const canReactivate = role === 'CUSTOMER' && isCancelada && !isExpired;
  const canShowProviderActions = role === 'PROVIDER';

  const providerStatusMessage = useMemo(() => {
    if (role !== 'PROVIDER') return null;
    if (alreadyApplied) {
      return { title: 'Ya te postulaste', description: 'Tu propuesta esta en revision del cliente.', tone: 'success' as const };
    }
    if (isFinalizada) {
      return { title: 'Trabajo finalizado', description: 'Esta solicitud ya cerro su ciclo y no acepta nuevas postulaciones.', tone: 'neutral' as const };
    }
    if (isAdjudicada) {
      return { title: 'Solicitud adjudicada', description: 'El cliente ya selecciono un proveedor para este trabajo.', tone: 'neutral' as const };
    }
    if (isCancelada) {
      return { title: 'Solicitud cancelada', description: 'Esta publicacion fue cancelada por el cliente.', tone: 'warning' as const };
    }
    if (isExpired) {
      return { title: 'Publicacion expirada', description: 'La fecha limite ya paso. Busca otras oportunidades activas en el feed.', tone: 'warning' as const };
    }
    return null;
  }, [alreadyApplied, isAdjudicada, isCancelada, isExpired, isFinalizada, role]);

  const timelineSteps: TimelineStep[] = useMemo(
    () => [
      { key: 'PUBLICADA', label: 'Publicada' },
      { key: 'POSTULACIONES', label: 'Postulaciones' },
      { key: 'ADJUDICADA', label: 'Adjudicada' },
      { key: 'FINALIZADA', label: 'Finalizada' },
    ],
    []
  );

  const timelineProgress = useMemo(() => {
    if (!petition) return 0;
    const hasCandidates = postulations.length > 0;

    switch (petition.stateName) {
      case 'FINALIZADA': return 3;
      case 'ADJUDICADA': return 2;
      case 'POSTULACIONES': return 1;
      case 'PUBLICADA': return hasCandidates ? 1 : 0;
      case 'CREADA': return 0;
      case 'CANCELADA': return hasCandidates ? 1 : 0;
      default: return 0;
    }
  }, [petition, postulations.length]);

  const sortedPostulations = useMemo(() => {
    return [...postulations].sort((a, b) => {
      if (a.isWinner && !b.isWinner) return -1;
      if (!a.isWinner && b.isWinner) return 1;
      return 0;
    });
  }, [postulations]);

  const customerMetrics = useMemo(() => {
    const total = postulations.length;
    const winner = postulations.find((post) => post.isWinner);
    const budgets = postulations
      .map(resolvePostulationBudget)
      .filter((budget): budget is number => budget !== null);
    const averageBudget = budgets.length
      ? Math.round(budgets.reduce((acc, value) => acc + value, 0) / budgets.length)
      : 0;

    return {
      total,
      winner,
      winnerName: winner?.providerName ?? null,
      averageBudget,
      budgetsWithValue: budgets.length,
    };
  }, [postulations]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!petition) return;

    try {
      setIsApplying(true);
      await postulationService.create({
        idPetition: petition.idPetition,
        description: offer.description,
        budget: Number(offer.budget)
      });
      setFeedback({ type: 'success', message: '¡Postulación enviada correctamente!' });
      setShowApplyForm(false);
      setAlreadyApplied(true);
      await loadData(petition.idPetition);
    } catch (error) {
      setFeedback({ type: 'error', message: getErrorMessage(error, 'Error al enviar postulación.') });
    } finally {
      setIsApplying(false);
    }
  };

  const handleAcceptProvider = async (idPostulation: number) => {
    if (!window.confirm('¿Confirmas que quieres aceptar esta postulación?')) return;
    try {
      setIsAccepting(idPostulation);
      await postulationService.accept(idPostulation);
      setFeedback({ type: 'success', message: '¡Postulación aceptada!' });
      if (id) await loadData(Number(id));
    } catch (error) {
      setFeedback({ type: 'error', message: getErrorMessage(error, 'No se pudo procesar.') });
    } finally {
      setIsAccepting(null);
    }
  };

  const handleReactivate = async () => {
    if (!petition || isExpired) return;
    try {
      setIsReactivating(true);
      await petitionService.reactivate(petition.idPetition);
      setFeedback({ type: 'success', message: '¡Solicitud reactivada!' });
      await loadData(petition.idPetition);
    } catch (error) {
      setFeedback({ type: 'error', message: getErrorMessage(error, 'Error al reactivar.') });
    } finally {
      setIsReactivating(false);
    }
  };

  const handleCompleteWork = async () => {
    if (!petition || !window.confirm('¿Confirmas que el trabajo terminó?')) return;
    try {
      setIsCompleting(true);
      await petitionService.complete(petition.idPetition);
      setFeedback({ type: 'success', message: '¡Trabajo finalizado! Ahora puedes calificar al proveedor.' });
      await loadData(petition.idPetition);
    } catch (error) {
      setFeedback({ type: 'error', message: getErrorMessage(error, 'Error al finalizar.') });
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDelete = async () => {
    if (!petition) return;
    if (!window.confirm('¿Seguro que quieres cancelar esta solicitud?')) return;
    try {
      setIsDeleting(true);
      await petitionService.delete(petition.idPetition);
      setFeedback({ type: 'success', message: 'Solicitud cancelada.' });
      await loadData(petition.idPetition);
    } catch (error) {
      setFeedback({ type: 'error', message: getErrorMessage(error, 'Error al cancelar.') });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStartChat = async (providerId: number) => {
    if (!petition) return;
    setStartingChatId(providerId); 
    try {
      const conv = await chatService.getOrCreateConversation(petition.idPetition, providerId);
      navigate(`/chat/${conv.idConversation}`);
    } catch (error) {
      console.error("Error iniciando el chat", error);
      alert("Hubo un error al intentar crear la conversación.");
    } finally {
      setStartingChatId(null);
    }
  };

  if (loading) return <div className="app-shell"><Navbar /><main className="mx-auto max-w-5xl px-4 py-8 text-center text-slate-500">Cargando...</main></div>;
  if (!petition) return null;

  return (
    <div className="app-shell">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <button onClick={() => navigate(returnPath)} className="mb-5 text-sm text-slate-500 hover:text-brand-600 transition-colors">← Volver</button>

        <section className="panel mb-6 px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200">Linea de tiempo</h2>
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                isCancelada
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  : 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
              }`}
            >
              Estado actual: {petition.stateName}
            </span>
          </div>

          <div className="mt-5 flex items-start justify-between gap-1">
            {timelineSteps.map((step, idx) => {
              const isCompleted = idx < timelineProgress;
              const isActive = idx === timelineProgress && !isCancelada;
              const isFuture = idx > timelineProgress;

              return (
                <div key={step.key} className="relative flex flex-1 flex-col items-center">
                  {idx !== 0 && (
                    <div className={`absolute right-1/2 top-4 h-1 w-full -z-10 ${isFuture ? 'bg-slate-200 dark:bg-slate-700' : 'bg-brand-500'}`} />
                  )}
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-black ${
                      isCompleted ? 'bg-brand-600 text-white' : isActive ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-500 dark:bg-brand-900/30 dark:text-brand-200' : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                  <span className={`mt-2 text-center text-[10px] font-bold uppercase ${isCompleted || isActive ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {isCancelada && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
              Solicitud cancelada. La linea de tiempo queda detenida en el estado alcanzado.
            </div>
          )}
        </section>

        {feedback && (
          <div className={`mb-5 rounded-xl border px-4 py-3 text-sm font-medium ${feedback.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {feedback.message}
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-6 md:col-span-2">
            <article className={`panel p-6 md:p-8 ${isCancelada ? 'opacity-60 bg-slate-50' : ''}`}>
              <div className="mb-4 flex justify-between">
                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${isCancelada ? 'bg-red-100 text-red-700' : 'bg-brand-100 text-brand-700'}`}>
                  {isCancelada ? 'CANCELADA' : petition.typePetitionName}
                </span>
                <span className="text-xs text-slate-500">{formatDistanceToNow(new Date(petition.dateSince), { addSuffix: true, locale: es })}</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{petition.professionName}</h1>
              <p className="mt-4 text-slate-700 dark:text-slate-300 leading-relaxed">{petition.description}</p>
              
              {/* --- AQUÍ RENDERIZAMOS LA FOTO ADJUNTA SI EXISTE --- */}
              {petition.imageUrl && (
                <div className="mt-6">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Foto adjunta:</h3>
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 max-w-full bg-slate-100 dark:bg-slate-800 flex justify-center">
                    <img 
                      src={petition.imageUrl} 
                      alt="Problema adjunto" 
                      className="max-h-[400px] w-auto object-contain hover:scale-[1.02] transition-transform duration-300"
                    />
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-4 text-sm">
                <span className="rounded-lg bg-slate-100 px-3 py-2 font-medium">📍 {petition.cityName}</span>
                <span className={`rounded-lg px-3 py-2 font-medium ${isExpired ? 'bg-red-100 text-red-700' : 'bg-slate-100'}`}>📅 Vence: {format(new Date(petition.dateUntil), 'dd/MM/yyyy')}</span>
                {petition.customerId && (
                  <button
                    type="button"
                    onClick={() => navigate(`/customer/${petition.customerId}`)}
                    className="rounded-lg bg-brand-50 px-3 py-2 font-semibold text-brand-700 hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-300"
                  >
                    👤 {petition.customerName}
                  </button>
                )}
              </div>
            </article>

            {/* SECCIÓN DE CANDIDATOS (CLIENTE) */}
            {role === 'CUSTOMER' && (
              <section className="space-y-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Candidatos</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Evalua las propuestas y elige el proveedor mas conveniente.</p>
                  </div>
                  {postulations.length > 0 && (
                    <button type="button" onClick={() => id && void loadData(Number(id))} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                      Actualizar
                    </button>
                  )}
                </div>

                {postulations.length > 0 && (
                  <div className="grid gap-3 sm:grid-cols-3">
                    <article className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Postulaciones</p>
                      <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{customerMetrics.total}</p>
                    </article>
                    <article className="rounded-xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-900/40 dark:bg-brand-900/20">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">Promedio ofertas</p>
                      <p className="mt-2 text-2xl font-black text-brand-800 dark:text-brand-200">
                        {customerMetrics.budgetsWithValue > 0 ? `$${customerMetrics.averageBudget}` : 'Sin monto'}
                      </p>
                    </article>
                    <article className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900/40 dark:bg-green-900/20">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-green-700 dark:text-green-300">Proveedor elegido</p>
                      <p className="mt-2 truncate text-sm font-bold text-green-800 dark:text-green-200">
                        {customerMetrics.winnerName ?? 'Sin definir'}
                      </p>
                    </article>
                  </div>
                )}

                {isCancelada ? (
                  <div className="panel p-8 text-center italic text-slate-500">Solicitud cancelada. Gestion de candidatos inhabilitada.</div>
                ) : postulations.length === 0 ? (
                  <div className="panel p-8 text-center text-slate-500">Sin postulaciones aun.</div>
                ) : (
                  <div className="grid gap-4">
                    {sortedPostulations.map((post) => (
                      <article 
                        key={post.idPostulation} 
                        className={`panel flex flex-col gap-4 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center sm:justify-between ${post.isWinner ? 'border-green-400 ring-1 ring-green-400 dark:border-green-700 dark:ring-green-700' : ''}`}
                      >
                        <div className="flex items-start gap-3 w-full sm:w-auto">
                          {/* Avatar clickeable para ver perfil */}
                          <button 
                            onClick={() => navigate(`/provider/${post.providerId}`)}
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-lg font-black text-brand-700 hover:ring-2 hover:ring-brand-400 transition-all dark:bg-brand-900/30 dark:text-brand-300 overflow-hidden"
                            title="Ver perfil del proveedor"
                          >
                            {post.providerImage ? (
                              <img src={post.providerImage} alt={post.providerName} className="h-full w-full object-cover" />
                            ) : (
                              post.providerName.slice(0, 1).toUpperCase()
                            )}
                          </button>

                          <div className="space-y-1 w-full">
                            <div className="flex flex-wrap items-center gap-2">
                              <button 
                                onClick={() => navigate(`/provider/${post.providerId}`)}
                                className="font-semibold text-slate-900 hover:text-brand-600 transition-colors dark:text-white dark:hover:text-brand-400"
                              >
                                {post.providerName}
                              </button>
                              
                              {post.providerRating !== undefined && post.providerRating > 0 && (
                                <span className="flex items-center gap-1 bg-yellow-50 border border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-700/50 dark:text-yellow-400 px-2 py-0.5 rounded-md text-xs font-bold shadow-sm">
                                  ⭐ {post.providerRating.toFixed(1)}
                                </span>
                              )}
                              
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                {post.stateName}
                              </span>
                              {post.isWinner && (
                                <span className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300">Ganador</span>
                              )}
                            </div>
                            
                            <div className="rounded-lg bg-slate-50 p-3 mt-2 border border-slate-100 dark:bg-slate-800/50 dark:border-slate-700/50">
                              <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line">
                                {resolvePostulationDescription(post)}
                              </p>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 text-[11px] mt-2">
                              {(() => {
                                const resolvedBudget = resolvePostulationBudget(post);
                                return resolvedBudget !== null ? (
                                  <span className="rounded-md bg-brand-50 border border-brand-100 px-2 py-1 font-bold text-brand-700 dark:bg-brand-900/30 dark:border-brand-800/50 dark:text-brand-300">
                                    Presupuesto estimado: ${resolvedBudget}
                                  </span>
                                ) : (
                                  <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-1 font-semibold text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                                    Presupuesto: No informado
                                  </span>
                                );
                              })()}
                            </div>
                          </div>
                        </div>

                        {/* Botones de Acción */}
                        <div className="flex flex-col gap-2 sm:min-w-[140px] mt-4 sm:mt-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800 justify-center">
                          {post.isWinner ? (
                            <>
                              <span className="text-center rounded-lg bg-green-50 px-3 py-2 text-xs font-bold text-green-700 dark:bg-green-900/20 dark:text-green-300">
                                Proveedor Seleccionado
                              </span>
                              {!isFinalizada && !isCancelada && (
                                <button 
                                  onClick={() => handleStartChat(post.providerId)}
                                  disabled={startingChatId === post.providerId}
                                  className="w-full rounded-lg bg-white border border-brand-300 px-4 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-50 shadow-sm dark:bg-slate-800 dark:border-brand-700/50 dark:text-brand-300 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {startingChatId === post.providerId ? 'Iniciando...' : '💬 Abrir Chat'}
                                </button>
                              )}
                            </>
                          ) : (
                            !isAdjudicada && !isFinalizada && !isCancelada && (
                              <>
                                <button 
                                  onClick={() => handleAcceptProvider(post.idPostulation)} 
                                  disabled={isAccepting !== null} 
                                  className="w-full rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-700 shadow-sm disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                  {isAccepting === post.idPostulation ? 'Aceptando...' : 'Aceptar Propuesta'}
                                </button>
                                
                                <button 
                                  onClick={() => handleStartChat(post.providerId)}
                                  disabled={startingChatId === post.providerId}
                                  className="w-full rounded-lg bg-white border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 shadow-sm dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {startingChatId === post.providerId ? 'Iniciando...' : '💬 Contactar'}
                                </button>
                              </>
                            )
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>

          <aside className="space-y-4">
            <section className="panel bg-slate-50 p-5 text-center dark:bg-slate-900">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Estado</h3>
              <p className={`mt-2 text-lg font-black ${isCancelada ? 'text-red-600' : 'text-brand-600'}`}>{petition.stateName}</p>
              <p className={`mt-3 rounded-lg px-3 py-2 text-xs font-semibold ${isExpired ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                Vence: {format(new Date(petition.dateUntil), 'dd/MM/yyyy')}
              </p>
            </section>

            {/* ACCIONES PARA PROVEEDOR */}
            {canApply && (
              <section className="panel space-y-4 border-2 border-brand-200 p-5 dark:border-brand-700/60">
                {!showApplyForm ? (
                  <div className="space-y-4">
                    <div className="rounded-xl bg-brand-50 p-4 text-left dark:bg-brand-900/20">
                      <p className="text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">Tu propuesta</p>
                      <h3 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">Postulate a este trabajo</h3>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Presenta un presupuesto claro y explica brevemente por que sos una buena opcion.</p>
                    </div>
                    <button onClick={() => setShowApplyForm(true)} className="w-full rounded-xl bg-brand-600 py-3 text-sm font-bold text-white transition hover:bg-brand-700 active:scale-[0.99]">
                      Postularme ahora
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApply} className="space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Completa tu propuesta</h4>
                    </div>
                    <input type="number" placeholder="Presupuesto ($)" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white" value={offer.budget} onChange={(e) => setOffer({ ...offer, budget: e.target.value })} required />
                    <textarea placeholder="Describe tu enfoque de trabajo..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white" rows={4} maxLength={300} value={offer.description} onChange={(e) => setOffer({ ...offer, description: e.target.value })} required />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setShowApplyForm(false)} className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">Cancelar</button>
                      <button type="submit" disabled={isApplying} className="flex-1 rounded-xl bg-brand-600 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70">{isApplying ? 'Enviando...' : 'Enviar postulacion'}</button>
                    </div>
                  </form>
                )}
              </section>
            )}

            {canShowProviderActions && providerStatusMessage && !canApply && (
              <section className={`panel p-5 text-center ${providerStatusMessage.tone === 'success' ? 'border border-green-200 bg-green-50' : providerStatusMessage.tone === 'warning' ? 'border border-amber-200 bg-amber-50' : 'bg-slate-50'}`}>
                <p className={`text-sm font-bold ${providerStatusMessage.tone === 'success' ? 'text-green-700' : providerStatusMessage.tone === 'warning' ? 'text-amber-800' : 'text-slate-700'}`}>{providerStatusMessage.title}</p>
                <p className={`mt-1 text-xs ${providerStatusMessage.tone === 'success' ? 'text-green-600' : providerStatusMessage.tone === 'warning' ? 'text-amber-700' : 'text-slate-500'}`}>{providerStatusMessage.description}</p>
              </section>
            )}

            {/* --- NUEVO: SECCIÓN DE CALIFICACIÓN PARA EL PROVEEDOR --- */}
            {role === 'PROVIDER' && customerRatingStatus && (customerRatingStatus.canRate || customerRatingStatus.hasRated) && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => navigate(`/customer/${customerRatingStatus.customerId}`)}
                  className="mb-4 w-full rounded-xl border border-brand-300 bg-white py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 dark:border-brand-700/50 dark:bg-slate-800 dark:text-brand-300 dark:hover:bg-slate-700"
                >
                  Ver perfil del cliente
                </button>
                {customerRatingStatus.canRate && !showRatingForm && (
                  <button 
                    onClick={() => setShowRatingForm(true)} 
                    className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white shadow-lg transition hover:bg-blue-700 active:scale-95 mb-4"
                  >
                    ⭐ Calificar al cliente
                  </button>
                )}
                
                {customerRatingStatus.canRate && showRatingForm && (
                  <div className="panel p-5 border-2 border-brand-200 mt-4 mb-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white">Dejar reseña al cliente</h3>
                      <button onClick={() => setShowRatingForm(false)} className="text-xs text-slate-500 hover:text-slate-700">Cancelar</button>
                    </div>
                    <RateCustomerForm
                        customerId={customerRatingStatus.customerId}
                        petitionId={petition.idPetition}
                        onSuccess={(r, c) => {
                            setCustomerRatingStatus(prev => prev ? {...prev, canRate: false, hasRated: true} : null);
                            setHasRated(true);
                            setSubmittedReview({ rating: r, comment: c });
                            setShowRatingForm(false);
                        }}
                    />
                  </div>
                )}
                
                {customerRatingStatus.hasRated && (
                  <div className="mt-4 mb-4 rounded-xl border border-green-200 bg-green-50 p-5 shadow-sm dark:border-green-900/50 dark:bg-green-900/20">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-sm font-bold text-green-800 dark:text-green-300">
                        {submittedReview ? `Tu calificación para ${customerRatingStatus.customerName}` : `Ya calificaste a ${customerRatingStatus.customerName}`}
                      </h3>
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-900/50 dark:text-green-400">
                        ✓ Completado
                      </span>
                    </div>
                    {submittedReview ? (
                      <>
                        <div className="flex text-yellow-400 text-lg mb-2 drop-shadow-sm">
                          {'★'.repeat(submittedReview.rating)}
                          <span className="text-gray-300 dark:text-slate-600">
                            {'★'.repeat(5 - submittedReview.rating)}
                          </span>
                        </div>
                        {submittedReview.comment ? (
                          <p className="text-sm text-green-700 dark:text-green-400 italic">"{submittedReview.comment}"</p>
                        ) : (
                          <p className="text-xs text-green-600/70 dark:text-green-400/70 italic">Sin comentario escrito.</p>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-green-700 mt-2">
                        Tu reseña ya se encuentra registrada en el perfil del cliente.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ACCIONES PARA CLIENTE */}
            {role === 'CUSTOMER' && (
              <>
                {canReactivate && (
                  <button onClick={handleReactivate} disabled={isReactivating} className="w-full rounded-xl bg-green-600 py-3 font-bold text-white shadow-lg active:scale-95 transition hover:bg-green-700">
                    {isReactivating ? 'Procesando...' : 'Reactivar Solicitud'}
                  </button>
                )}

                {isCancelada && isExpired && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-[10px] text-amber-800">
                    Expirada: actualiza la fecha para reactivar.
                  </div>
                )}

                {canComplete && (
                  <button onClick={handleCompleteWork} disabled={isCompleting} className="w-full rounded-xl bg-brand-600 py-3 font-bold text-white shadow-lg active:scale-95 transition hover:bg-brand-700">
                    {isCompleting ? 'Finalizando...' : 'Finalizar Trabajo'}
                  </button>
                )}

                {!isAdjudicada && !isFinalizada && !isCancelada && (
                  <button onClick={handleDelete} disabled={isDeleting} className="w-full rounded-xl border-2 border-red-200 bg-white py-3 font-bold text-red-600 hover:bg-red-50 active:scale-95 transition">
                    {isDeleting ? '...' : 'Cancelar Solicitud'}
                  </button>
                )}

                {/* === SECCIÓN DE CALIFICACIÓN === */}
                {isFinalizada && customerMetrics.winner && !hasRated && (
                  <div className="mt-4">
                    {!showRatingForm ? (
                      <button 
                        onClick={() => setShowRatingForm(true)}
                        className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white shadow-lg transition hover:bg-blue-700 active:scale-95"
                      >
                        ⭐ Calificar a {customerMetrics.winnerName}
                      </button>
                    ) : (
                      <div className="panel p-5 border-2 border-brand-200">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-sm font-bold text-slate-800 dark:text-white">Dejar reseña</h3>
                          <button onClick={() => setShowRatingForm(false)} className="text-xs text-slate-500 hover:text-slate-700">Cancelar</button>
                        </div>
                        
                        <RateProviderForm 
                          providerId={customerMetrics.winner.providerId} 
                          petitionId={petition.idPetition}
                          onSuccess={(ratingSent, commentSent) => {
                            setHasRated(true);
                            setSubmittedReview({ rating: ratingSent, comment: commentSent });
                            setShowRatingForm(false);
                          }} 
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* === NUEVO DISEÑO PARA MOSTRAR LA CALIFICACIÓN EMITIDA O YA EXISTENTE === */}
                {isFinalizada && hasRated && (
                  <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-5 shadow-sm dark:border-green-900/50 dark:bg-green-900/20">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-sm font-bold text-green-800 dark:text-green-300">
                        {submittedReview ? `Tu calificación para ${customerMetrics.winnerName}` : `Ya calificaste a ${customerMetrics.winnerName}`}
                      </h3>
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-900/50 dark:text-green-400">
                        ✓ Completado
                      </span>
                    </div>
                    
                    {submittedReview ? (
                      <>
                        <div className="flex text-yellow-400 text-lg mb-2 drop-shadow-sm">
                          {'★'.repeat(submittedReview.rating)}
                          <span className="text-gray-300 dark:text-slate-600">
                            {'★'.repeat(5 - submittedReview.rating)}
                          </span>
                        </div>

                        {submittedReview.comment ? (
                          <p className="text-sm text-green-700 dark:text-green-400 italic">
                            "{submittedReview.comment}"
                          </p>
                        ) : (
                          <p className="text-xs text-green-600/70 dark:text-green-400/70 italic">
                            Sin comentario escrito.
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-green-700 mt-2">
                        Gracias por haber evaluado este trabajo. Tu reseña ya se encuentra registrada en el sistema.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
};

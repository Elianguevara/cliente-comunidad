import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { petitionService } from '../../services/petition.service';
import { postulationService } from '../../services/postulation.service';
import type { PetitionResponse } from '../../types/petition.types';
import type { PostulationResponse } from '../../types/postulation.types';
import { format, formatDistanceToNow, isAfter, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface ApiErrorPayload {
  message?: string;
}

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
  const [isApplying, setIsApplying] = useState(false);
  const [isAccepting, setIsAccepting] = useState<number | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  const [offer, setOffer] = useState({ description: '', budget: '' });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const returnPath = role === 'PROVIDER' ? '/feed' : '/client-home';

  const loadData = useCallback(
    async (idPetition: number) => {
      try {
        setLoading(true);
        setFeedback(null);

        const [petitionData, hasApplied, postulationsData] = await Promise.all([
          petitionService.getById(idPetition),
          role === 'PROVIDER' ? postulationService.checkIfApplied(idPetition) : Promise.resolve(false),
          role === 'CUSTOMER' ? postulationService.getByPetition(idPetition) : Promise.resolve([]),
        ]);

        setPetition(petitionData);
        setAlreadyApplied(hasApplied);
        setPostulations(postulationsData);
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

  // Lógica de estados y validación de visibilidad
  const isAdjudicada = petition?.stateName === 'ADJUDICADA';
  const isFinalizada = petition?.stateName === 'FINALIZADA';
  const isCancelada = petition?.stateName === 'CANCELADA';
  
  // Verificamos si la fecha ya expiró para habilitar/deshabilitar la reactivación
  const isExpired = useMemo(() => {
    if (!petition?.dateUntil) return false;
    // Comparamos el inicio de hoy con la fecha límite
    return isAfter(startOfDay(new Date()), new Date(petition.dateUntil));
  }, [petition?.dateUntil]);

  const canComplete = role === 'CUSTOMER' && isAdjudicada;
  // EL BOTÓN SOLO APARECE SI: Es cliente, está cancelada y NO ha expirado
  const canReactivate = role === 'CUSTOMER' && isCancelada && !isExpired;

  const states = ['CREADA', 'POSTULACIONES', 'ADJUDICADA', 'FINALIZADA'];
  const currentIndex = petition ? states.indexOf(petition.stateName) : 0;

  const handleReactivate = async () => {
    if (!petition || isExpired) return;
    if (!window.confirm('¿Quieres volver a activar esta solicitud? Los proveedores volverán a verla en el feed.')) return;

    try {
      setIsReactivating(true);
      await petitionService.reactivate(petition.idPetition);
      setFeedback({ type: 'success', message: '¡Solicitud reactivada con éxito!' });
      await loadData(petition.idPetition);
    } catch (error) {
      setFeedback({ type: 'error', message: 'No se pudo reactivar la solicitud.' });
    } finally {
      setIsReactivating(false);
    }
  };

  const handleCompleteWork = async () => {
    if (!petition || !window.confirm('¿Confirmas que el trabajo ha sido realizado correctamente?')) return;
    try {
      setIsCompleting(true);
      await petitionService.complete(petition.idPetition);
      setFeedback({ type: 'success', message: '¡Trabajo finalizado con éxito!' });
      await loadData(petition.idPetition);
    } catch (error) {
      setFeedback({ type: 'error', message: 'No se pudo marcar como finalizado.' });
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDelete = async () => {
    if (!petition) return;
    if (!window.confirm('¿Seguro que quieres cancelar esta solicitud? Dejará de ser visible para proveedores.')) return;
    try {
      setIsDeleting(true);
      await petitionService.delete(petition.idPetition);
      setFeedback({ type: 'success', message: 'Solicitud cancelada correctamente.' });
      await loadData(petition.idPetition);
    } catch (error) {
      setFeedback({ type: 'error', message: 'No se pudo cancelar la solicitud.' });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return (
    <div className="app-shell">
      <Navbar />
      <main className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center px-4 py-8">
        <div className="panel flex items-center gap-3 px-6 py-4 text-slate-600 dark:text-slate-300">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          Cargando detalle de la solicitud...
        </div>
      </main>
    </div>
  );

  if (!petition) return null;

  return (
    <div className="app-shell">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <button onClick={() => navigate(returnPath)} className="mb-5 inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-brand-600">
          ← Volver
        </button>

        {/* Línea de Tiempo: Solo se muestra si NO está cancelada */}
        {!isCancelada && (
          <div className="mb-10 flex items-center justify-between px-2 max-w-3xl mx-auto">
            {states.map((step, idx) => (
              <div key={step} className="flex flex-col items-center flex-1 relative">
                {idx !== 0 && (
                  <div className={`absolute right-1/2 top-4 w-full h-1 -z-10 ${idx <= currentIndex ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
                )}
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                  idx <= currentIndex ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' : 'bg-slate-200 text-slate-500 dark:bg-slate-800'
                }`}>
                  {idx < currentIndex ? '✓' : idx + 1}
                </div>
                <span className={`text-[9px] mt-2 font-bold tracking-tight uppercase ${idx <= currentIndex ? 'text-brand-600' : 'text-slate-400'}`}>
                  {step === 'POSTULACIONES' ? 'Candidatos' : step}
                </span>
              </div>
            ))}
          </div>
        )}

        {feedback && (
          <div className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
            feedback.type === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'
          }`}>
            {feedback.message}
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-6 md:col-span-2">
            <article className={`panel p-6 md:p-8 ${isCancelada ? 'opacity-70 grayscale-[0.3]' : ''}`}>
              <div className="mb-4 flex items-start justify-between gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                  isCancelada ? 'bg-slate-200 text-slate-600' : petition.typePetitionName === 'Urgencia' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {isCancelada ? 'Estado: Cancelada' : petition.typePetitionName}
                </span>
                <span className="text-xs text-slate-500">
                  {formatDistanceToNow(new Date(petition.dateSince), { addSuffix: true, locale: es })}
                </span>
              </div>

              <h1 className="mb-3 text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">{petition.professionName}</h1>
              <p className="whitespace-pre-line text-base leading-relaxed text-slate-700 dark:text-slate-300">{petition.description}</p>

              <div className="mt-6 grid grid-cols-1 gap-3 border-t border-slate-100 pt-5 text-sm text-slate-600 dark:border-slate-800 sm:grid-cols-2">
                <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800">📍 {petition.cityName}</div>
                <div className={`rounded-lg px-3 py-2 ${isExpired ? 'bg-red-50 text-red-600 font-bold' : 'bg-slate-50 dark:bg-slate-800'}`}>
                   📅 {isExpired ? 'Expiró el: ' : 'Vence el: '} {format(new Date(petition.dateUntil), 'dd/MM/yyyy')}
                </div>
              </div>
            </article>

            {role === 'CUSTOMER' && !isCancelada && (
              <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Candidatos</h2>
                {postulations.length === 0 ? (
                  <div className="panel border-dashed p-8 text-center text-slate-500">Aún no hay postulaciones para esta búsqueda.</div>
                ) : (
                  <div className="grid gap-4">
                    {postulations.map((post) => (
                      <div key={post.idPostulation} className="panel p-4 flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          <p className="font-semibold text-slate-900 dark:text-white">{post.providerName}</p>
                        </div>
                        {post.isWinner && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">GANADOR</span>}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>

          <aside className="space-y-4">
            <section className="panel p-5">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Estado de la Solicitud</h3>
              <div className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full ${isCancelada ? 'bg-red-500' : isFinalizada ? 'bg-slate-400' : 'bg-green-500 animate-pulse'}`} />
                <span className={`text-sm font-bold uppercase ${isCancelada ? 'text-red-600' : 'text-slate-700 dark:text-slate-300'}`}>
                  {petition.stateName}
                </span>
              </div>
            </section>

            {/* ZONA DE BOTÓN REACTIVAR */}
            {canReactivate && (
              <button
                onClick={handleReactivate}
                disabled={isReactivating}
                className="w-full rounded-xl bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700 shadow-lg shadow-green-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {isReactivating ? 'Procesando...' : 'Reactivar Solicitud'}
              </button>
            )}

            {/* AVISO SI ESTÁ CANCELADA PERO EXPIRADA */}
            {isCancelada && isExpired && role === 'CUSTOMER' && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                ⚠️ <strong>Solicitud Expirada:</strong> La fecha de cierre ({format(new Date(petition.dateUntil), 'dd/MM/yyyy')}) ya pasó. No se puede reactivar tal como está.
              </div>
            )}

            {canComplete && (
              <button onClick={handleCompleteWork} disabled={isCompleting} className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700 transition-all">
                {isCompleting ? 'Finalizando...' : 'Marcar como Finalizado'}
              </button>
            )}

            {/* BOTÓN CANCELAR (Solo si está activa y no adjudicada/finalizada/cancelada) */}
            {role === 'CUSTOMER' && !isAdjudicada && !isFinalizada && !isCancelada && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full rounded-xl border-2 border-red-200 bg-white py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
              >
                {isDeleting ? 'Cancelando...' : 'Cancelar Solicitud'}
              </button>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
};
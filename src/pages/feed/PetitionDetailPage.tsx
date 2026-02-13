import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { petitionService } from '../../services/petition.service';
import { postulationService } from '../../services/postulation.service';
import type { PetitionResponse } from '../../types/petition.types';
import type { PostulationResponse } from '../../types/postulation.types';
import { format, formatDistanceToNow } from 'date-fns';
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

  const isAdjudicada = petition?.stateName === 'ADJUDICADA';

  const providerCountLabel = useMemo(() => {
    if (postulations.length === 0) return 'Sin candidatos';
    if (postulations.length === 1) return '1 candidato';
    return `${postulations.length} candidatos`;
  }, [postulations.length]);

  const handleApply = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!petition) return;

    if (!offer.description.trim() || Number(offer.budget) <= 0) {
      setFeedback({ type: 'error', message: 'Completa una propuesta valida con presupuesto mayor a 0.' });
      return;
    }

    try {
      setIsApplying(true);
      await postulationService.create({
        idPetition: petition.idPetition,
        description: offer.description.trim(),
        budget: Number(offer.budget),
      });

      setAlreadyApplied(true);
      setShowApplyForm(false);
      setFeedback({ type: 'success', message: 'Postulacion enviada correctamente.' });
    } catch (error) {
      const message = getErrorMessage(error, 'No se pudo enviar tu postulacion.');
      setFeedback({ type: 'error', message });
    } finally {
      setIsApplying(false);
    }
  };

  const handleAcceptProvider = async (idPostulation: number) => {
    if (!window.confirm('¿Confirmas que quieres aceptar esta postulacion?')) return;

    try {
      setIsAccepting(idPostulation);
      await postulationService.accept(idPostulation);
      setFeedback({ type: 'success', message: 'Postulacion aceptada. La solicitud fue adjudicada.' });

      if (id) {
        await loadData(Number(id));
      }
    } catch (error) {
      const message = getErrorMessage(error, 'No se pudo procesar la aceptacion.');
      setFeedback({ type: 'error', message });
    } finally {
      setIsAccepting(null);
    }
  };

  const handleDelete = async () => {
    if (!petition) return;
    if (!window.confirm('¿Seguro que quieres borrar esta solicitud?')) return;

    try {
      setIsDeleting(true);
      await petitionService.delete(petition.idPetition);
      navigate('/client-home');
    } catch (error) {
      const message = getErrorMessage(error, 'No se pudo eliminar la solicitud.');
      setFeedback({ type: 'error', message });
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
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
  }

  if (!petition) {
    return (
      <div className="app-shell">
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 py-8">
          <div className="panel p-8 text-center">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Solicitud no encontrada</h2>
            <button
              type="button"
              onClick={() => navigate(returnPath)}
              className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Volver
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <button
          onClick={() => navigate(returnPath)}
          className="mb-5 inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-brand-600"
        >
          ← Volver al {role === 'PROVIDER' ? 'feed' : 'panel'}
        </button>

        {feedback && (
          <div
            className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
              feedback.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-300'
                : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300'
            }`}
          >
            {feedback.message}
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-6 md:col-span-2">
            <article className="panel p-6 md:p-8">
              <div className="mb-4 flex items-start justify-between gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                    petition.typePetitionName === 'Urgencia' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {petition.typePetitionName}
                </span>
                <span className="text-xs text-slate-500">
                  {formatDistanceToNow(new Date(petition.dateSince), { addSuffix: true, locale: es })}
                </span>
              </div>

              <h1 className="mb-3 text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">{petition.professionName}</h1>
              <p className="whitespace-pre-line text-base leading-relaxed text-slate-700 dark:text-slate-300">{petition.description}</p>

              <div className="mt-6 grid grid-cols-1 gap-3 border-t border-slate-100 pt-5 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300 sm:grid-cols-2">
                <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800">📍 {petition.cityName}</div>
                <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800">📅 Vence: {format(new Date(petition.dateUntil), 'dd/MM/yyyy')}</div>
              </div>
            </article>

            {role === 'CUSTOMER' && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Candidatos</h2>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {providerCountLabel}
                  </span>
                </div>

                {postulations.length === 0 ? (
                  <div className="panel border-dashed p-8 text-center text-slate-500 dark:text-slate-400">Aun no hay postulaciones para esta solicitud.</div>
                ) : (
                  <div className="grid gap-4">
                    {postulations.map((postulation) => (
                      <article
                        key={postulation.idPostulation}
                        className={`rounded-xl border p-5 transition-all ${
                          postulation.isWinner
                            ? 'border-green-500 bg-green-50/40 ring-1 ring-green-500 dark:bg-green-900/10'
                            : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                        }`}
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 overflow-hidden rounded-full border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                              {postulation.providerImage ? (
                                <img src={postulation.providerImage} alt={postulation.providerName} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">👤</div>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">{postulation.providerName}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">{postulation.description}</p>
                            </div>
                          </div>

                          <div className="text-right">
                            {postulation.isWinner ? (
                              <span className="font-semibold text-green-700 dark:text-green-300">Ganador</span>
                            ) : (
                              !isAdjudicada && (
                                <button
                                  type="button"
                                  onClick={() => void handleAcceptProvider(postulation.idPostulation)}
                                  disabled={isAccepting !== null}
                                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
                                >
                                  {isAccepting === postulation.idPostulation ? 'Procesando...' : 'Aceptar'}
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>

          <aside className="space-y-4">
            <section className="panel p-5">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Estado</h3>
              <div className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full ${isAdjudicada ? 'bg-blue-500' : 'bg-green-500 animate-pulse'}`} />
                <span className={`text-sm font-bold ${isAdjudicada ? 'text-blue-600' : 'text-green-600'}`}>{petition.stateName}</span>
              </div>
            </section>

            {role === 'PROVIDER' && !isAdjudicada && (
              <section className="panel p-5">
                {alreadyApplied ? (
                  <div className="text-center">
                    <div className="mb-2 text-3xl">✅</div>
                    <p className="font-semibold text-slate-900 dark:text-white">Ya te postulaste</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Tu propuesta esta en revision.</p>
                  </div>
                ) : !showApplyForm ? (
                  <button
                    type="button"
                    onClick={() => setShowApplyForm(true)}
                    className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700"
                  >
                    Postularme
                  </button>
                ) : (
                  <form onSubmit={handleApply} className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tu propuesta</h3>
                    <input
                      type="number"
                      min={1}
                      value={offer.budget}
                      onChange={(event) => setOffer((prev) => ({ ...prev, budget: event.target.value }))}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      placeholder="Presupuesto"
                    />
                    <textarea
                      rows={4}
                      value={offer.description}
                      onChange={(event) => setOffer((prev) => ({ ...prev, description: event.target.value }))}
                      className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      placeholder="Resume por que eres buena opcion"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setShowApplyForm(false)}
                        className="rounded-lg bg-slate-100 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isApplying}
                        className="rounded-lg bg-brand-600 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
                      >
                        {isApplying ? 'Enviando...' : 'Enviar'}
                      </button>
                    </div>
                  </form>
                )}
              </section>
            )}

            {role === 'CUSTOMER' && !isAdjudicada && (
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={isDeleting}
                className="w-full rounded-xl border-2 border-red-200 bg-white py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-900/30 dark:bg-slate-900 dark:text-red-400"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar solicitud'}
              </button>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
};

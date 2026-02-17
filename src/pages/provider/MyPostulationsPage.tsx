import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { RateCustomerForm } from '../../components/reviews/RateCustomerForm';
import { getCustomerRatingStatus, type CustomerRatingStatus } from '../../services/grade.service';
import { postulationService } from '../../services/postulation.service';
import type { PostulationResponse } from '../../types/postulation.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const MyPostulationsPage = () => {
  const [postulations, setPostulations] = useState<PostulationResponse[]>([]);
  const [customerRatingStatusByPetition, setCustomerRatingStatusByPetition] = useState<Record<number, CustomerRatingStatus>>({});
  const [showRatingFormByPetition, setShowRatingFormByPetition] = useState<Record<number, boolean>>({});
  const [submittedReviewByPetition, setSubmittedReviewByPetition] = useState<Record<number, { rating: number; comment: string }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA'>('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    void loadPostulations();
  }, []);

  const loadPostulations = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await postulationService.getMyPostulations();
      const currentPostulations = data.content || [];
      setPostulations(currentPostulations); // .content por la paginación de Spring

      const winnerPetitionIds = [...new Set(currentPostulations.filter((p) => p.isWinner).map((p) => p.petitionId))];
      if (winnerPetitionIds.length === 0) {
        setCustomerRatingStatusByPetition({});
        return;
      }

      const statusResults = await Promise.allSettled(
        winnerPetitionIds.map((petitionId) => getCustomerRatingStatus(petitionId))
      );

      const nextStatusByPetition: Record<number, CustomerRatingStatus> = {};
      statusResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const status = result.value;
          if (status && (status.canRate || status.hasRated)) {
            nextStatusByPetition[winnerPetitionIds[index]] = status;
          }
        }
      });

      setCustomerRatingStatusByPetition(nextStatusByPetition);
    } catch (error) {
      console.error('Error cargando postulaciones:', error);
      setError('No pudimos cargar tus postulaciones. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (state: string) => {
    const styles: Record<string, string> = {
      'PENDIENTE': 'bg-amber-100 text-amber-700 border-amber-200',
      'ACEPTADA': 'bg-green-100 text-green-700 border-green-200',
      'RECHAZADA': 'bg-red-100 text-red-700 border-red-200',
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[state] || 'bg-slate-100'}`}>
        {state}
      </span>
    );
  };

  const filteredPostulations = postulations.filter((postulation) => {
    const matchesSearch =
      postulation.petitionTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      postulation.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesState = statusFilter === 'ALL' || postulation.stateName === statusFilter;

    return matchesSearch && matchesState;
  });

  const stats = {
    total: postulations.length,
    pending: postulations.filter((p) => p.stateName === 'PENDIENTE').length,
    accepted: postulations.filter((p) => p.stateName === 'ACEPTADA').length,
    rejected: postulations.filter((p) => p.stateName === 'RECHAZADA').length,
  };

  return (
    <div className="app-shell">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <section className="panel mb-6 p-6 md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Mis Postulaciones</h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Gestiona el estado de tus propuestas y hace seguimiento de tus oportunidades activas.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadPostulations()}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Actualizar
            </button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <article className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Total</p>
              <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{stats.total}</p>
            </article>
            <article className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-900/20">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">Pendientes</p>
              <p className="mt-2 text-2xl font-black text-amber-800 dark:text-amber-200">{stats.pending}</p>
            </article>
            <article className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900/40 dark:bg-green-900/20">
              <p className="text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-300">Aceptadas</p>
              <p className="mt-2 text-2xl font-black text-green-800 dark:text-green-200">{stats.accepted}</p>
            </article>
            <article className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/20">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-300">Rechazadas</p>
              <p className="mt-2 text-2xl font-black text-red-800 dark:text-red-200">{stats.rejected}</p>
            </article>
          </div>
        </section>

        {!loading && !error && postulations.length > 0 && (
          <section className="panel mb-6 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="w-full lg:max-w-md">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por trabajo o texto de propuesta"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {(['ALL', 'PENDIENTE', 'ACEPTADA', 'RECHAZADA'] as const).map((status) => {
                  const active = statusFilter === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                        active
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      {status === 'ALL' ? 'Todas' : status}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-36 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center text-red-700 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-300">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => void loadPostulations()}
              className="mt-3 text-sm font-semibold text-red-700 underline dark:text-red-300"
            >
              Reintentar
            </button>
          </div>
        ) : postulations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl dark:bg-slate-800">
              🧭
            </div>
            <p className="text-slate-500 dark:text-slate-400">Aun no te postulaste a ninguna busqueda.</p>
            <button onClick={() => navigate('/feed')} className="mt-4 text-sm font-bold text-brand-600 hover:underline">
              Ir al feed de trabajos
            </button>
          </div>
        ) : filteredPostulations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl dark:bg-slate-800">
              🔎
            </div>
            <p className="text-slate-500 dark:text-slate-400">No hay postulaciones que coincidan con tus filtros.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredPostulations.map((p) => {
              const ratingStatus = customerRatingStatusByPetition[p.petitionId];
              const showRatingForm = showRatingFormByPetition[p.petitionId] ?? false;
              const submittedReview = submittedReviewByPetition[p.petitionId];

              return (
                <div 
                  key={p.idPostulation} 
                  className={`panel p-6 transition-all hover:-translate-y-0.5 hover:shadow-md flex flex-col gap-4 md:flex-row md:items-center md:justify-between
                  ${p.isWinner ? 'border-green-400 ring-1 ring-green-400 dark:border-green-700 dark:ring-green-700' : ''}`}
                >
                  <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{p.petitionTitle}</h3>
                    {getStatusBadge(p.stateName)}
                    {p.isWinner && (
                      <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-bold text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300">
                        ADJUDICADA A TI
                      </span>
                    )}
                  </div>
                  <p className="mb-3 text-sm italic text-slate-600 line-clamp-2 dark:text-slate-400">
                    "{p.description}"
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="rounded-md bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
                      📅 {p.datePostulation ? format(new Date(p.datePostulation), "dd 'de' MMMM", { locale: es }) : 'Reciente'}
                    </span>
                    {p.budget !== undefined && (
                      <span className="rounded-md bg-slate-100 px-2.5 py-1 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        💰 ${p.budget}
                      </span>
                    )}
                  </div>
                  
                  {p.isWinner && ratingStatus && (ratingStatus.canRate || ratingStatus.hasRated) && (
                    <div className="mt-4">
                      <button
                        onClick={() => navigate(`/customer/${ratingStatus.customerId}`)}
                        className="mb-4 w-full rounded-xl border border-brand-300 bg-white py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 dark:border-brand-700/50 dark:bg-slate-800 dark:text-brand-300 dark:hover:bg-slate-700 md:w-auto md:px-5"
                      >
                        Ver perfil del cliente
                      </button>

                      {ratingStatus.canRate && !showRatingForm && (
                        <button
                          onClick={() =>
                            setShowRatingFormByPetition((prev) => ({ ...prev, [p.petitionId]: true }))
                          }
                          className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white shadow-lg transition hover:bg-blue-700 active:scale-95 md:w-auto md:px-5"
                        >
                          ⭐ Calificar al cliente
                        </button>
                      )}

                      {ratingStatus.canRate && showRatingForm && (
                        <div className="panel mt-4 border-2 border-brand-200 p-5">
                          <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Dejar reseña al cliente</h3>
                            <button
                              onClick={() =>
                                setShowRatingFormByPetition((prev) => ({ ...prev, [p.petitionId]: false }))
                              }
                              className="text-xs text-slate-500 hover:text-slate-700"
                            >
                              Cancelar
                            </button>
                          </div>
                          <RateCustomerForm
                            customerId={ratingStatus.customerId}
                            petitionId={p.petitionId}
                            onSuccess={(r, c) => {
                              setCustomerRatingStatusByPetition((prev) => ({
                                ...prev,
                                [p.petitionId]: { ...ratingStatus, canRate: false, hasRated: true },
                              }));
                              setSubmittedReviewByPetition((prev) => ({
                                ...prev,
                                [p.petitionId]: { rating: r, comment: c },
                              }));
                              setShowRatingFormByPetition((prev) => ({ ...prev, [p.petitionId]: false }));
                            }}
                          />
                        </div>
                      )}

                      {ratingStatus.hasRated && (
                        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-5 shadow-sm dark:border-green-900/50 dark:bg-green-900/20">
                          <div className="mb-2 flex items-start justify-between">
                            <h3 className="text-sm font-bold text-green-800 dark:text-green-300">
                              {submittedReview
                                ? `Tu calificación para ${ratingStatus.customerName}`
                                : `Ya calificaste a ${ratingStatus.customerName}`}
                            </h3>
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-900/50 dark:text-green-400">
                              ✓ Completado
                            </span>
                          </div>
                          {submittedReview ? (
                            <>
                              <div className="mb-2 flex text-lg text-yellow-400 drop-shadow-sm">
                                {'★'.repeat(submittedReview.rating)}
                                <span className="text-gray-300 dark:text-slate-600">
                                  {'★'.repeat(5 - submittedReview.rating)}
                                </span>
                              </div>
                              {submittedReview.comment ? (
                                <p className="text-sm italic text-green-700 dark:text-green-400">"{submittedReview.comment}"</p>
                              ) : (
                                <p className="text-xs italic text-green-600/70 dark:text-green-400/70">Sin comentario escrito.</p>
                              )}
                            </>
                          ) : (
                            <p className="mt-2 text-xs text-green-700">
                              Tu reseña ya se encuentra registrada en el perfil del cliente.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                  <div className="flex w-full flex-col gap-2 md:w-auto md:items-end">
                    <button 
                      onClick={() => navigate(`/petition/${p.petitionId}`)}
                      className="w-full rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 md:w-auto"
                    >
                      Ver Trabajo
                    </button>
                    {p.isWinner && (
                      <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-center text-xs font-semibold text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300">
                        El cliente iniciará la conversación.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

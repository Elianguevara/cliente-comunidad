import { useEffect, useMemo, useState } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { petitionService } from '../../services/petition.service';
import type { PetitionResponse } from '../../types/petition.types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';

export const FeedPage = () => {
  const [petitions, setPetitions] = useState<PetitionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');

  useEffect(() => {
    void loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const data = await petitionService.getFeed(0, 20);
      setPetitions(data.content);
      setError('');
    } catch (err) {
      console.error('Error cargando feed', err);
      setError('No pudimos cargar las ofertas disponibles. Intenta mas tarde.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPetitions = useMemo(() => {
    return petitions.filter((petition) => {
      const matchesSearch =
        petition.professionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        petition.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        petition.cityName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesUrgency = urgencyFilter === 'ALL' || petition.typePetitionName === urgencyFilter;

      return matchesSearch && matchesUrgency;
    });
  }, [petitions, searchTerm, urgencyFilter]);

  const urgencyOptions = useMemo(() => {
    const unique = Array.from(new Set(petitions.map((item) => item.typePetitionName)));
    return ['ALL', ...unique];
  }, [petitions]);

  const hasFilters = searchTerm.trim().length > 0 || urgencyFilter !== 'ALL';

  return (
    <div className="app-shell">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Oportunidades Disponibles</h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Encuentra trabajos segun tu especialidad y responde mas rapido con filtros.
              </p>
            </div>

            <div className="w-full max-w-xl space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por profesion, descripcion o ciudad"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {urgencyOptions.map((option) => {
                  const isActive = urgencyFilter === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setUrgencyFilter(option)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                        isActive
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      {option === 'ALL' ? 'Todas' : option}
                    </button>
                  );
                })}

                {hasFilters && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setUrgencyFilter('ALL');
                    }}
                    className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-red-700 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Mostrando <span className="font-semibold text-slate-900 dark:text-white">{filteredPetitions.length}</span> de {petitions.length} oportunidades.
            </p>
            <button
              type="button"
              onClick={() => void loadFeed()}
              className="text-sm font-semibold text-brand-600 transition hover:text-brand-700"
            >
              Actualizar
            </button>
          </div>
        )}

        {loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
        )}

        {!loading && !error && (
          <>
            {filteredPetitions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl dark:bg-slate-800">
                  🔎
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">No hay coincidencias con tus filtros</h3>
                <p className="mt-2 text-slate-500 dark:text-slate-400">Ajusta la busqueda o limpia filtros para ver mas resultados.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredPetitions.map((petition) => (
                  <article
                    key={petition.idPetition}
                    className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-700"
                  >
                    {/* --- NUEVO: SECCIÓN DE LA MINIATURA --- */}
                    {petition.imageUrl ? (
                      <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img 
                          src={petition.imageUrl} 
                          alt={`Problema de ${petition.professionName}`}
                          className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                        />
                        {/* Etiqueta flotante de urgencia sobre la imagen */}
                        <div className="absolute top-3 left-3">
                          <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-700 shadow-sm backdrop-blur-sm dark:bg-slate-900/90 dark:text-brand-300">
                            {petition.typePetitionName}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 pb-0">
                        {/* Si NO hay imagen, mostramos el encabezado viejo */}
                        <div className="mb-4 flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-xl dark:bg-slate-800">
                              🛠️
                            </div>
                            <div>
                              <span className="block text-xs font-bold uppercase tracking-wide text-brand-600">{petition.typePetitionName}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Contenido de la tarjeta */}
                    <div className={`flex-1 flex flex-col ${petition.imageUrl ? 'p-5' : 'px-6 pb-6'}`}>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h2 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-1">{petition.professionName}</h2>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {formatDistanceToNow(new Date(petition.dateSince), { addSuffix: true, locale: es })}
                          </span>
                        </div>
                        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400 line-clamp-3">{petition.description}</p>
                      </div>

                      <div className="mt-auto border-t border-slate-100 pt-4 dark:border-slate-800">
                        <div className="mb-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                          <span className="truncate font-medium">📍 {petition.cityName}</span>
                          <span className="truncate max-w-[40%] text-right">👤 {petition.customerName}</span>
                        </div>

                        <Link
                          to={`/petition/${petition.idPetition}`}
                          className="block w-full rounded-xl bg-slate-100 py-2.5 text-center text-sm font-semibold text-slate-900 transition-colors hover:bg-brand-600 hover:text-white dark:bg-slate-800 dark:text-white"
                        >
                          Ver detalles
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};
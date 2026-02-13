import { useEffect, useMemo, useState } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Link } from 'react-router-dom';
import { petitionService } from '../../services/petition.service';
import type { PetitionResponse } from '../../types/petition.types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export const ClientHomePage = () => {
  const [myPetitions, setMyPetitions] = useState<PetitionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadMyPetitions();
  }, []);

  const loadMyPetitions = async () => {
    try {
      setLoading(true);
      const data = await petitionService.getMyPetitions(0, 5);
      setMyPetitions(data.content);
    } catch (error) {
      console.error('Error cargando mis solicitudes', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = myPetitions.length;
    const open = myPetitions.filter((petition) => petition.stateName === 'PUBLICADA').length;
    const awarded = myPetitions.filter((petition) => petition.stateName === 'ADJUDICADA').length;

    return { total, open, awarded };
  }, [myPetitions]);

  return (
    <div className="app-shell">
      <Navbar />

      <main className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-2xl bg-brand-600 p-8 text-white shadow-lg sm:p-12">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-500/50 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-44 w-44 rounded-full bg-brand-700/50 blur-2xl" />

          <div className="relative z-10 max-w-2xl">
            <h1 className="mb-4 text-3xl font-bold sm:text-4xl">¿Que problema necesitas resolver hoy?</h1>
            <p className="mb-8 text-lg text-brand-100">
              Publica una necesidad y recibe propuestas de profesionales verificados en poco tiempo.
            </p>
            <Link
              to="/create-petition"
              className="inline-flex items-center rounded-lg bg-white px-6 py-3 font-bold text-brand-600 shadow transition-colors hover:bg-slate-100"
            >
              + Publicar nueva solicitud
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="panel p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">Solicitudes recientes</p>
            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="panel p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">Activas</p>
            <p className="mt-2 text-3xl font-bold text-green-600">{stats.open}</p>
          </div>
          <div className="panel p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">Adjudicadas</p>
            <p className="mt-2 text-3xl font-bold text-brand-600">{stats.awarded}</p>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title flex items-center gap-2">
              <span className="h-8 w-2 rounded-full bg-brand-500" />
              Tus solicitudes activas
            </h2>
          </div>

          {loading && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
              ))}
            </div>
          )}

          {!loading && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myPetitions.length === 0 && (
                <div className="panel col-span-full p-10 text-center">
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">Todavia no tienes solicitudes</p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Publica la primera para empezar a recibir postulaciones.</p>
                </div>
              )}

              {myPetitions.map((petition) => (
                <article
                  key={petition.idPetition}
                  className="flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div>
                    <div className="mb-3 flex items-start justify-between">
                      <span
                        className={`rounded px-2.5 py-0.5 text-xs font-semibold ${
                          petition.typePetitionName === 'Urgencia'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}
                      >
                        {petition.typePetitionName}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(petition.dateSince), { addSuffix: true, locale: es })}
                      </span>
                    </div>

                    <h3 className="mb-1 text-lg font-bold text-slate-900 dark:text-white">{petition.professionName}</h3>
                    <p className="mb-4 min-h-[40px] text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{petition.description}</p>

                    <div className="mb-4 flex items-center gap-2 text-xs text-slate-500">
                      <span>📍 {petition.cityName}</span>
                      <span>•</span>
                      <span className={petition.stateName === 'PUBLICADA' ? 'font-medium text-green-600' : ''}>{petition.stateName}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
                    <Link to={`/petition/${petition.idPetition}`} className="text-sm font-semibold text-brand-600 transition hover:text-brand-700">
                      Ver detalles →
                    </Link>
                  </div>
                </article>
              ))}

              <div className="group flex min-h-[220px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-6 text-center text-slate-500 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/40">
                <Link to="/create-petition" className="flex h-full w-full flex-col items-center justify-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 transition-transform group-hover:scale-110 dark:bg-slate-800">
                    <span className="text-2xl text-slate-400 transition-colors group-hover:text-brand-500">+</span>
                  </div>
                  <p className="mb-1 font-medium transition-colors group-hover:text-brand-600">Crear nueva solicitud</p>
                  <span className="text-sm font-bold text-brand-600">Continuar</span>
                </Link>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

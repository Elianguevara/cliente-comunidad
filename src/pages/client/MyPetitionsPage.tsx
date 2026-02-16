import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { petitionService } from '../../services/petition.service';
import type { PetitionResponse } from '../../types/petition.types';

export const MyPetitionsPage = () => {
  const [petitions, setPetitions] = useState<PetitionResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const pageSize = 10;

  const fetchMyPetitions = async (page: number) => {
    setIsLoading(true);
    try {
      const data = await petitionService.getMyPetitions(page, pageSize);
      setPetitions(data.content);
      setTotalPages(data.totalPages); // Asumiendo que tu Page type tiene totalPages
    } catch (error) {
      console.error('Error al cargar mis peticiones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchMyPetitions(currentPage);
  }, [currentPage]);

  // Función para dar color al badge de estado
  const getStateColor = (state: string) => {
    switch (state.toUpperCase()) {
      case 'PUBLICADA':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'ADJUDICADA':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'FINALIZADA':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'CANCELADA':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            aria-label="Volver atrás"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Mis Solicitudes
          </h1>
        </div>
        <Link
          to="/create-petition"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 shadow-sm"
        >
          + Nueva Solicitud
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Cargando tus solicitudes...</div>
        ) : petitions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-lg font-medium text-slate-900 dark:text-white">Aún no has creado ninguna solicitud.</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Publica tu primer trabajo para empezar a recibir presupuestos de profesionales.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-700">
            {petitions.map((petition) => (
              <li key={petition.idPetition} className="p-5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStateColor(petition.stateName)}`}>
                        {petition.stateName}
                      </span>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {petition.typePetitionName}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                      {petition.professionName} en {petition.cityName}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                      {petition.description}
                    </p>
                    
                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <span>Publicado: {new Date(petition.dateSince).toLocaleDateString()}</span>
                      {petition.dateUntil && (
                        <span>Vence: {new Date(petition.dateUntil).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex flex-shrink-0 sm:mt-0">
                    <Link
                      to={`/petition/${petition.idPetition}`}
                      className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-brand-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 dark:hover:text-white"
                    >
                      Ver Detalle
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Controles de Paginación */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium disabled:opacity-50 dark:border-slate-700 dark:text-white transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Anterior
          </button>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Página {currentPage + 1} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
            disabled={currentPage >= totalPages - 1}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium disabled:opacity-50 dark:border-slate-700 dark:text-white transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};
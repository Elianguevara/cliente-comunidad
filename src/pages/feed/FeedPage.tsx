import { useEffect, useState } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { petitionService } from '../../services/petition.service';
import type { PetitionResponse } from '../../types/petition.types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export const FeedPage = () => {
  const [petitions, setPetitions] = useState<PetitionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const data = await petitionService.getFeed();
      setPetitions(data.content);
    } catch (err) {
      setError('No pudimos cargar las publicaciones recientes.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Título de Sección */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Explorar Trabajos</h1>
          <p className="text-slate-500 dark:text-slate-400">Oportunidades recientes en tu comunidad</p>
        </div>

        {/* Estado de Carga */}
        {loading && (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800"></div>
            ))}
          </div>
        )}

        {/* Estado de Error */}
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg text-center border border-red-100">
            {error}
          </div>
        )}

        {/* Lista de Peticiones */}
        <div className="space-y-6">
          {!loading && petitions.map((petition) => (
            <article 
              key={petition.idPetition} 
              className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                
                {/* Header de la Tarjeta */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold">
                      {petition.customerName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {petition.customerName}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {/* Fecha relativa: "hace 2 horas" */}
                        {formatDistanceToNow(new Date(petition.dateSince), { addSuffix: true, locale: es })}
                      </p>
                    </div>
                  </div>
                  
                  {/* Badge de Categoría/Tipo */}
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {petition.typePetitionName}
                  </span>
                </div>

                {/* Contenido */}
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
                  Necesito un {petition.professionName}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4 line-clamp-3">
                  {petition.description}
                </p>

                {/* Footer de la Tarjeta (Ubicación y Acción) */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm">
                    {/* Icono Ubicación (SVG) */}
                    <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {petition.cityName}
                  </div>
                  
                  <button className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors">
                    Ver detalles →
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
};
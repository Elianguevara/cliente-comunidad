import { useEffect, useState } from 'react';
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

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      setLoading(true);
      // Pedimos la página 0 con 10 elementos (puedes aumentar el size)
      const data = await petitionService.getFeed(0, 20);
      setPetitions(data.content);
    } catch (err) {
      console.error("Error cargando feed", err);
      setError('No pudimos cargar las ofertas disponibles. Intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ENCABEZADO */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Oportunidades Disponibles
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Explora las solicitudes de clientes cercanas a ti.
          </p>
        </div>

        {/* ESTADO DE ERROR */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-center border border-red-100 dark:border-red-800">
            {error}
          </div>
        )}

        {/* ESTADO DE CARGA (Skeletons) */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        )}

        {/* LISTA DE TRABAJOS */}
        {!loading && !error && (
          <>
            {petitions.length === 0 ? (
              // Estado vacío
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">No hay ofertas por ahora</h3>
                <p className="text-slate-500 mt-2">Vuelve a intentar más tarde, ¡los clientes publican seguido!</p>
              </div>
            ) : (
              // Grid de tarjetas
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {petitions.map((petition) => (
                  <article 
                    key={petition.idPetition} 
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-brand-300 dark:hover:border-brand-700 transition-all flex flex-col h-full group"
                  >
                    {/* Header de la tarjeta */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar o Icono de la categoría */}
                        <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-slate-800 flex items-center justify-center text-xl">
                          🛠️
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-brand-600 uppercase tracking-wide">
                            {petition.typePetitionName}
                          </span>
                          <span className="text-xs text-slate-400">
                            {formatDistanceToNow(new Date(petition.dateSince), { addSuffix: true, locale: es })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-1 group-hover:text-brand-600 transition-colors">
                        {petition.professionName}
                      </h2>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-3">
                        {petition.description}
                      </p>
                    </div>

                    {/* Footer / Info extra */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                          <span>📍</span>
                          <span>{petition.cityName}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                          <span>👤</span>
                          <span className="truncate max-w-[100px]">{petition.customerName}</span>
                        </div>
                      </div>
                      
                      {/* Botón de Acción */}
                      <Link 
                        to={`/petition/${petition.idPetition}`}
                        className="mt-4 block w-full py-2.5 text-center bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium rounded-xl hover:bg-brand-600 hover:text-white transition-colors"
                      >
                        Ver detalles
                      </Link>
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
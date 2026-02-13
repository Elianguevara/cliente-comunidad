import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { postulationService } from '../../services/postulation.service';
import type { PostulationResponse } from '../../types/postulation.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const MyPostulationsPage = () => {
  const [postulations, setPostulations] = useState<PostulationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadPostulations();
  }, []);

  const loadPostulations = async () => {
    try {
      setLoading(true);
      const data = await postulationService.getMyPostulations();
      setPostulations(data.content || []); // .content por la paginación de Spring
    } catch (error) {
      console.error("Error cargando postulaciones:", error);
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Mis Postulaciones</h1>

        {loading ? (
          <div className="text-center py-10">Cargando tus ofertas...</div>
        ) : postulations.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-dashed border-slate-300 text-center">
            <p className="text-slate-500">Aún no te has postulado a ninguna búsqueda.</p>
            <button onClick={() => navigate('/feed')} className="mt-4 text-brand-600 font-bold hover:underline">Ir al Feed de trabajos</button>
          </div>
        ) : (
          <div className="grid gap-4">
            {postulations.map((p) => (
              <div 
                key={p.idPostulation} 
                className={`bg-white dark:bg-slate-900 p-6 rounded-xl border transition-all hover:shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4
                ${p.isWinner ? 'border-green-500 ring-1 ring-green-500' : 'border-slate-200 dark:border-slate-800'}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{p.petitionTitle}</h3>
                    {getStatusBadge(p.stateName)}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-3 line-clamp-2 italic">
                    Mi propuesta: "{p.description}"
                  </p>
                  <div className="flex gap-4 text-xs text-slate-500">
                    <span>📅 {p.datePostulation ? format(new Date(p.datePostulation), "dd 'de' MMMM", { locale: es }) : 'Reciente'}</span>
                    {p.budget && <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">💰 ${p.budget}</span>}
                  </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  <button 
                    onClick={() => navigate(`/petition/${p.petitionId}`)}
                    className="flex-1 md:flex-none px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-200"
                  >
                    Ver Trabajo
                  </button>
                  {p.isWinner && (
                    <button className="flex-1 md:flex-none px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700">
                      Contactar Cliente
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
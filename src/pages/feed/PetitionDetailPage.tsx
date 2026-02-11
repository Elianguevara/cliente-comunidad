import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { petitionService } from '../../services/petition.service';
import type { PetitionResponse } from '../../types/petition.types';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';

export const PetitionDetailPage = () => {
  const { id } = useParams(); // Obtenemos el ID de la URL
  const navigate = useNavigate();
  
  const [petition, setPetition] = useState<PetitionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) loadPetition(Number(id));
  }, [id]);

  const loadPetition = async (idPetition: number) => {
    try {
      setLoading(true);
      const data = await petitionService.getById(idPetition);
      setPetition(data);
    } catch (error) {
      console.error("Error", error);
      alert("No se pudo cargar la solicitud.");
      navigate('/client-home');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!petition) return;
    
    const confirm = window.confirm("¿Estás seguro de eliminar esta solicitud? Los profesionales ya no podrán verla.");
    if (confirm) {
      try {
        setIsDeleting(true);
        await petitionService.delete(petition.idPetition);
        alert("Solicitud eliminada correctamente.");
        navigate('/client-home');
      } catch (error) {
        alert("Error al eliminar.");
        setIsDeleting(false);
      }
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Cargando...</div>;
  if (!petition) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Botón Volver */}
        <button onClick={() => navigate(-1)} className="mb-6 text-sm text-slate-500 hover:text-brand-600 flex items-center gap-1">
          ← Volver
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          
          {/* Header de la Solicitud */}
          <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider 
                 ${petition.typePetitionName === 'Urgencia' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                {petition.typePetitionName}
              </span>
              <span className="text-sm text-slate-500">
                Publicado {formatDistanceToNow(new Date(petition.dateSince), { addSuffix: true, locale: es })}
              </span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {petition.professionName}
            </h1>
            <p className="text-slate-500 flex items-center gap-2">
              📍 {petition.cityName} 
              <span className="text-slate-300">|</span> 
              📅 Vence el {format(new Date(petition.dateUntil), 'dd/MM/yyyy')}
            </p>
          </div>

          {/* Contenido Principal */}
          <div className="p-6 md:p-8 grid md:grid-cols-3 gap-8">
            
            {/* Columna Izquierda: Descripción */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Detalle del problema</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {petition.description}
                </p>
              </div>

              {/* Aquí irían las fotos si tuvieras */}
            </div>

            {/* Columna Derecha: Acciones y Estado */}
            <div className="space-y-6">
              
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Estado</h3>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  <span className="text-green-700 dark:text-green-400 font-medium">{petition.stateName}</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Tu solicitud está visible para los profesionales de {petition.cityName}.
                </p>
              </div>

              {/* Botón Eliminar (Solo visible si no está ya cancelada/finalizada) */}
              {petition.stateName === 'PUBLICADA' && (
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full py-3 px-4 bg-white border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 hover:border-red-300 transition-all shadow-sm flex justify-center items-center gap-2"
                >
                  {isDeleting ? 'Eliminando...' : '🗑️ Eliminar Solicitud'}
                </button>
              )}
            </div>

          </div>
        </div>

      </main>
    </div>
  );
};
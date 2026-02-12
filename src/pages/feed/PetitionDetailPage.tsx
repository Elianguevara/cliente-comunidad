import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { petitionService } from '../../services/petition.service';
import { postulationService } from '../../services/postulation.service'; // Importamos el nuevo servicio
import type { PetitionResponse } from '../../types/petition.types';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';

export const PetitionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [petition, setPetition] = useState<PetitionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para acciones
  const [isDeleting, setIsDeleting] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false); // Mostrar/Ocultar formulario de postulación

  // Datos del formulario de postulación
  const [offer, setOffer] = useState({ description: '', budget: '' });

  // 1. Detectar Rol
  const role = localStorage.getItem('role'); // 'CUSTOMER' o 'PROVIDER'

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
      navigate(role === 'PROVIDER' ? '/feed' : '/client-home');
    } finally {
      setLoading(false);
    }
  };

  // --- ACCIÓN: ELIMINAR (Solo Clientes) ---
  const handleDelete = async () => {
    if (!petition) return;
    if (window.confirm("¿Seguro que quieres borrar esta solicitud?")) {
      try {
        setIsDeleting(true);
        await petitionService.delete(petition.idPetition);
        alert("Solicitud eliminada.");
        navigate('/client-home');
      } catch (error) {
        alert("Error al eliminar.");
        setIsDeleting(false);
      }
    }
  };

  // --- ACCIÓN: POSTULARSE (Solo Proveedores) ---
  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!petition) return;

    try {
      setIsApplying(true);
      await postulationService.create({
        idPetition: petition.idPetition,
        description: offer.description,
        budget: Number(offer.budget)
      });
      
      alert("¡Postulación enviada con éxito! El cliente recibirá tu oferta.");
      navigate('/feed');
      
    } catch (error) {
      console.error(error);
      alert("Error al enviar la postulación. Verifica los datos.");
    } finally {
      setIsApplying(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Cargando detalle...</div>;
  if (!petition) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Botón Volver (Inteligente) */}
        <button 
          onClick={() => navigate(role === 'PROVIDER' ? '/feed' : '/client-home')} 
          className="mb-6 text-sm text-slate-500 hover:text-brand-600 flex items-center gap-1"
        >
          ← Volver al {role === 'PROVIDER' ? 'Feed' : 'Panel'}
        </button>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* COLUMNA IZQUIERDA: DETALLE DE LA SOLICITUD (2/3) */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider 
                   ${petition.typePetitionName === 'Urgencia' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                  {petition.typePetitionName}
                </span>
                <span className="text-sm text-slate-500">
                  {formatDistanceToNow(new Date(petition.dateSince), { addSuffix: true, locale: es })}
                </span>
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                {petition.professionName}
              </h1>
              
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-2">Descripción del trabajo</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line text-lg">
                {petition.description}
              </p>

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <span>📍</span> {petition.cityName}
                </div>
                <div className="flex items-center gap-2">
                  <span>📅</span> Vence: {format(new Date(petition.dateUntil), 'dd/MM/yyyy')}
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: ACCIONES (1/3) */}
          <div className="space-y-6">
            
            {/* CARD DE ESTADO */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Estado Actual</h3>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-green-700 dark:text-green-400 font-bold uppercase text-sm">{petition.stateName}</span>
              </div>
              <p className="text-xs text-slate-500">
                ID Solicitud: #{petition.idPetition}
              </p>
            </div>

            {/* --- LÓGICA DE ROLES --- */}

            {/* CASO 1: CLIENTE (Dueño) */}
            {role === 'CUSTOMER' && (
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full py-4 bg-white dark:bg-slate-900 border-2 border-red-100 dark:border-red-900/30 text-red-600 rounded-xl font-bold hover:bg-red-50 dark:hover:bg-red-900/10 transition-all shadow-sm flex justify-center items-center gap-2"
              >
                {isDeleting ? 'Eliminando...' : '🗑️ Eliminar Solicitud'}
              </button>
            )}

            {/* CASO 2: PROVEEDOR */}
            {role === 'PROVIDER' && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-brand-100 dark:border-brand-900/30">
                {!showApplyForm ? (
                  <>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">¿Te interesa este trabajo?</h3>
                    <p className="text-sm text-slate-500 mb-4">Envía tu presupuesto para que el cliente te contacte.</p>
                    <button 
                      onClick={() => setShowApplyForm(true)}
                      className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-brand-200"
                    >
                      Me interesa 👋
                    </button>
                  </>
                ) : (
                  <form onSubmit={handleApply} className="space-y-4 animate-fade-in-up">
                    <h3 className="font-bold text-slate-900 dark:text-white">Nueva Propuesta</h3>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Tu Presupuesto ($)</label>
                      <input 
                        type="number" 
                        required
                        value={offer.budget}
                        onChange={e => setOffer({...offer, budget: e.target.value})}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder="Ej: 15000"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Mensaje / Detalle</label>
                      <textarea 
                        rows={3}
                        required
                        value={offer.description}
                        onChange={e => setOffer({...offer, description: e.target.value})}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                        placeholder="Hola, puedo hacerlo este sábado..."
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button 
                        type="button" 
                        onClick={() => setShowApplyForm(false)}
                        className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit" 
                        disabled={isApplying}
                        className="flex-1 py-2 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 disabled:opacity-50"
                      >
                        {isApplying ? 'Enviando...' : 'Enviar'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};
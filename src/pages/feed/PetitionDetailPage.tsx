import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { petitionService } from '../../services/petition.service';
import { postulationService } from '../../services/postulation.service';
import type { PetitionResponse } from '../../types/petition.types';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';

export const PetitionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [petition, setPetition] = useState<PetitionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false); 

  const [offer, setOffer] = useState({ description: '', budget: '' });
  const role = localStorage.getItem('role');

  useEffect(() => {
    if (id) {
      const idNum = Number(id);
      loadData(idNum);
    }
  }, [id]);

  const loadData = async (idPetition: number) => {
    try {
      setLoading(true);
      // Carga en paralelo la petición y el estado de postulación
      const [petitionData, hasApplied] = await Promise.all([
        petitionService.getById(idPetition),
        role === 'PROVIDER' ? postulationService.checkIfApplied(idPetition) : Promise.resolve(false)
      ]);

      setPetition(petitionData);
      setAlreadyApplied(hasApplied);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      alert("No se pudo cargar la información.");
      navigate(role === 'PROVIDER' ? '/feed' : '/client-home');
    } finally {
      setLoading(false);
    }
  };

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
      
      alert("¡Postulación enviada con éxito!");
      setAlreadyApplied(true); // Actualizamos estado local
      setShowApplyForm(false);
      navigate('/feed');
      
    } catch (error: any) {
      // CAPTURA DE ERROR DEL BACKEND
      const errorMessage = error.response?.data?.message || error.response?.data || "Error al procesar la solicitud.";
      
      if (error.response?.status === 400 || error.response?.status === 409) {
        // Aquí se mostrará: "Ya tienes una postulación activa para este trabajo."
        alert(`Atención: ${errorMessage}`);
        setAlreadyApplied(true); // Bloqueamos el formulario si el server confirma que ya existe
      } else {
        alert("Ocurrió un error inesperado. Inténtalo más tarde.");
      }
    } finally {
      setIsApplying(false);
    }
  };

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

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Cargando...</div>;
  if (!petition) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <button 
          onClick={() => navigate(role === 'PROVIDER' ? '/feed' : '/client-home')} 
          className="mb-6 text-sm text-slate-500 hover:text-brand-600 flex items-center gap-1"
        >
          ← Volver al {role === 'PROVIDER' ? 'Feed' : 'Panel'}
        </button>

        <div className="grid md:grid-cols-3 gap-8">
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
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">{petition.professionName}</h1>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line text-lg">{petition.description}</p>
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-4 text-sm text-slate-500">
                <div>📍 {petition.cityName}</div>
                <div>📅 Vence: {format(new Date(petition.dateUntil), 'dd/MM/yyyy')}</div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Estado Actual</h3>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-green-700 dark:text-green-400 font-bold uppercase text-sm">{petition.stateName}</span>
              </div>
            </div>

            {role === 'PROVIDER' && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-brand-100 dark:border-brand-900/30">
                {alreadyApplied ? (
                  <div className="text-center py-4">
                    <span className="text-4xl">✅</span>
                    <h3 className="font-bold text-slate-900 dark:text-white mt-2">Ya te has postulado</h3>
                    <p className="text-sm text-slate-500">El cliente ya tiene tu oferta en su panel.</p>
                  </div>
                ) : !showApplyForm ? (
                  <button 
                    onClick={() => setShowApplyForm(true)}
                    className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200"
                  >
                    Me interesa 👋
                  </button>
                ) : (
                  <form onSubmit={handleApply} className="space-y-4 animate-fade-in-up">
                    <h3 className="font-bold text-slate-900 dark:text-white">Nueva Propuesta</h3>
                    <input 
                      type="number" 
                      required
                      value={offer.budget}
                      onChange={e => setOffer({...offer, budget: e.target.value})}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="Tu presupuesto ($)"
                    />
                    <textarea 
                      rows={3}
                      required
                      value={offer.description}
                      onChange={e => setOffer({...offer, description: e.target.value})}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                      placeholder="Detalles de tu oferta..."
                    />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setShowApplyForm(false)} className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200">Cancelar</button>
                      <button type="submit" disabled={isApplying} className="flex-1 py-2 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 disabled:opacity-50">
                        {isApplying ? 'Enviando...' : 'Enviar'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {role === 'CUSTOMER' && (
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full py-4 bg-white dark:bg-slate-900 border-2 border-red-100 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-all shadow-sm flex justify-center items-center gap-2"
              >
                {isDeleting ? 'Eliminando...' : '🗑️ Eliminar Solicitud'}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { providerService } from '../../services/provider.service';
import { chatService } from '../../services/chat.service';
import { petitionService } from '../../services/petition.service';
// IMPORTAMOS EL COMPONENTE DE RESEÑAS
import { ProviderReviewsList } from '../../components/reviews/ProviderReviewsList';
import type { ProviderPublicProfile } from '../../types/provider.types';

export const ProviderPublicProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<ProviderPublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para el Modal de Contacto
  const [showContactModal, setShowContactModal] = useState(false);
  const [myPetitions, setMyPetitions] = useState<any[]>([]);
  const [loadingPetitions, setLoadingPetitions] = useState(false);
  const [selectedPetitionId, setSelectedPetitionId] = useState<number | ''>('');
  const [startingChat, setStartingChat] = useState(false);

  const loadProfile = useCallback(async (providerId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await providerService.getPublicProfile(providerId);
      setProfile(data);
    } catch (err) {
      console.error("Error cargando perfil del proveedor:", err);
      setError("No se pudo cargar la información del proveedor. Es posible que no exista.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      loadProfile(Number(id));
    }
  }, [id, loadProfile]);

  // Maneja el clic en "Contactar"
  const handleOpenContactModal = async () => {
    setShowContactModal(true);
    setLoadingPetitions(true);
    try {
      const response = await petitionService.getMyPetitions(0, 50);
      const petitionsList = response.content ? response.content : (Array.isArray(response) ? response : []);
      setMyPetitions(petitionsList);
    } catch (error) {
      console.error("Error al cargar peticiones del cliente", error);
    } finally {
      setLoadingPetitions(false);
    }
  };

  // Crea el chat y redirige
  const handleStartChat = async () => {
    if (!selectedPetitionId || !id) return;
    setStartingChat(true);
    try {
      const conv = await chatService.getOrCreateConversation(Number(selectedPetitionId), Number(id));
      navigate(`/chat/${conv.idConversation}`);
    } catch (error) {
      console.error("Error iniciando el chat", error);
      alert("Hubo un error al intentar crear la conversación.");
    } finally {
      setStartingChat(false);
    }
  };

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 py-12 text-center text-slate-500">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="h-24 w-24 bg-slate-200 rounded-full dark:bg-slate-700"></div>
            <div className="h-6 w-48 bg-slate-200 rounded dark:bg-slate-700"></div>
            <div className="h-4 w-32 bg-slate-200 rounded dark:bg-slate-700"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="app-shell">
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 py-12 text-center">
          <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200 dark:bg-red-900/20 dark:border-red-800">
            <h2 className="text-lg font-bold">Error</h2>
            <p>{error || "Proveedor no encontrado"}</p>
            <button 
              onClick={() => navigate(-1)} 
              className="mt-4 px-4 py-2 bg-white text-slate-700 rounded-lg shadow-sm border border-slate-300 hover:bg-slate-50"
            >
              Volver
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell bg-slate-50/50 dark:bg-slate-900 min-h-screen">
      <Navbar />
      
      {/* HEADER DEL PERFIL */}
      <div className="bg-brand-600 dark:bg-brand-900 h-32 md:h-48 w-full relative">
        <div className="absolute -bottom-16 left-0 right-0 flex justify-center">
          <div className="h-32 w-32 rounded-full border-4 border-white dark:border-slate-900 bg-white overflow-hidden shadow-lg flex items-center justify-center text-4xl font-bold text-brand-600">
            {profile.profileImage ? (
              <img src={profile.profileImage} alt={profile.name} className="h-full w-full object-cover" />
            ) : (
              profile.name.charAt(0).toUpperCase()
            )}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 pt-24 pb-12">
        
        {/* INFO PRINCIPAL */}
        <section className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            {profile.name} {profile.lastname}
          </h1>
          
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold dark:bg-yellow-900/30 dark:text-yellow-500">
              ⭐ {profile.rating > 0 ? profile.rating.toFixed(1) : 'Nuevo'}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              ({profile.totalReviews || 0} reseñas)
            </span>
          </div>
        </section>

        <div className="grid md:grid-cols-3 gap-6">
          
          {/* COLUMNA IZQUIERDA: Detalles */}
          <aside className="space-y-6">
            <div className="panel p-6 bg-white shadow-sm rounded-2xl dark:bg-slate-800 dark:border-slate-700">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Especialidades</h3>
              <div className="flex flex-wrap gap-2">
                {profile.professions?.map((prof, idx) => (
                  <span key={idx} className="bg-brand-50 text-brand-700 px-3 py-1 rounded-lg text-xs font-semibold dark:bg-brand-900/30 dark:text-brand-300">
                    {prof}
                  </span>
                ))}
                {(!profile.professions || profile.professions.length === 0) && (
                  <span className="text-sm text-slate-400">No especificadas</span>
                )}
              </div>

              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-6 mb-4">Zonas de trabajo</h3>
              <div className="flex flex-wrap gap-2">
                {profile.cities?.map((city, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-xs font-medium dark:bg-slate-700 dark:text-slate-300">
                    📍 {city}
                  </span>
                ))}
                 {(!profile.cities || profile.cities.length === 0) && (
                  <span className="text-sm text-slate-400">No especificadas</span>
                )}
              </div>
            </div>

            {/* BOTÓN CONTACTAR MODIFICADO */}
            <button 
              onClick={handleOpenContactModal}
              className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl shadow-md hover:bg-slate-800 transition-colors dark:bg-slate-700 dark:hover:bg-slate-600 flex items-center justify-center gap-2"
            >
              💬 Enviar Mensaje Directo
            </button>
          </aside>

          {/* COLUMNA DERECHA: Bio y Reseñas */}
          <div className="md:col-span-2 space-y-6">
            <div className="panel p-6 bg-white shadow-sm rounded-2xl dark:bg-slate-800 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Sobre mí</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {profile.biography || "Este proveedor aún no ha escrito una biografía."}
              </p>
            </div>

            {/* SECCIÓN RESEÑAS - AHORA MUESTRA EL COMPONENTE REAL */}
            <div className="panel p-6 bg-white shadow-sm rounded-2xl dark:bg-slate-800 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5">Últimas Reseñas</h3>
              {id ? (
                <ProviderReviewsList providerId={Number(id)} refreshTrigger={0} />              ) : (
                <p className="text-sm text-slate-500">No se pudieron cargar las reseñas.</p>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* MODAL PARA SELECCIONAR PETICIÓN */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Contactar Proveedor</h2>
              <button onClick={() => setShowContactModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">✕</button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                Para enviar un mensaje a <strong>{profile.name}</strong>, por favor selecciona sobre qué solicitud de trabajo quieres hablar:
              </p>

              {loadingPetitions ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                </div>
              ) : myPetitions.length === 0 ? (
                <div className="text-center p-4 bg-yellow-50 text-yellow-700 rounded-xl border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
                  <p className="text-sm font-medium">No tienes solicitudes activas.</p>
                  <p className="text-xs mt-1">Debes crear una Petición de Trabajo primero para poder contactar proveedores.</p>
                  <button onClick={() => navigate('/create-petition')} className="mt-3 text-brand-600 text-sm font-bold underline">
                    Crear mi primera solicitud
                  </button>
                </div>
              ) : (
                <select 
                  value={selectedPetitionId}
                  onChange={(e) => setSelectedPetitionId(Number(e.target.value))}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                >
                  <option value="" disabled>-- Selecciona una de tus peticiones --</option>
                  {myPetitions.map(pet => (
                    <option key={pet.idPetition} value={pet.idPetition}>
                      {pet.description.substring(0, 50)}...
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex gap-3">
              <button 
                onClick={() => setShowContactModal(false)} 
                className="flex-1 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
              >
                Cancelar
              </button>
              <button 
                onClick={handleStartChat}
                disabled={!selectedPetitionId || startingChat}
                className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 transition"
              >
                {startingChat ? 'Iniciando...' : 'Ir al Chat'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
// src/pages/provider/ProviderPublicProfilePage.tsx
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { providerService } from '../../services/provider.service';
import type { ProviderPublicProfile } from '../../types/provider.types';

export const ProviderPublicProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<ProviderPublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

            {/* BOTÓN CONTACTAR */}
            <button className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl shadow-md hover:bg-slate-800 transition-colors dark:bg-slate-700 dark:hover:bg-slate-600 flex items-center justify-center gap-2">
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

            {/* SECCIÓN RESEÑAS */}
            <div className="panel p-6 bg-white shadow-sm rounded-2xl dark:bg-slate-800 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Últimas Reseñas</h3>
              <div className="text-center p-6 text-sm text-slate-500 italic">
                La lista detallada de reseñas se cargará aquí.
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { CustomerReviewsList } from '../../components/reviews/CustomerReviewsList';
import { customerService } from '../../services/customer.service';
import type { CustomerPublicProfile } from '../../types/customer.types';

export const CustomerPublicProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<CustomerPublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async (customerId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await customerService.getPublicProfile(customerId);
      setProfile(data);
    } catch (err) {
      console.error('Error cargando perfil del cliente:', err);
      setError('No se pudo cargar la informacion del cliente. Es posible que no exista.');
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
            <p>{error || 'Cliente no encontrado'}</p>
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
          <aside className="space-y-6">
            <div className="panel p-6 bg-white shadow-sm rounded-2xl dark:bg-slate-800 dark:border-slate-700">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Resumen</h3>
              <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                <p>Solicitudes completadas: <strong>{profile.completedPetitions ?? 0}</strong></p>
                <p>Ciudad: <strong>{profile.city || 'No especificada'}</strong></p>
              </div>
            </div>
          </aside>

          <div className="md:col-span-2 space-y-6">
            <div className="panel p-6 bg-white shadow-sm rounded-2xl dark:bg-slate-800 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Sobre mi</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {profile.biography || 'Este cliente aun no escribio una descripcion.'}
              </p>
            </div>

            <div className="panel p-6 bg-white shadow-sm rounded-2xl dark:bg-slate-800 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5">Ultimas reseñas</h3>
              {id ? (
                <CustomerReviewsList customerId={Number(id)} refreshTrigger={0} />
              ) : (
                <p className="text-sm text-slate-500">No se pudieron cargar las reseñas.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

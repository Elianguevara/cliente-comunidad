import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { authService } from '../../services/auth.service';
import { userService } from '../../services/user.service';
import type { UserProfile } from '../../types/user.types';

export const ProfilePage = () => {
  const navigate = useNavigate();
  
  // ESTADOS: Ahora los datos viven aquí, no en el HTML
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Cargar datos al montar el componente
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const data = await userService.getProfile();
      setProfile(data);
    } catch (error) {
      console.error("Error cargando perfil", error);
    } finally {
      setLoading(false);
    }
  };

  // Generar avatar dinámico basado en el nombre real
  const avatarUrl = profile 
    ? `https://ui-avatars.com/api/?name=${profile.name}+${profile.lastname}&background=random&size=200&color=fff`
    : '';

  const handleDeleteAccount = async () => {
    if (window.confirm('¿Estás SEGURO? Esta acción no se puede deshacer. Perderás todo tu historial.')) {
      try {
        setIsDeleting(true);
        await userService.deleteAccount();
        alert('Tu cuenta ha sido eliminada.');
        authService.logout();
        navigate('/login');
      } catch (error) {
        alert('Error al eliminar cuenta. Intenta nuevamente.');
        setIsDeleting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          
          {/* Header Colorido */}
          <div className="h-32 bg-gradient-to-r from-brand-600 to-brand-400"></div>
          
          <div className="px-8 pb-8">
            <div className="relative flex justify-between items-end -mt-12 mb-6">
              <img 
                src={avatarUrl} 
                alt="Profile" 
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-slate-900 shadow-lg bg-white"
              />
              <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
                Editar Perfil
              </button>
            </div>

            {/* Datos Personales (Dinámicos) */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                {profile.name} {profile.lastname}
                <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                  profile.role === 'PROVIDER' 
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' 
                    : 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                }`}>
                  {profile.role === 'PROVIDER' ? 'Proveedor' : 'Cliente'}
                </span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400">{profile.email}</p>
            </div>

            {/* Estadísticas (Dinámicas desde el array 'stats') */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {profile.stats.map((stat, index) => (
                <div key={index} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center border border-slate-100 dark:border-slate-700">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            <hr className="border-slate-100 dark:border-slate-800 my-8" />

            {/* Información de Contacto */}
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Información de Contacto</h3>
                <div className="space-y-4">
                  <InfoRow icon="📧" label="Email" value={profile.email} />
                  {/* Solo mostramos teléfono/ubicación si existen en el perfil */}
                  {profile.phone && <InfoRow icon="📱" label="Teléfono" value={profile.phone} />}
                  {profile.location && <InfoRow icon="📍" label="Ubicación" value={profile.location} />}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Configuración</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-sm text-slate-700 dark:text-slate-300">Notificaciones</span>
                    <input type="checkbox" defaultChecked className="accent-brand-600 h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
            
            <hr className="border-slate-100 dark:border-slate-800 my-8" />

            {/* Zona de Peligro */}
            <div className="p-4 border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 rounded-xl flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="font-medium text-red-800 dark:text-red-300">Eliminar cuenta</p>
                <p className="text-sm text-red-600 dark:text-red-400">Esta acción borrará todos tus datos permanentemente.</p>
              </div>
              <button 
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar mi cuenta'}
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

// Componente auxiliar simple
const InfoRow = ({ icon, label, value }: { icon: string, label: string, value: string }) => (
  <div className="flex items-center gap-3 text-sm">
    <span className="text-xl w-6 text-center">{icon}</span>
    <div>
      <p className="text-slate-500 dark:text-slate-400 text-xs">{label}</p>
      <p className="font-medium text-slate-900 dark:text-white">{value}</p>
    </div>
  </div>
);
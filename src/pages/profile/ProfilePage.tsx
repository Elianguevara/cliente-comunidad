import { useState, useEffect } from 'react';
// CORRECCIÓN 1: Importar tipos de React por separado
import type { ChangeEvent, FormEvent } from 'react';

import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { authService } from '../../services/auth.service';

// CORRECCIÓN 2: Importar la interfaz UpdateProfileData como tipo explícito
import { userService } from '../../services/user.service';
import type { UpdateProfileData } from '../../services/user.service';

import type { UserProfile } from '../../types/user.types';

export const ProfilePage = () => {
  const navigate = useNavigate();
  
  // Estados
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Cargar datos al montar
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

  const handleUpdateProfile = async (formData: UpdateProfileData) => {
    try {
      const updatedProfile = await userService.updateProfile(formData);
      setProfile(updatedProfile);
      setIsEditing(false); // Cerrar modal
      alert('Perfil actualizado con éxito');
    } catch (error) {
      console.error("Error actualizando", error);
      alert('No se pudo actualizar el perfil.');
    }
  };

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

  // Avatar dinámico
  const avatarUrl = profile 
    ? profile.profileImage || `https://ui-avatars.com/api/?name=${profile.name}+${profile.lastname}&background=random&size=200&color=fff`
    : '';

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative">
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
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-slate-900 shadow-lg bg-white object-cover"
              />
              <button 
                onClick={() => setIsEditing(true)} 
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
              >
                Editar Perfil
              </button>
            </div>

            {/* Datos Personales */}
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
              
              {/* Mostrar Descripción si es proveedor */}
              {profile.role === 'PROVIDER' && profile.description && (
                <p className="mt-4 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  {profile.description}
                </p>
              )}
            </div>

            {/* Estadísticas */}
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
                  
                  {/* Campos dinámicos */}
                  {profile.phone && <InfoRow icon="📱" label="Teléfono" value={profile.phone} />}
                  {profile.address && <InfoRow icon="📍" label="Ubicación" value={profile.address} />}
                  {profile.profession && <InfoRow icon="💼" label="Profesión" value={profile.profession} />}
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

      {/* MODAL DE EDICIÓN */}
      {isEditing && (
        <EditProfileModal 
          user={profile} 
          onClose={() => setIsEditing(false)} 
          onSave={handleUpdateProfile} 
        />
      )}
    </div>
  );
};

// --- Componentes Auxiliares ---

const InfoRow = ({ icon, label, value }: { icon: string, label: string, value: string }) => (
  <div className="flex items-center gap-3 text-sm">
    <span className="text-xl w-6 text-center">{icon}</span>
    <div>
      <p className="text-slate-500 dark:text-slate-400 text-xs">{label}</p>
      <p className="font-medium text-slate-900 dark:text-white">{value}</p>
    </div>
  </div>
);

// Componente del Modal de Edición
interface EditModalProps {
  user: UserProfile;
  onClose: () => void;
  onSave: (data: UpdateProfileData) => Promise<void>;
}

const EditProfileModal = ({ user, onClose, onSave }: EditModalProps) => {
  const [formData, setFormData] = useState<UpdateProfileData>({
    name: user.name,
    lastname: user.lastname,
    phone: user.phone || '',
    description: user.description || ''
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(formData);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Editar Perfil</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre</label>
              <input 
                name="name" 
                value={formData.name} 
                onChange={handleChange}
                className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Apellido</label>
              <input 
                name="lastname" 
                value={formData.lastname} 
                onChange={handleChange}
                className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Campo solo para Clientes */}
          {user.role === 'CUSTOMER' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Teléfono</label>
              <input 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange}
                className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
              />
            </div>
          )}

          {/* Campo solo para Proveedores */}
          {user.role === 'PROVIDER' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción / Bio</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange}
                rows={4}
                className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none"
                placeholder="Cuenta algo sobre tus servicios..."
              />
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
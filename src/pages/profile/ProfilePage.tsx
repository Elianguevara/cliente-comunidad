import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';

import { authService } from '../../services/auth.service';
import { userService } from '../../services/user.service';
import type { UpdateProfileData } from '../../services/user.service';

import { metadataService } from '../../services/metadata.service';
import { providerService } from '../../services/provider.service';
import type { City, Profession } from '../../types/metadata.types';
import type { UserProfile } from '../../types/user.types';
import { ProviderReviewsList } from '../../components/reviews/ProviderReviewsList';

// --- NUEVO: Importamos el componente para subir imágenes ---
import { ImageUploader } from '../../components/media/ImageUploader';

export const ProfilePage = () => {
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [refreshReviews, setRefreshReviews] = useState(0);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const data = await userService.getProfile();
      setProfile(data);
    } catch (error) {
      console.error("Error cargando perfil", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    // Cuando el modal termine de guardar, recargamos el perfil
    await loadUserProfile();
    setIsEditing(false);
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('¿Estás SEGURO? Esta acción no se puede deshacer.')) {
      try {
        setIsDeleting(true);
        await userService.deleteAccount();
        alert('Tu cuenta ha sido eliminada.');
        authService.logout();
        navigate('/login');
      } catch {
        alert('Error al eliminar cuenta.');
        setIsDeleting(false);
      }
    }
  };

  const avatarUrl = profile?.profileImage 
    ? profile.profileImage 
    : profile 
      ? `https://ui-avatars.com/api/?name=${profile.name}+${profile.lastname}&background=random&size=200&color=fff`
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
              
              {profile.role === 'PROVIDER' && profile.description && (
                <p className="mt-4 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  {profile.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {profile.stats && profile.stats.length > 0 ? (
                profile.stats.map((stat, index) => (
                  <div key={index} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center border border-slate-100 dark:border-slate-700 transition-transform duration-200 hover:scale-105 cursor-default">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mt-1">{stat.label}</p>
                  </div>
                ))
              ) : (
                <div className="col-span-1 sm:col-span-3 text-center py-6 text-slate-400 text-sm bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                  No hay estadísticas disponibles para mostrar.
                </div>
              )}
            </div>

            <hr className="border-slate-100 dark:border-slate-800 my-8" />

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Información de Contacto</h3>
                <div className="space-y-4">
                  <InfoRow icon="📧" label="Email" value={profile.email} />
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
            
            {profile.role === 'PROVIDER' && profile.providerId && (
              <>
                <hr className="border-slate-100 dark:border-slate-800 my-8" />
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Lo que dicen tus clientes</h3>
                  <p className="text-sm text-slate-500 mb-6">Aquí puedes ver todas las calificaciones y opiniones que has recibido por tus trabajos finalizados.</p>
                  <ProviderReviewsList providerId={profile.providerId} refreshTrigger={refreshReviews} />
                </div>
              </>
            )}

            <hr className="border-slate-100 dark:border-slate-800 my-8" />

            <div className="p-4 border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 rounded-xl flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="font-medium text-red-800 dark:text-red-300">Eliminar cuenta</p>
                <p className="text-sm text-red-600 dark:text-red-400">Esta acción borrará todos tus datos permanentemente.</p>
              </div>
              <button onClick={handleDeleteAccount} disabled={isDeleting} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50">
                {isDeleting ? 'Eliminando...' : 'Eliminar mi cuenta'}
              </button>
            </div>
          </div>
        </div>
      </main>

      {isEditing && (
        <EditProfileModal user={profile} onClose={() => setIsEditing(false)} onSaveSuccess={handleUpdateProfile} />
      )}
    </div>
  );
};

const InfoRow = ({ icon, label, value }: { icon: string, label: string, value: string }) => (
  <div className="flex items-center gap-3 text-sm">
    <span className="text-xl w-6 text-center text-slate-400">{icon}</span>
    <div>
      <p className="text-slate-500 dark:text-slate-400 text-xs">{label}</p>
      <p className="font-medium text-slate-900 dark:text-white">{value}</p>
    </div>
  </div>
);

// --- MODAL DE EDICIÓN MEJORADO ---
interface EditModalProps {
  user: UserProfile;
  onClose: () => void;
  onSaveSuccess: () => Promise<void>;
}

const EditProfileModal = ({ user, onClose, onSaveSuccess }: EditModalProps) => {
  const [formData, setFormData] = useState<UpdateProfileData>({
    name: user.name,
    lastname: user.lastname,
    phone: user.phone || '',
    description: user.description || '',
    profileImage: user.profileImage || '',
  });

  const [idProfession, setIdProfession] = useState<number>(0);
  const [selectedCities, setSelectedCities] = useState<number[]>([]);
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user.role === 'PROVIDER') {
      const loadMetadata = async () => {
        try {
          const [profData, cityData] = await Promise.all([
            metadataService.getAllProfessions(),
            metadataService.getAllCities()
          ]);
          setProfessions(profData);
          setCities(cityData);
        } catch (error) {
          console.error("Error cargando metadatos", error);
        }
      };
      loadMetadata();
    }
  }, [user.role]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCityToggle = (cityId: number) => {
    setSelectedCities(prev => 
      prev.includes(cityId) ? prev.filter(id => id !== cityId) : [...prev, cityId]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await userService.updateProfile(formData);

      if (user.role === 'PROVIDER') {
        if (idProfession === 0) {
          alert("Debes seleccionar una profesión principal.");
          setSaving(false);
          return;
        }
        
        await providerService.updateProfile({
          idProfession: idProfession,
          description: formData.description || '', 
          cityIds: selectedCities
        });
      }

      alert('Perfil actualizado con éxito');
      await onSaveSuccess();
    } catch (error) {
      console.error("Error actualizando", error);
      alert('Hubo un error al actualizar el perfil.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all overflow-y-auto py-10">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 my-auto">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-10 rounded-t-2xl">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Editar Perfil</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          {/* --- AQUÍ REEMPLAZAMOS EL INPUT DE TEXTO POR EL IMAGE UPLOADER --- */}
          <div className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
            <label className="block text-xs font-bold text-brand-600 dark:text-brand-400 mb-3 uppercase tracking-wide">
              Cambiar Foto de Perfil
            </label>
            <div className="w-full">
              <ImageUploader 
                onUploadSuccess={(url: string) => {
                  setFormData(prev => ({ ...prev, profileImage: url }));
                }} 
              />
            </div>
            {formData.profileImage && formData.profileImage !== user.profileImage && (
              <p className="mt-3 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full">
                ✓ Nueva foto lista para guardar
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre</label>
              <input name="name" value={formData.name} onChange={handleChange} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-brand-500 outline-none" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Apellido</label>
              <input name="lastname" value={formData.lastname} onChange={handleChange} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-brand-500 outline-none" required />
            </div>
          </div>

          {user.role === 'CUSTOMER' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Teléfono</label>
              <input name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-brand-500 outline-none" placeholder="+54 9 ..." />
            </div>
          )}

          {user.role === 'PROVIDER' && (
            <>
              <hr className="border-slate-100 dark:border-slate-800" />
              
              <div>
                <label className="block text-xs font-bold text-brand-600 dark:text-brand-400 mb-1 uppercase tracking-wide">Profesión Principal</label>
                <select 
                  value={idProfession} 
                  onChange={(e) => setIdProfession(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer"
                  required
                >
                  <option value={0} disabled>Selecciona tu especialidad...</option>
                  {professions.map(prof => (
                    <option key={prof.idProfession} value={prof.idProfession}>{prof.name}</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 leading-tight">
                  💡 <strong className="font-semibold">Nota:</strong> Esta será tu etiqueta principal para atraer clientes, pero <span className="underline decoration-brand-300">podrás postularte a cualquier otro tipo de trabajo</span> si tienes los conocimientos necesarios.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-600 dark:text-brand-400 mb-2 uppercase tracking-wide">Zonas de Trabajo</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800">
                  {cities.map(city => (
                    <label key={city.idCity} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors">
                      <input 
                        type="checkbox" 
                        className="accent-brand-600"
                        checked={selectedCities.includes(city.idCity)}
                        onChange={() => handleCityToggle(city.idCity)}
                      />
                      <span className="truncate" title={city.name}>{city.name}</span>
                    </label>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Selecciona todas las ciudades donde ofreces servicio.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-600 dark:text-brand-400 mb-1 uppercase tracking-wide">Descripción / Biografía</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none"
                  placeholder="Ej: Soy gasista matriculado con 10 años de experiencia. También realizo trabajos generales de plomería y arreglos eléctricos menores..."
                  required
                />
              </div>
            </>
          )}

        </form>
        
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex gap-3 bg-slate-50 dark:bg-slate-900 rounded-b-2xl">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
            Cancelar
          </button>
          <button type="button" onClick={handleSubmit} disabled={saving} className="flex-1 px-4 py-2.5 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors shadow-sm disabled:opacity-50 flex justify-center items-center gap-2">
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};
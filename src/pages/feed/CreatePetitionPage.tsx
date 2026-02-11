import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { petitionService } from '../../services/petition.service';
import type { PetitionRequest } from '../../types/petition.types';

export const CreatePetitionPage = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PetitionRequest>();
  
  // Estados para cargar los selectores
  const [professions, setProfessions] = useState<{id: number, name: string}[]>([]);
  const [cities, setCities] = useState<{id: number, name: string}[]>([]);
  const [types, setTypes] = useState<{id: number, name: string}[]>([]);

  // ESTADO NUEVO: Feedback visual para el usuario
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [p, c, t] = await Promise.all([
          petitionService.getProfessions(),
          petitionService.getCities(),
          petitionService.getTypes()
        ]);
        setProfessions(p);
        setCities(c);
        setTypes(t);
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };
    loadData();
  }, []);

  const onSubmit = async (data: PetitionRequest) => {
    setStatus('idle'); // Limpiamos estados previos
    setErrorMessage('');

    try {
      const payload = {
        ...data,
        idProfession: Number(data.idProfession),
        idCity: Number(data.idCity),
        idTypePetition: Number(data.idTypePetition),
      };
      
      await petitionService.createPetition(payload);
      
      // 1. ÉXITO: Cambiamos estado para mostrar mensaje verde
      setStatus('success');
      
      // 2. Esperamos 2 segundos y redirigimos
      setTimeout(() => {
        navigate('/client-home');
      }, 2000);

    } catch (error: any) {
      console.error('Error al crear:', error);
      // 3. ERROR: Mostramos mensaje rojo
      setStatus('error');
      // Intentamos leer el mensaje del backend o ponemos uno genérico
      const msg = error.response?.data?.message || 'Hubo un problema al conectar con el servidor.';
      setErrorMessage(msg);
    }
  };

  // Si fue exitoso, mostramos una pantalla de confirmación limpia
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] px-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-lg text-center max-w-md border border-green-100 dark:border-green-900">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              ✓
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">¡Solicitud Publicada!</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Los profesionales verán tu solicitud enseguida. Te estamos redirigiendo a tu panel...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8">
          
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Publicar nueva solicitud</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Describe qué necesitas para que los profesionales te contacten.</p>
          </div>

          {/* MENSAJE DE ERROR (Solo visible si falla) */}
          {status === 'error' && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <span className="text-red-500 text-xl">⚠️</span>
              <div>
                <h3 className="text-sm font-bold text-red-800 dark:text-red-300">No se pudo publicar</h3>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                ¿Qué necesitas?
              </label>
              <textarea
                {...register("description", { 
                  required: "Describe tu problema",
                  minLength: { value: 10, message: "Sé más detallado (mínimo 10 letras)" }
                })}
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                placeholder="Ej: Necesito reparar una pérdida de agua en la cocina..."
              />
              {errors.description && <span className="text-red-500 text-xs">{errors.description.message}</span>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profesión */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Profesión requerida
                </label>
                <select
                  {...register("idProfession", { required: "Selecciona una profesión" })}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                >
                  <option value="">Seleccionar...</option>
                  {professions.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                {errors.idProfession && <span className="text-red-500 text-xs">{errors.idProfession.message}</span>}
              </div>

              {/* Ciudad */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Ubicación
                </label>
                <select
                  {...register("idCity", { required: "Selecciona una ciudad" })}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                >
                  <option value="">Seleccionar...</option>
                  {cities.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.idCity && <span className="text-red-500 text-xs">{errors.idCity.message}</span>}
              </div>

              {/* Campo Fecha */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Válida hasta
                </label>
                <input 
                  type="date"
                  {...register("dateUntil", { required: "Indica una fecha de vencimiento" })}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                  min={new Date().toISOString().split("T")[0]}
                />
                {errors.dateUntil && <span className="text-red-500 text-xs">{errors.dateUntil.message}</span>}
              </div>

               {/* Tipo */}
               <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Tipo de Urgencia
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {types.map((type) => (
                    <label key={type.id} className="cursor-pointer">
                      <input 
                        type="radio" 
                        value={type.id} 
                        {...register("idTypePetition", { required: "Elige un tipo" })}
                        className="peer sr-only"
                      />
                      <div className="text-center py-2 border rounded-lg peer-checked:bg-brand-50 peer-checked:border-brand-500 peer-checked:text-brand-700 dark:peer-checked:bg-brand-900/20 dark:peer-checked:text-brand-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                        <span className="text-sm font-medium">{type.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.idTypePetition && <span className="text-red-500 text-xs">Selecciona un tipo</span>}
              </div>
            </div>

            {/* Botones */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => navigate('/client-home')}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg shadow-sm focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>}
                {isSubmitting ? 'Enviando...' : 'Publicar Solicitud'}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
};
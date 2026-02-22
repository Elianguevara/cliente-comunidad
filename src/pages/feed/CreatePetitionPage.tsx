import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { petitionService } from '../../services/petition.service';
import { metadataService } from '../../services/metadata.service';
// Importamos el nuevo componente uploader
import { ImageUploader } from '../../components/media/ImageUploader'; 
import type { PetitionRequest } from '../../types/petition.types';
import type { City, Profession, TypePetition } from '../../types/metadata.types';

interface ApiErrorPayload {
  message?: string;
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'object' && error !== null) {
    const maybeError = error as { response?: { data?: ApiErrorPayload } };
    return maybeError.response?.data?.message ?? fallback;
  }
  return fallback;
};

export const CreatePetitionPage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PetitionRequest>();

  // Estados tipados con las interfaces reales del backend
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [types, setTypes] = useState<TypePetition[]>([]);
  
  // --- NUEVO ESTADO PARA LA IMAGEN ---
  const [imageUrl, setImageUrl] = useState<string>('');

  const [catalogLoading, setCatalogLoading] = useState(true);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const descriptionValue = watch('description') ?? '';
  // Calcula la fecha mínima (hoy) para el input date
  const minDate = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Carga inicial de datos maestros
  useEffect(() => {
    const loadData = async () => {
      try {
        setCatalogLoading(true);
        // Ejecutamos las 3 peticiones en paralelo
        const [professionsData, citiesData, typesData] = await Promise.all([
          metadataService.getAllProfessions(),
          metadataService.getAllCities(),
          metadataService.getAllTypes(),
        ]);
        
        setProfessions(professionsData);
        setCities(citiesData);
        setTypes(typesData);
      } catch (error) {
        console.error('Error cargando datos:', error);
        setStatus('error');
        setErrorMessage('Error cargando listas desplegables. Verifica tu conexión.');
      } finally {
        setCatalogLoading(false);
      }
    };

    void loadData();
  }, []);

  const onSubmit = async (data: PetitionRequest) => {
    setStatus('idle');
    setErrorMessage('');

    try {
      // Conversión explícita de tipos (los selects HTML devuelven strings)
      const payload: PetitionRequest = {
        description: data.description,
        dateUntil: data.dateUntil,
        idProfession: Number(data.idProfession),
        idCity: Number(data.idCity),
        idTypePetition: Number(data.idTypePetition),
        // --- INCLUIMOS LA IMAGEN EN EL PAYLOAD ---
        // Nota: Asegúrate de que PetitionRequest en frontend y backend admitan este campo
        ...(imageUrl && { imageUrl }), 
      };

      await petitionService.createPetition(payload);
      setStatus('success');

      // Redirección automática tras éxito
      setTimeout(() => {
        navigate('/client-home');
      }, 2000);
    } catch (error: unknown) {
      console.error('Error al crear:', error);
      setStatus('error');
      setErrorMessage(getErrorMessage(error, 'Hubo un problema al crear la solicitud.'));
    }
  };

  // --- VISTA DE ÉXITO ---
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900">
        <Navbar />
        <div className="flex h-[calc(100vh-64px)] items-center justify-center px-4">
          <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-xl ring-1 ring-slate-900/5 dark:bg-slate-800 dark:ring-white/10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700">
              ✓
            </div>
            <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
              Solicitud publicada
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Los profesionales de tu zona ya pueden ver tu solicitud.
              <br />
              <span className="text-sm">Redirigiendo a tu panel...</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- VISTA FORMULARIO ---
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5 dark:bg-slate-900 dark:ring-white/10 md:p-8">
          
          {/* Encabezado */}
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Publicar nueva solicitud
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Completa los datos para recibir propuestas de profesionales verificados.
              </p>
            </div>
            {/* Indicador de carga discreto para catálogos */}
            {catalogLoading && (
              <span className="text-xs text-blue-600 animate-pulse">Cargando opciones...</span>
            )}
          </div>

          {/* Banner de Error General */}
          {status === 'error' && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
              <span className="text-xl">⚠️</span>
              <div>
                <h3 className="text-sm font-bold text-red-800 dark:text-red-300">
                  No se pudo procesar
                </h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                  {errorMessage}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* 1. Descripción */}
            <section>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  1. ¿Qué necesitas resolver?
                </label>
                <span className={`text-xs ${descriptionValue.length > 280 ? 'text-orange-500' : 'text-slate-500'}`}>
                  {descriptionValue.length}/300
                </span>
              </div>
              <textarea
                {...register('description', {
                  required: 'La descripción es obligatoria',
                  minLength: { value: 10, message: 'Sé más específico (mínimo 10 letras)' },
                  maxLength: { value: 300, message: 'Máximo 300 caracteres' },
                })}
                rows={4}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-400"
                placeholder="Ej: Necesito reparar una pérdida de agua en la cocina. Es bajo la mesada..."
              />
              {errors.description && (
                <p className="mt-1 text-xs font-medium text-red-500 animate-fadeIn">
                  {errors.description.message}
                </p>
              )}
            </section>

            {/* 2. Detalles Técnicos */}
            <section>
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Detalles del servicio
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                
                {/* Selector Profesión */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Profesión requerida
                  </label>
                  <select
                    {...register('idProfession', { required: 'Selecciona una profesión' })}
                    disabled={catalogLoading}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="">Seleccionar...</option>
                    {professions.map((p) => (
                      <option key={p.idProfession} value={p.idProfession}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  {errors.idProfession && <p className="mt-1 text-xs text-red-500">{errors.idProfession.message}</p>}
                </div>

                {/* Selector Ciudad */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Ubicación del trabajo
                  </label>
                  <select
                    {...register('idCity', { required: 'Selecciona tu ciudad' })}
                    disabled={catalogLoading}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="">Seleccionar...</option>
                    {cities.map((c) => (
                      <option key={c.idCity} value={c.idCity}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.idCity && <p className="mt-1 text-xs text-red-500">{errors.idCity.message}</p>}
                </div>

                {/* Fecha Límite */}
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Válida hasta
                  </label>
                  <input
                    type="date"
                    min={minDate}
                    {...register('dateUntil', { required: 'Indica hasta cuándo es válida' })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  {errors.dateUntil && <p className="mt-1 text-xs text-red-500">{errors.dateUntil.message}</p>}
                </div>
              </div>
            </section>

            {/* 3. Categoria (Radio Cards) */}
            <section>
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Categoria del servicio
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {types.map((type) => (
                  <label key={type.idTypePetition} className="relative cursor-pointer group">
                    <input
                      type="radio"
                      value={type.idTypePetition}
                      {...register('idTypePetition', { required: 'Selecciona una categoria' })}
                      className="peer sr-only"
                    />
                    <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-4 text-center text-sm font-medium text-slate-600 transition-all 
                      hover:border-blue-300 hover:shadow-sm
                      peer-checked:border-blue-600 peer-checked:bg-blue-50 peer-checked:text-blue-700 peer-checked:ring-1 peer-checked:ring-blue-600
                      dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:peer-checked:bg-blue-900/30 dark:peer-checked:text-blue-300 dark:peer-checked:border-blue-500">
                      {type.typePetitionName}
                    </div>
                  </label>
                ))}
              </div>
              {errors.idTypePetition && (
                <p className="mt-2 text-xs font-medium text-red-500 text-center sm:text-left">
                  {errors.idTypePetition.message}
                </p>
              )}
            </section>

            {/* --- NUEVA SECCIÓN: 4. ADJUNTAR FOTO --- */}
            <section>
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Foto del problema (Opcional)
              </h2>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                  Una imagen ayuda a los profesionales a darte un presupuesto más preciso.
                </p>
                <ImageUploader 
                  onUploadSuccess={(url: string) => setImageUrl(url)}                />
                
                {/* Feedback visual si la imagen ya subió */}
                {imageUrl && (
                  <p className="mt-2 text-xs font-medium text-green-600 dark:text-green-400">
                    Imagen adjuntada correctamente a la petición.
                  </p>
                )}
              </div>
            </section>

            {/* Botones de Acción */}
            <div className="flex flex-col-reverse gap-3 pt-6 sm:flex-row sm:items-center sm:justify-end border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => navigate('/client-home')}
                className="rounded-xl px-6 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting || catalogLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-600/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:transform-none disabled:hover:bg-blue-600"
              >
                {isSubmitting && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                )}
                {isSubmitting ? 'Publicando...' : 'Publicar solicitud'}
              </button>
            </div>

          </form>
        </section>
      </main>
    </div>
  );
};

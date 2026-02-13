import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { petitionService } from '../../services/petition.service';
import type { PetitionRequest } from '../../types/petition.types';

interface SelectOption {
  id: number;
  name: string;
}

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

  const [professions, setProfessions] = useState<SelectOption[]>([]);
  const [cities, setCities] = useState<SelectOption[]>([]);
  const [types, setTypes] = useState<SelectOption[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);

  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const descriptionValue = watch('description') ?? '';
  const minDate = useMemo(() => new Date().toISOString().split('T')[0], []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setCatalogLoading(true);
        const [p, c, t] = await Promise.all([
          petitionService.getProfessions(),
          petitionService.getCities(),
          petitionService.getTypes(),
        ]);
        setProfessions(p);
        setCities(c);
        setTypes(t);
      } catch (error) {
        console.error('Error cargando datos:', error);
        setStatus('error');
        setErrorMessage('No se pudieron cargar las opciones del formulario. Recarga la pagina.');
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
      const payload: PetitionRequest = {
        ...data,
        idProfession: Number(data.idProfession),
        idCity: Number(data.idCity),
        idTypePetition: Number(data.idTypePetition),
      };

      await petitionService.createPetition(payload);
      setStatus('success');

      setTimeout(() => {
        navigate('/client-home');
      }, 1800);
    } catch (error: unknown) {
      console.error('Error al crear:', error);
      setStatus('error');
      setErrorMessage(getErrorMessage(error, 'Hubo un problema al conectar con el servidor.'));
    }
  };

  if (status === 'success') {
    return (
      <div className="app-shell">
        <Navbar />
        <div className="flex h-[calc(100vh-64px)] items-center justify-center px-4">
          <div className="panel max-w-md p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700">✓</div>
            <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">Solicitud publicada</h2>
            <p className="text-slate-600 dark:text-slate-400">Los profesionales ya pueden verla. Te redirigimos a tu panel...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <section className="panel p-6 md:p-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Publicar nueva solicitud</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Completa los datos para recibir propuestas relevantes.</p>
            </div>
            <div className="rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">Tiempo estimado: 2 minutos</div>
          </div>

          {status === 'error' && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
              <span className="text-xl text-red-500">⚠️</span>
              <div>
                <h3 className="text-sm font-bold text-red-800 dark:text-red-300">No se pudo publicar</h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-400">{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
            <section>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">1. ¿Que necesitas resolver?</label>
                <span className="text-xs text-slate-500 dark:text-slate-400">{descriptionValue.length}/300</span>
              </div>
              <textarea
                {...register('description', {
                  required: 'Describe tu necesidad',
                  minLength: { value: 10, message: 'Se mas especifico (minimo 10 caracteres)' },
                  maxLength: { value: 300, message: 'Maximo 300 caracteres' },
                })}
                rows={5}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-brand-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="Ej: Necesito reparar una perdida de agua en la cocina. Disponible por la tarde."
              />
              {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">2. Detalles del servicio</h2>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">Profesion requerida</label>
                  <select
                    {...register('idProfession', { required: 'Selecciona una profesion' })}
                    disabled={catalogLoading}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 outline-none transition focus:border-brand-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="">Seleccionar...</option>
                    {professions.map((profession) => (
                      <option key={profession.id} value={profession.id}>
                        {profession.name}
                      </option>
                    ))}
                  </select>
                  {errors.idProfession && <p className="mt-1 text-xs text-red-500">{errors.idProfession.message}</p>}
                </div>

                <div>
                  <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">Ubicacion</label>
                  <select
                    {...register('idCity', { required: 'Selecciona una ciudad' })}
                    disabled={catalogLoading}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 outline-none transition focus:border-brand-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="">Seleccionar...</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                  {errors.idCity && <p className="mt-1 text-xs text-red-500">{errors.idCity.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">Valida hasta</label>
                  <input
                    type="date"
                    min={minDate}
                    {...register('dateUntil', { required: 'Indica fecha de vencimiento' })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 outline-none transition focus:border-brand-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  {errors.dateUntil && <p className="mt-1 text-xs text-red-500">{errors.dateUntil.message}</p>}
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">3. Nivel de urgencia</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {types.map((type) => (
                  <label key={type.id} className="cursor-pointer">
                    <input
                      type="radio"
                      value={type.id}
                      {...register('idTypePetition', { required: 'Selecciona un tipo' })}
                      className="peer sr-only"
                    />
                    <div className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-medium text-slate-700 transition-all peer-checked:border-brand-500 peer-checked:bg-brand-50 peer-checked:text-brand-700 hover:border-brand-300 dark:border-slate-700 dark:text-slate-200 dark:peer-checked:bg-brand-900/20 dark:peer-checked:text-brand-300">
                      {type.name}
                    </div>
                  </label>
                ))}
              </div>
              {errors.idTypePetition && <p className="mt-1 text-xs text-red-500">{errors.idTypePetition.message}</p>}
            </section>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
              <button
                type="button"
                onClick={() => navigate('/client-home')}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting || catalogLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                {isSubmitting ? 'Publicando...' : 'Publicar solicitud'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

import { useForm, useWatch } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import type { RegisterRequest } from '../../types/auth.types';
import { useState } from 'react';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, setValue, control, formState: { errors, isSubmitting } } = useForm<RegisterRequest>({
    defaultValues: {
      role: 'CUSTOMER' // Valor por defecto
    }
  });

  // Observamos el rol para cambiar estilos visuales según la selección
  const selectedRole = useWatch({ control, name: 'role' });

  const onSubmit = async (data: RegisterRequest) => {
    try {
      setError(null);
      await authService.register(data);
      // Al registrarse con éxito, redirigimos al Login para que entre
      navigate('/login');
    } catch (err) {
      setError('Hubo un error al crear tu cuenta. Intenta con otro email.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-slate-950 transition-colors duration-300">
      
      {/* 1. SECCIÓN DE IMAGEN (Izquierda) - Cambiamos la foto por una de "Equipo/Unión" */}
      <div className="hidden md:block md:w-1/2 lg:w-3/5 relative bg-slate-900">
        <img 
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80" 
          alt="Equipo Comunidad" 
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900/90 to-brand-600/50 flex flex-col justify-center px-12 text-white">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">Únete a nuestra red.</h1>
          <p className="text-lg text-brand-100 max-w-lg">
            Crea tu cuenta hoy y empieza a conectar con profesionales y clientes en tu zona. Es gratis y rápido.
          </p>
        </div>
      </div>

      {/* 2. SECCIÓN DEL FORMULARIO (Derecha) */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-8 sm:p-12 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Crear una cuenta
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Completa tus datos para comenzar.
            </p>
          </div>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center border border-red-100 dark:border-red-800">
                {error}
              </div>
            )}

            {/* Selector de ROL (Tipo Cards) */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setValue('role', 'CUSTOMER')}
                className={`p-4 border rounded-xl text-center transition-all ${
                  selectedRole === 'CUSTOMER'
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 ring-1 ring-brand-500'
                    : 'border-slate-200 dark:border-slate-700 hover:border-brand-200'
                }`}
              >
                <div className="font-semibold text-slate-900 dark:text-white">Soy Cliente</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Busco profesionales</div>
              </button>

              <button
                type="button"
                onClick={() => setValue('role', 'PROVIDER')}
                className={`p-4 border rounded-xl text-center transition-all ${
                  selectedRole === 'PROVIDER'
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 ring-1 ring-brand-500'
                    : 'border-slate-200 dark:border-slate-700 hover:border-brand-200'
                }`}
              >
                <div className="font-semibold text-slate-900 dark:text-white">Soy Proveedor</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ofrezco mis servicios</div>
              </button>
            </div>

            {/* Nombre y Apellido (En una fila) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nombre</label>
                <input
                  type="text"
                  {...register("name", { required: "Requerido" })}
                  className="mt-1 block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                  placeholder="Juan"
                />
                {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Apellido</label>
                <input
                  type="text"
                  {...register("lastname", { required: "Requerido" })}
                  className="mt-1 block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                  placeholder="Pérez"
                />
                {errors.lastname && <span className="text-red-500 text-xs">{errors.lastname.message}</span>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
              <input
                type="email"
                {...register("email", { required: "El email es obligatorio" })}
                className="mt-1 block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="juan@ejemplo.com"
              />
              {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
            </div>

            {/* Contraseña */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Contraseña</label>
              <input
                type="password"
                {...register("password", { 
                  required: "La contraseña es obligatoria",
                  minLength: { value: 6, message: "Mínimo 6 caracteres" }
                })}
                className="mt-1 block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="••••••••"
              />
              {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
            </div>

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Creando cuenta...' : 'Registrarme'}
            </button>

            <div className="text-center mt-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                ¿Ya tienes una cuenta?{' '}
                <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400 transition-colors">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

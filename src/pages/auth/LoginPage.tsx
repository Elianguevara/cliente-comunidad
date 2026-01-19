import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import type { LoginRequest } from '../../types/auth.types';
import { useState } from 'react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginRequest>();

  const onSubmit = async (data: LoginRequest) => {
    try {
      setError(null);
      // Guardamos la respuesta para leer el rol
      const response = await authService.login(data);
      
      // --- LÓGICA DE REDIRECCIÓN POR ROL ---
      if (response.role === 'PROVIDER') {
        navigate('/feed');        // El proveedor va a buscar trabajo
      } else {
        navigate('/client-home'); // El cliente va a buscar profesionales
      }
      
    } catch (err) {
      setError('Credenciales inválidas. Verifica tus datos.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-slate-950 transition-colors duration-300">
      
      {/* SECCIÓN IMAGEN (Izquierda) */}
      <div className="hidden md:block md:w-1/2 lg:w-3/5 relative bg-slate-900">
        <img 
          src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2884&q=80" 
          alt="Fondo Comunidad" 
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900/90 to-brand-600/50 flex flex-col justify-center px-12 text-white">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">Construyendo comunidad juntos.</h1>
          <p className="text-lg text-brand-100 max-w-lg">
            Conecta con profesionales de confianza o encuentra nuevas oportunidades laborales cerca de ti.
          </p>
        </div>
      </div>

      {/* SECCIÓN FORMULARIO (Derecha) */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-8 sm:p-12 lg:p-24">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Bienvenido
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Ingresa tus datos para acceder a tu cuenta.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center border border-red-100 dark:border-red-800 animate-pulse">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email
                </label>
                <input
                  type="email"
                  {...register("email", { required: "El email es obligatorio" })}
                  className="mt-1 block w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none"
                  placeholder="ejemplo@correo.com"
                />
                {errors.email && <span className="text-red-500 text-xs mt-1">{errors.email.message}</span>}
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Contraseña
                  </label>
                  <a href="#" className="text-xs font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <input
                  type="password"
                  {...register("password", { required: "Ingresa tu contraseña" })}
                  className="mt-1 block w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none"
                  placeholder="••••••••"
                />
                {errors.password && <span className="text-red-500 text-xs mt-1">{errors.password.message}</span>}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Verificando...' : 'Iniciar Sesión'}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-slate-950 text-slate-500">O continúa con</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                ¿Aún no tienes cuenta?{' '}
                <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400 transition-colors">
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
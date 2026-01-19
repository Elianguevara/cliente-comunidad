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
      await authService.login(data);
      navigate('/feed');
    } catch (err) {
      setError('Credenciales inválidas. Por favor verifica tu email y contraseña.');
      console.error(err);
    }
  };

  return (
    // Quitamos bg-slate-50 de aquí porque ya está en el body (index.css)
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      {/* TARJETA: bg-white en claro, bg-slate-900 en oscuro */}
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 p-8 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 transition-colors">
        
        <div className="text-center">
          {/* TEXTOS: Automáticamente blancos en dark por la herencia del body, pero forzamos contraste si es necesario */}
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900 dark:text-white">
            Bienvenido de nuevo
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Ingresa a la comunidad de oficios más grande.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm text-center border border-red-100 dark:border-red-800">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                {...register("email", { required: "El email es obligatorio" })}
                // INPUTS: Fondo oscuro, borde sutil, texto claro
                className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-md focus:ring-brand-500 focus:border-brand-500 placeholder-slate-400 dark:placeholder-slate-500"
                placeholder="ejemplo@correo.com"
              />
              {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                {...register("password", { required: "La contraseña es obligatoria" })}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-md focus:ring-brand-500 focus:border-brand-500 placeholder-slate-400 dark:placeholder-slate-500"
                placeholder="••••••••"
              />
              {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700 dark:bg-brand-600 dark:hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all disabled:opacity-70"
            >
              {isSubmitting ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </div>

          <div className="text-sm text-center">
            <span className="text-slate-600 dark:text-slate-400">¿No tienes cuenta? </span>
            <Link to="/register" className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300">
              Regístrate gratis
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
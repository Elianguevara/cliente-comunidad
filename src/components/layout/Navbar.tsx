import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';

export const Navbar = () => {
  const navigate = useNavigate();
  
  // 1. Estado para controlar si el menú está abierto o cerrado
  const [isOpen, setIsOpen] = useState(false);

  // 2. Recuperar datos del usuario guardados en el Login
  // Usamos "||" para poner valores por defecto si por alguna razón no están
  const userName = localStorage.getItem('userName') || 'Usuario';
  const userEmail = localStorage.getItem('userEmail') || 'usuario@email.com';
  const userRole = localStorage.getItem('role');

  // 3. Generar avatar dinámico con las iniciales del nombre real
  // Ejemplo: Si te llamas "Elian Guevara", la imagen tendrá las iniciales "EG"
  const avatarUrl = `https://ui-avatars.com/api/?name=${userName}&background=random&color=fff`;

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* LOGO E ICONO */}
          <div className="flex items-center">
            {/* Redirección inteligente: Si es Proveedor al Feed, si es Cliente al Home */}
            <Link 
              to={userRole === 'PROVIDER' ? '/feed' : '/client-home'} 
              className="flex-shrink-0 flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                Comunidad
              </span>
            </Link>
          </div>

          {/* MENÚ DERECHA */}
          <div className="flex items-center gap-4">
            
            {/* Botón Publicar (Solo visible en PC/Tablet) */}
            <Link 
              to="/create-petition"
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 rounded-full text-sm font-medium hover:bg-brand-100 transition-colors"
            >
              <span>+ Publicar</span>
            </Link>

            {/* ÁREA DE USUARIO (Avatar + Dropdown) */}
            <div className="relative">
              <button 
                onClick={() => setIsOpen(!isOpen)} // Toggle del menú al hacer clic
                className="flex items-center gap-2 focus:outline-none transition-transform active:scale-95"
              >
                <img
                  className="h-9 w-9 rounded-full object-cover border-2 border-slate-100 dark:border-slate-700 hover:border-brand-500 transition-colors"
                  src={avatarUrl}
                  alt={userName}
                />
              </button>
              
              {/* DROPDOWN (Solo se renderiza si isOpen es true) */}
              {isOpen && (
                <>
                  {/* TELÓN DE FONDO (Invisible): Detecta clic afuera para cerrar */}
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsOpen(false)}
                  ></div>

                  {/* CAJA DEL MENÚ */}
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 border border-slate-100 dark:border-slate-700 z-20 animation-fade-in">
                    
                    {/* Encabezado con datos del usuario */}
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {userName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {userEmail}
                      </p>
                    </div>
                    
                    {/* Opciones del Menú */}
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                      onClick={() => setIsOpen(false)}
                    >
                      Mi Perfil
                    </Link>
                    
                    {/* Botón Logout */}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
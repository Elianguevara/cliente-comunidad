import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';

export const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const userName = localStorage.getItem('userName') || 'Usuario';
  const userEmail = localStorage.getItem('userEmail') || 'usuario@email.com';
  // Obtenemos el rol
  const userRole = localStorage.getItem('role'); 

  const avatarUrl = `https://ui-avatars.com/api/?name=${userName}&background=random&color=fff`;

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* LOGO */}
          <div className="flex items-center">
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
            
            {/* CORRECCIÓN: Mostrar botón SOLO si es CLIENTE */}
            {userRole === 'CUSTOMER' && (
              <Link 
                to="/create-petition"
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 rounded-full text-sm font-medium hover:bg-brand-100 transition-colors"
              >
                <span>+ Publicar</span>
              </Link>
            )}

            {/* ÁREA DE USUARIO */}
            <div className="relative">
              <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="flex items-center gap-2 focus:outline-none transition-transform active:scale-95"
              >
                <img
                  className="h-9 w-9 rounded-full object-cover border-2 border-slate-100 dark:border-slate-700 hover:border-brand-500 transition-colors"
                  src={avatarUrl}
                  alt={userName}
                />
              </button>
              
              {/* DROPDOWN */}
              {isOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 border border-slate-100 dark:border-slate-700 z-20">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{userName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userEmail}</p>
                      {/* Mostrar Rol (Opcional, ayuda a debuggear) */}
                      <p className="text-[10px] mt-1 text-brand-600 font-bold bg-brand-50 inline-block px-2 rounded">
                        {userRole === 'PROVIDER' ? 'PROVEEDOR' : 'CLIENTE'}
                      </p>
                    </div>
                    
                    <Link to="/profile" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700" onClick={() => setIsOpen(false)}>
                      Mi Perfil
                    </Link>
                    
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
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
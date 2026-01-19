import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';

export const Navbar = () => {
  const navigate = useNavigate();

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
            <Link to="/feed" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                Comunidad
              </span>
            </Link>
          </div>

          {/* MENU DERECHA */}
          <div className="flex items-center gap-4">
            {/* Botón Crear (Visible solo en PC por ahora) */}
            <Link 
              to="/create-petition"
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 rounded-full text-sm font-medium hover:bg-brand-100 transition-colors"
            >
              <span>+ Publicar</span>
            </Link>

            {/* Avatar / Menú Usuario */}
            <div className="relative group">
              <button className="flex items-center gap-2 focus:outline-none">
                <img
                  className="h-9 w-9 rounded-full object-cover border-2 border-slate-100 dark:border-slate-700"
                  src="https://ui-avatars.com/api/?name=Usuario&background=random"
                  alt="Perfil"
                />
              </button>
              
              {/* Dropdown simple (Hover) */}
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 border border-slate-100 dark:border-slate-700 hidden group-hover:block">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { chatService } from '../../services/chat.service';
import { userService } from '../../services/user.service';
import { NotificationBell } from './NotificationBell';

type Role = 'CUSTOMER' | 'PROVIDER' | null;

export const Navbar = () => {
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  
  // Estado para la foto de perfil (intentamos leer del caché primero)
  const [profileImage, setProfileImage] = useState<string | null>(localStorage.getItem('profileImage'));

  const userName = localStorage.getItem('userName') || 'Usuario';
  const userEmail = localStorage.getItem('userEmail') || 'usuario@email.com';
  const userRole = (localStorage.getItem('role') as Role) ?? null;

  // Buscamos la foto real al cargar la barra de navegación
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const user = await userService.getProfile();
        if (user.profileImage) {
          setProfileImage(user.profileImage);
          localStorage.setItem('profileImage', user.profileImage); // Actualizamos el caché
        }
      } catch (error) {
        console.error('Error cargando la foto en el Navbar', error);
      }
    };

    fetchProfileData();
  }, []);

  // Cargamos el total de mensajes no leidos para mostrarlo en el icono de mensajes
  useEffect(() => {
    const loadUnreadMessages = async () => {
      try {
        const conversations = await chatService.getMyConversations();
        const unreadTotal = conversations.reduce(
          (total, conversation) => total + (conversation.unreadCount || 0),
          0
        );
        setUnreadMessagesCount(unreadTotal);
      } catch (error) {
        console.error('Error cargando mensajes no leidos en el Navbar', error);
      }
    };

    void loadUnreadMessages();
    const interval = setInterval(() => {
      void loadUnreadMessages();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Lógica de la imagen: Si profileImage existe, usa esa url. Si no, usa las iniciales.
  const avatarUrl = profileImage 
    ? profileImage 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0f172a&color=fff`;

  // --- MODIFICADO: Agregamos "Mis Solicitudes" para el rol CUSTOMER ---
  const navLinks = useMemo(() => {
    if (userRole === 'PROVIDER') {
      return [
        { to: '/feed', label: 'Oportunidades' },
        { to: '/my-postulations', label: 'Mis Postulaciones' },
      ];
    }

    return [
      { to: '/client-home', label: 'Mi Panel' },
      { to: '/my-petitions', label: 'Mis Solicitudes' }, // <--- NUEVO ENLACE
      { to: '/create-petition', label: 'Publicar' },
    ];
  }, [userRole]);

  const closeMenus = () => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleLogout = () => {
    authService.logout();
    localStorage.removeItem('profileImage'); // Limpiamos la foto al salir
    closeMenus();
    navigate('/login');
  };

  const roleLabel = userRole === 'PROVIDER' ? 'Proveedor' : 'Cliente';
  const homePath = userRole === 'PROVIDER' ? '/feed' : '/client-home';
  const unreadMessagesLabel = unreadMessagesCount > 99 ? '99+' : unreadMessagesCount.toString();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link to={homePath} className="flex items-center gap-3" onClick={closeMenus}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
              <span className="text-lg font-bold">C</span>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Red</p>
              <p className="text-lg font-bold leading-none text-slate-900 dark:text-white">Comunidad</p>
            </div>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeMenus}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Botón de Mensajes */}
          <Link
            to="/chat/inbox"
            onClick={closeMenus}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            title="Mis Mensajes"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
            {unreadMessagesCount > 0 && (
              <span className="absolute right-0.5 top-0.5 rounded-full border-2 border-white bg-red-500 px-1.5 text-[10px] font-bold text-white dark:border-slate-900">
                {unreadMessagesLabel}
              </span>
            )}
          </Link>

          <NotificationBell />

          {userRole === 'CUSTOMER' && (
            <Link
              to="/create-petition"
              onClick={closeMenus}
              className="hidden rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 md:inline-flex"
            >
              Publicar
            </Link>
          )}

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 md:hidden dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Abrir menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span className="text-lg">{isMobileMenuOpen ? 'x' : '☰'}</span>
          </button>

          <div className="relative hidden md:block">
            <button
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-full p-1 transition hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-expanded={isUserMenuOpen}
              aria-haspopup="menu"
            >
              <img
                className="h-9 w-9 rounded-full border-2 border-slate-100 object-cover dark:border-slate-700"
                src={avatarUrl}
                alt={userName}
              />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{roleLabel}</span>
            </button>

            {isUserMenuOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-10 cursor-default"
                  onClick={() => setIsUserMenuOpen(false)}
                  aria-label="Cerrar menu"
                />
                <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
                  <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-700">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{userName}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{userEmail}</p>
                  </div>
                  <Link to="/profile" onClick={closeMenus} className="block px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700">
                    Mi Perfil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-left text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    Cerrar Sesion
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Menú Móvil */}
      {isMobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 space-y-1">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeMenus}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300'
                      : 'text-slate-700 dark:text-slate-300'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
            <div className="mb-3 flex items-center gap-3">
              <img className="h-9 w-9 rounded-full object-cover" src={avatarUrl} alt={userName} />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{userName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{roleLabel}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/profile" onClick={closeMenus} className="rounded-lg bg-slate-100 px-3 py-2 text-center text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                Perfil
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

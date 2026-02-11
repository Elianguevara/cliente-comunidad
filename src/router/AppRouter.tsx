import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ProfilePage } from '../pages/profile/ProfilePage';
import { FeedPage } from '../pages/feed/FeedPage';
import { CreatePetitionPage } from '../pages/feed/CreatePetitionPage';
import { ClientHomePage } from '../pages/client/ClientHomePage';
import { ProtectedRoute } from './ProtectedRoute';

// --- GUARDIA DE ROL: Solo Clientes ---
// Evita que los proveedores entren a crear solicitudes escribiendo la URL a mano.
const RequireCustomer = () => {
  const role = localStorage.getItem('role');
  // Si no es cliente, lo mandamos al Feed de trabajo (donde pertenecen los proveedores)
  if (role !== 'CUSTOMER') {
    return <Navigate to="/feed" replace />;
  }
  return <Outlet />;
};

// --- REDIRECCIÓN INTELIGENTE ---
// Decide a dónde enviar al usuario cuando entra a la raíz "/"
const RootRedirect = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // Si no está logueado -> Login
  if (!token) return <Navigate to="/login" replace />;
  
  // Si es Proveedor -> Feed de Trabajos
  if (role === 'PROVIDER') return <Navigate to="/feed" replace />;
  
  // Si es Cliente -> Home de Cliente
  return <Navigate to="/client-home" replace />;
};

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- Rutas Públicas --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* --- Rutas Privadas (Requieren Token) --- */}
        <Route element={<ProtectedRoute />}>
          
          {/* Rutas Comunes */}
          <Route path="/profile" element={<ProfilePage />} />
          
          {/* Ruta Específica para Proveedores */}
          <Route path="/feed" element={<FeedPage />} />
          
          {/* Ruta Específica para Clientes */}
          <Route path="/client-home" element={<ClientHomePage />} />
          
          {/* --- ZONA BLINDADA: Solo Clientes --- */}
          <Route element={<RequireCustomer />}>
             <Route path="/create-petition" element={<CreatePetitionPage />} />
          </Route>
          
        </Route>

        {/* --- Ruta Raíz Inteligente --- */}
        <Route path="/" element={<RootRedirect />} />

        {/* Ruta 404 (Cualquier otra cosa va al login o redirige) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
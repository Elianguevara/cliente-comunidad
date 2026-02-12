import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ProfilePage } from '../pages/profile/ProfilePage';
import { FeedPage } from '../pages/feed/FeedPage';
import { CreatePetitionPage } from '../pages/feed/CreatePetitionPage';
import { ClientHomePage } from '../pages/client/ClientHomePage';
import { PetitionDetailPage } from '../pages/feed/PetitionDetailPage';
import { ProtectedRoute } from './ProtectedRoute';

// --- GUARDIA DE ROL: Solo Clientes ---
// Evita que los proveedores entren a crear solicitudes.
const RequireCustomer = () => {
  const role = localStorage.getItem('role');
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

  if (!token) return <Navigate to="/login" replace />;
  if (role === 'PROVIDER') return <Navigate to="/feed" replace />;
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
          
          {/* 1. Rutas Comunes (Accesibles para TODOS) */}
          <Route path="/profile" element={<ProfilePage />} />
          {/* El detalle de la petición es público para los usuarios logueados */}
          <Route path="/petition/:id" element={<PetitionDetailPage />} />
          
          {/* 2. Ruta Específica para Proveedores */}
          <Route path="/feed" element={<FeedPage />} />
          
          {/* 3. Ruta Específica para Clientes */}
          <Route path="/client-home" element={<ClientHomePage />} />
          
          {/* 4. ZONA BLINDADA: Solo Clientes */}
          {/* Solo un cliente puede acceder al formulario de creación */}
          <Route element={<RequireCustomer />}>
             <Route path="/create-petition" element={<CreatePetitionPage />} />
          </Route>
          
        </Route>

        {/* --- Ruta Raíz Inteligente --- */}
        <Route path="/" element={<RootRedirect />} />

        {/* Ruta 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
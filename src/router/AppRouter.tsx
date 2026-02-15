import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Importaciones de Páginas
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ProfilePage } from '../pages/profile/ProfilePage';
import { FeedPage } from '../pages/feed/FeedPage';
import { CreatePetitionPage } from '../pages/feed/CreatePetitionPage';
import { ClientHomePage } from '../pages/client/ClientHomePage';
import { PetitionDetailPage } from '../pages/feed/PetitionDetailPage';
import { MyPostulationsPage, ProviderPublicProfilePage } from '../pages/provider';

// --- NUEVAS IMPORTACIONES DEL CHAT ---
import { ChatRoomPage } from '../pages/chat/ChatRoomPage';
 import { ChatInboxPage } from '../pages/chat/ChatInboxPage'; // Descoméntalo cuando crees la bandeja de entrada

// Importación de Guardias
import { ProtectedRoute } from './ProtectedRoute';

// --- GUARDIA DE ROL: Solo Clientes ---
const RequireCustomer = () => {
  const role = localStorage.getItem('role');
  if (role !== 'CUSTOMER') {
    return <Navigate to="/feed" replace />;
  }
  return <Outlet />;
};

// --- GUARDIA DE ROL: Solo Proveedores ---
const RequireProvider = () => {
  const role = localStorage.getItem('role');
  if (role !== 'PROVIDER') {
    return <Navigate to="/client-home" replace />;
  }
  return <Outlet />;
};

// --- REDIRECCIÓN INTELIGENTE ---
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
          
          {/* 1. Rutas Comunes (Accesibles por Clientes y Proveedores) */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/petition/:id" element={<PetitionDetailPage />} />
          <Route path="/provider/:id" element={<ProviderPublicProfilePage />} />
          
          {/* ---> NUEVAS RUTAS DE CHAT <--- */}
          { <Route path="/chat/inbox" element={<ChatInboxPage />} /> }
          <Route path="/chat/new" element={<ChatRoomPage />} />
          <Route path="/chat/:id" element={<ChatRoomPage />} />
          
          {/* 2. Zona de Proveedores */}
          <Route element={<RequireProvider />}>
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/my-postulations" element={<MyPostulationsPage />} />
          </Route>
          
          {/* 3. Zona de Clientes */}
          <Route element={<RequireCustomer />}>
            <Route path="/client-home" element={<ClientHomePage />} />
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
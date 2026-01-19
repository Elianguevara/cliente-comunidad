import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { FeedPage } from '../pages/feed/FeedPage';
import { CreatePetitionPage } from '../pages/feed/CreatePetitionPage';
import { ClientHomePage } from '../pages/client/ClientHomePage'; // <--- Importamos la nueva página de Cliente
import { ProtectedRoute } from './ProtectedRoute';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- Rutas Públicas --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* --- Rutas Privadas (Protegidas) --- */}
        <Route element={<ProtectedRoute />}>
          
          {/* Ruta para Proveedores (Ver trabajos) */}
          <Route path="/feed" element={<FeedPage />} />
          
          {/* Ruta para Clientes (Ver profesionales y resumen) */}
          <Route path="/client-home" element={<ClientHomePage />} />
          
          {/* Ruta común para crear solicitudes */}
          <Route path="/create-petition" element={<CreatePetitionPage />} />
          
        </Route>

        {/* --- Redirecciones por defecto --- */}
        {/* Aquí podríamos mejorar la lógica: 
            Si entran a la raíz '/', redirigir según el rol guardado en localStorage.
            Por ahora, redirigimos al login si no saben a dónde ir.
        */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Ruta 404 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
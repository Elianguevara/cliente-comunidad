import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { FeedPage } from '../pages/feed/FeedPage';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- Rutas Públicas --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* --- Rutas Privadas (Protegidas) --- */}
        {/* Todo lo que esté dentro de este Route requiere Token */}
        <Route element={<ProtectedRoute />}>
          <Route path="/feed" element={<FeedPage />} />
          
          {/* Aquí agregaremos más rutas luego: /chat, /profile, etc. */}
        </Route>

        {/* --- Redirecciones por defecto --- */}
        {/* Si entran a la raíz '/', redirigir al feed (el guardián lo mandará a login si no hay auth) */}
        <Route path="/" element={<Navigate to="/feed" replace />} />

        {/* Ruta 404: Si escriben cualquier otra cosa, redirigir al login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
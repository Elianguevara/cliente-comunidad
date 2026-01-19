import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute = () => {
  // Verificamos si existe el token en el localStorage
  // (Más adelante esto se conectará con el AuthContext para mayor seguridad)
  const token = localStorage.getItem('token');

  if (!token) {
    // Si no hay token, redirigir al login
    return <Navigate to="/login" replace />;
  }

  // Si hay token, renderiza la ruta hija (Outlet)
  return <Outlet />;
};
import client from '../api/axiosClient';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth.types';
export const authService = {
  // Petición de Login
  login: async (data: LoginRequest) => {
    // Axios infiere que la respuesta será de tipo <AuthResponse>
    const response = await client.post<AuthResponse>('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      // Guardamos el rol para usarlo en el Router o componentes
      localStorage.setItem('role', response.data.role);
    }
    return response.data;
  },

  // Petición de Registro
  register: async (data: RegisterRequest) => {
    const response = await client.post<AuthResponse>('/auth/register', data);
    // El registro también devuelve token y rol 
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
    }
    return response.data;
  },

  // Utilidad para cerrar sesión
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role'); // Limpiamos todo el almacenamiento local
    // Aquí podríamos redirigir al login más adelante
    window.location.href = '/login';
  }
};
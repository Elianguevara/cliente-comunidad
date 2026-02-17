import client from '../api/axiosClient';
import { disconnectRealtimeSockets } from './socket.service';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth.types';

export const authService = {
  
  // 1. Login
  login: async (data: LoginRequest) => {
    const response = await client.post<AuthResponse>('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('userName', response.data.name); 
      localStorage.setItem('userEmail', response.data.email);
    }
    return response.data;
  },

  // 2. Registro
  register: async (data: RegisterRequest) => {
    const response = await client.post<AuthResponse>('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('userName', response.data.name);
      localStorage.setItem('userEmail', response.data.email);
    }
    return response.data;
  },

  // 3. Logout
  logout: () => {
    disconnectRealtimeSockets();
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    window.location.href = '/login';
  }
};

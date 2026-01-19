import client from '../api/axiosClient';
import type { UserProfile } from '../types/user.types';

export const userService = {
  // Obtener perfil completo
  getProfile: async (): Promise<UserProfile> => {
    // 1. Intentamos obtener datos frescos del backend
    // (Asumimos que existe un endpoint GET /users/me o /users/profile)
    try {
      const response = await client.get('/users/me'); 
      return response.data;
    } catch (error) {
      // FALLBACK TEMPORAL: Si el endpoint no existe aún, construimos el perfil
      // usando los datos que ya tenemos en localStorage para que no falle.
      console.warn("Usando perfil local (API no conectada)");
      
      const role = localStorage.getItem('role') as 'CUSTOMER' | 'PROVIDER' || 'CUSTOMER';
      const name = localStorage.getItem('userName') || 'Usuario';
      
      return {
        id: 0,
        name: name.split(' ')[0], // Primer nombre
        lastname: name.split(' ')[1] || '',
        email: localStorage.getItem('userEmail') || '',
        role: role,
        phone: '+54 9 261 000 0000', // Dato pendiente de backend
        location: 'Mendoza, Argentina', // Dato pendiente de backend
        stats: role === 'PROVIDER' 
          ? [
              { label: 'Calificación', value: '5.0 ★' },
              { label: 'Trabajos', value: 0 },
              { label: 'Nivel', value: 'Inicial' }
            ]
          : [
              { label: 'Peticiones', value: 0 },
              { label: 'Reseñas', value: 0 },
              { label: 'Actividad', value: 'Baja' }
            ]
      };
    }
  },

  // Eliminar cuenta (Lo que hablamos antes)
  deleteAccount: async () => {
    return client.delete('/users/me');
  }
};
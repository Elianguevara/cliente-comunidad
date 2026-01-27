import client from '../api/axiosClient';
import type { UserProfile } from '../types/user.types';

// Definimos la interfaz de los datos que se pueden enviar para actualizar
// (Debe coincidir con los campos de UserProfileRequest en Java)
export interface UpdateProfileData {
  name?: string;
  lastname?: string;
  phone?: string;       // Solo para CLIENTES
  description?: string; // Solo para PROVEEDORES
  idProfession?: number;// Solo para PROVEEDORES
  profileImage?: string; 
}

export const userService = {
  // 1. Obtener perfil completo (GET /users/me)
  // Ahora confiamos plenamente en que el backend devolverá el DTO correcto.
  getProfile: async (): Promise<UserProfile> => {
    const response = await client.get<UserProfile>('/users/me'); 
    return response.data;
  },

  // 2. Actualizar perfil (PUT /users/me)
  // Enviamos el objeto con los cambios y recibimos el perfil actualizado.
  updateProfile: async (data: UpdateProfileData): Promise<UserProfile> => {
    const response = await client.put<UserProfile>('/users/me', data);
    return response.data;
  },

  // 3. Eliminar cuenta (DELETE /users/me)
  deleteAccount: async () => {
    return client.delete('/users/me');
  }
};
// src/services/provider.service.ts
import client from '../api/axiosClient';
import type { ProviderPublicProfile } from '../types/provider.types';

// NUEVO: Interfaz para tipar los datos que enviamos al actualizar el perfil
export interface UpdateProviderProfileData {
  idProfession: number;
  description: string;
  cityIds: number[];
}

export const providerService = {
  // 1. Obtener perfil público (GET /api/providers/{id})
  getPublicProfile: async (idProvider: number): Promise<ProviderPublicProfile> => {
    const response = await client.get(`/providers/${idProvider}`);
    return response.data;
  },

  // 2. Obtener las reseñas de un proveedor
  getProviderReviews: async (idProvider: number, page = 0, size = 5) => {
    const response = await client.get(`/grades/provider/${idProvider}?page=${page}&size=${size}`);
    return response.data;
  },

  // 3. NUEVO: Actualizar el perfil profesional del proveedor (PUT /api/providers/profile)
  updateProfile: async (data: UpdateProviderProfileData): Promise<void> => {
    await client.put('/providers/profile', data);
  }
};
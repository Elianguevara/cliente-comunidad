import client from '../api/axiosClient';
import type { ProviderPublicProfile } from '../types/provider.types';

export const providerService = {
  // Obtener perfil público (Asumiendo que crearás este GET en el backend)
  getPublicProfile: async (idProvider: number): Promise<ProviderPublicProfile> => {
    const response = await client.get(`/providers/${idProvider}`);
    return response.data;
  },

  // Obtener las reseñas (Usando tu GradeService existente si lo tienes)
  getProviderReviews: async (idProvider: number, page = 0, size = 5) => {
    // Si tienes un endpoint para esto: GET /api/grades/provider/{id}
    const response = await client.get(`/grades/provider/${idProvider}?page=${page}&size=${size}`);
    return response.data;
  }
};
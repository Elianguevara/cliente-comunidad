// src/services/postulation.service.ts
import client from '../api/axiosClient';

export interface PostulationRequest {
  idPetition: number;
  description: string;
  budget: number;
}

export const postulationService = {
  create: async (data: PostulationRequest) => {
    const response = await client.post('/postulations', data);
    return response.data;
  },

  checkIfApplied: async (idPetition: number): Promise<boolean> => {
    try {
      const response = await client.get(`/postulations/check/${idPetition}`);
      return response.data; // Retorna true o false desde el backend
    } catch (error) {
      return false;
    }
  }
};
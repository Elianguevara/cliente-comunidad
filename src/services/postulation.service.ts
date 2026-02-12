import client from '../api/axiosClient';

export interface PostulationRequest {
  idPetition: number;
  description: string; // "Te cobro $50.000 y lo hago en 2 días"
  budget: number;      // 50000
}

export const postulationService = {
  // Enviar una nueva postulación
  create: async (data: PostulationRequest) => {
    const response = await client.post('/postulations', data);
    return response.data;
  },

  // (Opcional) Verificar si ya me postulé a esta petición
  checkIfApplied: async (idPetition: number) => {
    // Si tu backend tiene este endpoint, úsalo. Si no, retorna false por ahora.
     return client.get(`/postulations/check/${idPetition}`);
    return false; 
  }
};
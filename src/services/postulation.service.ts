import client from '../api/axiosClient';
import type { PostulationRequest, PostulationResponse } from '../types/postulation.types';
import type { Page } from '../types/common.types';

export const postulationService = {
  /**
   * Envía una nueva oferta de trabajo (Rol: PROVIDER).
   */
  create: async (data: PostulationRequest): Promise<PostulationResponse> => {
    const response = await client.post<PostulationResponse>('/postulations', data);
    return response.data;
  },

  /**
   * Verifica si el usuario actual ya envió una oferta a esta petición.
   */
  checkIfApplied: async (idPetition: number): Promise<boolean> => {
    try {
      // Retorna true/false directamente desde el backend
      const response = await client.get<boolean>(`/postulations/check/${idPetition}`);
      return response.data;
    } catch (error) {
      console.error("Error checking postulation status:", error);
      return false;
    }
  },

  /**
   * Recupera la lista de postulantes para una petición (Rol: CUSTOMER).
   */
  getByPetition: async (idPetition: number): Promise<PostulationResponse[]> => {
    const response = await client.get<PostulationResponse[]>(`/postulations/petition/${idPetition}`);
    return response.data;
  },

  /**
   * Acepta a un proveedor y marca la petición como ADJUDICADA.
   */
  accept: async (idPostulation: number): Promise<void> => {
    // El backend retorna un mensaje o vacío con status 200/204
    await client.put(`/postulations/${idPostulation}/accept`);
  },

  /**
   * Obtiene el historial de ofertas del proveedor autenticado.
   */
  getMyPostulations: async (page = 0, size = 10): Promise<Page<PostulationResponse>> => {
    const response = await client.get<Page<PostulationResponse>>(`/postulations/my`, {
      params: {
        page,
        size,
        sort: 'dateCreate,desc' // Sincronizado con la auditoría del backend
      }
    });
    return response.data;
  }
};

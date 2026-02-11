import client from '../api/axiosClient';
import type { Page } from '../types/common.types';
import type { PetitionResponse, PetitionRequest } from '../types/petition.types';

export const petitionService = {
  /**
   * Obtiene el Feed General (excluyendo mis propias peticiones).
   */
  getFeed: async (page = 0, size = 10) => {
    const response = await client.get<Page<PetitionResponse>>('/petitions/feed', {
      params: { 
        page, 
        size, 
        sort: 'dateSince,desc' 
      }
    });
    return response.data;
  },

  /**
   * Obtiene "Mis Solicitudes" (historial del cliente).
   */
  getMyPetitions: async (page = 0, size = 10) => {
    const response = await client.get<Page<PetitionResponse>>('/petitions/my', {
      params: { 
        page, 
        size, 
        sort: 'dateSince,desc' 
      }
    });
    return response.data;
  },

  /**
   * Crea una nueva solicitud.
   */
  createPetition: async (data: PetitionRequest) => {
    const response = await client.post<PetitionResponse>('/petitions', data);
    return response.data;
  },

  // --- MÉTODOS NUEVOS (Solución a tu error) ---

  /**
   * Obtiene el detalle de una solicitud por su ID.
   */
  getById: async (id: number) => {
    const response = await client.get<PetitionResponse>(`/petitions/${id}`);
    return response.data;
  },

  /**
   * Elimina una solicitud por su ID.
   */
  delete: async (id: number) => {
    await client.delete(`/petitions/${id}`);
  },

  // --- MÉTODOS AUXILIARES (Mocks) ---
  
  getProfessions: async () => {
    return [
      { id: 1, name: 'Electricista' },
      { id: 2, name: 'Plomero' },
      { id: 3, name: 'Gasista' },
      { id: 4, name: 'Albañil' },
      { id: 5, name: 'Desarrollador' },
    ];
  },

  getCities: async () => {
    return [
      { id: 1, name: 'Mendoza Capital' },
      { id: 2, name: 'Godoy Cruz' },
      { id: 3, name: 'Guaymallén' },
      { id: 4, name: 'Las Heras' },
    ];
  },
  
  getTypes: async () => {
      return [
          { id: 1, name: 'Urgencia' },
          { id: 2, name: 'Presupuesto' },
          { id: 3, name: 'Consulta' }
      ];
  }
};
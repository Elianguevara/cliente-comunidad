import client from '../api/axiosClient';
import type { Page } from '../types/common.types';
import type { PetitionResponse, PetitionRequest } from '../types/petition.types';

export const petitionService = {
  /**
   * Obtiene el Feed General (excluyendo mis propias peticiones).
   * @param page Número de página (empieza en 0)
   * @param size Tamaño de la página
   */
  getFeed: async (page = 0, size = 10) => {
    // Usamos 'params' para que Axios construya la URL automáticamente
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
   * @param page Número de página (empieza en 0)
   * @param size Tamaño de la página
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
   * @param data Datos del formulario (PetitionRequest)
   */
  createPetition: async (data: PetitionRequest) => {
    const response = await client.post<PetitionResponse>('/petitions', data);
    return response.data;
  },

  // --- MÉTODOS AUXILIARES (Mocks para selects) ---
  // Estos son necesarios para llenar los combobox de "Crear Solicitud"
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
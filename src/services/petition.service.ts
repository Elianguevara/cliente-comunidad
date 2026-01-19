import client from '../api/axiosClient';
import type { Page } from '../types/common.types';
import type { PetitionResponse, PetitionRequest } from '../types/petition.types';

export const petitionService = {
  // Obtener Feed
  getFeed: async (page = 0, size = 10) => {
    const response = await client.get<Page<PetitionResponse>>('/petitions/feed', {
      params: { page, size, sort: 'dateSince,desc' }
    });
    return response.data;
  },

  // Crear Petición
  create: async (data: PetitionRequest) => {
    const response = await client.post<PetitionResponse>('/petitions', data);
    return response.data;
  },

  // --- MÉTODOS AUXILIARES (Si tu API los tiene, si no, usaremos datos falsos en el componente) ---
  getProfessions: async () => {
    // return client.get<any[]>('/professions'); 
    // MOCK TEMPORAL:
    return [
      { id: 1, name: 'Electricista' },
      { id: 2, name: 'Plomero' },
      { id: 3, name: 'Gasista' },
      { id: 4, name: 'Albañil' },
      { id: 5, name: 'Desarrollador' },
    ];
  },

  getCities: async () => {
    // return client.get<any[]>('/cities');
    // MOCK TEMPORAL:
    return [
      { id: 1, name: 'Mendoza Capital' },
      { id: 2, name: 'Godoy Cruz' },
      { id: 3, name: 'Guaymallén' },
    ];
  },
  
  getTypes: async () => {
      // MOCK TEMPORAL
      return [
          { id: 1, name: 'Urgencia' },
          { id: 2, name: 'Presupuesto' },
          { id: 3, name: 'Consulta' }
      ]
  }
};
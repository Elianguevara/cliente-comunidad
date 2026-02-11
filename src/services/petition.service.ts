import client from '../api/axiosClient';
import type { Page } from '../types/common.types';
import type { PetitionResponse, PetitionRequest } from '../types/petition.types';

export const petitionService = {
  
  // --- LECTURA DE DATOS ---

  // 1. Obtener Feed General (Para que los Proveedores busquen trabajo)
  getFeed: async (page = 0, size = 10) => {
    const response = await client.get<Page<PetitionResponse>>('/petitions/feed', {
      params: { page, size, sort: 'dateSince,desc' }
    });
    return response.data;
  },

  // 2. Obtener MIS Peticiones (Para el Dashboard del Cliente)
  // [IMPORTANTE]: Este es el método nuevo que conecta con tu endpoint @GetMapping("/my")
  getMyPetitions: async (page = 0, size = 5) => {
    const response = await client.get<Page<PetitionResponse>>('/petitions/my', {
      params: { page, size, sort: 'dateSince,desc' }
    });
    return response.data;
  },

  // --- ESCRITURA DE DATOS ---

  // 3. Crear Nueva Petición
  create: async (data: PetitionRequest) => {
    const response = await client.post<PetitionResponse>('/petitions', data);
    return response.data;
  },

  // --- MÉTODOS AUXILIARES (METADATA) ---
  // Nota: Mantenemos los datos "mock" (falsos) por ahora para que el formulario funcione
  // visualmente. Más adelante, conectaremos esto con tus endpoints de MetadataController.

  getProfessions: async () => {
    // TODO: Conectar con backend real cuando esté listo el endpoint /metadata/professions
    return [
      { id: 1, name: 'Electricista' },
      { id: 2, name: 'Plomero' },
      { id: 3, name: 'Gasista' },
      { id: 4, name: 'Albañil' },
      { id: 5, name: 'Desarrollador' },
    ];
  },

  getCities: async () => {
    // TODO: Conectar con backend real cuando esté listo el endpoint /metadata/cities
    return [
      { id: 1, name: 'Mendoza Capital' },
      { id: 2, name: 'Godoy Cruz' },
      { id: 3, name: 'Guaymallén' },
      { id: 4, name: 'Las Heras' },
      { id: 5, name: 'Maipú' },
    ];
  },
  
  getTypes: async () => {
      // TODO: Conectar con backend real
      return [
          { id: 1, name: 'Urgencia' },
          { id: 2, name: 'Presupuesto' },
          { id: 3, name: 'Consulta' }
      ]
  }
};
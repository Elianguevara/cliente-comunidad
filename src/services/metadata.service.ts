// Archivo: src/services/metadata.service.ts
import client from '../api/axiosClient';
import type { City, Profession, TypePetition } from '../types/metadata.types';

export const metadataService = {
  
  getAllCities: async () => {
    // Hace GET a http://localhost:8080/api/metadata/cities
    const response = await client.get<City[]>('/metadata/cities');
    return response.data;
  },

  getAllProfessions: async () => {
    const response = await client.get<Profession[]>('/metadata/professions');
    return response.data;
  },

  getAllTypes: async () => {
    const response = await client.get<TypePetition[]>('/metadata/types');
    return response.data;
  }
};
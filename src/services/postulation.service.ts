// src/services/postulation.service.ts
import client from '../api/axiosClient';
import type { PostulationRequest, PostulationResponse } from '../types/postulation.types';

export const postulationService = {
  // Crear una nueva postulación (Proveedor)
  create: async (data: PostulationRequest): Promise<PostulationResponse> => {
    const response = await client.post('/postulations', data);
    return response.data;
  },

  // Verificar si el proveedor ya se postuló (Proveedor)
  checkIfApplied: async (idPetition: number): Promise<boolean> => {
    try {
      const response = await client.get(`/postulations/check/${idPetition}`);
      return response.data;
    } catch (error) {
      return false;
    }
  },

  // Obtener todos los candidatos de una petición (Cliente)
  getByPetition: async (idPetition: number): Promise<PostulationResponse[]> => {
    const response = await client.get(`/postulations/petition/${idPetition}`);
    return response.data;
  },

  // Aceptar a un ganador (Cliente)
  accept: async (idPostulation: number): Promise<string> => {
    const response = await client.put(`/postulations/${idPostulation}/accept`);
    return response.data; // Retorna el mensaje de éxito del backend
  },

  // Historial de postulaciones del usuario autenticado
  getMyPostulations: async (page = 0, size = 10) => {
    const response = await client.get(`/postulations/my?page=${page}&size=${size}`);
    return response.data;
  }
};
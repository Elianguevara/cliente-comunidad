// src/services/media.service.ts
import axiosClient from '../api/axiosClient';

export const uploadImage = async (file: File): Promise<string> => {
  // FormData es la API nativa del navegador para enviar archivos
  const formData = new FormData();
  formData.append('file', file); // 'file' debe coincidir con el @RequestParam de Spring Boot

  try {
    const response = await axiosClient.post('/media/upload', formData, {
      headers: {
        // Es crucial este header para que Axios sepa que no es un JSON
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Tu backend ahora devuelve { url: "https://res.cloudinary..." }
    return response.data.url; 
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    throw new Error('No se pudo subir la imagen. Inténtalo de nuevo.');
  }
};
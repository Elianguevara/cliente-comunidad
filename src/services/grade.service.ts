// src/services/grade.service.ts
import client from '../api/axiosClient';
import type { RateRequest, ReviewResponse } from '../types/review.types';

// Interfaz genérica para manejar la paginación de Spring Boot
export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

// =======================================================
// CALIFICACIONES: CLIENTE ---> PROVEEDOR
// =======================================================

export const rateProvider = async (request: RateRequest): Promise<string> => {
  const response = await client.post('/grades/rate-provider', request);
  return response.data;
};

// Obtener las reseñas paginadas de un proveedor
export const getProviderReviews = async (
  providerId: number, 
  page: number = 0, 
  size: number = 5
): Promise<PageResponse<ReviewResponse>> => {
  const response = await client.get(`/grades/provider/${providerId}?page=${page}&size=${size}&sort=idGradeProvider,desc`);
  return response.data;
};

// Verifica si el cliente ya calificó a este proveedor por un trabajo específico
export const checkIfProviderRated = async (providerId: number, petitionId: number): Promise<boolean> => {
  const response = await client.get(`/grades/check-rated/${providerId}`, {
    params: { petitionId },
  });
  return response.data;
};

// =======================================================
// CALIFICACIONES: PROVEEDOR ---> CLIENTE
// =======================================================

// Tipado para la respuesta del estado de calificación del cliente
export interface CustomerRatingStatus {
  canRate: boolean;
  hasRated: boolean;
  customerId: number;
  customerName: string;
}

// Verifica si el proveedor puede calificar al cliente de esta petición
export const getCustomerRatingStatus = async (petitionId: number): Promise<CustomerRatingStatus> => {
  const response = await client.get(`/grades/customer-rating-status/${petitionId}`);
  return response.data;
};

// Envía la calificación del proveedor hacia el cliente
export const rateCustomer = async (petitionId: number, targetId: number, rating: number, comment: string): Promise<string> => {
  const response = await client.post('/grades/rate-customer', { 
    petitionId, 
    targetId, 
    rating, 
    comment 
  });
  return response.data;
};
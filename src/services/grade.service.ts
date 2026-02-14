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

export const rateProvider = async (request: RateRequest): Promise<string> => {
  const response = await client.post('/grades/rate-provider', request);
  return response.data;
};

// Nueva función para obtener las reseñas paginadas
export const getProviderReviews = async (
  providerId: number, 
  page: number = 0, 
  size: number = 5
): Promise<PageResponse<ReviewResponse>> => {
  const response = await client.get(`/grades/provider/${providerId}?page=${page}&size=${size}&sort=idGradeProvider,desc`);
  return response.data;
};
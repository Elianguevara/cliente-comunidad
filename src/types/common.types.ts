// src/types/common.types.ts

// Estructura genérica para las respuestas paginadas de Spring Boot
export interface Page<T> {
  content: T[];          // La lista de datos real (ej: Peticiones, Mensajes)
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;        // Página actual (empieza en 0)
  first: boolean;
  last: boolean;
  empty: boolean;
}

// Para manejar errores estandarizados del backend
export interface ApiError {
  message: string;
  status: number;
  timestamp?: string;
}
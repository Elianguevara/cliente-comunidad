// Interfaz Genérica para la Paginación de Spring Boot
// T representa el tipo de dato (ej: PetitionResponse, User, etc.)
export interface Page<T> {
  content: T[];          // Lista de elementos de la página actual
  totalPages: number;    // Cantidad total de páginas
  totalElements: number; // Cantidad total de elementos en la base de datos
  last: boolean;         // true si es la última página
  size: number;          // Tamaño de página (ej: 10)
  number: number;        // Índice de la página actual (empieza en 0)
  first: boolean;        // true si es la primera página
  empty: boolean;        // true si no hay resultados
  
  // Opcional: Información de ordenamiento si la necesitas mostrar
  sort?: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
}

// Interfaz para manejar errores estandarizados del Backend
export interface ApiError {
  message: string;       // Mensaje legible del error
  status: number;        // Código HTTP (400, 401, 404, etc.)
  timestamp?: string;    // Fecha del error
  errors?: string[];     // Lista de errores de validación (opcional)
}
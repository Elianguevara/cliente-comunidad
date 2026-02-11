// 1. Interfaz para lo que RECIBES del Backend (GET)
// Coincide con tu DTO 'PetitionResponse' en Java
export interface PetitionResponse {
  idPetition: number;
  description: string;
  typePetitionName: string; // Ej: "Urgencia"
  professionName: string;   // Ej: "Plomero"
  stateName: string;        // Ej: "PUBLICADA"
  dateSince: string;        // ISO String (YYYY-MM-DDTHH:mm:ss)
  dateUntil: string;
  customerName: string;
  cityName: string;
}

// 2. Interfaz para lo que ENVÍAS al Backend (POST/PUT)
// Coincide con tu DTO 'PetitionRequest' en Java
export interface PetitionRequest {
  description: string;
  idTypePetition: number;
  idProfession: number;
  idCity: number;
  dateUntil: string; // Formato esperado: YYYY-MM-DD
}

// Nota: Hemos eliminado 'PageResponse' de aquí porque
// ya deberías tener una interfaz 'Page<T>' genérica en 'common.types.ts'.
// Si no la tienes, avísame y la creamos.
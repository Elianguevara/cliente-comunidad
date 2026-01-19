// src/types/petition.types.ts

// --- PETICIONES (Trabajos) ---

export interface PetitionRequest {
  description: string;
  idTypePetition: number;
  idProfession: number;
  idCity: number;     //
  dateUntil?: string; // Formato YYYY-MM-DD
}

export interface PetitionResponse {
  idPetition: number;
  description: string;
  typePetitionName: string; // Ej: "Urgencia", "Presupuesto"
  professionName: string;
  stateName: string;        // Ej: "PUBLICADA", "ADJUDICADA"
  dateSince: string;        // LocalDate viaja como string
  dateUntil: string;
  customerName: string;
  cityName: string;
}

// --- POSTULACIONES (Candidatos) ---

export interface PostulationRequest {
  idPetition: number;
  proposal: string;
  // amount?: number; // Si agregas presupuesto en el futuro
}

export interface PostulationResponse {
  idPostulation: number;
  proposal: string;
  providerName: string;
  petitionTitle: string;
  state: string;
  isWinner: boolean;
}
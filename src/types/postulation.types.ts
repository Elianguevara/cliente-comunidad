// src/types/postulation.types.ts

export interface PostulationRequest {
  idPetition: number;
  description: string;
  budget: number;
}

export interface PostulationResponse {
  idPostulation: number;
  description: string;
  providerName: string;
  providerImage: string | null;
  petitionTitle: string;
  petitionId: number;
  stateName: string;
  isWinner: boolean;
  datePostulation: string;
  budget?: number; // Opcional, ya que el backend lo concatena en el proposal a veces
}
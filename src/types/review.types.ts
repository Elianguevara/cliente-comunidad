// src/types/review.types.ts

export interface RateRequest {
  targetId: number;  // ID del usuario a calificar
  rating: number;    // 1 a 5
  comment?: string;  // Opcional
}

export interface ReviewResponse {
  idReview: number;
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
}
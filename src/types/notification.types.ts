// src/types/notification.types.ts

export interface NotificationResponse {
  id: number;
  title: string;
  message: string;
  type: string; // Podrías refinarlo a: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
  isRead: boolean;
  createdAt: string;
  relatedPostulationId?: number; // Pueden ser nulos según el tipo de notif
  relatedPetitionId?: number;
}
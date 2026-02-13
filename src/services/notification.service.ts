// src/services/notification.service.ts
import client from '../api/axiosClient';
// Importamos el tipo (asegúrate de que la ruta sea correcta)
import type { NotificationResponse } from '../types/notification.types'; 

export const notificationService = {
  // 1. Usamos el tipo aquí para el retorno (content es un array de NotificationResponse)
  getMyNotifications: async (page = 0, size = 10): Promise<{ content: NotificationResponse[], totalElements: number }> => {
    const response = await client.get(`/notifications?page=${page}&size=${size}`);
    return response.data;
  },

  // 2. Obtener contador de no leídas
  getUnreadCount: async (): Promise<number> => {
    const response = await client.get('/notifications/unread-count');
    return response.data;
  },

  // 3. Marcar una notificación como leída
  markAsRead: async (idNotification: number): Promise<void> => {
    await client.put(`/notifications/${idNotification}/read`);
  }
};
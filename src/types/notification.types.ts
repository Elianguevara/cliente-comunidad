export interface NotificationResponse {
  idNotification: number; // Coincide con el backend
  title: string;
  message: string;
  notificationType: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  metadata?: string; // Aquí viaja el link como "/petition/5"
}
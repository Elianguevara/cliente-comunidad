import { io, type Socket } from 'socket.io-client';
import type {
  ChatClientToServerEvents,
  ChatServerToClientEvents,
  NotificationsServerToClientEvents,
} from '../types/socket.types';

let chatSocket: Socket<ChatServerToClientEvents, ChatClientToServerEvents> | null = null;
let notificationsSocket: Socket<NotificationsServerToClientEvents> | null = null;

function getSocketBaseUrl(): string {
  const wsUrl = import.meta.env.VITE_WS_URL?.trim();
  if (wsUrl) {
    return wsUrl.replace(/\/+$/, '');
  }

  const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').trim();
  return apiUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');
}

function getSocketAuth(): { token?: string } {
  const token = localStorage.getItem('token');
  return token ? { token: `Bearer ${token}` } : {};
}

function logSocketError(scope: string, error: Error): void {
  console.error(`Socket error (${scope}):`, error.message);
}

export function getChatSocket(): Socket<ChatServerToClientEvents, ChatClientToServerEvents> {
  if (!chatSocket) {
    chatSocket = io(`${getSocketBaseUrl()}/chat`, {
      auth: getSocketAuth(),
      transports: ['websocket', 'polling'],
      reconnection: true,
    }) as Socket<ChatServerToClientEvents, ChatClientToServerEvents>;
    chatSocket.on('connect_error', (error) => logSocketError('chat', error));
  }

  if (!chatSocket.connected) {
    chatSocket.auth = getSocketAuth();
    chatSocket.connect();
  }

  return chatSocket;
}

export function getNotificationsSocket(): Socket<NotificationsServerToClientEvents> {
  if (!notificationsSocket) {
    notificationsSocket = io(`${getSocketBaseUrl()}/notifications`, {
      auth: getSocketAuth(),
      transports: ['websocket', 'polling'],
      reconnection: true,
    }) as Socket<NotificationsServerToClientEvents>;
    notificationsSocket.on('connect_error', (error) => logSocketError('notifications', error));
  }

  if (!notificationsSocket.connected) {
    notificationsSocket.auth = getSocketAuth();
    notificationsSocket.connect();
  }

  return notificationsSocket;
}

export function disconnectRealtimeSockets(): void {
  if (chatSocket) {
    chatSocket.disconnect();
    chatSocket = null;
  }

  if (notificationsSocket) {
    notificationsSocket.disconnect();
    notificationsSocket = null;
  }
}

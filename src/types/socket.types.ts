import type { MessageResponse } from './chat.types';
import type { NotificationResponse } from './notification.types';

export interface SocketMessageRequest {
  conversationId: number;
  content: string;
}

export interface ChatNewMessageEvent {
  conversationId: number;
  message: MessageResponse;
}

export interface NotificationsUnreadCountEvent {
  unreadCount: number;
}

export interface ChatServerToClientEvents {
  'chat.new-message': (payload: ChatNewMessageEvent) => void;
}

export interface ChatClientToServerEvents {
  'chat.send-message': (payload: SocketMessageRequest) => void;
}

export interface NotificationsServerToClientEvents {
  'notifications.new': (notification: NotificationResponse) => void;
  'notifications.unread-count': (payload: NotificationsUnreadCountEvent) => void;
}


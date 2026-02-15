// src/types/chat.types.ts

export interface MessageRequest {
  content: string;
}

export interface MessageResponse {
  idMessage: number;
  content: string;
  sentAt: string; // Fecha en formato ISO
  senderId: number;
  senderName: string;
  isMine: boolean; // Utilidad para el frontend para saber si el mensaje es del usuario actual
}

export interface ConversationResponse {
  idConversation: number;
  petitionId: number;
  petitionTitle: string;
  otherParticipantId: number;
  otherParticipantName: string;
  otherParticipantRole: string;
  otherParticipantImage?: string;
  lastMessage?: string;
  updatedAt: string;
  unreadCount: number;
}
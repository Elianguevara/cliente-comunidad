// src/types/chat.types.ts

export interface MessageRequest {
  content: string;
}

export interface MessageResponse {
  idMessage: number;     // Long en Java -> number en TS
  content: string;
  createdAt: string;     // LocalDateTime viaja como ISO String
  senderId: number;
  senderName: string;
  isMine: boolean;       // ¡Muy útil para el frontend!
}

export interface ConversationResponse {
  idConversation: number;
  petitionId: number;
  petitionTitle: string;
  otherUserName: string;       // El nombre de la persona con la que hablas
  otherUserProfileImage?: string; // Puede ser null si no tiene foto
}
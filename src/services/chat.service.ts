import axiosClient from '../api/axiosClient';
import type { ConversationResponse, MessageResponse } from '../types/chat.types';

export const chatService = {
  // Obtiene todas las conversaciones del usuario activo
  getMyConversations: async (): Promise<ConversationResponse[]> => {
    const { data } = await axiosClient.get('/v1/chat/conversations');
    return data;
  },

  // Obtiene o crea una conversación específica para una solicitud
  getOrCreateConversation: async (petitionId: number, providerId: number): Promise<ConversationResponse> => {
    const { data } = await axiosClient.post('/v1/chat/conversations', {
      petitionId,
      providerId
    });
    return data;
  },

  // Obtiene los mensajes de una conversación
  getMessages: async (conversationId: number): Promise<MessageResponse[]> => {
    const { data } = await axiosClient.get(`/v1/chat/conversations/${conversationId}/messages`);
    return data;
  },

  // Envía un mensaje nuevo
  sendMessage: async (conversationId: number, content: string): Promise<MessageResponse> => {
    const { data } = await axiosClient.post(`/v1/chat/conversations/${conversationId}/messages`, {
      content
    });
    return data;
  }
};
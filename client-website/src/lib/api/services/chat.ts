import { apiClient } from '@/lib/api/client';
import { Message, ChatRoom } from '@/types';

export const chatApi = {
  sendMessage: (recipientId: string, message: string, roomId?: string) =>
    apiClient.post<{ messageId: string; status: string }>('/chat/send', {
      recipientId,
      message,
      roomId
    }),

  getPendingMessages: () =>
    apiClient.get<{ messages: Message[] }>('/chat/pending'),

  markMessageDelivered: (messageId: string) =>
    apiClient.post(`/chat/delivered/${messageId}`),

  getUserRooms: () =>
    apiClient.get<ChatRoom[]>('/chat/rooms'),

  createRoom: (name: string, type: 'private' | 'group' | 'public', participants?: string[]) =>
    apiClient.post<ChatRoom>('/chat/rooms/create', {
      name,
      type,
      participants
    }),

  joinRoom: (roomId: string) =>
    apiClient.post(`/chat/rooms/${roomId}/join`),

  leaveRoom: (roomId: string) =>
    apiClient.post(`/chat/rooms/${roomId}/leave`),
};
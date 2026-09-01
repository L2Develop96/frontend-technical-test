import { api } from './axios';
import type { Conversation } from '../types/conversation';
import type { Message } from '../types/message';
import type { User } from '../types/user';

export async function getConversations(userId: number): Promise<Conversation[]> {
  const { data } = await api.get<Conversation[]>(`/conversations/${userId}`);
  return data;
}

export async function getMessages(conversationId: number): Promise<Message[]> {
  const { data } = await api.get<Message[]>(`/messages/${conversationId}`);
  return data;
}

export async function getUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>('/users');
  return data;
}

export type NewMessagePayload = Omit<Message, 'id'>;

export async function createMessage(payload: NewMessagePayload): Promise<Message> {
  const { data } = await api.post<Message>('/messages', payload);
  return data;
}

export type NewConversationPayload = Omit<Conversation, 'id'>;

export async function createConversation(
  payload: NewConversationPayload,
): Promise<Conversation> {
  const { data } = await api.post<Conversation>('/conversations', payload);
  return data;
}

export async function deleteConversation(conversationId: number): Promise<void> {
  await api.delete(`/conversation/${conversationId}`);
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createConversation,
  createMessage,
  deleteConversation,
  getConversations,
  getMessages,
  getUsers,
} from './services';
import type { NewConversationPayload, NewMessagePayload } from './services';
import type { Conversation } from '../types/conversation';
import type { Message } from '../types/message';

export function useConversations(userId: number) {
  return useQuery({
    queryKey: ['conversations', userId],
    queryFn: () => getConversations(userId),
    select: (conversations: Conversation[]) =>
      [...conversations].sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp),
  });
}

export function useMessages(conversationId: number) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => getMessages(conversationId),
    enabled: Number.isInteger(conversationId) && conversationId > 0,
    select: (messages: Message[]) => [...messages].sort((a, b) => a.timestamp - b.timestamp),
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });
}

export function useSendMessage(conversationId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: NewMessagePayload) => createMessage(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: NewConversationPayload) => createConversation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: number) => deleteConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

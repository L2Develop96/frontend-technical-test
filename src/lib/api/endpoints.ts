import { apiFetch } from './client'
import { isConversation, isMessage, isUser, parseCreated, parseList, parseOne } from './guards'
import type { Conversation } from '../../types/conversation'
import type { Message } from '../../types/message'
import type { User } from '../../types/user'
import type { NewConversationPayload, NewMessagePayload } from '../../types/api'

type RequestOptions = { signal?: AbortSignal }

export async function getConversations(
  userId: number,
  { signal }: RequestOptions = {}
): Promise<Conversation[]> {
  const raw = await apiFetch<unknown>(`/conversations/${userId}`, { signal })
  return parseList(raw, isConversation, 'conversations')
}

export async function getConversation(
  conversationId: number,
  { signal }: RequestOptions = {}
): Promise<Conversation> {
  const raw = await apiFetch<unknown>(`/conversation/${conversationId}`, { signal })
  return parseOne(raw, isConversation, 'conversation')
}

export async function getMessages(
  conversationId: number,
  { signal }: RequestOptions = {}
): Promise<Message[]> {
  const raw = await apiFetch<unknown>(`/messages/${conversationId}`, { signal })
  return parseList(raw, isMessage, 'messages')
}

export async function getUsers({ signal }: RequestOptions = {}): Promise<User[]> {
  const raw = await apiFetch<unknown>('/users', { signal })
  return parseList(raw, isUser, 'users')
}

// Writes target the plain collections: the :id segment on /messages/:id and
// /conversations/:id is only used to rewrite GETs into filtered queries, and is
// dropped on POST, which would otherwise persist a record with no conversationId.
export async function createMessage(payload: NewMessagePayload): Promise<Message> {
  const raw = await apiFetch<unknown>('/messages', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return parseCreated(raw, isMessage, 'message')
}

export async function createConversation(
  payload: NewConversationPayload
): Promise<Conversation> {
  const raw = await apiFetch<unknown>('/conversations', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return parseCreated(raw, isConversation, 'conversation')
}

// The conversation's messages are removed server-side along with it, so the
// cached message list for this id is dropped rather than refetched.
export async function deleteConversation(conversationId: number): Promise<void> {
  await apiFetch<unknown>(`/conversation/${conversationId}`, { method: 'DELETE' })
}

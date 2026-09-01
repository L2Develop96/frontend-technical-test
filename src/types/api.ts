import type { Conversation } from './conversation'
import type { Message } from './message'

export type NewMessagePayload = Omit<Message, 'id'>

export type NewConversationPayload = Omit<Conversation, 'id'>

import type { Conversation } from '../types/conversation'
import type { User } from '../types/user'

// The logged user is not always the sender: conversations started by someone else
// carry them in recipient* instead.
export function getOtherParticipant(
  conversation: Conversation,
  loggedUserId: User['id']
): { id: number; nickname: string } {
  return conversation.senderId === loggedUserId
    ? { id: conversation.recipientId, nickname: conversation.recipientNickname }
    : { id: conversation.senderId, nickname: conversation.senderNickname }
}

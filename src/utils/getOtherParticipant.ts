import type { Conversation } from '../types/conversation';

export function getOtherParticipant(conversation: Conversation, loggedUserId: number) {
  return conversation.senderId === loggedUserId
    ? { id: conversation.recipientId, nickname: conversation.recipientNickname }
    : { id: conversation.senderId, nickname: conversation.senderNickname };
}

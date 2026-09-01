import { useQuery } from '@tanstack/react-query'
import { getConversations } from '../lib/api/endpoints'
import { queryKeys } from '../lib/queryKeys'
import type { Conversation } from '../types/conversation'

export function useConversations(userId: number) {
  return useQuery({
    queryKey: queryKeys.conversations(userId),
    queryFn: ({ signal }) => getConversations(userId, { signal }),
    select: (conversations: Conversation[]) =>
      [...conversations].sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp),
  })
}

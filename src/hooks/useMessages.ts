import { useQuery } from '@tanstack/react-query'
import { getMessages } from '../lib/api/endpoints'
import { queryKeys } from '../lib/queryKeys'
import type { Message } from '../types/message'

export function useMessages(conversationId: number | null) {
  return useQuery({
    queryKey: queryKeys.messages(conversationId ?? -1),
    queryFn: ({ signal }) => getMessages(conversationId as number, { signal }),
    enabled: Number.isInteger(conversationId) && (conversationId as number) > 0,
    select: (messages: Message[]) =>
      [...messages].sort((a, b) => a.timestamp - b.timestamp),
  })
}

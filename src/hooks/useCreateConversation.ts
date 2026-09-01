import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createConversation } from '../lib/api/endpoints'
import { queryKeys } from '../lib/queryKeys'
import type { Conversation } from '../types/conversation'
import type { User } from '../types/user'

type CreateVariables = { recipient: User }

export function useCreateConversation(currentUser: User) {
  const queryClient = useQueryClient()
  const key = queryKeys.conversations(currentUser.id)

  return useMutation({
    mutationFn: ({ recipient }: CreateVariables) =>
      createConversation({
        senderId: currentUser.id,
        senderNickname: currentUser.nickname,
        recipientId: recipient.id,
        recipientNickname: recipient.nickname,
        lastMessageTimestamp: Math.floor(Date.now() / 1000),
      }),

    onError: (_error, _variables, context: { previous?: Conversation[] } | undefined) => {
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous)
      }
    },

    onSuccess: created => {
      queryClient.setQueryData<Conversation[]>(key, current => {
        const existing = current ?? []
        return existing.some(conversation => conversation.id === created.id)
          ? existing
          : [...existing, created]
      })
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key })
    },
  })
}

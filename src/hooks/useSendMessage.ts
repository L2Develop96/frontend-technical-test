import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createMessage } from '../lib/api/endpoints'
import { queryKeys } from '../lib/queryKeys'
import type { Message } from '../types/message'

export type OptimisticMessage = Message & { pending?: boolean }

type SendVariables = { body: string; authorId: number }

type MutationContext = { previous?: OptimisticMessage[]; tempId: number }

export function useSendMessage(conversationId: number) {
  const queryClient = useQueryClient()
  const key = queryKeys.messages(conversationId)

  return useMutation({
    mutationFn: ({ body, authorId }: SendVariables) =>
      createMessage({
        conversationId,
        authorId,
        body,
        timestamp: Math.floor(Date.now() / 1000),
      }),

    onMutate: async ({ body, authorId }): Promise<MutationContext> => {
      await queryClient.cancelQueries({ queryKey: key })

      const previous = queryClient.getQueryData<OptimisticMessage[]>(key)
      // Negative ids cannot collide with the server's incrementing ones.
      const tempId = -Date.now()

      const optimistic: OptimisticMessage = {
        id: tempId,
        conversationId,
        authorId,
        body,
        timestamp: Math.floor(Date.now() / 1000),
        pending: true,
      }

      queryClient.setQueryData<OptimisticMessage[]>(key, current => [
        ...(current ?? []),
        optimistic,
      ])

      return { previous, tempId }
    },

    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous)
      } else {
        queryClient.removeQueries({ queryKey: key })
      }
    },

    onSuccess: (created, _variables, context) => {
      queryClient.setQueryData<OptimisticMessage[]>(key, current =>
        (current ?? []).map(message =>
          message.id === context?.tempId ? created : message
        )
      )
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

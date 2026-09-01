import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteConversation } from '../lib/api/endpoints';
import { queryKeys } from '../lib/queryKeys';
import type { Conversation } from '../types/conversation';

type DeleteVariables = { conversationId: number };

type MutationContext = { previous?: Conversation[] };

export function useDeleteConversation(loggedUserId: number) {
  const queryClient = useQueryClient();
  const key = queryKeys.conversations(loggedUserId);

  return useMutation({
    mutationFn: ({ conversationId }: DeleteVariables) =>
      deleteConversation(conversationId),

    onMutate: async ({ conversationId }): Promise<MutationContext> => {
      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueryData<Conversation[]>(key);

      queryClient.setQueryData<Conversation[]>(key, (current) =>
        (current ?? []).filter(
          (conversation) => conversation.id !== conversationId,
        ),
      );

      return { previous };
    },

    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      }
    },

    onSuccess: (_data, { conversationId }) => {
      queryClient.removeQueries({
        queryKey: queryKeys.messages(conversationId),
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}

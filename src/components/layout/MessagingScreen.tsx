import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import type { ReactElement, ReactNode } from 'react';
import { useRef, useState } from 'react';
import { useConversations } from '../../hooks/useConversations';
import { useCreateConversation } from '../../hooks/useCreateConversation';
import { useDeleteConversation } from '../../hooks/useDeleteConversation';
import type { Conversation } from '../../types/conversation';
import type { User } from '../../types/user';
import { getLoggedUserId } from '../../utils/getLoggedUserId';
import { ConversationList } from '../conversation/ConversationList';
import { AppShell } from './AppShell';

const NewConversationModal = dynamic(
  () =>
    import('../conversation/NewConversationModal').then(
      (mod) => mod.NewConversationModal,
    ),
  { ssr: false },
);

type MessagingScreenProps = {
  activeConversationId: number | null;
  renderDetail: (context: {
    conversations: Conversation[];
    isLoading: boolean;
    error: unknown;
    onDeleteConversation: (conversationId: number) => void;
    isDeletingConversation: boolean;
  }) => ReactNode;
};

export function MessagingScreen({
  activeConversationId,
  renderDetail,
}: MessagingScreenProps): ReactElement {
  const router = useRouter();
  const loggedUserId = getLoggedUserId();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const triggerRef = useRef<Element | null>(null);

  const {
    data: conversations,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useConversations(loggedUserId);

  const currentUser: User = {
    id: loggedUserId,
    nickname:
      conversations?.find(
        (conversation) => conversation.senderId === loggedUserId,
      )?.senderNickname ??
      conversations?.find(
        (conversation) => conversation.recipientId === loggedUserId,
      )?.recipientNickname ??
      'Vous',
    token: '',
  };

  const createConversation = useCreateConversation(currentUser);
  const deleteConversation = useDeleteConversation(loggedUserId);

  // Leaving the thread route first keeps its "conversation not found" branch
  // from flashing while the optimistic removal lands.
  const handleDeleteConversation = (conversationId: number) => {
    router.push('/').then(() => {
      deleteConversation.mutate({ conversationId });
    });
  };

  const openModal = () => {
    triggerRef.current = document.activeElement;
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Native dialogs restore focus inconsistently once the element unmounts.
    if (triggerRef.current instanceof HTMLElement) triggerRef.current.focus();
  };

  const handleSelectRecipient = (recipient: User) => {
    createConversation.mutate(
      { recipient },
      {
        onSuccess: (created) => {
          closeModal();
          router.push(`/conversations/${created.id}`);
        },
      },
    );
  };

  return (
    <>
      <AppShell
        variant={activeConversationId === null ? 'list' : 'detail'}
        isInitialLoading={isLoading}
        deleteError={deleteConversation.isError}
        onDismissDeleteError={() => deleteConversation.reset()}
        list={
          <ConversationList
            conversations={conversations}
            loggedUserId={loggedUserId}
            activeConversationId={activeConversationId}
            isLoading={isLoading}
            isFetching={isFetching}
            error={error}
            onRetry={() => refetch()}
            onNewConversation={openModal}
            canCreate={!isLoading && !error}
          />
        }
        detail={
          <main id="main-content" style={{ display: 'contents' }}>
            {renderDetail({
              conversations: conversations ?? [],
              isLoading,
              error,
              onDeleteConversation: handleDeleteConversation,
              isDeletingConversation: deleteConversation.isPending,
            })}
          </main>
        }
      />

      {isModalOpen ? (
        <NewConversationModal
          loggedUserId={loggedUserId}
          conversations={conversations ?? []}
          onClose={closeModal}
          onSelect={handleSelectRecipient}
          isCreating={createConversation.isPending}
        />
      ) : null}
    </>
  );
}

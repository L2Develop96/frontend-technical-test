import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { AppShell } from './AppShell';
import { ConversationList } from './ConversationList';
import { useConversations, useCreateConversation } from '../api/queries';
import { getLoggedUserId } from '../utils/getLoggedUserId';
import type { Conversation } from '../types/conversation';
import type { User } from '../types/user';

const NewConversationModal = dynamic(
  () => import('./NewConversationModal').then((mod) => mod.NewConversationModal),
  { ssr: false },
);

type MessagingScreenProps = {
  activeConversationId: number | null;
  renderDetail: (context: { conversations: Conversation[] }) => ReactNode;
};

export function MessagingScreen({
  activeConversationId,
  renderDetail,
}: MessagingScreenProps): ReactElement {
  const router = useRouter();
  const loggedUserId = getLoggedUserId();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: conversations } = useConversations(loggedUserId);
  const createConversation = useCreateConversation();

  const currentNickname =
    conversations?.find((conversation) => conversation.senderId === loggedUserId)
      ?.senderNickname ??
    conversations?.find((conversation) => conversation.recipientId === loggedUserId)
      ?.recipientNickname ??
    'Vous';

  const handleSelectRecipient = (recipient: User) => {
    createConversation.mutate(
      {
        senderId: loggedUserId,
        senderNickname: currentNickname,
        recipientId: recipient.id,
        recipientNickname: recipient.nickname,
        lastMessageTimestamp: Math.floor(Date.now() / 1000),
      },
      {
        onSuccess: (created) => {
          setIsModalOpen(false);
          router.push(`/conversations/${created.id}`);
        },
      },
    );
  };

  return (
    <>
      <AppShell
        variant={activeConversationId === null ? 'list' : 'detail'}
        list={
          <ConversationList
            loggedUserId={loggedUserId}
            activeConversationId={activeConversationId}
            onNewConversation={() => setIsModalOpen(true)}
          />
        }
        detail={renderDetail({ conversations: conversations ?? [] })}
      />

      {isModalOpen ? (
        <NewConversationModal
          loggedUserId={loggedUserId}
          conversations={conversations ?? []}
          onClose={() => setIsModalOpen(false)}
          onSelect={handleSelectRecipient}
        />
      ) : null}
    </>
  );
}

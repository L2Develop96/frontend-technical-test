import Link from 'next/link';
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import { MessageComposer } from './MessageComposer';
import { MessageList } from './MessageList';
import { useDeleteConversation, useMessages, useSendMessage } from '../api/queries';
import { getOtherParticipant } from '../utils/getOtherParticipant';
import type { Conversation } from '../types/conversation';
import styles from './ConversationView.module.css';

type ConversationViewProps = {
  conversation: Conversation;
  loggedUserId: number;
};

export function ConversationView({
  conversation,
  loggedUserId,
}: ConversationViewProps): ReactElement {
  const router = useRouter();
  const other = getOtherParticipant(conversation, loggedUserId);
  const { data: messages, isLoading, isError } = useMessages(conversation.id);
  const sendMessage = useSendMessage(conversation.id);
  const deleteConversation = useDeleteConversation();

  const handleSend = (body: string) => {
    sendMessage.mutate({
      conversationId: conversation.id,
      authorId: loggedUserId,
      body,
      timestamp: Math.floor(Date.now() / 1000),
    });
  };

  const handleDelete = () => {
    if (!window.confirm(`Supprimer la conversation avec ${other.nickname} ?`)) return;

    router.push('/').then(() => {
      deleteConversation.mutate(conversation.id);
    });
  };

  const renderBody = () => {
    if (isLoading) return <p className={styles.status}>Chargement…</p>;
    if (isError) return <p className={styles.status}>Une erreur est survenue.</p>;

    return (
      <MessageList
        messages={messages ?? []}
        loggedUserId={loggedUserId}
        otherNickname={other.nickname}
      />
    );
  };

  return (
    <section className={styles.view}>
      <header className={styles.header}>
        <Link href="/" className={styles.back} aria-label="Retour aux conversations">
          ←
        </Link>
        <h2 className={styles.headerTitle}>{other.nickname} - Vous</h2>
        <button type="button" className={styles.deleteButton} onClick={handleDelete}>
          Supprimer
        </button>
      </header>
      {renderBody()}
      <MessageComposer onSend={handleSend} isSending={sendMessage.isPending} />
    </section>
  );
}

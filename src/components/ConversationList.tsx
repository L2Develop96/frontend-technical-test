import Image from 'next/image';
import type { ReactElement } from 'react';
import { ConversationItem } from './ConversationItem';
import { useConversations } from '../api/queries';
import logo from '../assets/logo-messages.png';
import styles from './ConversationList.module.css';

type ConversationListProps = {
  loggedUserId: number;
  activeConversationId: number | null;
  onNewConversation: () => void;
};

export function ConversationList({
  loggedUserId,
  activeConversationId,
  onNewConversation,
}: ConversationListProps): ReactElement {
  const { data: conversations, isLoading, isError } = useConversations(loggedUserId);

  const renderBody = () => {
    if (isLoading) return <p className={styles.status}>Chargement…</p>;
    if (isError) return <p className={styles.status}>Une erreur est survenue.</p>;
    if (!conversations?.length) {
      return <p className={styles.status}>Aucune conversation.</p>;
    }

    return (
      <ul className={styles.list}>
        {conversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            loggedUserId={loggedUserId}
            isActive={conversation.id === activeConversationId}
          />
        ))}
      </ul>
    );
  };

  return (
    <nav className={styles.panel} aria-label="Conversations">
      <div className={styles.header}>
        <span className={styles.brand}>
          <span className={styles.logoFrame}>
            <Image className={styles.logo} src={logo} alt="" priority sizes="80px" />
          </span>
          <h1 className={styles.title}>Messages</h1>
        </span>
        <button type="button" className={styles.newButton} onClick={onNewConversation}>
          + Nouvelle
        </button>
      </div>
      <div className={styles.scroller}>{renderBody()}</div>
    </nav>
  );
}

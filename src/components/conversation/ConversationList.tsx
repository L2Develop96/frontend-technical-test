import Image from 'next/image';
import type { ReactElement } from 'react';
import logo from '../../assets/images/logo-messages.png';
import type { Conversation } from '../../types/conversation';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';
import { SkeletonList } from '../ui/Skeleton';
import styles from './ConversationList.module.css';
import { ConversationListItem } from './ConversationListItem';

type ConversationListProps = {
  conversations: Conversation[] | undefined;
  loggedUserId: number;
  activeConversationId: number | null;
  isLoading: boolean;
  isFetching: boolean;
  error: unknown;
  onRetry: () => void;
  onNewConversation: () => void;
  canCreate: boolean;
};

export function ConversationList({
  conversations,
  loggedUserId,
  activeConversationId,
  isLoading,
  isFetching,
  error,
  onRetry,
  onNewConversation,
  canCreate,
}: ConversationListProps): ReactElement {
  const renderBody = () => {
    if (isLoading) return <SkeletonList label="Chargement des conversations" />;

    if (error)
      return (
        <ErrorState error={error} onRetry={onRetry} isRetrying={isFetching} />
      );

    if (!conversations?.length) {
      return (
        <EmptyState
          title="Aucune conversation"
          description="Démarrez une conversation pour retrouver vos échanges ici."
        />
      );
    }

    return (
      <ul className={styles.list}>
        {conversations.map((conversation) => (
          <ConversationListItem
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
            <Image
              className={styles.logo}
              src={logo}
              alt=""
              priority
              sizes="80px"
            />
          </span>
          <h1 className={styles.title}>Messages</h1>
        </span>
        <button
          type="button"
          className={styles.newButton}
          onClick={onNewConversation}
          disabled={!canCreate}
        >
          <span aria-hidden="true">+</span> Nouvelle
        </button>
      </div>
      <div className={styles.scroller}>{renderBody()}</div>
    </nav>
  );
}

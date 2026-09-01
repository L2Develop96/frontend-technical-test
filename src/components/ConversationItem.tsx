import Link from 'next/link';
import type { ReactElement } from 'react';
import { formatConversationDate } from '../utils/formatDate';
import { getOtherParticipant } from '../utils/getOtherParticipant';
import type { Conversation } from '../types/conversation';
import styles from './ConversationItem.module.css';

type ConversationItemProps = {
  conversation: Conversation;
  loggedUserId: number;
  isActive: boolean;
};

export function ConversationItem({
  conversation,
  loggedUserId,
  isActive,
}: ConversationItemProps): ReactElement {
  const other = getOtherParticipant(conversation, loggedUserId);

  return (
    <li>
      <Link
        href={`/conversations/${conversation.id}`}
        className={styles.item}
        aria-current={isActive ? 'page' : undefined}
      >
        <span className={styles.avatar} aria-hidden="true">
          {other.nickname.charAt(0).toUpperCase()}
        </span>
        <span className={styles.body}>
          <span className={styles.name}>{other.nickname}</span>
          <span className={styles.date}>
            {formatConversationDate(conversation.lastMessageTimestamp)}
          </span>
        </span>
      </Link>
    </li>
  );
}

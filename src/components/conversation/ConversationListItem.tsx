import Link from 'next/link'
import type { ReactElement } from 'react'
import { Avatar } from '../ui/Avatar'
import { formatFullDate, formatRelativeDate, toIsoString } from '../../utils/formatTimestamp'
import { getOtherParticipant } from '../../utils/getOtherParticipant'
import type { Conversation } from '../../types/conversation'
import styles from './ConversationListItem.module.css'

type ConversationListItemProps = {
  conversation: Conversation
  loggedUserId: number
  isActive: boolean
}

export function ConversationListItem({
  conversation,
  loggedUserId,
  isActive,
}: ConversationListItemProps): ReactElement {
  const other = getOtherParticipant(conversation, loggedUserId)

  return (
    <li>
      <Link
        href={`/conversations/${conversation.id}`}
        className={styles.item}
        aria-current={isActive ? 'page' : undefined}
      >
        <Avatar nickname={other.nickname} />
        <span className={styles.body}>
          <span className={styles.name}>{other.nickname}</span>
          <time
            className={styles.date}
            dateTime={toIsoString(conversation.lastMessageTimestamp)}
            title={formatFullDate(conversation.lastMessageTimestamp)}
          >
            {formatRelativeDate(conversation.lastMessageTimestamp)}
          </time>
        </span>
      </Link>
    </li>
  )
}

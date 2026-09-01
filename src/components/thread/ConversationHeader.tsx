import Link from 'next/link'
import { useEffect, useRef } from 'react'
import type { ReactElement } from 'react'
import { Avatar } from '../ui/Avatar'
import { DeleteIcon } from '../ui/icons/DeleteIcon'
import { formatRelativeDate, toIsoString } from '../../utils/formatTimestamp'
import styles from './ConversationHeader.module.css'

type ConversationHeaderProps = {
  nickname: string
  lastMessageTimestamp: number
  conversationId: number
  onDelete: () => void
  canDelete: boolean
}

export function ConversationHeader({
  nickname,
  lastMessageTimestamp,
  conversationId,
  onDelete,
  canDelete,
}: ConversationHeaderProps): ReactElement {
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Move focus to the thread when switching conversations so keyboard and screen
  // reader users are not left behind in the list.
  useEffect(() => {
    headingRef.current?.focus()
  }, [conversationId])

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.back} aria-label="Retour aux conversations">
        <span aria-hidden="true">←</span>
      </Link>
      <Avatar nickname={nickname} size="small" />
      <div className={styles.body}>
        <h2 className={styles.title} tabIndex={-1} ref={headingRef}>
          {nickname} - Vous
        </h2>
        <time className={styles.subtitle} dateTime={toIsoString(lastMessageTimestamp)}>
          Dernier message {formatRelativeDate(lastMessageTimestamp)}
        </time>
      </div>
      <button
        type="button"
        className={styles.delete}
        onClick={onDelete}
        disabled={!canDelete}
        aria-label={`Supprimer la conversation avec ${nickname}`}
      >
        <DeleteIcon />
      </button>
    </header>
  )
}

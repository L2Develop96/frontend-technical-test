import { memo } from 'react'
import type { ReactElement } from 'react'
import { formatFullDate, formatTime, toIsoString } from '../../utils/formatTimestamp'
import styles from './MessageBubble.module.css'

type MessageBubbleProps = {
  body: string
  timestamp: number
  isOwn: boolean
  authorName: string
  pending?: boolean
}

function MessageBubbleComponent({
  body,
  timestamp,
  isOwn,
  authorName,
  pending,
}: MessageBubbleProps): ReactElement {
  return (
    <li className={`${styles.row} ${isOwn ? styles.own : styles.other}`}>
      {isOwn ? null : <span className={styles.author}>{authorName}</span>}
      <div className={`${styles.bubble} ${pending ? styles.pending : ''}`}>{body}</div>
      <time
        className={styles.meta}
        dateTime={toIsoString(timestamp)}
        title={formatFullDate(timestamp)}
      >
        {pending ? 'Envoi…' : formatTime(timestamp)}
      </time>
    </li>
  )
}

// The list re-renders on every optimistic insert; bubbles themselves never change.
export const MessageBubble = memo(MessageBubbleComponent)

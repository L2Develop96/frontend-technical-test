import type { ReactElement } from 'react';
import { formatMessageTime } from '../utils/formatDate';
import styles from './MessageBubble.module.css';

type MessageBubbleProps = {
  body: string;
  timestamp: number;
  isOwn: boolean;
  authorName: string;
};

export function MessageBubble({
  body,
  timestamp,
  isOwn,
  authorName,
}: MessageBubbleProps): ReactElement {
  return (
    <li className={`${styles.row} ${isOwn ? styles.own : styles.other}`}>
      {isOwn ? null : <span className={styles.author}>{authorName}</span>}
      <div className={styles.bubble}>{body}</div>
      <span className={styles.time}>{formatMessageTime(timestamp)}</span>
    </li>
  );
}

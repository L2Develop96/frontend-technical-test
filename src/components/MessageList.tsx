import { useEffect, useRef } from 'react';
import type { ReactElement } from 'react';
import { MessageBubble } from './MessageBubble';
import type { Message } from '../types/message';
import styles from './ConversationView.module.css';

type MessageListProps = {
  messages: Message[];
  loggedUserId: number;
  otherNickname: string;
};

export function MessageList({
  messages,
  loggedUserId,
  otherNickname,
}: MessageListProps): ReactElement {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
  }, [messages.length]);

  return (
    <div className={styles.scroller} ref={scrollerRef}>
      {messages.length === 0 ? (
        <p className={styles.status}>Aucun message.</p>
      ) : (
        <ol className={styles.messages}>
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              body={message.body}
              timestamp={message.timestamp}
              isOwn={message.authorId === loggedUserId}
              authorName={otherNickname}
            />
          ))}
        </ol>
      )}
    </div>
  );
}

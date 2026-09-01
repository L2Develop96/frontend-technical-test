import { useEffect, useLayoutEffect, useRef } from 'react'
import type { ReactElement } from 'react'
import { MessageBubble } from './MessageBubble'
import { EmptyState } from '../ui/EmptyState'
import type { OptimisticMessage } from '../../hooks/useSendMessage'
import styles from './MessageList.module.css'

type MessageListProps = {
  messages: OptimisticMessage[]
  loggedUserId: number
  otherNickname: string
}

const NEAR_BOTTOM_THRESHOLD = 100

export function MessageList({
  messages,
  loggedUserId,
  otherNickname,
}: MessageListProps): ReactElement {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)

  useLayoutEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller || !isFirstRender.current) return

    scroller.scrollTop = scroller.scrollHeight
    isFirstRender.current = false
  }, [messages.length])

  // Only follow new messages when the reader is already at the bottom, so
  // scrolling back through history is never interrupted.
  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller || isFirstRender.current) return

    const distanceFromBottom =
      scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight

    if (distanceFromBottom <= NEAR_BOTTOM_THRESHOLD) {
      scroller.scrollTo({ top: scroller.scrollHeight, behavior: 'smooth' })
    }
  }, [messages.length])

  return (
    <div className={styles.scroller} ref={scrollerRef}>
      {messages.length === 0 ? (
        <EmptyState
          icon="👋"
          title="Aucun message"
          description="Envoyez le premier message de cette conversation."
        />
      ) : (
        <ol className={styles.list} role="log" aria-live="polite" aria-relevant="additions">
          {messages.map(message => (
            <MessageBubble
              key={message.id}
              body={message.body}
              timestamp={message.timestamp}
              isOwn={message.authorId === loggedUserId}
              authorName={otherNickname}
              pending={message.pending}
            />
          ))}
        </ol>
      )}
    </div>
  )
}

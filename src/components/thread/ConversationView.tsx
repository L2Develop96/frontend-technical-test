import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import { ConversationHeader } from './ConversationHeader'
import { MessageComposer } from './MessageComposer'
import { MessageList } from './MessageList'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { ErrorState } from '../ui/ErrorState'
import { SkeletonList } from '../ui/Skeleton'
import { useMessages } from '../../hooks/useMessages'
import { useSendMessage } from '../../hooks/useSendMessage'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { getOtherParticipant } from '../../utils/getOtherParticipant'
import type { Conversation } from '../../types/conversation'
import styles from './ConversationView.module.css'

type ConversationViewProps = {
  conversation: Conversation
  loggedUserId: number
  onDelete: (conversationId: number) => void
  isDeleting: boolean
}

export function ConversationView({
  conversation,
  loggedUserId,
  onDelete,
  isDeleting,
}: ConversationViewProps): ReactElement {
  const isOnline = useOnlineStatus()
  const other = getOtherParticipant(conversation, loggedUserId)
  const { data: messages, isLoading, isFetching, error, refetch } = useMessages(conversation.id)
  const sendMessage = useSendMessage(conversation.id)
  const [showFailure, setShowFailure] = useState(false)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

  useEffect(() => {
    setShowFailure(false)
    setIsConfirmingDelete(false)
  }, [conversation.id])

  const handleDelete = () => {
    setIsConfirmingDelete(false)
    onDelete(conversation.id)
  }

  const handleSend = (body: string) => {
    setShowFailure(false)
    sendMessage.mutate(
      { body, authorId: loggedUserId },
      { onError: () => setShowFailure(true) }
    )
  }

  const renderBody = () => {
    if (isLoading) {
      return (
        <div className={styles.loading}>
          <SkeletonList rows={4} label="Chargement des messages" />
        </div>
      )
    }

    if (error) {
      return <ErrorState error={error} onRetry={() => refetch()} isRetrying={isFetching} />
    }

    return (
      <MessageList
        messages={messages ?? []}
        loggedUserId={loggedUserId}
        otherNickname={other.nickname}
      />
    )
  }

  return (
    <section className={styles.view} aria-label={`Conversation avec ${other.nickname}`}>
      <ConversationHeader
        nickname={other.nickname}
        lastMessageTimestamp={conversation.lastMessageTimestamp}
        conversationId={conversation.id}
        onDelete={() => setIsConfirmingDelete(true)}
        canDelete={isOnline && !isDeleting}
      />
      {renderBody()}
      <MessageComposer
        conversationId={conversation.id}
        onSend={handleSend}
        isSending={sendMessage.isPending}
        hasFailed={showFailure}
        onDismissFailure={() => setShowFailure(false)}
        disabled={!isOnline || Boolean(error)}
        disabledReason={
          isOnline ? 'Messages indisponibles' : 'Hors ligne — envoi impossible'
        }
      />

      {isConfirmingDelete ? (
        <ConfirmDialog
          title="Supprimer cette conversation ?"
          description={`La conversation avec ${other.nickname} et tous ses messages seront définitivement supprimés. Cette action est irréversible.`}
          confirmLabel="Supprimer"
          isConfirming={isDeleting}
          onConfirm={handleDelete}
          onClose={() => setIsConfirmingDelete(false)}
        />
      ) : null}

    </section>
  )
}

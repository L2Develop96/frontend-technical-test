import { useEffect, useRef } from 'react'
import type { ReactElement } from 'react'
import { Avatar } from '../ui/Avatar'
import { SkeletonList } from '../ui/Skeleton'
import { useUsers } from '../../hooks/useUsers'
import type { Conversation } from '../../types/conversation'
import type { User } from '../../types/user'
import styles from './NewConversationModal.module.css'

type NewConversationModalProps = {
  loggedUserId: number
  conversations: Conversation[]
  onClose: () => void
  onSelect: (user: User) => void
  isCreating: boolean
}

export function NewConversationModal({
  loggedUserId,
  conversations,
  onClose,
  onSelect,
  isCreating,
}: NewConversationModalProps): ReactElement {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { data: users, isLoading, error } = useUsers()

  // showModal gives the focus trap, Escape handling and inert background.
  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  const existingPartnerIds = new Set(
    conversations.map(conversation =>
      conversation.senderId === loggedUserId
        ? conversation.recipientId
        : conversation.senderId
    )
  )

  const candidates = (users ?? []).filter(
    user => user.id !== loggedUserId && !existingPartnerIds.has(user.id)
  )

  const renderBody = () => {
    if (isLoading) return <SkeletonList rows={3} label="Chargement des contacts" />

    if (error) {
      return (
        <p className={styles.error}>
          Impossible de charger les contacts. Fermez et réessayez.
        </p>
      )
    }

    if (candidates.length === 0) {
      return (
        <p className={styles.empty}>
          Vous avez déjà une conversation avec tout le monde.
        </p>
      )
    }

    return (
      <ul className={styles.list}>
        {candidates.map(user => (
          <li key={user.id}>
            <button
              type="button"
              className={styles.option}
              onClick={() => onSelect(user)}
              disabled={isCreating}
            >
              <Avatar nickname={user.nickname} size="small" />
              {user.nickname}
            </button>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClose={onClose}
      onCancel={onClose}
      aria-labelledby="new-conversation-title"
    >
      <div className={styles.header}>
        <h2 className={styles.title} id="new-conversation-title">
          Nouvelle conversation
        </h2>
        <button
          type="button"
          className={styles.close}
          onClick={() => dialogRef.current?.close()}
          aria-label="Fermer"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
      <div className={styles.body}>{renderBody()}</div>
    </dialog>
  )
}

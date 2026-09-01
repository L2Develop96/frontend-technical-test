import { useEffect, useRef } from 'react';
import type { MouseEvent, ReactElement } from 'react';
import { useUsers } from '../api/queries';
import type { Conversation } from '../types/conversation';
import type { User } from '../types/user';
import styles from './NewConversationModal.module.css';

type NewConversationModalProps = {
  loggedUserId: number;
  conversations: Conversation[];
  onClose: () => void;
  onSelect: (user: User) => void;
};

export function NewConversationModal({
  loggedUserId,
  conversations,
  onClose,
  onSelect,
}: NewConversationModalProps): ReactElement {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { data: users, isLoading, isError } = useUsers();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const existingPartnerIds = new Set(
    conversations.map((conversation) =>
      conversation.senderId === loggedUserId
        ? conversation.recipientId
        : conversation.senderId,
    ),
  );

  const candidates = (users ?? []).filter(
    (user) => user.id !== loggedUserId && !existingPartnerIds.has(user.id),
  );

  const renderBody = () => {
    if (isLoading) return <p className={styles.status}>Chargement…</p>;
    if (isError) return <p className={styles.status}>Une erreur est survenue.</p>;
    if (candidates.length === 0) {
      return <p className={styles.status}>Aucun nouveau contact disponible.</p>;
    }

    return (
      <ul className={styles.list}>
        {candidates.map((user) => (
          <li key={user.id}>
            <button type="button" className={styles.option} onClick={() => onSelect(user)}>
              {user.nickname}
            </button>
          </li>
        ))}
      </ul>
    );
  };

  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) dialogRef.current?.close();
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClose={onClose}
      onCancel={onClose}
      onClick={handleBackdropClick}
    >
      <div className={styles.header}>
        <h2 className={styles.title}>Nouvelle conversation</h2>
        <button
          type="button"
          className={styles.close}
          onClick={() => dialogRef.current?.close()}
          aria-label="Fermer"
        >
          ×
        </button>
      </div>
      {renderBody()}
    </dialog>
  );
}

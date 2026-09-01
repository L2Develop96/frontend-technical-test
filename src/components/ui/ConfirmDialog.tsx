import { useEffect, useRef } from 'react';
import type { ReactElement } from 'react';
import styles from './ConfirmDialog.module.css';

type ConfirmDialogProps = {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  cancelLabel = 'Annuler',
  isConfirming = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps): ReactElement {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // showModal gives the focus trap, Escape handling and inert background.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClose={onClose}
      onCancel={onClose}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <h2 className={styles.title} id="confirm-dialog-title">
        {title}
      </h2>
      <p className={styles.description} id="confirm-dialog-description">
        {description}
      </p>
      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.button} ${styles.cancel}`}
          onClick={() => dialogRef.current?.close()}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          className={`${styles.button} ${styles.confirm}`}
          onClick={onConfirm}
          disabled={isConfirming}
        >
          {isConfirming ? 'Suppression…' : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}

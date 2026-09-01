import { useState } from 'react';
import type { FormEvent, KeyboardEvent, ReactElement } from 'react';
import styles from './MessageComposer.module.css';

type MessageComposerProps = {
  onSend: (body: string) => void;
  isSending: boolean;
};

export function MessageComposer({ onSend, isSending }: MessageComposerProps): ReactElement {
  const [value, setValue] = useState('');

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || isSending) return;

    onSend(trimmed);
    setValue('');
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    submit();
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <textarea
        className={styles.input}
        rows={1}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Écrivez un message…"
        aria-label="Votre message"
      />
      <button type="submit" className={styles.send} disabled={!value.trim() || isSending}>
        ➤
      </button>
    </form>
  );
}

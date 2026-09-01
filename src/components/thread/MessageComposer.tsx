import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent, ReactElement } from 'react'
import { MAX_MESSAGE_LENGTH, validateMessageBody } from '../../utils/validateMessageBody'
import styles from './MessageComposer.module.css'

type MessageComposerProps = {
  onSend: (body: string) => void
  isSending: boolean
  hasFailed: boolean
  onDismissFailure: () => void
  disabled?: boolean
  disabledReason?: string
  conversationId: number
}

export function MessageComposer({
  onSend,
  isSending,
  hasFailed,
  onDismissFailure,
  disabled = false,
  disabledReason,
  conversationId,
}: MessageComposerProps): ReactElement {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const validation = validateMessageBody(value)
  const isOverLimit = validation.valid === false && validation.reason === 'too-long'
  const canSend = validation.valid && !isSending && !disabled

  useEffect(() => {
    setValue('')
  }, [conversationId])

  useLayoutEffect(() => {
    const input = inputRef.current
    if (!input) return

    input.style.height = 'auto'
    input.style.height = `${input.scrollHeight}px`
  }, [value])

  const submit = () => {
    if (!validation.valid || isSending || disabled) return

    onSend(validation.value)
    setValue('')
    inputRef.current?.focus()
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    submit()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // isComposing guards IME input, where Enter commits a candidate rather than
    // ending the message.
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return

    event.preventDefault()
    submit()
  }

  return (
    <div className={styles.wrapper}>
      {hasFailed ? (
        <div className={styles.failure} role="status">
          <span>Le message n’a pas pu être envoyé.</span>
          <button type="button" className={styles.retry} onClick={onDismissFailure}>
            Masquer
          </button>
        </div>
      ) : null}

      <form className={styles.form} onSubmit={handleSubmit}>
        <label htmlFor="message-input" className="sr-only" hidden>
          Votre message
        </label>
        <textarea
          id="message-input"
          ref={inputRef}
          className={styles.input}
          rows={1}
          value={value}
          onChange={event => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? disabledReason : 'Écrivez un message…'}
          aria-label="Votre message"
          aria-describedby={isOverLimit ? 'message-counter' : undefined}
          aria-invalid={isOverLimit || undefined}
          disabled={disabled}
        />
        <button
          type="submit"
          className={styles.send}
          disabled={!canSend}
          aria-label="Envoyer le message"
        >
          <span aria-hidden="true">➤</span>
        </button>
      </form>

      {value.length > MAX_MESSAGE_LENGTH * 0.8 ? (
        <p
          id="message-counter"
          className={`${styles.counter} ${isOverLimit ? styles.counterOver : ''}`}
        >
          {value.length} / {MAX_MESSAGE_LENGTH}
        </p>
      ) : null}
    </div>
  )
}

import type { ReactElement } from 'react'
import styles from './OfflineBanner.module.css'

export function OfflineBanner(): ReactElement {
  return (
    <div className={styles.banner} role="status" aria-live="polite">
      <span className={styles.dot} aria-hidden="true" />
      Vous êtes hors ligne. Les messages ne peuvent pas être envoyés.
    </div>
  )
}

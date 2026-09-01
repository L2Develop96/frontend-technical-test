import type { ReactElement } from 'react'
import styles from './ProgressBar.module.css'

type ProgressBarProps = {
  label: string
}

// Indeterminate by design: the request duration is unknown, so no value is
// reported rather than showing a percentage that would be invented.
export function ProgressBar({ label }: ProgressBarProps): ReactElement {
  return (
    <div className={styles.track} role="progressbar" aria-label={label}>
      <div className={styles.fill} />
    </div>
  )
}

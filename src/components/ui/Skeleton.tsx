import type { ReactElement } from 'react'
import styles from './Skeleton.module.css'

type SkeletonListProps = {
  rows?: number
  label?: string
}

export function SkeletonList({
  rows = 5,
  label = 'Chargement…',
}: SkeletonListProps): ReactElement {
  return (
    <div role="status" aria-label={label}>
      {Array.from({ length: rows }, (_, index) => (
        <div className={styles.row} key={index}>
          <div className={styles.circle} />
          <div className={styles.lines}>
            <div className={styles.line} />
            <div className={`${styles.line} ${styles.short}`} />
          </div>
        </div>
      ))}
    </div>
  )
}

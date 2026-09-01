import type { ReactElement, ReactNode } from 'react'
import styles from './States.module.css'

type EmptyStateProps = {
  icon?: string
  title: string
  description?: string
  children?: ReactNode
}

export function EmptyState({
  icon = '💬',
  title,
  description,
  children,
}: EmptyStateProps): ReactElement {
  return (
    <div className={styles.state}>
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
      <p className={styles.title}>{title}</p>
      {description ? <p className={styles.description}>{description}</p> : null}
      {children}
    </div>
  )
}

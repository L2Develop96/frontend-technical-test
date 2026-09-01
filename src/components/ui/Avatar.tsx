import type { ReactElement } from 'react'
import { avatarColor, avatarInitial } from '../../utils/avatarColor'
import styles from './Avatar.module.css'

type AvatarProps = {
  nickname: string
  size?: 'default' | 'small'
}

export function Avatar({ nickname, size = 'default' }: AvatarProps): ReactElement {
  return (
    <span
      className={`${styles.avatar} ${size === 'small' ? styles.small : ''}`}
      style={{ background: avatarColor(nickname) }}
      aria-hidden="true"
    >
      {avatarInitial(nickname)}
    </span>
  )
}

import type { ReactElement, ReactNode } from 'react';
import styles from './AppShell.module.css';

type AppShellProps = {
  variant: 'list' | 'detail';
  list: ReactNode;
  detail: ReactNode;
};

export function AppShell({ variant, list, detail }: AppShellProps): ReactElement {
  return (
    <div className={styles.shell} data-variant={variant}>
      <div className={`${styles.pane} ${styles.list}`}>{list}</div>
      <div className={`${styles.pane} ${styles.detail}`}>{detail}</div>
    </div>
  );
}

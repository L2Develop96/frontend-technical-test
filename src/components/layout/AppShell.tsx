import type { ReactElement, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { OfflineBanner } from '../ui/OfflineBanner';
import { SplashScreen } from '../ui/SplashScreen';
import styles from './AppShell.module.css';

type AppShellProps = {
  variant: 'list' | 'detail';
  list: ReactNode;
  detail: ReactNode;
  isInitialLoading?: boolean;
  deleteError?: boolean;
  onDismissDeleteError?: () => void;
};

// Survives route changes so the splash is a first-launch moment, not something
// that reappears every time the conversation list is revisited.
let hasCompletedFirstLoad = false;

const SPLASH_FADE_MS = 240;

export function AppShell({
  variant,
  list,
  detail,
  isInitialLoading = false,
  deleteError = false,
  onDismissDeleteError,
}: AppShellProps): ReactElement {
  const isOnline = useOnlineStatus();
  // Shown from the very first render: on mount the query has not started yet,
  // so isInitialLoading is still false and reading it here would latch the
  // splash off before loading ever begins. A CSS delay keeps it invisible when
  // the response is fast.
  const [showSplash, setShowSplash] = useState(() => !hasCompletedFirstLoad);
  const [isLeaving, setIsLeaving] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!showSplash || isInitialLoading) return;

    hasCompletedFirstLoad = true;
    setIsLeaving(true);
    timeoutRef.current = setTimeout(() => setShowSplash(false), SPLASH_FADE_MS);
  }, [isInitialLoading, showSplash]);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return (
    <div className={styles.root} data-variant={variant}>
      {showSplash ? <SplashScreen leaving={isLeaving} /> : null}
      <a className={styles.skipLink} href="#main-content">
        Aller au contenu principal
      </a>
      {isOnline ? null : <OfflineBanner />}
      {deleteError ? (
        <div className={styles.deleteError} role="alert">
          <span>La conversation n’a pas pu être supprimée.</span>
          <button
            type="button"
            className={styles.dismiss}
            onClick={onDismissDeleteError}
          >
            Masquer
          </button>
        </div>
      ) : null}
      <div className={styles.shell}>
        <div className={`${styles.pane} ${styles.list}`}>{list}</div>
        <div className={`${styles.pane} ${styles.detail}`}>{detail}</div>
      </div>
    </div>
  );
}

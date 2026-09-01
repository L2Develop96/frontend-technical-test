import Image from 'next/image';
import type { ReactElement } from 'react';
import logo from '../../assets/images/logo-messages.png';
import { ProgressBar } from './ProgressBar';
import styles from './SplashScreen.module.css';

type SplashScreenProps = {
  leaving?: boolean;
};

export function SplashScreen({
  leaving = false,
}: SplashScreenProps): ReactElement {
  return (
    <div className={styles.screen} data-leaving={leaving}>
      <div className={styles.inner}>
        <Image
          className={styles.logo}
          src={logo}
          alt="Leboncoin Messages"
          priority
          sizes="240px"
        />
        <div className={styles.bar}>
          <ProgressBar label="Chargement de vos conversations" />
        </div>
        <p className={styles.message} role="status" aria-live="polite">
          Chargement de vos conversations…
        </p>
      </div>
    </div>
  );
}

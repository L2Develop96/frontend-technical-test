import type { ReactElement } from 'react'
import { ApiError } from '../../lib/api/client'
import styles from './States.module.css'

type ErrorStateProps = {
  error: unknown
  onRetry?: () => void
  isRetrying?: boolean
}

function describe(error: unknown): { title: string; description: string } {
  if (error instanceof ApiError) {
    switch (error.kind) {
      case 'timeout':
        return {
          title: 'Le serveur met trop de temps à répondre',
          description:
            'La connexion a expiré avant de recevoir une réponse. Vous pouvez réessayer.',
        }
      case 'network':
        return {
          title: 'Impossible de joindre le serveur',
          description:
            "Le serveur de messagerie semble indisponible. Ce n'est pas vous, c'est nous.",
        }
      case 'shape':
      case 'parse':
        return {
          title: 'Réponse inattendue du serveur',
          description:
            'Les données reçues sont invalides. Réessayez dans quelques instants.',
        }
      default:
        if (error.status === 404) {
          return {
            title: 'Introuvable',
            description: "Cette ressource n'existe pas ou a été supprimée.",
          }
        }
        return {
          title: 'Le serveur a rencontré un problème',
          description: `La requête a échoué (erreur ${error.status}). Réessayez dans quelques instants.`,
        }
    }
  }

  return {
    title: 'Une erreur est survenue',
    description: 'Quelque chose ne s’est pas passé comme prévu. Réessayez.',
  }
}

export function ErrorState({ error, onRetry, isRetrying }: ErrorStateProps): ReactElement {
  const { title, description } = describe(error)

  return (
    <div className={styles.state} role="alert">
      <span className={`${styles.icon} ${styles.iconError}`} aria-hidden="true">
        ⚠️
      </span>
      <p className={styles.title}>{title}</p>
      <p className={styles.description}>{description}</p>
      {onRetry ? (
        <button type="button" className={styles.action} onClick={onRetry} disabled={isRetrying}>
          {isRetrying ? 'Nouvelle tentative…' : 'Réessayer'}
        </button>
      ) : null}
    </div>
  )
}

import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import styles from '../ui/States.module.css'

type ErrorBoundaryProps = {
  children: ReactNode
  onReset?: () => void
}

type ErrorBoundaryState = {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled rendering error', error, info)
  }

  handleReset = () => {
    this.props.onReset?.()
    this.setState({ hasError: false })
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className={styles.state} role="alert">
        <span className={`${styles.icon} ${styles.iconError}`} aria-hidden="true">
          😵
        </span>
        <p className={styles.title}>Cette page a rencontré un problème</p>
        <p className={styles.description}>
          Une erreur inattendue est survenue. Vous pouvez recharger l’interface sans
          perdre vos conversations.
        </p>
        <button type="button" className={styles.action} onClick={this.handleReset}>
          Recharger l’interface
        </button>
      </div>
    )
  }
}

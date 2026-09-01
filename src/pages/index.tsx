import type { ReactElement } from 'react'
import { MessagingScreen } from '../components/layout/MessagingScreen'
import { EmptyState } from '../components/ui/EmptyState'

export default function Home(): ReactElement {
  return (
    <MessagingScreen
      activeConversationId={null}
      renderDetail={() => (
        <EmptyState
          title="Sélectionnez une conversation"
          description="Choisissez une conversation dans la liste pour afficher les messages."
        />
      )}
    />
  )
}

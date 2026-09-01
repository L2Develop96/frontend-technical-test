import Link from 'next/link'
import { useRouter } from 'next/router'
import type { ReactElement } from 'react'
import { MessagingScreen } from '../../components/layout/MessagingScreen'
import { ConversationView } from '../../components/thread/ConversationView'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { SkeletonList } from '../../components/ui/Skeleton'
import { getLoggedUserId } from '../../utils/getLoggedUserId'

export default function ConversationPage(): ReactElement {
  const router = useRouter()
  const loggedUserId = getLoggedUserId()

  const rawId = router.query.id
  const parsedId = Number(Array.isArray(rawId) ? rawId[0] : rawId)
  const conversationId = Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null

  return (
    <MessagingScreen
      activeConversationId={conversationId}
      renderDetail={({
        conversations,
        isLoading,
        error,
        onDeleteConversation,
        isDeletingConversation,
      }) => {
        if (!router.isReady || isLoading) {
          return <SkeletonList rows={4} label="Chargement de la conversation" />
        }

        if (error) return <ErrorState error={error} />

        const conversation = conversations.find(item => item.id === conversationId)

        if (!conversation) {
          return (
            <EmptyState
              icon="🔍"
              title="Conversation introuvable"
              description="Cette conversation n’existe pas ou ne vous appartient pas."
            >
              <Link href="/">Retour aux conversations</Link>
            </EmptyState>
          )
        }

        return (
          <ConversationView
            conversation={conversation}
            loggedUserId={loggedUserId}
            onDelete={onDeleteConversation}
            isDeleting={isDeletingConversation}
          />
        )
      }}
    />
  )
}

import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import { ConversationView } from '../../components/ConversationView';
import { MessagingScreen } from '../../components/MessagingScreen';
import { getLoggedUserId } from '../../utils/getLoggedUserId';

export default function ConversationPage(): ReactElement {
  const router = useRouter();
  const loggedUserId = getLoggedUserId();

  const rawId = router.query.id;
  const parsedId = Number(Array.isArray(rawId) ? rawId[0] : rawId);
  const conversationId = Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;

  return (
    <MessagingScreen
      activeConversationId={conversationId}
      renderDetail={({ conversations }) => {
        const conversation = conversations.find((item) => item.id === conversationId);

        if (!conversation) {
          return <p style={{ padding: '2rem', textAlign: 'center' }}>Conversation introuvable.</p>;
        }

        return <ConversationView conversation={conversation} loggedUserId={loggedUserId} />;
      }}
    />
  );
}

import type { ReactElement } from 'react';
import { MessagingScreen } from '../components/MessagingScreen';

export default function Home(): ReactElement {
  return (
    <MessagingScreen
      activeConversationId={null}
      renderDetail={() => <p style={{ padding: '2rem', textAlign: 'center' }}>Sélectionnez une conversation</p>}
    />
  );
}

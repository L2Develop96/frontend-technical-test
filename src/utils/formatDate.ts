const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('fr-FR', {
  hour: '2-digit',
  minute: '2-digit',
});

export function formatConversationDate(seconds: number): string {
  return dateFormatter.format(new Date(seconds * 1000));
}

export function formatMessageTime(seconds: number): string {
  return timeFormatter.format(new Date(seconds * 1000));
}

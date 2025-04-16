export function getFormattedTimestampToDate(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('it-IT', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function getCurrentTimestampMySQL(): string {
  const now = new Date();
  return now.toISOString().slice(0, 19).replace('T', ' ');
}
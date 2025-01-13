/**
 * Format a date into a human-readable string
 * @param date The date to format
 * @returns A formatted string like "Jan 1, 2024" or "5 minutes ago"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  // For timestamps less than 24 hours ago, show relative time
  if (diff < 24 * 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    if (minutes < 1) return 'just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  }
  
  // For older timestamps, show the date
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
} 
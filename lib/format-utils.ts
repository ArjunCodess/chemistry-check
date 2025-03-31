/**
 * Format a number of bytes into a human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

/**
 * Format a number as a percentage
 */
export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
}

/**
 * Format a duration in minutes to a readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 1) return 'less than a minute';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
}

/**
 * Decode Unicode escape sequences in Instagram content
 */
export function decodeInstagramEmojis(text: string): string {
  try {
    return decodeURIComponent(escape(text));
  } catch {
    // If there's an error, return original text
    return text;
  }
}
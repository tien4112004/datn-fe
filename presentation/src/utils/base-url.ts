/**
 * Get the dynamic base URL for the application
 * This function determines the base URL at runtime instead of build time
 */
export function getBaseUrl(): string {
  // In development, use the hardcoded localhost
  if (import.meta.env.DEV) {
    return 'http://localhost:5174';
  }

  // In production/preview, use the current origin
  const { protocol, host } = window.location;
  return `${protocol}//${host}`;
}

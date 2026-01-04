/**
 * Get the dynamic base URL for the application
 * This function determines the base URL at runtime instead of build time
 */
export function getBaseUrl(): string {
  // Use the current origin for both development and production
  const { protocol, host } = window.location;
  return `${protocol}//${host}`;
}

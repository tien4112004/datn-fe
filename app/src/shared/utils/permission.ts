/**
 * Permission levels for documents (mindmaps and presentations)
 * - read: View-only access
 * - comment: View and comment access
 * - edit: Full edit access (includes read and comment)
 */
export type Permission = 'read' | 'comment' | 'edit';

/**
 * Parses the permission header from backend API response
 *
 * Backend format: "comment, edit, read" (comma-separated, alphabetically sorted)
 * Returns the highest permission level available to the user
 *
 * Permission hierarchy: edit > comment > read
 *
 * @param headerValue - The permission header value from response.headers
 * @returns The highest permission level, or undefined if no permission
 */
export function parsePermissionHeader(headerValue: string | null | undefined): Permission | undefined {
  if (!headerValue) return undefined;

  // Split and normalize permissions
  const permissions = headerValue
    .toLowerCase()
    .split(',')
    .map((p) => p.trim());

  // Return highest permission level (edit > comment > read)
  if (permissions.includes('edit')) return 'edit';
  if (permissions.includes('comment')) return 'comment';
  if (permissions.includes('read')) return 'read';

  return undefined;
}

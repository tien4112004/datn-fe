import { useState, useEffect } from 'react';
import { api } from '@aiprimary/api';

/**
 * @deprecated This hook makes a separate API call to fetch permissions.
 * Use the permission field from the document data instead:
 *
 * Example (Mindmap):
 *   const { data: mindmap } = useMindmapById(id);
 *   const permission = mindmap?.permission;
 *
 * Example (Presentation):
 *   const { data: presentation } = usePresentationById(id);
 *   const permission = presentation?.permission;
 *
 * This hook will be removed in a future version once all usages are migrated.
 */
export function useDocumentPermission(documentId: string | undefined) {
  const [permission, setPermission] = useState<'read' | 'comment' | 'edit' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!documentId) {
      setIsLoading(false);
      return;
    }

    async function fetchPermission() {
      try {
        setIsLoading(true);
        const response = await api.get(`/api/resources/${documentId}/permissions`);

        // Backend returns: { data: { permissions: ['read', 'comment', 'edit'] } }
        const perms = response.data.data.permissions;

        // Determine highest permission level
        if (perms.includes('edit')) {
          setPermission('edit');
        } else if (perms.includes('comment')) {
          setPermission('comment');
        } else if (perms.includes('read')) {
          setPermission('read');
        } else {
          setPermission(null);
        }
      } catch (err) {
        setError(err as Error);
        setPermission(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPermission();
  }, [documentId]);

  return { permission, isLoading, error };
}

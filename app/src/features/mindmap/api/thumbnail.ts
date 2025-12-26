import { api } from '@aiprimary/api';
import type { ApiResponse } from '@aiprimary/api';
import { getBackendUrl } from '@aiprimary/api';

const BASE_URL = getBackendUrl();

export interface ThumbnailUploadResponse {
  thumbnailUrl: string;
}

/**
 * Upload a base64 thumbnail to the server and get back a CDN URL
 *
 * @param entityType - "presentation" or "mindmap"
 * @param entityId - ID of the presentation/mindmap
 * @param base64Data - Base64 encoded PNG image data URL
 * @returns CDN URL of the uploaded thumbnail
 */
export const uploadThumbnail = async (
  entityType: 'presentation' | 'mindmap',
  entityId: string,
  base64Data: string
): Promise<string> => {
  const response = await api.post<ApiResponse<ThumbnailUploadResponse>>(
    `${BASE_URL}/api/thumbnails/${entityType}/${entityId}`,
    { base64Data }
  );
  return response.data.data.thumbnailUrl;
};

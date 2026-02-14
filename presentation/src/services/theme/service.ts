/**
 * Theme description service
 * Generates theme descriptions from color values for AI image generation
 */

import type { ApiClient, ApiResponse } from '@aiprimary/api';
import type { ThemeDescriptionRequest, ThemeDescriptionResponse } from './types';

export interface IThemeApi {
  /**
   * Generate theme description from color values
   * Called when user changes theme colors in Editor before generating images
   *
   * @param request Colors to generate description for
   * @returns Generated description string
   */
  generateThemeDescription(request: ThemeDescriptionRequest): Promise<string>;
}

/**
 * Theme service implementation
 * Handles API calls for theme description generation
 */
export class ThemeService implements IThemeApi {
  constructor(
    private apiClient: ApiClient,
    private backendUrl: string
  ) {}

  /**
   * Generate theme description from explicit color values
   *
   * @param request Theme colors (primary, background, text)
   * @returns Fresh theme description string
   * @throws Error if API call fails
   *
   * @example
   * ```ts
   * const themeApi = getThemeApi();
   * const description = await themeApi.generateThemeDescription({
   *   primaryColor: '#1e40af',
   *   backgroundColor: '#ffffff',
   *   textColor: '#000000'
   * });
   * // Returns: "soft airy cobalt wash, white backdrop, black accents"
   * ```
   */
  async generateThemeDescription(request: ThemeDescriptionRequest): Promise<string> {
    try {
      const response = await this.apiClient.post<ApiResponse<ThemeDescriptionResponse>>(
        `${this.backendUrl}/api/themes/generate-description`,
        request
      );

      if (response.data?.data?.description) {
        return response.data.data.description;
      }

      console.warn('[ThemeService] No description in response:', response.data);
      throw new Error('No description in API response');
    } catch (error) {
      console.error('[ThemeService] Failed to generate theme description:', error);
      throw error;
    }
  }
}

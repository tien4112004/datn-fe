import { api, getBackendUrl } from '@aiprimary/api';
import type { ApiResponse } from '@aiprimary/api';
import type { AIModificationRequest, AIModificationResponse } from '@/types/aiModification';
import { mockAIModificationService } from './mockModifications';

const BASE_URL = getBackendUrl();

// Set to false to use real backend API instead of mocks
const USE_MOCK = false;

/**
 * AI Modification Service
 * Handles requests for content refinement, layout changes, and other AI-driven modifications.
 */
export const aiModificationService = {
  /**
   * Process an AI modification request
   * @param request The modification request
   * @returns Promise resolving to the modification response
   */
  async processModification(request: AIModificationRequest): Promise<AIModificationResponse> {
    console.log(`[AI] processModification → ${request.action}`, { payload: request });
    if (USE_MOCK) return mockAIModificationService.processModification(request);
    try {
      let endpoint = '';
      let payload = {};

      // Map action to endpoint and payload
      switch (request.action) {
        case 'refine-content':
          endpoint = '/api/ai/refine-content';
          payload = {
            schema: request.context.slideSchema,
            instruction: request.parameters.instruction,
            context: {
              slideId: request.context.slideId,
              slideType: request.context.slideType,
            },
          };
          break;

        case 'transform-layout':
          endpoint = '/api/ai/transform-layout';
          payload = {
            currentSchema: request.context.slideSchema,
            targetType: request.parameters.targetType,
          };
          break;

        case 'expand-slide':
          endpoint = '/api/ai/expand-slide';
          payload = {
            currentSchema: request.context.slideSchema,
            count: request.parameters.count,
          };
          break;

        default:
          throw new Error(`Unsupported action: ${request.action}`);
      }

      // Make the API call
      const response = await api.post<ApiResponse<any>>(`${BASE_URL}${endpoint}`, payload);

      if (response.data && response.data.success !== false) {
        return {
          success: true,
          data: response.data.data,
        };
      } else {
        return {
          success: false,
          data: {},
          error: response.data.message || 'Unknown error',
        };
      }
    } catch (err: any) {
      console.error('AI modification error:', err);
      return {
        success: false,
        data: {},
        error: err.response?.data?.message || err.message || 'Network error',
      };
    }
  },

  /**
   * Refine text content of a specific text element
   */
  async refineElementText(request: {
    slideId: string;
    elementId: string;
    currentText: string;
    instruction: string;
    slideSchema?: unknown;
    slideType?: string;
  }): Promise<AIModificationResponse> {
    console.log('[AI] refineElementText', { payload: request });
    if (USE_MOCK) return mockAIModificationService.refineElementText(request);
    try {
      const response = await api.post<ApiResponse<any>>(`${BASE_URL}/api/ai/refine-element-text`, request);

      if (response.data && response.data.success !== false) {
        return {
          success: true,
          data: response.data.data,
        };
      } else {
        return {
          success: false,
          data: {},
          error: response.data.message || 'Failed to refine text',
        };
      }
    } catch (err: any) {
      console.error('Text refinement error:', err);
      return {
        success: false,
        data: {},
        error: err.response?.data?.message || err.message || 'Network error',
      };
    }
  },

  /**
   * Replace image of a specific image element
   */
  async replaceElementImage(request: {
    slideId: string;
    elementId: string;
    description: string;
    style: string;
    matchSlideTheme?: boolean;
    slideSchema?: unknown;
    slideType?: string;
  }): Promise<AIModificationResponse> {
    console.log('[AI] replaceElementImage', { payload: request });
    if (USE_MOCK) return mockAIModificationService.replaceElementImage(request);
    try {
      const response = await api.post<ApiResponse<any>>(`${BASE_URL}/api/ai/replace-element-image`, request);

      if (response.data && response.data.success !== false) {
        return {
          success: true,
          data: response.data.data,
        };
      } else {
        return {
          success: false,
          data: {},
          error: response.data.message || 'Failed to replace image',
        };
      }
    } catch (err: any) {
      console.error('Image replacement error:', err);
      return {
        success: false,
        data: {},
        error: err.response?.data?.message || err.message || 'Network error',
      };
    }
  },
};

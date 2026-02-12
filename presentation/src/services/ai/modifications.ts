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
   * @param model The AI model to use (defaults to gemini-2.0-flash-exp)
   * @param provider The AI provider to use (defaults to google)
   * @returns Promise resolving to the modification response
   */
  async processModification(
    request: AIModificationRequest,
    model: string = 'gemini-2.0-flash-exp',
    provider: string = 'google'
  ): Promise<AIModificationResponse> {
    console.log(`[AI] processModification → ${request.action}`, { payload: request, model, provider });
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
            operation: request.parameters.operation,
            context: {
              slideId: request.context.slideId,
              slideType: request.context.slideType,
            },
            model,
            provider,
          };
          break;

        case 'transform-layout':
          endpoint = '/api/ai/transform-layout';
          payload = {
            currentSchema: request.context.slideSchema,
            targetType: request.parameters.targetType,
            model,
            provider,
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
   * @param request The refinement request
   * @param model The AI model to use (defaults to gemini-2.0-flash-exp)
   * @param provider The AI provider to use (defaults to google)
   */
  async refineElementText(
    request: {
      slideId: string;
      elementId: string;
      currentText: string;
      instruction: string;
      slideSchema?: unknown;
      slideType?: string;
    },
    model: string = 'gemini-2.0-flash-exp',
    provider: string = 'google'
  ): Promise<AIModificationResponse> {
    console.log('[AI] refineElementText', { payload: request, model, provider });
    if (USE_MOCK) return mockAIModificationService.refineElementText(request);
    try {
      const response = await api.post<ApiResponse<any>>(`${BASE_URL}/api/ai/refine-element-text`, {
        ...request,
        model,
        provider,
      });

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
   * @param request The replacement request
   * @param model The AI model to use (defaults to gemini-2.0-flash-exp)
   * @param provider The AI provider to use (defaults to google)
   */
  async replaceElementImage(
    request: {
      slideId: string;
      elementId: string;
      description: string;
      style: string;
      themeDescription?: string;
      artDescription?: string;
      slideSchema?: unknown;
      slideType?: string;
    },
    model: string = 'gemini-2.0-flash-exp',
    provider: string = 'google'
  ): Promise<AIModificationResponse> {
    console.log('[AI] replaceElementImage', { payload: request, model, provider });
    if (USE_MOCK) return mockAIModificationService.replaceElementImage(request);
    try {
      const response = await api.post<ApiResponse<any>>(`${BASE_URL}/api/ai/replace-element-image`, {
        ...request,
        model,
        provider,
      });

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

  /**
   * Expand content of combined text items
   * @param request The expansion request
   * @param model The AI model to use (defaults to gemini-2.0-flash-exp)
   * @param provider The AI provider to use (defaults to google)
   */
  async refineCombinedText(
    request: {
      slideId: string;
      items: any[];
      instruction: string;
      slideSchema?: unknown;
      slideType?: string;
      operation?: string;
    },
    model: string = 'gemini-2.0-flash-exp',
    provider: string = 'google'
  ): Promise<AIModificationResponse> {
    console.log('[AI] refineCombinedText', { payload: request, model, provider });
    if (USE_MOCK) return mockAIModificationService.refineCombinedText(request);
    try {
      const response = await api.post<ApiResponse<any>>(`${BASE_URL}/api/ai/refine-combined-text`, {
        ...request,
        model,
        provider,
      });

      if (response.data && response.data.success !== false) {
        return {
          success: true,
          data: response.data.data,
        };
      } else {
        return {
          success: false,
          data: {},
          error: response.data.message || 'Failed to refine combined text',
        };
      }
    } catch (err: any) {
      console.error('Combined text expansion error:', err);
      return {
        success: false,
        data: {},
        error: err.response?.data?.message || err.message || 'Network error',
      };
    }
  },
};

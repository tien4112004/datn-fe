import { api, getBackendUrl } from '@aiprimary/api';
import type { ApiResponse } from '@aiprimary/api';
import type { AIModificationRequest, AIModificationResponse } from '@/types/aiModification';

const BASE_URL = getBackendUrl();

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
    try {
      let endpoint = '';
      let payload = {};

      // Map action to endpoint and payload
      switch (request.action) {
        case 'refine-content':
          endpoint = '/api/ai/refine-content';
          payload = {
            content: request.context.slideContent || request.context.elementContent,
            instruction: request.parameters.instruction || request.parameters.quickAction,
            context: {
              title: request.context.type === 'slide' ? 'Slide Title' : undefined, // In real app, pass actual title
              slideId: request.context.slideId,
            },
          };
          break;

        case 'transform-layout':
          endpoint = '/api/ai/transform-layout';
          payload = {
            currentSchema: request.context.slideContent, // current slide schema
            targetType: request.parameters.targetType,
          };
          break;

        case 'generate-image':
          endpoint = '/api/ai/generate-image';
          payload = {
            description: request.parameters.description,
            style: request.parameters.style,
            slideId: request.context.slideId,
          };
          break;

        case 'expand-slide':
          endpoint = '/api/ai/expand-slide';
          payload = {
            currentSlide: request.context.slideContent,
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
};

import type { AIModificationRequest, AIModificationResponse } from '@/types/aiModification';
import { generateMockResponse } from '@/views/Editor/Toolbar/AIModificationPanel/mockResponses';

/**
 * Mock AI Modification Service
 *
 * This is a placeholder service that simulates AI processing with mock responses.
 * In production, this should be replaced with actual API calls to your AI backend.
 */
export const aiModificationService = {
  /**
   * Process an AI modification request
   * @param request The modification request
   * @returns Promise resolving to the modification response
   */
  async processModification(request: AIModificationRequest): Promise<AIModificationResponse> {
    // Simulate network delay (2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      // Generate mock response based on action type
      const mockData = generateMockResponse(request.action, request.context, request.parameters);

      return {
        success: true,
        data: mockData,
      };
    } catch (err) {
      return {
        success: false,
        data: {},
        error: err instanceof Error ? err.message : 'Unknown error occurred',
      };
    }
  },
};

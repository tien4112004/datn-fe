import { useState } from 'react';
import { useGenerateMindmap } from './useApi';
import { useMindmapApiService } from '../api';
import { convertAiDataToMindMapNodes, DEFAULT_LAYOUT_TYPE } from '../services/utils';
import type { MindmapGenerateRequest } from '../types/service';
import type { LayoutType } from '../types';

/**
 * Custom hook that orchestrates the multi-step mindmap generation flow:
 * 1. Generate AI nodes from the API
 * 2. Convert AI response to mindmap nodes/edges
 * 3. Create mindmap with title and generated content in a single call
 */
export const useGenerateMindmapFlow = () => {
  const mindmapApiService = useMindmapApiService();
  const generate = useGenerateMindmap();

  const [isGenerating, setIsGenerating] = useState(false);

  const generateMindmap = async (
    request: MindmapGenerateRequest,
    options?: {
      layoutType?: LayoutType;
      basePosition?: { x: number; y: number };
    }
  ) => {
    setIsGenerating(true);

    try {
      // Step 1: Generate AI nodes
      const aiResponse = await generate.mutateAsync(request);

      // Step 2: Convert AI response to mindmap nodes/edges with layout applied
      const layoutType = options?.layoutType ?? DEFAULT_LAYOUT_TYPE;
      const basePosition = options?.basePosition ?? { x: 0, y: 0 };

      const { nodes, edges } = await convertAiDataToMindMapNodes(aiResponse, basePosition, layoutType);

      // Step 3: Create mindmap with title and generated content
      const mindmap = await mindmapApiService.createMindmap({
        title: request.topic,
        description: '',
        nodes,
        edges,
      });

      setIsGenerating(false);
      return mindmap;
    } catch (error) {
      setIsGenerating(false);
      throw error;
    }
  };

  return {
    generateMindmap,
    isGenerating,
  };
};

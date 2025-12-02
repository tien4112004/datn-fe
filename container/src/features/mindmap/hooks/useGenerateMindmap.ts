import { useMutation } from '@tanstack/react-query';
import { useMindmapApiService } from '../api';
import type { MindmapGenerateRequest } from '../types/service';

export const useGenerateMindmap = () => {
  const service = useMindmapApiService();

  return useMutation({
    mutationFn: (request: MindmapGenerateRequest) => service.generateMindmap(request),
  });
};

export default useGenerateMindmap;

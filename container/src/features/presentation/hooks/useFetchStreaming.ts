import splitMarkdownToOutlineItems from '@/features/presentation/utils/splitMarkdownToOutlineItems';
import { usePresentationApiService } from '@/features/presentation/api';
import type { OutlineItem, OutlinePromptRequest } from '@/features/presentation/types';
import useStreaming from '@/hooks/useStreaming';

function useFetchStreamingOutline(initialRequestData: OutlinePromptRequest) {
  const presentationApiService = usePresentationApiService();

  return useStreaming<OutlinePromptRequest, OutlineItem[]>({
    extractFn: presentationApiService.getStreamedOutline,
    transformFn: splitMarkdownToOutlineItems,
    input: initialRequestData,
    queryKey: [presentationApiService.getType(), 'presentationOutline'],
  });
}

export default useFetchStreamingOutline;

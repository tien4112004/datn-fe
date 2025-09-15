import splitMarkdownToOutlineItems from '@/features/presentation/utils/splitMarkdownToOutlineItems';
import { usePresentationApiService } from '@/features/presentation/api';
import type { OutlineItem, OutlineData } from '@/features/presentation/types';
import useStreaming from '@/hooks/useStreaming';

function useFetchStreamingOutline(initialRequestData: OutlineData) {
  const presentationApiService = usePresentationApiService();

  return useStreaming<OutlineData, OutlineItem[]>({
    extractFn: presentationApiService.getStreamedOutline.bind(presentationApiService),
    transformFn: splitMarkdownToOutlineItems,
    input: initialRequestData,
    queryKey: [presentationApiService.getType(), 'presentationOutline'],
  });
}

export default useFetchStreamingOutline;

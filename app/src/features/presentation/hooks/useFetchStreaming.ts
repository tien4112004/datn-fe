import splitMarkdownToOutlineItems from '@/features/presentation/utils/splitMarkdownToOutlineItems';
import { usePresentationApiService } from '@/features/presentation/api';
import type { OutlineItem, OutlineData } from '@/features/presentation/types';
import useStreaming from '@/hooks/useStreaming';

function useFetchStreamingOutline(
  initialRequestData: OutlineData,
  onData: (data: OutlineItem[]) => void,
  options?: { manual?: boolean }
) {
  const presentationApiService = usePresentationApiService();

  return useStreaming<OutlineData, OutlineItem[]>({
    extractFn: presentationApiService.getStreamedOutline.bind(presentationApiService),
    transformFn: (data) => {
      const combinedData = data.join('');
      return splitMarkdownToOutlineItems(combinedData);
    },
    onData,
    input: initialRequestData,
    queryKey: [presentationApiService.getType(), 'presentationOutline'],
    options: { manual: options?.manual },
  });
}

export default useFetchStreamingOutline;

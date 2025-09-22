import splitMarkdownToOutlineItems from '@/features/presentation/utils/splitMarkdownToOutlineItems';
import { usePresentationApiService } from '@/features/presentation/api';
import type {
  OutlineItem,
  OutlineData,
  SlideLayoutSchema,
  PresentationGenerationRequest,
} from '@/features/presentation/types';
import useStreaming from '@/hooks/useStreaming';

function useFetchStreamingOutline(initialRequestData: OutlineData, options?: { manual?: boolean }) {
  const presentationApiService = usePresentationApiService();

  return useStreaming<OutlineData, OutlineItem[]>({
    extractFn: presentationApiService.getStreamedOutline.bind(presentationApiService),
    transformFn: (data) => {
      const combinedData = data.join('');
      return splitMarkdownToOutlineItems(combinedData);
    },
    input: initialRequestData,
    queryKey: [presentationApiService.getType(), 'presentationOutline'],
    manual: options?.manual ?? true,
  });
}

function useFetchStreamingPresentation(initialRequestData: PresentationGenerationRequest) {
  const presentationApiService = usePresentationApiService();

  return useStreaming<PresentationGenerationRequest, SlideLayoutSchema[], { presentationId: string }>({
    extractFn: presentationApiService.getStreamedPresentation.bind(presentationApiService),
    transformFn: (slides) => {
      return slides.map((slide) => JSON.parse(slide));
    },
    input: initialRequestData,
    queryKey: [presentationApiService.getType(), 'presentationGeneration'],
    manual: true,
  });
}

export { useFetchStreamingPresentation };
export default useFetchStreamingOutline;

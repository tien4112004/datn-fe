import splitMarkdownToOutlineItems from '@/features/presentation/utils/splitMarkdownToOutlineItems';
import { usePresentationApiService } from '@/features/presentation/api';
import type {
  OutlineItem,
  OutlineData,
  PresentationGenerationRequest,
  AiResultSlide,
  PresentationGenerationStartResponse,
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
    options: { manual: options?.manual },
  });
}

function useFetchStreamingPresentation(initialRequestData: PresentationGenerationRequest) {
  const presentationApiService = usePresentationApiService();

  return useStreaming<PresentationGenerationRequest, AiResultSlide[], PresentationGenerationStartResponse>({
    extractFn: presentationApiService.getStreamedPresentation.bind(presentationApiService),
    transformFn: (slides) => {
      return slides.map((slide, index) => ({
        result: JSON.parse(slide),
        order: index,
        theme: initialRequestData.others.theme,
      }));
    },
    input: initialRequestData,
    queryKey: [presentationApiService.getType(), 'presentationGeneration'],
    options: { manual: true },
  });
}

export { useFetchStreamingPresentation };
export default useFetchStreamingOutline;

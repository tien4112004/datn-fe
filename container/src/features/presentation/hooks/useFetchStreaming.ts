import splitMarkdownToOutlineItems from '@/features/presentation/utils/splitMarkdownToOutlineItems';
import { usePresentationApiService } from '@/features/presentation/api';
import type { OutlineItem, OutlinePromptRequest } from '@/features/presentation/types';
import useStreaming from '@/hooks/useStreaming';

// Da tra duoc thu
function useFetchStreamingOutline(initialRequestData: OutlinePromptRequest) {
  const presentationApiService = usePresentationApiService();

  return useStreaming<OutlinePromptRequest, OutlineItem[]>({
    extractFn: presentationApiService.getStreamedOutline,
    transformFn: splitMarkdownToOutlineItems,
    input: initialRequestData,
    queryKey: [presentationApiService.getType(), 'presentationOutline'],
  });
}

// interface OutlinePromptRequest {
//   prompt: string;
//   topic?: string;
//   maxLength?: number;
//   // Add other properties as needed
// }

// interface StreamingHookReturn {
//   streamedContent: string;
//   outlineItems: OutlineItem[];
//   isStreaming: boolean;
//   error: string | null;
//   startStream: (requestData: OutlinePromptRequest) => Promise<void>;
//   stopStream: () => void;
//   clearContent: () => void;
// }

// function useFetchStreaming(autoStartData?: OutlinePromptRequest): StreamingHookReturn {
//   const presentationApiService = usePresentationApiService();
//   const [streamedContent, setStreamedContent] = React.useState<string>('');
//   const [outlineItems, setOutlineItems] = React.useState<OutlineItem[]>([]);
//   const [isStreaming, setIsStreaming] = React.useState<boolean>(false);
//   const [error, setError] = React.useState<string | null>(null);
//   const abortControllerRef = React.useRef<AbortController | null>(null);

//   const startStream = React.useCallback(
//     async (requestData: OutlinePromptRequest): Promise<void> => {
//       // Reset state
//       setStreamedContent('');
//       setOutlineItems([]);
//       setError(null);
//       setIsStreaming(true);

//       // Create abort controller for cancellation
//       abortControllerRef.current = new AbortController();

//       try {
//         const stream = await presentationApiService.getStreamedOutline(
//           requestData,
//           abortControllerRef.current.signal
//         );
//         const reader = stream.getReader();
//         const decoder = new TextDecoder();
//         let fullContent = '';

//         try {
//           while (true) {
//             const { done, value } = await reader.read();

//             if (done) {
//               break;
//             }

//             // Decode the chunk and add it to our content
//             const chunk = decoder.decode(value, { stream: true });
//             fullContent += chunk;

//             setStreamedContent((prev) => prev + chunk);
//             setOutlineItems([...splitMarkdownToOutlineItems(fullContent)]);

//             // Log each chunk as it arrives
//             console.log('Received chunk:', chunk);
//           }
//         } finally {
//           reader.releaseLock();
//         }
//       } catch (err) {
//         if (err instanceof Error) {
//           if (err.name !== 'AbortError') {
//             setError(`${err.message}`);
//           }
//         } else {
//           setError('Unknown error occurred');
//         }
//       } finally {
//         setIsStreaming(false);
//         abortControllerRef.current = null;
//       }
//     },
//     [presentationApiService]
//   );

//   const stopStream = React.useCallback((): void => {
//     if (abortControllerRef.current) {
//       abortControllerRef.current.abort();
//       abortControllerRef.current = null;
//     }
//     setIsStreaming(false);
//   }, []);

//   const clearContent = React.useCallback((): void => {
//     setStreamedContent('');
//     setOutlineItems([]);
//     setError(null);
//   }, []);

//   React.useEffect(() => {
//     if (autoStartData) {
//       startStream(autoStartData);
//     }
//   }, [autoStartData, startStream]);

//   return {
//     streamedContent,
//     outlineItems,
//     isStreaming,
//     error,
//     startStream,
//     stopStream,
//     clearContent,
//   };
// }

export default useFetchStreamingOutline;

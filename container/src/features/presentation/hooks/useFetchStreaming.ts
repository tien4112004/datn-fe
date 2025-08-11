import type { OutlineItem } from '../types';
import useStreaming from '@/shared/hooks/useStreaming';
// import { experimental_streamedQuery as streamedQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePresentationApiService } from '@/features/presentation/api';
import { splitMarkdownToOutlineItems } from '@/features/presentation/utils';

interface OutlinePromptRequest {
  prompt: string;
  topic?: string;
  maxLength?: number;
  // Add other properties as needed
}

interface StreamingHookReturn {
  streamedContent: string;
  outlineItems: OutlineItem[];
  isStreaming: boolean;
  error: string | null;
  startStream: (requestData: OutlinePromptRequest) => Promise<void>;
  stopStream: () => void;
  clearContent: () => void;
}

function useFetchStreaming(autoStartData?: OutlinePromptRequest): StreamingHookReturn {
  const presentationApiService = usePresentationApiService();

  const {
    streamedContent,
    processedData: outlineItems,
    isStreaming,
    error,
    startStream,
    stopStream,
    clearContent,
  } = useStreaming<OutlinePromptRequest, OutlineItem[]>({
    streamFunction: (requestData, signal) => presentationApiService.getStreamedOutline(requestData, signal),
    processContent: (content) => splitMarkdownToOutlineItems(content),
    onChunkReceived: (chunk) => {
      // Log each chunk as it arrives
      console.log('Received chunk:', chunk);
    },
    autoStart: autoStartData,
  });

  return {
    streamedContent,
    outlineItems: outlineItems || [],
    isStreaming,
    error,
    startStream,
    stopStream,
    clearContent,
  };
}

// Khi nao du manh se quay ve day tra thu
//
// function useFetchStreaming(): StreamingHookReturn {
//   const presentationApiService = usePresentationApiService();
//   const [isStreaming, setIsStreaming] = React.useState(false);
//   const queryClient = useQueryClient();

//   const { data, error, refetch } = useQuery({
//     queryKey: [presentationApiService.getType(), 'presentationItems'],
//     queryFn: streamedQuery({
//       queryFn: ({ signal }) => {
//         return {
//           async *[Symbol.asyncIterator]() {
//             const response = await fetch('http://localhost:8080/presentations/mock-outline', {
//               method: 'POST',
//               headers: {
//                 'Content-Type': 'application/json',
//                 Accept: 'text/plain',
//               },
//               signal
//             })

//             const reader = response.body?.getReader();
//             if (!reader) throw new Error("No reader available");

//             try {
//               while (true) {
//                 const { done, value } = await reader.read();
//                 if (done) break;
//                 console.log(value)

//                 // Convert the Uint8Array to text
//                 const text = new TextDecoder().decode(value);
//                 yield text;
//               }
//             } finally {
//               reader.releaseLock();
//             }
//           },
//         };
//       },
//     }),
//     staleTime: Infinity,
//     enabled: isStreaming,
//   });

//   const handleStreamingToggle = () => {
//     if (isStreaming) {
//       queryClient.cancelQueries({ queryKey: [presentationApiService.getType(), 'presentationItems'] });
//     }
//     setIsStreaming(!isStreaming);
//   };

//   return {
//     streamedContent: data?.join('') ?? '',
//     outlineItems: splitMarkdownToOutlineItems(data?.join('') ?? ''),
//     isStreaming,
//     error: error?.message ?? null,
//     // startStream: () => refetch(),
//     stopStream: handleStreamingToggle,
//     clearContent: () => {
//       queryClient.setQueryData([presentationApiService.getType(), 'presentationItems'], null);
//     }
//   }
// }

export default useFetchStreaming;

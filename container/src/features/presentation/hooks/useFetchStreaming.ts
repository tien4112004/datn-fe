import React from 'react';
import type { OutlineItem } from '../types';
import { marked } from 'marked';
// import { experimental_streamedQuery as streamedQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePresentationApiService } from '@/features/presentation/api';

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
  const [streamedContent, setStreamedContent] = React.useState<string>('');
  const [outlineItems, setOutlineItems] = React.useState<OutlineItem[]>([]);
  const [isStreaming, setIsStreaming] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const startStream = React.useCallback(
    async (requestData: OutlinePromptRequest): Promise<void> => {
      // Reset state
      setStreamedContent('');
      setOutlineItems([]);
      setError(null);
      setIsStreaming(true);

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      try {
        const stream = await presentationApiService.getStreamedOutline(
          requestData,
          abortControllerRef.current.signal
        );
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              break;
            }

            // Decode the chunk and add it to our content
            const chunk = decoder.decode(value, { stream: true });
            fullContent += chunk;

            setStreamedContent((prev) => prev + chunk);
            setOutlineItems([...splitMarkdownToOutlineItems(fullContent)]);

            // Log each chunk as it arrives
            console.log('Received chunk:', chunk);
          }
        } finally {
          reader.releaseLock();
        }
      } catch (err) {
        if (err instanceof Error) {
          if (err.name !== 'AbortError') {
            setError(`${err.message}`);
          }
        } else {
          setError('Unknown error occurred');
        }
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [presentationApiService]
  );

  const stopStream = React.useCallback((): void => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const clearContent = React.useCallback((): void => {
    setStreamedContent('');
    setOutlineItems([]);
    setError(null);
  }, []);

  React.useEffect(() => {
    if (autoStartData) {
      startStream(autoStartData);
    }
  }, [autoStartData, startStream]);

  return {
    streamedContent,
    outlineItems,
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

function splitMarkdownToOutlineItems(markdown: string): OutlineItem[] {
  const cleanMarkdown = markdown
    .replace(/^```markdown\n/, '')
    .replace(/\n```$/, '')
    .trim();

  // Split the markdown into sections based on headings (## and above)
  const sections = cleanMarkdown.split(/(?=^#{2,}\s)/m).filter(Boolean);

  const items = sections.map((section, index) => ({
    id: index.toString(),
    htmlContent: marked.parse(section.trim(), {
      async: false,
    }),
  }));

  return items;
}

export default useFetchStreaming;

import { experimental_streamedQuery as streamedQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';

// Generic streaming hook types
export interface StreamingOptions<TRequest, TProcessed> {
  extractFn: (request: TRequest, signal: AbortSignal) => AsyncIterable<string>;
  transformFn: (content: string) => TProcessed;
  input: TRequest;
  queryKey: string[];
}

export interface StreamingHookReturn<TRequest, TProcessed> {
  processedData: TProcessed;
  isStreaming: boolean;
  error: string | null;
  restartStream: (requestData: TRequest) => void;
  stopStream: () => void;
  clearContent: () => void;
}

function useStreaming<TRequest = any, TProcessed = any>({
  extractFn,
  transformFn,
  input,
  queryKey,
}: StreamingOptions<TRequest, TProcessed>): StreamingHookReturn<TRequest, TProcessed> {
  const [isStreamingInternal, setIsStreamingInternal] = React.useState(true);
  const [requestData, setRequestData] = React.useState<TRequest>(input);
  const queryClient = useQueryClient();

  const {
    data,
    error,
    refetch,
    isFetching: isStreaming,
  } = useQuery({
    queryKey: [...queryKey, requestData],
    queryFn: streamedQuery({
      queryFn: ({ signal }) => extractFn(requestData, signal),
    }),
    staleTime: Infinity,
    enabled: isStreamingInternal,
  });

  const stopStream = () => {
    if (isStreamingInternal) {
      queryClient.cancelQueries({ queryKey: [...queryKey, requestData] });
    }
    setIsStreamingInternal(!isStreamingInternal);
  };

  const restartStream = (requestData: TRequest) => {
    setRequestData(requestData);
    setIsStreamingInternal(true);
    refetch();
  };

  const clearContent = () => {
    queryClient.setQueryData([...queryKey, requestData], null);
  };

  return {
    processedData: transformFn(data?.join('') ?? ''),
    isStreaming,
    error: error?.message ?? null,
    restartStream,
    stopStream,
    clearContent,
  };
}

// function useStreaming<TRequest = any, TProcessed = any>({
//   streamFunction,
//   processContent,
//   onChunkReceived,
//   autoStart,
// }: StreamingOptions<TRequest, TProcessed>): StreamingHookReturn<TRequest, TProcessed> {
//   const [streamedContent, setStreamedContent] = React.useState<string>('');
//   const [processedData, setProcessedData] = React.useState<TProcessed | null>(null);
//   const [isStreaming, setIsStreaming] = React.useState<boolean>(false);
//   const [error, setError] = React.useState<string | null>(null);
//   const abortControllerRef = React.useRef<AbortController | null>(null);

//   const startStream = React.useCallback(
//     async (requestData: TRequest): Promise<void> => {
//       // Reset state
//       setStreamedContent('');
//       setProcessedData(null);
//       setError(null);
//       setIsStreaming(true);

//       // Create abort controller for cancellation
//       abortControllerRef.current = new AbortController();

//       try {
//         const stream = await streamFunction(requestData, abortControllerRef.current.signal);
//         const reader = stream.getReader();
//         const decoder = new TextDecoder();
//         let fullContent = '';

//         try {
//           while (true) {
//             const { done, value } = await reader.read();

//             if (done) {
//               break;
//             }

//             const chunk = decoder.decode(value, { stream: true });
//             fullContent += chunk;

//             setStreamedContent((prev) => prev + chunk);

//             if (processContent) {
//               const processed = processContent(fullContent);
//               setProcessedData(() => processed);
//             }

//             onChunkReceived?.(chunk, fullContent);
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
//     [streamFunction, processContent, onChunkReceived]
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
//     setProcessedData(null);
//     setError(null);
//   }, []);

//   React.useEffect(() => {
//     if (autoStart) {
//       startStream(autoStart);
//     }
//   }, [autoStart, startStream]);

//   return {
//     streamedContent,
//     processedData,
//     isStreaming,
//     error,
//     startStream,
//     stopStream,
//     clearContent,
//   };
// }

export default useStreaming;

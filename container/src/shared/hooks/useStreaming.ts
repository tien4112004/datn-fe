import { experimental_streamedQuery as streamedQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useCallback } from 'react';

export interface StreamingOptions<TRequest, TProcessed> {
  extractFn: (request: TRequest, signal: AbortSignal) => AsyncIterable<string>;
  transformFn: (content: string) => TProcessed;
  input: TRequest;
  queryKey: string[];
  enabled?: boolean;
}

export interface StreamingHookReturn<TRequest, TProcessed> {
  processedData: TProcessed;
  isStreaming: boolean;
  error: string | null;
  restartStream: (requestData: TRequest) => void;
  stopStream: () => void;
  clearContent: () => void;
  fetch: () => void;
}

function useStreaming<TRequest = any, TProcessed = any>({
  extractFn,
  transformFn,
  input,
  queryKey,
  enabled = true,
}: StreamingOptions<TRequest, TProcessed>): StreamingHookReturn<TRequest, TProcessed> {
  const [isStreamingInternal, setIsStreamingInternal] = React.useState(enabled);
  const requestData = React.useRef<TRequest>(input);
  const queryClient = useQueryClient();

  const {
    data,
    error,
    refetch,
    isFetching: isStreaming,
  } = useQuery({
    queryKey: [...queryKey, requestData],
    queryFn: streamedQuery({
      queryFn: ({ signal }) => extractFn(requestData.current, signal),
    }),
    staleTime: Infinity,
    enabled: isStreamingInternal,
  });

  const fetch = useCallback(() => {
    if (!isStreamingInternal) {
      setIsStreamingInternal(true);
      refetch();
    }
  }, [refetch]);

  const stopStream = useCallback(() => {
    if (isStreamingInternal) {
      queryClient.cancelQueries({ queryKey: [...queryKey, requestData] });
    }
    setIsStreamingInternal(false);
  }, []);

  const restartStream = useCallback((data: TRequest) => {
    requestData.current = data;
    setIsStreamingInternal(true);
    refetch();
  }, []);

  const clearContent = useCallback(() => {
    queryClient.setQueryData([...queryKey, requestData], null);
  }, []);

  const processedData = transformFn(data?.join('') ?? '');

  return {
    processedData,
    isStreaming,
    error: error && error.message !== 'CancelledError' ? error.message : null,
    restartStream,
    stopStream,
    clearContent,
    fetch,
  };
}

export default useStreaming;

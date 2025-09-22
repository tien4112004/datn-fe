import { experimental_streamedQuery as streamedQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useCallback } from 'react';

export interface StreamingOptions<TRequest, TProcessed> {
  extractFn: (request: TRequest, signal: AbortSignal) => AsyncIterable<string>;
  transformFn: (content: string[]) => TProcessed;
  input: TRequest;
  queryKey: string[];
  manual?: boolean;
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
  manual = false,
}: StreamingOptions<TRequest, TProcessed>): StreamingHookReturn<TRequest, TProcessed> {
  const [shouldStream, setShouldStream] = React.useState(!manual);
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
    enabled: shouldStream,
  });

  const fetch = useCallback(() => {
    setShouldStream(true);
    refetch();
  }, [shouldStream, refetch]);

  const stopStream = useCallback(() => {
    queryClient.cancelQueries({ queryKey: [...queryKey, requestData] });
    setShouldStream(false);
  }, [queryClient, queryKey]);

  const restartStream = useCallback((data: TRequest) => {
    requestData.current = data;
    setShouldStream(true);
    refetch();
  }, []);

  const clearContent = useCallback(() => {
    queryClient.setQueryData([...queryKey, requestData], null);
  }, []);

  const processedData = transformFn(data || []);

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

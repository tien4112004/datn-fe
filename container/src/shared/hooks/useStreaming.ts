import { experimental_streamedQuery as streamedQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useCallback } from 'react';

export interface StreamingOptions<TRequest, TProcessed> {
  extractFn: (request: TRequest, signal: AbortSignal) => Promise<{ stream: AsyncIterable<string> }>;
  transformFn: (content: string[]) => TProcessed;
  input: TRequest;
  queryKey: string[];
  options?: {
    manual?: boolean;
  };
}

export interface StreamingHookReturn<TRequest, TProcessed, TExtractResult> {
  processedData: TProcessed;
  isStreaming: boolean;
  error: string | null;
  restartStream: (requestData: TRequest) => void;
  stopStream: () => void;
  clearContent: () => void;
  fetch: (request?: TRequest) => void;
  result?: TExtractResult;
}

function useStreaming<TRequest = any, TProcessed = any, TExtractResult = any>({
  extractFn,
  transformFn,
  input,
  queryKey,
  options = { manual: false },
}: StreamingOptions<TRequest, TProcessed>): StreamingHookReturn<TRequest, TProcessed, TExtractResult> {
  const [shouldStream, setShouldStream] = React.useState(!options.manual);
  const requestData = React.useRef<TRequest>(input);
  const [result, setExtractResult] = React.useState<TExtractResult>();

  const queryClient = useQueryClient();

  const {
    data,
    error,
    refetch,
    isFetching: isStreaming,
  } = useQuery({
    queryKey: [...queryKey, requestData],
    queryFn: streamedQuery({
      queryFn: async ({ signal }) => {
        const { stream, ...rest } = await extractFn(requestData.current, signal);
        setExtractResult(rest as TExtractResult);
        return stream;
      },
    }),
    staleTime: Infinity,
    enabled: shouldStream,
  });

  const fetch = useCallback(
    (request?: TRequest) => {
      if (request) {
        requestData.current = request;
      }
      setShouldStream(true);
      refetch();
    },
    [refetch]
  );

  const stopStream = useCallback(() => {
    queryClient.cancelQueries({ queryKey: [...queryKey, requestData] });
    setShouldStream(false);
  }, [queryClient, queryKey]);

  const restartStream = useCallback(
    (data: TRequest) => {
      requestData.current = data;
      setShouldStream(true);
      refetch();
    },
    [refetch]
  );

  const clearContent = useCallback(() => {
    queryClient.setQueryData([...queryKey, requestData], null);
  }, [queryClient, queryKey]);

  const processedData = transformFn(data || []);

  return {
    processedData,
    isStreaming,
    error: error && error.message !== 'CancelledError' ? error.message : null,
    restartStream,
    stopStream,
    clearContent,
    fetch,
    result,
  };
}

export default useStreaming;

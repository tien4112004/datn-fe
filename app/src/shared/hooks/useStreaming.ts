import { experimental_streamedQuery as streamedQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useEffect } from 'react';

export interface StreamingOptions<TRequest, TProcessed> {
  extractFn: (request: TRequest, signal: AbortSignal) => Promise<{ stream: AsyncIterable<string> }>;
  transformFn: (content: string[]) => TProcessed;
  input: TRequest;
  queryKey: string[];
  onData?: (data: TProcessed) => void;
  options?: {
    manual?: boolean;
  };
}

export interface StreamingHookReturn<TRequest, _, TExtractResult> {
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
  onData,
  options = { manual: false },
}: StreamingOptions<TRequest, TProcessed>): StreamingHookReturn<TRequest, TProcessed, TExtractResult> {
  const [shouldStream, setShouldStream] = React.useState(!options.manual);
  const requestData = React.useRef<TRequest>(input);
  const [result, setExtractResult] = React.useState<TExtractResult>();
  const [queryCounter, setQueryCounter] = React.useState(() => Date.now());

  const queryClient = useQueryClient();

  const {
    data,
    error,
    isFetching: isStreaming,
  } = useQuery({
    queryKey: [...queryKey, queryCounter],
    queryFn: streamedQuery({
      queryFn: async ({ signal }) => {
        const result = await extractFn(requestData.current, signal);
        // Defensive: ensure we always return an AsyncIterable (never undefined)
        if (!result?.stream) {
          // Helpful debug info if extractFn unexpectedly doesn't provide a stream
          // eslint-disable-next-line no-console
          console.warn(
            'useStreaming: extractFn did not return a stream for queryKey',
            [...queryKey, queryCounter],
            { request: requestData.current }
          );
        }
        const stream = result?.stream ?? (async function* () {})();
        const { stream: _s, ...rest } = result || {};
        setExtractResult(rest as TExtractResult);
        return stream;
      },
    }),
    staleTime: Infinity,
    enabled: shouldStream,
  });

  const fetch = useCallback((request?: TRequest) => {
    if (request) {
      requestData.current = request;
    }
    setQueryCounter((prev) => prev + 1);
    setShouldStream(true);
  }, []);

  const stopStream = useCallback(() => {
    queryClient.cancelQueries({ queryKey: [...queryKey, queryCounter] });
    setShouldStream(false);
  }, [queryClient, queryKey]);

  const restartStream = useCallback((data: TRequest) => {
    requestData.current = data;
    setQueryCounter((prev) => prev + 1);
    setShouldStream(true);
  }, []);

  const clearContent = useCallback(() => {
    queryClient.setQueryData([...queryKey, queryCounter], null);
  }, [queryClient, queryKey]);

  useEffect(() => {
    if (data && onData) {
      const processed = transformFn(data);
      onData(processed);
    }
  });

  return {
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

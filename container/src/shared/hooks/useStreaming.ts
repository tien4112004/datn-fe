import React from 'react';

// Generic streaming hook types
export interface StreamingOptions<TRequest, TProcessed> {
  streamFunction: (request: TRequest, signal: AbortSignal) => Promise<ReadableStream<Uint8Array>>;
  processContent?: (content: string) => TProcessed;
  onChunkReceived?: (chunk: string, fullContent: string) => void;
  autoStart?: TRequest;
}

export interface StreamingHookReturn<TRequest, TProcessed> {
  streamedContent: string;
  processedData: TProcessed | null;
  isStreaming: boolean;
  error: string | null;
  startStream: (requestData: TRequest) => Promise<void>;
  stopStream: () => void;
  clearContent: () => void;
}

function useStreaming<TRequest = any, TProcessed = any>({
  streamFunction,
  processContent,
  onChunkReceived,
  autoStart,
}: StreamingOptions<TRequest, TProcessed>): StreamingHookReturn<TRequest, TProcessed> {
  const [streamedContent, setStreamedContent] = React.useState<string>('');
  const [processedData, setProcessedData] = React.useState<TProcessed | null>(null);
  const [isStreaming, setIsStreaming] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const startStream = React.useCallback(
    async (requestData: TRequest): Promise<void> => {
      // Reset state
      setStreamedContent('');
      setProcessedData(null);
      setError(null);
      setIsStreaming(true);

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      try {
        const stream = await streamFunction(requestData, abortControllerRef.current.signal);
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

            // Process content if processor is provided
            if (processContent) {
              const processed = processContent(fullContent);
              setProcessedData(processed);
            }

            // Call chunk received callback if provided
            onChunkReceived?.(chunk, fullContent);
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
    [streamFunction, processContent, onChunkReceived]
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
    setProcessedData(null);
    setError(null);
  }, []);

  React.useEffect(() => {
    if (autoStart) {
      startStream(autoStart);
    }
  }, [autoStart, startStream]);

  return {
    streamedContent,
    processedData,
    isStreaming,
    error,
    startStream,
    stopStream,
    clearContent,
  };
}

export default useStreaming;

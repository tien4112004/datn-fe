import React, { useState, useCallback, useRef, useEffect } from 'react';

// Type definitions
interface OutlinePromptRequest {
  prompt: string;
  topic?: string;
  maxLength?: number;
  // Add other properties as needed
}

interface SSEHookReturn {
  streamedContent: string;
  isStreaming: boolean;
  error: string | null;
  startStream: (requestData: OutlinePromptRequest) => Promise<void>;
  stopStream: () => void;
  clearContent: () => void;
}

// Custom hook for SSE with POST support
function useServerSentEventsWithPost(): SSEHookReturn {
  const [streamedContent, setStreamedContent] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const startStream = useCallback(async (requestData: OutlinePromptRequest): Promise<void> => {
    // Reset state
    setStreamedContent('');
    setError(null);
    setIsStreaming(true);

    try {
      // First, send the POST request to initiate streaming
      // For SSE with POST, we'll need to either:
      // 1. Send POST data as query params, or
      // 2. Use a session-based approach, or
      // 3. Modify backend to accept SSE with POST body

      // Option 1: Convert POST data to query params for SSE
      const params = new URLSearchParams();
      params.append('prompt', requestData.prompt);

      if (requestData.topic) {
        params.append('topic', requestData.topic);
      }
      if (requestData.maxLength) {
        params.append('maxLength', requestData.maxLength.toString());
      }

      const sseUrl = `http://localhost:8080/presentations/mock-presentation?${params.toString()}`;

      console.log('Starting SSE connection to:', sseUrl);

      eventSourceRef.current = new EventSource(sseUrl);

      eventSourceRef.current.onopen = (event: Event): void => {
        console.log('SSE connection opened:', event);
      };

      eventSourceRef.current.onmessage = (event: MessageEvent<string>): void => {
        const chunk: string = event.data;
        console.log('Received SSE chunk:', chunk);

        setStreamedContent((prev: string) => {
          const newContent = prev + chunk;
          return newContent;
        });
      };

      eventSourceRef.current.onerror = (event: Event): void => {
        console.error('SSE error:', event);
        setError('Connection error occurred');
        setIsStreaming(false);
        eventSourceRef.current?.close();
      };

      // Handle custom events if your server sends them
      eventSourceRef.current.addEventListener('complete', (event: Event): void => {
        const messageEvent = event as MessageEvent<string>;
        console.log('Stream complete:', messageEvent.data);
        setIsStreaming(false);
        eventSourceRef.current?.close();
      });

      eventSourceRef.current.addEventListener('error-event', (event: Event): void => {
        const messageEvent = event as MessageEvent<string>;
        console.error('Server error:', messageEvent.data);
        setError(messageEvent.data);
        setIsStreaming(false);
        eventSourceRef.current?.close();
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error starting SSE stream:', err);
      setError(errorMessage);
      setIsStreaming(false);
    }
  }, []);

  const stopStream = useCallback((): void => {
    if (eventSourceRef.current) {
      console.log('Stopping SSE connection');
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const clearContent = useCallback((): void => {
    setStreamedContent('');
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return {
    streamedContent,
    isStreaming,
    error,
    startStream,
    stopStream,
    clearContent,
  };
}

const StreamingOutlineGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const { streamedContent, isStreaming, error, startStream, stopStream, clearContent } =
    useServerSentEventsWithPost();

  const handleGenerate = async (): Promise<void> => {
    if (!prompt.trim()) {
      return;
    }

    const requestData: OutlinePromptRequest = {
      prompt: prompt,
      // Add other properties that your OutlinePromptRequest might need
      // topic: prompt,
      // maxLength: 1000,
    };

    await startStream(requestData);
  };

  const handleStop = (): void => {
    stopStream();
  };

  const handleClear = (): void => {
    clearContent();
  };

  const handlePromptChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setPrompt(event.target.value);
  };

  return (
    <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-lg">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Presentation Generator (SSE)</h1>

      <div className="mb-6">
        <label htmlFor="prompt" className="mb-2 block text-sm font-medium text-gray-700">
          Enter your presentation topic or prompt:
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={handlePromptChange}
          className="w-full rounded-md border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="e.g., 'The Future of Artificial Intelligence in Healthcare'"
          disabled={isStreaming}
        />
      </div>

      <div className="mb-6 flex gap-3">
        <button
          onClick={handleGenerate}
          disabled={isStreaming || !prompt.trim()}
          className={`rounded-md px-6 py-2 font-medium transition-colors ${
            isStreaming || !prompt.trim()
              ? 'cursor-not-allowed bg-gray-300 text-gray-500'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
          }`}
          type="button"
        >
          {isStreaming ? 'Generating...' : 'Generate Outline'}
        </button>

        {isStreaming && (
          <button
            onClick={handleStop}
            className="rounded-md bg-red-600 px-6 py-2 font-medium text-white transition-colors hover:bg-red-700 focus:ring-2 focus:ring-red-500"
            type="button"
          >
            Stop
          </button>
        )}

        <button
          onClick={handleClear}
          disabled={isStreaming}
          className="rounded-md bg-gray-200 px-6 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
          type="button"
        >
          Clear
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4">
          <div className="flex">
            <div className="text-red-800">
              <strong>Error:</strong> {error}
            </div>
          </div>
        </div>
      )}

      {isStreaming && (
        <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center">
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <span className="text-blue-800">Streaming presentation via SSE...</span>
            <span className="ml-2 text-sm text-blue-600">({streamedContent.length} characters received)</span>
          </div>
        </div>
      )}

      {streamedContent && (
        <div className="mb-4">
          <h3 className="mb-3 text-lg font-semibold text-gray-800">Generated Presentation:</h3>
          <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">
              {streamedContent}
              {isStreaming && <span className="animate-pulse">|</span>}
            </pre>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-1 text-xs text-gray-500"></div>

      <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-4">
        <h4 className="mb-2 font-semibold text-amber-800">SSE Generation:</h4>
        <div className="space-y-2 text-sm text-amber-700">
          <p>Content is streamed in real-time using Server-Sent Events (SSE)</p>
          <p>Check the browser console for detailed SSE logging</p>
          <p>Server endpoint: http://localhost:8080/presentations/mock-generation</p>
        </div>
      </div>
    </div>
  );
};

export default StreamingOutlineGenerator;

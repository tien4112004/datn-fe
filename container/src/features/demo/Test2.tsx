import React, { useState, useCallback, useRef } from 'react';

interface OutlinePromptRequest {
  prompt: string;
  topic?: string;
  maxLength?: number;
  // Add other properties as needed
}

interface StreamingHookReturn {
  streamedContent: string;
  isStreaming: boolean;
  error: string | null;
  startStream: (requestData: OutlinePromptRequest) => Promise<void>;
  stopStream: () => void;
  clearContent: () => void;
}

function useFetchStreaming(): StreamingHookReturn {
  const [streamedContent, setStreamedContent] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startStream = useCallback(async (requestData: OutlinePromptRequest): Promise<void> => {
    // Reset state
    setStreamedContent('');
    setError(null);
    setIsStreaming(true);

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      console.log('Starting fetch stream with data:', requestData);

      const response = await fetch('http://localhost:8080/presentations/mock-outline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/plain', // Match your backend's produces value
        },
        body: JSON.stringify(requestData),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      // Check if the response body is readable
      if (!response.body) {
        throw new Error('ReadableStream not supported');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            console.log('Streaming complete. Full content length:', fullContent.length);
            console.log('Full content:', fullContent);
            break;
          }

          // Decode the chunk and add it to our content
          const chunk = decoder.decode(value, { stream: true });
          fullContent += chunk;

          setStreamedContent((prev) => prev + chunk);

          // Log each chunk as it arrives
          console.log('Received chunk:', chunk);
        }
      } finally {
        reader.releaseLock();
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          console.log('Stream was cancelled');
        } else {
          console.error('Error during streaming:', err);
          setError(`${err.message}`);
        }
      } else {
        console.error('Unknown error during streaming:', err);
        setError('Unknown error occurred');
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, []);

  const stopStream = useCallback((): void => {
    if (abortControllerRef.current) {
      console.log('Cancelling fetch stream');
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const clearContent = useCallback((): void => {
    setStreamedContent('');
    setError(null);
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

function parseToOutlineList(markdown: string): string[] {
  const sections = markdown.split(/(?=^#{2,}\s)/m).filter(Boolean);
  const items = sections.map((section) => section.trim());
  return items;
}

const StreamingOutlineGenerator2: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const { streamedContent, isStreaming, error, startStream, stopStream, clearContent } = useFetchStreaming();

  const handleGenerate = async (): Promise<void> => {
    if (!prompt.trim()) {
      return;
    }

    const requestData: OutlinePromptRequest = {
      prompt: prompt,
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
      <h1 className="mb-6 text-2xl font-bold text-gray-800">
        Presentation Outline Generator (Fetch Streaming)
      </h1>

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
            Cancel
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
            <span className="text-blue-800">Streaming outline...</span>
            <span className="ml-2 text-sm text-blue-600">({streamedContent.length} characters received)</span>
          </div>
        </div>
      )}

      {streamedContent && (
        <div className="mb-4 flex flex-col gap-3 space-y-2">
          <h3 className="mb-3 text-lg font-semibold text-gray-800">Generated Outline:</h3>
          {parseToOutlineList(streamedContent).map((item, index) => (
            <div key={index} className="rounded-md border border-gray-200 bg-gray-50 p-4">
              <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">{item}</pre>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 space-y-1 text-xs text-gray-500"></div>

      <div className="mt-6 rounded-md border border-green-200 bg-green-50 p-4">
        <h4 className="mb-2 font-semibold text-green-800">Streaming Text Plain:</h4>
        <div className="space-y-2 text-sm text-green-700">
          <p>Content is streamed in real-time using Fetch API</p>
          <p>Works with your existing POST endpoint (text/plain)</p>
          <p>Check the browser console for detailed streaming logs</p>
          <p>Server endpoint: http://localhost:8080/presentations/mock-outline</p>
        </div>
      </div>
    </div>
  );
};

export default StreamingOutlineGenerator2;

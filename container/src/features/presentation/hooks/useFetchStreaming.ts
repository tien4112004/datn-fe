import React from "react";
import type { OutlineItem } from "../types";
import { marked } from "marked";

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

function useFetchStreaming(): StreamingHookReturn {
  const [streamedContent, setStreamedContent] = React.useState<string>('');
  const [outlineItems, setOutlineItems] = React.useState<OutlineItem[]>([]);
  const [isStreaming, setIsStreaming] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const startStream = React.useCallback(async (requestData: OutlinePromptRequest): Promise<void> => {
    // Reset state
    setStreamedContent('');
    setOutlineItems([]);
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
          setOutlineItems([...splitMarkdownToOutlineItems(fullContent)]);

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

  const stopStream = React.useCallback((): void => {
    if (abortControllerRef.current) {
      console.log('Cancelling fetch stream');
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

function splitMarkdownToOutlineItems(markdown: string): OutlineItem[] {
  const cleanMarkdown = markdown
    .replace(/^```markdown\n/, '')
    .replace(/\n```$/, '')
    .trim();

  // Split the markdown into sections based on headings (## and above)
  const sections = cleanMarkdown.split(/(?=^#{2,}\s)/m).filter(Boolean);

  const items =  sections.map((section, index) => ({
    id: index.toString(),
    htmlContent: marked.parse(section.trim(), {
      async: false, 
    })
  }));

  return items;
}

export default useFetchStreaming;
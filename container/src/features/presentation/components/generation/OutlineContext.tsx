// DEPRECATED: This file will be removed in future versions.

import React, { createContext, useContext, useState } from 'react';
import type { OutlineItem } from '../../types';

type OutlineContextType = {
  content: OutlineItem[];
  setContent: (value: OutlineItem[]) => void;
  isStreaming?: boolean;
  streamingContent?: string;
  setStreamingContent?: (value: string) => void;
  endStreaming?: () => void;
  handleContentChange?: (id: string, content: string) => void;
};

const OutlineContext = createContext<OutlineContextType | undefined>(undefined);

export const OutlineProvider = ({ children }: { children: React.ReactNode }) => {
  const [content, setContent] = useState<OutlineItem[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamingContent, setStreamingContent] = useState<string>('');

  const handleContentChange = (id: string, content: string) => {
    setContent((prevContent) =>
      prevContent.map((item) => (item.id === id ? { ...item, htmlContent: content } : item))
    );
  };

  const value: OutlineContextType = {
    content,
    setContent,
    isStreaming,
    streamingContent,
    setStreamingContent: (value: string) => {
      setIsStreaming(true);
      setStreamingContent(value);
    },
    endStreaming: () => {
      setIsStreaming(false);
      setStreamingContent('');
    },
    handleContentChange,
  };

  return <OutlineContext.Provider value={value}>{children}</OutlineContext.Provider>;
};

export const useOutlineContext = () => {
  const context = useContext(OutlineContext);
  if (!context) {
    throw new Error('useOutlineContext must be used within an OutlineProvider');
  }
  return context;
};

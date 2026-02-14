import React, { useState } from 'react';
import { Send, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatInterfaceProps {
  placeholder?: string;
  onSubmit: (message: string) => Promise<void>;
  isLoading?: boolean;
}

/**
 * Chat input interface for custom AI instructions
 */
export function ChatInterface({
  placeholder = 'Ask AI to modify this content...',
  onSubmit,
  isLoading = false,
}: ChatInterfaceProps): React.ReactElement {
  const [input, setInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    await onSubmit(input);
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        disabled={isLoading}
        className="flex-1 rounded border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 disabled:bg-gray-100 disabled:text-gray-500"
      />
      <Button
        type="submit"
        disabled={isLoading || !input.trim()}
        size="sm"
        className="gap-2"
        variant="default"
      >
        {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      </Button>
    </form>
  );
}

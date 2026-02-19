import { useState } from 'react';
import { Button } from '@ui/button';
import { Textarea } from '@ui/textarea';

interface CommentFormProps {
  onSubmit: (content: string, mentionedUserIds: string[]) => void;
  onCancel?: () => void;
  initialContent?: string;
  placeholder?: string;
  submitLabel?: string;
  autoFocus?: boolean;
  isSubmitting?: boolean;
}

export function CommentForm({
  onSubmit,
  onCancel,
  initialContent = '',
  placeholder = 'Write a comment...',
  submitLabel = 'Comment',
  autoFocus = false,
  isSubmitting = false,
}: CommentFormProps) {
  const [content, setContent] = useState(initialContent);
  const [mentions, setMentions] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onSubmit(content, mentions);
    setContent('');
    setMentions([]);
  };

  const handleCancel = () => {
    setContent('');
    setMentions([]);
    onCancel?.();
  };

  const remainingChars = 5000 - content.length;
  const isOverLimit = remainingChars < 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="min-h-[80px] resize-none"
        disabled={isSubmitting}
      />

      <div className="flex items-center justify-between">
        <span className={`text-xs ${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
          {remainingChars} characters remaining
        </span>

        <div className="flex gap-2">
          {onCancel && (
            <Button type="button" variant="outline" size="sm" onClick={handleCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          )}
          <Button type="submit" size="sm" disabled={!content.trim() || isOverLimit || isSubmitting}>
            {isSubmitting ? 'Submitting...' : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}

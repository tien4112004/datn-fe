import { parseMarkdown } from '../../utils';
import { cn } from '@/shared/lib/utils';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export const MarkdownPreview = ({ content, className }: MarkdownPreviewProps) => {
  const html = parseMarkdown(content);

  return (
    <div
      className={cn(
        'prose prose-sm dark:prose-invert max-w-none',
        'prose-headings:font-semibold prose-p:my-2 prose-ul:my-2 prose-ol:my-2',
        'prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded',
        'prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg',
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

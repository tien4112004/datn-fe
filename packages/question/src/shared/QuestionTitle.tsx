import { cn } from '@ui/lib/utils';
import { MarkdownPreview } from './MarkdownPreview';

interface QuestionTitleProps {
  content: string;
  className?: string;
  variant?: 'markdown' | 'plain';
}

export const QuestionTitle = ({ content, className, variant = 'markdown' }: QuestionTitleProps) => {
  const titleClassName = cn('prose-p:text-lg prose-p:leading-relaxed prose-p:font-medium', className);

  if (variant === 'plain') {
    return <p className={cn('font-medium', titleClassName)}>{content}</p>;
  }

  return <MarkdownPreview className={titleClassName} content={content} />;
};

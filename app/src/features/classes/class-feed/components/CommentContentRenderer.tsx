import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { parsePostReferences } from '../utils/postReferences';
import { cn } from '@/shared/lib/utils';

interface CommentContentRendererProps {
  content: string;
  className?: string;
}

/**
 * Renders comment content with post URL references as clickable links
 * Detects URLs like /classes/{classId}/posts/{postId} and makes them clickable
 */
export function CommentContentRenderer({ content, className }: CommentContentRendererProps) {
  const { t } = useTranslation('classes');
  const references = parsePostReferences(content);

  // If no references, just render plain text
  if (references.length === 0) {
    return (
      <p className={cn('whitespace-pre-wrap break-words text-sm text-gray-700', className)}>{content}</p>
    );
  }

  // Build array of text segments and link components
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  references.forEach((ref, index) => {
    // Add text before this reference
    if (ref.startIndex > lastIndex) {
      const textSegment = content.slice(lastIndex, ref.startIndex);
      elements.push(
        <span key={`text-${index}`} className="whitespace-pre-wrap break-words">
          {textSegment}
        </span>
      );
    }

    // Determine the correct path (student or teacher mode)
    const isStudentMode = window.location.pathname.includes('/student/');
    const postPath = isStudentMode
      ? `/student/classes/${ref.classId}/posts/${ref.postId}`
      : `/classes/${ref.classId}/posts/${ref.postId}`;

    // Add the post reference link
    elements.push(
      <Link
        key={`ref-${index}`}
        to={postPath}
        className="inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-sm font-medium text-blue-700 hover:bg-blue-100 hover:underline dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900"
        title={t('feed.comments.postReferenceTooltip')}
        onClick={(e: React.MouseEvent) => {
          // Allow opening in new tab with cmd/ctrl+click
          if (e.metaKey || e.ctrlKey) {
            return;
          }
          // Otherwise prevent bubbling so clicking the link doesn't trigger parent click handlers
          e.stopPropagation();
        }}
      >
        <FileText className="h-3 w-3" />
        <span className="max-w-[200px] truncate" title={ref.url}>
          {t('feed.comments.postReference')}
        </span>
      </Link>
    );

    lastIndex = ref.endIndex;
  });

  // Add remaining text after last reference
  if (lastIndex < content.length) {
    const textSegment = content.slice(lastIndex);
    elements.push(
      <span key="text-end" className="whitespace-pre-wrap break-words">
        {textSegment}
      </span>
    );
  }

  return <p className={cn('text-sm text-gray-700', className)}>{elements}</p>;
}

import { UserAvatar } from '@/components/common/UserAvatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getLocaleDateFns } from '@/shared/i18n/helper';
import { formatDistanceToNow } from 'date-fns';
import { Clock, FileText, ClipboardList, MessageCircleMore, Pin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import type { Post } from '../types';
import { AttachmentPreview } from './AttachmentPreview';
import { PostActions } from './PostActions';
import { parseDateSafe } from '@/shared/utils/date';

interface PostCardProps {
  post: Post;
  onEdit?: () => void;
  onDelete?: () => void;
  onPin?: (pinned: boolean) => void;
  onComment?: () => void;
  className?: string;
}

export const PostCard = ({ post, onEdit, onDelete, onPin, onComment, className = '' }: PostCardProps) => {
  const { t } = useTranslation('classes');

  return (
    <article
      className={`hover:bg-muted/30 border-b px-3 py-3 transition-colors md:px-6 md:py-4 ${className}`}
    >
      {/* Header */}
      <div className="mb-2 flex items-start gap-2 md:mb-3 md:gap-3">
        {/* Small avatar on mobile */}
        <UserAvatar
          name={
            post.author
              ? `${post.author.firstName} ${post.author.lastName}`
              : `User ${post.authorId.slice(0, 8)}`
          }
          src={post.author?.avatarUrl || undefined}
          size="sm"
          className="md:hidden"
        />
        {/* Medium avatar on desktop */}
        <UserAvatar
          name={
            post.author
              ? `${post.author.firstName} ${post.author.lastName}`
              : `User ${post.authorId.slice(0, 8)}`
          }
          src={post.author?.avatarUrl || undefined}
          size="md"
          className="hidden md:block"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                <p className="font-semibold">
                  {post.author
                    ? `${post.author.firstName} ${post.author.lastName}`
                    : `User ${post.authorId.slice(0, 8)}`}
                </p>

                {/* Type Badge */}
                {post.type === 'Post' && (
                  <Badge variant="secondary" className="gap-1 text-[10px] md:text-xs">
                    <FileText className="h-3 w-3" />
                    {t('feed.post.badges.post')}
                  </Badge>
                )}

                {post.type === 'Assignment' && (
                  <Badge
                    variant="default"
                    className="gap-1 bg-purple-600 text-[10px] hover:bg-purple-700 md:text-xs"
                  >
                    <ClipboardList className="h-3 w-3" />
                    {t('feed.post.badges.assignment')}
                  </Badge>
                )}

                {post.isPinned && (
                  <Badge variant="secondary" className="gap-1 text-[10px] md:text-xs">
                    <Pin className="h-3 w-3" />
                    {t('feed.post.badges.pinned')}
                  </Badge>
                )}
              </div>

              <p className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(parseDateSafe(post.createdAt), {
                  addSuffix: true,
                  locale: getLocaleDateFns(),
                })}
              </p>
            </div>

            <PostActions post={post} onEdit={onEdit} onDelete={onDelete} onPin={onPin} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-2 ml-9 md:mb-3 md:ml-[52px]">
        <article className="prose prose-sm !max-w-none">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </article>
      </div>

      {/* Attachments */}
      {post.attachments && post.attachments.length > 0 && (
        <div className="mb-2 ml-9 space-y-1.5 md:mb-3 md:ml-[52px] md:space-y-2">
          {post.attachments.map((url, index) => (
            <AttachmentPreview key={`${post.id}-attachment-${index}`} url={url} />
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="ml-9 flex items-center pt-1.5 md:ml-[52px] md:pt-2">
        <Button
          onClick={onComment}
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground -ml-2 gap-2"
        >
          <MessageCircleMore className="h-4 w-4" />
          <span className="text-sm">
            {post.commentCount}{' '}
            {post.commentCount === 1 ? t('feed.post.actions.comment') : t('feed.post.actions.comments')}
          </span>
        </Button>
      </div>
    </article>
  );
};

import { useTranslation } from 'react-i18next';
import { AttachmentPreview } from './AttachmentPreview';
import { PostActions } from './PostActions';
import type { Post } from '../types';
import ReactMarkdown from 'react-markdown';
import { UserAvatar } from '@/components/common/UserAvatar';
import { MessageCircleMore, Pin, Megaphone, CalendarDays, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { getLocaleDateFns } from '@/shared/i18n/helper';

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
    <article className={`hover:bg-muted/30 border-b px-6 py-4 transition-colors ${className}`}>
      {/* Header */}
      <div className="mb-3 flex items-start gap-3">
        <UserAvatar name={`User ${post.authorId.slice(0, 8)}`} size="md" />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">User {post.authorId.slice(0, 8)}</p>

                {/* Type Badge */}
                {post.type === 'announcement' && (
                  <Badge variant="default" className="gap-1 text-xs">
                    <Megaphone className="h-3 w-3" />
                    {t('feed.post.badges.announcement')}
                  </Badge>
                )}

                {post.type === 'schedule_event' && (
                  <Badge variant="default" className="gap-1 bg-blue-500 text-xs hover:bg-blue-600">
                    <CalendarDays className="h-3 w-3" />
                    {t('feed.post.badges.schedule_event')}
                  </Badge>
                )}

                {post.isPinned && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <Pin className="h-3 w-3" />
                    {t('feed.post.badges.pinned')}
                  </Badge>
                )}
              </div>

              <p className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(post.createdAt, { addSuffix: true, locale: getLocaleDateFns() })}
              </p>
            </div>

            <PostActions post={post} onEdit={onEdit} onDelete={onDelete} onPin={onPin} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-3 ml-[52px]">
        <article className="prose prose-sm !max-w-none">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </article>
      </div>

      {/* Attachments */}
      {post.attachments && post.attachments.length > 0 && (
        <div className="mb-3 ml-[52px] space-y-2">
          {post.attachments.map((url, index) => (
            <AttachmentPreview key={`${post.id}-attachment-${index}`} url={url} />
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="ml-[52px] flex items-center pt-2">
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

import { useTranslation } from 'react-i18next';
import { AttachmentPreview } from './AttachmentPreview';
import { PostActions } from './PostActions';
import type { Post } from '../types';
import ReactMarkdown from 'react-markdown';
import { UserAvatar } from '@/components/common/UserAvatar';
import { MessageCircleMore } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    <div className={`rounded-lg border bg-white p-4 shadow-sm ${className}`}>
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <UserAvatar src={post.authorAvatar} name={post.authorName} size="md" />
          <div>
            <p className="font-medium text-gray-900">{post.authorName}</p>
            <p className="text-sm text-gray-500">
              {formatDistanceToNow(post.createdAt, { addSuffix: true, locale: getLocaleDateFns() })}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {post.isPinned && (
            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
              {t('feed.post.badges.pinned')}
            </span>
          )}

          {post.type === 'announcement' && (
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
              {t('feed.post.badges.announcement')}
            </span>
          )}

          <PostActions post={post} onEdit={onEdit} onDelete={onDelete} onPin={onPin} />
        </div>
      </div>

      {/* Content */}
      <div className="mb-3">
        {post.title && <h3 className="mb-2 text-lg font-semibold text-gray-900">{post.title}</h3>}
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>

      {/* Attachments */}
      {post.attachments && post.attachments.length > 0 && (
        <div className="mb-3 space-y-2">
          {post.attachments.map((attachment) => (
            <AttachmentPreview key={attachment.id} attachment={attachment} />
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t pt-3">
        <Button onClick={onComment} className="flex items-center space-x-2" variant={'ghost'}>
          <MessageCircleMore className="h-5 w-5" />
          <span className="text-sm">
            {post.commentCount} {t('feed.post.actions.comment')}
          </span>
        </Button>
      </div>
    </div>
  );
};

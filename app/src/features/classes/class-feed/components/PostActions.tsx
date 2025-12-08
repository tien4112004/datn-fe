import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePostPermissions } from '../hooks';
import type { Post } from '../types';
import { Button } from '@/components/ui/button';
import { EllipsisVertical } from 'lucide-react';

interface PostActionsProps {
  post: Post;
  onEdit?: () => void;
  onDelete?: () => void;
  onPin?: (pinned: boolean) => void;
  className?: string;
}

export const PostActions = ({ post, onEdit, onDelete, onPin, className = '' }: PostActionsProps) => {
  const { t } = useTranslation('classes');
  const { canEdit, canDelete, canPin } = usePostPermissions(post);
  const [showMenu, setShowMenu] = useState(false);

  if (!canEdit && !canDelete && !canPin) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <Button onClick={() => setShowMenu(!showMenu)} variant={'ghost'}>
        <EllipsisVertical className="h-4 w-4" />
      </Button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />

          {/* Menu */}
          <div className="absolute right-0 z-20 mt-2 w-48 rounded-md border bg-white shadow-lg">
            <div className="py-1">
              {canEdit && onEdit && (
                <Button
                  onClick={() => {
                    onEdit();
                    setShowMenu(false);
                  }}
                  variant={'ghost'}
                >
                  {t('feed.post.actions.edit')}
                </Button>
              )}

              {canPin && onPin && (
                <Button
                  onClick={() => {
                    onPin(!post.isPinned);
                    setShowMenu(false);
                  }}
                  variant={'ghost'}
                >
                  {post.isPinned ? t('feed.post.actions.unpin') : t('feed.post.actions.pin')}
                </Button>
              )}

              {canDelete && onDelete && (
                <Button
                  onClick={() => {
                    onDelete();
                    setShowMenu(false);
                  }}
                  variant={'ghost'}
                  className="text-red-600 hover:text-red-800"
                >
                  {t('feed.post.actions.delete')}
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

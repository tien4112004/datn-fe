import { Separator } from '@/shared/components/ui/separator';
import { useTranslation } from 'react-i18next';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { CommentItem } from './CommentItem';
import type { Comment } from '../types';
import { CommentListLoading, CommentListEmpty } from '@/shared/components/comments';

interface CommentListProps {
  comments: Comment[];
  onEdit: (commentId: string) => (content: string, mentions: string[]) => Promise<void>;
  onDelete: (commentId: string) => () => Promise<void>;
  isLoading?: boolean;
}

export function CommentList({ comments, onEdit, onDelete, isLoading = false }: CommentListProps) {
  const { t } = useTranslation(I18N_NAMESPACES.COMMENTS);

  if (isLoading) {
    return <CommentListLoading message={t('loading')} />;
  }

  if (comments.length === 0) {
    return <CommentListEmpty title={t('empty.title')} description={t('empty.description')} />;
  }

  return (
    <div className="divide-y divide-gray-100">
      {comments.map((comment, index) => (
        <div key={comment.id}>
          <CommentItem comment={comment} onEdit={onEdit(comment.id)} onDelete={onDelete(comment.id)} />
          {index < comments.length - 1 && <Separator />}
        </div>
      ))}
    </div>
  );
}

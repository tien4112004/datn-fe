import { formatDistanceToNow } from 'date-fns';
import { getLocaleDateFns } from '@/shared/i18n/helper';
import { UserAvatar } from '@/shared/components/common/UserAvatar';
import { parseDateSafe } from '@/shared/utils/date';
import { cn } from '@/shared/lib/utils';

interface CommentHeaderProps {
  user: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
  timestamp: Date | string;
  size?: 'sm' | 'md';
  showEdited?: boolean;
  editedLabel?: string;
  className?: string;
}

export function CommentHeader({
  user,
  timestamp,
  size = 'sm',
  showEdited = false,
  editedLabel = '(edited)',
  className,
}: CommentHeaderProps) {
  const date = typeof timestamp === 'string' ? parseDateSafe(timestamp) : timestamp;
  const relativeTime = formatDistanceToNow(date, {
    addSuffix: true,
    locale: getLocaleDateFns(),
  });

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <UserAvatar src={user.avatarUrl || undefined} name={user.name} size={size} />
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-800">{user.name}</span>
        <span className="text-xs text-gray-500">{relativeTime}</span>
        {showEdited && <span className="text-xs text-gray-400">{editedLabel}</span>}
      </div>
    </div>
  );
}

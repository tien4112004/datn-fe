import { Button } from '@/shared/components/ui/button';
import { UserAvatar } from '@/shared/components/common/UserAvatar';
import { cn } from '@/shared/lib/utils';

interface CommentInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  placeholder?: string;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  maxLength?: number;
  showCancel?: boolean;
  autoFocus?: boolean;
  currentUser?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
  className?: string;
}

export function CommentInput({
  value,
  onChange,
  onSubmit,
  onCancel,
  placeholder = 'Write a comment...',
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  isSubmitting = false,
  maxLength,
  showCancel = false,
  autoFocus = false,
  currentUser,
  className,
}: CommentInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className={cn('flex gap-2', className)}>
      {currentUser && (
        <UserAvatar src={currentUser.avatarUrl || undefined} name={currentUser.name} size="sm" />
      )}
      <div className="flex-1">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={maxLength}
          autoFocus={autoFocus}
          disabled={isSubmitting}
          className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          rows={3}
        />
        <div className="mt-2 flex justify-end gap-2">
          {showCancel && onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel} disabled={isSubmitting}>
              {cancelLabel}
            </Button>
          )}
          <Button size="sm" onClick={onSubmit} disabled={!value.trim() || isSubmitting}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

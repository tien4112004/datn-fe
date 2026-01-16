import { Button } from '@/shared/components/ui/button';

interface CommentListErrorProps {
  error: Error | string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function CommentListError({ error, onRetry, retryLabel = 'Retry' }: CommentListErrorProps) {
  const message = typeof error === 'string' ? error : error.message;

  return (
    <div className="rounded-lg bg-red-50 p-4">
      <p className="text-sm text-red-600">{message}</p>
      {onRetry && (
        <Button variant="ghost" size="sm" onClick={onRetry} className="mt-2">
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

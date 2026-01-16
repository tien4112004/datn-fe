import { Loader2 } from 'lucide-react';

interface CommentListLoadingProps {
  message?: string;
}

export function CommentListLoading({ message = 'Loading comments...' }: CommentListLoadingProps) {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <p className="text-sm text-gray-500">{message}</p>
      </div>
    </div>
  );
}

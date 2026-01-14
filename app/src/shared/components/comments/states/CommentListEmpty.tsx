import { MessageSquare } from 'lucide-react';

interface CommentListEmptyProps {
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export function CommentListEmpty({
  title = 'No comments yet',
  description = 'Be the first to comment!',
  icon: Icon = MessageSquare,
}: CommentListEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Icon className="mb-2 h-8 w-8 text-gray-400" />
      <p className="mb-1 text-sm text-gray-500">{title}</p>
      <p className="text-xs text-gray-400">{description}</p>
    </div>
  );
}

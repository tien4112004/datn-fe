import { Eye, MessageSquare, Edit } from 'lucide-react';

interface PermissionBadgeProps {
  permission: 'read' | 'comment' | 'edit';
  isLoading?: boolean;
}

export function PermissionBadge({ permission, isLoading }: PermissionBadgeProps) {
  if (isLoading) {
    return <div className="h-5 w-16 animate-pulse rounded bg-gray-200" />;
  }

  const config = {
    read: { label: 'Viewer', color: 'bg-gray-100 text-gray-700', icon: Eye },
    comment: { label: 'Commenter', color: 'bg-blue-100 text-blue-700', icon: MessageSquare },
    edit: { label: 'Editor', color: 'bg-green-100 text-green-700', icon: Edit },
  };

  const { label, color, icon: Icon } = config[permission];

  return (
    <div className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${color}`}>
      <Icon className="h-3 w-3" />
      {label}
    </div>
  );
}

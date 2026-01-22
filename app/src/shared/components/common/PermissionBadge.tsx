import { Eye, MessageSquare, Edit } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PermissionBadgeProps {
  permission: 'read' | 'comment' | 'edit';
  isLoading?: boolean;
}

export function PermissionBadge({ permission, isLoading }: PermissionBadgeProps) {
  const { t } = useTranslation('common');

  if (isLoading) {
    return <div className="h-5 w-16 animate-pulse rounded bg-gray-200" />;
  }

  const config = {
    read: { labelKey: 'permission.viewer', color: 'bg-gray-100 text-gray-700', icon: Eye },
    comment: { labelKey: 'permission.commenter', color: 'bg-blue-100 text-blue-700', icon: MessageSquare },
    edit: { labelKey: 'permission.editor', color: 'bg-green-100 text-green-700', icon: Edit },
  };

  const { labelKey, color, icon: Icon } = config[permission];

  return (
    <div className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${color}`}>
      <Icon className="h-3 w-3" />
      {t(labelKey as any)}
    </div>
  );
}

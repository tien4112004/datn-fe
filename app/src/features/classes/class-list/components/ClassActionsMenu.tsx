import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@ui/dropdown-menu';
import { MoreHorizontal, Edit, Users, Trash2, Eye } from 'lucide-react';
import type { Class } from '../../shared/types';

interface ClassActionsMenuProps {
  classData: Class;
  onEdit?: (classData: Class) => void;
  onManageStudents?: (classData: Class) => void;
  onDelete?: (classData: Class) => void;
  align?: 'start' | 'center' | 'end';
  triggerClassName?: string;
}

export const ClassActionsMenu = ({
  classData,
  onEdit,
  onManageStudents,
  onDelete,
  align = 'end',
  triggerClassName,
}: ClassActionsMenuProps) => {
  const { t: tCommon } = useTranslation('common');
  const { t } = useTranslation('classes');

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={triggerClassName || 'h-8 w-8 p-0'}>
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        <DropdownMenuItem asChild>
          <Link to={`/classes/${classData.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            {tCommon('actions.view')}
          </Link>
        </DropdownMenuItem>

        {onEdit && (
          <DropdownMenuItem onClick={() => onEdit(classData)}>
            <Edit className="mr-2 h-4 w-4" />
            {tCommon('actions.edit')}
          </DropdownMenuItem>
        )}

        {onManageStudents && (
          <DropdownMenuItem onClick={() => onManageStudents(classData)}>
            <Users className="mr-2 h-4 w-4" />
            {t('table.actions.manageStudents')}
          </DropdownMenuItem>
        )}

        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(classData)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {tCommon('actions.delete')}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

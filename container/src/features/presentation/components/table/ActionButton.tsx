import { useTranslation } from 'react-i18next';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { EllipsisVerticalIcon, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ActionButtonProps = {
  onViewDetail?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onRename?: () => void;
};

const ActionButton = ({ onViewDetail, onEdit, onDelete, onRename }: ActionButtonProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <EllipsisVerticalIcon className="h-5 w-5 cursor-pointer text-gray-500 hover:text-gray-700" />
      </PopoverTrigger>
      <PopoverContent className="w-48">
        <ActionContent onEdit={onEdit} onDelete={onDelete} onViewDetail={onViewDetail} onRename={onRename} />
      </PopoverContent>
    </Popover>
  );
};

export default ActionButton;

export const ActionContent = ({ onViewDetail, onEdit, onDelete, onRename }: ActionButtonProps) => {
  const { t } = useTranslation('glossary');

  return (
    <div className="flex flex-col space-y-1">
      <Button onClick={onViewDetail} className="justify-start" variant={'ghost'}>
        <Eye className="mr-2 h-4 w-4" />
        {t('actions.viewDetails')}
      </Button>
      <Button onClick={onEdit} className="justify-start" variant={'ghost'}>
        <Edit className="mr-2 h-4 w-4" />
        {t('actions.edit')}
      </Button>
      <Button
        onClick={onDelete}
        className="justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
        variant={'ghost'}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        {t('actions.delete')}
      </Button>
      <Button onClick={onRename} className="justify-start" variant={'ghost'}>
        <Edit className="mr-2 h-4 w-4" />
        {t('actions.rename')}
      </Button>
    </div>
  );
};

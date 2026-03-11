import { useTranslation } from 'react-i18next';
import { Popover, PopoverTrigger, PopoverContent } from '@ui/popover';
import { EllipsisVerticalIcon, Eye, Edit, FileDown, Trash2, GraduationCap } from 'lucide-react';
import { Button } from '@ui/button';

type ActionButtonProps = {
  onViewDetail?: () => void;
  onDelete?: () => void;
  onRename?: () => void;
  onEditChapter?: () => void;
  onExport?: () => void;
};

const ActionButton = ({ onViewDetail, onDelete, onRename, onEditChapter, onExport }: ActionButtonProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <EllipsisVerticalIcon className="h-5 w-5 cursor-pointer text-gray-500 hover:text-gray-700" />
      </PopoverTrigger>
      <PopoverContent className="w-fit p-1">
        <ActionContent
          onDelete={onDelete}
          onViewDetail={onViewDetail}
          onRename={onRename}
          onEditChapter={onEditChapter}
          onExport={onExport}
        />
      </PopoverContent>
    </Popover>
  );
};

export default ActionButton;

export const ActionContent = ({
  onViewDetail,
  onDelete,
  onRename,
  onEditChapter,
  onExport,
}: ActionButtonProps) => {
  const { t } = useTranslation('glossary');

  return (
    <div className="flex flex-col space-y-1">
      <Button onClick={onViewDetail} className="justify-start" variant={'ghost'}>
        <Eye className="mr-2 h-4 w-4" />
        {t('actions.viewDetails')}
      </Button>
      {onExport && (
        <Button onClick={onExport} className="justify-start" variant={'ghost'}>
          <FileDown className="mr-2 h-4 w-4" />
          {t('actions.exportPdf')}
        </Button>
      )}
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
      {onEditChapter && (
        <Button onClick={onEditChapter} className="justify-start" variant={'ghost'}>
          <GraduationCap className="mr-2 h-4 w-4" />
          {t('actions.editChapter')}
        </Button>
      )}
    </div>
  );
};

import React from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { EllipsisVerticalIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ActionButtonProps = {
  onEdit?: () => void;
  onDelete?: () => void;
};

const ActionButton: React.FC<ActionButtonProps> = ({ onEdit, onDelete }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <EllipsisVerticalIcon className="h-5 w-5 cursor-pointer text-gray-500 hover:text-gray-700" />
      </PopoverTrigger>
      <PopoverContent className="w-48">
        <ul className="space-y-2">
          <li>
            <Button onClick={onEdit} className="w-full text-left" variant={'ghost'}>
              Edit
            </Button>
          </li>
          <li>
            <Button onClick={onDelete} className="w-full text-left" variant={'destructive'}>
              Delete
            </Button>
          </li>
        </ul>
      </PopoverContent>
    </Popover>
  );
};

export default ActionButton;

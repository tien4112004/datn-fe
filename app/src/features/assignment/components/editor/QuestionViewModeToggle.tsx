import { Eye, Edit } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { VIEW_MODE, type ViewMode } from '@aiprimary/core';

interface QuestionViewModeToggleProps {
  questionId: string;
  currentMode: ViewMode;
  onToggle: () => void;
}

export const QuestionViewModeToggle = ({ currentMode, onToggle }: QuestionViewModeToggleProps) => {
  const isEditing = currentMode === VIEW_MODE.EDITING;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button type="button" variant="ghost" size="sm" onClick={onToggle} className="h-8 w-8 p-0">
            {isEditing ? <Eye className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isEditing ? 'Preview' : 'Edit'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

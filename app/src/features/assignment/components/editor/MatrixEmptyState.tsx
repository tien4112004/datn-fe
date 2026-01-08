import { Plus, Wand2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/ui/tooltip';

interface MatrixEmptyStateProps {
  onOpenEditor: () => void;
}

export const MatrixEmptyState = ({ onOpenEditor }: MatrixEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">No assessment matrix configured</p>
      <div className="flex gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" disabled>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>AI generation coming soon</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button size="sm" onClick={onOpenEditor}>
          <Plus className="mr-2 h-4 w-4" />
          Create
        </Button>
      </div>
    </div>
  );
};

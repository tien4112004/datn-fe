import { Button } from '@/shared/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTreePanelStore } from '../../stores';

export const TreePanelHeader = () => {
  const isOpen = useTreePanelStore((state) => state.isOpen);
  const toggle = useTreePanelStore((state) => state.toggle);

  return (
    <div className="flex items-center justify-between border-b border-gray-200 p-4">
      <h2 className="text-base font-bold text-gray-800">Tree View</h2>
      <Button
        variant="ghost"
        size="sm"
        onClick={toggle}
        title={isOpen ? 'Collapse tree panel' : 'Expand tree panel'}
      >
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </Button>
    </div>
  );
};

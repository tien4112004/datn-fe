import { cn } from '@/shared/lib/utils';
import { useTreePanelStore } from '../../stores';
import { TreePanelHeader } from './TreePanelHeader';
import { TreePanelContent } from './TreePanelContent';

export const TreePanel = () => {
  const isOpen = useTreePanelStore((state) => state.isOpen);

  return (
    <div
      className={cn(
        'flex flex-col border-r border-gray-200',
        'bg-gradient-to-b from-white to-slate-50/95',
        'shadow-lg transition-all duration-300',
        isOpen ? 'w-64' : 'w-0 overflow-hidden'
      )}
    >
      <TreePanelHeader />
      <TreePanelContent />
    </div>
  );
};

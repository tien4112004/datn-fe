import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { HelpCircle } from 'lucide-react';
import { memo } from 'react';

const Instructions = memo(() => {
  return (
    <div className="absolute right-4 top-4 z-10">
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-md transition-colors hover:bg-white hover:text-gray-800">
            <HelpCircle size={20} />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="text-sm">
            <h3 className="mb-3 font-semibold">How to use:</h3>
            <ul className="space-y-2 text-xs">
              <li> Drag nodes to reposition</li>
              <li> Click a node and drag from handles to connect</li>
              <li> Double-click node text to edit</li>
              <li> Select nodes and press Delete key or use button</li>
              <li> Use mouse wheel to zoom and pan</li>
              <li>
                <strong>Ctrl+A:</strong> Select all nodes and edges
              </li>
              <li>
                <strong>Ctrl+C:</strong> Copy selected nodes/edges
              </li>
              <li>
                <strong>Ctrl+V:</strong> Paste at mouse position
              </li>
              <li>
                <strong>Ctrl+Z:</strong> Undo last action
              </li>
              <li>
                <strong>Ctrl+Y:</strong> Redo last undone action
              </li>
              <li> Click "Add Node" to create new nodes</li>
              <li> Multiple nodes can be selected together</li>
            </ul>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
});

export default Instructions;

import { Plus, Trash2, Undo, Redo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useMindmapStore } from '../../stores';
import { useReactFlow } from '@xyflow/react';
import type { Direction } from '../../types';

const Toolbar = () => {
  const addNode = useMindmapStore((state) => state.addNode);
  const deleteSelectedNodes = useMindmapStore((state) => state.deleteSelectedNodes);
  const logData = useMindmapStore((state) => state.logData);
  const undo = useMindmapStore((state) => state.undo);
  const redo = useMindmapStore((state) => state.redo);
  const canUndo = useMindmapStore((state) => !state.undoStack.isEmpty());
  const canRedo = useMindmapStore((state) => !state.redoStack.isEmpty());

  const onLayoutChange = useMindmapStore((state) => state.onLayoutChange);
  const { fitView } = useReactFlow();

  return (
    <div className="absolute left-4 top-4 z-10 flex gap-2">
      <SidebarTrigger className="-ml-1" />
      <Button onClick={addNode} title="Add new node" variant={'default'}>
        <Plus size={16} />
        Add Node
      </Button>
      <Button onClick={deleteSelectedNodes} title="Delete selected nodes" variant="destructive">
        <Trash2 size={16} />
        Delete Selected
      </Button>
      <Button variant={'outline'} onClick={logData}>
        <span className="sr-only">Log Nodes and Edges</span>
        <Trash2 size={16} />
        Log Data
      </Button>
      <Button variant="outline" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
        <Undo size={16} />
        Undo
      </Button>
      <Button variant="outline" onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)">
        <Redo size={16} />
        Redo
      </Button>

      <ToggleGroup
        type="single"
        defaultValue="horizontal"
        className="rounded-md border border-gray-300 bg-white shadow-sm"
        onValueChange={(value) => {
          onLayoutChange(value as Direction);
          fitView();
        }}
      >
        <ToggleGroupItem value="horizontal" className="px-4 py-2">
          Horizontal
        </ToggleGroupItem>
        <ToggleGroupItem value="vertical" className="px-4 py-2">
          Vertical
        </ToggleGroupItem>
        <ToggleGroupItem value="" className="px-4 py-2">
          None
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default Toolbar;

import { Plus, Trash2, Undo, Redo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useLayoutStore } from '../../stores/layout';
import { useUndoRedoStore, useCoreStore, useNodeOperationsStore } from '../../stores';
import { useReactFlow, useUpdateNodeInternals } from '@xyflow/react';
import type { Direction } from '../../types';

const Toolbar = () => {
  const addNode = useNodeOperationsStore((state) => state.addNode);
  const deleteSelectedNodes = useNodeOperationsStore((state) => state.markNodeForDeletion);
  const logData = useCoreStore((state) => state.logData);
  const undo = useUndoRedoStore((state) => state.undo);
  const redo = useUndoRedoStore((state) => state.redo);
  const canUndo = useUndoRedoStore((state) => !state.undoStack.isEmpty());
  const canRedo = useUndoRedoStore((state) => !state.redoStack.isEmpty());

  const onLayoutChange = useLayoutStore((state) => state.onLayoutChange);
  const { fitView } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();

  return (
    <div className="absolute left-4 top-4 z-10 flex gap-2">
      <Button
        onClick={() => {
          addNode();
        }}
        title="Add new node"
        variant={'default'}
      >
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
          onLayoutChange(value as Direction, updateNodeInternals);
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

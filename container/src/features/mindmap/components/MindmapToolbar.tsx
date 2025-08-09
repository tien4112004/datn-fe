import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMindmap } from '../context/MindmapContext';
import { useCallback } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const MindmapToolbar = () => {
  const { addNode, deleteSelectedNodes, nodes, edges, onLayoutChange } = useMindmap();

  const logData = useCallback(() => {
    console.log('Nodes:', nodes);
    console.log('Edges:', edges);
  }, [nodes, edges]);

  return (
    <div className="absolute left-4 top-4 z-10 flex gap-2">
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

      <ToggleGroup
        type="single"
        defaultValue="vertical"
        className="rounded-md border border-gray-300 bg-white shadow-sm"
        onValueChange={onLayoutChange}
      >
        <ToggleGroupItem value="horizontal" className="px-4 py-2">
          Horizontal
        </ToggleGroupItem>
        <ToggleGroupItem value="vertical" className="px-4 py-2">
          Vertical
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default MindmapToolbar;

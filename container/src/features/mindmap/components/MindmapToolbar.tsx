import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMindmap } from '../context/MindmapContext';
import { useCallback } from 'react';

const MindmapToolbar = () => {
  const { addNode, deleteSelectedNodes, nodes, edges } = useMindmap();

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
    </div>
  );
};

export default MindmapToolbar;

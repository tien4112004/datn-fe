import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMindmapStore } from '../stores/useMindmapStore';
import { useEffect } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useLayoutStore } from '../stores/useLayoutStore';
import type { Direction } from '../constants';
import { SidebarTrigger } from '@/components/ui/sidebar';

const MindmapToolbar = () => {
  const addNode = useMindmapStore((state) => state.addNode);
  const deleteSelectedNodes = useMindmapStore((state) => state.deleteSelectedNodes);
  const logData = useMindmapStore((state) => state.logData);

  const onLayoutChange = useLayoutStore((state) => state.onLayoutChange);

  useEffect(() => {
    onLayoutChange('horizontal');
  }, [onLayoutChange]);

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
      <ToggleGroup
        type="single"
        defaultValue="horizontal"
        className="rounded-md border border-gray-300 bg-white shadow-sm"
        onValueChange={(value) => {
          onLayoutChange(value as Direction);
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

export default MindmapToolbar;

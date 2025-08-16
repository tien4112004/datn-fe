import { memo } from 'react';
import { cn } from '@/shared/lib/utils';
import { SHAPES, type Shape } from '../../types/constants';
import type { ShapeNode } from '../../types';
import { BaseNodeBlock, BaseNodeControl } from './BaseNode';
import type { NodeProps } from '@xyflow/react';
import { useMindmapNodeCommon } from '../../hooks';
import { Button } from '@/components/ui/button';
import { useLayoutStore, useNodeOperationsStore } from '../../stores';
import { Network } from 'lucide-react';

const ShapeNodeBlock = memo(
  ({ ...node }: NodeProps<ShapeNode>) => {
    const { id, data, selected: isSelected, width, height } = node;

    const { layout } = useMindmapNodeCommon<ShapeNode>({ node });
    const updateNodeData = useNodeOperationsStore((state) => state.updateNodeData);
    const updateSubtreeLayout = useLayoutStore((state) => state.updateSubtreeLayout);

    const handleShapeChange = (newShape: Shape) => {
      updateNodeData(id, { shape: newShape });
    };

    const handleLayoutClick = () => {
      updateSubtreeLayout(id, layout);
    };

    return (
      <BaseNodeBlock node={node} variant="replacing">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="h-full w-full"
          viewBox={`0 0 ${width || 200} ${height || 100}`}
        >
          {data.shape === SHAPES.CIRCLE && (
            <circle
              cx={width ? width / 2 : 100}
              cy={height ? height / 2 : 50}
              r={Math.min(width || 200, height || 100) / 2 - 5}
              fill={data.metadata?.fill || 'lightblue'}
              stroke={data.metadata?.stroke || 'blue'}
              strokeWidth={data.metadata?.strokeWidth || 2}
            />
          )}
          {data.shape === SHAPES.ELLIPSE && (
            <ellipse
              cx={width ? width / 2 : 100}
              cy={height ? height / 2 : 50}
              rx={(width || 200) / 2 - 5}
              ry={(height || 100) / 2 - 5}
              fill={data.metadata?.fill || 'lightgreen'}
              stroke={data.metadata?.stroke || 'green'}
              strokeWidth={data.metadata?.strokeWidth || 2}
            />
          )}
          {(!data.shape || data.shape === SHAPES.RECTANGLE) && (
            <rect
              x="5"
              y="5"
              width={(width || 200) - 10}
              height={(height || 100) - 10}
              fill={data.metadata?.fill || 'lightblue'}
              stroke={data.metadata?.stroke || 'blue'}
              strokeWidth={data.metadata?.strokeWidth || 2}
              rx={data.metadata?.borderRadius || 8}
              ry={data.metadata?.borderRadius || 8}
            />
          )}
        </svg>

        <BaseNodeControl layout={layout} isSelected={isSelected ?? false}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLayoutClick}
            className="h-6 w-6 p-1"
            title="Update Subtree Layout"
          >
            <Network className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleShapeChange(SHAPES.RECTANGLE)}
            className={cn('h-6 w-6 p-1', (!data.shape || data.shape === SHAPES.RECTANGLE) && 'bg-accent')}
            title="Rectangle"
          >
            <svg className="h-3 w-3" viewBox="0 0 12 8" fill="currentColor">
              <rect width="12" height="8" rx="1" />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleShapeChange(SHAPES.CIRCLE)}
            className={cn('h-6 w-6 p-1', data.shape === SHAPES.CIRCLE && 'bg-accent')}
            title="Circle"
          >
            <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
              <circle cx="6" cy="6" r="6" />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleShapeChange(SHAPES.ELLIPSE)}
            className={cn('h-6 w-6 p-1', data.shape === SHAPES.ELLIPSE && 'bg-accent')}
            title="Ellipse"
          >
            <svg className="h-3 w-3" viewBox="0 0 12 8" fill="currentColor">
              <ellipse cx="6" cy="4" rx="6" ry="4" />
            </svg>
          </Button>
        </BaseNodeControl>
      </BaseNodeBlock>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if these specific properties change
    return (
      prevProps.id === nextProps.id &&
      prevProps.data === nextProps.data &&
      prevProps.selected === nextProps.selected &&
      prevProps.dragging === nextProps.dragging &&
      prevProps.width === nextProps.width &&
      prevProps.height === nextProps.height
    );
  }
);

export default ShapeNodeBlock;

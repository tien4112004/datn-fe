import { memo } from 'react';
import { cn } from '@/shared/lib/utils';
import { DIRECTION } from '../../types/constants';
import type { ShapeNode } from '../../types';
import { BaseNodeBlock } from './BaseNode';
import type { NodeProps } from '@xyflow/react';
import { useMindmapNodeCommon } from '../../hooks';
import { Button } from '@/components/ui/button';

const ShapeNodeBlock = memo(
  ({ ...node }: NodeProps<ShapeNode>) => {
    const { id, data, selected: isSelected, width, height } = node;

    const { layout, updateNodeData } = useMindmapNodeCommon<ShapeNode>({ node });

    const handleShapeChange = (newShape: 'rectangle' | 'circle' | 'ellipse') => {
      updateNodeData(id, { shape: newShape });
    };

    return (
      <BaseNodeBlock node={node} variant="replacing">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="h-full w-full"
          viewBox={`0 0 ${width || 200} ${height || 100}`}
        >
          {data.shape === 'circle' && (
            <circle
              cx={width ? width / 2 : 100}
              cy={height ? height / 2 : 50}
              r={Math.min(width || 200, height || 100) / 2 - 5}
              fill={data.metadata?.fill || 'lightblue'}
              stroke={data.metadata?.stroke || 'blue'}
              strokeWidth={data.metadata?.strokeWidth || 2}
            />
          )}
          {data.shape === 'ellipse' && (
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
          {(!data.shape || data.shape === 'rectangle') && (
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

        {/* Shape selector */}
        <div
          className={cn(
            layout === DIRECTION.VERTICAL
              ? 'right-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+24px)] flex-col'
              : 'left-1/2 top-0 -translate-x-1/2 -translate-y-[calc(100%+24px)] flex-row',
            'bg-muted absolute z-[1000] flex items-center justify-center gap-1 rounded-sm transition-all duration-200',
            isSelected ? 'visible opacity-100' : 'invisible opacity-0'
          )}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleShapeChange('rectangle')}
            className={cn('h-6 w-6 p-1', (!data.shape || data.shape === 'rectangle') && 'bg-accent')}
            title="Rectangle"
          >
            <svg className="h-3 w-3" viewBox="0 0 12 8" fill="currentColor">
              <rect width="12" height="8" rx="1" />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleShapeChange('circle')}
            className={cn('h-6 w-6 p-1', data.shape === 'circle' && 'bg-accent')}
            title="Circle"
          >
            <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
              <circle cx="6" cy="6" r="6" />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleShapeChange('ellipse')}
            className={cn('h-6 w-6 p-1', data.shape === 'ellipse' && 'bg-accent')}
            title="Ellipse"
          >
            <svg className="h-3 w-3" viewBox="0 0 12 8" fill="currentColor">
              <ellipse cx="6" cy="4" rx="6" ry="4" />
            </svg>
          </Button>
        </div>
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

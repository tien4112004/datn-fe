import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, memo } from 'react';
import { Position, useNodeConnections, useUpdateNodeInternals, type NodeProps } from '@xyflow/react';
import { BaseNode, BaseNodeContent } from '@/components/base-node';
import { cn } from '@/shared/lib/utils';
import { useMindmapStore } from '../stores/useMindmapStore';
import { DIRECTION } from '../constants';
import { AnimatePresence, motion } from 'motion/react';
import { BaseHandle } from '@/shared/components/base-handle';
import { useLayoutStore } from '../stores/useLayoutStore';
import type { MindMapShapeNode } from '../types';

const MindMapShapeNodeBlock = memo(({ ...node }: NodeProps<MindMapShapeNode>) => {
  const { data, selected, id } = node;
  const addChildNode = useMindmapStore((state) => state.addChildNode);
  const updateNodeData = useMindmapStore((state) => state.updateNodeData);
  const finalizeNodeDeletion = useMindmapStore((state) => state.finalizeNodeDeletion);
  const layout = useLayoutStore((state) => state.layout);
  const isLayouting = useLayoutStore((state) => state.isLayouting);
  const updateNodeInternals = useUpdateNodeInternals();
  const [isMouseOver, setIsMouseOver] = useState(false);

  const handleShapeChange = (newShape: 'rectangle' | 'circle' | 'ellipse') => {
    updateNodeData(id, { shape: newShape });
  };

  const connections = useNodeConnections({ id });

  useEffect(() => {
    updateNodeInternals(id);
  }, [layout, isLayouting]);

  const canCreateLeft =
    !connections.some(
      (conn) => conn.sourceHandle === `first-source-${id}` || conn.targetHandle === `first-target-${id}`
    ) || node.data.level === 0;

  //   const canCreateRight =
  //     !connections.some(
  //       (conn) => conn.sourceHandle === `second-source-${id}` || conn.targetHandle === `second-target-${id}`
  //     ) || node.data.level === 0;

  const canCreateRight = true; // Temporarily allow right connections for simplicity

  return (
    <AnimatePresence>
      <motion.div
        key={id}
        initial={{ opacity: 0, scale: 0 }}
        animate={data.isDeleting ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], type: 'tween' }}
        onAnimationComplete={() => {
          if (data.isDeleting) {
            finalizeNodeDeletion();
          }
        }}
      >
        <BaseNode
          className={cn(
            `rounded-lg border-2 shadow-md`,
            selected ? 'ring-2' : 'ring-0',
            isLayouting && 'shadow-lg ring-2 ring-blue-300'
          )}
          onMouseEnter={() => setIsMouseOver(true)}
          onMouseLeave={() => setIsMouseOver(false)}
        >
          <BaseNodeContent>
            {data.shape === 'circle' && (
              <circle
                cx={data.width ? data.width / 2 : 100}
                cy={data.height ? data.height / 2 : 100}
                r={Math.min(data.width || 200, data.height || 200) / 2 - 10}
                fill={data.metadata?.fill || 'lightblue'}
                stroke={data.metadata?.stroke || 'blue'}
                strokeWidth={data.metadata?.strokeWidth || 2}
              />
            )}
            {data.shape === 'ellipse' && (
              <ellipse
                cx={data.width ? data.width / 2 : 150}
                cy={data.height ? data.height / 2 : 75}
                rx={(data.width || 300) / 2 - 10}
                ry={(data.height || 150) / 2 - 10}
                fill={data.metadata?.fill || 'lightgreen'}
                stroke={data.metadata?.stroke || 'green'}
                strokeWidth={data.metadata?.strokeWidth || 2}
              />
            )}
            {(!data.shape || data.shape === 'rectangle') && (
              <rect
                width={data.width || 200}
                height={data.height || 100}
                fill={data.metadata?.fill || 'lightblue'}
                stroke={data.metadata?.stroke || 'blue'}
                strokeWidth={data.metadata?.strokeWidth || 2}
                rx={data.metadata?.borderRadius || 10}
                ry={data.metadata?.borderRadius || 10}
              />
            )}
          </BaseNodeContent>

          <Button
            onClick={() =>
              addChildNode(
                node,
                { x: node.positionAbsoluteX - 250, y: node.positionAbsoluteY },
                `first-source-${id}`
              )
            }
            disabled={!canCreateLeft}
            size="icon"
            variant="outline"
            className={cn(
              'bg-accent absolute z-[1000] cursor-pointer rounded-full transition-all duration-200',
              (isMouseOver || selected) && canCreateLeft ? 'visible opacity-100' : 'invisible opacity-0',
              layout === DIRECTION.VERTICAL
                ? 'left-1/2 top-0 -translate-x-1/2 -translate-y-[calc(100%+24px)]'
                : 'left-0 top-1/2 -translate-x-[calc(100%+24px)] -translate-y-1/2'
            )}
          >
            <Plus />
          </Button>

          <Button
            onClick={() =>
              addChildNode(
                node,
                { x: node.positionAbsoluteX + 250, y: node.positionAbsoluteY },
                `second-source-${id}`
              )
            }
            disabled={!canCreateRight}
            size="icon"
            variant="outline"
            className={cn(
              'bg-accent absolute z-[1000] cursor-pointer rounded-full transition-all duration-200',
              (isMouseOver || selected) && canCreateRight ? 'visible opacity-100' : 'invisible opacity-0',
              layout === DIRECTION.VERTICAL
                ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-[calc(100%+24px)]'
                : 'right-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+24px)]'
            )}
          >
            <Plus />
          </Button>

          {/* Shape selector */}
          <div
            className={cn(
              layout === DIRECTION.VERTICAL
                ? 'right-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+24px)] flex-col'
                : 'left-1/2 top-0 -translate-x-1/2 -translate-y-[calc(100%+24px)] flex-row',
              'bg-muted absolute z-[1000] flex items-center justify-center gap-1 rounded-sm transition-all duration-200',
              selected ? 'visible opacity-100' : 'invisible opacity-0'
            )}
          >
            <button
              onClick={() => handleShapeChange('rectangle')}
              className={cn(
                'hover:bg-accent cursor-pointer rounded-sm p-1',
                (!data.shape || data.shape === 'rectangle') && 'bg-accent'
              )}
              title="Rectangle"
            >
              <svg className="h-3 w-3" viewBox="0 0 12 8" fill="currentColor">
                <rect width="12" height="8" rx="1" />
              </svg>
            </button>
            <button
              onClick={() => handleShapeChange('circle')}
              className={cn(
                'hover:bg-accent cursor-pointer rounded-sm p-1',
                data.shape === 'circle' && 'bg-accent'
              )}
              title="Circle"
            >
              <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
                <circle cx="6" cy="6" r="6" />
              </svg>
            </button>
            <button
              onClick={() => handleShapeChange('ellipse')}
              className={cn(
                'hover:bg-accent cursor-pointer rounded-sm p-1',
                data.shape === 'ellipse' && 'bg-accent'
              )}
              title="Ellipse"
            >
              <svg className="h-3 w-3" viewBox="0 0 12 8" fill="currentColor">
                <ellipse cx="6" cy="4" rx="6" ry="4" />
              </svg>
            </button>
          </div>

          {/* Invisible handles for connections */}
          <BaseHandle
            type="source"
            position={layout === DIRECTION.VERTICAL ? Position.Top : Position.Left}
            style={{ visibility: 'hidden' }}
            id={`first-source-${id}`}
          />
          <BaseHandle
            type="source"
            position={layout === DIRECTION.VERTICAL ? Position.Bottom : Position.Right}
            style={{ visibility: 'hidden' }}
            id={`second-source-${id}`}
          />
          <BaseHandle
            type="target"
            position={layout === DIRECTION.VERTICAL ? Position.Top : Position.Left}
            style={{ visibility: 'hidden' }}
            id={`first-target-${id}`}
          />
          <BaseHandle
            type="target"
            position={layout === DIRECTION.VERTICAL ? Position.Bottom : Position.Right}
            style={{ visibility: 'hidden' }}
            id={`second-target-${id}`}
          />
        </BaseNode>
      </motion.div>
    </AnimatePresence>
  );
});

export default MindMapShapeNodeBlock;

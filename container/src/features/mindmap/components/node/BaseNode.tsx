import { forwardRef, type ReactNode, type HTMLAttributes, useCallback, memo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BaseNode } from '@/features/mindmap/components/ui/base-node';
import { cn } from '@/shared/lib/utils';
import type { MindMapNode } from '@/features/mindmap/types';
import { NodeResizer, Position, type NodeProps } from '@xyflow/react';
import { DIRECTION, type Direction } from '@/features/mindmap/constants';
import { BaseHandle } from '../ui/base-handle';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMindmapNodeCommon } from '@/features/mindmap/hooks';

export interface BaseNodeBlockProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children: ReactNode;
  node: NodeProps<MindMapNode>;
  variant?: 'card' | 'replacing';
}

export const BaseNodeBlock = forwardRef<HTMLDivElement, BaseNodeBlockProps>(
  ({ className, children, variant = 'card', node, ...props }, ref) => {
    const { id, data, selected: isSelected } = node;

    const { isMouseOver, setIsMouseOver, layout, isLayouting, addChildNode, onNodeDelete } =
      useMindmapNodeCommon<MindMapNode>({
        node,
      });

    const handleAnimationComplete = useCallback(() => {
      if (data.isDeleting && onNodeDelete) {
        onNodeDelete();
      }
    }, [data.isDeleting, onNodeDelete]);

    const onMouseEnter = useCallback(() => {
      setIsMouseOver(true);
    }, [setIsMouseOver]);

    const onMouseLeave = useCallback(() => {
      setIsMouseOver(false);
    }, [setIsMouseOver]);

    const baseStyles = '';

    const cardStyles = cn(
      'bg-card text-card-foreground relative',
      'hover:ring-1',
      '[.react-flow\\_\\_node.selected_&]:border-muted-foreground',
      '[.react-flow\\_\\_node.selected_&]:shadow-lg',
      isLayouting && 'shadow-lg ring-2 ring-blue-300',
      'rounded-md border rounded-lg border-2 shadow-md'
    );

    return (
      <AnimatePresence>
        <motion.div
          key={id}
          initial={{ opacity: 0, scale: 0 }}
          animate={data.isDeleting ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], type: 'tween' }}
          onAnimationComplete={handleAnimationComplete}
        >
          {variant === 'card' ? (
            <BaseNode
              ref={ref}
              className={cn(cardStyles, className)}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              tabIndex={0}
              {...props}
            >
              {children}
              <NodeResizer color="#ff0071" isVisible={isSelected} minWidth={100} minHeight={30} />
              <NodeHandlers layout={layout} id={id} />
              <CreateChildNodeButtons
                node={node}
                addChildNode={addChildNode}
                isMouseOver={isMouseOver}
                isSelected={isSelected}
                layout={layout}
              />
            </BaseNode>
          ) : (
            <div
              ref={ref}
              className={cn(baseStyles, className)}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              tabIndex={0}
              {...props}
            >
              {children}
              <NodeResizer color="#ff0071" isVisible={isSelected} minWidth={100} minHeight={30} />
              <NodeHandlers layout={layout} id={id} />
              <CreateChildNodeButtons
                node={node}
                addChildNode={addChildNode}
                isMouseOver={isMouseOver}
                isSelected={isSelected}
                layout={layout}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }
);

export const NodeHandlers = memo(({ layout, id }: { layout: Direction; id: string }) => {
  return (
    <>
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
    </>
  );
});

export const CreateChildNodeButtons = memo(
  ({
    node,
    addChildNode,
    isMouseOver,
    isSelected,
    layout,
  }: {
    node: NodeProps<MindMapNode>;
    addChildNode: any;
    isMouseOver: boolean;
    isSelected: boolean;
    layout: Direction;
  }) => {
    const canCreateLeft = node.data.side === 'left' || node.data.side === 'mid';
    const canCreateRight = node.data.side === 'right' || node.data.side === 'mid';
    return (
      <>
        {/* Add Child Buttons */}
        <Button
          onClick={() =>
            addChildNode(node, { x: node.positionAbsoluteX - 250, y: node.positionAbsoluteY }, 'left')
          }
          size="icon"
          variant="outline"
          className={cn(
            'bg-accent absolute z-[1000] cursor-pointer rounded-full transition-all duration-200',
            (isMouseOver || isSelected) && canCreateLeft ? 'visible opacity-100' : 'invisible opacity-0',
            layout === DIRECTION.VERTICAL
              ? 'left-1/2 top-0 -translate-x-1/2 -translate-y-[calc(100%+24px)]'
              : 'left-0 top-1/2 -translate-x-[calc(100%+24px)] -translate-y-1/2'
          )}
        >
          <Plus />
        </Button>

        <Button
          onClick={() =>
            addChildNode(node, { x: node.positionAbsoluteX + 250, y: node.positionAbsoluteY }, 'right')
          }
          size="icon"
          variant="outline"
          className={cn(
            'bg-accent absolute z-[1000] cursor-pointer rounded-full transition-all duration-200',
            (isMouseOver || isSelected) && canCreateRight ? 'visible opacity-100' : 'invisible opacity-0',
            layout === DIRECTION.VERTICAL
              ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-[calc(100%+24px)]'
              : 'right-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+24px)]'
          )}
        >
          <Plus />
        </Button>
      </>
    );
  }
);

BaseNodeBlock.displayName = 'MindmapNodeBase';

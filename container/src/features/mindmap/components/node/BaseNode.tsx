import { type ReactNode, type HTMLAttributes, useCallback, memo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BaseNode } from '@/features/mindmap/components/ui/base-node';
import { cn } from '@/shared/lib/utils';
import type { MindMapNode } from '@/features/mindmap/types';
import { NodeResizer, Position, type NodeProps } from '@xyflow/react';
import { DIRECTION, type Direction } from '@/features/mindmap/types/constants';
import { BaseHandle } from '../ui/base-handle';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMindmapNodeCommon } from '@/features/mindmap/hooks';

export interface BaseNodeBlockProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children: ReactNode;
  node: NodeProps<MindMapNode>;
  variant?: 'card' | 'replacing';
}

export const BaseNodeBlock = memo(
  ({ className, children, variant = 'card', node, ...props }: BaseNodeBlockProps) => {
    const { id, data, selected: isSelected, width, height } = node;

    const [isMouseOver, setIsMouseOver] = useState(false);

    const { layout, isLayouting, addChildNode, onNodeDelete } = useMindmapNodeCommon<MindMapNode>({
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
          animate={data && data.isDeleting ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], type: 'tween' }}
          onAnimationComplete={handleAnimationComplete}
        >
          {variant === 'card' ? (
            <BaseNode
              className={cn(cardStyles, className)}
              style={{
                width: width ? `${width}px` : undefined,
                minHeight: height ? `${height}px` : undefined,
                ...props.style,
              }}
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
                isSelected={isSelected ?? false}
                layout={layout}
              />
            </BaseNode>
          ) : (
            <div
              className={cn(baseStyles, className)}
              style={{
                width: width ? `${width}px` : undefined,
                minHeight: height ? `${height}px` : undefined,
                ...props.style,
              }}
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
                isSelected={isSelected ?? false}
                layout={layout}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render BaseNode if these specific properties change
    const prevNode = prevProps.node;
    const nextNode = nextProps.node;

    return (
      prevNode.id === nextNode.id &&
      prevNode.selected === nextNode.selected &&
      prevNode.dragging === nextNode.dragging &&
      prevNode.width === nextNode.width &&
      prevNode.height === nextNode.height &&
      prevNode.data?.isDeleting === nextNode.data?.isDeleting &&
      prevProps.variant === nextProps.variant
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

interface CreateChildNodeButtonsProps {
  node: NodeProps<MindMapNode>;
  addChildNode: any;
  isMouseOver: boolean;
  isSelected: boolean;
  layout: Direction;
}

export const CreateChildNodeButtons = memo(
  ({ node, addChildNode, isMouseOver, isSelected, layout }: CreateChildNodeButtonsProps) => {
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
  },
  (prevProps, nextProps) => {
    // Only re-render if these specific properties change
    return (
      prevProps.node.id === nextProps.node.id &&
      prevProps.layout === nextProps.layout &&
      (prevProps.isMouseOver || prevProps.isSelected) === (nextProps.isMouseOver || nextProps.isSelected)
    );
  }
);

BaseNodeBlock.displayName = 'MindmapNodeBase';

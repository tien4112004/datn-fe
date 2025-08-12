import { forwardRef, type ReactNode, type HTMLAttributes } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BaseNode } from '@/features/mindmap/components/ui/base-node';
import { cn } from '@/shared/lib/utils';
import type { MindMapNode } from '@/features/mindmap/types';
import { NodeResizer } from '@xyflow/react';

export interface BaseNodeBlockProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  id: string;
  data: MindMapNode['data'];
  isSelected: boolean;
  isLayouting: boolean;
  isMouseOver: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onAnimationComplete?: () => void;
  children: ReactNode;
  variant?: 'card' | 'replacing';
}

export const BaseNodeBlock = forwardRef<HTMLDivElement, BaseNodeBlockProps>(
  (
    {
      id,
      data,
      isSelected,
      isLayouting,
      isMouseOver,
      onMouseEnter,
      onMouseLeave,
      onAnimationComplete,
      className,
      children,
      variant = 'card',
      ...props
    },
    ref
  ) => {
    const handleAnimationComplete = () => {
      if (data.isDeleting && onAnimationComplete) {
        onAnimationComplete();
      }
    };

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
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }
);

BaseNodeBlock.displayName = 'MindmapNodeBase';

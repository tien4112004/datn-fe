import { forwardRef, type ReactNode, type HTMLAttributes } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BaseNode } from '@/features/mindmap/components/ui/base-node';
import { cn } from '@/shared/lib/utils';
import type { MindMapNode } from '../../types';

export interface MindmapNodeBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  nodeId: string;
  nodeData: MindMapNode['data'];
  isSelected: boolean;
  isLayouting: boolean;
  isMouseOver: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onAnimationComplete?: () => void;
  children: ReactNode;
  variant?: 'card' | 'replacing';
}

export const MindmapNodeBase = forwardRef<HTMLDivElement, MindmapNodeBaseProps>(
  (
    {
      nodeId,
      nodeData,
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
      if (nodeData.isDeleting && onAnimationComplete) {
        onAnimationComplete();
      }
    };

    const baseStyles = cn('w-fit h-fit p-2');

    const cardStyles = cn(
      'bg-card text-card-foreground relative',
      'hover:ring-1',
      '[.react-flow\\_\\_node.selected_&]:border-muted-foreground',
      '[.react-flow\\_\\_node.selected_&]:shadow-lg',
      isSelected ? 'ring-2' : 'ring-0',
      isLayouting && 'shadow-lg ring-2 ring-blue-300',
      'rounded-md border rounded-lg border-2 shadow-md'
    );

    return (
      <AnimatePresence>
        <motion.div
          key={nodeId}
          initial={{ opacity: 0, scale: 0 }}
          animate={nodeData.isDeleting ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }}
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
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }
);

MindmapNodeBase.displayName = 'MindmapNodeBase';

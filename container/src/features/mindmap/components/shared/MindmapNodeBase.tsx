import { type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BaseNode, BaseNodeContent } from '@/features/mindmap/components/ui/base-node';
import { cn } from '@/shared/lib/utils';
import type { MindMapNode } from '../../types';

export interface MindmapNodeBaseProps {
  nodeId: string;
  nodeData: MindMapNode['data'];
  isSelected: boolean;
  isLayouting: boolean;
  isMouseOver: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onAnimationComplete?: () => void;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}

export const MindmapNodeBase = ({
  nodeId,
  nodeData,
  isSelected,
  isLayouting,
  isMouseOver,
  onMouseEnter,
  onMouseLeave,
  onAnimationComplete,
  className,
  contentClassName,
  children,
}: MindmapNodeBaseProps) => {
  const handleAnimationComplete = () => {
    if (nodeData.isDeleting && onAnimationComplete) {
      onAnimationComplete();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key={nodeId}
        initial={{ opacity: 0, scale: 0 }}
        animate={nodeData.isDeleting ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], type: 'tween' }}
        onAnimationComplete={handleAnimationComplete}
      >
        <BaseNode
          className={cn(
            'rounded-lg border-2 shadow-md',
            isSelected ? 'ring-2' : 'ring-0',
            isLayouting && 'shadow-lg ring-2 ring-blue-300',
            className
          )}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <BaseNodeContent className={contentClassName}>{children}</BaseNodeContent>
        </BaseNode>
      </motion.div>
    </AnimatePresence>
  );
};

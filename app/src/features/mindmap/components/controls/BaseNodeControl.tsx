import { memo, useMemo, type ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';
import { LAYOUT_TYPE } from '../../types';
import type { LayoutType } from '../../types';
import { useShallow } from 'zustand/react/shallow';
import { useCoreStore } from '../../stores';

export interface BaseNodeControlProps {
  layoutType: LayoutType;
  children: ReactNode;
  spacing?: 'sm' | 'lg';
  padding?: boolean;
  className?: string;
  selected?: boolean;
  dragging?: boolean;
}

// Optimized selector for BaseNodeControl
const selectedNodeCountSelector = (state: any) => state.selectedNodeIds.size;

/**
 * Check if layout is vertical (controls should be on the side)
 */
const isVerticalLayout = (layoutType: LayoutType): boolean => {
  return (
    layoutType === LAYOUT_TYPE.VERTICAL_BALANCED ||
    layoutType === LAYOUT_TYPE.TOP_ONLY ||
    layoutType === LAYOUT_TYPE.BOTTOM_ONLY
  );
};

export const BaseNodeControl = memo(
  ({
    layoutType,
    children,
    spacing = 'lg',
    padding = false,
    className,
    selected,
    dragging,
  }: BaseNodeControlProps) => {
    const selectedNodeCount = useCoreStore(useShallow(selectedNodeCountSelector));
    const offset = spacing === 'sm' ? '12px' : '24px';

    // Memoized className calculation
    const controlClassName = useMemo(
      () =>
        cn(
          isVerticalLayout(layoutType)
            ? `right-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+${offset})] flex-col`
            : `left-1/2 top-0 -translate-x-1/2 -translate-y-[calc(100%+${offset})] flex-row`,
          'bg-muted absolute z-[1000] flex items-center justify-center gap-1 rounded-sm transition-all duration-200',
          padding && 'p-1',
          selected ? 'visible opacity-100' : 'invisible opacity-0',
          className
        ),
      [layoutType, offset, padding, selected, className]
    );

    // Early return for multiple selections
    if (selectedNodeCount > 1 || dragging) {
      return null;
    }

    return <div className={controlClassName}>{children}</div>;
  },
  (prevProps, nextProps) => {
    return (
      prevProps.layoutType === nextProps.layoutType &&
      prevProps.spacing === nextProps.spacing &&
      prevProps.padding === nextProps.padding &&
      prevProps.className === nextProps.className &&
      prevProps.children === nextProps.children &&
      prevProps.selected === nextProps.selected &&
      prevProps.dragging === nextProps.dragging
    );
  }
);

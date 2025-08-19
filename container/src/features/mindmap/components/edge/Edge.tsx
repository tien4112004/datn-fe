import {
  type ConnectionLineComponentProps,
  type EdgeProps,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
} from '@xyflow/react';
import { memo } from 'react';
import type { MindMapEdge, PathType, RootNode } from '../../types';
import { motion } from 'motion/react';
import { getOppositePosition } from '../../services/utils';
import { useMindmapStore } from '../../stores';

const getEdgePath = (type: PathType, props: any) => {
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition } = props;

  switch (type) {
    case 'smoothstep':
      return getSmoothStepPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        borderRadius: 20,
      });
    case 'bezier':
      return getBezierPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
      });
    case 'straight':
      return getStraightPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
      });
    default:
      return getBezierPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        curvature: 0.25,
      });
  }
};

const EdgeBlock = memo(
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    selected,
  }: EdgeProps<MindMapEdge> & { pathType: PathType }) => {
    const [edgePath] = getEdgePath(data?.pathType || 'smoothstep', {
      id,
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
    });

    return (
      <motion.path
        id={id}
        key={`edge-${id}`}
        d={edgePath}
        fill="none"
        stroke={data?.strokeColor || 'var(--primary)'}
        strokeWidth={selected ? (data?.strokeWidth || 2) + 1 : data?.strokeWidth || 2}
        style={{
          filter: selected ? 'drop-shadow(0 0 4px var(--primary))' : undefined,
        }}
        animate={
          data && data.isDeleting
            ? { opacity: 0, scale: 0 }
            : data?.isCollapsed
              ? { opacity: 0, scale: 0.8 }
              : { opacity: 1, scale: 1 }
        }
        exit={{ opacity: 0, scale: 0 }}
        initial={{ opacity: 1, scale: 1 }}
        transition={{
          duration: data?.isCollapsed ? 0.2 : 0.6,
          ease: [0.25, 0.46, 0.45, 0.94],
          type: 'tween',
          delay: data?.isCollapsed ? 0 : 0.1,
        }}
      />
    );
  }
);

export const ConnectionLine = ({
  fromX,
  fromY,
  toX,
  toY,
  fromHandle,
  fromNode,
}: ConnectionLineComponentProps) => {
  const getRoot = useMindmapStore((state) => state.getRoot);

  const rootNode = getRoot(fromNode.id) as RootNode;

  const [edgePath] = getEdgePath(rootNode.data.pathType || 'smoothstep', {
    sourceX: fromX,
    sourceY: fromY,
    targetX: toX,
    targetY: toY,
    sourcePosition: fromHandle.position,
    targetPosition: getOppositePosition(fromHandle.position),
  });

  return (
    <path d={edgePath} fill="none" stroke={rootNode.data.edgeColor || 'var(--primary)'} strokeWidth={2} />
  );
};

export default EdgeBlock;

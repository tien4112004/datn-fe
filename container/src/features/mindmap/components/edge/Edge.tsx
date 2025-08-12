import {
  type EdgeProps,
  getBezierPath,
  getSimpleBezierPath,
  getSmoothStepPath,
  getStraightPath,
} from '@xyflow/react';
import { memo } from 'react';
import type { MindMapEdge } from '../../types';
import { motion } from 'motion/react';
import { useMindmapStore } from '../../stores';

type SmoothType = 'smoothstep' | 'straight' | 'bezier' | 'simplebezier';

const getEdgePath = (type: SmoothType, props: any) => {
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
    case 'simplebezier':
      return getSimpleBezierPath({
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
  }: EdgeProps<MindMapEdge> & { smoothType: SmoothType }) => {
    const finalizeNodeDeletion = useMindmapStore((state) => state.finalizeNodeDeletion);

    const [edgePath] = getEdgePath(data?.smoothType || 'smoothstep', {
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
        animate={data?.isDeleting ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], type: 'tween' }}
        onAnimationComplete={() => {
          if (data?.isDeleting) {
            finalizeNodeDeletion();
          }
        }}
      />
    );
  }
);

export default EdgeBlock;

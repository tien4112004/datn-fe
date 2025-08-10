import {
  type EdgeProps,
  getBezierPath,
  getSimpleBezierPath,
  getSmoothStepPath,
  getStraightPath,
} from '@xyflow/react';
import { memo } from 'react';
import type { MindMapEdge } from '../types';

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

const MindmapEdgeBlock = memo(
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
      <path
        id={id}
        key={`edge-${id}`}
        d={edgePath}
        fill="none"
        stroke={data?.strokeColor || 'var(--primary)'}
        strokeWidth={selected ? (data?.strokeWidth || 2) + 1 : data?.strokeWidth || 2}
        style={{
          filter: selected ? 'drop-shadow(0 0 4px var(--primary))' : undefined,
        }}
      />
    );
  }
);

export default MindmapEdgeBlock;

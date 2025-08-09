import {
  BaseEdge,
  type Edge,
  type EdgeProps,
  getBezierPath,
  getSimpleBezierPath,
  getSmoothStepPath,
  getStraightPath,
} from '@xyflow/react';
import { memo } from 'react';

export type MindMapEdge = Edge<{
  strokeWidth?: number;
  strokeColor?: string;
  smoothType?: SmoothType;
}>;

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
      throw new Error(`Unknown edge type: ${type}`);
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
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: data?.strokeColor || 'var(--primary)',
          strokeWidth: selected ? (data?.strokeWidth || 2) + 1 : data?.strokeWidth || 2,
          opacity: selected ? 1 : 0.8,
          filter: selected ? 'drop-shadow(0 0 4px var(--primary))' : undefined,
        }}
        className={'animate-pulse'}
      />
    );
  }
);

export default MindmapEdgeBlock;

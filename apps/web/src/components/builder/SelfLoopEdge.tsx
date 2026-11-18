import React from 'react';
import { BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react';

export const SelfLoopEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  label,
  markerEnd,
  style,
  selected,
}) => {
  const isSelf = Math.abs(sourceX - targetX) < 10 && Math.abs(sourceY - targetY) < 10;

  if (isSelf) {
    // Generate an upward circular loop path for self-loops
    const loopRadius = 32;
    const path = `M ${sourceX - 12} ${sourceY} C ${sourceX - 35} ${sourceY - 60}, ${sourceX + 35} ${sourceY - 60}, ${sourceX + 12} ${sourceY}`;
    const labelX = sourceX;
    const labelY = sourceY - loopRadius - 20;

    return (
      <>
        <BaseEdge
          id={id}
          path={path}
          markerEnd={markerEnd}
          style={{
            ...style,
            strokeWidth: selected ? 2.5 : 1.75,
            stroke: selected ? '#3B82F6' : style?.stroke || '#64748B',
          }}
        />
        {label && (
          <foreignObject
            x={labelX - 45}
            y={labelY - 10}
            width={90}
            height={26}
            className="overflow-visible pointer-events-none"
          >
            <div className="flex items-center justify-center">
              <span className="px-1.5 py-0.5 rounded border border-border bg-surface-elevated text-foreground font-mono text-[10px] shadow-subtle font-medium">
                {label}
              </span>
            </div>
          </foreignObject>
        )}
      </>
    );
  }

  // Regular bezier curved edge between different nodes
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: selected ? 2.5 : 1.75,
          stroke: selected ? '#3B82F6' : style?.stroke || '#64748B',
        }}
      />
      {label && (
        <foreignObject
          x={labelX - 45}
          y={labelY - 12}
          width={90}
          height={26}
          className="overflow-visible pointer-events-none"
        >
          <div className="flex items-center justify-center">
            <span className="px-1.5 py-0.5 rounded border border-border bg-surface-elevated text-foreground font-mono text-[10px] shadow-subtle font-medium">
              {label}
            </span>
          </div>
        </foreignObject>
      )}
    </>
  );
};

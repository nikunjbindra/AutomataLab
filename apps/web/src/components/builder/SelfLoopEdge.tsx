import React from 'react';
import { BaseEdge, EdgeProps, useInternalNode } from '@xyflow/react';

export const SelfLoopEdge: React.FC<EdgeProps> = ({
  id,
  source, target, data,
  sourceX,
  sourceY,
  label,
  markerEnd,
  style,
  selected,
}) => {
  const start = useInternalNode(source);
  const end = useInternalNode(target);
  const isSelf = source === target;

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

  if (!start?.measured.width || !end?.measured.width) return null;
  const r1 = start.measured.width / 2;
  const r2 = end.measured.width / 2;
  const ax = start.internals.positionAbsolute.x + r1;
  const ay = start.internals.positionAbsolute.y + r1;
  const bx = end.internals.positionAbsolute.x + r2;
  const by = end.internals.positionAbsolute.y + r2;
  const distance = Math.hypot(bx - ax, by - ay);
  if (!distance) return null;
  const ux = (bx - ax) / distance;
  const uy = (by - ay) / distance;
  // Each direction bends to its own left. The endpoints follow the circle rims.
  const bend = data?.paired ? Math.min(58, distance * 0.4) : 0;
  const cx = (ax + bx) / 2 - uy * bend;
  const cy = (ay + by) / 2 + ux * bend;
  const controlDistance = Math.hypot(distance / 2, bend);
  const sx = ax + (cx - ax) * r1 / controlDistance;
  const sy = ay + (cy - ay) * r1 / controlDistance;
  const tx = bx + (cx - bx) * (r2 + 2) / controlDistance;
  const ty = by + (cy - by) * (r2 + 2) / controlDistance;
  const edgePath = 'M ' + sx + ' ' + sy + ' Q ' + cx + ' ' + cy + ' ' + tx + ' ' + ty;
  const labelX = (sx + 2 * cx + tx) / 4;
  const labelY = (sy + 2 * cy + ty) / 4;

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

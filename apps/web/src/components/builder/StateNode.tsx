import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { ArrowRight } from 'lucide-react';

export interface StateNodeData {
  label: string;
  isInitial: boolean;
  type: 'mealy' | 'moore';
  output?: string;
}

export const StateNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as StateNodeData;
  const isInitial = nodeData.isInitial;
  const isMoore = nodeData.type === 'moore';

  return (
    <div className="relative group select-none">
      {/* Target and Source Handles (all 4 directions for smooth edge routing) */}
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        className="!w-2 !h-2 !bg-accent-blue !border-border !opacity-0 group-hover:!opacity-100 transition-opacity"
      />
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        className="!w-2 !h-2 !bg-accent-blue !border-border !opacity-0 group-hover:!opacity-100 transition-opacity"
      />

      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        className="!w-2 !h-2 !bg-accent-blue !border-border !opacity-0 group-hover:!opacity-100 transition-opacity"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        className="!w-2 !h-2 !bg-accent-blue !border-border !opacity-0 group-hover:!opacity-100 transition-opacity"
      />

      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        className="!w-2 !h-2 !bg-accent-blue !border-border !opacity-0 group-hover:!opacity-100 transition-opacity"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        className="!w-2 !h-2 !bg-accent-blue !border-border !opacity-0 group-hover:!opacity-100 transition-opacity"
      />

      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        className="!w-2 !h-2 !bg-accent-blue !border-border !opacity-0 group-hover:!opacity-100 transition-opacity"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        className="!w-2 !h-2 !bg-accent-blue !border-border !opacity-0 group-hover:!opacity-100 transition-opacity"
      />

      {/* Initial State Arrow Indicator (JFLAP style incoming pointer) */}
      {isInitial && (
        <div
          className="absolute -left-7 top-1/2 -translate-y-1/2 flex items-center text-accent-cyan pointer-events-none"
          title="Initial State"
        >
          <ArrowRight className="w-5 h-5 animate-pulse" />
        </div>
      )}

      {/* State Circle Body */}
      <div
        className={`w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all shadow-subtle ${
          isInitial
            ? 'border-2 border-accent-cyan bg-surface-elevated ring-2 ring-accent-cyan/20'
            : 'border-2 border-border bg-surface-elevated hover:border-accent-blue/60'
        } ${selected ? 'ring-2 ring-accent-blue border-accent-blue shadow-elevated' : ''}`}
      >
        {isMoore ? (
          // Moore split circle
          <div className="w-full h-full flex flex-col items-center justify-center text-center font-mono">
            <div className="flex-1 flex items-center justify-center w-full text-xs font-bold text-foreground">
              {nodeData.label}
            </div>
            <div className="w-full border-t border-border-subtle" />
            <div className="flex-1 flex items-center justify-center w-full text-[11px] text-accent-indigo font-semibold bg-surface/40 rounded-b-full">
              {nodeData.output ?? '—'}
            </div>
          </div>
        ) : (
          // Mealy single state circle
          <div className="w-full h-full flex items-center justify-center text-center font-mono text-sm font-bold text-foreground">
            {nodeData.label}
          </div>
        )}
      </div>
    </div>
  );
});

StateNode.displayName = 'StateNode';

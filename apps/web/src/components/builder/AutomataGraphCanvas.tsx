import React, { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  Node,
  Edge,
  MarkerType,
  NodeChange,
} from '@xyflow/react';
import type { AnyMachine, MealyMachine, MooreMachine } from '@automatalab/contracts';
import { StateNode } from './StateNode.js';
import { SelfLoopEdge } from './SelfLoopEdge.js';
import type { NodePosition } from '../../hooks/useMachineEditor.js';

interface AutomataGraphCanvasProps {
  machine: AnyMachine;
  nodePositions: Record<string, NodePosition>;
  onPositionChange: (state: string, pos: NodePosition) => void;
  selectedState?: string | null;
  onSelectState?: (state: string | null) => void;
}

const nodeTypes = {
  stateNode: StateNode,
};

const edgeTypes = {
  selfLoop: SelfLoopEdge,
};

export const AutomataGraphCanvas: React.FC<AutomataGraphCanvasProps> = ({
  machine,
  nodePositions,
  onPositionChange,
  selectedState,
  onSelectState,
}) => {
  // Convert states to React Flow nodes
  const nodes: Node[] = useMemo(() => {
    const isMoore = machine.type === 'moore';
    const moore = machine as MooreMachine;

    return machine.states.map((state) => {
      const pos = nodePositions[state] || { x: 300, y: 200 };
      // Keep the start marker on an exposed side as nearby states move.
      let startAngle = 180;
      if (machine.initialState === state) {
        const neighbors = machine.states.filter(other => other !== state && nodePositions[other]);
        const hasLoop = machine.transitions.some(t => t.fromState === state && t.toState === state);
        let best = -Infinity;
        for (const angle of [180, 0, 90, 225, 315, 135, 45, 270]) {
          const radians = angle * Math.PI / 180;
          const x = pos.x + 48 * Math.cos(radians);
          const y = pos.y + 48 * Math.sin(radians);
          let clearance = hasLoop ? Math.hypot(x - pos.x, y - (pos.y - 55)) : Infinity;
          for (const other of neighbors) {
            clearance = Math.min(clearance, Math.hypot(x - nodePositions[other].x, y - nodePositions[other].y));
          }
          if (clearance > best) { best = clearance; startAngle = angle; }
        }
      }
      return {
        id: state,
        type: 'stateNode',
        position: pos,
        selected: selectedState === state,
        data: {
          label: state,
          startAngle,
          isInitial: machine.initialState === state,
          type: machine.type,
          output: isMoore ? moore.stateOutputs?.[state] : undefined,
        },
      };
    });
  }, [machine, nodePositions, selectedState]);

  // Convert transitions to React Flow edges with grouping
  const edges: Edge[] = useMemo(() => {
    // Group transitions by `${fromState}->${toState}`
    const transitionGroups = new Map<string, string[]>();

    if (machine.type === 'mealy') {
      const mealy = machine as MealyMachine;
      for (const t of mealy.transitions) {
        const key = `${t.fromState}->${t.toState}`;
        const label = `${t.inputSymbol}/${t.outputSymbol}`;
        const existing = transitionGroups.get(key) || [];
        existing.push(label);
        transitionGroups.set(key, existing);
      }
    } else {
      const moore = machine as MooreMachine;
      for (const t of moore.transitions) {
        const key = `${t.fromState}->${t.toState}`;
        const existing = transitionGroups.get(key) || [];
        existing.push(t.inputSymbol);
        transitionGroups.set(key, existing);
      }
    }

    const resultEdges: Edge[] = [];

    transitionGroups.forEach((labels, key) => {
      const [from, to] = key.split('->');
      const isSelf = from === to;
      const combinedLabel = labels.join(', ');

      const paired = !isSelf && transitionGroups.has(to + '->' + from);
      resultEdges.push({
        id: `edge-${from}-${to}`,
        source: from,
        target: to,
        type: 'selfLoop',
        sourceHandle: 'top-source',
        targetHandle: 'top-target',
        data: { paired },
        label: combinedLabel,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
          color: '#64748B',
        },
        style: {
          stroke: '#64748B',
          strokeWidth: 1.5,
        },
      });
    });

    return resultEdges;
  }, [machine]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      changes.forEach((change) => {
        if (change.type === 'position' && change.position && change.id) {
          onPositionChange(change.id, change.position);
        }
      });
    },
    [onPositionChange]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onSelectState?.(node.id);
    },
    [onSelectState]
  );

  const onPaneClick = useCallback(() => {
    onSelectState?.(null);
  }, [onSelectState]);

  return (
    <div className="w-full h-full relative bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.2}
        maxZoom={2.5}
        className="automatalab-canvas"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={18}
          size={1.25}
          color="rgba(100, 116, 139, 0.25)"
        />
        <Controls
          showInteractive={false}
          className="!border !border-border !bg-surface-elevated !shadow-card !rounded-lg overflow-hidden"
        />
      </ReactFlow>

      {/* Canvas Top Bar Help Note */}
      <div className="absolute top-3 left-3 pointer-events-none z-10 flex items-center gap-2 px-2.5 py-1 rounded-md border border-border/80 bg-surface-elevated/90 backdrop-blur-xs text-[11px] font-mono text-foreground-muted shadow-subtle">
        <span>Click node to select • Drag to position • Fit view supported</span>
      </div>
    </div>
  );
};

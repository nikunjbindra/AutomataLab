import React from 'react';
import type { AnyMachine, MealyMachine, MooreMachine } from '@automatalab/contracts';

export interface SvgNodePos {
  x: number;
  y: number;
}

export interface DiagramSvgProps {
  machine: AnyMachine;
  nodePositions?: Record<string, SvgNodePos>;
  activeState?: string | null;
  activeTransition?: { from: string; to: string; input?: string } | null;
  highlightedEdge?: string | null; // e.g. "A->B:0"
  highlightedState?: string | null;
  onStateClick?: (state: string) => void;
  onEdgeClick?: (from: string, to: string, input: string) => void;
  onEdgeHover?: (edgeKey: string | null) => void;
  width?: number;
  height?: number;
  className?: string;
  badge?: string;
}

export const DiagramSvg: React.FC<DiagramSvgProps> = ({
  machine,
  nodePositions,
  activeState,
  activeTransition,
  highlightedEdge,
  highlightedState,
  onStateClick,
  onEdgeClick,
  onEdgeHover,
  width = 540,
  height = 320,
  className = '',
  badge,
}) => {
  const isMoore = machine.type === 'moore';
  const moore = machine as MooreMachine;
  const mealy = machine as MealyMachine;

  // Default coordinate calculation if positions are not passed
  const positions: Record<string, SvgNodePos> = React.useMemo(() => {
    if (nodePositions && Object.keys(nodePositions).length > 0) {
      return nodePositions;
    }
    const states = machine.states;
    const n = states.length;
    const posMap: Record<string, SvgNodePos> = {};

    if (n === 1) {
      posMap[states[0]] = { x: width / 2, y: height / 2 };
    } else if (n === 2) {
      posMap[states[0]] = { x: width * 0.3, y: height / 2 };
      posMap[states[1]] = { x: width * 0.7, y: height / 2 };
    } else if (n === 3) {
      posMap[states[0]] = { x: width * 0.25, y: height * 0.65 };
      posMap[states[1]] = { x: width * 0.5, y: height * 0.3 };
      posMap[states[2]] = { x: width * 0.75, y: height * 0.65 };
    } else {
      // Circular layout
      const radius = Math.min(width, height) * 0.35;
      const centerX = width / 2;
      const centerY = height / 2;
      states.forEach((s, idx) => {
        const angle = (idx / n) * 2 * Math.PI - Math.PI / 2;
        posMap[s] = {
          x: Math.round(centerX + radius * Math.cos(angle)),
          y: Math.round(centerY + radius * Math.sin(angle)),
        };
      });
    }
    return posMap;
  }, [machine.states, nodePositions, width, height]);

  // Group transitions by pair (from, to) to calculate bezier curves or offsets
  const groupedTransitions = React.useMemo(() => {
    const map = new Map<
      string,
      Array<{ from: string; to: string; input: string; output?: string }>
    >();

    const addTransition = (from: string, to: string, input: string, output?: string) => {
      const key = `${from}->${to}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push({ from, to, input, output });
    };

    if (isMoore) {
      for (const t of moore.transitions) {
        addTransition(t.fromState, t.toState, t.inputSymbol);
      }
    } else {
      for (const t of mealy.transitions) {
        addTransition(t.fromState, t.toState, t.inputSymbol, t.outputSymbol);
      }
    }

    return map;
  }, [isMoore, mealy.transitions, moore.transitions]);

  const nodeRadius = 26;

  return (
    <div className={`relative rounded-xl border border-border bg-surface/50 overflow-hidden shadow-inner ${className}`}>
      {badge && (
        <div className="absolute top-2.5 left-3 z-10 text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-surface-elevated/90 border border-border text-foreground-muted backdrop-blur-sm">
          {badge}
        </div>
      )}

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full select-none"
        style={{ minHeight: `${height}px` }}
      >
        <defs>
          {/* Arrowhead marker default */}
          <marker
            id="arrowhead"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" className="fill-slate-400 dark:fill-slate-500" />
          </marker>

          {/* Arrowhead marker active / highlighted */}
          <marker
            id="arrowhead-active"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" className="fill-accent-blue" />
          </marker>

          {/* Glowing pulse filter */}
          <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. EDGES */}
        {Array.from(groupedTransitions.entries()).map(([pairKey, transList]) => {
          const [from, to] = pairKey.split('->');
          const p1 = positions[from];
          const p2 = positions[to];
          if (!p1 || !p2) return null;

          const isSelfLoop = from === to;
          const reverseKey = `${to}->${from}`;
          const isBiDirectional = !isSelfLoop && groupedTransitions.has(reverseKey);

          // Check if active
          const isActive =
            activeTransition &&
            activeTransition.from === from &&
            activeTransition.to === to &&
            (!activeTransition.input || transList.some((t) => t.input === activeTransition.input));

          const isEdgeHighlighted =
            highlightedEdge &&
            transList.some((t) => highlightedEdge === `${from}->${to}:${t.input}` || highlightedEdge === `${from}->${to}`);

          const strokeClass = isActive
            ? 'stroke-accent-blue stroke-[3]'
            : isEdgeHighlighted
            ? 'stroke-accent-cyan stroke-[2.5]'
            : 'stroke-slate-300 dark:stroke-slate-700 stroke-[1.5] hover:stroke-accent-blue/80';

          const marker = isActive || isEdgeHighlighted ? 'url(#arrowhead-active)' : 'url(#arrowhead)';

          // Path computation
          if (isSelfLoop) {
            // Upward loop
            const loopRadius = 22;
            const loopX = p1.x;
            const loopY = p1.y - nodeRadius;
            const d = `M ${loopX - 10} ${loopY} A ${loopRadius} ${loopRadius} 0 1 1 ${loopX + 10} ${loopY}`;

            const labelText = transList
              .map((t) => (t.output !== undefined ? `${t.input}/${t.output}` : t.input))
              .join(', ');

            return (
              <g
                key={pairKey}
                className="cursor-pointer group"
                onClick={() => onEdgeClick && onEdgeClick(from, to, transList[0].input)}
                onMouseEnter={() => onEdgeHover && onEdgeHover(pairKey)}
                onMouseLeave={() => onEdgeHover && onEdgeHover(null)}
              >
                <path
                  d={d}
                  fill="none"
                  className={`${strokeClass} transition-all duration-300`}
                  markerEnd={marker}
                />
                {isActive && (
                  <path
                    d={d}
                    fill="none"
                    className="stroke-accent-blue/40 stroke-[6] animate-pulse"
                  />
                )}
                {/* Edge Label */}
                <rect
                  x={loopX - 22}
                  y={loopY - loopRadius * 2 - 8}
                  width="44"
                  height="16"
                  rx="4"
                  className="fill-surface-elevated/90 stroke-border/70 stroke-[0.5]"
                />
                <text
                  x={loopX}
                  y={loopY - loopRadius * 2 + 3}
                  textAnchor="middle"
                  className={`font-mono text-[10px] font-bold ${
                    isActive ? 'fill-accent-blue' : 'fill-foreground-muted'
                  }`}
                >
                  {labelText}
                </text>
              </g>
            );
          }

          // Directed edge between different nodes
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist === 0) return null;

          // Unit vectors
          const ux = dx / dist;
          const uy = dy / dist;
          const px = -uy;
          const py = ux;

          // Curvature if bidirectional
          const curvature = isBiDirectional ? 28 : 0;
          const midX = (p1.x + p2.x) / 2 + px * curvature;
          const midY = (p1.y + p2.y) / 2 + py * curvature;

          // Start and end points on node circumference
          const sx = p1.x + ux * nodeRadius + (isBiDirectional ? px * 4 : 0);
          const sy = p1.y + uy * nodeRadius + (isBiDirectional ? py * 4 : 0);
          const ex = p2.x - ux * (nodeRadius + 4) + (isBiDirectional ? px * 4 : 0);
          const ey = p2.y - uy * (nodeRadius + 4) + (isBiDirectional ? py * 4 : 0);

          const d =
            curvature === 0
              ? `M ${sx} ${sy} L ${ex} ${ey}`
              : `M ${sx} ${sy} Q ${midX} ${midY} ${ex} ${ey}`;

          const labelText = transList
            .map((t) => (t.output !== undefined ? `${t.input}/${t.output}` : t.input))
            .join(', ');

          return (
            <g
              key={pairKey}
              className="cursor-pointer group"
              onClick={() => onEdgeClick && onEdgeClick(from, to, transList[0].input)}
              onMouseEnter={() => onEdgeHover && onEdgeHover(pairKey)}
              onMouseLeave={() => onEdgeHover && onEdgeHover(null)}
            >
              <path
                d={d}
                fill="none"
                className={`${strokeClass} transition-all duration-300`}
                markerEnd={marker}
              />
              {isActive && (
                <path
                  d={d}
                  fill="none"
                  className="stroke-accent-blue/30 stroke-[6] animate-pulse"
                />
              )}

              {/* Edge Label badge */}
              <g transform={`translate(${midX}, ${midY})`}>
                <rect
                  x="-20"
                  y="-9"
                  width="40"
                  height="18"
                  rx="4"
                  className={`stroke-[0.5] transition-colors ${
                    isActive
                      ? 'fill-accent-blue/20 stroke-accent-blue'
                      : isEdgeHighlighted
                      ? 'fill-accent-cyan/20 stroke-accent-cyan'
                      : 'fill-surface-elevated/95 stroke-border'
                  }`}
                />
                <text
                  x="0"
                  y="3"
                  textAnchor="middle"
                  className={`font-mono text-[10px] font-bold ${
                    isActive ? 'fill-accent-blue' : 'fill-foreground'
                  }`}
                >
                  {labelText}
                </text>
              </g>
            </g>
          );
        })}

        {/* 2. NODES */}
        {machine.states.map((state) => {
          const p = positions[state];
          if (!p) return null;

          const isInitial = machine.initialState === state;
          const isNodeActive = activeState === state;
          const isNodeHighlighted = highlightedState === state;

          return (
            <g
              key={state}
              transform={`translate(${p.x}, ${p.y})`}
              className="cursor-pointer group"
              onClick={() => onStateClick && onStateClick(state)}
            >
              {/* Initial State Arrow (JFLAP style) */}
              {isInitial && (
                <g transform={`translate(-${nodeRadius + 18}, 0)`}>
                  <line
                    x1="-10"
                    y1="0"
                    x2="10"
                    y2="0"
                    className="stroke-accent-cyan stroke-[2]"
                  />
                  <polygon
                    points="10,0 4,-4 4,4"
                    className="fill-accent-cyan"
                  />
                </g>
              )}

              {/* Glowing active outer pulse */}
              {isNodeActive && (
                <circle
                  r={nodeRadius + 8}
                  className="fill-none stroke-accent-blue stroke-[3] opacity-60 animate-ping"
                />
              )}

              {/* Node Circle */}
              <circle
                r={nodeRadius}
                className={`transition-all duration-300 ${
                  isNodeActive
                    ? 'fill-surface-elevated stroke-accent-blue stroke-[3]'
                    : isNodeHighlighted
                    ? 'fill-surface-elevated stroke-accent-cyan stroke-[2.5]'
                    : isInitial
                    ? 'fill-surface-elevated stroke-accent-cyan stroke-[2]'
                    : 'fill-surface-elevated stroke-border stroke-[1.5] group-hover:stroke-accent-blue'
                }`}
                filter={isNodeActive ? 'url(#glow)' : undefined}
              />

              {/* Content: Moore split circle vs Mealy single label */}
              {isMoore ? (
                <g>
                  {/* Divider line */}
                  <line
                    x1={-nodeRadius + 2}
                    y1="0"
                    x2={nodeRadius - 2}
                    y2="0"
                    className="stroke-border-subtle stroke-[1]"
                  />
                  {/* State label on top */}
                  <text
                    x="0"
                    y="-6"
                    textAnchor="middle"
                    className="font-mono text-xs font-bold fill-foreground"
                  >
                    {state}
                  </text>
                  {/* State output on bottom */}
                  <text
                    x="0"
                    y="14"
                    textAnchor="middle"
                    className="font-mono text-[11px] font-semibold fill-accent-indigo"
                  >
                    {moore.stateOutputs?.[state] ?? 'ε'}
                  </text>
                </g>
              ) : (
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  className="font-mono text-xs font-bold fill-foreground"
                >
                  {state}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

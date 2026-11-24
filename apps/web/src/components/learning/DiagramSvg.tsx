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
  highlightedEdge?: string | null; // e.g. "A->B:0" or "A->B"
  highlightedState?: string | null;
  /** If provided, only these states are rendered opaque; others are ghosted (layout stays stable). */
  visibleStates?: string[] | null;
  /** If provided, only transitions whose fromState+toState are in this set are rendered opaque; others ghosted. */
  visibleTransitionKeys?: string[] | null; // format: "from->to"
  /** States to highlight as "conflict" (amber ring, used in Stage 2-3 of Mealy→Moore) */
  conflictStates?: string[] | null;
  /** If true, hide state outputs on Moore nodes (used in Stage 4-5 before outputs are revealed) */
  hideOutputs?: boolean;
  /** If true, show an empty-canvas placeholder overlay instead of the diagram */
  showPlaceholder?: boolean;
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
  visibleStates,
  visibleTransitionKeys,
  conflictStates,
  hideOutputs,
  showPlaceholder,
  onStateClick,
  onEdgeClick,
  onEdgeHover,
  width = 560,
  height = 340,
  className = '',
  badge,
}) => {
  const isMoore = machine.type === 'moore';
  const moore = machine as MooreMachine;
  const mealy = machine as MealyMachine;

  const nodeRadius = 26;

  // Build a stable Set of visible states/edges for progressive reveal
  const visibleStateSet = React.useMemo(
    () => (visibleStates ? new Set(visibleStates) : null),
    [visibleStates]
  );
  const visibleEdgeSet = React.useMemo(
    () => (visibleTransitionKeys ? new Set(visibleTransitionKeys) : null),
    [visibleTransitionKeys]
  );
  const conflictStateSet = React.useMemo(
    () => (conflictStates ? new Set(conflictStates) : null),
    [conflictStates]
  );

  // Intelligent collision-free layout
  const positions: Record<string, SvgNodePos> = React.useMemo(() => {
    if (nodePositions && Object.keys(nodePositions).length > 0) {
      return nodePositions;
    }
    const states = machine.states;
    const n = states.length;
    const posMap: Record<string, SvgNodePos> = {};

    // Special case 1: 5-state converted Moore benchmark (S, A_x, A_y, B_x, B_y)
    const hasS = states.includes('S');
    const hasAx = states.some((s) => s.startsWith('A_') || s === 'A');
    const hasBx = states.some((s) => s.startsWith('B_') || s === 'B');

    if (n === 5 && hasS && hasAx && hasBx) {
      // Organized layered flow: S on far left, A states in column 1, B states in column 2
      const aStates = states.filter((s) => s.startsWith('A') && s !== 'S');
      const bStates = states.filter((s) => s.startsWith('B'));

      posMap['S'] = { x: 65, y: height / 2 };

      if (aStates.length === 2) {
        posMap[aStates[0]] = { x: 240, y: height * 0.26 };
        posMap[aStates[1]] = { x: 240, y: height * 0.74 };
      }
      if (bStates.length === 2) {
        posMap[bStates[0]] = { x: 425, y: height * 0.26 };
        posMap[bStates[1]] = { x: 425, y: height * 0.74 };
      }
      // Fill any remaining
      states.forEach((s) => {
        if (!posMap[s]) posMap[s] = { x: width / 2, y: height / 2 };
      });
      return posMap;
    }

    // Special case 2: 2 states (e.g. A, B or even, odd)
    if (n === 2) {
      posMap[states[0]] = { x: width * 0.28, y: height / 2 };
      posMap[states[1]] = { x: width * 0.72, y: height / 2 };
      return posMap;
    }

    // Special case 3: 3 states (e.g. s0, s1, s2)
    if (n === 3) {
      posMap[states[0]] = { x: width * 0.22, y: height * 0.65 };
      posMap[states[1]] = { x: width * 0.5, y: height * 0.3 };
      posMap[states[2]] = { x: width * 0.78, y: height * 0.65 };
      return posMap;
    }

    // Special case 4: 4 states (e.g. 2-bit counter s00, s01, s10, s11)
    if (n === 4) {
      posMap[states[0]] = { x: width * 0.26, y: height * 0.3 };
      posMap[states[1]] = { x: width * 0.74, y: height * 0.3 };
      posMap[states[2]] = { x: width * 0.74, y: height * 0.72 };
      posMap[states[3]] = { x: width * 0.26, y: height * 0.72 };
      return posMap;
    }

    // General case: Spacious circular layout
    const radius = Math.min(width, height) * 0.38;
    const centerX = width / 2;
    const centerY = height / 2;
    states.forEach((s, idx) => {
      const angle = (idx / n) * 2 * Math.PI - Math.PI / 2;
      posMap[s] = {
        x: Math.round(centerX + radius * Math.cos(angle)),
        y: Math.round(centerY + radius * Math.sin(angle)),
      };
    });

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

  const centerX = width / 2;
  const centerY = height / 2;
  const edgeLabels: React.ReactElement[] = [];

  return (
    <div className={`relative rounded-xl border border-border bg-surface/60 overflow-hidden select-none ${className}`}>
      {badge && (
        <div className="absolute top-2.5 left-3 z-10 text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-surface-elevated/90 border border-border text-foreground-muted backdrop-blur-sm shadow-xs">
          {badge}
        </div>
      )}

      {/* Placeholder overlay for stages where target is not yet revealed */}
      {showPlaceholder ? (
        <div
          className="w-full flex flex-col items-center justify-center gap-3 p-8 bg-surface/40 select-none"
          style={{ minHeight: `${height}px` }}
        >
          <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-border flex items-center justify-center bg-surface-elevated/60 shadow-xs">
            <span className="text-foreground-muted text-xl font-bold font-mono">Q&apos;</span>
          </div>
          <div className="text-center space-y-1">
            <p className="text-xs font-bold font-mono text-foreground">Target Canvas Awaiting Transformation</p>
            <p className="text-[11px] font-mono text-foreground-muted max-w-xs">
              Advance the walkthrough to progressively reveal generated states, redirected transitions, and outputs.
            </p>
          </div>
        </div>
      ) : (
        <svg
          viewBox={`-12 -12 ${width + 24} ${height + 24}`}
          className="w-full h-full select-none"
          style={{ minHeight: `${height}px` }}
        >
          <defs>
            {/* Arrowhead marker default */}
            <marker
              id="arrowhead-def"
              viewBox="0 0 10 10"
              refX="7"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" className="fill-slate-400 dark:fill-slate-500" />
            </marker>

            {/* Arrowhead marker active / highlighted */}
            <marker
              id="arrowhead-hi"
              viewBox="0 0 10 10"
              refX="7"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" className="fill-accent-blue" />
            </marker>

            {/* Glowing pulse filter */}
            <filter id="svg-glow" x="-30%" y="-30%" width="160%" height="160%">
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

            // Progressive reveal: strictly hide non-visible edges (do not render ghosted)
            const isEdgeVisible =
              (!visibleEdgeSet || visibleEdgeSet.has(pairKey)) &&
              (!visibleStateSet || (visibleStateSet.has(from) && visibleStateSet.has(to)));
            if (!isEdgeVisible) return null;

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
              (highlightedEdge === `${from}->${to}` ||
                transList.some((t) => highlightedEdge === `${from}->${to}:${t.input}`));

            const strokeClass = isActive
              ? 'stroke-accent-blue stroke-[3]'
              : isEdgeHighlighted
              ? 'stroke-accent-cyan stroke-[2.5]'
              : 'stroke-slate-300 dark:stroke-slate-700 stroke-[1.5] group-hover:stroke-accent-blue/80';

            const marker = isActive || isEdgeHighlighted ? 'url(#arrowhead-hi)' : 'url(#arrowhead-def)';

            const label = transList.map(t => t.output === undefined ? t.input : t.input + '/' + t.output).join(', ');
            const badgeWidth = Math.max(28, Array.from(label).length * 8 + 12);
            function addLabel(x: number, y: number) {
              const half = badgeWidth / 2;
              const center = Math.max(half - 8, Math.min(width + 8 - half, x));
              edgeLabels.push(
                <g key={pairKey} className="transition-label cursor-pointer"
                  data-selected={Boolean(isActive || isEdgeHighlighted)}
                  transform={'translate(' + center + ',' + y + ')'}
                  onClick={() => onEdgeClick?.(from, to, transList[0].input)}
                  onMouseEnter={() => onEdgeHover?.(pairKey)} onMouseLeave={() => onEdgeHover?.(null)}>
                  <rect x={-half} y="-10" width={badgeWidth} height="20" rx="4" />
                  <text textAnchor="middle" dominantBaseline="central">{label}</text>
                </g>
              );
            }

          // Self Loop with smart outward placement
          if (isSelfLoop) {
            const loopRadius = 22;
            // Determine direction pointing outward from center of diagram
            const dxC = p1.x - centerX;
            const dyC = p1.y - centerY;

            let d = '';
            let labelX = p1.x;
            let labelY = p1.y - nodeRadius - 16;

            if (Math.abs(dxC) > Math.abs(dyC) + 40) {
              // Left or Right loop
              if (dxC < 0) {
                // Loop Left
                const lx = p1.x - nodeRadius;
                const ly = p1.y;
                d = `M ${lx} ${ly - 10} A ${loopRadius} ${loopRadius} 0 1 0 ${lx} ${ly + 10}`;
                labelX = p1.x - nodeRadius - loopRadius - 6;
                labelY = p1.y + (from === machine.initialState ? 20 : 0);
              } else {
                // Loop Right
                const lx = p1.x + nodeRadius;
                const ly = p1.y;
                d = `M ${lx} ${ly - 10} A ${loopRadius} ${loopRadius} 0 1 1 ${lx} ${ly + 10}`;
                labelX = p1.x + nodeRadius + loopRadius + 6;
                labelY = p1.y;
              }
            } else if (dyC > 0) {
              // Loop Downward
              const lx = p1.x;
              const ly = p1.y + nodeRadius;
              d = `M ${lx - 10} ${ly} A ${loopRadius} ${loopRadius} 0 1 0 ${lx + 10} ${ly}`;
              labelX = p1.x;
              labelY = p1.y + nodeRadius + loopRadius + 14;
            } else {
              // Loop Upward (default)
              const lx = p1.x;
              const ly = p1.y - nodeRadius;
              d = `M ${lx - 10} ${ly} A ${loopRadius} ${loopRadius} 0 1 1 ${lx + 10} ${ly}`;
              labelX = p1.x;
              labelY = p1.y - nodeRadius - loopRadius - 6;
            }

            addLabel(labelX, labelY);

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
              </g>
            );
          }

          // Directed edge between different nodes
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist === 0) return null;

          const ux = dx / dist;
          const uy = dy / dist;
          // Perpendicular unit vector (points to the right of travel direction)
          const px = -uy;
          const py = ux;

          // Curvature: bidirectional transitions arc outwards to avoid overlap
          const baseCurvature = isBiDirectional ? 26 : 0;
          const midX = (p1.x + p2.x) / 2 + px * baseCurvature;
          const midY = (p1.y + p2.y) / 2 + py * baseCurvature;

          const sx = p1.x + ux * nodeRadius + (isBiDirectional ? px * 3 : 0);
          const sy = p1.y + uy * nodeRadius + (isBiDirectional ? py * 3 : 0);
          const ex = p2.x - ux * (nodeRadius + 4) + (isBiDirectional ? px * 3 : 0);
          const ey = p2.y - uy * (nodeRadius + 4) + (isBiDirectional ? py * 3 : 0);

          const d =
            baseCurvature === 0
              ? `M ${sx} ${sy} L ${ex} ${ey}`
              : `M ${sx} ${sy} Q ${midX} ${midY} ${ex} ${ey}`;

          addLabel(midX, midY);

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
            </g>
          );
        })}
        {edgeLabels}

        {/* 2. NODES */}
        {machine.states.map((state) => {
          const p = positions[state];
          if (!p) return null;

          const isInitial = machine.initialState === state;
          const isNodeActive = activeState === state;
          const isNodeHighlighted = highlightedState === state;
          // Progressive reveal: strictly hide non-visible nodes (do not render ghosted)
          const isNodeVisible = !visibleStateSet || visibleStateSet.has(state);
          if (!isNodeVisible) return null;

          const isConflict = conflictStateSet?.has(state) ?? false;

          return (
            <g
              key={state}
              transform={`translate(${p.x}, ${p.y})`}
              className="cursor-pointer group"
              onClick={() => onStateClick && onStateClick(state)}
            >
              {/* Initial State Arrow (JFLAP style incoming pointer) */}
              {isInitial && isNodeVisible && (
                <g transform={`translate(-${nodeRadius + 18}, 0)`}>
                  <line
                    x1="-10"
                    y1="0"
                    x2="10"
                    y2="0"
                    className="stroke-accent-cyan stroke-[2]"
                  />
                  <polygon points="10,0 4,-4 4,4" className="fill-accent-cyan" />
                </g>
              )}

              {/* Active outer ping ring */}
              {isNodeActive && (
                <circle
                  r={nodeRadius + 8}
                  className="fill-none stroke-accent-blue stroke-[3] opacity-60 animate-ping"
                />
              )}

              {/* Conflict highlight ring (amber - state needs splitting) */}
              {isConflict && isNodeVisible && (
                <circle
                  r={nodeRadius + 5}
                  className="fill-none stroke-amber-400 stroke-[2.5] opacity-80"
                  strokeDasharray="4 3"
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
                filter={isNodeActive ? 'url(#svg-glow)' : undefined}
              />

              {/* Node Content */}
              {isMoore && !hideOutputs ? (
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
                    className={`font-mono text-[11px] font-semibold ${
                      moore.stateOutputs?.[state] === 'ε'
                        ? 'fill-accent-amber font-bold'
                        : 'fill-accent-indigo'
                    }`}
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
      )}
    </div>
  );
};

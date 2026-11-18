import React, { useState, useMemo } from 'react';
import { DiagramSvg } from './DiagramSvg.js';
import { StatusBadge } from '../StatusBadge.js';
import {
  MANDATORY_TASK_6_MEALY,
  convertMealyToMoore,
} from '@automatalab/automata';
import type { MealyMachine, MooreMachine } from '@automatalab/contracts';
import { MousePointerClick, Sparkles } from 'lucide-react';

export const LessonTableDiagramSync: React.FC = () => {
  const [modelType, setModelType] = useState<'mealy' | 'moore'>('mealy');
  const mealy = MANDATORY_TASK_6_MEALY;
  const moore = useMemo(() => convertMealyToMoore(mealy).machine, [mealy]);

  // Selected cell / transition key: e.g. "A->B:1" or null
  const [selectedTransition, setSelectedTransition] = useState<{
    from: string;
    input: string;
    to: string;
    output?: string;
  } | null>({
    from: 'A',
    input: '1',
    to: 'B',
    output: 'y',
  });

  const activeMachine = modelType === 'mealy' ? mealy : moore;

  // Edge key for DiagramSvg
  const highlightedEdge = selectedTransition
    ? `${selectedTransition.from}->${selectedTransition.to}:${selectedTransition.input}`
    : null;

  // Handle click on a table cell
  const handleTableCellClick = (from: string, input: string) => {
    if (modelType === 'mealy') {
      const t = mealy.transitions.find((tr) => tr.fromState === from && tr.inputSymbol === input);
      if (t) {
        setSelectedTransition({
          from: t.fromState,
          input: t.inputSymbol,
          to: t.toState,
          output: t.outputSymbol,
        });
      }
    } else {
      const t = moore.transitions.find((tr) => tr.fromState === from && tr.inputSymbol === input);
      if (t) {
        setSelectedTransition({
          from: t.fromState,
          input: t.inputSymbol,
          to: t.toState,
          output: moore.stateOutputs?.[t.toState],
        });
      }
    }
  };

  // Handle click on a diagram edge
  const handleDiagramEdgeClick = (from: string, to: string, input: string) => {
    if (modelType === 'mealy') {
      const t = mealy.transitions.find(
        (tr) => tr.fromState === from && tr.toState === to && tr.inputSymbol === input
      );
      if (t) {
        setSelectedTransition({
          from: t.fromState,
          input: t.inputSymbol,
          to: t.toState,
          output: t.outputSymbol,
        });
      }
    } else {
      const t = moore.transitions.find(
        (tr) => tr.fromState === from && tr.toState === to && tr.inputSymbol === input
      );
      if (t) {
        setSelectedTransition({
          from: t.fromState,
          input: t.inputSymbol,
          to: t.toState,
          output: moore.stateOutputs?.[t.toState],
        });
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Bar: Model Toggle and Interaction Prompt */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border bg-surface-elevated/50">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-foreground">Select Notation:</span>
          <div className="flex rounded-lg border border-border bg-surface p-0.5">
            <button
              type="button"
              onClick={() => {
                setModelType('mealy');
                setSelectedTransition({ from: 'A', input: '1', to: 'B', output: 'y' });
              }}
              className={`px-3 py-1 rounded-md text-xs font-mono font-semibold transition-colors ${
                modelType === 'mealy'
                  ? 'bg-accent-blue text-white shadow-sm'
                  : 'text-foreground-muted hover:text-foreground'
              }`}
            >
              Mealy (Matrix Cell: Next State, Output)
            </button>
            <button
              type="button"
              onClick={() => {
                setModelType('moore');
                setSelectedTransition({ from: 'S', input: '1', to: 'B_y', output: 'y' });
              }}
              className={`px-3 py-1 rounded-md text-xs font-mono font-semibold transition-colors ${
                modelType === 'moore'
                  ? 'bg-accent-indigo text-white shadow-sm'
                  : 'text-foreground-muted hover:text-foreground'
              }`}
            >
              Moore (Matrix Cell: Next State; Header: Output)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono text-accent-cyan">
          <MousePointerClick className="w-4 h-4 animate-bounce" />
          <span>Click any table cell or diagram edge to inspect</span>
        </div>
      </div>

      {/* Synchronized Side-by-Side Dual View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Interactive Transition Table */}
        <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-border-subtle pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                Transition Matrix
              </span>
              <StatusBadge
                variant={modelType === 'mealy' ? 'mealy' : 'moore'}
                label={modelType.toUpperCase()}
              />
            </div>
            <span className="text-[11px] font-mono text-foreground-muted">
              δ: Q × Σ → Q
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-elevated/70 text-foreground-muted">
                  <th className="p-2.5 text-left font-bold">
                    {modelType === 'moore' ? 'State / λ_M' : 'State (q)'}
                  </th>
                  {activeMachine.alphabet.map((sym) => (
                    <th key={sym} className="p-2.5 text-center font-bold">
                      Input '{sym}'
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {activeMachine.states.map((st) => {
                  const isInitial = activeMachine.initialState === st;
                  const isRowSelected = selectedTransition?.from === st;

                  return (
                    <tr
                      key={st}
                      className={`transition-colors ${
                        isRowSelected ? 'bg-accent-blue/10' : 'hover:bg-surface-elevated/40'
                      }`}
                    >
                      <td className="p-2.5 font-bold text-foreground flex items-center gap-1.5">
                        {isInitial && <span className="text-accent-cyan text-xs">→</span>}
                        <span>{st}</span>
                        {modelType === 'moore' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-accent-indigo/15 text-accent-indigo font-semibold ml-1">
                            out: {(moore as MooreMachine).stateOutputs?.[st] ?? 'ε'}
                          </span>
                        )}
                      </td>

                      {activeMachine.alphabet.map((sym) => {
                        let cellContent = '—';
                        let isCellSelected = false;

                        if (modelType === 'mealy') {
                          const tr = (mealy as MealyMachine).transitions.find(
                            (t) => t.fromState === st && t.inputSymbol === sym
                          );
                          if (tr) {
                            cellContent = `${tr.toState}, ${tr.outputSymbol}`;
                            isCellSelected =
                              selectedTransition?.from === st &&
                              selectedTransition?.input === sym;
                          }
                        } else {
                          const tr = (moore as MooreMachine).transitions.find(
                            (t) => t.fromState === st && t.inputSymbol === sym
                          );
                          if (tr) {
                            cellContent = tr.toState;
                            isCellSelected =
                              selectedTransition?.from === st &&
                              selectedTransition?.input === sym;
                          }
                        }

                        return (
                          <td
                            key={sym}
                            onClick={() => handleTableCellClick(st, sym)}
                            className={`p-2.5 text-center font-bold cursor-pointer transition-all ${
                              isCellSelected
                                ? 'bg-accent-blue text-white ring-2 ring-accent-blue scale-105 shadow-sm rounded'
                                : 'text-foreground hover:bg-surface-hover hover:text-accent-blue'
                            }`}
                          >
                            {cellContent}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Explanation note */}
          <div className="pt-2 border-t border-border-subtle text-[11px] font-mono text-foreground-muted flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent-blue shrink-0" />
            <span>
              {modelType === 'mealy'
                ? 'In Mealy matrix, each cell holds (Next State, Emitted Output).'
                : 'In Moore matrix, each cell holds Next State. State output is defined in the row header.'}
            </span>
          </div>
        </div>

        {/* Right: State Transition Diagram */}
        <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-border-subtle pb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
              Directed Graph Representation
            </span>
            <span className="text-[11px] font-mono text-accent-cyan font-bold">
              {selectedTransition
                ? `${selectedTransition.from} --(${selectedTransition.input}${
                    selectedTransition.output ? ` / ${selectedTransition.output}` : ''
                  })--> ${selectedTransition.to}`
                : 'Select an edge or cell'}
            </span>
          </div>

          <DiagramSvg
            machine={activeMachine}
            activeState={selectedTransition?.from || null}
            highlightedState={selectedTransition?.to || null}
            highlightedEdge={highlightedEdge}
            onEdgeClick={handleDiagramEdgeClick}
            onStateClick={(st) => handleTableCellClick(st, activeMachine.alphabet[0])}
            width={480}
            height={280}
            badge="Interactive Diagram"
          />

          {/* Active Isomorphism Card */}
          {selectedTransition && (
            <div className="p-3 rounded-lg border border-accent-blue/30 bg-accent-blue/5 dark:bg-accent-blue/10 font-mono text-xs text-foreground space-y-1">
              <div className="font-bold text-accent-blue flex items-center gap-2">
                <span>Formal Transition Mapping:</span>
              </div>
              <div className="text-[11px] text-foreground-muted pl-4">
                • <strong>Source State:</strong> <code className="text-foreground">{selectedTransition.from}</code> (Row header)<br />
                • <strong>Input Symbol:</strong> <code className="text-foreground">'{selectedTransition.input}'</code> (Column header)<br />
                • <strong>Destination:</strong> <code className="text-foreground">{selectedTransition.to}</code> (Target node in graph)<br />
                {selectedTransition.output && (
                  <>
                    • <strong>Output Value:</strong> <code className="text-accent-emerald font-bold">'{selectedTransition.output}'</code> ({modelType === 'mealy' ? 'on transition edge' : `in state ${selectedTransition.to}`})
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

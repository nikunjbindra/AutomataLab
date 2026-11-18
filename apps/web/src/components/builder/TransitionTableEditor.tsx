import React from 'react';
import type { AnyMachine, MooreMachine } from '@automatalab/contracts';

interface TransitionTableEditorProps {
  machine: AnyMachine;
  onSetTransition: (fromState: string, inputSymbol: string, toState: string, outputSymbol?: string) => void;
  onRemoveTransition: (fromState: string, inputSymbol: string) => void;
  selectedState?: string | null;
  onSelectState?: (state: string | null) => void;
}

export const TransitionTableEditor: React.FC<TransitionTableEditorProps> = ({
  machine,
  onSetTransition,
  onRemoveTransition,
  selectedState,
  onSelectState,
}) => {
  const isMoore = machine.type === 'moore';
  const moore = isMoore ? (machine as MooreMachine) : null;

  // Find transition for a given (fromState, inputSymbol)
  const getTransition = (fromState: string, inputSymbol: string) => {
    return machine.transitions.find(
      (t) => t.fromState === fromState && t.inputSymbol === inputSymbol
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-foreground">
          <span>Transition Matrix:</span>
          <span className="text-accent-blue font-mono">
            {isMoore ? 'δ: S × Σ → S' : 'δ: Q × Σ → Q, λ: Q × Σ → Δ'}
          </span>
        </div>

        <div className="text-[11px] text-foreground-muted font-mono">
          {machine.states.length} states × {machine.alphabet.length} inputs
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-border bg-surface-elevated/60 text-foreground-muted uppercase tracking-wider text-[11px]">
              <th scope="col" className="py-2.5 px-3 font-semibold w-28">
                {isMoore ? 'State / λ(S)' : 'State'}
              </th>
              {machine.alphabet.map((symbol) => (
                <th key={symbol} scope="col" className="py-2.5 px-3 font-semibold text-center">
                  Input '{symbol}'
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {machine.states.map((state) => {
              const isSelected = selectedState === state;
              const isInitial = machine.initialState === state;

              return (
                <tr
                  key={state}
                  onClick={() => onSelectState?.(state)}
                  className={`transition-colors ${
                    isSelected
                      ? 'bg-accent-blue/10 dark:bg-accent-blue/15'
                      : 'hover:bg-surface-hover/50'
                  }`}
                >
                  {/* Row Header: State Label */}
                  <th
                    scope="row"
                    className="py-2.5 px-3 font-semibold text-foreground whitespace-nowrap bg-surface-elevated/30"
                  >
                    <div className="flex items-center gap-1.5">
                      {isInitial && (
                        <span className="text-accent-cyan text-xs" title="Initial State">
                          →
                        </span>
                      )}
                      <span className={isInitial ? 'text-accent-cyan font-bold' : ''}>
                        {state}
                      </span>
                      {isMoore && moore && (
                        <span className="text-[11px] text-accent-indigo font-normal">
                          / {moore.stateOutputs?.[state] || '—'}
                        </span>
                      )}
                    </div>
                  </th>

                  {/* Input Columns */}
                  {machine.alphabet.map((inputSymbol) => {
                    const trans = getTransition(state, inputSymbol);
                    const toState = trans?.toState || '';
                    const outputSymbol =
                      trans && 'outputSymbol' in trans
                        ? (trans as unknown as { outputSymbol: string }).outputSymbol
                        : '';
                    const isMissing = !trans;

                    return (
                      <td
                        key={`${state}-${inputSymbol}`}
                        className={`p-2 align-middle text-center ${
                          isMissing ? 'bg-amber-500/5' : ''
                        }`}
                      >
                        <div className="inline-flex items-center justify-center gap-1">
                          {/* Destination State Dropdown */}
                          <select
                            aria-label={`Target state from ${state} on ${inputSymbol}`}
                            value={toState}
                            onChange={(e) => {
                              const newToState = e.target.value;
                              if (!newToState) {
                                onRemoveTransition(state, inputSymbol);
                              } else {
                                onSetTransition(
                                  state,
                                  inputSymbol,
                                  newToState,
                                  outputSymbol || machine.outputAlphabet[0] || '0'
                                );
                              }
                            }}
                            className={`h-7 px-1.5 rounded border text-xs font-mono bg-surface-elevated transition-colors focus:ring-1 focus:ring-accent-blue focus:outline-none ${
                              isMissing
                                ? 'border-amber-500/50 text-amber-500'
                                : 'border-border text-foreground hover:border-accent-blue/50'
                            }`}
                          >
                            <option value="">—</option>
                            {machine.states.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>

                          {/* Output Symbol Dropdown (Mealy only) */}
                          {!isMoore && (
                            <>
                              <span className="text-foreground-muted font-mono">/</span>
                              <select
                                aria-label={`Output from ${state} on ${inputSymbol}`}
                                value={outputSymbol}
                                disabled={!toState}
                                onChange={(e) => {
                                  if (toState) {
                                    onSetTransition(state, inputSymbol, toState, e.target.value);
                                  }
                                }}
                                className={`h-7 px-1.5 rounded border text-xs font-mono bg-surface-elevated transition-colors focus:ring-1 focus:ring-accent-blue focus:outline-none disabled:opacity-40 ${
                                  isMissing
                                    ? 'border-amber-500/50 text-amber-500'
                                    : 'border-border text-foreground hover:border-accent-blue/50'
                                }`}
                              >
                                {machine.outputAlphabet.map((out) => (
                                  <option key={out} value={out}>
                                    {out}
                                  </option>
                                ))}
                              </select>
                            </>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

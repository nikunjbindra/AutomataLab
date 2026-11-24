import React, { useState } from 'react';
import { PlaybackBar } from '../learning/PlaybackBar.js';
import type { AnyMachine, MealyMachine, MooreMachine } from '@automatalab/contracts';
import { StatusBadge } from '../StatusBadge.js';
import { Table, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import type { ConversionStageMeta } from './types.js';

interface ConversionStepperProps {
  currentStep: number;
  totalSteps: number;
  stages: ConversionStageMeta[];
  isPlaying: boolean;
  speed: number;
  onPlayToggle: () => void;
  onStepNext: () => void;
  onStepPrev: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onSeek: (step: number) => void;
  sourceMachine: AnyMachine;
  convertedMachine?: AnyMachine;
}

export const ConversionStepper: React.FC<ConversionStepperProps> = ({
  currentStep,
  totalSteps,
  stages,
  isPlaying,
  speed,
  onPlayToggle,
  onStepNext,
  onStepPrev,
  onReset,
  onSpeedChange,
  onSeek,
  sourceMachine,
  convertedMachine,
}) => {
  const [isTablesOpen, setIsTablesOpen] = useState(false);
  const activeStage = stages[currentStep] || stages[0];

  return (
    <div className="space-y-3 font-mono text-xs">
      {/* Floating/Integrated Playback Controls */}
      <PlaybackBar
        currentStep={currentStep}
        totalSteps={totalSteps}
        isPlaying={isPlaying}
        speed={speed}
        onPlayToggle={onPlayToggle}
        onStepNext={onStepNext}
        onStepPrev={onStepPrev}
        onReset={onReset}
        onSpeedChange={onSpeedChange}
        onSeek={onSeek}
        caption={`Stage ${currentStep + 1} of ${totalSteps + 1}: ${activeStage.title}`}
      />

      {/* Step Header & Explanation Card */}
      <div className="rounded-xl border border-border bg-surface p-4 shadow-subtle space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-2">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-accent-blue/15 text-accent-blue font-bold flex items-center justify-center text-[11px]">
              {currentStep + 1}
            </span>
            <h3 className="font-bold text-foreground text-xs">
              {activeStage.title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-foreground-muted">
              {activeStage.shortLabel}
            </span>
            <StatusBadge
              variant={currentStep >= totalSteps ? 'success' : 'moore'}
              size="sm"
              label={`Stage ${currentStep + 1}/${totalSteps + 1}`}
            />
          </div>
        </div>

        {/* Detailed Explanation */}
        <p className="text-foreground-muted text-[11px] leading-relaxed">
          {activeStage.description}
        </p>

        {activeStage.invariant && (
          <div className="pt-1 flex items-center gap-1.5 text-[10px] text-foreground-muted">
            <Sparkles className="w-3 h-3 text-accent-blue shrink-0" />
            <span className="font-semibold text-foreground">Mathematical Rule:</span>
            <code className="text-accent-blue bg-surface-elevated/60 px-1.5 py-0.5 rounded border border-border-subtle font-mono">{activeStage.invariant}</code>
          </div>
        )}
      </div>



      {/* Collapsible Transition Matrix Comparison */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-subtle">
        <button
          type="button"
          onClick={() => setIsTablesOpen((prev) => !prev)}
          className="w-full p-3 flex items-center justify-between text-xs font-mono font-bold text-foreground-muted hover:text-foreground hover:bg-surface-elevated/40 transition-colors select-none"
        >
          <div className="flex items-center gap-2">
            <Table className="w-3.5 h-3.5 text-accent-blue" />
            <span>Show Formal Transition Matrices (Source vs Converted)</span>
          </div>
          {isTablesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isTablesOpen && (
          <div className="p-4 border-t border-border-subtle bg-surface-elevated/20 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Source Machine Matrix */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground text-[11px]">
                  Original {sourceMachine.type.toUpperCase()} Matrix
                </span>
                <span className="text-[10px] text-foreground-muted font-normal">
                  {sourceMachine.states.length} States, {sourceMachine.alphabet.length} Inputs
                </span>
              </div>
              <div className="overflow-x-auto rounded-lg border border-border bg-surface p-2">
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b border-border text-foreground-muted">
                      <th className="p-1.5 text-left font-bold">State</th>
                      {sourceMachine.alphabet.map((a) => (
                        <th key={a} className="p-1.5 text-center font-bold">
                          {a}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {sourceMachine.states.map((st) => (
                      <tr key={st}>
                        <td className="p-1.5 font-bold text-foreground">
                          {sourceMachine.initialState === st && '→ '}
                          {st}
                          {sourceMachine.type === 'moore' && (
                            <span className="text-accent-indigo text-[10px] ml-1">
                              / {(sourceMachine as MooreMachine).stateOutputs?.[st] ?? 'ε'}
                            </span>
                          )}
                        </td>
                        {sourceMachine.alphabet.map((a) => {
                          if (sourceMachine.type === 'mealy') {
                            const tr = (sourceMachine as MealyMachine).transitions.find(
                              (t) => t.fromState === st && t.inputSymbol === a
                            );
                            return (
                              <td key={a} className="p-1.5 text-center">
                                {tr ? `${tr.toState}, ${tr.outputSymbol}` : '—'}
                              </td>
                            );
                          } else {
                            const tr = (sourceMachine as MooreMachine).transitions.find(
                              (t) => t.fromState === st && t.inputSymbol === a
                            );
                            return (
                              <td key={a} className="p-1.5 text-center">
                                {tr ? tr.toState : '—'}
                              </td>
                            );
                          }
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Converted Machine Matrix */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground text-[11px]">
                  Converted {convertedMachine?.type.toUpperCase() || 'TARGET'} Matrix
                </span>
                <span className="text-[10px] text-foreground-muted font-normal">
                  {convertedMachine ? `${convertedMachine.states.length} States` : 'Awaiting conversion'}
                </span>
              </div>
              <div className="overflow-x-auto rounded-lg border border-border bg-surface p-2">
                {!convertedMachine ? (
                  <div className="p-4 text-center text-foreground-muted text-[11px]">
                    Execute conversion to generate target transition matrix.
                  </div>
                ) : (
                  <table className="w-full text-[11px] border-collapse">
                    <thead>
                      <tr className="border-b border-border text-foreground-muted">
                        <th className="p-1.5 text-left font-bold">State</th>
                        {convertedMachine.alphabet.map((a) => (
                          <th key={a} className="p-1.5 text-center font-bold">
                            {a}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {convertedMachine.states.map((st) => (
                        <tr key={st}>
                          <td className="p-1.5 font-bold text-foreground">
                            {convertedMachine.initialState === st && '→ '}
                            {st}
                            {convertedMachine.type === 'moore' && (
                              <span className="text-accent-indigo text-[10px] ml-1">
                                / {(convertedMachine as MooreMachine).stateOutputs?.[st] ?? 'ε'}
                              </span>
                            )}
                          </td>
                          {convertedMachine.alphabet.map((a) => {
                            if (convertedMachine.type === 'mealy') {
                              const tr = (convertedMachine as MealyMachine).transitions.find(
                                (t) => t.fromState === st && t.inputSymbol === a
                              );
                              return (
                                <td key={a} className="p-1.5 text-center">
                                  {tr ? `${tr.toState}, ${tr.outputSymbol}` : '—'}
                                </td>
                              );
                            } else {
                              const tr = (convertedMachine as MooreMachine).transitions.find(
                                (t) => t.fromState === st && t.inputSymbol === a
                              );
                              return (
                                <td key={a} className="p-1.5 text-center">
                                  {tr ? tr.toState : '—'}
                                </td>
                              );
                            }
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

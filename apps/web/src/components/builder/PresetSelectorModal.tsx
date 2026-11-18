import React from 'react';
import type { AnyMachine } from '@automatalab/contracts';
import { StatusBadge } from '../StatusBadge.js';
import { Sparkles, X } from 'lucide-react';
import {
  MANDATORY_TASK_6_MEALY,
  EVEN_PARITY_MEALY,
  EVEN_PARITY_MOORE,
  SEQUENCE_101_MEALY,
  SEQUENCE_010_MOORE,
  BINARY_COUNTER_2BIT_MEALY,
} from '@automatalab/automata';

interface PresetSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: AnyMachine) => void;
}

export const PresetSelectorModal: React.FC<PresetSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  const presets = [
    {
      name: 'Task 6 Reference Mealy Benchmark',
      description: 'States A, B | Inputs 0, 1 | Outputs x, y | Mandatory reference machine splitting into S, A_x, A_y, B_x, B_y (1100 → yxyx).',
      machine: MANDATORY_TASK_6_MEALY,
      tag: 'Benchmark' as const,
    },
    {
      name: 'Even Parity Generator (Mealy)',
      description: 'States even, odd | Outputs 0 on even parity, 1 on odd parity | 2 states, 4 transitions.',
      machine: EVEN_PARITY_MEALY,
      tag: 'Parity' as const,
    },
    {
      name: 'Even Parity Generator (Moore)',
      description: 'States even (out: 0), odd (out: 1) | Canonical 2-state Moore parity checker.',
      machine: EVEN_PARITY_MOORE,
      tag: 'Parity' as const,
    },
    {
      name: '101 Sequence Detector (Mealy)',
      description: 'States S0, S1, S2 | Overlapping sequence recognition on binary bitstream.',
      machine: SEQUENCE_101_MEALY,
      tag: 'Pattern' as const,
    },
    {
      name: '010 Sequence Detector (Moore)',
      description: 'States Q0, Q1, Q2, Q3 | 4-state Moore model recognizing 010 substring.',
      machine: SEQUENCE_010_MOORE,
      tag: 'Pattern' as const,
    },
    {
      name: '2-Bit Modulo-4 Binary Counter (Mealy)',
      description: 'States S00, S01, S10, S11 | Increments on 1, holds on 0, emits carry output.',
      machine: BINARY_COUNTER_2BIT_MEALY,
      tag: 'Counter' as const,
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="preset-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="w-full max-w-xl rounded-xl border border-border bg-surface-elevated p-6 shadow-elevated space-y-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent-indigo" />
            <h3 id="preset-modal-title" className="text-sm font-semibold text-foreground">
              Load Predefined Automata Example
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded text-foreground-muted hover:text-foreground hover:bg-surface-hover"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-foreground-muted shrink-0">
          Select one of the mathematically validated finite-state machines to populate the builder canvas and transition matrix:
        </p>

        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {presets.map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                onSelectPreset(item.machine);
                onClose();
              }}
              className="p-3.5 rounded-lg border border-border bg-surface hover:border-accent-blue/50 hover:bg-surface-hover/60 cursor-pointer transition-all space-y-1.5 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground group-hover:text-accent-blue transition-colors">
                  {item.name}
                </span>
                <div className="flex items-center gap-1.5">
                  <StatusBadge
                    variant={item.machine.type === 'mealy' ? 'mealy' : 'moore'}
                    size="sm"
                    label={item.machine.type === 'mealy' ? 'Mealy' : 'Moore'}
                  />
                  <StatusBadge variant="cyan" size="sm" label={item.tag} />
                </div>
              </div>

              <p className="text-[11px] text-foreground-muted font-mono leading-relaxed">
                {item.description}
              </p>

              <div className="flex items-center gap-3 pt-1 text-[10px] font-mono text-foreground-muted">
                <span>{item.machine.states.length} states</span>
                <span>Σ: [{item.machine.alphabet.join(', ')}]</span>
                <span>Δ: [{item.machine.outputAlphabet.join(', ')}]</span>
                <span>{item.machine.transitions.length} transitions</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

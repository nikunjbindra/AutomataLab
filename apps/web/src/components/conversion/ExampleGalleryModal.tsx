import React from 'react';
import {
  MANDATORY_TASK_6_MEALY,
  EVEN_PARITY_MEALY,
  EVEN_PARITY_MOORE,
  SEQUENCE_101_MEALY,
  SEQUENCE_010_MOORE,
  MULTI_SPLIT_MEALY,
} from '@automatalab/automata';
import type { AnyMachine } from '@automatalab/contracts';
import { StatusBadge } from '../StatusBadge.js';
import { Sparkles, X, ArrowRight } from 'lucide-react';

export interface GalleryExample {
  id: string;
  name: string;
  type: 'mealy' | 'moore';
  machine: AnyMachine;
  description: string;
  recommendedDirection: 'mealy-to-moore' | 'moore-to-mealy';
  highlight: string;
}

export const BENCHMARK_EXAMPLES: GalleryExample[] = [
  {
    id: 'task6-mealy',
    name: 'Task 6 Reference Mealy Machine',
    type: 'mealy',
    machine: MANDATORY_TASK_6_MEALY,
    description:
      'Mandatory benchmark transducer. States A and B each receive multiple output values (x and y), requiring a split into 5 Moore states: S/ε, A_x, A_y, B_x, B_y.',
    recommendedDirection: 'mealy-to-moore',
    highlight: 'Mandatory Benchmark • 5-State Split',
  },
  {
    id: 'parity-mealy',
    name: 'Even Parity Detector (Mealy)',
    type: 'mealy',
    machine: EVEN_PARITY_MEALY,
    description:
      'Tracks binary parity dynamically. Outputs 1 on odd number of ones, 0 on even number of ones. Clean 2-state Mealy transducer.',
    recommendedDirection: 'mealy-to-moore',
    highlight: 'XOR Parity Logic',
  },
  {
    id: 'parity-moore',
    name: 'Even Parity Detector (Moore)',
    type: 'moore',
    machine: EVEN_PARITY_MOORE,
    description:
      'State-associated parity checker. Demonstrates direct Moore-to-Mealy output transition folding without state explosion.',
    recommendedDirection: 'moore-to-mealy',
    highlight: 'Canonical Moore • Reverse Folding',
  },
  {
    id: 'seq101-mealy',
    name: 'Sequence 101 Detector (Mealy)',
    type: 'mealy',
    machine: SEQUENCE_101_MEALY,
    description:
      'Overlapping bit-pattern recognizer for "101". Demonstrates how recognition output is asserted immediately on the closing bit transition.',
    recommendedDirection: 'mealy-to-moore',
    highlight: 'Pattern Recognition',
  },
  {
    id: 'seq010-moore',
    name: 'Sequence 010 Detector (Moore)',
    type: 'moore',
    machine: SEQUENCE_010_MOORE,
    description:
      'State-associated "010" detector. Perfect for showing how target state outputs fold backward onto transitions in Moore-to-Mealy.',
    recommendedDirection: 'moore-to-mealy',
    highlight: 'Pattern Match • Reverse Direction',
  },
  {
    id: 'multi-split-mealy',
    name: 'Multi-Split Transducer (Mealy)',
    type: 'mealy',
    machine: MULTI_SPLIT_MEALY,
    description:
      'Demonstrates extensive state splitting where every state is reached by up to 3 distinct output symbols, illustrating |Q| · |Δ| bounds.',
    recommendedDirection: 'mealy-to-moore',
    highlight: 'Maximum State Explosion Test',
  },
];

interface ExampleGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (example: GalleryExample) => void;
  selectedId?: string;
}

export const ExampleGalleryModal: React.FC<ExampleGalleryModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedId,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gallery-title"
    >
      <div className="rounded-2xl border border-border bg-surface w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-surface-elevated/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-blue/15 border border-accent-blue/30 text-accent-blue flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 id="gallery-title" className="text-sm font-bold text-foreground font-mono">
                Predefined Automata Gallery
              </h2>
              <p className="text-[11px] text-foreground-muted">
                Mathematically verified benchmark machines for bidirectional conversion and testing
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg border border-border text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Cards Grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {BENCHMARK_EXAMPLES.map((ex) => {
            const isSelected = ex.id === selectedId;

            return (
              <div
                key={ex.id}
                onClick={() => {
                  onSelect(ex);
                  onClose();
                }}
                className={`p-4 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'border-accent-blue bg-accent-blue/10 ring-2 ring-accent-blue/30 shadow-sm'
                    : 'border-border bg-surface-elevated/30 hover:border-accent-blue/50 hover:bg-surface-elevated/70'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge
                      variant={ex.type === 'moore' ? 'moore' : 'mealy'}
                      label={ex.type.toUpperCase()}
                      size="sm"
                    />
                    <span className="text-[10px] font-mono font-semibold text-accent-cyan bg-accent-cyan/10 px-2 py-0.5 rounded border border-accent-cyan/20">
                      {ex.highlight}
                    </span>
                  </div>

                  <h3 className="font-bold text-foreground text-xs font-mono">
                    {ex.name}
                  </h3>

                  <p className="text-[11px] text-foreground-muted leading-relaxed">
                    {ex.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-border-subtle flex items-center justify-between font-mono text-[10px] text-foreground-muted">
                  <span>
                    States: <strong className="text-foreground">{ex.machine.states.length}</strong> | Σ: [{ex.machine.alphabet.join(',')}]
                  </span>
                  <div className="flex items-center gap-1 text-accent-blue font-bold">
                    <span>{ex.recommendedDirection === 'mealy-to-moore' ? 'Convert to Moore' : 'Convert to Mealy'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-border bg-surface-elevated/40 flex items-center justify-between text-xs font-mono text-foreground-muted">
          <span>Loading an example populates the workspace without creating duplicate records.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-hover text-foreground font-semibold text-xs"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

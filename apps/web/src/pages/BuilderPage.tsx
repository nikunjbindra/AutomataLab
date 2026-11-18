import React from 'react';
import { PageHeader } from '../components/PageHeader.js';
import { WorkspaceLayout } from '../components/layout/WorkspaceLayout.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { Cpu, ShieldCheck } from 'lucide-react';

export const BuilderPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Machine Builder & Transition Matrix"
        description="Formal finite-state transducer authoring workspace with transition matrix configuration and graph topology visualization."
        badge={<StatusBadge variant="cyan" size="sm" label="Phase 4 Target" />}
      />

      <WorkspaceLayout
        title="MACHINE BUILDER"
        subtitle="Workspace Foundation Preview"
        leftPanelTitle="Formal Machine Definition"
        leftPanel={
          <div className="space-y-4 text-xs">
            <div className="rounded-lg border border-border p-3 space-y-2 bg-surface-elevated/40">
              <span className="font-mono text-[11px] font-semibold text-foreground uppercase tracking-wider">
                1. Machine Properties
              </span>
              <p className="text-foreground-muted text-[11px] leading-relaxed">
                Configure state set Q, input alphabet Σ, output alphabet Δ, and initial state q₀.
              </p>
              <div className="space-y-1 font-mono text-[11px] text-foreground-muted">
                <div>Type: <span className="text-accent-blue">Mealy / Moore</span></div>
                <div>Format: <span className="text-foreground">Deterministic Transducer</span></div>
              </div>
            </div>

            <div className="rounded-lg border border-border p-3 space-y-2 bg-surface-elevated/40">
              <span className="font-mono text-[11px] font-semibold text-foreground uppercase tracking-wider">
                2. Transition Table Editor
              </span>
              <p className="text-foreground-muted text-[11px] leading-relaxed">
                Tabular matrix mapping (state, symbol) to destination state and output symbol.
              </p>
              <div className="p-2 rounded border border-border-subtle bg-surface text-center text-foreground-muted font-mono text-[10px]">
                δ: Q × Σ → Q,  λ: Q × Σ → Δ
              </div>
            </div>
          </div>
        }
        centerPanel={
          <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-background">
            <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center text-accent-blue mb-4 shadow-subtle">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1 font-mono">
              Graph Canvas Workspace Foundation
            </h3>
            <p className="text-xs text-foreground-muted max-w-md leading-relaxed mb-4">
              This canvas is architected for the interactive <code>@xyflow/react</code> automata visualizer, supporting draggable state nodes, directed transition arcs, self-loops, and initial-state indicators.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-border bg-surface text-foreground-muted text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-cyan" />
              <span>Full Graph Interactivity scheduled for Phase 4</span>
            </div>
          </div>
        }
        rightPanelTitle="Validation & Boundary Check"
        rightPanel={
          <div className="space-y-3 text-xs">
            <div className="rounded-lg border border-border p-3 space-y-2 bg-surface-elevated/40">
              <span className="font-mono text-[11px] font-semibold text-foreground uppercase tracking-wider">
                Formal Invariants
              </span>
              <ul className="space-y-1.5 text-[11px] text-foreground-muted">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-mono">✓</span>
                  <span>Deterministic transitions (no duplicate transitions for identical input)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-mono">✓</span>
                  <span>Every transition targets a declared state in Q</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-mono">✓</span>
                  <span>Initial state q₀ ∈ Q</span>
                </li>
              </ul>
            </div>
          </div>
        }
      />
    </div>
  );
};

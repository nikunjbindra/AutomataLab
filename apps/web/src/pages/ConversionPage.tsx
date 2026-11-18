import React from 'react';
import { PageHeader } from '../components/PageHeader.js';
import { WorkspaceLayout } from '../components/layout/WorkspaceLayout.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { ArrowRightLeft, ShieldCheck } from 'lucide-react';

export const ConversionPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Mealy ↔ Moore Conversion Workspace"
        description="Bi-directional automata transformation pipeline with step-by-step state splitting, synthetic initial state handling, and reachability pruning."
        badge={<StatusBadge variant="moore" size="sm" label="Phase 5 Target" />}
      />

      <WorkspaceLayout
        title="CONVERSION WORKSPACE"
        subtitle="Mealy ↔ Moore Transducer Pipeline"
        leftPanelTitle="Source Machine"
        leftPanel={
          <div className="space-y-3 text-xs">
            <div className="rounded-lg border border-border p-3 space-y-2 bg-surface-elevated/40">
              <span className="font-mono text-[11px] font-semibold text-foreground uppercase tracking-wider">
                Source Specification
              </span>
              <p className="text-foreground-muted text-[11px] leading-relaxed">
                Accepts any saved or inline Mealy or Moore machine definition for transformation.
              </p>
              <div className="p-2 rounded border border-border-subtle bg-surface text-foreground-muted font-mono text-[10px]">
                M_source = (Q, Σ, Δ, δ, λ, q₀)
              </div>
            </div>

            <div className="rounded-lg border border-border p-3 space-y-1.5 bg-surface-elevated/40 font-mono text-[11px] text-foreground-muted">
              <div className="text-foreground font-semibold">Conversion Mode:</div>
              <div className="text-accent-blue">• Mealy to Moore (State Splitting)</div>
              <div className="text-accent-indigo">• Moore to Mealy (Output Folding)</div>
            </div>
          </div>
        }
        centerPanel={
          <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-background">
            <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center text-accent-indigo mb-4 shadow-subtle">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1 font-mono">
              Dual-Graph Conversion Canvas Foundation
            </h3>
            <p className="text-xs text-foreground-muted max-w-md leading-relaxed mb-4">
              Architected for side-by-side or tabbed visualization comparing original transducer topology against the converted machine, highlighting state splits (e.g. <code>A → A_x, A_y</code>) and synthetic initial state <code>S/ε</code>.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-border bg-surface text-foreground-muted text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-indigo" />
              <span>Full Interactive Stepper scheduled for Phase 5</span>
            </div>
          </div>
        }
        rightPanelTitle="State Splitting & Trace Steps"
        rightPanel={
          <div className="space-y-3 text-xs">
            <div className="rounded-lg border border-border p-3 space-y-2 bg-surface-elevated/40">
              <span className="font-mono text-[11px] font-semibold text-foreground uppercase tracking-wider">
                Conversion Pipeline Stages
              </span>
              <ol className="space-y-1.5 text-[11px] text-foreground-muted list-decimal list-inside font-mono">
                <li>Analyze Incoming Outputs: InOutputs(q)</li>
                <li>State Splitting: q → q_y for each y ∈ InOutputs(q)</li>
                <li>Synthetic Start State: S with non-emitting ε marker</li>
                <li>Reconstruct Transitions: δ'(q_y, a) = δ(q, a)_λ(q, a)</li>
                <li>Reachability Pruning: BFS from initial state S</li>
              </ol>
            </div>
          </div>
        }
      />
    </div>
  );
};

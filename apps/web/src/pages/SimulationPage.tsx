import React from 'react';
import { PageHeader } from '../components/PageHeader.js';
import { WorkspaceLayout } from '../components/layout/WorkspaceLayout.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { PlayCircle, ShieldCheck } from 'lucide-react';

export const SimulationPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Simulation Laboratory & Execution Stepper"
        description="Step-by-step transducer execution, input-string tape processing, synchronous output generation, and visited state trajectory analysis."
        badge={<StatusBadge variant="success" size="sm" label="Phase 6 Target" />}
      />

      <WorkspaceLayout
        title="SIMULATION LABORATORY"
        subtitle="Input Tape Execution Engine"
        defaultBottomOpen={true}
        leftPanelTitle="Input Tape Configuration"
        leftPanel={
          <div className="space-y-3 text-xs">
            <div className="rounded-lg border border-border p-3 space-y-2 bg-surface-elevated/40">
              <span className="font-mono text-[11px] font-semibold text-foreground uppercase tracking-wider">
                Input String Specification
              </span>
              <p className="text-foreground-muted text-[11px] leading-relaxed">
                Accepts arbitrary sequences of symbols over input alphabet Σ.
              </p>
              <div className="p-2 rounded border border-border-subtle bg-surface text-foreground font-mono text-xs text-center">
                w = 1 1 0 0
              </div>
            </div>

            <div className="rounded-lg border border-border p-3 space-y-1.5 bg-surface-elevated/40 font-mono text-[11px] text-foreground-muted">
              <div>Output Alignment:</div>
              <div className="text-foreground text-[10px]">
                Mealy: λ(w) = |w| symbols<br />
                Moore: λ(w) = |w|+1 symbols (initial state emission trimmed or matched with ε)
              </div>
            </div>
          </div>
        }
        centerPanel={
          <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-background">
            <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center text-accent-emerald mb-4 shadow-subtle">
              <PlayCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1 font-mono">
              Live State Highlighting Canvas Foundation
            </h3>
            <p className="text-xs text-foreground-muted max-w-md leading-relaxed mb-4">
              Architected for visual execution playback with active node highlighting, transition arrow pulse, and simultaneous tape head tracking across discrete simulation ticks.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-border bg-surface text-foreground-muted text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-emerald" />
              <span>Interactive Step-by-Step Player scheduled for Phase 6</span>
            </div>
          </div>
        }
        rightPanelTitle="Execution Trace Log"
        rightPanel={
          <div className="space-y-3 text-xs font-mono">
            <div className="rounded-lg border border-border p-3 space-y-2 bg-surface-elevated/40">
              <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
                Simulation Traces
              </span>
              <div className="space-y-1 text-[11px] text-foreground-muted">
                <div>Step 0: Initial State q₀</div>
                <div>Step 1: (q₀, a₁) → q₁ / y₁</div>
                <div>Step 2: (q₁, a₂) → q₂ / y₂</div>
              </div>
            </div>
          </div>
        }
        bottomPanelTitle="Simulation Tape Head & Stepper Controls"
        bottomPanel={
          <div className="h-full flex flex-col justify-center items-center p-4 text-center">
            <div className="flex items-center gap-3 font-mono text-xs mb-3">
              <span className="px-2.5 py-1 rounded border border-border bg-surface text-foreground-muted">
                Reset
              </span>
              <span className="px-2.5 py-1 rounded border border-border bg-surface text-foreground-muted">
                Step Back
              </span>
              <span className="px-3 py-1 rounded bg-accent-blue/10 border border-accent-blue/30 text-accent-blue font-semibold">
                Play / Pause
              </span>
              <span className="px-2.5 py-1 rounded border border-border bg-surface text-foreground-muted">
                Step Forward
              </span>
            </div>
            <p className="text-[11px] text-foreground-muted font-mono">
              Synchronous Input/Output Tape visualizer will render here.
            </p>
          </div>
        }
      />
    </div>
  );
};

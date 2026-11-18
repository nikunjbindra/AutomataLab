import React from 'react';
import { PageHeader } from '../components/PageHeader.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { BookOpen, Layers, Cpu, CheckCircle2 } from 'lucide-react';

export const DocumentationPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Automata Theory & Conversion Reference"
        description="Formal mathematical models, state-splitting proofs, conversion invariants, and algorithmic complexities."
        badge={<StatusBadge variant="neutral" size="sm" label="Formal Reference" />}
      />

      {/* 1. Formal Definitions */}
      <section className="rounded-xl border border-border bg-surface p-6 space-y-4 shadow-subtle">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-accent-blue" />
          1. Formal Machine Definitions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          {/* Mealy Machine */}
          <div className="rounded-lg border border-border-subtle bg-surface-elevated/40 p-4 space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-border-subtle">
              <span className="font-bold text-foreground">Mealy Machine (6-tuple)</span>
              <StatusBadge variant="mealy" size="sm" label="M = (Q, Σ, Δ, δ, λ, q₀)" />
            </div>
            <ul className="space-y-1 text-foreground-muted text-[11px]">
              <li><strong className="text-foreground">Q</strong>: Finite set of states</li>
              <li><strong className="text-foreground">Σ</strong>: Finite input alphabet</li>
              <li><strong className="text-foreground">Δ</strong>: Finite output alphabet</li>
              <li><strong className="text-foreground">δ</strong>: Q × Σ → Q (State transition function)</li>
              <li><strong className="text-foreground">λ</strong>: Q × Σ → Δ (Transition output function)</li>
              <li><strong className="text-foreground">q₀</strong>: Initial state (q₀ ∈ Q)</li>
            </ul>
          </div>

          {/* Moore Machine */}
          <div className="rounded-lg border border-border-subtle bg-surface-elevated/40 p-4 space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-border-subtle">
              <span className="font-bold text-foreground">Moore Machine (6-tuple)</span>
              <StatusBadge variant="moore" size="sm" label="M = (S, Σ, Δ, δ, λ_M, s₀)" />
            </div>
            <ul className="space-y-1 text-foreground-muted text-[11px]">
              <li><strong className="text-foreground">S</strong>: Finite set of states</li>
              <li><strong className="text-foreground">Σ</strong>: Finite input alphabet</li>
              <li><strong className="text-foreground">Δ</strong>: Finite output alphabet</li>
              <li><strong className="text-foreground">δ</strong>: S × Σ → S (State transition function)</li>
              <li><strong className="text-foreground">λ_M</strong>: S → Δ (State output function)</li>
              <li><strong className="text-foreground">s₀</strong>: Initial state (s₀ ∈ S)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 2. Mealy-to-Moore Algorithm */}
      <section className="rounded-xl border border-border bg-surface p-6 space-y-4 shadow-subtle">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Layers className="w-4 h-4 text-accent-indigo" />
          2. Mealy-to-Moore Conversion Algorithm
        </h2>

        <div className="space-y-3 text-xs leading-relaxed text-foreground-muted">
          <p>
            Because Moore machine outputs depend strictly on the state rather than the transition, every Mealy state <code className="text-foreground font-mono">q</code> that is reached with distinct output symbols must be split into multiple Moore clones:
          </p>

          <ol className="space-y-2 list-decimal list-inside font-mono text-[11px] bg-surface-elevated/40 p-4 rounded-lg border border-border-subtle">
            <li>
              <strong className="text-foreground">Compute Incoming Outputs:</strong> For each state q ∈ Q, determine the set of all outputs produced by transitions entering q:
              <div className="pl-4 py-1 text-accent-blue font-semibold">InOutputs(q) = {'{'} y ∈ Δ | ∃ p ∈ Q, a ∈ Σ: δ(p, a) = q ∧ λ(p, a) = y {'}'}</div>
            </li>
            <li>
              <strong className="text-foreground">State Splitting:</strong> For each output y ∈ InOutputs(q), create a Moore state <code className="text-foreground">q_y</code> with output assignment <code className="text-accent-indigo">λ_M(q_y) = y</code>.
            </li>
            <li>
              <strong className="text-foreground">Synthetic Initial State S:</strong> To represent the initial state before any input is consumed, introduce a distinct start state <code className="text-foreground">S</code> with output <code className="text-accent-amber">λ_M(S) = ε</code> (or a designated null token).
            </li>
            <li>
              <strong className="text-foreground">Reconstruct Transitions:</strong> For each created Moore state (including S) corresponding to base state q, define:
              <div className="pl-4 py-1 text-accent-blue font-semibold">δ_M(q_y, a) = (δ(q, a))_λ(q, a)</div>
            </li>
            <li>
              <strong className="text-foreground">Reachability Pruning:</strong> Perform BFS from initial state S and remove all unreachable states from the generated state set.
            </li>
          </ol>
        </div>
      </section>

      {/* 3. Mandatory Task 6 Example */}
      <section className="rounded-xl border border-border bg-surface p-6 space-y-4 shadow-subtle">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
          3. Mandatory Benchmark (Task 6 Walkthrough)
        </h2>

        <div className="text-xs space-y-3 text-foreground-muted leading-relaxed">
          <p>
            Consider the reference Mealy machine with states <code className="text-foreground font-mono">A, B</code>, inputs <code className="text-foreground font-mono">0, 1</code>, and outputs <code className="text-foreground font-mono">x, y</code>:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px]">
            <div className="p-3 rounded border border-border-subtle bg-surface-elevated/40 space-y-1">
              <div className="font-semibold text-foreground">Original Mealy Transitions:</div>
              <div>A, 0 → A, x</div>
              <div>A, 1 → B, y</div>
              <div>B, 0 → A, y</div>
              <div>B, 1 → B, x</div>
            </div>

            <div className="p-3 rounded border border-border-subtle bg-surface-elevated/40 space-y-1">
              <div className="font-semibold text-foreground">Generated Moore States (5 total):</div>
              <div>• S (Output: ε) — Initial State</div>
              <div>• A_x (Output: x)</div>
              <div>• A_y (Output: y)</div>
              <div>• B_x (Output: x)</div>
              <div>• B_y (Output: y)</div>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10 font-mono text-xs text-foreground space-y-1">
            <div className="font-semibold text-accent-emerald">Output Alignment Verification:</div>
            <div>Input String: <span className="text-accent-blue">1100</span></div>
            <div>Mealy Output Tape: <span className="text-foreground font-bold">yxyx</span> (4 symbols)</div>
            <div>Moore Output Tape: <span className="text-foreground font-bold">εyxyx</span> (aligned after initial ε → <span className="text-accent-emerald font-bold">yxyx</span>)</div>
          </div>
        </div>
      </section>

      {/* 4. Complexity Analysis */}
      <section className="rounded-xl border border-border bg-surface p-6 space-y-3 shadow-subtle">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Cpu className="w-4 h-4 text-accent-cyan" />
          4. Time & Space Complexity
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded border border-border-subtle bg-surface-elevated/40 space-y-1">
            <div className="text-foreground font-semibold">Mealy to Moore:</div>
            <div className="text-foreground-muted">Time: O(|Q| · |Σ| + |S| · |Σ|)</div>
            <div className="text-foreground-muted">States: |S| ≤ |Q| · |Δ| + 1</div>
          </div>

          <div className="p-3 rounded border border-border-subtle bg-surface-elevated/40 space-y-1">
            <div className="text-foreground font-semibold">Moore to Mealy:</div>
            <div className="text-foreground-muted">Time: O(|S| · |Σ|)</div>
            <div className="text-foreground-muted">States: |Q| = |S| (No state explosion)</div>
          </div>
        </div>
      </section>
    </div>
  );
};

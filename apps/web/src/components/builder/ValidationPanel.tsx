import React, { useMemo } from 'react';
import type { AnyMachine } from '@automatalab/contracts';
import type { ValidationResult, ValidationIssue } from '@automatalab/automata';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface ValidationPanelProps {
  machine: AnyMachine;
  validation: ValidationResult;
  completeness: {
    expectedTransitions: number;
    definedTransitions: number;
    percentage: number;
    isComplete: boolean;
  };
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  machine,
  validation,
  completeness,
}) => {
  const isDraft = !completeness.isComplete && validation.isValid;

  const errors = useMemo(
    () => validation.issues.filter((issue: ValidationIssue) => issue.severity === 'error'),
    [validation.issues]
  );

  const warnings = useMemo(
    () => validation.issues.filter((issue: ValidationIssue) => issue.severity === 'warning'),
    [validation.issues]
  );

  return (
    <div className="space-y-4 text-xs font-mono">
      {/* 1. Status Banner */}
      <div
        className={`p-3 rounded-lg border flex items-start gap-2.5 ${
          validation.isValid
            ? isDraft
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400'
        }`}
      >
        {validation.isValid ? (
          isDraft ? (
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          )
        ) : (
          <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
        )}

        <div>
          <div className="font-semibold text-xs">
            {validation.isValid
              ? isDraft
                ? 'Draft in Progress'
                : 'Mathematically Complete & Valid'
              : 'Validation Errors Detected'}
          </div>
          <div className="text-[11px] opacity-90 mt-0.5">
            {validation.isValid
              ? isDraft
                ? 'Automaton definition is syntactically sound, but some transitions remain undefined.'
                : 'All formal invariants satisfied. Ready for conversion & simulation.'
              : `${errors.length} formal error(s) must be resolved.`}
          </div>
        </div>
      </div>

      {/* 2. Transition Completeness Progress */}
      <div className="rounded-lg border border-border bg-surface-elevated/40 p-3 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-foreground uppercase tracking-wider">
            Completeness: δ(Q, Σ)
          </span>
          <span className="text-foreground font-bold">{completeness.percentage}%</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full bg-surface border border-border overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              completeness.isComplete
                ? 'bg-emerald-500'
                : completeness.percentage > 50
                ? 'bg-accent-blue'
                : 'bg-amber-500'
            }`}
            style={{ width: `${completeness.percentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-foreground-muted">
          <span>
            {completeness.definedTransitions} of {completeness.expectedTransitions} transitions
          </span>
          <span>
            {completeness.expectedTransitions - completeness.definedTransitions} missing
          </span>
        </div>
      </div>

      {/* 3. Formal Invariant Checklist */}
      <div className="rounded-lg border border-border bg-surface-elevated/40 p-3 space-y-2">
        <span className="font-semibold text-[11px] text-foreground uppercase tracking-wider block">
          Invariant Verification
        </span>

        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-foreground-muted">Initial State q₀ ∈ Q</span>
            <span className={machine.states.includes(machine.initialState) ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
              {machine.states.includes(machine.initialState) ? '✓' : '✗'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-foreground-muted">Deterministic Transitions</span>
            <span className={validation.isDeterministic ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
              {validation.isDeterministic ? '✓' : '✗'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-foreground-muted">Unreachable States</span>
            <span className={validation.unreachableStates.length === 0 ? 'text-emerald-500 font-bold' : 'text-amber-500 font-bold'}>
              {validation.unreachableStates.length === 0 ? 'None' : `${validation.unreachableStates.length} state(s)`}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Errors & Warnings List */}
      {(errors.length > 0 || warnings.length > 0) && (
        <div className="space-y-2">
          {errors.map((err: ValidationIssue, i: number) => (
            <div
              key={`err-${i}`}
              className="p-2.5 rounded-md border border-rose-500/20 bg-rose-500/5 text-accent-rose space-y-1"
            >
              <div className="font-semibold text-[11px] flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{err.code}</span>
              </div>
              <p className="text-[10px] leading-relaxed opacity-90">{err.message}</p>
            </div>
          ))}

          {warnings.map((warn: ValidationIssue, i: number) => (
            <div
              key={`warn-${i}`}
              className="p-2.5 rounded-md border border-amber-500/20 bg-amber-500/5 text-accent-amber space-y-1"
            >
              <div className="font-semibold text-[11px] flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{warn.code}</span>
              </div>
              <p className="text-[10px] leading-relaxed opacity-90">{warn.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

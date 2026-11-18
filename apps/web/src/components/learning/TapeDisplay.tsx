import React from 'react';

interface TapeDisplayProps {
  inputSymbols: string[];
  headIndex: number; // -1 if not started, 0..N-1
  outputSymbols: string[];
  machineType?: 'mealy' | 'moore';
  showInitialMooreOutput?: boolean;
  className?: string;
}

export const TapeDisplay: React.FC<TapeDisplayProps> = ({
  inputSymbols,
  headIndex,
  outputSymbols,
  machineType = 'mealy',
  showInitialMooreOutput = false,
  className = '',
}) => {
  return (
    <div className={`space-y-3 font-mono text-xs ${className}`}>
      {/* Input Tape */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] text-foreground-muted">
          <span className="font-semibold uppercase tracking-wider text-accent-blue">Input Tape</span>
          <span>
            Head position: {headIndex >= 0 && headIndex < inputSymbols.length ? `[${headIndex}] = '${inputSymbols[headIndex]}'` : headIndex >= inputSymbols.length ? 'End of Input' : 'Ready'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto p-2 rounded-lg bg-surface border border-border">
          {inputSymbols.length === 0 ? (
            <span className="text-foreground-muted text-[11px] italic">No input sequence</span>
          ) : (
            inputSymbols.map((sym, idx) => {
              const isCurrent = idx === headIndex;
              const isConsumed = idx < headIndex;

              return (
                <div
                  key={`in-${idx}`}
                  className={`relative flex flex-col items-center justify-center min-w-9 h-10 rounded border text-sm font-bold transition-all ${
                    isCurrent
                      ? 'border-accent-blue bg-accent-blue/15 text-accent-blue ring-2 ring-accent-blue/40 scale-105 shadow-sm'
                      : isConsumed
                      ? 'border-border-subtle bg-surface-elevated/40 text-foreground-muted opacity-60'
                      : 'border-border bg-surface-elevated text-foreground'
                  }`}
                >
                  {isCurrent && (
                    <div className="absolute -top-3 text-accent-blue text-[10px] animate-bounce">
                      ▼
                    </div>
                  )}
                  <span>{sym}</span>
                  <span className="text-[9px] text-foreground-muted/70 font-normal mt-0.5">
                    t={idx + 1}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Output Tape */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] text-foreground-muted">
          <span className="font-semibold uppercase tracking-wider text-accent-emerald">
            {machineType === 'moore' ? 'Moore Output Tape (Length N+1)' : 'Mealy Output Tape (Length N)'}
          </span>
          <span className="font-semibold text-foreground">
            Output: {outputSymbols.join('') || '—'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto p-2 rounded-lg bg-surface border border-border min-h-[56px]">
          {outputSymbols.length === 0 ? (
            <span className="text-foreground-muted text-[11px] italic">Awaiting output tokens...</span>
          ) : (
            outputSymbols.map((sym, idx) => {
              const isLatest = idx === outputSymbols.length - 1;
              const isInitial = machineType === 'moore' && idx === 0 && showInitialMooreOutput;

              return (
                <div
                  key={`out-${idx}`}
                  className={`flex flex-col items-center justify-center min-w-9 h-10 rounded border text-sm font-bold transition-all ${
                    isInitial
                      ? 'border-accent-amber bg-accent-amber/15 text-accent-amber ring-1 ring-accent-amber/40'
                      : isLatest
                      ? 'border-accent-emerald bg-accent-emerald/15 text-accent-emerald ring-2 ring-accent-emerald/40 scale-105 shadow-sm'
                      : 'border-border bg-surface-elevated text-foreground'
                  }`}
                >
                  <span>{sym}</span>
                  <span className="text-[9px] text-foreground-muted/70 font-normal mt-0.5">
                    {isInitial ? 't=0 (ε)' : `t=${idx + (machineType === 'moore' && showInitialMooreOutput ? 0 : 1)}`}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

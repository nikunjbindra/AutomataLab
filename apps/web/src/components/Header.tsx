import React from 'react';
import { Network, BookOpen } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="h-14 border-b border-border bg-surface/80 backdrop-blur-sm px-5 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
          <Network className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-tight text-slate-100">AutomataLab</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-border text-slate-400 font-medium">
              Phase 0
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
            Mealy & Moore Transducer Workbench
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-surface-elevated border border-transparent hover:border-border transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          <span>Docs</span>
        </a>
        <div className="h-4 w-[1px] bg-border" />
        <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>v0.1.0 Ready</span>
        </div>
      </div>
    </header>
  );
};

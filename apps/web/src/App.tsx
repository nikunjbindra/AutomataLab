import React from 'react';
import { Header } from './components/Header.js';
import { ProxyTestCard } from './components/ProxyTestCard.js';
import {
  Cpu,
  Database,
  Terminal,
  Code2,
  Workflow,
  CheckCircle,
  ShieldCheck,
} from 'lucide-react';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-slate-200">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 space-y-8">
        {/* Hero Banner */}
        <div className="rounded-xl border border-border bg-surface p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Phase 0 Initialized — Architecture & Dev Environment</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              AutomataLab Computational Workbench
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Formal Mealy-to-Moore and Moore-to-Mealy state machine conversion engine with pure algorithmic core, strict type validation, and interactive execution tracing.
            </p>
          </div>
        </div>

        {/* Development Proxy Card */}
        <ProxyTestCard />

        {/* Monorepo Topology Overview */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 font-mono">
              Monorepo Architecture
            </h2>
            <span className="text-xs text-slate-500 font-mono">npm workspaces</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* packages/contracts */}
            <div className="rounded-lg border border-border bg-surface p-5 hover:border-indigo-500/40 transition-colors group">
              <div className="w-8 h-8 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Code2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-slate-200 mb-1">
                packages/contracts
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Zero-dependency shared contracts: Zod schemas, TypeScript domain types, and validation models.
              </p>
              <div className="font-mono text-[11px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded w-fit">
                @automatalab/contracts
              </div>
            </div>

            {/* packages/automata */}
            <div className="rounded-lg border border-border bg-surface p-5 hover:border-indigo-500/40 transition-colors group">
              <div className="w-8 h-8 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-slate-200 mb-1">
                packages/automata
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Side-effect free algorithmic core: Mealy & Moore conversions, step tracing, equivalence checking.
              </p>
              <div className="font-mono text-[11px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded w-fit">
                @automatalab/automata
              </div>
            </div>

            {/* apps/api */}
            <div className="rounded-lg border border-border bg-surface p-5 hover:border-indigo-500/40 transition-colors group">
              <div className="w-8 h-8 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Database className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-slate-200 mb-1">
                apps/api
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Node.js Express backend with Drizzle ORM, LibSQL/SQLite persistence, and layered architecture.
              </p>
              <div className="font-mono text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded w-fit">
                @automatalab/api (:3001)
              </div>
            </div>

            {/* apps/web */}
            <div className="rounded-lg border border-border bg-surface p-5 hover:border-indigo-500/40 transition-colors group">
              <div className="w-8 h-8 rounded-md bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Workflow className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-slate-200 mb-1">
                apps/web
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Vite + React 19 + Tailwind CSS frontend with dev proxy, table matrix editor, and @xyflow/react canvas.
              </p>
              <div className="font-mono text-[11px] text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded w-fit">
                @automatalab/web (:5173)
              </div>
            </div>
          </div>
        </div>

        {/* Phase Guardrails & Invariants */}
        <div className="rounded-lg border border-border bg-surface p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-200">
              Permanent Engineering Rules (AGENTS.md)
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>Pure automata algorithms independent of UI and database code.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>Strict TypeScript with no loose any casts or fake hardcoded tests.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>Strict layer separation: Controllers $\to$ Services $\to$ Repositories.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>Validate all external inputs at API boundaries via Zod schemas.</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="h-12 border-t border-border bg-surface/50 px-6 flex items-center justify-between text-xs text-slate-500 font-mono">
        <span>AutomataLab — University Final Project</span>
        <span>Phase 0 Complete</span>
      </footer>
    </div>
  );
};

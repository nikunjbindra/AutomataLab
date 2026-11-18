import React, { useState } from 'react';
import { Activity, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import type { ApiHealthResponse } from '@automatalab/contracts';

export const ProxyTestCard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ApiHealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkApi = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/health');
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
      }
      const json: ApiHealthResponse = await res.json();
      setData(json);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown network error');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            Frontend-to-Backend Proxy Verification
          </h3>
        </div>
        <button
          onClick={checkApi}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-surface-elevated hover:bg-surface-hover border border-border text-slate-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Ping /api/health</span>
        </button>
      </div>

      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
        Verifies Vite dev server routing via <code className="font-mono text-indigo-300">/api/*</code> proxying to Express API running at <code className="font-mono text-indigo-300">http://localhost:3001</code>.
      </p>

      {data && (
        <div className="rounded-md border border-emerald-500/20 bg-emerald-500/10 p-3 font-mono text-xs text-emerald-300 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold mb-1">Backend Proxy Online:</div>
            <div>Service: {data.service} (v{data.version})</div>
            <div>Uptime: {data.uptime} seconds</div>
            <div>Timestamp: {data.timestamp}</div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md border border-rose-500/20 bg-rose-500/10 p-3 font-mono text-xs text-rose-300 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold mb-1">Proxy Error:</div>
            <div>{error}</div>
            <div className="text-[11px] text-rose-400/80 mt-1">
              Ensure <code className="text-white">npm run dev:api</code> is running on port 3001.
            </div>
          </div>
        </div>
      )}

      {!data && !error && (
        <div className="rounded-md border border-border-subtle bg-background/50 p-3 text-center text-xs text-slate-500 font-mono">
          Click &quot;Ping /api/health&quot; to test the configured dev proxy.
        </div>
      )}
    </div>
  );
};

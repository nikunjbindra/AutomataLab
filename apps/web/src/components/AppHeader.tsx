import React from 'react';
import { Menu, Activity } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle.js';
import { useHealthQuery } from '../api/queries.js';
import { StatusBadge } from './StatusBadge.js';
import { useLocation } from 'react-router-dom';

interface AppHeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onToggleSidebar,
}) => {
  const { data: health, isSuccess, isError } = useHealthQuery();
  const location = useLocation();

  const getBreadcrumbTitle = (path: string): string => {
    switch (path) {
      case '/':
        return 'My Machines & Examples';
      case '/builder':
        return 'Machine Builder';
      case '/convert':
        return 'Simulator & Converter';
      case '/simulate':
        return 'Simulation Laboratory';
      case '/docs':
        return 'Visual Learning Lab';
      default:
        return 'AutomataLab';
    }
  };

  return (
    <header className="h-13 border-b border-border bg-surface/90 backdrop-blur-sm px-4 md:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation sidebar"
          className="p-1.5 rounded-md border border-border text-foreground-muted hover:text-foreground hover:bg-surface-hover md:hidden transition-colors"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-foreground-muted">
          <span className="font-semibold text-foreground tracking-tight">AutomataLab</span>
          <span className="text-border">/</span>
          <span className="text-foreground font-medium">{getBreadcrumbTitle(location.pathname)}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Backend Connectivity Status */}
        <div className="hidden sm:flex items-center gap-2">
          {isSuccess ? (
            <StatusBadge
              variant="success"
              size="sm"
              label={`API v${health?.version || '1.0'}`}
              icon={<Activity className="w-3 h-3 text-emerald-500 animate-pulse" />}
            />
          ) : isError ? (
            <StatusBadge
              variant="error"
              size="sm"
              label="API Offline"
            />
          ) : (
            <StatusBadge
              variant="neutral"
              size="sm"
              label="Connecting..."
            />
          )}
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
};

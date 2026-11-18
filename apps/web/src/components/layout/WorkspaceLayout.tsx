import React, { useState } from 'react';
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  PanelBottomClose,
  PanelBottomOpen,
} from 'lucide-react';

interface WorkspaceLayoutProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  leftPanelTitle?: string;
  leftPanel: React.ReactNode;
  centerPanel: React.ReactNode;
  rightPanelTitle?: string;
  rightPanel?: React.ReactNode;
  bottomPanelTitle?: string;
  bottomPanel?: React.ReactNode;
  defaultLeftOpen?: boolean;
  defaultRightOpen?: boolean;
  defaultBottomOpen?: boolean;
}

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({
  title,
  subtitle,
  actions,
  leftPanelTitle = 'Configuration & Transition Matrix',
  leftPanel,
  centerPanel,
  rightPanelTitle = 'Conversion & Invariant Traces',
  rightPanel,
  bottomPanelTitle = 'Simulation Laboratory & Tape Stepper',
  bottomPanel,
  defaultLeftOpen = true,
  defaultRightOpen = true,
  defaultBottomOpen = false,
}) => {
  const [isLeftOpen, setIsLeftOpen] = useState(defaultLeftOpen);
  const [isRightOpen, setIsRightOpen] = useState(defaultRightOpen);
  const [isBottomOpen, setIsBottomOpen] = useState(defaultBottomOpen);

  return (
    <div className="flex flex-col h-[calc(100vh-7.5rem)] rounded-xl border border-border bg-surface overflow-hidden shadow-subtle">
      {/* Workspace Control Bar */}
      <div className="h-11 px-3 border-b border-border bg-surface-elevated/70 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {/* Left panel toggle */}
          <button
            type="button"
            onClick={() => setIsLeftOpen((prev) => !prev)}
            aria-label={isLeftOpen ? 'Collapse left panel' : 'Expand left panel'}
            className={`p-1 rounded-md text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors ${
              isLeftOpen ? 'text-accent-blue bg-accent-blue/10' : ''
            }`}
            title="Toggle Left Config Panel"
          >
            {isLeftOpen ? (
              <PanelLeftClose className="w-3.5 h-3.5" />
            ) : (
              <PanelLeftOpen className="w-3.5 h-3.5" />
            )}
          </button>

          {title && (
            <div className="flex items-center gap-2 border-l border-border pl-2">
              <span className="text-xs font-semibold text-foreground tracking-tight font-mono">
                {title}
              </span>
              {subtitle && (
                <span className="text-[11px] text-foreground-muted hidden sm:inline">
                  — {subtitle}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {actions}

          {/* Bottom panel toggle */}
          {bottomPanel && (
            <button
              type="button"
              onClick={() => setIsBottomOpen((prev) => !prev)}
              aria-label={isBottomOpen ? 'Collapse bottom panel' : 'Expand bottom panel'}
              className={`p-1 rounded-md text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors ${
                isBottomOpen ? 'text-accent-blue bg-accent-blue/10' : ''
              }`}
              title="Toggle Bottom Simulation Panel"
            >
              {isBottomOpen ? (
                <PanelBottomClose className="w-3.5 h-3.5" />
              ) : (
                <PanelBottomOpen className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          {/* Right panel toggle */}
          {rightPanel && (
            <button
              type="button"
              onClick={() => setIsRightOpen((prev) => !prev)}
              aria-label={isRightOpen ? 'Collapse right panel' : 'Expand right panel'}
              className={`p-1 rounded-md text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors ${
                isRightOpen ? 'text-accent-blue bg-accent-blue/10' : ''
              }`}
              title="Toggle Right Analysis Panel"
            >
              {isRightOpen ? (
                <PanelRightClose className="w-3.5 h-3.5" />
              ) : (
                <PanelRightOpen className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main Multi-Panel Workspace Body */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* LEFT PANEL */}
          {isLeftOpen && (
            <div className="w-80 border-r border-border bg-surface flex flex-col shrink-0 overflow-hidden">
              <div className="h-8 px-3 border-b border-border-subtle bg-surface-elevated/30 flex items-center justify-between text-[11px] font-mono text-foreground-muted">
                <span className="font-semibold uppercase tracking-wider">{leftPanelTitle}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3">{leftPanel}</div>
            </div>
          )}

          {/* CENTER CANVAS PANEL */}
          <div className="flex-1 flex flex-col min-w-0 bg-background relative overflow-hidden">
            {centerPanel}
          </div>

          {/* RIGHT PANEL */}
          {isRightOpen && rightPanel && (
            <div className="w-80 border-l border-border bg-surface flex flex-col shrink-0 overflow-hidden">
              <div className="h-8 px-3 border-b border-border-subtle bg-surface-elevated/30 flex items-center justify-between text-[11px] font-mono text-foreground-muted">
                <span className="font-semibold uppercase tracking-wider">{rightPanelTitle}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3">{rightPanel}</div>
            </div>
          )}
        </div>

        {/* BOTTOM PANEL */}
        {isBottomOpen && bottomPanel && (
          <div className="h-56 border-t border-border bg-surface flex flex-col shrink-0 overflow-hidden">
            <div className="h-8 px-3 border-b border-border-subtle bg-surface-elevated/30 flex items-center justify-between text-[11px] font-mono text-foreground-muted">
              <span className="font-semibold uppercase tracking-wider">{bottomPanelTitle}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3">{bottomPanel}</div>
          </div>
        )}
      </div>
    </div>
  );
};

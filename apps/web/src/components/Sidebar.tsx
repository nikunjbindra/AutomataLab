import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Cpu,
  Workflow,
  FlaskConical,
  GraduationCap,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  exact?: boolean;
}

const navItems: NavItem[] = [
  {
    to: '/convert',
    label: 'Simulator & Converter',
    icon: Workflow,
  },
  {
    to: '/builder',
    label: 'Machine Builder',
    icon: Cpu,
  },
  {
    to: '/',
    label: 'My Machines & Examples',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    to: '/docs',
    label: 'Visual Learning Lab',
    icon: GraduationCap,
  },
  {
    to: '/tests',
    label: 'Verification & Tests',
    icon: FlaskConical,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          role="presentation"
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar Container */}
      <aside
        aria-label="Main Navigation"
        className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col border-r border-border bg-surface transition-all duration-200 ease-in-out shrink-0 ${
          isCollapsed ? 'w-16' : 'w-64'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-13 px-4 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-accent-indigo flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold tracking-tight text-foreground uppercase font-mono">
                  AutomataLab
                </span>
                <span className="text-[10px] text-foreground-muted font-mono tracking-wider">
                  Mealy ↔ Moore Workbench
                </span>
              </div>
            )}
          </div>

          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="hidden md:flex p-1 rounded-md text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors"
            >
              {isCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5" />
              ) : (
                <ChevronLeft className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          <div className="px-2 pb-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-foreground-muted">
            {!isCollapsed && 'Navigation'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                onClick={onCloseMobile}
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-colors relative group ${
                    isActive
                      ? 'bg-accent-blue/10 text-accent-blue font-semibold dark:bg-accent-blue/15'
                      : 'text-foreground-muted hover:text-foreground hover:bg-surface-hover'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? 'text-accent-blue'
                          : 'text-foreground-muted group-hover:text-foreground'
                      }`}
                    />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}

                    {/* Active Indicator Bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-accent-blue" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* System Footer info */}
        <div className="p-3 border-t border-border shrink-0">
          {!isCollapsed ? (
            <div className="rounded-md border border-border-subtle bg-surface-elevated/40 p-2.5 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-foreground-muted">Engine</span>
                <span className="text-emerald-500 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> v1.0 Pure
                </span>
              </div>
              <div className="text-[10px] text-foreground-muted leading-tight font-mono">
                Strict Finite Transducers
              </div>
            </div>
          ) : (
            <div className="flex justify-center" title="Automata Engine v1.0 Pure">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

import React from 'react';

export type StatusBadgeVariant =
  | 'mealy'
  | 'moore'
  | 'success'
  | 'warning'
  | 'error'
  | 'neutral'
  | 'cyan';

interface StatusBadgeProps {
  variant?: StatusBadgeVariant;
  label: string;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

const variantStyles: Record<StatusBadgeVariant, { bg: string; text: string; border: string; dot: string }> = {
  mealy: {
    bg: 'bg-blue-500/10 dark:bg-blue-500/15',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-500/30',
    dot: 'bg-blue-500',
  },
  moore: {
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
    text: 'text-indigo-700 dark:text-indigo-400',
    border: 'border-indigo-500/30',
    dot: 'bg-indigo-500',
  },
  success: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-500',
  },
  warning: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-500/30',
    dot: 'bg-amber-500',
  },
  error: {
    bg: 'bg-rose-500/10 dark:bg-rose-500/15',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-500/30',
    dot: 'bg-rose-500',
  },
  neutral: {
    bg: 'bg-slate-500/10 dark:bg-slate-500/15',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-500/30',
    dot: 'bg-slate-400',
  },
  cyan: {
    bg: 'bg-cyan-500/10 dark:bg-cyan-500/15',
    text: 'text-cyan-700 dark:text-cyan-400',
    border: 'border-cyan-500/30',
    dot: 'bg-cyan-500',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant = 'neutral',
  label,
  size = 'md',
  icon,
}) => {
  const styles = variantStyles[variant];
  const sizeClasses =
    size === 'sm'
      ? 'px-1.5 py-0.5 text-[10px] gap-1'
      : 'px-2 py-0.5 text-xs gap-1.5 font-medium';

  return (
    <span
      className={`inline-flex items-center rounded-md border font-mono tracking-wide ${styles.bg} ${styles.text} ${styles.border} ${sizeClasses}`}
    >
      {icon ? (
        <span className="shrink-0">{icon}</span>
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${styles.dot}`} />
      )}
      <span>{label}</span>
    </span>
  );
};

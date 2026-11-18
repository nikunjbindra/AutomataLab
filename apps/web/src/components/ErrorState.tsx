import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  error?: string | Error;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to load data',
  error,
  onRetry,
  className = '',
}) => {
  const errorMessage =
    typeof error === 'string'
      ? error
      : error instanceof Error
      ? error.message
      : 'An unexpected network error occurred while communicating with the backend API.';

  return (
    <div
      className={`rounded-xl border border-rose-500/20 bg-rose-500/5 dark:bg-rose-500/10 p-6 md:p-8 text-center flex flex-col items-center justify-center max-w-md mx-auto ${className}`}
    >
      <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 text-accent-rose flex items-center justify-center mb-3">
        <AlertCircle className="w-5 h-5" />
      </div>

      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-foreground-muted mb-4 max-w-sm leading-relaxed">
        {errorMessage}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface border border-border hover:bg-surface-hover text-xs font-medium text-foreground transition-colors focus:outline-none focus:ring-1 focus:ring-accent-blue"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry Request</span>
        </button>
      )}
    </div>
  );
};

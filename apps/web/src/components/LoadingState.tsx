import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  subtext?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading data...',
  subtext,
  className = '',
}) => {
  return (
    <div
      className={`rounded-xl border border-border bg-surface p-8 md:p-12 text-center flex flex-col items-center justify-center ${className}`}
    >
      <Loader2 className="w-6 h-6 text-accent-blue animate-spin mb-3" />
      <p className="text-sm font-medium text-foreground">{message}</p>
      {subtext && (
        <p className="text-xs text-foreground-muted mt-1 max-w-xs">{subtext}</p>
      )}
    </div>
  );
};

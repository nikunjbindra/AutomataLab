import React, { useEffect } from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, FastForward } from 'lucide-react';

interface PlaybackBarProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  speed: number;
  onPlayToggle: () => void;
  onStepNext: () => void;
  onStepPrev: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onSeek?: (step: number) => void;
  caption?: string;
  className?: string;
}

export const PlaybackBar: React.FC<PlaybackBarProps> = ({
  currentStep,
  totalSteps,
  isPlaying,
  speed,
  onPlayToggle,
  onStepNext,
  onStepPrev,
  onReset,
  onSpeedChange,
  onSeek,
  caption,
  className = '',
}) => {
  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        onPlayToggle();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onStepNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onStepPrev();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        onReset();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPlayToggle, onStepNext, onStepPrev, onReset]);

  const speeds = [0.5, 1, 2];

  return (
    <div
      className={`rounded-xl border border-border bg-surface-elevated/95 shadow-md p-3 flex flex-col md:flex-row items-center justify-between gap-3 select-none backdrop-blur-sm transition-all ${className}`}
      role="region"
      aria-label="Animation Playback Controls"
    >
      {/* Left: Step navigation buttons */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onReset}
          title="Reset animation (R)"
          aria-label="Reset animation"
          className="p-1.5 rounded-lg border border-border bg-surface hover:bg-surface-hover text-foreground-muted hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onStepPrev}
          disabled={currentStep <= 0}
          title="Previous step (Left Arrow)"
          aria-label="Previous step"
          className="p-1.5 rounded-lg border border-border bg-surface hover:bg-surface-hover text-foreground-muted hover:text-foreground disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onPlayToggle}
          title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 font-medium text-xs transition-colors shadow-sm ${
            isPlaying
              ? 'bg-accent-amber text-slate-950 font-semibold hover:bg-amber-400'
              : 'bg-accent-blue text-white font-semibold hover:bg-blue-600'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{currentStep >= totalSteps ? 'Replay' : 'Play'}</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onStepNext}
          disabled={currentStep >= totalSteps}
          title="Next step (Right Arrow)"
          aria-label="Next step"
          className="p-1.5 rounded-lg border border-border bg-surface hover:bg-surface-hover text-foreground-muted hover:text-foreground disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Step Indicator */}
        <div className="ml-2 font-mono text-xs text-foreground-muted">
          Step <span className="font-bold text-foreground">{currentStep}</span> / {totalSteps}
        </div>
      </div>

      {/* Middle: Caption or progress bar */}
      <div className="flex-1 w-full max-w-xl px-2 flex flex-col items-center">
        {caption && (
          <div className="text-xs font-mono text-foreground text-center leading-relaxed break-words px-2.5 py-1 mb-1.5 w-full bg-surface/50 rounded-md border border-border-subtle">
            {caption}
          </div>
        )}
        {/* Scrubber */}
        <div className="w-full flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={totalSteps}
            value={currentStep}
            onChange={(e) => onSeek && onSeek(parseInt(e.target.value, 10))}
            aria-label="Animation progress slider"
            className="w-full h-1.5 bg-surface rounded-lg appearance-none cursor-pointer accent-accent-blue"
          />
        </div>
      </div>

      {/* Right: Speed selector */}
      <div className="flex items-center gap-1 shrink-0 text-xs">
        <FastForward className="w-3.5 h-3.5 text-foreground-muted mr-1" />
        {speeds.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSpeedChange(s)}
            className={`px-2 py-0.5 rounded font-mono text-[11px] transition-colors ${
              speed === s
                ? 'bg-accent-blue/15 text-accent-blue font-bold border border-accent-blue/30'
                : 'text-foreground-muted hover:text-foreground hover:bg-surface'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
};

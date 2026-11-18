import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PlaybackBar } from './PlaybackBar.js';
import { DiagramSvg } from './DiagramSvg.js';
import { StatusBadge } from '../StatusBadge.js';
import {
  MANDATORY_TASK_6_MEALY,
  convertMealyToMoore,
} from '@automatalab/automata';
import { GitCommit, ArrowRight, CheckCircle2 } from 'lucide-react';

export const LessonConversionTrace: React.FC = () => {
  const mealy = MANDATORY_TASK_6_MEALY;
  const conversionResult = useMemo(() => convertMealyToMoore(mealy), [mealy]);
  const moore = conversionResult.machine;
  const steps = conversionResult.steps;
  const stateMapping = conversionResult.stateMapping;

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);

  const totalSteps = steps.length - 1;

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) return;
    if (currentStep >= totalSteps) {
      setIsPlaying(false);
      return;
    }

    const interval = 2400 / speed;
    const timer = setTimeout(() => {
      setCurrentStep((prev) => {
        if (prev >= totalSteps) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, interval);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, totalSteps, speed]);

  const handlePlayToggle = useCallback(() => {
    if (currentStep >= totalSteps) {
      setCurrentStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  }, [currentStep, totalSteps]);

  const handleStepNext = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  }, [totalSteps]);

  const handleStepPrev = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(0);
  }, []);

  const activeStep = steps[currentStep] || steps[0];

  // Highlights per step
  const highlightedMealyState = useMemo(() => {
    if (currentStep === 1) return 'A';
    if (currentStep === 2) return 'B';
    return null;
  }, [currentStep]);

  const highlightedMooreState = useMemo(() => {
    if (currentStep === 2) return 'S';
    if (currentStep === 3) return 'A_x';
    return null;
  }, [currentStep]);

  return (
    <div className="space-y-5">
      {/* Step Header */}
      <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-surface-elevated/50">
        <div className="flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-accent-indigo" />
          <span className="text-xs font-mono font-bold text-foreground">
            Stage {activeStep.stepNumber}: {activeStep.title}
          </span>
        </div>
        <StatusBadge
          variant="moore"
          size="sm"
          label={`Step ${currentStep + 1} of ${steps.length}`}
        />
      </div>

      {/* Step Explanation Callout */}
      <div className="p-3.5 rounded-xl border border-border bg-surface font-mono text-xs space-y-1.5 shadow-subtle">
        <div className="font-bold text-foreground flex items-center justify-between">
          <span>{activeStep.title}</span>
          <span className="text-[11px] text-accent-blue font-semibold">
            {activeStep.type}
          </span>
        </div>
        <p className="text-foreground-muted leading-relaxed text-[11px]">
          {activeStep.description}
        </p>
        {activeStep.mathematicalReason && (
          <div className="text-[10px] text-accent-indigo bg-accent-indigo/5 dark:bg-accent-indigo/10 p-2 rounded border border-accent-indigo/20 mt-1">
            <strong>Theoretical Invariant:</strong> {activeStep.mathematicalReason}
          </div>
        )}
      </div>

      {/* Side-by-side: Source Mealy Machine vs Generated Moore Machine */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Source Mealy */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <StatusBadge variant="mealy" label="Source Mealy Machine" />
              <span className="text-xs font-mono text-foreground-muted">2 States: {'{A, B}'}</span>
            </div>
            <span className="text-[11px] font-mono text-foreground-muted">Original</span>
          </div>

          <DiagramSvg
            machine={mealy}
            activeState={highlightedMealyState}
            width={480}
            height={260}
            badge="Mealy Input"
          />

          {/* State Mapping Badges */}
          <div className="p-3 rounded-lg border border-border bg-surface font-mono text-xs space-y-1">
            <span className="text-[11px] font-bold text-foreground block">
              State Splitting Map:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded bg-surface-elevated border border-border-subtle">
                <span className="text-foreground font-bold">A</span>
                <ArrowRight className="w-3 h-3 inline mx-1.5 text-accent-blue" />
                <span className="text-accent-blue font-bold">{stateMapping['A']?.join(', ') || 'A_x, A_y'}</span>
              </div>
              <div className="p-2 rounded bg-surface-elevated border border-border-subtle">
                <span className="text-foreground font-bold">B</span>
                <ArrowRight className="w-3 h-3 inline mx-1.5 text-accent-indigo" />
                <span className="text-accent-indigo font-bold">{stateMapping['B']?.join(', ') || 'B_x, B_y'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Generated Moore */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <StatusBadge variant="moore" label="Converted Moore Machine" />
              <span className="text-xs font-mono text-foreground-muted">
                5 States: {'{S, A_x, A_y, B_x, B_y}'}
              </span>
            </div>
            <span className="text-[11px] font-mono text-accent-emerald font-bold">
              {currentStep >= 3 ? '✓ Reconstructed' : 'Generating...'}
            </span>
          </div>

          <DiagramSvg
            machine={moore}
            activeState={highlightedMooreState}
            width={480}
            height={260}
            badge="Generated Moore Model"
          />

          {/* Verified Equivalence Badge */}
          <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10 font-mono text-xs text-foreground space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-accent-emerald">
              <CheckCircle2 className="w-4 h-4" />
              <span>Behavioral Equivalence Invariant:</span>
            </div>
            <p className="text-[11px] text-foreground-muted pl-5 leading-relaxed">
              For any input sequence <code className="text-foreground font-bold">w</code>, Moore produces <code className="text-foreground font-bold">ε · Mealy(w)</code>. Stripping the initial <code className="text-accent-amber font-bold">ε</code> yields an identical output tape!
            </p>
          </div>
        </div>
      </div>

      {/* Playback Controls */}
      <PlaybackBar
        currentStep={currentStep}
        totalSteps={totalSteps}
        isPlaying={isPlaying}
        speed={speed}
        onPlayToggle={handlePlayToggle}
        onStepNext={handleStepNext}
        onStepPrev={handleStepPrev}
        onReset={handleReset}
        onSpeedChange={setSpeed}
        onSeek={setCurrentStep}
        caption={`Stage ${activeStep.stepNumber} of ${steps.length}: ${activeStep.title}`}
      />
    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import { PlaybackBar } from './PlaybackBar.js';
import { StatusBadge } from '../StatusBadge.js';
import { SplitFigure } from './SplitFigure.js';
import { Split } from 'lucide-react';

export const LessonStateSplitting: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const totalSteps = 4;

  const stepsMeta = [
    {
      title: '1. Find the arrows into A',
      caption: 'Start at A and read 0: you stay at A and get x. Start at B and read 0: you reach A and get y.',
      conflict: false,
    },
    {
      title: '2. Compare the answers',
      caption: 'Both arrows end at A. Which answer would you write inside A: x or y? One circle cannot show both.',
      conflict: true,
    },
    {
      title: '3. Draw two copies of A',
      caption: 'Write x inside one copy and y inside the other. Call them Aₓ and Aᵧ.',
      conflict: false,
    },
    {
      title: '4. Point each arrow to its copy',
      caption: 'Point the arrow that gave x to Aₓ. Point the arrow that gave y to Aᵧ.',
      conflict: false,
    },
    {
      title: '5. Try the next input',
      caption: 'From either copy, 0 takes you to Aₓ and 1 takes you to Bᵧ.',
      conflict: false,
    },
  ];

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) return;
    if (currentStep >= totalSteps) {
      setIsPlaying(false);
      return;
    }

    const interval = 2200 / speed;
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

  const activeMeta = stepsMeta[currentStep];

  return (
    <div className="space-y-5">
      <SplitFigure />
      <details className="lesson-detail"><summary>Explore the five construction steps</summary><div className="space-y-4 pt-4">
      {/* Step Header */}
      <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface-elevated/50">
        <div className="flex items-center gap-2">
          <Split className="w-4 h-4 text-accent-indigo" />
          <span className="text-xs font-mono font-bold text-foreground">
            {activeMeta.title}
          </span>
        </div>
        <StatusBadge
          variant={activeMeta.conflict ? 'warning' : 'moore'}
          size="sm"
          label={activeMeta.conflict ? 'Conflict Detected' : `Step ${currentStep + 1} of 5`}
        />
      </div>

      {/* Interactive Animation Canvas */}
      <div className="relative rounded-xl border border-border bg-surface p-6 min-h-[380px] flex items-center justify-center overflow-hidden shadow-inner select-none">
        <svg viewBox="0 0 700 340" className="w-full h-full max-h-[360px]">
          <defs>
            <marker id="split-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" className="fill-slate-400 dark:fill-slate-500" />
            </marker>
            <marker id="split-arrow-x" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" className="fill-accent-blue" />
            </marker>
            <marker id="split-arrow-y" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" className="fill-accent-indigo" />
            </marker>
          </defs>

          {/* Step 0 & 1: Single State A */}
          {currentStep < 2 && (
            <g className="transition-all duration-500">
              {/* State B source */}
              <g transform="translate(140, 170)">
                <circle r="30" className="fill-surface-elevated stroke-border stroke-[2]" />
                <text x="0" y="5" textAnchor="middle" className="font-mono text-sm font-bold fill-foreground">B</text>
              </g>

              {/* State A target */}
              <g transform="translate(480, 170)">
                <circle
                  r="34"
                  className={`transition-all duration-300 ${
                    currentStep === 1
                      ? 'fill-amber-500/10 stroke-accent-amber stroke-[3] animate-pulse ring-4 ring-amber-500/20'
                      : 'fill-surface-elevated stroke-accent-blue stroke-[2]'
                  }`}
                />
                <text x="0" y="5" textAnchor="middle" className="font-mono text-base font-bold fill-foreground">A</text>

                {currentStep === 1 && (
                  <g transform="translate(0, 52)">
                    <rect x="-65" y="-12" width="130" height="24" rx="6" className="fill-accent-amber/20 stroke-accent-amber stroke-[1]" />
                    <text x="0" y="4" textAnchor="middle" className="font-mono text-[10px] font-bold fill-accent-amber">
                      Output Conflict: {'{x, y}'}
                    </text>
                  </g>
                )}
              </g>

              {/* Transition B -> A with output y */}
              <path
                d="M 170 170 L 446 170"
                fill="none"
                className={`transition-all duration-300 ${
                  currentStep === 1 ? 'stroke-accent-indigo stroke-[2.5]' : 'stroke-slate-400 stroke-[1.5]'
                }`}
                markerEnd={currentStep === 1 ? 'url(#split-arrow-y)' : 'url(#split-arrow)'}
              />
              <g transform="translate(300, 155)">
                <rect x="-24" y="-10" width="48" height="20" rx="4" className="fill-surface-elevated stroke-border stroke-[0.5]" />
                <text x="0" y="4" textAnchor="middle" className="font-mono text-[11px] font-bold fill-accent-indigo">
                  0 / y
                </text>
              </g>

              {/* Self-loop A -> A with output x */}
              <path
                d="M 465 138 A 28 28 0 1 1 495 138"
                fill="none"
                className={`transition-all duration-300 ${
                  currentStep === 1 ? 'stroke-accent-blue stroke-[2.5]' : 'stroke-slate-400 stroke-[1.5]'
                }`}
                markerEnd={currentStep === 1 ? 'url(#split-arrow-x)' : 'url(#split-arrow)'}
              />
              <g transform="translate(480, 85)">
                <rect x="-24" y="-10" width="48" height="20" rx="4" className="fill-surface-elevated stroke-border stroke-[0.5]" />
                <text x="0" y="4" textAnchor="middle" className="font-mono text-[11px] font-bold fill-accent-blue">
                  0 / x
                </text>
              </g>
            </g>
          )}

          {/* Step 2, 3, 4: Split into A_x and A_y */}
          {currentStep >= 2 && (
            <g className="transition-all duration-500 animate-fadeIn">
              {/* State B */}
              <g transform="translate(120, 170)">
                <circle r="30" className="fill-surface-elevated stroke-border stroke-[2]" />
                <text x="0" y="5" textAnchor="middle" className="font-mono text-sm font-bold fill-foreground">B</text>
              </g>

              {/* State A_x (Top right) */}
              <g transform="translate(500, 95)">
                <circle r="34" className="fill-surface-elevated stroke-accent-blue stroke-[2.5]" />
                <line x1="-32" y1="0" x2="32" y2="0" className="stroke-border-subtle" />
                <text x="0" y="-7" textAnchor="middle" className="font-mono text-xs font-bold fill-foreground">A_x</text>
                <text x="0" y="16" textAnchor="middle" className="font-mono text-xs font-bold fill-accent-blue">x</text>

                <g transform="translate(48, 0)">
                  <rect x="0" y="-10" width="70" height="20" rx="4" className="fill-accent-blue/15 stroke-accent-blue/40 stroke-[0.5]" />
                  <text x="35" y="4" textAnchor="middle" className="font-mono text-[10px] font-bold fill-accent-blue">λ_M = x</text>
                </g>
              </g>

              {/* State A_y (Bottom right) */}
              <g transform="translate(500, 245)">
                <circle r="34" className="fill-surface-elevated stroke-accent-indigo stroke-[2.5]" />
                <line x1="-32" y1="0" x2="32" y2="0" className="stroke-border-subtle" />
                <text x="0" y="-7" textAnchor="middle" className="font-mono text-xs font-bold fill-foreground">A_y</text>
                <text x="0" y="16" textAnchor="middle" className="font-mono text-xs font-bold fill-accent-indigo">y</text>

                <g transform="translate(48, 0)">
                  <rect x="0" y="-10" width="70" height="20" rx="4" className="fill-accent-indigo/15 stroke-accent-indigo/40 stroke-[0.5]" />
                  <text x="35" y="4" textAnchor="middle" className="font-mono text-[10px] font-bold fill-accent-indigo">λ_M = y</text>
                </g>
              </g>

              {/* Directed transitions for Step 3 and 4 */}
              {currentStep >= 3 && (
                <>
                  {/* B -> A_y on 0 */}
                  <path
                    d="M 150 175 Q 310 235 466 243"
                    fill="none"
                    className="stroke-accent-indigo stroke-[2]"
                    markerEnd="url(#split-arrow-y)"
                  />
                  <g transform="translate(290, 225)">
                    <rect x="-20" y="-10" width="40" height="20" rx="4" className="fill-surface-elevated stroke-border stroke-[0.5]" />
                    <text x="0" y="4" textAnchor="middle" className="font-mono text-[11px] font-bold fill-accent-indigo">
                      0
                    </text>
                  </g>

                  {/* A_x self-loop or A_y -> A_x on 0 */}
                  <path
                    d="M 485 63 A 24 24 0 1 1 515 63"
                    fill="none"
                    className="stroke-accent-blue stroke-[2]"
                    markerEnd="url(#split-arrow-x)"
                  />
                  <g transform="translate(500, 22)">
                    <rect x="-16" y="-8" width="32" height="16" rx="4" className="fill-surface-elevated stroke-border stroke-[0.5]" />
                    <text x="0" y="4" textAnchor="middle" className="font-mono text-[10px] font-bold fill-accent-blue">0</text>
                  </g>

                  {/* A_y -> A_x on 0 */}
                  <path
                    d="M 470 230 Q 430 170 470 110"
                    fill="none"
                    className="stroke-accent-blue stroke-[1.5]"
                    markerEnd="url(#split-arrow-x)"
                  />
                  <g transform="translate(425, 170)">
                    <rect x="-14" y="-8" width="28" height="16" rx="4" className="fill-surface-elevated stroke-border stroke-[0.5]" />
                    <text x="0" y="4" textAnchor="middle" className="font-mono text-[10px] font-bold fill-accent-blue">0</text>
                  </g>
                </>
              )}

              {/* Step 4: Outgoing transition to B_y shown */}
              {currentStep >= 4 && (
                <g transform="translate(340, 290)">
                  <rect x="-100" y="-12" width="200" height="24" rx="6" className="fill-emerald-500/10 stroke-accent-emerald stroke-[1]" />
                  <text x="0" y="4" textAnchor="middle" className="font-mono text-[11px] font-bold fill-accent-emerald">
                    ✓ Outgoing (1 → B_y) Replicated for Both
                  </text>
                </g>
              )}
            </g>
          )}
        </svg>
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
        caption={activeMeta.caption}
      />

      </div></details>
      <details className="lesson-detail"><summary>Read the formal rules</summary>
      {/* Mathematical Principle */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
        <div className="p-3 rounded-xl border border-border bg-surface-elevated/40 space-y-1">
          <span className="font-bold text-accent-blue">InOutputs(q) Formula</span>
          <p className="text-foreground-muted text-[11px]">
            {'{'} y ∈ Δ | ∃ p, a: δ(p, a) = q ∧ λ(p, a) = y {'}'}
          </p>
        </div>

        <div className="p-3 rounded-xl border border-border bg-surface-elevated/40 space-y-1">
          <span className="font-bold text-accent-indigo">Clone State Rule</span>
          <p className="text-foreground-muted text-[11px]">
            For every distinct output y ∈ InOutputs(q), instantiate Moore state q_y with λ_M(q_y) = y.
          </p>
        </div>

        <div className="p-3 rounded-xl border border-border bg-surface-elevated/40 space-y-1">
          <span className="font-bold text-accent-emerald">Transition Forwarding</span>
          <p className="text-foreground-muted text-[11px]">
            δ_M(q_y, a) = (δ(q, a))_λ(q, a). Next state depends on original Mealy transition's output!
          </p>
        </div>
      </div></details>
    </div>
  );
};

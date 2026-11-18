import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PlaybackBar } from './PlaybackBar.js';
import { TapeDisplay } from './TapeDisplay.js';
import { DiagramSvg } from './DiagramSvg.js';
import { StatusBadge } from '../StatusBadge.js';
import {
  MANDATORY_TASK_6_MEALY,
  convertMealyToMoore,
  simulateMealy,
  simulateMoore,
} from '@automatalab/automata';
import { Info } from 'lucide-react';

export const LessonMealyVsMoore: React.FC = () => {
  // Real models
  const mealyMachine = MANDATORY_TASK_6_MEALY;
  const mooreResult = useMemo(() => convertMealyToMoore(mealyMachine), [mealyMachine]);
  const mooreMachine = mooreResult.machine;

  // Input sequence state
  const [inputStr, setInputStr] = useState('1100');
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  // Run real simulations
  const mealySim = useMemo(() => simulateMealy(mealyMachine, inputStr), [mealyMachine, inputStr]);
  const mooreSim = useMemo(() => simulateMoore(mooreMachine, inputStr), [mooreMachine, inputStr]);

  const totalSteps = inputStr.length;

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) return;
    if (currentStep >= totalSteps) {
      setIsPlaying(false);
      return;
    }

    const interval = 1200 / speed;
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

  // Compute active states & transitions at currentStep
  const mealyStep = mealySim.steps[currentStep] || mealySim.steps[0];
  const mooreStep = mooreSim.steps[currentStep] || mooreSim.steps[0];

  const mealyActiveState = mealyStep.currentState;
  const mooreActiveState = mooreStep.currentState;

  const mealyActiveTransition =
    currentStep > 0 && mealyStep.inputSymbol
      ? {
          from: mealySim.steps[currentStep - 1].currentState,
          to: mealyStep.currentState,
          input: mealyStep.inputSymbol,
        }
      : null;

  const mooreActiveTransition =
    currentStep > 0 && mooreStep.inputSymbol
      ? {
          from: mooreSim.steps[currentStep - 1].currentState,
          to: mooreStep.currentState,
          input: mooreStep.inputSymbol,
        }
      : null;

  // Explanatory dynamic caption
  const caption = useMemo(() => {
    if (currentStep === 0) {
      return "Initial State: Mealy (A) emits nothing. Moore (S) emits initial output 'ε' before any input is read.";
    }
    const inSym = inputStr[currentStep - 1];
    const mealyOut = mealyStep.emittedOutput;
    const mooreOut = mooreStep.emittedOutput;
    return `Step ${currentStep} (Input '${inSym}'): Mealy outputs '${mealyOut}' ON transition. Moore enters '${mooreActiveState}' which outputs '${mooreOut}'.`;
  }, [currentStep, inputStr, mealyStep, mooreStep, mooreActiveState]);

  return (
    <div className="space-y-5">
      {/* Input Sequence Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-border bg-surface-elevated/50">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold text-foreground-muted">Input Sequence:</span>
          {['1100', '1010', '0101', '1111'].map((seq) => (
            <button
              key={seq}
              type="button"
              onClick={() => {
                setInputStr(seq);
                setCurrentStep(0);
                setIsPlaying(false);
              }}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
                inputStr === seq
                  ? 'bg-accent-blue text-white shadow-sm'
                  : 'bg-surface hover:bg-surface-hover border border-border text-foreground-muted'
              }`}
            >
              {seq}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="custom-in" className="text-xs font-mono text-foreground-muted">Custom (0,1):</label>
          <input
            id="custom-in"
            type="text"
            value={inputStr}
            maxLength={8}
            onChange={(e) => {
              const val = e.target.value.replace(/[^01]/g, '');
              setInputStr(val);
              setCurrentStep(0);
              setIsPlaying(false);
            }}
            className="w-24 px-2 py-1 text-xs font-mono font-bold rounded border border-border bg-surface text-foreground focus:outline-none focus:border-accent-blue"
          />
        </div>
      </div>

      {/* Side-by-Side Machine Diagrams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Mealy Machine */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <StatusBadge variant="mealy" label="Mealy Machine" />
              <span className="text-xs font-mono text-foreground-muted">Output on Transition (λ: Q × Σ → Δ)</span>
            </div>
            <span className="text-xs font-mono font-bold text-accent-blue">
              State: {mealyActiveState}
            </span>
          </div>

          <DiagramSvg
            machine={mealyMachine}
            activeState={mealyActiveState}
            activeTransition={mealyActiveTransition}
            width={480}
            height={260}
            badge="Mealy: Transition-Coupled Output"
          />

          <TapeDisplay
            inputSymbols={inputStr.split('')}
            headIndex={currentStep > 0 ? currentStep - 1 : -1}
            outputSymbols={mealySim.steps.slice(1, currentStep + 1).map((s) => s.emittedOutput || '')}
            machineType="mealy"
          />
        </div>

        {/* Right: Moore Machine */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <StatusBadge variant="moore" label="Moore Machine" />
              <span className="text-xs font-mono text-foreground-muted">Output in State (λ_M: S → Δ)</span>
            </div>
            <span className="text-xs font-mono font-bold text-accent-indigo">
              State: {mooreActiveState}
            </span>
          </div>

          <DiagramSvg
            machine={mooreMachine}
            activeState={mooreActiveState}
            activeTransition={mooreActiveTransition}
            width={480}
            height={260}
            badge="Moore: State-Coupled Output"
          />

          <TapeDisplay
            inputSymbols={inputStr.split('')}
            headIndex={currentStep > 0 ? currentStep - 1 : -1}
            outputSymbols={mooreSim.steps.slice(0, currentStep + 1).map((s) => s.emittedOutput || 'ε')}
            machineType="moore"
            showInitialMooreOutput={true}
          />
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
        caption={caption}
      />

      {/* Concept Insight Box */}
      <div className="p-3.5 rounded-xl border border-accent-blue/20 bg-accent-blue/5 dark:bg-accent-blue/10 text-xs font-mono space-y-1.5 text-foreground">
        <div className="flex items-center gap-1.5 font-bold text-accent-blue">
          <Info className="w-4 h-4" />
          <span>Core Mathematical Distinction:</span>
        </div>
        <div className="text-foreground-muted leading-relaxed pl-5">
          • <strong>Mealy:</strong> Output is produced simultaneously with transition traversal: <code className="text-foreground font-bold">λ(q, a)</code>. Total outputs = |w|.<br />
          • <strong>Moore:</strong> Output depends solely on the active state: <code className="text-foreground font-bold">λ_M(s)</code>. It emits <code className="text-accent-amber font-bold">ε</code> at t=0 before any input is consumed. Total outputs = |w| + 1.
        </div>
      </div>
    </div>
  );
};

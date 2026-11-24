import { MachineFlashcard } from './MachineFlashcard.js';
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

  const mealyActiveState = mealyStep.nextState ?? mealyStep.currentState;
  const mooreActiveState = mooreStep.nextState ?? mooreStep.currentState;

  const mealyActiveTransition =
    currentStep > 0 && mealyStep.inputSymbol
      ? {
          from: mealyStep.currentState,
          to: mealyActiveState,
          input: mealyStep.inputSymbol,
        }
      : null;

  const mooreActiveTransition =
    currentStep > 0 && mooreStep.inputSymbol
      ? {
          from: mooreStep.currentState,
          to: mooreActiveState,
          input: mooreStep.inputSymbol,
        }
      : null;

  // Explanatory dynamic caption
  const caption = useMemo(() => {
    if (currentStep === 0) {
      return "Before the first input, Mealy has no answer yet. The starting Moore circle shows ε, which means empty.";
    }
    const inSym = inputStr[currentStep - 1];
    const mealyOut = mealyStep.emittedOutput;
    const mooreOut = mooreStep.emittedOutput;
    return `Step ${currentStep} (Input '${inSym}'): The Mealy arrow gives '${mealyOut}'. The Moore circle '${mooreActiveState}' gives '${mooreOut}'.`;
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
          <MachineFlashcard machine="Mealy" />

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
          <MachineFlashcard machine="Moore" />

          <TapeDisplay
            inputSymbols={inputStr.split('')}
            headIndex={currentStep > 0 ? currentStep - 1 : -1}
            outputSymbols={mooreSim.steps.slice(0, currentStep + 1).map((s) => s.emittedOutput || 'ε')}
            machineType="moore"
            showInitialMooreOutput={true}
          />
        </div>
      </div>



      {/* Compact Visual Concept Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        {/* Mealy Visual Flow */}
        <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 dark:bg-blue-500/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-accent-blue uppercase tracking-wider text-[11px]">
              Mealy · read the arrow
            </span>
            <span className="text-[10px] text-foreground-muted">One answer per input</span>
          </div>

          <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-surface border border-border text-foreground font-bold text-xs">
            <span className="px-2 py-1 rounded bg-surface-elevated border border-border">Read input</span>
            <span className="text-accent-blue font-mono font-bold">→</span>
            <span className="px-2 py-1 rounded bg-blue-500/20 text-accent-blue border border-blue-500/40">
              Follow arrow
            </span>
            <span className="text-accent-blue font-mono font-bold">→</span>
            <span className="px-2 py-1 rounded bg-emerald-500/20 text-accent-emerald border border-emerald-500/40">
              Read arrow label
            </span>
          </div>
          <p className="text-[11px] text-foreground-muted leading-relaxed">
            An arrow marked 1/y means “when you read 1, follow this arrow and give the answer y.”
          </p>
        </div>

        {/* Moore Visual Flow */}
        <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5 dark:bg-indigo-500/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-accent-indigo uppercase tracking-wider text-[11px]">
              Moore · read the circle
            </span>
            <span className="text-[10px] text-foreground-muted">Includes the start</span>
          </div>

          <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-surface border border-border text-foreground font-bold text-xs">
            <span className="px-2 py-1 rounded bg-surface-elevated border border-border">Read input</span>
            <span className="text-accent-indigo font-mono font-bold">→</span>
            <span className="px-2 py-1 rounded bg-indigo-500/20 text-accent-indigo border border-indigo-500/40">
              Reach circle
            </span>
            <span className="text-accent-indigo font-mono font-bold">→</span>
            <span className="px-2 py-1 rounded bg-emerald-500/20 text-accent-emerald border border-emerald-500/40">
              Read circle label
            </span>
          </div>
          <p className="text-[11px] text-foreground-muted leading-relaxed">
            A circle marked B/y gives the answer y whenever you reach B. In this example, the starting circle shows <strong className="text-accent-amber">ε</strong> before you read the first input.
          </p>
        </div>
      </div>

      {/* Visual Output Sequence Alignment Box */}
      <div className="p-3.5 rounded-xl border border-border bg-surface-elevated/40 text-xs font-mono space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-foreground text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-accent-blue" />
            <span>Output-Sequence Alignment Convention</span>
          </span>
          <span className="text-[10px] text-accent-emerald font-semibold">
            Equivalence: Moore(w)[1:] ≡ Mealy(w)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
          <div className="p-2.5 rounded-lg bg-surface border border-border-subtle space-y-1">
            <div className="text-foreground-muted">Tape Alignment Visualizer:</div>
            <div className="flex items-center gap-2">
              <span className="text-foreground-muted w-14">Mealy:</span>
              <span className="font-bold text-accent-blue tracking-widest bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                {mealySim.outputSequence.join(' ') || '—'}
              </span>
              <span className="text-foreground-muted text-[10px]">({mealySim.outputSequence.length} symbols)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-foreground-muted w-14">Moore:</span>
              <span className="font-bold text-accent-indigo tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                <span className="text-accent-amber mr-1">ε</span>
                {mooreSim.outputSequence.slice(1).join(' ') || '—'}
              </span>
              <span className="text-foreground-muted text-[10px]">({mooreSim.outputSequence.length} symbols)</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-surface border border-border-subtle flex flex-col justify-center text-foreground-muted text-[11px] leading-relaxed">
            <strong className="text-foreground">About the initial state marker ε:</strong>
            The synthetic state <code className="text-accent-cyan font-bold">S</code> emits <code className="text-accent-amber font-bold">ε</code> at t=0 to mark the quiescent state before input processing. It is not an ordinary consumed symbol; once stripped, both output streams are identical.
          </div>
        </div>

        {/* Collapsible Formal Definitions */}
        <details className="pt-2 border-t border-border-subtle group">
          <summary className="text-[11px] font-semibold text-accent-blue cursor-pointer select-none hover:underline flex items-center justify-between">
            <span>View formal 6-tuple mathematical definitions</span>
            <span className="text-foreground-muted text-[10px] group-open:hidden">+ expand</span>
            <span className="text-foreground-muted text-[10px] hidden group-open:inline">− collapse</span>
          </summary>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-foreground-muted p-2.5 rounded bg-surface border border-border-subtle">
            <div>
              <strong className="text-foreground block mb-0.5">Mealy Machine M = (Q, Σ, Δ, δ, λ, q₀)</strong>
              • δ: Q × Σ → Q (State transition)<br />
              • λ: Q × Σ → Δ (Transition output function)
            </div>
            <div>
              <strong className="text-foreground block mb-0.5">Moore Machine M = (S, Σ, Δ, δ, λ_M, s₀)</strong>
              • δ: S × Σ → S (State transition)<br />
              • λ_M: S → Δ (State output function)
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

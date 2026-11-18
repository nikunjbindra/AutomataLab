import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PlaybackBar } from './PlaybackBar.js';
import { TapeDisplay } from './TapeDisplay.js';
import { DiagramSvg } from './DiagramSvg.js';
import { StatusBadge } from '../StatusBadge.js';
import {
  MANDATORY_TASK_6_MEALY,
  EVEN_PARITY_MEALY,
  SEQUENCE_101_MEALY,
  convertMealyToMoore,
  simulateMealy,
  simulateMoore,
} from '@automatalab/automata';
import type { AnyMachine } from '@automatalab/contracts';

interface MachineOption {
  id: string;
  name: string;
  machine: AnyMachine;
  defaultInput: string;
}

export const LessonSimulation: React.FC = () => {
  const machineOptions: MachineOption[] = useMemo(() => {
    const task6Moore = convertMealyToMoore(MANDATORY_TASK_6_MEALY).machine;
    return [
      {
        id: 'task6-mealy',
        name: 'Task 6 Mealy Machine (States: A, B)',
        machine: MANDATORY_TASK_6_MEALY,
        defaultInput: '1100',
      },
      {
        id: 'task6-moore',
        name: 'Task 6 Moore Equivalent (5 States: S, A_x, A_y, B_x, B_y)',
        machine: task6Moore,
        defaultInput: '1100',
      },
      {
        id: 'parity-mealy',
        name: 'Even Parity Detector (States: even, odd)',
        machine: EVEN_PARITY_MEALY,
        defaultInput: '1011',
      },
      {
        id: '101-mealy',
        name: 'Sequence 101 Detector (States: s0, s1, s2)',
        machine: SEQUENCE_101_MEALY,
        defaultInput: '10101',
      },
    ];
  }, []);

  const [selectedMachineId, setSelectedMachineId] = useState<string>('task6-mealy');
  const activeOption = useMemo(
    () => machineOptions.find((m) => m.id === selectedMachineId) || machineOptions[0],
    [machineOptions, selectedMachineId]
  );

  const [inputStr, setInputStr] = useState<string>(activeOption.defaultInput);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);

  // Switch input string when machine changes
  const handleSelectMachine = (id: string) => {
    setSelectedMachineId(id);
    const opt = machineOptions.find((m) => m.id === id);
    if (opt) setInputStr(opt.defaultInput);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  // Run simulation
  const simTrace = useMemo(() => {
    if (activeOption.machine.type === 'moore') {
      return simulateMoore(activeOption.machine as any, inputStr);
    }
    return simulateMealy(activeOption.machine as any, inputStr);
  }, [activeOption.machine, inputStr]);

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

  // Compute active state and transition
  const stepRecord = simTrace.steps[currentStep] || simTrace.steps[0];
  const activeState = stepRecord.currentState;

  const activeTransition =
    currentStep > 0 && stepRecord.inputSymbol
      ? {
          from: simTrace.steps[currentStep - 1].currentState,
          to: stepRecord.currentState,
          input: stepRecord.inputSymbol,
        }
      : null;

  const caption = useMemo(() => {
    if (currentStep === 0) {
      return activeOption.machine.type === 'moore'
        ? `Initial State ${activeState}: emits initial token '${stepRecord.emittedOutput || 'ε'}' at t=0 before consuming input.`
        : `Initial State ${activeState}: ready to read input sequence '${inputStr}'.`;
    }
    const sym = inputStr[currentStep - 1];
    const out = stepRecord.emittedOutput;
    return `Step ${currentStep}: Read symbol '${sym}' → State '${activeState}', Emitted output '${out}'.`;
  }, [currentStep, activeOption.machine.type, activeState, stepRecord.emittedOutput, inputStr]);

  // Output symbols for tape
  const outputSymbols = useMemo(() => {
    if (activeOption.machine.type === 'moore') {
      return simTrace.steps.slice(0, currentStep + 1).map((s) => s.emittedOutput || 'ε');
    }
    return simTrace.steps.slice(1, currentStep + 1).map((s) => s.emittedOutput || '');
  }, [activeOption.machine.type, simTrace.steps, currentStep]);

  return (
    <div className="space-y-5">
      {/* Configuration Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border bg-surface-elevated/50">
        <div className="flex items-center gap-2">
          <label htmlFor="machine-select" className="text-xs font-mono font-bold text-foreground">Select Model:</label>
          <select
            id="machine-select"
            value={selectedMachineId}
            onChange={(e) => handleSelectMachine(e.target.value)}
            className="px-2.5 py-1 text-xs font-mono rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:border-accent-blue font-semibold"
          >
            {machineOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-foreground-muted">Input Tape:</span>
          {['1100', '1010', '0011', '10101'].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setInputStr(preset);
                setCurrentStep(0);
                setIsPlaying(false);
              }}
              className={`px-2 py-0.5 text-xs font-mono rounded border transition-colors ${
                inputStr === preset
                  ? 'bg-accent-blue text-white border-accent-blue'
                  : 'bg-surface border-border text-foreground-muted hover:text-foreground'
              }`}
            >
              {preset}
            </button>
          ))}
          <input
            type="text"
            value={inputStr}
            maxLength={10}
            onChange={(e) => {
              const val = e.target.value.replace(/[^01]/g, '');
              setInputStr(val);
              setCurrentStep(0);
              setIsPlaying(false);
            }}
            aria-label="Input sequence"
            className="w-24 px-2 py-0.5 text-xs font-mono font-bold rounded border border-border bg-surface text-foreground"
          />
        </div>
      </div>

      {/* Main Simulation View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Graph Canvas (2 cols) */}
        <div className="lg:col-span-2 space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <StatusBadge
                variant={activeOption.machine.type === 'moore' ? 'moore' : 'mealy'}
                label={activeOption.machine.type === 'moore' ? 'Moore Machine' : 'Mealy Machine'}
              />
              <span className="text-xs font-mono text-foreground-muted">
                Active State: <strong className="text-foreground">{activeState}</strong>
              </span>
            </div>
            {currentStep > 0 && (
              <span className="text-xs font-mono text-accent-emerald font-bold">
                Last Output: '{stepRecord.emittedOutput}'
              </span>
            )}
          </div>

          <DiagramSvg
            machine={activeOption.machine}
            activeState={activeState}
            activeTransition={activeTransition}
            width={580}
            height={320}
            badge={`${activeOption.machine.name} Simulation`}
          />
        </div>

        {/* Telemetry & Tape Panel (1 col) */}
        <div className="space-y-4 rounded-xl border border-border bg-surface p-4 flex flex-col justify-between">
          <div className="space-y-3 font-mono text-xs">
            <div className="text-xs font-bold text-foreground border-b border-border pb-1.5 flex items-center justify-between">
              <span>Execution Telemetry</span>
              <span className="text-[11px] font-normal text-foreground-muted">
                t = {currentStep}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded bg-surface-elevated border border-border-subtle">
                <span className="text-foreground-muted text-[10px] block">CURRENT STATE</span>
                <span className="text-sm font-bold text-accent-blue">{activeState}</span>
              </div>

              <div className="p-2 rounded bg-surface-elevated border border-border-subtle">
                <span className="text-foreground-muted text-[10px] block">READ SYMBOL</span>
                <span className="text-sm font-bold text-foreground">
                  {currentStep > 0 ? `'${inputStr[currentStep - 1]}'` : '—'}
                </span>
              </div>

              <div className="p-2 rounded bg-surface-elevated border border-border-subtle">
                <span className="text-foreground-muted text-[10px] block">EMITTED OUTPUT</span>
                <span className="text-sm font-bold text-accent-emerald">
                  {stepRecord.emittedOutput ? `'${stepRecord.emittedOutput}'` : '—'}
                </span>
              </div>

              <div className="p-2 rounded bg-surface-elevated border border-border-subtle">
                <span className="text-foreground-muted text-[10px] block">PROGRESS</span>
                <span className="text-sm font-bold text-foreground">
                  {Math.round((currentStep / Math.max(totalSteps, 1)) * 100)}%
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-border-subtle">
              <span className="text-[11px] text-foreground-muted block mb-1">
                Transition Description:
              </span>
              <p className="text-xs font-semibold text-foreground bg-surface-elevated/70 p-2 rounded border border-border-subtle">
                {stepRecord.transitionDescription || 'Initial state ready'}
              </p>
            </div>
          </div>

          {/* Tapes */}
          <TapeDisplay
            inputSymbols={inputStr.split('')}
            headIndex={currentStep > 0 ? currentStep - 1 : -1}
            outputSymbols={outputSymbols}
            machineType={activeOption.machine.type}
            showInitialMooreOutput={activeOption.machine.type === 'moore'}
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
    </div>
  );
};

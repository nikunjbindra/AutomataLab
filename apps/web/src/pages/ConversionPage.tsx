import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { DiagramSvg } from '../components/learning/DiagramSvg.js';
import { ConversionToolbar } from '../components/conversion/ConversionToolbar.js';
import { ConversionStepper } from '../components/conversion/ConversionStepper.js';
import { DualSimulationPanel } from '../components/conversion/DualSimulationPanel.js';
import { ExampleGalleryModal, BENCHMARK_EXAMPLES } from '../components/conversion/ExampleGalleryModal.js';
import type { ConversionDirection, ConversionStageMeta } from '../components/conversion/types.js';
import {
  MANDATORY_TASK_6_MEALY,
  convertMealyToMoore,
  convertMooreToMealy,
} from '@automatalab/automata';
import type { AnyMachine, MealyMachine, MooreMachine } from '@automatalab/contracts';
import { useMachinesQuery, useCreateMachineMutation } from '../api/queries.js';
import { Layers, PlayCircle } from 'lucide-react';

export const ConversionPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Queries & Mutations
  const { data: savedMachines = [] } = useMachinesQuery();
  const createMutation = useCreateMachineMutation();

  // Selected Machine & Direction
  const [selectedMachine, setSelectedMachine] = useState<AnyMachine>(MANDATORY_TASK_6_MEALY);
  const [direction, setDirection] = useState<ConversionDirection>('mealy-to-moore');
  const [isConverted, setIsConverted] = useState(true);
  const [activeTab, setActiveTab] = useState<'conversion' | 'simulation'>('conversion');
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  // Stepper state
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  // Interactive Graph Hover & Select sync
  const [hoveredSourceState, setHoveredSourceState] = useState<string | null>(null);
  const [hoveredTargetState, setHoveredTargetState] = useState<string | null>(null);
  const [activeSimStates, setActiveSimStates] = useState<{ source?: string; target?: string }>({});

  // Check if routed with a specific machine ID from builder or dashboard
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const machineId = queryParams.get('id') || (location.state as any)?.machineId;
    if (machineId && savedMachines.length > 0) {
      const match = savedMachines.find((m) => m.id === machineId);
      if (match) {
        setSelectedMachine(match.machineData as AnyMachine);
        setDirection(match.type === 'moore' ? 'moore-to-mealy' : 'mealy-to-moore');
        setCurrentStep(0);
        setIsConverted(true);
      }
    }
  }, [location.search, location.state, savedMachines]);

  // Execute mathematical conversion based on direction
  const conversionData = useMemo(() => {
    try {
      if (direction === 'mealy-to-moore') {
        const mealy =
          selectedMachine.type === 'mealy'
            ? (selectedMachine as MealyMachine)
            : MANDATORY_TASK_6_MEALY;
        const res = convertMealyToMoore(mealy);

        // Build 9 clear pedagogical conversion stages
        const stages: ConversionStageMeta[] = [
          {
            stepIndex: 0,
            title: '1. Display Source Mealy Machine',
            shortLabel: 'Source Machine',
            description: `Verified source Mealy machine '${mealy.name}' with ${mealy.states.length} states and ${mealy.transitions.length} transitions.`,
            invariant: 'M = (Q, Σ, Δ, δ, λ, q₀) is well-formed, complete, and deterministic.',
            highlightedSourceNodes: mealy.states,
          },
          {
            stepIndex: 1,
            title: '2. Analyze Incoming Transition Outputs',
            shortLabel: 'Output Analysis',
            description:
              'For each state q ∈ Q, collect the set of all outputs emitted by incoming transitions: InOutputs(q).',
            invariant: 'InOutputs(q) = { y ∈ Δ | ∃ p ∈ Q, a ∈ Σ: δ(p, a) = q ∧ λ(p, a) = y }',
            highlightedSourceNodes: mealy.states,
          },
          {
            stepIndex: 2,
            title: '3. Detect Required State Splits',
            shortLabel: 'Conflict Detection',
            description:
              'States reached with multiple distinct outputs cannot exist in a Moore machine without splitting.',
            invariant: '|InOutputs(q)| > 1 implies state q must be split into multiple Moore states.',
            highlightedSourceNodes: mealy.states.filter(
              (s) => (res.stateMapping[s]?.length || 0) > 1
            ),
          },
          {
            stepIndex: 3,
            title: '4. Instantiate Moore States (q_y)',
            shortLabel: 'State Instantiation',
            description:
              'For each distinct output y ∈ InOutputs(q), create a Moore state q_y assigned fixed output λ_M(q_y) = y.',
            invariant: 'S_Moore = { q_y | q ∈ Q, y ∈ InOutputs(q) } ∪ { S }',
            highlightedTargetNodes: res.machine.states.filter((s) => s !== 'S'),
          },
          {
            stepIndex: 4,
            title: '5. Introduce Synthetic Initial State S (Output ε)',
            shortLabel: 'Initial State S/ε',
            description:
              'Introduce start state S with non-emitting marker ε to represent the machine before any input is read.',
            invariant: 'λ_M(S) = ε. S mimics all transitions of original start state q₀.',
            highlightedTargetNodes: ['S'],
          },
          {
            stepIndex: 5,
            title: '6. Reconstruct & Redirect State Transitions',
            shortLabel: 'Transition Wiring',
            description:
              'Reconstruct transitions: outgoing transitions from q_y route to the target clone matching the Mealy output.',
            invariant: 'δ_M(q_y, a) = (δ(q, a))_λ(q, a)',
            highlightedTargetNodes: res.machine.states,
          },
          {
            stepIndex: 6,
            title: '7. Reachability Verification (BFS Pruning)',
            shortLabel: 'Reachability',
            description:
              'Explore reachability from start state S via Breadth-First Search; eliminate any disconnected clones.',
            invariant: 'Every state in the final Moore machine is reachable from start state S.',
            highlightedTargetNodes: res.machine.states,
          },
          {
            stepIndex: 7,
            title: '8. Full Converted Moore Machine Assembly',
            shortLabel: 'Assembly Complete',
            description: `Successfully synthesized Moore machine '${res.machine.name}' with ${res.machine.states.length} states.`,
            invariant: '|S_Moore| ≤ |Q_Mealy| · |Δ| + 1',
            highlightedTargetNodes: res.machine.states,
          },
          {
            stepIndex: 8,
            title: '9. Behavioral Equivalence & Output Alignment',
            shortLabel: 'Equivalence Proven',
            description:
              'For any input string w, Moore output equals ε · Mealy(w). Stripping initial ε yields an identical tape.',
            invariant: 'Moore(w)[1:] ≡ Mealy(w) for all w ∈ Σ*',
            highlightedSourceNodes: mealy.states,
            highlightedTargetNodes: res.machine.states,
          },
        ];

        return {
          targetMachine: res.machine,
          stateMapping: res.stateMapping,
          stages,
        };
      } else {
        // Moore to Mealy conversion
        const moore =
          selectedMachine.type === 'moore'
            ? (selectedMachine as MooreMachine)
            : BENCHMARK_EXAMPLES[2].machine as MooreMachine;
        const res = convertMooreToMealy(moore);

        const stages: ConversionStageMeta[] = [
          {
            stepIndex: 0,
            title: '1. Display Source Moore Machine',
            shortLabel: 'Source Moore',
            description: `Verified source Moore machine '${moore.name}' with ${moore.states.length} states and fixed state outputs.`,
            invariant: 'M = (S, Σ, Δ, δ, λ_M, s₀) where state outputs are bound to nodes.',
            highlightedSourceNodes: moore.states,
          },
          {
            stepIndex: 1,
            title: '2. Inspect State Output Table (λ_M)',
            shortLabel: 'Inspect Outputs',
            description:
              'Identify the output associated with every state: λ_M(s). Initial state emits output before reading input.',
            invariant: 'λ_M: S → Δ maps each Moore state to its designated output symbol.',
            highlightedSourceNodes: moore.states,
          },
          {
            stepIndex: 2,
            title: '3. Preserve State Graph Topology',
            shortLabel: 'Graph Topology',
            description:
              'In Moore-to-Mealy conversion, state splitting is not required: Q_Mealy = S_Moore.',
            invariant: 'No state explosion occurs: |Q_Mealy| = |S_Moore|.',
            highlightedTargetNodes: res.machine.states,
          },
          {
            stepIndex: 3,
            title: '4. Fold Target State Outputs onto Transitions',
            shortLabel: 'Output Folding',
            description:
              'Assign each Mealy transition the output of its destination state: λ(s, a) = λ_M(δ(s, a)).',
            invariant: 'λ(s, a) = λ_M(δ_M(s, a)) for all s ∈ S, a ∈ Σ.',
            highlightedTargetNodes: res.machine.states,
          },
          {
            stepIndex: 4,
            title: '5. Assemble Converted Mealy Machine',
            shortLabel: 'Assembly Complete',
            description: `Generated Mealy machine '${res.machine.name}' with ${res.machine.states.length} states and ${res.machine.transitions.length} transitions.`,
            invariant: 'M_Mealy is complete, deterministic, and preserves source transition topology.',
            highlightedTargetNodes: res.machine.states,
          },
          {
            stepIndex: 5,
            title: '6. Side-by-Side Model Comparison',
            shortLabel: 'Model Comparison',
            description:
              'Observe that both machines share identical state graphs, with outputs relocated from nodes to directed edges.',
            invariant: 'Topology isomorphism with transition output folding.',
            highlightedSourceNodes: moore.states,
            highlightedTargetNodes: res.machine.states,
          },
          {
            stepIndex: 6,
            title: '7. Output Equivalence & Initial Output Convention',
            shortLabel: 'Equivalence Proven',
            description:
              `Mealy outputs match Moore outputs exactly after excluding initial Moore output '${res.initialOutput}'.`,
            invariant: 'Mealy(w) ≡ Moore(w)[1:] for all non-empty strings w ∈ Σ*.',
            highlightedSourceNodes: moore.states,
            highlightedTargetNodes: res.machine.states,
          },
        ];

        // 1-to-1 mapping for Moore to Mealy
        const mapping: Record<string, string[]> = {};
        moore.states.forEach((s) => {
          mapping[s] = [s];
        });

        return {
          targetMachine: res.machine,
          stateMapping: mapping,
          stages,
        };
      }
    } catch (err) {
      console.error('Conversion execution error:', err);
      return {
        targetMachine: selectedMachine,
        stateMapping: {} as Record<string, string[]>,
        stages: [] as ConversionStageMeta[],
      };
    }
  }, [selectedMachine, direction]);

  const targetMachine = conversionData.targetMachine;
  const stages = conversionData.stages;
  const stateMapping: Record<string, string[]> = conversionData.stateMapping;
  const totalSteps = stages.length > 0 ? stages.length - 1 : 0;

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

  // Save converted machine to backend DB
  const handleSaveConverted = async () => {
    try {
      await createMutation.mutateAsync({
        ...targetMachine,
        name: `${targetMachine.name} (Converted)`,
        description: `AutomataLab Phase 5 converted ${targetMachine.type} machine derived from ${selectedMachine.name}.`,
      });
      alert(`Successfully saved converted ${targetMachine.type.toUpperCase()} machine to your database!`);
    } catch (err) {
      console.error('Failed to save converted machine:', err);
      alert('Failed to save converted machine to database.');
    }
  };

  // Export JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(targetMachine, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${targetMachine.name.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Highlights derived from hover and step
  const activeStage = stages[currentStep] || stages[0];

  const highlightedSourceState = useMemo(() => {
    if (activeSimStates.source) return activeSimStates.source;
    if (hoveredSourceState) return hoveredSourceState;
    if (hoveredTargetState) {
      // Find source state mapped to this target state
      for (const [src, targets] of Object.entries(stateMapping)) {
        if (targets.includes(hoveredTargetState)) return src;
      }
    }
    if (activeStage?.highlightedSourceNodes?.length === 1) {
      return activeStage.highlightedSourceNodes[0];
    }
    return null;
  }, [activeSimStates.source, hoveredSourceState, hoveredTargetState, stateMapping, activeStage]);

  const highlightedTargetState = useMemo(() => {
    if (activeSimStates.target) return activeSimStates.target;
    if (hoveredTargetState) return hoveredTargetState;
    if (hoveredSourceState && stateMapping[hoveredSourceState]) {
      return stateMapping[hoveredSourceState][0] || null;
    }
    if (activeStage?.highlightedTargetNodes?.length === 1) {
      return activeStage.highlightedTargetNodes[0];
    }
    return null;
  }, [activeSimStates.target, hoveredTargetState, hoveredSourceState, stateMapping, activeStage]);

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12 select-none">
      {/* Header */}
      <PageHeader
        title="Interactive Conversion Workspace"
        description="Formal Mealy ↔ Moore bidirectional automata converter with step-by-step state transformation and synchronous simulation."
        badge={
          <StatusBadge
            variant="cyan"
            size="sm"
            label={direction === 'mealy-to-moore' ? 'Mealy → Moore Pipeline' : 'Moore → Mealy Pipeline'}
          />
        }
      />

      {/* Top Toolbar */}
      <ConversionToolbar
        selectedMachine={selectedMachine}
        savedMachines={savedMachines}
        onSelectSavedMachine={(m) => {
          setSelectedMachine(m);
          setDirection(m.type === 'moore' ? 'moore-to-mealy' : 'mealy-to-moore');
          setCurrentStep(0);
          setIsConverted(true);
        }}
        onOpenGallery={() => setIsGalleryOpen(true)}
        direction={direction}
        onDirectionChange={(dir) => {
          setDirection(dir);
          setCurrentStep(0);
          setIsConverted(true);
        }}
        onConvert={() => {
          setCurrentStep(0);
          setIsConverted(true);
          setIsPlaying(true);
        }}
        onReset={handleReset}
        onSaveConverted={handleSaveConverted}
        onExportJson={handleExportJson}
        onEditInBuilder={() => navigate(`/builder?id=${selectedMachine.name}`)}
        isConverted={isConverted}
        isSaving={createMutation.isPending}
      />

      {/* Workspace Tabs: Conversion Visualization vs Dual Simulation */}
      <div className="flex items-center gap-1.5 border-b border-border pb-1 font-mono text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('conversion')}
          className={`px-3 py-1.5 rounded-t-lg font-bold transition-all flex items-center gap-2 ${
            activeTab === 'conversion'
              ? 'border-b-2 border-accent-blue text-accent-blue bg-surface-elevated/40'
              : 'text-foreground-muted hover:text-foreground hover:bg-surface'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Step-by-Step Transformation ({stages.length} Stages)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('simulation')}
          className={`px-3 py-1.5 rounded-t-lg font-bold transition-all flex items-center gap-2 ${
            activeTab === 'simulation'
              ? 'border-b-2 border-accent-blue text-accent-blue bg-surface-elevated/40'
              : 'text-foreground-muted hover:text-foreground hover:bg-surface'
          }`}
        >
          <PlayCircle className="w-3.5 h-3.5 text-accent-emerald" />
          <span>Dual Simulation & Validation</span>
        </button>
      </div>

      {/* MAIN DUAL VISUALIZATION CANVAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Source Machine */}
        <div className="space-y-2 rounded-xl border border-border bg-surface p-4 shadow-subtle">
          <div className="flex items-center justify-between border-b border-border-subtle pb-2">
            <div className="flex items-center gap-2">
              <StatusBadge
                variant={selectedMachine.type === 'moore' ? 'moore' : 'mealy'}
                label={`Source: ${selectedMachine.type.toUpperCase()}`}
              />
              <span className="font-mono text-xs font-bold text-foreground">
                {selectedMachine.name}
              </span>
            </div>
            <span className="text-[11px] font-mono text-foreground-muted">
              {selectedMachine.states.length} States, {selectedMachine.alphabet.length} Inputs
            </span>
          </div>

          <div
            onMouseLeave={() => setHoveredSourceState(null)}
            className="w-full"
          >
            <DiagramSvg
              machine={selectedMachine}
              activeState={highlightedSourceState}
              highlightedState={hoveredSourceState}
              onStateClick={(st) => setHoveredSourceState(st === hoveredSourceState ? null : st)}
              width={520}
              height={320}
              badge={`Original ${selectedMachine.type.toUpperCase()} Machine`}
            />
          </div>

          {/* Source State mapping footer */}
          <div className="p-2.5 rounded-lg bg-surface-elevated/40 border border-border-subtle font-mono text-[11px] flex items-center justify-between text-foreground-muted">
            <span>Hover or click any state to highlight target mappings.</span>
            {hoveredSourceState && stateMapping[hoveredSourceState] && (
              <span className="text-accent-blue font-bold">
                {hoveredSourceState} → {stateMapping[hoveredSourceState].join(', ')}
              </span>
            )}
          </div>
        </div>

        {/* Right: Converted Target Machine */}
        <div className="space-y-2 rounded-xl border border-border bg-surface p-4 shadow-subtle">
          <div className="flex items-center justify-between border-b border-border-subtle pb-2">
            <div className="flex items-center gap-2">
              <StatusBadge
                variant={targetMachine.type === 'moore' ? 'moore' : 'mealy'}
                label={`Target: ${targetMachine.type.toUpperCase()}`}
              />
              <span className="font-mono text-xs font-bold text-foreground">
                {targetMachine.name}
              </span>
            </div>
            <span className="text-[11px] font-mono text-accent-emerald font-bold">
              ✓ {targetMachine.states.length} States Generated
            </span>
          </div>

          <div
            onMouseLeave={() => setHoveredTargetState(null)}
            className="w-full"
          >
            <DiagramSvg
              machine={targetMachine}
              activeState={highlightedTargetState}
              highlightedState={hoveredTargetState}
              onStateClick={(st) => setHoveredTargetState(st === hoveredTargetState ? null : st)}
              width={520}
              height={320}
              badge={`Synthesized ${targetMachine.type.toUpperCase()} Model`}
            />
          </div>

          {/* State Splitting Mapping Badges */}
          <div className="p-2.5 rounded-lg bg-surface-elevated/40 border border-border-subtle font-mono text-[11px] flex items-center justify-between text-foreground-muted">
            <span className="truncate max-w-[280px]">
              {direction === 'mealy-to-moore'
                ? `Mapped ${Object.keys(stateMapping).length} Mealy states into ${targetMachine.states.length} Moore states`
                : 'Direct 1-to-1 topology preservation with output transition folding'}
            </span>
            {hoveredTargetState && (
              <span className="text-accent-indigo font-bold">
                Selected: {hoveredTargetState}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Stepper OR Dual Simulation */}
      {activeTab === 'conversion' ? (
        <ConversionStepper
          currentStep={currentStep}
          totalSteps={totalSteps}
          stages={stages}
          isPlaying={isPlaying}
          speed={speed}
          onPlayToggle={handlePlayToggle}
          onStepNext={handleStepNext}
          onStepPrev={handleStepPrev}
          onReset={handleReset}
          onSpeedChange={setSpeed}
          onSeek={setCurrentStep}
          sourceMachine={selectedMachine}
          convertedMachine={targetMachine}
        />
      ) : (
        <DualSimulationPanel
          sourceMachine={selectedMachine}
          convertedMachine={targetMachine}
          onActiveStatesChange={(sourceState, targetState) => {
            setActiveSimStates({ source: sourceState, target: targetState });
          }}
        />
      )}

      {/* Predefined Example Gallery Modal */}
      <ExampleGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        selectedId={selectedMachine.name}
        onSelect={(ex) => {
          setSelectedMachine(ex.machine);
          setDirection(ex.recommendedDirection);
          setCurrentStep(0);
          setIsConverted(true);
        }}
      />
    </div>
  );
};

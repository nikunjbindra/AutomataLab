import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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
  verifyEquivalenceProductMachine,
  simulateMealy,
  simulateMoore,
} from '@automatalab/automata';
import { AnyMachineSchema, type AnyMachine, type MealyMachine, type MooreMachine } from '@automatalab/contracts';
import { useMachinesQuery, useCreateMachineMutation } from '../api/queries.js';
import { Layers, PlayCircle } from 'lucide-react';

// --- Stage-aware target visibility for progressive Mealy→Moore animation ---
//
// Mealy→Moore (9 formally grounded stages):
//   step 0 (Stage 1): placeholder (only original Mealy machine visible)
//   step 1 (Stage 2): placeholder (incoming output analysis on source)
//   step 2 (Stage 3): placeholder (conflict detection on source, amber rings)
//   step 3 (Stage 4): reveal split Moore states (non-S) — no transitions, outputs hidden
//   step 4 (Stage 5): reveal transitions between split Moore states — outputs still hidden
//   step 5 (Stage 6): reveal state-associated outputs on split Moore states
//   step 6 (Stage 7): introduce synthetic start state S (output ε) and its transitions
//   step 7 (Stage 8): complete converted Moore machine with all states & transitions
//   step 8 (Stage 9): visual output-equivalence validation banner (1100 -> yxyx vs εyxyx)
//
// Moore→Mealy (7 stages):
//   step 0–1: placeholder
//   step 2:   show states (topology preserved), no transitions
//   step 3:   show transitions (output folding)
//   step 4+:  full machine

function computeTargetVisibility(
  step: number,
  direction: ConversionDirection,
  targetMachine: AnyMachine,
  stateMapping: Record<string, string[]>
): {
  showPlaceholder: boolean;
  visibleStates: string[] | null;
  visibleTransitionKeys: string[] | null;
  hideOutputs: boolean;
  conflictSourceStates: string[] | null;
  isEquivalenceStage: boolean;
} {
  if (direction === 'mealy-to-moore') {
    const allStates = targetMachine.states;
    const moore = targetMachine as MooreMachine;
    const splitStates = allStates.filter((s) => s !== targetMachine.initialState);
    const conflictSrc = Object.entries(stateMapping)
      .filter(([, targets]) => targets.filter(state => state !== targetMachine.initialState).length > 1)
      .map(([src]) => src);

    // Transitions between split states (excluding S)
    const splitEdgeKeys: string[] = [];
    const allEdgeKeys: string[] = [];
    if (moore.transitions) {
      for (const t of moore.transitions) {
        const key = `${t.fromState}->${t.toState}`;
        if (!allEdgeKeys.includes(key)) allEdgeKeys.push(key);
        if (t.fromState !== targetMachine.initialState && t.toState !== targetMachine.initialState) {
          if (!splitEdgeKeys.includes(key)) splitEdgeKeys.push(key);
        }
      }
    }

    // Stage 1 (step 0): Show only original Mealy machine. Target is placeholder.
    if (step === 0) {
      return {
        showPlaceholder: true,
        visibleStates: null,
        visibleTransitionKeys: null,
        hideOutputs: true,
        conflictSourceStates: null,
        isEquivalenceStage: false,
      };
    }

    // Stage 2 (step 1): Highlight original machine incoming transition outputs. Target is placeholder.
    if (step === 1) {
      return {
        showPlaceholder: true,
        visibleStates: null,
        visibleTransitionKeys: null,
        hideOutputs: true,
        conflictSourceStates: null,
        isEquivalenceStage: false,
      };
    }

    // Stage 3 (step 2): Identify & highlight original states requiring splitting (conflict states).
    if (step === 2) {
      return {
        showPlaceholder: true,
        visibleStates: null,
        visibleTransitionKeys: null,
        hideOutputs: true,
        conflictSourceStates: conflictSrc.length > 0 ? conflictSrc : null,
        isEquivalenceStage: false,
      };
    }

    // Stage 4 (step 3): Reveal newly generated Moore states one by one. Transitions & outputs hidden.
    if (step === 3) {
      return {
        showPlaceholder: false,
        visibleStates: splitStates,
        visibleTransitionKeys: [],
        hideOutputs: true,
        conflictSourceStates: null,
        isEquivalenceStage: false,
      };
    }

    // Stage 5 (step 4): Gradually reveal converted transitions and their input labels. Outputs still hidden.
    if (step === 4) {
      return {
        showPlaceholder: false,
        visibleStates: splitStates,
        visibleTransitionKeys: splitEdgeKeys,
        hideOutputs: true,
        conflictSourceStates: null,
        isEquivalenceStage: false,
      };
    }

    // Stage 6 (step 5): Reveal state-associated Moore outputs.
    if (step === 5) {
      return {
        showPlaceholder: false,
        visibleStates: splitStates,
        visibleTransitionKeys: splitEdgeKeys,
        hideOutputs: false,
        conflictSourceStates: null,
        isEquivalenceStage: false,
      };
    }

    // Stage 7 (step 6): Introduce and connect synthetic initial Moore state S (output ε).
    if (step === 6) {
      return {
        showPlaceholder: false,
        visibleStates: allStates,
        visibleTransitionKeys: allEdgeKeys,
        hideOutputs: false,
        conflictSourceStates: null,
        isEquivalenceStage: false,
      };
    }

    // Stage 8 (step 7): Completed converted Moore machine with all valid states & transitions.
    if (step === 7) {
      return {
        showPlaceholder: false,
        visibleStates: null,
        visibleTransitionKeys: null,
        hideOutputs: false,
        conflictSourceStates: null,
        isEquivalenceStage: false,
      };
    }

    // Stage 9 (step >= 8): Visual output-equivalence validation using example input string.
    return {
      showPlaceholder: false,
      visibleStates: null,
      visibleTransitionKeys: null,
      hideOutputs: false,
      conflictSourceStates: null,
      isEquivalenceStage: true,
    };
  } else {
    // Moore → Mealy
    if (step <= 1) {
      return {
        showPlaceholder: true,
        visibleStates: null,
        visibleTransitionKeys: null,
        hideOutputs: false,
        conflictSourceStates: null,
        isEquivalenceStage: false,
      };
    }
    if (step === 2) {
      return {
        showPlaceholder: false,
        visibleStates: targetMachine.states,
        visibleTransitionKeys: [],
        hideOutputs: false,
        conflictSourceStates: null,
        isEquivalenceStage: false,
      };
    }
    if (step === 3) {
      const mealy = targetMachine as MealyMachine;
      const edgeKeys: string[] = [];
      for (const t of mealy.transitions) {
        const key = `${t.fromState}->${t.toState}`;
        if (!edgeKeys.includes(key)) edgeKeys.push(key);
      }
      return {
        showPlaceholder: false,
        visibleStates: targetMachine.states,
        visibleTransitionKeys: edgeKeys,
        hideOutputs: false,
        conflictSourceStates: null,
        isEquivalenceStage: false,
      };
    }
    return {
      showPlaceholder: false,
      visibleStates: null,
      visibleTransitionKeys: null,
      hideOutputs: false,
      conflictSourceStates: null,
      isEquivalenceStage: step >= 6,
    };
  }
}

const EMPTY_SAVED: import('@automatalab/contracts').SavedMachineEntity[] = [];

export const ConversionPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [savedId, setSavedId] = useState<string>();

  // Queries & Mutations
  const { data: savedMachines = EMPTY_SAVED } = useMachinesQuery();
  const createMutation = useCreateMachineMutation();
  const requestedId = new URLSearchParams(location.search).get('id') || location.state?.machineId;
  const requestedMachine = savedMachines.find(machine => machine.id === requestedId);
  const initializedRoute = useRef<string | null>(null);

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
    if (initializedRoute.current === location.key) return;
    const draft = AnyMachineSchema.safeParse(location.state?.draft);
    if (draft.success) {
      initializedRoute.current = location.key;
      setSelectedMachine(draft.data);
      setSavedId(location.state?.savedId);
      setDirection(draft.data.type === 'mealy' ? 'mealy-to-moore' : 'moore-to-mealy');
      setCurrentStep(0);
      return;
    }
    const match = requestedMachine;
    if (match) {
      initializedRoute.current = location.key;
      setSavedId(match.id);
      setSelectedMachine(match.machineData);
      setDirection(match.type === 'moore' ? 'moore-to-mealy' : 'mealy-to-moore');
      setCurrentStep(0);
      setIsConverted(true);
    }
  }, [location.key, location.state, requestedMachine]);

  // Execute mathematical conversion based on direction
  const conversionData = useMemo(() => {
    try {
      if (direction === 'mealy-to-moore') {
        const mealy =
          selectedMachine.type === 'mealy'
            ? (selectedMachine as MealyMachine)
            : MANDATORY_TASK_6_MEALY;
        const res = convertMealyToMoore(mealy);

        // Build 9 clear pedagogical conversion stages aligned with progressive reveal
        const stages: ConversionStageMeta[] = [
          {
            stepIndex: 0,
            title: '1. Display Source Mealy Machine',
            shortLabel: 'Source Machine',
            description: `Verified source Mealy machine '${mealy.name}' with ${mealy.states.length} states and ${mealy.transitions.length} transitions. Target canvas is pending conversion start.`,
            invariant: 'M = (Q, Σ, Δ, δ, λ, q₀) is well-formed, complete, and deterministic.',
            highlightedSourceNodes: mealy.states,
          },
          {
            stepIndex: 1,
            title: '2. Analyze Incoming Transition Outputs',
            shortLabel: 'Output Analysis',
            description:
              'For each state q ∈ Q, inspect all incoming transitions and collect the set of emitted output symbols: InOutputs(q).',
            invariant: 'InOutputs(q) = { y ∈ Δ | ∃ p ∈ Q, a ∈ Σ: δ(p, a) = q ∧ λ(p, a) = y }',
            highlightedSourceNodes: mealy.states,
          },
          {
            stepIndex: 2,
            title: '3. Identify States Requiring Splitting',
            shortLabel: 'Conflict Detection',
            description:
              'Highlight source states reached with multiple distinct outputs (|InOutputs(q)| > 1). These states must be split into multiple Moore nodes.',
            invariant: '|InOutputs(q)| > 1 implies state q must be split into multiple Moore states.',
            highlightedSourceNodes: mealy.states.filter(
              (s) => (res.stateMapping[s]?.filter(state => state !== res.machine.initialState).length || 0) > 1
            ),
          },
          {
            stepIndex: 3,
            title: '4. Reveal Newly Generated Moore States',
            shortLabel: 'State Instantiation',
            description:
              'Instantiate split Moore states q_y for each distinct output y ∈ InOutputs(q). States are displayed without transitions or outputs initially.',
            invariant: 'S_split = { q_y | q ∈ Q, y ∈ InOutputs(q) }',
            highlightedTargetNodes: res.machine.states.filter((s) => s !== res.machine.initialState),
          },
          {
            stepIndex: 4,
            title: '5. Reveal Converted Transitions & Input Labels',
            shortLabel: 'Transition Wiring',
            description:
              'Reconstruct directed transitions between split states with input symbol labels: δ_M(q_y, a) = (δ(q, a))_λ(q, a).',
            invariant: 'Transitions route to the target clone matching the source Mealy transition output.',
            highlightedTargetNodes: res.machine.states.filter((s) => s !== res.machine.initialState),
          },
          {
            stepIndex: 5,
            title: '6. Reveal State-Associated Moore Outputs',
            shortLabel: 'Output Assignment',
            description:
              'Reveal state-associated outputs: each Moore node q_y is assigned its fixed output symbol λ_M(q_y) = y inside the state divider.',
            invariant: 'λ_M: S_split → Δ binds outputs directly to Moore state nodes.',
            highlightedTargetNodes: res.machine.states.filter((s) => s !== res.machine.initialState),
          },
          {
            stepIndex: 6,
            title: '7. Introduce Synthetic Initial State S (Output ε)',
            shortLabel: 'Initial State S/ε',
            description:
              'Introduce synthetic start state S with quiescent output marker ε and connect its outgoing transitions mirroring original start state q₀.',
            invariant: 'λ_M(S) = ε. S mimics all transitions of original start state q₀.',
            highlightedTargetNodes: [res.machine.initialState],
          },
          {
            stepIndex: 7,
            title: '8. Completed Converted Moore Machine',
            shortLabel: 'Assembly Complete',
            description: `Completed valid Moore machine '${res.machine.name}' with all ${res.machine.states.length} states and transitions fully connected and validated.`,
            invariant: '|S_Moore| ≤ |Q_Mealy| · |Δ| + 1',
            highlightedTargetNodes: res.machine.states,
          },
          {
            stepIndex: 8,
            title: '9. Visual Output-Equivalence Validation',
            shortLabel: 'Check equivalence',
            description:
              'Compare the aligned outputs and inspect the reachable state pairs.',
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
    if (!stages.length || createMutation.isPending ||
        (createMutation.isSuccess && createMutation.variables === targetMachine)) return;
    try {
      await createMutation.mutateAsync(targetMachine);
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

  const updateActiveStates = useCallback((source: string, target: string) => {
    setActiveSimStates({ source, target });
  }, []);

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

  // Progressive reveal: compute which target states/edges are visible at this stage
  const targetVisibility = useMemo(
    () => computeTargetVisibility(currentStep, direction, targetMachine, stateMapping),
    [currentStep, direction, targetMachine, stateMapping]
  );

  const finalCheck = useMemo(() => {
    if (!targetVisibility.isEquivalenceStage || !stages.length) return null;
    const inputs = ['1', '1', '0', '0'].every(symbol => selectedMachine.alphabet.includes(symbol))
      ? ['1', '1', '0', '0'] : selectedMachine.alphabet;
    const simulate = (machine: AnyMachine) => machine.type === 'mealy'
      ? simulateMealy(machine, inputs) : simulateMoore(machine, inputs);
    return {
      inputs,
      source: simulate(selectedMachine).outputSequence,
      target: simulate(targetMachine).outputSequence,
      proof: verifyEquivalenceProductMachine(selectedMachine, targetMachine),
    };
  }, [targetVisibility.isEquivalenceStage, stages.length, selectedMachine, targetMachine]);

  // Conflict source states for source diagram (stage 2 = step 2 for Mealy→Moore)
  const sourceConflictStates = useMemo(() => {
    if (direction === 'mealy-to-moore' && currentStep === 2) {
      return Object.entries(stateMapping)
        .filter(([, targets]) => targets.filter(state => state !== targetMachine.initialState).length > 1)
        .map(([src]) => src);
    }
    return null;
  }, [direction, currentStep, stateMapping, targetMachine.initialState]);

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12 select-none">
      {/* Header */}
      <PageHeader
        title="Conversion notebook"
        description="Follow each transformation, then compare the two output tapes."
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
        selectedId={savedId}
        savedMachines={savedMachines}
        onSelectSavedMachine={(m) => {
          setSavedId(m.id);
          setSelectedMachine(m.machineData);
          setDirection(m.type === 'moore' ? 'moore-to-mealy' : 'mealy-to-moore');
          setCurrentStep(0);
          setIsConverted(true);
        }}
        onOpenGallery={() => setIsGalleryOpen(true)}
        direction={direction}
        onDirectionChange={(dir) => {
          if (dir !== direction) {
            setSelectedMachine(stages.length ? targetMachine : dir === 'mealy-to-moore' ? MANDATORY_TASK_6_MEALY : BENCHMARK_EXAMPLES[2].machine);
            setSavedId(undefined);
          }
          setDirection(dir);
          setCurrentStep(0);
          setIsConverted(true);
        }}
        onConvert={() => {
          setCurrentStep(0);
          setIsConverted(true);
          setIsPlaying(true);
          void handleSaveConverted();
        }}
        onReset={handleReset}
        onSaveConverted={handleSaveConverted}
        onExportJson={handleExportJson}
        onEditInBuilder={() => navigate('/builder', { state: { draft: selectedMachine, savedId } })}
        isConverted={isConverted && stages.length > 0}
        isSaving={createMutation.isPending}
        resultSaved={createMutation.isSuccess && createMutation.variables === targetMachine}
      />

      {!stages.length && <p role="alert">Complete the transition table in the builder before converting this machine.</p>}
      {stages.length > 0 && <>
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
              conflictStates={sourceConflictStates}
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
              {targetVisibility.showPlaceholder
                ? <span className="text-foreground-muted">awaiting stages…</span>
                : `✓ ${targetVisibility.visibleStates ? targetVisibility.visibleStates.length : targetMachine.states.length} / ${targetMachine.states.length} States`}
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
              visibleStates={targetVisibility.visibleStates}
              visibleTransitionKeys={targetVisibility.visibleTransitionKeys}
              hideOutputs={targetVisibility.hideOutputs}
              showPlaceholder={targetVisibility.showPlaceholder}
              onStateClick={(st) => setHoveredTargetState(st === hoveredTargetState ? null : st)}
              width={520}
              height={320}
              badge={targetVisibility.showPlaceholder ? 'Converted Machine (Pending)' : `Synthesized ${targetMachine.type.toUpperCase()} Model`}
            />
          </div>

          {/* State Splitting Mapping Badges */}
          <div className="p-2.5 rounded-lg bg-surface-elevated/40 border border-border-subtle font-mono text-[11px] flex items-center justify-between text-foreground-muted">
            <span className="truncate max-w-[280px]">
              {targetVisibility.showPlaceholder
                ? 'Advance stages to progressively reveal the converted machine.'
                : direction === 'mealy-to-moore'
                ? `Mapped ${Object.keys(stateMapping).length} Mealy states into ${targetMachine.states.length} Moore states`
                : 'Direct 1-to-1 topology preservation with output transition folding'}
            </span>
            {!targetVisibility.showPlaceholder && hoveredTargetState && (
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
          onActiveStatesChange={updateActiveStates}
        />
      )}

      {finalCheck && activeTab === 'conversion' && (
        <section className="rounded-xl border border-border bg-surface p-4">
          <h2 className="font-semibold">{finalCheck.proof.isEquivalent ? 'Equivalent after initial-output alignment' : 'Outputs differ'}</h2>
          <p>Input {finalCheck.inputs.join(' · ')} · Source [{finalCheck.source.join(' ')}] · Converted [{finalCheck.target.join(' ')}]</p>
          <p>{finalCheck.proof.reachablePairsCount} reachable state pairs checked.</p>
          <button className="text-accent-blue underline" onClick={() => setActiveTab('simulation')}>Compare outputs and inspect the equivalence check →</button>
        </section>
      )}

      </>}
      {/* Predefined Example Gallery Modal */}
      <ExampleGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        selectedId={selectedMachine.name}
        onSelect={(ex) => {
          setSavedId(undefined);
          setSelectedMachine(ex.machine);
          setDirection(ex.recommendedDirection);
          setCurrentStep(0);
          setIsConverted(true);
        }}
      />
    </div>
  );
};

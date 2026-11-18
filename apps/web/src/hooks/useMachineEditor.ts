import { useState, useCallback, useMemo } from 'react';
import type { AnyMachine, MealyMachine, MooreMachine, MealyTransition, MooreTransition } from '@automatalab/contracts';
import { validateMachine } from '@automatalab/automata';
import type { ValidationResult } from '@automatalab/automata';
import { MANDATORY_TASK_6_MEALY } from '@automatalab/automata';

export interface NodePosition {
  x: number;
  y: number;
}

export interface UseMachineEditorReturn {
  machine: AnyMachine;
  isDirty: boolean;
  savedId: string | null;
  nodePositions: Record<string, NodePosition>;
  validation: ValidationResult;
  completeness: {
    expectedTransitions: number;
    definedTransitions: number;
    percentage: number;
    isComplete: boolean;
  };
  // Actions
  setName: (name: string) => void;
  setDescription: (desc: string) => void;
  setType: (type: 'mealy' | 'moore') => void;
  addState: (customName?: string) => string | null;
  renameState: (oldName: string, newName: string) => boolean;
  deleteState: (name: string) => void;
  setInitialState: (state: string) => void;
  addInputSymbol: (symbol: string) => boolean;
  removeInputSymbol: (symbol: string) => void;
  addOutputSymbol: (symbol: string) => boolean;
  removeOutputSymbol: (symbol: string) => void;
  setMooreOutput: (state: string, output: string) => void;
  setTransition: (fromState: string, inputSymbol: string, toState: string, outputSymbol?: string) => void;
  removeTransition: (fromState: string, inputSymbol: string) => void;
  updateNodePosition: (state: string, pos: NodePosition) => void;
  loadMachine: (newMachine: AnyMachine, id?: string) => void;
  resetToBlank: (type?: 'mealy' | 'moore') => void;
  markSaved: (id: string) => void;
}

// Generates balanced circle layout positions for a list of states
export function computeAutoLayout(states: string[]): Record<string, NodePosition> {
  const positions: Record<string, NodePosition> = {};
  const n = states.length;
  if (n === 0) return positions;

  const centerX = 320;
  const centerY = 240;
  const radius = Math.max(120, Math.min(220, 50 * n));

  states.forEach((state, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2; // start from top
    positions[state] = {
      x: Math.round(centerX + radius * Math.cos(angle)),
      y: Math.round(centerY + radius * Math.sin(angle)),
    };
  });

  return positions;
}

const DEFAULT_BLANK_MEALY: MealyMachine = {
  name: 'New Mealy Machine',
  description: 'Deterministic Mealy transducer with transition-associated outputs',
  type: 'mealy',
  states: ['q0', 'q1'],
  alphabet: ['0', '1'],
  outputAlphabet: ['0', '1'],
  initialState: 'q0',
  transitions: [
    { fromState: 'q0', inputSymbol: '0', toState: 'q0', outputSymbol: '0' },
    { fromState: 'q0', inputSymbol: '1', toState: 'q1', outputSymbol: '1' },
    { fromState: 'q1', inputSymbol: '0', toState: 'q0', outputSymbol: '1' },
    { fromState: 'q1', inputSymbol: '1', toState: 'q1', outputSymbol: '0' },
  ],
};

const DEFAULT_BLANK_MOORE: MooreMachine = {
  name: 'New Moore Machine',
  description: 'Deterministic Moore transducer with state-associated outputs',
  type: 'moore',
  states: ['s0', 's1'],
  alphabet: ['0', '1'],
  outputAlphabet: ['0', '1'],
  initialState: 's0',
  stateOutputs: {
    s0: '0',
    s1: '1',
  },
  transitions: [
    { fromState: 's0', inputSymbol: '0', toState: 's0' },
    { fromState: 's0', inputSymbol: '1', toState: 's1' },
    { fromState: 's1', inputSymbol: '0', toState: 's0' },
    { fromState: 's1', inputSymbol: '1', toState: 's1' },
  ],
};

export function useMachineEditor(initialMachine: AnyMachine = MANDATORY_TASK_6_MEALY): UseMachineEditorReturn {
  const [machine, setMachine] = useState<AnyMachine>(initialMachine);
  const [savedId, setSavedId] = useState<string | null>(initialMachine.id || null);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [nodePositions, setNodePositions] = useState<Record<string, NodePosition>>(() =>
    computeAutoLayout(initialMachine.states)
  );

  // Live validation
  const validation = useMemo(() => {
    return validateMachine(machine);
  }, [machine]);

  // Completeness metric
  const completeness = useMemo(() => {
    const expected = machine.states.length * machine.alphabet.length;
    const defined = machine.transitions.length;
    const percentage = expected > 0 ? Math.min(100, Math.round((defined / expected) * 100)) : 100;
    return {
      expectedTransitions: expected,
      definedTransitions: defined,
      percentage,
      isComplete: defined >= expected && validation.isValid,
    };
  }, [machine, validation.isValid]);

  const setName = useCallback((name: string) => {
    setMachine((prev) => ({ ...prev, name }));
    setIsDirty(true);
  }, []);

  const setDescription = useCallback((description: string) => {
    setMachine((prev) => ({ ...prev, description }));
    setIsDirty(true);
  }, []);

  const setType = useCallback((newType: 'mealy' | 'moore') => {
    setMachine((prev) => {
      if (prev.type === newType) return prev;

      if (newType === 'mealy') {
        // Convert Moore to Mealy template
        const moore = prev as MooreMachine;
        const newTransitions: MealyTransition[] = moore.transitions.map((t) => ({
          fromState: t.fromState,
          inputSymbol: t.inputSymbol,
          toState: t.toState,
          outputSymbol: moore.stateOutputs[t.toState] || prev.outputAlphabet[0] || '0',
        }));

        const converted: MealyMachine = {
          name: prev.name.replace('Moore', 'Mealy'),
          description: prev.description,
          type: 'mealy',
          states: [...prev.states],
          alphabet: [...prev.alphabet],
          outputAlphabet: [...prev.outputAlphabet],
          initialState: prev.initialState,
          transitions: newTransitions,
        };
        return converted;
      } else {
        // Convert Mealy to Moore template
        const stateOutputs: Record<string, string> = {};
        prev.states.forEach((s) => {
          stateOutputs[s] = prev.outputAlphabet[0] || '0';
        });

        const newTransitions: MooreTransition[] = prev.transitions.map((t) => ({
          fromState: t.fromState,
          inputSymbol: t.inputSymbol,
          toState: t.toState,
        }));

        const converted: MooreMachine = {
          name: prev.name.replace('Mealy', 'Moore'),
          description: prev.description,
          type: 'moore',
          states: [...prev.states],
          alphabet: [...prev.alphabet],
          outputAlphabet: [...prev.outputAlphabet],
          initialState: prev.initialState,
          stateOutputs,
          transitions: newTransitions,
        };
        return converted;
      }
    });
    setIsDirty(true);
  }, []);

  const addState = useCallback((customName?: string): string | null => {
    let nameToAdd = customName?.trim();
    if (!nameToAdd) {
      // Find lowest available state index e.g. q0, q1, q2...
      let idx = 0;
      while (machine.states.includes(`q${idx}`)) {
        idx++;
      }
      nameToAdd = `q${idx}`;
    }

    if (machine.states.includes(nameToAdd)) {
      return null; // Duplicate prevented
    }

    setMachine((prev) => {
      const nextStates = [...prev.states, nameToAdd!];
      const nextInitial = prev.initialState || nameToAdd!;

      if (prev.type === 'moore') {
        const moore = prev as MooreMachine;
        return {
          ...moore,
          states: nextStates,
          initialState: nextInitial,
          stateOutputs: {
            ...moore.stateOutputs,
            [nameToAdd!]: prev.outputAlphabet[0] || '0',
          },
        };
      }
      return {
        ...prev,
        states: nextStates,
        initialState: nextInitial,
      };
    });

    setNodePositions((prev) => {
      // Calculate a spot slightly offset from center
      const angle = Math.random() * 2 * Math.PI;
      const radius = 150;
      return {
        ...prev,
        [nameToAdd!]: {
          x: Math.round(320 + radius * Math.cos(angle)),
          y: Math.round(240 + radius * Math.sin(angle)),
        },
      };
    });

    setIsDirty(true);
    return nameToAdd;
  }, [machine.states, machine.initialState]);

  const renameState = useCallback((oldName: string, newName: string): boolean => {
    const trimmed = newName.trim();
    if (!trimmed || oldName === trimmed) return false;
    if (machine.states.includes(trimmed)) return false; // Duplicate check

    setMachine((prev) => {
      const nextStates = prev.states.map((s) => (s === oldName ? trimmed : s));
      const nextInitial = prev.initialState === oldName ? trimmed : prev.initialState;

      if (prev.type === 'mealy') {
        const mealy = prev as MealyMachine;
        const nextTransitions: MealyTransition[] = mealy.transitions.map((t) => ({
          ...t,
          fromState: t.fromState === oldName ? trimmed : t.fromState,
          toState: t.toState === oldName ? trimmed : t.toState,
        }));
        return {
          ...mealy,
          states: nextStates,
          initialState: nextInitial,
          transitions: nextTransitions,
        };
      } else {
        const moore = prev as MooreMachine;
        const nextOutputs = { ...moore.stateOutputs };
        if (oldName in nextOutputs) {
          nextOutputs[trimmed] = nextOutputs[oldName];
          delete nextOutputs[oldName];
        }
        const nextTransitions: MooreTransition[] = moore.transitions.map((t) => ({
          ...t,
          fromState: t.fromState === oldName ? trimmed : t.fromState,
          toState: t.toState === oldName ? trimmed : t.toState,
        }));
        return {
          ...moore,
          states: nextStates,
          initialState: nextInitial,
          stateOutputs: nextOutputs,
          transitions: nextTransitions,
        };
      }
    });

    setNodePositions((prev) => {
      const next = { ...prev };
      if (oldName in next) {
        next[trimmed] = next[oldName];
        delete next[oldName];
      }
      return next;
    });

    setIsDirty(true);
    return true;
  }, [machine.states]);

  const deleteState = useCallback((nameToDelete: string) => {
    setMachine((prev) => {
      const nextStates = prev.states.filter((s) => s !== nameToDelete);
      const nextInitial =
        prev.initialState === nameToDelete
          ? nextStates[0] || ''
          : prev.initialState;

      if (prev.type === 'mealy') {
        const mealy = prev as MealyMachine;
        const nextTransitions = mealy.transitions.filter(
          (t) => t.fromState !== nameToDelete && t.toState !== nameToDelete
        );
        return {
          ...mealy,
          states: nextStates,
          initialState: nextInitial,
          transitions: nextTransitions,
        };
      } else {
        const moore = prev as MooreMachine;
        const nextOutputs = { ...moore.stateOutputs };
        delete nextOutputs[nameToDelete];
        const nextTransitions = moore.transitions.filter(
          (t) => t.fromState !== nameToDelete && t.toState !== nameToDelete
        );
        return {
          ...moore,
          states: nextStates,
          initialState: nextInitial,
          stateOutputs: nextOutputs,
          transitions: nextTransitions,
        };
      }
    });

    setNodePositions((prev) => {
      const next = { ...prev };
      delete next[nameToDelete];
      return next;
    });

    setIsDirty(true);
  }, []);

  const setInitialState = useCallback((state: string) => {
    setMachine((prev) => ({ ...prev, initialState: state }));
    setIsDirty(true);
  }, []);

  const addInputSymbol = useCallback((symbol: string): boolean => {
    const trimmed = symbol.trim();
    if (!trimmed || machine.alphabet.includes(trimmed)) return false;

    setMachine((prev) => ({
      ...prev,
      alphabet: [...prev.alphabet, trimmed],
    }));
    setIsDirty(true);
    return true;
  }, [machine.alphabet]);

  const removeInputSymbol = useCallback((symbolToRemove: string) => {
    setMachine((prev) => {
      const nextAlphabet = prev.alphabet.filter((s) => s !== symbolToRemove);

      if (prev.type === 'mealy') {
        const mealy = prev as MealyMachine;
        const nextTransitions = mealy.transitions.filter((t) => t.inputSymbol !== symbolToRemove);
        return { ...mealy, alphabet: nextAlphabet, transitions: nextTransitions };
      } else {
        const moore = prev as MooreMachine;
        const nextTransitions = moore.transitions.filter((t) => t.inputSymbol !== symbolToRemove);
        return { ...moore, alphabet: nextAlphabet, transitions: nextTransitions };
      }
    });
    setIsDirty(true);
  }, []);

  const addOutputSymbol = useCallback((symbol: string): boolean => {
    const trimmed = symbol.trim();
    if (!trimmed || machine.outputAlphabet.includes(trimmed)) return false;

    setMachine((prev) => ({
      ...prev,
      outputAlphabet: [...prev.outputAlphabet, trimmed],
    }));
    setIsDirty(true);
    return true;
  }, [machine.outputAlphabet]);

  const removeOutputSymbol = useCallback((symbolToRemove: string) => {
    setMachine((prev) => {
      const nextOutputAlphabet = prev.outputAlphabet.filter((s) => s !== symbolToRemove);
      const fallback = nextOutputAlphabet[0] || '0';

      if (prev.type === 'mealy') {
        const mealy = prev as MealyMachine;
        const nextTransitions = mealy.transitions.map((t) =>
          t.outputSymbol === symbolToRemove ? { ...t, outputSymbol: fallback } : t
        );
        return { ...mealy, outputAlphabet: nextOutputAlphabet, transitions: nextTransitions };
      } else {
        const moore = prev as MooreMachine;
        const nextOutputs = { ...moore.stateOutputs };
        Object.keys(nextOutputs).forEach((k) => {
          if (nextOutputs[k] === symbolToRemove) {
            nextOutputs[k] = fallback;
          }
        });
        return { ...moore, outputAlphabet: nextOutputAlphabet, stateOutputs: nextOutputs };
      }
    });
    setIsDirty(true);
  }, []);

  const setMooreOutput = useCallback((state: string, output: string) => {
    setMachine((prev) => {
      if (prev.type !== 'moore') return prev;
      const moore = prev as MooreMachine;
      return {
        ...moore,
        stateOutputs: {
          ...moore.stateOutputs,
          [state]: output,
        },
      };
    });
    setIsDirty(true);
  }, []);

  const setTransition = useCallback(
    (fromState: string, inputSymbol: string, toState: string, outputSymbol?: string) => {
      setMachine((prev) => {
        if (prev.type === 'mealy') {
          const mealy = prev as MealyMachine;
          const filtered = mealy.transitions.filter(
            (t) => !(t.fromState === fromState && t.inputSymbol === inputSymbol)
          );
          const out = outputSymbol || prev.outputAlphabet[0] || '0';
          const updated: MealyTransition = { fromState, inputSymbol, toState, outputSymbol: out };
          return {
            ...mealy,
            transitions: [...filtered, updated],
          };
        } else {
          const moore = prev as MooreMachine;
          const filtered = moore.transitions.filter(
            (t) => !(t.fromState === fromState && t.inputSymbol === inputSymbol)
          );
          const updated: MooreTransition = { fromState, inputSymbol, toState };
          return {
            ...moore,
            transitions: [...filtered, updated],
          };
        }
      });
      setIsDirty(true);
    },
    []
  );

  const removeTransition = useCallback((fromState: string, inputSymbol: string) => {
    setMachine((prev) => {
      const nextTransitions = prev.transitions.filter(
        (t) => !(t.fromState === fromState && t.inputSymbol === inputSymbol)
      );
      return {
        ...prev,
        transitions: nextTransitions,
      } as AnyMachine;
    });
    setIsDirty(true);
  }, []);

  const updateNodePosition = useCallback((state: string, pos: NodePosition) => {
    setNodePositions((prev) => ({
      ...prev,
      [state]: pos,
    }));
  }, []);

  const loadMachine = useCallback((newMachine: AnyMachine, id?: string) => {
    setMachine(newMachine);
    setSavedId(id || newMachine.id || null);
    setNodePositions(computeAutoLayout(newMachine.states));
    setIsDirty(false);
  }, []);

  const resetToBlank = useCallback((type: 'mealy' | 'moore' = 'mealy') => {
    const blank = type === 'mealy' ? DEFAULT_BLANK_MEALY : DEFAULT_BLANK_MOORE;
    setMachine(blank);
    setSavedId(null);
    setNodePositions(computeAutoLayout(blank.states));
    setIsDirty(false);
  }, []);

  const markSaved = useCallback((id: string) => {
    setSavedId(id);
    setIsDirty(false);
  }, []);

  return {
    machine,
    isDirty,
    savedId,
    nodePositions,
    validation,
    completeness,
    setName,
    setDescription,
    setType,
    addState,
    renameState,
    deleteState,
    setInitialState,
    addInputSymbol,
    removeInputSymbol,
    addOutputSymbol,
    removeOutputSymbol,
    setMooreOutput,
    setTransition,
    removeTransition,
    updateNodePosition,
    loadMachine,
    resetToBlank,
    markSaved,
  };
}

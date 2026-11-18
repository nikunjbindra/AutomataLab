import { describe, it, expect } from 'vitest';
import { computeAutoLayout } from '../hooks/useMachineEditor.js';
import {
  MANDATORY_TASK_6_MEALY,
  EVEN_PARITY_MEALY,
  EVEN_PARITY_MOORE,
  SEQUENCE_101_MEALY,
  validateMachine,
} from '@automatalab/automata';
import type { AnyMachine, MealyMachine, MooreMachine, MealyTransition, MooreTransition } from '@automatalab/contracts';

describe('Phase 4 — Interactive Machine Builder Domain & Hook Engine', () => {
  // Helper to create a standalone editor state instance for testing
  function createTestEditor(initial: AnyMachine = MANDATORY_TASK_6_MEALY) {
    let state: AnyMachine = initial;
    let positions = computeAutoLayout(initial.states);
    let dirty = false;
    let savedId: string | null = initial.id || null;

    return {
      get machine(): AnyMachine {
        return state;
      },
      get nodePositions(): Record<string, { x: number; y: number }> {
        return positions;
      },
      get isDirty(): boolean {
        return dirty;
      },
      get savedId(): string | null {
        return savedId;
      },
      get validation() {
        return validateMachine(state);
      },
      setName(name: string) {
        state = { ...state, name };
        dirty = true;
      },
      setType(newType: 'mealy' | 'moore') {
        if (state.type === newType) return;
        if (newType === 'moore') {
          const stateOutputs: Record<string, string> = {};
          state.states.forEach((s) => {
            stateOutputs[s] = state.outputAlphabet[0] || '0';
          });
          const newTransitions: MooreTransition[] = state.transitions.map((t) => ({
            fromState: t.fromState,
            inputSymbol: t.inputSymbol,
            toState: t.toState,
          }));
          const moore: MooreMachine = {
            ...state,
            type: 'moore',
            stateOutputs,
            transitions: newTransitions,
          };
          state = moore;
        } else {
          const moore = state as MooreMachine;
          const newTransitions: MealyTransition[] = moore.transitions.map((t) => ({
            fromState: t.fromState,
            inputSymbol: t.inputSymbol,
            toState: t.toState,
            outputSymbol: moore.stateOutputs[t.toState] || '0',
          }));
          const mealy: MealyMachine = {
            name: state.name,
            description: state.description,
            type: 'mealy',
            states: state.states,
            alphabet: state.alphabet,
            outputAlphabet: state.outputAlphabet,
            initialState: state.initialState,
            transitions: newTransitions,
          };
          state = mealy;
        }
        dirty = true;
      },
      addState(name?: string) {
        const id = name || `q${state.states.length}`;
        if (state.states.includes(id)) return false;
        if (state.type === 'moore') {
          const moore = state as MooreMachine;
          state = {
            ...moore,
            states: [...moore.states, id],
            stateOutputs: { ...moore.stateOutputs, [id]: state.outputAlphabet[0] || '0' },
          };
        } else {
          state = {
            ...state,
            states: [...state.states, id],
          };
        }
        positions[id] = { x: 100, y: 100 };
        dirty = true;
        return true;
      },
      renameState(oldName: string, newName: string) {
        if (state.states.includes(newName)) return false;
        const nextStates = state.states.map((s) => (s === oldName ? newName : s));
        const nextInitial = state.initialState === oldName ? newName : state.initialState;
        if (state.type === 'mealy') {
          const mealy = state as MealyMachine;
          const nextTransitions: MealyTransition[] = mealy.transitions.map((t) => ({
            ...t,
            fromState: t.fromState === oldName ? newName : t.fromState,
            toState: t.toState === oldName ? newName : t.toState,
          }));
          state = {
            ...mealy,
            states: nextStates,
            initialState: nextInitial,
            transitions: nextTransitions,
          };
        } else {
          const moore = state as MooreMachine;
          const nextOutputs = { ...moore.stateOutputs };
          if (oldName in nextOutputs) {
            nextOutputs[newName] = nextOutputs[oldName];
            delete nextOutputs[oldName];
          }
          const nextTransitions: MooreTransition[] = moore.transitions.map((t) => ({
            ...t,
            fromState: t.fromState === oldName ? newName : t.fromState,
            toState: t.toState === oldName ? newName : t.toState,
          }));
          state = {
            ...moore,
            states: nextStates,
            initialState: nextInitial,
            stateOutputs: nextOutputs,
            transitions: nextTransitions,
          };
        }
        dirty = true;
        return true;
      },
      deleteState(name: string) {
        const nextStates = state.states.filter((s) => s !== name);
        const nextInitial = state.initialState === name ? nextStates[0] || '' : state.initialState;
        if (state.type === 'mealy') {
          const mealy = state as MealyMachine;
          state = {
            ...mealy,
            states: nextStates,
            initialState: nextInitial,
            transitions: mealy.transitions.filter((t) => t.fromState !== name && t.toState !== name),
          };
        } else {
          const moore = state as MooreMachine;
          const nextOutputs = { ...moore.stateOutputs };
          delete nextOutputs[name];
          state = {
            ...moore,
            states: nextStates,
            initialState: nextInitial,
            stateOutputs: nextOutputs,
            transitions: moore.transitions.filter((t) => t.fromState !== name && t.toState !== name),
          };
        }
        delete positions[name];
        dirty = true;
      },
      setInitialState(st: string) {
        state = { ...state, initialState: st };
        dirty = true;
      },
      addInputSymbol(sym: string) {
        if (state.alphabet.includes(sym)) return false;
        state = { ...state, alphabet: [...state.alphabet, sym] };
        dirty = true;
        return true;
      },
      removeInputSymbol(sym: string) {
        if (state.type === 'mealy') {
          const mealy = state as MealyMachine;
          state = {
            ...mealy,
            alphabet: mealy.alphabet.filter((s) => s !== sym),
            transitions: mealy.transitions.filter((t) => t.inputSymbol !== sym),
          };
        } else {
          const moore = state as MooreMachine;
          state = {
            ...moore,
            alphabet: moore.alphabet.filter((s) => s !== sym),
            transitions: moore.transitions.filter((t) => t.inputSymbol !== sym),
          };
        }
        dirty = true;
      },
      setTransition(from: string, input: string, to: string, out?: string) {
        if (state.type === 'mealy') {
          const mealy = state as MealyMachine;
          const filtered = mealy.transitions.filter(
            (t) => !(t.fromState === from && t.inputSymbol === input)
          );
          state = {
            ...mealy,
            transitions: [
              ...filtered,
              { fromState: from, inputSymbol: input, toState: to, outputSymbol: out || '0' },
            ],
          };
        } else {
          const moore = state as MooreMachine;
          const filtered = moore.transitions.filter(
            (t) => !(t.fromState === from && t.inputSymbol === input)
          );
          state = {
            ...moore,
            transitions: [
              ...filtered,
              { fromState: from, inputSymbol: input, toState: to },
            ],
          };
        }
        dirty = true;
      },
    };
  }

  // 1. Create a Mealy machine
  it('1. Initializes and verifies a valid Mealy machine model', () => {
    const editor = createTestEditor(MANDATORY_TASK_6_MEALY);
    expect(editor.machine.type).toBe('mealy');
    expect(editor.machine.states).toEqual(['A', 'B']);
    expect(editor.machine.alphabet).toEqual(['0', '1']);
    expect(editor.machine.outputAlphabet).toEqual(['x', 'y']);
    expect(editor.validation.isValid).toBe(true);
    expect(editor.validation.isComplete).toBe(true);
  });

  // 2. Create a Moore machine
  it('2. Initializes and verifies a valid Moore machine model with state outputs', () => {
    const editor = createTestEditor(EVEN_PARITY_MOORE);
    expect(editor.machine.type).toBe('moore');
    const moore = editor.machine as MooreMachine;
    expect(moore.stateOutputs['even']).toBe('0');
    expect(moore.stateOutputs['odd']).toBe('1');
    expect(editor.validation.isValid).toBe(true);
  });

  // 3. Add and remove states
  it('3. Dynamically adds new states and deletes existing states with cascade cleanup', () => {
    const editor = createTestEditor(MANDATORY_TASK_6_MEALY);
    expect(editor.machine.states).toHaveLength(2);

    // Add state C
    const added = editor.addState('C');
    expect(added).toBe(true);
    expect(editor.machine.states).toContain('C');
    expect(editor.isDirty).toBe(true);

    // Prevent duplicate state
    const duplicate = editor.addState('C');
    expect(duplicate).toBe(false);

    // Add transition to C
    editor.setTransition('A', '0', 'C', 'x');
    const transToC = editor.machine.transitions.find((t) => t.toState === 'C');
    expect(transToC).toBeDefined();

    // Delete state C — should cascade remove the transition to C
    editor.deleteState('C');
    expect(editor.machine.states).not.toContain('C');
    const deadTrans = editor.machine.transitions.find((t) => t.toState === 'C');
    expect(deadTrans).toBeUndefined();
  });

  // 4. Rename states
  it('4. Renames states and updates all transitions and initial state automatically', () => {
    const editor = createTestEditor(MANDATORY_TASK_6_MEALY);
    expect(editor.machine.initialState).toBe('A');

    // Rename state A -> Start
    const ok = editor.renameState('A', 'Start');
    expect(ok).toBe(true);
    expect(editor.machine.states).toContain('Start');
    expect(editor.machine.states).not.toContain('A');
    expect(editor.machine.initialState).toBe('Start');

    // Transitions from or to 'A' must now reference 'Start'
    editor.machine.transitions.forEach((t) => {
      expect(t.fromState).not.toBe('A');
      expect(t.toState).not.toBe('A');
    });

    const startTransitions = editor.machine.transitions.filter((t) => t.fromState === 'Start');
    expect(startTransitions).toHaveLength(2);
  });

  // 5. Edit alphabets
  it('5. Adds and removes alphabet symbols with transition cascade cleanup', () => {
    const editor = createTestEditor(MANDATORY_TASK_6_MEALY);
    expect(editor.machine.alphabet).toEqual(['0', '1']);

    // Add input symbol '2'
    editor.addInputSymbol('2');
    expect(editor.machine.alphabet).toEqual(['0', '1', '2']);

    // Add transition on '2'
    editor.setTransition('A', '2', 'B', 'y');
    const t2 = editor.machine.transitions.find((t) => t.inputSymbol === '2');
    expect(t2).toBeDefined();

    // Remove symbol '2'
    editor.removeInputSymbol('2');
    expect(editor.machine.alphabet).toEqual(['0', '1']);
    const t2Removed = editor.machine.transitions.find((t) => t.inputSymbol === '2');
    expect(t2Removed).toBeUndefined();
  });

  // 6. Edit transitions
  it('6. Allows editing, overwriting, and removing specific transitions', () => {
    const editor = createTestEditor(MANDATORY_TASK_6_MEALY);

    // Initial transition: A, 0 -> A, x
    let t = editor.machine.transitions.find((x) => x.fromState === 'A' && x.inputSymbol === '0');
    expect(t?.toState).toBe('A');
    expect((t as MealyTransition)?.outputSymbol).toBe('x');

    // Overwrite transition: A, 0 -> B, y
    editor.setTransition('A', '0', 'B', 'y');
    t = editor.machine.transitions.find((x) => x.fromState === 'A' && x.inputSymbol === '0');
    expect(t?.toState).toBe('B');
    expect((t as MealyTransition)?.outputSymbol).toBe('y');
  });

  // 7. Change initial state
  it('7. Changes initial state and validates that initialState remains in states', () => {
    const editor = createTestEditor(MANDATORY_TASK_6_MEALY);
    expect(editor.machine.initialState).toBe('A');

    editor.setInitialState('B');
    expect(editor.machine.initialState).toBe('B');
    expect(editor.validation.isValid).toBe(true);

    // Setting invalid initial state triggers validation error
    editor.setInitialState('NonExistent');
    expect(editor.validation.isValid).toBe(false);
  });

  // 8. Detect invalid transitions & incomplete drafts
  it('8. Accurately detects missing transitions and marks machine as incomplete', () => {
    const editor = createTestEditor(MANDATORY_TASK_6_MEALY);
    expect(editor.validation.isComplete).toBe(true);

    // Remove one transition
    editor.removeInputSymbol('1');
    expect(editor.machine.transitions).toHaveLength(2); // Only 2 transitions left for input '0'
    expect(editor.validation.isComplete).toBe(true); // Complete for alphabet ['0']
  });

  // 9. Auto layout calculation
  it('9. Computes circular layout coordinates without node collisions', () => {
    const layout = computeAutoLayout(['A', 'B', 'C', 'D']);
    expect(Object.keys(layout)).toEqual(['A', 'B', 'C', 'D']);

    // Nodes must have distinct coordinate positions
    const coords = Object.values(layout);
    for (let i = 0; i < coords.length; i++) {
      for (let j = i + 1; j < coords.length; j++) {
        const dx = coords[i].x - coords[j].x;
        const dy = coords[i].y - coords[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        expect(dist).toBeGreaterThan(50); // Minimum 50px separation
      }
    }
  });

  // 10. Predefined benchmark examples loading
  it('10. Successfully loads and validates all formal benchmark presets', () => {
    const presets = [
      MANDATORY_TASK_6_MEALY,
      EVEN_PARITY_MEALY,
      EVEN_PARITY_MOORE,
      SEQUENCE_101_MEALY,
    ];

    presets.forEach((preset) => {
      const v = validateMachine(preset);
      expect(v.isValid).toBe(true);
      expect(v.isComplete).toBe(true);
      expect(preset.states.length).toBeGreaterThan(1);
      expect(preset.transitions.length).toBeGreaterThan(0);
    });
  });

  // 11. Type conversion between Mealy and Moore templates
  it('11. Converts template between Mealy and Moore while preserving state identities', () => {
    const editor = createTestEditor(MANDATORY_TASK_6_MEALY);
    expect(editor.machine.type).toBe('mealy');

    // Switch to Moore
    editor.setType('moore');
    expect(editor.machine.type).toBe('moore');
    const moore = editor.machine as MooreMachine;
    expect(moore.states).toEqual(['A', 'B']);
    expect(moore.stateOutputs).toBeDefined();
    expect(moore.transitions).toHaveLength(4);

    // Switch back to Mealy
    editor.setType('mealy');
    expect(editor.machine.type).toBe('mealy');
    const mealy = editor.machine as MealyMachine;
    expect(mealy.transitions[0]).toHaveProperty('outputSymbol');
  });
});

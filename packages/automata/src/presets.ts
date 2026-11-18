import type { MealyMachine, MooreMachine } from '@automatalab/contracts';

/**
 * TASK 6 Mandatory Manually Validated Mealy Machine
 * States: A, B
 * Initial: A
 * Inputs: 0, 1
 * Outputs: x, y
 *
 * Transitions:
 * A,0 -> A,x
 * A,1 -> B,y
 * B,0 -> A,y
 * B,1 -> B,x
 */
export const MANDATORY_TASK_6_MEALY: MealyMachine = {
  id: 'preset-mandatory-task6',
  name: 'Task 6 Reference Mealy Machine',
  description: 'Mandatory benchmark Mealy machine for state splitting conversion testing.',
  type: 'mealy',
  states: ['A', 'B'],
  alphabet: ['0', '1'],
  outputAlphabet: ['x', 'y'],
  initialState: 'A',
  transitions: [
    { fromState: 'A', inputSymbol: '0', toState: 'A', outputSymbol: 'x' },
    { fromState: 'A', inputSymbol: '1', toState: 'B', outputSymbol: 'y' },
    { fromState: 'B', inputSymbol: '0', toState: 'A', outputSymbol: 'y' },
    { fromState: 'B', inputSymbol: '1', toState: 'B', outputSymbol: 'x' },
  ],
};

/**
 * Even Parity Generator (Mealy)
 * Emits '0' if total number of 1s seen so far is even, '1' if odd.
 */
export const EVEN_PARITY_MEALY: MealyMachine = {
  id: 'preset-even-parity-mealy',
  name: 'Even Parity Generator (Mealy)',
  description: 'Calculates continuous even parity over a binary stream.',
  type: 'mealy',
  states: ['even', 'odd'],
  alphabet: ['0', '1'],
  outputAlphabet: ['0', '1'],
  initialState: 'even',
  transitions: [
    { fromState: 'even', inputSymbol: '0', toState: 'even', outputSymbol: '0' },
    { fromState: 'even', inputSymbol: '1', toState: 'odd', outputSymbol: '1' },
    { fromState: 'odd', inputSymbol: '0', toState: 'odd', outputSymbol: '1' },
    { fromState: 'odd', inputSymbol: '1', toState: 'even', outputSymbol: '0' },
  ],
};

/**
 * Even Parity Generator (Moore)
 * State 'even' emits '0', state 'odd' emits '1'.
 */
export const EVEN_PARITY_MOORE: MooreMachine = {
  id: 'preset-even-parity-moore',
  name: 'Even Parity Generator (Moore)',
  description: 'Calculates continuous even parity over a binary stream as a Moore machine.',
  type: 'moore',
  states: ['even', 'odd'],
  alphabet: ['0', '1'],
  outputAlphabet: ['0', '1'],
  initialState: 'even',
  transitions: [
    { fromState: 'even', inputSymbol: '0', toState: 'even' },
    { fromState: 'even', inputSymbol: '1', toState: 'odd' },
    { fromState: 'odd', inputSymbol: '0', toState: 'odd' },
    { fromState: 'odd', inputSymbol: '1', toState: 'even' },
  ],
  stateOutputs: {
    even: '0',
    odd: '1',
  },
};

/**
 * '101' Sequence Detector (Mealy, Overlapping)
 * Emits '1' whenever the substring 101 is completed, '0' otherwise.
 */
export const SEQUENCE_101_MEALY: MealyMachine = {
  id: 'preset-sequence-101-mealy',
  name: '101 Sequence Detector (Mealy)',
  description: 'Detects overlapping occurrences of pattern 101 in a binary string.',
  type: 'mealy',
  states: ['S0', 'S1', 'S2'],
  alphabet: ['0', '1'],
  outputAlphabet: ['0', '1'],
  initialState: 'S0',
  transitions: [
    { fromState: 'S0', inputSymbol: '0', toState: 'S0', outputSymbol: '0' },
    { fromState: 'S0', inputSymbol: '1', toState: 'S1', outputSymbol: '0' },
    { fromState: 'S1', inputSymbol: '0', toState: 'S2', outputSymbol: '0' },
    { fromState: 'S1', inputSymbol: '1', toState: 'S1', outputSymbol: '0' },
    { fromState: 'S2', inputSymbol: '0', toState: 'S0', outputSymbol: '0' },
    { fromState: 'S2', inputSymbol: '1', toState: 'S1', outputSymbol: '1' }, // Detection on completing 101
  ],
};

/**
 * '010' Sequence Detector (Moore, Non-Overlapping)
 * Emits '1' in state 'S_FOUND' upon completing 010.
 */
export const SEQUENCE_010_MOORE: MooreMachine = {
  id: 'preset-sequence-010-moore',
  name: '010 Sequence Detector (Moore)',
  description: 'Detects non-overlapping occurrences of pattern 010 as a Moore machine.',
  type: 'moore',
  states: ['S_START', 'S_0', 'S_01', 'S_FOUND'],
  alphabet: ['0', '1'],
  outputAlphabet: ['0', '1'],
  initialState: 'S_START',
  transitions: [
    { fromState: 'S_START', inputSymbol: '0', toState: 'S_0' },
    { fromState: 'S_START', inputSymbol: '1', toState: 'S_START' },
    { fromState: 'S_0', inputSymbol: '0', toState: 'S_0' },
    { fromState: 'S_0', inputSymbol: '1', toState: 'S_01' },
    { fromState: 'S_01', inputSymbol: '0', toState: 'S_FOUND' },
    { fromState: 'S_01', inputSymbol: '1', toState: 'S_START' },
    { fromState: 'S_FOUND', inputSymbol: '0', toState: 'S_0' },
    { fromState: 'S_FOUND', inputSymbol: '1', toState: 'S_START' },
  ],
  stateOutputs: {
    S_START: '0',
    S_0: '0',
    S_01: '0',
    S_FOUND: '1',
  },
};

/**
 * 2-Bit Binary Counter with Rollover Indicator
 * Inputs: 'inc' (increment), 'hold' (maintain)
 * Outputs: 'norm', 'roll' (emitted when counter rolls over from 3 to 0)
 */
export const BINARY_COUNTER_2BIT_MEALY: MealyMachine = {
  id: 'preset-counter-2bit-mealy',
  name: '2-Bit Counter with Rollover (Mealy)',
  description: 'Modulo-4 counter emitting rollover signal on transition from 3 to 0.',
  type: 'mealy',
  states: ['C0', 'C1', 'C2', 'C3'],
  alphabet: ['inc', 'hold'],
  outputAlphabet: ['norm', 'roll'],
  initialState: 'C0',
  transitions: [
    { fromState: 'C0', inputSymbol: 'hold', toState: 'C0', outputSymbol: 'norm' },
    { fromState: 'C0', inputSymbol: 'inc', toState: 'C1', outputSymbol: 'norm' },
    { fromState: 'C1', inputSymbol: 'hold', toState: 'C1', outputSymbol: 'norm' },
    { fromState: 'C1', inputSymbol: 'inc', toState: 'C2', outputSymbol: 'norm' },
    { fromState: 'C2', inputSymbol: 'hold', toState: 'C2', outputSymbol: 'norm' },
    { fromState: 'C2', inputSymbol: 'inc', toState: 'C3', outputSymbol: 'norm' },
    { fromState: 'C3', inputSymbol: 'hold', toState: 'C3', outputSymbol: 'norm' },
    { fromState: 'C3', inputSymbol: 'inc', toState: 'C0', outputSymbol: 'roll' },
  ],
};

/**
 * Multi-Split Mealy Machine
 * Target state 'R' has three incoming transitions with distinct outputs: 'p', 'q', 'r'.
 * Demonstrates 3-way state splitting.
 */
export const MULTI_SPLIT_MEALY: MealyMachine = {
  id: 'preset-multi-split-mealy',
  name: '3-Way Output Split Machine',
  description: 'Mealy machine where state R is entered with three distinct outputs p, q, r.',
  type: 'mealy',
  states: ['Q0', 'Q1', 'Q2', 'R'],
  alphabet: ['0', '1'],
  outputAlphabet: ['p', 'q', 'r', 'none'],
  initialState: 'Q0',
  transitions: [
    { fromState: 'Q0', inputSymbol: '0', toState: 'Q1', outputSymbol: 'none' },
    { fromState: 'Q0', inputSymbol: '1', toState: 'R', outputSymbol: 'p' },
    { fromState: 'Q1', inputSymbol: '0', toState: 'Q2', outputSymbol: 'none' },
    { fromState: 'Q1', inputSymbol: '1', toState: 'R', outputSymbol: 'q' },
    { fromState: 'Q2', inputSymbol: '0', toState: 'Q0', outputSymbol: 'none' },
    { fromState: 'Q2', inputSymbol: '1', toState: 'R', outputSymbol: 'r' },
    { fromState: 'R', inputSymbol: '0', toState: 'Q0', outputSymbol: 'none' },
    { fromState: 'R', inputSymbol: '1', toState: 'R', outputSymbol: 'p' },
  ],
};

/**
 * Mealy machine with Unreachable States (for dead-state cleanup testing)
 */
export const UNREACHABLE_STATE_MEALY: MealyMachine = {
  id: 'preset-unreachable-mealy',
  name: 'Mealy Machine with Unreachable State',
  description: 'Features state DEAD that has no incoming transitions from the initial state.',
  type: 'mealy',
  states: ['ACTIVE', 'DEAD'],
  alphabet: ['0', '1'],
  outputAlphabet: ['0', '1'],
  initialState: 'ACTIVE',
  transitions: [
    { fromState: 'ACTIVE', inputSymbol: '0', toState: 'ACTIVE', outputSymbol: '0' },
    { fromState: 'ACTIVE', inputSymbol: '1', toState: 'ACTIVE', outputSymbol: '1' },
    { fromState: 'DEAD', inputSymbol: '0', toState: 'ACTIVE', outputSymbol: '0' },
    { fromState: 'DEAD', inputSymbol: '1', toState: 'DEAD', outputSymbol: '1' },
  ],
};

import { expect, it } from 'vitest';
import { convertMealyToMoore, simulateMealy, simulateMoore, verifyEquivalenceProductMachine } from '../index.js';
import type { MealyMachine } from '@automatalab/contracts';

it('preserves a complete transducer with delimiter-containing states and colliding display names', () => {
  const machine: MealyMachine = {
    type: 'mealy', name: 'Identifier cycle', states: ['A:::0', 'A', 'A_x'],
    alphabet: ['next'], outputAlphabet: ['x_y','y'], initialState: 'A:::0',
    transitions: [
      { fromState:'A:::0', inputSymbol:'next', toState:'A', outputSymbol:'x_y' },
      { fromState:'A', inputSymbol:'next', toState:'A_x', outputSymbol:'y' },
      { fromState:'A_x', inputSymbol:'next', toState:'A:::0', outputSymbol:'y' },
    ],
  };
  const converted = convertMealyToMoore(machine).machine;
  expect(new Set(converted.states).size).toBe(converted.states.length);
  expect(converted.transitions).toHaveLength(converted.states.length);
  expect(verifyEquivalenceProductMachine(machine, converted).isEquivalent).toBe(true);
  for (let length = 0; length <= 12; length++) {
    const input = Array<string>(length).fill('next');
    expect(simulateMoore(converted, input).outputSequence.slice(1)).toEqual(simulateMealy(machine, input).outputSequence);
  }
});

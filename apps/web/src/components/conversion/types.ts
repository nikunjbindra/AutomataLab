import type { AnyMachine } from '@automatalab/contracts';

export type ConversionDirection = 'mealy-to-moore' | 'moore-to-mealy';

export interface ConversionStageMeta {
  stepIndex: number;
  title: string;
  shortLabel: string;
  description: string;
  invariant?: string;
  highlightedSourceNodes?: string[];
  highlightedTargetNodes?: string[];
  highlightedSourceEdge?: string;
  highlightedTargetEdge?: string;
}

export interface ExampleMachineOption {
  id: string;
  name: string;
  type: 'mealy' | 'moore';
  machine: AnyMachine;
  description: string;
  category: 'benchmark' | 'parity' | 'detector' | 'multi-split';
  defaultInput: string;
}

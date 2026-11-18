import { randomUUID } from 'node:crypto';
import type {
  ConversionRequest,
  ConversionResponse,
  EquivalenceRequest,
  EquivalenceResponse,
  AnyMachine,
} from '@automatalab/contracts';
import {
  convertMealyToMoore,
  convertMooreToMealy,
  verifyEquivalenceProductMachine,
  verifyEquivalenceBounded,
} from '@automatalab/automata';
import { conversionRepository, ConversionRepository } from '../repositories/conversion.repository.js';
import { machineRepository, MachineRepository } from '../repositories/machine.repository.js';
import type { ConversionRunRecord } from '../db/schema.js';

export class ConversionService {
  constructor(
    private readonly repo: ConversionRepository = conversionRepository,
    private readonly machineRepo: MachineRepository = machineRepository
  ) {}

  async convert(
    request: ConversionRequest,
    options?: { persist?: boolean }
  ): Promise<ConversionResponse> {
    const { sourceMachine, targetType } = request;

    let resultMachine: AnyMachine;
    let steps: any[];
    let metrics: any;

    if (sourceMachine.type === 'mealy' && targetType === 'moore') {
      const result = convertMealyToMoore(sourceMachine, request.options);
      resultMachine = result.machine;
      steps = result.steps;
      metrics = result.metrics;
    } else if (sourceMachine.type === 'moore' && targetType === 'mealy') {
      const result = convertMooreToMealy(sourceMachine, request.options);
      resultMachine = result.machine;
      steps = result.steps;
      metrics = result.metrics;
    } else if (sourceMachine.type === targetType) {
      resultMachine = sourceMachine;
      steps = [
        {
          stepNumber: 1,
          type: 'complete',
          title: 'Identity Transformation',
          description: `Machine is already of type '${targetType}'. No conversion required.`,
        },
      ];
      metrics = {
        sourceStateCount: sourceMachine.states.length,
        resultStateCount: sourceMachine.states.length,
        sourceTransitionCount: sourceMachine.transitions.length,
        resultTransitionCount: sourceMachine.transitions.length,
        executionTimeMs: 0,
      };
    } else {
      throw new Error(`Unsupported conversion: ${sourceMachine.type} -> ${targetType}`);
    }

    // Persist conversion run by default unless disabled
    const shouldPersist = options?.persist !== false;
    let runId: string | undefined;

    if (shouldPersist) {
      runId = randomUUID();
      let sourceMachineId: string | null = null;
      let resultMachineId: string | null = null;

      // Only link foreign keys if machines exist in database
      if (sourceMachine.id) {
        const existingSource = await this.machineRepo.findById(sourceMachine.id);
        if (existingSource) {
          sourceMachineId = sourceMachine.id;
        }
      }

      await this.repo.create({
        id: runId,
        sourceMachineId,
        resultMachineId,
        sourceType: sourceMachine.type,
        targetType,
        sourceMachineData: sourceMachine,
        resultMachineData: resultMachine,
        stepsData: steps,
        metrics,
        createdAt: new Date(),
      });
    }

    return {
      success: true,
      sourceType: sourceMachine.type,
      targetType,
      resultMachine,
      steps,
      metrics,
    };
  }

  async verifyEquivalence(request: EquivalenceRequest): Promise<EquivalenceResponse> {
    const { machineA, machineB, maxCheckLength } = request;

    // Use complete product machine exploration
    const productResult = verifyEquivalenceProductMachine(machineA, machineB);

    if (!productResult.isEquivalent) {
      return {
        isEquivalent: false,
        checkedStatesCount: productResult.reachablePairsCount,
        counterexample: productResult.counterexample
          ? {
              inputString: productResult.counterexample.inputSequence.join(''),
              outputA: productResult.counterexample.outputA.join(''),
              outputB: productResult.counterexample.outputB.join(''),
            }
          : undefined,
        explanation: productResult.explanation,
      };
    }

    // Also run bounded verification up to maxCheckLength if requested
    const boundedResult = verifyEquivalenceBounded(machineA, machineB, maxCheckLength || 5);

    return {
      isEquivalent: true,
      checkedStatesCount: productResult.reachablePairsCount,
      explanation: `${productResult.explanation} ${boundedResult.explanation}`,
    };
  }

  async listHistory(limit = 50): Promise<ConversionRunRecord[]> {
    return this.repo.findAll(limit);
  }

  async getHistoryById(id: string): Promise<ConversionRunRecord | null> {
    const record = await this.repo.findById(id);
    return record ?? null;
  }
}

export const conversionService = new ConversionService();

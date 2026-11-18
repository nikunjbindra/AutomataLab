import { randomUUID } from 'node:crypto';
import type { SimulationRequest, SimulationResponse, SimulationStep } from '@automatalab/contracts';
import { simulateMachine } from '@automatalab/automata';
import { simulationRepository, SimulationRepository } from '../repositories/simulation.repository.js';
import { machineRepository, MachineRepository } from '../repositories/machine.repository.js';
import type { SimulationRunRecord } from '../db/schema.js';

export class SimulationService {
  constructor(
    private readonly repo: SimulationRepository = simulationRepository,
    private readonly machineRepo: MachineRepository = machineRepository
  ) {}

  async simulate(
    request: SimulationRequest,
    options?: { persist?: boolean }
  ): Promise<SimulationResponse> {
    const { machine, inputString } = request;

    try {
      const trace = simulateMachine(machine, inputString);

      const steps: SimulationStep[] = trace.steps.map((s) => ({
        stepIndex: s.stepIndex,
        currentState: s.currentState,
        inputSymbol: s.inputSymbol,
        consumedInput: s.consumedInput.join(''),
        remainingInput: s.remainingInput.join(''),
        emittedOutput: s.emittedOutput,
        cumulativeOutput: s.cumulativeOutput.join(''),
        nextState: s.nextState,
        activeTransitionId: s.transitionDescription,
      }));

      const outputTape = trace.outputSequence.join('');
      const shouldPersist = options?.persist === true;

      if (shouldPersist) {
        let machineId: string | null = null;
        if (machine.id) {
          const existing = await this.machineRepo.findById(machine.id);
          if (existing) {
            machineId = machine.id;
          }
        }

        await this.repo.create({
          id: randomUUID(),
          machineId,
          machineType: machine.type,
          inputSequence: trace.inputSequence,
          outputSequence: trace.outputSequence,
          traceData: trace,
          createdAt: new Date(),
        });
      }

      return {
        machineId: machine.id,
        machineType: machine.type,
        inputTape: inputString,
        outputTape,
        initialOutput: trace.initialOutput,
        steps,
        finalState: trace.finalState,
        isValid: true,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Simulation failed';
      return {
        machineId: machine.id,
        machineType: machine.type,
        inputTape: inputString,
        outputTape: '',
        steps: [],
        finalState: machine.initialState,
        isValid: false,
        error: errorMsg,
      };
    }
  }

  async listHistory(limit = 50): Promise<SimulationRunRecord[]> {
    return this.repo.findAll(limit);
  }

  async getHistoryById(id: string): Promise<SimulationRunRecord | null> {
    const record = await this.repo.findById(id);
    return record ?? null;
  }
}

export const simulationService = new SimulationService();

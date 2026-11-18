import type { AnyMachine } from '@automatalab/contracts';
import { validateMachine, ValidationResult } from '@automatalab/automata';

export class ValidationService {
  validate(machine: AnyMachine): ValidationResult {
    return validateMachine(machine);
  }
}

export const validationService = new ValidationService();

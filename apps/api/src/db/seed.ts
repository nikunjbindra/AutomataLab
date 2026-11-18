import { initDb } from './index.js';
import { machineRepository } from '../repositories/machine.repository.js';
import {
  MANDATORY_TASK_6_MEALY,
  EVEN_PARITY_MEALY,
  EVEN_PARITY_MOORE,
  SEQUENCE_101_MEALY,
} from '@automatalab/automata';

export async function seedDatabase(): Promise<void> {
  await initDb();

  const presets = [
    { machine: MANDATORY_TASK_6_MEALY, description: 'Mandatory Task 6 benchmark Mealy machine' },
    { machine: EVEN_PARITY_MEALY, description: 'Continuous even parity calculator (Mealy)' },
    { machine: EVEN_PARITY_MOORE, description: 'Continuous even parity calculator (Moore)' },
    { machine: SEQUENCE_101_MEALY, description: 'Overlapping 101 sequence detector (Mealy)' },
  ];

  for (const { machine, description } of presets) {
    const existing = await machineRepository.findById(machine.id!);
    if (!existing) {
      await machineRepository.createWithRelations(machine, description, machine.id);
      console.log(`[Seed] Seeded preset: ${machine.name} (${machine.id})`);
    } else {
      console.log(`[Seed] Preset already exists: ${machine.name}`);
    }
  }
}

// Allow CLI execution directly
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(() => {
      console.log('[Seed] Database seeding completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed] Database seeding failed:', err);
      process.exit(1);
    });
}

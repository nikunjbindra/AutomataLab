import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import { ConversionPage } from '../pages/ConversionPage.js';
import { SimulationPage } from '../pages/SimulationPage.js';
import { LearningShell } from '../components/learning/LearningShell.js';
import { DashboardPage } from '../pages/DashboardPage.js';
import { MACHINE_KEYS } from '../api/queries.js';
import { EVEN_PARITY_MEALY, convertMealyToMoore } from '@automatalab/automata';
import type { SavedMachineEntity } from '@automatalab/contracts';

function render(page: React.ReactElement, client = new QueryClient()) {
  return renderToStaticMarkup(<QueryClientProvider client={client}><MemoryRouter>{page}</MemoryRouter></QueryClientProvider>);
}

it('lists both saved records in each picker even when their names match', () => {
  const source = { ...EVEN_PARITY_MEALY, name: 'Parity exercise' };
  const converted = { ...convertMealyToMoore(source).machine, name: source.name };
  const records: SavedMachineEntity[] = [source, converted].map(machine => ({
    id: 'saved-' + machine.type, name: machine.name, type: machine.type,
    machineData: machine, createdAt: '2026-01-01', updatedAt: '2026-01-01',
  }));
  const client = new QueryClient();
  client.setQueryData(MACHINE_KEYS.list(), records);
  for (const picker of [<SimulationPage />, <ConversionPage />]) {
    const html = render(picker, client);
    for (const record of records) expect(html).toContain(`<option value="${record.id}">${source.name}`);
  }
  const dashboard = render(<DashboardPage />, client);
  expect(dashboard).toContain(source.name);
  expect(dashboard).toContain('Mealy FSM');
  expect(dashboard).toContain('Moore FSM');
});

it('opens the reference conversion with real construction stages', () => {
  const html = render(<ConversionPage />);
  expect(html).toContain('Conversion notebook');
  expect(html).toContain('Source Machine');
  expect(html).not.toContain('Complete the transition table in the builder');
});
it('renders the aligned trace and its computed verdict', () => {
  const html = render(<SimulationPage />);
  expect(html).toContain('Aligned execution trace');
  expect(html).toContain('Equivalent');
  const text = html.replace(/<[^>]+>/g, '');
  expect(text).toContain('yxyx');
  expect(text).toContain('Source stateABBAA');
});
it('opens the notebook on lesson one, Mealy vs Moore', () => {
  const html = render(<LearningShell />);
  expect(html).toContain('Lesson 1 of 5');
  expect(html).toContain('<h1>Where does the output live?</h1>');
});

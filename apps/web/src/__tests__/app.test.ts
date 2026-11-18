import { describe, it, expect } from 'vitest';
import { api } from '../api/client.js';
import { MACHINE_KEYS, SYSTEM_KEYS } from '../api/queries.js';
import { App } from '../App.js';
import { AppShell } from '../components/AppShell.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { DataTable } from '../components/DataTable.js';
import { EmptyState } from '../components/EmptyState.js';
import { LoadingState } from '../components/LoadingState.js';
import { ErrorState } from '../components/ErrorState.js';
import { ConfirmDialog } from '../components/ConfirmDialog.js';
import { ThemeToggle } from '../components/ThemeToggle.js';
import { PageHeader } from '../components/PageHeader.js';
import { WorkspaceLayout } from '../components/layout/WorkspaceLayout.js';
import { DashboardPage } from '../pages/DashboardPage.js';
import { BuilderPage } from '../pages/BuilderPage.js';
import { ConversionPage } from '../pages/ConversionPage.js';
import { SimulationPage } from '../pages/SimulationPage.js';
import { TestResultsPage } from '../pages/TestResultsPage.js';
import { DocumentationPage } from '../pages/DocumentationPage.js';

describe('AutomataLab Frontend Architecture & Component Test Suite', () => {
  it('1. Verifies all shared components and page modules export valid React components', () => {
    expect(typeof App).toBe('function');
    expect(typeof AppShell).toBe('function');
    expect(typeof StatusBadge).toBe('function');
    expect(typeof DataTable).toBe('function');
    expect(typeof EmptyState).toBe('function');
    expect(typeof LoadingState).toBe('function');
    expect(typeof ErrorState).toBe('function');
    expect(typeof ConfirmDialog).toBe('function');
    expect(typeof ThemeToggle).toBe('function');
    expect(typeof PageHeader).toBe('function');
    expect(typeof WorkspaceLayout).toBe('function');
    expect(typeof DashboardPage).toBe('function');
    expect(typeof BuilderPage).toBe('function');
    expect(typeof ConversionPage).toBe('function');
    expect(typeof SimulationPage).toBe('function');
    expect(typeof TestResultsPage).toBe('function');
    expect(typeof DocumentationPage).toBe('function');
  });

  it('2. Verifies TanStack Query key factories generate deterministic query keys', () => {
    expect(SYSTEM_KEYS.health).toEqual(['system', 'health']);
    expect(MACHINE_KEYS.all).toEqual(['machines']);
    expect(MACHINE_KEYS.lists()).toEqual(['machines', 'list']);
    expect(MACHINE_KEYS.list()).toEqual(['machines', 'list', { type: undefined }]);
    expect(MACHINE_KEYS.list('mealy')).toEqual(['machines', 'list', { type: 'mealy' }]);
    expect(MACHINE_KEYS.list('moore')).toEqual(['machines', 'list', { type: 'moore' }]);
    expect(MACHINE_KEYS.detail('uuid-123')).toEqual(['machines', 'detail', 'uuid-123']);
  });

  it('3. Verifies API client methods are defined and exposed properly', () => {
    expect(typeof api.getHealth).toBe('function');
    expect(typeof api.listMachines).toBe('function');
    expect(typeof api.getMachine).toBe('function');
    expect(typeof api.createMachine).toBe('function');
    expect(typeof api.updateMachine).toBe('function');
    expect(typeof api.deleteMachine).toBe('function');
    expect(typeof api.convertMachine).toBe('function');
    expect(typeof api.simulateMachine).toBe('function');
    expect(typeof api.validateMachine).toBe('function');
    expect(typeof api.verifyEquivalence).toBe('function');
  });
});

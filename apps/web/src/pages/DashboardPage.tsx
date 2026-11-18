import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Sparkles,
  Trash2,
  Workflow,
  PlayCircle,
  Clock,
  Layers,
  Database,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { DataTable, Column } from '../components/DataTable.js';
import { EmptyState } from '../components/EmptyState.js';
import { LoadingState } from '../components/LoadingState.js';
import { ErrorState } from '../components/ErrorState.js';
import { ConfirmDialog } from '../components/ConfirmDialog.js';
import {
  useMachinesQuery,
  useCreateMachineMutation,
  useDeleteMachineMutation,
} from '../api/queries.js';
import type { SavedMachineEntity, AnyMachine } from '@automatalab/contracts';
import {
  MANDATORY_TASK_6_MEALY,
  EVEN_PARITY_MEALY,
  EVEN_PARITY_MOORE,
  SEQUENCE_101_MEALY,
} from '@automatalab/automata';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState<'all' | 'mealy' | 'moore'>('all');
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [machineToDelete, setMachineToDelete] = useState<SavedMachineEntity | null>(null);

  const {
    data: machines = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useMachinesQuery(filterType === 'all' ? undefined : filterType);

  const createMutation = useCreateMachineMutation();
  const deleteMutation = useDeleteMachineMutation();

  const handleLoadPreset = async (presetMachine: AnyMachine) => {
    try {
      await createMutation.mutateAsync(presetMachine);
      setIsPresetModalOpen(false);
    } catch (err) {
      console.error('Failed to load preset:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!machineToDelete) return;
    try {
      await deleteMutation.mutateAsync(machineToDelete.id);
      setMachineToDelete(null);
    } catch (err) {
      console.error('Failed to delete machine:', err);
    }
  };

  // Recent machines (sorted by updatedAt descending)
  const recentMachines = [...machines]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  // DataTable Columns definition
  const columns: Column<SavedMachineEntity>[] = [
    {
      key: 'name',
      header: 'Machine Name',
      render: (m) => (
        <div className="space-y-0.5">
          <div className="font-semibold text-foreground text-xs">{m.name}</div>
          {m.description && (
            <div className="text-[11px] text-foreground-muted line-clamp-1">{m.description}</div>
          )}
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (m) => (
        <StatusBadge
          variant={m.type === 'mealy' ? 'mealy' : 'moore'}
          label={m.type === 'mealy' ? 'Mealy FSM' : 'Moore FSM'}
        />
      ),
    },
    {
      key: 'states',
      header: 'States',
      render: (m) => (
        <span className="font-mono text-[11px] text-foreground">
          {m.machineData.states.length} states
        </span>
      ),
    },
    {
      key: 'alphabet',
      header: 'Σ / Δ',
      render: (m) => (
        <span className="font-mono text-[11px] text-foreground-muted">
          Σ:{'['}{m.machineData.alphabet.join(',')}{']'} Δ:{'['}{m.machineData.outputAlphabet.join(',')}{']'}
        </span>
      ),
    },
    {
      key: 'transitions',
      header: 'Transitions',
      render: (m) => (
        <span className="font-mono text-[11px] text-foreground">
          {m.machineData.transitions.length}
        </span>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Last Modified',
      render: (m) => {
        const date = new Date(m.updatedAt);
        return (
          <span className="text-[11px] text-foreground-muted font-mono">
            {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (m) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => navigate('/convert', { state: { machineId: m.id } })}
            title="Convert Machine"
            className="p-1 rounded text-foreground-muted hover:text-accent-blue hover:bg-surface-hover transition-colors"
          >
            <Workflow className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => navigate('/simulate', { state: { machineId: m.id } })}
            title="Simulate Machine"
            className="p-1 rounded text-foreground-muted hover:text-accent-emerald hover:bg-surface-hover transition-colors"
          >
            <PlayCircle className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setMachineToDelete(m)}
            title="Delete Machine"
            className="p-1 rounded text-foreground-muted hover:text-accent-rose hover:bg-surface-hover transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Automata Workbench Dashboard"
        description="Persisted Mealy & Moore state machines, mathematical formalisms, and conversion pipelines."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPresetModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-surface hover:bg-surface-hover text-xs font-medium text-foreground transition-colors shadow-subtle"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent-indigo" />
              <span>Load Benchmark Example</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/builder')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent-blue hover:bg-blue-600 text-white text-xs font-medium transition-colors shadow-subtle"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Machine</span>
            </button>
          </div>
        }
      />

      {/* Recent Machines Cards (Only when machines exist) */}
      {!isLoading && !isError && recentMachines.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-foreground-muted uppercase tracking-wider">
            <span className="flex items-center gap-1.5 font-semibold">
              <Clock className="w-3.5 h-3.5" /> Recently Modified
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recentMachines.map((m) => (
              <div
                key={m.id}
                onClick={() => navigate('/convert', { state: { machineId: m.id } })}
                className="group p-4 rounded-xl border border-border bg-surface hover:border-accent-blue/40 transition-all cursor-pointer shadow-subtle flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge
                      variant={m.type === 'mealy' ? 'mealy' : 'moore'}
                      size="sm"
                      label={m.type === 'mealy' ? 'Mealy' : 'Moore'}
                    />
                    <span className="text-[10px] font-mono text-foreground-muted">
                      {new Date(m.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-foreground group-hover:text-accent-blue transition-colors line-clamp-1">
                    {m.name}
                  </h3>

                  <p className="text-xs text-foreground-muted line-clamp-2">
                    {m.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-[11px] font-mono text-foreground-muted">
                  <span>{m.machineData.states.length} states</span>
                  <span>{m.machineData.transitions.length} transitions</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Saved Machines Section */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-1">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-accent-blue" />
            <h2 className="text-sm font-semibold text-foreground tracking-tight">
              Saved Machines
            </h2>
            <span className="text-xs font-mono text-foreground-muted">
              ({machines.length})
            </span>
          </div>

          {/* Filter Pills */}
          <div className="inline-flex rounded-lg border border-border bg-surface p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-accent-blue text-white shadow-subtle'
                  : 'text-foreground-muted hover:text-foreground'
              }`}
            >
              All ({machines.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('mealy')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterType === 'mealy'
                  ? 'bg-accent-blue text-white shadow-subtle'
                  : 'text-foreground-muted hover:text-foreground'
              }`}
            >
              Mealy
            </button>
            <button
              type="button"
              onClick={() => setFilterType('moore')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterType === 'moore'
                  ? 'bg-accent-blue text-white shadow-subtle'
                  : 'text-foreground-muted hover:text-foreground'
              }`}
            >
              Moore
            </button>
          </div>
        </div>

        {/* State Renderers */}
        {isLoading ? (
          <LoadingState
            message="Connecting to AutomataLab API..."
            subtext="Fetching formal state machine definitions from SQLite repository."
          />
        ) : isError ? (
          <ErrorState
            title="Failed to retrieve machines"
            error={error}
            onRetry={() => refetch()}
          />
        ) : machines.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No State Machines Persisted"
            description="Your repository does not contain any machines yet. Create a new state machine definition or load an established theoretical benchmark example."
            primaryAction={{
              label: 'Load Task 6 Benchmark',
              icon: <Sparkles className="w-3.5 h-3.5" />,
              onClick: () => handleLoadPreset(MANDATORY_TASK_6_MEALY),
            }}
            secondaryAction={{
              label: 'Open Machine Builder',
              onClick: () => navigate('/builder'),
            }}
          />
        ) : (
          <DataTable
            columns={columns}
            data={machines}
            keyExtractor={(m) => m.id}
            onRowClick={(m) => navigate('/convert', { state: { machineId: m.id } })}
          />
        )}
      </div>

      {/* Preset Loader Modal */}
      {isPresetModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <div className="w-full max-w-lg rounded-xl border border-border bg-surface-elevated p-6 shadow-elevated space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-indigo" />
                <h3 className="text-sm font-semibold text-foreground">
                  Load Formal Automata Benchmark
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPresetModalOpen(false)}
                className="text-xs text-foreground-muted hover:text-foreground"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-foreground-muted">
              Select one of the mathematically validated reference machines to load directly into the SQLite database:
            </p>

            <div className="space-y-2">
              {/* Preset 1: Task 6 Benchmark */}
              <div
                onClick={() => handleLoadPreset(MANDATORY_TASK_6_MEALY)}
                className="p-3 rounded-lg border border-border bg-surface hover:border-accent-blue/40 cursor-pointer transition-colors space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    Task 6 Reference Mealy Machine
                  </span>
                  <StatusBadge variant="mealy" size="sm" label="Mealy" />
                </div>
                <p className="text-[11px] text-foreground-muted">
                  States: A, B | Inputs: 0, 1 | Splits into S, A_x, A_y, B_x, B_y (Input 1100 → yxyx)
                </p>
              </div>

              {/* Preset 2: Even Parity Mealy */}
              <div
                onClick={() => handleLoadPreset(EVEN_PARITY_MEALY)}
                className="p-3 rounded-lg border border-border bg-surface hover:border-accent-blue/40 cursor-pointer transition-colors space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    Even Parity Generator (Mealy)
                  </span>
                  <StatusBadge variant="mealy" size="sm" label="Mealy" />
                </div>
                <p className="text-[11px] text-foreground-muted">
                  States: even, odd | Outputs 0 on even parity, 1 on odd parity
                </p>
              </div>

              {/* Preset 3: Even Parity Moore */}
              <div
                onClick={() => handleLoadPreset(EVEN_PARITY_MOORE)}
                className="p-3 rounded-lg border border-border bg-surface hover:border-accent-blue/40 cursor-pointer transition-colors space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    Even Parity Generator (Moore)
                  </span>
                  <StatusBadge variant="moore" size="sm" label="Moore" />
                </div>
                <p className="text-[11px] text-foreground-muted">
                  States: even (out: 0), odd (out: 1) | Canonical 2-state Moore model
                </p>
              </div>

              {/* Preset 4: 101 Sequence Detector */}
              <div
                onClick={() => handleLoadPreset(SEQUENCE_101_MEALY)}
                className="p-3 rounded-lg border border-border bg-surface hover:border-accent-blue/40 cursor-pointer transition-colors space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    101 Sequence Detector (Mealy)
                  </span>
                  <StatusBadge variant="mealy" size="sm" label="Mealy" />
                </div>
                <p className="text-[11px] text-foreground-muted">
                  States: S0, S1, S2 | Overlapping sequence recognition on binary input
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(machineToDelete)}
        title="Delete State Machine"
        description={`Are you sure you want to delete "${machineToDelete?.name}"? All associated states, transitions, and test records will be permanently removed.`}
        confirmLabel="Delete Machine"
        isDestructive
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setMachineToDelete(null)}
      />
    </div>
  );
};

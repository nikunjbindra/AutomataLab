import React, { useState } from 'react';
import type { AnyMachine, MooreMachine } from '@automatalab/contracts';
import { Plus, Trash2, Edit2, Check, X, ShieldAlert } from 'lucide-react';

interface MachineConfigPanelProps {
  machine: AnyMachine;
  onSetName: (name: string) => void;
  onSetDescription: (desc: string) => void;
  onSetType: (type: 'mealy' | 'moore') => void;
  onAddState: (name?: string) => string | null;
  onRenameState: (oldName: string, newName: string) => boolean;
  onDeleteState: (name: string) => void;
  onSetInitialState: (state: string) => void;
  onAddInputSymbol: (symbol: string) => boolean;
  onRemoveInputSymbol: (symbol: string) => void;
  onAddOutputSymbol: (symbol: string) => boolean;
  onRemoveOutputSymbol: (symbol: string) => void;
  onSetMooreOutput: (state: string, output: string) => void;
  selectedState?: string | null;
  onSelectState?: (state: string | null) => void;
}

export const MachineConfigPanel: React.FC<MachineConfigPanelProps> = ({
  machine,
  onSetName,
  onSetDescription,
  onSetType,
  onAddState,
  onRenameState,
  onDeleteState,
  onSetInitialState,
  onAddInputSymbol,
  onRemoveInputSymbol,
  onAddOutputSymbol,
  onRemoveOutputSymbol,
  onSetMooreOutput,
  selectedState,
  onSelectState,
}) => {
  const [newStateInput, setNewStateInput] = useState('');
  const [newSigmaInput, setNewSigmaInput] = useState('');
  const [newDeltaInput, setNewDeltaInput] = useState('');
  const [editingState, setEditingState] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isMoore = machine.type === 'moore';
  const moore = isMoore ? (machine as MooreMachine) : null;

  const handleAddState = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const added = onAddState(newStateInput.trim() || undefined);
    if (!added) {
      setErrorMsg(`State "${newStateInput.trim()}" already exists`);
    } else {
      setNewStateInput('');
    }
  };

  const handleStartRename = (state: string) => {
    setEditingState(state);
    setRenameInput(state);
    setErrorMsg(null);
  };

  const handleConfirmRename = () => {
    if (!editingState || !renameInput.trim()) return;
    const ok = onRenameState(editingState, renameInput.trim());
    if (!ok) {
      setErrorMsg(`Cannot rename: "${renameInput.trim()}" is already used or invalid`);
    } else {
      setEditingState(null);
      setErrorMsg(null);
    }
  };

  const handleAddSigma = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSigmaInput.trim()) return;
    const ok = onAddInputSymbol(newSigmaInput.trim());
    if (ok) setNewSigmaInput('');
  };

  const handleAddDelta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeltaInput.trim()) return;
    const ok = onAddOutputSymbol(newDeltaInput.trim());
    if (ok) setNewDeltaInput('');
  };

  return (
    <div className="space-y-4 text-xs font-mono">
      {errorMsg && (
        <div className="p-2 rounded-md bg-rose-500/10 border border-rose-500/20 text-accent-rose flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            {errorMsg}
          </span>
          <button type="button" onClick={() => setErrorMsg(null)}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Identity & Type */}
      <div className="space-y-2">
        <label className="block text-[11px] font-semibold text-foreground uppercase tracking-wider">
          Machine Identifier
        </label>
        <input
          type="text"
          value={machine.name}
          onChange={(e) => onSetName(e.target.value)}
          placeholder="e.g. Parity Detector"
          className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface-elevated text-foreground focus:ring-1 focus:ring-accent-blue focus:outline-none text-xs"
        />

        <input
          type="text"
          value={machine.description || ''}
          onChange={(e) => onSetDescription(e.target.value)}
          placeholder="Optional description / invariant notes..."
          className="w-full px-2.5 py-1 rounded-md border border-border bg-surface-elevated text-foreground-muted focus:ring-1 focus:ring-accent-blue focus:outline-none text-[11px]"
        />

        <div className="flex items-center gap-2 pt-1">
          <label className="text-[11px] text-foreground-muted">Type:</label>
          <div className="inline-flex rounded-md border border-border bg-surface p-0.5">
            <button
              type="button"
              onClick={() => onSetType('mealy')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                machine.type === 'mealy'
                  ? 'bg-accent-blue text-white shadow-subtle'
                  : 'text-foreground-muted hover:text-foreground'
              }`}
            >
              Mealy
            </button>
            <button
              type="button"
              onClick={() => onSetType('moore')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                machine.type === 'moore'
                  ? 'bg-accent-blue text-white shadow-subtle'
                  : 'text-foreground-muted hover:text-foreground'
              }`}
            >
              Moore
            </button>
          </div>
        </div>
      </div>

      {/* 2. State Set Q */}
      <div className="space-y-2 pt-2 border-t border-border-subtle">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
            States Q ({machine.states.length})
          </label>
          <span className="text-[10px] text-foreground-muted">★ = Initial</span>
        </div>

        <form onSubmit={handleAddState} className="flex gap-1.5">
          <input
            type="text"
            value={newStateInput}
            onChange={(e) => setNewStateInput(e.target.value)}
            placeholder="New state ID..."
            className="flex-1 px-2 py-1 rounded border border-border bg-surface-elevated text-foreground focus:ring-1 focus:ring-accent-blue focus:outline-none text-xs"
          />
          <button
            type="submit"
            className="px-2.5 py-1 rounded bg-accent-blue text-white hover:bg-blue-600 transition-colors flex items-center gap-1 shrink-0 font-medium text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>

        <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
          {machine.states.map((state) => {
            const isInitial = machine.initialState === state;
            const isSelected = selectedState === state;

            if (editingState === state) {
              return (
                <div
                  key={state}
                  className="flex items-center gap-1 p-1 rounded border border-accent-blue bg-surface-elevated"
                >
                  <input
                    type="text"
                    value={renameInput}
                    onChange={(e) => setRenameInput(e.target.value)}
                    autoFocus
                    className="flex-1 px-1.5 py-0.5 rounded bg-surface border border-border text-foreground text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleConfirmRename}
                    className="p-1 text-emerald-500 hover:bg-surface-hover rounded"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingState(null)}
                    className="p-1 text-foreground-muted hover:bg-surface-hover rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            }

            return (
              <div
                key={state}
                onClick={() => onSelectState?.(state)}
                className={`flex items-center justify-between p-1.5 rounded border transition-colors ${
                  isSelected
                    ? 'border-accent-blue bg-accent-blue/10 dark:bg-accent-blue/15'
                    : 'border-border bg-surface hover:bg-surface-hover'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSetInitialState(state);
                    }}
                    title={isInitial ? 'Initial State' : 'Click to make Initial State'}
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                      isInitial
                        ? 'bg-accent-cyan text-white font-bold'
                        : 'border border-border text-foreground-muted hover:border-accent-cyan'
                    }`}
                  >
                    {isInitial ? '★' : ''}
                  </button>

                  <span className={`font-semibold truncate ${isInitial ? 'text-accent-cyan' : 'text-foreground'}`}>
                    {state}
                  </span>

                  {isMoore && moore && (
                    <span className="text-[11px] text-accent-indigo">
                      → {moore.stateOutputs?.[state] || '—'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => handleStartRename(state)}
                    title="Rename State"
                    className="p-1 rounded text-foreground-muted hover:text-accent-blue hover:bg-surface-elevated"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteState(state)}
                    disabled={machine.states.length <= 1}
                    title={machine.states.length <= 1 ? 'Cannot delete only state' : 'Delete State'}
                    className="p-1 rounded text-foreground-muted hover:text-accent-rose hover:bg-surface-elevated disabled:opacity-30"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Input Alphabet Σ */}
      <div className="space-y-2 pt-2 border-t border-border-subtle">
        <label className="block text-[11px] font-semibold text-foreground uppercase tracking-wider">
          Input Alphabet Σ ({machine.alphabet.length})
        </label>

        <div className="flex flex-wrap gap-1.5">
          {machine.alphabet.map((symbol) => (
            <span
              key={symbol}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-border bg-surface-elevated text-foreground text-xs"
            >
              <span>{symbol}</span>
              {machine.alphabet.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveInputSymbol(symbol)}
                  className="text-foreground-muted hover:text-accent-rose"
                  title="Remove input symbol"
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>

        <form onSubmit={handleAddSigma} className="flex gap-1.5">
          <input
            type="text"
            value={newSigmaInput}
            onChange={(e) => setNewSigmaInput(e.target.value)}
            placeholder="Add symbol..."
            className="flex-1 px-2 py-1 rounded border border-border bg-surface-elevated text-foreground focus:ring-1 focus:ring-accent-blue focus:outline-none text-xs"
          />
          <button
            type="submit"
            className="px-2.5 py-1 rounded border border-border bg-surface hover:bg-surface-hover text-foreground text-xs"
          >
            Add
          </button>
        </form>
      </div>

      {/* 4. Output Alphabet Δ */}
      <div className="space-y-2 pt-2 border-t border-border-subtle">
        <label className="block text-[11px] font-semibold text-foreground uppercase tracking-wider">
          Output Alphabet Δ ({machine.outputAlphabet.length})
        </label>

        <div className="flex flex-wrap gap-1.5">
          {machine.outputAlphabet.map((symbol) => (
            <span
              key={symbol}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-border bg-surface-elevated text-foreground text-xs"
            >
              <span>{symbol}</span>
              {machine.outputAlphabet.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveOutputSymbol(symbol)}
                  className="text-foreground-muted hover:text-accent-rose"
                  title="Remove output symbol"
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>

        <form onSubmit={handleAddDelta} className="flex gap-1.5">
          <input
            type="text"
            value={newDeltaInput}
            onChange={(e) => setNewDeltaInput(e.target.value)}
            placeholder="Add output..."
            className="flex-1 px-2 py-1 rounded border border-border bg-surface-elevated text-foreground focus:ring-1 focus:ring-accent-blue focus:outline-none text-xs"
          />
          <button
            type="submit"
            className="px-2.5 py-1 rounded border border-border bg-surface hover:bg-surface-hover text-foreground text-xs"
          >
            Add
          </button>
        </form>
      </div>

      {/* 5. Moore State-Output Assignment */}
      {isMoore && moore && (
        <div className="space-y-2 pt-2 border-t border-border-subtle">
          <label className="block text-[11px] font-semibold text-foreground uppercase tracking-wider">
            Moore State Outputs λ(S)
          </label>
          <div className="space-y-1.5">
            {machine.states.map((state) => (
              <div key={state} className="flex items-center justify-between gap-2">
                <span className="text-foreground-muted font-medium">{state}:</span>
                <select
                  value={moore.stateOutputs?.[state] || machine.outputAlphabet[0] || '0'}
                  onChange={(e) => onSetMooreOutput(state, e.target.value)}
                  className="h-6 px-1.5 rounded border border-border bg-surface-elevated text-foreground text-xs focus:ring-1 focus:ring-accent-blue focus:outline-none"
                >
                  {machine.outputAlphabet.map((out) => (
                    <option key={out} value={out}>
                      {out}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader.js';
import { WorkspaceLayout } from '../components/layout/WorkspaceLayout.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { ConfirmDialog } from '../components/ConfirmDialog.js';
import { MachineConfigPanel } from '../components/builder/MachineConfigPanel.js';
import { TransitionTableEditor } from '../components/builder/TransitionTableEditor.js';
import { AutomataGraphCanvas } from '../components/builder/AutomataGraphCanvas.js';
import { ValidationPanel } from '../components/builder/ValidationPanel.js';
import { PresetSelectorModal } from '../components/builder/PresetSelectorModal.js';
import { useMachineEditor } from '../hooks/useMachineEditor.js';
import { useMachineQuery } from '../api/queries.js';
import { api } from '../api/client.js';
import {
  Save,
  Plus,
  Sparkles,
  RotateCcw,
  Network,
  Table as TableIcon,
  Check,
  AlertCircle,
  ArrowRightLeft,
} from 'lucide-react';
import type { AnyMachine } from '@automatalab/contracts';

export const BuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Selected state for cross-component focus
  const [selectedState, setSelectedState] = useState<string | null>(null);

  // Center panel view mode: 'graph' | 'table' | 'split'
  const [viewMode, setViewMode] = useState<'split' | 'graph' | 'table'>('split');

  // Modals & confirmation dialogs
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isNewConfirmOpen, setIsNewConfirmOpen] = useState(false);

  // Saving states & feedback
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);

  // Editor hook
  const editor = useMachineEditor();

  // Load existing machine if passed via query param or route state
  const targetId = searchParams.get('id') || (location.state as { machineId?: string } | null)?.machineId;
  const { data: loadedMachine } = useMachineQuery(targetId || undefined);

  useEffect(() => {
    if (loadedMachine?.machineData) {
      editor.loadMachine(loadedMachine.machineData, loadedMachine.id);
    }
  }, [loadedMachine?.id]);

  // Handle Save
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccessMsg(null);
    setSaveErrorMsg(null);

    try {
      if (editor.savedId) {
        // Update existing machine
        const updated = await api.updateMachine(editor.savedId, editor.machine);
        editor.markSaved(updated.id);
        setSaveSuccessMsg(`Machine "${updated.name}" updated successfully.`);
      } else {
        // Create new machine
        const created = await api.createMachine(editor.machine);
        editor.markSaved(created.id);
        setSaveSuccessMsg(`Machine "${created.name}" persisted to repository.`);
      }
    } catch (err: unknown) {
      const errorObj = err as { error?: string; message?: string };
      setSaveErrorMsg(errorObj.error || errorObj.message || 'Failed to persist machine definition.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    }
  };

  const handleSelectPreset = (preset: AnyMachine) => {
    editor.loadMachine(preset);
    setSaveSuccessMsg(`Loaded benchmark "${preset.name}".`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <PageHeader
        title={editor.machine.name}
        description="Interactive finite-state machine editor with synchronized graph canvas and transition matrix."
        badge={
          <div className="flex items-center gap-1.5">
            <StatusBadge
              variant={editor.machine.type === 'mealy' ? 'mealy' : 'moore'}
              size="sm"
              label={editor.machine.type === 'mealy' ? 'Mealy FSM' : 'Moore FSM'}
            />
            {editor.isDirty && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                • Unsaved Changes
              </span>
            )}
            {editor.savedId && !editor.isDirty && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                ✓ Persisted
              </span>
            )}
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (editor.isDirty) setIsNewConfirmOpen(true);
                else editor.resetToBlank(editor.machine.type);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-border bg-surface hover:bg-surface-hover text-xs font-medium text-foreground transition-colors shadow-subtle"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPresetModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border bg-surface hover:bg-surface-hover text-xs font-medium text-foreground transition-colors shadow-subtle"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent-indigo" />
              <span>Examples</span>
            </button>

            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="p-1.5 rounded-md border border-border bg-surface hover:bg-surface-hover text-foreground-muted hover:text-foreground transition-colors"
              title="Reset machine"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent-blue hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-medium transition-colors shadow-subtle"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : editor.savedId ? 'Update' : 'Save'}</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/convert', { state: { machineId: editor.savedId } })}
              title="Go to Conversion Workspace"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-accent-indigo text-xs font-medium transition-colors"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Convert</span>
            </button>
          </div>
        }
      />

      {/* Notification Toasts */}
      {saveSuccessMsg && (
        <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {saveErrorMsg && (
        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-mono flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{saveErrorMsg}</span>
        </div>
      )}

      {/* Main Multi-Panel Workspace */}
      <WorkspaceLayout
        title="MACHINE BUILDER"
        subtitle={editor.machine.name}
        actions={
          <div className="flex items-center gap-1 border-r border-border pr-2 mr-1">
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`p-1 rounded text-xs font-mono font-medium transition-colors ${
                viewMode === 'split'
                  ? 'bg-accent-blue text-white'
                  : 'text-foreground-muted hover:text-foreground'
              }`}
              title="Split View (Graph & Matrix)"
            >
              Split
            </button>
            <button
              type="button"
              onClick={() => setViewMode('graph')}
              className={`p-1 rounded text-xs font-mono font-medium transition-colors ${
                viewMode === 'graph'
                  ? 'bg-accent-blue text-white'
                  : 'text-foreground-muted hover:text-foreground'
              }`}
              title="Graph Diagram View"
            >
              <Network className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1 rounded text-xs font-mono font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-accent-blue text-white'
                  : 'text-foreground-muted hover:text-foreground'
              }`}
              title="Transition Matrix View"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        }
        leftPanelTitle="Configuration (Q, Σ, Δ)"
        leftPanel={
          <MachineConfigPanel
            machine={editor.machine}
            onSetName={editor.setName}
            onSetDescription={editor.setDescription}
            onSetType={editor.setType}
            onAddState={editor.addState}
            onRenameState={editor.renameState}
            onDeleteState={editor.deleteState}
            onSetInitialState={editor.setInitialState}
            onAddInputSymbol={editor.addInputSymbol}
            onRemoveInputSymbol={editor.removeInputSymbol}
            onAddOutputSymbol={editor.addOutputSymbol}
            onRemoveOutputSymbol={editor.removeOutputSymbol}
            onSetMooreOutput={editor.setMooreOutput}
            selectedState={selectedState}
            onSelectState={setSelectedState}
          />
        }
        centerPanel={
          <div className="w-full h-full flex flex-col min-h-0 overflow-hidden">
            {viewMode === 'split' ? (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Top Half: Graph Diagram */}
                <div className="flex-1 min-h-[45%] relative border-b border-border">
                  <AutomataGraphCanvas
                    machine={editor.machine}
                    nodePositions={editor.nodePositions}
                    onPositionChange={editor.updateNodePosition}
                    selectedState={selectedState}
                    onSelectState={setSelectedState}
                  />
                </div>
                {/* Bottom Half: Transition Matrix */}
                <div className="h-48 overflow-y-auto p-3 bg-surface">
                  <TransitionTableEditor
                    machine={editor.machine}
                    onSetTransition={editor.setTransition}
                    onRemoveTransition={editor.removeTransition}
                    selectedState={selectedState}
                    onSelectState={setSelectedState}
                  />
                </div>
              </div>
            ) : viewMode === 'graph' ? (
              <div className="w-full h-full relative">
                <AutomataGraphCanvas
                  machine={editor.machine}
                  nodePositions={editor.nodePositions}
                  onPositionChange={editor.updateNodePosition}
                  selectedState={selectedState}
                  onSelectState={setSelectedState}
                />
              </div>
            ) : (
              <div className="w-full h-full p-4 overflow-y-auto bg-surface">
                <TransitionTableEditor
                  machine={editor.machine}
                  onSetTransition={editor.setTransition}
                  onRemoveTransition={editor.removeTransition}
                  selectedState={selectedState}
                  onSelectState={setSelectedState}
                />
              </div>
            )}
          </div>
        }
        rightPanelTitle="Live Validation & Status"
        rightPanel={
          <ValidationPanel
            machine={editor.machine}
            validation={editor.validation}
            completeness={editor.completeness}
          />
        }
      />

      {/* Preset Selector Modal */}
      <PresetSelectorModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        onSelectPreset={handleSelectPreset}
      />

      {/* New Machine Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isNewConfirmOpen}
        title="Discard Unsaved Changes?"
        description="You have unsaved changes on the current state machine. Creating a new machine will discard them."
        confirmLabel="Create New"
        onConfirm={() => {
          setIsNewConfirmOpen(false);
          editor.resetToBlank(editor.machine.type);
        }}
        onCancel={() => setIsNewConfirmOpen(false)}
      />

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        title="Reset to Template?"
        description="Reset this machine back to a basic template? All custom states and transitions will be reset."
        confirmLabel="Reset Machine"
        isDestructive
        onConfirm={() => {
          setIsResetConfirmOpen(false);
          editor.resetToBlank(editor.machine.type);
        }}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};

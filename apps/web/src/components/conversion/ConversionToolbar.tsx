import React from 'react';
import type { AnyMachine, SavedMachineEntity } from '@automatalab/contracts';
import { StatusBadge } from '../StatusBadge.js';
import {
  Sparkles,
  RotateCcw,
  Save,
  Download,
  Edit3,
  Play,
} from 'lucide-react';
import type { ConversionDirection } from './types.js';

interface ConversionToolbarProps {
  selectedMachine: AnyMachine;
  savedMachines: SavedMachineEntity[];
  selectedId?: string;
  onSelectSavedMachine: (machine: SavedMachineEntity) => void;
  onOpenGallery: () => void;
  direction: ConversionDirection;
  onDirectionChange: (dir: ConversionDirection) => void;
  onConvert: () => void;
  onReset: () => void;
  onSaveConverted?: () => void;
  onExportJson?: () => void;
  onEditInBuilder?: () => void;
  isConverted: boolean;
  isSaving?: boolean;
  resultSaved?: boolean;
}

export const ConversionToolbar: React.FC<ConversionToolbarProps> = ({
  selectedMachine,
  savedMachines,
  selectedId,
  onSelectSavedMachine,
  onOpenGallery,
  direction,
  onDirectionChange,
  onConvert,
  onReset,
  onSaveConverted,
  onExportJson,
  onEditInBuilder,
  isConverted,
  isSaving = false,
  resultSaved = false,
}) => {
  return (
    <div className="rounded-xl border border-border bg-surface p-3.5 shadow-subtle flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 select-none">
      {/* Left: Machine Selection */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-2">
          <label htmlFor="source-machine-select" className="text-xs font-mono font-bold text-foreground shrink-0">Machine:</label>
          <select
            id="source-machine-select"
            value={selectedId ?? ''}
            onChange={(e) => {
              const found = savedMachines.find((m) => m.id === e.target.value);
              if (found) onSelectSavedMachine(found);
            }}
            className="px-2.5 py-1.5 text-xs font-mono rounded-lg border border-border bg-surface-elevated text-foreground focus:outline-none focus:border-accent-blue font-semibold max-w-[210px] truncate"
          >
            {!savedMachines.some(m => m.id === selectedId) && <option value={selectedId ?? ''}>{selectedMachine.name}</option>}
            {savedMachines
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.type.toUpperCase()})
                </option>
              ))}
          </select>
        </div>

        <button
          type="button"
          onClick={onOpenGallery}
          title="Open benchmark example gallery"
          className="px-2.5 py-1.5 rounded-lg border border-border bg-surface-elevated/80 hover:bg-surface-elevated text-foreground font-mono text-xs flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-accent-blue" />
          <span>Examples</span>
        </button>

        <StatusBadge
          variant={selectedMachine.type === 'moore' ? 'moore' : 'mealy'}
          label={selectedMachine.type.toUpperCase()}
          size="sm"
        />
      </div>

      {/* Middle: Conversion Direction Switcher */}
      <div className="flex items-center justify-center gap-1.5 self-center">
        <div className="flex rounded-lg border border-border bg-surface-elevated/40 p-0.5 font-mono text-xs">
          <button
            type="button"
            onClick={() => onDirectionChange('mealy-to-moore')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              direction === 'mealy-to-moore'
                ? 'bg-accent-blue text-white shadow-xs'
                : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            Mealy → Moore (Splitting)
          </button>
          <button
            type="button"
            onClick={() => onDirectionChange('moore-to-mealy')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              direction === 'moore-to-mealy'
                ? 'bg-accent-indigo text-white shadow-xs'
                : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            Moore → Mealy (Folding)
          </button>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={onReset}
          title="Reset transformation to initial state"
          className="p-2 rounded-lg border border-border bg-surface hover:bg-surface-hover text-foreground-muted hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {onEditInBuilder && (
          <button
            type="button"
            onClick={onEditInBuilder}
            title="Open in Machine Builder"
            className="px-2.5 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-hover text-foreground-muted hover:text-foreground text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </button>
        )}

        {isConverted && onSaveConverted && (
          <button
            type="button"
            onClick={onSaveConverted}
            disabled={isSaving || resultSaved}
            className="px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-accent-emerald text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : resultSaved ? 'Result saved' : 'Save Result'}</span>
          </button>
        )}

        {isConverted && onExportJson && (
          <button
            type="button"
            onClick={onExportJson}
            title="Export Converted Machine JSON"
            className="p-2 rounded-lg border border-border bg-surface hover:bg-surface-hover text-foreground-muted hover:text-foreground transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        )}

        <button
          type="button"
          onClick={onConvert}
          disabled={isSaving || !isConverted}
          className="px-4 py-1.5 rounded-lg bg-accent-blue hover:bg-blue-600 text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Convert Machine</span>
        </button>
      </div>
    </div>
  );
};

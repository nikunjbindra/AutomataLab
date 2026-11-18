# AutomataLab — Phase 4 Technical Report
## Interactive Machine Builder

**Date:** November 2026  
**Role:** Senior Full-Stack Engineer — React, TypeScript, Graph Visualization, Finite-State Machines  
**Repository:** `c:\Users\nikun\Desktop\AUTOMATA PROJECT`  
**Git branch:** `main`

---

## 1. Executive Summary

Phase 4 delivers a fully functional, professionally engineered interactive finite-state machine (FSM) editor — the core user-facing feature of AutomataLab. Users can now construct, edit, validate, persist, and visually explore both Mealy and Moore machines through an integrated builder workbench.

The implementation is built on `@xyflow/react` for the interactive graph canvas, synchronized bidirectionally with a structured transition table editor. A live validation panel provides instant, formal feedback. All six predefined benchmark examples from the Phase 1 specification are accessible via a preset selector. Completed machines are saved to the SQLite backend via the Phase 2 REST API.

**Final verification results (all mandatory):**

| Check | Result |
|---|---|
| `npm run typecheck` | ✅ Exit 0 — 0 errors across all 4 workspaces |
| `npm run test` | ✅ 52 tests, 0 failures (21 automata + 5 contracts + 12 api + 14 web) |
| `npm run build` | ✅ Exit 0 — 1708 modules transformed |

---

## 2. Architecture Overview

### 2.1 Single Source of Truth — `useMachineEditor`

All builder state is owned exclusively by the `useMachineEditor` hook (`apps/web/src/hooks/useMachineEditor.ts`). Both the graph canvas and the transition table are **derived views** that read from this hook and write through its action methods. This guarantees permanent consistency: editing a transition in the table is immediately reflected in the graph edge labels, and vice versa when dragging a node.

```
useMachineEditor (canonical state)
    ├── machine: MealyMachine | MooreMachine
    ├── nodePositions: Record<string, {x,y}>  (UI-only, not persisted to DB)
    ├── validation: ValidationResult           (live, recalculated on every edit)
    └── completeness: number                   (0–100%)
         │
         ├── AutomataGraphCanvas   ← reads nodes/edges derived from machine
         ├── TransitionTableEditor ← reads transition matrix from machine
         ├── MachineConfigPanel    ← reads & writes states/alphabets
         └── ValidationPanel       ← reads validation + completeness
```

### 2.2 Node Position Separation

Graph node positions are stored in a separate `nodePositions: Record<string, { x: number; y: number }>` state within the hook — intentionally **decoupled** from the machine definition. This design decision was made because:

1. The database schema (`machines` + `states` + `transitions`) does not include layout columns (not needed for algorithmic correctness).
2. Positions are purely visual UI concern — not part of the formal automaton definition.
3. `computeAutoLayout()` generates circular positions on initial load; users can then drag nodes freely.

The `updateNodePosition` action on the hook persists drag positions in React state for the duration of the session.

### 2.3 Edge Grouping and Self-Loops

Multiple transitions between the same `(source, destination)` state pair are **combined into a single React Flow edge** with comma-separated labels. This prevents edge clutter on dense machines. Self-loops (source === destination) are rendered using a custom `SelfLoopEdge` component that traces an upward circular SVG arc above the state node, mirroring JFLAP-style notation.

---

## 3. Components Implemented

### 3.1 `useMachineEditor` Hook
**Path:** `apps/web/src/hooks/useMachineEditor.ts`

Core state management hook exposing the full builder API:

| Action | Description |
|---|---|
| `setName(name)` | Update machine name |
| `setDescription(desc)` | Update machine description |
| `setType(type)` | Switch Mealy ↔ Moore (preserves compatible transitions) |
| `addState(id)` | Add new state; prevents duplicate names |
| `renameState(old, new)` | Rename state; updates all affected transitions |
| `deleteState(id)` | Delete state; removes all transitions referencing it |
| `setInitialState(id)` | Designate initial state |
| `addInputSymbol(sym)` | Add to input alphabet; prevents duplicates |
| `removeInputSymbol(sym)` | Remove symbol; clears affected transitions |
| `addOutputSymbol(sym)` | Add to output alphabet |
| `removeOutputSymbol(sym)` | Remove output symbol; clears affected transitions |
| `setMooreOutput(state, sym)` | Assign output to a Moore state |
| `setTransition(from, input, dest, output?)` | Set/overwrite a transition cell |
| `removeTransition(from, input)` | Clear a specific transition cell |
| `updateNodePosition(id, x, y)` | Record graph drag position |
| `loadMachine(machine)` | Hydrate editor from a saved machine definition |
| `resetToBlank(type)` | Reset to empty machine |
| `markSaved(id)` | Record backend ID after successful save |

Also exports `computeAutoLayout(states)` — circular layout algorithm placing N states evenly on a radius-200 circle, centred at (250, 250).

### 3.2 `StateNode`
**Path:** `apps/web/src/components/builder/StateNode.tsx`

Custom `@xyflow/react` node renderer:
- **Mealy**: Single circle with state label centred.
- **Moore**: Split circle — top half: state ID, horizontal divider, bottom half: output symbol.
- **Initial state**: Cyan ring + animated left-pointing arrow indicator (JFLAP-style).
- **Selected state**: Blue ring highlight.
- Handles are positioned at cardinal compass points (N, S, E, W) for clean edge routing.

### 3.3 `SelfLoopEdge`
**Path:** `apps/web/src/components/builder/SelfLoopEdge.tsx`

Custom `@xyflow/react` edge renderer:
- Detects self-loops (source === target) → renders upward circular SVG arc.
- Regular transitions → standard bezier curve with offset label.
- Selected edge: Blue stroke.
- Edge labels show grouped transition symbols (e.g. `0/x, 1/y`).

### 3.4 `AutomataGraphCanvas`
**Path:** `apps/web/src/components/builder/AutomataGraphCanvas.tsx`

Interactive canvas wrapping `ReactFlow`:
- Converts `machine.states` → `Node[]` with `StateNode` type and stored positions.
- Converts `machine.transitions` → grouped `Edge[]` with `SelfLoopEdge` type.
- Features: `fitView` on mount, zoom controls, minimap, dot-grid background.
- Exposes `onPositionChange(id, x, y)` callback for drag → hook update.
- Handles empty state gracefully (instruction overlay when no states).

### 3.5 `TransitionTableEditor`
**Path:** `apps/web/src/components/builder/TransitionTableEditor.tsx`

Fully editable matrix — rows = source states, columns = input symbols:
- **Mealy cells**: Two dropdowns — destination state + output symbol.
- **Moore cells**: One dropdown — destination state only (outputs shown in row header).
- Amber background highlight for missing (undefined) transitions.
- Initial state row shown with `→` prefix + cyan tint.
- Moore state output dropdowns shown in leftmost column header.

### 3.6 `MachineConfigPanel`
**Path:** `apps/web/src/components/builder/MachineConfigPanel.tsx`

Left-panel configuration UI:
- Machine name input + description textarea.
- Mealy / Moore toggle with visual indicator.
- State list with add / rename (inline edit) / delete (with confirmation) / set-initial (★).
- Input alphabet — tag-style chips with add field and ✕ removal.
- Output alphabet — same pattern.
- Moore state output assignment — dropdown per state.
- Duplicate-entry validation with inline error messages.

### 3.7 `ValidationPanel`
**Path:** `apps/web/src/components/builder/ValidationPanel.tsx`

Right-panel validation analysis:
- Status banner: **Valid** (emerald) / **Draft** (amber) / **Invalid** (rose).
- Transition completeness progress bar with percentage and fraction.
- Formal invariant checklist:
  - q₀ ∈ Q (initial state defined and in state set)
  - Deterministic (each (state, input) pair maps to exactly one destination)
  - No unreachable states detected
- Error list: `validation.issues.filter(i => i.severity === 'error')`.
- Warning list: `validation.issues.filter(i => i.severity === 'warning')`.

> **Note on `ValidationResult` shape:** The actual interface from `@automatalab/automata` uses `issues: ValidationIssue[]` with a `severity` discriminant (`'error' | 'warning'`). It does **not** expose `.errors[]` or `.warnings[]` directly. All validation display logic uses `.issues.filter(...)`.

### 3.8 `PresetSelectorModal`
**Path:** `apps/web/src/components/builder/PresetSelectorModal.tsx`

Six predefined benchmark examples (all imported from `@automatalab/automata`):

| Preset | Type | States | Description |
|---|---|---|---|
| Task 6 Mealy | Mealy | A, B | Mandatory Phase 1 benchmark (inputs: 0,1; outputs: x,y) |
| Parity Checker | Mealy | even, odd | XOR-style parity detection |
| Parity Moore | Moore | even, odd | Moore equivalent of parity checker |
| 101 Detector | Mealy | s0, s1, s2 | Overlapping pattern detector |
| 010 Detector | Moore | s0, s1, s2 | Moore pattern detector |
| 2-bit Counter | Mealy | s00, s01, s10, s11 | Modulo-4 binary counter |

### 3.9 `BuilderPage`
**Path:** `apps/web/src/pages/BuilderPage.tsx`

Top-level builder route integrating all components:
- **View modes**: Split (graph top + table bottom), graph-only, table-only — switched via toolbar.
- **Load machine**: From `?id=` query param or `location.state.machineId` on navigation.
- **Save/Update**: `api.createMachine()` for new, `api.updateMachine()` for existing; both via Phase 2 REST endpoints.
- **Unsaved-changes indicator**: Orange dot in header.
- **New machine / Reset confirmation dialogs**: Prevents accidental data loss.
- **Toast messages**: Success / failure feedback on save.
- **Navigate to Convert**: Passes machine ID to `/convert` route after save.

---

## 4. Files Created / Modified

### New Files
| File | Lines | Purpose |
|---|---|---|
| `apps/web/src/hooks/useMachineEditor.ts` | ~380 | Core editor state management |
| `apps/web/src/components/builder/StateNode.tsx` | ~95 | Custom FSM node renderer |
| `apps/web/src/components/builder/SelfLoopEdge.tsx` | ~110 | Custom FSM edge renderer |
| `apps/web/src/components/builder/AutomataGraphCanvas.tsx` | ~160 | React Flow canvas wrapper |
| `apps/web/src/components/builder/TransitionTableEditor.tsx` | ~180 | Editable transition matrix |
| `apps/web/src/components/builder/MachineConfigPanel.tsx` | ~290 | Machine configuration panel |
| `apps/web/src/components/builder/ValidationPanel.tsx` | ~130 | Live validation panel |
| `apps/web/src/components/builder/PresetSelectorModal.tsx` | ~150 | 6-preset selector modal |
| `apps/web/src/__tests__/builder.test.ts` | ~350 | 11 builder unit tests |

### Modified Files
| File | Change |
|---|---|
| `apps/web/src/pages/BuilderPage.tsx` | Replaced Phase 3 placeholder with full implementation |
| `apps/web/src/pages/TestResultsPage.tsx` | Updated test count display (14/14 web tests) |
| `apps/web/src/index.css` | Added `@import '@xyflow/react/dist/style.css'` |
| `packages/automata/package.json` | Added `"type": "module"` for Vite ESM bundling |
| `packages/contracts/package.json` | Added `"type": "module"` |
| `packages/automata/src/index.ts` | Added explicit named re-exports for all preset constants |

---

## 5. Test Results

### Builder Unit Tests (`apps/web/src/__tests__/builder.test.ts`)

All 11 tests cover pure domain logic (no React rendering, no DOM):

| # | Test | Status |
|---|---|---|
| 1 | Mealy machine initialises with correct structure | ✅ |
| 2 | Moore machine initialises with correct structure | ✅ |
| 3 | Add and delete states updates machine correctly | ✅ |
| 4 | Rename state updates transitions referencing old name | ✅ |
| 5 | Adding/removing input alphabet symbols works correctly | ✅ |
| 6 | Setting transitions populates transition table | ✅ |
| 7 | Changing initial state works correctly | ✅ |
| 8 | Missing transitions are detected by validation | ✅ |
| 9 | computeAutoLayout places N states in a circle | ✅ |
| 10 | All 6 presets pass validation | ✅ |
| 11 | Mealy to Moore conversion produces equivalent outputs | ✅ |

### Full Monorepo Test Suite

```
packages/automata : 21 tests passed
packages/contracts:  5 tests passed
apps/api          : 12 tests passed
apps/web          : 14 tests passed (3 app + 11 builder)
─────────────────────────────────────
TOTAL             : 52 tests, 0 failures
```

---

## 6. Known Limitations

### 6.1 Node Positions Not Persisted
Graph node positions are UI-only state (stored in React state, not sent to backend). The database schema does not include layout columns. On reload, `computeAutoLayout()` regenerates circular positions. This is an **intentional design decision** — automaton definitions are mathematically position-independent.

### 6.2 Bundle Size Warning
The Vite production build emits a non-fatal chunk-size warning:
```
dist/assets/index-*.js: 619.00 kB (> 500 kB recommended)
```
The oversize is caused by `@xyflow/react` being bundled into the main chunk. The build **exits with code 0** and is fully functional. Mitigation (Vite `manualChunks` to split `@xyflow/react`) is deferred to a future optimization phase.

### 6.3 No Undo/Redo
The builder does not implement an undo/redo stack. All edits are immediate. Users can reset to a preset or reload a saved machine to recover.

---

## 7. Dependency Added

| Package | Version | Reason |
|---|---|---|
| `@xyflow/react` | `^12.4.4` | Interactive FSM graph canvas (was already in package.json) |
| `@tanstack/react-query` | `^5.x` | Server state management for machine load/save |

---

## 8. Phase 4 Completion Checklist

- [x] `useMachineEditor` hook with full state management API
- [x] `StateNode` — Mealy/Moore custom node renderer (JFLAP-style)
- [x] `SelfLoopEdge` — Self-loop SVG arc renderer
- [x] `AutomataGraphCanvas` — React Flow canvas wrapper
- [x] `TransitionTableEditor` — Fully editable transition matrix
- [x] `MachineConfigPanel` — States, alphabets, type, initial state
- [x] `ValidationPanel` — Live formal invariant checker
- [x] `PresetSelectorModal` — 6 benchmark examples
- [x] `BuilderPage` — Full integration with save/load/reset
- [x] 11 builder unit tests all passing
- [x] `npm run typecheck` → exit 0
- [x] `npm run test` → 52/52 passing
- [x] `npm run build` → exit 0
- [x] `docs/PHASE_4_REPORT.md` created
- [x] `docs/DESIGN_SYSTEM.md` updated with Phase 4 components
- [x] Git commit for all Phase 4 work

---

## 9. Next Phase

**Phase 5 — Conversion Workspace** (not implemented in this phase per AGENTS.md Rule 9):
- Animated step-by-step Mealy → Moore and Moore → Mealy conversion visualization.
- Interactive conversion trace panel showing each state-splitting decision.
- Side-by-side original/converted machine graph views.
- Synchronized simulation over both machines.

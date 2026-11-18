# AutomataLab — Design System & UI Specifications

AutomataLab adopts a **developer-tool aesthetic** inspired by the technical elegance of Linear, Vercel, and React Flow, without duplicating any of them. The visual language is optimized for dense information display, high legibility of mathematical formalisms, crisp structural hierarchy, and responsive interactive state manipulation.

---

## 1. Core Principles

1. **Information Density with Breathing Room**:
   - Technical users require compact tables, visible state lists, and legible graphs.
   - Use strict 4px / 8px spacing increments; avoid excessive padding or oversized whitespace.
2. **Subtle Depth over Gratuitous Effects**:
   - No bouncy cartoon transitions or heavy glassmorphic blurs.
   - Depth is achieved with hairline 1px borders (`border-border`), subtle background shifts (`bg-muted/40`), and crisp, shallow box shadows (`shadow-sm`).
3. **Semantic Mathematical Color Palette**:
   - Colors are purposeful indicators of mathematical states, outputs, and validation status, never mere decorations.
4. **Accessible Contrast & Monospace Legibility**:
   - State labels ($q_0, s_1$), alphabet symbols ($\Sigma, \Delta$), transition tuples, and tape strings always render in clean monospace (`JetBrains Mono`, `Fira Code`, or `ui-monospace`).

---

## 2. Color Palette & Semantic Tokens

### 2.1 Theme Neutrals (Dark & Light Foundations)
| Token | Light Value | Dark Value | Purpose |
|---|---|---|---|
| `bg-background` | `#FFFFFF` | `#090A0F` | Root application canvas |
| `bg-surface` | `#F8FAFC` | `#11131A` | Cards, panels, sidebar, toolbar |
| `bg-surface-elevated` | `#FFFFFF` | `#171A24` | Dialogs, context menus, tooltips |
| `border-border` | `#E2E8F0` | `#222634` | Hairline panel and node borders |
| `border-border-subtle`| `#F1F5F9` | `#1B1E2B` | Internal cell and separator dividers |
| `text-primary` | `#0F172A` | `#F1F5F9` | Headers, primary labels, active states |
| `text-secondary` | `#475569` | `#94A3B8` | Descriptions, secondary meta, tape head |
| `text-muted` | `#94A3B8` | `#475569` | Placeholder text, inactive controls |

### 2.2 Semantic Accent Tokens
| Accent Role | Token / Hex | Context of Use |
|---|---|---|
| **Brand / Focus** | Indigo (`#6366F1`) / Blue (`#3B82F6`) | Primary buttons, active state node ring, selected row |
| **Success / Valid** | Emerald (`#10B981`) | Verified equivalence, valid machine definition, accepted string |
| **Warning / Notice** | Amber (`#F59E0B`) | Unreachable states, split state indicator, step warnings |
| **Destructive / Error** | Rose / Crimson (`#EF4444`) | Disjoint alphabet, undefined transition, invalid symbol, counterexample |
| **State Accent** | Cyan (`#06B6D4`) | Start state badge, initial node marker |
| **Output Accent** | Violet (`#8B5CF6`) | Output tape characters, Moore state output tags |

---

## 3. Typography Scale

- **Font Families**:
  - UI Sans: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `sans-serif`
  - Formal / Code: `JetBrains Mono`, `Fira Code`, `ui-monospace`, `Consolas`, `monospace`

| Style | Size | Weight | Line Height | Tracking |
|---|---|---|---|---|
| `Heading 1` | 24px (1.5rem) | 600 (Semibold) | 32px | -0.02em |
| `Heading 2` | 18px (1.125rem) | 600 (Semibold) | 24px | -0.015em |
| `Heading 3` | 14px (0.875rem) | 600 (Semibold) | 20px | -0.01em |
| `Body Base` | 14px (0.875rem) | 400 (Regular) | 20px | normal |
| `Body Small` | 12px (0.75rem) | 400 (Regular) | 16px | normal |
| `Code / Symbol` | 13px (0.8125rem) | 500 (Medium) | 18px | 0 |
| `Badge / Tag` | 11px (0.6875rem) | 600 (Semibold) | 14px | +0.02em |

---

## 4. Component Standards

### 4.1 Automata Graph Nodes (React Flow / Canvas)
- **Node Container**: Circle or rounded pill with diameter 56px–64px.
  - Border: 1.5px solid `border-border`.
  - Background: `bg-surface`.
  - When Initial: double ring or cyan accent badge `-> q0`.
- **Node Content**:
  - Moore Machine: Top half shows state ID (e.g. `q0`), subtle horizontal divider, bottom half shows output (e.g. `1`).
  - Mealy Machine: Single centered state identifier (e.g. `q0`).
- **Active Node (Simulation)**: Ring 2px `ring-indigo-500` with subtle glow.

### 4.2 Graph Edges
- **Path**: Smooth curvature or orthogonal routing with directional arrowhead.
- **Label**:
  - Mealy: `a / y` (input / output) in high-contrast pill badge with border.
  - Moore: `a` (input symbol) in compact badge.
- **Active Edge (Simulation)**: Highlighted in indigo/cyan with animated dash or glow during playback.

### 4.3 Matrix Transition Table
- **Header**: Top-left corner displays `States \ Input Alphabet`, followed by each input symbol column.
- **Cells**: Clean input fields allowing quick keyboard navigation (`Tab`, `Arrow keys`).
  - Input formatting: target state and output separated by `/` for Mealy (e.g. `q1/0`).
- **Validation Indicators**: Inline warning or error tooltip if target state is undeclared or format is invalid.

### 4.4 Simulation Tape & Stepper Controls
- **Tape Display**: Horizontal strip of discrete cells showing input symbols.
- **Tape Head**: Downward-pointing pointer over active index, with elapsed symbols highlighted and pending symbols dimmed.
- **Output Tape**: Parallel horizontal strip below, displaying generated output stream synchronously.
- **Controls**: Standard media player icons: `Reset`, `Step Back`, `Play/Pause (with speed selector)`, `Step Forward`.

### 4.5 Conversion Stepper Panel
- Discrete numbered steps:
  - Step 1: Analyze incoming transition outputs per state.
  - Step 2: Split states with multiple distinct outputs.
  - Step 3: Replicate outgoing transitions.
  - Step 4: Validate reachability and eliminate dead states.
- Each step features a short mathematical justification, visual diff, and an active sub-graph highlight.

---

## 5. UI Spacing & Layout Grid

- Base Unit: 4px.
- Spacing Scale: `2` (8px), `3` (12px), `4` (16px), `6` (24px), `8` (32px).
- Border Radius:
  - `rounded-sm`: 4px (table cells, inline code badges).
  - `rounded-md`: 6px (buttons, inputs, tooltips).
  - `rounded-lg`: 8px (cards, drawers, modal dialogs).
  - `rounded-full`: (nodes, badges, tape head indicator).

---

## 6. Implemented Phase 3 Components & Architecture

### 6.1 Theme & Design Tokens
- Managed by `ThemeProvider` (`apps/web/src/context/ThemeContext.tsx`).
- Toggles the `.dark` class on `document.documentElement` and persists preference to `localStorage['automatalab_theme']`.
- CSS custom variables defined in `apps/web/src/index.css`:
  - `--bg-background`, `--bg-surface`, `--bg-surface-elevated`, `--bg-surface-hover`
  - `--border-border`, `--border-subtle`
  - `--text-primary`, `--text-secondary`, `--text-muted`

### 6.2 Application Shell
- `AppShell`: Persistent navigation with responsive sidebar, compact header, and scrollable main content outlet.
- `Sidebar`: Collapsible sidebar navigation featuring active route indicators, Lucide icons, and status badges.
- `AppHeader`: Breadcrumb location trail, live backend connectivity badge (`useHealthQuery`), and `ThemeToggle`.
- `PageHeader`: Title, descriptive subtitle, breadcrumb navigation, and actionable header slots.

### 6.3 Shared Data & Feedback Components
- `StatusBadge`: Semantic badge system (`mealy`, `moore`, `success`, `warning`, `error`, `neutral`, `cyan`).
- `DataTable`: Generic, accessible tabular grid with column renderers, sorting slots, and empty state fallbacks.
- `EmptyState`: Clean empty state illustration with icon, title, description, and primary/secondary CTA buttons.
- `LoadingState`: Subtle animated loader with contextual message and subtext.
- `ErrorState`: Error banner with alert iconography and retry trigger.
- `ConfirmDialog`: Modal overlay with keyboard focus trapping, Escape handling, and destructive styling support.

### 6.4 Multi-Panel Workspace Foundation (`WorkspaceLayout`)
- Multi-panel responsive grid architected for future phases:
  - **Left Panel**: Machine configuration, state list, input/output alphabets, and transition matrix editor.
  - **Center Panel**: Canvas for `@xyflow/react` interactive automata graphs with zoom/pan controls.
  - **Right Panel**: Step-by-step conversion traces, state-splitting explanations, and invariant checks.
  - **Bottom Panel**: Synchronous input/output simulation tape, timeline stepper, and transition logs.


---

## 7. Phase 4 — Interactive Machine Builder Components

### 7.1 `useMachineEditor` Hook

**Path:** `apps/web/src/hooks/useMachineEditor.ts`

The canonical single source of truth for all builder state. All graph and table components derive their display from this hook and write mutations through its action methods.

**Key state:**
- `machine: MealyMachine | MooreMachine` — the formal automaton definition.
- `nodePositions: Record<string, { x: number; y: number }>` — visual-only layout positions (not persisted to DB).
- `validation: ValidationResult` — recalculated on every edit via `validateMachine()` from `@automatalab/automata`.
- `completeness: number` — 0–100% fraction of defined transitions.
- `savedId: string | null` — backend machine ID after a successful save.
- `isDirty: boolean` — true when unsaved changes exist.

**Helper export:** `computeAutoLayout(states: string[]): Record<string, { x, y }>` — places N states evenly on a radius-200 circle centred at (250, 250).

### 7.2 `StateNode`

**Path:** `apps/web/src/components/builder/StateNode.tsx`

Custom `@xyflow/react` node renderer. Variants:

| Condition | Visual |
|---|---|
| Mealy state | Single circle with centred state label |
| Moore state | Split circle — top: state ID, divider, bottom: output symbol |
| Initial state | Cyan ring + animated left-pointing arrow (JFLAP-style) |
| Selected state | Indigo/blue ring highlight |

Handles at N, S, E, W cardinal positions for clean edge routing.

**Design tokens used:** `bg-surface-elevated`, `border-border`, `accent-cyan`, `accent-blue`, `foreground`, `foreground-muted`.

### 7.3 `SelfLoopEdge`

**Path:** `apps/web/src/components/builder/SelfLoopEdge.tsx`

Custom `@xyflow/react` edge renderer:
- **Self-loops** (source === target): Upward circular SVG arc path, label centered above.
- **Regular transitions**: Standard bezier curve with midpoint label.
- **Grouped labels**: Multiple transitions between the same pair → comma-separated `symbol/output` list on one edge.
- **Selected**: Blue stroke (`accent-blue`).

### 7.4 `AutomataGraphCanvas`

**Path:** `apps/web/src/components/builder/AutomataGraphCanvas.tsx`

Wraps `<ReactFlow>` with the custom `StateNode` and `SelfLoopEdge` types:
- Converts `machine.states` → `Node[]` with stored `nodePositions`.
- Converts `machine.transitions` → grouped `Edge[]` (labels merged per source/target pair).
- Features: `fitView` on mount, `Controls`, `MiniMap`, `Background` (dot pattern).
- Empty state: instruction overlay shown when no states exist.
- Callback: `onPositionChange(id, x, y)` → `updateNodePosition` on drag.

### 7.5 `TransitionTableEditor`

**Path:** `apps/web/src/components/builder/TransitionTableEditor.tsx`

Editable transition matrix:

| Attribute | Detail |
|---|---|
| Rows | Source states (initial state shown with `→` prefix + cyan tint) |
| Columns | Input symbols |
| Mealy cell | Two dropdowns: destination state + output symbol |
| Moore cell | One dropdown: destination state only (state outputs shown in row header) |
| Missing cell | Amber background highlight (`accent-amber` tint) |

### 7.6 `MachineConfigPanel`

**Path:** `apps/web/src/components/builder/MachineConfigPanel.tsx`

Left-panel configuration:
- Machine name input + description textarea.
- Mealy / Moore type toggle (with visual indicator).
- State list: add, rename (inline edit), delete (guarded), set-initial (★ button).
- Input alphabet: chip-tag display with add field and ✕ removal.
- Output alphabet: same pattern.
- Moore state output assignment: dropdown per state.
- Duplicate detection with inline error messages.

### 7.7 `ValidationPanel`

**Path:** `apps/web/src/components/builder/ValidationPanel.tsx`

Right-panel analysis:

| Element | Detail |
|---|---|
| Status banner | Emerald = Valid, Amber = Draft (incomplete but no errors), Rose = Invalid |
| Completeness bar | Progress bar 0–100% with fraction text |
| Invariant checklist | q₀ ∈ Q, Deterministic, No unreachable states |
| Issues | Filtered from `validation.issues` by `severity === 'error'` or `'warning'` |

> **Important:** `ValidationResult` from `@automatalab/automata` exposes `issues: ValidationIssue[]` with a `severity` discriminant — not `.errors[]` / `.warnings[]`. All filtering uses `issues.filter(i => i.severity === 'error')`.

### 7.8 `PresetSelectorModal`

**Path:** `apps/web/src/components/builder/PresetSelectorModal.tsx`

Six predefined benchmark FSMs (imported from `@automatalab/automata` presets):

| Name | Type | States | Purpose |
|---|---|---|---|
| Task 6 Mealy | Mealy | A, B | Mandatory Phase 1 benchmark |
| Parity Checker | Mealy | even, odd | XOR parity detector |
| Parity Moore | Moore | even, odd | Moore parity equivalent |
| 101 Detector | Mealy | s0, s1, s2 | Overlapping pattern detection |
| 010 Detector | Moore | s0, s1, s2 | Moore pattern detection |
| 2-bit Counter | Mealy | s00–s11 | Modulo-4 binary counter |

Each card shows: type badge, state count, alphabet symbols, and transition count.

### 7.9 View Mode Layout

`BuilderPage` supports three view modes toggled via toolbar:

| Mode | Layout |
|---|---|
| `split` | Graph canvas (top 60%) + Transition table (bottom 40%) |
| `graph` | Graph canvas full area |
| `table` | Transition table full area |

The `MachineConfigPanel` occupies the left column and `ValidationPanel` the right column in all modes.


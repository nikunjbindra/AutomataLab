# AutomataLab — Agent Engineering Rules

These rules are permanent engineering guardrails for all autonomous and human contributors working on AutomataLab. Every contributor and agent session must adhere strictly to these principles across all phases of development.

---

## 1. Zero Placeholders & Regressions
- **Never replace existing working features with placeholders.**
- Stubs, `TODO`s that break functionality, commented-out logic, or mock replacements for working code are strictly forbidden.
- Refactor incrementally, ensuring existing test suites and type checks remain green at each step.

## 2. Rigorous, Non-Trivial Testing
- **Do not write fake tests or hardcoded conversion outputs.**
- Unit tests for Mealy-to-Moore and Moore-to-Mealy algorithms must test mathematically meaningful state machines (e.g., parity checkers, sequence detectors, modulo counters, edge detectors).
- Tests must assert true structural and behavioural equivalence, state transition tables, output correctness for arbitrary input strings, and proper handling of unreachable/equivalent states.
- Never write tests that simply assert hardcoded return values engineered solely to pass a mock assertion.

## 3. Pure Algorithmic Core
- **Keep automata algorithms independent of UI and database code.**
- The `packages/automata` library must be a pure, side-effect-free TypeScript package.
- It must not import React, DOM APIs, Express, Drizzle, SQLite, or network clients.
- Automata engines accept data objects and return deterministic transformation results, step-by-step conversion traces, and simulation logs.

## 4. Strict Type Safety & Expressive Domain Modeling
- **Use strict TypeScript and meaningful names.**
- `strict: true`, `noImplicitAny: true`, and strict null checks must be enabled across all packages and apps.
- No loose `any` casts or unvalidated `as unknown as T` assertions.
- Use expressive, mathematically clear domain identifiers: `states`, `alphabet`, `outputAlphabet`, `transitions`, `initialState`, `outputTable`, `MealyMachine`, `MooreMachine`. Avoid cryptic single-letter abbreviations except for standard mathematical symbols when properly contextualized.

## 5. Clean Architectural Layering (Backend)
- **Separate controllers, services, and database repositories.**
- **Controllers** (`apps/api/src/controllers`): Handle HTTP request routing, protocol parsing, and status responses.
- **Services** (`apps/api/src/services`): Coordinate business workflows, invoke pure automata transformations, and assemble domain responses.
- **Repositories** (`apps/api/src/db` / `repositories`): Manage persistence, Drizzle schema definitions, and database queries.
- Controllers must never execute direct SQL or Drizzle queries.

## 6. Strict Boundary Validation
- **Validate external input at API boundaries.**
- All incoming requests, query params, and imported files (JSON/YAML machine definitions) must be parsed through shared Zod schemas (`packages/contracts`).
- If an input fails validation, return standardized HTTP 400 responses with descriptive field-level error messages. Never let unvalidated inputs reach domain services.

## 7. Focused UI & Purposeful Aesthetics
- **Avoid oversized components and excessive visual effects.**
- Follow a clean, modern developer-tool aesthetic (inspired by Linear, Vercel, and React Flow).
- Prioritize high information density, clear typography, crisp borders, and accessible contrast over gratuitous animations, bouncy transitions, or heavy glassmorphism.
- Break UI components into modular, single-responsibility units (canvas, transition table editor, simulation stepper, export drawer).

## 8. Design System Consistency
- **Keep the existing design system consistent.**
- Use established Tailwind CSS tokens, consistent spacing (4px / 8px scale), standardized palette (slate/neutral, indigo/blue primary, emerald success, amber warning, rose error), and unified interactive states (focus rings, hover states, disabled states).
- Adhere strictly to the guidelines defined in `docs/DESIGN_SYSTEM.md`.

## 9. Disciplined Phase Scoping
- **Work only within the requested phase.**
- Do not jump ahead to build features slated for future phases (e.g., do not build full canvas simulation engines in Phase 0).
- Establish pristine prerequisites, specifications, and architecture for the current phase before declaring it complete.

## 10. Honest & Verifiable Execution
- **Never claim commands passed unless they were executed.**
- Every test run, build check, type check, migration, or lint command must be executed in the terminal and reported with its actual output and exit status.
- Report any warnings or errors transparently.

## 11. Transparent Progress Summaries
- **Summarize changed files, commands, and test results.**
- At the conclusion of every turn and phase, provide a clear structured manifest of:
  1. Files created or modified
  2. Terminal commands executed with results
  3. Known limitations or errors (if any)
  4. Exact next steps for the subsequent phase

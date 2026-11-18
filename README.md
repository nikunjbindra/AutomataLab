# AutomataLab

> An interactive educational platform and computational workbench for bidirectional **Mealy-to-Moore** and **Moore-to-Mealy** finite state machine conversion, formal equivalence verification, and step-by-step trace simulation.

---

## Overview

AutomataLab provides computer science students, educators, and researchers with a rigorous, visually refined tool to model, convert, minimize, and simulate finite state transducers (FSMs with output).

Key capabilities:
- **Bidirectional Conversions**: Deterministic Mealy-to-Moore (with state splitting and output grouping) and Moore-to-Mealy (with transition output folding) algorithms.
- **Equivalence Verification**: Product-machine BFS/DFS verification engine to prove or disprove machine equivalence and generate minimal counterexamples.
- **Step-by-Step Mathematical Explanation**: Explains every transformation stage with formal reasons and state mapping tables.
- **Interactive Simulation**: Synchronous tape stepper with active state graph and table highlights.
- **Developer-Tool Aesthetics**: Clean, dense, high-contrast visual direction inspired by Linear, Vercel, and React Flow.

---

## Monorepo Architecture

AutomataLab is organized as an npm workspaces monorepo:

```
AutomataLab/
├── apps/
│   ├── api/             # Express.js REST API with Drizzle ORM + SQLite
│   └── web/             # React 19 + TypeScript + Vite + Tailwind CSS
├── packages/
│   ├── automata/        # Pure algorithmic conversion & simulation library
│   └── contracts/       # Shared TypeScript types & Zod validation schemas
├── docs/                # Architecture, design system, and project specifications
└── AGENTS.md            # Permanent engineering guardrails
```

---

## Getting Started

### Prerequisites
- **Node.js**: >= 20.0.0 (LTS recommended)
- **npm**: >= 10.0.0

### Installation

Clone the repository and install all workspace dependencies:

```bash
git clone <repository-url>
cd automata-lab
npm install
```

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts both `apps/web` and `apps/api` in parallel development mode |
| `npm run dev:web` | Starts the Vite frontend dev server at `http://localhost:5173` |
| `npm run dev:api` | Starts the Express API dev server at `http://localhost:3001` |
| `npm run build` | Compiles contracts, automata package, frontend, and backend |
| `npm run test` | Runs the test suites across all packages using Vitest |
| `npm run typecheck` | Validates TypeScript types across the entire monorepo |
| `npm run db:generate` | Generates Drizzle ORM migration files |
| `npm run db:migrate` | Applies database migrations to local SQLite `automata.db` |
| `npm run db:studio` | Opens Drizzle Studio for database inspection |

---

## Development Proxy

The frontend (`apps/web`) development server proxies all `/api/*` calls to the backend (`http://localhost:3001/api/*`), enabling seamless local API integration without CORS friction.

---

## Engineering Rules

Permanent architectural principles and code standards are documented in [AGENTS.md](file:///c:/Users/nikun/Desktop/AUTOMATA%20PROJECT/AGENTS.md). All contributors must uphold these invariants.

---

## Documentation

- [Project Specification](file:///c:/Users/nikun/Desktop/AUTOMATA%20PROJECT/docs/PROJECT_SPEC.md)
- [System Architecture](file:///c:/Users/nikun/Desktop/AUTOMATA%20PROJECT/docs/ARCHITECTURE.md)
- [Design System & UI Specs](file:///c:/Users/nikun/Desktop/AUTOMATA%20PROJECT/docs/DESIGN_SYSTEM.md)
- [Engineering Rules](file:///c:/Users/nikun/Desktop/AUTOMATA%20PROJECT/AGENTS.md)

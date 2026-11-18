# AutomataLab — Complete Project Specification

**AutomataLab** is a specialized, modern web platform for formal languages and automata theory, focused on the bidirectional conversion, equivalence analysis, state reduction, and interactive simulation of **Mealy** and **Moore** finite state machines with output (Transducers).

---

## 1. Domain Theory & Mathematical Foundations

### 1.1 Formal Definitions

#### Mealy Machine
A Mealy machine is a 6-tuple $M_1 = (Q, \Sigma, \Delta, \delta, \lambda, q_0)$, where:
- $Q$ is a finite set of states: $\{q_0, q_1, \dots, q_{n-1}\}$
- $\Sigma$ is a finite input alphabet (e.g., $\{0, 1\}$ or $\{a, b\}$)
- $\Delta$ is a finite output alphabet (e.g., $\{0, 1\}$ or $\{x, y, z\}$)
- $\delta: Q \times \Sigma \to Q$ is the state transition function
- $\lambda: Q \times \Sigma \to \Delta$ is the output function (outputs are associated with **transitions**)
- $q_0 \in Q$ is the initial state

#### Moore Machine
A Moore machine is a 6-tuple $M_2 = (S, \Sigma, \Delta, \delta_M, \lambda_M, s_0)$, where:
- $S$ is a finite set of states: $\{s_0, s_1, \dots, s_{m-1}\}$
- $\Sigma$ is a finite input alphabet
- $\Delta$ is a finite output alphabet
- $\delta_M: S \times \Sigma \to S$ is the state transition function
- $\lambda_M: S \to \Delta$ is the output function (outputs are associated with **states**)
- $s_0 \in S$ is the initial state

### 1.2 Equivalence & The Length Disparity
For any input string $w = a_1 a_2 \dots a_k \in \Sigma^*$ ($|w| = k$):
- **Mealy output**: Generates a string of length $k$, where the $i$-th symbol is emitted synchronously with the transition caused by $a_i$.
- **Moore output**: Emits an initial output $\lambda_M(s_0)$ at time $t=0$ before any input is consumed, resulting in an output string of length $k+1$.
- **Equivalence Convention**: A Mealy machine $M_1$ and a Moore machine $M_2$ are equivalent if for every input string $w \in \Sigma^*$, the output of $M_2$ on $w$ is $\lambda_M(s_0) \cdot \text{output}(M_1, w)$ (or $\text{output}(M_1, w)$ matches the suffix of $\text{output}(M_2, w)$ of length $|w|$). AutomataLab provides explicit visual and mathematical explanations of this initial output difference.

---

## 2. Core Functional Requirements

### 2.1 Mealy-to-Moore Conversion Algorithm
1. **State-Output Association Inspection**: For each Mealy state $q \in Q$, collect the set of incoming outputs:
   $$\text{InOutputs}(q) = \{\lambda(p, a) \mid p \in Q, a \in \Sigma, \delta(p, a) = q\}$$
2. **State Splitting**:
   - If $|\text{InOutputs}(q)| \le 1$ and $q \ne q_0$, map $q$ directly to $(q, y)$ where $y \in \text{InOutputs}(q)$ (or a designated default output if $\text{InOutputs}(q) = \emptyset$).
   - If $|\text{InOutputs}(q)| = k > 1$, split state $q$ into $k$ distinct Moore states: $q_{y_1}, q_{y_2}, \dots, q_{y_k}$.
   - If $q = q_0$ and has incoming transitions with outputs different from an assumed initial state output, an extra initial state $q_{0, \text{init}}$ is maintained.
3. **Transition Duplication**:
   - For every split state $(q, y)$ and every input $a \in \Sigma$:
     $$\delta_M((q, y), a) = (\delta(q, a), \lambda(q, a))$$
   - Each clone retains the exact outgoing transition targets determined by the original Mealy machine.
4. **Step-by-Step Explanation Generation**: The algorithm outputs an array of discrete conversion steps with detailed narrative reasons:
   - Analysis of incoming outputs per state
   - State creation and clone identification
   - Transition wiring
   - Reachability analysis and cleanup of dead/unreachable states

### 2.2 Moore-to-Mealy Conversion Algorithm
1. **State Preservation**: The set of states can be mapped directly: $Q_{\text{Mealy}} = S_{\text{Moore}}$, with initial state $q_0 = s_0$.
2. **Output Transition Folding**:
   - For every state $s \in S$ and input symbol $a \in \Sigma$:
     $$\delta(s, a) = \delta_M(s, a)$$
     $$\lambda(s, a) = \lambda_M(\delta_M(s, a))$$
   - The Mealy transition output is directly assigned the output associated with the destination Moore state.
3. **State Minimization (Optional / Integrated)**: Following conversion, Moore-to-Mealy often creates equivalent states that can be merged. The engine runs state equivalence minimization.

### 2.3 Equivalence Verification Engine
- Verifies whether two machines (Mealy-Mealy, Moore-Moore, or Mealy-Moore) compute the exact same function.
- Constructs the product machine / paired state exploration using BFS/DFS.
- Validates output agreement for all reachable state pairs.
- In case of non-equivalence, synthesizes a minimal counterexample input string $w$ demonstrating differing outputs.

### 2.4 Trace Simulation & Step Stepper
- Real-time and stepped playback for any input sequence $w \in \Sigma^*$.
- Synchronous comparison mode: run the original machine and the converted machine side-by-side on the same input tape.
- Display tape head position, active state highlight on graph, active row in transition table, and growing output tape.

### 2.5 Machine Presets Library
Bundled standard reference machines for demonstration, student learning, and verification:
- **Serial Binary Adder** (Mealy vs. Moore with carry state)
- **Sequence Detectors**:
  - `101` overlapping and non-overlapping sequence detectors
  - `0110` packet frame delimiter detector
- **Even/Odd Parity Generators** (with reset)
- **Modulo Counters**: Mod-3 and Mod-4 counter with rollover indicator
- **Vending Machine Controller**: Inputs {5c, 10c, 25c}, dispensing output {Item, ReturnChange}
- **Manchester / NRZ Line Encoder**: Digital communication signal converter

---

## 3. Architecture & Data Contracts

### 3.1 Workspace Structure
```
AutomataLab/
├── apps/
│   ├── api/             # Express.js REST API + SQLite/Drizzle persistence
│   └── web/             # React + Vite + Tailwind CSS + @xyflow/react
├── packages/
│   ├── automata/        # Pure algorithmic engine (Mealy/Moore math, step traces)
│   └── contracts/       # Zod schemas, TypeScript types, validation contracts
├── docs/                # Architecture, design system, project specifications
├── .gitignore
├── .env.example
├── AGENTS.md
├── package.json
└── README.md
```

### 3.2 Data Contracts (Shared via `packages/contracts`)
- `MachineType`: `'mealy' | 'moore'`
- `MealyMachineSchema`: State list, alphabet, output alphabet, transition table $\delta(q, a) \to (p, y)$, initial state.
- `MooreMachineSchema`: State list, alphabet, output alphabet, transition table $\delta(s, a) \to p$, state output mapping $\lambda(s) \to y$, initial state.
- `ConversionRequestSchema` & `ConversionResponseSchema`: Source machine definition, target type, conversion step trace, resulting machine, equivalence verdict.
- `SimulationRequestSchema` & `SimulationResponseSchema`: Input tape string, step-by-step trace showing current state, transition traversed, emitted symbol, and cumulative tape.

---

## 4. UI / UX Specifications
- **Canvas / Diagram View**: Directed graphs with clear node states and edge labels (`a / y` for Mealy, `a` for Moore, node labeled with `state / output`).
- **Interactive Transition Table**: Editable matrix supporting keyboard navigation and real-time validation warnings (missing transitions, undefined states, disjoint alphabets).
- **Conversion Stepper Panel**: Step forward/back through the mathematical conversion procedure with algorithmic explanations.
- **Diff & Equivalence Inspector**: Visual side-by-side comparison of original vs. converted machine.
- **Export & Import**: Instant export to JSON, Graphviz DOT, LaTeX TikZ table and diagram, and SVG image.

---

## 5. Non-Functional Requirements
- **Deterministic & Pure Core**: Core algorithms have 100% deterministic outputs with zero side effects.
- **Performance**: Conversions for machines with up to 100 states complete in under 50ms in browser or backend.
- **Reliability & Test Coverage**: 100% unit test coverage for pure conversion algorithms, property-based tests for bidirectional conversion identity, and API contract validation tests.

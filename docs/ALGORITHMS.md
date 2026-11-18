# AutomataLab — Algorithmic Conversion & Verification Reference

This document outlines the formal mathematical definitions, conversion algorithms, state-splitting mechanisms, simulation semantics, and equivalence verification proofs implemented in `@automatalab/automata`.

---

## 1. Formal Mathematical Definitions

Finite state machines with output (transducers) transform an input sequence $w = a_1 a_2 \dots a_k \in \Sigma^*$ into an output sequence $y \in \Delta^*$.

### 1.1 Mealy Machine
A deterministic, complete Mealy machine is a 6-tuple:
$$M_1 = (Q, \Sigma, \Delta, \delta, \lambda, q_0)$$
where:
- $Q = \{q_0, q_1, \dots, q_{n-1}\}$ is a finite set of states.
- $\Sigma$ is a finite input alphabet.
- $\Delta$ is a finite output alphabet.
- $\delta: Q \times \Sigma \to Q$ is the state transition function.
- $\lambda: Q \times \Sigma \to \Delta$ is the transition output function.
- $q_0 \in Q$ is the designated initial state.

### 1.2 Moore Machine
A deterministic, complete Moore machine is a 6-tuple:
$$M_2 = (S, \Sigma, \Delta, \delta_M, \lambda_M, s_0)$$
where:
- $S = \{s_0, s_1, \dots, s_{m-1}\}$ is a finite set of states.
- $\Sigma$ is a finite input alphabet.
- $\Delta$ is a finite output alphabet (which may include the non-emitting marker $\varepsilon$).
- $\delta_M: S \times \Sigma \to S$ is the state transition function.
- $\lambda_M: S \to \Delta$ is the state output function.
- $s_0 \in S$ is the designated initial state.

---

## 2. The Initial-Output Alignment Invariant

A fundamental distinction between Mealy and Moore machines is the length and timing of output emission:
- **Mealy Machine**: Outputs are emitted **synchronously with transitions**. Upon consuming an input string $w$ of length $k = |w|$, exactly $k$ output symbols are produced. For the empty string $\epsilon$, $|M_1(\epsilon)| = 0$.
- **Moore Machine**: Outputs are emitted **upon state residency**. At time $t=0$, before any input symbol is read, the Moore machine resides in initial state $s_0$ and emits $\lambda_M(s_0)$. Consuming $k$ input symbols triggers $k$ transitions and emits $k+1$ output symbols.

### 2.1 Formal Alignment Convention
A Mealy machine $M_1$ and a Moore machine $M_2$ are equivalent if and only if for every input sequence $w \in \Sigma^*$:
$$\text{output}(M_2, w) = \lambda_M(s_0) \cdot \text{output}(M_1, w)$$

When the synthetic initial state $S$ is assigned the non-emitting output $\varepsilon$, dropping the leading $\varepsilon$ produces an exact character-by-character match:
$$\text{aligned\_output}(M_2, w) = \text{suffix}(\text{output}(M_2, w), |w|) \equiv \text{output}(M_1, w)$$

---

## 3. Mealy-to-Moore Conversion Algorithm

### 3.1 State Splitting Principle
In a Mealy machine, transitions entering state $q$ may carry different output symbols. In a Moore machine, output depends strictly on the state. Consequently, state $q$ must be partitioned into multiple clones:
$$\text{IncomingOutputs}(q) = \{\lambda(p, a) \mid p \in Q, a \in \Sigma, \delta(p, a) = q\}$$

For each distinct output symbol $y \in \text{IncomingOutputs}(q)$, create a state $q_y$ with $\lambda_M(q_y) = y$.

### 3.2 Conversion Pseudocode
```text
Algorithm ConvertMealyToMoore(M = (Q, Σ, Δ, δ, λ, q_0)):
  1. Validate M (verify determinism, state existence, alphabet closure).
  2. For each q in Q:
       InOutputs(q) = { λ(p, a) | p ∈ Q, a ∈ Σ, δ(p, a) = q }
  3. S_new = ∅
     stateOutputs = {}
     For each q in Q:
       If InOutputs(q) == ∅:
         stateName = q + "_" + Δ[0]
         S_new.add(stateName)
         stateOutputs[stateName] = Δ[0]
       Else:
         For each y in InOutputs(q):
           stateName = q + "_" + y
           S_new.add(stateName)
           stateOutputs[stateName] = y

  4. Create synthetic initial state S with stateOutputs[S] = ε
     S_new.add(S)

  5. Construct Moore transitions δ_M:
       // Outgoing from synthetic initial state S
       For each a in Σ:
         target = δ(q_0, a)
         output = λ(q_0, a)
         δ_M(S, a) = target + "_" + output

       // Outgoing from split states
       For each state q_y in S_new \ {S}:
         origState = q
         For each a in Σ:
           target = δ(origState, a)
           output = λ(origState, a)
           δ_M(q_y, a) = target + "_" + output

  6. Compute reachable states R from S via BFS.
     Prune S_new and δ_M to states in R.
  7. Return M_Moore = (S_new, Σ, Δ ∪ {ε}, δ_M, stateOutputs, S)
```

### 3.3 Complexity
- **Time Complexity**: $\mathcal{O}(|Q| \cdot |\Sigma| + |S_{\text{new}}| \cdot |\Sigma|)$. Since $|S_{\text{new}}| \le |Q| \cdot |\Delta| + 1$, the worst-case time is $\mathcal{O}(|Q| \cdot |\Delta| \cdot |\Sigma|)$.
- **Space Complexity**: $\mathcal{O}(|Q| \cdot |\Delta| \cdot |\Sigma|)$ for the new transition and output tables.

---

## 4. Moore-to-Mealy Conversion Algorithm

### 4.1 Transition Output Folding
Moore-to-Mealy conversion preserves the state set and state transition structure directly. For every state $s \in S$ and input symbol $a \in \Sigma$, if $\delta_M(s, a) = s'$, the Mealy transition output is the output of the destination state $s'$:
$$\lambda(s, a) = \lambda_M(\delta_M(s, a))$$

### 4.2 Conversion Pseudocode
```text
Algorithm ConvertMooreToMealy(M = (S, Σ, Δ, δ_M, λ_M, s_0)):
  1. Validate M.
  2. Q = S
     q_0 = s_0
     Transitions = []
  3. For each s in S:
       For each a in Σ:
         dest = δ_M(s, a)
         out = λ_M(dest)
         Transitions.append((from: s, input: a, to: dest, output: out))
  4. Return M_Mealy = (Q, Σ, Δ \ {ε}, δ_M, Transitions, q_0)
```

### 4.3 Complexity
- **Time Complexity**: $\mathcal{O}(|S| \cdot |\Sigma|)$.
- **Space Complexity**: $\mathcal{O}(|S| \cdot |\Sigma|)$ for the transition table.

---

## 5. Equivalence Verification Engine

AutomataLab provides two distinct verification engines:

### 5.1 Bounded Exhaustive Testing
- Systematically generates all sequences $w \in \Sigma^*$ up to length $D$.
- Simulates both machines and checks $\text{output}(M_1, w) \equiv \text{aligned\_output}(M_2, w)$.
- If a mismatch occurs, immediately halts and returns the counterexample input sequence.
- **Limitation**: Only guarantees equivalence for inputs with length $\le D$; does not constitute a formal proof of infinite equivalence.

### 5.2 Product-Machine State Exploration (Formal Proof)
For two deterministic complete transducers $M_A$ and $M_B$, behavioral equivalence over all infinite strings is decidable by exploring the reachable state pairs in the product state space $Q_A \times Q_B$:
1. Initialize queue with the initial state pair $(q_{0A}, q_{0B})$.
2. While queue is not empty:
   - Dequeue state pair $(u, v)$ with history path $w$.
   - For each input symbol $a \in \Sigma$:
     - Compute next state $u' = \delta_A(u, a)$ and output $y_A$.
     - Compute next state $v' = \delta_B(v, a)$ and output $y_B$.
     - **Equivalence Invariant**:
       - Mealy vs Mealy: $y_A = \lambda_A(u, a)$, $y_B = \lambda_B(v, a)$. Check $y_A == y_B$.
       - Mealy vs Moore: $y_A = \lambda_A(u, a)$, $y_B = \lambda_{M_B}(v')$. Check $y_A == y_B$.
       - Moore vs Moore: $y_A = \lambda_{M_A}(u')$, $y_B = \lambda_{M_B}(v')$. Check $y_A == y_B$.
     - If outputs differ: **minimal counterexample** found: $w \cdot a$.
     - If pair $(u', v')$ has not been visited, mark as visited and enqueue $(u', v', w \cdot a)$.
3. If BFS terminates with all reachable pairs satisfied, mathematical induction proves that no distinguishing sequence exists in $\Sigma^*$.

---

## 6. Worked Example: Mandatory Reference Benchmark

### Source Mealy Machine
- States: $\{A, B\}$, Initial: $A$
- Inputs: $\{0, 1\}$, Outputs: $\{x, y\}$
- Transitions:
  - $A \xrightarrow{0 / x} A$
  - $A \xrightarrow{1 / y} B$
  - $B \xrightarrow{0 / y} A$
  - $B \xrightarrow{1 / x} B$

### Conversion Steps
1. **Incoming Outputs Analysis**:
   - State $A$: entered by $(A, 0 \to x)$ and $(B, 0 \to y)$. Incoming outputs: $\{x, y\}$.
   - State $B$: entered by $(A, 1 \to y)$ and $(B, 1 \to x)$. Incoming outputs: $\{x, y\}$.
2. **State Splitting**:
   - $A \to A_x$ (output $x$), $A_y$ (output $y$)
   - $B \to B_x$ (output $x$), $B_y$ (output $y$)
   - Synthetic initial state: $S$ (output $\varepsilon$)
3. **Transition Reconstruction**:
   - From $S$: $0 \to A_x$, $1 \to B_y$
   - From $A_x$: $0 \to A_x$, $1 \to B_y$
   - From $A_y$: $0 \to A_x$, $1 \to B_y$
   - From $B_x$: $0 \to A_y$, $1 \to B_x$
   - From $B_y$: $0 \to A_y$, $1 \to B_x$
4. **Reachability**: All 5 states are reachable from $S$.

### Simulation on Input `1100`:
- **Mealy Trace**:
  $A \xrightarrow{1/y} B \xrightarrow{1/x} B \xrightarrow{0/y} A \xrightarrow{0/x} A$
  Output tape: `y x y x`
- **Moore Trace**:
  $S/\varepsilon \xrightarrow{1} B_y/y \xrightarrow{1} B_x/x \xrightarrow{0} A_y/y \xrightarrow{0} A_x/x$
  Output tape: `ε y x y x`
- **Aligned Comparison**:
  Dropping initial $\varepsilon$ yields `y x y x` $\equiv$ `y x y x`.

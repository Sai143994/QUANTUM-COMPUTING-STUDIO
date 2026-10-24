/**
 * Quantum Studio — Algorithms, Presets, Pseudocode, and Speed Quiz Datasets
 */
import { GateOp } from '../types/quantum';

export interface AlgorithmQuery {
  classical: string;
  classicalN: number;
  quantum: string;
  quantumN: number;
  speedup: string;
  speedupClass: 'exp' | 'quad' | 'lin' | 'none';
  speedupType: string;
}

export interface PseudocodeLine {
  t: 'kw' | 'fn' | 'cm' | 'm';
  s: string;
  r?: string;
  i?: number;
}

export interface AlgorithmDetail {
  bigO_c: string;
  bigO_q: string;
  sType: 'exponential' | 'quadratic' | 'linear' | 'qualitative';
  sLabel: string;
  cFn: (n: number) => number | null;
  qFn: (n: number) => number;
  cLbl: (n: number) => string;
  qLbl: (n: number) => string;
  tableType: 'scaling' | 'none';
  tableCols?: string[];
  desc: string;
  pseudo: PseudocodeLine[];
}

export interface AlgorithmItem {
  id: string;
  name: string;
  tag: string;
  desc: string;
  gates: GateOp[];
  queries: AlgorithmQuery;
  detail: AlgorithmDetail;
}

export interface SpeedQuizQuestion {
  q: string;
  hint: string;
  cLabel: string;
  cWork: string;
  cAnswer: string;
  cVal: number;
  qLabel: string;
  qWork: string;
  qAnswer: string;
  qVal: number;
  verdict: string;
}

export const ALGORITHMS: AlgorithmItem[] = [
  {
    id: 'bell',
    name: 'Bell State (EPR Pair)',
    tag: 'ENTANGLEMENT',
    desc: 'Creates a maximally entangled 2-qubit pair (|00⟩ + |11⟩)/√2 with zero classical equivalent',
    gates: [
      { type: 'H', qubit: 0, step: 0 },
      { type: 'CNOT', control: 0, target: 1, step: 1 }
    ],
    queries: {
      classical: 'O(N)',
      classicalN: 100,
      quantum: 'O(1)',
      quantumN: 1,
      speedup: 'Qualitative',
      speedupClass: 'exp',
      speedupType: 'Qualitative Advantage'
    },
    detail: {
      bigO_c: 'N/A',
      bigO_q: 'O(1)',
      sType: 'qualitative',
      sLabel: 'Classically Impossible',
      cFn: () => null,
      qFn: () => 2,
      cLbl: () => 'Impossible without shared hidden variable',
      qLbl: () => '2 physical gates (H + CNOT)',
      tableType: 'none',
      desc: 'Creates maximally entangled EPR pair (|00⟩+|11⟩)/√2 — violates Bell inequalities and has no local hidden variable model',
      pseudo: [
        { t: 'cm', s: '// Prepare maximally entangled Bell pair |Φ+⟩' },
        { t: 'kw', s: 'INPUT:  ', r: '|00⟩  (both qubits in ground state)' },
        { t: 'kw', s: 'STEP 1: ', r: 'H(q[0])  — Hadamard creates superposition' },
        { t: 'm', s: '        → (|0⟩+|1⟩)/√2 ⊗ |0⟩', i: 1 },
        { t: 'kw', s: 'STEP 2: ', r: 'CNOT(control=q[0], target=q[1])' },
        { t: 'm', s: '        → (|00⟩+|11⟩)/√2  [Bell State]', i: 1 },
        { t: 'fn', s: 'RESULT: ', r: 'P(|00⟩)=50%  P(|11⟩)=50%  P(others)=0%' },
        { t: 'cm', s: '// Measuring q[0] instantly collapses q[1]' },
        { t: 'm', s: 'S(ρ₀) = S(ρ₁) = 1.0 bit  [Maximal Entanglement]' }
      ]
    }
  },
  {
    id: 'ghz',
    name: 'GHZ State (Multipartite)',
    tag: 'MULTI-ENTANGLE',
    desc: 'Greenberger–Horne–Zeilinger 3-qubit state (|000⟩ + |111⟩)/√2',
    gates: [
      { type: 'H', qubit: 0, step: 0 },
      { type: 'CNOT', control: 0, target: 1, step: 1 },
      { type: 'CNOT', control: 0, target: 2, step: 2 }
    ],
    queries: {
      classical: 'O(2ⁿ)',
      classicalN: 100,
      quantum: 'O(n)',
      quantumN: 3,
      speedup: 'Exponential',
      speedupClass: 'exp',
      speedupType: 'Exponential'
    },
    detail: {
      bigO_c: 'O(2ⁿ)',
      bigO_q: 'O(n)',
      sType: 'exponential',
      sLabel: 'Exponential Scaling Advantage',
      cFn: n => 1 << n,
      qFn: n => n,
      cLbl: n => `2^${n} = ${1 << n} correlated states`,
      qLbl: n => `n = ${n} gate operations`,
      tableType: 'scaling',
      tableCols: ['n Qubits', 'Classical 2ⁿ States', 'Quantum n Gates', 'Speedup Ratio'],
      desc: 'Multipartite entanglement across all n qubits simultaneously, demonstrating non-local quantum correlations',
      pseudo: [
        { t: 'cm', s: '// n-qubit multipartite entanglement' },
        { t: 'kw', s: 'STEP 1: ', r: 'H(q[0])  — Superpose root qubit' },
        { t: 'kw', s: 'STEP 2: ', r: 'FOR i = 0 to n−2:' },
        { t: 'fn', s: '  CNOT(ctrl=q[i], tgt=q[i+1])', i: 1 },
        { t: 'cm', s: '  // Entanglement cascades through register', i: 1 },
        { t: 'm', s: '|GHZ⟩ = (|0…0⟩ + |1…1⟩)/√2' }
      ]
    }
  },
  {
    id: 'qft4',
    name: 'Quantum Fourier Transform (QFT-4)',
    tag: 'TRANSFORM',
    desc: '4-qubit Quantum Fourier Transform with controlled-phase ladder and swap networks',
    gates: [
      { type: 'H', qubit: 0, step: 0 },
      { type: 'CP', control: 1, target: 0, angle: Math.PI / 2, step: 1 },
      { type: 'CP', control: 2, target: 0, angle: Math.PI / 4, step: 2 },
      { type: 'CP', control: 3, target: 0, angle: Math.PI / 8, step: 3 },
      { type: 'H', qubit: 1, step: 4 },
      { type: 'CP', control: 2, target: 1, angle: Math.PI / 2, step: 5 },
      { type: 'CP', control: 3, target: 1, angle: Math.PI / 4, step: 6 },
      { type: 'H', qubit: 2, step: 7 },
      { type: 'CP', control: 3, target: 2, angle: Math.PI / 2, step: 8 },
      { type: 'H', qubit: 3, step: 9 },
      { type: 'SWAP', q1: 0, q2: 3, step: 10 },
      { type: 'SWAP', q1: 1, q2: 2, step: 11 }
    ],
    queries: {
      classical: 'O(N·logN)',
      classicalN: 64,
      quantum: 'O(n²)',
      quantumN: 16,
      speedup: '~4× (n=4)',
      speedupClass: 'exp',
      speedupType: 'Exponential'
    },
    detail: {
      bigO_c: 'O(N·logN)',
      bigO_q: 'O(n²)',
      sType: 'exponential',
      sLabel: 'Exponential Speedup vs FFT',
      cFn: n => (1 << n) * n,
      qFn: n => n * n,
      cLbl: n => `N·log₂N = ${(1 << n) * n} operations`,
      qLbl: n => `n² = ${n * n} gates`,
      tableType: 'scaling',
      tableCols: ['n Qubits', 'Classical FFT', 'Quantum QFT (n²)', 'Speedup'],
      desc: 'Transforms computational basis into phase basis in O(n²) operations compared to classical O(2ⁿ·n) FFT',
      pseudo: [
        { t: 'cm', s: '// QFT|j⟩ = (1/√N) Σ_{k=0}^{N-1} e^{2πijk/N}|k⟩' },
        { t: 'kw', s: 'FOR ', r: 'j = n−1 downto 0:' },
        { t: 'fn', s: '  H(q[j])', i: 1 },
        { t: 'kw', s: '  FOR ', r: 'k = j−1 downto 0:', i: 1 },
        { t: 'fn', s: '    CP(π/2^(j−k), ctrl=q[k], tgt=q[j])', i: 2 },
        { t: 'kw', s: 'REVERSAL: ', r: 'SWAP(q[i], q[n−1−i]) for i < n/2' }
      ]
    }
  },
  {
    id: 'grover',
    name: "Grover's Search Algorithm",
    tag: 'SEARCH',
    desc: 'Quadratic amplitude amplification to locate an unstructured marked element in √N steps',
    gates: [
      { type: 'H', qubit: 0, step: 0 },
      { type: 'H', qubit: 1, step: 0 },
      { type: 'X', qubit: 0, step: 1 },
      { type: 'X', qubit: 1, step: 1 },
      { type: 'H', qubit: 1, step: 2 },
      { type: 'CNOT', control: 0, target: 1, step: 3 },
      { type: 'H', qubit: 1, step: 4 },
      { type: 'X', qubit: 0, step: 5 },
      { type: 'X', qubit: 1, step: 5 },
      { type: 'H', qubit: 0, step: 6 },
      { type: 'H', qubit: 1, step: 6 }
    ],
    queries: {
      classical: 'O(N)',
      classicalN: 100,
      quantum: 'O(√N)',
      quantumN: 10,
      speedup: '√N ×',
      speedupClass: 'quad',
      speedupType: 'Quadratic'
    },
    detail: {
      bigO_c: 'O(N)',
      bigO_q: 'O(√N)',
      sType: 'quadratic',
      sLabel: 'Quadratic Search Speedup',
      cFn: n => 1 << n,
      qFn: n => Math.max(1, Math.round((Math.sqrt(1 << n) * Math.PI) / 4)),
      cLbl: n => `N = ${1 << n} items checked`,
      qLbl: n => `⌊π√N/4⌋ = ${Math.max(1, Math.round((Math.sqrt(1 << n) * Math.PI) / 4))} iterations`,
      tableType: 'scaling',
      tableCols: ['n Qubits', 'Classical Linear', 'Grover Queries', 'Speedup'],
      desc: 'Optimal quantum search in an unstructured database of size N = 2ⁿ in O(√N) oracle evaluations',
      pseudo: [
        { t: 'm', s: 'N = 2ⁿ, k = ⌊π·√N / 4⌋ iterations' },
        { t: 'kw', s: 'INIT:   ', r: 'H^⊗n|0⟩ → uniform superposition |s⟩' },
        { t: 'kw', s: 'REPEAT ', r: 'k times:' },
        { t: 'fn', s: '  Oracle: U_f|x⟩ = −|x⟩ if marked, +|x⟩ otherwise', i: 1 },
        { t: 'fn', s: '  Diffuser: 2|s⟩⟨s| − I (reflection about average)', i: 1 },
        { t: 'm', s: 'P(target) = sin²((2k+1)·arcsin(1/√N)) ≈ 100%' }
      ]
    }
  },
  {
    id: 'teleport',
    name: 'Quantum State Teleportation',
    tag: 'PROTOCOL',
    desc: 'Transfers unknown qubit state using pre-shared entanglement and 2 classical bits',
    gates: [
      { type: 'H', qubit: 0, step: 0 },
      { type: 'Ry', qubit: 2, step: 0 },
      { type: 'CNOT', control: 0, target: 1, step: 1 },
      { type: 'CNOT', control: 2, target: 0, step: 2 },
      { type: 'H', qubit: 2, step: 3 },
      { type: 'M', qubit: 0, step: 4 },
      { type: 'M', qubit: 2, step: 4 }
    ],
    queries: {
      classical: 'Impossible',
      classicalN: 100,
      quantum: '2 cbits + EPR',
      quantumN: 2,
      speedup: 'Qualitative',
      speedupClass: 'exp',
      speedupType: 'Qualitative'
    },
    detail: {
      bigO_c: '∞ (No-Cloning)',
      bigO_q: '2 Classical Bits',
      sType: 'qualitative',
      sLabel: 'Classically Impossible',
      cFn: () => null,
      qFn: () => 2,
      cLbl: () => 'Infinite continuous classical parameters',
      qLbl: () => '2 classical bits transmitted',
      tableType: 'none',
      desc: 'Transmits an arbitrary quantum state without measuring it, destroying the original state in compliance with the no-cloning theorem',
      pseudo: [
        { t: 'kw', s: 'PARTIES: ', r: 'Alice (q0, q2), Bob (q1)' },
        { t: 'kw', s: 'SETUP:   ', r: 'Alice & Bob share Bell pair on (q0, q1)' },
        { t: 'kw', s: 'ALICE:   ', r: 'Prepares unknown |ψ⟩ on q2' },
        { t: 'fn', s: '  Bell measurement on (q2, q0)', i: 1 },
        { t: 'cm', s: '  Transmits 2 classical bits (m0, m1) to Bob', i: 1 },
        { t: 'kw', s: 'BOB:     ', r: 'Applies X^m0 · Z^m1 to reconstruct |ψ⟩ exactly' }
      ]
    }
  },
  {
    id: 'deutsch_jozsa',
    name: 'Deutsch–Jozsa Algorithm',
    tag: 'ORACLE',
    desc: 'Determines whether a hidden function is constant or balanced in exactly 1 quantum query',
    gates: [
      { type: 'X', qubit: 2, step: 0 },
      { type: 'H', qubit: 0, step: 1 },
      { type: 'H', qubit: 1, step: 1 },
      { type: 'H', qubit: 2, step: 1 },
      { type: 'CNOT', control: 0, target: 2, step: 2 },
      { type: 'CNOT', control: 1, target: 2, step: 3 },
      { type: 'H', qubit: 0, step: 4 },
      { type: 'H', qubit: 1, step: 4 }
    ],
    queries: {
      classical: 'O(2ⁿ⁻¹+1)',
      classicalN: 100,
      quantum: 'O(1)',
      quantumN: 1,
      speedup: '2ⁿ⁻¹ ×',
      speedupClass: 'exp',
      speedupType: 'Exponential'
    },
    detail: {
      bigO_c: 'O(2ⁿ⁻¹+1)',
      bigO_q: 'O(1)',
      sType: 'exponential',
      sLabel: 'Exponential Query Advantage',
      cFn: n => (1 << (n - 1)) + 1,
      qFn: () => 1,
      cLbl: n => `2^${n - 1}+1 = ${(1 << (n - 1)) + 1} queries`,
      qLbl: () => '1 quantum query',
      tableType: 'scaling',
      tableCols: ['n Inputs', 'Classical Queries', 'Quantum Query', 'Speedup'],
      desc: 'First separation proving quantum polynomial time beats classical deterministic algorithms exponentially on black-box oracles',
      pseudo: [
        { t: 'cm', s: '// f:{0,1}ⁿ→{0,1} is either CONSTANT or BALANCED' },
        { t: 'kw', s: 'INPUT:  ', r: 'n input qubits |0⟩^⊗n + 1 ancilla |1⟩' },
        { t: 'kw', s: 'STEP 1: ', r: 'H^⊗(n+1) on all qubits' },
        { t: 'kw', s: 'STEP 2: ', r: 'Oracle Uf: |x⟩|y⟩ → |x⟩|y ⊕ f(x)⟩' },
        { t: 'kw', s: 'STEP 3: ', r: 'H^⊗n on input register' },
        { t: 'fn', s: 'MEASURE:', r: 'If all zeros → CONSTANT; otherwise BALANCED' }
      ]
    }
  },
  {
    id: 'superpos',
    name: 'Full Superposition (Hadamard Wall)',
    tag: 'FUNDAMENTAL',
    desc: 'Places all register qubits into uniform superposition of 2ⁿ computational states',
    gates: [
      { type: 'H', qubit: 0, step: 0 },
      { type: 'H', qubit: 1, step: 0 },
      { type: 'H', qubit: 2, step: 0 },
      { type: 'H', qubit: 3, step: 0 }
    ],
    queries: {
      classical: 'O(2ⁿ)',
      classicalN: 100,
      quantum: 'O(n)',
      quantumN: 4,
      speedup: '2ⁿ/n ×',
      speedupClass: 'exp',
      speedupType: 'Exponential'
    },
    detail: {
      bigO_c: 'O(2ⁿ)',
      bigO_q: 'O(n)',
      sType: 'exponential',
      sLabel: 'Parallel State Generation',
      cFn: n => 1 << n,
      qFn: n => n,
      cLbl: n => `2^${n} = ${1 << n} state values`,
      qLbl: n => `n = ${n} gates`,
      tableType: 'scaling',
      tableCols: ['n Qubits', 'Classical Amplitudes', 'Quantum Gates', 'Ratio'],
      desc: 'Applies Hadamard gates in parallel to generate a state with equal probability 1/2ⁿ across every possible bitstring',
      pseudo: [
        { t: 'kw', s: 'FOR ', r: 'i = 0 to n−1: H(q[i])' },
        { t: 'm', s: '|s⟩ = (1/√2ⁿ) Σ_{x∈{0,1}ⁿ} |x⟩' },
        { t: 'cm', s: '// Von Neumann Entropy achieves maximum: S = n bits' }
      ]
    }
  },
  {
    id: 'random',
    name: 'Quantum Random Walk',
    tag: 'QUANTUM-WALK',
    desc: 'Quantum random walk exhibiting ballistic spreading (σ ∝ t) instead of classical diffusion (σ ∝ √t)',
    gates: [
      { type: 'H', qubit: 0, step: 0 },
      { type: 'CNOT', control: 0, target: 1, step: 1 },
      { type: 'H', qubit: 1, step: 2 },
      { type: 'CNOT', control: 1, target: 2, step: 3 },
      { type: 'H', qubit: 2, step: 4 }
    ],
    queries: {
      classical: 'σ ∝ √t',
      classicalN: 55,
      quantum: 'σ ∝ t',
      quantumN: 10,
      speedup: '√t ×',
      speedupClass: 'quad',
      speedupType: 'Quadratic Spreading'
    },
    detail: {
      bigO_c: 'σ = √t',
      bigO_q: 'σ = t',
      sType: 'quadratic',
      sLabel: 'Ballistic Spreading Speedup',
      cFn: n => +Math.sqrt(n).toFixed(2),
      qFn: n => n,
      cLbl: n => `σ = √${n} ≈ ${Math.sqrt(n).toFixed(2)}`,
      qLbl: n => `σ = t = ${n} (ballistic)`,
      tableType: 'scaling',
      tableCols: ['t Steps', 'Classical Diffusion (√t)', 'Quantum Ballistic (t)', 'Ratio'],
      desc: 'Quantum interference enables search on graph topologies and spatial propagation with quadratic speedup',
      pseudo: [
        { t: 'kw', s: 'COIN: ', r: 'q0 (Hadamard coin)' },
        { t: 'kw', s: 'WALK: ', r: 'Step shift conditioned on superposition coin' },
        { t: 'm', s: 'Constructive interference propagates wave packets ballistically' }
      ]
    }
  },
  {
    id: 'toffoli_demo',
    name: 'Toffoli Reversible Logic',
    tag: 'REVERSIBLE',
    desc: 'Controlled-Controlled-NOT (CCX) showing classical reversible computing in a unitary quantum gate',
    gates: [
      { type: 'X', qubit: 0, step: 0 },
      { type: 'X', qubit: 1, step: 0 },
      { type: 'CCX', c1: 0, c2: 1, target: 2, step: 1 }
    ],
    queries: {
      classical: '1 AND (Lossy)',
      classicalN: 100,
      quantum: '1 CCX (Reversible)',
      quantumN: 1,
      speedup: 'Reversible',
      speedupClass: 'lin',
      speedupType: 'Thermodynamic'
    },
    detail: {
      bigO_c: '1 Gate (Dissipative)',
      bigO_q: '1 Gate (Unitary)',
      sType: 'linear',
      sLabel: 'Reversible Unitary Computation',
      cFn: () => 1,
      qFn: () => 1,
      cLbl: () => 'Classical bit erasure generates Landauer heat',
      qLbl: () => 'Unitary CCX: zero theoretical entropy loss',
      tableType: 'none',
      desc: 'The Toffoli gate is universal for classical computation while remaining strictly reversible and unitary (CCX² = I)',
      pseudo: [
        { t: 'kw', s: 'INPUT:  ', r: 'q0=1, q1=1, q2=0' },
        { t: 'kw', s: 'GATE:   ', r: 'CCX(q0, q1, q2)' },
        { t: 'm', s: 'RESULT: Target flips only when both controls are 1' }
      ]
    }
  },
  {
    id: 'zuchongzhi_rcs',
    name: 'Zuchongzhi RCS (USTC Benchmark)',
    tag: 'SUPERCONDUCTING',
    desc: "Random circuit sampling benchmark inspired by USTC's 105-qubit superconducting quantum processor",
    gates: [
      { type: 'H', qubit: 0, step: 0 },
      { type: 'H', qubit: 1, step: 0 },
      { type: 'H', qubit: 2, step: 0 },
      { type: 'H', qubit: 3, step: 0 },
      { type: 'T', qubit: 0, step: 1 },
      { type: 'S', qubit: 1, step: 1 },
      { type: 'T', qubit: 2, step: 1 },
      { type: 'S', qubit: 3, step: 1 },
      { type: 'CNOT', control: 0, target: 1, step: 2 },
      { type: 'CNOT', control: 2, target: 3, step: 2 },
      { type: 'H', qubit: 1, step: 3 },
      { type: 'S', qubit: 0, step: 3 },
      { type: 'T', qubit: 3, step: 3 },
      { type: 'H', qubit: 2, step: 3 },
      { type: 'CNOT', control: 1, target: 2, step: 4 },
      { type: 'CNOT', control: 3, target: 0, step: 4 },
      { type: 'T', qubit: 1, step: 5 },
      { type: 'S', qubit: 2, step: 5 },
      { type: 'H', qubit: 0, step: 6 },
      { type: 'H', qubit: 3, step: 6 }
    ],
    queries: {
      classical: 'O(2ⁿ) Tensor',
      classicalN: 100,
      quantum: 'O(Depth)',
      quantumN: 5,
      speedup: '~10¹⁵× at Scale',
      speedupClass: 'exp',
      speedupType: 'Computational Advantage'
    },
    detail: {
      bigO_c: 'O(2ⁿ)',
      bigO_q: 'O(Depth)',
      sType: 'exponential',
      sLabel: 'Quantum Computational Advantage',
      cFn: n => 1 << n,
      qFn: () => 20,
      cLbl: n => `2^${n} amplitudes`,
      qLbl: () => '20 layer-depth circuit',
      tableType: 'scaling',
      tableCols: ['n Qubits', 'Classical Tensor Cost', 'Quantum Depth', 'Advantage'],
      desc: 'Random Circuit Sampling creates highly scrambled, porter-thomas distributed wavefunctions that are classically intractable to simulate',
      pseudo: [
        { t: 'cm', s: '// Zuchongzhi 3.0: 105 transmon qubits, 182 tunable couplers' },
        { t: 'kw', s: 'CYCLE:  ', r: 'Random 1Q rotations + interleaving CZ/CNOT grid' },
        { t: 'm', s: 'Classical supercomputers require years; quantum chip samples in seconds' }
      ]
    }
  },
  {
    id: 'jiuzhang_gbs',
    name: 'Jiuzhang GBS (Photonic Simulation)',
    tag: 'PHOTONIC',
    desc: 'Gaussian Boson Sampling approximation using interferometric unitary transformation networks',
    gates: [
      { type: 'H', qubit: 0, step: 0 },
      { type: 'H', qubit: 1, step: 0 },
      { type: 'H', qubit: 2, step: 0 },
      { type: 'H', qubit: 3, step: 0 },
      { type: 'CNOT', control: 0, target: 1, step: 1 },
      { type: 'H', qubit: 0, step: 2 },
      { type: 'CNOT', control: 1, target: 2, step: 3 },
      { type: 'H', qubit: 1, step: 4 },
      { type: 'CNOT', control: 2, target: 3, step: 5 },
      { type: 'H', qubit: 2, step: 6 },
      { type: 'CNOT', control: 3, target: 0, step: 7 },
      { type: 'H', qubit: 3, step: 8 },
      { type: 'SWAP', q1: 0, q2: 2, step: 9 },
      { type: 'SWAP', q1: 1, q2: 3, step: 10 }
    ],
    queries: {
      classical: '#P-Hard Perm.',
      classicalN: 100,
      quantum: 'O(1) Pass',
      quantumN: 1,
      speedup: 'Intractable',
      speedupClass: 'exp',
      speedupType: 'Sampling Advantage'
    },
    detail: {
      bigO_c: '#P-Hard',
      bigO_q: 'O(1) Optical',
      sType: 'exponential',
      sLabel: 'Non-Gate Sampling Advantage',
      cFn: n => 1 << n,
      qFn: () => 1,
      cLbl: n => `Matrix permanent O(2^${n}·${n})`,
      qLbl: () => '1 photonic pass',
      tableType: 'scaling',
      tableCols: ['Modes', 'Classical Permanent', 'Photonic Pass', 'Advantage'],
      desc: 'Gaussian Boson Sampling draws samples whose probability distribution corresponds to matrix permanents (#P-hard to compute classically)',
      pseudo: [
        { t: 'cm', s: '// Jiuzhang 4.0: 8,176-mode optical interferometer' },
        { t: 'kw', s: 'PHYSICS:', r: 'Squeezed light interference in multi-port beam splitters' },
        { t: 'm', s: 'Samples photon coincidences in ~25 microseconds' }
      ]
    }
  },
  {
    id: 'ntt_cim_maxcut',
    name: 'CIM MaxCut (QAOA Ring)',
    tag: 'OPTIMIZATION',
    desc: 'Quantum Approximate Optimization Algorithm for MaxCut on a 4-node ring graph (CIM Ising model)',
    gates: [
      { type: 'H', qubit: 0, step: 0 },
      { type: 'H', qubit: 1, step: 0 },
      { type: 'H', qubit: 2, step: 0 },
      { type: 'H', qubit: 3, step: 0 },
      { type: 'CNOT', control: 0, target: 1, step: 1 },
      { type: 'S', qubit: 1, step: 2 },
      { type: 'CNOT', control: 0, target: 1, step: 3 },
      { type: 'CNOT', control: 1, target: 2, step: 4 },
      { type: 'S', qubit: 2, step: 5 },
      { type: 'CNOT', control: 1, target: 2, step: 6 },
      { type: 'CNOT', control: 2, target: 3, step: 7 },
      { type: 'S', qubit: 3, step: 8 },
      { type: 'CNOT', control: 2, target: 3, step: 9 },
      { type: 'CNOT', control: 3, target: 0, step: 10 },
      { type: 'S', qubit: 0, step: 11 },
      { type: 'CNOT', control: 3, target: 0, step: 12 },
      { type: 'Rx', qubit: 0, step: 13 },
      { type: 'Rx', qubit: 1, step: 13 },
      { type: 'Rx', qubit: 2, step: 13 },
      { type: 'Rx', qubit: 3, step: 13 }
    ],
    queries: {
      classical: 'O(2ⁿ) Search',
      classicalN: 100,
      quantum: 'O(p·|E|)',
      quantumN: 12,
      speedup: 'Combinatorial',
      speedupClass: 'quad',
      speedupType: 'Heuristic'
    },
    detail: {
      bigO_c: 'O(2ⁿ)',
      bigO_q: 'O(p·|E|)',
      sType: 'quadratic',
      sLabel: 'Combinatorial Optimization',
      cFn: n => 1 << n,
      qFn: () => 12,
      cLbl: n => `2^${n} cut configurations`,
      qLbl: () => '12-gate QAOA layer',
      tableType: 'scaling',
      tableCols: ['n Nodes', 'Classical Brute-Force', 'QAOA Layer', 'Speedup'],
      desc: 'QAOA alternates cost Hamiltonian phase separators and transverse mixer rotations to approximate ground states of NP-hard graph cuts',
      pseudo: [
        { t: 'cm', s: '// Inspired by NTT Coherent Ising Machine (OPO optical network)' },
        { t: 'kw', s: 'STEP 1: ', r: 'H^⊗n prepares equal superposition of all partition cuts' },
        { t: 'kw', s: 'STEP 2: ', r: 'e^{-iγZZ} phase evolution across every graph edge' },
        { t: 'kw', s: 'STEP 3: ', r: 'e^{-iβX} transverse mixer rotations' }
      ]
    }
  },
  {
    id: 'simon',
    name: "Simon's Hidden Periodicity",
    tag: 'HIDDEN PERIOD',
    desc: "Discovers a hidden XOR-period s with O(n) queries — the algorithm that inspired Shor's algorithm",
    gates: [
      { type: 'H', qubit: 0, step: 0 },
      { type: 'H', qubit: 1, step: 0 },
      { type: 'CNOT', control: 0, target: 2, step: 1 },
      { type: 'CNOT', control: 1, target: 2, step: 2 },
      { type: 'H', qubit: 0, step: 3 },
      { type: 'H', qubit: 1, step: 3 }
    ],
    queries: {
      classical: 'O(2^(n/2))',
      classicalN: 100,
      quantum: 'O(n)',
      quantumN: 8,
      speedup: 'Exponential',
      speedupClass: 'exp',
      speedupType: 'Exponential'
    },
    detail: {
      bigO_c: 'O(2^(n/2))',
      bigO_q: 'O(n)',
      sType: 'exponential',
      sLabel: 'Exponential Collision Speedup',
      cFn: n => Math.round(Math.pow(2, n / 2)),
      qFn: n => n,
      cLbl: n => `~2^(${n}/2) queries (birthday paradox)`,
      qLbl: n => `${n} linear queries`,
      tableType: 'scaling',
      tableCols: ['n Bits', 'Classical Birthday Collision', 'Quantum Queries', 'Speedup'],
      desc: 'Finds hidden bitstring s where f(x)=f(x⊕s) in linearly many queries, providing provable exponential oracle separation',
      pseudo: [
        { t: 'cm', s: '// f(x) = f(x ⊕ s) for secret period s' },
        { t: 'kw', s: 'STEP 1: ', r: 'H^⊗n on input register' },
        { t: 'kw', s: 'STEP 2: ', r: 'Oracle evaluates f(x)' },
        { t: 'kw', s: 'STEP 3: ', r: 'H^⊗n on input register produces string y ⊥ s' },
        { t: 'm', s: 'Measure ~n independent vectors y where y · s ≡ 0 (mod 2)' }
      ]
    }
  },
  {
    id: 'phase_kick',
    name: 'Quantum Phase Estimation',
    tag: 'TECHNIQUE',
    desc: 'Extracts the eigenphase of a unitary operator U|ψ⟩ = e^{2πiφ}|ψ⟩ using phase kickback and inverse QFT',
    gates: [
      { type: 'H', qubit: 0, step: 0 },
      { type: 'S', qubit: 0, step: 1 },
      { type: 'T', qubit: 0, step: 2 },
      { type: 'CNOT', control: 0, target: 1, step: 3 },
      { type: 'H', qubit: 0, step: 4 }
    ],
    queries: {
      classical: 'O(2ᵗ)',
      classicalN: 100,
      quantum: 'O(t²)',
      quantumN: 16,
      speedup: '2ᵗ/t² ×',
      speedupClass: 'exp',
      speedupType: 'Exponential'
    },
    detail: {
      bigO_c: 'O(2ᵗ)',
      bigO_q: 'O(t²)',
      sType: 'exponential',
      sLabel: 'Exponential Precision Scaling',
      cFn: n => 1 << n,
      qFn: n => n * n,
      cLbl: n => `2^${n} phase evaluations`,
      qLbl: n => `t² = ${n * n} gates`,
      tableType: 'scaling',
      tableCols: ['Precision t Bits', 'Classical Search', 'Quantum QPE', 'Speedup'],
      desc: 'Subroutine underlying Shor factoring, HHL linear solvers, and quantum chemistry simulation',
      pseudo: [
        { t: 'kw', s: 'STEP 1: ', r: 'H^⊗t on ancilla register' },
        { t: 'kw', s: 'STEP 2: ', r: 'Controlled-U^(2^k) phase kickback' },
        { t: 'kw', s: 'STEP 3: ', r: 'Inverse QFT reads out binary representation of φ' }
      ]
    }
  }
];

export const SPEED_QUIZ: Record<string, SpeedQuizQuestion[]> = {
  bell: [
    {
      q: 'A classical computer simulates 4 entangled qubits. How many complex amplitudes must it store?',
      hint: 'Amplitudes scale as 2 to the power of n',
      cLabel: 'Classical Simulation',
      cWork: 'Must allocate and update 2ⁿ = 2⁴ = 16 complex numbers in memory',
      cAnswer: '16 amplitudes',
      cVal: 16,
      qLabel: 'Quantum Bell Circuit',
      qWork: 'Physical register holds state directly in 2 physical qubits via 2 gates (H + CX)',
      qAnswer: '2 gate operations',
      qVal: 2,
      verdict: 'Classical simulation requires 16 memory coordinates. Quantum uses 2 physical gates. The memory footprint doubles with each additional qubit.'
    },
    {
      q: 'You measure qubit q[0] of Bell state (|00⟩+|11⟩)/√2 and obtain |0⟩. What is P(q[1] = 0)?',
      hint: 'The two qubits are maximally entangled — measuring one collapses both',
      cLabel: 'Classical Independent Bits',
      cWork: 'Two independent fair coins: P(both 0) = 0.5 × 0.5 = 0.25',
      cAnswer: '25% (independent)',
      cVal: 25,
      qLabel: 'Quantum Entanglement',
      qWork: 'After measuring q[0]=0, wavefunction collapses to |00⟩. Therefore P(q[1]=0) = 1.0',
      qAnswer: '100% (deterministic correlation)',
      qVal: 100,
      verdict: 'Classical independent bits give only 25% coincident zero probability. Quantum Bell states exhibit 100% non-local correlation.'
    }
  ],
  grover: [
    {
      q: 'A database has N = 16 items. One element is marked. How many queries does classical search need vs Grover?',
      hint: 'Classical linear search checks up to N items. Grover uses ⌊π√N/4⌋',
      cLabel: 'Classical Linear Search',
      cWork: 'Worst case checks all N = 16 entries sequentially',
      cAnswer: '16 queries',
      cVal: 16,
      qLabel: "Grover's Algorithm",
      qWork: 'Optimal iteration count k = ⌊π·√16 / 4⌋ = ⌊π·4 / 4⌋ = ⌊3.1415⌋ = 3',
      qAnswer: '3 iterations',
      qVal: 3,
      verdict: 'Classical search requires 16 queries in the worst case; Grover succeeds in only 3 iterations — a 5.3× advantage at N=16, scaling to 1,000× at N=1,000,000.'
    },
    {
      q: 'For an unsorted database of N = 64 items (n = 6 qubits), how many Grover iterations are needed?',
      hint: 'Use the formula k = ⌊π·√N / 4⌋',
      cLabel: 'Classical Search',
      cWork: 'Must check all N = 64 items sequentially: 64 queries',
      cAnswer: '64 queries',
      cVal: 64,
      qLabel: "Grover's Search",
      qWork: 'k = ⌊π·√64 / 4⌋ = ⌊π·8 / 4⌋ = ⌊2π⌋ ≈ 6 iterations',
      qAnswer: '6 iterations',
      qVal: 6,
      verdict: 'Classical requires 64 queries. Grover requires 6 iterations — 10.7× faster with 90.6% fewer evaluations.'
    }
  ],
  qft4: [
    {
      q: 'Classical FFT on N = 16 points (n = 4 qubits) requires N·log₂(N) operations. How many does quantum QFT need?',
      hint: 'FFT = N·n. QFT = n(n+1)/2 gate operations',
      cLabel: 'Classical FFT',
      cWork: 'N · log₂N = 16 · 4 = 64 floating point operations',
      cAnswer: '64 operations',
      cVal: 64,
      qLabel: 'Quantum QFT',
      qWork: 'n(n+1)/2 = 4·5/2 = 10 elementary gates',
      qAnswer: '10 gates',
      qVal: 10,
      verdict: 'Classical FFT takes 64 operations; Quantum QFT completes in 10 gates. For n=10 qubits, the gap widens to 10,240 vs 55.'
    }
  ],
  deutsch_jozsa: [
    {
      q: 'A hidden Boolean function f has n = 10 input bits. How many classical queries guarantee whether f is constant vs balanced?',
      hint: 'Classical needs strictly more than half of all inputs: 2ⁿ⁻¹ + 1',
      cLabel: 'Classical Worst-Case',
      cWork: '2ⁿ⁻¹ + 1 = 2⁹ + 1 = 512 + 1 = 513 queries',
      cAnswer: '513 queries',
      cVal: 513,
      qLabel: 'Deutsch–Jozsa',
      qWork: 'Constructive/destructive interference tests all inputs in 1 superposition query',
      qAnswer: '1 query',
      qVal: 1,
      verdict: 'Classical requires 513 queries in worst case. Deutsch–Jozsa requires exactly 1 query — a 513× exponential speedup that scales as 2ⁿ⁻¹.'
    }
  ],
  ghz: [
    {
      q: 'To store the statevector of an n=4 GHZ state (|0000⟩+|1111⟩)/√2, how many amplitudes must a classical computer track vs gates on quantum hardware?',
      hint: 'Classical stores 2ⁿ complex amplitudes',
      cLabel: 'Classical Memory Matrix',
      cWork: '2⁴ = 16 complex numbers in vector space',
      cAnswer: '16 amplitudes',
      cVal: 16,
      qLabel: 'GHZ Quantum Circuit',
      qWork: '1 Hadamard gate on q[0] + 3 cascading CNOTs = 4 gates',
      qAnswer: '4 gates',
      qVal: 4,
      verdict: 'Classical computer stores 16 state vector coordinates; quantum hardware creates multi-party entanglement in 4 physical gates.'
    }
  ],
  teleport: [
    {
      q: 'How many classical bits must Alice transmit to Bob to reconstruct an unknown arbitrary single-qubit state |ψ⟩ using teleportation?',
      hint: 'A single qubit has continuous complex amplitudes α|0⟩ + β|1⟩',
      cLabel: 'Direct Classical Description',
      cWork: 'Infinite precision real coordinates for θ and φ on Bloch sphere',
      cAnswer: '∞ bits (imprecise without infinite bits)',
      cVal: 9999,
      qLabel: 'Quantum Teleportation Protocol',
      qWork: 'Bell-state measurement collapses to 1 of 4 outcomes → 2 classical bits sent',
      qAnswer: '2 classical bits',
      qVal: 2,
      verdict: 'Continuous quantum information is teleported using exactly 2 classical bits combined with 1 pre-shared EPR entanglement pair.'
    }
  ],
  superpos: [
    {
      q: 'How many gates does a quantum computer require to prepare all 256 computational basis states simultaneously on an 8-qubit register?',
      hint: 'Hadamard gate applied to each qubit in parallel',
      cLabel: 'Classical State Loading',
      cWork: 'Must write and normalize 2⁸ = 256 amplitudes sequentially',
      cAnswer: '256 operations',
      cVal: 256,
      qLabel: 'Quantum Hadamard Wall',
      qWork: 'H^⊗8 applied in 1 parallel layer across 8 qubits = 8 gates',
      qAnswer: '8 gates',
      qVal: 8,
      verdict: 'Classical hardware writes 256 state values; quantum hardware places all 256 states into equal superposition with 8 parallel gates.'
    }
  ],
  random: [
    {
      q: 'After t = 100 steps, what is the spatial spreading distance (standard deviation σ) of a classical random walk vs a quantum walk?',
      hint: 'Classical diffusion is σ ∝ √t; quantum ballistic spread is σ ∝ t',
      cLabel: 'Classical Diffusion',
      cWork: 'σ = √t = √100 = 10 positions',
      cAnswer: 'σ = 10 positions',
      cVal: 10,
      qLabel: 'Quantum Random Walk',
      qWork: 'Ballistic propagation σ = t = 100 positions',
      qAnswer: 'σ = 100 positions',
      qVal: 100,
      verdict: 'Quantum wave interference eliminates back-scattering, yielding a 10× quadratic spreading speedup over classical Brownian diffusion.'
    }
  ],
  toffoli_demo: [
    {
      q: 'How does the thermodynamic heat dissipation of a classical irreversible AND gate compare to a quantum Toffoli (CCX) gate?',
      hint: 'Landauer principle states bit erasure dissipates kT·ln(2) of thermodynamic heat',
      cLabel: 'Classical AND Gate',
      cWork: 'Erases 2 input bits into 1 output bit → dissipates minimum kT·ln(2) heat',
      cAnswer: 'Dissipates heat (Landauer bound)',
      cVal: 100,
      qLabel: 'Quantum CCX (Toffoli)',
      qWork: 'Unitary operation is its own inverse (CCX² = I) → 0 theoretical bit erasure',
      qAnswer: '0 theoretical dissipation',
      qVal: 0,
      verdict: 'Toffoli gates demonstrate classical universal computation inside unitary, strictly reversible quantum circuits without thermodynamic bit erasure.'
    }
  ],
  zuchongzhi_rcs: [
    {
      q: 'On USTC Zuchongzhi 3.0 (105 qubits), why is Random Circuit Sampling (RCS) classically intractable?',
      hint: 'State space dimension scales as 2¹⁰⁵',
      cLabel: 'Frontier Classical Supercomputer',
      cWork: 'Hilbert space 2¹⁰⁵ ≈ 4 × 10³¹ complex numbers; requires millions of years on classical clusters',
      cAnswer: 'Millions of years',
      cVal: 1000000,
      qLabel: 'Zuchongzhi 3.0 Quantum Chip',
      qWork: 'Executes physical 32-cycle quantum circuit in real time: ~300 seconds',
      qAnswer: '~300 seconds',
      qVal: 300,
      verdict: 'Demonstrates empirical quantum computational advantage with ~10¹⁵× acceleration over the world’s fastest classical supercomputers.'
    }
  ],
  jiuzhang_gbs: [
    {
      q: 'Why does Gaussian Boson Sampling (GBS) on Jiuzhang exhibit an exponential speedup over classical computers?',
      hint: 'Output probabilities depend on matrix permanents rather than determinants',
      cLabel: 'Classical Matrix Permanent',
      cWork: 'Ryser formula for n×n permanent scales as O(2ⁿ · n) (#P-hard)',
      cAnswer: '#P-hard exponential',
      cVal: 99999,
      qLabel: 'Jiuzhang Photonic GBS',
      qWork: 'Photons naturally interfere in multi-mode interferometer in ~25 microseconds',
      qAnswer: '~25 microseconds',
      qVal: 1,
      verdict: 'Computing matrix permanents is #P-hard for classical supercomputers; photonic interferometers draw physical samples directly from quantum optical interference.'
    }
  ],
  ntt_cim_maxcut: [
    {
      q: 'For an n-node graph, how many candidate cut partitions must classical brute-force test vs QAOA phase layers?',
      hint: 'Each node can be assigned to set 0 or 1',
      cLabel: 'Classical Exhaustive Cut Search',
      cWork: 'Must evaluate cut weights across all 2ⁿ possible binary partition bitstrings',
      cAnswer: '2ⁿ cut checks',
      cVal: 256,
      qLabel: 'CIM / QAOA Optimization',
      qWork: 'p-layer QAOA optimizes parameters over polynomial O(p · |E|) gates',
      qAnswer: 'O(p · |E|) gates',
      qVal: 12,
      verdict: 'Quantum approximate optimization amplifies the probability of low-energy cuts without needing to test all 2ⁿ partitions sequentially.'
    }
  ],
  simon: [
    {
      q: 'For a 2-to-1 function with hidden period s (f(x)=f(x⊕s)), how many queries does classical birthday paradox need vs Simon’s algorithm?',
      hint: 'Classical collision search scales as O(2^(n/2))',
      cLabel: 'Classical Birthday Collision',
      cWork: 'Needs ~√(2ⁿ) = 2^(n/2) random samples before finding a collision with high probability',
      cAnswer: 'O(2^(n/2)) queries',
      cVal: 32,
      qLabel: "Simon's Algorithm",
      qWork: 'Each run yields a vector y ⊥ s; n independent equations solve for s in O(n) runs',
      qAnswer: 'O(n) queries',
      qVal: 4,
      verdict: 'Simon’s algorithm provides provable exponential separation (O(n) vs O(2^(n/2))), directly providing the mathematical foundation for Shor’s algorithm.'
    }
  ],
  phase_kick: [
    {
      q: 'In Quantum Phase Estimation with t=4 precision bits, how many eigenvalue tests does classical search need vs QPE?',
      hint: 'Classical checks 2ᵗ phase fractions',
      cLabel: 'Classical Phase Search',
      cWork: 'Must test 2ᵗ = 2⁴ = 16 phase fractions individually',
      cAnswer: '16 evaluations',
      cVal: 16,
      qLabel: 'Quantum Phase Estimation',
      qWork: 'Phase kickback + inverse QFT measures binary phase in t² = 16 gates',
      qAnswer: 't² gates',
      qVal: 16,
      verdict: 'While comparable at t=4, at t=10 bits classical requires 1,024 evaluations while QPE requires only 55 gates (18.6× speedup).'
    }
  ]
};

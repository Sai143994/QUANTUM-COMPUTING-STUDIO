/**
 * Quantum Studio — Quantum Quest / Puzzle Challenge Mode
 * Real-time automated grading against target quantum statevectors & unitaries
 */
import { GateOp, GateType, QuantumState } from '../types/quantum';

export interface QuantumQuest {
  id: string;
  level: number;
  title: string;
  category: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  qubits: number;
  description: string;
  objective: string;
  hint: string;
  maxGates3Stars: number;
  maxGates2Stars: number;
  forbiddenGates?: GateType[];
  requiredGates?: GateType[];
  preloadedGates?: GateOp[];
  targetProbabilities: number[]; // index -> probability
  targetStatevectorValidator?: (qs: QuantumState) => { passed: boolean; fidelity: number; reason?: string };
}

export const QUANTUM_QUESTS: QuantumQuest[] = [
  {
    id: 'quest_bell_phi_plus',
    level: 1,
    title: 'Bell State Architect (|Φ+⟩)',
    category: 'BEGINNER',
    qubits: 2,
    description: 'Create the canonical 2-qubit maximally entangled Bell state from the ground state |00⟩.',
    objective: 'Prepare (|00⟩ + |11⟩) / √2',
    hint: 'Put qubit 0 into equal superposition using a Hadamard (H) gate, then entangle it with qubit 1 using a CNOT (control=0, target=1).',
    maxGates3Stars: 2,
    maxGates2Stars: 3,
    targetProbabilities: [0.5, 0.0, 0.0, 0.5],
    targetStatevectorValidator: (qs: QuantumState) => {
      // |00> has amp 1/sqrt(2), |11> has amp 1/sqrt(2)
      const p = qs.probabilities();
      const passed = Math.abs(p[0] - 0.5) < 0.05 && Math.abs(p[3] - 0.5) < 0.05;
      const targetState = new QuantumState(2);
      targetState.applyGate(0, [[[1/Math.SQRT2, 0], [1/Math.SQRT2, 0]], [[1/Math.SQRT2, 0], [-1/Math.SQRT2, 0]]]);
      targetState.applyCNOT(0, 1);
      const fidelity = qs.fidelity(targetState);
      return { passed: fidelity > 0.99, fidelity };
    }
  },
  {
    id: 'quest_bell_psi_minus',
    level: 2,
    title: 'Singlet State Forge (|Ψ-⟩)',
    category: 'BEGINNER',
    qubits: 2,
    description: 'Synthesize the antisymmetric quantum singlet state with destructive interference.',
    objective: 'Prepare (|01⟩ - |10⟩) / √2',
    hint: 'Flip both qubits to |11⟩ with X gates, apply Hadamard (H) to qubit 0, and then apply a CNOT from qubit 0 to qubit 1.',
    maxGates3Stars: 4,
    maxGates2Stars: 5,
    targetProbabilities: [0.0, 0.5, 0.5, 0.0],
    targetStatevectorValidator: (qs: QuantumState) => {
      const targetState = new QuantumState(2);
      targetState.applyGate(0, [[[0, 0], [1, 0]], [[1, 0], [0, 0]]]);
      targetState.applyGate(1, [[[0, 0], [1, 0]], [[1, 0], [0, 0]]]);
      targetState.applyGate(0, [[[1/Math.SQRT2, 0], [1/Math.SQRT2, 0]], [[1/Math.SQRT2, 0], [-1/Math.SQRT2, 0]]]);
      targetState.applyCNOT(0, 1);
      const fidelity = qs.fidelity(targetState);
      return { passed: fidelity > 0.98, fidelity };
    }
  },
  {
    id: 'quest_swap_synth',
    level: 3,
    title: 'SWAP Gate Synthesizer (No Primitive!)',
    category: 'INTERMEDIATE',
    qubits: 2,
    description: 'Exchange the quantum states between qubit 0 and qubit 1 WITHOUT using the SWAP gate primitive.',
    objective: 'Construct a SWAP equivalent using only CNOT gates',
    hint: 'A reversible SWAP can be built with 3 alternating CNOT gates: CX(0, 1), CX(1, 0), CX(0, 1). First place an X on qubit 0 to test state exchange!',
    maxGates3Stars: 4,
    maxGates2Stars: 5,
    forbiddenGates: ['SWAP', 'ISWAP', 'SQRT_SWAP'],
    preloadedGates: [
      { type: 'X', qubit: 0, step: 0 } // Prepare |10> initially
    ],
    targetProbabilities: [0.0, 1.0, 0.0, 0.0], // Should end up in |01> (index 1)
    targetStatevectorValidator: (qs: QuantumState) => {
      const p = qs.probabilities();
      const passed = p[1] > 0.98; // |01> state has index 1 in standard little-endian / bit-endian
      return { passed, fidelity: p[1] };
    }
  },
  {
    id: 'quest_ghz_3q',
    level: 4,
    title: 'GHZ Tri-Partite Entangler',
    category: 'INTERMEDIATE',
    qubits: 3,
    description: 'Generate the 3-qubit Greenberger-Horne-Zeilinger (GHZ) state with maximal global entanglement.',
    objective: 'Prepare (|000⟩ + |111⟩) / √2',
    hint: 'Superpose qubit 0 with H, then propagate the coherence using CX(0, 1) and CX(1, 2).',
    maxGates3Stars: 3,
    maxGates2Stars: 4,
    targetProbabilities: [0.5, 0, 0, 0, 0, 0, 0, 0.5],
    targetStatevectorValidator: (qs: QuantumState) => {
      const p = qs.probabilities();
      const passed = Math.abs(p[0] - 0.5) < 0.05 && Math.abs(p[7] - 0.5) < 0.05;
      const targetState = new QuantumState(3);
      targetState.applyGate(0, [[[1/Math.SQRT2, 0], [1/Math.SQRT2, 0]], [[1/Math.SQRT2, 0], [-1/Math.SQRT2, 0]]]);
      targetState.applyCNOT(0, 1);
      targetState.applyCNOT(1, 2);
      const fidelity = qs.fidelity(targetState);
      return { passed: fidelity > 0.98, fidelity };
    }
  },
  {
    id: 'quest_phase_inversion',
    level: 5,
    title: 'Quantum Phase Kickback Demon',
    category: 'ADVANCED',
    qubits: 2,
    description: 'Apply a negative phase (-1) exclusively to state |11⟩ while keeping all computational probabilities identical!',
    objective: 'Transform (|00⟩ + |01⟩ + |10⟩ + |11⟩)/2 → (|00⟩ + |01⟩ + |10⟩ - |11⟩)/2',
    hint: 'Start with H on both qubits to make uniform superposition, then apply a Controlled-Z (CZ) gate or use phase kickback with CNOT sandwiched by Hadamards.',
    maxGates3Stars: 3,
    maxGates2Stars: 4,
    targetProbabilities: [0.25, 0.25, 0.25, 0.25],
    targetStatevectorValidator: (qs: QuantumState) => {
      // Amplitudes: +0.5, +0.5, +0.5, -0.5
      const target = new QuantumState(2);
      target.applyGate(0, [[[1/Math.SQRT2, 0], [1/Math.SQRT2, 0]], [[1/Math.SQRT2, 0], [-1/Math.SQRT2, 0]]]);
      target.applyGate(1, [[[1/Math.SQRT2, 0], [1/Math.SQRT2, 0]], [[1/Math.SQRT2, 0], [-1/Math.SQRT2, 0]]]);
      // CZ flips |11> to -|11>
      target.applyCZ(0, 1);
      const fidelity = qs.fidelity(target);
      return { passed: fidelity > 0.98, fidelity };
    }
  },
  {
    id: 'quest_superdense_encoding',
    level: 6,
    title: 'Superdense Coding Transmitter',
    category: 'ADVANCED',
    qubits: 2,
    description: 'Transform a shared Bell pair |Φ+⟩ into |Ψ+⟩ = (|01⟩ + |10⟩)/√2 by applying only a single local gate to qubit 0!',
    objective: 'Encode message bits 01 by local manipulation of qubit 0 only',
    hint: 'Applying Pauli X to qubit 0 swaps |00⟩ to |10⟩ and |11⟩ to |01⟩, transforming |Φ+⟩ into |Ψ+⟩.',
    maxGates3Stars: 3, // Bell state setup (2) + message gate (1)
    maxGates2Stars: 4,
    preloadedGates: [
      { type: 'H', qubit: 0, step: 0 },
      { type: 'CNOT', control: 0, target: 1, step: 1 }
    ],
    targetProbabilities: [0.0, 0.5, 0.5, 0.0],
    targetStatevectorValidator: (qs: QuantumState) => {
      const target = new QuantumState(2);
      target.applyGate(0, [[[1/Math.SQRT2, 0], [1/Math.SQRT2, 0]], [[1/Math.SQRT2, 0], [-1/Math.SQRT2, 0]]]);
      target.applyCNOT(0, 1);
      target.applyGate(0, [[[0, 0], [1, 0]], [[1, 0], [0, 0]]]); // Pauli X
      const fidelity = qs.fidelity(target);
      return { passed: fidelity > 0.98, fidelity };
    }
  }
];

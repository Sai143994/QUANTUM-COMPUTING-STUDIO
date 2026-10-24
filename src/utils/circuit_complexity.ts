/**
 * Quantum Studio — Circuit Complexity & NISQ Bottleneck Analyzer
 */
import { GateOp } from '../types/quantum';

export interface GateBreakdown {
  total: number;
  singleQubit: number;
  twoQubit: number;
  threeQubit: number;
  measurements: number;
  nonClifford: number; // T, Rx, Ry, Rz, etc.
}

export interface ConnectivityAnalysis {
  interactionPairs: Array<{ q1: number; q2: number; count: number }>;
  isAllNearestNeighbor: boolean;
  nonLocalGateCount: number;
  maxDistance: number;
  estimatedSwapsNeeded: number;
  graphDensity: number; // Ratio of interacted pairs to total possible pairs
}

export interface NisqBottleneck {
  id: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  description: string;
  impact: string;
  recommendation: string;
}

export interface CircuitComplexityReport {
  depth: number;
  gateBreakdown: GateBreakdown;
  connectivity: ConnectivityAnalysis;
  estimatedFidelityPct: number;
  coherenceUsagePct: number; // Assuming typical 100us T2 and 40ns 2Q gate time
  nisqViabilityScore: number; // 0 to 100
  nisqRating: 'OPTIMAL' | 'MODERATE' | 'POOR' | 'UNFEASIBLE';
  bottlenecks: NisqBottleneck[];
  recommendedHardware: 'SUPERCONDUCTING' | 'TRAPPED_ION' | 'NEUTRAL_ATOM';
}

/**
 * Calculates the exact DAG critical-path circuit depth
 */
export function calculateCircuitDepth(circuit: GateOp[], numQubits: number): number {
  if (!circuit || !Array.isArray(circuit) || circuit.length === 0 || numQubits <= 0) return 0;
  
  // Qubit availability clock (in integer time slices)
  const qubitTime = new Array(numQubits).fill(0);

  for (const gate of circuit) {
    const involvedQubits: number[] = [];
    if (gate.qubit !== undefined) involvedQubits.push(gate.qubit);
    if (gate.control !== undefined) involvedQubits.push(gate.control);
    if (gate.target !== undefined) involvedQubits.push(gate.target);
    if (gate.q1 !== undefined) involvedQubits.push(gate.q1);
    if (gate.q2 !== undefined) involvedQubits.push(gate.q2);
    if (gate.c1 !== undefined) involvedQubits.push(gate.c1);
    if (gate.c2 !== undefined) involvedQubits.push(gate.c2);

    const validQubits = involvedQubits.filter(q => q >= 0 && q < numQubits);
    if (validQubits.length === 0) continue;

    // The gate must wait until all involved qubits are free
    const startTime = Math.max(...validQubits.map(q => qubitTime[q]));
    const endTime = startTime + 1;

    for (const q of validQubits) {
      qubitTime[q] = endTime;
    }
  }

  return Math.max(...qubitTime, 0);
}

/**
 * Analyzes gate breakdown and non-Clifford operations
 */
export function analyzeGateBreakdown(circuit: GateOp[]): GateBreakdown {
  if (!circuit || !Array.isArray(circuit)) {
    return { total: 0, singleQubit: 0, twoQubit: 0, threeQubit: 0, measurements: 0, nonClifford: 0 };
  }
  let singleQubit = 0;
  let twoQubit = 0;
  let threeQubit = 0;
  let measurements = 0;
  let nonClifford = 0;

  for (const g of circuit) {
    if (g.type === 'M') {
      measurements++;
      continue;
    }

    if (g.type === 'CCX' || g.type === 'CSWAP') {
      threeQubit++;
      nonClifford++; // CCX requires magic states / Toffoli decomposition
      continue;
    }

    if (['CNOT', 'CZ', 'CY', 'SWAP', 'ISWAP', 'CP'].includes(g.type)) {
      twoQubit++;
      if (g.type === 'CP') nonClifford++;
      continue;
    }

    // Single qubit
    singleQubit++;
    if (['T', 'Rx', 'Ry', 'Rz'].includes(g.type)) {
      nonClifford++;
    }
  }

  return {
    total: circuit.length,
    singleQubit,
    twoQubit,
    threeQubit,
    measurements,
    nonClifford
  };
}

/**
 * Analyzes physical qubit interaction graph and routing overhead
 */
export function analyzeConnectivity(circuit: GateOp[], numQubits: number): ConnectivityAnalysis {
  const pairMap = new Map<string, number>();
  let nonLocalGateCount = 0;
  let maxDistance = 0;
  let estimatedSwapsNeeded = 0;

  if (!circuit || !Array.isArray(circuit)) {
    return {
      interactionPairs: [],
      isAllNearestNeighbor: true,
      nonLocalGateCount: 0,
      maxDistance: 0,
      estimatedSwapsNeeded: 0,
      graphDensity: 0
    };
  }

  for (const g of circuit) {
    let qA: number | undefined;
    let qB: number | undefined;

    if (g.control !== undefined && g.target !== undefined) {
      qA = g.control;
      qB = g.target;
    } else if (g.q1 !== undefined && g.q2 !== undefined) {
      qA = g.q1;
      qB = g.q2;
    }

    if (qA !== undefined && qB !== undefined && qA !== qB) {
      const minQ = Math.min(qA, qB);
      const maxQ = Math.max(qA, qB);
      const key = `${minQ}-${maxQ}`;
      pairMap.set(key, (pairMap.get(key) || 0) + 1);

      const dist = Math.abs(qA - qB);
      if (dist > maxDistance) maxDistance = dist;

      if (dist > 1) {
        nonLocalGateCount++;
        // On a linear nearest-neighbor architecture, routing across dist requires 2 * (dist - 1) SWAPs
        estimatedSwapsNeeded += 2 * (dist - 1);
      }
    }
  }

  const interactionPairs: Array<{ q1: number; q2: number; count: number }> = [];
  pairMap.forEach((count, key) => {
    const [q1, q2] = key.split('-').map(Number);
    interactionPairs.push({ q1, q2, count });
  });

  const totalPossiblePairs = numQubits > 1 ? (numQubits * (numQubits - 1)) / 2 : 1;
  const graphDensity = interactionPairs.length / totalPossiblePairs;

  return {
    interactionPairs,
    isAllNearestNeighbor: nonLocalGateCount === 0,
    nonLocalGateCount,
    maxDistance,
    estimatedSwapsNeeded,
    graphDensity
  };
}

/**
 * Generates full NISQ complexity diagnostic report
 */
export function analyzeCircuitComplexity(circuit: GateOp[], numQubits: number): CircuitComplexityReport {
  const depth = calculateCircuitDepth(circuit, numQubits);
  const gateBreakdown = analyzeGateBreakdown(circuit);
  const connectivity = analyzeConnectivity(circuit, numQubits);

  // Error model parameters (Representative modern superconducting transmon values)
  const EPSILON_1Q = 0.0006;  // 99.94% 1Q gate fidelity
  const EPSILON_2Q = 0.0075;  // 99.25% 2Q gate fidelity
  const EPSILON_3Q = 0.035;   // ~96.5% native 3Q (or synthesized Toffoli)
  const T2_COHERENCE_US = 120; // 120 microseconds coherence
  const GATE_TIME_2Q_NS = 45; // 45 nanoseconds per two-qubit gate

  // Effective circuit execution duration estimate
  const estimatedCircuitTimeNs = depth * GATE_TIME_2Q_NS;
  const coherenceUsagePct = Math.min(100, Math.round((estimatedCircuitTimeNs / (T2_COHERENCE_US * 1000)) * 100));

  // Gate fidelity product
  const f1q = Math.pow(1 - EPSILON_1Q, gateBreakdown.singleQubit);
  const f2q = Math.pow(1 - EPSILON_2Q, gateBreakdown.twoQubit + connectivity.estimatedSwapsNeeded);
  const f3q = Math.pow(1 - EPSILON_3Q, gateBreakdown.threeQubit);
  const fDecoherence = Math.exp(-estimatedCircuitTimeNs / (T2_COHERENCE_US * 1000));

  const totalFidelity = f1q * f2q * f3q * fDecoherence;
  const estimatedFidelityPct = Math.max(0.1, Math.min(99.9, Math.round(totalFidelity * 1000) / 10));

  // Determine bottlenecks
  const bottlenecks: NisqBottleneck[] = [];

  if (connectivity.nonLocalGateCount > 0) {
    bottlenecks.push({
      id: 'bn_connectivity',
      severity: connectivity.nonLocalGateCount > 3 ? 'CRITICAL' : 'WARNING',
      title: 'Non-Local Qubit Coupling (SWAP Routing Required)',
      description: `${connectivity.nonLocalGateCount} two-qubit gates interact across non-adjacent qubits (max distance: ${connectivity.maxDistance}).`,
      impact: `On fixed-grid chips (Google Sycamore, IBM Heron), this circuit will require ~${connectivity.estimatedSwapsNeeded} compiler-injected SWAP gates, compounding 2Q gate error.`,
      recommendation: 'Rearrange qubit allocations, utilize trapped-ion all-to-all connectivity, or insert explicit SWAPs with unitary cancellation.'
    });
  }

  if (gateBreakdown.twoQubit > 15) {
    bottlenecks.push({
      id: 'bn_2q_accumulation',
      severity: gateBreakdown.twoQubit > 30 ? 'CRITICAL' : 'WARNING',
      title: 'High Two-Qubit Entangling Gate Density',
      description: `Circuit contains ${gateBreakdown.twoQubit} two-qubit gates (${gateBreakdown.total > 0 ? Math.round((gateBreakdown.twoQubit / gateBreakdown.total) * 100) : 0}% of all gates).`,
      impact: '2Q gates dominate physical error rates in NISQ processors (~10x noisier than 1Q gates), degrading signal visibility.',
      recommendation: 'Apply Zero-Noise Extrapolation (ZNE) error mitigation, Pauli twirling, or KAK gate synthesis to compress 2Q gates.'
    });
  }

  if (depth > 25) {
    bottlenecks.push({
      id: 'bn_depth_decoherence',
      severity: depth > 50 ? 'CRITICAL' : 'WARNING',
      title: 'Circuit Depth Exceeds NISQ Coherence Budget',
      description: `Critical path depth is ${depth} layers, consuming ~${coherenceUsagePct}% of available phase coherence (T₂).`,
      impact: 'Qubits idle during deep stages will suffer thermal relaxation and dephasing, leading to mixed states.',
      recommendation: 'Parallelize commuting gates, apply dynamical decoupling (XY4 pulse sequences) to idle qubits, or use trapped ions.'
    });
  }

  if (gateBreakdown.threeQubit > 0) {
    bottlenecks.push({
      id: 'bn_toffoli_overhead',
      severity: 'WARNING',
      title: 'Multi-Controlled Non-Clifford Gates Present',
      description: `Contains ${gateBreakdown.threeQubit} Toffoli/CSWAP gates.`,
      impact: 'Most physical QPUs decompose each CCX gate into 6 CNOTs and 7 T-gates, multiplying error rates.',
      recommendation: 'Decompose with relative-phase Toffoli or compile to native 3-qubit couplers where available.'
    });
  }

  if (bottlenecks.length === 0) {
    bottlenecks.push({
      id: 'bn_optimal',
      severity: 'INFO',
      title: 'NISQ-Optimized Circuit Structure',
      description: 'Circuit features low depth, high nearest-neighbor locality, and balanced gate counts.',
      impact: 'High signal-to-noise ratio expected on standard superconducting and ion-trap cloud backends.',
      recommendation: 'Ready for hardware execution with standard readout error mitigation.'
    });
  }

  // Viability score (0 to 100)
  let score = 100;
  score -= Math.min(40, depth * 1.2);
  score -= Math.min(30, gateBreakdown.twoQubit * 1.5);
  score -= Math.min(20, connectivity.nonLocalGateCount * 3);
  score -= Math.min(10, gateBreakdown.threeQubit * 5);
  const nisqViabilityScore = Math.max(5, Math.min(99, Math.round(score)));

  let nisqRating: 'OPTIMAL' | 'MODERATE' | 'POOR' | 'UNFEASIBLE' = 'OPTIMAL';
  if (nisqViabilityScore < 30) nisqRating = 'UNFEASIBLE';
  else if (nisqViabilityScore < 55) nisqRating = 'POOR';
  else if (nisqViabilityScore < 80) nisqRating = 'MODERATE';

  // Recommended architecture
  let recommendedHardware: 'SUPERCONDUCTING' | 'TRAPPED_ION' | 'NEUTRAL_ATOM' = 'SUPERCONDUCTING';
  if (connectivity.nonLocalGateCount > 4 || gateBreakdown.threeQubit > 1) {
    recommendedHardware = 'TRAPPED_ION'; // All-to-all connectivity
  } else if (numQubits > 6 || depth > 30) {
    recommendedHardware = 'NEUTRAL_ATOM'; // Optical shuttling & long coherence
  }

  return {
    depth,
    gateBreakdown,
    connectivity,
    estimatedFidelityPct,
    coherenceUsagePct,
    nisqViabilityScore,
    nisqRating,
    bottlenecks,
    recommendedHardware
  };
}

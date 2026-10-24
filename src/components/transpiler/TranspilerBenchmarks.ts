import { GateOp } from '../../types/quantum';
import { QpuBackend, QpuNode, QpuEdge, BackendComparisonResult } from './TranspilerTypes';

export interface CircuitPreset {
  id: string;
  name: string;
  qubits: number;
  description: string;
  circuit: GateOp[];
}

export const CIRCUIT_PRESETS: CircuitPreset[] = [
  {
    id: 'bell',
    name: 'Bell State (|Φ⁺⟩)',
    qubits: 2,
    description: 'Maximal 2-qubit entanglement test with Hadamard and CNOT.',
    circuit: [
      { type: 'H', qubit: 0, step: 0 },
      { type: 'CNOT', control: 0, target: 1, step: 1 }
    ]
  },
  {
    id: 'ghz3',
    name: '3-Qubit GHZ State',
    qubits: 3,
    description: 'Greenberger-Horne-Zeilinger tri-partite entangled state (|000⟩ + |111⟩)/√2.',
    circuit: [
      { type: 'H', qubit: 0, step: 0 },
      { type: 'CNOT', control: 0, target: 1, step: 1 },
      { type: 'CNOT', control: 1, target: 2, step: 2 }
    ]
  },
  {
    id: 'qft3',
    name: 'Quantum Fourier Transform (3Q)',
    qubits: 3,
    description: 'Standard QFT-3 with non-local controlled phase rotations requiring heavy SWAP routing.',
    circuit: [
      { type: 'H', qubit: 0, step: 0 },
      { type: 'CP', control: 1, target: 0, angle: Math.PI / 2, step: 1 },
      { type: 'CP', control: 2, target: 0, angle: Math.PI / 4, step: 2 },
      { type: 'H', qubit: 1, step: 3 },
      { type: 'CP', control: 2, target: 1, angle: Math.PI / 2, step: 4 },
      { type: 'H', qubit: 2, step: 5 },
      { type: 'SWAP', control: 0, target: 2, step: 6 }
    ]
  },
  {
    id: 'grover3',
    name: 'Grover Search Oracle (3Q)',
    qubits: 3,
    description: 'Amplitude amplification search oracle testing multi-qubit entangling gates.',
    circuit: [
      { type: 'H', qubit: 0, step: 0 },
      { type: 'H', qubit: 1, step: 0 },
      { type: 'H', qubit: 2, step: 0 },
      { type: 'X', qubit: 1, step: 1 },
      { type: 'CZ', control: 0, target: 2, step: 2 },
      { type: 'X', qubit: 1, step: 3 },
      { type: 'H', qubit: 0, step: 4 },
      { type: 'H', qubit: 1, step: 4 },
      { type: 'H', qubit: 2, step: 4 }
    ]
  },
  {
    id: 'qaoa',
    name: 'QAOA Max-Cut Step',
    qubits: 4,
    description: 'Quantum Approximate Optimization Algorithm layer with alternating cost and mixer Hamiltonians.',
    circuit: [
      { type: 'H', qubit: 0, step: 0 },
      { type: 'H', qubit: 1, step: 0 },
      { type: 'H', qubit: 2, step: 0 },
      { type: 'H', qubit: 3, step: 0 },
      { type: 'CNOT', control: 0, target: 1, step: 1 },
      { type: 'Rz', qubit: 1, angle: 0.785, step: 2 },
      { type: 'CNOT', control: 0, target: 1, step: 3 },
      { type: 'CNOT', control: 1, target: 2, step: 4 },
      { type: 'Rz', qubit: 2, angle: 0.785, step: 5 },
      { type: 'CNOT', control: 1, target: 2, step: 6 },
      { type: 'Rx', qubit: 0, angle: 0.52, step: 7 },
      { type: 'Rx', qubit: 1, angle: 0.52, step: 7 },
      { type: 'Rx', qubit: 2, angle: 0.52, step: 7 },
      { type: 'Rx', qubit: 3, angle: 0.52, step: 7 }
    ]
  }
];

// Helper to generate Willow grid (5x5, 25 nodes)
export const generateWillowGrid = (): { nodes: QpuNode[]; edges: QpuEdge[] } => {
  const nodes: QpuNode[] = [];
  const edges: QpuEdge[] = [];
  const rows = 5;
  const cols = 5;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = r * cols + c;
      nodes.push({
        id,
        x: 75 + c * 75,
        y: 65 + r * 80,
        t1: Math.round(44 + Math.abs(Math.sin(id * 1.8)) * 9),
        t2: Math.round(38 + Math.abs(Math.cos(id * 1.4)) * 7),
        readoutError: +(0.32 + Math.abs(Math.sin(id * 0.7)) * 0.22).toFixed(2),
        frequency: +(5.15 + (id % 5) * 0.06).toFixed(2)
      });
      if (c < cols - 1) {
        edges.push({ source: id, target: id + 1, errorRate: +(0.11 + Math.abs(Math.sin(id * 3)) * 0.06).toFixed(2) });
      }
      if (r < rows - 1) {
        edges.push({ source: id, target: id + cols, errorRate: +(0.13 + Math.abs(Math.cos(id * 2)) * 0.07).toFixed(2) });
      }
    }
  }
  return { nodes, edges };
};

// Helper for Heavy-Hex (27 nodes)
export const generateHeavyHex = (): { nodes: QpuNode[]; edges: QpuEdge[] } => {
  const nodes: QpuNode[] = [];
  const edges: QpuEdge[] = [];
  const coords = [
    { id: 0, x: 80, y: 60 }, { id: 1, x: 160, y: 60 }, { id: 2, x: 240, y: 60 }, { id: 3, x: 320, y: 60 }, { id: 4, x: 400, y: 60 },
    { id: 5, x: 80, y: 120 }, { id: 6, x: 240, y: 120 }, { id: 7, x: 400, y: 120 },
    { id: 8, x: 80, y: 180 }, { id: 9, x: 160, y: 180 }, { id: 10, x: 240, y: 180 }, { id: 11, x: 320, y: 180 }, { id: 12, x: 400, y: 180 },
    { id: 13, x: 160, y: 240 }, { id: 14, x: 320, y: 240 },
    { id: 15, x: 80, y: 300 }, { id: 16, x: 160, y: 300 }, { id: 17, x: 240, y: 300 }, { id: 18, x: 320, y: 300 }, { id: 19, x: 400, y: 300 },
    { id: 20, x: 80, y: 360 }, { id: 21, x: 240, y: 360 }, { id: 22, x: 400, y: 360 },
    { id: 23, x: 80, y: 420 }, { id: 24, x: 160, y: 420 }, { id: 25, x: 240, y: 420 }, { id: 26, x: 320, y: 420 }
  ];

  coords.forEach(c => {
    nodes.push({
      id: c.id,
      x: c.x,
      y: c.y,
      t1: Math.round(195 + (Math.sin(c.id * 1.7) * 40)),
      t2: Math.round(135 + (Math.cos(c.id * 2.3) * 30)),
      readoutError: +(0.7 + Math.abs(Math.sin(c.id * 0.9)) * 0.7).toFixed(2),
      frequency: +(4.9 + (c.id % 5) * 0.08).toFixed(2)
    });
  });

  const rawEdges = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [0, 5], [5, 8], [2, 6], [6, 10], [4, 7], [7, 12],
    [8, 9], [9, 10], [10, 11], [11, 12],
    [9, 13], [13, 16], [11, 14], [14, 18],
    [15, 16], [16, 17], [17, 18], [18, 19],
    [15, 20], [20, 23], [17, 21], [21, 25], [19, 22],
    [23, 24], [24, 25], [25, 26]
  ];

  rawEdges.forEach(([s, t]) => {
    edges.push({
      source: s,
      target: t,
      errorRate: +(0.28 + Math.abs(Math.sin(s * 7 + t)) * 0.35).toFixed(2)
    });
  });

  return { nodes, edges };
};

// Trapped Ion (12 nodes, all-to-all)
export const generateTrappedIon = (): { nodes: QpuNode[]; edges: QpuEdge[] } => {
  const nodes: QpuNode[] = [];
  const edges: QpuEdge[] = [];
  const count = 12;
  const cx = 250;
  const cy = 240;
  const r = 160;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    nodes.push({
      id: i,
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
      t1: 100000,
      t2: 1500,
      frequency: 12.6,
      readoutError: +(0.18 + Math.abs(Math.sin(i)) * 0.12).toFixed(2)
    });
  }

  for (let i = 0; i < count; i++) {
    for (let j = i + 1; j < count; j++) {
      edges.push({
        source: i,
        target: j,
        errorRate: +(0.32 + Math.abs(Math.sin(i * j)) * 0.2).toFixed(2)
      });
    }
  }

  return { nodes, edges };
};

// QuEra Neutral Atom (16 nodes tweezer grid)
export const generateNeutralAtom = (): { nodes: QpuNode[]; edges: QpuEdge[] } => {
  const nodes: QpuNode[] = [];
  const edges: QpuEdge[] = [];
  const rows = 4;
  const cols = 4;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = r * cols + c;
      nodes.push({
        id,
        x: 95 + c * 80,
        y: 85 + r * 90,
        t1: 3500,
        t2: 1800,
        readoutError: +(0.42 + Math.abs(Math.sin(id)) * 0.18).toFixed(2),
        frequency: 6.83
      });
    }
  }

  for (let i = 0; i < 16; i++) {
    for (let j = i + 1; j < 16; j++) {
      edges.push({
        source: i,
        target: j,
        errorRate: +(0.22 + Math.abs(Math.sin(i * 3 + j)) * 0.1).toFixed(2)
      });
    }
  }

  return { nodes, edges };
};

// Rigetti Octagonal Grid (16 nodes)
export const generateRigettiOctagon = (): { nodes: QpuNode[]; edges: QpuEdge[] } => {
  const nodes: QpuNode[] = [];
  const edges: QpuEdge[] = [];
  const count = 16;
  const cx = 250;
  const cy = 240;
  const r1 = 120;
  const r2 = 180;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const r = i % 2 === 0 ? r1 : r2;
    nodes.push({
      id: i,
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
      t1: Math.round(32 + Math.abs(Math.sin(i * 2)) * 8),
      t2: Math.round(26 + Math.abs(Math.cos(i * 2.5)) * 6),
      readoutError: +(1.1 + Math.abs(Math.sin(i)) * 0.4).toFixed(2),
      frequency: +(4.6 + (i % 4) * 0.12).toFixed(2)
    });
    const next = (i + 1) % count;
    edges.push({
      source: i,
      target: next,
      errorRate: +(0.65 + Math.abs(Math.sin(i * 4)) * 0.35).toFixed(2)
    });
  }

  return { nodes, edges };
};

export const ALL_BACKENDS: QpuBackend[] = [
  {
    id: 'google_willow',
    name: 'Google Willow (105-Qubit Sub-Threshold Grid)',
    vendor: 'Google Quantum AI',
    qubitCount: 105,
    architecture: 'square_grid',
    basisGates: ['CZ', 'PhasedXZ', 'SY', 'MEASURE'],
    medianT1: 45,
    medianT2: 38,
    avgTwoQubitError: 0.14,
    gateTime1Q_ns: 25,
    gateTime2Q_ns: 32,
    ...generateWillowGrid()
  },
  {
    id: 'ibm_heron',
    name: 'IBM Heron (133-Qubit Heavy-Hex)',
    vendor: 'IBM Quantum',
    qubitCount: 133,
    architecture: 'heavy_hex',
    basisGates: ['ECR', 'RZ', 'SX', 'X', 'RESET'],
    medianT1: 220,
    medianT2: 155,
    avgTwoQubitError: 0.38,
    gateTime1Q_ns: 35,
    gateTime2Q_ns: 120,
    ...generateHeavyHex()
  },
  {
    id: 'ionq_forte',
    name: 'IonQ Forte (36-Qubit Trapped-Ion)',
    vendor: 'IonQ',
    qubitCount: 36,
    architecture: 'trapped_ion',
    basisGates: ['MS', 'G2', 'GPI', 'GPI2', 'RZ'],
    medianT1: 10000,
    medianT2: 1250,
    avgTwoQubitError: 0.32,
    gateTime1Q_ns: 15000, // 15 us for laser Raman pulse
    gateTime2Q_ns: 120000, // 120 us for MS entangling
    ...generateTrappedIon()
  },
  {
    id: 'quera_aquila',
    name: 'QuEra Aquila (256-Qubit Neutral Atom Tweezer)',
    vendor: 'QuEra Computing',
    qubitCount: 256,
    architecture: 'neutral_atom',
    basisGates: ['Rydberg_CZ', 'Rz', 'Rx', 'Global_Pulse'],
    medianT1: 3500,
    medianT2: 1800,
    avgTwoQubitError: 0.25,
    gateTime1Q_ns: 2500,
    gateTime2Q_ns: 5000,
    ...generateNeutralAtom()
  },
  {
    id: 'rigetti_ankaa',
    name: 'Rigetti Ankaa-2 (84-Qubit Square Octagon)',
    vendor: 'Rigetti Computing',
    qubitCount: 84,
    architecture: 'octagonal',
    basisGates: ['iSWAP', 'CZ', 'RZ', 'RX'],
    medianT1: 32,
    medianT2: 26,
    avgTwoQubitError: 0.68,
    gateTime1Q_ns: 40,
    gateTime2Q_ns: 75,
    ...generateRigettiOctagon()
  }
];

// Helper to benchmark one circuit across all backends
export function benchmarkCircuitAcrossBackends(circuit: GateOp[], numQubits: number): BackendComparisonResult[] {
  const originalTwoQ = circuit.filter(g =>
    g.type === 'CNOT' || g.type === 'CZ' || g.type === 'SWAP' || g.type === 'ISWAP' || g.type === 'CP' || g.type === 'CRX' || g.type === 'ECR'
  ).length;
  const original1Q = circuit.length - originalTwoQ;
  const origDepth = circuit.length > 0 ? Math.max(...circuit.map(g => g.step)) + 1 : 1;

  return ALL_BACKENDS.map(backend => {
    let swaps = 0;
    if (backend.architecture === 'trapped_ion' || backend.architecture === 'neutral_atom') {
      swaps = 0; // All-to-all connectivity or Rydberg blockade shuttling
    } else if (backend.architecture === 'square_grid') {
      swaps = Math.max(0, Math.ceil(originalTwoQ * 0.4));
    } else if (backend.architecture === 'heavy_hex') {
      swaps = Math.max(0, Math.ceil(originalTwoQ * 0.8));
    } else {
      swaps = Math.max(0, Math.ceil(originalTwoQ * 1.1));
    }

    const twoQGates = originalTwoQ + swaps * 3;
    const singleQFactor = backend.architecture === 'heavy_hex' ? 2.1 : 1.7;
    const total1Q = Math.round(original1Q * singleQFactor);
    const totalGates = total1Q + twoQGates;
    const depth = Math.round(origDepth * 1.35 + swaps * 3);

    // Duration in microseconds
    const duration_us = +((total1Q * backend.gateTime1Q_ns + twoQGates * backend.gateTime2Q_ns) / 1000).toFixed(2);

    // Fidelity calculation
    const err2Q = backend.avgTwoQubitError / 100;
    const err1Q = 0.00035;
    const rawFid = Math.pow(1 - err2Q, twoQGates) * Math.pow(1 - err1Q, total1Q);
    const estFidelity = +(rawFid * 100).toFixed(1);

    // Coherence limit margin = duration_us / min(T1, T2)
    const minT = Math.min(backend.medianT1, backend.medianT2);
    const coherenceMargin = +(duration_us / (minT * 1000) * 100).toFixed(2);

    return {
      backend,
      depth,
      totalGates,
      twoQubitGates: twoQGates,
      swapsInserted: swaps,
      estFidelity: Math.max(1, Math.min(99.9, estFidelity)),
      duration_us,
      coherenceMargin
    };
  });
}

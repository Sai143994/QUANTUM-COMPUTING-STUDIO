/**
 * Quantum Studio — Core Physics & State Types
 */

export type Complex = [number, number];

export const C = {
  add: (a?: Complex | null, b?: Complex | null): Complex => {
    const ar = a ? a[0] ?? 0 : 0;
    const ai = a ? a[1] ?? 0 : 0;
    const br = b ? b[0] ?? 0 : 0;
    const bi = b ? b[1] ?? 0 : 0;
    return [ar + br, ai + bi];
  },
  sub: (a?: Complex | null, b?: Complex | null): Complex => {
    const ar = a ? a[0] ?? 0 : 0;
    const ai = a ? a[1] ?? 0 : 0;
    const br = b ? b[0] ?? 0 : 0;
    const bi = b ? b[1] ?? 0 : 0;
    return [ar - br, ai - bi];
  },
  mul: (a?: Complex | null, b?: Complex | null): Complex => {
    const ar = a ? a[0] ?? 0 : 0;
    const ai = a ? a[1] ?? 0 : 0;
    const br = b ? b[0] ?? 0 : 0;
    const bi = b ? b[1] ?? 0 : 0;
    return [ar * br - ai * bi, ar * bi + ai * br];
  },
  scale: (s: number, a?: Complex | null): Complex => {
    const r = a ? a[0] ?? 0 : 0;
    const i = a ? a[1] ?? 0 : 0;
    return [s * r, s * i];
  },
  abs2: (a?: Complex | null): number => {
    if (!a) return 0;
    const r = a[0] ?? 0;
    const i = a[1] ?? 0;
    return r * r + i * i;
  },
  abs: (a?: Complex | null): number => {
    if (!a) return 0;
    const r = a[0] ?? 0;
    const i = a[1] ?? 0;
    return Math.sqrt(r * r + i * i);
  },
  conj: (a?: Complex | null): Complex => {
    if (!a) return [0, 0];
    return [a[0] ?? 0, -(a[1] ?? 0)];
  },
  zero: (): Complex => [0, 0],
  one: (): Complex => [1, 0],
  phase: (theta: number): Complex => [Math.cos(theta), Math.sin(theta)]
};

export type GateType =
  | 'H' | 'X' | 'Y' | 'Z' | 'S' | 'T' | 'Sdg' | 'Tdg' | 'SX'
  | 'Rx' | 'Ry' | 'Rz' | 'U1' | 'U3'
  | 'CNOT' | 'CZ' | 'CY' | 'SWAP' | 'ISWAP' | 'SQRT_SWAP' | 'CP' | 'CRX' | 'CRY' | 'CRZ' | 'ECR'
  | 'CCX' | 'CSWAP'
  | 'RESET' | 'M' | 'ERASER';

export interface GateDefinition {
  label: string;
  name: string;
  category: 'single' | 'rotation' | 'two-qubit' | 'three-qubit' | 'utility';
  matrix?: [Complex[], Complex[]];
  twoQubit?: boolean;
  threeQubit?: boolean;
  measure?: boolean;
  eraser?: boolean;
  custom?: boolean;
  description: string;
}

export interface GateOp {
  type: GateType;
  step: number;
  qubit?: number;
  control?: number;
  target?: number;
  q1?: number;
  q2?: number;
  c1?: number;
  c2?: number;
  t1?: number;
  t2?: number;
  angle?: number;
  theta?: number;
  phi?: number;
  lam?: number;
}

export type NoiseChannel = 'dephasing' | 'bitflip' | 'phaseflip' | 'depolarizing' | 'amplitude_damping';

export interface CircuitCommit {
  id: string;
  timestamp: number;
  label: string;
  gates: GateOp[];
  numQubits: number;
  rotAngle: number;
  entropy?: number;
  topState?: string;
  actionType?: 'add' | 'remove' | 'preset' | 'clear' | 'load';
}

export function rotationMatrix(type: 'Rx' | 'Ry' | 'Rz', theta: number): [Complex[], Complex[]] {
  const h = theta / 2;
  if (type === 'Rx') {
    return [
      [[Math.cos(h), 0], [0, -Math.sin(h)]],
      [[0, -Math.sin(h)], [Math.cos(h), 0]]
    ];
  }
  if (type === 'Rz') {
    return [
      [[Math.cos(-h), Math.sin(-h)], [0, 0]],
      [[0, 0], [Math.cos(h), Math.sin(h)]]
    ];
  }
  // Ry
  return [
    [[Math.cos(h), 0], [-Math.sin(h), 0]],
    [[Math.sin(h), 0], [Math.cos(h), 0]]
  ];
}

export function u3Matrix(theta: number, phi: number, lam: number): [Complex[], Complex[]] {
  const h = theta / 2;
  const c = Math.cos(h);
  const s = Math.sin(h);

  // m00 = cos(theta/2)
  const m00: Complex = [c, 0];
  // m01 = -e^(i*lam) * sin(theta/2) = -cos(lam)*s - i*sin(lam)*s
  const m01: Complex = [-Math.cos(lam) * s, -Math.sin(lam) * s];
  // m10 = e^(i*phi) * sin(theta/2) = cos(phi)*s + i*sin(phi)*s
  const m10: Complex = [Math.cos(phi) * s, Math.sin(phi) * s];
  // m11 = e^(i*(phi+lam)) * cos(theta/2) = cos(phi+lam)*c + i*sin(phi+lam)*c
  const m11: Complex = [Math.cos(phi + lam) * c, Math.sin(phi + lam) * c];

  return [
    [m00, m01],
    [m10, m11]
  ];
}

export const CZ_MATRIX: Complex[][] = [
  [[1, 0], [0, 0], [0, 0], [0, 0]],
  [[0, 0], [1, 0], [0, 0], [0, 0]],
  [[0, 0], [0, 0], [1, 0], [0, 0]],
  [[0, 0], [0, 0], [0, 0], [-1, 0]]
];

export const CY_MATRIX: Complex[][] = [
  [[1, 0], [0, 0], [0, 0], [0, 0]],
  [[0, 0], [1, 0], [0, 0], [0, 0]],
  [[0, 0], [0, 0], [0, 0], [0, -1]],
  [[0, 0], [0, 0], [0, 1], [0, 0]]
];

export const ISWAP_MATRIX: Complex[][] = [
  [[1, 0], [0, 0], [0, 0], [0, 0]],
  [[0, 0], [0, 0], [0, 1], [0, 0]],
  [[0, 0], [0, 1], [0, 0], [0, 0]],
  [[0, 0], [0, 0], [0, 0], [1, 0]]
];

export const GATES_REGISTRY: Record<GateType, GateDefinition> = {
  H: {
    label: 'H',
    name: 'Hadamard',
    category: 'single',
    description: 'Creates equal superposition |0⟩ → (|0⟩+|1⟩)/√2',
    matrix: [
      [C.scale(1 / Math.SQRT2, [1, 0]), C.scale(1 / Math.SQRT2, [1, 0])],
      [C.scale(1 / Math.SQRT2, [1, 0]), C.scale(1 / Math.SQRT2, [-1, 0])]
    ]
  },
  X: {
    label: 'X',
    name: 'Pauli-X (NOT)',
    category: 'single',
    description: 'Bit-flip gate: |0⟩ ↔ |1⟩',
    matrix: [[[0, 0], [1, 0]], [[1, 0], [0, 0]]]
  },
  Y: {
    label: 'Y',
    name: 'Pauli-Y',
    category: 'single',
    description: 'Bit- and phase-flip: |0⟩ → i|1⟩, |1⟩ → -i|0⟩',
    matrix: [[[0, 0], [0, -1]], [[0, 1], [0, 0]]]
  },
  Z: {
    label: 'Z',
    name: 'Pauli-Z',
    category: 'single',
    description: 'Phase-flip: |1⟩ → -|1⟩',
    matrix: [[[1, 0], [0, 0]], [[0, 0], [-1, 0]]]
  },
  S: {
    label: 'S',
    name: 'Phase (π/2)',
    category: 'single',
    description: 'Quarter-turn phase gate: |1⟩ → i|1⟩',
    matrix: [[[1, 0], [0, 0]], [[0, 0], [0, 1]]]
  },
  T: {
    label: 'T',
    name: 'T (π/4)',
    category: 'single',
    description: 'Eighth-turn non-Clifford phase gate',
    matrix: [[[1, 0], [0, 0]], [[0, 0], C.phase(Math.PI / 4)]]
  },
  Sdg: {
    label: 'S†',
    name: 'S-Dagger (-π/2)',
    category: 'single',
    description: 'Inverse quarter-turn: |1⟩ → -i|1⟩',
    matrix: [[[1, 0], [0, 0]], [[0, 0], [0, -1]]]
  },
  Tdg: {
    label: 'T†',
    name: 'T-Dagger (-π/4)',
    category: 'single',
    description: 'Inverse eighth-turn non-Clifford phase gate',
    matrix: [[[1, 0], [0, 0]], [[0, 0], C.phase(-Math.PI / 4)]]
  },
  SX: {
    label: '√X',
    name: 'Sqrt-NOT',
    category: 'single',
    description: 'Native basis gate on IBM superconducting hardware',
    matrix: [[[0.5, 0.5], [0.5, -0.5]], [[0.5, -0.5], [0.5, 0.5]]]
  },
  Rx: {
    label: 'Rx',
    name: 'Rotation-X (θ)',
    category: 'rotation',
    custom: true,
    description: 'Continuous rotation around X-axis by angle θ'
  },
  Ry: {
    label: 'Ry',
    name: 'Rotation-Y (θ)',
    category: 'rotation',
    custom: true,
    description: 'Continuous rotation around Y-axis by angle θ'
  },
  Rz: {
    label: 'Rz',
    name: 'Rotation-Z (θ)',
    category: 'rotation',
    custom: true,
    description: 'Continuous phase rotation around Z-axis by angle θ'
  },
  U1: {
    label: 'U1',
    name: 'Phase Shift (λ)',
    category: 'rotation',
    custom: true,
    description: 'Single-qubit arbitrary phase gate: diag(1, e^{iλ})'
  },
  U3: {
    label: 'U3',
    name: 'Universal U3(θ, φ, λ)',
    category: 'rotation',
    custom: true,
    description: 'Universal single-qubit unitary rotation parameterised by polar angle θ, azimuth φ, and phase λ'
  },
  CNOT: {
    label: 'CX',
    name: 'Controlled-NOT',
    category: 'two-qubit',
    twoQubit: true,
    description: 'Flips target qubit if control qubit is |1⟩'
  },
  CZ: {
    label: 'CZ',
    name: 'Controlled-Z',
    category: 'two-qubit',
    twoQubit: true,
    description: 'Applies phase-flip -1 if both qubits are |1⟩'
  },
  CY: {
    label: 'CY',
    name: 'Controlled-Y',
    category: 'two-qubit',
    twoQubit: true,
    description: 'Applies Pauli-Y to target if control is |1⟩'
  },
  SWAP: {
    label: 'SWAP',
    name: 'Swap',
    category: 'two-qubit',
    twoQubit: true,
    description: 'Exchanges quantum states between two qubits'
  },
  ISWAP: {
    label: 'iSWAP',
    name: 'iSWAP',
    category: 'two-qubit',
    twoQubit: true,
    description: 'Swaps states and adds i phase to |01⟩ and |10⟩'
  },
  SQRT_SWAP: {
    label: '√SW',
    name: 'Sqrt-SWAP',
    category: 'two-qubit',
    twoQubit: true,
    description: 'Square root of SWAP gate; entangling basis gate'
  },
  CP: {
    label: 'CP',
    name: 'Controlled-Phase',
    category: 'two-qubit',
    twoQubit: true,
    description: 'Multiplies |11⟩ amplitude by e^{iθ}'
  },
  CRX: {
    label: 'CRx',
    name: 'Controlled-Rx (θ)',
    category: 'two-qubit',
    twoQubit: true,
    custom: true,
    description: 'Applies Rx(θ) to target if control is |1⟩'
  },
  CRY: {
    label: 'CRy',
    name: 'Controlled-Ry (θ)',
    category: 'two-qubit',
    twoQubit: true,
    custom: true,
    description: 'Applies Ry(θ) to target if control is |1⟩'
  },
  CRZ: {
    label: 'CRz',
    name: 'Controlled-Rz (θ)',
    category: 'two-qubit',
    twoQubit: true,
    custom: true,
    description: 'Applies Rz(θ) to target if control is |1⟩'
  },
  ECR: {
    label: 'ECR',
    name: 'Echoed Cross-Resonance',
    category: 'two-qubit',
    twoQubit: true,
    description: 'Native entangling cross-resonance gate on IBM Falcon/Eagle QPUs'
  },
  CCX: {
    label: 'CCX',
    name: 'Toffoli (CCNOT)',
    category: 'three-qubit',
    threeQubit: true,
    description: 'Reversible AND: flips target if both controls are |1⟩'
  },
  CSWAP: {
    label: 'CSWAP',
    name: 'Fredkin (CSWAP)',
    category: 'three-qubit',
    threeQubit: true,
    description: 'Controlled SWAP: swaps targets if control is |1⟩'
  },
  RESET: {
    label: '|0⟩',
    name: 'Qubit Reset',
    category: 'utility',
    description: 'Non-unitary reset: forces qubit back to |0⟩ state'
  },
  M: {
    label: 'MEAS',
    name: 'Measurement',
    category: 'utility',
    measure: true,
    description: 'Projective Born measurement in computational basis'
  },
  ERASER: {
    label: 'ERASE',
    name: 'Eraser',
    category: 'utility',
    eraser: true,
    description: 'Click any gate slot to remove it from the circuit'
  }
};

/**
 * High-performance statevector simulator engine
 */
export class QuantumState {
  n: number;
  dim: number;
  sv: Complex[];

  constructor(n: number) {
    this.n = n;
    this.dim = 1 << n;
    this.sv = new Array(this.dim).fill(null).map((_, i) => (i === 0 ? [1, 0] : [0, 0]));
  }

  clone(): QuantumState {
    const q = new QuantumState(this.n);
    q.sv = this.sv.map(amp => [amp ? amp[0] : 0, amp ? amp[1] : 0]);
    return q;
  }

  probabilities(): number[] {
    return this.sv.map(a => C.abs2(a));
  }

  applyGate(qubit: number, matrix: [Complex[], Complex[]]) {
    if (qubit < 0 || qubit >= this.n || !matrix) return;
    const newSv = new Array<Complex>(this.dim);
    for (let i = 0; i < this.dim; i++) {
      const bit = (i >> qubit) & 1;
      if (bit === 0) {
        const j = i | (1 << qubit);
        const a0 = this.sv[i] || [0, 0];
        const a1 = this.sv[j] || [0, 0];
        newSv[i] = C.add(C.mul(matrix[0][0], a0), C.mul(matrix[0][1], a1));
        newSv[j] = C.add(C.mul(matrix[1][0], a0), C.mul(matrix[1][1], a1));
      }
    }
    this.sv = newSv;
  }

  applyCNOT(control: number, target: number) {
    if (control < 0 || control >= this.n || target < 0 || target >= this.n || control === target) return;
    const newSv = [...this.sv];
    for (let i = 0; i < this.dim; i++) {
      const cb = (i >> control) & 1;
      if (cb === 1) {
        const j = i ^ (1 << target);
        if (i < j && j < this.dim) {
          [newSv[i], newSv[j]] = [newSv[j], newSv[i]];
        }
      }
    }
    this.sv = newSv;
  }

  applyCZ(control: number, target: number) {
    if (control < 0 || control >= this.n || target < 0 || target >= this.n || control === target) return;
    const newSv = [...this.sv];
    for (let i = 0; i < this.dim; i++) {
      const cb = (i >> control) & 1;
      const tb = (i >> target) & 1;
      if (cb === 1 && tb === 1) {
        newSv[i] = [-newSv[i][0], -newSv[i][1]];
      }
    }
    this.sv = newSv;
  }

  applyToffoli(c1: number, c2: number, target: number) {
    if (c1 < 0 || c1 >= this.n || c2 < 0 || c2 >= this.n || target < 0 || target >= this.n) return;
    const newSv = [...this.sv];
    for (let i = 0; i < this.dim; i++) {
      const b1 = (i >> c1) & 1;
      const b2 = (i >> c2) & 1;
      if (b1 === 1 && b2 === 1) {
        const j = i ^ (1 << target);
        if (i < j && j < this.dim) {
          [newSv[i], newSv[j]] = [this.sv[j], this.sv[i]];
        }
      }
    }
    this.sv = newSv;
  }

  applyFredkin(control: number, t1: number, t2: number) {
    if (control < 0 || control >= this.n || t1 < 0 || t1 >= this.n || t2 < 0 || t2 >= this.n) return;
    const newSv = [...this.sv];
    for (let i = 0; i < this.dim; i++) {
      const c = (i >> control) & 1;
      const b1 = (i >> t1) & 1;
      const b2 = (i >> t2) & 1;
      if (c === 1 && b1 !== b2) {
        const j = i ^ (1 << t1) ^ (1 << t2);
        if (i < j && j < this.dim) {
          [newSv[i], newSv[j]] = [this.sv[j], this.sv[i]];
        }
      }
    }
    this.sv = newSv;
  }

  applySWAP(q1: number, q2: number) {
    if (q1 < 0 || q1 >= this.n || q2 < 0 || q2 >= this.n || q1 === q2) return;
    const newSv = [...this.sv];
    for (let i = 0; i < this.dim; i++) {
      const b1 = (i >> q1) & 1;
      const b2 = (i >> q2) & 1;
      if (b1 !== b2) {
        const j = i ^ (1 << q1) ^ (1 << q2);
        if (i < j && j < this.dim) {
          [newSv[i], newSv[j]] = [this.sv[j], this.sv[i]];
        }
      }
    }
    this.sv = newSv;
  }

  applyTwoQubitUnitary(qa: number, qb: number, U: Complex[][]) {
    if (qa < 0 || qa >= this.n || qb < 0 || qb >= this.n || qa === qb || !U) return;
    const newSv: Complex[] = this.sv.map(amp => [amp ? amp[0] : 0, amp ? amp[1] : 0]);
    const maskA = 1 << qa;
    const maskB = 1 << qb;
    for (let i = 0; i < this.dim; i++) {
      if ((i & maskA) || (i & maskB)) continue;
      const idx = [i, i | maskB, i | maskA, i | maskA | maskB];
      const vec: Complex[] = idx.map(ix => this.sv[ix] || [0, 0]);
      for (let r = 0; r < 4; r++) {
        let re = 0;
        let im = 0;
        for (let c = 0; c < 4; c++) {
          const uEntry = U[r]?.[c] || [0, 0];
          const vEntry = vec[c] || [0, 0];
          const ur = uEntry[0] ?? 0;
          const ui = uEntry[1] ?? 0;
          const vr = vEntry[0] ?? 0;
          const vi = vEntry[1] ?? 0;
          re += ur * vr - ui * vi;
          im += ur * vi + ui * vr;
        }
        if (idx[r] < this.dim) {
          newSv[idx[r]] = [re, im];
        }
      }
    }
    this.sv = newSv;
  }

  applyControlledPhase(control: number, target: number, theta: number) {
    if (control < 0 || control >= this.n || target < 0 || target >= this.n || control === target) return;
    const U: Complex[][] = [
      [[1, 0], [0, 0], [0, 0], [0, 0]],
      [[0, 0], [1, 0], [0, 0], [0, 0]],
      [[0, 0], [0, 0], [1, 0], [0, 0]],
      [[0, 0], [0, 0], [0, 0], [Math.cos(theta), Math.sin(theta)]]
    ];
    this.applyTwoQubitUnitary(control, target, U);
  }

  measureQubit(qubit: number): number {
    if (qubit < 0 || qubit >= this.n) return 0;
    let p1 = 0;
    for (let i = 0; i < this.dim; i++) {
      if ((i >> qubit) & 1) p1 += C.abs2(this.sv[i]);
    }
    const outcome = Math.random() < p1 ? 1 : 0;
    let norm = 0;
    const newSv = this.sv.map((amp, i) => {
      const bit = (i >> qubit) & 1;
      if (bit !== outcome) return [0, 0] as Complex;
      norm += C.abs2(amp);
      return [amp ? amp[0] : 0, amp ? amp[1] : 0] as Complex;
    });
    const s = Math.sqrt(norm) || 1;
    this.sv = newSv.map(([re, im]) => [re / s, im / s]);
    return outcome;
  }

  measure(): number {
    const probs = this.probabilities();
    const r = Math.random();
    let cumul = 0;
    for (let i = 0; i < this.dim; i++) {
      cumul += probs[i] || 0;
      if (r < cumul) return i;
    }
    return this.dim - 1;
  }

  entropy(): number {
    const probs = this.probabilities();
    let S = 0;
    probs.forEach(p => {
      if (p > 1e-9) S -= p * Math.log2(p);
    });
    return S;
  }

  reducedState(qubit: number) {
    if (qubit < 0 || qubit >= this.n) {
      return {
        r00: [1, 0] as Complex,
        r01: [0, 0] as Complex,
        r10: [0, 0] as Complex,
        r11: [0, 0] as Complex
      };
    }
    let r00: Complex = [0, 0];
    let r01: Complex = [0, 0];
    let r10: Complex = [0, 0];
    let r11: Complex = [0, 0];
    for (let i = 0; i < this.dim; i++) {
      const b = (i >> qubit) & 1;
      for (let j = 0; j < this.dim; j++) {
        if (((j ^ i) & ~(1 << qubit)) !== 0) continue;
        const jb = (j >> qubit) & 1;
        const prod = C.mul(this.sv[i], C.conj(this.sv[j]));
        if (b === 0 && jb === 0) r00 = C.add(r00, prod);
        if (b === 0 && jb === 1) r01 = C.add(r01, prod);
        if (b === 1 && jb === 0) r10 = C.add(r10, prod);
        if (b === 1 && jb === 1) r11 = C.add(r11, prod);
      }
    }
    return { r00, r01, r10, r11 };
  }

  blochVector(qubit: number): { x: number; y: number; z: number } {
    if (qubit < 0 || qubit >= this.n) return { x: 0, y: 0, z: 1 };
    const d = this.reducedState(qubit);
    const x = 2 * d.r01[0];
    const y = -2 * d.r01[1];
    const z = d.r00[0] - d.r11[0];
    return { x, y, z };
  }

  reducedState2(qa: number, qb: number): Complex[][] {
    const rho: Complex[][] = Array.from({ length: 4 }, () =>
      Array.from({ length: 4 }, () => [0, 0] as Complex)
    );
    if (qa < 0 || qa >= this.n || qb < 0 || qb >= this.n || qa === qb) {
      return rho;
    }
    const mask = ~((1 << qa) | (1 << qb));
    for (let i = 0; i < this.dim; i++) {
      const ia = (i >> qa) & 1;
      const ib = (i >> qb) & 1;
      const rowIdx = ia * 2 + ib;
      for (let j = 0; j < this.dim; j++) {
        if (((i ^ j) & mask) !== 0) continue;
        const ja = (j >> qa) & 1;
        const jb = (j >> qb) & 1;
        const colIdx = ja * 2 + jb;
        rho[rowIdx][colIdx] = C.add(
          rho[rowIdx][colIdx],
          C.mul(this.sv[i], C.conj(this.sv[j]))
        );
      }
    }
    return rho;
  }

  linearEntropy2(qa: number, qb: number): number {
    const rho = this.reducedState2(qa, qb);
    let tr2 = 0;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        tr2 += C.abs2(rho[i][j]);
      }
    }
    return Math.max(0, 1 - tr2);
  }

  /**
   * Computes the exact expectation value <ψ| P |ψ> for single-qubit Pauli operator P ∈ {X, Y, Z}
   */
  pauliExpectation(qubit: number, pauli: 'X' | 'Y' | 'Z'): number {
    if (qubit < 0 || qubit >= this.n) return 0;
    const bv = this.blochVector(qubit);
    if (pauli === 'X') return bv.x;
    if (pauli === 'Y') return bv.y;
    return bv.z;
  }

  /**
   * Computes the exact 2-qubit correlation expectation value <ψ| P1 ⊗ P2 |ψ>
   */
  twoQubitExpectation(q1: number, q2: number, p1: 'X' | 'Y' | 'Z', p2: 'X' | 'Y' | 'Z'): number {
    if (q1 < 0 || q1 >= this.n || q2 < 0 || q2 >= this.n || q1 === q2) return 0;
    const rho = this.reducedState2(q1, q2);
    
    // Pauli 2x2 matrices
    const pauliMatrix: Record<'X' | 'Y' | 'Z', Complex[][]> = {
      X: [[[0, 0], [1, 0]], [[1, 0], [0, 0]]],
      Y: [[[0, 0], [0, -1]], [[0, 1], [0, 0]]],
      Z: [[[1, 0], [0, 0]], [[0, 0], [-1, 0]]]
    };
    
    const m1 = pauliMatrix[p1];
    const m2 = pauliMatrix[p2];
    
    // Kronecker product M = m1 ⊗ m2 (4x4)
    const M: Complex[][] = Array.from({ length: 4 }, () =>
      Array.from({ length: 4 }, () => [0, 0] as Complex)
    );
    for (let r1 = 0; r1 < 2; r1++) {
      for (let c1 = 0; c1 < 2; c1++) {
        for (let r2 = 0; r2 < 2; r2++) {
          for (let c2 = 0; c2 < 2; c2++) {
            M[r1 * 2 + r2][c1 * 2 + c2] = C.mul(m1[r1][c1], m2[r2][c2]);
          }
        }
      }
    }
    
    // Tr(rho * M)
    let expVal = 0;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        // (rho * M)[i][i] = sum_j rho[i][j] * M[j][i]
        const prod = C.mul(rho[i][j], M[j][i]);
        expVal += prod[0]; // Real part (observable expectation is strictly real)
      }
    }
    return Math.max(-1, Math.min(1, expVal));
  }

  /**
   * Computes quantum state fidelity F(|ψ⟩, |φ⟩) = |⟨ψ|φ⟩|²
   */
  fidelity(other: QuantumState): number {
    if (this.n !== other.n || this.dim !== other.dim) return 0;
    let dotReal = 0;
    let dotImag = 0;
    for (let i = 0; i < this.dim; i++) {
      const a = this.sv[i];
      const b = other.sv[i];
      // conj(a) * b = (ar - i ai) * (br + i bi) = (ar*br + ai*bi) + i(ar*bi - ai*br)
      dotReal += a[0] * b[0] + a[1] * b[1];
      dotImag += a[0] * b[1] - a[1] * b[0];
    }
    return Math.min(1.0, dotReal * dotReal + dotImag * dotImag);
  }

  /**
   * Full total density matrix ρ = |ψ⟩⟨ψ| for n <= 5 (dim <= 32)
   */
  totalDensityMatrix(): Complex[][] {
    const d = Math.min(this.dim, 32);
    const rho: Complex[][] = Array.from({ length: d }, () =>
      Array.from({ length: d }, () => [0, 0] as Complex)
    );
    for (let i = 0; i < d; i++) {
      for (let j = 0; j < d; j++) {
        rho[i][j] = C.mul(this.sv[i], C.conj(this.sv[j]));
      }
    }
    return rho;
  }

  /**
   * Synthesize full 2^n x 2^n unitary matrix U_circuit for n <= 4
   */
  static synthesizeCircuitUnitary(numQubits: number, circuit: GateOp[], rotAngle: number = Math.PI / 4): Complex[][] {
    const n = Math.min(4, Math.max(1, numQubits));
    const dim = 1 << n;
    
    // Start with Identity matrix
    let U: Complex[][] = Array.from({ length: dim }, (_, i) =>
      Array.from({ length: dim }, (_, j) => (i === j ? [1, 0] : [0, 0]) as Complex)
    );
    
    // Sort circuit steps
    const sortedSteps = [...new Set(circuit.map(g => g.step))].sort((a, b) => a - b);
    
    for (const step of sortedSteps) {
      const gates = circuit.filter(g => g.step === step);
      for (const g of gates) {
        // Evolve each basis vector through the gate
        const nextU: Complex[][] = Array.from({ length: dim }, () =>
          Array.from({ length: dim }, () => [0, 0] as Complex)
        );
        
        for (let col = 0; col < dim; col++) {
          const colState = new QuantumState(n);
          // Set state to column vector
          for (let row = 0; row < dim; row++) {
            colState.sv[row] = U[row][col];
          }
          
          // Apply gate
          const angle = g.angle !== undefined ? g.angle : rotAngle;
          if (g.qubit !== undefined && g.qubit < n) {
            if (g.type === 'H') colState.applyGate(g.qubit, GATES_REGISTRY.H.matrix!);
            else if (g.type === 'X') colState.applyGate(g.qubit, GATES_REGISTRY.X.matrix!);
            else if (g.type === 'Y') colState.applyGate(g.qubit, GATES_REGISTRY.Y.matrix!);
            else if (g.type === 'Z') colState.applyGate(g.qubit, GATES_REGISTRY.Z.matrix!);
            else if (g.type === 'S') colState.applyGate(g.qubit, GATES_REGISTRY.S.matrix!);
            else if (g.type === 'T') colState.applyGate(g.qubit, GATES_REGISTRY.T.matrix!);
            else if (g.type === 'Sdg') colState.applyGate(g.qubit, GATES_REGISTRY.Sdg.matrix!);
            else if (g.type === 'Tdg') colState.applyGate(g.qubit, GATES_REGISTRY.Tdg.matrix!);
            else if (g.type === 'SX') colState.applyGate(g.qubit, GATES_REGISTRY.SX.matrix!);
            else if (g.type === 'Rx') colState.applyGate(g.qubit, rotationMatrix('Rx', angle));
            else if (g.type === 'Ry') colState.applyGate(g.qubit, rotationMatrix('Ry', angle));
            else if (g.type === 'Rz') colState.applyGate(g.qubit, rotationMatrix('Rz', angle));
          } else if (g.control !== undefined && g.target !== undefined && g.control < n && g.target < n) {
            if (g.type === 'CNOT') colState.applyCNOT(g.control, g.target);
            else if (g.type === 'CZ') colState.applyTwoQubitUnitary(g.control, g.target, CZ_MATRIX);
            else if (g.type === 'CY') colState.applyTwoQubitUnitary(g.control, g.target, CY_MATRIX);
            else if (g.type === 'CP') colState.applyControlledPhase(g.control, g.target, angle);
          } else if (g.q1 !== undefined && g.q2 !== undefined && g.q1 < n && g.q2 < n) {
            if (g.type === 'SWAP') colState.applySWAP(g.q1, g.q2);
            else if (g.type === 'ISWAP') colState.applyTwoQubitUnitary(g.q1, g.q2, ISWAP_MATRIX);
          } else if (g.c1 !== undefined && g.c2 !== undefined && g.target !== undefined && g.c1 < n && g.c2 < n && g.target < n) {
            if (g.type === 'CCX') colState.applyToffoli(g.c1, g.c2, g.target);
          }
          
          for (let row = 0; row < dim; row++) {
            nextU[row][col] = colState.sv[row];
          }
        }
        U = nextU;
      }
    }
    
    return U;
  }

  /**
   * Professional Circuit Metrics Analysis (Clifford, Entanglers, Non-Clifford T, Depth, Quantum Volume)
   */
  static calculateMetrics(numQubits: number, circuit: GateOp[]): CircuitMetrics {
    let clifford1Q = 0;
    let entanglers2Q = 0;
    let nonCliffordT = 0;
    let measurements = 0;
    
    const cliffordSet = new Set(['H', 'X', 'Y', 'Z', 'S', 'Sdg', 'SX']);
    const entanglerSet = new Set(['CNOT', 'CZ', 'CY', 'SWAP', 'ISWAP', 'SQRT_SWAP', 'CP', 'CRX', 'CRY', 'CRZ', 'ECR']);
    const nonCliffordSet = new Set(['T', 'Tdg', 'Rx', 'Ry', 'Rz', 'U1']);
    
    circuit.forEach(g => {
      if (cliffordSet.has(g.type)) clifford1Q++;
      else if (entanglerSet.has(g.type)) entanglers2Q++;
      else if (nonCliffordSet.has(g.type)) nonCliffordT++;
      else if (g.type === 'M') measurements++;
    });
    
    // Critical path depth calculation
    const qubitDepth: number[] = new Array(numQubits).fill(0);
    circuit.forEach(g => {
      const involved: number[] = [];
      if (g.qubit !== undefined) involved.push(g.qubit);
      if (g.control !== undefined) involved.push(g.control);
      if (g.target !== undefined) involved.push(g.target);
      if (g.q1 !== undefined) involved.push(g.q1);
      if (g.q2 !== undefined) involved.push(g.q2);
      if (g.c1 !== undefined) involved.push(g.c1);
      if (g.c2 !== undefined) involved.push(g.c2);
      
      const valid = involved.filter(q => q >= 0 && q < numQubits);
      if (valid.length === 0) return;
      
      const maxD = Math.max(...valid.map(q => qubitDepth[q]));
      valid.forEach(q => {
        qubitDepth[q] = maxD + 1;
      });
    });
    
    const depth = Math.max(0, ...qubitDepth);
    const quantumVolumeLowerBound = Math.pow(2, Math.min(numQubits, depth));
    
    // Estimated physical QPU execution latency (superconducting transmon benchmark)
    // 1Q Gate ~ 25 ns, 2Q Gate ~ 200 ns, Readout ~ 800 ns
    const estimatedExecTimeNs = clifford1Q * 25 + nonCliffordT * 35 + entanglers2Q * 220 + measurements * 800;
    
    // Classical statevector RAM: 2^n * 16 bytes (2 x 64-bit floats)
    const statevectorBytes = Math.pow(2, numQubits) * 16;
    
    return {
      totalGates: circuit.length,
      clifford1Q,
      entanglers2Q,
      nonCliffordT,
      measurements,
      depth,
      quantumVolumeLowerBound,
      estimatedExecTimeNs,
      statevectorBytes
    };
  }
}

export interface CircuitMetrics {
  totalGates: number;
  clifford1Q: number;
  entanglers2Q: number;
  nonCliffordT: number;
  measurements: number;
  depth: number;
  quantumVolumeLowerBound: number;
  estimatedExecTimeNs: number;
  statevectorBytes: number;
}

/**
 * Robust OpenQASM 3.0 & 2.0 client-side parser
 */
export function parseQasm3(qasmCode: string): { numQubits: number; gates: GateOp[]; error?: string } {
  try {
    let numQubits = 4;
    const gates: GateOp[] = [];
    let currentStep = 0;

    const lines = qasmCode.split('\n');
    for (let rawLine of lines) {
      // Strip comments
      const commentIdx = rawLine.indexOf('//');
      if (commentIdx !== -1) rawLine = rawLine.substring(0, commentIdx);
      const line = rawLine.trim();
      if (!line) continue;

      // Match qubit declaration: qubit[N] q; or qreg q[N];
      const qubitDeclMatch = line.match(/(?:qubit|qreg)\s*(?:\[(\d+)\]\s*([a-zA-Z_]\w*)|([a-zA-Z_]\w*)\s*\[(\d+)\])/i);
      if (qubitDeclMatch) {
        const size = parseInt(qubitDeclMatch[1] || qubitDeclMatch[4], 10);
        if (!isNaN(size) && size > 0 && size <= 16) {
          numQubits = size;
        }
        continue;
      }

      // Skip headers / barriers
      if (line.startsWith('OPENQASM') || line.startsWith('include') || line.startsWith('bit') || line.startsWith('creg') || line.startsWith('barrier')) {
        continue;
      }

      // Helper to extract integer qubit index: q[2] -> 2
      const extractQubit = (token: string): number | null => {
        const m = token.match(/\[(\d+)\]/);
        return m ? parseInt(m[1], 10) : null;
      };

      // Match 2-qubit gates: cx q[0], q[1]; or cz q[0], q[1];
      const twoQMatch = line.match(/^(cx|cnot|cz|cy|swap|iswap|ecr)\s+([a-zA-Z_]\w*\[\d+\])\s*,\s*([a-zA-Z_]\w*\[\d+\])/i);
      if (twoQMatch) {
        const gName = twoQMatch[1].toLowerCase();
        const qA = extractQubit(twoQMatch[2]);
        const qB = extractQubit(twoQMatch[3]);
        if (qA !== null && qB !== null) {
          if (gName === 'swap' || gName === 'iswap') {
            gates.push({
              type: gName === 'swap' ? 'SWAP' : 'ISWAP',
              q1: qA,
              q2: qB,
              step: currentStep++
            });
          } else {
            const typeMap: Record<string, GateType> = {
              cx: 'CNOT',
              cnot: 'CNOT',
              cz: 'CZ',
              cy: 'CY',
              ecr: 'ECR'
            };
            gates.push({
              type: typeMap[gName] || 'CNOT',
              control: qA,
              target: qB,
              step: currentStep++
            });
          }
        }
        continue;
      }

      // Match 3-qubit gates: ccx q[0], q[1], q[2]; or cswap q[0], q[1], q[2];
      const threeQMatch = line.match(/^(ccx|cswap)\s+([a-zA-Z_]\w*\[\d+\])\s*,\s*([a-zA-Z_]\w*\[\d+\])\s*,\s*([a-zA-Z_]\w*\[\d+\])/i);
      if (threeQMatch) {
        const gName = threeQMatch[1].toLowerCase();
        const qA = extractQubit(threeQMatch[2]);
        const qB = extractQubit(threeQMatch[3]);
        const qC = extractQubit(threeQMatch[4]);
        if (qA !== null && qB !== null && qC !== null) {
          if (gName === 'ccx') {
            gates.push({ type: 'CCX', c1: qA, c2: qB, target: qC, step: currentStep++ });
          } else {
            gates.push({ type: 'CSWAP', control: qA, t1: qB, t2: qC, step: currentStep++ });
          }
        }
        continue;
      }

      // Match parameterized gates: rx(1.57) q[0]; or cphase(0.78) q[0], q[1];
      const paramMatch = line.match(/^(rx|ry|rz|u1|p|cphase|cp)\s*\(\s*([^)]+)\s*\)\s+([^;]+)/i);
      if (paramMatch) {
        const gName = paramMatch[1].toLowerCase();
        const angleStr = paramMatch[2].replace(/pi/gi, String(Math.PI));
        let angle = 0;
        try {
          angle = Function(`"use strict"; return (${angleStr});`)();
        } catch {
          angle = parseFloat(angleStr) || 0;
        }

        const args = paramMatch[3].split(',').map(s => extractQubit(s.trim()));
        if (gName === 'cphase' || gName === 'cp') {
          if (args.length >= 2 && args[0] !== null && args[1] !== null) {
            gates.push({ type: 'CP', control: args[0]!, target: args[1]!, angle, step: currentStep++ });
          }
        } else {
          if (args.length >= 1 && args[0] !== null) {
            const typeMap: Record<string, GateType> = {
              rx: 'Rx',
              ry: 'Ry',
              rz: 'Rz',
              u1: 'U1',
              p: 'U1'
            };
            gates.push({ type: typeMap[gName] || 'Rx', qubit: args[0]!, angle, step: currentStep++ });
          }
        }
        continue;
      }

      // Match measurement: measure q[0] -> c[0]; or c[0] = measure q[0];
      const measureMatch = line.match(/measure\s+([a-zA-Z_]\w*\[\d+\])/i);
      if (measureMatch) {
        const qIdx = extractQubit(measureMatch[1]);
        if (qIdx !== null) {
          gates.push({ type: 'M', qubit: qIdx, step: currentStep++ });
        }
        continue;
      }

      // Match single-qubit gates: h q[0]; x q[1]; etc.
      const singleQMatch = line.match(/^(h|x|y|z|s|t|sdg|tdg|sx|reset)\s+([a-zA-Z_]\w*\[\d+\])/i);
      if (singleQMatch) {
        const gName = singleQMatch[1].toLowerCase();
        const qIdx = extractQubit(singleQMatch[2]);
        if (qIdx !== null) {
          const typeMap: Record<string, GateType> = {
            h: 'H',
            x: 'X',
            y: 'Y',
            z: 'Z',
            s: 'S',
            t: 'T',
            sdg: 'Sdg',
            tdg: 'Tdg',
            sx: 'SX',
            reset: 'RESET'
          };
          gates.push({ type: typeMap[gName] || 'H', qubit: qIdx, step: currentStep++ });
        }
      }
    }

    if (gates.length === 0) {
      return { numQubits, gates: [], error: 'No recognizable gate instructions found in QASM code' };
    }

    return { numQubits, gates };
  } catch (err: any) {
    return { numQubits: 4, gates: [], error: err.message || 'Failed to parse QASM code' };
  }
}


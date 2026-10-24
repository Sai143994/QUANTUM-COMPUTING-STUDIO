import { GateOp } from '../../types/quantum';

export interface QpuNode {
  id: number;
  x: number;
  y: number;
  t1: number; // in microseconds
  t2: number; // in microseconds
  readoutError: number; // percentage
  frequency: number; // GHz
}

export interface QpuEdge {
  source: number;
  target: number;
  errorRate: number; // percentage (e.g. 0.35%)
}

export interface QpuBackend {
  id: string;
  name: string;
  vendor: string;
  qubitCount: number;
  architecture: 'heavy_hex' | 'square_grid' | 'octagonal' | 'trapped_ion' | 'neutral_atom';
  basisGates: string[];
  medianT1: number;
  medianT2: number;
  avgTwoQubitError: number;
  gateTime1Q_ns: number;
  gateTime2Q_ns: number;
  nodes: QpuNode[];
  edges: QpuEdge[];
}

export interface TranspilePassInfo {
  id: string;
  name: string;
  stage: string;
  description: string;
  gateCount: number;
  depth: number;
  swapsInserted: number;
  fidelityEstimate: number;
  gatesSample: string[];
}

export interface TranspiledStepOp {
  step: number;
  type: string;
  qubits: number[]; // physical qubits
  logicalQubits?: number[];
  isSwap?: boolean;
  duration_ns: number;
  errorRate: number;
}

export interface BackendComparisonResult {
  backend: QpuBackend;
  depth: number;
  totalGates: number;
  twoQubitGates: number;
  swapsInserted: number;
  estFidelity: number;
  duration_us: number;
  coherenceMargin: number;
}

export type HeatmapMode = 'active' | 't1' | 't2' | 'readout' | 'coupler' | 'crosstalk';

export interface CompilerPassSettings {
  redundantCancellation: boolean;
  eulerDecomposition: boolean;
  commutationAnalysis: boolean;
  sabreLookahead: boolean;
  dynamicalDecoupling: boolean;
  pauliTwirling: boolean;
}

export interface FtqcTranspileResult {
  codeDistance: number;
  physicalQubitsPerLogical: number;
  totalPhysicalQubits: number;
  logicalQubitCount: number;
  tGateCount: number;
  magicStateDistillationRounds: number;
  distillationFactories: number;
  syndromeExtractionCycles: number;
  physicalErrorRate: number;
  logicalErrorRate: number;
  latticeSurgerySteps: number;
  ldpcPhysicalSavingsPercent: number;
}

export interface ZneDataPoint {
  scaleFactor: number; // e.g. 1.0, 1.5, 2.0, 3.0
  measuredExpectation: number;
  noiseMultiplier: number;
}

export interface PulseScheduleSlot {
  channel: string;
  channelType: 'drive' | 'control' | 'readout' | 'decoupling';
  qubit: number;
  gateType: string;
  start_ns: number;
  duration_ns: number;
  amplitude: number;
  phase_rad: number;
  isVirtualZ?: boolean;
}

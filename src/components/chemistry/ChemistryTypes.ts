export type FermionMapping = 'jordan_wigner' | 'bravyi_kitaev' | 'parity_2q_reduced';

export type ChemistryAnsatz = 'uccsd' | 'k_upccgsd' | 'hardware_efficient' | 'adapt_vqe';

export type ClassicalOptimizer = 'cobyla' | 'spsa' | 'adam_param_shift' | 'quantum_natural_gradient';

export interface IndustrialMolecule {
  id: string;
  name: string;
  formula: string;
  category: 'benchmark' | 'clean_energy' | 'battery_tech' | 'industrial_catalysis' | 'carbon_capture';
  qubits: {
    jordan_wigner: number;
    bravyi_kitaev: number;
    parity_reduced: number;
  };
  electrons: number;
  activeOrbitals: number;
  equilibriumR: number; // Angstroms or parameter
  minR: number;
  maxR: number;
  nuclearRepulsionEnergy: number; // Hartrees
  hfEnergy: number; // Hartrees
  fciEnergy: number; // Hartrees
  ccsdEnergy: number; // Hartrees
  description: string;
  industrialImpact: string;
  atoms: Array<{ element: string; x: number; y: number; z: number; color: string; radius: number }>;
  bonds: Array<[number, number]>;
  homoLumoGap_eV: number;
}

export interface PauliTerm {
  pauli: string;
  coefficient: number;
  weight: number;
}

export interface VqeConvergencePoint {
  iteration: number;
  energy: number;
  parameters: number[];
  gradientNorm: number;
  variance: number;
}

export interface ExcitedStateSpec {
  stateIndex: number;
  label: string; // e.g. S0 (Ground), S1 (First Excited Singlet), T1 (Lowest Triplet)
  spinMultiplicity: string; // Singlet, Triplet
  energy_Ha: number;
  excitationEnergy_eV: number;
  transitionDipole: number;
  oscillatorStrength: number;
}

export interface ActiveSpaceConfig {
  activeElectrons: number;
  activeOrbitals: number;
  coreElectrons: number;
  coreOrbitals: number;
  virtualOrbitals: number;
  requiredQubits: number;
}

export interface ReactionPathwayStep {
  coordinate: number;
  label: string;
  energy_Ha: number;
  relative_kcal_mol: number;
  isTransitionState?: boolean;
}

export interface QpeResourceEstimate {
  algorithm: 'Qubitization (Double Factorization)' | 'Trotterized (First Order)' | 'Tensor Hypercontraction (THC)';
  logicalQubits: number;
  toffoliGates: number;
  tGates: number;
  codeDistance: number;
  physicalQubits: number;
  runtime_hours: number;
}

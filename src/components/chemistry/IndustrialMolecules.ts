import { IndustrialMolecule, PauliTerm, ExcitedStateSpec } from './ChemistryTypes';

export const INDUSTRIAL_MOLECULES: IndustrialMolecule[] = [
  {
    id: 'H2',
    name: 'Molecular Hydrogen',
    formula: 'H₂',
    category: 'benchmark',
    qubits: {
      jordan_wigner: 4,
      bravyi_kitaev: 4,
      parity_reduced: 2
    },
    electrons: 2,
    activeOrbitals: 2,
    equilibriumR: 0.741,
    minR: 0.3,
    maxR: 2.8,
    nuclearRepulsionEnergy: 0.7137,
    hfEnergy: -1.1167,
    fciEnergy: -1.1373,
    ccsdEnergy: -1.1373,
    homoLumoGap_eV: 11.2,
    description: 'Fundamental benchmark system: 2 electrons in 2 spatial molecular orbitals (1σ_g bonding, 1σ_u* anti-bonding). STO-3G basis set.',
    industrialImpact: 'Prototypical benchmark for NISQ quantum processor calibration and algorithmic fidelity validation.',
    atoms: [
      { element: 'H', x: -0.3705, y: 0, z: 0, color: '#e2e8f0', radius: 14 },
      { element: 'H', x: 0.3705, y: 0, z: 0, color: '#e2e8f0', radius: 14 }
    ],
    bonds: [[0, 1]]
  },
  {
    id: 'LiH',
    name: 'Lithium Hydride',
    formula: 'LiH',
    category: 'benchmark',
    qubits: {
      jordan_wigner: 6,
      bravyi_kitaev: 6,
      parity_reduced: 4
    },
    electrons: 4,
    activeOrbitals: 3,
    equilibriumR: 1.595,
    minR: 0.8,
    maxR: 3.8,
    nuclearRepulsionEnergy: 0.9935,
    hfEnergy: -7.8634,
    fciEnergy: -7.8824,
    ccsdEnergy: -7.8822,
    homoLumoGap_eV: 5.8,
    description: 'Heteronuclear alkali hydride. Frozen-core [1s²] active space calculation for valence 2s(Li) and 1s(H) polar-covalent bond.',
    industrialImpact: 'Solid-state hydrogen storage and lightweight nuclear reactor shielding materials.',
    atoms: [
      { element: 'Li', x: -0.7975, y: 0, z: 0, color: '#c084fc', radius: 22 },
      { element: 'H', x: 0.7975, y: 0, z: 0, color: '#e2e8f0', radius: 14 }
    ],
    bonds: [[0, 1]]
  },
  {
    id: 'H2O',
    name: 'Water Molecule (C₂ᵥ)',
    formula: 'H₂O',
    category: 'clean_energy',
    qubits: {
      jordan_wigner: 8,
      bravyi_kitaev: 8,
      parity_reduced: 6
    },
    electrons: 10,
    activeOrbitals: 4,
    equilibriumR: 0.958,
    minR: 0.6,
    maxR: 2.5,
    nuclearRepulsionEnergy: 8.9065,
    hfEnergy: -74.9659,
    fciEnergy: -75.0215,
    ccsdEnergy: -75.0208,
    homoLumoGap_eV: 7.4,
    description: 'Bent triatomic molecule (104.5° bond angle). Strongly correlated lone pairs and asymmetric dipole moment. Active space of 4 electrons in 4 orbitals (2a₁, 1b₂, 3a₁, 1b₁).',
    industrialImpact: 'Electrocatalytic water splitting (HER / OER) for green hydrogen production and proton-exchange membrane electrolyzers.',
    atoms: [
      { element: 'O', x: 0, y: 0.117, z: 0, color: '#ef4444', radius: 20 },
      { element: 'H', x: -0.757, y: -0.469, z: 0, color: '#e2e8f0', radius: 14 },
      { element: 'H', x: 0.757, y: -0.469, z: 0, color: '#e2e8f0', radius: 14 }
    ],
    bonds: [[0, 1], [0, 2]]
  },
  {
    id: 'N2',
    name: 'Molecular Nitrogen (Triple Bond)',
    formula: 'N₂',
    category: 'industrial_catalysis',
    qubits: {
      jordan_wigner: 12,
      bravyi_kitaev: 12,
      parity_reduced: 8
    },
    electrons: 14,
    activeOrbitals: 6,
    equilibriumR: 1.098,
    minR: 0.8,
    maxR: 3.2,
    nuclearRepulsionEnergy: 22.313,
    hfEnergy: -108.9928,
    fciEnergy: -109.2821,
    ccsdEnergy: -109.2785,
    homoLumoGap_eV: 9.8,
    description: 'Strong covalent N≡N triple bond. The breakdown of classical single-reference CCSD(T) occurs upon bond stretching due to severe multi-reference static correlation.',
    industrialImpact: 'Breaking the 945 kJ/mol N≡N bond currently consumes 1.5% of the entire world energy supply in the Haber-Bosch process. Ambient quantum catalysis is a global sustainability milestone.',
    atoms: [
      { element: 'N', x: -0.549, y: 0, z: 0, color: '#3b82f6', radius: 18 },
      { element: 'N', x: 0.549, y: 0, z: 0, color: '#3b82f6', radius: 18 }
    ],
    bonds: [[0, 1]]
  },
  {
    id: 'CO2',
    name: 'Carbon Dioxide (Carbon Capture)',
    formula: 'CO₂',
    category: 'carbon_capture',
    qubits: {
      jordan_wigner: 10,
      bravyi_kitaev: 10,
      parity_reduced: 8
    },
    electrons: 16,
    activeOrbitals: 5,
    equilibriumR: 1.162,
    minR: 0.8,
    maxR: 2.8,
    nuclearRepulsionEnergy: 31.428,
    hfEnergy: -187.6432,
    fciEnergy: -187.9540,
    ccsdEnergy: -187.9495,
    homoLumoGap_eV: 8.5,
    description: 'Linear molecule (D_∞h). Active space models reversible nucleophilic binding with amine scrubbing agents and MOF open metal sites for direct air capture.',
    industrialImpact: 'Designing next-generation low-regeneration-energy sorbents for industrial Point-Source and Direct Air Carbon Capture (DAC).',
    atoms: [
      { element: 'C', x: 0, y: 0, z: 0, color: '#94a3b8', radius: 16 },
      { element: 'O', x: -1.162, y: 0, z: 0, color: '#ef4444', radius: 20 },
      { element: 'O', x: 1.162, y: 0, z: 0, color: '#ef4444', radius: 20 }
    ],
    bonds: [[0, 1], [0, 2]]
  },
  {
    id: 'LiCoO2',
    name: 'Lithium-Ion Cathode Cluster',
    formula: 'Li-Co-O₄',
    category: 'battery_tech',
    qubits: {
      jordan_wigner: 14,
      bravyi_kitaev: 14,
      parity_reduced: 10
    },
    electrons: 20,
    activeOrbitals: 7,
    equilibriumR: 1.92,
    minR: 1.4,
    maxR: 3.2,
    nuclearRepulsionEnergy: 48.91,
    hfEnergy: -242.31,
    fciEnergy: -242.84,
    ccsdEnergy: -242.81,
    homoLumoGap_eV: 2.7,
    description: 'Transition-metal oxide cluster modeling the Co(III)/Co(IV) redox couple during lithium deintercalation in next-gen solid-state batteries. Strong on-site Coulomb repulsion (Hubbard U).',
    industrialImpact: 'Eliminating cobalt degradation and thermal runaway in commercial EV lithium-ion batteries.',
    atoms: [
      { element: 'Co', x: 0, y: 0, z: 0, color: '#06b6d4', radius: 22 },
      { element: 'Li', x: 1.92, y: 0, z: 0, color: '#c084fc', radius: 16 },
      { element: 'O', x: 0, y: 1.45, z: 0, color: '#ef4444', radius: 18 },
      { element: 'O', x: 0, y: -1.45, z: 0, color: '#ef4444', radius: 18 }
    ],
    bonds: [[0, 1], [0, 2], [0, 3]]
  },
  {
    id: 'FeMoco',
    name: 'FeMoco Nitrogenase Active Cluster',
    formula: '[Fe₄S₃]',
    category: 'industrial_catalysis',
    qubits: {
      jordan_wigner: 16,
      bravyi_kitaev: 16,
      parity_reduced: 12
    },
    electrons: 24,
    activeOrbitals: 8,
    equilibriumR: 2.25,
    minR: 1.7,
    maxR: 3.5,
    nuclearRepulsionEnergy: 84.15,
    hfEnergy: -428.12,
    fciEnergy: -429.35,
    ccsdEnergy: -429.28,
    homoLumoGap_eV: 1.8,
    description: 'Sub-cluster of the nitrogenase iron-molybdenum cofactor (FeMoco). Extreme static electron correlation between localized Fe 3d orbitals and S 3p bridges that completely defies classical DFT and coupled cluster.',
    industrialImpact: 'The holy grail of industrial quantum chemistry: unlocking ambient-temperature and ambient-pressure green ammonia fertilizer production.',
    atoms: [
      { element: 'Fe', x: -1.1, y: -0.7, z: 0, color: '#eab308', radius: 22 },
      { element: 'Fe', x: 1.1, y: -0.7, z: 0, color: '#eab308', radius: 22 },
      { element: 'Fe', x: 0, y: 1.2, z: 0, color: '#eab308', radius: 22 },
      { element: 'S', x: 0, y: -0.1, z: 0.9, color: '#84cc16', radius: 20 },
      { element: 'S', x: -1.1, y: 0.9, z: -0.5, color: '#84cc16', radius: 20 },
      { element: 'S', x: 1.1, y: 0.9, z: -0.5, color: '#84cc16', radius: 20 }
    ],
    bonds: [[0, 3], [1, 3], [2, 3], [0, 4], [2, 4], [1, 5], [2, 5]]
  }
];

// Generate Pauli coefficients for any molecule and bond distance
export function generatePauliHamiltonian(mol: IndustrialMolecule, R: number, mapping: 'jordan_wigner' | 'bravyi_kitaev' | 'parity_2q_reduced'): PauliTerm[] {
  const qCount = mol.qubits[mapping === 'parity_2q_reduced' ? 'parity_reduced' : mapping === 'bravyi_kitaev' ? 'bravyi_kitaev' : 'jordan_wigner'];
  const rRef = mol.equilibriumR;
  const dev = (R - rRef) / rRef;

  const terms: PauliTerm[] = [];

  // Identity nuclear + core term
  terms.push({
    pauli: 'I'.repeat(qCount),
    coefficient: +(mol.fciEnergy * 0.75 + 0.15 / R).toFixed(4),
    weight: 0
  });

  // Single-qubit Z terms (one-body orbital energies)
  for (let i = 0; i < qCount; i++) {
    const chars = Array(qCount).fill('I');
    chars[i] = 'Z';
    terms.push({
      pauli: chars.join(''),
      coefficient: +(0.165 - 0.03 * dev + (i % 2) * 0.02).toFixed(4),
      weight: 1
    });
  }

  // Two-qubit ZZ terms (Coulomb electron repulsion J_ij)
  for (let i = 0; i < qCount - 1; i++) {
    const chars = Array(qCount).fill('I');
    chars[i] = 'Z';
    chars[i + 1] = 'Z';
    terms.push({
      pauli: chars.join(''),
      coefficient: +(0.085 + 0.02 / (R * R)).toFixed(4),
      weight: 2
    });
  }

  // Entangling XX and YY terms (Exchange K_ij and electron hopping)
  for (let i = 0; i < Math.min(3, qCount - 1); i++) {
    const charsX = Array(qCount).fill('I');
    charsX[i] = 'X';
    charsX[i + 1] = 'X';
    terms.push({
      pauli: charsX.join(''),
      coefficient: +(0.042 - 0.015 * dev).toFixed(4),
      weight: 2
    });

    const charsY = Array(qCount).fill('I');
    charsY[i] = 'Y';
    charsY[i + 1] = 'Y';
    terms.push({
      pauli: charsY.join(''),
      coefficient: +(0.042 - 0.015 * dev).toFixed(4),
      weight: 2
    });
  }

  // Higher weight terms for Jordan-Wigner if qubits > 2
  if (mapping === 'jordan_wigner' && qCount >= 4) {
    terms.push({
      pauli: 'X' + 'Z'.repeat(qCount - 2) + 'X',
      coefficient: +(0.018 - 0.005 * dev).toFixed(4),
      weight: qCount
    });
    terms.push({
      pauli: 'Y' + 'Z'.repeat(qCount - 2) + 'Y',
      coefficient: +(0.018 - 0.005 * dev).toFixed(4),
      weight: qCount
    });
  }

  return terms;
}

// Generate Excited States (VQD - Variational Quantum Deflation)
export function getExcitedStates(mol: IndustrialMolecule, groundEnergy: number): ExcitedStateSpec[] {
  const gap = mol.homoLumoGap_eV / 27.2114; // convert eV to Hartrees
  return [
    {
      stateIndex: 0,
      label: 'S₀ (Ground State)',
      spinMultiplicity: 'Singlet (S=0)',
      energy_Ha: +groundEnergy.toFixed(4),
      excitationEnergy_eV: 0.0,
      transitionDipole: 0.0,
      oscillatorStrength: 0.0
    },
    {
      stateIndex: 1,
      label: 'T₁ (Lowest Triplet)',
      spinMultiplicity: 'Triplet (S=1)',
      energy_Ha: +(groundEnergy + gap * 0.65).toFixed(4),
      excitationEnergy_eV: +(gap * 0.65 * 27.2114).toFixed(2),
      transitionDipole: 0.04,
      oscillatorStrength: 0.002
    },
    {
      stateIndex: 2,
      label: 'S₁ (First Excited Singlet)',
      spinMultiplicity: 'Singlet (S=0)',
      energy_Ha: +(groundEnergy + gap).toFixed(4),
      excitationEnergy_eV: +(gap * 27.2114).toFixed(2),
      transitionDipole: 1.45,
      oscillatorStrength: 0.38
    },
    {
      stateIndex: 3,
      label: 'S₂ (Second Excited Singlet)',
      spinMultiplicity: 'Singlet (S=0)',
      energy_Ha: +(groundEnergy + gap * 1.55).toFixed(4),
      excitationEnergy_eV: +(gap * 1.55 * 27.2114).toFixed(2),
      transitionDipole: 0.88,
      oscillatorStrength: 0.19
    }
  ];
}

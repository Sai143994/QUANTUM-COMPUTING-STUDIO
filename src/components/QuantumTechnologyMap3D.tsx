import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { 
  Network, 
  Rotate3d, 
  Sparkles, 
  Search, 
  Filter, 
  Layers, 
  Cpu, 
  Compass, 
  Atom, 
  Radio, 
  ShieldCheck, 
  Code2, 
  Globe2, 
  ChevronRight, 
  ChevronLeft,
  Maximize2, 
  Minimize2, 
  Info, 
  ArrowUpRight, 
  CheckCircle2, 
  Flame, 
  Zap, 
  Clock, 
  ExternalLink,
  BookOpen,
  Award,
  Sliders,
  Crosshair,
  Play,
  Pause,
  RotateCcw,
  Activity,
  Gauge,
  Thermometer,
  Binary,
  Workflow,
  ArrowRight,
  HelpCircle,
  Scale,
  Tag
} from 'lucide-react';
import { playGateClickSound, playMeasurementCollapseSound } from '../utils/audio';
import { TechNodeMethodSimulator } from './TechNodeMethodSimulator';
import { TechComparatorModal } from './TechComparatorModal';
import { QuantumMathEquationCard } from './QuantumMathEquationCard';
import { TechWorkflowSchematic } from './TechWorkflowSchematic';

function createNodeTextSprite(text: string, trl: number, colorStr: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = 'rgba(3, 8, 16, 0.90)';
    ctx.strokeStyle = colorStr;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(8, 8, 368, 80, 20);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 26px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${text} · TRL ${trl}`, 192, 48);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const mat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: 0.92,
    depthTest: false
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(2.4, 0.6, 1);
  return sprite;
}

// --- DATA TYPES ---

export interface TechNode {
  id: string;
  name: string;
  shortName: string;
  category: 'hardware' | 'control' | 'qec' | 'algorithms' | 'future';
  era: 'present' | 'near_term' | 'future';
  trl: number; // 1 to 9 (Technology Readiness Level)
  color: string;
  pos: [number, number, number];
  connections: string[];
  summary: string;
  physicsPrinciple: string;
  presentState: string;
  futureMilestones: string;
  equations: string[];
  leaders: string[];
  bottlenecks: string[];
  applications: string[];
}

export interface EngineStage {
  id: string;
  stepNumber: number;
  name: string;
  shortName: string;
  phase: 'Software & Algorithm' | 'Compilation & Synthesis' | 'Physical Control & Hardware' | 'Real-Time Decoding & Post-Processing';
  color: string;
  pos: [number, number, number];
  icon: string;
  typicalLatency: string;
  temperature: string;
  clockDomain: string;
  description: string;
  hardwarePlatform: string;
  keyOperations: string[];
  physicsPrinciple: string;
  inputFormat: string;
  outputFormat: string;
  liveMetric: { label: string; value: string; unit: string };
  realWorldEquivalents: string[];
  equations: string[];
}

// 20+ Quantum Technologies Catalog
export const TECH_NODES: TechNode[] = [
  // 1. Hardware Modalities
  {
    id: 'superconducting',
    name: 'Superconducting Transmon & Fluxonium QPUs',
    shortName: 'Superconducting QPUs',
    category: 'hardware',
    era: 'present',
    trl: 7,
    color: '#00f5ff',
    pos: [-4.5, 2.0, 1.2],
    connections: ['dilution_fridge', 'microwave_chain', 'surface_code', 'cryo_cmos'],
    summary: 'Planar superconducting circuits with lithographically patterned Josephson junctions acting as non-linear inductors to create addressable artificial atoms at sub-kelvin temperatures.',
    physicsPrinciple: 'Josephson junction tunneling with non-linear inductive energy E_J / E_C >> 1 isolates the |0⟩ ↔ |1⟩ transition (~5 GHz) from higher harmonic levels, creating an anharmonic two-level quantum system.',
    presentState: 'Google Willow (105 qubits, below surface code fault-tolerance threshold), IBM Quantum Heron (156 qubits with tunable couplers, 99.9% 2-qubit gate fidelity). Coherence times T₁ and T₂ reach 100-300 μs.',
    futureMilestones: '2026-2028: Multi-chip modular quantum interconnects. 2029-2032: Commercial 10,000+ physical qubit cryostats with on-chip cryogenic control lines.',
    equations: [
      'H = 4E_C(n - n_g)^2 - E_J \\cos(\\phi)',
      '\\omega_{01} \\approx \\sqrt{8 E_J E_C} - E_C',
      '\\alpha = \\omega_{12} - \\omega_{01} \\approx -E_C'
    ],
    leaders: ['Google Quantum AI', 'IBM Quantum', 'Rigetti Computing', 'IQM Quantum Computers'],
    bottlenecks: ['Microwave cabling heat-load into 15mK', 'Two-level fluctuator (TLF) dielectric losses', 'Frequency crowding and ZZ crosstalk'],
    applications: ['NISQ quantum simulation', 'Variational quantum algorithms', 'Surface code logical qubit testbeds']
  },
  {
    id: 'trapped_ion',
    name: 'Trapped Ion Quantum Computers',
    shortName: 'Trapped Ions',
    category: 'hardware',
    era: 'present',
    trl: 7,
    color: '#a855f7',
    pos: [-5.2, -1.2, 0.8],
    connections: ['laser_optical', 'vacuum_shield', 'surface_code', 'qldpc_codes'],
    summary: 'Individual atomic ions (Ytterbium-171, Barium-137) levitated in ultra-high vacuum RF Paul traps and manipulated by coherent laser pulses, achieving world-record two-qubit gate fidelities.',
    physicsPrinciple: 'Hyperfine clock states with essentially infinite coherence times (hours to days). Two-qubit entangling gates utilize shared quantized collective vibrational modes (phonons) via the Mølmer-Sørensen interaction.',
    presentState: 'Quantinuum H2-1 (56 qubits with all-to-all connectivity, Quantum Volume 2²⁵, 99.914% 2-qubit gate fidelity). IonQ Forte (36 Algorithmic Qubits with reconfigurable optical addressing).',
    futureMilestones: '2027: Shuttling-based architecture scaling to 100+ logical qubits. 2030: Modular photonic ion-cavity entanglement interconnects for distributed quantum supercomputers.',
    equations: [
      'H_{MS} = \\hbar \\Omega \\sum_j \\sigma_x^j \\cos(\\delta t)',
      'U_{MS}(\\pi/2) = \\exp(-i \\frac{\\pi}{4} \\sigma_x^1 \\sigma_x^2)'
    ],
    leaders: ['Quantinuum', 'IonQ', 'Oxford Ionics', 'University of Innsbruck'],
    bottlenecks: ['Gate speed (microseconds vs nanoseconds in transmons)', 'Optical laser phase noise and power distribution across thousands of ions'],
    applications: ['High-precision quantum chemistry', 'Quantum Volume records', 'Low-overhead quantum error correction with all-to-all graphs']
  },
  {
    id: 'neutral_atom',
    name: 'Neutral Atom Arrays & Rydberg Qubits',
    shortName: 'Neutral Atom Arrays',
    category: 'hardware',
    era: 'present',
    trl: 6,
    color: '#f59e0b',
    pos: [-3.8, -3.2, 1.5],
    connections: ['laser_optical', 'vacuum_shield', 'lattice_surgery', 'qldpc_codes'],
    summary: 'Hundreds to thousands of uncharged neutral atoms (Rubidium, Cesium, Strontium) trapped in 2D/3D optical tweezer arrays and excited to high-principal-quantum-number Rydberg states for rapid entanglement.',
    physicsPrinciple: 'Rydberg blockade effect: dipole-dipole interaction between highly excited states prevents simultaneous excitation of neighboring atoms within a blockade radius R_b, generating conditional quantum phase gates.',
    presentState: 'QuEra Aquila (256 physical qubits in reconfigurable optical geometries). Harvard/MIT research demonstrates 48 logical qubits with transversal non-Clifford operations using mobile optical tweezer shuttling.',
    futureMilestones: '2027: 10,000 physical neutral atoms in 3D optical lattices. 2030: Universal fault-tolerant topological surface code computation with real-time feedback.',
    equations: [
      'V_{vdW} = \\frac{C_6}{R^6}',
      'R_b = \\left(\\frac{C_6}{\\hbar \\Omega}\\right)^{1/6}'
    ],
    leaders: ['QuEra Computing', 'Harvard University / Lukin Lab', 'Pasqal', 'Infleqtion'],
    bottlenecks: ['Atom loss and non-deterministic reloading', 'Laser pointing jitter in massive acousto-optic deflector arrays'],
    applications: ['Combinatorial optimization (MaxCut, MIS)', 'Quantum spin liquids simulation', 'High-threshold transverse logical circuits']
  },
  {
    id: 'photonic',
    name: 'Continuous-Variable & Discrete Photonic QPUs',
    shortName: 'Photonic Quantum Computing',
    category: 'hardware',
    era: 'near_term',
    trl: 5,
    color: '#38bdf8',
    pos: [-5.0, 3.8, -1.0],
    connections: ['laser_optical', 'magic_states', 'quantum_internet'],
    summary: 'Room-temperature photonic integrated circuits (silicon photonics) manipulating single photons or continuous-variable squeezed states through Mach-Zehnder interferometers and waveguide beam splitters.',
    physicsPrinciple: 'Zero interaction between photons in free space enables ballistic quantum information propagation with zero decoherence. Non-linear measurement-induced entanglement or GKP states provide universality.',
    presentState: 'Xanadu Borealis (216 squeezed-mode Gaussian Boson Sampling advantage). PsiQuantum fabricating silicon photonic wafers at Tier-1 commercial semiconductor foundries (GlobalFoundries).',
    futureMilestones: '2028: Million-physical-qubit modular photonic utility computer with fiber-optic inter-cabinet links. Room-temperature core with cryo-cooled superconducting nanowire detectors (SNSPD).',
    equations: [
      '\\hat{S}(\\xi) = \\exp\\left(\\frac{1}{2}(\\xi^* \\hat{a}^2 - \\xi \\hat{a}^{\\dagger 2})\\right)',
      'P_{det} = |\\langle \\psi_{out} | \\hat{U}_{interferometer} | \\psi_{in} \\rangle|^2'
    ],
    leaders: ['PsiQuantum', 'Xanadu', 'Quandela', 'ORCA Computing'],
    bottlenecks: ['Photon loss in optical waveguides and switches', 'Deterministic single-photon generation efficiency'],
    applications: ['Gaussian Boson Sampling', 'Room-temperature quantum networks', 'High-speed distributed quantum computing']
  },
  {
    id: 'silicon_spin',
    name: 'Semiconductor Silicon Spin Qubits',
    shortName: 'Silicon Spin Qubits',
    category: 'hardware',
    era: 'near_term',
    trl: 5,
    color: '#10b981',
    pos: [-2.8, 4.4, 1.8],
    connections: ['dilution_fridge', 'cryo_cmos', 'surface_code'],
    summary: 'Single electron or hole spins trapped inside electrostatic quantum dots fabricated on isotopic Silicon-28 substrates using standard industrial CMOS semiconductor lithography.',
    physicsPrinciple: 'Zeeman splitting under an external magnetic field B_0 provides energy quantization for electron spin S = 1/2. Exchange coupling J(t) between adjacent quantum dots controls two-qubit exchange gates.',
    presentState: 'Intel Tunnel Falls (12-qubit silicon spin chip fabricated on 300mm industrial wafers with >99% single-qubit fidelity). Silicon Quantum Computing (atomic-precision phosphorus dopant qubit gates in silicon).',
    futureMilestones: '2028: Monolithic integration of spin qubits directly on the same silicon die as cryo-CMOS control multiplexers. 2032: Billion-transistor scale fault-tolerant quantum microprocessors.',
    equations: [
      'H_{Zeeman} = g \\mu_B \\vec{B} \\cdot \\vec{S}',
      'H_{exchange} = J(t) \\vec{S}_1 \\cdot \\vec{S}_2'
    ],
    leaders: ['Intel Quantum Hardware', 'Silicon Quantum Computing (SQC)', 'Diraq', 'TU Delft / QuTech'],
    bottlenecks: ['Sub-100nm gate pitch creating interconnect routing congestion', 'Valley splitting variability in silicon-silicon oxide interfaces'],
    applications: ['Ultra-dense quantum processors', 'Compatibility with existing semiconductor fab gigafactories']
  },
  {
    id: 'topological',
    name: 'Topological Majorana Zero Mode Qubits',
    shortName: 'Topological Qubits',
    category: 'hardware',
    era: 'future',
    trl: 4,
    color: '#ec4899',
    pos: [-4.2, 0.4, -3.2],
    connections: ['dilution_fridge', 'lattice_surgery', 'million_qubit_ftqc'],
    summary: 'Exotic quasiparticle excitations (Majorana Zero Modes) hosted at the ends of semiconductor-superconductor nanowires, encoding quantum information non-locally to provide inherent physical immunity to local environmental noise.',
    physicsPrinciple: 'Non-Abelian anyonic statistics where braiding particles in two-dimensional space implements unitary quantum gates determined solely by topology rather than pulse duration or amplitude.',
    presentState: 'Microsoft Quantum achieved the Topological Phase Protection gap protocol, confirming Majorana Zero Modes in InAs-Al hybrid nanowires with topological gap stability >30 μeV.',
    futureMilestones: '2027: Demonstration of first topological braiding qubit with physical error rates below 10⁻⁶. 2033: Digital quantum supercomputer requiring 100x fewer physical qubits for error correction.',
    equations: [
      '\\gamma_i = \\gamma_i^{\\dagger}, \\quad \\{\\gamma_i, \\gamma_j\\} = 2 \\delta_{ij}',
      '\\tau_{12} = \\exp\\left(\\frac{\\pi}{4} \\gamma_1 \\gamma_2\\right)'
    ],
    leaders: ['Microsoft Quantum', 'Station Q', 'Niels Bohr Institute'],
    bottlenecks: ['Quasiparticle poisoning from stray cosmic radiation', 'Indisputable non-local quantum state parity readout'],
    applications: ['Hardware-level error protection', 'Minimal overhead fault-tolerant quantum supercomputing']
  },

  // 2. Cryogenics & Control Plane
  {
    id: 'dilution_fridge',
    name: 'He-3 / He-4 Dilution Cryostat Infrastructure',
    shortName: 'Dilution Refrigeration',
    category: 'control',
    era: 'present',
    trl: 9,
    color: '#eab308',
    pos: [-1.2, 1.8, 0.0],
    connections: ['superconducting', 'silicon_spin', 'microwave_chain', 'cryo_cmos', 'topological'],
    summary: 'Continuous closed-cycle thermodynamic refrigeration utilizing the enthalpy of mixing between Helium-3 and superfluid Helium-4 to maintain 10-15 milliKelvin base temperature, colder than deep space (2.7K).',
    physicsPrinciple: 'Below 0.87K, He-3 and He-4 separate into concentrated and dilute phases. Pumping He-3 across this phase boundary absorbs heat: Q_dot = n_dot * [H_dilute - H_conc] ≈ 84 * n_dot * T².',
    presentState: 'Commercial multi-cabinet dilution refrigerators (Bluefors Kide, Oxford Proteox) providing up to 1 mW cooling power at 100mK and 25 μW at 15mK, supporting hundreds of semi-rigid coaxial lines.',
    futureMilestones: '2028: Multi-fridge cryogenic vacuum transfer tunnels linking separate cryostats via quantum optical fiber and millimeter-wave waveguides.',
    equations: [
      '\\dot{Q}_{mix} \\approx 84 \\cdot \\dot{n}_3 \\cdot T^2 \\quad [\\text{Watts}]',
      'k_B T_{15mK} \\approx 1.3 \\times 10^{-25} \\text{ J} \\ll hf_{5GHz} \\approx 3.3 \\times 10^{-24} \\text{ J}'
    ],
    leaders: ['Bluefors', 'Oxford Instruments NanoScience', 'JanisULT', 'Maybell Quantum'],
    bottlenecks: ['Helium-3 global isotopic supply scarcity', 'Thermal conduction through thousands of physical coaxial cables'],
    applications: ['Thermal decoherence suppression for transmons and spin qubits']
  },
  {
    id: 'microwave_chain',
    name: 'Cryogenic RF Microwave Control & Readout Cascade',
    shortName: 'RF Microwave Cascade',
    category: 'control',
    era: 'present',
    trl: 8,
    color: '#f97316',
    pos: [-0.6, 3.4, -1.2],
    connections: ['dilution_fridge', 'superconducting', 'qir_compilers'],
    summary: 'Multi-stage attenuation, filtering, and amplification chain running from room-temperature Arbitrary Waveform Generators down to 15mK TWPA parametric amplifiers to protect qubits from thermal Johnson-Nyquist noise.',
    physicsPrinciple: 'Thermal photon number n_th = 1/(exp(hf/k_B T) - 1) is reduced from ~1,200 photons at 300K down to < 10⁻⁷ photons at 15mK via staged -20dB attenuators, ensuring quantum ground state purity.',
    presentState: 'High-density multi-conductor semi-rigid coaxial cables with Traveling Wave Parametric Amplifiers (TWPA) providing +20 dB near-quantum-limited gain with < 1 added quantum of noise.',
    futureMilestones: '2027: Cryogenic active microwave routing switches reducing cable count from O(N) to O(log N). 2030: Integrated optical-to-microwave coherent transducers on chip.',
    equations: [
      'P_{noise} = k_B T \\Delta f',
      'n_{th} = \\frac{1}{e^{hf/k_B T} - 1} < 10^{-6}'
    ],
    leaders: ['Zurich Instruments', 'Keysight Technologies', 'Quantum Machines (OPX+)', 'Rohde & Schwarz'],
    bottlenecks: ['Crosstalk and pulse reflections in high-density cable looms', 'Physical volume of cryogenic circulators and isolators'],
    applications: ['Single-shot projective qubit readout', 'Nanosecond-precision dynamical decoupling pulses']
  },
  {
    id: 'cryo_cmos',
    name: 'Cryo-CMOS & Cryogenic Control ASICs',
    shortName: 'Cryo-CMOS ASICs',
    category: 'control',
    era: 'near_term',
    trl: 6,
    color: '#06b6d4',
    pos: [-1.8, 0.2, 2.8],
    connections: ['dilution_fridge', 'superconducting', 'silicon_spin', 'surface_code'],
    summary: 'Custom silicon integrated circuits operating at 3-4 Kelvin inside the cryostat to generate microwave control pulses and digitize readout signals locally, eliminating the massive cable bundle from room temperature.',
    physicsPrinciple: 'Standard silicon CMOS behavior changes drastically at 4K: carrier freeze-out, threshold voltage shifts, and increased mobility require specialized low-power cryogenic circuit design.',
    presentState: 'Intel Horse Ridge II (cryogenic SoC controlling multiple qubits at 3K). Imec and Delft demonstrations of 4K cryo-D/A converters with sub-milliwatt power dissipation.',
    futureMilestones: '2027: Co-packaged cryo-CMOS interposers directly flip-chip bonded to superconducting QPUs, controlling thousands of qubits with only a few DC power and digital optical serial lines.',
    equations: [
      'P_{dissipation} < P_{cooling\\_budget@4K} \\approx 1.5 \\text{ Watts}',
      'V_{th}(4K) = V_{th}(300K) + \\Delta V_{freeze-out}'
    ],
    leaders: ['Intel Labs', 'Imec', 'QuTech', 'SEEQC'],
    bottlenecks: ['Thermal dissipation inside cryostat limited by 4K pulse-tube cooling capacity', '1/f noise degradation at cryogenic temperatures'],
    applications: ['Solving the cryogenic wiring bottleneck', 'Scaling from 1,000 to 1,000,000 qubits']
  },
  {
    id: 'laser_optical',
    name: 'Coherent Laser Systems & Optical Tweezer Control',
    shortName: 'Laser & Optical Systems',
    category: 'control',
    era: 'present',
    trl: 8,
    color: '#e11d48',
    pos: [-2.5, -2.6, -1.8],
    connections: ['trapped_ion', 'neutral_atom', 'photonic'],
    summary: 'Ultra-narrow-linewidth lasers, acousto-optic deflectors (AOD), and spatial light modulators creating dynamic optical potentials that trap, rearrange, and entangle individual atoms and ions in real time.',
    physicsPrinciple: 'AC Stark effect creates dipole force trapping atoms at intensity maxima. Coherent Rabi oscillations driving electric dipole transitions generate single-qubit rotations with sub-kilohertz phase stability.',
    presentState: 'Sub-Hertz linewidth stabilized lasers with high-speed 2D AOD arrays dynamically shuttling 256+ neutral atoms in milliseconds without loss of quantum phase.',
    futureMilestones: '2028: Multi-channel photonic integrated waveguide circuits delivering laser light directly into vacuum chips, eliminating free-space optical tables.',
    equations: [
      'U_{dipole} = -\\frac{1}{2 \\epsilon_0 c} \\text{Re}(\\alpha) I(\\vec{r})',
      '\\Omega_{Rabi} = \\frac{\\vec{d} \\cdot \\vec{E}_0}{\\hbar}'
    ],
    leaders: ['ColdQuanta (Infleqtion)', 'MOGLabs', 'TOPTICA Photonics', 'Menlo Systems'],
    bottlenecks: ['Intensity and phase drift across multi-tone optical channels', 'Beam-pointing fluctuations from thermal expansion'],
    applications: ['Neutral atom dynamic lattice rearrangement', 'Trapped-ion individual optical addressing']
  },
  {
    id: 'vacuum_shield',
    name: 'Ultra-High Vacuum & Magnetic Shielding',
    shortName: 'Vacuum & Magnetic Shielding',
    category: 'control',
    era: 'present',
    trl: 9,
    color: '#64748b',
    pos: [-3.2, -4.2, -0.6],
    connections: ['trapped_ion', 'neutral_atom', 'dilution_fridge'],
    summary: 'Extreme high vacuum chambers (P < 10⁻¹¹ Torr) coupled with multi-layer high-permeability Mu-metal and superconducting lead/aluminum shields to isolate quantum registers from ambient background collisions and magnetic drift.',
    physicsPrinciple: 'Residual gas collisions cause instantaneous quantum state collapse. High-permeability ferromagnetic nickel-iron alloys (μ_r > 100,000) divert Earth\'s magnetic field (~50 μT) to < 0.1 μT.',
    presentState: 'Non-evaporable getter (NEG) and ion pumps maintaining 10⁻¹² mbar for years. Multi-shell Mu-metal cans attenuating ambient electromagnetic fields by > 80 dB.',
    futureMilestones: '2028: Micro-machined chip-scale vacuum packages (CSVP) integrating ion traps and atomic vapors into sealed, portable silicon microchips.',
    equations: [
      'P_{coll} = n \\sigma v \\implies \\tau_{collision} > 10 \\text{ minutes @ } 10^{-11} \\text{ Torr}',
      'B_{internal} = \\frac{B_{external}}{\\mu_r \\cdot (t / R)}'
    ],
    leaders: ['Agilent Vacuum', 'Vacuum Schmelze (VAC)', 'SAES Getters'],
    bottlenecks: ['Helium permeation through glass viewports', 'Miniaturization without sacrificing pumping speed'],
    applications: ['Long ion lifetime', 'Suppression of dephasing in magnetic-field-sensitive qubits']
  },

  // 3. Quantum Error Correction & Fault Tolerance
  {
    id: 'surface_code',
    name: 'Rotated Surface Code & Stabilizer Formalism',
    shortName: 'Surface Code QEC',
    category: 'qec',
    era: 'present',
    trl: 6,
    color: '#00f5ff',
    pos: [1.2, 2.2, 0.4],
    connections: ['superconducting', 'trapped_ion', 'lattice_surgery', 'magic_states', 'qldpc_codes'],
    summary: '2D square lattice of data and syndrome ancilla qubits measuring Pauli weight-4 star (X) and plaquette (Z) operators repeatedly to detect and correct bit-flip and phase-flip errors without disturbing logical superposition.',
    physicsPrinciple: 'Topological non-local encoding where logical information is stored in global homology cycles. High error threshold (~1% per physical gate) makes it the leading candidate for physical implementation.',
    presentState: 'Demonstrated below threshold in Google Willow (Distance d=7 preserves logical state longer than d=5 and d=3). IBM Quantum demonstrates syndrome tracking on Heron architecture.',
    futureMilestones: '2027: Demonstration of fault-tolerant logical memory with suppression factor Λ > 5 per distance increment. 2029: 100 logical qubits running fault-tolerant circuits.',
    equations: [
      'S_v = \\prod_{i \\in v} X_i, \\quad S_p = \\prod_{j \\in p} Z_j',
      'd = 2k + 1 \\implies \\text{corrects up to } k = \\lfloor(d-1)/2\\rfloor \\text{ arbitrary errors}',
      'P_L \\propto \\left(\\frac{p}{p_{th}}\\right)^{(d+1)/2}'
    ],
    leaders: ['Google Quantum AI', 'IBM Quantum', 'Yale Quantum Institute', 'Oxford University'],
    bottlenecks: ['High physical qubit overhead (1,000 to 10,000 physical qubits per logical qubit)', 'Fast real-time decoding latency (< 1 μs) to avoid backlog'],
    applications: ['Logical memory preservation', 'Sub-threshold fault-tolerant scaling']
  },
  {
    id: 'lattice_surgery',
    name: 'Topological Lattice Surgery & Code Deformation',
    shortName: 'Lattice Surgery',
    category: 'qec',
    era: 'near_term',
    trl: 5,
    color: '#3b82f6',
    pos: [2.8, 3.6, -1.0],
    connections: ['surface_code', 'magic_states', 'shor_grover', 'million_qubit_ftqc'],
    summary: 'Technique for performing fault-tolerant entangling gates (such as logical CNOT and multi-qubit Pauli measurements) between adjacent surface code patches by merging and splitting boundary syndromes without physical qubit movement.',
    physicsPrinciple: 'Measuring joint boundary operators (e.g. Z_boundary ⊗ Z_boundary) projects the two independent surface codes into an entangled manifold while preserving the topological code distance d.',
    presentState: 'Proof-of-concept demonstrations of logical patch merge and split on neutral atom and superconducting architectures. Automated compilers synthesize lattice surgery routing pathways.',
    futureMilestones: '2028: Multi-logical-qubit algorithm execution using optimized lattice surgery pipelines with zero physical SWAP gates.',
    equations: [
      'M_{Z \\otimes Z} = \\prod_{i \\in \\text{boundary}} Z_i',
      '\\text{Logical Space: } \\mathcal{H}_L^{(1)} \\otimes \\mathcal{H}_L^{(2)} \\xrightarrow{\\text{Merge}} \\mathcal{H}_L^{(1+2)} \\xrightarrow{\\text{Split}} \\text{Entangled State}'
    ],
    leaders: ['University of Sydney (Fowler/Gidney)', 'Google Quantum AI', 'Riverlane'],
    bottlenecks: ['Spatial layout routing routing congested on 2D planar chips', 'Time duration proportional to code distance d'],
    applications: ['Fault-tolerant CNOT and Clifford gates', 'Multi-qubit logical parity measurements']
  },
  {
    id: 'magic_states',
    name: 'Magic State Distillation & T-Gate Factories',
    shortName: 'Magic State Distillation',
    category: 'qec',
    era: 'near_term',
    trl: 5,
    color: '#8b5cf6',
    pos: [3.2, 1.2, 1.6],
    connections: ['surface_code', 'lattice_surgery', 'shor_grover', 'qpe_qft'],
    summary: 'Because transversal gates on surface codes can only implement the Clifford group, non-Clifford T-gates (π/8 rotations) must be injected via noisy "magic states" |T⟩ and distilled into ultra-pure states via error-detecting circuits.',
    physicsPrinciple: 'Eastin-Knill Theorem: No quantum error-correcting code can implement a universal set of logical gates transversally. Magic state distillation (Bravyi-Kitaev 15-to-1 or 20-to-4 protocols) bypasses this by trading ancilla qubits for gate universality.',
    presentState: 'Theoretical optimizations have reduced overhead from 15,000 physical qubits per T-gate to under 800 physical qubits using block distillation and synth-state protocols.',
    futureMilestones: '2029: First physical execution of a dedicated on-chip "Magic State Factory" continuously streaming verified |T⟩ states to computational logical registers.',
    equations: [
      '|T\\rangle = \\cos(\\pi/8)|0\\rangle + \\sin(\\pi/8)|1\\rangle',
      '\\epsilon_{out} = 35 \\epsilon_{in}^3 \\quad (15\\text{-to-}1 \\text{ Bravyi-Kitaev distillation})'
    ],
    leaders: ['Google Quantum AI', 'Harvard University', 'PsiQuantum', 'IBM Quantum'],
    bottlenecks: ['Consumes over 80-90% of the total physical qubits in a fault-tolerant quantum computer', 'Ancilla routing footprint'],
    applications: ['Enabling universal quantum computation (Clifford + T)', 'Shor\'s algorithm modular exponentiation', 'VQE and quantum chemistry rotations']
  },
  {
    id: 'qldpc_codes',
    name: 'Quantum LDPC (Low-Density Parity-Check) Codes',
    shortName: 'Quantum LDPC Codes',
    category: 'qec',
    era: 'near_term',
    trl: 5,
    color: '#10b981',
    pos: [1.8, -0.8, -2.4],
    connections: ['trapped_ion', 'neutral_atom', 'surface_code', 'million_qubit_ftqc'],
    summary: 'Higher-dimensional hypergraph and bivariate bicycle codes that achieve constant encoding rates (k/n > 0), allowing tens of logical qubits to be encoded with 10x fewer physical qubits than 2D planar surface codes.',
    physicsPrinciple: 'Sparse parity-check matrices on non-planar interaction graphs embed logical qubits into high-dimensional geometries, drastically reducing the physical-to-logical qubit overhead ratio.',
    presentState: 'IBM and Harvard researchers demonstrated bivariate bicycle codes encoding 12 logical qubits into 144 physical qubits with code distance d=6, compared to ~1,200 qubits required by surface codes.',
    futureMilestones: '2027: First active syndrome decoding experiments on trapped ion and neutral atom hardware with long-range connectivity.',
    equations: [
      'k / n = \\text{constant} > 0, \\quad d = \\mathcal{O}(\\sqrt{n}) \\text{ or } \\mathcal{O}(n)',
      'H_X H_Z^T = 0 \\quad (CSS \\text{ Commutation Condition})'
    ],
    leaders: ['IBM Quantum', 'Harvard University', 'Inria France', 'Stanford University'],
    bottlenecks: ['Requires long-range or 3D physical qubit connectivity (difficult on planar transmons)', 'Decoding algorithms in hardware are computationally intensive'],
    applications: ['10x reduction in physical hardware requirements', 'Compact fault-tolerant quantum memory']
  },
  {
    id: 'color_codes',
    name: 'Topological Color Codes & Transversal Clifford Gates',
    shortName: 'Color Codes',
    category: 'qec',
    era: 'near_term',
    trl: 5,
    color: '#f43f5e',
    pos: [3.4, -2.2, 0.6],
    connections: ['surface_code', 'lattice_surgery', 'million_qubit_ftqc'],
    summary: '2D trivalent hexagonal/octagonal lattices where plaquettes are 3-colored (Red, Green, Blue) and measure both X and Z stabilizers on the same qubits, enabling all Clifford gates to be applied transversally in a single time step.',
    physicsPrinciple: 'Dual stabilizer measurements on colored faces permit bit-wise transversal application of Phase (S), Hadamard (H), and CNOT gates without requiring lattice surgery.',
    presentState: 'Experimental demonstrations on trapped ion and neutral atom architectures showing fault-tolerant state preparation and transversal logical single-qubit gates.',
    futureMilestones: '2028: Color code to surface code code-switching pipelines to maximize gate throughput.',
    equations: [
      'S_p^X = \\prod_{i \\in p} X_i, \\quad S_p^Z = \\prod_{i \\in p} Z_i \\quad \\forall p \\in \\{R, G, B\\}',
      'U_L = \\bigotimes_{i} U_i \\quad (\\text{Transversal Clifford Property})'
    ],
    leaders: ['Quantinuum', 'University of Oxford', 'University of Innsbruck'],
    bottlenecks: ['Lower fault-tolerant threshold (~0.1%) compared to surface code (~1%)', 'Higher stabilizer weight increases circuit complexity'],
    applications: ['Instantaneous transversal Clifford operations', 'Quantum memory architecture']
  },

  // 4. Software & Algorithms
  {
    id: 'qir_compilers',
    name: 'Quantum Intermediate Representation & Compilers',
    shortName: 'Compilers & QIR',
    category: 'algorithms',
    era: 'present',
    trl: 8,
    color: '#00f5ff',
    pos: [1.2, 4.8, 1.8],
    connections: ['microwave_chain', 'surface_code', 'vqe_qaoa', 'qpe_qft'],
    summary: 'Hardware-agnostic compilation frameworks (OpenQASM 3.0, QIR based on LLVM, Qiskit, Cirq) translating high-level quantum algorithms into calibrated microsecond microwave and laser pulse schedules with gate optimization.',
    physicsPrinciple: 'Commutation relations, unitary synthesis (KAK decomposition of SU(4)), and dynamical decoupling pulse insertion optimize circuit depth to minimize T₁/T₂ decoherence decay.',
    presentState: 'Production compilers with automated pulse-level calibration, zero-noise extrapolation (ZNE), Pauli twirling, and readout error mitigation running on cloud QPUs.',
    futureMilestones: '2026: Real-time mid-circuit measurement feedback compilers with sub-100ns branching latency for dynamic quantum error correction.',
    equations: [
      'U \\in SU(4) = (A_1 \\otimes A_2) \\cdot \\exp(i(c_x \\sigma_x \\sigma_x + c_y \\sigma_y \\sigma_y + c_z \\sigma_z \\sigma_z)) \\cdot (B_1 \\otimes B_2)',
      '\\mathcal{D}_{circuit} = \\min \\sum_{g \\in \\text{critical path}} t_g'
    ],
    leaders: ['IBM Qiskit Team', 'Google Cirq', 'QIR Alliance / Microsoft', 'Classiq Technologies'],
    bottlenecks: ['NP-hard optimal qubit routing on constrained hardware coupling topologies', 'Scaling compiler memory for circuits with millions of gates'],
    applications: ['Pulse-level quantum control', 'Zero-noise extrapolation error mitigation', 'Automated hardware synthesis']
  },
  {
    id: 'vqe_qaoa',
    name: 'Variational Quantum Eigensolver & QAOA',
    shortName: 'VQE & QAOA (NISQ)',
    category: 'algorithms',
    era: 'present',
    trl: 7,
    color: '#a855f7',
    pos: [2.5, 3.2, 3.2],
    connections: ['qir_compilers', 'superconducting', 'trapped_ion'],
    summary: 'Hybrid quantum-classical algorithms where a parameterized quantum circuit (ansatz) prepares a quantum state and classical optimizers update parameter angles to calculate molecular ground states or combinatorial graph solutions.',
    physicsPrinciple: 'Rayleigh-Ritz variational principle: The expectation value of a Hamiltonian H over any trial state |ψ(θ)⟩ is always an upper bound to the true ground-state energy E_0.',
    presentState: 'Active benchmarking on small molecules (H₂, LiH, H₂O) and MaxCut problems on up to 100+ qubits using advanced error mitigation (PEC, ZNE).',
    futureMilestones: '2027: Demonstration of provable industrial chemical advantage (e.g. nitrogenase iron-sulfur clusters) using error-mitigated NISQ / early logical QPUs.',
    equations: [
      '\\langle H \\rangle_\\theta = \\langle \\psi(\\theta) | H | \\psi(\\theta) \\rangle \\ge E_0',
      '\\theta_{k+1} = \\theta_k - \\eta \\nabla_\\theta \\langle H \\rangle'
    ],
    leaders: ['Zapata Computing', 'QC Ware', 'IBM Quantum', 'Google Quantum AI'],
    bottlenecks: ['Barren plateaus (exponential vanishing of cost function gradients in deep random circuits)', 'Shot noise scaling requires millions of circuit evaluations'],
    applications: ['Molecular ground-state chemistry', 'Battery electrolyte modeling', 'Combinatorial portfolio optimization']
  },
  {
    id: 'qpe_qft',
    name: 'Quantum Phase Estimation & Hamiltonian Simulation',
    shortName: 'QPE & Hamiltonian Sim',
    category: 'algorithms',
    era: 'near_term',
    trl: 6,
    color: '#38bdf8',
    pos: [4.2, 0.8, -1.8],
    connections: ['qir_compilers', 'magic_states', 'shor_grover', 'million_qubit_ftqc'],
    summary: 'The cornerstone algorithm for quantum chemistry and physics, estimating the eigenvalues of a unitary operator with exponential precision using the Quantum Fourier Transform to solve chemical reaction kinetics.',
    physicsPrinciple: 'Phase kickback maps the eigenvalue e^(i 2π φ) of an operator U|u⟩ = e^(i 2π φ)|u⟩ into the relative phases of an ancilla register, which the inverse QFT decodes into binary fraction measurements.',
    presentState: 'Demonstrated on small toy models (up to 4 bits of precision). Full fault-tolerant chemistry pipelines (QPE on FeMo-cofactor for Haber-Bosch catalyst simulation) are fully mapped out.',
    futureMilestones: '2030: Fault-tolerant QPE resolving active sites of carbon capture enzymes and room-temperature superconductor candidate lattices beyond classical supercomputing capabilities.',
    equations: [
      'QFT: |j\\rangle \\mapsto \\frac{1}{\\sqrt{N}} \\sum_{k=0}^{N-1} e^{i 2\\pi j k / N} |k\\rangle',
      '|\\phi - \\tilde{\\phi}| \\le 2^{-m} \\quad \\text{with failure probability } \\le \\epsilon'
    ],
    leaders: ['Microsoft Azure Quantum', 'PsiQuantum', 'Harvard University', 'Caltech'],
    bottlenecks: ['Requires deep circuits with millions of high-fidelity T-gates and long coherence times', 'Ancilla register overhead'],
    applications: ['Nitrogenase industrial catalyst discovery', 'High-temperature superconductivity mechanisms', 'Materials science']
  },
  {
    id: 'shor_grover',
    name: 'Shor\'s Factoring & Grover\'s Search Algorithms',
    shortName: 'Shor & Grover (Advantage)',
    category: 'algorithms',
    era: 'future',
    trl: 5,
    color: '#f59e0b',
    pos: [5.2, -1.8, -0.4],
    connections: ['magic_states', 'lattice_surgery', 'pqc_migration', 'million_qubit_ftqc'],
    summary: 'The foundational quantum algorithms delivering exponential speedup for integer factorization and discrete logarithms (Shor, O((log N)³)), and quadratic speedup for unstructured database search (Grover, O(√N)).',
    physicsPrinciple: 'Shor reduces prime factoring to modular order-finding r such that a^r ≡ 1 (mod N), solved via QFT. Grover uses unitary reflections around the average state to amplify target amplitudes.',
    presentState: 'Shor\'s algorithm compiled and optimized by Craig Gidney to require ~20 million physical qubits running for 8 hours to break RSA-2048 using surface code lattice surgery.',
    futureMilestones: '2032-2035: First fault-tolerant factorization of cryptographic-scale integers, completing the transition of global telecommunications to Post-Quantum Cryptography.',
    equations: [
      'T_{Shor} = \\mathcal{O}((\\log N)^2 \\log \\log N) \\quad \\text{vs Classical } \\mathcal{O}(\\exp((\\ln N)^{1/3}))',
      'T_{Grover} = \\frac{\\pi}{4} \\sqrt{N} \\quad \\text{vs Classical } \\mathcal{O}(N)'
    ],
    leaders: ['MIT', 'Google Quantum AI', 'University of Waterloo (IQC)', 'NSA / NIST'],
    bottlenecks: ['Extreme circuit depth requiring trillions of fault-tolerant logical operations without error', 'Modular multiplication ripple-carry adder routing'],
    applications: ['Cryptanalysis of RSA and Elliptic Curve Cryptography', 'Unstructured database optimization']
  },
  {
    id: 'qml_tensor',
    name: 'Quantum Machine Learning & Tensor Networks',
    shortName: 'Quantum ML & Tensors',
    category: 'algorithms',
    era: 'near_term',
    trl: 6,
    color: '#10b981',
    pos: [3.8, -3.8, 1.2],
    connections: ['vqe_qaoa', 'qir_compilers', 'hpc_quantum_ai'],
    summary: 'Quantum neural networks (QNN), parameterized quantum kernels, and Matrix Product States (MPS) leveraging high-dimensional Hilbert spaces to discover correlations in complex multi-variate and scientific datasets.',
    physicsPrinciple: 'Quantum kernel trick: Mapping classical data into exponentially large Hilbert space states |ψ(x)⟩ enables linear separation of patterns through inner products K(x, y) = |⟨ψ(x)|ψ(y)⟩|² that are intractable classically.',
    presentState: 'Provable exponential quantum learning advantages demonstrated on engineered discrete log datasets and quantum sensor data streams.',
    futureMilestones: '2028: Direct ingestion of quantum states from quantum sensors into QNN processors with zero classical state reconstruction loss.',
    equations: [
      'K(x, x\') = |\\langle \\phi(x) | \\phi(x\') \\rangle|^2',
      '|\\Psi\\rangle = \\sum_{i_1, \\dots, i_n} A^{[1] i_1} A^{[2] i_2} \\cdots A^{[n] i_n} |i_1 \\dots i_n\\rangle \\quad (\\text{MPS})'
    ],
    leaders: ['Google Quantum AI', 'IBM Research', 'University of Toronto (Vector Institute)', 'Amazon Braket'],
    bottlenecks: ['Input/output classical-to-quantum state preparation bottlenecks', 'Data encoding barren plateaus'],
    applications: ['High-energy physics collision classification', 'Quantum sensor telemetry processing', 'Financial risk classification']
  },

  // 5. Future Horizons (2026 - 2035+)
  {
    id: 'quantum_internet',
    name: 'Distributed Entanglement & Quantum Repeaters',
    shortName: 'Quantum Internet',
    category: 'future',
    era: 'future',
    trl: 4,
    color: '#00f5ff',
    pos: [2.5, -4.8, -3.2],
    connections: ['photonic', 'trapped_ion', 'quantum_sensing', 'pqc_migration'],
    summary: 'Global telecommunication network transmitting quantum information and distributing Einstein-Podolsky-Rosen (EPR) entangled pairs over fiber-optic and satellite links via quantum repeaters to link distant quantum supercomputers.',
    physicsPrinciple: 'Quantum Teleportation protocol coupled with entanglement swapping and quantum memories: Entangling intermediate nodes enables long-distance entanglement distribution without physical photon transmission across the entire link.',
    presentState: 'Metropolitan quantum entanglement networks demonstrated in Delft, Chicago, and Hefei across 50-100 km of optical fiber. Satellite-to-ground Micius QKD over 1,200 km.',
    futureMilestones: '2029: First operational memory-assisted quantum repeater chain with entanglement distillation. 2035: Multinational distributed quantum cloud computing cluster.',
    equations: [
      '|\\Psi^+\\rangle_{14} = \\text{BellSwap}(|\\Psi^+\\rangle_{12}, |\\Psi^+\\rangle_{34})',
      'F_{swapped} = F_1 \\cdot F_2 + \\frac{(1-F_1)(1-F_2)}{3}'
    ],
    leaders: ['QuTech / Delft', 'Argonne National Lab / Chicago Quantum Exchange', 'University of Science and Technology of China (USTC)'],
    bottlenecks: ['Quantum memory coherence time in optical wavelength interfaces', 'Coherent microwave-to-telecom-optical transducers'],
    applications: ['Blind cloud quantum computing (unhackable privacy)', 'Interferometric baseline telescope arrays', 'Global synchronized atomic clocks']
  },
  {
    id: 'pqc_migration',
    name: 'Post-Quantum Cryptography (PQC) Standards',
    shortName: 'PQC Migration (NIST)',
    category: 'future',
    era: 'present',
    trl: 9,
    color: '#ec4899',
    pos: [4.8, -4.2, -2.2],
    connections: ['shor_grover', 'quantum_internet'],
    summary: 'Standardized classical mathematical cryptosystems (lattice-based, code-based, hash-based) designed to resist attacks from both classical supercomputers and future fault-tolerant quantum computers running Shor\'s algorithm.',
    physicsPrinciple: 'Hardness of finding short vectors in high-dimensional lattices (Learning With Errors / LWE, Ring-LWE), for which no polynomial-time quantum algorithm is known.',
    presentState: 'NIST officially released FIPS 203 (ML-KEM / Kyber), FIPS 204 (ML-DSA / Dilithium), and FIPS 205 (SLH-DSA / SPHINCS+). Global rollout across TLS 1.3 in Google Chrome, Apple iMessage, and Cloudflare.',
    futureMilestones: '2028-2030: Mandatory governmental and financial cryptographic transition deadlines replacing all RSA and ECC certificates.',
    equations: [
      '\\text{LWE: } \\vec{b} = \\mathbf{A} \\vec{s} + \\vec{e} \\pmod q',
      '\\text{Hardness: } \\text{GapSVP}_\\gamma \\text{ (Shortest Vector Problem)}'
    ],
    leaders: ['NIST', 'NSA', 'ANSSI', 'Cloudflare / Google Security'],
    bottlenecks: ['Larger public key and ciphertext sizes compared to RSA/ECC', 'Side-channel physical attack vulnerabilities during transition'],
    applications: ['Securing all global internet traffic against "Harvest Now, Decrypt Later" threats']
  },
  {
    id: 'million_qubit_ftqc',
    name: 'Million-Qubit Fault-Tolerant Commercial Datacenter',
    shortName: 'Million-Qubit FTQC',
    category: 'future',
    era: 'future',
    trl: 4,
    color: '#10b981',
    pos: [5.8, 1.8, 1.2],
    connections: ['surface_code', 'lattice_surgery', 'qldpc_codes', 'shor_grover', 'hpc_quantum_ai'],
    summary: 'The ultimate vision of quantum computing: commercial datacenter-scale machines with 1,000,000+ physical qubits supporting thousands of error-corrected logical qubits operating continuously with negligible error rates (10⁻¹² per logical operation).',
    physicsPrinciple: 'Fault-tolerant threshold theorem: If physical component error rates remain strictly below a characteristic threshold p < p_th, the logical error rate can be made arbitrarily small with poly-logarithmic physical overhead.',
    presentState: 'Physical architectures are being designed with industrial semiconductor fabs (PsiQuantum, Intel) and modular cryostat clusters (IBM Kookaburra, Google roadmap).',
    futureMilestones: '2030-2033: Demonstration of first commercially viable 100,000+ physical qubit systems. 2035+: Full 1,000,000-qubit utility computing solving macroeconomic problems.',
    equations: [
      '\\epsilon_L = C \\cdot \\left(\\frac{p}{p_{th}}\\right)^{(d+1)/2} < 10^{-12}',
      'N_{physical} = N_{logical} \\cdot (2d^2 + 1) + N_{factories}'
    ],
    leaders: ['Google Quantum AI', 'IBM Quantum', 'PsiQuantum', 'Microsoft Quantum'],
    bottlenecks: ['Cryogenic cooling power scalability at megawatt scales', 'Industrial automated manufacturing yield with zero defect tolerance'],
    applications: ['Cracking global climate catalyst bottlenecks', 'Exascale logistics & drug synthesis', 'Cryptographic security supremacy']
  },
  {
    id: 'quantum_sensing',
    name: 'Quantum Metrology, Gravimetry & Diamond NV Centers',
    shortName: 'Quantum Sensing',
    category: 'future',
    era: 'present',
    trl: 8,
    color: '#f59e0b',
    pos: [0.8, -4.6, 2.8],
    connections: ['quantum_internet', 'trapped_ion', 'qml_tensor'],
    summary: 'Using non-classical quantum correlations, squeezed states, and Nitrogen-Vacancy (NV) diamond color centers to perform measurements of magnetic fields, gravity, acceleration, and time at the fundamental Heisenberg limit.',
    physicsPrinciple: 'Heisenberg precision scaling Δθ ≥ 1/N utilizing entangled states, surpassing the classical Standard Quantum Limit (Shot Noise Limit) Δθ ≥ 1/√N.',
    presentState: 'LIGO gravitational wave detectors using squeezed vacuum light to detect black hole mergers. Cold-atom gravimeters mapping underground aquifer density and defense navigation without GPS.',
    futureMilestones: '2028: Nanoscale in-vivo magnetic resonance imaging (MRI) of single proteins using room-temperature diamond NV sensor tips.',
    equations: [
      '\\Delta \\theta_{SQL} = \\frac{1}{\\sqrt{N}} \\implies \\Delta \\theta_{Heisenberg} = \\frac{1}{N}',
      '\\gamma_{NV} \\approx 28 \\text{ GHz / Tesla}'
    ],
    leaders: ['LIGO Scientific Collaboration', 'SandboxAQ', 'Q-CTRL', 'Harvard (Lukin Lab)'],
    bottlenecks: ['Photon collection efficiency from diamond color centers', 'Environmental magnetic noise isolation in field applications'],
    applications: ['GPS-denied subterranean navigation', 'Single-molecule biological imaging', 'Dark matter candidate searches']
  },
  {
    id: 'hpc_quantum_ai',
    name: 'Hybrid Quantum-Classical Exascale Supercomputing',
    shortName: 'Quantum-HPC Exascale',
    category: 'future',
    era: 'future',
    trl: 6,
    color: '#8b5cf6',
    pos: [4.6, 4.4, 0.0],
    connections: ['million_qubit_ftqc', 'qml_tensor', 'vqe_qaoa', 'qir_compilers'],
    summary: 'Direct physical integration of quantum processing units (QPUs) into exascale AI supercomputers via low-latency PCIe / NVLink interconnects, creating a unified heterogeneous accelerated compute node.',
    physicsPrinciple: 'Amdahl\'s and Gustafson\'s laws extended to quantum coprocessors: Offloading exponentially hard kernel evaluations and Hamiltonian evolution to QPUs while classical GPU tensor cores handle machine learning gradient aggregation.',
    presentState: 'NVIDIA CUDA-Q architecture connecting classical GPU clusters (Grace Hopper) to physical QPUs via sub-millisecond RPC pipelines at supercomputer centers (Jülich, RIKEN, NERSC).',
    futureMilestones: '2028: Direct microsecond memory-mapped communication between GPU HBM memory and QPU control FPGAs for real-time quantum-classical co-processing.',
    equations: [
      'S_{speedup} = \\frac{1}{(1-p) + \\frac{p}{S_{quantum}}}',
      '\\tau_{latency} < 10 \\ \\mu\\text{s} \\quad (\\text{Target Interconnect Response})'
    ],
    leaders: ['NVIDIA (CUDA-Q)', 'IBM Quantum', 'Jülich Supercomputing Centre', 'EuroHPC'],
    bottlenecks: ['Heterogeneous synchronization overhead between classical clock ticks and quantum gate execution times', 'Unified runtime scheduling algorithms'],
    applications: ['Next-generation generative AI model acceleration', 'Massive multi-physics material simulations', 'Global climate prediction models']
  }
];

// --- 7 STAGES OF THE QUANTUM COMPUTING ENGINE FLOW ---
export const ENGINE_STAGES: EngineStage[] = [
  {
    id: 'stage_1_formulation',
    stepNumber: 1,
    name: 'High-Level Problem Formulation & Circuit Synthesis',
    shortName: '1. Problem Formulation',
    phase: 'Software & Algorithm',
    color: '#38bdf8',
    pos: [-9.0, 0, 0],
    icon: 'Code2',
    typicalLatency: '100 – 500 ms (One-time)',
    temperature: '300 K (Classical Cloud / HPC)',
    clockDomain: '3.5 GHz (x86_64 / ARM Neoverse)',
    description: 'The computational problem (such as molecular Hamiltonian ground state search, portfolio optimization, or prime factorization) is formulated mathematically and represented as a high-level quantum circuit with parameterized unitaries in OpenQASM 3.0 or QIR.',
    hardwarePlatform: 'Classical Host Server / Python Runtime (Qiskit, Cirq, Classiq)',
    keyOperations: [
      'Fermionic Jordan-Wigner / Bravyi-Kitaev transformation into Pauli strings',
      'Ansatz parameterization (|ψ(θ)⟩) for variational quantum algorithms',
      'Clifford + T gate synthesis with Solovay-Kitaev approximation'
    ],
    physicsPrinciple: 'Mapping discrete physical problem Hamiltonians into the 2^N dimensional Hilbert space of quantum statevectors.',
    inputFormat: 'Molecular coordinate geometry / MaxCut Graph adjacency matrix',
    outputFormat: 'Unoptimized OpenQASM 3.0 AST / LLVM Quantum Intermediate Representation (QIR)',
    liveMetric: { label: 'Abstract Gate Count', value: '142', unit: 'gates' },
    realWorldEquivalents: ['Qiskit SDK', 'Google Cirq', 'PennyLane', 'Classiq Synthesis'],
    equations: [
      '\\hat{H} = \\sum_{pq} h_{pq} a_p^\\dagger a_q + \\frac{1}{2} \\sum_{pqrs} h_{pqrs} a_p^\\dagger a_q^\\dagger a_s a_r',
      'a_j^\\dagger = \\frac{1}{2} (X_j - i Y_j) \\bigotimes_{k < j} Z_k \\quad (\\text{Jordan-Wigner})'
    ]
  },
  {
    id: 'stage_2_compilation',
    stepNumber: 2,
    name: 'Unitary Synthesis, KAK Decomposition & Topology Routing',
    shortName: '2. Unitary Compilation',
    phase: 'Compilation & Synthesis',
    color: '#00f5ff',
    pos: [-6.0, 0, 0],
    icon: 'Layers',
    typicalLatency: '50 – 200 ms',
    temperature: '300 K (Classical Host Server)',
    clockDomain: 'PCIe Gen 5 / NVLink Interconnect',
    description: 'The compiler translates arbitrary multi-qubit unitaries into the native gate set of the physical QPU (e.g. {Rz(θ), √X, CZ, iSWAP}). Commuting gates are reordered, adjacent self-inverse operations canceled, and SWAP routing chains inserted across the physical coupler coupling graph.',
    hardwarePlatform: 'High-Performance Graph Optimization Engine (Qiskit Transpiler, TKET, Cirq)',
    keyOperations: [
      'Cartan KAK decomposition of SU(4) 2-qubit unitaries into maximum 3 CZ gates',
      'Heuristic SABRE A* qubit layout and routing on heavy-hex / square grid coupling graphs',
      'Dynamical decoupling (XY4 / CPMG) pulse sequence insertion for idling qubits'
    ],
    physicsPrinciple: 'Maximizing quantum fidelity by minimizing circuit execution time relative to T₁ (relaxation) and T₂ (dephasing) limits.',
    inputFormat: 'OpenQASM 3.0 / QIR Abstract Syntax Tree',
    outputFormat: 'Routed Hardware Directed Acyclic Graph (DAG) with physical qubit mapping',
    liveMetric: { label: 'Compilation Overhead', value: '+14.2%', unit: 'depth' },
    realWorldEquivalents: ['Cambridge Quantum TKET', 'Qiskit Transpiler Level 3', 'Google Cirq Router'],
    equations: [
      'U \\in \\mathrm{SU}(4) = (A_1 \\otimes A_2) \\exp\\left(i \\sum_{k=x,y,z} c_k \\sigma_k \\sigma_k\\right) (B_1 \\otimes B_2)',
      '\\text{Cost} = \\sum_{(q_i, q_j) \\in \\text{circuit}} \\text{dist}_{QPU}(q_i, q_j)'
    ]
  },
  {
    id: 'stage_3_qec_encoding',
    stepNumber: 3,
    name: 'Fault-Tolerant Surface Code & Lattice Surgery Planning',
    shortName: '3. Fault-Tolerant QEC',
    phase: 'Compilation & Synthesis',
    color: '#a855f7',
    pos: [-3.0, 0, 0],
    icon: 'ShieldCheck',
    typicalLatency: '10 – 50 ms',
    temperature: '300 K / Real-Time Orchestration FPGA',
    clockDomain: 'Real-Time Dynamic Scheduler',
    description: 'Each logical qubit is embedded into a rotated surface code patch (e.g. distance d=5 or d=7). Ancilla qubits are scheduled for continuous syndrome extraction cycles. Non-Clifford T-gates are requested from parallel magic-state distillation factories via topological lattice surgery.',
    hardwarePlatform: 'Logical QEC Compiler & Scheduler (Stim, Riverlane Deltaflow, Google QEC)',
    keyOperations: [
      'Stabilizer scheduling: X-star and Z-plaquette alternating parity measurements',
      'Lattice surgery routing: Topological boundary merging and splitting for logical CNOTs',
      'Magic state distillation pipeline: 15-to-1 Bravyi-Kitaev error filtering'
    ],
    physicsPrinciple: 'Topological protection: Local environmental physical errors cannot disturb the non-local topological homology cycle encoding the logical state.',
    inputFormat: 'Native Hardware DAG',
    outputFormat: 'Fault-Tolerant Stabilizer Measurement Schedule & Ancilla Reset Loops',
    liveMetric: { label: 'Surface Code Distance', value: 'd = 7', unit: 'distance' },
    realWorldEquivalents: ['Google Willow QEC Pipeline', 'Riverlane Deltaflow.OS', 'IBM QEC Roadmap'],
    equations: [
      'P_L \\approx C \\left(\\frac{p}{p_{th}}\\right)^{(d+1)/2} \\quad (p < p_{th} \\approx 1\\%)',
      '\\text{Overhead} = 2d^2 - 1 \\text{ physical qubits per logical patch}'
    ]
  },
  {
    id: 'stage_4_pulse_synthesis',
    stepNumber: 4,
    name: 'Microwave / Optical Pulse Synthesis & DRAG Shaping',
    shortName: '4. Pulse & Waveform Synthesis',
    phase: 'Physical Control & Hardware',
    color: '#f59e0b',
    pos: [0, 0, 0],
    icon: 'Radio',
    typicalLatency: '1 – 5 μs',
    temperature: '300 K Rack Instrumentation',
    clockDomain: '2.4 – 5.0 GSa/s (Ultra-high speed DACs)',
    description: 'Discrete quantum gate operations are synthesized into continuous nanosecond-precision voltage waveforms. Derivative Removal by Adiabatic Gate (DRAG) pulses are calculated at intermediate frequencies (~200 MHz) and IQ-mixed with local oscillators to hit exact qubit resonances (~5 GHz).',
    hardwarePlatform: 'Arbitrary Waveform Generators (AWG) & FPGA Control (Zurich Instruments, Quantum Machines OPX+, Keysight)',
    keyOperations: [
      'DRAG envelope shaping: Gaussian envelope + time-derivative quadrature correction',
      'Crosstalk compensation: Matrix inversion of inter-qubit microwave crosstalk',
      'Cavity ringdown suppression: Active reset and depletion pulses for readout resonators'
    ],
    physicsPrinciple: 'Anharmonicity management: The derivative term in DRAG cancels spectral components at the unwanted |1⟩ ↔ |2⟩ leakage transition frequency.',
    inputFormat: 'Calibrated Pulse Schedule (OpenPulse / QubiC)',
    outputFormat: 'Multi-Channel Analog I/Q Waveform Streams at 5 GHz Carrier Frequency',
    liveMetric: { label: 'DRAG Leakage Parameter', value: 'β = -0.42', unit: 'ratio' },
    realWorldEquivalents: ['Zurich Instruments HDAWG', 'Quantum Machines OPX1000', 'Keysight Trueform'],
    equations: [
      '\\Omega(t) = \\Omega_x(t) + i \\beta \\frac{d\\Omega_x(t)}{dt}',
      '\\Omega_x(t) = A \\exp\\left(-\\frac{(t - t_0)^2}{2\\sigma^2}\\right) - A \\exp\\left(-\\frac{t_{gate}^2}{8\\sigma^2}\\right)'
    ]
  },
  {
    id: 'stage_5_cryogenic_qpu',
    stepNumber: 5,
    name: 'Cryogenic Attenuation Cascade & 15mK QPU Execution',
    shortName: '5. 15mK QPU Execution',
    phase: 'Physical Control & Hardware',
    color: '#00f5ff',
    pos: [3.0, 0, 0],
    icon: 'Atom',
    typicalLatency: '15 – 80 ns per 2-qubit gate',
    temperature: '14.8 mK (Colder than deep space 2.7 K)',
    clockDomain: 'Continuous sub-harmonic quantum evolution (~5 GHz)',
    description: 'The microwave pulses descend through 5 temperature stages (50K → 4K → 800mK → 100mK → 15mK), shedding thermal Johnson-Nyquist noise through -60 dB of staged attenuation. Inside the vacuum-shielded can, the microwave fields drive Josephson junctions, rotating quantum state vectors on the Bloch sphere.',
    hardwarePlatform: 'Superconducting Transmon / Fluxonium Processor (Bluefors / Oxford Cryostat)',
    keyOperations: [
      'Thermal photon elimination: Staged -20dB attenuators suppress thermal photon population < 10⁻⁷',
      'Tunable coupler activation: Nanosecond flux pulse brings transmons into parametric resonance',
      'Unitary Hilbert space evolution: Coherent Rabi oscillations and entangling CZ operations'
    ],
    physicsPrinciple: 'Josephson non-linear inductance creating an artificial macroscopic quantum atom with energy scale hf ≈ 3.3 × 10⁻²⁴ J >> k_B T (at 15 mK).',
    inputFormat: 'Cryogenically attenuated microwave pulse bursts',
    outputFormat: 'Superposed and entangled statevector |Ψ⟩ in 2^N Hilbert space',
    liveMetric: { label: 'Base Temperature', value: '14.8', unit: 'mK' },
    realWorldEquivalents: ['Google Willow (105 Qubits)', 'IBM Heron (156 Qubits)', 'Rigetti Ankaa-2'],
    equations: [
      'i\\hbar \\frac{\\partial |\\Psi(t)\\rangle}{\\partial t} = \\hat{H}_{QPU}(t) |\\Psi(t)\\rangle',
      'n_{thermal} = \\frac{1}{e^{hf / k_B T} - 1} < 10^{-7} \\quad (\\text{Ground state purity})'
    ]
  },
  {
    id: 'stage_6_readout_decoding',
    stepNumber: 6,
    name: 'Dispersive Cavity Readout & Ultra-Fast FPGA QEC Decoding',
    shortName: '6. Readout & FPGA Decoding',
    phase: 'Real-Time Decoding & Post-Processing',
    color: '#ec4899',
    pos: [6.0, 0, 0],
    icon: 'Activity',
    typicalLatency: '450 – 950 ns (Hard real-time deadline!)',
    temperature: '4 K (TWPA / HEMT) & 300 K (FPGA Rack)',
    clockDomain: '400 MHz Real-Time Low-Latency DSP',
    description: 'A readout microwave tone probes the coplanar waveguide resonator. The qubit state pulls the resonator frequency (dispersive shift 2χ). The transmitted signal is amplified by a +20dB quantum-limited TWPA, demodulated, and ingested by real-time FPGA decoders running Minimum-Weight Perfect Matching (MWPM) to find error syndromes.',
    hardwarePlatform: 'Traveling Wave Parametric Amplifier (TWPA) + Xilinx Zynq UltraScale+ FPGA',
    keyOperations: [
      'Dispersive state readout: Frequency shift Δf = 2χ separates |0⟩ and |1⟩ transmission phase',
      'TWPA near-quantum-limited amplification: +20 dB gain with < 1 added quantum of noise',
      'FPGA MWPM / Union-Find decoding: Identifies bit-flip (X) and phase-flip (Z) errors in < 1000 ns'
    ],
    physicsPrinciple: 'Jaynes-Cummings dispersive regime: Qubit-cavity detuning |Δ| >> g avoids energy exchange while imparting a state-dependent phase shift on photons.',
    inputFormat: 'Dispersively shifted microwave transmission tones',
    outputFormat: 'Real-Time Pauli Frame Updates & Corrected Ancilla Parity Bitstrings',
    liveMetric: { label: 'Decoder Latency', value: '420', unit: 'ns' },
    realWorldEquivalents: ['MIT Lincoln Lab TWPA', 'PyMatching 2 / Fusion Blossom', 'Riverlane Decoder Chip'],
    equations: [
      '\\hat{H}_{disp} = \\hbar(\\omega_r + \\chi \\sigma_z) a^\\dagger a + \\frac{\\hbar \\omega_q}{2} \\sigma_z',
      '\\tau_{decode} < \\tau_{coherence\\_cycle} \\approx 1000 \\text{ ns} \\quad (\\text{Real-time threshold})'
    ]
  },
  {
    id: 'stage_7_mitigation_results',
    stepNumber: 7,
    name: 'Quantum Error Mitigation, Tomography & Classical Output',
    shortName: '7. Error Mitigation & Results',
    phase: 'Real-Time Decoding & Post-Processing',
    color: '#10b981',
    pos: [9.0, 0, 0],
    icon: 'CheckCircle2',
    typicalLatency: '5 – 50 ms',
    temperature: '300 K (Classical Host Node)',
    clockDomain: 'Distributed MPI / CUDA-Q',
    description: 'Thousands of individual projective measurement bitstrings are aggregated. Quantum Error Mitigation (Zero-Noise Extrapolation, Readout Matrix Inversion, Pauli Twirling) strips remaining residual hardware noise, yielding high-precision physical expectation values that feed back into classical optimization routines.',
    hardwarePlatform: 'Distributed Classical Post-Processing Cluster (NVIDIA CUDA-Q, IBM Runtime)',
    keyOperations: [
      'Readout error mitigation: Inverting the transition calibration matrix M: P_true = M⁻¹ P_meas',
      'Zero-Noise Extrapolation (ZNE): Pulse stretching or unitary folding to extrapolate to zero noise',
      'Classical feedback loop: Computing gradients (Parameter Shift Rule) for VQE / QAOA iteration'
    ],
    physicsPrinciple: 'Richardson extrapolation and symmetry verification cancel leading-order Kraus operator noise without physical quantum error correction overhead.',
    inputFormat: 'Raw measurement bitstrings & calibration matrices',
    outputFormat: 'Error-mitigated ground state energy / Solution bitstring with 99.9% confidence',
    liveMetric: { label: 'Ground State Energy', value: '-1.1373', unit: 'Hartree' },
    realWorldEquivalents: ['Mitiq (Unitary Fund)', 'IBM Qiskit Runtime Sampler & Estimator', 'NVIDIA CUDA-Q'],
    equations: [
      '\\vec{P}_{true} = \\mathbf{M}_{readout}^{-1} \\vec{P}_{measured}',
      'E_{mitigated} = \\lim_{\\lambda \\to 0} E(\\lambda) = \\sum_i c_i E(r_i \\lambda) \\quad (\\text{ZNE})'
    ]
  }
];

export const QuantumTechnologyMap3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Active View Mode: 'matrix' (3D Ecosystem Topology) vs 'pipeline' (3D Quantum Engine Execution Flow) vs 'schematic' (End-to-End QC Workflow Architecture)
  const [viewMode, setViewMode] = useState<'matrix' | 'pipeline' | 'schematic'>('matrix');
  const [showLabels, setShowLabels] = useState<boolean>(true);

  // Matrix View State
  const [selectedNodeId, setSelectedNodeId] = useState<string>('superconducting');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterEra, setFilterEra] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(true);
  const [isComparatorOpen, setIsComparatorOpen] = useState<boolean>(false);

  // Pipeline Flow State
  const [activeStageStep, setActiveStageStep] = useState<number>(1);
  const [isPipelinePlaying, setIsPipelinePlaying] = useState<boolean>(false);
  const [pipelineSpeedMs, setPipelineSpeedMs] = useState<number>(2000);

  const selectedNode = useMemo(() => {
    return TECH_NODES.find(n => n.id === selectedNodeId) || TECH_NODES[0];
  }, [selectedNodeId]);

  const activeStage = useMemo(() => {
    return ENGINE_STAGES.find(s => s.stepNumber === activeStageStep) || ENGINE_STAGES[0];
  }, [activeStageStep]);

  const filteredNodes = useMemo(() => {
    return TECH_NODES.filter(node => {
      const matchCat = filterCategory === 'all' || node.category === filterCategory;
      const matchEra = filterEra === 'all' || node.era === filterEra;
      const matchSearch = searchQuery.trim() === '' || 
        node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchEra && matchSearch;
    });
  }, [filterCategory, filterEra, searchQuery]);

  // Handle Pipeline Auto-Play
  useEffect(() => {
    if (!isPipelinePlaying || viewMode !== 'pipeline') return;

    const interval = setInterval(() => {
      setActiveStageStep(prev => {
        const next = prev >= 7 ? 1 : prev + 1;
        playGateClickSound(700 + next * 60, 0.05);
        return next;
      });
    }, pipelineSpeedMs);

    return () => clearInterval(interval);
  }, [isPipelinePlaying, viewMode, pipelineSpeedMs]);

  // Guided Tour Helper
  const handleStartTour = (tourType: 'atom_to_algo' | 'qec_roadmap' | 'security' | 'foundry') => {
    setViewMode('matrix');
    setIsAutoRotate(false);
    if (tourType === 'atom_to_algo') {
      setSelectedNodeId('dilution_fridge');
      setTimeout(() => setSelectedNodeId('superconducting'), 2500);
      setTimeout(() => setSelectedNodeId('qir_compilers'), 5000);
      setTimeout(() => setSelectedNodeId('shor_grover'), 7500);
    } else if (tourType === 'qec_roadmap') {
      setSelectedNodeId('surface_code');
      setTimeout(() => setSelectedNodeId('lattice_surgery'), 2500);
      setTimeout(() => setSelectedNodeId('magic_states'), 5000);
      setTimeout(() => setSelectedNodeId('million_qubit_ftqc'), 7500);
    } else if (tourType === 'security') {
      setSelectedNodeId('pqc_migration');
      setTimeout(() => setSelectedNodeId('quantum_internet'), 3000);
      setTimeout(() => setSelectedNodeId('quantum_sensing'), 6000);
    } else if (tourType === 'foundry') {
      setSelectedNodeId('silicon_spin');
      setTimeout(() => setSelectedNodeId('cryo_cmos'), 2500);
      setTimeout(() => setSelectedNodeId('photonic'), 5000);
      setTimeout(() => setSelectedNodeId('superconducting'), 7500);
    }
  };

  // --- THREE.JS INTERACTIVE 3D SCENE ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.parentElement?.clientWidth || window.innerWidth;
    const height = canvas.parentElement?.clientHeight || 650;

    // 1. Scene & Atmosphere
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x04060c, 0.022);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    if (viewMode === 'matrix') {
      camera.position.set(0, 4.2, 16.5);
      camera.lookAt(0, 0, 0);
    } else {
      // Pipeline corridor perspective view
      camera.position.set(0, 3.2, 13.5);
      camera.lookAt(0, 0, 0);
    }

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00f5ff, 2.8);
    dirLight1.position.set(6, 12, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa855f7, 2.2);
    dirLight2.position.set(-8, -10, -8);
    scene.add(dirLight2);

    // Wavefunction Particle Atmosphere (1000 particles)
    const particleCount = 1000;
    const partGeo = new THREE.BufferGeometry();
    const partPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      partPos[i] = (Math.random() - 0.5) * 32;
      partPos[i + 1] = (Math.random() - 0.5) * 20;
      partPos[i + 2] = (Math.random() - 0.5) * 24;
    }
    partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3));
    const partMat = new THREE.PointsMaterial({
      color: 0x00f5ff,
      size: 0.06,
      transparent: true,
      opacity: 0.45
    });
    const partCloud = new THREE.Points(partGeo, partMat);
    scene.add(partCloud);

    // ==========================================
    // RENDER BRANCH A: 3D HOLOGRAPHIC TECH MATRIX
    // ==========================================
    const matrixGroup = new THREE.Group();
    const nodeMeshes: { mesh: THREE.Mesh; halo: THREE.Mesh; sprite: THREE.Sprite; node: TechNode }[] = [];
    const pulseParticles: { mesh: THREE.Mesh; start: THREE.Vector3; end: THREE.Vector3; speed: number; progress: number }[] = [];
    let coreMesh: THREE.Mesh | null = null;

    if (viewMode === 'matrix') {
      scene.add(matrixGroup);

      // Orbital Concentric Energy Rings
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x0ea5e9,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide
      });
      const ring1 = new THREE.Mesh(new THREE.RingGeometry(4.8, 4.86, 96), ringMat);
      ring1.rotation.x = Math.PI / 2;
      matrixGroup.add(ring1);

      const ring2 = new THREE.Mesh(new THREE.RingGeometry(7.2, 7.28, 96), ringMat);
      ring2.rotation.x = Math.PI / 2;
      matrixGroup.add(ring2);

      // Central Quantum Vacuum Core
      const coreGeo = new THREE.IcosahedronGeometry(1.2, 2);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x00f5ff,
        wireframe: true,
        transparent: true,
        opacity: 0.55,
        emissive: 0x0284c7,
        emissiveIntensity: 0.9
      });
      coreMesh = new THREE.Mesh(coreGeo, coreMat);
      matrixGroup.add(coreMesh);

      // 3D Nodes
      const sphereGeo = new THREE.SphereGeometry(0.34, 24, 24);
      const haloGeo = new THREE.RingGeometry(0.44, 0.54, 32);

      TECH_NODES.forEach(node => {
        const nodeColor = new THREE.Color(node.color);
        const nodeMat = new THREE.MeshStandardMaterial({
          color: nodeColor,
          emissive: nodeColor,
          emissiveIntensity: node.id === selectedNodeId ? 0.95 : 0.45,
          roughness: 0.2,
          metalness: 0.8
        });
        const mesh = new THREE.Mesh(sphereGeo, nodeMat);
        mesh.position.set(...node.pos);
        mesh.userData = { nodeId: node.id, type: 'node' };
        matrixGroup.add(mesh);

        const haloMat = new THREE.MeshBasicMaterial({
          color: nodeColor,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: node.id === selectedNodeId ? 0.9 : 0.25
        });
        const halo = new THREE.Mesh(haloGeo, haloMat);
        halo.position.set(...node.pos);
        matrixGroup.add(halo);

        // Floating 3D Text Label
        const sprite = createNodeTextSprite(node.shortName, node.trl, node.color);
        sprite.position.set(node.pos[0], node.pos[1] + 0.65, node.pos[2]);
        sprite.visible = showLabels;
        matrixGroup.add(sprite);

        nodeMeshes.push({ mesh, halo, sprite, node });
      });

      // Interconnecting Laser Lines
      const linePositions: number[] = [];
      const lineColors: number[] = [];

      TECH_NODES.forEach(source => {
        source.connections.forEach(targetId => {
          const target = TECH_NODES.find(n => n.id === targetId);
          if (target) {
            linePositions.push(source.pos[0], source.pos[1], source.pos[2]);
            linePositions.push(target.pos[0], target.pos[1], target.pos[2]);

            const c1 = new THREE.Color(source.color);
            const c2 = new THREE.Color(target.color);
            lineColors.push(c1.r, c1.g, c1.b);
            lineColors.push(c2.r, c2.g, c2.b);
          }
        });
      });

      const linesGeo = new THREE.BufferGeometry();
      linesGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
      linesGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));

      const linesMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.32,
        linewidth: 1
      });
      const laserMesh = new THREE.LineSegments(linesGeo, linesMat);
      matrixGroup.add(laserMesh);

      // Interconnecting Signal Pulse Packets along Laser Lines
      const pulseGeo = new THREE.SphereGeometry(0.065, 12, 12);
      const pulseMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff });

      TECH_NODES.forEach((source, sIdx) => {
        if (sIdx % 2 === 0) {
          source.connections.slice(0, 2).forEach(targetId => {
            const target = TECH_NODES.find(n => n.id === targetId);
            if (target) {
              const pMesh = new THREE.Mesh(pulseGeo, pulseMat);
              matrixGroup.add(pMesh);
              pulseParticles.push({
                mesh: pMesh,
                start: new THREE.Vector3(...source.pos),
                end: new THREE.Vector3(...target.pos),
                speed: 0.25 + Math.random() * 0.35,
                progress: Math.random()
              });
            }
          });
        }
      });
    }

    // ==========================================
    // RENDER BRANCH B: 3D QUANTUM COMPUTING ENGINE FLOW
    // ==========================================
    const pipelineGroup = new THREE.Group();
    const stageMeshes: {
      pod: THREE.Mesh;
      core: THREE.Mesh;
      ring: THREE.Mesh;
      stage: EngineStage;
    }[] = [];
    let statePacketMesh: THREE.Mesh | null = null;

    if (viewMode === 'pipeline') {
      scene.add(pipelineGroup);

      // Data Highway Rail / Conduit Tube
      const railCurve = new THREE.LineCurve3(
        new THREE.Vector3(-10.5, 0, 0),
        new THREE.Vector3(10.5, 0, 0)
      );
      const railGeo = new THREE.TubeGeometry(railCurve, 64, 0.08, 12, false);
      const railMat = new THREE.MeshStandardMaterial({
        color: 0x0ea5e9,
        emissive: 0x0284c7,
        emissiveIntensity: 0.6,
        roughness: 0.3,
        metalness: 0.9
      });
      const railMesh = new THREE.Mesh(railGeo, railMat);
      pipelineGroup.add(railMesh);

      // Outer Transparent Plasma Sheath
      const sheathGeo = new THREE.TubeGeometry(railCurve, 64, 0.22, 16, false);
      const sheathMat = new THREE.MeshBasicMaterial({
        color: 0x00f5ff,
        transparent: true,
        opacity: 0.15,
        wireframe: true
      });
      const sheathMesh = new THREE.Mesh(sheathGeo, sheathMat);
      pipelineGroup.add(sheathMesh);

      // Build the 7 Stage Pods in 3D
      ENGINE_STAGES.forEach(stage => {
        const stageColor = new THREE.Color(stage.color);
        const isCurrentActive = stage.stepNumber === activeStageStep;

        // Base Pedestal
        const baseGeo = new THREE.CylinderGeometry(0.7, 0.85, 0.25, 24);
        const baseMat = new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          metalness: 0.9,
          roughness: 0.2
        });
        const pod = new THREE.Mesh(baseGeo, baseMat);
        pod.position.set(stage.pos[0], stage.pos[1] - 0.7, stage.pos[2]);
        pod.userData = { stepNumber: stage.stepNumber, type: 'stage' };
        pipelineGroup.add(pod);

        // Core Quantum Transduction Sphere
        const coreSphereGeo = new THREE.SphereGeometry(0.45, 24, 24);
        const coreSphereMat = new THREE.MeshStandardMaterial({
          color: stageColor,
          emissive: stageColor,
          emissiveIntensity: isCurrentActive ? 1.0 : 0.35,
          roughness: 0.1,
          metalness: 0.8
        });
        const core = new THREE.Mesh(coreSphereGeo, coreSphereMat);
        core.position.set(stage.pos[0], stage.pos[1], stage.pos[2]);
        core.userData = { stepNumber: stage.stepNumber, type: 'stage' };
        pipelineGroup.add(core);

        // Outer Rotating Stage Ring
        const ringGeo = new THREE.TorusGeometry(0.85, 0.04, 16, 48);
        const ringMat = new THREE.MeshStandardMaterial({
          color: stageColor,
          emissive: stageColor,
          emissiveIntensity: isCurrentActive ? 0.9 : 0.2
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.set(stage.pos[0], stage.pos[1], stage.pos[2]);
        pipelineGroup.add(ring);

        stageMeshes.push({ pod, core, ring, stage });
      });

      // Traveling Quantum State Packet / Holographic Wavefunction Packet
      const packetGeo = new THREE.IcosahedronGeometry(0.35, 2);
      const packetMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0x00f5ff,
        emissiveIntensity: 1.5,
        wireframe: true
      });
      statePacketMesh = new THREE.Mesh(packetGeo, packetMat);
      statePacketMesh.position.set(activeStage.pos[0], activeStage.pos[1], activeStage.pos[2]);
      pipelineGroup.add(statePacketMesh);
    }

    // Pointer Interactivity (Hover & Selection)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onPointerDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onPointerMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;

        if (viewMode === 'matrix') {
          matrixGroup.rotation.y += deltaX * 0.008;
          matrixGroup.rotation.x += deltaY * 0.005;
          matrixGroup.rotation.x = Math.max(-0.6, Math.min(0.6, matrixGroup.rotation.x));
        } else {
          // In pipeline flow, pan camera horizontally or tilt slightly
          camera.position.x -= deltaX * 0.015;
          camera.position.x = Math.max(-10, Math.min(10, camera.position.x));
          camera.position.y += deltaY * 0.01;
          camera.position.y = Math.max(1.5, Math.min(6.5, camera.position.y));
          camera.lookAt(camera.position.x, 0, 0);
        }
      } else {
        // Raycast hover check
        raycaster.setFromCamera(mouse, camera);

        if (viewMode === 'matrix') {
          const intersects = raycaster.intersectObjects(nodeMeshes.map(m => m.mesh));
          if (intersects.length > 0) {
            const hit = intersects[0].object;
            setHoveredNodeId(hit.userData.nodeId);
            canvas.style.cursor = 'pointer';
          } else {
            setHoveredNodeId(null);
            canvas.style.cursor = 'grab';
          }
        } else {
          const targets = stageMeshes.map(s => s.core).concat(stageMeshes.map(s => s.pod));
          const intersects = raycaster.intersectObjects(targets);
          if (intersects.length > 0) {
            canvas.style.cursor = 'pointer';
          } else {
            canvas.style.cursor = 'grab';
          }
        }
      }
    };

    const onPointerUp = (e: MouseEvent) => {
      if (!isDragging) return;
      isDragging = false;

      // Click detection if barely moved
      const dist = Math.abs(e.clientX - prevMouseX) + Math.abs(e.clientY - prevMouseY);
      if (dist < 5) {
        raycaster.setFromCamera(mouse, camera);

        if (viewMode === 'matrix') {
          const intersects = raycaster.intersectObjects(nodeMeshes.map(m => m.mesh));
          if (intersects.length > 0) {
            const hit = intersects[0].object;
            setSelectedNodeId(hit.userData.nodeId);
            playGateClickSound(750, 0.04);
          }
        } else {
          const targets = stageMeshes.map(s => s.core).concat(stageMeshes.map(s => s.pod));
          const intersects = raycaster.intersectObjects(targets);
          if (intersects.length > 0) {
            const hit = intersects[0].object;
            const stepNum = hit.userData.stepNumber;
            setActiveStageStep(stepNum);
            playGateClickSound(650 + stepNum * 60, 0.05);
          }
        }
      }
    };

    canvas.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    // Animation Loop
    let animId: number;
    const startTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = (performance.now() - startTime) * 0.001;

      // Matrix Mode Animations
      if (viewMode === 'matrix') {
        if (isAutoRotate && !isDragging) {
          matrixGroup.rotation.y = elapsed * 0.06;
        }

        if (coreMesh) {
          coreMesh.rotation.y = elapsed * 0.25;
          coreMesh.rotation.x = elapsed * 0.15;
        }

        // Update signal pulses along laser lines
        pulseParticles.forEach(p => {
          p.progress = (p.progress + p.speed * 0.008) % 1.0;
          p.mesh.position.lerpVectors(p.start, p.end, p.progress);
        });

        // Halos face camera & Sprite label synchronization
        nodeMeshes.forEach(item => {
          item.halo.lookAt(camera.position);
          item.sprite.visible = showLabels;

          const isSelected = item.node.id === selectedNodeId;
          const isHovered = item.node.id === hoveredNodeId;
          const isConnected = selectedNode.connections.includes(item.node.id);

          const scale = isSelected ? 1.45 : isHovered ? 1.25 : isConnected ? 1.1 : 1.0;
          item.mesh.scale.set(scale, scale, scale);

          const targetOpacity = isSelected ? 0.95 : isHovered ? 0.8 : isConnected ? 0.5 : 0.2;
          (item.halo.material as THREE.MeshBasicMaterial).opacity = targetOpacity;

          if (isSelected) {
            item.sprite.scale.set(2.9, 0.72, 1);
          } else {
            item.sprite.scale.set(2.4, 0.6, 1);
          }
        });
      }

      // Pipeline Mode Animations
      if (viewMode === 'pipeline') {
        stageMeshes.forEach(item => {
          const isCurrent = item.stage.stepNumber === activeStageStep;
          
          // Rotate stage rings
          item.ring.rotation.x = Math.PI / 2 + Math.sin(elapsed * 1.5 + item.stage.stepNumber) * 0.15;
          item.ring.rotation.y = elapsed * (isCurrent ? 1.5 : 0.4);

          // Pulse active core
          if (isCurrent) {
            const pulse = 1.0 + Math.sin(elapsed * 4.0) * 0.12;
            item.core.scale.set(pulse, pulse, pulse);
          } else {
            item.core.scale.set(1.0, 1.0, 1.0);
          }
        });

        // Smoothly interpolate the quantum state packet position to the active stage
        if (statePacketMesh) {
          const targetX = activeStage.pos[0];
          statePacketMesh.position.x += (targetX - statePacketMesh.position.x) * 0.08;
          statePacketMesh.position.y = activeStage.pos[1] + Math.sin(elapsed * 5.0) * 0.08;
          statePacketMesh.rotation.y = elapsed * 3.0;
          statePacketMesh.rotation.x = elapsed * 2.0;

          // Camera softly follows the packet
          if (!isDragging) {
            camera.position.x += (statePacketMesh.position.x - camera.position.x) * 0.04;
            camera.lookAt(camera.position.x, 0, 0);
          }
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const newW = entry.contentRect.width;
        const newH = entry.contentRect.height;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, [viewMode, selectedNodeId, isAutoRotate, hoveredNodeId, activeStageStep, activeStage.pos]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#04060c] text-slate-200 overflow-hidden font-sans">
      
      {/* Top Header & Mode Switcher */}
      <div className="px-5 py-3 border-b border-slate-800 bg-[#070b14]/90 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shrink-0 z-30">
        
        {/* Title & Mode Segmented Controller */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-500/20">
            {viewMode === 'matrix' ? <Network className="w-5 h-5" /> : <Workflow className="w-5 h-5 text-indigo-400" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white font-mono tracking-tight">
                {viewMode === 'matrix' 
                  ? 'Quantum Technology Architecture & Horizons' 
                  : viewMode === 'pipeline' 
                  ? 'Quantum Computing Engine Execution Flow'
                  : 'End-to-End Quantum Computing Workflow Schematic'}
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono uppercase font-bold">
                {viewMode === 'matrix' ? '3D Ecosystem Matrix' : viewMode === 'pipeline' ? '7-Stage Hardware Pipeline' : '9-Stage Full-Stack Signal Chain'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              {viewMode === 'matrix' 
                ? 'Spatial 3D Topology: Physical Qubit Modalities, Cryogenics, Error Correction & Post-Quantum Horizons'
                : viewMode === 'pipeline'
                ? 'End-to-End Quantum Execution: From Algorithm Formulation to Nanosecond 15mK Pulse Dynamics & FPGA Decoding'
                : 'Interactive Engineering Schematic: Trace the computational signal from Hamiltonian formulation down to cryogenic QPU physics and QEC decoding'}
            </p>
          </div>
        </div>

        {/* Global Controls & Mode Switcher */}
        <div className="flex items-center flex-wrap gap-2.5 text-xs font-mono">
          
          {/* PRIMARY TOGGLE: Matrix vs Pipeline vs Schematic */}
          <div className="flex items-center bg-slate-950 border border-slate-700/80 rounded-xl p-1 shadow-inner">
            <button
              onClick={() => {
                setViewMode('matrix');
                playGateClickSound(700, 0.04);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'matrix'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>3D Tech Matrix</span>
            </button>

            <button
              onClick={() => {
                setViewMode('pipeline');
                playGateClickSound(850, 0.04);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'pipeline'
                  ? 'bg-indigo-500 text-white font-bold shadow-md shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Workflow className="w-3.5 h-3.5" />
              <span>⚡ 3D Engine Flow</span>
            </button>

            <button
              onClick={() => {
                setViewMode('schematic');
                playGateClickSound(900, 0.04);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'schematic'
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>⚡ QC Workflow Schematic</span>
            </button>
          </div>

          {/* Conditional Filters based on Mode */}
          {viewMode === 'matrix' && (
            <>
              {/* Search Box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text"
                  placeholder="Search 20+ technologies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500 w-44"
                />
              </div>

              {/* Era Filter */}
              <div className="hidden xl:flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                {[
                  { id: 'all', label: 'All Eras' },
                  { id: 'present', label: 'Present' },
                  { id: 'near_term', label: 'Near-Term' },
                  { id: 'future', label: 'Horizons' }
                ].map(e => (
                  <button
                    key={e.id}
                    onClick={() => setFilterEra(e.id)}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer text-[11px] ${
                      filterEra === e.id
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {e.label}
                  </button>
                ))}
              </div>

              {/* 3D Floating Labels Toggle */}
              <button
                onClick={() => {
                  playGateClickSound(650);
                  setShowLabels(!showLabels);
                }}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono cursor-pointer flex items-center gap-1.5 transition-colors ${
                  showLabels ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
                title="Toggle 3D floating technology name badges"
              >
                <Tag className="w-3.5 h-3.5" />
                <span>{showLabels ? 'Labels ON' : 'Labels OFF'}</span>
              </button>

              {/* Auto-Orbit Toggle */}
              <button
                onClick={() => setIsAutoRotate(!isAutoRotate)}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono cursor-pointer flex items-center gap-1.5 transition-colors ${
                  isAutoRotate ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <Rotate3d className="w-3.5 h-3.5" />
                <span>{isAutoRotate ? 'Orbit ON' : 'Orbit OFF'}</span>
              </button>

              {/* Architecture Comparator Button */}
              <button
                onClick={() => {
                  playGateClickSound(700);
                  setIsComparatorOpen(true);
                }}
                className="px-2.5 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 text-xs font-mono cursor-pointer flex items-center gap-1.5 transition-colors shadow-xs shadow-cyan-500/20"
                title="Compare any two quantum computing modalities side-by-side"
              >
                <Scale className="w-3.5 h-3.5 text-cyan-400" />
                <span>Compare Modalities</span>
              </button>
            </>
          )}

          {viewMode === 'pipeline' && (
            /* Engine Pipeline Controls */
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const prev = activeStageStep <= 1 ? 7 : activeStageStep - 1;
                  setActiveStageStep(prev);
                  playGateClickSound(600 + prev * 50, 0.04);
                }}
                className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 cursor-pointer"
                title="Previous Stage"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setIsPipelinePlaying(!isPipelinePlaying);
                  playGateClickSound(800, 0.05);
                }}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isPipelinePlaying 
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                }`}
              >
                {isPipelinePlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPipelinePlaying ? 'Pause Flow' : '▶ Simulate Pipeline'}</span>
              </button>

              <button
                onClick={() => {
                  const next = activeStageStep >= 7 ? 1 : activeStageStep + 1;
                  setActiveStageStep(next);
                  playGateClickSound(650 + next * 50, 0.04);
                }}
                className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 cursor-pointer"
                title="Next Stage"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Main Viewport: Schematic vs 3D Canvas Viewport */}
      {viewMode === 'schematic' ? (
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[#030509]">
          <TechWorkflowSchematic />
        </div>
      ) : (
        /* Main 3D Canvas & Tech Directory Split */
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* 3D WebGL Canvas Viewport */}
        <div ref={containerRef} className="flex-1 relative w-full h-full bg-[#030509]">
          <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

          {/* Mode A: Canvas HUD Legend */}
          {viewMode === 'matrix' && (
            <div className="absolute top-4 left-4 bg-slate-950/85 backdrop-blur-md border border-slate-800/90 rounded-xl p-3 font-mono text-xs space-y-2 pointer-events-none z-10 max-w-xs hidden sm:block">
              <div className="font-bold text-slate-300 flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>Spatial Tech Coordinate Matrix</span>
              </div>
              <div className="text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00f5ff]" />
                  <span>Superconducting &amp; Surface Codes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7]" />
                  <span>Trapped Ions &amp; Variational Systems</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                  <span>Neutral Atoms &amp; Cryogenics</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ec4899]" />
                  <span>Topological Qubits &amp; PQC</span>
                </div>
              </div>
            </div>
          )}

          {/* Mode B: Pipeline HUD Tracker */}
          {viewMode === 'pipeline' && (
            <div className="absolute top-4 left-4 bg-slate-950/90 backdrop-blur-md border border-indigo-500/40 rounded-xl p-3.5 font-mono text-xs space-y-2 z-10 max-w-sm">
              <div className="flex items-center justify-between text-indigo-300 font-bold">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
                  <span>Quantum Compute Execution Bus</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700">
                  STAGE {activeStage.stepNumber} OF 7
                </span>
              </div>
              <p className="text-slate-300 text-xs font-sans leading-tight">
                {activeStage.name}
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800">
                <div>
                  <span className="text-slate-500 block">Temperature:</span>
                  <span className="text-cyan-300 font-semibold">{activeStage.temperature}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Latency Budget:</span>
                  <span className="text-amber-400 font-semibold">{activeStage.typicalLatency}</span>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Guided Tours Bar (Matrix Mode) */}
          {viewMode === 'matrix' && (
            <div className="absolute top-4 right-4 hidden md:flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 z-10 text-[11px] font-mono">
              <span className="text-slate-500 px-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Guided Tours:</span>
              </span>
              <button
                onClick={() => handleStartTour('atom_to_algo')}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 transition-colors cursor-pointer"
              >
                1. Atom to Algorithm
              </button>
              <button
                onClick={() => handleStartTour('qec_roadmap')}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-700 transition-colors cursor-pointer"
              >
                2. Fault Tolerance
              </button>
              <button
                onClick={() => handleStartTour('security')}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-purple-300 border border-slate-700 transition-colors cursor-pointer"
              >
                3. Quantum Internet &amp; PQC
              </button>
              <button
                onClick={() => handleStartTour('foundry')}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-700 transition-colors cursor-pointer"
              >
                4. Silicon &amp; Photonic Fabs
              </button>
            </div>
          )}

          {/* Bottom Interaction Guide */}
          <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center gap-2 pointer-events-none">
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {viewMode === 'matrix' 
                ? 'Click any glowing 3D node to inspect physics & future roadmap' 
                : 'Drag to pan across the 7 execution pods | Click any stage to inspect live state'}
            </span>
          </div>

          {/* Bottom Quick Stage Selector / Carousel (Pipeline Mode) */}
          {viewMode === 'pipeline' && (
            <div className="absolute bottom-4 right-4 max-w-xl overflow-x-auto flex items-center gap-1 bg-slate-950/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 z-10 text-[11px] font-mono">
              {ENGINE_STAGES.map(stage => {
                const isActive = stage.stepNumber === activeStageStep;
                return (
                  <button
                    key={stage.id}
                    onClick={() => {
                      setActiveStageStep(stage.stepNumber);
                      playGateClickSound(650 + stage.stepNumber * 50, 0.04);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-[10px]">
                      {stage.stepNumber}
                    </span>
                    <span>{stage.shortName}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Bottom Quick Node Carousel (Matrix Mode) */}
          {viewMode === 'matrix' && (
            <div className="absolute bottom-4 right-4 max-w-md overflow-x-auto flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 z-10 text-[11px] font-mono">
              {filteredNodes.slice(0, 5).map(node => (
                <button
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                    selectedNodeId === node.id
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {node.shortName}
                </button>
              ))}
            </div>
          )}

        </div>

        {/* Right Inspector & Physics Encyclopedia Drawer */}
        <div className={`w-full lg:w-[500px] shrink-0 border-l border-slate-800 bg-[#070a12] flex flex-col overflow-hidden transition-all duration-300 ${
          isInspectorOpen ? 'max-h-full' : 'max-h-12'
        }`}>
          
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
            <div className="flex items-center gap-2">
              <span 
                className="w-3 h-3 rounded-full" 
                style={{ 
                  backgroundColor: viewMode === 'matrix' ? selectedNode.color : activeStage.color, 
                  boxShadow: `0 0 10px ${viewMode === 'matrix' ? selectedNode.color : activeStage.color}` 
                }} 
              />
              <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                {viewMode === 'matrix' 
                  ? `${selectedNode.category.toUpperCase()} SPECIFICATION` 
                  : `STAGE ${activeStage.stepNumber} / 7: ${activeStage.phase.toUpperCase()}`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {viewMode === 'matrix' ? (
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                  selectedNode.era === 'present' 
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : selectedNode.era === 'near_term'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    : 'bg-purple-950 text-purple-300 border border-purple-800'
                }`}>
                  {selectedNode.era.replace('_', ' ')}
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700 font-mono font-bold uppercase">
                  {activeStage.typicalLatency}
                </span>
              )}

              <button
                onClick={() => setIsInspectorOpen(!isInspectorOpen)}
                className="text-slate-400 hover:text-white p-1 rounded-md cursor-pointer"
              >
                {isInspectorOpen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Detailed Content Scroll Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-300 leading-relaxed font-sans">
            
            {/* VIEW MODE A: Tech Matrix Node Detail */}
            {viewMode === 'matrix' ? (
              <>
                {/* Title & Readiness Level */}
                <div>
                  <h3 className="text-lg font-bold text-white font-mono mb-1">
                    {selectedNode.name}
                  </h3>
                  
                  {/* TRL Bar */}
                  <div className="mt-2.5 p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 font-mono">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">Technology Readiness Level:</span>
                      <span className="text-cyan-400 font-bold">TRL {selectedNode.trl} / 9</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500" 
                        style={{ width: `${(selectedNode.trl / 9) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Overview Summary */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="font-mono text-[11px] font-bold text-cyan-300 mb-1 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    <span>Executive Summary</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    {selectedNode.summary}
                  </p>
                </div>

                {/* Interactive Method Parameter Workbench */}
                <TechNodeMethodSimulator node={selectedNode} />

                {/* Core Physics & Mathematical Formulation */}
                <div className="space-y-2 font-mono">
                  <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Atom className="w-3.5 h-3.5" />
                    <span>Fundamental Quantum Mechanical Principle</span>
                  </div>
                  <p className="text-slate-300 text-xs font-sans leading-relaxed">
                    {selectedNode.physicsPrinciple}
                  </p>

                  {/* Formula Block */}
                  {selectedNode.equations.length > 0 && (
                    <QuantumMathEquationCard equations={selectedNode.equations} theme="cyan" />
                  )}
                </div>

                {/* Current State of the Art (Present 2026) */}
                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
                  <div className="font-mono text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Current State of the Art (Present 2026)</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    {selectedNode.presentState}
                  </p>
                </div>

                {/* Upcoming Breakthrough Horizons (2027 - 2035) */}
                <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-1.5">
                  <div className="font-mono text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Upcoming Milestones &amp; Next-Gen Roadmap</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    {selectedNode.futureMilestones}
                  </p>
                </div>

                {/* Leading Organizations & Consortia */}
                <div className="space-y-2 font-mono text-xs">
                  <div className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Global Leading Labs &amp; Organizations</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.leaders.map((lead, idx) => (
                      <span 
                        key={idx} 
                        className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-slate-300 text-[11px]"
                      >
                        {lead}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Engineering Bottlenecks */}
                <div className="space-y-2 font-mono text-xs">
                  <div className="font-bold text-rose-400 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" />
                    <span>Critical Engineering Challenges</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px] font-sans">
                    {selectedNode.bottlenecks.map((b, idx) => (
                      <li key={idx}>{b}</li>
                    ))}
                  </ul>
                </div>

                {/* Interconnected Technologies */}
                <div className="space-y-2 font-mono text-xs pt-2 border-t border-slate-800">
                  <div className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Network className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Connected Quantum Technology Dependencies ({selectedNode.connections.length})</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedNode.connections.map(targetId => {
                      const target = TECH_NODES.find(n => n.id === targetId);
                      if (!target) return null;
                      return (
                        <button
                          key={target.id}
                          onClick={() => setSelectedNodeId(target.id)}
                          className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/60 transition-all text-left flex items-center justify-between cursor-pointer group"
                        >
                          <span className="truncate text-[11px] font-semibold text-slate-300 group-hover:text-cyan-300">
                            {target.shortName}
                          </span>
                          <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 shrink-0 ml-1" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              /* VIEW MODE B: Quantum Engine Flow Stage Detail */
              <>
                {/* Stage Header */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-700">
                      STEP {activeStage.stepNumber} OF 7
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {activeStage.phase}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white font-mono">
                    {activeStage.name}
                  </h3>
                </div>

                {/* Telemetry Dashboard Card */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-3 gap-2 font-mono text-center">
                  <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">Temperature</span>
                    <span className="text-xs font-bold text-cyan-400">{activeStage.temperature.split(' ')[0]}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">Latency Budget</span>
                    <span className="text-xs font-bold text-amber-400">{activeStage.typicalLatency.split(' ')[0]}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">{activeStage.liveMetric.label}</span>
                    <span className="text-xs font-bold text-emerald-400">{activeStage.liveMetric.value} {activeStage.liveMetric.unit}</span>
                  </div>
                </div>

                {/* Executive Description */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
                  <div className="font-mono text-[11px] font-bold text-indigo-300 flex items-center gap-1.5">
                    <Workflow className="w-3.5 h-3.5" />
                    <span>Stage Operational Overview</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    {activeStage.description}
                  </p>
                </div>

                {/* Key Execution Operations */}
                <div className="space-y-2">
                  <div className="font-mono text-[11px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Real-Time Microcode &amp; Subroutines</span>
                  </div>
                  <div className="space-y-1.5">
                    {activeStage.keyOperations.map((op, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/90 flex items-start gap-2 text-xs">
                        <span className="w-4 h-4 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-mono">
                          {idx + 1}
                        </span>
                        <span className="text-slate-300">{op}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Underlying Physics & Mathematical Formulation */}
                <div className="space-y-2 font-mono">
                  <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Atom className="w-3.5 h-3.5" />
                    <span>Physical Transformation &amp; Equations</span>
                  </div>
                  <p className="text-slate-300 text-xs font-sans leading-relaxed">
                    {activeStage.physicsPrinciple}
                  </p>

                  {/* Formula Block */}
                  {activeStage.equations.length > 0 && (
                    <QuantumMathEquationCard equations={activeStage.equations} theme="indigo" />
                  )}
                </div>

                {/* Hardware Platform & Industry Standards */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Control Hardware:</span>
                    <span className="text-slate-200 font-semibold">{activeStage.hardwarePlatform}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Clock / Bus:</span>
                    <span className="text-cyan-400 font-semibold">{activeStage.clockDomain}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex items-center gap-1.5 flex-wrap">
                    <span className="text-slate-500 text-[10px]">Real-World Implementations:</span>
                    {activeStage.realWorldEquivalents.map((item, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[10px]">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Next / Previous Stage Step Navigator */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <button
                    disabled={activeStageStep <= 1}
                    onClick={() => {
                      setActiveStageStep(prev => Math.max(1, prev - 1));
                      playGateClickSound(600, 0.04);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 text-xs font-mono flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous Step</span>
                  </button>

                  <button
                    disabled={activeStageStep >= 7}
                    onClick={() => {
                      setActiveStageStep(prev => Math.min(7, prev + 1));
                      playGateClickSound(750, 0.04);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-mono font-bold flex items-center gap-1 cursor-pointer shadow-md shadow-indigo-600/30"
                  >
                    <span>Next Pipeline Stage</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}

          </div>

        </div>

      </div>
    )}

      {/* Side-by-Side QC Architecture & Method Comparator Modal */}
      <TechComparatorModal
        isOpen={isComparatorOpen}
        onClose={() => setIsComparatorOpen(false)}
        defaultId1={selectedNodeId}
        defaultId2={selectedNodeId === 'photonic' ? 'superconducting' : 'photonic'}
      />

    </div>
  );
};

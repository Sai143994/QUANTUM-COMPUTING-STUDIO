import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { playGateClickSound } from '../utils/audio';

export type EngineTechGeneration = 'present' | 'future' | 'dual';
export type EnginePerspective = 'all' | 'software' | 'hardware';

export interface Stage3DDef {
  id: string;
  step: number;
  name: string;
  sub: string;
  desc: string;
  pos: [number, number, number];
  color: string;
  accent: string;
  latency: string;
  metric: string;
  generation: 'present' | 'future';
  category: 'software' | 'hardware' | 'cryo' | 'qec';
  temperature: string;
  hardwareSpecs: {
    component: string;
    materials: string;
    metallurgy?: string;
    rfPowerOrThermal?: string;
    interconnect: string;
  };
  softwareSpecs: {
    framework: string;
    algorithm: string;
    compilerOptimization: string;
    fidelityOrThreshold: string;
  };
}

// ============================================================================
// 1. PRESENT ONGOING TECHNOLOGY PIPELINE (2025/2026 DISCRETE COAX & MICROWAVE)
// ============================================================================
export const STAGES_PRESENT_3D: Stage3DDef[] = [
  {
    id: 'present_compiler',
    step: 1,
    name: 'COMPILER & TRANSPILE',
    sub: 'OpenQASM 3.0 / Clifford+T',
    desc: 'Compiles unitary gate schedules, optimizes commutation relations, and routes onto heavy-hex topological coupling graph with crosstalk mitigation',
    pos: [-7.2, 2.2, 0.4],
    color: '#00e5ff',
    accent: '#38bdf8',
    latency: '0.4 μs',
    metric: '42 GATES · QASM 3.0',
    generation: 'present',
    category: 'software',
    temperature: '300 K (Room Temp)',
    hardwareSpecs: {
      component: 'Host Xeon/EPYC Server & PCIe Gen5 Controller',
      materials: 'Standard Server Rack Chassis, Silicon CMOS',
      rfPowerOrThermal: '350 W Classical compute footprint',
      interconnect: 'PCIe Gen5 x16 host interconnect bus'
    },
    softwareSpecs: {
      framework: 'OpenQASM 3.0 / Qiskit / LLVM QIR Target',
      algorithm: 'Sabre SWAP routing + Gate commutation peephole O3',
      compilerOptimization: 'Dynamically decouple idle transmons (XY4/CPMG sequences)',
      fidelityOrThreshold: '99.9% Two-qubit gate scheduling fidelity'
    }
  },
  {
    id: 'present_awg_pulse',
    step: 2,
    name: 'ROOM-TEMP AWG',
    sub: '65 GSa/s DRAG Microwave',
    desc: 'Synthesizes in-phase (I) and quadrature (Q) envelopes with DRAG correction to eliminate parasitic leakage into higher non-computational |2⟩ state',
    pos: [-4.2, 4.4, 2.0],
    color: '#38bdf8',
    accent: '#818cf8',
    latency: '36 ns',
    metric: '65 GSa/s · 5.18 GHz',
    generation: 'present',
    category: 'hardware',
    temperature: '300 K (Rack Mount)',
    hardwareSpecs: {
      component: 'Discrete 14-bit AWG DAC & Vector IQ Modulator Racks',
      materials: 'Gold-plated SMA chassis, High-linearity RF mixers',
      rfPowerOrThermal: '+10 dBm maximum DAC output power',
      interconnect: 'SMA Coaxial jumpers to top cryostat feedthroughs'
    },
    softwareSpecs: {
      framework: 'OpenPulse / QubiC Microwave Control Runtime',
      algorithm: 'DRAG envelope Ω(t) - i(β/Δ) dΩ/dt Gaussian shaping',
      compilerOptimization: 'Randomized Benchmarking (RB) closed-loop parameter tuning',
      fidelityOrThreshold: '99.95% Single-qubit X/Y gate fidelity'
    }
  },
  {
    id: 'present_coax_cryo',
    step: 3,
    name: 'COAXIAL CRYO HARNESS',
    sub: 'Semi-Rigid NbTi & Attenuators',
    desc: 'Routes discrete UT-085 stainless steel and superconducting NbTi coaxial cables across 6 thermal stages with -60 dB cryogenic thermal attenuation',
    pos: [2.0, 4.6, 1.6],
    color: '#f59e0b',
    accent: '#fbbf24',
    latency: '18 ns',
    metric: '6-STAGE · -60dB ATTEN',
    generation: 'present',
    category: 'cryo',
    temperature: '300 K → 4 K → 15 mK',
    hardwareSpecs: {
      component: 'Discrete Semi-Rigid Coax & Thermal Attenuator Tree',
      materials: 'Stainless steel UT-085 (300K→4K), NbTi (4K→15mK), BeCu pins',
      metallurgy: 'OFHC Copper gold-plated thermal anchoring clamps',
      rfPowerOrThermal: '-20dB @ 4K, -10dB @ Still, -20dB @ 15mK thermalizing load',
      interconnect: 'Hermetic SMA feedthroughs with Cryoperm magnetic shields'
    },
    softwareSpecs: {
      framework: 'VNA S-Parameter Network Analysis System',
      algorithm: 'Time-Domain Reflectometry (TDR) impedance discontinuity match',
      compilerOptimization: 'Parasitic group delay & dispersion phase compensation',
      fidelityOrThreshold: '< 0.05 Residual thermal photons in readout cavity'
    }
  },
  {
    id: 'present_transmon_qpu',
    step: 4,
    name: '15mK TRANSMON QPU',
    sub: 'Josephson Superconducting Chip',
    desc: 'Fixed-frequency and flux-tunable transmon qubits coupled via coplanar waveguide resonators, operating in deep quantum coherence at 14.8 mK',
    pos: [7.2, 1.8, 0.2],
    color: '#f43f5e',
    accent: '#fb7185',
    latency: '124 μs',
    metric: '14.8 mK · T₁=128μs',
    generation: 'present',
    category: 'hardware',
    temperature: '14.8 mK (Mixing Chamber)',
    hardwareSpecs: {
      component: 'Al/AlOx/Al Superconducting Josephson Junction Array',
      materials: 'High-resistivity intrinsic Silicon / Sapphire substrate',
      metallurgy: 'Pure 24K hard-gold electroplated OFHC copper light-tight pack',
      rfPowerOrThermal: 'Total dissipation < 1.2 μW at 15mK base stage',
      interconnect: 'Aluminum wirebonds to gold PCB launch transitions'
    },
    softwareSpecs: {
      framework: 'Hamiltonian Micro-Master Dynamic Master Equation',
      algorithm: 'Dispersive Jaynes-Cummings Hamiltonian evolution',
      compilerOptimization: 'Dynamic Stark shift cancellation & AC flux pulsing',
      fidelityOrThreshold: 'T₁ = 128.4 μs, T₂* = 94.2 μs, 99.4% 2Q CZ Gate'
    }
  },
  {
    id: 'present_qec_offline',
    step: 5,
    name: 'POST-ANALYSIS QEC',
    sub: 'MWPM Stabilizer Syndrome',
    desc: 'Minimum-Weight Perfect Matching (MWPM) syndrome decoding executed on room-temperature compute clusters following multi-shot quantum readout',
    pos: [4.4, -3.4, -1.8],
    color: '#10b981',
    accent: '#34d399',
    latency: '1.8 ms',
    metric: 'd=3 CODE · OFFLINE',
    generation: 'present',
    category: 'qec',
    temperature: '300 K (Cluster Compute)',
    hardwareSpecs: {
      component: 'High-Performance Host CPU/GPU Accelerated Decoders',
      materials: 'Cluster Server Infrastructure at room ambient',
      rfPowerOrThermal: 'N/A (Offloaded classical post-processing)',
      interconnect: '100 GbE Optical Ethernet cluster backbone'
    },
    softwareSpecs: {
      framework: 'PyMatching 2.0 / Blossom V Matching Library',
      algorithm: 'Surface-17 code syndrome graph matching & homology update',
      compilerOptimization: 'Batch shot decoding with weighted space-time graphs',
      fidelityOrThreshold: 'Code distance d=3, Logical error rate ~10⁻³'
    }
  },
  {
    id: 'present_readout_chain',
    step: 6,
    name: 'DISPERSIVE READOUT',
    sub: '15mK TWPA & 4K HEMT',
    desc: 'Dispersive cavity state readout amplified by quantum-limited Traveling Wave Parametric Amplifier (TWPA) at 15mK, 4K HEMT, and room-temp SDR FPGA',
    pos: [-3.2, -4.0, -1.5],
    color: '#c084fc',
    accent: '#e879f9',
    latency: '450 ns',
    metric: 'χ-SHIFT · 99.4% READ',
    generation: 'present',
    category: 'hardware',
    temperature: '15 mK (TWPA) → 4 K (HEMT)',
    hardwareSpecs: {
      component: 'Josephson TWPA (+20dB gain) & Low-Noise Factory 4K HEMT (+40dB)',
      materials: 'Nb/AlOx Josephson metamaterial transmission line + GaAs HEMT',
      metallurgy: 'Cryogenic Mumetal shielding canister + superconducting lead',
      rfPowerOrThermal: 'Pump power -55 dBm at TWPA, 4K stage dissipation 8 mW',
      interconnect: 'Discrete cryogenic circulators & directional couplers'
    },
    softwareSpecs: {
      framework: 'FPGA Firmware Demodulation Pipeline',
      algorithm: 'Matched filter IQ integration & GMM state discrimination',
      compilerOptimization: 'Optimal linear discriminator with Purcell filter alignment',
      fidelityOrThreshold: '99.4% Single-shot qubit readout assignment fidelity'
    }
  }
];

// ============================================================================
// 2. FUTURE SCALABLE TECHNOLOGY PIPELINE (2030+ CRYO-CMOS & STRIPLINE SYSTEM)
// ============================================================================
export const STAGES_FUTURE_3D: Stage3DDef[] = [
  {
    id: 'future_ftqc_compiler',
    step: 1,
    name: 'FTQC LATTICE KERNEL',
    sub: 'Lattice Surgery & Distillation',
    desc: 'Real-time fault-tolerant quantum kernel compiling logical Clifford+T operations, planar surface code patch merges, and 15-to-1 magic state distillation',
    pos: [-7.2, 2.2, 0.4],
    color: '#38bdf8',
    accent: '#818cf8',
    latency: '80 ns',
    metric: 'LOGICAL PATCH · 10⁻¹⁰ ε',
    generation: 'future',
    category: 'software',
    temperature: '300 K / Cryo-Edge Co-Proc',
    hardwareSpecs: {
      component: 'Sub-Kelvin Heterogeneous Neuromorphic / RISC-V Quantum Co-Processor',
      materials: 'Ultra-low power Cryogenic Silicon-on-Insulator (SOI)',
      rfPowerOrThermal: '15 W Total orchestrator footprint',
      interconnect: 'Cryogenic optical serial links (DWDM optical transceiver)'
    },
    softwareSpecs: {
      framework: 'Fault-Tolerant Quantum Intermediate Representation (FT-QIR)',
      algorithm: 'Lattice surgery patch transformation, ZX-calculus graph rewrites',
      compilerOptimization: 'Real-time Pauli Frame tracking & dynamic T-factory re-routing',
      fidelityOrThreshold: 'Logical error rate ε_L < 10⁻¹⁰ per logical cycle'
    }
  },
  {
    id: 'future_cryo_cmos',
    step: 2,
    name: '4K CRYO-CMOS SoC',
    sub: 'Direct Digital RF Synthesis',
    desc: 'Monolithic FinFET / FD-SOI ASIC mounted directly at 4K stage, delivering direct digital microwave pulse synthesis with <80 μW/qubit power consumption',
    pos: [-4.2, 4.4, 2.0],
    color: '#a855f7',
    accent: '#c084fc',
    latency: '4.5 ns',
    metric: '4K ASIC · <80μW/Q',
    generation: 'future',
    category: 'hardware',
    temperature: '4.2 K (Plate Mounted)',
    hardwareSpecs: {
      component: 'Cryogenic 22nm FD-SOI Multi-Channel Controller ASIC',
      materials: 'Low-noise cryogenic CMOS transistors with back-gate bias',
      metallurgy: 'Indium flip-chip bonded directly to gold-plated OFHC 4K bus',
      rfPowerOrThermal: '< 80 μW per qubit channel (4K cooling power: 2.0 W)',
      interconnect: 'High-density micro-bump array to superconducting flex ribbon'
    },
    softwareSpecs: {
      framework: 'Cryogenic Microcode Hardware Engine',
      algorithm: 'In-situ Direct Digital Synthesis (DDS) & CORDIC phase accumulators',
      compilerOptimization: 'Autonomous on-die closed-loop thermal & phase drift calibration',
      fidelityOrThreshold: '99.99% Randomized benchmarking gate fidelity'
    }
  },
  {
    id: 'future_superconducting_flex',
    step: 3,
    name: 'SUPERCONDUCTING FLEX',
    sub: 'High-Density NbTi Striplines',
    desc: 'Flexible multilayer polyimide ribbon delivering 128 microwave channels per 1 cm width; cuts chandelier cable mass by 94% and heat leak by 85%',
    pos: [2.0, 4.6, 1.6],
    color: '#06b6d4',
    accent: '#22d3ee',
    latency: '6.2 ns',
    metric: '128 CH/cm · 0.08 mW',
    generation: 'future',
    category: 'cryo',
    temperature: '4 K → 15 mK Contiguous',
    hardwareSpecs: {
      component: 'High-Density Superconducting Micro-Stripline Ribbons',
      materials: 'Superconducting NbTi thin film on ultra-thin flexible polyimide',
      metallurgy: 'Micro-fabricated gold contact pads with spring-loaded interposers',
      rfPowerOrThermal: 'Passive thermal conduction < 0.08 mW across 128 channels',
      interconnect: 'Zero-insertion-force multi-channel micro-D interposers'
    },
    softwareSpecs: {
      framework: 'Cryo-Electromagnetic Finite Element Solver',
      algorithm: 'Active micro-stripline cross-talk cancellation matrix',
      compilerOptimization: 'Phase-matched differential wave propagation',
      fidelityOrThreshold: 'Inter-channel RF isolation > 82 dB from 4 to 8 GHz'
    }
  },
  {
    id: 'future_modular_qpu',
    step: 4,
    name: 'MODULAR 3D QPU CLUSTER',
    sub: 'Flip-Chip TSV & Cat Qubits',
    desc: 'Multi-tile 3D flip-chip quantum processors bonded via Through-Silicon Vias (TSVs) with coherent vacuum-sealed quantum interconnect couplers',
    pos: [7.2, 1.8, 0.2],
    color: '#ec4899',
    accent: '#f472b6',
    latency: '350 μs',
    metric: '10,000+ QUBITS · TSV 3D',
    generation: 'future',
    category: 'hardware',
    temperature: '10.5 mK (Sub-Kelvin Multi-Core)',
    hardwareSpecs: {
      component: '3D Multi-Tier Flip-Chip Superconducting Quantum Cluster',
      materials: 'High-coherence silicon/tantalum layers with Indium micro-bumps',
      metallurgy: 'Gold-plated titanium magnetic shield with superconducting aluminum can',
      rfPowerOrThermal: '< 0.4 μW dissipation per 1,000 qubit module',
      interconnect: 'Through-Silicon Vias (TSVs) & coherent microwave vacuum waveguide'
    },
    softwareSpecs: {
      framework: 'Distributed Multi-Core Quantum Topology Kernel',
      algorithm: 'Kerr-cat autonomous stabilization + teleported multi-chip entangling',
      compilerOptimization: 'Lattice-scale parallel topological error filtration',
      fidelityOrThreshold: 'T₁ > 350 μs, Bit-flip suppression > 10 s (Cat Qubit)'
    }
  },
  {
    id: 'future_realtime_qec',
    step: 5,
    name: 'SUB-100ns QEC ENGINE',
    sub: 'In-Situ Union-Find ASIC',
    desc: 'In-situ cryogenic syndrome decoding ASIC resolving Surface Code stabilizer syndromes within 65 ns—faster than logical phase drift occurs',
    pos: [4.4, -3.4, -1.8],
    color: '#10b981',
    accent: '#34d399',
    latency: '65 ns',
    metric: 'REAL-TIME · 65ns LATENCY',
    generation: 'future',
    category: 'qec',
    temperature: '4.2 K (Cryo-FPGA / ASIC)',
    hardwareSpecs: {
      component: 'In-Memory Neuromorphic / Cellular Automaton Syndrome Decoder',
      materials: 'Cryogenic 28nm Superconducting/CMOS Heterogeneous Logic',
      rfPowerOrThermal: '< 25 mW at 4K stage (high thermodynamic efficiency)',
      interconnect: 'Direct parallel data bus to Cryo-CMOS controller'
    },
    softwareSpecs: {
      framework: 'Sub-Microsecond Real-Time Decoder Firmware',
      algorithm: 'Parallel Union-Find with peeling decoder + Pauli frame feed-forward',
      compilerOptimization: 'Single-cycle graph cluster expansion and erasure correction',
      fidelityOrThreshold: 'Code distance d=7, Threshold p_th = 1.05%, 65 ns cycle'
    }
  },
  {
    id: 'future_photonic_readout',
    step: 6,
    name: 'PHOTONIC DWDM READOUT',
    sub: 'Silicon Optical Ring Modulators',
    desc: 'Cryogenic optical readout leveraging Dense Wavelength Division Multiplexing (DWDM) and on-chip micro-ring modulators via optical fibers; zero RF heat leak',
    pos: [-3.2, -4.0, -1.5],
    color: '#00e5ff',
    accent: '#38bdf8',
    latency: '45 ns',
    metric: 'DWDM OPTICAL · ZERO RF HEAT',
    generation: 'future',
    category: 'hardware',
    temperature: '15 mK (Modulator) → 300 K (Detector)',
    hardwareSpecs: {
      component: 'Silicon Photonic Micro-Ring Modulator & Low-Loss Optical Fibers',
      materials: 'Silicon Nitride (SiN) waveguides, silica optical fiber pairs',
      metallurgy: 'Hermetic fiber optic feedthrough ferrule with zero thermal bridge',
      rfPowerOrThermal: 'Zero active electrical RF heating in dilution refrigerator lines',
      interconnect: 'Single-mode optical fiber ribbon routing to room-temperature SNSPD'
    },
    softwareSpecs: {
      framework: 'Optical Continuous-Variable Demodulation Engine',
      algorithm: 'Multi-wavelength homodyne single-photon state discrimination',
      compilerOptimization: 'Ultra-dense 64-channel wavelength multiplexing on single fiber',
      fidelityOrThreshold: '99.92% Readout fidelity with 45 ns measurement window'
    }
  }
];

// Default export array for backwards compatibility across existing components
export const STAGES_3D: Stage3DDef[] = STAGES_PRESENT_3D;

// Helper to pick stages by mode
export function getStagesForMode(mode: EngineTechGeneration): Stage3DDef[] {
  if (mode === 'future') return STAGES_FUTURE_3D;
  return STAGES_PRESENT_3D;
}

// Crisp canvas texture generator for 3D billboard labels
function createCrispLabelTexture(
  step: number,
  name: string,
  sub: string,
  color: string,
  generation: 'present' | 'future'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 140;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 512, 140);

    // High-tech aerospace badge glass backdrop
    ctx.fillStyle = 'rgba(2, 6, 18, 0.94)';
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(8, 8, 496, 124, 20);
    } else {
      ctx.rect(8, 8, 496, 124);
    }
    ctx.fill();

    // Outer neon glow border
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.stroke();

    // Inner subtle border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(16, 16, 480, 108);

    // Generation indicator pill tag
    ctx.fillStyle = generation === 'future' ? 'rgba(168, 85, 247, 0.25)' : 'rgba(0, 229, 255, 0.25)';
    ctx.strokeStyle = generation === 'future' ? '#a855f7' : '#00e5ff';
    ctx.lineWidth = 1;
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(32, 18, 120, 24, 6);
    } else {
      ctx.rect(32, 18, 120, 24);
    }
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = generation === 'future' ? '#e9d5ff' : '#cffafe';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(generation === 'future' ? 'FUTURE 2030+' : 'PRESENT 2025', 92, 30);

    // Step Number Badge (e.g. "01")
    ctx.fillStyle = color;
    ctx.font = 'bold 36px "Space Grotesk", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`0${step}`, 32, 70);

    // Stage Name (e.g. "COMPILER & TRANSPILE")
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px "Space Grotesk", sans-serif';
    ctx.fillText(name, 100, 70);

    // Subtitle / Micro-spec (e.g. "OpenQASM 3.0 / Clifford+T")
    ctx.fillStyle = 'rgba(148, 163, 184, 0.95)';
    ctx.font = '20px monospace';
    ctx.fillText(sub, 100, 105);

    // Live status pulsing dot
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(460, 70, 8, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

export const QuantumEngineFlow3D: React.FC<{
  activeStageId?: string | null;
  onSelectStage?: (id: string) => void;
  engineMode?: EngineTechGeneration;
  showLabels?: boolean;
  perspective?: EnginePerspective;
}> = ({
  activeStageId,
  onSelectStage,
  engineMode = 'present',
  showLabels = true,
  perspective = 'all'
}) => {
  const groupRef = useRef<THREE.Group | null>(null);
  const pulsesPresentRef = useRef<THREE.Mesh[]>([]);
  const pulsesFutureRef = useRef<THREE.Mesh[]>([]);
  const [hoveredStageId, setHoveredStageId] = useState<string | null>(null);

  // Present generation spline & tube
  const { curvePresent, tubePresent, stageVectorsPresent } = useMemo(() => {
    const vectors = STAGES_PRESENT_3D.map(s => new THREE.Vector3(...s.pos));
    const spline = new THREE.CatmullRomCurve3(vectors, true, 'catmullrom', 0.28);
    const tube = new THREE.TubeGeometry(spline, 240, 0.065, 14, true);
    return { curvePresent: spline, tubePresent: tube, stageVectorsPresent: vectors };
  }, []);

  // Future generation spline & tube (concentric / interwoven elevation)
  const { curveFuture, tubeFuture, stageVectorsFuture } = useMemo(() => {
    const vectors = STAGES_FUTURE_3D.map(s => {
      // Offset slightly along Z and Y in dual mode for elegant side-by-side 3D flow
      return new THREE.Vector3(s.pos[0] * 1.05, s.pos[1] * 0.95 + (engineMode === 'dual' ? 1.4 : 0), s.pos[2] + (engineMode === 'dual' ? 1.2 : 0));
    });
    const spline = new THREE.CatmullRomCurve3(vectors, true, 'catmullrom', 0.28);
    const tube = new THREE.TubeGeometry(spline, 240, 0.065, 14, true);
    return { curveFuture: spline, tubeFuture: tube, stageVectorsFuture: vectors };
  }, [engineMode]);

  // Pre-generate billboard textures
  const presentLabels = useMemo(() => {
    return STAGES_PRESENT_3D.map(s => createCrispLabelTexture(s.step, s.name, s.sub, s.color, 'present'));
  }, []);

  const futureLabels = useMemo(() => {
    return STAGES_FUTURE_3D.map(s => createCrispLabelTexture(s.step, s.name, s.sub, s.color, 'future'));
  }, []);

  // Wavepacket pulses along spline
  const pulseCount = 42;
  const pulseObjects = useMemo(() => {
    return Array.from({ length: pulseCount }, (_, i) => ({
      offset: i / pulseCount,
      color: i % 3 === 0 ? '#00e5ff' : i % 3 === 1 ? '#38bdf8' : '#c084fc',
      futureColor: i % 3 === 0 ? '#a855f7' : i % 3 === 1 ? '#06b6d4' : '#ec4899',
      size: 0.12 + (i % 2) * 0.04
    }));
  }, [pulseCount]);

  // Animation frame
  useFrame(() => {
    const t = performance.now() * 0.00042;

    if (engineMode === 'present' || engineMode === 'dual') {
      pulsesPresentRef.current.forEach((mesh, idx) => {
        if (!mesh) return;
        const progress = (t + idx / pulseCount) % 1.0;
        const pt = curvePresent.getPointAt(progress);
        mesh.position.copy(pt);

        const s = 1.0 + Math.sin((t * 8 + idx * 0.8) * Math.PI) * 0.35;
        mesh.scale.set(s, s, s);
      });
    }

    if (engineMode === 'future' || engineMode === 'dual') {
      pulsesFutureRef.current.forEach((mesh, idx) => {
        if (!mesh) return;
        const progress = (t * 1.35 + idx / pulseCount) % 1.0;
        const pt = curveFuture.getPointAt(progress);
        mesh.position.copy(pt);

        const s = 1.0 + Math.sin((t * 11 + idx * 0.9) * Math.PI) * 0.35;
        mesh.scale.set(s, s, s);
      });
    }
  });

  const shouldRenderPresent = engineMode === 'present' || engineMode === 'dual';
  const shouldRenderFuture = engineMode === 'future' || engineMode === 'dual';

  return (
    <group ref={groupRef}>
      {/* ================================================================= */}
      {/* 1. PRESENT PIPELINE: COAXIAL WAVEGUIDE & METALLIC RF STREAM       */}
      {/* ================================================================= */}
      {shouldRenderPresent && (
        <group>
          {/* Outer Cyan Wireframe Lattice Conduit */}
          <mesh geometry={tubePresent}>
            <meshBasicMaterial
              color="#00e5ff"
              wireframe
              transparent
              opacity={engineMode === 'dual' ? 0.22 : 0.28}
            />
          </mesh>

          {/* Internal Core Glowing Guide Filament */}
          <mesh geometry={tubePresent}>
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={engineMode === 'dual' ? 0.08 : 0.14}
            />
          </mesh>

          {/* Flowing Present Wavepackets */}
          {pulseObjects.map((p, idx) => (
            <mesh
              key={`present_pulse_${idx}`}
              ref={el => {
                if (el) pulsesPresentRef.current[idx] = el;
              }}
            >
              <sphereGeometry args={[p.size, 14, 14]} />
              <meshBasicMaterial color={p.color} />
            </mesh>
          ))}

          {/* Present 6 Station Nodes */}
          {STAGES_PRESENT_3D.map((stage, idx) => {
            const isSelected = activeStageId === stage.id;
            const isHovered = hoveredStageId === stage.id;
            const pos = stageVectorsPresent[idx];

            if (perspective === 'software' && stage.category !== 'software' && stage.category !== 'qec') {
              return null;
            }
            if (perspective === 'hardware' && stage.category === 'software') {
              return null;
            }

            return (
              <group key={stage.id} position={pos}>
                {/* Node Core Crystal */}
                <mesh
                  onClick={e => {
                    e.stopPropagation();
                    playGateClickSound(700);
                    if (onSelectStage) onSelectStage(stage.id);
                  }}
                  onPointerOver={e => {
                    e.stopPropagation();
                    setHoveredStageId(stage.id);
                    document.body.style.cursor = 'pointer';
                  }}
                  onPointerOut={() => {
                    setHoveredStageId(null);
                    document.body.style.cursor = 'auto';
                  }}
                >
                  <icosahedronGeometry args={[isSelected || isHovered ? 0.78 : 0.56, 1]} />
                  <meshStandardMaterial
                    color={stage.color}
                    emissive={stage.color}
                    emissiveIntensity={isSelected || isHovered ? 0.95 : 0.45}
                    wireframe={!isSelected && !isHovered}
                    roughness={0.2}
                    metalness={0.8}
                  />
                </mesh>

                {/* Concentric Targeting Ring */}
                <mesh rotation={[Math.PI / 3.5, 0, 0]}>
                  <ringGeometry args={[0.85, 0.96, 36]} />
                  <meshBasicMaterial
                    color={stage.color}
                    transparent
                    opacity={isSelected || isHovered ? 0.95 : 0.45}
                    side={THREE.DoubleSide}
                  />
                </mesh>

                {/* Outer Pulsing Shell */}
                <mesh>
                  <sphereGeometry args={[1.2, 16, 16]} />
                  <meshBasicMaterial
                    color={stage.color}
                    transparent
                    opacity={isSelected || isHovered ? 0.25 : 0.06}
                    wireframe
                  />
                </mesh>

                {/* Vertical Beacon */}
                <line>
                  <bufferGeometry
                    attach="geometry"
                    onUpdate={self => {
                      self.setFromPoints([
                        new THREE.Vector3(0, -1.6, 0),
                        new THREE.Vector3(0, 1.6, 0)
                      ]);
                    }}
                  />
                  <lineBasicMaterial
                    color={stage.color}
                    transparent
                    opacity={isSelected || isHovered ? 0.8 : 0.3}
                  />
                </line>

                {/* 3D Billboard Sprite Label */}
                {showLabels && (
                  <sprite
                    position={[0, 1.45, 0]}
                    scale={[2.6, 0.72, 1]}
                    onClick={e => {
                      e.stopPropagation();
                      playGateClickSound(700);
                      if (onSelectStage) onSelectStage(stage.id);
                    }}
                    onPointerOver={e => {
                      e.stopPropagation();
                      setHoveredStageId(stage.id);
                      document.body.style.cursor = 'pointer';
                    }}
                    onPointerOut={() => {
                      setHoveredStageId(null);
                      document.body.style.cursor = 'auto';
                    }}
                  >
                    <spriteMaterial
                      map={presentLabels[idx]}
                      transparent
                      opacity={isSelected || isHovered ? 1.0 : 0.88}
                      depthTest={false}
                    />
                  </sprite>
                )}
              </group>
            );
          })}
        </group>
      )}

      {/* ================================================================= */}
      {/* 2. FUTURE PIPELINE: CRYO-CMOS, STRIPLINE RIBBON & PHOTONIC BUS   */}
      {/* ================================================================= */}
      {shouldRenderFuture && (
        <group>
          {/* Violet/Cyan High-Density Ribbon Tube */}
          <mesh geometry={tubeFuture}>
            <meshBasicMaterial
              color="#a855f7"
              wireframe
              transparent
              opacity={engineMode === 'dual' ? 0.25 : 0.32}
            />
          </mesh>

          {/* Internal Laser Filament Core */}
          <mesh geometry={tubeFuture}>
            <meshBasicMaterial
              color="#ec4899"
              transparent
              opacity={engineMode === 'dual' ? 0.1 : 0.16}
            />
          </mesh>

          {/* High-Speed Future Wavepackets */}
          {pulseObjects.map((p, idx) => (
            <mesh
              key={`future_pulse_${idx}`}
              ref={el => {
                if (el) pulsesFutureRef.current[idx] = el;
              }}
            >
              <sphereGeometry args={[p.size * 1.1, 14, 14]} />
              <meshBasicMaterial color={p.futureColor} />
            </mesh>
          ))}

          {/* Future 6 Station Nodes */}
          {STAGES_FUTURE_3D.map((stage, idx) => {
            const isSelected = activeStageId === stage.id;
            const isHovered = hoveredStageId === stage.id;
            const pos = stageVectorsFuture[idx];

            if (perspective === 'software' && stage.category !== 'software' && stage.category !== 'qec') {
              return null;
            }
            if (perspective === 'hardware' && stage.category === 'software') {
              return null;
            }

            return (
              <group key={stage.id} position={pos}>
                {/* Node Core Crystal (Dodecahedron for Future High-Density Micro-Integration) */}
                <mesh
                  onClick={e => {
                    e.stopPropagation();
                    playGateClickSound(750);
                    if (onSelectStage) onSelectStage(stage.id);
                  }}
                  onPointerOver={e => {
                    e.stopPropagation();
                    setHoveredStageId(stage.id);
                    document.body.style.cursor = 'pointer';
                  }}
                  onPointerOut={() => {
                    setHoveredStageId(null);
                    document.body.style.cursor = 'auto';
                  }}
                >
                  <dodecahedronGeometry args={[isSelected || isHovered ? 0.82 : 0.6, 0]} />
                  <meshStandardMaterial
                    color={stage.color}
                    emissive={stage.color}
                    emissiveIntensity={isSelected || isHovered ? 1.0 : 0.55}
                    wireframe={!isSelected && !isHovered}
                    roughness={0.15}
                    metalness={0.9}
                  />
                </mesh>

                {/* Outer Quantum Torus Orbit */}
                <mesh rotation={[0, Math.PI / 4, 0]}>
                  <torusGeometry args={[0.95, 0.04, 16, 48]} />
                  <meshStandardMaterial
                    color={stage.accent}
                    emissive={stage.accent}
                    emissiveIntensity={0.6}
                    roughness={0.1}
                    metalness={0.9}
                  />
                </mesh>

                {/* Vertical Optical Filament */}
                <line>
                  <bufferGeometry
                    attach="geometry"
                    onUpdate={self => {
                      self.setFromPoints([
                        new THREE.Vector3(0, -1.8, 0),
                        new THREE.Vector3(0, 1.8, 0)
                      ]);
                    }}
                  />
                  <lineBasicMaterial
                    color={stage.accent}
                    transparent
                    opacity={isSelected || isHovered ? 0.9 : 0.35}
                  />
                </line>

                {/* 3D Billboard Sprite Label */}
                {showLabels && (
                  <sprite
                    position={[0, 1.5, 0]}
                    scale={[2.6, 0.72, 1]}
                    onClick={e => {
                      e.stopPropagation();
                      playGateClickSound(750);
                      if (onSelectStage) onSelectStage(stage.id);
                    }}
                    onPointerOver={e => {
                      e.stopPropagation();
                      setHoveredStageId(stage.id);
                      document.body.style.cursor = 'pointer';
                    }}
                    onPointerOut={() => {
                      setHoveredStageId(null);
                      document.body.style.cursor = 'auto';
                    }}
                  >
                    <spriteMaterial
                      map={futureLabels[idx]}
                      transparent
                      opacity={isSelected || isHovered ? 1.0 : 0.88}
                      depthTest={false}
                    />
                  </sprite>
                )}
              </group>
            );
          })}
        </group>
      )}
    </group>
  );
};

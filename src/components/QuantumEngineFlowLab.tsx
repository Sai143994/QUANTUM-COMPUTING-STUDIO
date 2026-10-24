import React, { useState, useEffect, useMemo } from 'react';
import { 
  Cpu, 
  Zap, 
  Layers, 
  Activity, 
  Radio, 
  ShieldCheck, 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Thermometer, 
  Gauge, 
  RefreshCw, 
  Atom, 
  Flame, 
  Binary, 
  Compass, 
  Sliders,
  ChevronRight,
  Eye,
  Info
} from 'lucide-react';
import { playGateClickSound, playMeasurementCollapseSound } from '../utils/audio';
import { InteractiveCryoChandelierEngine, ChandelierFocalStage } from './InteractiveCryoChandelierEngine';
import { QuantumStatevectorCloud3D } from './QuantumStatevectorCloud3D';
import { ChandelierViewMode } from './ChandelierHero3D';
import { 
  STAGES_PRESENT_3D, 
  STAGES_FUTURE_3D, 
  EngineTechGeneration,
  EnginePerspective 
} from './QuantumEngineFlow3D';

// Quantum Algorithms Available for Live Flow Simulation
interface FlowAlgorithm {
  id: string;
  name: string;
  subtitle: string;
  qubits: number;
  circuitGates: string[];
  expectedState: string;
  stateAmplitudes: { state: string; prob: number; phase: number }[];
  description: string;
}

const FLOW_ALGORITHMS: FlowAlgorithm[] = [
  {
    id: 'bell',
    name: 'Bell State |Φ⁺⟩',
    subtitle: 'Maximal 2-Qubit Entanglement',
    qubits: 2,
    circuitGates: ['H(0)', 'CX(0, 1)'],
    expectedState: '(|00⟩ + |11⟩) / √2',
    stateAmplitudes: [
      { state: '|00⟩', prob: 0.5, phase: 0 },
      { state: '|01⟩', prob: 0.0, phase: 0 },
      { state: '|10⟩', prob: 0.0, phase: 0 },
      { state: '|11⟩', prob: 0.5, phase: 0 }
    ],
    description: 'Generates Einstein-Podolsky-Rosen (EPR) maximal entanglement via Hadamard superposition followed by Cross-Resonance CNOT entangling drive.'
  },
  {
    id: 'ghz',
    name: '3-Qubit GHZ State',
    subtitle: 'Tripartite Superposition',
    qubits: 3,
    circuitGates: ['H(0)', 'CX(0, 1)', 'CX(1, 2)'],
    expectedState: '(|000⟩ + |111⟩) / √2',
    stateAmplitudes: [
      { state: '|000⟩', prob: 0.5, phase: 0 },
      { state: '|001⟩', prob: 0.0, phase: 0 },
      { state: '|010⟩', prob: 0.0, phase: 0 },
      { state: '|011⟩', prob: 0.0, phase: 0 },
      { state: '|100⟩', prob: 0.0, phase: 0 },
      { state: '|101⟩', prob: 0.0, phase: 0 },
      { state: '|110⟩', prob: 0.0, phase: 0 },
      { state: '|111⟩', prob: 0.5, phase: 0 }
    ],
    description: 'Greenberger-Horne-Zeilinger state providing quantum non-locality benchmark across multiple superconducting transmons.'
  },
  {
    id: 'grover',
    name: 'Grover Search (|11⟩ Target)',
    subtitle: 'Quadratic Database Acceleration',
    qubits: 2,
    circuitGates: ['H(0)', 'H(1)', 'CZ(0, 1)', 'H(0)', 'H(1)', 'X(0)', 'X(1)', 'CZ(0, 1)', 'X(0)', 'X(1)', 'H(0)', 'H(1)'],
    expectedState: '|11⟩ with 100% Probability',
    stateAmplitudes: [
      { state: '|00⟩', prob: 0.0, phase: 0 },
      { state: '|01⟩', prob: 0.0, phase: 0 },
      { state: '|10⟩', prob: 0.0, phase: 0 },
      { state: '|11⟩', prob: 1.0, phase: 0 }
    ],
    description: 'Executes oracle phase inversion followed by diffusion transform (inversion about mean) to amplify target marked state |11⟩.'
  },
  {
    id: 'teleport',
    name: 'Quantum Teleportation',
    subtitle: 'EPR Channel & Bell Measurement',
    qubits: 3,
    circuitGates: ['H(1)', 'CX(1, 2)', 'CX(0, 1)', 'H(0)', 'Meas(0, 1)', 'CondX(2)', 'CondZ(2)'],
    expectedState: 'State |ψ⟩ reconstructed on Qubit 2',
    stateAmplitudes: [
      { state: '|000⟩', prob: 0.35, phase: 0 },
      { state: '|001⟩', prob: 0.15, phase: 0 },
      { state: '|110⟩', prob: 0.35, phase: 0 },
      { state: '|111⟩', prob: 0.15, phase: 0 }
    ],
    description: 'Transfers arbitrary quantum state |ψ⟩ using pre-shared Bell pair, 2 classical bits of feedforward, and dynamic Pauli corrections.'
  },
  {
    id: 'vqe',
    name: 'VQE Molecular H₂ Ground State',
    subtitle: 'Hybrid Variational Quantum-Classical',
    qubits: 2,
    circuitGates: ['X(0)', 'Ry(θ, 0)', 'CX(0, 1)', 'Measure(ZZ, XX)'],
    expectedState: 'Hartree-Fock ground state E = -1.137 Hartree',
    stateAmplitudes: [
      { state: '|01⟩', prob: 0.94, phase: 0 },
      { state: '|10⟩', prob: 0.06, phase: 3.14 }
    ],
    description: 'Calculates the ground state dissociation energy curve of molecular hydrogen via Jordan-Wigner mapped 2-qubit Hamiltonian.'
  }
];

export const QuantumEngineFlowLab: React.FC = () => {
  // Engine Viewport Sub-Section Mode: Default is the authentic 3D Chandelier Engine (Dashboard Twin)
  const [activeEngineTab, setActiveEngineTab] = useState<'cryo_chandelier' | 'orbital_pipeline' | 'schematic' | 'comparison' | 'oscilloscope'>('cryo_chandelier');
  
  // 3D Chandelier Controls
  const [chandelierShader, setChandelierShader] = useState<ChandelierViewMode>('gold');
  const [focalStage, setFocalStage] = useState<ChandelierFocalStage>('overview');
  const [autoRotateChandelier, setAutoRotateChandelier] = useState<boolean>(true);
  const [showStageBadges, setShowStageBadges] = useState<boolean>(true);
  const [selectedThermalKey, setSelectedThermalKey] = useState<string>('stage_mixing');

  // Cryostat Thermal Cascade Data (6 stages, 300K → 15mK)
  const CRYO_THERMAL_STAGES = [
    { key: 'stage_300k', name: 'Room Temperature Flange', role: 'Vacuum Boundary · Thermal API Interface', temp: '295 K', tempVal: 295, color: '#ef4444', sensorCh: 'CH-1 (Pt-100)', badgeColor: 'bg-rose-950 text-rose-300 border-rose-800', focal: 'stage_300k' as const,
      desc: 'Ambient temperature feedthrough flange. Houses vacuum bulkhead KF40 connectors and IVC pumping port.', hardware: 'Oxford DR-200 RT-Flange, SMA Bulkhead × 24', thermal: '∞ (Heat Source)', qec: 'Room-temp FPGA control rack' },
    { key: 'stage_50k', name: 'Thermal Radiation Shield', role: '1st Pulse Tube Stage · Blackbody Intercept', temp: '50 K', tempVal: 50, color: '#f97316', sensorCh: 'CH-2 (Cernox)', badgeColor: 'bg-orange-950 text-orange-300 border-orange-800', focal: 'stage_300k' as const,
      desc: '50K radiation shield intercepts >95% blackbody photon flux. Reduces thermal load on 4K plate.', hardware: 'Cryomech PT420 Pulse Tube (1st stage)', thermal: '40W cooling at 45K', qec: 'No QEC (Classical)' },
    { key: 'stage_4k', name: 'Liquid Helium / Pulse Tube', role: '2nd Pulse Tube Stage · Superconducting Transition (Tc)', temp: '4.2 K', tempVal: 4.2, color: '#a855f7', sensorCh: 'CH-3 (Cernox)', badgeColor: 'bg-purple-950 text-purple-300 border-purple-800', focal: 'stage_4k' as const,
      desc: 'Superconducting transition point. NbTi coax becomes zero-resistance. HEMT amplifier mounted here.', hardware: 'PT420 (2nd stage) + HEMT LNA (4-8 GHz)', thermal: '1.5W cooling at 4.2K', qec: 'HEMT readout preamplifier' },
    { key: 'stage_still', name: 'Still / Distillation Chamber', role: 'Distillation Boiler · ³He Separation & Pumping', temp: '800 mK', tempVal: 0.8, color: '#f59e0b', sensorCh: 'CH-4 (RuO₂)', badgeColor: 'bg-amber-950 text-amber-300 border-amber-800', focal: 'stage_still' as const,
      desc: '³He/⁴He mixture distillation. Osmotic pressure drives ³He from mixing chamber through still.', hardware: 'Still heater 5mW, RuO₂ thermometer', thermal: '20 μW cooling power', qec: 'Microwave attenuators (-10dB)' },
    { key: 'stage_cold', name: 'Cold Plate Stage', role: 'Continuous Capillary Exchanger · Pre-Cooling Boundary', temp: '100 mK', tempVal: 0.1, color: '#ec4899', sensorCh: 'CH-5 (RuO₂)', badgeColor: 'bg-pink-950 text-pink-300 border-pink-800', focal: 'stage_mixing' as const,
      desc: 'Continuous heat exchanger. Pre-cools incoming ³He before mixing. Circulators and isolators mounted here.', hardware: 'Nb sintered-powder heat exchanger, circulators', thermal: '400 μW at 100mK', qec: 'Quantum-limited circulators' },
    { key: 'stage_mixing', name: 'Mixing Chamber (Coldest Spot)', role: 'Thermodynamic Core · Superconducting Transmon QPU', temp: '15 mK', tempVal: 0.015, color: '#00e5ff', sensorCh: 'CH-6 (RuO₂)', badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-700', focal: 'stage_mixing' as const,
      desc: 'Coldest achievable point. Transmon qubits cooled to ground state. QPU chip mounted directly on mixing chamber flange.', hardware: 'IBM-style Transmon QPU, Josephson junctions', thermal: '20 μW at 15mK (max)', qec: 'Surface Code / QEC syndrome extraction' },
  ];
  const selectedThermal = CRYO_THERMAL_STAGES.find(s => s.key === selectedThermalKey) || CRYO_THERMAL_STAGES[5];

  // Generation & Pipeline Controls
  const [engineMode, setEngineMode] = useState<EngineTechGeneration>('present');
  const [perspective, setPerspective] = useState<EnginePerspective>('all');
  const [activeStageId, setActiveStageId] = useState<string>('present_transmon_qpu');

  // Simulation Controls
  const [selectedAlgoId, setSelectedAlgoId] = useState<string>('bell');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionStep, setExecutionStep] = useState<number>(3); // 0 to 4/5
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1800); // ms per stage

  // Physical Parameters
  const [cryoTempBase, setCryoTempBase] = useState<number>(14.8); // mK
  const [microwaveDriveGhz, setMicrowaveDriveGhz] = useState<number>(5.18); // GHz

  // Active Algorithm
  const currentAlgo = useMemo(() => {
    return FLOW_ALGORITHMS.find(a => a.id === selectedAlgoId) || FLOW_ALGORITHMS[0];
  }, [selectedAlgoId]);

  // Active Stages list based on mode
  const activeStagesList = useMemo(() => {
    if (engineMode === 'future') return STAGES_FUTURE_3D;
    return STAGES_PRESENT_3D;
  }, [engineMode]);

  // Current Active Stage Def
  const currentStage = useMemo(() => {
    const fromActive = activeStagesList.find(s => s.id === activeStageId);
    if (fromActive) return fromActive;
    return activeStagesList[0];
  }, [activeStagesList, activeStageId]);

  // Coherence Calculation from Cryo Temperature
  const computedCoherence = useMemo(() => {
    const t1 = Math.max(12, +(142 * Math.exp(-(cryoTempBase - 14.8) / 35)).toFixed(1));
    const t2 = Math.max(8, +(t1 * 0.76).toFixed(1));
    const thermalPhotons = +(0.001 * Math.exp((cryoTempBase - 14.8) / 12)).toFixed(4);
    const fidelity = Math.max(92.0, +(99.85 - (cryoTempBase - 14.8) * 0.08).toFixed(2));
    return { t1, t2, thermalPhotons, fidelity };
  }, [cryoTempBase]);

  // Automated Step Progression when Running
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setExecutionStep(prev => {
        const next = (prev + 1) % activeStagesList.length;
        setActiveStageId(activeStagesList[next].id);
        
        // Auto sync camera focal stage to active execution station
        if (next === 0) setFocalStage('stage_300k');
        else if (next === 1 || next === 2) setFocalStage('stage_4k');
        else if (next === 3) setFocalStage('stage_still');
        else if (next === 4 || next === 5) setFocalStage('stage_mixing');

        playGateClickSound(600 + next * 80);
        return next;
      });
    }, simulationSpeed);

    return () => clearInterval(interval);
  }, [isRunning, activeStagesList, simulationSpeed]);

  const handleSelectStage = (id: string) => {
    playGateClickSound(700);
    setActiveStageId(id);
    const idx = activeStagesList.findIndex(s => s.id === id);
    if (idx !== -1) {
      setExecutionStep(idx);
      if (idx === 0) setFocalStage('stage_300k');
      else if (idx === 1 || idx === 2) setFocalStage('stage_4k');
      else if (idx === 3) setFocalStage('stage_still');
      else if (idx >= 4) setFocalStage('stage_mixing');
    }
  };

  const handleStepForward = () => {
    playGateClickSound(750);
    const next = (executionStep + 1) % activeStagesList.length;
    setExecutionStep(next);
    setActiveStageId(activeStagesList[next].id);
    if (next === 0) setFocalStage('stage_300k');
    else if (next === 1 || next === 2) setFocalStage('stage_4k');
    else if (next === 3) setFocalStage('stage_still');
    else if (next >= 4) setFocalStage('stage_mixing');
  };

  const handleResetSimulation = () => {
    playMeasurementCollapseSound();
    setIsRunning(false);
    setExecutionStep(0);
    setActiveStageId(activeStagesList[0].id);
    setFocalStage('overview');
  };

  return (
    <div className="w-full space-y-4 font-mono text-slate-100">
      
      {/* ===================================================================== */}
      {/* 1. TOP MASTER HEADER & TELEMETRY STRIP                                */}
      {/* ===================================================================== */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#030914] via-[#051121] to-[#030914] border border-cyan-500/35 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          
          {/* Left Title & Status */}
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/20 shrink-0">
              <Zap className="w-5 h-5 animate-pulse text-cyan-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-extrabold text-white tracking-wide uppercase">
                  Quantum Engine Flow &amp; Cryogenic Architecture
                </h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-amber-950 text-amber-300 border border-amber-500/50 flex items-center gap-1 shadow-xs">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Dashboard 3D Chandelier Twin</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                  Sub-Kelvin 14.8 mK
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl">
                Real-world quantum engine flow modeled after the dashboard 3D Cryogenic Dilution Refrigerator. Traces microwave DRAG pulses, coaxial attenuation stages, Josephson junction Hamiltonian evolution, and active QEC syndrome decoding.
              </p>
            </div>
          </div>

          {/* Right Architecture Generation Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="p-1 rounded-xl bg-[#091422] border border-cyan-500/40 flex items-center gap-1 shadow-md">
              <button
                onClick={() => {
                  playGateClickSound(650);
                  setEngineMode('present');
                  setActiveStageId(STAGES_PRESENT_3D[0].id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  engineMode === 'present'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-sm shadow-amber-500/30'
                    : 'text-amber-300/80 hover:text-amber-200 hover:bg-amber-950/30'
                }`}
                title="Present Ongoing Technology: Discrete Semi-Rigid Coax, Microwave Racks & Dispersive TWPA Readout"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Present Gen (2026)</span>
              </button>

              <button
                onClick={() => {
                  playGateClickSound(650);
                  setEngineMode('future');
                  setActiveStageId(STAGES_FUTURE_3D[0].id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  engineMode === 'future'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-sm shadow-purple-500/30'
                    : 'text-purple-300/80 hover:text-purple-200 hover:bg-purple-950/30'
                }`}
                title="Future Scalable Tech: 4K Cryo-CMOS ASICs, High-Density Stripline Flex, & 65ns In-Situ QEC Decoders"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Future Gen (2030+)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sub-bar: Live Telemetry */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span className="text-cyan-400 font-bold flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5" />
              <span>Mixing Chamber: {cryoTempBase} mK</span>
            </span>
            <span>·</span>
            <span>³He/⁴He Circulation: <strong className="text-slate-200">251.3 μmol/s</strong></span>
            <span>·</span>
            <span>Vacuum: <strong className="text-slate-200">1.21×10⁻⁷ mbar</strong></span>
          </div>

          <div className="flex items-center gap-4">
            <span>T₁ Coherence: <strong className="text-emerald-400">{computedCoherence.t1} μs</strong></span>
            <span>T₂* Dephasing: <strong className="text-cyan-400">{computedCoherence.t2} μs</strong></span>
            <span>Gate Fidelity ℱ: <strong className="text-amber-400">{computedCoherence.fidelity}%</strong></span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. SUB-SECTIONS NAVIGATION BAR (Dashboard 3D, Orbital, Schematic, etc.)*/}
      {/* ===================================================================== */}
      <div className="p-2 rounded-xl bg-[#060d19] border border-cyan-500/25 flex flex-wrap items-center justify-between gap-2">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'cryo_chandelier' as const, label: '3D Cryo Chandelier Engine', tag: 'Dashboard Twin', icon: Sparkles },
            { id: 'orbital_pipeline' as const, label: '3D Spatial Orbital Pipeline', tag: 'Present vs Future', icon: Layers },
            { id: 'schematic' as const, label: '2D Microarchitecture Schematic', tag: 'Signal Bus', icon: Activity },
            { id: 'comparison' as const, label: 'Present vs Future Tech Matrix', tag: 'Scaling Benchmark', icon: Gauge },
            { id: 'oscilloscope' as const, label: 'RF Pulse Waveform Oscilloscope', tag: 'DRAG & IQ', icon: Sliders }
          ].map(tab => {
            const Icon = tab.icon;
            const isCur = activeEngineTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playGateClickSound(600);
                  setActiveEngineTab(tab.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isCur
                    ? 'bg-[#00e5ff] text-[#02060a] shadow-md shadow-[#00e5ff]/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-normal ${
                  isCur ? 'bg-slate-950/20 text-slate-950 font-extrabold' : 'bg-slate-900 text-slate-400'
                }`}>
                  {tab.tag}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Status */}
        <span className="text-[10px] text-slate-400 px-2 hidden lg:inline font-mono">
          Mode: <strong className="text-cyan-300 uppercase">{activeEngineTab.replace('_', ' ')}</strong>
        </span>
      </div>

      {/* ===================================================================== */}
      {/* 3. ALGORITHM EXECUTION RUNNER & STAGE BARS                             */}
      {/* ===================================================================== */}
      <div className="p-3 rounded-xl bg-[#030813] border border-cyan-500/20 flex flex-wrap items-center justify-between gap-3">
        
        {/* Algorithm Preset Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
            <Atom className="w-4 h-4 text-cyan-400" />
            <span>Algorithm:</span>
          </span>
          <select
            value={selectedAlgoId}
            onChange={(e) => {
              playGateClickSound(650);
              setSelectedAlgoId(e.target.value);
            }}
            className="px-3 py-1.5 rounded-lg bg-[#081525] border border-cyan-500/40 text-cyan-300 text-xs font-bold outline-none cursor-pointer hover:border-cyan-400"
          >
            {FLOW_ALGORITHMS.map(algo => (
              <option key={algo.id} value={algo.id} className="bg-[#030914] text-slate-200">
                {algo.name} ({algo.qubits}Q) — {algo.subtitle}
              </option>
            ))}
          </select>
        </div>

        {/* Play / Step / Reset Simulation Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playGateClickSound(700);
              setIsRunning(!isRunning);
            }}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all ${
              isRunning
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isRunning ? 'Pause Engine' : 'Run Algorithm Flow'}</span>
          </button>

          <button
            onClick={handleStepForward}
            disabled={isRunning}
            className="px-3 py-1.5 rounded-lg bg-[#081525] border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-40"
            title="Advance signal down the next cryo stage"
          >
            <SkipForward className="w-3.5 h-3.5 text-cyan-400" />
            <span>Next Stage</span>
          </button>

          <button
            onClick={handleResetSimulation}
            className="px-2.5 py-1.5 rounded-lg bg-[#081525] border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white text-xs cursor-pointer"
            title="Reset to Stage 1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-1 text-[10px] text-slate-500 ml-2">
            <span>Speed:</span>
            {[
              { label: '1x', ms: 2200 },
              { label: '2x', ms: 1200 },
              { label: '3x', ms: 600 }
            ].map(spd => (
              <button
                key={spd.label}
                onClick={() => setSimulationSpeed(spd.ms)}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  simulationSpeed === spd.ms
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {spd.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active Stage Indicator */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Signal Position:</span>
          <span className="px-2.5 py-1 rounded-md bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold">
            Step {currentStage.step}: {currentStage.name}
          </span>
          <span className="px-2 py-1 rounded-md bg-purple-950/80 border border-purple-500/40 text-purple-300 font-bold">
            {currentStage.latency}
          </span>
        </div>
      </div>

      {/* 6 Stage Navigation Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {activeStagesList.map((st, idx) => {
          const isCurrent = st.id === activeStageId;
          const isPassed = idx < executionStep;
          
          return (
            <button
              key={st.id}
              onClick={() => handleSelectStage(st.id)}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden group ${
                isCurrent
                  ? 'bg-gradient-to-b from-[#091c30] to-[#040e1b] border-cyan-400 shadow-xl shadow-cyan-500/20 ring-1 ring-cyan-400/50'
                  : 'bg-[#040913]/90 border-slate-800 hover:border-slate-700 hover:bg-[#071322]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                  isCurrent 
                    ? 'bg-cyan-500 text-slate-950' 
                    : isPassed 
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                    : 'bg-slate-900 text-slate-400'
                }`}>
                  STEP {st.step}
                </span>
                <span className="text-[10px] font-bold" style={{ color: st.accent }}>
                  {st.latency}
                </span>
              </div>

              <div className="font-extrabold text-xs text-white truncate group-hover:text-cyan-300 transition-colors">
                {st.name}
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                {st.sub}
              </div>
              <div className="text-[9px] text-slate-500 mt-2 truncate font-mono">
                {st.temperature}
              </div>

              {isCurrent && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-sky-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* ===================================================================== */}
      {/* 4. MAIN VIEWPORT & STATION TELEMETRY (8 cols Viewport + 4 cols Telemetry)*/}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Left Column: Active Engine Viewport (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          
          {/* Main Viewport Container */}
          <div className={`${activeEngineTab === 'cryo_chandelier' ? 'h-[680px]' : 'h-[580px]'} rounded-2xl bg-[#01040a] border border-cyan-500/30 relative overflow-hidden shadow-2xl flex flex-col`}>
            
            {/* ================================================================ */}
            {/* SUB-SECTION 1: IMMERSIVE 3D CRYO CHANDELIER (Dashboard-grade)    */}
            {/* ================================================================ */}
            {activeEngineTab === 'cryo_chandelier' && (
              <div className="w-full h-full relative flex flex-col">

                {/* ── TOP OVERLAY: Shader Mode + Camera Presets ── */}
                <div className="absolute top-0 left-0 right-0 z-20 flex flex-wrap items-start justify-between gap-2 p-2.5 pointer-events-none">

                  {/* Left: Visual Shader Mode */}
                  <div className="flex items-center gap-1 bg-[#010814]/90 backdrop-blur-md p-1 rounded-xl border border-cyan-500/40 shadow-xl pointer-events-auto">
                    {[
                      { id: 'gold' as const, label: 'PBR Gold', icon: Sparkles, activeClass: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950', iconColor: 'text-amber-400' },
                      { id: 'thermal' as const, label: 'Thermal FLIR', icon: Flame, activeClass: 'bg-gradient-to-r from-rose-500 to-orange-500 text-white', iconColor: 'text-rose-400' },
                      { id: 'xray' as const, label: 'Quantum RF', icon: Radio, activeClass: 'bg-gradient-to-r from-cyan-500 to-sky-400 text-slate-950', iconColor: 'text-cyan-400' }
                    ].map(sh => {
                      const Icon = sh.icon;
                      const isSel = chandelierShader === sh.id;
                      return (
                        <button key={sh.id} onClick={() => { playGateClickSound(650); setChandelierShader(sh.id); }}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                            isSel ? sh.activeClass + ' shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                          }`}>
                          <Icon className={`w-3.5 h-3.5 ${isSel ? '' : sh.iconColor}`} />
                          <span className="hidden sm:inline">{sh.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Right: Auto-Rotate + Stage Badges Toggle */}
                  <div className="flex items-center gap-1.5 bg-[#010814]/90 backdrop-blur-md p-1 rounded-xl border border-cyan-500/40 shadow-xl pointer-events-auto">
                    <button
                      onClick={() => setAutoRotateChandelier(!autoRotateChandelier)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-all ${
                        autoRotateChandelier ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700' : 'text-slate-500 hover:text-white'
                      }`}
                      title={autoRotateChandelier ? 'Pause 3D Rotation' : 'Resume 3D Rotation'}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${autoRotateChandelier ? 'animate-spin text-cyan-400' : ''}`} style={{ animationDuration: '8s' }} />
                      <span className="hidden sm:inline">{autoRotateChandelier ? 'Live Spin' : 'Paused'}</span>
                    </button>
                    <button
                      onClick={() => setShowStageBadges(!showStageBadges)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-all ${
                        showStageBadges ? 'bg-purple-950/80 text-purple-300 border border-purple-700' : 'text-slate-500 hover:text-white'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{showStageBadges ? 'Pins On' : 'Pins Off'}</span>
                    </button>
                  </div>
                </div>

                {/* ── MAIN 3D CANVAS (fills height) ── */}
                <div className="flex-1 min-h-0 relative">
                  <InteractiveCryoChandelierEngine
                    viewMode={chandelierShader}
                    autoRotate={autoRotateChandelier}
                    focalStage={focalStage}
                    activeStep={executionStep}
                    onSelectStage={handleSelectStage}
                    showStageBadges={showStageBadges}
                  />
                </div>

                {/* ── BOTTOM OVERLAY: Camera Focal Presets + Orbit Hint ── */}
                <div className="absolute bottom-0 left-0 right-0 z-20 flex items-end justify-between p-3 bg-gradient-to-t from-[#010814]/80 to-transparent pointer-events-none">

                  {/* Camera Focus Presets */}
                  <div className="flex items-center gap-1 bg-[#010814]/85 backdrop-blur-md p-1 rounded-xl border border-cyan-500/30 shadow-lg pointer-events-auto">
                    <span className="text-[10px] text-slate-500 px-1 font-bold uppercase">Camera:</span>
                    {[
                      { id: 'overview' as const, label: 'All 3D' },
                      { id: 'stage_300k' as const, label: '300K' },
                      { id: 'stage_4k' as const, label: '4K Stage' },
                      { id: 'stage_still' as const, label: '800mK' },
                      { id: 'stage_mixing' as const, label: '15mK QPU' },
                    ].map(foc => (
                      <button key={foc.id}
                        onClick={() => { playGateClickSound(700); setFocalStage(foc.id); if (foc.id !== 'overview') setSelectedThermalKey(foc.id === 'stage_300k' ? 'stage_300k' : foc.id === 'stage_4k' ? 'stage_4k' : foc.id === 'stage_still' ? 'stage_still' : 'stage_mixing'); }}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                          focalStage === foc.id ? 'bg-[#00e5ff] text-slate-950 shadow-sm shadow-[#00e5ff]/30' : 'text-slate-400 hover:text-white'
                        }`}>
                        {foc.label}
                      </button>
                    ))}
                  </div>

                  {/* Orbit Hint */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#010814]/85 backdrop-blur-md border border-cyan-500/25 text-[10px] text-slate-500 pointer-events-none">
                    <Compass className="w-3 h-3 text-cyan-500" />
                    <span>Drag to Orbit · Scroll to Zoom · Right-click to Pan</span>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-SECTION 2: 3D SPATIAL ORBITAL PIPELINE (PRESENT VS FUTURE) */}
            {activeEngineTab === 'orbital_pipeline' && (
              <div className="w-full h-full relative">
                <QuantumStatevectorCloud3D
                  activeStageId={activeStageId}
                  onSelectStage={handleSelectStage}
                  engineMode={engineMode}
                  showLabels={true}
                  perspective={perspective}
                />
                <div className="absolute bottom-3 right-3 z-10 px-2.5 py-1 rounded-lg bg-[#030914]/85 backdrop-blur-md border border-cyan-500/25 text-[10px] text-slate-400 flex items-center gap-1 pointer-events-none">
                  <Compass className="w-3 h-3 text-cyan-400" />
                  <span>Concentric Catmull-Rom Pipeline: Click Nodes or Rotate 360°</span>
                </div>
              </div>
            )}

            {/* SUB-SECTION 3: 2D MICROARCHITECTURE SCHEMATIC */}
            {activeEngineTab === 'schematic' && (
              <div className="w-full h-full p-6 overflow-y-auto space-y-6 bg-gradient-to-b from-[#02060f] to-[#040a17]">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-white">Quantum RF Signal Bus &amp; Cryo Attenuation Tree</h3>
                    <p className="text-xs text-slate-400">Complete microwave drive lines, -60dB attenuation network, and TWPA readout</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                    6-Stage Cryogenic Bus
                  </span>
                </div>

                <div className="w-full bg-[#030814] p-4 rounded-xl border border-slate-800">
                  <svg viewBox="0 0 760 220" className="w-full h-auto font-mono text-[9px]">
                    <rect x="20" y="20" width="105" height="180" rx="8" fill="#1e293b" fillOpacity="0.4" stroke="#475569" strokeWidth="1" />
                    <text x="72" y="38" fill="#94a3b8" textAnchor="middle" fontWeight="bold">300 K Flange</text>
                    <text x="72" y="52" fill="#64748b" textAnchor="middle">Room Ambient</text>

                    <rect x="145" y="20" width="105" height="180" rx="8" fill="#1e293b" fillOpacity="0.3" stroke="#0284c7" strokeWidth="1" />
                    <text x="197" y="38" fill="#38bdf8" textAnchor="middle" fontWeight="bold">50 K Plate</text>
                    <text x="197" y="52" fill="#0284c7" textAnchor="middle">Thermal Shield</text>

                    <rect x="270" y="20" width="105" height="180" rx="8" fill="#1e293b" fillOpacity="0.3" stroke="#a855f7" strokeWidth="1" />
                    <text x="322" y="38" fill="#c084fc" textAnchor="middle" fontWeight="bold">4.2 K Stage</text>
                    <text x="322" y="52" fill="#9333ea" textAnchor="middle">Pulse Tube Lift</text>

                    <rect x="395" y="20" width="105" height="180" rx="8" fill="#1e293b" fillOpacity="0.3" stroke="#f59e0b" strokeWidth="1" />
                    <text x="447" y="38" fill="#fbbf24" textAnchor="middle" fontWeight="bold">800 mK Still</text>
                    <text x="447" y="52" fill="#d97706" textAnchor="middle">³He Separation</text>

                    <rect x="520" y="20" width="105" height="180" rx="8" fill="#1e293b" fillOpacity="0.3" stroke="#ec4899" strokeWidth="1" />
                    <text x="572" y="38" fill="#f472b6" textAnchor="middle" fontWeight="bold">100 mK Plate</text>
                    <text x="572" y="52" fill="#db2777" textAnchor="middle">Cold Plate</text>

                    <rect x="645" y="20" width="95" height="180" rx="8" fill="#042f2e" fillOpacity="0.6" stroke="#14b8a6" strokeWidth="1.5" />
                    <text x="692" y="38" fill="#2dd4bf" textAnchor="middle" fontWeight="bold">15 mK Base</text>
                    <text x="692" y="52" fill="#0d9488" textAnchor="middle">Sub-Kelvin QPU</text>

                    {/* Drive Line */}
                    <path d="M 40 85 L 175 85 L 300 85 L 425 85 L 550 85 L 675 85" fill="none" stroke="#00e5ff" strokeWidth="2.5" />
                    <circle cx="72" cy="85" r="5" fill="#00e5ff" />
                    <text x="72" y="105" fill="#00e5ff" textAnchor="middle">AWG DAC</text>

                    <rect x="187" y="78" width="20" height="14" rx="2" fill="#f59e0b" />
                    <text x="197" y="89" fill="#000" textAnchor="middle" fontWeight="bold">-20dB</text>

                    <rect x="312" y="78" width="20" height="14" rx="2" fill="#f59e0b" />
                    <text x="322" y="89" fill="#000" textAnchor="middle" fontWeight="bold">-20dB</text>

                    <rect x="437" y="78" width="20" height="14" rx="2" fill="#f59e0b" />
                    <text x="447" y="89" fill="#000" textAnchor="middle" fontWeight="bold">-10dB</text>

                    <rect x="562" y="78" width="20" height="14" rx="2" fill="#f59e0b" />
                    <text x="572" y="89" fill="#000" textAnchor="middle" fontWeight="bold">-10dB</text>

                    <rect x="668" y="70" width="48" height="60" rx="4" fill="#0f766e" stroke="#2dd4bf" strokeWidth="1.5" />
                    <text x="692" y="95" fill="#fff" textAnchor="middle" fontWeight="bold">QPU CHIP</text>
                    <text x="692" y="108" fill="#5eead4" textAnchor="middle">Transmons</text>

                    {/* Readout Return */}
                    <path d="M 675 145 L 550 145 L 425 145 L 300 145 L 175 145 L 40 145" fill="none" stroke="#c084fc" strokeWidth="2.5" strokeDasharray="5,3" />
                    <rect x="548" y="138" width="30" height="14" rx="2" fill="#10b981" />
                    <text x="563" y="149" fill="#000" textAnchor="middle" fontWeight="bold">TWPA</text>
                    <text x="563" y="165" fill="#10b981" textAnchor="middle">+20dB</text>

                    <rect x="298" y="138" width="30" height="14" rx="2" fill="#a855f7" />
                    <text x="313" y="149" fill="#000" textAnchor="middle" fontWeight="bold">HEMT</text>
                    <text x="313" y="165" fill="#c084fc" textAnchor="middle">+38dB</text>

                    <circle cx="72" cy="145" r="5" fill="#c084fc" />
                    <text x="72" y="165" fill="#c084fc" textAnchor="middle">ADC / SDR</text>
                  </svg>
                </div>
              </div>
            )}

            {/* SUB-SECTION 4: PRESENT VS FUTURE COMPARISON */}
            {activeEngineTab === 'comparison' && (
              <div className="w-full h-full p-6 overflow-y-auto space-y-4 bg-[#030712]">
                <div className="border-b border-slate-800 pb-2">
                  <h3 className="font-bold text-sm text-white">Direct Engineering Metrics: Present vs Future</h3>
                  <p className="text-xs text-slate-400">Quantitative scaling thresholds comparing NISQ 2026 vs Fault-Tolerant FTQC 2030+</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-2.5 px-3">Subsystem Metric</th>
                        <th className="py-2.5 px-3 text-amber-400">Present Generation (2026)</th>
                        <th className="py-2.5 px-3 text-purple-400">Future Generation (2030+)</th>
                        <th className="py-2.5 px-3 text-cyan-400">Scaling Advantage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      <tr>
                        <td className="py-2.5 px-3 text-slate-300 font-bold">Interconnect Medium</td>
                        <td className="py-2.5 px-3 text-slate-400">Discrete UT-085 Stainless/NbTi Coax</td>
                        <td className="py-2.5 px-3 text-purple-300 font-bold">Polyimide Superconducting Stripline Flex</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold">94% Cable Mass Reduction</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 text-slate-300 font-bold">Microwave Pulse Drive</td>
                        <td className="py-2.5 px-3 text-slate-400">Room-Temp 65 GSa/s AWG Racks</td>
                        <td className="py-2.5 px-3 text-purple-300 font-bold">4.2K Monolithic Cryo-CMOS ASIC</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold">150x Power Footprint Reduction</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 text-slate-300 font-bold">4K Stage Heat Load</td>
                        <td className="py-2.5 px-3 text-slate-400">~1.2 W (Heavy passive conduction)</td>
                        <td className="py-2.5 px-3 text-purple-300 font-bold">&lt; 0.08 mW (Micro-stripline)</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold">15,000x Lower Thermal Dissipation</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 text-slate-300 font-bold">QEC Syndrome Latency</td>
                        <td className="py-2.5 px-3 text-slate-400">1.8 ms (Classical CPU cluster MWPM)</td>
                        <td className="py-2.5 px-3 text-purple-300 font-bold">65 ns (In-Situ Cryo-FPGA Union-Find)</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold">27,000x Real-Time Speedup</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 text-slate-300 font-bold">Maximum Qubit Capacity</td>
                        <td className="py-2.5 px-3 text-slate-400">~1,121 Physical Qubits (IBM Condor)</td>
                        <td className="py-2.5 px-3 text-purple-300 font-bold">1,000,000+ Logical Protected Qubits</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold">Full Fault-Tolerant Threshold</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUB-SECTION 5: RF OSCILLOSCOPE */}
            {activeEngineTab === 'oscilloscope' && (
              <div className="w-full h-full p-6 overflow-y-auto space-y-4 bg-[#02050c]">
                <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-sm text-white">Real-Time Microwave Oscilloscope</h3>
                    <p className="text-xs text-slate-400">DRAG Quadrature Envelopes Ω_I(t) & Ω_Q(t) to suppress transmon |2⟩ state leakage</p>
                  </div>
                  <div className="text-xs text-cyan-400 font-mono">
                    Drive Freq: <strong>{microwaveDriveGhz} GHz</strong> · DRAG Coeff β = -0.42
                  </div>
                </div>

                <div className="h-64 rounded-xl bg-[#040c17] border border-cyan-500/40 p-4 relative flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 border-b border-slate-800/80 pb-1">
                    <span className="flex items-center gap-1.5 text-cyan-300">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      <span>CH1: In-Phase I(t) Gaussian Envelope</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-purple-300">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      <span>CH2: Quadrature Q(t) DRAG Derivative dI/dt</span>
                    </span>
                    <span className="text-emerald-400">Trigger: 0.00 ns Auto</span>
                  </div>

                  <svg viewBox="0 0 600 160" className="w-full h-full">
                    {[20, 50, 80, 110, 140].map(y => (
                      <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="#0f2338" strokeWidth="1" strokeDasharray="4,4" />
                    ))}
                    {[60, 120, 180, 240, 300, 360, 420, 480, 540].map(x => (
                      <line key={x} x1={x} y1="0" x2={x} y2="160" stroke="#0f2338" strokeWidth="1" strokeDasharray="4,4" />
                    ))}
                    <path
                      d="M 50 130 C 150 130 200 30 300 30 C 400 30 450 130 550 130"
                      fill="none"
                      stroke="#00e5ff"
                      strokeWidth="2.5"
                    />
                    <path
                      d="M 50 80 C 180 80 220 35 270 50 C 300 80 330 110 370 120 C 420 125 480 80 550 80"
                      fill="none"
                      stroke="#c084fc"
                      strokeWidth="2"
                      strokeDasharray="5,2"
                    />
                  </svg>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80 pt-1">
                    <span>Pulse Width σ = 8.0 ns (Total τ = 32 ns)</span>
                    <span>Anharmonicity α = -330 MHz</span>
                    <span className="text-cyan-300">Phase Error &lt; 0.02°</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-3 rounded-lg bg-[#050e1b] border border-slate-800 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Cryogenic Base Temp:</span>
                      <span className="text-cyan-300 font-bold">{cryoTempBase} mK</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="80"
                      step="0.5"
                      value={cryoTempBase}
                      onChange={(e) => setCryoTempBase(parseFloat(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-[#050e1b] border border-slate-800 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Microwave Drive Frequency:</span>
                      <span className="text-purple-300 font-bold">{microwaveDriveGhz} GHz</span>
                    </div>
                    <input
                      type="range"
                      min="4.5"
                      max="6.5"
                      step="0.02"
                      value={microwaveDriveGhz}
                      onChange={(e) => setMicrowaveDriveGhz(parseFloat(e.target.value))}
                      className="w-full accent-purple-400 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Column: Thermal Cascade (cryo tab) or Algorithm Inspector (other tabs) */}
        <div className="lg:col-span-4 flex flex-col space-y-3">

          {/* ============================================================ */}
          {/* CRYOSTAT THERMAL CASCADE PANEL (visible when cryo tab active) */}
          {/* ============================================================ */}
          {activeEngineTab === 'cryo_chandelier' && (
            <>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[rgba(0,229,255,0.2)] pb-2">
                <h3 className="font-bold text-xs text-white uppercase flex items-center gap-1.5 font-mono">
                  <Thermometer className="w-4 h-4 text-cyan-400" />
                  <span>Cryostat Thermal Cascade</span>
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#09141d] border border-[rgba(0,229,255,0.25)] text-[#00e5ff] font-bold">6/6 ONLINE</span>
              </div>

              {/* Vertical Cascade Ladder */}
              <div className="p-3 rounded-xl bg-[#030810] border border-[rgba(0,229,255,0.18)] shadow-xl">
                <div className="relative pl-5 space-y-1.5">
                  {/* Vertical gradient line */}
                  <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gradient-to-b from-rose-500 via-amber-400 via-purple-500 to-cyan-400 rounded-full opacity-70" />

                  {CRYO_THERMAL_STAGES.map(stage => {
                    const isSel = selectedThermalKey === stage.key;
                    return (
                      <button key={stage.key}
                        onClick={() => { playGateClickSound(700); setSelectedThermalKey(stage.key); setFocalStage(stage.focal); }}
                        className={`w-full px-2.5 py-2 rounded-lg border text-left transition-all relative flex items-center justify-between gap-2 cursor-pointer ${
                          isSel ? 'bg-[#091422] border-[#00e5ff] shadow-md shadow-[#00e5ff]/15' : 'bg-[#03060f] border-[rgba(0,229,255,0.1)] hover:border-[rgba(0,229,255,0.35)] hover:bg-[#060e1c]'
                        }`}
                      >
                        {/* Node dot on vertical line */}
                        <span className={`absolute -left-[17px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-[#030810] transition-all ${
                          isSel ? 'scale-125 ring-2 ring-offset-1 ring-offset-[#030810]' : ''
                        }`} style={{ backgroundColor: stage.color, ['--tw-ring-color' as string]: stage.color }} />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-semibold text-white truncate">{stage.name}</span>
                            {isSel && <span className="text-[8px] px-1 rounded bg-[#00e5ff] text-[#02060a] font-bold shrink-0">ACTIVE</span>}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">{stage.role}</div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[9px] text-slate-600 hidden sm:inline">{stage.sensorCh}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono font-bold ${stage.badgeColor}`}>{stage.temp}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Stage Detail Inspector */}
              <div className="p-3.5 rounded-xl bg-gradient-to-b from-[#050e1c] to-[#030913] border border-[rgba(0,229,255,0.25)] shadow-xl space-y-3 flex-1">
                <div className="flex items-center justify-between pb-2 border-b border-[rgba(0,229,255,0.12)]">
                  <div>
                    <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedThermal.color }} />
                      {selectedThermal.name}
                    </h4>
                    <div className="text-[11px] font-bold mt-0.5" style={{ color: selectedThermal.color }}>{selectedThermal.temp}</div>
                  </div>
                  <button
                    onClick={() => { playGateClickSound(750); setFocalStage(selectedThermal.focal); }}
                    className="px-2 py-1 rounded bg-[#09141d] hover:bg-[#00e5ff]/20 text-[#00e5ff] border border-[rgba(0,229,255,0.3)] text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Focus 3D</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">{selectedThermal.desc}</p>

                <div className="grid grid-cols-1 gap-2">
                  <div className="p-2 rounded-lg bg-[#020610] border border-slate-800 space-y-1.5 text-[11px]">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Hardware:</span>
                      <span className="text-white font-semibold">{selectedThermal.hardware}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Thermal Lift:</span>
                      <span className="text-amber-400 font-bold">{selectedThermal.thermal}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">QEC / Signal:</span>
                      <span className="text-purple-300">{selectedThermal.qec}</span>
                    </div>
                  </div>
                </div>

                {/* Live Coherence Metrics (from cryo temp) */}
                <div className="pt-1 border-t border-slate-800/60 grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                  <div>
                    <div className="text-slate-500">T₁</div>
                    <div className="text-emerald-400 font-bold">{computedCoherence.t1} μs</div>
                  </div>
                  <div>
                    <div className="text-slate-500">T₂*</div>
                    <div className="text-cyan-400 font-bold">{computedCoherence.t2} μs</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Fidelity</div>
                    <div className="text-amber-400 font-bold">{computedCoherence.fidelity}%</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ============================================================ */}
          {/* MICROARCHITECTURE INSPECTOR (visible for all other tabs)      */}
          {/* ============================================================ */}
          {activeEngineTab !== 'cryo_chandelier' && (
            <>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-bold text-xs text-white uppercase flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Microarchitecture Inspector</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
              Step {currentStage.step} of {activeStagesList.length}
            </span>
          </div>

          {/* Detailed Station Inspector Card */}
          <div className="p-4 rounded-xl bg-gradient-to-b from-[#050e1c] to-[#030913] border border-cyan-500/30 space-y-4 shadow-xl">
            
            {/* Header with Category & Latency */}
            <div className="border-b border-slate-800/80 pb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase" style={{ backgroundColor: `${currentStage.color}25`, color: currentStage.accent }}>
                  {currentStage.category.toUpperCase()} · {currentStage.generation.toUpperCase()}
                </span>
                <span className="text-xs font-bold text-slate-400 font-mono">
                  {currentStage.latency}
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-white">
                {currentStage.name}
              </h4>
              <p className="text-xs text-cyan-300 font-semibold mt-0.5">
                {currentStage.sub}
              </p>
              <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                {currentStage.desc}
              </p>
            </div>

            {/* Hardware Specifications */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Hardware &amp; Cryo Subsystem:
              </span>
              <div className="p-2.5 rounded-lg bg-[#02050e] border border-slate-800 text-[11px] space-y-1.5">
                <div>
                  <span className="text-slate-500 block text-[10px]">Component:</span>
                  <span className="text-white font-semibold">{currentStage.hardwareSpecs.component}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Materials:</span>
                  <span className="text-cyan-300">{currentStage.hardwareSpecs.materials}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Interconnect:</span>
                  <span className="text-slate-300">{currentStage.hardwareSpecs.interconnect}</span>
                </div>
                {currentStage.hardwareSpecs.rfPowerOrThermal && (
                  <div>
                    <span className="text-slate-500 block text-[10px]">Power / Thermal Lift:</span>
                    <span className="text-amber-400 font-bold">{currentStage.hardwareSpecs.rfPowerOrThermal}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Software Specifications */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Software &amp; QEC Pipeline:
              </span>
              <div className="p-2.5 rounded-lg bg-[#02050e] border border-slate-800 text-[11px] space-y-1.5">
                <div>
                  <span className="text-slate-500 block text-[10px]">Framework / Target:</span>
                  <span className="text-purple-300 font-bold">{currentStage.softwareSpecs.framework}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Algorithmic Operator:</span>
                  <span className="text-slate-200">{currentStage.softwareSpecs.algorithm}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Fidelity / Threshold:</span>
                  <span className="text-emerald-400 font-bold">{currentStage.softwareSpecs.fidelityOrThreshold}</span>
                </div>
              </div>
            </div>

            {/* Live Algorithm Statevector Preview */}
            <div className="p-3 rounded-lg bg-[#020612] border border-cyan-500/25 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold">{currentAlgo.name} Output:</span>
                <span className="text-cyan-300 font-bold">{currentAlgo.expectedState}</span>
              </div>

              {/* State Amplitudes */}
              <div className="space-y-1">
                {currentAlgo.stateAmplitudes.map(amp => (
                  <div key={amp.state} className="flex items-center gap-2 text-[10px]">
                    <span className="w-8 text-cyan-300 font-bold">{amp.state}</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-400 to-sky-400 transition-all duration-300"
                        style={{ width: `${amp.prob * 100}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-slate-300">{(amp.prob * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
            </>
          )} {/* end algorithm inspector */}
        </div>
      </div>

    </div>
  );
};

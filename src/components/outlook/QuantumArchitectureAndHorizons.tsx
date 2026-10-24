import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  Clock, 
  Cpu, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  ArrowRight, 
  Sliders, 
  TrendingUp, 
  ShieldCheck, 
  BookOpen, 
  ChevronRight,
  Activity,
  Maximize2,
  Minimize2,
  Calculator,
  RefreshCw,
  GitCommit
} from 'lucide-react';
import { playGateClickSound } from '../../utils/audio';
import { FUTURE_QUANTUM_HORIZONS, FutureHorizon } from '../../data/quantum_outlook';

interface QuantumArchitectureAndHorizonsProps {
  audienceMode: 'everyone' | 'technical';
}

export interface ArchitectureLayer {
  level: number;
  name: string;
  shortName: string;
  category: string;
  description: string;
  technicalRole: string;
  keyTechnologies: string[];
  primaryBottleneck: string;
  latencyBudget: string;
  leadingPlayers: string[];
}

export const QUANTUM_FULL_STACK_LAYERS: ArchitectureLayer[] = [
  {
    level: 7,
    name: 'Application & Domain Algorithms Layer',
    shortName: 'Layer 7: Application',
    category: 'Software & End-User Algorithms',
    description: 'The top layer where enterprise users, chemical engineers, and cryptographers define computational objectives without needing to understand physical quantum gates.',
    technicalRole: 'Transforms high-level Hamiltonians, molecular orbitals, and combinatorial graphs into quantum algorithms (VQE, QAOA, QPE, Shor, Grover).',
    keyTechnologies: ['Variational Quantum Eigensolver (VQE)', 'Quantum Phase Estimation (QPE)', 'Grover Search', 'Shor’s Factoring'],
    primaryBottleneck: 'Heuristic NISQ algorithms lack mathematical guarantees of exponential speedup over classical tensor networks.',
    latencyBudget: 'Seconds to Hours per execution batch',
    leadingPlayers: ['SandboxAQ', 'Classiq', 'Zapata AI', 'Q-CTRL', 'Google Quantum AI']
  },
  {
    level: 6,
    name: 'Programming Framework & Intermediate Representation (IR)',
    shortName: 'Layer 6: Framework & IR',
    category: 'Compiler Front-End',
    description: 'Human-readable quantum code is written, parsed, and converted into universal vendor-neutral intermediate bytecode representations.',
    technicalRole: 'Compiles high-level language scripts into target-agnostic directed acyclic graphs (DAGs) and LLVM-based Quantum Intermediate Representation (QIR).',
    keyTechnologies: ['OpenQASM 3.0', 'Qiskit SDK', 'Google Cirq', 'Microsoft QIR / LLVM', 'PennyLane'],
    primaryBottleneck: 'Lack of universal standardized circuit optimization representations across diverse qubit topologies.',
    latencyBudget: '< 100 ms compilation time',
    leadingPlayers: ['IBM Quantum', 'Google Quantum AI', 'QIR Alliance', 'Xanadu']
  },
  {
    level: 5,
    name: 'Quantum Compiler & Circuit Synthesis Engine',
    shortName: 'Layer 5: Compiler & Routing',
    category: 'Optimization & Mapping',
    description: 'Translates theoretical quantum circuits to fit onto the specific physical wiring layout and coupling graph of a target QPU.',
    technicalRole: 'Performs SWAP routing, gate commutation rules, Clifford + T synthesis, and pulse-level translation to minimize physical circuit depth.',
    keyTechnologies: ['Lattice Routing / SWAP Synthesis', 'Clifford Data Regression', 'Commutation Optimization', 'Dynamical Decoupling Pulse Insertion'],
    primaryBottleneck: 'NP-hard optimal qubit mapping on constrained planar topologies (e.g. Heavy-Hex or Square Lattice).',
    latencyBudget: '10 to 500 ms compilation latency',
    leadingPlayers: ['Cambridge Quantum / Quantinuum', 'TKET Compiler', 'IBM Qiskit Transpiler', 'Classiq']
  },
  {
    level: 4,
    name: 'Quantum Error Correction (QEC) & Logical Layer',
    shortName: 'Layer 4: QEC & Decoders',
    category: 'Fault-Tolerance Engine',
    description: 'The critical brain of a fault-tolerant quantum computer: groups dozens or hundreds of noisy physical qubits into protected, long-lived logical qubits.',
    technicalRole: 'Executes stabilizer parity measurements, runs ultra-fast syndrome decoding algorithms, and performs Magic State Distillation (|T⟩ factories).',
    keyTechnologies: ['Rotated Surface Codes (d=3,5,7)', 'Minimum-Weight Perfect Matching (MWPM)', 'Union-Find Decoders', 'Color Codes & LDPC'],
    primaryBottleneck: 'Syndrome decoding latency must execute in under 1 microsecond to prevent error backlog (the "decoding backlog problem").',
    latencyBudget: '< 1.0 μs real-time FPGA decoding',
    leadingPlayers: ['Riverlane (Deltaflow.QEC)', 'Google Willow QEC Team', 'IBM Quantum QEC', 'Harvard/QuEra']
  },
  {
    level: 3,
    name: 'Control Electronics & Cryo-CMOS ASIC Layer',
    shortName: 'Layer 3: Control & Cryo-CMOS',
    category: 'Signal Processing & RF Hardware',
    description: 'Generates precision microwave pulses and DC flux biases that rotate and entangle physical qubits, operating at room temperature and cryogenic stages.',
    technicalRole: 'High-speed Arbitrary Waveform Generators (AWGs), Cryo-CMOS controller ASICs at 4 Kelvin, and low-latency feedback FPGAs.',
    keyTechnologies: ['4K Cryo-CMOS ASICs (Horse Ridge / Gooseberry)', 'Direct RF Microwave Synthesis (4–8 GHz)', 'Cryo-HEMT Amplifiers', 'FPGA State Discrimination'],
    primaryBottleneck: 'Coaxial heat load and mechanical density limits: routing 1,000+ wires down dilution fridges threatens thermal runaway.',
    latencyBudget: '10 to 50 ns pulse shaping precision',
    leadingPlayers: ['Zurich Instruments', 'QBlox', 'Keysight', 'Intel Labs', 'SEEQC']
  },
  {
    level: 2,
    name: 'Cryogenic & Vacuum Thermal Infrastructure Layer',
    shortName: 'Layer 2: Cryo & Vacuum',
    category: 'Thermodynamic Housing',
    description: 'Creates the extreme environmental conditions—millikelvin sub-zero temperatures and ultra-high vacuums—needed to keep delicate quantum states alive.',
    technicalRole: 'Multi-stage dilution refrigerators (50K → 4.2K → 0.8K Still → 100mK → 15mK MXC) or UHV chambers (< 10⁻¹¹ Torr) for trapped particles.',
    keyTechnologies: ['Pulse-Tube Dilution Refrigerators', '³He/⁴He Closed-Loop Circulation', 'Mu-Metal / Cryoperm Magnetic Shielding', 'Active Vibration Isolation'],
    primaryBottleneck: 'Helium-3 isotope scarcity and extreme cooling power limits (only ~15 to 30 μW available at 15 mK).',
    latencyBudget: 'Continuous operation (24/7 steady state)',
    leadingPlayers: ['Bluefors (Finland)', 'Oxford Instruments (UK)', 'FormFactor (US)', 'Kiutra']
  },
  {
    level: 1,
    name: 'Physical Qubit Processor (QPU Core)',
    shortName: 'Layer 1: QPU Core',
    category: 'Quantum Physics Engine',
    description: 'The physical hardware chip containing natural or engineered artificial two-level quantum systems that hold quantum superposition and entanglement.',
    technicalRole: 'Superconducting Josephson junctions, electrostatically trapped ions, Rydberg atoms in optical tweezers, or semiconductor spin quantum dots.',
    keyTechnologies: ['Superconducting Transmons (Al/AlOx/Al)', 'Trapped Ytterbium/Barium Ions', 'Neutral Rubidium Arrays', 'Silicon Spin Dots (Si/SiGe)'],
    primaryBottleneck: 'Decoherence from material dielectric loss (TLS), charge/flux noise, and manufacturing parameter variation.',
    latencyBudget: 'Gate speed: 10 ns (Transmon) to 35 μs (Ion)',
    leadingPlayers: ['IBM Quantum', 'Google Quantum AI', 'Quantinuum', 'QuEra', 'Rigetti', 'Intel']
  }
];

export const QuantumArchitectureAndHorizons: React.FC<QuantumArchitectureAndHorizonsProps> = ({
  audienceMode
}) => {
  const [activeView, setActiveView] = useState<'stack' | 'horizons' | 'qec_calculator' | 'trl_radar'>('stack');
  
  // Selected Architecture Layer for Deep-Dive
  const [selectedLevel, setSelectedLevel] = useState<number>(4); // Default to Layer 4 (QEC)
  
  // Selected Future Horizon Epoch
  const [selectedEpochId, setSelectedEpochId] = useState<string>('h2_ftqc');

  // Interactive QEC Overhead Simulator State
  const [logicalQubitsNeeded, setLogicalQubitsNeeded] = useState<number>(50);
  const [codeDistance, setCodeDistance] = useState<number>(5);
  const [physicalErrorRate, setPhysicalErrorRate] = useState<number>(0.001); // 1e-3 (0.1%)
  const [includeDistillation, setIncludeDistillation] = useState<boolean>(true);

  // QEC calculations
  const qecCalculations = useMemo(() => {
    // Physical qubits per logical patch in rotated surface code: 2 * d^2
    const qubitsPerPatch = 2 * Math.pow(codeDistance, 2);
    
    // Base physical qubits for logical data patches
    const basePhysicalQubits = logicalQubitsNeeded * qubitsPerPatch;
    
    // Magic state distillation factory overhead (15-to-1 or 20-to-4 Bravyi-Kitaev factory): ~4x to 8x data patch footprint
    const factoryMultiplier = includeDistillation ? 5.5 : 1.0;
    const totalPhysicalQubits = Math.round(basePhysicalQubits * factoryMultiplier);

    // Logical error rate scaling: p_L ≈ 0.1 * (p_phys / p_threshold)^((d+1)/2)
    const threshold = 0.01; // 1% threshold
    const errorRatio = physicalErrorRate / threshold;
    const exponent = (codeDistance + 1) / 2;
    const logicalErrorRate = Math.min(1.0, 0.1 * Math.pow(errorRatio, exponent));
    
    // Logical operations before error
    const meanOpsBeforeError = Math.round(1 / Math.max(1e-18, logicalErrorRate));

    return {
      qubitsPerPatch,
      basePhysicalQubits,
      totalPhysicalQubits,
      logicalErrorRate: logicalErrorRate.toExponential(2),
      meanOpsBeforeError
    };
  }, [logicalQubitsNeeded, codeDistance, physicalErrorRate, includeDistillation]);

  const activeLayer = QUANTUM_FULL_STACK_LAYERS.find(l => l.level === selectedLevel) || QUANTUM_FULL_STACK_LAYERS[3];
  const activeEpoch = FUTURE_QUANTUM_HORIZONS.find(h => h.id === selectedEpochId) || FUTURE_QUANTUM_HORIZONS[1];

  return (
    <div className="space-y-6 font-mono text-xs">
      
      {/* 1. Top Horizon Navigation Sub-Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#09141d] border border-cyan-800/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
            <Layers className="w-5 h-5 text-[#00e5ff]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">Quantum Technology Architecture &amp; Horizons</h3>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-[#00e5ff] border border-cyan-800 text-[10px] font-bold">
                SYSTEMS ENGINEERING LAB
              </span>
            </div>
            <p className="text-[11px] text-[#78909c]">
              Interactive 7-layer quantum computer stack, 4-epoch technology horizons, and real-time Surface Code QEC resource scaling
            </p>
          </div>
        </div>

        {/* Workspace Switcher */}
        <div className="flex items-center gap-1.5 bg-[#050b11] p-1.5 rounded-xl border border-slate-800">
          {[
            { id: 'stack' as const, label: '7-Layer Architecture Stack', icon: Layers },
            { id: 'horizons' as const, label: '4-Epoch Horizons (2024–2045+)', icon: Clock },
            { id: 'qec_calculator' as const, label: 'QEC Resource Overhead Engine', icon: Calculator },
            { id: 'trl_radar' as const, label: 'Multi-Modality TRL Matrix', icon: TrendingUp }
          ].map(view => {
            const Icon = view.icon;
            const isCur = activeView === view.id;
            return (
              <button
                key={view.id}
                onClick={() => {
                  playGateClickSound(600);
                  setActiveView(view.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isCur
                    ? 'bg-[#00e5ff] text-[#02060a] shadow-xs shadow-[#00e5ff]/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{view.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW 1: THE 7-LAYER QUANTUM COMPUTING STACK */}
      {activeView === 'stack' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Interactive 7-Layer Visual Tower (5 cols) */}
          <div className="lg:col-span-5 space-y-2">
            <div className="pb-1 border-b border-slate-800 flex justify-between items-center text-slate-400 text-[11px]">
              <span className="font-bold text-white uppercase flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Full-Stack Hierarchy</span>
              </span>
              <span>Click a layer to inspect</span>
            </div>

            <div className="space-y-1.5">
              {QUANTUM_FULL_STACK_LAYERS.map(layer => {
                const isSelected = selectedLevel === layer.level;
                return (
                  <button
                    key={layer.level}
                    onClick={() => {
                      playGateClickSound(650);
                      setSelectedLevel(layer.level);
                    }}
                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-950/90 to-blue-950/90 border-cyan-400 shadow-md shadow-cyan-500/20 translate-x-1'
                        : 'bg-[#050b11] border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}>
                        L{layer.level}
                      </div>
                      <div>
                        <div className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                          {layer.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {layer.category}
                        </div>
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-cyan-400 translate-x-0.5' : 'text-slate-600'}`} />
                  </button>
                );
              })}
            </div>

            <div className="p-3 rounded-xl bg-[#02050b] border border-slate-850 text-[10px] text-slate-500 flex justify-between">
              <span>Top: Application Logic</span>
              <span>Bottom: Quantum Physics Core</span>
            </div>
          </div>

          {/* Right Column: Layer Deep-Dive Dossier (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            <div className="p-5 rounded-2xl bg-[#050b11] border border-cyan-800/40 space-y-4">
              
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                      LAYER {activeLayer.level} OF 7
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {activeLayer.category}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">{activeLayer.name}</h3>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">Timing Budget</span>
                  <div className="text-xs font-bold text-cyan-300">{activeLayer.latencyBudget}</div>
                </div>
              </div>

              {/* Functional Role */}
              <div className="p-3.5 rounded-xl bg-[#02050b] border border-slate-850 space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {audienceMode === 'everyone' ? 'How This Layer Works (In Plain English):' : 'System Architectural Function:'}
                  </span>
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {audienceMode === 'everyone' ? activeLayer.description : activeLayer.technicalRole}
                </p>
              </div>

              {/* Technologies & Key Tools */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Core Technologies &amp; Industry Standards:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeLayer.keyTechnologies.map((tech, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-[#09141d] border border-slate-800 text-[11px] text-slate-200 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{tech}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Engineering Bottlenecks */}
              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40 text-[11px] space-y-1">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Active Scaling Bottleneck for this Layer:</span>
                </div>
                <p className="text-slate-300 leading-relaxed pl-5">
                  {activeLayer.primaryBottleneck}
                </p>
              </div>

              {/* Leading Ecosystem Organizations */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Leading Innovators:</span>
                <div className="flex flex-wrap gap-1.5 justify-end">
                  {activeLayer.leadingPlayers.map((player, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 text-[10px]">
                      {player}
                    </span>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* VIEW 2: 4-EPOCH HORIZONS ROADMAP (2024–2045+) */}
      {activeView === 'horizons' && (
        <div className="space-y-5">
          
          {/* Epoch Selector Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {FUTURE_QUANTUM_HORIZONS.map((h, idx) => {
              const isSelected = selectedEpochId === h.id;
              const isNow = h.status === 'active-now';
              return (
                <button
                  key={h.id}
                  onClick={() => {
                    playGateClickSound(650);
                    setSelectedEpochId(h.id);
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-950 to-blue-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                      : 'bg-[#050b11] border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                      isNow ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {h.timeframe.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-cyan-400 font-bold">Epoch {idx + 1}</span>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-white line-clamp-1">{h.title}</h4>
                    <span className="text-[10px] text-slate-400 line-clamp-1">{h.eraName}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Epoch Deep Dive Card */}
          <div className="p-5 rounded-2xl bg-[#050b11] border border-cyan-800/40 space-y-4">
            
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                    {activeEpoch.timeframe}
                  </span>
                  <span className="text-xs text-purple-300 font-mono">
                    {activeEpoch.eraName}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">{activeEpoch.title}</h3>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Maturity Level</span>
                <div className="text-xs font-bold text-emerald-400">{activeEpoch.trlLevel}</div>
              </div>
            </div>

            {/* Explanation */}
            <div className="p-3.5 rounded-xl bg-[#02050b] border border-slate-850 space-y-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-bold block flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>{audienceMode === 'everyone' ? 'How To Think About This Era:' : 'Architectural Reality:'}</span>
              </span>
              <p className="text-slate-300 text-xs leading-relaxed">
                {audienceMode === 'everyone' ? activeEpoch.simplifiedExplanation : activeEpoch.trlLevel}
              </p>
            </div>

            {/* Breakthroughs & Challenges Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              <div className="p-3.5 rounded-xl bg-[#09141d] border border-slate-800 space-y-2">
                <span className="text-[10px] text-emerald-400 uppercase font-bold block flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Key Technical Milestones to Achieve:</span>
                </span>
                <div className="space-y-1.5 text-[11px]">
                  {activeEpoch.keyMilestones.map((m, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-slate-300">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#09141d] border border-slate-800 space-y-2">
                <span className="text-[10px] text-amber-400 uppercase font-bold block flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Physical Bottlenecks to Overcome:</span>
                </span>
                <div className="space-y-1.5 text-[11px]">
                  {activeEpoch.physicalChallenges.map((c, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-slate-400">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Societal Impact */}
            <div className="p-3.5 rounded-xl bg-[#02050b] border border-purple-800/40 text-[11px] space-y-1">
              <span className="text-purple-300 font-bold block text-[10px] uppercase">Societal &amp; Commercial Impact:</span>
              <p className="text-slate-300 leading-relaxed">
                {activeEpoch.impactOnSociety}
              </p>
            </div>

          </div>

        </div>
      )}

      {/* VIEW 3: QUANTUM ERROR CORRECTION (QEC) OVERHEAD CALCULATOR */}
      {activeView === 'qec_calculator' && (
        <div className="space-y-5">
          
          <div className="p-4 rounded-xl bg-[#050b11] border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-white text-xs uppercase flex items-center gap-2">
                <Calculator className="w-4 h-4 text-cyan-400" />
                <span>Surface Code Physical-to-Logical Qubit Overhead Simulator</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Bravyi-Kitaev &amp; Fowler Model</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Calculate the total physical qubits required to build a fault-tolerant quantum machine based on code distance d, raw gate error rate, and Magic State Distillation factory overhead.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Input Controls (6 cols) */}
            <div className="lg:col-span-6 p-4 rounded-xl bg-[#050b11] border border-slate-800 space-y-4">
              
              {/* Slider 1: Logical Qubits Needed */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-bold">Target Logical Qubits:</span>
                  <span className="text-cyan-300 font-bold">{logicalQubitsNeeded} Logical Qubits</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="500"
                  step="5"
                  value={logicalQubitsNeeded}
                  onChange={(e) => setLogicalQubitsNeeded(+e.target.value)}
                  className="w-full h-1.5 bg-slate-800 accent-[#00e5ff] rounded cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-500">
                  <span>5 (Toy Code)</span>
                  <span>50 (Chemistry Advantage)</span>
                  <span>500 (Shor's RSA Break)</span>
                </div>
              </div>

              {/* Slider 2: Code Distance d */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-bold">Surface Code Distance (d):</span>
                  <span className="text-purple-300 font-bold">d = {codeDistance} (Corrects ⌊{(codeDistance - 1)/2}⌋ errors)</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="15"
                  step="2"
                  value={codeDistance}
                  onChange={(e) => setCodeDistance(+e.target.value)}
                  className="w-full h-1.5 bg-slate-800 accent-purple-400 rounded cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-500">
                  <span>d=3 (18 Qubits/Patch)</span>
                  <span>d=7 (98 Qubits/Patch)</span>
                  <span>d=15 (450 Qubits/Patch)</span>
                </div>
              </div>

              {/* Slider 3: Physical Gate Error Rate */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-bold">Raw Physical 2Q Gate Error Rate:</span>
                  <span className="text-amber-300 font-bold">{(physicalErrorRate * 100).toFixed(2)}% (p = {physicalErrorRate})</span>
                </div>
                <select
                  value={physicalErrorRate}
                  onChange={(e) => setPhysicalErrorRate(+e.target.value)}
                  className="w-full p-2 rounded-lg bg-[#02050b] border border-slate-800 text-cyan-300 text-xs font-mono outline-none"
                >
                  <option value={0.005}>0.50% (Current Standard NISQ QPUs)</option>
                  <option value={0.001}>0.10% (Google Willow / Below-Threshold Horizon)</option>
                  <option value={0.0003}>0.03% (Next-Gen High-Fidelity Trapped-Ion/Transmon)</option>
                  <option value={0.0001}>0.01% (Far-Future Semiconductor Spec)</option>
                </select>
              </div>

              {/* Checkbox: Magic State Distillation Factory */}
              <div className="p-3 rounded-lg bg-[#02050b] border border-slate-850 flex items-center justify-between">
                <div>
                  <span className="text-slate-200 font-bold block text-xs">Include Magic State Distillation Factories</span>
                  <span className="text-[10px] text-slate-500">Required for non-Clifford T-gates in universal quantum computing (+450% qubit overhead)</span>
                </div>
                <input
                  type="checkbox"
                  checked={includeDistillation}
                  onChange={(e) => setIncludeDistillation(e.target.checked)}
                  className="w-4 h-4 accent-[#00e5ff] cursor-pointer"
                />
              </div>

            </div>

            {/* Results Card (6 cols) */}
            <div className="lg:col-span-6 p-5 rounded-xl bg-[#09141d] border border-cyan-800/40 space-y-4 flex flex-col justify-between">
              
              <div className="space-y-3">
                <span className="text-[10px] text-slate-400 uppercase font-bold block pb-1 border-b border-slate-800">
                  Total Physical Resource Budget Breakdown
                </span>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 text-center space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Physical Qubits Required</span>
                  <div className="text-3xl font-bold text-[#00e5ff]">
                    {qecCalculations.totalPhysicalQubits.toLocaleString()} Physical Qubits
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Ratio: {Math.round(qecCalculations.totalPhysicalQubits / logicalQubitsNeeded)} physical per logical qubit
                  </span>
                </div>

                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-850">
                    <span className="text-slate-400">Physical Qubits per Logical Patch (2d²):</span>
                    <span className="text-white font-bold">{qecCalculations.qubitsPerPatch} Qubits</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-850">
                    <span className="text-slate-400">Base Logical Memory Footprint:</span>
                    <span className="text-white font-bold">{qecCalculations.basePhysicalQubits.toLocaleString()} Qubits</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-850">
                    <span className="text-slate-400">Resulting Logical Error Rate (p_L):</span>
                    <span className="text-emerald-400 font-bold">{qecCalculations.logicalErrorRate}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-850">
                    <span className="text-slate-400">Fault-Tolerant Gate Horizon:</span>
                    <span className="text-purple-300 font-bold">~{qecCalculations.meanOpsBeforeError.toLocaleString()} Operations</span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-850 text-[10px] text-slate-400">
                <span className="text-white font-bold block">Feasibility Horizon:</span>
                {qecCalculations.totalPhysicalQubits <= 1500 ? (
                  <span className="text-emerald-400 font-bold">✓ Feasible in Horizon 1 / Early Horizon 2 (2025–2028)</span>
                ) : qecCalculations.totalPhysicalQubits <= 20000 ? (
                  <span className="text-cyan-400 font-bold">⚡ Feasible in Horizon 2: Below-Threshold Logical Qubits (2028–2031)</span>
                ) : (
                  <span className="text-amber-400 font-bold">⏳ Requires Horizon 3 Industrial Mega-Foundries (2032+)</span>
                )}
              </div>

            </div>

          </div>

        </div>
      )}

      {/* VIEW 4: MULTI-MODALITY TECHNOLOGY READINESS LEVEL (TRL) RADAR */}
      {activeView === 'trl_radar' && (
        <div className="p-5 rounded-2xl bg-[#050b11] border border-cyan-800/40 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <div>
              <h4 className="font-bold text-white text-xs uppercase flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Global Multi-Modality Technology Readiness Level (NASA/DOD TRL 1 to 9)</span>
              </h4>
              <p className="text-[10px] text-slate-400">
                Independent benchmark tracking current commercialization maturity versus long-term scalability potential
              </p>
            </div>
            <span className="text-[10px] text-slate-500 font-bold">Updated Q1 2026</span>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Superconducting Transmons (IBM, Google, Rigetti)', trl: 8, maxTrl: 9, status: 'TRL 8: System Qualified & Cloud Deployed', desc: 'Fastest gate speeds (10–30 ns), advanced wafer lithography; challenged by dilution cooling heat budgets and 2D planar wiring.' },
              { name: 'Trapped-Ion QCCD (Quantinuum, IonQ, Oxford Ionics)', trl: 7, maxTrl: 9, status: 'TRL 7: Prototype Demonstration in Operational Environment', desc: 'Highest 2Q gate fidelities (> 99.9%), all-to-all connectivity; challenged by microsecond gate execution speeds and optical shuttling.' },
              { name: 'Neutral-Atom Rydberg Arrays (QuEra, Harvard, Pasqal)', trl: 6, maxTrl: 9, status: 'TRL 6: System Prototype Tested in Relevant Environment', desc: 'Massive physical counts (1,000+ atomic traps), reconfigurable geometry; challenged by trap reloading latency and laser phase stability.' },
              { name: 'Silicon Spin Qubits (Intel, Diraq, UNSW)', trl: 5, maxTrl: 9, status: 'TRL 5: Component Validated in Relevant Environment', desc: '100x smaller nanometer pitch, 1K "Hot Qubit" operation, compatible with standard 300 mm CMOS fabs; challenged by valley state splitting.' },
              { name: 'Integrated Photonics (PsiQuantum, Xanadu)', trl: 5, maxTrl: 9, status: 'TRL 5: Foundational Photonic Waveguides Fabricated', desc: 'Room temperature quantum core, picosecond transit times; challenged by optical coupler losses and probabilistic measurement-based gates.' },
              { name: 'Topological Majorana Zero Modes (Microsoft Quantum)', trl: 3, maxTrl: 9, status: 'TRL 3: Analytical & Experimental Critical Function Proof', desc: 'Hardware-level topological error protection with non-Abelian braiding; challenged by severe material purity and sub-gap state verification.' }
            ].map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[#09141d] border border-slate-800 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-white text-xs">{item.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                    {item.status}
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${(item.trl / item.maxTrl) * 100}%` }}
                  />
                </div>

                <p className="text-[10px] text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

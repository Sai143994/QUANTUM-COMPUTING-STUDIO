import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Layers, 
  Cpu, 
  Thermometer, 
  Clock, 
  Zap, 
  Activity, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  ArrowRight,
  Info,
  Maximize2,
  Atom,
  Binary,
  Radio,
  Sliders,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { playGateClickSound, playMeasurementCollapseSound } from '../utils/audio';

export interface WorkflowStage {
  id: string;
  step: number;
  title: string;
  shortTitle: string;
  subsystem: string;
  temperature: string;
  latencyBudget: string;
  signalDomain: string;
  hardware: string;
  description: string;
  dataInput: string;
  dataOutput: string;
  keyOperations: string[];
  governingEquation: string;
  industryLeaders: string[];
}

export const QC_WORKFLOW_STAGES: WorkflowStage[] = [
  {
    id: 'formulation',
    step: 1,
    title: '1. Problem Formulation & Hamiltonian Encoding',
    shortTitle: 'Problem Formulation',
    subsystem: 'Application & Theory Layer',
    temperature: '300 K (Ambient Room)',
    latencyBudget: 'Seconds / Batched',
    signalDomain: 'Mathematical Graphs & Tensors',
    hardware: 'High-Performance Classical Workstations / Cloud',
    description: 'The real-world computational problem (molecular orbitals, portfolio risk matrix, or cryptographic prime factorization) is mapped into an exact second-quantized Hamiltonian or unitary operator.',
    dataInput: 'Molecular geometry / Graph adjacency matrix',
    dataOutput: 'Pauli operator string sum: H = ∑ c_i σ_i',
    keyOperations: [
      'Jordan-Wigner / Bravyi-Kitaev fermionic-to-qubit transformation',
      'Hamiltonian decomposition into orthogonal Pauli strings (X, Y, Z, I)',
      'Variational Ansatz parameterization |ψ(θ)⟩'
    ],
    governingEquation: 'H = ∑_{pq} h_{pq} a_p^† a_q + \\frac{1}{2} ∑_{pqrs} h_{pqrs} a_p^† a_q^† a_s a_r',
    industryLeaders: ['SandboxAQ', 'Classiq', 'Zapata AI', 'PennyLane (Xanadu)']
  },
  {
    id: 'synthesis',
    step: 2,
    title: '2. High-Level Circuit Synthesis & IR Generation',
    shortTitle: 'Circuit Synthesis',
    subsystem: 'Compiler Front-End',
    temperature: '300 K (Ambient Room)',
    latencyBudget: '< 100 ms',
    signalDomain: 'Abstract Quantum DAG / Bytecode',
    hardware: 'Classical CPU Server Farm',
    description: 'Converts abstract quantum algorithms into target-agnostic directed acyclic graphs (DAGs) and LLVM-based Quantum Intermediate Representation (QIR).',
    dataInput: 'Python / Qiskit / Cirq scripts',
    dataOutput: 'OpenQASM 3.0 / LLVM QIR bytecode',
    keyOperations: [
      'Clifford + T gate synthesis with Solovay-Kitaev approximation',
      'Commutation relation analysis (canceling redundant H·H or X·X gates)',
      'Quantum memory allocation and virtual qubit indexing'
    ],
    governingEquation: 'U_target ≈ ∏_{k=1}^M G_k \\quad \\text{where } G_k \\in \\{H, S, T, CNOT\\}',
    industryLeaders: ['Qiskit (IBM)', 'Cirq (Google)', 'QIR Alliance', 'Microsoft Azure Quantum']
  },
  {
    id: 'transpilation',
    step: 3,
    title: '3. Transpilation & Topology Routing',
    shortTitle: 'Transpilation & Routing',
    subsystem: 'Compiler Back-End & Scheduler',
    temperature: '300 K (Ambient Room)',
    latencyBudget: '50 – 500 ms',
    signalDomain: 'Device-Specific Pulse Schedule',
    hardware: 'Dedicated Quantum Optimization Engines (TKET / Qiskit Transpiler)',
    description: 'Maps virtual qubits onto the physical planar coupling graph of the specific QPU (e.g. Heavy-Hex or Square Grid), inserting SWAP gates where direct couplings do not exist.',
    dataInput: 'Virtual quantum DAG + QPU coupling graph',
    dataOutput: 'Scheduled physical gate pulse schedule with dynamical decoupling',
    keyOperations: [
      'A* graph search for optimal SWAP routing with minimal depth expansion',
      'Dynamical decoupling pulse insertion (XY4 / CPMG) during idle qubit cycles',
      'Frequency collision avoidance (tuning flux bias lines away from crosstalk resonances)'
    ],
    governingEquation: '\\text{Depth}_{physical} = \\text{Depth}_{virtual} + 3 \\times N_{SWAP}',
    industryLeaders: ['Quantinuum (TKET)', 'IBM Quantum Transpiler', 'Rigetti Quilc']
  },
  {
    id: 'control_electronics',
    step: 4,
    title: '4. Room-Temperature Control Electronics',
    shortTitle: 'Control Electronics',
    subsystem: 'RF Signal Processing Rack',
    temperature: '300 K (Ambient Server Rack)',
    latencyBudget: '10 – 50 ns per pulse',
    signalDomain: 'Analog Microwave I/Q Waveforms (4 – 8 GHz)',
    hardware: 'High-speed Arbitrary Waveform Generators (AWGs), 14-bit DACs/ADCs, Ultra-low-jitter Rubidium Clocks',
    description: 'Digital pulse schedules are converted into analog modulated microwave tones and nanosecond-precision flux pulses to drive physical qubit state rotations.',
    dataInput: 'Digital instruction words (Frequency, Phase, Amplitude, Duration)',
    dataOutput: 'Analog RF modulated microwave pulses: V(t) = I(t)cos(ωt) + Q(t)sin(ωt)',
    keyOperations: [
      'Direct Digital Synthesis (DDS) with sub-picosecond phase coherence',
      'I/Q quadrature modulation for single-sideband frequency shifting',
      'DRAG (Derivative Removal by Adiabatic Gate) pulse shaping to prevent leakage into |2⟩'
    ],
    governingEquation: 'V_{DRAG}(t) = \\Omega(t) \\cos(\\omega_{01} t) - \\frac{\\dot{\\Omega}(t)}{\\alpha} \\sin(\\omega_{01} t)',
    industryLeaders: ['Zurich Instruments (UHFQA)', 'Quantum Machines (OPX+)', 'Keysight Technologies', 'QBlox']
  },
  {
    id: 'cryo_cascade',
    step: 5,
    title: '5. Thermal Attenuation & Cryogenic Cascade',
    shortTitle: 'Cryogenic Attenuation',
    subsystem: 'Thermodynamic Isolation Infrastructure',
    temperature: '300 K → 50 K → 4 K → 800 mK → 100 mK → 15 mK',
    latencyBudget: 'Continuous Steady-State (Thermal velocity of light)',
    signalDomain: 'Attenuated Microwave Waveguides (-60 dB total)',
    hardware: 'Multi-stage dilution refrigerator (Bluefors / Oxford Instruments), semi-rigid stainless steel/NbTi coaxial lines, cryogenic circulators & isolators',
    description: 'Carries signals down the dilution refrigerator stages while systematically filtering and attenuating thermal Johnson-Nyquist noise so high-temperature photons do not decohere the qubits.',
    dataInput: 'Microwave pulses with 300K blackbody radiation (~1,200 photons/mode)',
    dataOutput: 'Cold quantum-level microwave pulses (< 10⁻⁶ thermal photons at 15 mK)',
    keyOperations: [
      '-20 dB attenuation at 4 Kelvin stage and -20 dB at 15 mK mixing chamber',
      'Eccosorb infrared and copper-powder low-pass filtering to block stray photons',
      'Magnetic shielding (mu-metal outer shield + cryoperm superconducting inner can)'
    ],
    governingEquation: 'n_{th} = \\frac{1}{\\exp(hf / k_B T) - 1} \\ll 1 \\quad (T = 15\\,\\text{mK})',
    industryLeaders: ['Bluefors (Finland)', 'Oxford Instruments (UK)', 'FormFactor (US)', 'Maybell Quantum']
  },
  {
    id: 'qpu_core',
    step: 6,
    title: '6. QPU Core & Physical Qubit Interaction',
    shortTitle: 'Physical QPU Core',
    subsystem: 'Quantum Physics Substrate',
    temperature: '10 – 15 mK (Colder than deep space 2.7K)',
    latencyBudget: 'Gate execution: 10 – 40 ns (Transmon) / 35 μs (Trapped Ion)',
    signalDomain: 'Coherent Superposition & Quantum Entanglement',
    hardware: 'Superconducting Transmon die, Trapped Ion crystal, or Rydberg atomic tweezer array',
    description: 'The physical qubits undergo unitary evolution under the applied microwave or laser Hamiltonians, exploring the 2^N dimensional complex Hilbert space.',
    dataInput: 'Precision resonant microwave pulses / laser Raman pulses',
    dataOutput: 'Entangled quantum statevector |Ψ(t)⟩ = U |Ψ_0⟩',
    keyOperations: [
      'Single-qubit Pauli rotations via resonant Rabi oscillations',
      'Two-qubit entanglement via cross-resonance (CR) or CZ flux-pulsing',
      'Continuous preservation of phase coherence against environmental dielectric defects (T1, T2*)'
    ],
    governingEquation: 'i \\hbar \\frac{d}{dt}|\\Psi(t)\\rangle = \\hat{H}_{QPU}(t)|\\Psi(t)\\rangle',
    industryLeaders: ['Google Quantum AI (Willow)', 'IBM Quantum (Heron)', 'Quantinuum (H2-1)', 'QuEra (Aquila)']
  },
  {
    id: 'readout_amplification',
    step: 7,
    title: '7. Dispersive Readout & Quantum Amplification',
    shortTitle: 'Dispersive Readout',
    subsystem: 'Measurement & Low-Noise Amplification',
    temperature: '15 mK → 4 Kelvin Stage',
    latencyBudget: '200 – 800 ns',
    signalDomain: 'Dispersive Cavity Shift (I/Q Voltage Phase)',
    hardware: 'Superconducting Readout Resonators, Traveling Wave Parametric Amplifiers (TWPA), Cryo-HEMT Low-Noise Amplifiers',
    description: 'A microwave probe tone interrogates a readout resonator coupled to the qubit. The qubit state (|0⟩ or |1⟩) shifts the resonator frequency, shifting the probe pulse phase, which is then amplified at the quantum noise limit.',
    dataInput: 'Weak microwave readout pulse (~10 photons in readout cavity)',
    dataOutput: 'Amplified analog signal (+20 dB TWPA gain, +40 dB HEMT gain at 4K)',
    keyOperations: [
      'Dispersive state shift: ω_r(|0⟩) = ω_r0 - χ,  ω_r(|1⟩) = ω_r0 + χ',
      'Parametric four-wave mixing amplification via Josephson TWPA',
      'Waveform demodulation and IQ complex plane thresholding'
    ],
    governingEquation: '\\hat{H}_{int} = \\hbar \\chi \\hat{a}^† \\hat{a} \\hat{\\sigma}_z \\quad (\\text{Dispersive Readout Regime})',
    industryLeaders: ['MIT Lincoln Laboratory', 'Zurich Instruments', 'Raytheon BBN', 'Aalto University']
  },
  {
    id: 'qec_fpga_loop',
    step: 8,
    title: '8. Real-Time FPGA QEC Syndrome Decoding Loop',
    shortTitle: 'Real-Time QEC Loop',
    subsystem: 'Fault-Tolerance Engine',
    temperature: 'Room Temp (300K) or 4K Cryo-FPGA',
    latencyBudget: '< 1.0 μs (Must beat error accumulation rate)',
    signalDomain: 'Syndrome Parity Bits & Dynamic Pauli Frame Updates',
    hardware: 'Ultra-low-latency Xilinx/AMD UltraScale+ RFSoCs or Cryogenic FPGAs',
    description: 'Stabilizer measurements are ingested in real time. Ultra-fast Minimum-Weight Perfect Matching (MWPM) or Union-Find decoders determine if a bit-flip (X) or phase-flip (Z) occurred and update the software Pauli frame before the next gate cycle.',
    dataInput: 'Raw digitized binary stabilizer parity measurements',
    dataOutput: 'Correction operator lookup / dynamic software frame shift',
    keyOperations: [
      'Syndrome extraction graph construction across space-time error trellises',
      'Union-Find cluster expansion to identify error chains in < 800 ns',
      'Pauli frame tracker updates (eliminating need for physical corrective pulses)'
    ],
    governingEquation: 'p_L \\approx C \\left(\\frac{p}{p_{th}}\\right)^{(d+1)/2} \\quad (p < p_{th} \\approx 1\\%)',
    industryLeaders: ['Riverlane (Deltaflow.QEC)', 'Google Quantum AI QEC Team', 'IBM Quantum QEC', 'Harvard University']
  },
  {
    id: 'post_processing',
    step: 9,
    title: '9. Post-Processing & Error Mitigation',
    shortTitle: 'Post-Processing',
    subsystem: 'Classical Analytics Engine',
    temperature: '300 K (Ambient Cloud)',
    latencyBudget: 'Milliseconds to Seconds',
    signalDomain: 'Probability Distributions & Mitigated Observables',
    hardware: 'Cloud High-Performance Computing (HPC) Clusters',
    description: 'Applies classical statistical post-processing, readout error mitigation (M_inv), and Zero-Noise Extrapolation (ZNE) to extract pristine physical expectation values from thousands of quantum shots.',
    dataInput: 'Thousands of raw bitstring measurement outcomes (e.g. 10,000 shots)',
    dataOutput: 'Mitigated expectation value ⟨O⟩_mitigated and confidence intervals',
    keyOperations: [
      'Readout error mitigation: P_true = M_readout^-1 · P_measured',
      'Zero-Noise Extrapolation (ZNE) via noise scaling and Richardson polynomial fit',
      'Convergence verification against classical tensor network simulators'
    ],
    governingEquation: '\\langle O \\rangle_{ZNE} = \\lim_{\\lambda \\to 0} \\langle O \\rangle(\\lambda) = \\sum_k c_k \\langle O \\rangle(r_k \\lambda)',
    industryLeaders: ['Unitary Fund (Mitiq)', 'IBM Qiskit Runtime', 'NVIDIA CUDA-Q', 'AWS Braket']
  }
];

export const TechWorkflowSchematic: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(2500); // ms per step

  const currentStage = QC_WORKFLOW_STAGES.find(s => s.step === activeStep) || QC_WORKFLOW_STAGES[0];

  // Auto-play through stages
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setActiveStep(prev => {
        const next = prev >= 9 ? 1 : prev + 1;
        playGateClickSound(600 + next * 40, 0.04);
        return next;
      });
    }, playbackSpeed);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  const handleSelectStep = (stepNum: number) => {
    playGateClickSound(650 + stepNum * 35, 0.04);
    setActiveStep(stepNum);
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      
      {/* 1. Header Ribbon & Playback Controls */}
      <div className="p-4 rounded-2xl bg-[#09141d] border border-cyan-800/40 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
            <Activity className="w-5 h-5 text-[#00e5ff] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">Full-Stack QC Workflow Execution Pipeline</h3>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-[#00e5ff] border border-cyan-800 text-[10px] font-bold">
                END-TO-END SCHEMATIC
              </span>
            </div>
            <p className="text-[11px] text-[#78909c]">
              Interactive 9-stage engineering signal chain: from Hamiltonian formulation to sub-microsecond cryogenic QEC decoding
            </p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 bg-[#050b11] p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => handleSelectStep(activeStep <= 1 ? 9 : activeStep - 1)}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 cursor-pointer"
            title="Previous Stage"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              playGateClickSound(750, 0.05);
              setIsPlaying(!isPlaying);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              isPlaying
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                : 'bg-[#00e5ff] text-slate-950 shadow-md shadow-cyan-500/30'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Pause Workflow' : '▶ Simulate Workflow Run'}</span>
          </button>

          <button
            onClick={() => handleSelectStep(activeStep >= 9 ? 1 : activeStep + 1)}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 cursor-pointer"
            title="Next Stage"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              playGateClickSound(500, 0.03);
              setActiveStep(1);
            }}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            title="Reset to Step 1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Visual Interactive Process Flow Rail (All 9 Stages) */}
      <div className="p-4 rounded-2xl bg-[#050b11] border border-cyan-800/30 overflow-x-auto space-y-3">
        <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-slate-800">
          <span className="font-bold text-white uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interactive Workflow Steps (Click any step to inspect signal state)</span>
          </span>
          <span className="text-cyan-400 font-bold">
            Currently Simulating: Step {activeStep} of 9
          </span>
        </div>

        {/* Step Nodes Row */}
        <div className="flex items-center gap-2 min-w-[980px] py-2 relative">
          
          {/* Animated Glowing Connection Line behind nodes */}
          <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-800 -translate-y-1/2 z-0 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${(activeStep / 9) * 100}%` }}
            />
          </div>

          {QC_WORKFLOW_STAGES.map((st) => {
            const isCurrent = st.step === activeStep;
            const isPast = st.step < activeStep;

            return (
              <button
                key={st.id}
                onClick={() => handleSelectStep(st.step)}
                className={`relative z-10 flex-1 p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                  isCurrent
                    ? 'bg-gradient-to-b from-cyan-950 to-blue-950 border-cyan-400 shadow-lg shadow-cyan-500/30 scale-105 ring-2 ring-cyan-500/40'
                    : isPast
                    ? 'bg-[#09141d] border-cyan-800/40 text-slate-300 hover:border-cyan-600'
                    : 'bg-[#03060c] border-slate-800 text-slate-500 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCurrent
                      ? 'bg-cyan-400 text-slate-950'
                      : isPast
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                      : 'bg-slate-900 text-slate-500'
                  }`}>
                    {st.step}
                  </span>

                  <span className={`text-[9px] font-bold ${
                    isCurrent ? 'text-cyan-300' : 'text-slate-500'
                  }`}>
                    {st.temperature.split(' ')[0]}
                  </span>
                </div>

                <div>
                  <div className={`font-bold text-[11px] line-clamp-1 ${
                    isCurrent ? 'text-white' : 'text-slate-300'
                  }`}>
                    {st.shortTitle}
                  </div>
                  <div className="text-[9px] text-slate-500 line-clamp-1">
                    {st.subsystem}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Deep-Dive Stage Telemetry & Engineering Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Stage Core Profile & Operations (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-[#050b11] border border-cyan-800/40 space-y-4">
            
            {/* Stage Title & Subsystem */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                    STAGE {currentStage.step} OF 9
                  </span>
                  <span className="text-xs text-purple-300 font-mono">
                    {currentStage.subsystem}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">{currentStage.title}</h3>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Latency Budget</span>
                <div className="text-xs font-bold text-cyan-300">{currentStage.latencyBudget}</div>
              </div>
            </div>

            {/* Description */}
            <div className="p-3.5 rounded-xl bg-[#02050b] border border-slate-850 space-y-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-bold block flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span>Stage Engineering Role:</span>
              </span>
              <p className="text-slate-300 text-xs leading-relaxed">
                {currentStage.description}
              </p>
            </div>

            {/* Key Microcode Operations */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold block flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Key Real-Time Microcode &amp; Subroutines:</span>
              </span>
              <div className="space-y-1.5">
                {currentStage.keyOperations.map((op, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-[#09141d] border border-slate-800 text-[11px] text-slate-200 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{op}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Input / Output Transformation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#02050b] border border-slate-850 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Input Signal / Format:</span>
                <span className="text-cyan-300 font-bold block font-mono text-[11px]">{currentStage.dataInput}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#02050b] border border-slate-850 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Output Signal / Transformation:</span>
                <span className="text-purple-300 font-bold block font-mono text-[11px]">{currentStage.dataOutput}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Physical Hardware, Telemetry & Math (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Telemetry Card */}
          <div className="p-5 rounded-2xl bg-[#050b11] border border-cyan-800/40 space-y-4">
            
            <div className="pb-2 border-b border-slate-800 flex justify-between items-center text-xs">
              <span className="font-bold text-white uppercase flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-cyan-400" />
                <span>Physical Operating Telemetry</span>
              </span>
              <span className="text-[10px] text-slate-500 font-bold">LIVE STAGE SPECS</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 flex justify-between items-center">
                <span className="text-slate-400">Thermal Stage:</span>
                <span className={`font-bold ${
                  currentStage.temperature.includes('15 mK') || currentStage.temperature.includes('mK')
                    ? 'text-cyan-400' 
                    : 'text-amber-400'
                }`}>
                  {currentStage.temperature}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 flex justify-between items-center">
                <span className="text-slate-400">Signal Domain:</span>
                <span className="text-white font-bold">{currentStage.signalDomain}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 flex justify-between items-center">
                <span className="text-slate-400">Hardware Platform:</span>
                <span className="text-purple-300 font-bold text-right truncate max-w-[200px]" title={currentStage.hardware}>
                  {currentStage.hardware}
                </span>
              </div>
            </div>

            {/* Governing Mathematical Transformation */}
            <div className="p-3.5 rounded-xl bg-[#02050b] border border-cyan-900/40 space-y-1.5 font-mono">
              <span className="text-[10px] text-amber-400 uppercase font-bold block flex items-center gap-1.5">
                <Atom className="w-3.5 h-3.5" />
                <span>Governing Mathematical Formulation:</span>
              </span>
              <div className="p-2.5 rounded-lg bg-[#070e17] border border-slate-800 text-center text-cyan-300 font-bold text-xs">
                {currentStage.governingEquation}
              </div>
            </div>

            {/* Commercial Leaders */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Key Industry Implementations:</span>
              <div className="flex flex-wrap gap-1.5">
                {currentStage.industryLeaders.map((ldr, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 text-[10px]">
                    {ldr}
                  </span>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

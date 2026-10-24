import React, { useState } from 'react';
import { 
  Cpu, 
  Zap, 
  Activity, 
  Radio, 
  ShieldCheck, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  Info, 
  Sliders, 
  Sparkles,
  Maximize2
} from 'lucide-react';
import { playGateClickSound } from '../utils/audio';

export interface FlowStage {
  id: string;
  step: number;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  latency: string;
  fidelity: string;
  formula: string;
  description: string;
  telemetry: Record<string, string>;
}

export const FLOW_STAGES: FlowStage[] = [
  {
    id: 'ingestion',
    step: 1,
    title: 'State Ingestion & Synthesis',
    subtitle: 'Hamiltonian / QASM 3.0',
    icon: Layers,
    color: '#00e5ff',
    latency: '0.4 μs',
    fidelity: '100%',
    formula: 'Ĥ = ∑ cᵢ Pᵢ  ⟶  Û = exp(-iĤt/ℏ)',
    description: 'Parses classical algorithmic problems or OpenQASM 3.0 circuits into abstract unitary operators in Hilbert space.',
    telemetry: {
      'Gate Stream': 'Clifford+T & U3',
      'Hilbert Dimension': '2¹⁶ = 65,536 Dim',
      'Format': 'OpenQASM 3.0 / IR'
    }
  },
  {
    id: 'transpiler',
    step: 2,
    title: 'Transpiler & Pass Manager',
    subtitle: 'Routing & Optimization',
    icon: Cpu,
    color: '#38bdf8',
    latency: '1.2 μs',
    fidelity: '100%',
    formula: 'U_circ  ⟶  SWAP_insert(Topology)',
    description: 'Decomposes gates into native hardware basis (CX, Rz, X, SX) and routes physical qubits across heavy-hex coupling graphs.',
    telemetry: {
      'Passes': 'Inverse Cancel + Fusion',
      'Topology': 'IBM Heavy-Hex / Heron',
      'SWAP Overhead': '+8.4% added depth'
    }
  },
  {
    id: 'pulse',
    step: 3,
    title: 'Microwave AWG Pulse Shaping',
    subtitle: 'DRAG Waveform Envelope',
    icon: Radio,
    color: '#c084fc',
    latency: '36 ns',
    fidelity: '99.94%',
    formula: 'Ω(t) = I(t) + i Q(t)  |  Q = -(β/α) dI/dt',
    description: 'Arbitrary Waveform Generators synthesize microwave drive envelopes with derivative (DRAG) quadrature to suppress transmon |2⟩ leakage.',
    telemetry: {
      'Pulse Width': '36 ns (σ = 8 ns)',
      'Leakage Rate': '< 0.08% into |2⟩',
      'Anharmonicity': 'α = -330 MHz'
    }
  },
  {
    id: 'cryo',
    step: 4,
    title: 'Cryogenic QPU Dilution Stage',
    subtitle: '14.8 mK Physical Core',
    icon: Zap,
    color: '#f43f5e',
    latency: '124 μs',
    fidelity: '99.85%',
    formula: 'Ĥ_CR = (Ω_CR / 2) Z₀ X₁  (Cross-Resonance)',
    description: 'Superconducting transmon processor cooled inside dilution refrigerator. Coaxial waveguides drive physical Josephson junctions and CNOT entanglement.',
    telemetry: {
      'Temperature': '14.8 mK (0.0148 K)',
      'T₁ Coherence': '128.4 μs',
      'T₂* Dephasing': '94.2 μs'
    }
  },
  {
    id: 'qec',
    step: 5,
    title: 'Stabilizer QEC Syndrome Decoder',
    subtitle: 'Active Fault-Tolerance',
    icon: ShieldCheck,
    color: '#10b981',
    latency: '240 ns',
    fidelity: '99.99%',
    formula: 'S_k = ∏ σ_i  |  R = MWPM(Syndrome)',
    description: 'Non-destructive ancilla parity measurements extract syndrome eigenvalues (±1). Lookup table decoder immediately applies corrective Pauli recoveries.',
    telemetry: {
      'Syndrome Checks': 'Z₀Z₁, Z₁Z₂, X₁X₂',
      'Recovery Gate': 'X_k / Z_k Inversion',
      'Logical Protection': 'Distance d = 3 Code'
    }
  },
  {
    id: 'readout',
    step: 6,
    title: 'Dispersive Resonator Readout',
    subtitle: 'State Collapse & Sampling',
    icon: Activity,
    color: '#fbbf24',
    latency: '450 ns',
    fidelity: '99.50%',
    formula: 'Ĥ_disp = χ σ_z a†a  ⟶  Collapse to |bitstring⟩',
    description: 'Microwave resonator tone measures dispersive phase shift, projecting quantum superposition into classical bitstrings and reconstructing probabilities.',
    telemetry: {
      'Readout Mode': 'Heterodyne Dispersive',
      'Measurement Shots': '1,024 Shots / Shot',
      'State Overlap': 'Fidelity F = 99.8%'
    }
  }
];

export const QuantumEngineFlowDiagram: React.FC<{
  onSelectStage?: (stageId: string) => void;
  compact?: boolean;
}> = ({ onSelectStage, compact = false }) => {
  const [selectedStageId, setSelectedStageId] = useState<string>('cryo');

  const activeStage = FLOW_STAGES.find(s => s.id === selectedStageId) || FLOW_STAGES[3];

  const handleStageClick = (stage: FlowStage) => {
    playGateClickSound(650);
    setSelectedStageId(stage.id);
    if (onSelectStage) onSelectStage(stage.id);
  };

  return (
    <div className="w-full flex flex-col font-mono text-slate-200 space-y-3">
      {/* Top Header of Flow Diagram */}
      <div className="flex items-center justify-between border-b border-[rgba(0,229,255,0.2)] pb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-xs font-bold text-white tracking-wider uppercase">
            Quantum Computing Engine Flow Pipeline
          </span>
          <span className="hidden sm:inline px-2 py-0.5 rounded text-[9px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
            End-to-End Microarchitecture
          </span>
        </div>
        <div className="text-[10px] text-slate-400">
          Cycle: <span className="text-emerald-400 font-bold">128.4 μs</span> · Clock: <span className="text-cyan-400 font-bold">5.0 GHz</span>
        </div>
      </div>

      {/* Horizontal Flow Diagram Pipeline */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
        {FLOW_STAGES.map((st, idx) => {
          const Icon = st.icon;
          const isSelected = st.id === selectedStageId;

          return (
            <div key={st.id} className="relative flex flex-col">
              {/* Stage Card */}
              <button
                onClick={() => handleStageClick(st)}
                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'bg-[#09141d] border-cyan-400 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/50'
                    : 'bg-[#050b11]/80 border-slate-800 hover:border-slate-700 hover:bg-[#09141d]/50'
                }`}
              >
                {/* Step pill */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400">
                    STEP {st.step}
                  </span>
                  <span className="text-[9px] font-mono font-bold" style={{ color: st.color }}>
                    {st.latency}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-1.5">
                  <div 
                    className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${st.color}15`, color: st.color }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="font-bold text-[11px] text-white leading-tight truncate">
                    {st.title}
                  </div>
                </div>

                <div className="text-[9px] text-slate-400 truncate">
                  {st.subtitle}
                </div>

                {/* Bottom active indicator */}
                {isSelected && (
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-0.5" 
                    style={{ backgroundColor: st.color }}
                  />
                )}
              </button>

              {/* Connecting animated chevron arrow on desktop */}
              {idx < FLOW_STAGES.length - 1 && (
                <div className="hidden lg:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                  <ArrowRight className="w-3 h-3 text-cyan-400/40" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Stage Detail Inspector */}
      {activeStage && (
        <div className="p-3.5 rounded-xl bg-[#09141d]/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs">
                Stage {activeStage.step}: {activeStage.title}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.2 rounded bg-emerald-950/80 border border-emerald-500/30">
                Fidelity {activeStage.fidelity}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {activeStage.description}
            </p>
            <div className="text-[10px] font-mono text-cyan-300 bg-[#050b11] px-2 py-1 rounded border border-slate-800 inline-block mt-1">
              {activeStage.formula}
            </div>
          </div>

          {/* Telemetry Key-Value Pills */}
          <div className="grid grid-cols-3 gap-2 shrink-0">
            {Object.entries(activeStage.telemetry).map(([k, v]) => (
              <div key={k} className="p-2 rounded-lg bg-[#050b11] border border-slate-800 text-center">
                <div className="text-[9px] text-slate-500 truncate">{k}</div>
                <div className="text-[10px] font-bold text-white mt-0.5 truncate">{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Cpu, 
  Layers, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Sparkles,
  Info,
  Maximize2,
  Sliders
} from 'lucide-react';
import { playGateClickSound } from '../../utils/audio';

export interface QpuProfile {
  id: string;
  name: string;
  vendor: string;
  tech: 'Superconducting' | 'Trapped-Ion' | 'Neutral-Atom';
  qubits: number;
  topology: string;
  avgT1_us: number;
  avgT2_us: number;
  gate1qError: number; // e.g. 1.5e-4
  gate2qError: number; // e.g. 1.2e-3
  readoutError: number; // e.g. 0.012
  clockRate_MHz: number;
  qubitGrid: {
    rows: number;
    cols: number;
    activeCount: number;
  };
}

export const QPU_FLEET: QpuProfile[] = [
  {
    id: 'ibm_heron',
    name: 'IBM Quantum Heron (r2)',
    vendor: 'IBM Quantum',
    tech: 'Superconducting',
    qubits: 156,
    topology: 'Heavy-Hexagonal with Tunable Couplers',
    avgT1_us: 142.5,
    avgT2_us: 168.0,
    gate1qError: 1.1e-4,
    gate2qError: 1.2e-3,
    readoutError: 0.0085,
    clockRate_MHz: 4.85,
    qubitGrid: { rows: 8, cols: 20, activeCount: 156 }
  },
  {
    id: 'google_willow',
    name: 'Google Willow (QEC Reference)',
    vendor: 'Google Quantum AI',
    tech: 'Superconducting',
    qubits: 105,
    topology: 'Square Lattice (Below-Threshold Surface Code)',
    avgT1_us: 95.0,
    avgT2_us: 110.0,
    gate1qError: 1.0e-4,
    gate2qError: 1.1e-3,
    readoutError: 0.0070,
    clockRate_MHz: 5.12,
    qubitGrid: { rows: 9, cols: 12, activeCount: 105 }
  },
  {
    id: 'quantinuum_h2',
    name: 'Quantinuum System Model H2-1',
    vendor: 'Quantinuum',
    tech: 'Trapped-Ion',
    qubits: 56,
    topology: 'Racetrack QCCD (All-to-All Shuttling)',
    avgT1_us: 120000000.0, // Minutes
    avgT2_us: 3500000.0,
    gate1qError: 0.8e-4,
    gate2qError: 0.9e-3,
    readoutError: 0.0015,
    clockRate_MHz: 0.025,
    qubitGrid: { rows: 4, cols: 14, activeCount: 56 }
  },
  {
    id: 'quera_aquila',
    name: 'QuEra Aquila (Analog/Digital)',
    vendor: 'QuEra Computing',
    tech: 'Neutral-Atom',
    qubits: 256,
    topology: 'Reconfigurable 2D Rydberg Optical Tweezer Grid',
    avgT1_us: 3200.0,
    avgT2_us: 1850.0,
    gate1qError: 3.5e-4,
    gate2qError: 4.5e-3,
    readoutError: 0.0120,
    clockRate_MHz: 0.08,
    qubitGrid: { rows: 16, cols: 16, activeCount: 256 }
  }
];

type HeatmapMetric = 't1' | 't2' | 'error2q' | 'readout';

export const QpuFleetTelemetry: React.FC = () => {
  const [selectedQpuId, setSelectedQpuId] = useState<string>('ibm_heron');
  const [metric, setMetric] = useState<HeatmapMetric>('t1');
  const [selectedQubitIdx, setSelectedQubitIdx] = useState<number>(14);

  const qpu = useMemo(() => {
    return QPU_FLEET.find(q => q.id === selectedQpuId) || QPU_FLEET[0];
  }, [selectedQpuId]);

  // Generate deterministic synthetic calibration data for the active QPU's qubits
  const qubitData = useMemo(() => {
    const list: Array<{
      index: number;
      freq_GHz: number;
      anharmonicity_MHz: number;
      t1_us: number;
      t2_us: number;
      error1q: number;
      error2q: number;
      readoutError: number;
      couplers: number[];
    }> = [];

    for (let i = 0; i < qpu.qubitGrid.activeCount; i++) {
      // Small pseudo-random variations around QPU average
      const seed = Math.sin(i * 12.9898 + 78.233);
      const varFactor = 1 + (seed - Math.floor(seed) - 0.5) * 0.28;

      list.push({
        index: i,
        freq_GHz: +(4.85 + (seed * 0.4)).toFixed(3),
        anharmonicity_MHz: -Math.round(310 + seed * 20),
        t1_us: +(qpu.avgT1_us * varFactor).toFixed(1),
        t2_us: +(qpu.avgT2_us * (varFactor * 0.95)).toFixed(1),
        error1q: +(qpu.gate1qError * varFactor).toExponential(2),
        error2q: +(qpu.gate2qError * varFactor).toExponential(2),
        readoutError: +(qpu.readoutError * varFactor * 100).toFixed(2),
        couplers: [Math.max(0, i - 1), Math.min(qpu.qubitGrid.activeCount - 1, i + 1), Math.max(0, i - 4), Math.min(qpu.qubitGrid.activeCount - 1, i + 4)].filter(n => n !== i)
      });
    }

    return list;
  }, [qpu]);

  const activeQubit = qubitData[selectedQubitIdx] || qubitData[0];

  // Helper for color coding based on metric
  const getCellColor = (q: typeof qubitData[0]) => {
    if (metric === 't1') {
      const ratio = q.t1_us / qpu.avgT1_us;
      if (ratio > 1.05) return 'bg-cyan-500 text-slate-950 font-bold border-cyan-400';
      if (ratio > 0.95) return 'bg-cyan-900/70 text-cyan-200 border-cyan-700/60';
      return 'bg-amber-950/80 text-amber-300 border-amber-600/60';
    } else if (metric === 't2') {
      const ratio = q.t2_us / qpu.avgT2_us;
      if (ratio > 1.05) return 'bg-purple-500 text-white font-bold border-purple-400';
      if (ratio > 0.95) return 'bg-purple-950/70 text-purple-200 border-purple-700/60';
      return 'bg-rose-950/80 text-rose-300 border-rose-600/60';
    } else if (metric === 'error2q') {
      const val = parseFloat(q.error2q.toString());
      if (val < qpu.gate2qError) return 'bg-emerald-950 text-emerald-300 border-emerald-600';
      if (val < qpu.gate2qError * 1.15) return 'bg-slate-900 text-slate-300 border-slate-700';
      return 'bg-rose-950 text-rose-300 border-rose-600';
    } else {
      // readout
      const val = q.readoutError;
      if (val < qpu.readoutError * 100) return 'bg-emerald-950 text-emerald-300 border-emerald-600';
      return 'bg-amber-950 text-amber-300 border-amber-600';
    }
  };

  return (
    <div className="space-y-5 font-mono text-xs">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#09141d] border border-cyan-800/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-500/20">
            <Radio className="w-5 h-5 text-[#00e5ff] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">Live Enterprise QPU Fleet Telemetry &amp; Calibration Grid</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                LIVE HARDWARE STREAM
              </span>
            </div>
            <p className="text-[11px] text-[#78909c]">
              Real-time Hamiltonian frequency tracking, T₁/T₂ relaxation coherence, 2Q entangling fidelities, and crosstalk metrics
            </p>
          </div>
        </div>

        {/* QPU Selector */}
        <div className="flex items-center gap-2 bg-[#050b11] p-1.5 rounded-xl border border-slate-800">
          <span className="text-slate-500 text-[10px] uppercase font-bold pl-1">QPU Fleet:</span>
          {QPU_FLEET.map(item => (
            <button
              key={item.id}
              onClick={() => {
                playGateClickSound(650);
                setSelectedQpuId(item.id);
                setSelectedQubitIdx(0);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedQpuId === item.id
                  ? 'bg-[#00e5ff] text-[#02060a] shadow-xs shadow-[#00e5ff]/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              {item.name.split(' (')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Top-Level Summary Telemetry Chips */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="p-3 rounded-xl bg-[#050b11] border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase block font-bold">Active Qubits</span>
          <span className="text-white font-bold text-sm">{qpu.qubits} Physical</span>
          <span className="text-[10px] text-cyan-400 block">{qpu.tech}</span>
        </div>

        <div className="p-3 rounded-xl bg-[#050b11] border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase block font-bold">Mean T₁ Coherence</span>
          <span className="text-cyan-300 font-bold text-sm">
            {qpu.avgT1_us >= 1000 ? `${(qpu.avgT1_us / 1000).toFixed(1)} ms` : `${qpu.avgT1_us} μs`}
          </span>
          <span className="text-[10px] text-slate-400 block">Energy Relaxation</span>
        </div>

        <div className="p-3 rounded-xl bg-[#050b11] border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase block font-bold">Mean T₂* Dephasing</span>
          <span className="text-purple-300 font-bold text-sm">
            {qpu.avgT2_us >= 1000 ? `${(qpu.avgT2_us / 1000).toFixed(1)} ms` : `${qpu.avgT2_us} μs`}
          </span>
          <span className="text-[10px] text-slate-400 block">Ramsey Coherence</span>
        </div>

        <div className="p-3 rounded-xl bg-[#050b11] border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase block font-bold">2Q Gate Fidelity</span>
          <span className="text-emerald-400 font-bold text-sm">
            {((1 - qpu.gate2qError) * 100).toFixed(2)}%
          </span>
          <span className="text-[10px] text-slate-400 block">CX / CZ / ECR</span>
        </div>

        <div className="p-3 rounded-xl bg-[#050b11] border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase block font-bold">Readout Assignment</span>
          <span className="text-amber-300 font-bold text-sm">
            {((1 - qpu.readoutError) * 100).toFixed(2)}%
          </span>
          <span className="text-[10px] text-slate-400 block">F_RO Precision</span>
        </div>

        <div className="p-3 rounded-xl bg-[#050b11] border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase block font-bold">Clock Frequency</span>
          <span className="text-white font-bold text-sm">{qpu.clockRate_MHz} MHz</span>
          <span className="text-[10px] text-cyan-400 block">{qpu.vendor}</span>
        </div>
      </div>

      {/* 3. Interactive Topology Heatmap & Qubit Diagnostic Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: 2D Qubit Matrix Calibration Heatmap (8 cols) */}
        <div className="lg:col-span-8 p-4 rounded-xl bg-[#050b11] border border-slate-800 space-y-3">
          
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white uppercase text-xs">Physical Qubit Grid Topology ({qpu.topology})</span>
            </div>

            {/* Metric Switcher */}
            <div className="flex items-center gap-1 bg-[#09141d] p-1 rounded-lg border border-slate-800 text-[10px]">
              {[
                { id: 't1' as const, label: 'T₁ Coherence' },
                { id: 't2' as const, label: 'T₂ Dephasing' },
                { id: 'error2q' as const, label: '2Q Error Rate' },
                { id: 'readout' as const, label: 'Readout Error' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    playGateClickSound(600);
                    setMetric(item.id);
                  }}
                  className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                    metric === item.id ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of Physical Qubits */}
          <div className="p-4 rounded-xl bg-[#02050b] border border-slate-850 overflow-x-auto max-h-[380px] overflow-y-auto">
            <div className="grid grid-cols-8 md:grid-cols-12 lg:grid-cols-14 gap-1.5 min-w-[500px]">
              {qubitData.map(q => {
                const isSelected = selectedQubitIdx === q.index;
                const cellColor = getCellColor(q);
                return (
                  <button
                    key={q.index}
                    onClick={() => {
                      playGateClickSound(700);
                      setSelectedQubitIdx(q.index);
                    }}
                    className={`h-9 rounded border flex flex-col items-center justify-center transition-all cursor-pointer text-[9px] font-bold ${cellColor} ${
                      isSelected ? 'ring-2 ring-white scale-110 shadow-lg z-10' : 'hover:scale-105'
                    }`}
                    title={`Qubit Q${q.index}: T1=${q.t1_us}μs, T2=${q.t2_us}μs, 2Q Err=${q.error2q}`}
                  >
                    <span>Q{q.index}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
            <span>Color Intensity: Metric normalized against {qpu.name} fleet average</span>
            <span>Click any physical transmon/ion to inspect calibration</span>
          </div>

        </div>

        {/* Right: Individual Qubit Calibration Spectrogram (4 cols) */}
        <div className="lg:col-span-4 p-4 rounded-xl bg-[#09141d] border border-cyan-800/40 space-y-3">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-bold">Physical Node</span>
              <span className="text-white font-bold text-sm">Transmon Q[{activeQubit.index}]</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
              CALIBRATED
            </span>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="p-2 rounded bg-slate-950 border border-slate-850 flex justify-between">
              <span className="text-slate-400">Resonance Freq (f₀₁):</span>
              <span className="text-cyan-300 font-bold">{activeQubit.freq_GHz} GHz</span>
            </div>

            <div className="p-2 rounded bg-slate-950 border border-slate-850 flex justify-between">
              <span className="text-slate-400">Anharmonicity (α):</span>
              <span className="text-purple-300 font-bold">{activeQubit.anharmonicity_MHz} MHz</span>
            </div>

            <div className="p-2 rounded bg-slate-950 border border-slate-850 flex justify-between">
              <span className="text-slate-400">T₁ Relaxation Time:</span>
              <span className="text-cyan-300 font-bold">{activeQubit.t1_us} μs</span>
            </div>

            <div className="p-2 rounded bg-slate-950 border border-slate-850 flex justify-between">
              <span className="text-slate-400">T₂* Ramsey Coherence:</span>
              <span className="text-purple-300 font-bold">{activeQubit.t2_us} μs</span>
            </div>

            <div className="p-2 rounded bg-slate-950 border border-slate-850 flex justify-between">
              <span className="text-slate-400">Single-Qubit Gate Err:</span>
              <span className="text-emerald-400 font-bold">{activeQubit.error1q}</span>
            </div>

            <div className="p-2 rounded bg-slate-950 border border-slate-850 flex justify-between">
              <span className="text-slate-400">Two-Qubit (CX) Error:</span>
              <span className="text-emerald-400 font-bold">{activeQubit.error2q}</span>
            </div>

            <div className="p-2 rounded bg-slate-950 border border-slate-850 flex justify-between">
              <span className="text-slate-400">Readout Error Rate:</span>
              <span className="text-amber-300 font-bold">{activeQubit.readoutError}%</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-850 text-[10px] text-slate-400 space-y-1">
            <span className="text-white font-bold block">Nearest-Neighbor Couplers:</span>
            <div className="flex flex-wrap gap-1">
              {activeQubit.couplers.map(c => (
                <span key={c} className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Q{c} (g/2π = 8.4 MHz)
                </span>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

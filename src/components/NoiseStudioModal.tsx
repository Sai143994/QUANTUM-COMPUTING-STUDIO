import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Flame, 
  ShieldAlert, 
  ShieldCheck, 
  TrendingDown, 
  X, 
  Sliders, 
  Sparkles, 
  Copy, 
  Check, 
  Zap, 
  Cpu, 
  Thermometer, 
  Layers, 
  Info,
  ChevronRight
} from 'lucide-react';
import { GateOp, NoiseChannel, QuantumState } from '../types/quantum';
import { useToast } from '../context/ToastContext';

interface HardwareProfile {
  id: string;
  name: string;
  vendor: string;
  architecture: string;
  t1Us: number;
  t2Us: number;
  gate1qErrorPct: number;
  gate2qErrorPct: number;
  readoutErrorPct: number;
  gateTime1qNs: number;
  gateTime2qNs: number;
  tempMilliKelvin: number;
}

const HARDWARE_PROFILES: HardwareProfile[] = [
  {
    id: 'ibm_heron',
    name: 'IBM Heron (133Q)',
    vendor: 'IBM Quantum',
    architecture: 'Superconducting Transmon (Tunable Coupler)',
    t1Us: 280,
    t2Us: 160,
    gate1qErrorPct: 0.015,
    gate2qErrorPct: 0.45,
    readoutErrorPct: 0.85,
    gateTime1qNs: 20,
    gateTime2qNs: 220,
    tempMilliKelvin: 15
  },
  {
    id: 'google_sycamore',
    name: 'Google Sycamore (53Q)',
    vendor: 'Google Quantum AI',
    architecture: 'Superconducting Transmon (Grid)',
    t1Us: 32,
    t2Us: 24,
    gate1qErrorPct: 0.05,
    gate2qErrorPct: 0.62,
    readoutErrorPct: 1.6,
    gateTime1qNs: 25,
    gateTime2qNs: 40,
    tempMilliKelvin: 18
  },
  {
    id: 'ionq_forte',
    name: 'IonQ Forte (32Q)',
    vendor: 'IonQ',
    architecture: 'Trapped Ytterbium Ions (All-to-All)',
    t1Us: 10000000, // 10 seconds
    t2Us: 1000000,   // 1 second
    gate1qErrorPct: 0.02,
    gate2qErrorPct: 0.38,
    readoutErrorPct: 0.40,
    gateTime1qNs: 10000,
    gateTime2qNs: 180000,
    tempMilliKelvin: 300000 // Room temperature vacuum trap
  },
  {
    id: 'rigetti_ankaa',
    name: 'Rigetti Ankaa-9Q',
    vendor: 'Rigetti Computing',
    architecture: 'Superconducting Transmon (Square Octagon)',
    t1Us: 28,
    t2Us: 20,
    gate1qErrorPct: 0.09,
    gate2qErrorPct: 1.85,
    readoutErrorPct: 2.9,
    gateTime1qNs: 35,
    gateTime2qNs: 180,
    tempMilliKelvin: 12
  }
];

interface NoiseStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  circuit: GateOp[];
  numQubits: number;
  qstate: QuantumState | null;
  noiseRate: number;
  setNoiseRate: (rate: number) => void;
  noiseModel: NoiseChannel;
  setNoiseModel: (model: NoiseChannel) => void;
}

export const NoiseStudioModal: React.FC<NoiseStudioModalProps> = ({
  isOpen,
  onClose,
  circuit,
  numQubits,
  qstate,
  noiseRate,
  setNoiseRate,
  noiseModel,
  setNoiseModel
}) => {
  const { showToast } = useToast();
  const [selectedHwId, setSelectedHwId] = useState<string>('ibm_heron');
  const [enableZne, setEnableZne] = useState<boolean>(true);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Custom hardware overrides
  const selectedHw = useMemo(() => {
    return HARDWARE_PROFILES.find(h => h.id === selectedHwId) || HARDWARE_PROFILES[0];
  }, [selectedHwId]);

  const [t1Override, setT1Override] = useState<number>(selectedHw.t1Us);
  const [t2Override, setT2Override] = useState<number>(selectedHw.t2Us);
  const [gate2qErrorOverride, setGate2qErrorOverride] = useState<number>(selectedHw.gate2qErrorPct);

  // Sync when profile changes
  const handleSelectHw = (hw: HardwareProfile) => {
    setSelectedHwId(hw.id);
    setT1Override(hw.t1Us);
    setT2Override(hw.t2Us);
    setGate2qErrorOverride(hw.gate2qErrorPct);
  };

  // Analyze circuit breakdown
  const stats = useMemo(() => {
    let single1q = 0;
    let multi2q = 0;
    circuit.forEach(g => {
      if (g.control !== undefined || g.q1 !== undefined || g.c1 !== undefined) multi2q++;
      else if (g.qubit !== undefined && g.type !== 'M') single1q++;
    });

    const totalDurationNs = single1q * selectedHw.gateTime1qNs + multi2q * selectedHw.gateTime2qNs;
    const durationUs = totalDurationNs / 1000;

    // Decay retention factor
    const decayT1 = Math.exp(-durationUs / Math.max(1, t1Override));
    const decayT2 = Math.exp(-durationUs / Math.max(1, t2Override));
    const gateInfidelity = Math.pow(1 - selectedHw.gate1qErrorPct / 100, single1q) *
                           Math.pow(1 - gate2qErrorOverride / 100, multi2q);

    // Raw physical state fidelity
    const rawFidelity = Math.max(0.01, decayT1 * decayT2 * gateInfidelity);

    // Zero-Noise Extrapolation (ZNE) with Richardson Extrapolation
    // Scale factor lambda = 1 (raw), lambda = 3 (3x folded), lambda = 5 (5x folded)
    const y1 = rawFidelity;
    const y3 = Math.max(0.005, Math.pow(y1, 2.7));
    const y5 = Math.max(0.001, Math.pow(y1, 4.4));

    // Richardson extrapolation polynomial fit to lambda = 0:
    // f(0) = (15*y1 - 10*y3 + 3*y5) / 8
    const zneMitigatedFidelity = Math.min(0.999, Math.max(rawFidelity, (15 * y1 - 10 * y3 + 3 * y5) / 8));

    return {
      single1q,
      multi2q,
      totalDurationNs,
      durationUs,
      decayT1,
      decayT2,
      rawFidelity,
      zneMitigatedFidelity,
      y1,
      y3,
      y5
    };
  }, [circuit, selectedHw, t1Override, t2Override, gate2qErrorOverride]);

  // Compute depth decay curve points for SVG visualization
  const decayCurvePoints = useMemo(() => {
    const points: Array<{ step: number; rawF: number; zneF: number }> = [];
    const maxSteps = Math.max(12, circuit.length > 0 ? Math.max(...circuit.map(g => g.step)) + 4 : 12);

    for (let s = 0; s <= maxSteps; s++) {
      const gatesUpToStep = circuit.filter(g => g.step <= s);
      let s1 = 0;
      let s2 = 0;
      gatesUpToStep.forEach(g => {
        if (g.control !== undefined || g.q1 !== undefined || g.c1 !== undefined) s2++;
        else if (g.qubit !== undefined && g.type !== 'M') s1++;
      });
      const durUs = (s1 * selectedHw.gateTime1qNs + s2 * selectedHw.gateTime2qNs) / 1000;
      const f1 = Math.exp(-durUs / Math.max(1, t1Override)) * 
                 Math.exp(-durUs / Math.max(1, t2Override)) * 
                 Math.pow(1 - selectedHw.gate1qErrorPct / 100, s1) * 
                 Math.pow(1 - gate2qErrorOverride / 100, s2);

      const y1 = Math.max(0.01, f1);
      const y3 = Math.max(0.005, Math.pow(y1, 2.7));
      const y5 = Math.max(0.001, Math.pow(y1, 4.4));
      const zne = Math.min(1.0, Math.max(y1, (15 * y1 - 10 * y3 + 3 * y5) / 8));

      points.push({ step: s, rawF: y1, zneF: zne });
    }
    return points;
  }, [circuit, selectedHw, t1Override, t2Override, gate2qErrorOverride]);

  const maxStepVal = decayCurvePoints.length > 0 ? decayCurvePoints[decayCurvePoints.length - 1].step : 10;
  const currentCircuitDepth = circuit.length > 0 ? Math.max(...circuit.map(g => g.step)) : 0;

  // Generate python calibration snippet
  const pythonCalibrationSnippet = useMemo(() => {
    return `# Quantum Studio — Calibrated Hardware Decoherence Model
from quantum_studio.core.noise import NoiseModel
from quantum_studio.core.circuit import QuantumCircuit

# Physical Hardware Profile: ${selectedHw.name}
noise = NoiseModel()
noise.t1_us = ${t1Override.toFixed(1)}       # Relaxation time T1
noise.t2_us = ${t2Override.toFixed(1)}       # Dephasing time T2
noise.p_1q = ${(selectedHw.gate1qErrorPct / 100).toFixed(4)}    # 1Q error rate
noise.p_2q = ${(gate2qErrorOverride / 100).toFixed(4)}    # 2Q error rate

# Execute circuit with physical stochastic Kraus channel
qc = QuantumCircuit(${numQubits})
# ... add circuit gates ...
state_noisy = qc.run(noise_model=noise)
print("Noisy Expectation ⟨Z0⟩:", state_noisy.expectation_z(0))
`;
  }, [selectedHw, t1Override, t2Override, gate2qErrorOverride, numQubits]);

  const handleCopyPython = () => {
    navigator.clipboard.writeText(pythonCalibrationSnippet);
    setCopiedCode(true);
    showToast('Calibration Exported', 'success', 'Python hardware noise calibration code copied!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#09141d] border border-[rgba(0,229,255,0.3)] rounded-2xl max-w-4xl w-full p-6 shadow-2xl font-mono flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[rgba(0,229,255,0.15)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-950/80 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-sm shadow-rose-500/20">
              <Activity className="w-5 h-5 text-rose-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base tracking-tight">
                  Decoherence Lab &amp; Physical QPU Noise Studio
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-950 text-rose-300 border border-rose-500/30">
                  NISQ Hardware Telemetry
                </span>
              </div>
              <p className="text-xs text-[#78909c]">
                Continuous $T_1$ relaxation, $T_2^*$ dephasing, Kraus channel noise &amp; Zero-Noise Extrapolation (ZNE)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#78909c] hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-5 py-4 pr-1">
          {/* Hardware Modality Preset Selector */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-[#78909c] font-semibold flex items-center gap-1.5 mb-2.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              Physical QPU Hardware Calibration Target
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {HARDWARE_PROFILES.map(hw => {
                const isSelected = hw.id === selectedHwId;
                return (
                  <button
                    key={hw.id}
                    onClick={() => handleSelectHw(hw)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-md shadow-cyan-500/10'
                        : 'bg-[#050b11] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs font-bold truncate flex items-center justify-between">
                      <span className={isSelected ? 'text-cyan-300' : 'text-slate-300'}>{hw.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 truncate">{hw.vendor}</div>
                    <div className="mt-2 space-y-0.5 text-[10px] text-slate-400 font-mono">
                      <div>T₁: <span className="text-slate-200">{hw.t1Us >= 1000 ? `${hw.t1Us / 1000} ms` : `${hw.t1Us} μs`}</span></div>
                      <div>T₂*: <span className="text-slate-200">{hw.t2Us >= 1000 ? `${hw.t2Us / 1000} ms` : `${hw.t2Us} μs`}</span></div>
                      <div>2Q Error: <span className="text-rose-400">{hw.gate2qErrorPct}%</span></div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Physical Tuning Sliders */}
          <div className="p-4 rounded-xl bg-[#050b11] border border-[rgba(0,229,255,0.15)] space-y-3">
            <div className="text-xs font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Live Calibration Overrides for {selectedHw.name}
              </span>
              <span className="text-[10px] text-[#78909c]">
                Temp: {selectedHw.tempMilliKelvin < 1000 ? `${selectedHw.tempMilliKelvin} mK` : '300 K'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              {/* T1 */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Relaxation Time T₁:</span>
                  <span className="text-cyan-300 font-bold">{t1Override.toFixed(0)} μs</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="5"
                  value={t1Override}
                  onChange={e => setT1Override(+e.target.value)}
                  className="w-full h-1 bg-slate-800 accent-cyan-400 rounded cursor-pointer"
                />
              </div>

              {/* T2 */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Dephasing Time T₂*:</span>
                  <span className="text-amber-300 font-bold">{t2Override.toFixed(0)} μs</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="500"
                  step="5"
                  value={t2Override}
                  onChange={e => setT2Override(+e.target.value)}
                  className="w-full h-1 bg-slate-800 accent-amber-400 rounded cursor-pointer"
                />
              </div>

              {/* 2Q Gate Error */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">2-Qubit Gate Error:</span>
                  <span className="text-rose-400 font-bold">{gate2qErrorOverride.toFixed(2)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="5.0"
                  step="0.05"
                  value={gate2qErrorOverride}
                  onChange={e => setGate2qErrorOverride(+e.target.value)}
                  className="w-full h-1 bg-slate-800 accent-rose-400 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Interactive SVG Fidelity vs Depth Degradation Curve */}
          <div className="p-4 rounded-xl bg-[#050b11] border border-[rgba(0,229,255,0.15)] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                  State Fidelity Degradation Curve vs. Circuit Depth
                </span>
                <p className="text-[11px] text-[#78909c]">
                  Physical exponential decay F(t) = exp(-t/T₁) · exp(-t/T₂) · ∏(1-ε)
                </p>
              </div>

              {/* ZNE Toggle */}
              <label className="flex items-center gap-2 text-xs font-semibold text-cyan-300 cursor-pointer bg-cyan-950/50 border border-cyan-500/30 px-2.5 py-1 rounded-lg hover:bg-cyan-900/40 transition-colors">
                <input
                  type="checkbox"
                  checked={enableZne}
                  onChange={e => setEnableZne(e.target.checked)}
                  className="rounded text-cyan-500 focus:ring-0 cursor-pointer"
                />
                <span>ZNE Error Mitigation</span>
              </label>
            </div>

            {/* SVG Plot */}
            <div className="relative h-44 w-full bg-[#03060a] border border-slate-800 rounded-lg p-3 flex flex-col justify-end">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
                {/* Horizontal reference grid lines */}
                <line x1="0" y1="0" x2="500" y2="0" stroke="#1e293b" strokeDasharray="3,3" />
                <line x1="0" y1="60" x2="500" y2="60" stroke="#1e293b" strokeDasharray="3,3" />
                <line x1="0" y1="120" x2="500" y2="120" stroke="#334155" />

                {/* 50% Threshold line */}
                <line x1="0" y1="60" x2="500" y2="60" stroke="#f43f5e" strokeWidth="1" strokeDasharray="4,4" opacity="0.4" />
                <text x="6" y="55" fill="#f43f5e" fontSize="9" opacity="0.7">50% Quantum Threshold</text>

                {/* Raw physical decay curve */}
                <polyline
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="2.5"
                  points={decayCurvePoints.map(p => {
                    const x = (p.step / maxStepVal) * 500;
                    const y = (1 - p.rawF) * 120;
                    return `${x},${y}`;
                  }).join(' ')}
                />

                {/* ZNE Mitigated curve */}
                {enableZne && (
                  <polyline
                    fill="none"
                    stroke="#00e5ff"
                    strokeWidth="2"
                    strokeDasharray="4,2"
                    points={decayCurvePoints.map(p => {
                      const x = (p.step / maxStepVal) * 500;
                      const y = (1 - p.zneF) * 120;
                      return `${x},${y}`;
                    }).join(' ')}
                  />
                )}

                {/* Marker at current circuit depth */}
                {currentCircuitDepth <= maxStepVal && (
                  <g>
                    <line
                      x1={(currentCircuitDepth / maxStepVal) * 500}
                      y1="0"
                      x2={(currentCircuitDepth / maxStepVal) * 500}
                      y2="120"
                      stroke="#38bdf8"
                      strokeWidth="1.5"
                      strokeDasharray="2,2"
                    />
                    <circle
                      cx={(currentCircuitDepth / maxStepVal) * 500}
                      cy={(1 - stats.rawFidelity) * 120}
                      r="4.5"
                      fill="#f43f5e"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    {enableZne && (
                      <circle
                        cx={(currentCircuitDepth / maxStepVal) * 500}
                        cy={(1 - stats.zneMitigatedFidelity) * 120}
                        r="4.5"
                        fill="#00e5ff"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    )}
                  </g>
                )}
              </svg>

              {/* Legends */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800/80 mt-1">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-rose-400">
                    <span className="w-2.5 h-0.5 bg-rose-500 rounded" />
                    Raw Physical Decay (F = {(stats.rawFidelity * 100).toFixed(1)}%)
                  </span>
                  {enableZne && (
                    <span className="flex items-center gap-1 text-cyan-300">
                      <span className="w-2.5 h-0.5 bg-cyan-400 rounded border-dashed" />
                      ZNE Extrapolated (F = {(stats.zneMitigatedFidelity * 100).toFixed(1)}%)
                    </span>
                  )}
                </div>
                <span className="text-slate-500">
                  Current Depth: Step {currentCircuitDepth} / {maxStepVal}
                </span>
              </div>
            </div>
          </div>

          {/* Telemetry Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-[#050b11] border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Circuit Runtime</span>
              <div className="text-white font-bold text-sm mt-0.5">
                {stats.totalDurationNs < 1000 ? `${stats.totalDurationNs} ns` : `${(stats.totalDurationNs / 1000).toFixed(2)} μs`}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {stats.single1q}x 1Q + {stats.multi2q}x 2Q gates
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#050b11] border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">T₁ Relaxation Ret.</span>
              <div className="text-cyan-400 font-bold text-sm mt-0.5">
                {(stats.decayT1 * 100).toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Energy loss damping
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#050b11] border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">T₂* Dephasing Ret.</span>
              <div className="text-amber-400 font-bold text-sm mt-0.5">
                {(stats.decayT2 * 100).toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Phase coherence loss
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#050b11] border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Error Mitigation Gain</span>
              <div className="text-emerald-400 font-bold text-sm mt-0.5">
                {enableZne ? `+${((stats.zneMitigatedFidelity - stats.rawFidelity) * 100).toFixed(1)}%` : 'Disabled'}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                ZNE Richardson Extrapolation
              </div>
            </div>
          </div>

          {/* Python Code Export Box */}
          <div className="p-3.5 rounded-xl bg-[#03060a] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                Export Hardware Noise Calibration to Python SDK
              </span>
              <button
                onClick={handleCopyPython}
                className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 hover:bg-cyan-900 border border-cyan-500/30 text-[11px] flex items-center gap-1 font-semibold transition-colors cursor-pointer"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="text-[10px] font-mono text-cyan-200/80 bg-slate-950 p-2.5 rounded border border-slate-900 overflow-x-auto">
              {pythonCalibrationSnippet}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[rgba(0,229,255,0.15)] flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Hardware model active: {selectedHw.name} ({stats.rawFidelity >= 0.5 ? 'Viable' : 'Noise-Limited'})</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            Apply to Canvas &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};

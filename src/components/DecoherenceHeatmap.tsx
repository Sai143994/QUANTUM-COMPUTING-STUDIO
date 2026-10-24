import React, { useState, useMemo } from 'react';
import { QuantumState, GateOp, NoiseChannel } from '../types/quantum';
import { 
  Activity, 
  Flame, 
  ShieldAlert, 
  Gauge, 
  Sliders, 
  Sparkles, 
  Info, 
  Thermometer, 
  Layers, 
  RefreshCw,
  TrendingDown,
  AlertTriangle,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface DecoherenceHeatmapProps {
  numQubits: number;
  qstate: QuantumState | null;
  circuit: GateOp[];
  noiseRate: number; // 0 - 100 (%)
  noiseModel: NoiseChannel;
  simStep?: number;
}

export interface QubitDecoherenceProfile {
  qubit: number;
  t1Us: number;          // T1 relaxation time in microseconds
  t2Us: number;          // T2 dephasing time in microseconds
  gamma1Khz: number;     // 1/T1 decay rate in kHz
  gamma2Khz: number;     // 1/T2 decoherence rate in kHz
  singleGateCount: number;
  twoQubitGateCount: number;
  totalDepth: number;
  executionTimeNs: number;
  blochRadius: number;   // |r| from statevector
  blochShrinkage: number;// 1 - |r|
  purity: number;        // (1 + r^2) / 2
  gateDecoherence: number;
  thermalDecoherence: number;
  dephasingDecoherence: number;
  totalInfidelity: number;// 1 - F
  fidelity: number;      // F (%)
  status: 'optimal' | 'moderate' | 'degraded' | 'critical';
}

export const DecoherenceHeatmap: React.FC<DecoherenceHeatmapProps> = ({
  numQubits,
  qstate,
  circuit,
  noiseRate,
  noiseModel,
  simStep = 0
}) => {
  // View mode
  const [viewMode, setViewMode] = useState<'matrix' | 'temporal' | 'decomposition'>('matrix');
  const [selectedQubit, setSelectedQubit] = useState<number>(0);
  
  // Local environment adjustment parameters
  const [envTempMilliKelvin, setEnvTempMilliKelvin] = useState<number>(15); // standard 15 mK dilution fridge
  const [customDephasingBaseUs, setCustomDephasingBaseUs] = useState<number>(90); // 90 us base T2

  // Distinct hardware characteristics per physical qubit (simulating realistic transmon wafer non-uniformity)
  const hardwareBaselines = useMemo(() => {
    // Deterministic pseudo-random variation per qubit index
    const baselines: Array<{ t1Base: number; t2Base: number; gateErr1q: number; gateErr2q: number }> = [];
    for (let q = 0; q < 8; q++) {
      const variation = Math.sin((q + 1) * 3.7) * 0.18; // +/- 18% variance
      baselines.push({
        t1Base: Math.round(110 * (1 + variation)),
        t2Base: Math.round(customDephasingBaseUs * (1 - variation * 0.8)),
        gateErr1q: 0.0008 * (1 + Math.abs(variation)),
        gateErr2q: 0.0075 * (1 + Math.abs(variation) * 1.5)
      });
    }
    return baselines;
  }, [customDephasingBaseUs]);

  // Compute profile for every register qubit
  const profiles: QubitDecoherenceProfile[] = useMemo(() => {
    // Parse circuit gates applied to each qubit
    const maxStep = circuit.length > 0 ? Math.max(...circuit.map(g => g.step)) : 0;
    const activeCircuit = simStep > 0 ? circuit.filter(g => g.step < simStep) : circuit;

    return Array.from({ length: numQubits }, (_, q) => {
      const hw = hardwareBaselines[q % hardwareBaselines.length];
      
      // Temperature impact: dilution fridge warming degrades T1
      const tempFactor = envTempMilliKelvin <= 20 ? 1.0 : Math.max(0.2, 1.0 - (envTempMilliKelvin - 20) * 0.008);
      const effectiveT1 = Math.max(10, hw.t1Base * tempFactor);
      
      // Noise setting injection
      const noiseMultiplier = 1.0 + (noiseRate / 100) * 12.0;
      const effectiveT2 = Math.max(5, (hw.t2Base * tempFactor) / noiseMultiplier);

      const gamma1 = (1 / (effectiveT1 * 1e-6)) / 1000; // in kHz
      const gamma2 = (1 / (effectiveT2 * 1e-6)) / 1000; // in kHz

      // Count gates on this qubit
      let singleCount = 0;
      let twoQubitCount = 0;

      activeCircuit.forEach(g => {
        const isSingle = g.qubit === q;
        const isTwo = g.control === q || g.target === q || g.q1 === q || g.q2 === q || g.c1 === q || g.c2 === q;
        if (isSingle) singleCount++;
        if (isTwo) twoQubitCount++;
      });

      const totalDepth = singleCount + twoQubitCount;
      // 25 ns single-qubit, 200 ns two-qubit gate duration
      const executionTimeNs = singleCount * 25 + twoQubitCount * 200;

      // Extract Bloch vector & purity from current statevector
      let r = 1.0;
      if (qstate) {
        const bv = qstate.blochVector(q);
        r = Math.min(1.0, Math.sqrt(bv.x * bv.x + bv.y * bv.y + bv.z * bv.z));
      }

      const shrinkage = Math.max(0, 1.0 - r);
      const purity = (1.0 + r * r) / 2;

      // Decoherence channels
      const tExecSec = executionTimeNs * 1e-9;
      // T1 thermal relaxation loss
      const thermalLoss = 1.0 - Math.exp(-tExecSec / (effectiveT1 * 1e-6));
      // Pure dephasing loss
      const dephasingLoss = 1.0 - Math.exp(-tExecSec / (effectiveT2 * 1e-6));
      // Accumulative physical gate error loss
      const gateLoss = 1.0 - Math.pow(1 - hw.gateErr1q, singleCount) * Math.pow(1 - hw.gateErr2q, twoQubitCount);

      // Model-specific weight
      let modelWeight = 1.0;
      if (noiseModel === 'dephasing' || noiseModel === 'phaseflip') modelWeight = 1.25;
      else if (noiseModel === 'amplitude_damping') modelWeight = 1.35;
      else if (noiseModel === 'depolarizing') modelWeight = 1.15;

      const noiseExtra = (noiseRate / 100) * 0.45 * modelWeight;

      // Total infidelity
      const totalInfidelity = Math.min(0.999, Math.max(0.0005, (thermalLoss * 0.35 + dephasingLoss * 0.45 + gateLoss * 0.5 + shrinkage * 0.2 + noiseExtra)));
      const fidelity = Math.max(0.1, (1.0 - totalInfidelity) * 100);

      let status: QubitDecoherenceProfile['status'] = 'optimal';
      if (fidelity < 75) status = 'critical';
      else if (fidelity < 88) status = 'degraded';
      else if (fidelity < 96) status = 'moderate';

      return {
        qubit: q,
        t1Us: Math.round(effectiveT1),
        t2Us: Math.round(effectiveT2),
        gamma1Khz: Math.round(gamma1),
        gamma2Khz: Math.round(gamma2),
        singleGateCount: singleCount,
        twoQubitGateCount: twoQubitCount,
        totalDepth,
        executionTimeNs,
        blochRadius: r,
        blochShrinkage: shrinkage,
        purity,
        gateDecoherence: gateLoss,
        thermalDecoherence: thermalLoss,
        dephasingDecoherence: dephasingLoss,
        totalInfidelity,
        fidelity,
        status
      };
    });
  }, [numQubits, qstate, circuit, noiseRate, noiseModel, simStep, envTempMilliKelvin, hardwareBaselines]);

  // Register-wide aggregates
  const avgFidelity = useMemo(() => {
    if (profiles.length === 0) return 100;
    return profiles.reduce((sum, p) => sum + p.fidelity, 0) / profiles.length;
  }, [profiles]);

  const bottleneckQubit = useMemo<QubitDecoherenceProfile | null>(() => {
    if (profiles.length === 0) return null;
    return profiles.reduce((worst, p) => p.fidelity < worst.fidelity ? p : worst, profiles[0]);
  }, [profiles]);

  // Color helper for fidelity / decoherence rates
  const getFidelityColor = (fid: number) => {
    if (fid >= 97) return { text: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', fill: '#10b981' };
    if (fid >= 92) return { text: 'text-cyan-400', bg: 'bg-cyan-500/15', border: 'border-cyan-500/30', fill: '#06b6d4' };
    if (fid >= 84) return { text: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30', fill: '#f59e0b' };
    if (fid >= 70) return { text: 'text-orange-400', bg: 'bg-orange-500/15', border: 'border-orange-500/30', fill: '#f97316' };
    return { text: 'text-rose-400', bg: 'bg-rose-500/15', border: 'border-rose-500/30', fill: '#f43f5e' };
  };

  const getHeatmapColor = (infidelityRate: number) => {
    // 0 -> emerald (cool/coherent), 0.1 -> cyan, 0.25 -> amber, 0.5 -> orange, 1.0 -> rose
    const p = Math.min(1.0, Math.max(0, infidelityRate));
    if (p < 0.03) return 'bg-emerald-950/70 text-emerald-300 border-emerald-800/40';
    if (p < 0.08) return 'bg-cyan-950/70 text-cyan-300 border-cyan-800/40';
    if (p < 0.18) return 'bg-amber-950/70 text-amber-300 border-amber-800/40';
    if (p < 0.35) return 'bg-orange-950/70 text-orange-300 border-orange-800/40';
    return 'bg-rose-950/80 text-rose-300 border-rose-800/50';
  };

  // Compute temporal steps matrix (qubit vs step)
  const maxCircuitStep = useMemo(() => {
    if (circuit.length === 0) return 4;
    return Math.max(4, Math.max(...circuit.map(g => g.step)) + 1);
  }, [circuit]);

  const stepColumns = useMemo(() => {
    return Array.from({ length: Math.min(12, maxCircuitStep) }, (_, i) => i);
  }, [maxCircuitStep]);

  const currentFocus = profiles[selectedQubit] || profiles[0];

  return (
    <div className="flex flex-col h-full bg-[#06080e] overflow-hidden text-slate-200">
      {/* Top Telemetry Summary Bar */}
      <div className="px-4 py-2 border-b border-slate-800/80 bg-slate-900/50 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-mono">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Mean Register Fidelity:</span>
            <span className={`font-bold ${getFidelityColor(avgFidelity).text}`}>
              {avgFidelity.toFixed(2)}%
            </span>
          </div>

          {bottleneckQubit && (
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400 border-l border-slate-800 pl-3">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Bottleneck:</span>
              <span className="font-semibold text-amber-300">q[{bottleneckQubit.qubit}]</span>
              <span className="text-slate-500">({bottleneckQubit.fidelity.toFixed(1)}% F)</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400 border-l border-slate-800 pl-3">
            <Thermometer className="w-3.5 h-3.5 text-cyan-300" />
            <span>Cryostat:</span>
            <span className="text-cyan-200 font-medium">{envTempMilliKelvin} mK</span>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 font-mono text-xs">
          <button
            onClick={() => setViewMode('matrix')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
              viewMode === 'matrix'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Gauge className="w-3 h-3" />
            <span>Registers Grid</span>
          </button>

          <button
            onClick={() => setViewMode('temporal')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
              viewMode === 'temporal'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Time-Step Decay</span>
          </button>

          <button
            onClick={() => setViewMode('decomposition')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
              viewMode === 'decomposition'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Flame className="w-3 h-3" />
            <span>Loss Decomposition</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Side: Heatmap View */}
        <div className="lg:col-span-8 p-3 overflow-y-auto space-y-3 border-b lg:border-b-0 lg:border-r border-slate-800/80">
          {viewMode === 'matrix' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-400 text-[11px]">
                  Real-time decoherence matrix across {numQubits} quantum registers (click row for deep diagnostics):
                </span>
                <span className="font-mono text-[10px] text-slate-500">
                  Model: {noiseModel} ({noiseRate}% noise)
                </span>
              </div>

              {/* Matrix Table */}
              <div className="overflow-x-auto border border-slate-800 rounded-lg bg-slate-950/60">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800/90 text-slate-400 text-left bg-slate-900/40 text-[11px]">
                      <th className="py-2 px-3">Register</th>
                      <th className="py-2 px-3 text-right">T₁ (Relax)</th>
                      <th className="py-2 px-3 text-right">T₂ (Dephase)</th>
                      <th className="py-2 px-3 text-center">Gate Load</th>
                      <th className="py-2 px-3 text-right">Bloch |r|</th>
                      <th className="py-2 px-3 text-right">Infidelity (1-F)</th>
                      <th className="py-2 px-3 text-right">Fidelity Retention</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {profiles.map(p => {
                      const isSelected = p.qubit === selectedQubit;
                      const fidStyle = getFidelityColor(p.fidelity);
                      const heatBg = getHeatmapColor(p.totalInfidelity);

                      return (
                        <tr
                          key={p.qubit}
                          onClick={() => setSelectedQubit(p.qubit)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-cyan-950/30 hover:bg-cyan-950/40'
                              : 'hover:bg-slate-900/40'
                          }`}
                        >
                          <td className="py-2 px-3 flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${p.status === 'optimal' ? 'bg-emerald-400' : p.status === 'moderate' ? 'bg-cyan-400' : p.status === 'degraded' ? 'bg-amber-400' : 'bg-rose-500'}`} />
                            <span className="font-bold text-cyan-300">q[{p.qubit}]</span>
                            {isSelected && (
                              <span className="text-[9px] px-1 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-700/50">
                                ACTIVE
                              </span>
                            )}
                          </td>

                          <td className="py-2 px-3 text-right tabular-nums text-slate-300">
                            {p.t1Us} μs <span className="text-[10px] text-slate-500">({p.gamma1Khz} kHz)</span>
                          </td>

                          <td className="py-2 px-3 text-right tabular-nums text-slate-300">
                            {p.t2Us} μs <span className="text-[10px] text-slate-500">({p.gamma2Khz} kHz)</span>
                          </td>

                          <td className="py-2 px-3 text-center tabular-nums">
                            <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 text-[10px]">
                              {p.singleGateCount} 1Q · {p.twoQubitGateCount} 2Q
                            </span>
                          </td>

                          <td className="py-2 px-3 text-right tabular-nums text-slate-300">
                            {p.blochRadius.toFixed(3)}
                            <span className="text-[10px] text-slate-500 ml-1">
                              (-{(p.blochShrinkage * 100).toFixed(1)}%)
                            </span>
                          </td>

                          <td className="py-2 px-3 text-right">
                            <span className={`px-2 py-0.5 rounded border text-[11px] font-semibold tabular-nums ${heatBg}`}>
                              {(p.totalInfidelity * 100).toFixed(2)}%
                            </span>
                          </td>

                          <td className="py-2 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                                <div
                                  className="h-full rounded-full transition-all duration-300"
                                  style={{
                                    width: `${p.fidelity}%`,
                                    backgroundColor: fidStyle.fill
                                  }}
                                />
                              </div>
                              <span className={`w-12 text-right font-bold tabular-nums ${fidStyle.text}`}>
                                {p.fidelity.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Heatmap Legend */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                <span>Decoherence Heat Intensity:</span>
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/40 text-emerald-300">Coherent &lt; 3%</span>
                  <span className="px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/40 text-cyan-300">Low &lt; 8%</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-950/70 border border-amber-800/40 text-amber-300">Moderate &lt; 18%</span>
                  <span className="px-1.5 py-0.5 rounded bg-orange-950/70 border border-orange-800/40 text-orange-300">Elevated &lt; 35%</span>
                  <span className="px-1.5 py-0.5 rounded bg-rose-950/80 border border-rose-800/50 text-rose-300">Hazard &gt; 35%</span>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'temporal' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Step-by-Step Circuit Decoherence Accumulation ($t = 0 \dots {stepColumns.length - 1}$):</span>
                <span className="text-[11px] text-cyan-400">Cumulative gate stress</span>
              </div>

              {/* Temporal Heatmap Grid */}
              <div className="border border-slate-800 rounded-lg p-3 bg-slate-950/60 overflow-x-auto space-y-2">
                {profiles.map(p => {
                  const gatesOnQ = circuit.filter(g => 
                    g.qubit === p.qubit || g.control === p.qubit || g.target === p.qubit || g.q1 === p.qubit || g.q2 === p.qubit
                  );

                  return (
                    <div key={p.qubit} className="flex items-center gap-2 text-xs font-mono">
                      <span className="w-12 text-cyan-300 font-semibold shrink-0">q[{p.qubit}]</span>
                      <div className="flex items-center gap-1 flex-1 overflow-x-auto">
                        {stepColumns.map(step => {
                          const gateAtStep = gatesOnQ.find(g => g.step === step);
                          const activeGatesCount = gatesOnQ.filter(g => g.step <= step).length;
                          // Progressive step decay
                          const stepDecay = Math.min(0.65, 0.015 * (step + 1) + activeGatesCount * 0.045 + (noiseRate / 100) * 0.2);
                          const cellHeat = getHeatmapColor(stepDecay);

                          return (
                            <div
                              key={step}
                              className={`h-9 min-w-9 rounded flex flex-col items-center justify-center border transition-all ${cellHeat} relative group cursor-pointer`}
                              title={`Step ${step} on q[${p.qubit}]: ${gateAtStep ? gateAtStep.type : 'Idle'} | Decoherence: ${(stepDecay * 100).toFixed(1)}%`}
                            >
                              <span className="text-[9px] font-bold">
                                {gateAtStep ? gateAtStep.type : '·'}
                              </span>
                              <span className="text-[8px] opacity-75">
                                {(stepDecay * 100).toFixed(0)}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <span className="w-14 text-right text-[11px] font-bold text-slate-300 shrink-0">
                        {p.fidelity.toFixed(1)}% F
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Each cell reflects instantaneous gate interaction loss plus idle dephasing (e^(-t/T₂)). Entangling 2-qubit gates create prominent decoherence peaks.
              </p>
            </div>
          )}

          {viewMode === 'decomposition' && (
            <div className="space-y-3">
              <div className="text-xs font-mono text-slate-400">
                Channel-by-channel decoherence loss breakdown for all quantum registers:
              </div>

              <div className="space-y-2">
                {profiles.map(p => (
                  <div key={p.qubit} className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/40 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-semibold text-cyan-300">q[{p.qubit}] Decoherence Loss Budget</span>
                      <span className="text-slate-400">Net Infidelity: <strong className="text-rose-400">{(p.totalInfidelity * 100).toFixed(2)}%</strong></span>
                    </div>

                    {/* Stacked Breakdown Bar */}
                    <div className="h-3 w-full bg-slate-900 rounded-sm overflow-hidden flex border border-slate-800">
                      {/* Thermal Loss */}
                      <div
                        className="bg-amber-500/80 transition-all"
                        style={{ width: `${Math.min(100, (p.thermalDecoherence / Math.max(0.001, p.totalInfidelity)) * 100)}%` }}
                        title={`T1 Thermal Relaxation: ${(p.thermalDecoherence * 100).toFixed(2)}%`}
                      />
                      {/* Dephasing Loss */}
                      <div
                        className="bg-cyan-500/80 transition-all"
                        style={{ width: `${Math.min(100, (p.dephasingDecoherence / Math.max(0.001, p.totalInfidelity)) * 100)}%` }}
                        title={`T2 Dephasing: ${(p.dephasingDecoherence * 100).toFixed(2)}%`}
                      />
                      {/* Physical Gate Loss */}
                      <div
                        className="bg-indigo-500/80 transition-all"
                        style={{ width: `${Math.min(100, (p.gateDecoherence / Math.max(0.001, p.totalInfidelity)) * 100)}%` }}
                        title={`Gate Errors: ${(p.gateDecoherence * 100).toFixed(2)}%`}
                      />
                      {/* Bloch Shrinkage */}
                      <div
                        className="bg-rose-500/80 transition-all"
                        style={{ width: `${Math.min(100, (p.blochShrinkage / Math.max(0.001, p.totalInfidelity)) * 100)}%` }}
                        title={`Bloch Shrinkage: ${(p.blochShrinkage * 100).toFixed(2)}%`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                        T₁ Thermal: {(p.thermalDecoherence * 100).toFixed(1)}%
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
                        T₂ Dephase: {(p.dephasingDecoherence * 100).toFixed(1)}%
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
                        Gate Errors: {(p.gateDecoherence * 100).toFixed(1)}%
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
                        Bloch Loss: {(p.blochShrinkage * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Deep Register Inspector & Environmental Controls */}
        <div className="lg:col-span-4 p-3 bg-slate-900/30 overflow-y-auto space-y-3">
          {/* Focused Qubit Profile Card */}
          <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white font-mono">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                <span>Qubit q[{currentFocus.qubit}] Physics Spec</span>
              </div>
              <span className={`text-xs font-mono font-bold ${getFidelityColor(currentFocus.fidelity).text}`}>
                {currentFocus.fidelity.toFixed(2)}% Fidelity
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80">
                <div className="text-[10px] text-slate-500">T₁ Relaxation</div>
                <div className="text-cyan-300 font-semibold mt-0.5">{currentFocus.t1Us} μs</div>
                <div className="text-[9px] text-slate-500">Rate: {currentFocus.gamma1Khz} kHz</div>
              </div>

              <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80">
                <div className="text-[10px] text-slate-500">T₂ Dephasing</div>
                <div className="text-cyan-300 font-semibold mt-0.5">{currentFocus.t2Us} μs</div>
                <div className="text-[9px] text-slate-500">Rate: {currentFocus.gamma2Khz} kHz</div>
              </div>

              <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80">
                <div className="text-[10px] text-slate-500">Bloch Radius |r|</div>
                <div className="text-amber-300 font-semibold mt-0.5">{currentFocus.blochRadius.toFixed(4)}</div>
                <div className="text-[9px] text-slate-500">Purity γ: {currentFocus.purity.toFixed(3)}</div>
              </div>

              <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80">
                <div className="text-[10px] text-slate-500">Gate Depth</div>
                <div className="text-slate-300 font-semibold mt-0.5">{currentFocus.totalDepth} gates</div>
                <div className="text-[9px] text-slate-500">{currentFocus.executionTimeNs} ns exec</div>
              </div>
            </div>

            {/* Qubit Selector Buttons */}
            <div className="pt-1">
              <div className="text-[10px] font-mono text-slate-500 mb-1">Select Register:</div>
              <div className="flex items-center gap-1 overflow-x-auto">
                {Array.from({ length: numQubits }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedQubit(i)}
                    className={`px-2 py-0.5 rounded text-xs font-mono cursor-pointer transition-all ${
                      selectedQubit === i
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    q{i}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Environmental Hardware Simulator Parameters */}
          <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/70 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 font-mono">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Cryostat &amp; Noise Physics Controls</span>
            </div>

            {/* Temperature Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Cryogenic Temp (mK):</span>
                <span className="text-cyan-300 font-semibold">{envTempMilliKelvin} mK</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={envTempMilliKelvin}
                onChange={(e) => setEnvTempMilliKelvin(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>10 mK (Base)</span>
                <span>50 mK</span>
                <span>100 mK (High Noise)</span>
              </div>
            </div>

            {/* Base T2 Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Nominal T₂ Coherence:</span>
                <span className="text-cyan-300 font-semibold">{customDephasingBaseUs} μs</span>
              </div>
              <input
                type="range"
                min="20"
                max="200"
                step="10"
                value={customDephasingBaseUs}
                onChange={(e) => setCustomDephasingBaseUs(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>20 μs (NISQ)</span>
                <span>90 μs (IBM/Google)</span>
                <span>200 μs (Cavity)</span>
              </div>
            </div>

            {/* Reset Defaults Button */}
            <button
              onClick={() => {
                setEnvTempMilliKelvin(15);
                setCustomDephasingBaseUs(90);
              }}
              className="w-full py-1 text-center rounded bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[11px] font-mono text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Reset Transmon Parameters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

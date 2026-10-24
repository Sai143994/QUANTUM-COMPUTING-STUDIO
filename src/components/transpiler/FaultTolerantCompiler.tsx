import React, { useState, useMemo } from 'react';
import { Shield, Sparkles, Layers, ArrowRight, Activity, Cpu, CheckCircle2, Info, Zap } from 'lucide-react';
import { GateOp } from '../../types/quantum';
import { FtqcTranspileResult } from './TranspilerTypes';

interface FaultTolerantCompilerProps {
  circuit: GateOp[];
  numQubits: number;
}

export const FaultTolerantCompiler: React.FC<FaultTolerantCompilerProps> = ({ circuit, numQubits }) => {
  const [codeDistance, setCodeDistance] = useState<number>(5);
  const [physicalErrorRate, setPhysicalErrorRate] = useState<number>(0.001); // 0.1% sub-threshold (e.g. Google Willow / IBM Heron)
  const [codeArchitecture, setCodeArchitecture] = useState<'surface_code' | 'qldpc'>('surface_code');

  // Compute FTQC compilation metrics
  const ftqcMetrics: FtqcTranspileResult = useMemo(() => {
    const tGates = circuit.filter(g => g.type === 'T' || g.type === 'Tdg').length;
    const twoQGates = circuit.filter(g => g.type === 'CNOT' || g.type === 'CZ' || g.type === 'SWAP' || g.type === 'CP').length;
    
    // Physical qubits per logical patch: 2 * d^2 for rotated planar surface code
    const basePhysicalPerLogical = 2 * Math.pow(codeDistance, 2);
    const physicalPerLogical = codeArchitecture === 'qldpc' 
      ? Math.max(12, Math.round(basePhysicalPerLogical * 0.22)) 
      : basePhysicalPerLogical;

    // Total physical qubits = logical data patches + ancilla routing channels + magic state factories
    const dataPhysical = numQubits * physicalPerLogical;
    const distillationFactories = Math.max(1, Math.ceil(tGates / 4));
    // Each 15-to-1 factory requires ~15 * physicalPerLogical qubits
    const factoryPhysical = distillationFactories * (15 * (codeArchitecture === 'qldpc' ? 8 : 18));
    const totalPhysical = dataPhysical + factoryPhysical + (codeArchitecture === 'surface_code' ? numQubits * 4 : 0);

    // Threshold p_th ~ 0.007 (0.7%) for surface code
    const pTh = 0.007;
    const suppressionFactor = physicalErrorRate / pTh;
    const logicalErrorRate = Math.min(1, Math.max(1e-15, 0.1 * Math.pow(suppressionFactor, (codeDistance + 1) / 2)));

    // Lattice surgery cycles: Each logical CNOT takes ~ d rounds of syndrome measurement
    const syndromeExtractionCycles = Math.round(twoQGates * codeDistance * 1.5 + circuit.length * 0.5);

    return {
      codeDistance,
      physicalQubitsPerLogical: physicalPerLogical,
      totalPhysicalQubits: totalPhysical,
      logicalQubitCount: numQubits,
      tGateCount: tGates,
      magicStateDistillationRounds: Math.ceil(Math.log10(1 / logicalErrorRate) / 2),
      distillationFactories,
      syndromeExtractionCycles,
      physicalErrorRate,
      logicalErrorRate,
      latticeSurgerySteps: twoQGates,
      ldpcPhysicalSavingsPercent: 78
    };
  }, [circuit, numQubits, codeDistance, physicalErrorRate, codeArchitecture]);

  return (
    <div className="space-y-6 font-mono text-xs">
      
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#050b11] border border-cyan-800/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
            <Shield className="w-5 h-5 text-[#00e5ff]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">Fault-Tolerant Quantum Compiler (FTQC) &amp; QEC Synthesizer</h3>
              <span className="px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-bold">
                POST-NISQ 2026–2030+
              </span>
            </div>
            <p className="text-[11px] text-[#78909c]">
              Transpiles abstract Clifford+T circuits into logical surface code patches with lattice surgery &amp; 15-to-1 magic state distillation factories
            </p>
          </div>
        </div>

        {/* Code Architecture Picker */}
        <div className="flex items-center gap-2 bg-[#09141d] p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setCodeArchitecture('surface_code')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              codeArchitecture === 'surface_code'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Rotated Surface Code
          </button>
          <button
            onClick={() => setCodeArchitecture('qldpc')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              codeArchitecture === 'qldpc'
                ? 'bg-purple-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Bivariate Bicycle qLDPC
          </button>
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-[#09141d] border border-slate-800">
        {/* Code Distance Selector */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-bold">Code Distance (d):</span>
            <span className="text-cyan-300 font-bold">d = {codeDistance}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {[3, 5, 7, 9, 11].map(d => (
              <button
                key={d}
                onClick={() => setCodeDistance(d)}
                className={`flex-1 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  codeDistance === d
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                d={d}
              </button>
            ))}
          </div>
          <span className="text-[10px] text-slate-500 block">
            Corrects up to t = ⌊(d - 1)/2⌋ = {Math.floor((codeDistance - 1) / 2)} arbitrary physical errors
          </span>
        </div>

        {/* Physical Error Rate Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-bold">Physical 2Q Error (p_phys):</span>
            <span className="text-amber-400 font-bold">{(physicalErrorRate * 100).toFixed(2)}%</span>
          </div>
          <input
            type="range"
            min="0.0005"
            max="0.005"
            step="0.0002"
            value={physicalErrorRate}
            onChange={(e) => setPhysicalErrorRate(+e.target.value)}
            className="w-full h-1 bg-slate-800 accent-amber-400 rounded cursor-pointer"
          />
          <span className="text-[10px] text-slate-500 block">
            Sub-threshold regime: p_phys &lt; p_th = 0.70%
          </span>
        </div>

        {/* Suppression Factor Telemetry */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-850 space-y-1">
          <span className="text-slate-500 text-[10px] uppercase font-bold block">QEC Error Suppression (Λ)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-emerald-400 font-bold text-base">
              {(0.007 / physicalErrorRate).toFixed(1)}x
            </span>
            <span className="text-[10px] text-emerald-500">Below Threshold</span>
          </div>
          <span className="text-[10px] text-slate-400 block">
            Exponential error suppression per +2 code distance
          </span>
        </div>
      </div>

      {/* Industrial Key Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#09141d] border border-cyan-800/40 space-y-1">
          <span className="text-slate-500 text-[10px] uppercase font-bold block">Physical Qubits Required</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-white font-bold text-lg">{ftqcMetrics.totalPhysicalQubits}</span>
            <span className="text-cyan-400 text-xs font-bold">Physical Qubits</span>
          </div>
          <span className="text-[10px] text-slate-400 block">
            {ftqcMetrics.physicalQubitsPerLogical} per logical patch × {numQubits} logical
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#09141d] border border-emerald-800/40 space-y-1">
          <span className="text-slate-500 text-[10px] uppercase font-bold block">Logical Error Rate (P_L)</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-emerald-400 font-bold text-lg">
              {ftqcMetrics.logicalErrorRate < 1e-12 ? '< 10⁻¹²' : ftqcMetrics.logicalErrorRate.toExponential(2)}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block">
            Per syndrome extraction cycle
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#09141d] border border-purple-800/40 space-y-1">
          <span className="text-slate-500 text-[10px] uppercase font-bold block">Magic State Distillation</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-purple-300 font-bold text-lg">{ftqcMetrics.tGateCount} T-Gates</span>
          </div>
          <span className="text-[10px] text-slate-400 block">
            {ftqcMetrics.distillationFactories} Bravyi-Kitaev 15-to-1 factories
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#09141d] border border-amber-800/40 space-y-1">
          <span className="text-slate-500 text-[10px] uppercase font-bold block">Syndrome Cycles</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-amber-300 font-bold text-lg">{ftqcMetrics.syndromeExtractionCycles}</span>
            <span className="text-[10px] text-slate-400">Cycles</span>
          </div>
          <span className="text-[10px] text-slate-400 block">
            {ftqcMetrics.latticeSurgerySteps} Lattice surgery CNOT steps
          </span>
        </div>
      </div>

      {/* Surface Code Patch & Lattice Surgery Interactive Diagram */}
      <div className="p-5 rounded-2xl bg-[#050b11] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#00e5ff]" />
            <h4 className="font-bold text-white text-xs">Rotated Planar Surface Code Lattice Surgery Architecture</h4>
          </div>
          <span className="text-[10px] text-slate-400">
            2D Plaquettes: <strong className="text-cyan-400">X-Stabilizers</strong> (green) &amp; <strong className="text-purple-400">Z-Stabilizers</strong> (purple)
          </span>
        </div>

        {/* Patch Layout Demonstration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Patch A */}
          <div className="p-4 rounded-xl bg-[#02050b] border border-cyan-800/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-300 text-xs">Logical Patch Q_L[0] (Distance d={codeDistance})</span>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 text-[10px] font-bold">
                {2 * codeDistance * codeDistance} Physical Qubits
              </span>
            </div>

            {/* Plaquette Grid Graphic */}
            <div className="p-3 rounded-lg bg-[#010308] border border-slate-850 flex items-center justify-center">
              <div 
                className="grid gap-1.5"
                style={{ gridTemplateColumns: `repeat(${codeDistance}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: codeDistance * codeDistance }).map((_, idx) => {
                  const isZType = (Math.floor(idx / codeDistance) + (idx % codeDistance)) % 2 === 0;
                  return (
                    <div
                      key={idx}
                      className={`w-7 h-7 rounded flex items-center justify-center text-[9px] font-bold transition-transform hover:scale-110 cursor-pointer ${
                        isZType
                          ? 'bg-purple-950/80 border border-purple-500/60 text-purple-300'
                          : 'bg-emerald-950/80 border border-emerald-500/60 text-emerald-300'
                      }`}
                      title={isZType ? 'Z-type stabilizer (X-error syndrome)' : 'X-type stabilizer (Z-error syndrome)'}
                    >
                      {isZType ? 'Z' : 'X'}
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Continuous stabilizer measurements project errors onto classical syndrome syndromes. Weight-4 and weight-2 parity checks detect all single-qubit bit and phase flips.
            </p>
          </div>

          {/* Magic State Factory */}
          <div className="p-4 rounded-xl bg-[#02050b] border border-purple-800/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-300 text-xs">Bravyi-Kitaev 15-to-1 Distillation Factory</span>
              <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-400 text-[10px] font-bold">
                Magic State |A⟩
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#010308] border border-slate-850 space-y-2 text-[11px]">
              <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Input Raw States:</span>
                <span className="text-amber-400 font-bold">15 Noisy |T⟩ Injection States (ε ≈ 10⁻²)</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Output Distilled State:</span>
                <span className="text-emerald-400 font-bold">1 Clean State |T⟩_clean (ε ≈ 35 · ε³)</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Transversality Principle:</span>
                <span className="text-purple-300 font-bold">Eastin-Knill Theorem Adherence</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed">
              Because non-Clifford T-gates cannot be implemented transversally on 2D stabilizer codes (Eastin-Knill theorem), magic states are distilled in dedicated factory patches and teleported onto data qubits.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};

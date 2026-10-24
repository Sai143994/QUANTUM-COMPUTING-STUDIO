import React, { useState } from 'react';
import { GateOp } from '../types/quantum';
import { analyzeCircuitComplexity, CircuitComplexityReport } from '../utils/circuit_complexity';
import { 
  Activity, 
  Layers, 
  Cpu, 
  AlertTriangle, 
  CheckCircle2, 
  Share2, 
  Zap, 
  Sliders, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  Sparkles,
  Gauge,
  HelpCircle,
  TrendingDown
} from 'lucide-react';

interface CircuitComplexityGaugeProps {
  circuit: GateOp[];
  numQubits: number;
}

export const CircuitComplexityGauge: React.FC<CircuitComplexityGaugeProps> = ({
  circuit,
  numQubits
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const report: CircuitComplexityReport = analyzeCircuitComplexity(circuit, numQubits);

  const {
    depth,
    gateBreakdown,
    connectivity,
    estimatedFidelityPct,
    coherenceUsagePct,
    nisqViabilityScore,
    nisqRating,
    bottlenecks,
    recommendedHardware
  } = report;

  const hasCritical = bottlenecks.some(b => b.severity === 'CRITICAL');
  const hasWarning = bottlenecks.some(b => b.severity === 'WARNING');

  const ratingColor = 
    nisqRating === 'OPTIMAL' ? 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40' :
    nisqRating === 'MODERATE' ? 'text-amber-400 border-amber-500/40 bg-amber-950/40' :
    nisqRating === 'POOR' ? 'text-orange-400 border-orange-500/40 bg-orange-950/40' :
    'text-rose-400 border-rose-500/40 bg-rose-950/40';

  const fidelityColor =
    estimatedFidelityPct >= 80 ? 'text-emerald-400' :
    estimatedFidelityPct >= 50 ? 'text-amber-400' :
    'text-rose-400';

  return (
    <div className="border-b border-[rgba(0,229,255,0.12)] bg-[#050b11] select-none text-[#eaf8ff]">
      {/* Top Compact Gauge Bar (Always Visible) */}
      <div className="px-3 sm:px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Main Title Badge */}
          <div className="flex items-center gap-1.5 font-bold text-slate-300">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">NISQ Complexity:</span>
            <span className={`px-2 py-0.5 rounded text-[10px] border uppercase ${ratingColor}`}>
              {nisqRating} ({nisqViabilityScore}/100)
            </span>
          </div>

          <span className="text-slate-700 hidden sm:inline">·</span>

          {/* Depth Gauge */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400 text-[11px]">Depth:</span>
            <span className={`font-bold ${depth > 30 ? 'text-amber-400' : 'text-cyan-300'}`}>
              {depth}
            </span>
            <span className="text-slate-500 text-[10px]">layers</span>
          </div>

          <span className="text-slate-700 hidden sm:inline">·</span>

          {/* Gate Breakdown */}
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-slate-400">Gates:</span>
            <span className="text-white font-bold">{gateBreakdown.total}</span>
            <span className="text-slate-500 text-[10px]">
              ({gateBreakdown.singleQubit} 1Q · <strong className={gateBreakdown.twoQubit > 15 ? 'text-amber-400' : 'text-slate-300'}>{gateBreakdown.twoQubit} 2Q</strong>
              {gateBreakdown.threeQubit > 0 && <span className="text-purple-400"> · {gateBreakdown.threeQubit} 3Q</span>})
            </span>
          </div>

          <span className="text-slate-700 hidden md:inline">·</span>

          {/* Connectivity Requirements */}
          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-slate-400">Topology:</span>
            {connectivity.isAllNearestNeighbor ? (
              <span className="text-emerald-400 flex items-center gap-0.5 text-[10px]">
                <CheckCircle2 className="w-3 h-3" />
                Nearest-Neighbor
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-0.5 text-[10px]">
                <AlertTriangle className="w-3 h-3" />
                {connectivity.nonLocalGateCount} Non-Local (+{connectivity.estimatedSwapsNeeded} SWAPs)
              </span>
            )}
          </div>

          <span className="text-slate-700 hidden lg:inline">·</span>

          {/* Estimated NISQ Fidelity Meter */}
          <div className="hidden lg:flex items-center gap-1.5 text-[11px]">
            <span className="text-slate-400">Est. Fidelity:</span>
            <span className={`font-bold ${fidelityColor}`}>{estimatedFidelityPct}%</span>
            <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div 
                className={`h-full ${
                  estimatedFidelityPct >= 80 ? 'bg-emerald-400' :
                  estimatedFidelityPct >= 50 ? 'bg-amber-400' : 'bg-rose-500'
                }`}
                style={{ width: `${estimatedFidelityPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Toggle Button: Detailed NISQ Diagnostic Inspector */}
        <div className="flex items-center gap-2">
          {/* Quick Warning Pill */}
          {hasCritical ? (
            <span className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800 text-rose-300 text-[10px] flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              Critical Bottleneck
            </span>
          ) : hasWarning ? (
            <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800 text-amber-300 text-[10px] flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              {bottlenecks.filter(b => b.severity === 'WARNING').length} Warning
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-[10px] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              NISQ Ready
            </span>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700/60"
            title="Toggle Detailed NISQ Complexity Inspector"
          >
            <span>NISQ Diagnostics</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable Detailed NISQ Diagnostic Panel */}
      {isExpanded && (
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/90 text-xs font-mono space-y-4">
          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Card 1: Depth & Coherence Budget */}
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-bold flex items-center gap-1.5 text-cyan-300">
                  <Layers className="w-3.5 h-3.5" />
                  Circuit Depth &amp; Coherence
                </span>
                <span className="text-[10px] text-slate-500">T₂ ~ 120 μs</span>
              </div>
              
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-white">{depth} <span className="text-xs text-slate-500">layers</span></span>
                <span className="text-xs text-slate-400">{coherenceUsagePct}% Coherence Used</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div 
                  className={`h-full ${
                    coherenceUsagePct > 60 ? 'bg-rose-500' :
                    coherenceUsagePct > 30 ? 'bg-amber-400' : 'bg-cyan-400'
                  }`}
                  style={{ width: `${coherenceUsagePct}%` }}
                />
              </div>

              <div className="text-[10px] text-slate-400 leading-tight">
                {depth <= 15 ? '✓ Low depth: Minimal dephasing accumulation expected.' :
                 depth <= 35 ? '⚠️ Moderate depth: Consider dynamical decoupling (XY4).' :
                 '🚨 Excessive depth: Qubits likely dephase prior to final measurement.'}
              </div>
            </div>

            {/* Card 2: Two-Qubit Error Budget */}
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-bold flex items-center gap-1.5 text-indigo-300">
                  <Cpu className="w-3.5 h-3.5" />
                  2Q Entangling Error Budget
                </span>
                <span className="text-[10px] text-slate-500">ε₂q ≈ 0.75%</span>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-white">{gateBreakdown.twoQubit} <span className="text-xs text-slate-500">gates</span></span>
                <span className="text-xs text-slate-400">
                  {gateBreakdown.total > 0 ? Math.round((gateBreakdown.twoQubit / gateBreakdown.total) * 100) : 0}% 2Q Ratio
                </span>
              </div>

              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div 
                  className={`h-full ${
                    gateBreakdown.twoQubit > 25 ? 'bg-rose-500' :
                    gateBreakdown.twoQubit > 10 ? 'bg-amber-400' : 'bg-indigo-400'
                  }`}
                  style={{ width: `${Math.min(100, (gateBreakdown.twoQubit / 40) * 100)}%` }}
                />
              </div>

              <div className="text-[10px] text-slate-400 leading-tight">
                {gateBreakdown.twoQubit === 0 ? 'Pure 1Q circuit: Near 99%+ survival probability.' :
                 gateBreakdown.twoQubit <= 10 ? '✓ Manageable 2Q load for unmitigated NISQ runs.' :
                 '⚠️ Dense 2Q gate load: Recommend Zero-Noise Extrapolation (ZNE).'}
              </div>
            </div>

            {/* Card 3: Physical Qubit Topology & Routing */}
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-bold flex items-center gap-1.5 text-amber-300">
                  <Share2 className="w-3.5 h-3.5" />
                  Topology &amp; SWAP Routing
                </span>
                <span className="text-[10px] text-slate-500">Grid Hardware</span>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-white">
                  {connectivity.nonLocalGateCount} <span className="text-xs text-slate-500">non-local</span>
                </span>
                <span className="text-xs text-amber-400">+{connectivity.estimatedSwapsNeeded} SWAPs Needed</span>
              </div>

              {/* Interacted pairs badges */}
              <div className="flex flex-wrap gap-1 max-h-12 overflow-y-auto">
                {connectivity.interactionPairs.length === 0 ? (
                  <span className="text-[10px] text-slate-500">No multi-qubit couplings.</span>
                ) : (
                  connectivity.interactionPairs.map((p, idx) => {
                    const isNonLocal = Math.abs(p.q1 - p.q2) > 1;
                    return (
                      <span
                        key={idx}
                        className={`px-1.5 py-0.5 rounded text-[10px] border ${
                          isNonLocal 
                            ? 'bg-amber-950/40 text-amber-300 border-amber-800/60'
                            : 'bg-slate-800/80 text-slate-300 border-slate-700/60'
                        }`}
                      >
                        q{p.q1}↔q{p.q2} ({p.count}×)
                      </span>
                    );
                  })
                )}
              </div>

              <div className="text-[10px] text-slate-400 leading-tight">
                {connectivity.isAllNearestNeighbor 
                  ? '✓ Fits 1D linear chain or 2D square grid with 0 extra SWAP overhead.'
                  : `⚠️ Routing required on linear or heavy-hex chips (+${connectivity.estimatedSwapsNeeded} SWAPs).`}
              </div>
            </div>
          </div>

          {/* NISQ Device Bottlenecks & Hardware Matchmaker */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 pt-1">
            {/* Left: Identified Bottlenecks List */}
            <div className="lg:col-span-8 space-y-2">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>NISQ Device Bottleneck Diagnostic Report:</span>
              </div>

              <div className="space-y-1.5">
                {bottlenecks.map(b => {
                  const isCrit = b.severity === 'CRITICAL';
                  const isWarn = b.severity === 'WARNING';

                  return (
                    <div
                      key={b.id}
                      className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                        isCrit ? 'bg-rose-950/20 border-rose-800/60 text-rose-200' :
                        isWarn ? 'bg-amber-950/20 border-amber-800/60 text-amber-200' :
                        'bg-slate-900/60 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1.5">
                          {isCrit ? <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> :
                           isWarn ? <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> :
                           <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                          {b.title}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          isCrit ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                          isWarn ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                          'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}>
                          {b.severity}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {b.description} {b.impact}
                      </p>

                      <div className="text-[10px] text-cyan-300 pt-0.5 flex items-start gap-1">
                        <span className="text-slate-500 shrink-0">Mitigation:</span>
                        <span>{b.recommendation}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Hardware Target Matchmaker */}
            <div className="lg:col-span-4 p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2.5">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Recommended Hardware Backend:</span>
              </div>

              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-xs font-bold text-cyan-300">
                  {recommendedHardware === 'SUPERCONDUCTING' ? 'Superconducting Transmon Grid' :
                   recommendedHardware === 'TRAPPED_ION' ? 'Trapped-Ion Architecture (All-to-All)' :
                   'Neutral-Atom Optical Tweezer Array'}
                </div>
                <div className="text-[10px] text-slate-400 leading-relaxed">
                  {recommendedHardware === 'SUPERCONDUCTING' ? (
                    'Best suited for Google Sycamore/Willow or IBM Heron: nanosecond-speed gates maximize gate throughput before T₂ decay.'
                  ) : recommendedHardware === 'TRAPPED_ION' ? (
                    'Best suited for Quantinuum H2 or IonQ Forte: all-to-all connectivity natively eliminates non-local SWAP overhead.'
                  ) : (
                    'Best suited for QuEra Aquila or Pasqal: dynamic atom shuttling handles multi-qubit and high-depth circuits efficiently.'
                  )}
                </div>
              </div>

              <div className="pt-1 border-t border-slate-800/80 space-y-1 text-[10px] text-slate-500">
                <div>• Superconducting 2Q gate time: ~40 ns</div>
                <div>• Trapped-ion 2Q gate time: ~50 μs</div>
                <div>• Recommended Error Mitigation: ZNE + Twirling</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

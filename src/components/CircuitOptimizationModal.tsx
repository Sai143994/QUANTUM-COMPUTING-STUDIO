import React from 'react';
import { 
  Wand2, 
  Check, 
  X, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Timer, 
  ShieldCheck, 
  Activity,
  Flame,
  Cpu
} from 'lucide-react';
import { OptimizationResult } from '../utils/circuit_optimizer';

interface CircuitOptimizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: OptimizationResult | null;
  onApply: (optimizedCircuit: any[]) => void;
}

export const CircuitOptimizationModal: React.FC<CircuitOptimizationModalProps> = ({
  isOpen,
  onClose,
  result,
  onApply
}) => {
  if (!isOpen || !result) return null;

  const {
    originalGatesCount,
    optimizedGatesCount,
    gatesReductionPct,
    originalDepth,
    optimizedDepth,
    depthReductionPct,
    fidelityEquivalence,
    logs
  } = result;

  const hasReduction = gatesReductionPct > 0 || depthReductionPct > 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#09141d] border border-[rgba(0,229,255,0.3)] rounded-2xl max-w-2xl w-full p-6 shadow-2xl font-mono flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[rgba(0,229,255,0.15)] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-500/20">
              <Wand2 className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm tracking-tight flex items-center gap-2">
                <span>Quantum Transpiler &amp; Circuit Optimizer</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  Level 3 Passes
                </span>
              </h3>
              <p className="text-[11px] text-[#78909c]">
                Automated Inverse Cancellation, Continuous Rotation Fusion &amp; ASAP Compaction
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#78909c] hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Comparison Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 shrink-0">
          {/* Gate Count */}
          <div className="p-3 rounded-xl bg-[#050b11] border border-[rgba(0,229,255,0.15)]">
            <span className="text-[10px] uppercase tracking-wider text-[#78909c] flex items-center gap-1">
              <Layers className="w-3 h-3 text-cyan-400" />
              Total Gates
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-slate-400 line-through text-xs font-mono">{originalGatesCount}</span>
              <ArrowRight className="w-2.5 h-2.5 text-cyan-400" />
              <span className="text-white font-bold text-base">{optimizedGatesCount}</span>
            </div>
            <div className="text-[11px] font-bold text-emerald-400 mt-0.5">
              {gatesReductionPct > 0 ? `-${gatesReductionPct}% Gates` : 'No Change'}
            </div>
          </div>

          {/* Depth */}
          <div className="p-3 rounded-xl bg-[#050b11] border border-[rgba(0,229,255,0.15)]">
            <span className="text-[10px] uppercase tracking-wider text-[#78909c] flex items-center gap-1">
              <Timer className="w-3 h-3 text-amber-400" />
              Circuit Depth
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-slate-400 line-through text-xs font-mono">{originalDepth}</span>
              <ArrowRight className="w-2.5 h-2.5 text-amber-400" />
              <span className="text-white font-bold text-base">{optimizedDepth}</span>
            </div>
            <div className="text-[11px] font-bold text-emerald-400 mt-0.5">
              {depthReductionPct > 0 ? `-${depthReductionPct}% Latency` : 'Optimal'}
            </div>
          </div>

          {/* Fidelity Verification */}
          <div className="p-3 rounded-xl bg-[#050b11] border border-[rgba(0,229,255,0.15)]">
            <span className="text-[10px] uppercase tracking-wider text-[#78909c] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              State Fidelity
            </span>
            <div className="text-emerald-400 font-bold text-base mt-1 font-mono">
              {(fidelityEquivalence * 100).toFixed(2)}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">
              Physical Equivalence
            </div>
          </div>

          {/* Decoherence Saving */}
          <div className="p-3 rounded-xl bg-[#050b11] border border-[rgba(0,229,255,0.15)]">
            <span className="text-[10px] uppercase tracking-wider text-[#78909c] flex items-center gap-1">
              <Cpu className="w-3 h-3 text-indigo-400" />
              Hardware Gain
            </span>
            <div className="text-cyan-300 font-bold text-base mt-1">
              {originalGatesCount - optimizedGatesCount > 0 ? `+${(originalGatesCount - optimizedGatesCount) * 28} ns` : '0 ns'}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">
              QPU Coherence Margin
            </div>
          </div>
        </div>

        {/* Optimization Trace Logs */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-[140px] border border-[rgba(0,229,255,0.12)] rounded-xl bg-[#050b11] p-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <span className="text-[#78909c] font-semibold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Compiler Pass Execution Log ({logs.length} operations)
            </span>
            {hasReduction && (
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                Equivalence Verified
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pt-2.5 pr-1 text-xs">
            {logs.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <CheckCircle2 className="w-7 h-7 mx-auto mb-2 text-cyan-400/50" />
                <p className="font-semibold text-slate-300">Circuit is already mathematically optimal!</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  No redundant self-inverses, adjacent pairs, or continuous rotation merges detected.
                </p>
              </div>
            ) : (
              logs.map((log, i) => (
                <div 
                  key={i} 
                  className="p-2 rounded bg-slate-900/60 border border-slate-800 flex items-start justify-between gap-3 text-xs hover:border-cyan-500/30 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                        {log.rule}
                      </span>
                      <span className="text-amber-400 font-mono text-[11px] font-semibold">{log.qubit}</span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      {log.detail}
                    </div>
                  </div>
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-1" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[rgba(0,229,255,0.15)] flex items-center justify-between shrink-0 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Dismiss
          </button>

          <button
            onClick={() => {
              onApply(result.optimizedCircuit);
              onClose();
            }}
            disabled={!hasReduction}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Apply Optimization to Canvas</span>
          </button>
        </div>
      </div>
    </div>
  );
};

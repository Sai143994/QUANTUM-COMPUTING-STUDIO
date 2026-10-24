import React from 'react';
import { BackendComparisonResult } from './TranspilerTypes';
import { Cpu, CheckCircle2, ShieldCheck, Zap, Layers, Trophy } from 'lucide-react';

interface HardwareComparisonRadarProps {
  comparisons: BackendComparisonResult[];
  selectedBackendId: string;
  onSelectBackend: (backendId: string) => void;
}

export const HardwareComparisonRadar: React.FC<HardwareComparisonRadarProps> = ({
  comparisons,
  selectedBackendId,
  onSelectBackend
}) => {
  const highestFidelity = Math.max(...comparisons.map(c => c.estFidelity));
  const lowestSwaps = Math.min(...comparisons.map(c => c.swapsInserted));
  const lowestDepth = Math.min(...comparisons.map(c => c.depth));

  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#09141d] border border-cyan-800/40">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#00e5ff]" />
          <div>
            <h4 className="font-bold text-white text-xs">Cross-Architecture Hardware Compilation Radar</h4>
            <p className="text-[10px] text-[#78909c]">
              Real-time multi-target transpilation benchmarking the identical algorithm across 5 distinct quantum computing physical architectures
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 text-[10px] font-bold">
          [5 PHYSICAL PLATFORMS BENCHMARKED]
        </span>
      </div>

      {/* Comparison Grid Table */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {comparisons.map(comp => {
          const isSelected = comp.backend.id === selectedBackendId;
          const isTopFidelity = comp.estFidelity === highestFidelity;
          const isMinSwaps = comp.swapsInserted === lowestSwaps;
          const isMinDepth = comp.depth === lowestDepth;

          return (
            <div
              key={comp.backend.id}
              onClick={() => onSelectBackend(comp.backend.id)}
              className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'bg-cyan-950/60 border-[#00e5ff] shadow-lg shadow-cyan-500/20 scale-[1.02]'
                  : 'bg-[#09141d] border-slate-800 hover:border-slate-700 hover:bg-[#0c1a26]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-cyan-400">
                    {comp.backend.vendor}
                  </span>
                  {isSelected && (
                    <span className="px-1.5 py-0.5 rounded bg-[#00e5ff] text-slate-950 font-bold text-[9px]">
                      ACTIVE
                    </span>
                  )}
                </div>
                <h5 className="font-bold text-white text-xs mt-1 truncate" title={comp.backend.name}>
                  {comp.backend.name}
                </h5>
                <span className="text-[10px] text-slate-400 block mt-0.5 capitalize">
                  {comp.backend.architecture.replace('_', ' ')} · {comp.backend.qubitCount}Q
                </span>
              </div>

              {/* Key Badges */}
              <div className="flex flex-wrap gap-1">
                {isTopFidelity && (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[9px] font-bold flex items-center gap-1">
                    <Trophy className="w-2.5 h-2.5" /> Best Fidelity
                  </span>
                )}
                {isMinSwaps && (
                  <span className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[9px] font-bold flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5" /> 0 SWAPs
                  </span>
                )}
              </div>

              {/* Metrics */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Circuit Depth:</span>
                  <span className={`font-bold ${isMinDepth ? 'text-emerald-400' : 'text-white'}`}>
                    {comp.depth}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">SWAP Gates:</span>
                  <span className={`font-bold ${comp.swapsInserted === 0 ? 'text-emerald-400' : 'text-purple-400'}`}>
                    +{comp.swapsInserted}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Native 2Q:</span>
                  <span className="font-bold text-cyan-300">{comp.twoQubitGates}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Est. Fidelity:</span>
                  <span className="font-bold text-emerald-400">{comp.estFidelity}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Execution Time:</span>
                  <span className="font-bold text-amber-300">{comp.duration_us} μs</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/40">
                Native Basis: {comp.backend.basisGates.slice(0, 3).join(', ')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

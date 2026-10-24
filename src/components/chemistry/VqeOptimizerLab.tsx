import React, { useState } from 'react';
import { ClassicalOptimizer, VqeConvergencePoint } from './ChemistryTypes';
import { Play, RotateCcw, Activity, Sliders, CheckCircle2, TrendingDown, Zap, Award } from 'lucide-react';
import { playGateClickSound, playMeasurementCollapseSound } from '../../utils/audio';

interface VqeOptimizerLabProps {
  exactEnergy: number;
  currentEnergy: number;
  onUpdateEnergy: (e: number) => void;
  ansatzType: string;
}

export const VqeOptimizerLab: React.FC<VqeOptimizerLabProps> = ({
  exactEnergy,
  currentEnergy,
  onUpdateEnergy,
  ansatzType
}) => {
  const [selectedOptimizer, setSelectedOptimizer] = useState<ClassicalOptimizer>('cobyla');
  const [shots, setShots] = useState<number>(4096);
  const [optimizing, setOptimizing] = useState<boolean>(false);
  const [convergenceHistory, setConvergenceHistory] = useState<VqeConvergencePoint[]>([]);

  const runOptimizer = () => {
    if (optimizing) return;
    setOptimizing(true);
    playGateClickSound(750);
    setConvergenceHistory([]);

    let step = 0;
    let e = currentEnergy;
    const history: VqeConvergencePoint[] = [];

    // Realistic step rates based on optimizer
    const stepRate = selectedOptimizer === 'quantum_natural_gradient' ? 0.35 : selectedOptimizer === 'adam_param_shift' ? 0.28 : selectedOptimizer === 'spsa' ? 0.18 : 0.22;
    const maxSteps = selectedOptimizer === 'quantum_natural_gradient' ? 16 : 28;

    const interval = setInterval(() => {
      step++;
      const grad = (e - exactEnergy) * stepRate;
      // Shot noise fluctuation simulation (standard error = 1 / sqrt(shots))
      const shotNoise = shots > 0 ? (Math.random() - 0.5) * (0.05 / Math.sqrt(shots / 1024)) : 0;
      e = +(e - grad + shotNoise).toFixed(4);

      history.push({
        iteration: step,
        energy: e,
        parameters: [0.1 + step * 0.03, 0.2 - step * 0.01],
        gradientNorm: Math.abs(grad),
        variance: Math.abs(e - exactEnergy)
      });

      setConvergenceHistory([...history]);
      onUpdateEnergy(e);

      if (step >= maxSteps || Math.abs(e - exactEnergy) < 0.0016) {
        clearInterval(interval);
        setOptimizing(false);
        playMeasurementCollapseSound();
      }
    }, 110);
  };

  const currentDiff = Math.abs(currentEnergy - exactEnergy);
  const isChemicalAccuracy = currentDiff < 0.0016; // 1.6 mHa

  return (
    <div className="space-y-4 font-mono text-xs">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#09141d] border border-cyan-800/40">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#00e5ff]" />
          <div>
            <h4 className="font-bold text-white text-xs">Classical Optimization Arena &amp; Quantum Natural Gradient</h4>
            <p className="text-[10px] text-[#78909c]">
              Minimizes Rayleigh-Ritz expectation value E(θ) = ⟨ψ(θ)|H|ψ(θ)⟩ across analytical parameter-shift and Riemannian manifolds
            </p>
          </div>
        </div>

        {/* Optimizer Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#050b11] p-1 rounded-lg border border-slate-800 text-[11px]">
            {[
              { id: 'cobyla' as const, label: 'COBYLA' },
              { id: 'spsa' as const, label: 'SPSA (Noisy)' },
              { id: 'adam_param_shift' as const, label: 'Adam (Shift)' },
              { id: 'quantum_natural_gradient' as const, label: 'QNG (Fubini)' }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setSelectedOptimizer(opt.id)}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  selectedOptimizer === opt.id
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            onClick={runOptimizer}
            disabled={optimizing}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${optimizing ? 'animate-spin' : 'fill-current'}`} />
            <span>{optimizing ? 'Iterating…' : 'Solve VQE Ground State'}</span>
          </button>
        </div>
      </div>

      {/* Convergence Curve & Live Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Convergence SVG Plot (8 cols) */}
        <div className="md:col-span-8 p-4 rounded-xl bg-[#050b11] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-xs uppercase flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-cyan-400" />
              <span>Convergence Trajectory E_iter vs Exact FCI</span>
            </span>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-3 h-0.5 bg-emerald-400" /> Chemical Accuracy (1.6 mHa)
              </span>
              <span className="flex items-center gap-1 text-cyan-300">
                <span className="w-3 h-0.5 bg-cyan-400" /> VQE Trajectory
              </span>
            </div>
          </div>

          {/* SVG Canvas */}
          <div className="p-3 rounded-lg bg-[#02050b] border border-slate-850 flex items-center justify-center">
            <svg viewBox="0 0 480 160" className="w-full h-36 overflow-visible">
              <line x1="35" y1="130" x2="460" y2="130" stroke="#334155" strokeWidth="1" />
              <line x1="35" y1="15" x2="35" y2="130" stroke="#334155" strokeWidth="1" />

              {/* Exact Target Horizontal Green Line */}
              <line x1="35" y1="120" x2="460" y2="120" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3,3" />
              <text x="465" y="123" fill="#10b981" fontSize="9">Exact FCI</text>

              {/* Convergence line if history exists */}
              {convergenceHistory.length > 1 && (
                <path
                  d={convergenceHistory.map((pt, i) => {
                    const x = 35 + (i / Math.max(1, convergenceHistory.length - 1)) * 410;
                    const diff = Math.min(100, Math.abs(pt.energy - exactEnergy) * 800);
                    const y = 120 - diff;
                    return `${i === 0 ? 'M' : 'L'} ${x} ${Math.max(20, y)}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#00e5ff"
                  strokeWidth="2.5"
                />
              )}

              {/* Data points */}
              {convergenceHistory.map((pt, i) => {
                const x = 35 + (i / Math.max(1, convergenceHistory.length - 1)) * 410;
                const diff = Math.min(100, Math.abs(pt.energy - exactEnergy) * 800);
                const y = Math.max(20, 120 - diff);
                return (
                  <circle key={i} cx={x} cy={y} r="3" fill="#00e5ff" />
                );
              })}
            </svg>
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-400">
            <span>Optimizer: <strong className="text-white uppercase">{selectedOptimizer.replace('_', ' ')}</strong></span>
            <span>Ansatz: <strong className="text-cyan-300 uppercase">{ansatzType}</strong></span>
          </div>
        </div>

        {/* Telemetry Readouts (4 cols) */}
        <div className="md:col-span-4 flex flex-col gap-3 font-mono text-xs">
          
          <div className={`p-3.5 rounded-xl border space-y-1.5 ${
            isChemicalAccuracy ? 'bg-emerald-950/40 border-emerald-500/60' : 'bg-[#09141d] border-slate-800'
          }`}>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Chemical Accuracy Status</span>
            <div className="flex items-baseline gap-2">
              <span className={`font-bold text-base ${isChemicalAccuracy ? 'text-emerald-300' : 'text-amber-400'}`}>
                {(currentDiff * 1000).toFixed(2)} mHa
              </span>
              <span className="text-[10px] text-slate-400">Target: &lt; 1.60 mHa</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px]">
              {isChemicalAccuracy ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Chemical Accuracy Achieved!
                </span>
              ) : (
                <span className="text-amber-400">Above 1 kcal/mol chemical threshold</span>
              )}
            </div>
          </div>

          {/* Shot Noise Budget */}
          <div className="p-3.5 rounded-xl bg-[#09141d] border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Measurement Shots:</span>
              <span className="text-cyan-300 font-bold">{shots === 0 ? 'Statevector (∞)' : `${shots} shots`}</span>
            </div>
            <div className="flex items-center gap-1">
              {[1024, 4096, 16384, 0].map(s => (
                <button
                  key={s}
                  onClick={() => setShots(s)}
                  className={`flex-1 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    shots === s ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {s === 0 ? 'Exact' : `${s}`}
                </button>
              ))}
            </div>
          </div>

          {/* Theoretical note */}
          <div className="p-3 rounded-xl bg-[#02050b] border border-slate-850 text-[10px] text-slate-400 leading-relaxed">
            Quantum Natural Gradient (QNG) avoids flat barren plateaus by pre-multiplying gradients with the inverse Fubini-Study metric tensor g⁻¹(θ).
          </div>

        </div>

      </div>

    </div>
  );
};

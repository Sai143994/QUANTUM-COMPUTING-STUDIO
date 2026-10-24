import React, { useRef, useEffect, useState, useMemo } from 'react';
import { IndustrialMolecule } from './ChemistryTypes';
import { TrendingDown, Zap, Eye, RotateCw, Play, CheckCircle2, ShieldAlert } from 'lucide-react';
import { playGateClickSound } from '../../utils/audio';

interface VariationalLandscape3DProps {
  exactEnergy: number;
  currentEnergy: number;
  onSelectParams?: (theta1: number, theta2: number) => void;
}

export const VariationalLandscape3D: React.FC<VariationalLandscape3DProps> = ({
  exactEnergy,
  currentEnergy,
  onSelectParams
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [param1, setParam1] = useState<number>(0.28);
  const [param2, setParam2] = useState<number>(0.15);
  const [trajectory, setTrajectory] = useState<Array<[number, number]>>([[0.1, 0.45], [0.18, 0.32], [0.24, 0.22], [0.28, 0.15]]);

  // Target optimal parameters for minimum energy
  const optP1 = 0.35;
  const optP2 = 0.12;

  // Energy function E(θ1, θ2)
  const calcE = (t1: number, t2: number) => {
    const d1 = t1 - optP1;
    const d2 = t2 - optP2;
    // Harmonic well + periodic higher harmonics
    return exactEnergy + 0.18 * (d1 * d1 + d2 * d2) + 0.05 * Math.sin(d1 * 4) ** 2;
  };

  // Render 2D Contour Heatmap
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const step = 6;
    const minP = -0.5;
    const maxP = 1.0;

    // Draw energy surface cells
    for (let x = 0; x < w; x += step) {
      const t1 = minP + (x / w) * (maxP - minP);
      for (let y = 0; y < h; y += step) {
        const t2 = minP + (1 - y / h) * (maxP - minP);
        const e = calcE(t1, t2);
        const diff = Math.min(1, Math.max(0, (e - exactEnergy) / 0.15));

        // Color gradient from dark navy/cyan (minimum) to purple/rose (high energy)
        ctx.fillStyle = `hsl(${220 - diff * 200}, 85%, ${15 + (1 - diff) * 25}%)`;
        ctx.fillRect(x, y, step, step);
      }
    }

    // Convert parameter to canvas coords
    const toCanvasX = (p1: number) => ((p1 - minP) / (maxP - minP)) * w;
    const toCanvasY = (p2: number) => (1 - (p2 - minP) / (maxP - minP)) * h;

    // Draw Contour Lines (Iso-energetic rings)
    for (let ring = 1; ring <= 4; ring++) {
      const r = ring * 38;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.ellipse(toCanvasX(optP1), toCanvasY(optP2), r, r * 0.8, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw Optimizer Trajectory
    if (trajectory.length > 1) {
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      trajectory.forEach(([p1, p2], idx) => {
        const px = toCanvasX(p1);
        const py = toCanvasY(p2);
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Trajectory dots
      trajectory.forEach(([p1, p2], idx) => {
        const px = toCanvasX(p1);
        const py = toCanvasY(p2);
        ctx.fillStyle = idx === trajectory.length - 1 ? '#f59e0b' : '#38bdf8';
        ctx.beginPath();
        ctx.arc(px, py, idx === trajectory.length - 1 ? 5 : 3, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Global Minimum Star Target
    const optX = toCanvasX(optP1);
    const optY = toCanvasY(optP2);
    ctx.fillStyle = '#10b981';
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(optX, optY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Current State Marker
    const curX = toCanvasX(param1);
    const curY = toCanvasY(param2);
    ctx.fillStyle = '#ec4899';
    ctx.shadowColor = '#ec4899';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(curX, curY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }, [exactEnergy, param1, param2, trajectory]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const minP = -0.5;
    const maxP = 1.0;
    const newP1 = +(minP + (x / rect.width) * (maxP - minP)).toFixed(3);
    const newP2 = +(minP + (1 - y / rect.height) * (maxP - minP)).toFixed(3);

    playGateClickSound(650);
    setParam1(newP1);
    setParam2(newP2);
    setTrajectory(prev => [...prev, [newP1, newP2]]);
    if (onSelectParams) onSelectParams(newP1, newP2);
  };

  const calculatedE = calcE(param1, param2);
  const gradNorm = +Math.sqrt((param1 - optP1) ** 2 + (param2 - optP2) ** 2).toFixed(3);

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#09141d] border border-cyan-800/40">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-[#00e5ff]" />
          <div>
            <h4 className="font-bold text-white text-xs">Multi-Parameter Variational Energy Landscape E(θ₁, θ₂)</h4>
            <p className="text-[10px] text-[#78909c]">
              Rayleigh-Ritz energy manifold across single-excitation (θ₁) and double-excitation (θ₂) UCCSD parameter spaces
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-slate-400">Gradient Norm ||∇E||: <strong className="text-amber-400">{gradNorm}</strong></span>
          <span className="text-slate-400">E(θ): <strong className="text-cyan-300">{calculatedE.toFixed(4)} Ha</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Landscape Heatmap Canvas (8 cols) */}
        <div className="lg:col-span-8 p-4 rounded-xl bg-[#050b11] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-xs uppercase flex items-center gap-1.5">
              <span>Interactive 2D Parameter Energy Manifold</span>
            </span>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> FCI Global Minimum
              </span>
              <span className="flex items-center gap-1 text-pink-400">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500" /> Current θ(t)
              </span>
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-3 h-0.5 bg-cyan-400" /> Gradient Trajectory
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center p-2 rounded-xl bg-[#010308] border border-slate-850">
            <canvas
              ref={canvasRef}
              width={620}
              height={260}
              onClick={handleCanvasClick}
              className="w-full h-full max-h-[260px] block cursor-crosshair rounded-lg"
              title="Click anywhere to reposition variational parameters"
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-500">
            <span>θ₁ (Single Excitation Amplitude): [-0.5, 1.0]</span>
            <span>Click canvas to manually initialize optimizer seed</span>
            <span>θ₂ (Double Excitation Amplitude): [-0.5, 1.0]</span>
          </div>
        </div>

        {/* Right Info & Barren Plateau Telemetry (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-3 font-mono text-xs">
          
          <div className="p-4 rounded-xl bg-[#09141d] border border-slate-800 space-y-2.5">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Variational State Coordinates</span>
            
            <div className="p-2 rounded bg-slate-950 border border-slate-850 flex justify-between">
              <span className="text-slate-400">Amplitude θ₁ (Single):</span>
              <span className="text-cyan-300 font-bold">{param1} rad</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-850 flex justify-between">
              <span className="text-slate-400">Amplitude θ₂ (Double):</span>
              <span className="text-purple-300 font-bold">{param2} rad</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-850 flex justify-between">
              <span className="text-slate-400">Energy Deviation:</span>
              <span className={`font-bold ${Math.abs(calculatedE - exactEnergy) < 0.0016 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {(Math.abs(calculatedE - exactEnergy) * 1000).toFixed(2)} mHa
              </span>
            </div>
          </div>

          {/* Barren Plateau Warning Module */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 leading-relaxed">
            <div className="text-white font-bold flex items-center gap-1.5 text-xs">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Barren Plateau Diagnostic</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Unlike generic random unitaries, physically motivated quantum chemistry ansätze (UCCSD) preserve particle number and avoid exponential concentration of measure, guaranteeing non-vanishing analytical gradients.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

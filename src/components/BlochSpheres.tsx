import React, { useEffect, useRef, useState } from 'react';
import { QuantumState } from '../types/quantum';
import { ThreeBlochSphere3D } from './ThreeBlochSphere3D';
import { MultiQubitEntanglementProjection } from './MultiQubitEntanglementProjection';
import { QSphereVisualizer } from './QSphereVisualizer';
import { Rotate3d, Grid, Sparkles, ChevronRight, Share2, Compass } from 'lucide-react';

interface BlochSpheresProps {
  numQubits: number;
  qstate: QuantumState | null;
}

export const BlochSpheres: React.FC<BlochSpheresProps> = ({ numQubits, qstate }) => {
  const [viewMode, setViewMode] = useState<'grid' | '3d' | 'projection' | 'qsphere'>('grid');
  const [focusedQubit, setFocusedQubit] = useState<number>(0);

  const handleOpen3DForQubit = (q: number) => {
    setFocusedQubit(q);
    setViewMode('3d');
  };

  return (
    <div className="border-b border-[rgba(0,229,255,0.15)] bg-[#050b11] px-4 py-3 select-none font-mono">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider text-[#78909c] font-semibold flex items-center gap-1.5">
            <Rotate3d className="w-3.5 h-3.5 text-[#00e5ff]" />
            <span className="text-[#eaf8ff]">Single-Qubit Bloch Vector Projections</span>
          </span>
          <span className="text-slate-700">·</span>
          <span className="text-[11px] text-[#78909c] hidden sm:inline">
            Traced from Reduced Density Matrix ρᵢ
          </span>
        </div>

        {/* View Switcher: Multi-Grid vs 3D Single vs Entanglement Mesh Projection */}
        <div className="flex items-center gap-1 bg-[#09141d] p-0.5 rounded-lg border border-[rgba(0,229,255,0.15)] text-xs">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer flex items-center gap-1 ${
              viewMode === 'grid'
                ? 'bg-[#0b1722] text-[#00e5ff] font-bold border border-[rgba(0,229,255,0.3)] shadow-xs'
                : 'text-[#78909c] hover:text-[#eaf8ff]'
            }`}
          >
            <Grid className="w-3 h-3" />
            <span>Multi-Grid ({numQubits}Q)</span>
          </button>

          <button
            onClick={() => setViewMode('3d')}
            className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer flex items-center gap-1 ${
              viewMode === '3d'
                ? 'bg-[#00e5ff] text-[#02060a] font-bold shadow-xs'
                : 'text-[#78909c] hover:text-[#eaf8ff]'
            }`}
          >
            <Rotate3d className="w-3 h-3" />
            <span>3D WebGL Studio</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00a86b] animate-pulse" />
          </button>

          <button
            onClick={() => setViewMode('qsphere')}
            className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer flex items-center gap-1 ${
              viewMode === 'qsphere'
                ? 'bg-purple-600 text-white font-bold shadow-xs shadow-purple-600/30'
                : 'text-[#78909c] hover:text-[#eaf8ff]'
            }`}
            title="Multi-qubit Q-Sphere mapping computational basis states onto a spherical topology"
          >
            <Compass className="w-3 h-3 text-cyan-300" />
            <span>Q-Sphere ({1 << numQubits}D)</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </button>

          <button
            onClick={() => setViewMode('projection')}
            className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'projection'
                ? 'bg-gradient-to-r from-[#00e5ff] via-[#a855f7] to-[#f43f5e] text-[#02060a] font-bold shadow-xs'
                : 'text-[#78909c] hover:text-[#eaf8ff]'
            }`}
            title="Canvas-based 3D mesh dynamically connecting Bloch spheres with light-trails representing entanglement entropy"
          >
            <Share2 className="w-3 h-3" />
            <span>Entanglement 3D Mesh</span>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
          </button>
        </div>
      </div>

      {/* Render Selected View Mode */}
      {viewMode === 'qsphere' ? (
        <QSphereVisualizer
          numQubits={numQubits}
          qstate={qstate}
          height={320}
        />
      ) : viewMode === 'projection' ? (
        <MultiQubitEntanglementProjection
          numQubits={numQubits}
          qstate={qstate}
          height={340}
          onFocusQubit={(q) => {
            setFocusedQubit(q);
          }}
        />
      ) : viewMode === '3d' ? (
        <ThreeBlochSphere3D
          numQubits={numQubits}
          qstate={qstate}
          activeQubit={focusedQubit}
          onSelectQubit={setFocusedQubit}
          height={320}
        />
      ) : (
        <div className="space-y-1">
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {Array.from({ length: numQubits }).map((_, q) => (
              <BlochSphereCard
                key={q}
                qubit={q}
                qstate={qstate}
                onClick={() => handleOpen3DForQubit(q)}
              />
            ))}
          </div>

          <div className="text-[10px] text-[#78909c] flex items-center justify-between pt-0.5">
            <span>Tip: Switch to Entanglement 3D Mesh to see dynamic light-trails connecting Bloch spheres as the circuit runs</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode('projection')}
                className="text-[#00e5ff] hover:text-[#38bdf8] flex items-center gap-1 cursor-pointer font-bold"
              >
                <Share2 className="w-3 h-3 text-[#a855f7]" />
                <span>Open Entanglement 3D Mesh</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface BlochSphereCardProps {
  qubit: number;
  qstate: QuantumState | null;
  onClick?: () => void;
}

const BlochSphereCard: React.FC<BlochSphereCardProps> = ({ qubit, qstate, onClick }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bv = qstate ? qstate.blochVector(qubit) : { x: 0, y: 0, z: 1 };

  const rLength = Math.min(1.0, Math.sqrt(bv.x * bv.x + bv.y * bv.y + bv.z * bv.z));
  const purity = (1 + rLength * rLength) / 2; // P = Tr(ρ^2)
  const isEntangled = rLength < 0.85;

  const theta = Math.acos(Math.max(-1, Math.min(1, rLength > 1e-4 ? bv.z / rLength : 0)));
  const phi = Math.atan2(bv.y, bv.x);
  const thetaDeg = Math.round((theta * 180) / Math.PI);
  const phiDeg = Math.round((phi * 180) / Math.PI);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 96;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const R = 36;

    ctx.clearRect(0, 0, size, size);

    // If entangled / mixed: highlight inner sphere decoherence fog
    if (isEntangled) {
      const fogGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, R * 0.9);
      fogGrad.addColorStop(0, 'rgba(168, 85, 247, 0.25)');
      fogGrad.addColorStop(0.7, 'rgba(168, 85, 247, 0.08)');
      fogGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
      ctx.fillStyle = fogGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();
    }

    // Sphere Outer Boundary
    ctx.strokeStyle = isEntangled ? 'rgba(168, 85, 247, 0.4)' : 'rgba(0, 229, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();

    // Equator ring
    ctx.strokeStyle = isEntangled ? 'rgba(168, 85, 247, 0.25)' : 'rgba(0, 229, 255, 0.15)';
    ctx.lineWidth = 0.75;
    ctx.beginPath();
    ctx.ellipse(cx, cy, R, R * 0.28, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Meridian line
    ctx.strokeStyle = isEntangled ? 'rgba(168, 85, 247, 0.2)' : 'rgba(0, 229, 255, 0.12)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, R * 0.28, R, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Coordinate Axes
    ctx.strokeStyle = 'rgba(120, 144, 156, 0.3)';
    ctx.lineWidth = 0.5;
    // Z-axis (vertical)
    ctx.beginPath();
    ctx.moveTo(cx, cy - R - 3);
    ctx.lineTo(cx, cy + R + 3);
    ctx.stroke();
    // X-axis (horizontal)
    ctx.beginPath();
    ctx.moveTo(cx - R - 3, cy);
    ctx.lineTo(cx + R + 3, cy);
    ctx.stroke();

    // Pole labels
    ctx.fillStyle = '#78909c';
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('|0⟩', cx, cy - R - 4);
    ctx.fillText('|1⟩', cx, cy + R + 9);

    // Projected State Vector (magnitude reflects pure vs mixed state)
    const px = cx + bv.x * R * 0.95;
    const py = cy - bv.z * R * 0.95;

    // Vector line
    const color = isEntangled ? '#c084fc' : (qubit % 2 === 0 ? '#00e5ff' : '#38bdf8');
    ctx.strokeStyle = color;
    ctx.lineWidth = isEntangled ? 2.5 : 2;
    if (isEntangled) {
      ctx.setLineDash([3, 2]);
    }
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.stroke();
    ctx.setLineDash([]);

    // Vector tip dot
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(px, py, isEntangled ? 4 : 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Center pivot dot
    ctx.fillStyle = 'rgba(234, 248, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }, [bv, qubit, isEntangled, rLength]);

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center p-2 rounded-xl border transition-all shrink-0 w-36 cursor-pointer text-left group shadow-sm ${
        isEntangled 
          ? 'bg-[#120822] hover:bg-[#1a0c32] border-purple-800/50 hover:border-purple-400' 
          : 'bg-[#09141d] hover:bg-[#0b1722] border-[rgba(0,229,255,0.15)] hover:border-[#00e5ff]'
      }`}
      title="Click to inspect in 3D WebGL Orbit Studio"
    >
      <div className="flex items-center justify-between w-full px-1 text-[11px] font-mono">
        <span className={`font-semibold ${isEntangled ? 'text-purple-300' : 'text-[#00e5ff]'} group-hover:text-white`}>
          q[{qubit}]
        </span>
        {isEntangled ? (
          <span className="text-[9px] px-1 rounded bg-purple-950 text-purple-300 border border-purple-800/60 font-bold">
            Entangled
          </span>
        ) : (
          <span className="text-[10px] text-[#78909c]">θ={thetaDeg}°</span>
        )}
      </div>

      <canvas ref={canvasRef} className="w-24 h-24 my-1 block" />

      <div className="w-full text-center text-[10px] font-mono text-[#78909c] flex items-center justify-around">
        <span>|r|={rLength.toFixed(2)}</span>
        <span className="text-slate-700">·</span>
        <span className={isEntangled ? 'text-purple-400 font-semibold' : 'text-cyan-400'}>
          P={purity.toFixed(2)}
        </span>
      </div>
    </button>
  );
};

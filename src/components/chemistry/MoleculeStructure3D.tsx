import React, { useRef, useEffect, useState } from 'react';
import { IndustrialMolecule } from './ChemistryTypes';
import { RotateCw, Eye, Sparkles } from 'lucide-react';

interface MoleculeStructure3DProps {
  molecule: IndustrialMolecule;
  bondDistanceScale: number; // multiplier based on bondDistance slider
}

export const MoleculeStructure3D: React.FC<MoleculeStructure3DProps> = ({
  molecule,
  bondDistanceScale
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotX, setRotX] = useState<number>(0.2);
  const [rotY, setRotY] = useState<number>(0.3);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Auto-rotation loop
  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setRotY(prev => prev + 0.015);
    }, 40);
    return () => clearInterval(interval);
  }, [autoRotate]);

  // Render 3D Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const scale = 75; // pixels per Angstrom

    // Apply rotation & bond distance scaling to atoms
    const projectedAtoms = molecule.atoms.map((atom, idx) => {
      // Scale position based on bond distance ratio
      const rawX = atom.x * bondDistanceScale;
      const rawY = atom.y * bondDistanceScale;
      const rawZ = atom.z * bondDistanceScale;

      // Rotate around Y axis
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x1 = rawX * cosY - rawZ * sinY;
      const z1 = rawX * sinY + rawZ * cosY;

      // Rotate around X axis
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const y2 = rawY * cosX - z1 * sinX;
      const z2 = rawY * sinX + z1 * cosX;

      // Perspective projection
      const fov = 350;
      const distance = 4.0;
      const pScale = fov / (distance - z2);

      return {
        id: idx,
        element: atom.element,
        color: atom.color,
        radius: atom.radius * (pScale / 120),
        px: cx + x1 * pScale,
        py: cy - y2 * pScale,
        depth: z2
      };
    });

    // Draw Bonds (sort by average depth)
    molecule.bonds.forEach(([i, j]) => {
      const a1 = projectedAtoms[i];
      const a2 = projectedAtoms[j];
      if (!a1 || !a2) return;

      const grad = ctx.createLinearGradient(a1.px, a1.py, a2.px, a2.py);
      grad.addColorStop(0, a1.color);
      grad.addColorStop(1, a2.color);

      ctx.strokeStyle = grad;
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(a1.px, a1.py);
      ctx.lineTo(a2.px, a2.py);
      ctx.stroke();
    });

    // Draw Atoms (sorted from back to front)
    const sortedAtoms = [...projectedAtoms].sort((a, b) => a.depth - b.depth);

    sortedAtoms.forEach(atom => {
      // Outer glow
      ctx.fillStyle = atom.color;
      ctx.shadowColor = atom.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(atom.px, atom.py, Math.max(6, atom.radius), 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Shading highlight (3D sphere illusion)
      const grad = ctx.createRadialGradient(
        atom.px - atom.radius * 0.3,
        atom.py - atom.radius * 0.3,
        atom.radius * 0.1,
        atom.px,
        atom.py,
        atom.radius
      );
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, atom.color);
      grad.addColorStop(1, '#050b11');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(atom.px, atom.py, Math.max(6, atom.radius), 0, Math.PI * 2);
      ctx.fill();

      // Element text label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(atom.element, atom.px, atom.py);
    });
  }, [molecule, bondDistanceScale, rotX, rotY]);

  return (
    <div className="flex flex-col space-y-2 font-mono text-xs">
      <div className="flex items-center justify-between text-slate-400">
        <span className="font-bold text-white text-xs flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span>3D Molecular Geometry &amp; Coordination Cluster</span>
        </span>
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
            autoRotate ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
          }`}
        >
          <RotateCw className={`w-3 h-3 ${autoRotate ? 'animate-spin' : ''}`} />
          <span>{autoRotate ? 'Spinning' : 'Static'}</span>
        </button>
      </div>

      <div
        className="w-full h-44 rounded-xl bg-[#02050b] border border-slate-850 flex items-center justify-center cursor-grab active:cursor-grabbing relative overflow-hidden"
        onMouseDown={(e) => {
          isDraggingRef.current = true;
          lastMousePosRef.current = { x: e.clientX, y: e.clientY };
        }}
        onMouseMove={(e) => {
          if (!isDraggingRef.current) return;
          const dx = e.clientX - lastMousePosRef.current.x;
          const dy = e.clientY - lastMousePosRef.current.y;
          setRotY(prev => prev + dx * 0.015);
          setRotX(prev => Math.max(-1.2, Math.min(1.2, prev + dy * 0.015)));
          lastMousePosRef.current = { x: e.clientX, y: e.clientY };
        }}
        onMouseUp={() => { isDraggingRef.current = false; }}
        onMouseLeave={() => { isDraggingRef.current = false; }}
      >
        <canvas
          ref={canvasRef}
          width={360}
          height={180}
          className="max-w-full max-h-full block"
        />
        <div className="absolute bottom-2 right-2 text-[9px] text-slate-500 pointer-events-none">
          Drag to rotate 3D view
        </div>
      </div>
    </div>
  );
};

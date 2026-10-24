import React, { useRef, useEffect, useState, useMemo } from 'react';
import { QuantumState, Complex, C } from '../types/quantum';
import { Rotate3d, Compass, Info, Sparkles, Sliders } from 'lucide-react';
import { playGateClickSound } from '../utils/audio';

interface QSphereVisualizerProps {
  numQubits: number;
  qstate: QuantumState | null;
  height?: number;
}

interface QSphereNode {
  index: number;
  bitstring: string;
  weight: number;
  prob: number;
  amp: Complex;
  mag: number;
  phase: number; // in radians [-PI, PI]
  // 3D coordinates on unit sphere
  x: number;
  y: number;
  z: number;
}

// Convert phase [-PI, PI] to clean HSL color string
function phaseToHsl(phase: number): string {
  // Normalize -PI..PI to 0..360 deg
  let hue = ((phase + Math.PI) / (2 * Math.PI)) * 360;
  return `hsl(${hue.toFixed(1)}, 90%, 55%)`;
}

export const QSphereVisualizer: React.FC<QSphereVisualizerProps> = ({
  numQubits,
  qstate,
  height = 340
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotX, setRotX] = useState<number>(0.35);
  const [rotY, setRotY] = useState<number>(-0.6);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [lastMouse, setLastMouse] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<QSphereNode | null>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);

  // Compute Q-Sphere nodes from actual statevector
  const nodes = useMemo<QSphereNode[]>(() => {
    if (!qstate) return [];
    const dim = qstate.dim;
    const probs = qstate.probabilities();
    const sv = qstate.sv;

    // Group indices by Hamming weight
    const byWeight: Record<number, number[]> = {};
    for (let w = 0; w <= numQubits; w++) byWeight[w] = [];
    for (let i = 0; i < dim; i++) {
      let count = 0;
      for (let b = 0; b < numQubits; b++) {
        if ((i >> b) & 1) count++;
      }
      byWeight[count].push(i);
    }

    const res: QSphereNode[] = [];
    for (let w = 0; w <= numQubits; w++) {
      const list = byWeight[w];
      const count = list.length;
      // Polar angle theta from 0 (north pole) to PI (south pole)
      const theta = numQubits === 0 ? 0 : (w / numQubits) * Math.PI;

      list.forEach((idx, k) => {
        // Azimuthal angle phi distributed around circle
        const phi = count === 1 ? 0 : (2 * Math.PI * k) / count;

        const amp = sv[idx] || [0, 0];
        const prob = probs[idx] || 0;
        const mag = Math.sqrt(prob);
        const phase = Math.atan2(amp[1] || 0, amp[0] || 0);

        // Spherical to Cartesian:
        // Y is up, X is right, Z is front
        const y = Math.cos(theta);
        const x = Math.sin(theta) * Math.cos(phi);
        const z = Math.sin(theta) * Math.sin(phi);

        res.push({
          index: idx,
          bitstring: idx.toString(2).padStart(numQubits, '0'),
          weight: w,
          prob,
          amp,
          mag,
          phase,
          x,
          y,
          z
        });
      });
    }

    return res;
  }, [qstate, numQubits]);

  // Handle Canvas mouse rotation
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setAutoRotate(false);
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDragging) {
      const dx = e.clientX - lastMouse.x;
      const dy = e.clientY - lastMouse.y;
      setRotY(prev => prev + dx * 0.008);
      setRotX(prev => Math.max(-Math.PI / 2, Math.min(Math.PI / 2, prev + dy * 0.008)));
      setLastMouse({ x: e.clientX, y: e.clientY });
    }

    // Hit test hovered node
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.38;

    let closest: QSphereNode | null = null;
    let minDist = 18;

    // Apply rotation transformation to check proximity
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);

    nodes.forEach(node => {
      // Rotate Y then X
      const x1 = node.x * cosY + node.z * sinY;
      const z1 = -node.x * sinY + node.z * cosY;
      const y1 = node.y * cosX - z1 * sinX;
      const z2 = node.y * sinX + z1 * cosX;

      // Only hit test if node is towards front or has significant prob
      const projX = cx + x1 * radius;
      const projY = cy - y1 * radius;
      const d = Math.hypot(mx - projX, my - projY);

      if (d < minDist && z2 > -0.6) {
        minDist = d;
        closest = node;
      }
    });

    setHoveredNode(closest);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      if (autoRotate && !isDragging) {
        setRotY(prev => prev + 0.0035);
      }

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const R = Math.min(w, h) * 0.38;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      // 1. Draw Background Glass Sphere Glow
      const bgGrad = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R);
      bgGrad.addColorStop(0, 'rgba(0, 229, 255, 0.08)');
      bgGrad.addColorStop(0.7, 'rgba(9, 20, 29, 0.7)');
      bgGrad.addColorStop(1, 'rgba(4, 8, 16, 0.95)');
      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, 2 * Math.PI);
      ctx.fill();

      // Sphere boundary ring
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, 2 * Math.PI);
      ctx.stroke();

      // 2. Draw Latitude Wireframe Rings
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.12)';
      ctx.lineWidth = 1;
      for (let wStep = 1; wStep < numQubits; wStep++) {
        const theta = (wStep / numQubits) * Math.PI;
        const ringY = Math.cos(theta);
        const ringR = Math.sin(theta) * R;

        ctx.beginPath();
        for (let a = 0; a <= 64; a++) {
          const angle = (a / 64) * 2 * Math.PI;
          const px = Math.cos(angle) * Math.sin(theta);
          const py = ringY;
          const pz = Math.sin(angle) * Math.sin(theta);

          const x1 = px * cosY + pz * sinY;
          const z1 = -px * sinY + pz * cosY;
          const y1 = py * cosX - z1 * sinX;

          const sx = cx + x1 * R;
          const sy = cy - y1 * R;
          if (a === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
      }

      // 3. Draw Axis Meridian Lines
      ctx.strokeStyle = 'rgba(120, 144, 156, 0.18)';
      ctx.beginPath();
      // Y axis (Z to -Z)
      const topY = cy - cosX * R;
      const botY = cy + cosX * R;
      ctx.moveTo(cx, topY);
      ctx.lineTo(cx, botY);
      ctx.stroke();

      // 4. Transform and sort nodes by depth (z)
      const transformed = nodes.map(node => {
        const x1 = node.x * cosY + node.z * sinY;
        const z1 = -node.x * sinY + node.z * cosY;
        const y1 = node.y * cosX - z1 * sinX;
        const z2 = node.y * sinX + z1 * cosX;

        return {
          node,
          px: cx + x1 * R,
          py: cy - y1 * R,
          depth: z2
        };
      });

      // Sort back-to-front
      transformed.sort((a, b) => a.depth - b.depth);

      // 5. Draw Spokes & State Nodes
      transformed.forEach(({ node, px, py, depth }) => {
        const isHovered = hoveredNode?.index === node.index;
        const hasProb = node.prob > 1e-4;

        // Base node radius based on probability amplitude
        const minR = 3.5;
        const maxR = 18;
        const r = hasProb ? minR + node.mag * (maxR - minR) : 2.5;

        // Depth dimming
        const alpha = depth > 0 ? 0.95 : Math.max(0.2, 0.5 + depth * 0.4);

        // Draw Spoke from center if state is populated
        if (hasProb) {
          ctx.strokeStyle = isHovered ? 'rgba(0, 229, 255, 0.85)' : `rgba(0, 229, 255, ${alpha * 0.45})`;
          ctx.lineWidth = isHovered ? 2 : 1;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(px, py);
          ctx.stroke();
        }

        // Draw Node Circle
        ctx.beginPath();
        ctx.arc(px, py, isHovered ? r * 1.35 : r, 0, 2 * Math.PI);

        if (hasProb) {
          ctx.fillStyle = phaseToHsl(node.phase);
          ctx.shadowColor = phaseToHsl(node.phase);
          ctx.shadowBlur = isHovered ? 14 : 6;
          ctx.fill();
          ctx.shadowBlur = 0;

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = isHovered ? 2 : 1;
          ctx.stroke();

          // Text label for populated or hovered node
          if (node.prob > 0.04 || isHovered) {
            ctx.fillStyle = '#ffffff';
            ctx.font = isHovered ? 'bold 11px monospace' : '10px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(`|${node.bitstring}⟩`, px, py - (isHovered ? r * 1.4 : r) - 2);

            // Probability badge
            ctx.fillStyle = 'rgba(0, 229, 255, 0.9)';
            ctx.font = '9px monospace';
            ctx.fillText(`${(node.prob * 100).toFixed(1)}%`, px, py + (isHovered ? r * 1.4 : r) + 10);
          }
        } else {
          // Zero probability ghost node
          ctx.fillStyle = `rgba(120, 144, 156, ${alpha * 0.4})`;
          ctx.fill();
        }
      });
    };

    render();
  }, [nodes, rotX, rotY, autoRotate, isDragging, hoveredNode, numQubits]);

  return (
    <div className="flex flex-col lg:flex-row items-center gap-4 bg-[#050b11] p-4 rounded-xl border border-cyan-800/40 font-mono text-xs">
      
      {/* 3D Canvas Area */}
      <div className="relative flex-1 flex items-center justify-center min-h-[320px] w-full select-none">
        <canvas
          ref={canvasRef}
          width={480}
          height={height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="cursor-grab active:cursor-grabbing block w-full max-w-[480px]"
        />

        {/* Orbit / Auto-Rotate Toggle Overlay */}
        <div className="absolute top-2 left-2 flex items-center gap-2 bg-[#09141d]/90 p-1.5 rounded-lg border border-slate-800 text-[11px]">
          <button
            onClick={() => {
              playGateClickSound(700);
              setAutoRotate(!autoRotate);
            }}
            className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
              autoRotate ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-400 hover:text-white'
            }`}
          >
            {autoRotate ? 'Auto-Orbit ON' : 'Orbit Paused'}
          </button>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400 text-[10px]">Drag to rotate 3D sphere</span>
        </div>

        {/* Phase Color Wheel Legend */}
        <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-[#09141d]/90 px-2.5 py-1.5 rounded-lg border border-slate-800 text-[10px]">
          <span className="text-slate-400">Phase (φ):</span>
          <div className="w-20 h-2.5 rounded-full bg-gradient-to-r from-red-500 via-yellow-400 via-green-400 via-cyan-400 via-purple-500 to-red-500" />
          <span className="text-cyan-300 font-bold">-π → +π</span>
        </div>
      </div>

      {/* State Inspector Card on Right */}
      <div className="w-full lg:w-72 shrink-0 p-4 rounded-xl bg-[#09141d] border border-cyan-800/40 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-1.5 font-bold text-white text-xs">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Multi-Qubit Q-Sphere</span>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px]">
            {numQubits} QUBITS · {1 << numQubits} DIM
          </span>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          The Q-Sphere maps all {1 << numQubits} computational basis states onto a single spherical topology. Latitude encodes Hamming weight; radius encodes probability $|\alpha|^2$; hue encodes phase $\arg(\alpha)$.
        </p>

        {/* Selected / Hovered Node Telemetry */}
        <div className="p-3 rounded-lg bg-[#040810] border border-slate-850 space-y-2">
          <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center justify-between">
            <span>Inspected Basis State:</span>
            {hoveredNode && (
              <span className="text-cyan-400 font-bold">Hamming Weight: {hoveredNode.weight}</span>
            )}
          </div>

          {hoveredNode ? (
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Basis Bitstring:</span>
                <span className="text-white font-bold text-sm">|{hoveredNode.bitstring}⟩</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Probability:</span>
                <span className="text-cyan-300 font-bold">{(hoveredNode.prob * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Amplitude α:</span>
                <span className="text-purple-300 font-mono text-[11px]">
                  {hoveredNode.amp[0].toFixed(3)} {hoveredNode.amp[1] >= 0 ? '+' : '-'} {Math.abs(hoveredNode.amp[1]).toFixed(3)}i
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Phase φ:</span>
                <span className="text-amber-300 font-bold">
                  {(hoveredNode.phase).toFixed(3)} rad ({(hoveredNode.phase * (180 / Math.PI)).toFixed(1)}°)
                </span>
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-[11px] italic py-2 text-center">
              Hover over any node on the sphere to inspect amplitude, phase, and probability.
            </div>
          )}
        </div>

        {/* Superposition Summary */}
        <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between items-center">
          <span>Active States ($P &gt; 0$):</span>
          <span className="text-white font-bold">
            {nodes.filter(n => n.prob > 1e-4).length} of {nodes.length}
          </span>
        </div>
      </div>

    </div>
  );
};

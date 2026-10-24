import React, { useRef, useEffect, useState, useMemo } from 'react';
import { QuantumState, Complex, C, GateOp } from '../types/quantum';
import { ALGORITHMS, AlgorithmItem } from '../data/algorithms';
import { 
  Share2, 
  ShieldAlert, 
  CheckCircle2, 
  Rotate3d, 
  Play, 
  Pause, 
  Maximize2, 
  Sparkles,
  Layers,
  Compass
} from 'lucide-react';

interface EntanglementVisualizerProps {
  numQubits: number;
  qstate: QuantumState | null;
  onSelectAlgorithm?: (algo: AlgorithmItem) => void;
  selectedAlgoId?: string;
}

export const EntanglementVisualizer: React.FC<EntanglementVisualizerProps> = ({
  numQubits,
  qstate,
  onSelectAlgorithm,
  selectedAlgoId = 'bell'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedPair, setSelectedPair] = useState<[number, number]>([0, Math.min(1, numQubits - 1)]);

  // 3D Camera Controls State
  const [rotX, setRotX] = useState<number>(0.35); // Pitch (elevation)
  const [rotY, setRotY] = useState<number>(0.0);  // Yaw (azimuth)
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [particleSpeed, setParticleSpeed] = useState<number>(1.0);
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Single qubit von Neumann entropy S(ρ_i)
  const singleQubitEntropies = useMemo(() => {
    if (!qstate) return new Array(numQubits).fill(0);
    return Array.from({ length: numQubits }, (_, q) => {
      const bv = qstate.blochVector(q);
      const r = Math.min(1, Math.sqrt(bv.x * bv.x + bv.y * bv.y + bv.z * bv.z));
      const p0 = (1 + r) / 2;
      const p1 = (1 - r) / 2;
      return (p0 > 1e-10 ? -p0 * Math.log2(p0) : 0) + (p1 > 1e-10 ? -p1 * Math.log2(p1) : 0);
    });
  }, [qstate, numQubits]);

  // System entropy
  const systemEntropy = qstate ? qstate.entropy() : 0;

  // Pairwise linear entropy S_L(i, j) = 1 - Tr(ρ_ij^2)
  const mutualMatrix = useMemo(() => {
    if (!qstate) return Array.from({ length: numQubits }, () => new Array(numQubits).fill(0));
    return Array.from({ length: numQubits }, (_, i) =>
      Array.from({ length: numQubits }, (_, j) =>
        i === j ? singleQubitEntropies[i] : qstate.linearEntropy2(i, j)
      )
    );
  }, [qstate, numQubits, singleQubitEntropies]);

  // CHSH Bell inequality test correlator
  const chshResult = useMemo(() => {
    if (!qstate || selectedPair[0] >= numQubits || selectedPair[1] >= numQubits || selectedPair[0] === selectedPair[1]) {
      return null;
    }
    const [qi, qj] = selectedPair;

    const pauliDirMatrix = (theta: number): [Complex[], Complex[]] => [
      [[Math.cos(theta), 0], [Math.sin(theta), 0]],
      [[Math.sin(theta), 0], [-Math.cos(theta), 0]]
    ];

    const correlator = (tI: number, tJ: number): number => {
      const clone = qstate.clone();
      clone.applyGate(qi, pauliDirMatrix(tI));
      clone.applyGate(qj, pauliDirMatrix(tJ));
      let re = 0;
      for (let k = 0; k < qstate.dim; k++) {
        const [ar, ai] = qstate.sv[k];
        const [br, bi] = clone.sv[k];
        re += ar * br + ai * bi;
      }
      return re;
    };

    const a = 0;
    const ap = Math.PI / 2;
    const b = Math.PI / 4;
    const bp = (3 * Math.PI) / 4;

    const Eab = correlator(a, b);
    const Eabp = correlator(a, bp);
    const Eapb = correlator(ap, b);
    const Eapbp = correlator(ap, bp);
    const S = Eab - Eabp + Eapb + Eapbp;
    const violates = Math.abs(S) > 2.0001;

    return { S: Math.abs(S), violates, Eab, Eabp, Eapb, Eapbp };
  }, [qstate, selectedPair, numQubits]);

  // 3D Particles Simulation along entanglement paths
  const particlesRef = useRef<Array<{
    from: number;
    to: number;
    progress: number;
    speed: number;
    size: number;
    color: string;
  }>>([]);

  // Initialize particles when matrix updates
  useEffect(() => {
    const list: typeof particlesRef.current = [];
    for (let i = 0; i < numQubits; i++) {
      for (let j = i + 1; j < numQubits; j++) {
        const str = mutualMatrix[i][j];
        if (str > 0.05) {
          const count = Math.max(3, Math.round(str * 14));
          for (let p = 0; p < count; p++) {
            list.push({
              from: i,
              to: j,
              progress: Math.random(),
              speed: (0.003 + Math.random() * 0.006) * (0.8 + str * 0.8),
              size: 2 + Math.random() * 2,
              color: str > 0.6 ? '#f43f5e' : str > 0.3 ? '#f59e0b' : '#22d3ee'
            });
          }
        }
      }
    }
    particlesRef.current = list;
  }, [numQubits, mutualMatrix]);

  // Main 3D Animation Render Loop
  useEffect(() => {
    let animId: number;
    let yaw = rotY;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (autoRotate && !isDraggingRef.current) {
        yaw += 0.006 * particleSpeed;
      }

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
      }
      ctx.save();
      ctx.scale(dpr, dpr);

      const W = rect.width;
      const H = rect.height;
      ctx.clearRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2;
      const sphereRadius = Math.min(W, H) * 0.36;

      // 3D Projection math
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      // Compute 3D node positions on horizontal ring with slight vertical wave
      const nodes3D = Array.from({ length: numQubits }, (_, i) => {
        const theta = (i * 2 * Math.PI) / numQubits;
        const x0 = sphereRadius * Math.cos(theta);
        const y0 = Math.sin(theta * 2) * (sphereRadius * 0.2);
        const z0 = sphereRadius * Math.sin(theta);

        // Rotate around Y axis (yaw)
        const x1 = x0 * cosY + z0 * sinY;
        const z1 = -x0 * sinY + z0 * cosY;

        // Rotate around X axis (pitch)
        const y2 = y0 * cosX - z1 * sinX;
        const z2 = y0 * sinX + z1 * cosX;

        // Perspective projection
        const fov = 450;
        const scale = fov / (fov + z2);
        const projX = cx + x1 * scale;
        const projY = cy + y2 * scale;

        return {
          idx: i,
          x3d: x1,
          y3d: y2,
          z3d: z2,
          scale,
          projX,
          projY,
          entropy: singleQubitEntropies[i]
        };
      });

      // Sort objects by depth z3d (painter's algorithm)
      const sortedNodes = [...nodes3D].sort((a, b) => a.z3d - b.z3d);

      // Background Quantum Grid Rings (rotated in 3D)
      ctx.lineWidth = 1;
      [0.4, 0.75, 1.0].forEach(f => {
        ctx.strokeStyle = `rgba(51, 65, 85, ${0.12 * f})`;
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2; a += 0.1) {
          const rx = sphereRadius * f * Math.cos(a);
          const rz = sphereRadius * f * Math.sin(a);
          const rx1 = rx * cosY + rz * sinY;
          const rz1 = -rx * sinY + rz * cosY;
          const ry2 = -rz1 * sinX;
          const rz2 = rz1 * cosX;
          const sc = 450 / (450 + rz2);
          const px = cx + rx1 * sc;
          const py = cy + ry2 * sc;
          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      });

      // Draw 3D Entanglement Arcs
      for (let i = 0; i < numQubits; i++) {
        for (let j = i + 1; j < numQubits; j++) {
          const str = mutualMatrix[i][j];
          if (str < 0.03) continue;

          const n1 = nodes3D[i];
          const n2 = nodes3D[j];

          // 3D midpoint pulled slightly toward central non-local manifold (0, 0, 0)
          const midX3D = (n1.x3d + n2.x3d) / 2 * 0.7;
          const midY3D = (n1.y3d + n2.y3d) / 2 * 0.7;
          const midZ3D = (n1.z3d + n2.z3d) / 2 * 0.7;

          const scMid = 450 / (450 + midZ3D);
          const midProjX = cx + midX3D * scMid;
          const midProjY = cy + midY3D * scMid;

          const depthAlpha = Math.max(0.15, Math.min(1.0, (scMid - 0.5) * 2));
          const colBase = str > 0.6 ? '244, 63, 94' : str > 0.3 ? '245, 158, 11' : '34, 211, 238';

          // Glow trail
          ctx.strokeStyle = `rgba(${colBase}, ${(str * 0.85 * depthAlpha).toFixed(2)})`;
          ctx.lineWidth = Math.max(1, str * 4.5 * scMid);
          ctx.beginPath();
          ctx.moveTo(n1.projX, n1.projY);
          ctx.quadraticCurveTo(midProjX, midProjY, n2.projX, n2.projY);
          ctx.stroke();

          // Correlation magnitude readout
          if (str > 0.25) {
            ctx.fillStyle = str > 0.6 ? '#fb7185' : str > 0.3 ? '#fcd34d' : '#67e8f9';
            ctx.font = '9px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(str.toFixed(2), midProjX, midProjY - 4);
          }
        }
      }

      // Draw Animated 3D Quantum Particles flowing along entanglement channels
      particlesRef.current.forEach(p => {
        p.progress += p.speed * particleSpeed;
        if (p.progress > 1) p.progress = 0;

        const nFrom = nodes3D[p.from];
        const nTo = nodes3D[p.to];
        if (!nFrom || !nTo) return;

        // Quadratic Bezier interpolation in 3D
        const t = p.progress;
        const midX3D = (nFrom.x3d + nTo.x3d) / 2 * 0.7;
        const midY3D = (nFrom.y3d + nTo.y3d) / 2 * 0.7;
        const midZ3D = (nFrom.z3d + nTo.z3d) / 2 * 0.7;

        const pX3D = (1 - t) * (1 - t) * nFrom.x3d + 2 * (1 - t) * t * midX3D + t * t * nTo.x3d;
        const pY3D = (1 - t) * (1 - t) * nFrom.y3d + 2 * (1 - t) * t * midY3D + t * t * nTo.y3d;
        const pZ3D = (1 - t) * (1 - t) * nFrom.z3d + 2 * (1 - t) * t * midZ3D + t * t * nTo.z3d;

        const scP = 450 / (450 + pZ3D);
        const px = cx + pX3D * scP;
        const py = cy + pY3D * scP;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(px, py, p.size * scP, 0, Math.PI * 2);
        ctx.fill();
      });

      // Central Quantum Core Node (Non-local Manifold Center)
      const coreScale = 450 / 450;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 22 * coreScale, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = '700 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('NON-LOCAL', cx, cy - 4);
      ctx.fillText(`${systemEntropy.toFixed(2)}b`, cx, cy + 7);

      // Render 3D Qubit Nodes sorted by depth
      sortedNodes.forEach(node => {
        const baseRadius = 16 + node.entropy * 9;
        const radius = Math.max(10, baseRadius * node.scale);
        const col = node.entropy > 0.7 ? '#f43f5e' : node.entropy > 0.3 ? '#f59e0b' : '#06b6d4';

        // Outer glow halo
        ctx.strokeStyle = col;
        ctx.lineWidth = 2 * node.scale;
        ctx.beginPath();
        ctx.arc(node.projX, node.projY, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#090b10';
        ctx.beginPath();
        ctx.arc(node.projX, node.projY, radius, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = '#f8fafc';
        ctx.font = `600 ${Math.round(11 * node.scale)}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`q[${node.idx}]`, node.projX, node.projY - 4 * node.scale);

        ctx.fillStyle = col;
        ctx.font = `${Math.round(9 * node.scale)}px "JetBrains Mono", monospace`;
        ctx.fillText(`S=${node.entropy.toFixed(2)}`, node.projX, node.projY + 7 * node.scale);
      });

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [numQubits, singleQubitEntropies, mutualMatrix, systemEntropy, rotX, rotY, autoRotate, particleSpeed]);

  // Mouse drag handlers for 3D orbit rotation
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    setRotY(prev => prev + dx * 0.01);
    setRotX(prev => Math.max(-1.2, Math.min(1.2, prev + dy * 0.01)));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#07090e]">
      {/* Algorithm Selector Subsection Bar (Directly within Entanglement!) */}
      <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/80 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
        <div className="flex items-center gap-1.5 text-cyan-400 font-mono font-semibold shrink-0 pr-2 border-r border-slate-800">
          <Layers className="w-3.5 h-3.5" />
          <span>ENTANGLEMENT PRESET:</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {ALGORITHMS.map(a => {
            const isSelected = selectedAlgoId === a.id;
            return (
              <button
                key={a.id}
                onClick={() => onSelectAlgorithm?.(a)}
                className={`px-2.5 py-1 rounded text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
                title={a.desc}
              >
                {a.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 3D Stage & Diagnostics Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left: 3D Animated Flow Canvas */}
        <div className="lg:col-span-7 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Rotate3d className="w-4 h-4 text-cyan-400" />
              <span>3D Quantum Entanglement Flow &amp; Non-Local Information Graph</span>
            </div>

            {/* 3D Orbit Controls Toolbar */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`px-2 py-0.5 rounded border text-[11px] flex items-center gap-1 cursor-pointer ${
                  autoRotate ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
                title="Toggle 3D Orbit Auto-Rotation"
              >
                {autoRotate ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>Auto-Spin</span>
              </button>

              <button
                onClick={() => { setRotX(0.35); setRotY(0); }}
                className="px-2 py-0.5 rounded bg-slate-900 border border-slate-750 text-slate-300 hover:text-white text-[11px] cursor-pointer"
                title="Reset Camera Angle"
              >
                Reset 3D
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-[380px] relative bg-[#05070c] rounded-lg border border-slate-800/80 overflow-hidden select-none">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="w-full h-full block cursor-grab active:cursor-grabbing"
            />

            {/* 3D Viewport Controls HUD Overlay */}
            <div className="absolute bottom-3 left-3 flex items-center gap-3 bg-slate-950/80 backdrop-blur-xs px-3 py-1.5 rounded-md border border-slate-800/80 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1 text-slate-300">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>Pitch: {(rotX * (180 / Math.PI)).toFixed(0)}°</span>
                <span>·</span>
                <span>Yaw: {(rotY * (180 / Math.PI)).toFixed(0)}°</span>
              </span>
              <span className="text-slate-700">|</span>
              <span className="text-slate-500 hidden sm:inline">Drag mouse to orbit 3D space</span>
            </div>

            {/* Particle Speed Scrubber */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-slate-950/80 backdrop-blur-xs px-2.5 py-1 rounded-md border border-slate-800/80 text-[11px] font-mono text-slate-400">
              <span>Flow Speed:</span>
              <button
                onClick={() => setParticleSpeed(prev => (prev === 1.0 ? 2.0 : prev === 2.0 ? 0.5 : 1.0))}
                className="text-cyan-300 font-bold hover:underline cursor-pointer"
              >
                {particleSpeed}×
              </button>
            </div>
          </div>
        </div>

        {/* Right: Quantum Telemetry, CHSH Bell Test, & Mutual Information */}
        <div className="lg:col-span-5 p-4 flex flex-col gap-4 overflow-y-auto">
          {/* System Statistics Cards */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 text-xs font-mono">
              <div className="text-[10px] uppercase text-slate-500 font-semibold">Total S(ρ)</div>
              <div className="text-lg font-bold text-cyan-300 mt-0.5">{systemEntropy.toFixed(3)}</div>
              <div className="text-[10px] text-slate-500">Von Neumann Bits</div>
            </div>
            <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 text-xs font-mono">
              <div className="text-[10px] uppercase text-slate-500 font-semibold">Max Entangled</div>
              <div className="text-lg font-bold text-rose-400 mt-0.5">
                {singleQubitEntropies.filter(s => s > 0.7).length} / {numQubits} Q
              </div>
              <div className="text-[10px] text-slate-500">S &gt; 0.7 Bits</div>
            </div>
            <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 text-xs font-mono">
              <div className="text-[10px] uppercase text-slate-500 font-semibold">Partial Ent.</div>
              <div className="text-lg font-bold text-amber-400 mt-0.5">
                {singleQubitEntropies.filter(s => s >= 0.3 && s <= 0.7).length} Q
              </div>
              <div className="text-[10px] text-slate-500">0.3–0.7 Bits</div>
            </div>
          </div>

          {/* Per-Qubit Entanglement Gauges */}
          <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
            <div className="text-xs font-mono font-semibold text-slate-300 mb-2">
              Per-Qubit Entanglement Entropy S(ρᵢ)
            </div>
            <div className="space-y-1.5">
              {singleQubitEntropies.map((s, q) => {
                const pct = (s * 100).toFixed(0);
                const col = s > 0.7 ? 'bg-rose-500' : s > 0.3 ? 'bg-amber-400' : 'bg-cyan-400';
                return (
                  <div key={q} className="flex items-center gap-2 text-xs font-mono">
                    <span className="w-10 text-cyan-300 font-semibold">q[{q}]</span>
                    <div className="flex-1 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div className={`h-full ${col} rounded-full transition-all duration-300`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-12 text-right text-slate-300 tabular-nums">{s.toFixed(3)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mutual Information Grid */}
          <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
            <div className="text-xs font-mono font-semibold text-slate-300 mb-2">
              Pairwise Linear Entropy Matrix S_L(i, j) = 1 - Tr(ρ_ij²)
            </div>
            <div className="overflow-x-auto">
              <div className="grid gap-1 font-mono text-[11px] w-fit" style={{ gridTemplateColumns: `repeat(${numQubits + 1}, minmax(32px, 1fr))` }}>
                <div className="h-6 flex items-center justify-center font-bold text-slate-500" />
                {Array.from({ length: numQubits }).map((_, j) => (
                  <div key={j} className="h-6 flex items-center justify-center font-bold text-cyan-400">
                    q{j}
                  </div>
                ))}
                {Array.from({ length: numQubits }).map((_, i) => (
                  <React.Fragment key={i}>
                    <div className="h-6 flex items-center justify-center font-bold text-cyan-400">
                      q{i}
                    </div>
                    {Array.from({ length: numQubits }).map((_, j) => {
                      const v = mutualMatrix[i][j];
                      const bg = i === j ? 'bg-cyan-950/40 text-cyan-300' : v > 0.5 ? 'bg-rose-950/40 text-rose-300' : v > 0.2 ? 'bg-amber-950/40 text-amber-300' : 'bg-slate-950 text-slate-500';
                      return (
                        <div key={j} className={`h-6 rounded flex items-center justify-center border border-slate-800/60 tabular-nums ${bg}`}>
                          {v.toFixed(2)}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* CHSH Bell Inequality Test */}
          <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>CHSH Bell Inequality Test</span>
              </div>
              {numQubits >= 2 && (
                <div className="flex items-center gap-1 text-xs font-mono">
                  <span className="text-slate-500 text-[11px]">Pair:</span>
                  <select
                    value={`${selectedPair[0]},${selectedPair[1]}`}
                    onChange={(e) => {
                      const [q0, q1] = e.target.value.split(',').map(Number);
                      setSelectedPair([q0, q1]);
                    }}
                    className="bg-slate-950 text-cyan-300 text-xs px-2 py-0.5 rounded border border-slate-800 outline-none cursor-pointer"
                  >
                    {Array.from({ length: numQubits }).flatMap((_, i) =>
                      Array.from({ length: numQubits })
                        .filter((_, j) => i < j)
                        .map((_, j) => (
                          <option key={`${i},${j}`} value={`${i},${j}`}>
                            q[{i}] &amp; q[{j}]
                          </option>
                        ))
                    )}
                  </select>
                </div>
              )}
            </div>

            {chshResult ? (
              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">CHSH Parameter |S|:</span>
                  <span className={`text-base font-bold tabular-nums ${chshResult.violates ? 'text-rose-400' : 'text-slate-300'}`}>
                    {chshResult.S.toFixed(4)}
                  </span>
                </div>

                <div className={`p-2.5 rounded border text-xs leading-relaxed ${chshResult.violates ? 'bg-rose-950/30 border-rose-800/60 text-rose-200' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                  {chshResult.violates ? (
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <strong>Bell Inequality VIOLATED (|S| &gt; 2.0).</strong> Non-local quantum correlations verified between q[{selectedPair[0]}] and q[{selectedPair[1]}].
                      </div>
                    </div>
                  ) : (
                    <div>
                      No violation (|S| ≤ 2.0). The correlations between q[{selectedPair[0]}] and q[{selectedPair[1]}] are local/classical.
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

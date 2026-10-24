import React, { useRef, useEffect, useState, useMemo } from 'react';
import { QuantumState, Complex, C } from '../types/quantum';
import { 
  Rotate3d, 
  Layers, 
  Sparkles, 
  Activity, 
  Maximize2, 
  RefreshCw, 
  Play, 
  Pause, 
  Sliders, 
  Share2, 
  Zap, 
  Info,
  CircleDot,
  Eye
} from 'lucide-react';
import { playGateClickSound } from '../utils/audio';

interface MultiQubitEntanglementProjectionProps {
  numQubits: number;
  qstate: QuantumState | null;
  height?: number;
  onFocusQubit?: (qubit: number) => void;
}

interface ParticleTrail {
  from: number;
  to: number;
  progress: number;
  speed: number;
  size: number;
  color: string;
}

export const MultiQubitEntanglementProjection: React.FC<MultiQubitEntanglementProjectionProps> = ({
  numQubits,
  qstate,
  height = 360,
  onFocusQubit
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 3D Camera Angles & Interaction State
  const [rotX, setRotX] = useState<number>(0.35); // Pitch (elevation)
  const [rotY, setRotY] = useState<number>(0.0);  // Yaw (azimuth)
  const [zoom, setZoom] = useState<number>(1.0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [orbitSpeed, setOrbitSpeed] = useState<number>(1.0);
  const [topology, setTopology] = useState<'ring' | 'lattice' | 'linear'>('ring');
  const [filterThreshold, setFilterThreshold] = useState<number>(0.03);
  const [selectedQubit, setSelectedQubit] = useState<number | null>(null);
  const [hoveredQubit, setHoveredQubit] = useState<number | null>(null);

  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rotYRef = useRef<number>(rotY);
  rotYRef.current = rotY;
  const rotXRef = useRef<number>(rotX);
  rotXRef.current = rotX;

  // Single-qubit Bloch vectors, purities, and von Neumann entropies
  const qubitAnalytics = useMemo(() => {
    return Array.from({ length: numQubits }, (_, q) => {
      const bv = qstate ? qstate.blochVector(q) : { x: 0, y: 0, z: 1 };
      const r = Math.min(1.0, Math.sqrt(bv.x * bv.x + bv.y * bv.y + bv.z * bv.z));
      const purity = (1 + r * r) / 2; // Tr(ρ^2)
      const p0 = (1 + r) / 2;
      const p1 = (1 - r) / 2;
      const entropy = (p0 > 1e-10 ? -p0 * Math.log2(p0) : 0) + (p1 > 1e-10 ? -p1 * Math.log2(p1) : 0);
      const isEntangled = r < 0.85;

      const theta = Math.acos(Math.max(-1, Math.min(1, r > 1e-4 ? bv.z / r : 0)));
      const phi = Math.atan2(bv.y, bv.x);

      const reduced = qstate ? qstate.reducedState(q) : {
        r00: [1, 0] as Complex,
        r01: [0, 0] as Complex,
        r10: [0, 0] as Complex,
        r11: [0, 0] as Complex
      };

      return {
        qubit: q,
        bv,
        r,
        purity,
        entropy,
        isEntangled,
        thetaDeg: Math.round((theta * 180) / Math.PI),
        phiDeg: Math.round((phi * 180) / Math.PI),
        reduced
      };
    });
  }, [qstate, numQubits]);

  // Pairwise linear entanglement entropy S_L(i, j) = 1 - Tr(ρ_ij^2)
  const mutualMatrix = useMemo(() => {
    if (!qstate) return Array.from({ length: numQubits }, () => new Array(numQubits).fill(0));
    return Array.from({ length: numQubits }, (_, i) =>
      Array.from({ length: numQubits }, (_, j) => {
        if (i === j) return qubitAnalytics[i].entropy;
        return qstate.linearEntropy2(i, j);
      })
    );
  }, [qstate, numQubits, qubitAnalytics]);

  // Active Entanglement Pairs above threshold
  const activeEntangledLinks = useMemo(() => {
    const links: Array<{ q1: number; q2: number; str: number }> = [];
    for (let i = 0; i < numQubits; i++) {
      for (let j = i + 1; j < numQubits; j++) {
        const str = mutualMatrix[i][j];
        if (str >= filterThreshold) {
          links.push({ q1: i, q2: j, str });
        }
      }
    }
    return links.sort((a, b) => b.str - a.str);
  }, [mutualMatrix, numQubits, filterThreshold]);

  // Animated photon particles traveling along 3D entanglement light-trails
  const particlesRef = useRef<ParticleTrail[]>([]);

  useEffect(() => {
    const list: ParticleTrail[] = [];
    activeEntangledLinks.forEach(link => {
      const count = Math.max(3, Math.min(10, Math.round(link.str * 10)));
      for (let p = 0; p < count; p++) {
        list.push({
          from: link.q1,
          to: link.q2,
          progress: Math.random(),
          speed: (0.004 + Math.random() * 0.005) * (0.8 + link.str * 1.2),
          size: 2 + Math.random() * 2.5,
          color: link.str > 0.6 ? '#f43f5e' : link.str > 0.25 ? '#a855f7' : '#00e5ff'
        });
      }
    });
    particlesRef.current = list;
  }, [activeEntangledLinks]);

  // Global State Classification Summary
  const globalEntanglementSummary = useMemo(() => {
    const maxStr = activeEntangledLinks.length > 0 ? activeEntangledLinks[0].str : 0;
    const entangledCount = qubitAnalytics.filter(q => q.isEntangled).length;

    if (entangledCount === 0 && maxStr < 0.05) {
      return {
        label: 'Separable Product State |ψ⟩ = |q₀⟩ ⊗ |q₁⟩',
        tag: 'PURE SEPARABLE',
        color: 'text-cyan-400 border-cyan-800/60 bg-cyan-950/40'
      };
    }
    if (entangledCount === 2 && maxStr > 0.5) {
      return {
        label: `Bipartite Bell State Pair (|00⟩ + |11⟩)/√2 (q[${activeEntangledLinks[0].q1}], q[${activeEntangledLinks[0].q2}])`,
        tag: 'MAXIMAL BELL PAIR',
        color: 'text-rose-400 border-rose-800/60 bg-rose-950/40'
      };
    }
    if (entangledCount >= 3 && maxStr > 0.4) {
      return {
        label: `Multipartite GHZ Entanglement (${entangledCount} Qubits Correlated)`,
        tag: 'MULTIPARTITE GHZ',
        color: 'text-purple-400 border-purple-800/60 bg-purple-950/40'
      };
    }
    return {
      label: `Partially Entangled Mixed Subsystem (${activeEntangledLinks.length} Active Correlations)`,
      tag: 'MIXED ENTANGLED',
      color: 'text-amber-400 border-amber-800/60 bg-amber-950/40'
    };
  }, [activeEntangledLinks, qubitAnalytics]);

  // Main 3D Canvas Render Loop with Perspective Projection & Light-Trails
  useEffect(() => {
    let animId: number;
    let yaw = rotYRef.current;
    let rippleTick = 0;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      rippleTick += 0.04;

      if (autoRotate && !isDraggingRef.current) {
        yaw += 0.005 * orbitSpeed;
        rotYRef.current = yaw;
      } else {
        yaw = rotYRef.current;
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

      // 3D Camera Angles
      const pitch = rotXRef.current;
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const cosX = Math.cos(pitch);
      const sinX = Math.sin(pitch);

      const fov = 460;
      const baseRadius = Math.min(W, H) * 0.38 * zoom;

      // 1. Calculate 3D Coordinates for each qubit node
      const nodes3D = Array.from({ length: numQubits }, (_, i) => {
        let x0 = 0;
        let y0 = 0;
        let z0 = 0;

        if (topology === 'ring') {
          const theta = (i * 2 * Math.PI) / numQubits;
          x0 = baseRadius * Math.cos(theta);
          y0 = Math.sin(theta * 2) * (baseRadius * 0.15); // gentle 3D wave
          z0 = baseRadius * Math.sin(theta);
        } else if (topology === 'lattice') {
          // 3D Hyper-lattice or bipartite grid
          const cols = Math.ceil(Math.sqrt(numQubits));
          const row = Math.floor(i / cols);
          const col = i % cols;
          const spacing = 110 * zoom;
          x0 = (col - (cols - 1) / 2) * spacing;
          z0 = (row - (Math.ceil(numQubits / cols) - 1) / 2) * spacing;
          y0 = (i % 2 === 0 ? 1 : -1) * 20;
        } else {
          // Linear Ion Trap / Transmon Chain
          const spacing = 80 * zoom;
          x0 = (i - (numQubits - 1) / 2) * spacing;
          y0 = Math.sin(i * 1.2) * 15;
          z0 = Math.cos(i * 1.2) * 20;
        }

        // Camera Rotation around Y (Yaw)
        const x1 = x0 * cosY + z0 * sinY;
        const z1 = -x0 * sinY + z0 * cosY;

        // Camera Rotation around X (Pitch)
        const y2 = y0 * cosX - z1 * sinX;
        const z2 = y0 * sinX + z1 * cosX;

        // Perspective Projection
        const scale = fov / (fov + z2);
        const projX = cx + x1 * scale;
        const projY = cy + y2 * scale;

        return {
          idx: i,
          x0, y0, z0,
          x3d: x1,
          y3d: y2,
          z3d: z2,
          scale,
          projX,
          projY,
          analytics: qubitAnalytics[i]
        };
      });

      // 2. Draw 3D Ground Perspective Matrix Rings
      ctx.lineWidth = 1;
      [0.4, 0.75, 1.0].forEach(ringRatio => {
        ctx.strokeStyle = `rgba(51, 65, 85, ${0.15 * ringRatio})`;
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2; a += 0.12) {
          const gx0 = baseRadius * ringRatio * Math.cos(a);
          const gy0 = 50; // Floor offset
          const gz0 = baseRadius * ringRatio * Math.sin(a);

          const gx1 = gx0 * cosY + gz0 * sinY;
          const gz1 = -gx0 * sinY + gz0 * cosY;
          const gy2 = gy0 * cosX - gz1 * sinX;
          const gz2 = gy0 * sinX + gz1 * cosX;

          const gscale = fov / (fov + gz2);
          const gpx = cx + gx1 * gscale;
          const gpy = cy + gy2 * gscale;

          if (a === 0) ctx.moveTo(gpx, gpy);
          else ctx.lineTo(gpx, gpy);
        }
        ctx.closePath();
        ctx.stroke();
      });

      // 3. Draw Dynamic Entanglement Light-Trails (3D Catenary Arcs with Glowing Beam)
      activeEntangledLinks.forEach(link => {
        const n1 = nodes3D[link.q1];
        const n2 = nodes3D[link.q2];
        if (!n1 || !n2) return;

        // Calculate 3D Arch Control Point (lifting into Y-dimension)
        const midX0 = (n1.x0 + n2.x0) / 2;
        const midY0 = Math.min(n1.y0, n2.y0) - (55 + link.str * 45) * zoom;
        const midZ0 = (n1.z0 + n2.z0) / 2;

        const mx1 = midX0 * cosY + midZ0 * sinY;
        const mz1 = -midX0 * sinY + midZ0 * cosY;
        const my2 = midY0 * cosX - mz1 * sinX;
        const mz2 = midY0 * sinX + mz1 * cosX;

        const mscale = fov / (fov + mz2);
        const ctrlX = cx + mx1 * mscale;
        const ctrlY = cy + my2 * mscale;

        const isHighlighted = selectedQubit === link.q1 || selectedQubit === link.q2;
        const trailColor = link.str > 0.6 ? '#f43f5e' : link.str > 0.25 ? '#c084fc' : '#00e5ff';

        // Outer Ambient Glow
        ctx.strokeStyle = link.str > 0.6 
          ? `rgba(244, 63, 94, ${isHighlighted ? 0.35 : 0.2})` 
          : `rgba(0, 229, 255, ${isHighlighted ? 0.35 : 0.18})`;
        ctx.lineWidth = (4 + link.str * 6) * ((n1.scale + n2.scale) / 2);
        ctx.beginPath();
        ctx.moveTo(n1.projX, n1.projY);
        ctx.quadraticCurveTo(ctrlX, ctrlY, n2.projX, n2.projY);
        ctx.stroke();

        // Core Laser Filament
        ctx.strokeStyle = isHighlighted ? '#ffffff' : trailColor;
        ctx.lineWidth = Math.max(1.2, (1.2 + link.str * 2.5) * ((n1.scale + n2.scale) / 2));
        ctx.beginPath();
        ctx.moveTo(n1.projX, n1.projY);
        ctx.quadraticCurveTo(ctrlX, ctrlY, n2.projX, n2.projY);
        ctx.stroke();

        // Mid-point Entropy Value Pill in 3D Space
        if (link.str > 0.15) {
          ctx.fillStyle = 'rgba(5, 11, 17, 0.85)';
          ctx.strokeStyle = trailColor;
          ctx.lineWidth = 1;
          const badgeW = 42;
          const badgeH = 16;
          ctx.beginPath();
          ctx.roundRect(ctrlX - badgeW / 2, ctrlY - badgeH / 2, badgeW, badgeH, 4);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`S:${link.str.toFixed(2)}`, ctrlX, ctrlY);
        }
      });

      // 4. Update and Render Quantum Streaming Photons along Light-Trails
      particlesRef.current.forEach(p => {
        p.progress = (p.progress + p.speed * orbitSpeed) % 1.0;

        const n1 = nodes3D[p.from];
        const n2 = nodes3D[p.to];
        if (!n1 || !n2) return;

        // Arch control point in 3D
        const midX0 = (n1.x0 + n2.x0) / 2;
        const midY0 = Math.min(n1.y0, n2.y0) - (55 + (mutualMatrix[p.from][p.to] || 0.5) * 45) * zoom;
        const midZ0 = (n1.z0 + n2.z0) / 2;

        const mx1 = midX0 * cosY + midZ0 * sinY;
        const mz1 = -midX0 * sinY + midZ0 * cosY;
        const my2 = midY0 * cosX - mz1 * sinX;
        const mz2 = midY0 * sinX + mz1 * cosX;

        const mscale = fov / (fov + mz2);
        const ctrlX = cx + mx1 * mscale;
        const ctrlY = cy + my2 * mscale;

        // Quadratic Bezier interpolation: B(t) = (1-t)^2 P0 + 2(1-t)t P1 + t^2 P2
        const t = p.progress;
        const it = 1 - t;
        const px = it * it * n1.projX + 2 * it * t * ctrlX + t * t * n2.projX;
        const py = it * it * n1.projY + 2 * it * t * ctrlY + t * t * n2.projY;

        // Depth scale for particle
        const pScale = it * n1.scale + t * n2.scale;

        // Draw glowing photon head
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(px, py, p.size * pScale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Comet tail
        const tailT = Math.max(0, t - 0.05);
        const itTail = 1 - tailT;
        const tailPx = itTail * itTail * n1.projX + 2 * itTail * tailT * ctrlX + tailT * tailT * n2.projX;
        const tailPy = itTail * itTail * n1.projY + 2 * itTail * tailT * ctrlY + tailT * tailT * n2.projY;

        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size * 0.6 * pScale;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(tailPx, tailPy);
        ctx.stroke();
      });

      // 5. Sort Nodes by Depth (Painter's Algorithm) & Render Miniature 3D Bloch Spheres
      const sortedNodes = [...nodes3D].sort((a, b) => a.z3d - b.z3d);

      sortedNodes.forEach(node => {
        const q = node.idx;
        const an = node.analytics;
        const sRadius = 32 * node.scale * zoom;
        const isSelected = selectedQubit === q;
        const isHovered = hoveredQubit === q;

        // Ambient Spherical Backfill with depth shading
        const sphereGrad = ctx.createRadialGradient(
          node.projX - sRadius * 0.3,
          node.projY - sRadius * 0.3,
          sRadius * 0.1,
          node.projX,
          node.projY,
          sRadius
        );
        sphereGrad.addColorStop(0, an.isEntangled ? 'rgba(76, 29, 149, 0.45)' : 'rgba(8, 51, 68, 0.55)');
        sphereGrad.addColorStop(1, an.isEntangled ? 'rgba(24, 9, 50, 0.85)' : 'rgba(2, 10, 18, 0.85)');

        ctx.fillStyle = sphereGrad;
        ctx.beginPath();
        ctx.arc(node.projX, node.projY, sRadius, 0, Math.PI * 2);
        ctx.fill();

        // Outer Spherical Boundary Ring
        ctx.strokeStyle = isSelected
          ? '#f59e0b'
          : an.isEntangled
          ? 'rgba(192, 132, 252, 0.8)'
          : 'rgba(0, 229, 255, 0.6)';
        ctx.lineWidth = isSelected ? 2.5 : 1.2;
        ctx.beginPath();
        ctx.arc(node.projX, node.projY, sRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Resonance Ripple if highly entangled
        if (an.entropy > 0.7) {
          const ripR = sRadius + ((rippleTick * 18 + q * 10) % 24);
          const ripAlpha = Math.max(0, 1 - (ripR - sRadius) / 24) * 0.5;
          ctx.strokeStyle = `rgba(244, 63, 94, ${ripAlpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(node.projX, node.projY, ripR, 0, Math.PI * 2);
          ctx.stroke();
        }

        // 3D Equator Ellipse
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.ellipse(node.projX, node.projY, sRadius, sRadius * Math.sin(pitch), 0, 0, Math.PI * 2);
        ctx.stroke();

        // 3D Polar Axis (+Z at top |0>, -Z at bottom |1>)
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.5)';
        ctx.beginPath();
        ctx.moveTo(node.projX, node.projY - sRadius);
        ctx.lineTo(node.projX, node.projY + sRadius);
        ctx.stroke();

        // Internal Decoherence Fog (when mixed/entangled state)
        if (an.isEntangled) {
          const fogR = sRadius * (1 - an.r);
          const fogGrad = ctx.createRadialGradient(node.projX, node.projY, 0, node.projX, node.projY, fogR);
          fogGrad.addColorStop(0, 'rgba(244, 63, 94, 0.45)');
          fogGrad.addColorStop(1, 'rgba(244, 63, 94, 0.0)');
          ctx.fillStyle = fogGrad;
          ctx.beginPath();
          ctx.arc(node.projX, node.projY, fogR, 0, Math.PI * 2);
          ctx.fill();
        }

        // 3D Bloch Vector Orientation: Project (x, y, z) into camera view
        const bv = an.bv;
        const vx1 = bv.x * cosY + bv.z * sinY;
        const vz1 = -bv.x * sinY + bv.z * cosY;
        const vy2 = bv.y * cosX - vz1 * sinX;

        const tipX = node.projX + vx1 * sRadius;
        const tipY = node.projY - vy2 * sRadius; // Screen Y inverted

        // Bloch Vector Line
        ctx.strokeStyle = an.isEntangled ? '#f43f5e' : '#00e5ff';
        ctx.lineWidth = 2.2;
        if (an.isEntangled) {
          ctx.setLineDash([3, 2]); // Dashed indicates mixed interior vector
        }
        ctx.beginPath();
        ctx.moveTo(node.projX, node.projY);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Vector Tip Bead with Bloom
        ctx.fillStyle = an.isEntangled ? '#fb7185' : '#38bdf8';
        ctx.shadowColor = an.isEntangled ? '#f43f5e' : '#00e5ff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(tipX, tipY, 3.5 * node.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label above Sphere: q[i]
        ctx.fillStyle = isSelected ? '#f59e0b' : '#ffffff';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`q[${q}]`, node.projX, node.projY - sRadius - 8);

        // Subtext: Entropy & Purity
        ctx.fillStyle = an.isEntangled ? '#f43f5e' : '#38bdf8';
        ctx.font = '9px monospace';
        ctx.fillText(
          an.isEntangled ? `S:${an.entropy.toFixed(2)}b` : `P:${(an.purity * 100).toFixed(0)}%`,
          node.projX,
          node.projY + sRadius + 14
        );
      });

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [numQubits, qstate, zoom, autoRotate, orbitSpeed, topology, activeEntangledLinks, mutualMatrix, qubitAnalytics, selectedQubit, hoveredQubit]);

  // Pointer/Mouse Drag Handlers for 3D Camera Orbit
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    setRotY(prev => {
      const next = prev + dx * 0.008;
      rotYRef.current = next;
      return next;
    });

    setRotX(prev => {
      const next = Math.max(-1.1, Math.min(1.1, prev + dy * 0.008));
      rotXRef.current = next;
      return next;
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  // Click on Canvas to Select/Focus Qubit
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Check hit test against spheres
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const yaw = rotYRef.current;
    const pitch = rotXRef.current;
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);
    const cosX = Math.cos(pitch);
    const sinX = Math.sin(pitch);
    const fov = 460;
    const baseRadius = Math.min(rect.width, rect.height) * 0.38 * zoom;

    let clickedQ: number | null = null;
    let minD = 9999;

    for (let i = 0; i < numQubits; i++) {
      let x0 = 0, y0 = 0, z0 = 0;
      if (topology === 'ring') {
        const theta = (i * 2 * Math.PI) / numQubits;
        x0 = baseRadius * Math.cos(theta);
        y0 = Math.sin(theta * 2) * (baseRadius * 0.15);
        z0 = baseRadius * Math.sin(theta);
      } else if (topology === 'lattice') {
        const cols = Math.ceil(Math.sqrt(numQubits));
        x0 = (i % cols - (cols - 1) / 2) * 110 * zoom;
        z0 = (Math.floor(i / cols) - (Math.ceil(numQubits / cols) - 1) / 2) * 110 * zoom;
      } else {
        x0 = (i - (numQubits - 1) / 2) * 80 * zoom;
      }

      const x1 = x0 * cosY + z0 * sinY;
      const z1 = -x0 * sinY + z0 * cosY;
      const y2 = y0 * cosX - z1 * sinX;
      const z2 = y0 * sinX + z1 * cosX;

      const scale = fov / (fov + z2);
      const px = cx + x1 * scale;
      const py = cy + y2 * scale;
      const dist = Math.hypot(clickX - px, clickY - py);

      if (dist < 35 && dist < minD) {
        minD = dist;
        clickedQ = i;
      }
    }

    if (clickedQ !== null) {
      playGateClickSound(700);
      setSelectedQubit(clickedQ);
      if (onFocusQubit) onFocusQubit(clickedQ);
    } else {
      setSelectedQubit(null);
    }
  };

  const selectedAnalytics = selectedQubit !== null ? qubitAnalytics[selectedQubit] : null;

  return (
    <div className="relative flex flex-col w-full bg-[#030610] rounded-xl border border-[rgba(0,229,255,0.2)] overflow-hidden font-mono text-xs select-none">
      
      {/* 1. Header Toolbar */}
      <div className="px-4 py-2.5 bg-[#070e17] border-b border-[rgba(0,229,255,0.15)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Share2 className="w-4 h-4 text-[#00e5ff]" />
          <span className="font-bold text-white text-xs uppercase tracking-wider">
            Multi-Qubit Entanglement Projection Mesh
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${globalEntanglementSummary.color}`}>
            {globalEntanglementSummary.tag}
          </span>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2">
          {/* Topology Selector */}
          <div className="flex items-center bg-[#09141d] rounded-lg border border-slate-800 p-0.5 text-[11px]">
            {(['ring', 'lattice', 'linear'] as const).map(t => (
              <button
                key={t}
                onClick={() => {
                  playGateClickSound(500);
                  setTopology(t);
                }}
                className={`px-2 py-0.5 rounded capitalize cursor-pointer transition-colors ${
                  topology === t ? 'bg-[#00e5ff] text-[#02060a] font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Auto-Orbit Toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 cursor-pointer transition-colors ${
              autoRotate
                ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-300 font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Toggle 3D Auto-Orbit rotation"
          >
            {autoRotate ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span className="text-[10px]">{autoRotate ? 'Orbiting' : 'Orbit'}</span>
          </button>

          {/* Speed Switcher */}
          <button
            onClick={() => setOrbitSpeed(prev => (prev === 1.0 ? 2.0 : prev === 2.0 ? 0.5 : 1.0))}
            className="px-2 py-1 rounded bg-[#09141d] border border-slate-800 text-slate-300 hover:text-cyan-400 text-[10px] font-bold cursor-pointer"
            title="Adjust 3D rotation speed"
          >
            {orbitSpeed}x
          </button>

          {/* Reset Camera */}
          <button
            onClick={() => {
              playGateClickSound(450);
              setRotX(0.35);
              setRotY(0.0);
              rotXRef.current = 0.35;
              rotYRef.current = 0.0;
              setZoom(1.0);
            }}
            className="p-1.5 rounded-lg bg-[#09141d] border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Reset 3D Camera view"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Interactive 3D Canvas Viewport */}
      <div className="relative w-full overflow-hidden" style={{ height: `${height}px` }}>
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onClick={handleCanvasClick}
          onWheel={(e) => {
            e.preventDefault();
            setZoom(prev => Math.max(0.6, Math.min(1.8, prev - e.deltaY * 0.001)));
          }}
          className="w-full h-full block cursor-grab active:cursor-grabbing touch-none"
        />

        {/* Top-Left Telemetry Overlay */}
        <div className="absolute top-3 left-3 pointer-events-none space-y-1">
          <div className="text-[10px] text-cyan-300 font-bold bg-[#050b11]/85 border border-cyan-500/30 px-2 py-1 rounded backdrop-blur-xs flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>{globalEntanglementSummary.label}</span>
          </div>

          <div className="text-[9px] text-[#78909c] bg-[#050b11]/80 px-2 py-0.5 rounded border border-slate-800">
            Active Entangled Pairs: <strong className="text-white">{activeEntangledLinks.length}</strong> · Max Mutual Info S_L: <strong className="text-rose-400">
              {activeEntangledLinks.length > 0 ? activeEntangledLinks[0].str.toFixed(3) : '0.000'}
            </strong>
          </div>
        </div>

        {/* Top-Right Drag Hint */}
        <div className="absolute top-3 right-3 pointer-events-none text-[9px] text-slate-500 bg-[#050b11]/80 px-2 py-0.5 rounded border border-slate-800 hidden sm:block">
          Drag to Orbit 3D Space · Scroll to Zoom
        </div>

        {/* Floating Selected Qubit HUD Card */}
        {selectedAnalytics && (
          <div className="absolute bottom-3 left-3 bg-[#09141d]/95 border border-cyan-500/40 p-3 rounded-xl shadow-lg backdrop-blur-md max-w-xs space-y-2 z-10">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <CircleDot className="w-3.5 h-3.5 text-cyan-400" />
                <span>Qubit q[{selectedAnalytics.qubit}] Projections</span>
              </span>
              <button
                onClick={() => setSelectedQubit(null)}
                className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <span className="text-slate-400 block">Purity Tr(ρ²):</span>
                <span className="font-bold text-white">{(selectedAnalytics.purity * 100).toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-slate-400 block">Entropy S(ρ):</span>
                <span className={selectedAnalytics.isEntangled ? 'font-bold text-rose-400' : 'font-bold text-cyan-400'}>
                  {selectedAnalytics.entropy.toFixed(3)} bits
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Bloch Vector |r|:</span>
                <span className="font-bold text-slate-200">{selectedAnalytics.r.toFixed(3)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Spherical (θ, φ):</span>
                <span className="font-bold text-slate-200">
                  {selectedAnalytics.thetaDeg}°, {selectedAnalytics.phiDeg}°
                </span>
              </div>
            </div>

            {/* Reduced Density Matrix ρ */}
            <div className="pt-1 border-t border-slate-800/80">
              <span className="text-[9px] text-[#78909c] block mb-1">Reduced State ρ = Tr_{'{other}'}(|ψ⟩⟨ψ|):</span>
              <div className="grid grid-cols-2 gap-1 text-[9px] text-center font-mono bg-black/60 p-1 rounded border border-slate-800">
                <span className="text-cyan-300">ρ₀₀ = {selectedAnalytics.reduced.r00[0].toFixed(2)}</span>
                <span className="text-purple-300">ρ₀₁ = {selectedAnalytics.reduced.r01[0].toFixed(2)}{selectedAnalytics.reduced.r01[1] >= 0 ? '+' : ''}{selectedAnalytics.reduced.r01[1].toFixed(2)}i</span>
                <span className="text-purple-300">ρ₁₀ = {selectedAnalytics.reduced.r10[0].toFixed(2)}{selectedAnalytics.reduced.r10[1] >= 0 ? '+' : ''}{selectedAnalytics.reduced.r10[1].toFixed(2)}i</span>
                <span className="text-cyan-300">ρ₁₁ = {selectedAnalytics.reduced.r11[0].toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Bottom Legend Strip */}
      <div className="px-4 py-2 bg-[#050b11] border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[10px] text-[#78909c]">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00e5ff] shadow-xs" />
            <span>Pure State (|r| ≈ 1.0)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e] shadow-xs" />
            <span>Entangled Mixed Subsystem (|r| &lt; 0.85)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-0.5 bg-gradient-to-r from-cyan-400 to-rose-500" />
            <span>Light-Trail (Entanglement Entropy S_L)</span>
          </span>
        </div>

        {/* Filter Slider */}
        <div className="flex items-center gap-2">
          <span>Trail Sensitivity:</span>
          <input
            type="range"
            min="0"
            max="0.3"
            step="0.01"
            value={filterThreshold}
            onChange={(e) => setFilterThreshold(+e.target.value)}
            className="w-16 h-1 bg-slate-800 accent-[#00e5ff] rounded cursor-pointer"
          />
          <span className="text-white font-bold">{filterThreshold.toFixed(2)}</span>
        </div>
      </div>

    </div>
  );
};

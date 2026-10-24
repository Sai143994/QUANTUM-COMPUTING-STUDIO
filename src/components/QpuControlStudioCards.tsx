import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Play, 
  Sparkles, 
  Rotate3d, 
  Zap, 
  Radio, 
  Cpu, 
  Layers, 
  RefreshCw, 
  Check, 
  Activity,
  Sliders,
  ShieldCheck,
  Award,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
  Flame,
  Gauge,
  Waves,
  Compass,
  CheckCircle2,
  Info,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { playGateClickSound, playMeasurementCollapseSound } from '../utils/audio';

interface QpuControlStudioCardsProps {
  className?: string;
}

export type StudioCardView = 'all' | 'bloch' | 'entangle' | 'circuit' | 'pulse' | 'thermo' | 'scaling';

export const QpuControlStudioCards: React.FC<QpuControlStudioCardsProps> = ({ className = '' }) => {
  // =========================================================================
  // 1. QUBIT REPRESENTATION STATE (3D BLOCH SPHERE & DENSITY MATRIX)
  // =========================================================================
  const [qubitPreset, setQubitPreset] = useState<'superposition' | 'zero' | 'one' | 'plus' | 'minus' | 'i'>('superposition');
  const [theta, setTheta] = useState<number>(Math.PI / 2); // Polar angle [0, pi]
  const [phi, setPhi] = useState<number>(0); // Azimuthal angle [0, 2pi]
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const blochCanvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{ isDragging: boolean; lastX: number; lastY: number }>({ isDragging: false, lastX: 0, lastY: 0 });
  const [camRotX, setCamRotX] = useState<number>(0.2);
  const [camRotY, setCamRotY] = useState<number>(0.3);

  // Apply gate rotations to the Bloch vector
  const applyGate = (gate: 'X' | 'Y' | 'Z' | 'H' | 'S' | 'T' | 'RESET') => {
    playGateClickSound(700);
    if (gate === 'RESET') {
      setTheta(0);
      setPhi(0);
      setQubitPreset('zero');
      return;
    }

    if (gate === 'X') {
      // Bit flip: theta -> pi - theta, phi -> -phi
      setTheta(prev => Math.PI - prev);
      setPhi(prev => (prev === 0 ? 0 : 2 * Math.PI - prev));
    } else if (gate === 'Y') {
      // Bit & phase flip
      setTheta(prev => Math.PI - prev);
      setPhi(prev => (prev + Math.PI) % (2 * Math.PI));
    } else if (gate === 'Z') {
      // Phase flip: phi -> phi + pi
      setPhi(prev => (prev + Math.PI) % (2 * Math.PI));
    } else if (gate === 'H') {
      // Hadamard: rotates (x <-> z)
      if (Math.abs(theta) < 0.1) {
        setTheta(Math.PI / 2);
        setPhi(0);
      } else if (Math.abs(theta - Math.PI) < 0.1) {
        setTheta(Math.PI / 2);
        setPhi(Math.PI);
      } else {
        setTheta(0);
        setPhi(0);
      }
    } else if (gate === 'S') {
      // +pi/2 phase
      setPhi(prev => (prev + Math.PI / 2) % (2 * Math.PI));
    } else if (gate === 'T') {
      // +pi/4 phase
      setPhi(prev => (prev + Math.PI / 4) % (2 * Math.PI));
    }
  };

  // Synchronize angles when preset changes
  useEffect(() => {
    if (qubitPreset === 'zero') { setTheta(0); setPhi(0); }
    else if (qubitPreset === 'one') { setTheta(Math.PI); setPhi(0); }
    else if (qubitPreset === 'plus') { setTheta(Math.PI / 2); setPhi(0); }
    else if (qubitPreset === 'minus') { setTheta(Math.PI / 2); setPhi(Math.PI); }
    else if (qubitPreset === 'i') { setTheta(Math.PI / 2); setPhi(Math.PI / 2); }
    else if (qubitPreset === 'superposition') { setTheta(Math.PI / 2); setPhi(0); }
  }, [qubitPreset]);

  // Derived quantum amplitudes
  const alpha = +Math.cos(theta / 2).toFixed(3);
  const beta = +Math.sin(theta / 2).toFixed(3);
  const prob0 = +(Math.pow(Math.cos(theta / 2), 2) * 100).toFixed(1);
  const prob1 = +(Math.pow(Math.sin(theta / 2), 2) * 100).toFixed(1);
  const rx = +(Math.sin(theta) * Math.cos(phi)).toFixed(3);
  const ry = +(Math.sin(theta) * Math.sin(phi)).toFixed(3);
  const rz = +Math.cos(theta).toFixed(3);

  // Auto-rotation loop
  useEffect(() => {
    if (!isRotating) return;
    const interval = setInterval(() => {
      setCamRotY(prev => prev + 0.012);
    }, 40);
    return () => clearInterval(interval);
  }, [isRotating]);

  // Render 3D Bloch Sphere
  useEffect(() => {
    const canvas = blochCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const R = 64;

    ctx.clearRect(0, 0, w, h);

    // 3D rotation projection helper
    const project = (x: number, y: number, z: number) => {
      // Y rotation
      const cosY = Math.cos(camRotY);
      const sinY = Math.sin(camRotY);
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;

      // X rotation
      const cosX = Math.cos(camRotX);
      const sinX = Math.sin(camRotX);
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      const fov = 260;
      const pScale = fov / (260 - z2);
      return { px: cx + x1 * pScale, py: cy - y2 * pScale, depth: z2 };
    };

    // Draw Outer Glow Sphere
    const grad = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R);
    grad.addColorStop(0, 'rgba(0, 229, 255, 0.18)');
    grad.addColorStop(0.7, 'rgba(168, 85, 247, 0.08)');
    grad.addColorStop(1, 'rgba(0, 229, 255, 0.02)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();

    // Sphere Silhouette Border
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();

    // Draw Equator Circle (XY plane)
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.15) {
      const { px, py } = project(Math.cos(a) * R, 0, Math.sin(a) * R);
      if (a === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Prime Meridian Circle (XZ plane)
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.15) {
      const { px, py } = project(Math.sin(a) * R, Math.cos(a) * R, 0);
      if (a === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Coordinate Axes: Z (vertical)
    const zTop = project(0, R + 14, 0);
    const zBot = project(0, -(R + 14), 0);
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.7)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(zBot.px, zBot.py);
    ctx.lineTo(zTop.px, zTop.py);
    ctx.stroke();
    ctx.fillStyle = '#00e5ff';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('|0⟩ (+z)', zTop.px + 4, zTop.py - 4);
    ctx.fillText('|1⟩ (-z)', zBot.px + 4, zBot.py + 10);

    // X Axis
    const xPos = project(R + 14, 0, 0);
    const xNeg = project(-(R + 14), 0, 0);
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
    ctx.beginPath();
    ctx.moveTo(xNeg.px, xNeg.py);
    ctx.lineTo(xPos.px, xPos.py);
    ctx.stroke();
    ctx.fillText('|+⟩ (x)', xPos.px + 4, xPos.py + 4);

    // Y Axis
    const yPos = project(0, 0, R + 14);
    const yNeg = project(0, 0, -(R + 14));
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)';
    ctx.beginPath();
    ctx.moveTo(yNeg.px, yNeg.py);
    ctx.lineTo(yPos.px, yPos.py);
    ctx.stroke();
    ctx.fillText('|i⟩ (y)', yPos.px + 4, yPos.py + 4);

    // State Vector Coordinates on Bloch Sphere
    // x = R*sin(theta)*cos(phi), y = R*cos(theta), z = R*sin(theta)*sin(phi)
    const vx = R * Math.sin(theta) * Math.cos(phi);
    const vy = R * Math.cos(theta);
    const vz = R * Math.sin(theta) * Math.sin(phi);
    const tip = project(vx, vy, vz);

    // State Vector Line with Cyan Glow
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(tip.px, tip.py);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Glowing Arrowhead / Dot
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(tip.px, tip.py, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Drop line to XY equator plane
    const foot = project(vx, 0, vz);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(tip.px, tip.py);
    ctx.lineTo(foot.px, foot.py);
    ctx.lineTo(cx, cy);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [theta, phi, camRotX, camRotY]);

  // =========================================================================
  // 2. QUANTUM ENTANGLEMENT & BELL-CHSH TEST STATE
  // =========================================================================
  const [bellMode, setBellMode] = useState<'phi_plus' | 'phi_minus' | 'psi_plus' | 'psi_minus'>('phi_plus');
  const [chshRunning, setChshRunning] = useState<boolean>(false);
  const entCanvasRef = useRef<HTMLCanvasElement>(null);

  // Bell-CHSH violation score: S = 2 * sqrt(2) ≈ 2.828 (Tsirelson's bound)
  const chshParameter = 2.828;

  useEffect(() => {
    const canvas = entCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = () => {
      time += 0.04;
      const w = canvas.width;
      const h = canvas.height;
      const q1x = 42;
      const q1y = h / 2;
      const q2x = w - 42;
      const q2y = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Multi-fiber non-local quantum wavepacket link
      const strands = 6;
      for (let s = 0; s < strands; s++) {
        const offset = (s - (strands - 1) / 2) * 5.5;
        const phase = time * 1.5 + s * 0.9;
        const isCyan = s % 2 === 0;

        ctx.strokeStyle = isCyan ? 'rgba(0, 229, 255, 0.75)' : 'rgba(217, 70, 239, 0.75)';
        ctx.lineWidth = 1.8;
        ctx.shadowColor = isCyan ? '#00e5ff' : '#d946ef';
        ctx.shadowBlur = 8;

        ctx.beginPath();
        ctx.moveTo(q1x, q1y);
        for (let x = q1x; x <= q2x; x += 4) {
          const t = (x - q1x) / (q2x - q1x);
          const env = Math.sin(t * Math.PI); // Envelope (0 at endpoints)
          const wave = Math.sin(t * Math.PI * 4 + phase) * 14 * env + offset * env;
          ctx.lineTo(x, q1y + wave);
        }
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      // Qubit 1 Coherent Transmon Island (Cyan Sphere)
      const q1Grad = ctx.createRadialGradient(q1x - 3, q1y - 3, 2, q1x, q1y, 22);
      q1Grad.addColorStop(0, '#e0f7fa');
      q1Grad.addColorStop(0.35, '#00e5ff');
      q1Grad.addColorStop(1, '#005b64');
      ctx.fillStyle = q1Grad;
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(q1x, q1y, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Qubit 2 Coherent Transmon Island (Magenta Sphere)
      const q2Grad = ctx.createRadialGradient(q2x - 3, q2y - 3, 2, q2x, q2y, 22);
      q2Grad.addColorStop(0, '#fdf4ff');
      q2Grad.addColorStop(0.35, '#d946ef');
      q2Grad.addColorStop(1, '#701a75');
      ctx.fillStyle = q2Grad;
      ctx.shadowColor = '#d946ef';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(q2x, q2y, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [bellMode]);

  // =========================================================================
  // 3. QUANTUM CIRCUIT STATE & 1,024 SHOT SIMULATOR
  // =========================================================================
  const [circuitPreset, setCircuitPreset] = useState<'bell' | 'superposition' | 'swap' | 'phase_entangler'>('bell');
  const [simRunning, setSimRunning] = useState<boolean>(false);
  const [shots, setShots] = useState<number>(1024);
  const [circuitCounts, setCircuitCounts] = useState<{ c00: number; c01: number; c10: number; c11: number }>({
    c00: 512,
    c01: 0,
    c10: 0,
    c11: 512
  });

  const handleRunSimulation = () => {
    if (simRunning) return;
    setSimRunning(true);
    playGateClickSound(750);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setCircuitCounts({
        c00: Math.round(shots * (0.2 + Math.random() * 0.1)),
        c01: Math.round(shots * (0.2 + Math.random() * 0.1)),
        c10: Math.round(shots * (0.2 + Math.random() * 0.1)),
        c11: Math.round(shots * (0.2 + Math.random() * 0.1))
      });

      if (step >= 8) {
        clearInterval(interval);
        setSimRunning(false);
        playMeasurementCollapseSound();

        // Exact terminal counts based on circuit preset
        if (circuitPreset === 'bell') {
          const noise = Math.round((Math.random() - 0.5) * 24);
          setCircuitCounts({ c00: 512 + noise, c01: 0, c10: 0, c11: 512 - noise });
        } else if (circuitPreset === 'superposition') {
          setCircuitCounts({ c00: 256, c01: 256, c10: 256, c11: 256 });
        } else if (circuitPreset === 'swap') {
          setCircuitCounts({ c00: 0, c01: 1024, c10: 0, c11: 0 });
        } else {
          setCircuitCounts({ c00: 512, c01: 0, c10: 0, c11: 512 });
        }
      }
    }, 70);
  };

  // =========================================================================
  // 4. ACTIVE STUDIO CARD VIEW FILTER
  // =========================================================================
  const [activeStudioSection, setActiveStudioSection] = useState<StudioCardView>('all');

  // =========================================================================
  // 5. AWG DRAG MICROWAVE PULSE SYNTHESIZER STATE
  // =========================================================================
  const [pulseDurationNs, setPulseDurationNs] = useState<number>(24);
  const [dragBeta, setDragBeta] = useState<number>(0.42);
  const [anharmonicityMhz, setAnharmonicityMhz] = useState<number>(-320);
  const [pulseDriveFreqGhz, setPulseDriveFreqGhz] = useState<number>(5.241);
  const [pulseShape, setPulseShape] = useState<'drag' | 'gaussian' | 'flattop'>('drag');
  const pulseCanvasRef = useRef<HTMLCanvasElement>(null);

  const gateFidelityWithDrag = useMemo(() => {
    if (pulseShape === 'drag') {
      const betaDist = Math.abs(dragBeta - 0.42);
      return Math.max(99.1, +(99.96 - betaDist * 0.4).toFixed(2));
    }
    return 98.65;
  }, [pulseShape, dragBeta]);

  // Render Real-Time AWG Waveform (Time Domain I/Q & Frequency Domain Spectral Notch)
  useEffect(() => {
    const canvas = pulseCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Background grid
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Split Canvas: Left = Time Domain Waveform, Right = Spectral Notch
    const midX = w * 0.52;

    // Divider line
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(midX, 4);
    ctx.lineTo(midX, h - 4);
    ctx.stroke();

    // ----------------------------------------------------
    // LEFT: TIME DOMAIN ENVELOPES (I and Q)
    // ----------------------------------------------------
    const centerY = h * 0.55;
    const tMax = pulseDurationNs;
    const sigma = tMax / 4;

    // Draw baseline
    ctx.strokeStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(10, centerY);
    ctx.lineTo(midX - 15, centerY);
    ctx.stroke();

    // Generate I(t) and Q(t)
    const pointsI: { x: number; y: number }[] = [];
    const pointsQ: { x: number; y: number }[] = [];

    const numSamples = 60;
    for (let i = 0; i <= numSamples; i++) {
      const t = (i / numSamples) * tMax;
      const x = 15 + (i / numSamples) * (midX - 35);
      const dt = t - tMax / 2;

      let I = Math.exp(-Math.pow(dt, 2) / (2 * Math.pow(sigma, 2)));
      if (pulseShape === 'flattop') {
        I = Math.min(1.0, Math.exp(-Math.pow(Math.max(0, Math.abs(dt) - 4), 2) / (2 * Math.pow(sigma / 1.5, 2))));
      }

      // DRAG Quadrature: Q(t) = -dragBeta * dI/dt
      let Q = 0;
      if (pulseShape === 'drag') {
        const dIdt = -(dt / Math.pow(sigma, 2)) * I;
        Q = -dragBeta * dIdt * sigma * 0.9;
      }

      const yI = centerY - I * 44;
      const yQ = centerY - Q * 44;
      pointsI.push({ x, y: yI });
      pointsQ.push({ x, y: yQ });
    }

    // Draw In-Phase I(t) (Cyan)
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    pointsI.forEach((pt, idx) => {
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();

    // Draw Quadrature Q(t) (Purple / DRAG)
    if (pulseShape === 'drag') {
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      pointsQ.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Label Left
    ctx.fillStyle = '#00e5ff';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('I(t) Gaussian', 15, 14);
    if (pulseShape === 'drag') {
      ctx.fillStyle = '#c084fc';
      ctx.fillText(`Q(t) DRAG (β=${dragBeta})`, 95, 14);
    }

    // ----------------------------------------------------
    // RIGHT: FREQUENCY DOMAIN SPECTRUM & ANHARMONIC NOTCH
    // ----------------------------------------------------
    const specWidth = w - midX - 25;
    const specZeroX = midX + 15 + specWidth * 0.65;
    const specBaseY = h * 0.85;

    // Spectrum baseline
    ctx.strokeStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(midX + 10, specBaseY);
    ctx.lineTo(w - 10, specBaseY);
    ctx.stroke();

    // Drive peak at 0 offset (omega_01)
    // Draw spectrum curve
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.8;
    ctx.beginPath();

    const specPoints = 40;
    for (let i = 0; i <= specPoints; i++) {
      const freqOffsetMhz = -450 + (i / specPoints) * 600; // -450 to +150 MHz
      const px = midX + 15 + (i / specPoints) * specWidth;
      
      // Drive peak at 0
      let amp = Math.exp(-Math.pow(freqOffsetMhz / 65, 2));
      
      // If DRAG active, create deep spectral notch right at anharmonicity alpha (-320 MHz)
      if (pulseShape === 'drag') {
        const notchFactor = Math.abs(freqOffsetMhz - anharmonicityMhz) / 70;
        amp *= Math.min(1.0, Math.pow(notchFactor, 1.4));
      }

      const py = specBaseY - amp * 60;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Notch marker at alpha
    const notchPixelX = midX + 15 + ((-anharmonicityMhz - -450) / 600) * specWidth;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(notchPixelX, 22);
    ctx.lineTo(notchPixelX, specBaseY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Right labels
    ctx.fillStyle = '#ef4444';
    ctx.font = '8px monospace';
    ctx.fillText(`α=${anharmonicityMhz}MHz`, notchPixelX - 22, 18);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('ω₀₁ Drive Peak', specZeroX - 30, 28);
  }, [pulseDurationNs, dragBeta, anharmonicityMhz, pulseShape]);

  // =========================================================================
  // 6. CRYOGENIC DYNAMIC THERMODYNAMIC SIMULATION ENGINE STATE
  // =========================================================================
  const [molarFlowRate, setMolarFlowRate] = useState<number>(480);
  const [rfDriveHeatMicroWatts, setRfDriveHeatMicroWatts] = useState<number>(1.2);
  const [cryoCmosHeatMilliWatts, setCryoCmosHeatMilliWatts] = useState<number>(85);
  const [stillHeaterPowerMilliWatts, setStillHeaterPowerMilliWatts] = useState<number>(18.5);
  const thermoCanvasRef = useRef<HTMLCanvasElement>(null);

  // Exact Solution of Dilution Refrigerator Equilibrium Equation
  const solvedMixingTemp = useMemo(() => {
    const Tn = 0.100; // incoming 3He from continuous heat exchanger is ~100mK
    const n_dot = molarFlowRate * 1e-6; // mol/s
    const Q_ext = rfDriveHeatMicroWatts * 1e-6; // Watts
    // 84 * n_dot * T_mc^2 = Q_ext + 12 * n_dot * Tn^2
    const TmcSquared = (Q_ext + 12 * n_dot * Math.pow(Tn, 2)) / (84 * n_dot);
    const TmcKelvin = Math.sqrt(Math.max(0.00008, TmcSquared));
    return +(TmcKelvin * 1000).toFixed(1); // in mK
  }, [molarFlowRate, rfDriveHeatMicroWatts]);

  const coolingMarginMicroWatts = useMemo(() => {
    const Tmc = solvedMixingTemp / 1000;
    const n_dot = molarFlowRate * 1e-6;
    const totalCapacity = 84 * n_dot * Math.pow(Tmc, 2) * 1e6;
    return +(Math.max(0, totalCapacity - rfDriveHeatMicroWatts)).toFixed(1);
  }, [molarFlowRate, solvedMixingTemp, rfDriveHeatMicroWatts]);

  // Render Real-Time Thermodynamic Equilibration Trajectory
  useEffect(() => {
    const canvas = thermoCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Background grid
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 18) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Trajectory from warm transient down to solved equilibrium
    const startTemp = 35; // mK
    const targetTemp = solvedMixingTemp; // mK

    // Critical threshold line at 20 mK
    const y20mK = h - ((20 - 10) / 30) * (h - 25);
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(10, y20mK);
    ctx.lineTo(w - 10, y20mK);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#f43f5e';
    ctx.font = '8px monospace';
    ctx.fillText('20 mK Decoherence Threshold', w - 145, y20mK - 4);

    // Plot exponential thermal trajectory
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2.4;
    ctx.beginPath();

    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const frac = i / steps;
      // Exponential decay: T(t) = target + (start - target) * exp(-frac * 4.5)
      const currentT = targetTemp + (startTemp - targetTemp) * Math.exp(-frac * 4.5);
      const px = 15 + frac * (w - 30);
      const py = h - 12 - ((currentT - 10) / 30) * (h - 25);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Equilibrium marker
    const finalY = h - 12 - ((targetTemp - 10) / 30) * (h - 25);
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(w - 15, finalY, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(`Equilibrium: ${solvedMixingTemp} mK`, w - 125, finalY - 8);
  }, [solvedMixingTemp]);

  // =========================================================================
  // 7. MULTI-SCALE ARCHITECTURE SCALING CALCULATOR (100 to 1,000,000 QUBITS)
  // =========================================================================
  const [targetQubits, setTargetQubits] = useState<number>(1121);

  const scalingMetrics = useMemo(() => {
    const N = targetQubits;
    const presentCoaxCount = N * 3;
    const presentCoaxMassKg = +(presentCoaxCount * 0.042).toFixed(1);
    const present4KHeatWatts = +(presentCoaxCount * 0.00075).toFixed(2);
    const presentRackUnits = Math.ceil(presentCoaxCount / 8);

    const futureRibbonCount = Math.ceil(N / 64);
    const futureStriplineMassKg = +(futureRibbonCount * 0.12).toFixed(2);
    const future4KHeatWatts = +(N * 0.00008 + 0.05).toFixed(2);
    const futureFiberPairs = Math.ceil(N / 256);

    return {
      presentCoaxCount,
      presentCoaxMassKg,
      present4KHeatWatts,
      presentRackUnits,
      futureRibbonCount,
      futureStriplineMassKg,
      future4KHeatWatts,
      futureFiberPairs
    };
  }, [targetQubits]);

  return (
    <div className={`space-y-4 font-sans ${className}`}>
      
      {/* Studio Navigation Filter Bar */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#030610] border border-[rgba(0,229,255,0.2)] font-mono text-xs overflow-x-auto shadow-lg">
        {[
          { id: 'all' as const, label: 'All Modules', icon: Layers },
          { id: 'bloch' as const, label: '1. Bloch 3D', icon: Rotate3d },
          { id: 'entangle' as const, label: '2. Bell-CHSH Lab', icon: Zap },
          { id: 'circuit' as const, label: '3. Circuit & Shots', icon: Play },
          { id: 'pulse' as const, label: '4. AWG DRAG Synth', icon: Radio },
          { id: 'thermo' as const, label: '5. Cryo Thermodynamics', icon: Flame },
          { id: 'scaling' as const, label: '6. Architecture Scaling', icon: Cpu }
        ].map(btn => {
          const Icon = btn.icon;
          const isAct = activeStudioSection === btn.id;
          return (
            <button
              key={btn.id}
              onClick={() => { playGateClickSound(700); setActiveStudioSection(btn.id); }}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0 transition-all cursor-pointer font-bold ${
                isAct
                  ? 'bg-gradient-to-r from-cyan-500/20 to-sky-500/20 text-[#00e5ff] border border-cyan-500/60 shadow-xs'
                  : 'text-[#78909c] hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{btn.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* CARD 1: QUBIT REPRESENTATION (3D BLOCH SPHERE & QUANTUM STATE VECTOR) */}
      {/* ========================================================================= */}
      {(activeStudioSection === 'all' || activeStudioSection === 'bloch') && (
      <div className="p-4 rounded-2xl bg-[#030610] border border-[rgba(0,229,255,0.25)] shadow-xl relative overflow-hidden font-mono">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[rgba(0,229,255,0.15)]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#00e5ff]/15 border border-[#00e5ff]/30 flex items-center justify-center text-[#00e5ff]">
              <Rotate3d className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Qubit Representation &amp; Bloch Sphere</h4>
              <p className="text-[10px] text-[#78909c]">
                Interactive 3D state vector on the Riemann sphere with density matrix &#961; = |&#968;&#10217;&#10216;&#968;|
              </p>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-1 text-[10px]">
            {[
              { id: 'superposition' as const, label: 'Superposition' },
              { id: 'zero' as const, label: '|0⟩' },
              { id: 'one' as const, label: '|1⟩' },
              { id: 'plus' as const, label: '|+⟩' },
              { id: 'minus' as const, label: '|-⟩' },
              { id: 'i' as const, label: '|i⟩' }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => {
                  playGateClickSound(650);
                  setQubitPreset(p.id);
                }}
                className={`px-2 py-1 rounded transition-all cursor-pointer font-bold ${
                  qubitPreset === p.id
                    ? 'bg-[#00e5ff] text-[#02060a] shadow-xs shadow-[#00e5ff]/30'
                    : 'bg-[#09141d] border border-slate-800 text-[#78909c] hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Card Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center pt-3">
          
          {/* Left: Interactive 3D Bloch Sphere Canvas (4 cols) */}
          <div className="md:col-span-4 flex flex-col items-center justify-center">
            <div
              className="relative cursor-grab active:cursor-grabbing rounded-xl bg-[#02050c]/90 border border-slate-800 p-2 shadow-inner"
              onMouseDown={(e) => {
                dragRef.current = { isDragging: true, lastX: e.clientX, lastY: e.clientY };
              }}
              onMouseMove={(e) => {
                if (!dragRef.current.isDragging) return;
                const dx = e.clientX - dragRef.current.lastX;
                const dy = e.clientY - dragRef.current.lastY;
                setCamRotY(prev => prev + dx * 0.015);
                setCamRotX(prev => Math.max(-1.2, Math.min(1.2, prev + dy * 0.015)));
                dragRef.current = { isDragging: true, lastX: e.clientX, lastY: e.clientY };
              }}
              onMouseUp={() => { dragRef.current.isDragging = false; }}
              onMouseLeave={() => { dragRef.current.isDragging = false; }}
            >
              <canvas
                ref={blochCanvasRef}
                width={170}
                height={150}
                className="block"
              />
              <button
                onClick={() => setIsRotating(!isRotating)}
                className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-bold ${
                  isRotating ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isRotating ? 'SPIN' : 'PAUSED'}
              </button>
            </div>
            <span className="text-[9px] text-slate-500 mt-1">Drag canvas to rotate 3D view</span>
          </div>

          {/* Middle: Gate Pulse Palette & Mathematical Wavefunction (4 cols) */}
          <div className="md:col-span-4 space-y-2.5">
            <div className="space-y-1">
              <span className="text-[10px] text-[#78909c] uppercase font-bold block">Quantum Gate Pulses</span>
              <div className="flex items-center gap-1">
                {(['H', 'X', 'Y', 'Z', 'S', 'T'] as const).map(g => (
                  <button
                    key={g}
                    onClick={() => applyGate(g)}
                    className="flex-1 py-1 rounded bg-[#09141d] hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500 text-white font-bold text-xs transition-all cursor-pointer"
                  >
                    {g}
                  </button>
                ))}
                <button
                  onClick={() => applyGate('RESET')}
                  className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-[10px] font-bold cursor-pointer"
                >
                  |0⟩
                </button>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#09141d] border border-cyan-800/40 space-y-1">
              <span className="text-[10px] text-[#78909c] uppercase font-bold block">Pure State Vector</span>
              <div className="text-sm font-bold text-white tracking-wide">
                |ψ⟩ = {alpha}|0⟩ + {beta}|1⟩
              </div>
              <div className="text-[10px] text-cyan-300">
                θ = {(theta / Math.PI).toFixed(2)}π rad · φ = {(phi / Math.PI).toFixed(2)}π rad
              </div>
            </div>
          </div>

          {/* Right: Amplitude Probability & Density Matrix (4 cols) */}
          <div className="md:col-span-4 space-y-2">
            <div className="p-2.5 rounded-xl bg-[#09141d] border border-[rgba(0,229,255,0.15)] flex items-center justify-between">
              <div>
                <span className="text-[#00e5ff] font-bold block text-sm">|α|² = {prob0}%</span>
                <span className="text-[#78909c] text-[10px]">Ground State |0⟩</span>
              </div>
              <div className="w-16 bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#00e5ff] h-full" style={{ width: `${prob0}%` }} />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#09141d] border border-purple-500/20 flex items-center justify-between">
              <div>
                <span className="text-purple-400 font-bold block text-sm">|β|² = {prob1}%</span>
                <span className="text-[#78909c] text-[10px]">Excited State |1⟩</span>
              </div>
              <div className="w-16 bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full" style={{ width: `${prob1}%` }} />
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span>Purity Tr(ρ²): <strong className="text-emerald-400">1.000</strong></span>
              <span>Vector: <strong className="text-white">({rx}, {ry}, {rz})</strong></span>
            </div>
          </div>

        </div>

      </div>
      )}

      {/* ========================================================================= */}
      {/* CARD 2: QUANTUM ENTANGLEMENT & BELL-CHSH NON-LOCALITY LABORATORY */}
      {/* ========================================================================= */}
      {(activeStudioSection === 'all' || activeStudioSection === 'entangle') && (
      <div className="p-4 rounded-2xl bg-[#030610] border border-[rgba(0,229,255,0.25)] shadow-xl relative overflow-hidden font-mono">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[rgba(0,229,255,0.15)]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Quantum Entanglement &amp; Bell-CHSH Laboratory</h4>
              <p className="text-[10px] text-[#78909c]">
                Maximally entangled 2-qubit EPR states with Tsirelson-bounded non-local Bell inequality violation
              </p>
            </div>
          </div>

          {/* Bell State Selector Buttons */}
          <div className="flex items-center gap-1 text-[10px]">
            {[
              { id: 'phi_plus' as const, label: '|Φ+⟩' },
              { id: 'phi_minus' as const, label: '|Φ-⟩' },
              { id: 'psi_plus' as const, label: '|Ψ+⟩' },
              { id: 'psi_minus' as const, label: '|Ψ-⟩ (Singlet)' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => {
                  playGateClickSound(700);
                  setBellMode(m.id);
                }}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer font-bold ${
                  bellMode === m.id
                    ? 'bg-purple-500 text-white shadow-xs shadow-purple-500/30'
                    : 'bg-[#09141d] border border-slate-800 text-[#78909c] hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Card Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center pt-3">
          
          {/* Left: Dual Spheres with Animated Non-Local Wavepacket Canvas (5 cols) */}
          <div className="md:col-span-5 flex flex-col items-center">
            <canvas
              ref={entCanvasRef}
              width={260}
              height={75}
              className="rounded-xl bg-[#02050c]/90 border border-slate-800 block w-full shadow-inner"
            />
            <div className="flex items-center justify-between w-full px-6 mt-1.5 text-[10px]">
              <div className="text-center">
                <span className="text-[#00e5ff] font-bold block">Qubit 1 (Alice)</span>
                <span className="text-slate-400">Transmon Island</span>
              </div>
              <span className="text-purple-400 font-bold text-[9px] animate-pulse">⟨EPR Entangled⟩</span>
              <div className="text-center">
                <span className="text-purple-400 font-bold block">Qubit 2 (Bob)</span>
                <span className="text-slate-400">Transmon Island</span>
              </div>
            </div>
          </div>

          {/* Middle: Entangled State Mathematical Wavefunction (4 cols) */}
          <div className="md:col-span-4 space-y-2">
            <span className="text-[10px] text-[#78909c] uppercase font-bold block">Bell Basis Wavefunction</span>
            <div className="text-sm font-bold text-white bg-[#09141d] p-2.5 rounded-xl border border-purple-500/30">
              {bellMode === 'phi_plus' && "|Φ+⟩ = 1/√2 (|00⟩ + |11⟩)"}
              {bellMode === 'phi_minus' && "|Φ-⟩ = 1/√2 (|00⟩ - |11⟩)"}
              {bellMode === 'psi_plus' && "|Ψ+⟩ = 1/√2 (|01⟩ + |10⟩)"}
              {bellMode === 'psi_minus' && "|Ψ-⟩ = 1/√2 (|01⟩ - |10⟩)"}
            </div>

            <div className="p-2 rounded-lg bg-[#02050b] border border-slate-850 flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Entanglement Entropy S(ρ_A):</span>
              <span className="text-emerald-400 font-bold">1.000 ebit (Maximal)</span>
            </div>
          </div>

          {/* Right: Bell-CHSH Violation Gauge & Measurement Outcomes (3 cols) */}
          <div className="md:col-span-3 space-y-2">
            <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/40 space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-purple-300 font-bold uppercase">Bell-CHSH Score:</span>
                <span className="text-emerald-400 font-bold">S = {chshParameter}</span>
              </div>
              <div className="text-[9px] text-slate-300">
                Classical Limit: <strong className="text-amber-400">S ≤ 2.0</strong>
              </div>
              <div className="text-[9px] text-emerald-300 font-bold flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>EPR Non-Locality Verified!</span>
              </div>
            </div>

            {/* Joint Correlation Table */}
            <div className="grid grid-cols-2 gap-1 text-center text-[10px]">
              {bellMode === 'phi_plus' || bellMode === 'phi_minus' ? (
                <>
                  <div className="p-1 rounded bg-[#09141d] text-cyan-300 font-bold">P(00) = 50%</div>
                  <div className="p-1 rounded bg-[#09141d] text-purple-300 font-bold">P(11) = 50%</div>
                </>
              ) : (
                <>
                  <div className="p-1 rounded bg-[#09141d] text-cyan-300 font-bold">P(01) = 50%</div>
                  <div className="p-1 rounded bg-[#09141d] text-purple-300 font-bold">P(10) = 50%</div>
                </>
              )}
            </div>
          </div>

        </div>

      </div>
      )}

      {/* ========================================================================= */}
      {/* CARD 3: QUANTUM CIRCUIT (INTERACTIVE GATES & 1,024 SHOT SIMULATOR) */}
      {/* ========================================================================= */}
      {(activeStudioSection === 'all' || activeStudioSection === 'circuit') && (
      <div className="p-4 rounded-2xl bg-[#030610] border border-[rgba(0,229,255,0.25)] shadow-xl relative overflow-hidden font-mono">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[rgba(0,229,255,0.15)]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#00e5ff]/15 border border-[#00e5ff]/30 flex items-center justify-center text-[#00e5ff]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Quantum Circuit Engine &amp; Shot Simulator</h4>
              <p className="text-[10px] text-[#78909c]">
                2-qubit coherent gate wire with matrix unitaries and stochastic projective measurement sampling
              </p>
            </div>
          </div>

          {/* Circuit Presets & Run Button */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#09141d] p-1 rounded-lg border border-slate-800 text-[10px]">
              {[
                { id: 'bell' as const, label: 'Bell Circuit' },
                { id: 'superposition' as const, label: 'H ⊗ H' },
                { id: 'swap' as const, label: 'SWAP' },
                { id: 'phase_entangler' as const, label: 'Phase Entangler' }
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    playGateClickSound(650);
                    setCircuitPreset(c.id);
                  }}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer font-bold ${
                    circuitPreset === c.id ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleRunSimulation}
              disabled={simRunning}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                simRunning
                  ? 'bg-slate-800 text-slate-400'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/20'
              }`}
            >
              <Play className={`w-3.5 h-3.5 ${simRunning ? 'animate-spin' : 'fill-current'}`} />
              <span>{simRunning ? 'Executing 1,024 Shots…' : 'Run 1,024 Shots'}</span>
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center pt-3">
          
          {/* Left: Circuit Schematic Wires (8 cols) */}
          <div className="md:col-span-8 bg-[#02050c] p-3.5 rounded-xl border border-slate-800 space-y-3.5">
            
            {/* q0 wire */}
            <div className="flex items-center gap-3 relative">
              <span className="text-[#00e5ff] font-bold w-14 shrink-0 text-xs">q[0] |0⟩</span>
              <div className="flex-1 h-0.5 bg-slate-700 relative flex items-center justify-around">
                {/* Gate 1 */}
                <span className="px-2.5 py-1 rounded bg-[#00e5ff] text-[#02060a] font-bold text-xs shadow-sm shadow-[#00e5ff]/20">
                  {circuitPreset === 'swap' ? '●' : 'H'}
                </span>
                {/* Gate 2: Control Dot */}
                <span className="w-3.5 h-3.5 rounded-full bg-[#00e5ff] ring-2 ring-[#00e5ff]/40 shadow-sm" />
                {/* Gate 3 */}
                <span className="px-2 py-0.5 rounded bg-purple-500 text-white font-bold text-xs shadow-sm">
                  {circuitPreset === 'phase_entangler' ? 'S' : circuitPreset === 'swap' ? '●' : 'X'}
                </span>
                {/* Measurement */}
                <span className="px-2 py-0.5 rounded bg-[#09141d] border border-[#00e5ff]/40 text-[#00e5ff] font-bold text-[10px]">
                  M
                </span>
              </div>
            </div>

            {/* Vertical CNOT entangler link */}
            <div className="relative pl-[118px] h-3.5">
              <div className="w-0.5 h-full bg-[#00e5ff]" />
            </div>

            {/* q1 wire */}
            <div className="flex items-center gap-3 relative">
              <span className="text-purple-400 font-bold w-14 shrink-0 text-xs">q[1] |0⟩</span>
              <div className="flex-1 h-0.5 bg-slate-700 relative flex items-center justify-around">
                <div className="w-6" />
                {/* Target Plus Symbol */}
                <div className="w-5 h-5 rounded-full border-2 border-[#00e5ff] bg-[#02050c] flex items-center justify-center text-[#00e5ff] font-bold text-xs">
                  ⊕
                </div>
                <div className="w-6" />
                <span className="px-2 py-0.5 rounded bg-[#09141d] border border-purple-500/40 text-purple-400 font-bold text-[10px]">
                  M
                </span>
              </div>
            </div>

            {/* Gate Names Legend */}
            <div className="flex items-center justify-around pt-2 text-[9px] text-slate-400 border-t border-slate-800/80">
              <span>(H) Hadamard 1/√2[1 1; 1 -1]</span>
              <span>(⊕) CNOT Entangler</span>
              <span>(X) Pauli-X [0 1; 1 0]</span>
              <span>[M] Projective Z-Readout</span>
            </div>

          </div>

          {/* Right: Stochastic Measurement Shot Histogram (4 cols) */}
          <div className="md:col-span-4 bg-[#09141d] p-3 rounded-xl border border-[rgba(0,229,255,0.15)] space-y-2 text-xs">
            <div className="flex justify-between items-center text-[10px] text-[#78909c] font-bold uppercase pb-1 border-b border-slate-800">
              <span>Shot Outcome:</span>
              <span className="text-white">{shots} Samples</span>
            </div>

            {/* |00> */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-slate-300 text-[11px]">
                <span>|00⟩</span>
                <span className="text-cyan-300 font-bold">{circuitCounts.c00} shots ({((circuitCounts.c00 / shots) * 100).toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-cyan-400 h-full transition-all duration-300" style={{ width: `${(circuitCounts.c00 / shots) * 100}%` }} />
              </div>
            </div>

            {/* |01> */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-slate-300 text-[11px]">
                <span>|01⟩</span>
                <span className="text-cyan-300 font-bold">{circuitCounts.c01} shots ({((circuitCounts.c01 / shots) * 100).toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-cyan-400 h-full transition-all duration-300" style={{ width: `${(circuitCounts.c01 / shots) * 100}%` }} />
              </div>
            </div>

            {/* |10> */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-slate-300 text-[11px]">
                <span>|10⟩</span>
                <span className="text-purple-400 font-bold">{circuitCounts.c10} shots ({((circuitCounts.c10 / shots) * 100).toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full transition-all duration-300" style={{ width: `${(circuitCounts.c10 / shots) * 100}%` }} />
              </div>
            </div>

            {/* |11> */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-slate-300 text-[11px]">
                <span>|11⟩</span>
                <span className="text-purple-400 font-bold">{circuitCounts.c11} shots ({((circuitCounts.c11 / shots) * 100).toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full transition-all duration-300" style={{ width: `${(circuitCounts.c11 / shots) * 100}%` }} />
              </div>
            </div>

          </div>

        </div>

      </div>
      )}

      {/* ========================================================================= */}
      {/* CARD 4: AWG DRAG MICROWAVE PULSE SYNTHESIZER & LEAKAGE SUPPRESSOR */}
      {/* ========================================================================= */}
      {(activeStudioSection === 'all' || activeStudioSection === 'pulse') && (
      <div className="p-4 rounded-2xl bg-[#030610] border border-[rgba(0,229,255,0.25)] shadow-xl relative overflow-hidden font-mono">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[rgba(0,229,255,0.15)]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <span>AWG Microwave DRAG Pulse Synthesizer</span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                  LEAKAGE NOTCH ENGINE
                </span>
              </h4>
              <p className="text-[10px] text-[#78909c]">
                Derivative Removal by Adiabatic Gate (DRAG) Q(t) ∝ -β·dI/dt cancels |1⟩ → |2⟩ non-computational transitions
              </p>
            </div>
          </div>

          {/* Pulse Shape Presets */}
          <div className="flex items-center gap-1 text-[10px]">
            {[
              { id: 'drag' as const, label: 'DRAG (Optimal)' },
              { id: 'gaussian' as const, label: 'Standard Gaussian' },
              { id: 'flattop' as const, label: 'Flat-Top Pulse' }
            ].map(s => (
              <button
                key={s.id}
                onClick={() => {
                  playGateClickSound(650);
                  setPulseShape(s.id);
                }}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer font-bold ${
                  pulseShape === s.id
                    ? 'bg-cyan-500 text-slate-950 shadow-xs shadow-cyan-500/30'
                    : 'bg-[#09141d] border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Card Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center pt-3">
          
          {/* Left: Waveform & Spectral Notch Canvas (7 cols) */}
          <div className="md:col-span-7 flex flex-col items-center">
            <canvas
              ref={pulseCanvasRef}
              width={380}
              height={140}
              className="w-full rounded-xl bg-[#02050c] border border-slate-800 p-1 shadow-inner"
            />
            <div className="w-full flex items-center justify-between text-[9px] text-slate-500 pt-1.5 px-1">
              <span>Time-Domain Envelopes I(t) &amp; Q(t)</span>
              <span>FFT Spectrum Notch at α={anharmonicityMhz} MHz</span>
            </div>
          </div>

          {/* Right: Synthesis Controls & Quantum Fidelity (5 cols) */}
          <div className="md:col-span-5 space-y-2.5">
            
            {/* Sliders */}
            <div className="p-2.5 rounded-xl bg-[#09141d] border border-slate-800 space-y-2 text-xs">
              
              {/* Duration Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">Gate Duration (τ_gate):</span>
                  <span className="text-cyan-300 font-bold">{pulseDurationNs} ns (σ = {pulseDurationNs / 4} ns)</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="60"
                  step="2"
                  value={pulseDurationNs}
                  onChange={e => setPulseDurationNs(+e.target.value)}
                  className="w-full h-1 bg-slate-800 accent-cyan-400 rounded cursor-pointer"
                />
              </div>

              {/* DRAG Beta Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">DRAG Quadrature Coeff (β):</span>
                  <span className="text-purple-300 font-bold">β = {dragBeta} {dragBeta === 0.42 ? '(Optimal)' : ''}</span>
                </div>
                <input
                  type="range"
                  min="-0.2"
                  max="1.0"
                  step="0.02"
                  value={dragBeta}
                  onChange={e => setDragBeta(+e.target.value)}
                  disabled={pulseShape !== 'drag'}
                  className="w-full h-1 bg-slate-800 accent-purple-400 rounded cursor-pointer disabled:opacity-40"
                />
              </div>

              {/* Transmon Anharmonicity */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">Transmon Anharmonicity (α = ω₁₂ - ω₀₁):</span>
                  <span className="text-rose-300 font-bold">{anharmonicityMhz} MHz</span>
                </div>
                <input
                  type="range"
                  min="-400"
                  max="-200"
                  step="10"
                  value={anharmonicityMhz}
                  onChange={e => setAnharmonicityMhz(+e.target.value)}
                  className="w-full h-1 bg-slate-800 accent-rose-400 rounded cursor-pointer"
                />
              </div>

            </div>

            {/* Live Gate Fidelity Metric */}
            <div className="p-2.5 rounded-xl bg-[#09141d] border border-cyan-500/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">Single-Qubit Gate Fidelity:</span>
                <span className={`text-sm font-bold ${gateFidelityWithDrag >= 99.8 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  ℱ = {gateFidelityWithDrag}%
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Randomized Benchmarking (r_g):</span>
                <span className="text-white font-mono text-[11px] font-bold">
                  {pulseShape === 'drag' ? '4.2 × 10⁻⁴' : '1.35 × 10⁻²'}
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
      )}

      {/* ========================================================================= */}
      {/* CARD 5: CRYOGENIC DYNAMIC THERMODYNAMIC SIMULATION ENGINE */}
      {/* ========================================================================= */}
      {(activeStudioSection === 'all' || activeStudioSection === 'thermo') && (
      <div className="p-4 rounded-2xl bg-[#030610] border border-amber-500/30 shadow-xl relative overflow-hidden font-mono">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-amber-500/20">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <span>Cryogenic Dynamic Thermodynamics Solver</span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                  ³He/⁴He ENTHALPY SOLVER
                </span>
              </h4>
              <p className="text-[10px] text-[#78909c]">
                Solves continuous cooling differential equation Q_dot_mc = n_dot_3 · [84·T_mc² - 12·T_n²] under active RF microwave heat load
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px]">
            <span className="px-2 py-1 rounded bg-[#09141d] border border-slate-800 text-amber-300 font-bold">
              Base Temp: {solvedMixingTemp} mK
            </span>
            <span className={`px-2 py-1 rounded border font-bold ${
              coolingMarginMicroWatts > 5
                ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                : 'bg-rose-950/80 border-rose-500/60 text-rose-300'
            }`}>
              Reserve: {coolingMarginMicroWatts} μW
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center pt-3">
          
          {/* Left: Dynamic Temperature Equilibration Curve Canvas (7 cols) */}
          <div className="md:col-span-7 flex flex-col items-center">
            <canvas
              ref={thermoCanvasRef}
              width={380}
              height={140}
              className="w-full rounded-xl bg-[#02050c] border border-slate-800 p-1 shadow-inner"
            />
            <div className="w-full flex items-center justify-between text-[9px] text-slate-500 pt-1.5 px-1">
              <span>Equilibration Trajectory T_mc(t)</span>
              <span className="text-emerald-400 font-bold">Converged: {solvedMixingTemp} mK (Steady-State)</span>
            </div>
          </div>

          {/* Right: Thermal Load Sliders (5 cols) */}
          <div className="md:col-span-5 space-y-2.5">
            
            <div className="p-2.5 rounded-xl bg-[#09141d] border border-slate-800 space-y-2 text-xs">
              
              {/* Molar Flow Rate */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">³He Circulation Flow (n_dot₃):</span>
                  <span className="text-amber-300 font-bold">{molarFlowRate} μmol/s</span>
                </div>
                <input
                  type="range"
                  min="150"
                  max="900"
                  step="30"
                  value={molarFlowRate}
                  onChange={e => setMolarFlowRate(+e.target.value)}
                  className="w-full h-1 bg-slate-800 accent-amber-400 rounded cursor-pointer"
                />
              </div>

              {/* 15mK RF Drive Microwave Dissipation */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">15mK RF Heat Injection (Q_ext):</span>
                  <span className="text-cyan-300 font-bold">{rfDriveHeatMicroWatts} μW</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="8.0"
                  step="0.1"
                  value={rfDriveHeatMicroWatts}
                  onChange={e => setRfDriveHeatMicroWatts(+e.target.value)}
                  className="w-full h-1 bg-slate-800 accent-cyan-400 rounded cursor-pointer"
                />
              </div>

              {/* 4K Cryo-CMOS Controller Power */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">4K Cryo-CMOS ASIC Dissipation:</span>
                  <span className="text-purple-300 font-bold">{cryoCmosHeatMilliWatts} mW</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="350"
                  step="10"
                  value={cryoCmosHeatMilliWatts}
                  onChange={e => setCryoCmosHeatMilliWatts(+e.target.value)}
                  className="w-full h-1 bg-slate-800 accent-purple-400 rounded cursor-pointer"
                />
              </div>

            </div>

            {/* Phase Boundary Visualizer */}
            <div className="p-2.5 rounded-xl bg-[#09141d] border border-amber-500/30 text-[10px] space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Mixing Chamber Boundary:</span>
                <span className="text-amber-300 font-bold">Concentrated (100% ³He) over Dilute (6.6% ³He)</span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden flex border border-slate-700">
                <div className="bg-amber-400 h-full" style={{ width: '42%' }} title="Concentrated Upper Phase" />
                <div className="bg-cyan-400 h-full flex-1" title="Dilute Superfluid Phase" />
              </div>
              <div className="flex justify-between text-[8px] text-slate-500">
                <span>Concentrated Liquid (Top)</span>
                <span>Dilute Solution (Bottom)</span>
              </div>
            </div>

          </div>

        </div>

      </div>
      )}

      {/* ========================================================================= */}
      {/* CARD 6: MULTI-SCALE ARCHITECTURE SCALING CALCULATOR (100 to 1,000,000 QUBITS) */}
      {/* ========================================================================= */}
      {(activeStudioSection === 'all' || activeStudioSection === 'scaling') && (
      <div className="p-4 rounded-2xl bg-[#030610] border border-purple-500/30 shadow-xl relative overflow-hidden font-mono">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-purple-500/20">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <span>Multi-Scale Architecture Scaling Calculator</span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                  100 TO 1,000,000 QUBITS
                </span>
              </h4>
              <p className="text-[10px] text-[#78909c]">
                Calculates physical coaxial cable bottleneck vs. high-density superconducting flex striplines &amp; Cryo-CMOS ASICs
              </p>
            </div>
          </div>

          {/* Quick Target Presets */}
          <div className="flex items-center gap-1 text-[10px]">
            {[
              { label: 'Eagle (127 Q)', count: 127 },
              { label: 'Condor (1,121 Q)', count: 1121 },
              { label: 'Fault-Tol (10k Q)', count: 10000 },
              { label: 'Surface (100k Q)', count: 100000 },
              { label: 'Planetary (1M Q)', count: 1000000 }
            ].map(pr => (
              <button
                key={pr.count}
                onClick={() => {
                  playGateClickSound(650);
                  setTargetQubits(pr.count);
                }}
                className={`px-2 py-1 rounded transition-all cursor-pointer font-bold ${
                  targetQubits === pr.count
                    ? 'bg-purple-600 text-white shadow-xs shadow-purple-600/30'
                    : 'bg-[#09141d] border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {pr.label}
              </button>
            ))}
          </div>
        </div>

        {/* Card Body */}
        <div className="space-y-4 pt-3">
          
          {/* Main Slider */}
          <div className="p-3 rounded-xl bg-[#09141d] border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Active Architecture Scaling Target:</span>
              <span className="text-purple-300 font-bold text-sm">{targetQubits.toLocaleString()} Physical Transmons</span>
            </div>
            <input
              type="range"
              min="100"
              max="100000"
              step="500"
              value={targetQubits > 100000 ? 100000 : targetQubits}
              onChange={e => setTargetQubits(+e.target.value)}
              className="w-full h-1.5 bg-slate-800 accent-purple-500 rounded cursor-pointer"
            />
          </div>

          {/* Side-by-Side Comparison Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Column 1: Present Technology (Semi-Rigid Coax Bottleneck) */}
            <div className="p-3.5 rounded-xl bg-[#09141d]/90 border border-amber-500/30 space-y-2.5">
              <div className="flex justify-between items-center border-b border-amber-500/20 pb-2">
                <span className="text-amber-300 font-bold text-xs uppercase flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-amber-400" />
                  <span>Present Gen (Discrete Coax)</span>
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                  2025 CEILING
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Total Semi-Rigid Coax Cables:</span>
                  <span className="text-amber-300 font-bold">{scalingMetrics.presentCoaxCount.toLocaleString()} Lines</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Cable Mass inside Chandelier:</span>
                  <span className={`font-bold ${scalingMetrics.presentCoaxMassKg > 100 ? 'text-rose-400' : 'text-slate-200'}`}>
                    {scalingMetrics.presentCoaxMassKg} kg {scalingMetrics.presentCoaxMassKg > 200 ? '(CRANE REQUIRED)' : ''}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">4K Thermal Conduction Load:</span>
                  <span className={`font-bold ${scalingMetrics.present4KHeatWatts > 1.5 ? 'text-rose-400' : 'text-amber-300'}`}>
                    {scalingMetrics.present4KHeatWatts} W {scalingMetrics.present4KHeatWatts > 1.5 ? '(EXCEEDS 1.5W PULSE TUBE!)' : ''}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">19" Rack-Mount AWG Units:</span>
                  <span className="text-white font-bold">{scalingMetrics.presentRackUnits.toLocaleString()} U ({(scalingMetrics.presentRackUnits / 42).toFixed(1)} Full Racks)</span>
                </div>
              </div>
            </div>

            {/* Column 2: Future Scalable Architecture (Superconducting Flex & Cryo-CMOS) */}
            <div className="p-3.5 rounded-xl bg-[#09141d]/90 border border-purple-500/40 space-y-2.5">
              <div className="flex justify-between items-center border-b border-purple-500/20 pb-2">
                <span className="text-purple-300 font-bold text-xs uppercase flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-purple-400" />
                  <span>Future Gen (Flex &amp; Cryo-CMOS)</span>
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                  2030+ SCALABLE
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Superconducting Flex Ribbons:</span>
                  <span className="text-purple-300 font-bold">{scalingMetrics.futureRibbonCount.toLocaleString()} Flat Striplines</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Total Stripline Mass:</span>
                  <span className="text-emerald-400 font-bold">{scalingMetrics.futureStriplineMassKg} kg (&gt;10× lighter)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">4K Cryo-CMOS Dissipation:</span>
                  <span className="text-emerald-400 font-bold">{scalingMetrics.future4KHeatWatts} W (Within 1.5W budget)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">DWDM Optical Fiber Readout:</span>
                  <span className="text-cyan-300 font-bold">{scalingMetrics.futureFiberPairs} Optical Fiber Pairs</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
      )}

    </div>
  );
};

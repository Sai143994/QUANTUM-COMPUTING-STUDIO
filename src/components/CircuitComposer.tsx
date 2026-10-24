import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Play, 
  SkipForward, 
  Trash2, 
  Undo2, 
  Save, 
  FolderOpen, 
  Bookmark, 
  Sparkles,
  Info,
  Sliders,
  ChevronRight,
  Download,
  Image as ImageIcon,
  Check,
  X,
  Volume2,
  VolumeX,
  Layers,
  Activity,
  Grid3X3,
  Eye,
  Cpu,
  Calculator,
  Wand2,
  Trophy
} from 'lucide-react';
import { 
  GateType, 
  GateOp, 
  GATES_REGISTRY, 
  NoiseChannel,
  QuantumState,
  Complex,
  CircuitMetrics
} from '../types/quantum';
import { CircuitComplexityGauge } from './CircuitComplexityGauge';
import { CircuitOptimizationModal } from './CircuitOptimizationModal';
import { NoiseStudioModal } from './NoiseStudioModal';
import { ActiveQuestBanner } from './ActiveQuestBanner';
import { QuantumQuest } from '../data/quantum_quests';
import { optimizeCircuit, OptimizationResult } from '../utils/circuit_optimizer';
import { useToast } from '../context/ToastContext';
import { playGateClickSound, playMeasurementCollapseSound } from '../utils/audio';

export interface CircuitPreset {
  id: string;
  name: string;
  desc: string;
  qubits: number;
  gates: GateOp[];
}

export const CIRCUIT_PRESETS: CircuitPreset[] = [
  {
    id: 'bell_phi_plus',
    name: 'Bell State |Φ+⟩',
    desc: 'Maximal 2-qubit entanglement (|00⟩ + |11⟩)/√2',
    qubits: 2,
    gates: [
      { type: 'H', qubit: 0, step: 0 },
      { type: 'CNOT', control: 0, target: 1, step: 1 }
    ]
  },
  {
    id: 'bell_psi_minus',
    name: 'Bell State |Ψ-⟩',
    desc: 'Antisymmetric singlet state (|01⟩ - |10⟩)/√2',
    qubits: 2,
    gates: [
      { type: 'X', qubit: 0, step: 0 },
      { type: 'X', qubit: 1, step: 0 },
      { type: 'H', qubit: 0, step: 1 },
      { type: 'CNOT', control: 0, target: 1, step: 2 }
    ]
  },
  {
    id: 'ghz_3q',
    name: 'GHZ State (3-Qubit)',
    desc: 'Greenberger-Horne-Zeilinger tri-partite superposition',
    qubits: 3,
    gates: [
      { type: 'H', qubit: 0, step: 0 },
      { type: 'CNOT', control: 0, target: 1, step: 1 },
      { type: 'CNOT', control: 1, target: 2, step: 2 }
    ]
  },
  {
    id: 'teleportation',
    name: 'Quantum Teleportation',
    desc: 'Disembodied transport of arbitrary qubit state using EPR channel',
    qubits: 3,
    gates: [
      { type: 'Ry', qubit: 0, step: 0, angle: 1.047 },
      { type: 'H', qubit: 1, step: 1 },
      { type: 'CNOT', control: 1, target: 2, step: 2 },
      { type: 'CNOT', control: 0, target: 1, step: 3 },
      { type: 'H', qubit: 0, step: 4 },
      { type: 'CNOT', control: 1, target: 2, step: 5 },
      { type: 'CZ', control: 0, target: 2, step: 6 }
    ]
  },
  {
    id: 'qft_3q',
    name: 'Quantum Fourier Transform',
    desc: 'Coherent frequency domain transformation on 3 qubits',
    qubits: 3,
    gates: [
      { type: 'H', qubit: 0, step: 0 },
      { type: 'CP', control: 1, target: 0, step: 1, angle: Math.PI / 2 },
      { type: 'CP', control: 2, target: 0, step: 2, angle: Math.PI / 4 },
      { type: 'H', qubit: 1, step: 3 },
      { type: 'CP', control: 2, target: 1, step: 4, angle: Math.PI / 2 },
      { type: 'H', qubit: 2, step: 5 },
      { type: 'SWAP', q1: 0, q2: 2, step: 6 }
    ]
  },
  {
    id: 'grover_2q',
    name: 'Grover Search (|11⟩)',
    desc: 'Oracle marked state + amplitude amplification diffusion',
    qubits: 2,
    gates: [
      { type: 'H', qubit: 0, step: 0 },
      { type: 'H', qubit: 1, step: 0 },
      { type: 'CZ', control: 0, target: 1, step: 1 },
      { type: 'H', qubit: 0, step: 2 },
      { type: 'H', qubit: 1, step: 2 },
      { type: 'X', qubit: 0, step: 3 },
      { type: 'X', qubit: 1, step: 3 },
      { type: 'CZ', control: 0, target: 1, step: 4 },
      { type: 'X', qubit: 0, step: 5 },
      { type: 'X', qubit: 1, step: 5 },
      { type: 'H', qubit: 0, step: 6 },
      { type: 'H', qubit: 1, step: 6 }
    ]
  },
  {
    id: 'deutsch_jozsa',
    name: 'Deutsch-Jozsa Algorithm',
    desc: 'Single-query deterministic evaluation of balanced oracle',
    qubits: 3,
    gates: [
      { type: 'X', qubit: 2, step: 0 },
      { type: 'H', qubit: 0, step: 1 },
      { type: 'H', qubit: 1, step: 1 },
      { type: 'H', qubit: 2, step: 1 },
      { type: 'CNOT', control: 0, target: 2, step: 2 },
      { type: 'CNOT', control: 1, target: 2, step: 3 },
      { type: 'H', qubit: 0, step: 4 },
      { type: 'H', qubit: 1, step: 4 }
    ]
  }
];

interface CircuitComposerProps {
  numQubits: number;
  setNumQubits: (n: number) => void;
  circuit: GateOp[];
  setCircuit: React.Dispatch<React.SetStateAction<GateOp[]>>;
  selectedGate: GateType;
  setSelectedGate: (g: GateType) => void;
  rotAngle: number;
  setRotAngle: (a: number) => void;
  noise: number;
  setNoise: (n: number) => void;
  noiseModel: NoiseChannel;
  setNoiseModel: (m: NoiseChannel) => void;
  shots: number;
  setShots: (s: number) => void;
  speed: number;
  setSpeed: (sp: number) => void;
  simStep: number;
  simRunning: boolean;
  onRun: () => void;
  onStep: () => void;
  onReset: () => void;
  qstate?: QuantumState | null;
  activeQuest?: QuantumQuest | null;
  onClearQuest?: () => void;
  onOpenQuestModal?: () => void;
  onSaveQuestProgress?: (questId: string, stars: number, bestGates: number) => void;
}

export const CircuitComposer: React.FC<CircuitComposerProps> = ({
  numQubits,
  setNumQubits,
  circuit,
  setCircuit,
  selectedGate,
  setSelectedGate,
  rotAngle,
  setRotAngle,
  noise,
  setNoise,
  noiseModel,
  setNoiseModel,
  shots,
  setShots,
  speed,
  setSpeed,
  simStep,
  simRunning,
  onRun,
  onStep,
  onReset,
  qstate,
  activeQuest,
  onClearQuest,
  onOpenQuestModal,
  onSaveQuestProgress
}) => {
  const { showToast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ step: number; qubit: number } | null>(null);
  const [pendingControl, setPendingControl] = useState<{ qubit: number; step: number; type: GateType } | null>(null);
  const [pendingThreeQubit, setPendingThreeQubit] = useState<{ step: number; picks: number[]; type: GateType } | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveSnapshotName, setSaveSnapshotName] = useState('');
  const [presetsOpen, setPresetsOpen] = useState(false);
  const [unitaryModalOpen, setUnitaryModalOpen] = useState(false);
  const [observablesModalOpen, setObservablesModalOpen] = useState(false);
  const [optimizationModalOpen, setOptimizationModalOpen] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [noiseStudioOpen, setNoiseStudioOpen] = useState(false);

  const handleOpenOptimization = () => {
    const res = optimizeCircuit(circuit, numQubits, rotAngle);
    setOptimizationResult(res);
    setOptimizationModalOpen(true);
    playGateClickSound(700);
  };

  const handleApplyOptimization = (newCircuit: GateOp[]) => {
    setCircuit(newCircuit);
    playMeasurementCollapseSound();
    showToast(
      'Circuit Transpiled & Optimized',
      'success',
      `Applied ${optimizationResult?.logs.length || 0} compiler reduction passes.`
    );
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Professional Circuit Metrics
  const metrics: CircuitMetrics = useMemo(() => {
    return QuantumState.calculateMetrics(numQubits, circuit);
  }, [numQubits, circuit]);

  // Synthesized Unitary Matrix U_circ for inspection
  const circuitUnitary = useMemo(() => {
    if (!unitaryModalOpen) return null;
    return QuantumState.synthesizeCircuitUnitary(numQubits, circuit, rotAngle);
  }, [unitaryModalOpen, numQubits, circuit, rotAngle]);

  // Custom Light Pulse Animation Sequence across Circuit Wires
  const [pulseProgress, setPulseProgress] = useState<number | null>(null);
  const pulseAnimRef = useRef<number | null>(null);

  const triggerPulseAnimation = useCallback(() => {
    if (pulseAnimRef.current) {
      cancelAnimationFrame(pulseAnimRef.current);
    }
    const startTime = performance.now();
    const duration = Math.max(950, 1650 / speed);

    const frame = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1.0, elapsed / duration);
      setPulseProgress(progress);

      if (progress < 1.0) {
        pulseAnimRef.current = requestAnimationFrame(frame);
      } else {
        setTimeout(() => {
          setPulseProgress(null);
        }, 180);
      }
    };

    pulseAnimRef.current = requestAnimationFrame(frame);
  }, [speed]);

  // Automatically trigger light pulse sequence when simulation starts
  const prevSimRunning = useRef(simRunning);
  useEffect(() => {
    if (simRunning && !prevSimRunning.current) {
      triggerPulseAnimation();
    }
    prevSimRunning.current = simRunning;
  }, [simRunning, triggerPulseAnimation]);

  useEffect(() => {
    return () => {
      if (pulseAnimRef.current) cancelAnimationFrame(pulseAnimRef.current);
    };
  }, []);

  // Local storage circuit library
  const [savedCircuits, setSavedCircuits] = useState<Array<{ name: string; date: string; gates: GateOp[]; qubits: number }>>(() => {
    try {
      const data = localStorage.getItem('quantum_studio_circuits_v2');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });

  const openSaveModal = () => {
    setSaveSnapshotName(`Circuit ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    setSaveModalOpen(true);
  };

  const handleConfirmSave = () => {
    const name = saveSnapshotName.trim();
    if (!name) return;
    const updated = [
      { name, date: new Date().toISOString(), gates: circuit, qubits: numQubits },
      ...savedCircuits.filter(c => c.name !== name)
    ];
    setSavedCircuits(updated);
    try {
      localStorage.setItem('quantum_studio_circuits_v2', JSON.stringify(updated));
      showToast('Snapshot Saved', 'success', `Saved "${name}" with ${circuit.length} gates.`);
    } catch {
      showToast('Storage Error', 'error', 'Could not save to browser storage.');
    }
    setSaveModalOpen(false);
  };

  const loadFromLibrary = (item: { gates: GateOp[]; qubits: number; name?: string }) => {
    setNumQubits(item.qubits);
    setCircuit(item.gates);
    setLibraryOpen(false);
    showToast('Circuit Loaded', 'info', `Loaded ${item.name || 'snapshot'} (${item.gates.length} gates).`);
  };

  const deleteFromLibrary = (name: string) => {
    const updated = savedCircuits.filter(c => c.name !== name);
    setSavedCircuits(updated);
    try {
      localStorage.setItem('quantum_studio_circuits_v2', JSON.stringify(updated));
      showToast('Snapshot Deleted', 'info', `Removed "${name}" from library.`);
    } catch {
      // ignore
    }
  };

  const handleLoadPreset = (preset: CircuitPreset) => {
    setNumQubits(preset.qubits);
    setCircuit(preset.gates);
    setPresetsOpen(false);
    showToast('Preset Armed', 'success', `Loaded ${preset.name}: ${preset.desc}`);
  };

  const handleExportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `quantum-circuit-${Date.now()}.png`;
      a.click();
      showToast('Diagram Exported', 'success', 'High-resolution PNG diagram saved.');
    } catch {
      showToast('Export Failed', 'error', 'Canvas export was blocked.');
    }
  };

  const handleExportJson = () => {
    const payload = {
      format: 'quantum-studio-v2',
      numQubits,
      rotAngle,
      circuit,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quantum-circuit-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('JSON Exported', 'success', 'Circuit schema downloaded.');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (Array.isArray(data.circuit)) {
          if (data.numQubits) setNumQubits(Math.min(8, Math.max(1, data.numQubits)));
          if (typeof data.rotAngle === 'number') setRotAngle(data.rotAngle);
          setCircuit(data.circuit);
          showToast('Circuit Imported', 'success', `Imported ${data.circuit.length} gates.`);
        }
      } catch {
        showToast('Invalid Circuit JSON', 'error', 'Could not parse the uploaded quantum circuit format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Canvas drawing dimensions
  const getLayout = useCallback((width: number, height: number) => {
    const marginL = 72;
    const marginR = 32;
    const marginT = 36;
    const rowH = Math.max(48, (height - marginT) / numQubits);
    const maxSteps = Math.max(16, Math.floor((width - marginL - marginR) / 44));
    const stepW = (width - marginL - marginR) / maxSteps;
    return { marginL, marginR, marginT, rowH, maxSteps, stepW };
  }, [numQubits]);

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const { marginL, marginR, marginT, rowH, maxSteps, stepW } = getLayout(width, height);

    ctx.clearRect(0, 0, width, height);

    const qubitY = (q: number) => marginT + q * rowH + rowH / 2;
    const stepX = (s: number) => marginL + s * stepW + stepW / 2;

    // Step columns background grid & subtle numbers
    ctx.fillStyle = 'rgba(148, 163, 184, 0.25)';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    for (let s = 0; s < maxSteps; s++) {
      const x = stepX(s);
      ctx.fillText(`${s}`, x, 20);
      ctx.strokeStyle = s % 4 === 0 ? 'rgba(51, 65, 85, 0.4)' : 'rgba(30, 41, 59, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, marginT - 6);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Qubit wire rails
    for (let q = 0; q < numQubits; q++) {
      const y = qubitY(q);

      // Qubit Label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`q[${q}]`, marginL - 26, y + 4);

      // Initial state |0⟩
      ctx.fillStyle = '#38bdf8';
      ctx.font = '500 11px "JetBrains Mono", monospace';
      ctx.fillText('|0⟩', marginL - 8, y + 4);

      // Rail Line
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(marginL, y);
      ctx.lineTo(width - marginR, y);
      ctx.stroke();

      // Custom Animation Sequence: High-energy light pulse propagating across the wire
      if (pulseProgress !== null) {
        const totalW = width - marginL - marginR;
        const pulseX = marginL + pulseProgress * totalW;
        const trailLen = Math.min(140, pulseProgress * totalW);
        const trailStart = Math.max(marginL, pulseX - trailLen);

        // 1. Glowing linear gradient beam trailing the pulse on this wire
        const trailGrad = ctx.createLinearGradient(trailStart, y, pulseX, y);
        trailGrad.addColorStop(0, 'rgba(0, 229, 255, 0)');
        trailGrad.addColorStop(0.5, 'rgba(0, 229, 255, 0.35)');
        trailGrad.addColorStop(0.85, 'rgba(56, 189, 248, 0.85)');
        trailGrad.addColorStop(1, '#ffffff');

        ctx.strokeStyle = trailGrad;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(trailStart, y);
        ctx.lineTo(pulseX, y);
        ctx.stroke();

        // 2. High-intensity radial photon packet head
        const pulseGlow = ctx.createRadialGradient(pulseX, y, 1, pulseX, y, 16);
        pulseGlow.addColorStop(0, '#ffffff');
        pulseGlow.addColorStop(0.25, '#38bdf8');
        pulseGlow.addColorStop(0.65, 'rgba(0, 229, 255, 0.45)');
        pulseGlow.addColorStop(1, 'rgba(0, 229, 255, 0)');
        ctx.fillStyle = pulseGlow;
        ctx.beginPath();
        ctx.arc(pulseX, y, 16, 0, Math.PI * 2);
        ctx.fill();

        // 3. Ultra-bright white photon center
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(pulseX, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Active execution step indicator
    if (simRunning || simStep > 0) {
      const activeX = stepX(simStep);
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(activeX, marginT - 10);
      ctx.lineTo(activeX, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Glow beacon on top
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(activeX, marginT - 12, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw gates with light pulse ionization and energy transfer
    const totalW = width - marginL - marginR;
    const currentPulseX = pulseProgress !== null ? marginL + pulseProgress * totalW : -999;

    circuit.forEach(g => {
      const x = stepX(g.step);
      const isPastOrActive = simStep >= g.step && simStep > 0;

      // Calculate excitation state when the light pulse passes through this gate
      const distToPulse = Math.abs(x - currentPulseX);
      const isPulseExcited = distToPulse < 36;
      const excitation = isPulseExcited ? Math.cos((distToPulse / 36) * (Math.PI / 2)) : 0;

      if ((g.type === 'SWAP' || g.type === 'ISWAP' || g.type === 'SQRT_SWAP') && g.q1 !== undefined && g.q2 !== undefined) {
        const y1 = qubitY(g.q1);
        const y2 = qubitY(g.q2);
        ctx.strokeStyle = isPulseExcited ? '#ffffff' : g.type === 'SQRT_SWAP' ? '#00e5ff' : '#a855f7';
        ctx.lineWidth = isPulseExcited ? 3.5 : 2;
        if (isPulseExcited) {
          ctx.shadowColor = '#00e5ff';
          ctx.shadowBlur = 16 * excitation;
        }
        ctx.beginPath();
        ctx.moveTo(x, y1);
        ctx.lineTo(x, y2);
        ctx.stroke();
        ctx.shadowBlur = 0;
        [y1, y2].forEach(y => {
          ctx.beginPath();
          ctx.moveTo(x - 5, y - 5);
          ctx.lineTo(x + 5, y + 5);
          ctx.moveTo(x + 5, y - 5);
          ctx.lineTo(x - 5, y + 5);
          ctx.stroke();
        });
      } else if (g.control !== undefined && g.target !== undefined) {
        const cy = qubitY(g.control);
        const ty = qubitY(g.target);

        // Connector line with excitation flash
        ctx.strokeStyle = isPulseExcited 
          ? '#ffffff' 
          : g.type === 'CNOT' ? '#38bdf8' : g.type === 'CZ' ? '#6366f1' : g.type.startsWith('CR') ? '#f59e0b' : '#06b6d4';
        ctx.lineWidth = isPulseExcited ? 3.5 : 2;
        if (isPulseExcited) {
          ctx.shadowColor = '#00e5ff';
          ctx.shadowBlur = 18 * excitation;
        }
        ctx.beginPath();
        ctx.moveTo(x, cy);
        ctx.lineTo(x, ty);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Control filled circle
        ctx.fillStyle = ctx.strokeStyle;
        ctx.beginPath();
        ctx.arc(x, cy, isPulseExcited ? 6 : 5, 0, Math.PI * 2);
        ctx.fill();

        if (g.type === 'CNOT') {
          // Target target ring + cross
          ctx.strokeStyle = isPulseExcited ? '#ffffff' : '#38bdf8';
          ctx.lineWidth = isPulseExcited ? 3 : 2;
          ctx.beginPath();
          ctx.arc(x, ty, 9, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x - 9, ty);
          ctx.lineTo(x + 9, ty);
          ctx.moveTo(x, ty - 9);
          ctx.lineTo(x, ty + 9);
          ctx.stroke();
        } else if (g.type === 'CZ') {
          ctx.beginPath();
          ctx.arc(x, ty, isPulseExcited ? 6 : 5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Box for other controlled gates (CY, CP, CRX, CRY, CRZ, ECR)
          const def = GATES_REGISTRY[g.type];
          const w = 26;
          const h = 24;
          ctx.fillStyle = isPulseExcited ? '#1e293b' : '#0f172a';
          if (isPulseExcited) {
            ctx.shadowColor = '#00e5ff';
            ctx.shadowBlur = 16 * excitation;
          }
          ctx.beginPath();
          ctx.roundRect(x - w / 2, ty - h / 2, w, h, 4);
          ctx.fill();
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#f8fafc';
          ctx.font = 'bold 10px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(def?.label || g.type, x, ty);
        }
      } else if (g.type === 'CCX' && g.c1 !== undefined && g.c2 !== undefined && g.target !== undefined) {
        const c1y = qubitY(g.c1);
        const c2y = qubitY(g.c2);
        const ty = qubitY(g.target);
        const minY = Math.min(c1y, c2y, ty);
        const maxY = Math.max(c1y, c2y, ty);
        ctx.strokeStyle = isPulseExcited ? '#ffffff' : '#06b6d4';
        ctx.lineWidth = isPulseExcited ? 3.5 : 2;
        if (isPulseExcited) {
          ctx.shadowColor = '#00e5ff';
          ctx.shadowBlur = 18 * excitation;
        }
        ctx.beginPath();
        ctx.moveTo(x, minY);
        ctx.lineTo(x, maxY);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = ctx.strokeStyle;
        ctx.beginPath();
        ctx.arc(x, c1y, 5, 0, Math.PI * 2);
        ctx.arc(x, c2y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = ctx.strokeStyle;
        ctx.beginPath();
        ctx.arc(x, ty, 9, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - 9, ty);
        ctx.lineTo(x + 9, ty);
        ctx.moveTo(x, ty - 9);
        ctx.lineTo(x, ty + 9);
        ctx.stroke();
      } else if (g.qubit !== undefined) {
        const y = qubitY(g.qubit);
        const def = GATES_REGISTRY[g.type];
        const w = 28;
        const h = 26;
        const bx = x - w / 2;
        const by = y - h / 2;

        ctx.fillStyle = isPulseExcited ? '#1e293b' : '#0f172a';
        ctx.strokeStyle = isPulseExcited 
          ? '#ffffff' 
          : g.type === 'H' ? '#06b6d4' : g.type === 'X' ? '#f43f5e' : g.type.startsWith('R') ? '#f59e0b' : '#a855f7';
        ctx.lineWidth = isPulseExcited ? 2.5 : 1.5;

        if (isPulseExcited) {
          ctx.shadowColor = g.type === 'H' ? '#00e5ff' : g.type === 'X' ? '#f43f5e' : g.type.startsWith('R') ? '#f59e0b' : '#a855f7';
          ctx.shadowBlur = 20 * excitation;
        }

        // Rounded rect box
        ctx.beginPath();
        ctx.roundRect(bx, by, w, h, 4);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Radiating quantum ionization ring when pulse sweeps directly over gate
        if (distToPulse < 14) {
          ctx.strokeStyle = 'rgba(0, 229, 255, 0.75)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(x, y, 18 + (14 - distToPulse) * 0.9, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = '#f8fafc';
        ctx.font = '600 11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(def?.label || g.type, x, y);
      }
    });

    // Hover ghost preview
    if (hoveredCell && !simRunning) {
      const hx = stepX(hoveredCell.step);
      const hy = qubitY(hoveredCell.qubit);
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)';
      ctx.fillStyle = 'rgba(34, 211, 238, 0.08)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.roundRect(hx - 14, hy - 13, 28, 26, 4);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [circuit, numQubits, simStep, simRunning, hoveredCell, getLayout, pulseProgress]);

  // Handle cell click to place or remove gates
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (simRunning) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const { marginL, rowH, marginT, stepW, maxSteps } = getLayout(rect.width, rect.height);

    const step = Math.floor((mx - marginL) / stepW);
    const qubit = Math.floor((my - marginT) / rowH);

    if (step < 0 || step >= maxSteps || qubit < 0 || qubit >= numQubits) return;

    const gateTouchesQubit = (g: GateOp, q: number) => {
      return (
        g.qubit === q ||
        g.control === q ||
        g.target === q ||
        g.q1 === q ||
        g.q2 === q ||
        g.c1 === q ||
        g.c2 === q ||
        g.t1 === q ||
        g.t2 === q
      );
    };

    if (selectedGate === 'ERASER') {
      playGateClickSound(400);
      setCircuit(prev => prev.filter(g => !(g.step === step && gateTouchesQubit(g, qubit))));
      setPendingControl(null);
      setPendingThreeQubit(null);
      return;
    }

    const def = GATES_REGISTRY[selectedGate];

    if (def.threeQubit) {
      if (!pendingThreeQubit || pendingThreeQubit.step !== step) {
        playGateClickSound(580);
        setPendingThreeQubit({ step, picks: [qubit], type: selectedGate });
      } else {
        const nextPicks = [...pendingThreeQubit.picks, qubit];
        if (nextPicks.length === 3) {
          playGateClickSound(880);
          const [p1, p2, p3] = nextPicks;
          // Clear all touched cells at this step to prevent duplicate collisions
          setCircuit(prev => [
            ...prev.filter(g => !(g.step === step && (gateTouchesQubit(g, p1) || gateTouchesQubit(g, p2) || gateTouchesQubit(g, p3)))),
            selectedGate === 'CSWAP'
              ? { type: 'CSWAP', control: p1, t1: p2, t2: p3, step }
              : { type: 'CCX', c1: p1, c2: p2, target: p3, step }
          ]);
          setPendingThreeQubit(null);
        } else {
          playGateClickSound(660);
          setPendingThreeQubit({ step, picks: nextPicks, type: selectedGate });
        }
      }
      return;
    }

    if (def.twoQubit) {
      if (!pendingControl || pendingControl.step !== step) {
        playGateClickSound(580);
        setPendingControl({ qubit, step, type: selectedGate });
      } else {
        const cQubit = pendingControl.qubit;
        if (cQubit !== qubit) {
          playGateClickSound(880);
          setCircuit(prev => [
            ...prev.filter(g => !(g.step === step && (gateTouchesQubit(g, cQubit) || gateTouchesQubit(g, qubit)))),
            selectedGate === 'SWAP' || selectedGate === 'ISWAP' || selectedGate === 'SQRT_SWAP'
              ? { type: selectedGate, q1: cQubit, q2: qubit, step }
              : { 
                  type: selectedGate, 
                  control: cQubit, 
                  target: qubit, 
                  step, 
                  angle: (selectedGate === 'CP' || selectedGate === 'CRX' || selectedGate === 'CRY' || selectedGate === 'CRZ') ? rotAngle : undefined 
                }
          ]);
        }
        setPendingControl(null);
      }
      return;
    }

    // Check if user is clicking on an identical existing gate on this cell: toggle it off to avoid duplicate
    const existingExact = circuit.find(g => 
      g.step === step && 
      g.qubit === qubit && 
      g.type === selectedGate &&
      (g.angle === undefined || Math.abs((g.angle || 0) - (rotAngle || 0)) < 1e-4)
    );

    if (existingExact) {
      playGateClickSound(400);
      setCircuit(prev => prev.filter(g => g !== existingExact));
      return;
    }

    // Single qubit or parameterized: cleanly replace any overlapping gate at this (step, qubit)
    playGateClickSound(750);
    setCircuit(prev => [
      ...prev.filter(g => !(g.step === step && gateTouchesQubit(g, qubit))),
      { 
        type: selectedGate, 
        qubit, 
        step, 
        angle: (selectedGate.startsWith('R') || selectedGate === 'U1') ? rotAngle : undefined,
        theta: selectedGate === 'U3' ? rotAngle : undefined,
        phi: selectedGate === 'U3' ? 0 : undefined,
        lam: selectedGate === 'U3' ? 0 : undefined
      }
    ]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const { marginL, rowH, marginT, stepW, maxSteps } = getLayout(rect.width, rect.height);
    const step = Math.floor((mx - marginL) / stepW);
    const qubit = Math.floor((my - marginT) / rowH);

    if (step >= 0 && step < maxSteps && qubit >= 0 && qubit < numQubits) {
      setHoveredCell({ step, qubit });
    } else {
      setHoveredCell(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#090b10] border-b border-slate-800">
      {/* Active Quest Challenge HUD Banner */}
      {activeQuest && onClearQuest && onOpenQuestModal && onSaveQuestProgress && (
        <ActiveQuestBanner
          quest={activeQuest}
          circuit={circuit}
          qstate={qstate || null}
          onClearQuest={onClearQuest}
          onOpenQuestModal={onOpenQuestModal}
          onSaveProgress={onSaveQuestProgress}
        />
      )}

      {/* Top Composer Control Toolbar */}
      <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Custom Animation Sequence: Run Simulation with Light Pulse */}
          <button
            onClick={() => {
              playGateClickSound(850);
              triggerPulseAnimation();
              onRun();
            }}
            disabled={simRunning || circuit.length === 0}
            className={`px-3 py-1 rounded-lg font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
              simRunning
                ? 'bg-slate-800 text-slate-400 border border-slate-700'
                : 'bg-gradient-to-r from-[#00e5ff] to-[#38bdf8] hover:from-[#38bdf8] hover:to-[#00e5ff] text-[#02060a] shadow-[#00e5ff]/30 ring-1 ring-[#00e5ff]/60'
            }`}
            title="Run quantum simulation & trigger photon light pulse animation across circuit wires"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${simRunning ? 'animate-spin' : ''}`} />
            <span>{simRunning ? 'Simulating…' : 'Run Simulation'}</span>
          </button>

          <span className="text-slate-700">·</span>

          <span className="font-mono text-[11px] text-slate-400 font-medium">REGISTER:</span>
          <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded border border-slate-800">
            <span className="font-mono text-cyan-300 font-semibold">{numQubits} Qubits</span>
            <input 
              type="range" 
              min="1" 
              max="8" 
              value={numQubits}
              onChange={(e) => setNumQubits(+e.target.value)}
              className="w-16 h-1 bg-slate-800 accent-cyan-400 rounded-sm cursor-pointer ml-1"
            />
          </div>

          <span className="text-slate-700">·</span>

          <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded border border-slate-800 font-mono">
            <span className="text-slate-400 text-[11px]">θ angle:</span>
            <span className="text-amber-300">{Math.round((rotAngle * 180) / Math.PI)}°</span>
            <input 
              type="range" 
              min="0" 
              max="360" 
              value={Math.round((rotAngle * 180) / Math.PI)}
              onChange={(e) => setRotAngle((+e.target.value * Math.PI) / 180)}
              className="w-16 h-1 bg-slate-800 accent-amber-400 rounded-sm cursor-pointer"
            />
          </div>

          <span className="text-slate-700">·</span>

          <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded border border-slate-800 font-mono">
            <span className="text-slate-400 text-[11px]">Noise ε:</span>
            <span className="text-rose-400">{noise}%</span>
            <input 
              type="range" 
              min="0" 
              max="50" 
              value={noise}
              onChange={(e) => setNoise(+e.target.value)}
              className="w-14 h-1 bg-slate-800 accent-rose-500 rounded-sm cursor-pointer"
            />
            <select
              value={noiseModel}
              onChange={(e) => setNoiseModel(e.target.value as NoiseChannel)}
              className="bg-transparent text-slate-300 text-[11px] outline-none ml-1 cursor-pointer"
            >
              <option value="dephasing" className="bg-slate-900 text-slate-200">Dephasing</option>
              <option value="bitflip" className="bg-slate-900 text-slate-200">Bit-flip (X)</option>
              <option value="phaseflip" className="bg-slate-900 text-slate-200">Phase-flip (Z)</option>
              <option value="depolarizing" className="bg-slate-900 text-slate-200">Depolarizing</option>
              <option value="amplitude_damping" className="bg-slate-900 text-slate-200">Amp. Damping</option>
            </select>

            <button
              onClick={() => setNoiseStudioOpen(true)}
              className="ml-1 px-2 py-0.5 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
              title="Open Physical Hardware Noise Studio & ZNE Error Mitigation"
            >
              <Activity className="w-3 h-3 text-rose-400" />
              <span>Decoherence Lab</span>
            </button>
          </div>
        </div>

        {/* Circuit Operations & Library */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Multi-Pass Circuit Transpiler & Optimizer Button */}
          <button
            onClick={handleOpenOptimization}
            disabled={circuit.length === 0}
            className="px-2.5 py-1 rounded bg-cyan-950/80 hover:bg-cyan-900/90 text-cyan-300 border border-cyan-500/30 text-xs flex items-center gap-1.5 font-medium cursor-pointer shadow-xs disabled:opacity-40"
            title="Run multi-pass gate cancellation, continuous rotation fusion, and ASAP scheduling"
          >
            <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Optimize</span>
          </button>

          {/* Quests / Puzzle Challenges */}
          {onOpenQuestModal && (
            <button
              onClick={onOpenQuestModal}
              className="px-2.5 py-1 rounded bg-amber-950/80 hover:bg-amber-900/90 text-amber-300 border border-amber-500/30 text-xs flex items-center gap-1.5 font-medium cursor-pointer shadow-xs"
              title="Open Quantum Quests & Circuit Puzzle Challenges"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Quests</span>
            </button>
          )}

          {/* Quick Presets Dropdown */}
          <div className="relative">
            <button
              onClick={() => setPresetsOpen(!presetsOpen)}
              className="px-2.5 py-1 rounded bg-indigo-950/80 hover:bg-indigo-900/90 text-indigo-300 border border-indigo-500/30 text-xs flex items-center gap-1.5 font-medium cursor-pointer shadow-xs"
              title="Load standard quantum algorithm & state presets"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Presets</span>
            </button>

            {presetsOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 p-2 space-y-1 backdrop-blur-md">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-2 py-1 border-b border-slate-800">
                  Famous Quantum Circuits
                </div>
                <div className="max-h-56 overflow-y-auto space-y-1">
                  {CIRCUIT_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => handleLoadPreset(preset)}
                      className="w-full text-left p-2 rounded hover:bg-slate-800/80 transition-colors group cursor-pointer"
                    >
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                        {preset.name}
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">
                        {preset.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <span className="text-slate-800">|</span>

          <button
            onClick={() => {
              playGateClickSound(500);
              setCircuit(prev => prev.slice(0, -1));
            }}
            disabled={circuit.length === 0}
            className="p-1.5 rounded hover:bg-slate-800 disabled:opacity-30 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="Undo Last Gate"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              playGateClickSound(300);
              setCircuit([]);
            }}
            disabled={circuit.length === 0}
            className="p-1.5 rounded hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 disabled:opacity-30 transition-colors cursor-pointer"
            title="Clear Circuit"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <span className="text-slate-800">|</span>

          <button
            onClick={openSaveModal}
            className="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors cursor-pointer"
            title="Save to browser snapshots"
          >
            <Bookmark className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">Save</span>
          </button>
          <button
            onClick={() => setLibraryOpen(true)}
            className="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors cursor-pointer"
            title="View saved snapshots"
          >
            <FolderOpen className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">Library ({savedCircuits.length})</span>
          </button>
          <button
            onClick={handleExportPng}
            className="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors cursor-pointer"
            title="Export high-resolution diagram image (PNG)"
          >
            <ImageIcon className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">PNG</span>
          </button>
          <button
            onClick={handleExportJson}
            className="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors cursor-pointer"
            title="Export JSON file"
          >
            <Save className="w-3 h-3 text-indigo-400" />
            <span className="hidden sm:inline">JSON</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImportJson} 
            accept="application/json" 
            className="hidden" 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors cursor-pointer"
            title="Import JSON file"
          >
            <span>Import</span>
          </button>
        </div>
      </div>

      {/* Circuit Complexity Gauge UI Component */}
      <CircuitComplexityGauge circuit={circuit} numQubits={numQubits} />

      {/* Workstation Engineering Metrics Strip */}
      <div className="bg-[#03070d] border-b border-[rgba(0,229,255,0.1)] px-4 py-1.5 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-[#78909c]">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[10px] text-cyan-400 font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
            [CALCULATED METRICS]
          </span>
          <span>1Q Cliffords: <strong className="text-white">{metrics.clifford1Q}</strong></span>
          <span className="text-slate-700">·</span>
          <span>2Q Entanglers: <strong className="text-cyan-300">{metrics.entanglers2Q}</strong></span>
          <span className="text-slate-700">·</span>
          <span>Non-Clifford T: <strong className={metrics.nonCliffordT > 0 ? "text-amber-400" : "text-slate-400"}>{metrics.nonCliffordT}</strong></span>
          <span className="text-slate-700">·</span>
          <span>Critical Depth: <strong className="text-white">{metrics.depth}</strong></span>
          <span className="text-slate-700">·</span>
          <span>Est. QPU Time: <strong className="text-emerald-400">{metrics.estimatedExecTimeNs} ns</strong></span>
          <span className="text-slate-700">·</span>
          <span>RAM: <strong className="text-slate-300">{metrics.statevectorBytes} B</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playGateClickSound(600);
              setUnitaryModalOpen(true);
            }}
            className="px-2.5 py-1 rounded bg-[#09141d] hover:bg-[#0c1a26] border border-cyan-500/30 text-cyan-300 text-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            title="Inspect synthesized 2^n x 2^n unitary matrix U_circuit"
          >
            <Grid3X3 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Unitary U_circ</span>
          </button>

          <button
            onClick={() => {
              playGateClickSound(600);
              setObservablesModalOpen(true);
            }}
            className="px-2.5 py-1 rounded bg-[#09141d] hover:bg-[#0c1a26] border border-purple-500/30 text-purple-300 text-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            title="Inspect Pauli expectation values <Z_i>, <X_i>, <Y_i> and 2-qubit correlations"
          >
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            <span>Observables ⟨P⟩</span>
          </button>
        </div>
      </div>

      {/* Guided placement notification banner when multi-qubit gate is armed */}
      {pendingControl && (
        <div className="bg-cyan-950/50 border-b border-cyan-800/50 px-4 py-1.5 text-xs text-cyan-300 flex items-center justify-between">
          <span className="font-mono flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            Control set on <strong>q[{pendingControl.qubit}]</strong>. Now click target qubit on step {pendingControl.step}.
          </span>
          <button 
            onClick={() => setPendingControl(null)}
            className="text-[11px] underline hover:text-white cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}
      {pendingThreeQubit && (
        <div className="bg-amber-950/50 border-b border-amber-800/50 px-4 py-1.5 text-xs text-amber-300 flex items-center justify-between">
          <span className="font-mono flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            {pendingThreeQubit.type}: picked {pendingThreeQubit.picks.length}/3 qubits (q[{pendingThreeQubit.picks.join(', ')}]). Click remaining qubit.
          </span>
          <button 
            onClick={() => setPendingThreeQubit(null)}
            className="text-[11px] underline hover:text-white cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Prominent Top Quantum Gate Palette Bar */}
      <div className="border-y border-[rgba(0,229,255,0.2)] bg-[#070e17] px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 shadow-inner">
        <div className="flex items-center gap-1.5 flex-wrap">
          
          {/* Section: 1-Qubit Standard */}
          <div className="flex items-center gap-1 bg-[#030610] p-1 rounded-lg border border-slate-800">
            <span className="text-[9px] font-mono text-cyan-400 font-bold px-1 uppercase tracking-wider">1Q:</span>
            {(['H', 'X', 'Y', 'Z', 'S', 'T', 'Sdg', 'Tdg', 'SX'] as GateType[]).map(g => (
              <button
                key={g}
                onClick={() => { setSelectedGate(g); setPendingControl(null); setPendingThreeQubit(null); }}
                className={`h-7 min-w-[26px] px-2 rounded font-mono text-xs font-bold transition-all cursor-pointer ${
                  selectedGate === g
                    ? 'bg-[#00e5ff] text-[#02060a] ring-2 ring-[#00e5ff]/50 shadow-md font-extrabold'
                    : 'bg-[#0b1622] hover:bg-[#112235] text-slate-200 border border-slate-700/60'
                }`}
                title={GATES_REGISTRY[g]?.name}
              >
                {GATES_REGISTRY[g]?.label}
              </button>
            ))}
          </div>

          {/* Section: Rotations */}
          <div className="flex items-center gap-1 bg-[#030610] p-1 rounded-lg border border-slate-800">
            <span className="text-[9px] font-mono text-amber-400 font-bold px-1 uppercase tracking-wider">ROT (θ):</span>
            {(['Rx', 'Ry', 'Rz', 'U1'] as GateType[]).map(g => (
              <button
                key={g}
                onClick={() => { setSelectedGate(g); setPendingControl(null); setPendingThreeQubit(null); }}
                className={`h-7 min-w-[28px] px-2 rounded font-mono text-xs font-bold transition-all cursor-pointer ${
                  selectedGate === g
                    ? 'bg-amber-400 text-[#02060a] ring-2 ring-amber-300/50 shadow-md font-extrabold'
                    : 'bg-[#0b1622] hover:bg-[#112235] text-amber-300 border border-amber-500/30'
                }`}
                title={GATES_REGISTRY[g]?.name}
              >
                {GATES_REGISTRY[g]?.label}
              </button>
            ))}
          </div>

          {/* Section: 2-Qubit Entangling */}
          <div className="flex items-center gap-1 bg-[#030610] p-1 rounded-lg border border-slate-800">
            <span className="text-[9px] font-mono text-indigo-400 font-bold px-1 uppercase tracking-wider">2Q:</span>
            {(['CNOT', 'CZ', 'CY', 'SWAP', 'ISWAP', 'SQRT_SWAP', 'CP', 'CRX', 'CRY', 'CRZ', 'ECR'] as GateType[]).map(g => (
              <button
                key={g}
                onClick={() => { setSelectedGate(g); setPendingControl(null); setPendingThreeQubit(null); }}
                className={`h-7 min-w-[28px] px-2 rounded font-mono text-xs font-bold transition-all cursor-pointer ${
                  selectedGate === g
                    ? 'bg-indigo-500 text-white ring-2 ring-indigo-400/50 shadow-md font-extrabold'
                    : 'bg-[#0b1622] hover:bg-[#112235] text-indigo-300 border border-indigo-500/30'
                }`}
                title={GATES_REGISTRY[g]?.name}
              >
                {GATES_REGISTRY[g]?.label}
              </button>
            ))}
          </div>

          {/* Section: 3-Qubit */}
          <div className="flex items-center gap-1 bg-[#030610] p-1 rounded-lg border border-slate-800">
            <span className="text-[9px] font-mono text-purple-400 font-bold px-1 uppercase tracking-wider">3Q:</span>
            {(['CCX', 'CSWAP'] as GateType[]).map(g => (
              <button
                key={g}
                onClick={() => { setSelectedGate(g); setPendingControl(null); setPendingThreeQubit(null); }}
                className={`h-7 min-w-[32px] px-2 rounded font-mono text-xs font-bold transition-all cursor-pointer ${
                  selectedGate === g
                    ? 'bg-purple-500 text-white ring-2 ring-purple-400/50 shadow-md font-extrabold'
                    : 'bg-[#0b1622] hover:bg-[#112235] text-purple-300 border border-purple-500/30'
                }`}
                title={GATES_REGISTRY[g]?.name}
              >
                {GATES_REGISTRY[g]?.label}
              </button>
            ))}
          </div>

          {/* Section: Utility */}
          <div className="flex items-center gap-1 bg-[#030610] p-1 rounded-lg border border-slate-800">
            {(['RESET', 'M', 'ERASER'] as GateType[]).map(g => (
              <button
                key={g}
                onClick={() => { setSelectedGate(g); setPendingControl(null); setPendingThreeQubit(null); }}
                className={`h-7 px-2.5 rounded font-mono text-xs font-bold transition-all cursor-pointer ${
                  selectedGate === g
                    ? 'bg-rose-500 text-white ring-2 ring-rose-400/50 shadow-md font-extrabold'
                    : 'bg-[#0b1622] hover:bg-[#112235] text-rose-300 border border-rose-500/30'
                }`}
                title={GATES_REGISTRY[g]?.name}
              >
                {GATES_REGISTRY[g]?.label}
              </button>
            ))}
          </div>

        </div>

        {/* Selected Gate Description pill */}
        <div className="text-[11px] text-[#78909c] hidden xl:flex items-center gap-1.5 font-mono">
          <span className="text-[#00e5ff] font-semibold">{GATES_REGISTRY[selectedGate]?.name}:</span>
          <span>{GATES_REGISTRY[selectedGate]?.description}</span>
        </div>
      </div>

      {/* Interactive Circuit Canvas */}
      <div className="flex-1 min-h-[260px] max-h-[360px] relative overflow-hidden bg-[#090b10]">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredCell(null)}
          className="w-full h-full block cursor-crosshair"
        />
      </div>

      {/* Snapshots Library Modal */}
      {libraryOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-md w-full p-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Bookmark className="w-4 h-4 text-cyan-400" />
                <span>Saved Circuit Snapshots</span>
              </div>
              <button 
                onClick={() => setLibraryOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
              {savedCircuits.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-6">
                  No saved snapshots yet. Click &quot;Save&quot; in the toolbar to bookmark your circuit.
                </div>
              ) : (
                savedCircuits.map(item => (
                  <div key={item.name} className="flex items-center justify-between p-2.5 rounded bg-slate-950/70 border border-slate-800 text-xs">
                    <div>
                      <div className="font-semibold text-slate-200">{item.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {item.qubits} Qubits · {item.gates.length} Gates · {new Date(item.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => loadFromLibrary(item)}
                        className="px-2 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-medium cursor-pointer"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => deleteFromLibrary(item.name)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-rose-900 text-slate-400 hover:text-rose-200 text-[11px] cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setLibraryOpen(false)}
              className="w-full py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Save Snapshot Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Bookmark className="w-4 h-4 text-cyan-400" />
                <span>Save Circuit Snapshot</span>
              </div>
              <button
                onClick={() => setSaveModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-mono">Snapshot Name:</label>
              <input
                type="text"
                value={saveSnapshotName}
                onChange={e => setSaveSnapshotName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleConfirmSave()}
                autoFocus
                placeholder="e.g. Bell State Optimized"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono outline-none focus:border-cyan-500"
              />
              <div className="text-[11px] text-slate-500 font-mono">
                Capturing {numQubits} qubits, {circuit.length} gates.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSaveModalOpen(false)}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSave}
                className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md shadow-cyan-500/20"
              >
                Save Snapshot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Circuit Unitary Matrix Synthesis Modal */}
      {unitaryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#070e17] border border-cyan-500/40 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-4 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
                  <Grid3X3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    Circuit Unitary Matrix Synthesis: U_circuit
                  </h3>
                  <div className="text-[10px] text-slate-400">
                    Dimension: {Math.pow(2, Math.min(4, numQubits))}×{Math.pow(2, Math.min(4, numQubits))} · [CALCULATED EVOLUTION OPERATOR]
                  </div>
                </div>
              </div>
              <button
                onClick={() => setUnitaryModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Matrix Viewport */}
            {circuitUnitary ? (
              <div className="space-y-3">
                <div className="max-h-96 overflow-auto rounded-lg border border-slate-800 bg-[#030610] p-3">
                  <table className="w-full text-center text-xs border-collapse">
                    <thead>
                      <tr>
                        <th className="p-1 text-[10px] text-slate-500 font-normal">Basis</th>
                        {circuitUnitary[0].map((_, col) => (
                          <th key={col} className="p-1 text-[10px] text-cyan-400 font-semibold border-b border-slate-800">
                            |{col.toString(2).padStart(Math.min(4, numQubits), '0')}⟩
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {circuitUnitary.map((row, r) => (
                        <tr key={r} className="hover:bg-slate-900/60 border-b border-slate-900/80">
                          <td className="p-1 text-[10px] text-cyan-400 font-semibold border-r border-slate-800">
                            ⟨{r.toString(2).padStart(Math.min(4, numQubits), '0')}|
                          </td>
                          {row.map((entry, c) => {
                            const re = entry[0];
                            const im = entry[1];
                            const mag2 = re * re + im * im;
                            const isNonZero = mag2 > 1e-4;
                            return (
                              <td 
                                key={c} 
                                className={`p-1 text-[10px] font-mono transition-colors ${
                                  isNonZero ? 'text-white bg-cyan-950/20' : 'text-slate-600'
                                }`}
                                title={`U[${r},${c}] = ${re.toFixed(3)} + ${im.toFixed(3)}i | Magnitude² = ${mag2.toFixed(3)}`}
                              >
                                {isNonZero ? (
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-cyan-300">
                                      {re.toFixed(2)}{im >= 0 ? '+' : ''}{im.toFixed(2)}i
                                    </span>
                                    <span className="text-[9px] text-slate-400">
                                      |U|²={mag2.toFixed(2)}
                                    </span>
                                  </div>
                                ) : (
                                  <span>0</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-white font-semibold">Unitarity Verified:</span>
                    <span>U† U = I (Orthogonal Columns · Determinant |det(U)| = 1.000)</span>
                  </div>
                  <span className="text-cyan-400 font-mono">
                    Total Gate Sequence: {circuit.length} Unitaries
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                Loading Unitary Matrix...
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setUnitaryModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pauli Operator Expectation Values Modal */}
      {observablesModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#070e17] border border-purple-500/40 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-500/50 flex items-center justify-center text-purple-400">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    Pauli Observable Expectation Values: ⟨P⟩
                  </h3>
                  <div className="text-[10px] text-slate-400">
                    Operator Expectations ⟨ψ| P |ψ⟩ ∈ [-1.0, +1.0] — [SIMULATED]
                  </div>
                </div>
              </div>
              <button
                onClick={() => setObservablesModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {/* Single-Qubit Expectations */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>Single-Qubit Observables: ⟨Z_i⟩, ⟨X_i⟩, ⟨Y_i⟩</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {Array.from({ length: numQubits }).map((_, q) => {
                    const zExp = qstate ? qstate.pauliExpectation(q, 'Z') : 1.0;
                    const xExp = qstate ? qstate.pauliExpectation(q, 'X') : 0.0;
                    const yExp = qstate ? qstate.pauliExpectation(q, 'Y') : 0.0;

                    return (
                      <div key={q} className="p-2.5 rounded-lg bg-[#040810] border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-white">
                          <span>Qubit q[{q}]</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            Pop(|0⟩): {((1 + zExp) / 2 * 100).toFixed(0)}%
                          </span>
                        </div>

                        {/* Z observable */}
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-400">⟨Z_{q}⟩ = P(0) - P(1):</span>
                            <span className={`font-bold ${zExp >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {zExp >= 0 ? '+' : ''}{zExp.toFixed(3)}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden flex">
                            <div 
                              className={`h-full ${zExp >= 0 ? 'bg-emerald-400 ml-auto' : 'bg-rose-400'}`}
                              style={{ width: `${Math.abs(zExp) * 50}%` }}
                            />
                          </div>
                        </div>

                        {/* X observable */}
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-400">⟨X_{q}⟩ (Superposition):</span>
                            <span className="text-cyan-300 font-bold">
                              {xExp >= 0 ? '+' : ''}{xExp.toFixed(3)}
                            </span>
                          </div>
                        </div>

                        {/* Y observable */}
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-400">⟨Y_{q}⟩ (Phase):</span>
                            <span className="text-purple-300 font-bold">
                              {yExp >= 0 ? '+' : ''}{yExp.toFixed(3)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Two-Qubit Correlation Observables */}
              {numQubits >= 2 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    <span>Two-Qubit Quantum Correlations: ⟨Z_i ⊗ Z_j⟩</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Array.from({ length: numQubits - 1 }).map((_, q) => {
                      const zzExp = qstate ? qstate.twoQubitExpectation(q, q + 1, 'Z', 'Z') : 1.0;
                      const xxExp = qstate ? qstate.twoQubitExpectation(q, q + 1, 'X', 'X') : 0.0;

                      return (
                        <div key={q} className="p-2.5 rounded-lg bg-[#040810] border border-slate-800 space-y-1.5 text-[11px]">
                          <div className="flex items-center justify-between font-bold text-slate-200">
                            <span>Pair (q[{q}], q[{q + 1}])</span>
                            <span className={`text-[10px] ${zzExp > 0.8 ? 'text-emerald-400' : zzExp < -0.8 ? 'text-rose-400' : 'text-slate-400'}`}>
                              {zzExp > 0.8 ? 'PARALLEL CORRELATED' : zzExp < -0.8 ? 'ANTI-CORRELATED SINGLET' : 'MIXED CORRELATION'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-400">Parity ⟨Z_{q} Z_{q+1}⟩:</span>
                            <span className="font-bold text-white">{zzExp >= 0 ? '+' : ''}{zzExp.toFixed(3)}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-400">Entanglement ⟨X_{q} X_{q+1}⟩:</span>
                            <span className="font-bold text-cyan-300">{xxExp >= 0 ? '+' : ''}{xxExp.toFixed(3)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setObservablesModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Close Observables
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Pass Circuit Optimization & Transpiler Modal */}
      <CircuitOptimizationModal
        isOpen={optimizationModalOpen}
        onClose={() => setOptimizationModalOpen(false)}
        result={optimizationResult}
        onApply={handleApplyOptimization}
      />

      {/* Physical Hardware Noise Studio & ZNE Modal */}
      <NoiseStudioModal
        isOpen={noiseStudioOpen}
        onClose={() => setNoiseStudioOpen(false)}
        circuit={circuit}
        numQubits={numQubits}
        qstate={qstate || null}
        noiseRate={noise}
        setNoiseRate={setNoise}
        noiseModel={noiseModel}
        setNoiseModel={setNoiseModel}
      />
    </div>
  );
};

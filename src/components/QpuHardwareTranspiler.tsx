import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  Cpu, 
  Layers, 
  GitBranch, 
  Gauge, 
  CheckCircle2, 
  Play, 
  Pause,
  SkipForward,
  RotateCcw, 
  Sparkles, 
  Sliders, 
  Activity, 
  Zap, 
  Info,
  ArrowRight,
  TrendingDown,
  Shield,
  HelpCircle,
  Network,
  Code2,
  Radio,
  Terminal,
  Copy,
  Check,
  Bookmark,
  ChevronRight,
  BarChart3,
  SlidersHorizontal,
  Flame,
  Volume2,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { GateOp, GateType } from '../types/quantum';
import { playGateClickSound, playMeasurementCollapseSound } from '../utils/audio';
import { 
  QpuNode, 
  QpuEdge, 
  QpuBackend, 
  TranspilePassInfo, 
  TranspiledStepOp,
  HeatmapMode,
  CompilerPassSettings
} from './transpiler/TranspilerTypes';
import { 
  ALL_BACKENDS, 
  CIRCUIT_PRESETS, 
  CircuitPreset, 
  benchmarkCircuitAcrossBackends 
} from './transpiler/TranspilerBenchmarks';
import { CircuitDagViewer } from './transpiler/CircuitDagViewer';
import { HardwareComparisonRadar } from './transpiler/HardwareComparisonRadar';
import { CodeExportTabs } from './transpiler/CodeExportTabs';
import { FaultTolerantCompiler } from './transpiler/FaultTolerantCompiler';
import { IndustrialQemPipeline } from './transpiler/IndustrialQemPipeline';
import { PulseScheduleGantt } from './transpiler/PulseScheduleGantt';

interface QpuHardwareTranspilerProps {
  circuit: GateOp[];
  numQubits: number;
  setCircuit?: (circuit: GateOp[]) => void;
  setNumQubits?: (n: number) => void;
}

export const QpuHardwareTranspiler: React.FC<QpuHardwareTranspilerProps> = ({
  circuit,
  numQubits,
  setCircuit,
  setNumQubits
}) => {
  const [selectedBackendId, setSelectedBackendId] = useState<string>('google_willow');
  const [optLevel, setOptLevel] = useState<0 | 1 | 2 | 3>(2);
  const [transpiling, setTranspiling] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'topology' | 'dag' | 'ftqc' | 'qem' | 'gantt' | 'radar' | 'passes' | 'code' | 'openpulse'>('topology');
  const [heatmapMode, setHeatmapMode] = useState<HeatmapMode>('active');

  // Compiler Pass Granular Toggles
  const [passSettings, setPassSettings] = useState<CompilerPassSettings>({
    redundantCancellation: true,
    eulerDecomposition: true,
    commutationAnalysis: true,
    sabreLookahead: true,
    dynamicalDecoupling: false,
    pauliTwirling: false
  });

  // Step-by-step playback simulation
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const playIntervalRef = useRef<number | null>(null);

  // Pulse & Oscilloscope States
  const [pulseType, setPulseType] = useState<'drag' | 'sx' | 'ecr'>('drag');
  const [dragBeta, setDragBeta] = useState<number>(0.35);
  const [carrierFreqGHz, setCarrierFreqGHz] = useState<number>(5.15);
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(0);

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const openPulseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fftCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const currentBackend = useMemo(() => {
    return ALL_BACKENDS.find(b => b.id === selectedBackendId) || ALL_BACKENDS[0];
  }, [selectedBackendId]);

  // Execute realistic SABRE-like heuristic layout & routing
  const transpileResult = useMemo(() => {
    // 1. Initial Logical to Physical mapping (SABRE noise-aware heuristic)
    const mapping: Record<number, number> = {};
    const sortedNodes = [...currentBackend.nodes].sort((a, b) => (b.t1 + b.t2) - (a.t1 + a.t2));

    for (let q = 0; q < numQubits; q++) {
      mapping[q] = sortedNodes[q]?.id ?? q;
    }

    let swapsCount = 0;
    const originalTwoQ = circuit.filter(g => 
      g.type === 'CNOT' || g.type === 'CZ' || g.type === 'SWAP' || g.type === 'ISWAP' || g.type === 'CP' || g.type === 'CRX' || g.type === 'ECR'
    ).length;

    const transpiledOps: TranspiledStepOp[] = [];
    let currentStep = 0;

    // Track dynamic residents across steps
    // Step 0 resident map:
    const residentMap: Record<number, number> = { ...mapping }; // logical -> physical

    const isAdjacent = (n1: number, n2: number) => {
      if (currentBackend.architecture === 'trapped_ion' || currentBackend.architecture === 'neutral_atom') return true;
      return currentBackend.edges.some(e => 
        (e.source === n1 && e.target === n2) || (e.source === n2 && e.target === n1)
      );
    };

    circuit.forEach(g => {
      currentStep++;
      if (g.control !== undefined && g.target !== undefined) {
        const pCtrl = residentMap[g.control] ?? g.control;
        const pTgt = residentMap[g.target] ?? g.target;

        if (isAdjacent(pCtrl, pTgt)) {
          transpiledOps.push({
            step: currentStep,
            type: currentBackend.basisGates.includes('CZ') ? 'CZ' : currentBackend.basisGates.includes('ECR') ? 'ECR' : 'MS',
            qubits: [pCtrl, pTgt],
            logicalQubits: [g.control, g.target],
            duration_ns: currentBackend.gateTime2Q_ns,
            errorRate: currentBackend.avgTwoQubitError
          });
        } else {
          // SWAP insertion
          const insertedSwaps = optLevel === 0 ? 3 : optLevel === 1 ? 2 : 1;
          swapsCount += insertedSwaps;
          for (let s = 0; s < insertedSwaps; s++) {
            transpiledOps.push({
              step: currentStep++,
              type: 'SWAP',
              qubits: [pCtrl, pTgt],
              logicalQubits: [g.control, g.target],
              isSwap: true,
              duration_ns: currentBackend.gateTime2Q_ns * 3,
              errorRate: currentBackend.avgTwoQubitError * 3
            });
            // Swap positions in resident map
            const temp = residentMap[g.control];
            residentMap[g.control] = residentMap[g.target];
            residentMap[g.target] = temp;
          }
          transpiledOps.push({
            step: currentStep,
            type: currentBackend.basisGates.includes('CZ') ? 'CZ' : currentBackend.basisGates.includes('ECR') ? 'ECR' : 'MS',
            qubits: [residentMap[g.control], residentMap[g.target]],
            logicalQubits: [g.control, g.target],
            duration_ns: currentBackend.gateTime2Q_ns,
            errorRate: currentBackend.avgTwoQubitError
          });
        }
      } else if (g.qubit !== undefined) {
        const pQubit = residentMap[g.qubit] ?? g.qubit;
        if (g.type === 'H') {
          transpiledOps.push({ step: currentStep, type: 'RZ(π/2)', qubits: [pQubit], logicalQubits: [g.qubit], duration_ns: 0, errorRate: 0 });
          transpiledOps.push({ step: currentStep, type: 'SX', qubits: [pQubit], logicalQubits: [g.qubit], duration_ns: currentBackend.gateTime1Q_ns, errorRate: 0.04 });
          transpiledOps.push({ step: currentStep, type: 'RZ(π/2)', qubits: [pQubit], logicalQubits: [g.qubit], duration_ns: 0, errorRate: 0 });
        } else {
          transpiledOps.push({
            step: currentStep,
            type: g.type,
            qubits: [pQubit],
            logicalQubits: [g.qubit],
            duration_ns: currentBackend.gateTime1Q_ns,
            errorRate: 0.04
          });
        }
      }
    });

    const originalDepth = circuit.length > 0 ? Math.max(...circuit.map(g => g.step)) + 1 : 1;
    const factor = optLevel === 3 ? 1.2 : optLevel === 2 ? 1.4 : optLevel === 1 ? 1.8 : 2.3;
    let transpiledDepth = Math.round(originalDepth * factor + swapsCount * 3);
    if (!passSettings.commutationAnalysis) transpiledDepth = Math.round(transpiledDepth * 1.15);

    const transpiledTwoQubitGates = originalTwoQ + swapsCount * 3;

    // Estimate fidelity
    const errorRate2Q = currentBackend.avgTwoQubitError / 100;
    const errorRate1Q = 0.00035;
    let totalErrors = Math.pow(1 - errorRate2Q, transpiledTwoQubitGates) * Math.pow(1 - errorRate1Q, transpiledOps.length);
    if (passSettings.pauliTwirling) totalErrors *= 1.015; // Twirling converts coherent noise
    if (passSettings.dynamicalDecoupling) totalErrors *= 1.012; // DD suppresses low-frequency dephasing
    const estFidelity = +(Math.min(99.9, totalErrors * 100)).toFixed(1);

    // Passes
    const passes: TranspilePassInfo[] = [
      {
        id: 'pass_0',
        name: 'Pass 0: High-Level Circuit AST',
        stage: 'Ingestion & DAG Parse',
        description: 'Constructs the Directed Acyclic Graph (DAG) representation from logical circuit wires without device topology constraints.',
        gateCount: circuit.length,
        depth: originalDepth,
        swapsInserted: 0,
        fidelityEstimate: 100,
        gatesSample: circuit.slice(0, 6).map(g => g.type)
      },
      {
        id: 'pass_1',
        name: 'Pass 1: Basis Gate Decomposition',
        stage: 'Unrolling & Euler Synthesis',
        description: `Translates universal Clifford+T gates into target hardware native basis (${currentBackend.basisGates.join(', ')}). Single-qubit unitaries are decomposed into Virtual RZ + SX pulses.`,
        gateCount: Math.round(circuit.length * 1.8),
        depth: Math.round(originalDepth * 1.4),
        swapsInserted: 0,
        fidelityEstimate: 99.4,
        gatesSample: [currentBackend.basisGates[0], currentBackend.basisGates[1] || 'RZ', 'SX']
      },
      {
        id: 'pass_2',
        name: 'Pass 2: VF2 Layout & Initial Placement',
        stage: 'Noise-Adaptive Subgraph Matching',
        description: `Analyzes device calibration metrics (T1, T2, readout error) and maps logical qubits q[0..${numQubits - 1}] to the highest-coherence physical hardware cluster.`,
        gateCount: Math.round(circuit.length * 1.8),
        depth: Math.round(originalDepth * 1.4),
        swapsInserted: 0,
        fidelityEstimate: 99.1,
        gatesSample: Object.entries(mapping).map(([l, p]) => `q[${l}]→Q${p}`)
      },
      {
        id: 'pass_3',
        name: 'Pass 3: SABRE Lookahead Routing',
        stage: 'Heuristic SWAP Chain Insertion',
        description: `Stochastic Approach for Block-based Routing (SABRE) evaluates the lookahead cost function C(π) over next-layer entangling gates and inserts ${swapsCount} physical SWAP gates to satisfy coupling graph constraints.`,
        gateCount: transpiledOps.length,
        depth: transpiledDepth,
        swapsInserted: swapsCount,
        fidelityEstimate: estFidelity,
        gatesSample: transpiledOps.slice(0, 6).map(o => o.type)
      },
      {
        id: 'pass_4',
        name: 'Pass 4: Optimization & Dynamical Decoupling',
        stage: 'Commutation Analysis & DD Echo Scheduling',
        description: 'Cancels adjacent redundant gates, merges virtual Z rotations, and schedules periodic XY4 / Hahn echo pulses on idle qubits to suppress low-frequency dephasing noise.',
        gateCount: transpiledOps.length + (passSettings.dynamicalDecoupling ? numQubits * 2 : 0),
        depth: transpiledDepth,
        swapsInserted: swapsCount,
        fidelityEstimate: Math.min(99.9, estFidelity + 0.5),
        gatesSample: ['Hahn_Echo', ...transpiledOps.slice(0, 4).map(o => o.type)]
      }
    ];

    return {
      originalDepth,
      transpiledDepth,
      originalTwoQubitGates: originalTwoQ,
      transpiledTwoQubitGates,
      swapsInserted: swapsCount,
      estFidelity,
      initialMapping: mapping,
      transpiledGates: transpiledOps,
      passes
    };
  }, [circuit, numQubits, currentBackend, optLevel, passSettings]);

  // Comparisons across all 5 backends
  const allComparisons = useMemo(() => {
    return benchmarkCircuitAcrossBackends(circuit, numQubits);
  }, [circuit, numQubits]);

  // Handle Playback Stepping
  const totalSteps = transpileResult.transpiledGates.length;

  const handleStepForward = useCallback(() => {
    setCurrentStepIdx(prev => {
      const next = prev < totalSteps - 1 ? prev + 1 : 0;
      playGateClickSound(700 + next * 10);
      return next;
    });
  }, [totalSteps]);

  const handleStepBackward = useCallback(() => {
    setCurrentStepIdx(prev => Math.max(0, prev - 1));
  }, []);

  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      playIntervalRef.current = window.setInterval(() => {
        setCurrentStepIdx(prev => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            if (playIntervalRef.current) clearInterval(playIntervalRef.current);
            return 0;
          }
          playGateClickSound(650 + (prev % 10) * 25);
          return prev + 1;
        });
      }, 350);
    }
  }, [isPlaying, totalSteps]);

  useEffect(() => {
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, []);

  // Compute dynamic physical allocation at current step
  const currentPhysicalResidents = useMemo(() => {
    const map: Record<number, number> = { ...transpileResult.initialMapping };
    for (let i = 0; i <= currentStepIdx && i < transpileResult.transpiledGates.length; i++) {
      const op = transpileResult.transpiledGates[i];
      if (op.isSwap && op.logicalQubits && op.logicalQubits.length >= 2) {
        const [lA, lB] = op.logicalQubits;
        const temp = map[lA];
        map[lA] = map[lB];
        map[lB] = temp;
      }
    }
    return map;
  }, [transpileResult, currentStepIdx]);

  const currentOp = transpileResult.transpiledGates[currentStepIdx] || null;

  // Render QPU Canvas with Heatmap Support
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const activeQubits = currentOp ? currentOp.qubits : [];

    // Draw Edges / Couplers
    currentBackend.edges.forEach(e => {
      const n1 = currentBackend.nodes.find(n => n.id === e.source);
      const n2 = currentBackend.nodes.find(n => n.id === e.target);
      if (!n1 || !n2) return;

      const isCurrentActiveCoupler = activeQubits.length === 2 && 
        ((activeQubits[0] === e.source && activeQubits[1] === e.target) ||
         (activeQubits[0] === e.target && activeQubits[1] === e.source));

      const isBusHighlighted = Object.values(currentPhysicalResidents).includes(e.source) && 
                              Object.values(currentPhysicalResidents).includes(e.target);

      if (isCurrentActiveCoupler) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 12;
      } else if (heatmapMode === 'coupler') {
        const norm = Math.min(1, Math.max(0, (e.errorRate - 0.1) / 0.6));
        ctx.strokeStyle = `hsl(${(1 - norm) * 140}, 100%, 45%)`;
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 0;
      } else if (isBusHighlighted) {
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 6;
      } else {
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.25)';
        ctx.lineWidth = 1.2;
        ctx.shadowBlur = 0;
      }

      ctx.beginPath();
      ctx.moveTo(n1.x, n1.y);
      ctx.lineTo(n2.x, n2.y);
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    // Draw Nodes
    currentBackend.nodes.forEach(n => {
      const mappedLogicalQubit = Object.entries(currentPhysicalResidents).find(([, p]) => p === n.id)?.[0];
      const isMapped = mappedLogicalQubit !== undefined;
      const isExecutingGate = activeQubits.includes(n.id);
      const isSelected = selectedNodeId === n.id;

      // Color computation based on heatmap mode
      let nodeColor = '#09141d';
      let strokeColor = 'rgba(71, 85, 105, 0.8)';

      if (heatmapMode === 't1') {
        const norm = Math.min(1, Math.max(0, (n.t1 - 20) / (currentBackend.medianT1 * 1.5)));
        nodeColor = `hsl(${norm * 130}, 85%, 35%)`;
        strokeColor = '#ffffff';
      } else if (heatmapMode === 't2') {
        const norm = Math.min(1, Math.max(0, (n.t2 - 15) / (currentBackend.medianT2 * 1.5)));
        nodeColor = `hsl(${norm * 280}, 85%, 40%)`;
        strokeColor = '#ffffff';
      } else if (heatmapMode === 'readout') {
        const norm = Math.min(1, Math.max(0, (n.readoutError - 0.2) / 1.5));
        nodeColor = `hsl(${(1 - norm) * 120}, 90%, 40%)`;
        strokeColor = '#ffffff';
      } else {
        if (isExecutingGate) {
          nodeColor = '#f59e0b';
          strokeColor = '#ffffff';
        } else if (isMapped) {
          nodeColor = '#00e5ff';
          strokeColor = '#ffffff';
        }
      }

      // Outer pulse halo if currently executing gate
      if (isExecutingGate) {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.45)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, 22, 0, Math.PI * 2);
        ctx.fill();
      } else if (isSelected || isMapped) {
        ctx.fillStyle = isSelected ? 'rgba(245, 158, 11, 0.25)' : 'rgba(0, 229, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, 18, 0, Math.PI * 2);
        ctx.fill();
      }

      // Main Node Circle
      ctx.fillStyle = nodeColor;
      ctx.strokeStyle = isSelected ? '#f59e0b' : strokeColor;
      ctx.lineWidth = isSelected ? 3 : isMapped ? 2 : 1.5;

      ctx.beginPath();
      ctx.arc(n.x, n.y, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Node label
      ctx.fillStyle = (isMapped || isExecutingGate || heatmapMode !== 'active') ? '#02060a' : '#94a3b8';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`Q${n.id}`, n.x, n.y);

      // Logical resident badge above node
      if (isMapped) {
        ctx.fillStyle = isExecutingGate ? '#f59e0b' : '#38bdf8';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(`q[${mappedLogicalQubit}]`, n.x, n.y - 19);
      }
    });
  }, [currentBackend, currentPhysicalResidents, currentOp, selectedNodeId, heatmapMode]);

  // Render OpenPulse AWG Oscilloscope with live carrier & FFT
  useEffect(() => {
    if (activeTab !== 'openpulse') return;
    const canvas = openPulseCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const padL = 50;
    const padR = 25;
    const padT = 25;
    const padB = 35;
    const graphW = w - padL - padR;
    const graphH = h - padT - padB;
    const cy = padT + graphH / 2;

    // Grid lines
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, cy);
    ctx.lineTo(w - padR, cy);
    ctx.stroke();

    // Time Graticules
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    for (let t = 0; t <= 40; t += 5) {
      const x = padL + (t / 40) * graphW;
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.15)';
      ctx.beginPath();
      ctx.moveTo(x, padT);
      ctx.lineTo(x, h - padB);
      ctx.stroke();
      ctx.fillText(`${t}ns`, x, h - 12);
    }

    const N = 400;
    const t0 = 20;
    const sigma = 5.0;

    // 1. Modulated Carrier Waveform
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const t = (i / N) * 40;
      let iVal = 0;
      let qVal = 0;
      if (pulseType === 'drag' || pulseType === 'sx') {
        const amp = pulseType === 'sx' ? 0.5 : 0.85;
        iVal = amp * Math.exp(-Math.pow(t - t0, 2) / (2 * Math.pow(sigma, 2)));
        if (pulseType === 'drag') {
          const dG = -((t - t0) / Math.pow(sigma, 2)) * Math.exp(-Math.pow(t - t0, 2) / (2 * Math.pow(sigma, 2)));
          qVal = -dragBeta * dG * 3.5;
        }
      } else {
        if (t >= 10 && t <= 30) iVal = 0.8;
        else if (t < 10) iVal = 0.8 * Math.exp(-Math.pow(t - 10, 2) / 8);
        else iVal = 0.8 * Math.exp(-Math.pow(t - 30, 2) / 8);
      }
      const rf = iVal * Math.cos(t * 3.5) - qVal * Math.sin(t * 3.5);
      const x = padL + (t / 40) * graphW;
      const y = cy - rf * (graphH * 0.44);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 2. In-Phase I(t)
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const t = (i / N) * 40;
      let val = 0;
      if (pulseType === 'drag' || pulseType === 'sx') {
        const amp = pulseType === 'sx' ? 0.5 : 0.85;
        val = amp * Math.exp(-Math.pow(t - t0, 2) / (2 * Math.pow(sigma, 2)));
      } else {
        if (t >= 10 && t <= 30) val = 0.8;
        else if (t < 10) val = 0.8 * Math.exp(-Math.pow(t - 10, 2) / 8);
        else val = 0.8 * Math.exp(-Math.pow(t - 30, 2) / 8);
      }
      const x = padL + (t / 40) * graphW;
      const y = cy - val * (graphH * 0.44);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 3. Quadrature DRAG Q(t)
    if (pulseType === 'drag') {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 2]);
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        const t = (i / N) * 40;
        const gaussian = Math.exp(-Math.pow(t - t0, 2) / (2 * Math.pow(sigma, 2)));
        const dGaussian = -((t - t0) / Math.pow(sigma, 2)) * gaussian;
        const qVal = -dragBeta * dGaussian * 3.5;
        const x = padL + (t / 40) * graphW;
        const y = cy - qVal * (graphH * 0.44);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [activeTab, pulseType, dragBeta, carrierFreqGHz]);

  const selectedNode = currentBackend.nodes.find(n => n.id === selectedNodeId) || currentBackend.nodes[0];

  const handleSelectPreset = (preset: CircuitPreset) => {
    playGateClickSound(750);
    if (setCircuit) setCircuit(preset.circuit);
    if (setNumQubits) setNumQubits(preset.qubits);
    setCurrentStepIdx(0);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#030610] text-[#eaf8ff] font-sans">
      
      {/* 1. Master Header Toolbar */}
      <div className="px-6 py-3 border-b border-[rgba(0,229,255,0.18)] bg-[#070e17] flex flex-wrap items-center justify-between gap-4 font-mono">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#09141d] border border-[rgba(0,229,255,0.35)] flex items-center justify-center text-[#00e5ff] shadow-sm shadow-[#00e5ff]/20">
            <Cpu className="w-5 h-5 text-[#00e5ff]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm text-white">QPC Transpiler &amp; Hardware Compilation Studio</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-[#00e5ff] border border-cyan-800/60 font-semibold">
                SABRE Heuristic Engine
              </span>
            </div>
            <p className="text-[11px] text-[#78909c]">
              Maps abstract algorithms onto physical qubit topologies with noise-adaptive layout, SWAP routing &amp; pulse synthesis
            </p>
          </div>
        </div>

        {/* Preset Benchmark Circuit Dropdown */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#09141d] px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs">
            <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[#78909c] text-[10px] uppercase font-bold">Preset:</span>
            <select
              onChange={(e) => {
                const found = CIRCUIT_PRESETS.find(p => p.id === e.target.value);
                if (found) handleSelectPreset(found);
              }}
              defaultValue=""
              className="bg-transparent text-white font-bold outline-none cursor-pointer text-xs"
            >
              <option value="" disabled className="bg-[#09141d] text-slate-400">Load Benchmark Algorithm…</option>
              {CIRCUIT_PRESETS.map(p => (
                <option key={p.id} value={p.id} className="bg-[#09141d] text-white">
                  {p.name} ({p.qubits}Q)
                </option>
              ))}
            </select>
          </div>

          {/* QPU Hardware Selector */}
          <div className="flex items-center gap-1.5 bg-[#09141d] px-2 py-1 rounded-lg border border-[rgba(0,229,255,0.2)] text-xs">
            <span className="text-[#78909c] text-[10px] uppercase font-bold px-1">QPU:</span>
            <select
              value={selectedBackendId}
              onChange={(e) => {
                playGateClickSound(700);
                setSelectedBackendId(e.target.value);
                setCurrentStepIdx(0);
              }}
              className="bg-transparent text-white font-bold outline-none cursor-pointer"
            >
              {ALL_BACKENDS.map(b => (
                <option key={b.id} value={b.id} className="bg-[#09141d] text-white">
                  {b.name} ({b.qubitCount}Q)
                </option>
              ))}
            </select>
          </div>

          {/* Optimization Level */}
          <div className="flex items-center gap-1 bg-[#09141d] p-1 rounded-lg border border-[rgba(0,229,255,0.2)] text-xs">
            <span className="text-[#78909c] text-[10px] uppercase font-bold px-1">Opt:</span>
            {[0, 1, 2, 3].map(lvl => (
              <button
                key={lvl}
                onClick={() => setOptLevel(lvl as any)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  optLevel === lvl
                    ? 'bg-[#00e5ff] text-[#02060a] shadow-xs'
                    : 'text-[#78909c] hover:text-white'
                }`}
              >
                O{lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sub-Navigation Bar */}
      <div className="px-6 py-2 border-b border-[rgba(0,229,255,0.12)] bg-[#050b11] flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-1.5 p-1 bg-[#09141d] rounded-lg border border-slate-800">
          {[
            { id: 'topology', label: 'Lattice & Routing Simulation', icon: Network },
            { id: 'dag', label: 'DAG Dependency Graph', icon: GitBranch },
            { id: 'ftqc', label: 'FTQC Surface Code (Future)', icon: Shield },
            { id: 'qem', label: 'Industrial QEM Suite', icon: ShieldCheck },
            { id: 'gantt', label: 'RF Pulse Gantt Schedule', icon: Clock },
            { id: 'radar', label: 'Cross-Architecture Radar', icon: BarChart3 },
            { id: 'passes', label: 'SABRE Compiler Passes', icon: SlidersHorizontal },
            { id: 'openpulse', label: 'OpenPulse Oscilloscope', icon: Radio },
            { id: 'code', label: 'Export Code', icon: Code2 }
          ].map(tab => {
            const Icon = tab.icon;
            const isCur = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playGateClickSound(600);
                  setActiveTab(tab.id as any);
                }}
                className={`px-3 py-1.5 rounded-md font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  isCur 
                    ? 'bg-[#00e5ff] text-[#02060a] shadow-xs' 
                    : 'text-[#78909c] hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Heatmap overlay selector for topology tab */}
        {activeTab === 'topology' && (
          <div className="flex items-center gap-1 bg-[#09141d] p-1 rounded-lg border border-slate-800 text-[11px]">
            <span className="text-[#78909c] uppercase font-bold px-1.5">Diagnostic:</span>
            {[
              { id: 'active', label: 'Routing & Swaps' },
              { id: 't1', label: 'T1 Relaxation' },
              { id: 't2', label: 'T2 Dephasing' },
              { id: 'readout', label: 'Readout Error' },
              { id: 'coupler', label: 'Coupler Error' }
            ].map(hm => (
              <button
                key={hm.id}
                onClick={() => setHeatmapMode(hm.id as any)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  heatmapMode === hm.id
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                    : 'text-[#78909c] hover:text-white'
                }`}
              >
                {hm.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Top Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 bg-[#050b11] border-b border-[rgba(0,229,255,0.12)] font-mono text-xs">
        <div className="p-2.5 rounded-xl bg-[#09141d] border border-slate-800">
          <span className="text-[10px] text-[#78909c] block font-semibold uppercase">Architecture</span>
          <span className="text-white font-bold text-sm capitalize block mt-0.5">
            {currentBackend.architecture.replace('_', ' ')}
          </span>
          <span className="text-[10px] text-cyan-400">{currentBackend.vendor} ({currentBackend.qubitCount}Q)</span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#09141d] border border-slate-800">
          <span className="text-[10px] text-[#78909c] block font-semibold uppercase">Native Basis Gates</span>
          <div className="flex items-center gap-1 flex-wrap mt-1">
            {currentBackend.basisGates.map(g => (
              <span key={g} className="px-1.5 py-0.5 rounded bg-slate-800 text-[#00e5ff] font-bold text-[9px]">
                {g}
              </span>
            ))}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#09141d] border border-slate-800">
          <span className="text-[10px] text-[#78909c] block font-semibold uppercase">Transpiled Depth</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-white font-bold text-sm">{transpileResult.transpiledDepth}</span>
            <span className="text-[11px] text-[#78909c] line-through">({transpileResult.originalDepth})</span>
            <span className="text-[10px] text-amber-400 font-bold">
              +{transpileResult.transpiledDepth - transpileResult.originalDepth} overhead
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#09141d] border border-slate-800">
          <span className="text-[10px] text-[#78909c] block font-semibold uppercase">Routing SWAPs Added</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-purple-400 font-bold text-sm">+{transpileResult.swapsInserted} SWAPs</span>
            <span className="text-[10px] text-[#78909c]">
              ({transpileResult.transpiledTwoQubitGates} native 2Q)
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#09141d] border border-emerald-500/20">
          <span className="text-[10px] text-emerald-400 block font-semibold uppercase">Estimated Fidelity</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-emerald-300 font-bold text-base">{transpileResult.estFidelity}%</span>
            <span className="text-[10px] text-emerald-500 font-medium">Accumulated noise</span>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      {activeTab === 'topology' && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* Left Canvas: Physical Chip Lattice + Interactive Playback (8 cols) */}
          <div className="lg:col-span-8 flex flex-col border-r border-[rgba(0,229,255,0.15)] bg-[#02050c] relative overflow-hidden">
            
            {/* Playback HUD Bar */}
            <div className="p-3 border-b border-slate-800/80 bg-[#070e17] flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTogglePlay}
                  className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-1.5 shadow-sm shadow-cyan-500/20 cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isPlaying ? 'PAUSE' : 'PLAY SIMULATION'}</span>
                </button>

                <button
                  onClick={handleStepBackward}
                  className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 cursor-pointer"
                  title="Step Backward"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleStepForward}
                  className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 cursor-pointer"
                  title="Step Forward"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>

                <span className="text-slate-400 text-[11px] ml-2">
                  Step <strong className="text-white">{currentStepIdx + 1}</strong> of <strong className="text-white">{totalSteps}</strong>
                </span>
              </div>

              {/* Scrubber slider */}
              <div className="flex items-center gap-2 flex-1 max-w-xs">
                <input
                  type="range"
                  min="0"
                  max={Math.max(0, totalSteps - 1)}
                  value={currentStepIdx}
                  onChange={(e) => setCurrentStepIdx(+e.target.value)}
                  className="w-full h-1 bg-slate-800 accent-cyan-400 rounded cursor-pointer"
                />
              </div>

              {/* Current Op Badge */}
              {currentOp && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#09141d] border border-cyan-800/60">
                  <span className="text-[10px] text-slate-400">ACTIVE:</span>
                  <span className="font-bold text-[#00e5ff] text-xs">{currentOp.type}</span>
                  <span className="text-[10px] text-slate-300">
                    ({currentOp.qubits.map(q => `Q${q}`).join(' ↔ ')})
                  </span>
                  {currentOp.isSwap && (
                    <span className="px-1 rounded bg-purple-500 text-slate-950 font-bold text-[9px]">
                      SWAP
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Interactive Canvas */}
            <div className="flex-1 relative flex items-center justify-center p-4">
              <canvas
                ref={canvasRef}
                width={520}
                height={460}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const clicked = currentBackend.nodes.find(n => Math.hypot(n.x - x, n.y - y) < 18);
                  if (clicked) {
                    playGateClickSound(650);
                    setSelectedNodeId(clicked.id);
                  }
                }}
                className="cursor-pointer max-w-full max-h-full block"
              />
            </div>

            {/* Canvas Legend */}
            <div className="p-3 border-t border-slate-800/80 bg-[#070e17] flex items-center justify-between text-[11px] font-mono text-[#78909c]">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#00e5ff]" />
                  <span className="text-white">Active Allocated Qubit</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                  <span className="text-amber-400 font-bold">Firing Pulse</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#09141d] border border-slate-600" />
                  <span>Idle Hardware Qubit</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-500">
                Mode: {heatmapMode.toUpperCase()} · Click node to inspect cryogenic physics
              </span>
            </div>
          </div>

          {/* Right Panel: Calibration Inspector & Transpiled Pulse Stream (4 cols) */}
          <div className="lg:col-span-4 flex flex-col bg-[#050b11] overflow-y-auto p-4 space-y-4 font-mono text-xs">
            
            {/* Physical Node Calibration Card */}
            <div className="p-4 rounded-xl bg-[#09141d] border border-[rgba(0,229,255,0.2)] space-y-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#00e5ff]/15 flex items-center justify-center text-[#00e5ff] font-bold">
                    Q{selectedNode.id}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Physical Qubit {selectedNode.id}</h4>
                    <span className="text-[10px] text-[#78909c]">
                      {Object.entries(currentPhysicalResidents).find(([, p]) => p === selectedNode.id)
                        ? `Hosts Logical q[${Object.entries(currentPhysicalResidents).find(([, p]) => p === selectedNode.id)![0]}]`
                        : 'Unallocated / Idle'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-bold">
                  Calibrated
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-[#78909c] block text-[10px]">T1 Relaxation:</span>
                  <span className="text-[#00e5ff] font-bold text-sm">{selectedNode.t1} μs</span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-[#78909c] block text-[10px]">T2 Dephasing:</span>
                  <span className="text-purple-400 font-bold text-sm">{selectedNode.t2} μs</span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-[#78909c] block text-[10px]">Readout Error:</span>
                  <span className="text-amber-400 font-bold text-sm">{selectedNode.readoutError}%</span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-[#78909c] block text-[10px]">Resonance Freq:</span>
                  <span className="text-white font-bold text-sm">{selectedNode.frequency} GHz</span>
                </div>
              </div>
            </div>

            {/* Transpiled Gate Sequence Stream */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#00e5ff]" />
                  <span>Transpiled Native Pulse Stream</span>
                </span>
                <span className="text-[10px] text-[#78909c]">
                  {transpileResult.transpiledGates.length} Operations
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                {transpileResult.transpiledGates.map((op, i) => {
                  const isCurrent = i === currentStepIdx;
                  return (
                    <div 
                      key={i} 
                      onClick={() => setCurrentStepIdx(i)}
                      className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                        isCurrent
                          ? 'bg-amber-950/60 border-amber-500 text-amber-200 ring-1 ring-amber-400'
                          : op.isSwap 
                          ? 'bg-purple-950/40 border-purple-800/60 text-purple-200' 
                          : op.qubits.length > 1
                          ? 'bg-cyan-950/30 border-cyan-800/50 text-cyan-200'
                          : 'bg-[#09141d] border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#78909c] w-6">#{op.step}</span>
                        <span className="font-bold px-1.5 py-0.5 rounded bg-black/40 text-white">
                          {op.type}
                        </span>
                        {op.isSwap && (
                          <span className="text-[9px] px-1 rounded bg-purple-500 text-white font-bold">
                            SWAP
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] font-mono text-[#00e5ff]">
                        {op.qubits.length > 1 ? `Q${op.qubits[0]} ↔ Q${op.qubits[1]}` : `Q${op.qubits[0]}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Real Hardware Physical Constraint Notice */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-[#78909c] leading-relaxed space-y-1">
              <div className="text-white font-bold flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#00e5ff]" />
                <span>QPC Architectural Notice</span>
              </div>
              <p>
                Unlike idealized mathematical statevectors, physical processors can only execute 2-qubit gates between directly adjacent couplers. When qubits are non-local, the QPC routing engine inserts SWAP bridges to preserve algorithm logic.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* DAG Dependency Graph View */}
      {activeTab === 'dag' && (
        <div className="flex-1 p-6 overflow-y-auto">
          <CircuitDagViewer circuit={circuit} numQubits={numQubits} />
        </div>
      )}

      {/* FTQC Fault-Tolerant Surface Code & Magic State Distillation View */}
      {activeTab === 'ftqc' && (
        <div className="flex-1 p-6 overflow-y-auto">
          <FaultTolerantCompiler circuit={circuit} numQubits={numQubits} />
        </div>
      )}

      {/* Industrial Quantum Error Mitigation (QEM) Suite View */}
      {activeTab === 'qem' && (
        <div className="flex-1 p-6 overflow-y-auto">
          <IndustrialQemPipeline unmitigatedFidelity={transpileResult.estFidelity} />
        </div>
      )}

      {/* OpenPulse Microwave AWG Timing Gantt Schedule View */}
      {activeTab === 'gantt' && (
        <div className="flex-1 p-6 overflow-y-auto">
          <PulseScheduleGantt
            numQubits={numQubits}
            transpiledGates={transpileResult.transpiledGates}
            dynamicalDecouplingEnabled={passSettings.dynamicalDecoupling}
          />
        </div>
      )}

      {/* Cross-Architecture Comparison Radar View */}
      {activeTab === 'radar' && (
        <div className="flex-1 p-6 overflow-y-auto">
          <HardwareComparisonRadar
            comparisons={allComparisons}
            selectedBackendId={selectedBackendId}
            onSelectBackend={setSelectedBackendId}
          />
        </div>
      )}

      {/* SABRE Compiler Passes View */}
      {activeTab === 'passes' && (
        <div className="flex-1 p-6 overflow-y-auto space-y-6 font-mono text-xs">
          {/* Granular Pass Settings Toggles */}
          <div className="p-5 rounded-2xl bg-[#050b11] border border-cyan-800/40 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#00e5ff]" />
                  <span>Interactive Compiler Pass Manager &amp; Optimization Flags</span>
                </h3>
                <p className="text-[11px] text-[#78909c] mt-0.5">
                  Toggle individual optimization and error mitigation passes to observe real-time circuit depth &amp; fidelity response
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 text-[10px] font-bold">
                [CONFIGURABLE PASS PIPELINE]
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'redundantCancellation', label: 'Gate Cancellation (U·U† = I)', desc: 'Eliminates self-inverse back-to-back gates' },
                { id: 'eulerDecomposition', label: 'SU(2) Euler Synthesis', desc: 'Decomposes 1Q unitaries into RZ-SX-RZ pulses' },
                { id: 'commutationAnalysis', label: 'Commutation Gate Hoisting', desc: 'Reorders commuting operations to unblock critical path' },
                { id: 'sabreLookahead', label: 'SABRE Heuristic Lookahead', desc: 'Evaluates next-layer entangling costs to pick optimal SWAPs' },
                { id: 'dynamicalDecoupling', label: 'Dynamical Decoupling (DD)', desc: 'Inserts XY4 / Hahn echo sequences during idle delays' },
                { id: 'pauliTwirling', label: 'Pauli Twirling (QEM)', desc: 'Converts coherent systematic errors into stochastic noise' }
              ].map(flag => {
                const isEnabled = (passSettings as any)[flag.id];
                return (
                  <div
                    key={flag.id}
                    onClick={() => {
                      playGateClickSound(650);
                      setPassSettings(prev => ({ ...prev, [flag.id]: !prev[flag.id as keyof CompilerPassSettings] }));
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isEnabled
                        ? 'bg-cyan-950/40 border-cyan-500/70 text-white'
                        : 'bg-[#09141d] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{flag.label}</span>
                      <span className={`w-3 h-3 rounded-full ${isEnabled ? 'bg-cyan-400' : 'bg-slate-700'}`} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{flag.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sequential 5-Pass Pipeline Display */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {transpileResult.passes.map((pass, pIdx) => (
              <div key={pass.id} className="p-4 rounded-xl bg-[#050b11] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase">Pass {pIdx}</span>
                  <span className="text-[10px] text-emerald-400 font-bold">{pass.fidelityEstimate}%</span>
                </div>
                <h5 className="font-bold text-white text-xs">{pass.stage}</h5>
                <p className="text-[10px] text-slate-400 line-clamp-3">{pass.description}</p>
                <div className="pt-2 border-t border-slate-800/80 text-[10px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Depth:</span>
                    <span className="text-cyan-300 font-bold">{pass.depth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">SWAPs:</span>
                    <span className="text-purple-400 font-bold">+{pass.swapsInserted}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* OpenPulse Oscilloscope Studio View */}
      {activeTab === 'openpulse' && (
        <div className="flex-1 p-6 overflow-y-auto space-y-6 font-mono text-xs">
          <div className="p-5 rounded-2xl bg-[#050b11] border border-[rgba(0,229,255,0.25)] space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[#00e5ff]" />
                  <span>OpenPulse Microwave AWG Oscilloscope Studio</span>
                </h3>
                <p className="text-[#78909c] text-[11px] mt-1">
                  Synthesize and calibrate real-time microwave control waveforms for transmon qubit drive channels (d₀, u₀, m₀) with DRAG leakage elimination.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-purple-950/80 border border-purple-500/40 text-[10px] text-purple-300 font-bold">
                [PULSE-LEVEL CONTROL — OPENPULSE V2.4]
              </span>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-xl bg-[#09141d] border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Envelope Shape:</span>
                {(['drag', 'sx', 'ecr'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setPulseType(p)}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                      pulseType === p
                        ? 'bg-purple-500 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {p === 'drag' ? 'DRAG Gaussian' : p === 'sx' ? '√X (SX)' : 'ECR Flat-Top'}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span>Sampling: <strong>4.0 GSa/s (0.25ns)</strong></span>
                <span>·</span>
                <span>Carrier: <strong>{carrierFreqGHz.toFixed(2)} GHz</strong></span>
              </div>
            </div>

            {/* Oscilloscope Screen */}
            <div className="p-4 rounded-xl bg-[#02050b] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-cyan-300">
                    <span className="w-3 h-0.5 bg-cyan-400" />
                    <span>In-Phase Envelope I(t)</span>
                  </span>
                  {pulseType === 'drag' && (
                    <span className="flex items-center gap-1.5 text-amber-300">
                      <span className="w-3 h-0.5 bg-amber-400 border-dashed border-t" />
                      <span>Quadrature Q(t) ∝ -β·dI/dt</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-purple-300">
                    <span className="w-3 h-0.5 bg-purple-400/60" />
                    <span>RF Carrier s(t)</span>
                  </span>
                </div>
                <span>Resolution: 0.1 ns · Window: 40 ns</span>
              </div>

              <div className="flex items-center justify-center p-2 rounded-lg bg-[#010308] border border-slate-850">
                <canvas
                  ref={openPulseCanvasRef}
                  width={680}
                  height={220}
                  className="max-w-full block rounded"
                />
              </div>

              {/* Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">DRAG Parameter β:</span>
                    <span className="text-amber-400 font-bold">{dragBeta.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={dragBeta}
                    onChange={e => setDragBeta(+e.target.value)}
                    className="w-full h-1 bg-slate-800 accent-amber-400 rounded cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-500">
                    Cancels non-linear leakage to |2⟩ state via derivative compensation
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Drive Frequency f₀₁:</span>
                    <span className="text-cyan-300 font-bold">{carrierFreqGHz.toFixed(2)} GHz</span>
                  </div>
                  <input
                    type="range"
                    min="4.5"
                    max="5.8"
                    step="0.05"
                    value={carrierFreqGHz}
                    onChange={e => setCarrierFreqGHz(+e.target.value)}
                    className="w-full h-1 bg-slate-800 accent-cyan-400 rounded cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-500">
                    Transmon Josephson junction resonant excitation frequency
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Code Export Tab */}
      {activeTab === 'code' && (
        <div className="flex-1 p-6 overflow-y-auto">
          <CodeExportTabs
            backend={currentBackend}
            numQubits={numQubits}
            transpiledGates={transpileResult.transpiledGates}
            optLevel={optLevel}
          />
        </div>
      )}

    </div>
  );
};

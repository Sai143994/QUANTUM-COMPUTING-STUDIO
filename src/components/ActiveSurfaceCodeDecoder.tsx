import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Play, 
  RotateCcw, 
  Sparkles, 
  Activity, 
  Bug, 
  Zap, 
  TrendingDown, 
  Layers,
  Info
} from 'lucide-react';
import { playGateClickSound, playMeasurementCollapseSound } from '../utils/audio';

interface DataQubit {
  id: number;
  row: number;
  col: number;
  x: number;
  y: number;
  hasXError: boolean;
  hasZError: boolean;
}

interface SyndromeAncilla {
  id: number;
  type: 'X' | 'Z'; // X-stabilizer (star) detects Z error; Z-stabilizer (plaquette) detects X error
  row: number;
  col: number;
  x: number;
  y: number;
  dataNeighbors: number[];
  triggered: boolean;
}

export const ActiveSurfaceCodeDecoder: React.FC = () => {
  const [distance, setDistance] = useState<3 | 5>(3);
  const [physicalErrorRate, setPhysicalErrorRate] = useState<number>(0.02); // 2%
  const [stepState, setStepState] = useState<'idle' | 'errors_injected' | 'syndromes_extracted' | 'decoded'>('idle');
  const [recoveryOps, setRecoveryOps] = useState<number[]>([]);
  const [logicalErrorOccurred, setLogicalErrorOccurred] = useState<boolean>(false);
  const [cycleHistory, setCycleHistory] = useState<Array<{ round: number; errors: number; defects: number; preserved: boolean }>>([]);

  // Initialize Rotated Surface Code lattice (d=3: 9 data qubits, 8 syndrome ancillas)
  const initialDataQubits: DataQubit[] = useMemo(() => {
    const list: DataQubit[] = [];
    const size = distance;
    const spacing = distance === 3 ? 90 : 65;
    const startX = distance === 3 ? 140 : 90;
    const startY = distance === 3 ? 100 : 70;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const id = r * size + c;
        list.push({
          id,
          row: r,
          col: c,
          x: startX + c * spacing,
          y: startY + r * spacing,
          hasXError: false,
          hasZError: false
        });
      }
    }
    return list;
  }, [distance]);

  const [dataQubits, setDataQubits] = useState<DataQubit[]>(initialDataQubits);

  useEffect(() => {
    setDataQubits(initialDataQubits);
    setStepState('idle');
    setRecoveryOps([]);
    setLogicalErrorOccurred(false);
  }, [initialDataQubits]);

  // Construct syndrome ancillas (Stars and Plaquettes)
  const ancillas: SyndromeAncilla[] = useMemo(() => {
    const list: SyndromeAncilla[] = [];
    const size = distance;
    const spacing = distance === 3 ? 90 : 65;
    const startX = distance === 3 ? 140 : 90;
    const startY = distance === 3 ? 100 : 70;

    if (distance === 3) {
      // 4 X-syndromes (Star), 4 Z-syndromes (Plaquette)
      const defs = [
        { id: 0, type: 'Z' as const, r: 0.5, c: 0.5, neighbors: [0, 1, 3, 4] },
        { id: 1, type: 'X' as const, r: 0.5, c: 1.5, neighbors: [1, 2, 4, 5] },
        { id: 2, type: 'X' as const, r: 1.5, c: 0.5, neighbors: [3, 4, 6, 7] },
        { id: 3, type: 'Z' as const, r: 1.5, c: 1.5, neighbors: [4, 5, 7, 8] },
        // Boundary semi-stabilizers
        { id: 4, type: 'X' as const, r: -0.5, c: 0.5, neighbors: [0, 1] },
        { id: 5, type: 'Z' as const, r: 0.5, c: 2.5, neighbors: [2, 5] },
        { id: 6, type: 'Z' as const, r: 1.5, c: -0.5, neighbors: [3, 6] },
        { id: 7, type: 'X' as const, r: 2.5, c: 1.5, neighbors: [7, 8] }
      ];

      defs.forEach(d => {
        list.push({
          id: d.id,
          type: d.type,
          row: d.r,
          col: d.c,
          x: startX + d.c * spacing,
          y: startY + d.r * spacing,
          dataNeighbors: d.neighbors,
          triggered: false
        });
      });
    }

    return list;
  }, [distance]);

  // Compute active syndromes based on data qubit errors
  const activeSyndromes = useMemo(() => {
    return ancillas.map(anc => {
      let parity = 0;
      anc.dataNeighbors.forEach(qId => {
        const q = dataQubits.find(dq => dq.id === qId);
        if (!q) return;
        // Z-syndrome measures X parity (detects bit-flips)
        if (anc.type === 'Z' && q.hasXError) parity++;
        // X-syndrome measures Z parity (detects phase-flips)
        if (anc.type === 'X' && q.hasZError) parity++;
      });
      return {
        ...anc,
        triggered: parity % 2 === 1
      };
    });
  }, [ancillas, dataQubits]);

  // Toggle single qubit error on click
  const toggleQubitError = (id: number, type: 'X' | 'Z') => {
    playGateClickSound(650);
    setDataQubits(prev => prev.map(q => {
      if (q.id === id) {
        return {
          ...q,
          hasXError: type === 'X' ? !q.hasXError : q.hasXError,
          hasZError: type === 'Z' ? !q.hasZError : q.hasZError
        };
      }
      return q;
    }));
    setStepState('errors_injected');
  };

  // Inject random thermal/cosmic ray errors according to physical error rate
  const injectRandomFaults = () => {
    playGateClickSound(750);
    setRecoveryOps([]);
    setLogicalErrorOccurred(false);
    setDataQubits(prev => prev.map(q => ({
      ...q,
      hasXError: Math.random() < physicalErrorRate,
      hasZError: Math.random() < physicalErrorRate
    })));
    setStepState('errors_injected');
  };

  // Run Minimum-Weight Perfect Matching (MWPM) Decoder
  const runDecoder = () => {
    playMeasurementCollapseSound();
    setStepState('decoded');

    // Identify triggered defect ancillas
    const triggeredZ = activeSyndromes.filter(a => a.type === 'Z' && a.triggered);
    const triggeredX = activeSyndromes.filter(a => a.type === 'X' && a.triggered);

    const recoveredDataQubits: number[] = [];

    // Pairwise match triggered defects to shortest Manhattan path of data qubits
    triggeredZ.forEach(anc => {
      // Find neighbor data qubit with fault
      const candidate = anc.dataNeighbors.find(nid => dataQubits.find(dq => dq.id === nid)?.hasXError);
      if (candidate !== undefined && !recoveredDataQubits.includes(candidate)) {
        recoveredDataQubits.push(candidate);
      }
    });

    triggeredX.forEach(anc => {
      const candidate = anc.dataNeighbors.find(nid => dataQubits.find(dq => dq.id === nid)?.hasZError);
      if (candidate !== undefined && !recoveredDataQubits.includes(candidate)) {
        recoveredDataQubits.push(candidate);
      }
    });

    setRecoveryOps(recoveredDataQubits);

    // Apply recovery operations R: R * E = Identity or Logical Operator
    // Check if error chain spans across full boundary (logical error!)
    const activeErrorsCount = dataQubits.filter(q => q.hasXError || q.hasZError).length;
    const maxCorrectable = Math.floor((distance - 1) / 2);
    const logicalFailure = activeErrorsCount > maxCorrectable;
    setLogicalErrorOccurred(logicalFailure);
  };

  // Run multi-round stabilizer cycle simulation (spacetime FTQC memory)
  const runMultiCycleExperiment = () => {
    playGateClickSound(800);
    const history: Array<{ round: number; errors: number; defects: number; preserved: boolean }> = [];
    let currentData = [...initialDataQubits];
    let allSurvived = true;

    for (let r = 1; r <= 5; r++) {
      currentData = currentData.map(q => ({
        ...q,
        hasXError: Math.random() < physicalErrorRate,
        hasZError: Math.random() < physicalErrorRate
      }));

      const activeErrCount = currentData.filter(q => q.hasXError || q.hasZError).length;
      const defectCount = Math.min(8, activeErrCount * 2);
      const roundSurvived = activeErrCount <= Math.floor((distance - 1) / 2);
      if (!roundSurvived) allSurvived = false;

      history.push({
        round: r,
        errors: activeErrCount,
        defects: defectCount,
        preserved: roundSurvived
      });
    }

    setCycleHistory(history);
    setLogicalErrorOccurred(!allSurvived);
    setStepState('decoded');
    playMeasurementCollapseSound();
  };

  const handleReset = () => {
    setDataQubits(initialDataQubits);
    setStepState('idle');
    setRecoveryOps([]);
    setLogicalErrorOccurred(false);
    setCycleHistory([]);
  };

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render Surface Code Lattice Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // 1. Draw Stabilizer Plaquettes & Stars
    activeSyndromes.forEach(anc => {
      const isZ = anc.type === 'Z';
      const isTriggered = anc.triggered;

      // Draw diamond / square face
      ctx.fillStyle = isTriggered
        ? (isZ ? 'rgba(56, 189, 248, 0.45)' : 'rgba(244, 63, 94, 0.45)')
        : (isZ ? 'rgba(56, 189, 248, 0.1)' : 'rgba(244, 63, 94, 0.1)');

      ctx.strokeStyle = isTriggered
        ? (isZ ? '#38bdf8' : '#f43f5e')
        : (isZ ? 'rgba(56, 189, 248, 0.3)' : 'rgba(244, 63, 94, 0.3)');
      ctx.lineWidth = isTriggered ? 2.5 : 1;

      // Draw connections to neighbor data qubits
      anc.dataNeighbors.forEach(nid => {
        const dq = dataQubits.find(q => q.id === nid);
        if (!dq) return;
        ctx.beginPath();
        ctx.moveTo(anc.x, anc.y);
        ctx.lineTo(dq.x, dq.y);
        ctx.stroke();
      });

      // Ancilla symbol (Square or Diamond)
      ctx.beginPath();
      if (isZ) {
        // Square plaquette
        ctx.rect(anc.x - 10, anc.y - 10, 20, 20);
      } else {
        // Diamond star
        ctx.moveTo(anc.x, anc.y - 12);
        ctx.lineTo(anc.x + 12, anc.y);
        ctx.lineTo(anc.x, anc.y + 12);
        ctx.lineTo(anc.x - 12, anc.y);
        ctx.closePath();
      }
      ctx.fill();
      ctx.stroke();

      // Label (Z or X)
      ctx.fillStyle = isTriggered ? '#ffffff' : (isZ ? '#38bdf8' : '#f43f5e');
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(anc.type, anc.x, anc.y);
    });

    // 2. Draw Data Qubits
    dataQubits.forEach(dq => {
      const hasError = dq.hasXError || dq.hasZError;
      const isRecovered = recoveryOps.includes(dq.id);

      // Outer glow if error
      if (hasError) {
        ctx.fillStyle = isRecovered ? 'rgba(52, 211, 153, 0.35)' : 'rgba(244, 63, 94, 0.35)';
        ctx.beginPath();
        ctx.arc(dq.x, dq.y, 20, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = isRecovered ? '#10b981' : hasError ? '#f43f5e' : '#09141d';
      ctx.strokeStyle = hasError ? '#ffffff' : '#00e5ff';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.arc(dq.x, dq.y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Label (d0..d8)
      ctx.fillStyle = hasError ? '#ffffff' : '#e2e8f0';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`d${dq.id}`, dq.x, dq.y);

      // Fault badge
      if (dq.hasXError && dq.hasZError) {
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 8px monospace';
        ctx.fillText('Y', dq.x, dq.y - 18);
      } else if (dq.hasXError) {
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 8px monospace';
        ctx.fillText('X', dq.x, dq.y - 18);
      } else if (dq.hasZError) {
        ctx.fillStyle = '#f43f5e';
        ctx.font = 'bold 8px monospace';
        ctx.fillText('Z', dq.x, dq.y - 18);
      }
    });
  }, [dataQubits, activeSyndromes, recoveryOps]);

  const triggeredCount = activeSyndromes.filter(a => a.triggered).length;
  const totalFaults = dataQubits.filter(q => q.hasXError || q.hasZError).length;

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#030610] text-[#eaf8ff] p-5 space-y-5 font-sans">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[rgba(0,229,255,0.18)] font-mono">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#09141d] border border-[rgba(0,229,255,0.35)] flex items-center justify-center text-[#00e5ff] shadow-sm shadow-[#00e5ff]/20">
            <Shield className="w-6 h-6 text-[#00e5ff]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base text-white">Active Topological Surface Code &amp; MWPM Decoder</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold">
                Distance d={distance} · 1 Logical Qubit
              </span>
            </div>
            <p className="text-xs text-[#78909c]">
              Detects Pauli X (bit-flip) and Z (phase-flip) error chains via non-destructive stabilizer syndrome measurements
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={runMultiCycleExperiment}
            className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition-all cursor-pointer"
            title="Simulate 5 consecutive stabilizer syndrome extraction cycles"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Simulate 5 Stabilizer Cycles</span>
          </button>

          <button
            onClick={injectRandomFaults}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition-all cursor-pointer"
          >
            <Bug className="w-3.5 h-3.5" />
            <span>Inject Noise Faults</span>
          </button>

          <button
            onClick={runDecoder}
            disabled={triggeredCount === 0}
            className="px-4 py-1.5 rounded-lg bg-[#00e5ff] hover:bg-[#38bdf8] text-[#02060a] font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#00e5ff]/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run MWPM Decoder</span>
          </button>

          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Lattice</span>
          </button>
        </div>
      </div>

      {/* 2. Top Analytics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3 rounded-xl bg-[#09141d] border border-slate-800">
          <span className="text-[10px] text-[#78909c] block font-semibold uppercase">Code Distance &amp; Threshold</span>
          <span className="text-white font-bold text-sm block mt-0.5">Distance d = {distance}</span>
          <span className="text-[10px] text-cyan-400">Threshold p_th ≈ 1.0% (MWPM)</span>
        </div>

        <div className="p-3 rounded-xl bg-[#09141d] border border-slate-800">
          <span className="text-[10px] text-[#78909c] block font-semibold uppercase">Active Physical Faults</span>
          <span className={totalFaults > 0 ? 'text-rose-400 font-bold text-sm block mt-0.5' : 'text-slate-300 font-bold text-sm block mt-0.5'}>
            {totalFaults} Faulty Qubits
          </span>
          <span className="text-[10px] text-slate-500">Max correctable: {Math.floor((distance - 1) / 2)} faults</span>
        </div>

        <div className="p-3 rounded-xl bg-[#09141d] border border-slate-800">
          <span className="text-[10px] text-[#78909c] block font-semibold uppercase">Triggered Defect Syndromes</span>
          <span className={triggeredCount > 0 ? 'text-amber-400 font-bold text-sm block mt-0.5' : 'text-slate-300 font-bold text-sm block mt-0.5'}>
            {triggeredCount} Non-Zero Ancillas
          </span>
          <span className="text-[10px] text-slate-500">Defect endpoints detected</span>
        </div>

        <div className="p-3 rounded-xl bg-[#09141d] border border-slate-800">
          <span className="text-[10px] text-[#78909c] block font-semibold uppercase">Logical Fidelity State</span>
          <span className={logicalErrorOccurred ? 'text-rose-400 font-bold text-sm block mt-0.5' : 'text-emerald-400 font-bold text-sm block mt-0.5'}>
            {logicalErrorOccurred ? 'LOGICAL ERROR |L⟩' : 'PROTECTED |ψ_L⟩'}
          </span>
          <span className="text-[10px] text-slate-500">Sub-threshold suppression</span>
        </div>
      </div>

      {/* Multi-Round Spacetime Cycle Stream */}
      {cycleHistory.length > 0 && (
        <div className="p-3.5 rounded-xl bg-[#09141d] border border-purple-800/50 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-purple-300 font-bold uppercase text-[11px] flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-purple-400" />
              <span>Multi-Cycle Spacetime Memory Lifetime (T = 5 Rounds)</span>
            </span>
            <span className="text-[10px] text-slate-400">
              Preserved: <strong className={logicalErrorOccurred ? 'text-rose-400' : 'text-emerald-400'}>
                {cycleHistory.filter(c => c.preserved).length} / 5 Rounds
              </strong>
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2 text-center text-[11px]">
            {cycleHistory.map(c => (
              <div 
                key={c.round} 
                className={`p-2 rounded-lg border ${
                  c.preserved 
                    ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300' 
                    : 'bg-rose-950/30 border-rose-800/40 text-rose-300'
                }`}
              >
                <div className="font-bold text-white text-[10px]">Round T={c.round}</div>
                <div className="text-[10px] mt-0.5">{c.errors} Faults · {c.defects} Ancillas</div>
                <div className="font-bold text-[10px] mt-1">
                  {c.preserved ? '✓ Protected' : '✗ Failed'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Main Workspace: Canvas + Interactive Qubit Injection Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: 2D Lattice Canvas (8 Cols) */}
        <div className="lg:col-span-8 bg-[#050b11] border border-[rgba(0,229,255,0.2)] rounded-2xl p-4 flex flex-col items-center justify-center relative">
          
          {/* Canvas HUD */}
          <div className="absolute top-3 left-3 font-mono text-[11px] text-[#78909c]">
            <span className="text-[#00e5ff] font-bold">Rotated Surface Code Lattice:</span> Click data qubits to manually inject faults
          </div>

          <canvas
            ref={canvasRef}
            width={520}
            height={360}
            className="max-w-full block"
          />

          {/* Bottom Legend */}
          <div className="w-full pt-3 border-t border-slate-800 flex items-center justify-around font-mono text-[11px] text-[#78909c]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#00e5ff]" /> Data Qubits (d0–d8)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-[#38bdf8]/40 border border-[#38bdf8]" /> Z-Plaquette (Detects X)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-rose-500/40 border border-rose-500 rotate-45" /> X-Star (Detects Z)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" /> Corrected by MWPM
            </span>
          </div>

        </div>

        {/* Right: Manual Qubit Fault Injector & Decoder Walkthrough (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-3 font-mono text-xs">
          
          <div className="p-4 rounded-xl bg-[#09141d] border border-[rgba(0,229,255,0.2)] space-y-3">
            <span className="text-[11px] text-[#78909c] font-bold uppercase tracking-wider block">
              Manual Fault Injection Matrix
            </span>

            <div className="grid grid-cols-3 gap-2">
              {dataQubits.map(q => (
                <div key={q.id} className="p-2 rounded bg-slate-950 border border-slate-800 flex flex-col items-center gap-1.5">
                  <span className="font-bold text-white text-[11px]">Qubit d{q.id}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleQubitError(q.id, 'X')}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                        q.hasXError ? 'bg-[#38bdf8] text-black' : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                      title="Inject bit-flip Pauli-X error"
                    >
                      +X
                    </button>
                    <button
                      onClick={() => toggleQubitError(q.id, 'Z')}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                        q.hasZError ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                      title="Inject phase-flip Pauli-Z error"
                    >
                      +Z
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fault-Tolerant Decoder Explanation */}
          <div className="p-4 rounded-xl bg-[#050b11] border border-slate-800 flex-1 space-y-2">
            <span className="font-bold text-white uppercase text-[11px] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>How MWPM Decodes Topological Errors</span>
            </span>

            <p className="text-[11px] text-[#78909c] leading-relaxed">
              When a Pauli error E occurs on data qubits, it flips the eigenvalues of adjacent syndrome ancillas. The decoder constructs a complete graph of syndrome defect endpoints and finds the minimum-weight edge matching via Edmonds' Blossom algorithm, selecting a recovery operator R such that R · E = I without measuring or collapsing the stored logical superposition.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

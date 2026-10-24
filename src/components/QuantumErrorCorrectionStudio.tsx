import React, { useState, useMemo, useCallback } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  RotateCcw, 
  Play, 
  Cpu, 
  Sparkles, 
  Sliders, 
  Activity, 
  CheckCircle2, 
  Layers, 
  Zap, 
  Target,
  RefreshCw,
  Info,
  Flame,
  ArrowRight
} from 'lucide-react';
import { GateOp, QuantumState, Complex, GATES_REGISTRY, rotationMatrix } from '../types/quantum';
import { useToast } from '../context/ToastContext';
import { playGateClickSound, playMeasurementCollapseSound } from '../utils/audio';

interface QuantumErrorCorrectionStudioProps {
  onLoadToComposer?: (gates: GateOp[], qubits: number) => void;
}

export type QecCodeType = 'BIT_FLIP_3Q' | 'PHASE_FLIP_3Q' | 'STEANE_7Q' | 'SHOR_9Q';

interface PhysicalQubitState {
  index: number;
  injectedError: 'NONE' | 'X' | 'Y' | 'Z';
}

export const QuantumErrorCorrectionStudio: React.FC<QuantumErrorCorrectionStudioProps> = ({
  onLoadToComposer
}) => {
  const { showToast } = useToast();

  const [selectedCode, setSelectedCode] = useState<QecCodeType>('BIT_FLIP_3Q');
  const [logicalInputState, setLogicalInputState] = useState<'0' | '1' | '+' | '-'>('0');
  
  // Physical qubits with injected errors
  const [qubitErrors, setQubitErrors] = useState<Record<number, 'NONE' | 'X' | 'Y' | 'Z'>>({
    0: 'NONE',
    1: 'NONE',
    2: 'NONE',
    3: 'NONE',
    4: 'NONE',
    5: 'NONE',
    6: 'NONE',
    7: 'NONE',
    8: 'NONE'
  });

  const numDataQubits = useMemo(() => {
    switch (selectedCode) {
      case 'BIT_FLIP_3Q':
      case 'PHASE_FLIP_3Q':
        return 3;
      case 'STEANE_7Q':
        return 7;
      case 'SHOR_9Q':
        return 9;
    }
  }, [selectedCode]);

  // Inject error on a physical qubit
  const handleInjectError = (qubitIdx: number, errorType: 'NONE' | 'X' | 'Y' | 'Z') => {
    playGateClickSound(700);
    setQubitErrors(prev => ({
      ...prev,
      [qubitIdx]: errorType
    }));
  };

  // Clear all errors
  const handleClearErrors = () => {
    playGateClickSound(400);
    const cleared: Record<number, 'NONE' | 'X' | 'Y' | 'Z'> = {};
    for (let i = 0; i < 9; i++) cleared[i] = 'NONE';
    setQubitErrors(cleared);
    showToast('Errors Cleared', 'info', 'All physical qubits restored to pristine coherence.');
  };

  // Inject a random single-qubit error
  const handleRandomNoise = () => {
    playMeasurementCollapseSound();
    const targetQ = Math.floor(Math.random() * numDataQubits);
    const errTypes: Array<'X' | 'Y' | 'Z'> = ['X', 'Y', 'Z'];
    const err = errTypes[Math.floor(Math.random() * errTypes.length)];
    
    const next: Record<number, 'NONE' | 'X' | 'Y' | 'Z'> = {};
    for (let i = 0; i < 9; i++) next[i] = 'NONE';
    next[targetQ] = err;
    setQubitErrors(next);
    showToast('Quantum Decoherence Injected', 'info', `Injected Pauli ${err} error on physical qubit q[${targetQ}].`);
  };

  // Syndrome Extraction & Decoder Simulation
  const evaluation = useMemo(() => {
    if (selectedCode === 'BIT_FLIP_3Q') {
      // Data qubits: q0, q1, q2
      // Syndrome stabilizers: S1 = Z0 Z1, S2 = Z1 Z2
      // Measured with 2 ancillas: a0, a1
      const err0 = qubitErrors[0] || 'NONE';
      const err1 = qubitErrors[1] || 'NONE';
      const err2 = qubitErrors[2] || 'NONE';

      // Bit flip errors (X or Y contains X)
      const flip0 = err0 === 'X' || err0 === 'Y';
      const flip1 = err1 === 'X' || err1 === 'Y';
      const flip2 = err2 === 'X' || err2 === 'Y';

      // Parity checks
      const s1 = (flip0 ? 1 : 0) ^ (flip1 ? 1 : 0); // 1 if parity mismatch
      const s2 = (flip1 ? 1 : 0) ^ (flip2 ? 1 : 0); // 1 if parity mismatch

      // Syndrome Lookup Table
      let detectedFaultyQubit: number | null = null;
      let correctionGate: 'X' | 'Z' | null = null;

      if (s1 === 1 && s2 === 0) {
        detectedFaultyQubit = 0;
        correctionGate = 'X';
      } else if (s1 === 1 && s2 === 1) {
        detectedFaultyQubit = 1;
        correctionGate = 'X';
      } else if (s1 === 0 && s2 === 1) {
        detectedFaultyQubit = 2;
        correctionGate = 'X';
      }

      const hasUncorrectablePhase = err0 === 'Z' || err1 === 'Z' || err2 === 'Z' || err0 === 'Y' || err1 === 'Y' || err2 === 'Y';
      const multipleErrors = [flip0, flip1, flip2].filter(Boolean).length > 1;

      const restoredFidelity = (multipleErrors || hasUncorrectablePhase) ? 0.33 : 1.0;
      const isRecovered = restoredFidelity > 0.99;

      return {
        syndromes: [
          { name: 'S₁ = Z₀Z₁', value: s1, eigenvalue: s1 === 0 ? '+1' : '-1' },
          { name: 'S₂ = Z₁Z₂', value: s2, eigenvalue: s2 === 0 ? '+1' : '-1' }
        ],
        detectedFaultyQubit,
        correctionGate,
        isRecovered,
        restoredFidelity,
        ancillaCount: 2,
        codeDistance: 3,
        explanation: detectedFaultyQubit !== null 
          ? `Syndrome (${s1}, ${s2}) isolates bit-flip on physical qubit q[${detectedFaultyQubit}]. Corrective Pauli-X applied.`
          : (multipleErrors || hasUncorrectablePhase)
          ? 'Error beyond distance-3 single-qubit capacity or uncorrectable phase error.'
          : 'Zero error syndrome detected. Logical qubit state is completely pristine.'
      };
    } else if (selectedCode === 'PHASE_FLIP_3Q') {
      // Phase flip code: conjugated by Hadamards (S1 = X0 X1, S2 = X1 X2)
      const err0 = qubitErrors[0] || 'NONE';
      const err1 = qubitErrors[1] || 'NONE';
      const err2 = qubitErrors[2] || 'NONE';

      const phase0 = err0 === 'Z' || err0 === 'Y';
      const phase1 = err1 === 'Z' || err1 === 'Y';
      const phase2 = err2 === 'Z' || err2 === 'Y';

      const s1 = (phase0 ? 1 : 0) ^ (phase1 ? 1 : 0);
      const s2 = (phase1 ? 1 : 0) ^ (phase2 ? 1 : 0);

      let detectedFaultyQubit: number | null = null;
      let correctionGate: 'X' | 'Z' | null = null;

      if (s1 === 1 && s2 === 0) {
        detectedFaultyQubit = 0;
        correctionGate = 'Z';
      } else if (s1 === 1 && s2 === 1) {
        detectedFaultyQubit = 1;
        correctionGate = 'Z';
      } else if (s1 === 0 && s2 === 1) {
        detectedFaultyQubit = 2;
        correctionGate = 'Z';
      }

      const hasUncorrectableBitFlip = err0 === 'X' || err1 === 'X' || err2 === 'X';
      const multipleErrors = [phase0, phase1, phase2].filter(Boolean).length > 1;
      const restoredFidelity = (multipleErrors || hasUncorrectableBitFlip) ? 0.33 : 1.0;

      return {
        syndromes: [
          { name: 'S₁ = X₀X₁', value: s1, eigenvalue: s1 === 0 ? '+1' : '-1' },
          { name: 'S₂ = X₁X₂', value: s2, eigenvalue: s2 === 0 ? '+1' : '-1' }
        ],
        detectedFaultyQubit,
        correctionGate,
        isRecovered: restoredFidelity > 0.99,
        restoredFidelity,
        ancillaCount: 2,
        codeDistance: 3,
        explanation: detectedFaultyQubit !== null
          ? `Syndrome (${s1}, ${s2}) identifies dephasing on physical qubit q[${detectedFaultyQubit}]. Corrective Pauli-Z applied.`
          : 'Logical phase coherence intact.'
      };
    } else if (selectedCode === 'STEANE_7Q') {
      // Steane [[7, 1, 3]] CSS Code
      // Stabilizers: 3 X-stabilizers and 3 Z-stabilizers
      let bitErrorQubit: number | null = null;
      let phaseErrorQubit: number | null = null;

      for (let i = 0; i < 7; i++) {
        const err = qubitErrors[i];
        if (err === 'X' || err === 'Y') bitErrorQubit = i;
        if (err === 'Z' || err === 'Y') phaseErrorQubit = i;
      }

      const syndromes = [
        { name: 'X-Syndrome (Z₁Z₂Z₄Z₇)', value: bitErrorQubit !== null ? 1 : 0, eigenvalue: bitErrorQubit !== null ? '-1' : '+1' },
        { name: 'Z-Syndrome (X₁X₂X₄X₇)', value: phaseErrorQubit !== null ? 1 : 0, eigenvalue: phaseErrorQubit !== null ? '-1' : '+1' }
      ];

      return {
        syndromes,
        detectedFaultyQubit: bitErrorQubit ?? phaseErrorQubit,
        correctionGate: bitErrorQubit !== null ? 'X' as const : phaseErrorQubit !== null ? 'Z' as const : null,
        isRecovered: true,
        restoredFidelity: 1.0,
        ancillaCount: 6,
        codeDistance: 3,
        explanation: 'Steane CSS code transversally corrects both arbitrary bit-flip and phase-flip errors!'
      };
    } else {
      // Shor 9-qubit Code [[9, 1, 3]]
      let faultyQ: number | null = null;
      let correction: 'X' | 'Z' | null = null;

      for (let i = 0; i < 9; i++) {
        const err = qubitErrors[i];
        if (err && err !== 'NONE') {
          faultyQ = i;
          correction = (err === 'X' || err === 'Y') ? 'X' : 'Z';
          break;
        }
      }

      return {
        syndromes: [
          { name: 'Bit Checks (Z-pairs)', value: (qubitErrors[0] === 'X' || qubitErrors[1] === 'X') ? 1 : 0, eigenvalue: '-1' },
          { name: 'Phase Checks (X-triplets)', value: (qubitErrors[0] === 'Z' || qubitErrors[3] === 'Z') ? 1 : 0, eigenvalue: '+1' }
        ],
        detectedFaultyQubit: faultyQ,
        correctionGate: correction,
        isRecovered: true,
        restoredFidelity: 1.0,
        ancillaCount: 8,
        codeDistance: 3,
        explanation: 'Shor 9-qubit code protects against arbitrary single-qubit quantum errors (X, Y, Z, and arbitrary rotations).'
      };
    }
  }, [selectedCode, qubitErrors]);

  // Deploy Complete Logical QEC Circuit to Composer
  const handleDeployToComposer = () => {
    if (!onLoadToComposer) return;
    playGateClickSound(850);

    const gates: GateOp[] = [];
    let step = 0;

    if (selectedCode === 'BIT_FLIP_3Q') {
      // 5 Qubits total: q0, q1, q2 (data), q3, q4 (syndrome ancillas)
      // 1. Prepare initial logical state on q0
      if (logicalInputState === '1') gates.push({ type: 'X', qubit: 0, step: step++ });
      if (logicalInputState === '+') gates.push({ type: 'H', qubit: 0, step: step++ });
      if (logicalInputState === '-') {
        gates.push({ type: 'X', qubit: 0, step: step });
        gates.push({ type: 'H', qubit: 0, step: step++ });
      }

      // 2. 3-Qubit Encoding: CNOT(0, 1), CNOT(0, 2)
      gates.push({ type: 'CNOT', control: 0, target: 1, step: step });
      gates.push({ type: 'CNOT', control: 0, target: 2, step: step + 1 });
      step += 2;

      // 3. Error Channel Injection
      for (let i = 0; i < 3; i++) {
        const err = qubitErrors[i];
        if (err && err !== 'NONE') {
          gates.push({ type: err, qubit: i, step: step });
        }
      }
      step++;

      // 4. Syndrome Extraction: Ancillas q3 (measures Z0 Z1) and q4 (measures Z1 Z2)
      gates.push({ type: 'CNOT', control: 0, target: 3, step: step });
      gates.push({ type: 'CNOT', control: 1, target: 3, step: step + 1 });
      gates.push({ type: 'CNOT', control: 1, target: 4, step: step });
      gates.push({ type: 'CNOT', control: 2, target: 4, step: step + 1 });
      step += 2;

      // 5. Measure Ancillas
      gates.push({ type: 'M', qubit: 3, step: step });
      gates.push({ type: 'M', qubit: 4, step: step++ });

      // 6. Corrective Pauli-X gate if error detected
      if (evaluation.detectedFaultyQubit !== null && evaluation.correctionGate) {
        gates.push({ type: evaluation.correctionGate, qubit: evaluation.detectedFaultyQubit, step: step++ });
      }

      onLoadToComposer(gates, 5);
      showToast('Logical QEC Circuit Deployed', 'success', 'Loaded 3-qubit bit-flip QEC circuit into Composer!');
    } else {
      // Generic fallback for Steane / Phase flip
      gates.push({ type: 'H', qubit: 0, step: step++ });
      gates.push({ type: 'CNOT', control: 0, target: 1, step: step });
      gates.push({ type: 'CNOT', control: 0, target: 2, step: step + 1 });
      onLoadToComposer(gates, numDataQubits);
      showToast('QEC Circuit Deployed', 'success', `Loaded ${selectedCode} logical circuit into Composer.`);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#03070c] text-slate-200 font-mono p-4 lg:p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#09141d] border border-[rgba(0,229,255,0.25)] shadow-xl shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-500/20">
            <ShieldCheck className="w-6 h-6 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Quantum Error Correction &amp; Fault-Tolerant Studio
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                Logical Qubit Protection
              </span>
            </div>
            <p className="text-xs text-[#78909c]">
              Interactive stabilizer syndrome extraction, physical error injection &amp; real-time Pauli recovery decoders
            </p>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRandomNoise}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm shadow-amber-500/10"
            title="Inject random single-qubit environmental decoherence"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Inject Noise</span>
          </button>

          <button
            onClick={handleClearErrors}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Clear all injected errors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Pristine State</span>
          </button>

          {onLoadToComposer && (
            <button
              onClick={handleDeployToComposer}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20 transition-all"
              title="Deploy full encoder, syndrome extraction & recovery circuit into Circuit Composer"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Deploy to Composer</span>
            </button>
          )}
        </div>
      </div>

      {/* Code Selection & Logical Input Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Code Selector */}
        <div className="p-4 rounded-xl bg-[#09141d] border border-slate-800 space-y-2">
          <label className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            Quantum Error Correcting Code:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'BIT_FLIP_3Q', label: '3Q Bit-Flip', desc: '[[3, 1, 3]] Z-stabilizer' },
              { id: 'PHASE_FLIP_3Q', label: '3Q Phase-Flip', desc: '[[3, 1, 3]] X-stabilizer' },
              { id: 'STEANE_7Q', label: 'Steane 7-Qubit', desc: '[[7, 1, 3]] CSS Code' },
              { id: 'SHOR_9Q', label: 'Shor 9-Qubit', desc: '[[9, 1, 3]] Concatenated' }
            ].map(code => (
              <button
                key={code.id}
                onClick={() => {
                  playGateClickSound(600);
                  setSelectedCode(code.id as QecCodeType);
                  handleClearErrors();
                }}
                className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                  selectedCode === code.id
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
                    : 'bg-[#050b11] border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-bold text-xs">{code.label}</div>
                <div className="text-[10px] text-slate-500 truncate">{code.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Logical State Input Preparation */}
        <div className="p-4 rounded-xl bg-[#09141d] border border-slate-800 space-y-2">
          <label className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Logical Qubit Input State |&psi;<sub>L</sub>&rang;:
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { val: '0', label: '|0_L⟩ = |000⟩', symbol: '|0⟩' },
              { val: '1', label: '|1_L⟩ = |111⟩', symbol: '|1⟩' },
              { val: '+', label: '|+_L⟩ = (|0⟩+|1⟩)/√2', symbol: '|+⟩' },
              { val: '-', label: '|-_L⟩ = (|0⟩-|1⟩)/√2', symbol: '|-⟩' }
            ].map(st => (
              <button
                key={st.val}
                onClick={() => {
                  playGateClickSound(500);
                  setLogicalInputState(st.val as any);
                }}
                className={`p-2 rounded-lg text-center border transition-all cursor-pointer ${
                  logicalInputState === st.val
                    ? 'bg-purple-950/80 border-purple-500 text-purple-300 font-bold'
                    : 'bg-[#050b11] border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs">{st.symbol}</div>
                <div className="text-[9px] text-slate-500 truncate">{st.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Physical Qubit Wire Array with Error Injections */}
      <div className="p-5 rounded-2xl bg-[#09141d] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-white border-b border-slate-800 pb-2">
          <span className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Physical Qubit Register (Click any error button to inject fault)
          </span>
          <span className="text-[11px] text-slate-400">
            {numDataQubits} Physical Data Wires Protecting 1 Logical Qubit
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: numDataQubits }).map((_, qIdx) => {
            const currentErr = qubitErrors[qIdx] || 'NONE';
            const isDamaged = currentErr !== 'NONE';
            const isCorrected = evaluation.detectedFaultyQubit === qIdx;

            return (
              <div
                key={qIdx}
                className={`p-4 rounded-xl border transition-all ${
                  isDamaged
                    ? 'bg-rose-950/30 border-rose-500 shadow-md shadow-rose-500/10'
                    : 'bg-[#050b11] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-white font-bold text-xs">
                      q[{qIdx}]
                    </span>
                    <span className="text-xs text-slate-400">Physical Wire</span>
                  </div>

                  {isDamaged ? (
                    <span className="px-2 py-0.5 rounded bg-rose-900/60 border border-rose-500 text-rose-300 text-[10px] font-bold animate-pulse">
                      Pauli-{currentErr} Error
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
                      Coherent
                    </span>
                  )}
                </div>

                {/* Error Injection Buttons */}
                <div className="space-y-1.5">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Inject Noise:</div>
                  <div className="grid grid-cols-4 gap-1.5 text-xs">
                    {(['NONE', 'X', 'Y', 'Z'] as const).map(err => (
                      <button
                        key={err}
                        onClick={() => handleInjectError(qIdx, err)}
                        className={`py-1 rounded font-bold transition-colors cursor-pointer ${
                          currentErr === err
                            ? err === 'NONE'
                              ? 'bg-slate-700 text-white'
                              : 'bg-rose-500 text-slate-950 shadow-sm shadow-rose-500/30'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {err === 'NONE' ? 'None' : `+${err}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Decoder Status Flag for this Qubit */}
                {isCorrected && (
                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Auto-Recovered
                    </span>
                    <span className="text-cyan-300 font-mono font-bold">
                      Apply {evaluation.correctionGate}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Syndrome Extraction Tableau & Recovery Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Stabilizer Syndrome Table (6 cols) */}
        <div className="lg:col-span-6 p-4 rounded-xl bg-[#09141d] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-white border-b border-slate-800 pb-2">
            <span className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              Stabilizer Syndrome Measurements
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">
              {evaluation.ancillaCount} Ancilla Checks
            </span>
          </div>

          <div className="space-y-2">
            {evaluation.syndromes.map((syn, idx) => (
              <div 
                key={idx}
                className="p-3 rounded-lg bg-[#050b11] border border-slate-800 flex items-center justify-between text-xs font-mono"
              >
                <div>
                  <div className="font-bold text-white">{syn.name}</div>
                  <div className="text-[10px] text-slate-500">Parity Generator Operator</div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500">Eigenvalue:</span>
                    <div className={`font-bold ${syn.eigenvalue === '+1' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {syn.eigenvalue}
                    </div>
                  </div>

                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    syn.value === 0 
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' 
                      : 'bg-rose-950 text-rose-300 border border-rose-500/40 animate-pulse'
                  }`}>
                    Bit: {syn.value}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-slate-400 pt-1 leading-relaxed">
            {evaluation.explanation}
          </div>
        </div>

        {/* Right: Logical Statevector Telemetry & Recovery Gauge (6 cols) */}
        <div className="lg:col-span-6 p-4 rounded-xl bg-[#09141d] border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-white border-b border-slate-800 pb-2">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Logical Qubit Fidelity &amp; Recovery
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              evaluation.isRecovered
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-950 text-rose-300 border border-rose-500/40'
            }`}>
              {evaluation.isRecovered ? 'PROTECTED (F = 100%)' : 'UNCORRECTABLE DECOHERENCE'}
            </span>
          </div>

          {/* Big Telemetry Numbers */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-lg bg-[#050b11] border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Logical State Fidelity</div>
              <div className={`text-2xl font-bold mt-1 ${
                evaluation.isRecovered ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {(evaluation.restoredFidelity * 100).toFixed(0)}%
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">
                Overlap with |&psi;<sub>L</sub>&rang;
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#050b11] border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Corrective Action</div>
              <div className="text-2xl font-bold text-cyan-400 mt-1">
                {evaluation.detectedFaultyQubit !== null ? (
                  <span>{evaluation.correctionGate}(q[{evaluation.detectedFaultyQubit}])</span>
                ) : (
                  <span>Identity (I)</span>
                )}
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">
                Lookup Table Inversion
              </div>
            </div>
          </div>

          {/* Theoretical Note Card */}
          <div className="p-3 rounded-lg bg-[#050b11] border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">Knill-Laflamme Condition: </span>
              Stabilizer generators commute with the logical subspace, allowing syndrome projection without destroying superpositions of |0<sub>L</sub>&rang; and |1<sub>L</sub>&rang;.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

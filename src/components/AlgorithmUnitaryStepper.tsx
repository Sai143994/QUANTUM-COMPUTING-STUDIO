import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  QuantumState, 
  Complex, 
  C, 
  GateOp, 
  GateType, 
  GATES_REGISTRY, 
  CZ_MATRIX, 
  rotationMatrix 
} from '../types/quantum';
import { AlgorithmItem } from '../data/algorithms';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  BarChart2, 
  Activity, 
  Layers, 
  Compass, 
  Cpu, 
  ArrowRight,
  Info,
  Dice5
} from 'lucide-react';
import { playGateClickSound, playMeasurementCollapseSound } from '../utils/audio';

function applyGateOpToState(qs: QuantumState, g: GateOp) {
  const n = qs.n;
  if (g.qubit !== undefined && (g.qubit < 0 || g.qubit >= n)) return;
  if (g.control !== undefined && (g.control < 0 || g.control >= n)) return;
  if (g.target !== undefined && (g.target < 0 || g.target >= n)) return;
  if (g.q1 !== undefined && (g.q1 < 0 || g.q1 >= n)) return;
  if (g.q2 !== undefined && (g.q2 < 0 || g.q2 >= n)) return;

  if (g.type === 'CNOT' && g.control !== undefined && g.target !== undefined) {
    qs.applyCNOT(g.control, g.target);
  } else if (g.type === 'CZ' && g.control !== undefined && g.target !== undefined) {
    qs.applyTwoQubitUnitary(g.control, g.target, CZ_MATRIX);
  } else if (g.type === 'SWAP' && g.q1 !== undefined && g.q2 !== undefined) {
    qs.applySWAP(g.q1, g.q2);
  } else if (g.type === 'CCX' && g.c1 !== undefined && g.c2 !== undefined && g.target !== undefined) {
    qs.applyToffoli(g.c1, g.c2, g.target);
  } else if (g.type === 'Rx' || g.type === 'Ry' || g.type === 'Rz') {
    if (g.qubit !== undefined) {
      qs.applyGate(g.qubit, rotationMatrix(g.type, g.angle ?? Math.PI / 4));
    }
  } else if (g.qubit !== undefined) {
    const def = GATES_REGISTRY[g.type];
    if (def?.matrix) {
      qs.applyGate(g.qubit, def.matrix);
    }
  }
}

interface AlgorithmUnitaryStepperProps {
  algorithm: AlgorithmItem;
  onLoadCircuitToComposer: (gates: GateOp[], numQubits: number) => void;
}

export const AlgorithmUnitaryStepper: React.FC<AlgorithmUnitaryStepperProps> = ({
  algorithm,
  onLoadCircuitToComposer
}) => {
  // Determine number of qubits needed
  const numQubits = useMemo(() => {
    let maxQ = 1;
    algorithm.gates.forEach(g => {
      if (g.qubit !== undefined && g.qubit > maxQ) maxQ = g.qubit;
      if (g.control !== undefined && g.control > maxQ) maxQ = g.control;
      if (g.target !== undefined && g.target > maxQ) maxQ = g.target;
      if (g.q1 !== undefined && g.q1 > maxQ) maxQ = g.q1;
      if (g.q2 !== undefined && g.q2 > maxQ) maxQ = g.q2;
    });
    return Math.min(6, maxQ + 1);
  }, [algorithm]);

  // Group gates by discrete step index
  const stepMap = useMemo(() => {
    const map = new Map<number, GateOp[]>();
    algorithm.gates.forEach(g => {
      const s = g.step ?? 0;
      if (!map.has(s)) map.set(s, []);
      map.get(s)!.push(g);
    });
    return map;
  }, [algorithm]);

  const sortedSteps = useMemo(() => {
    return Array.from(stepMap.keys()).sort((a, b) => a - b);
  }, [stepMap]);

  const totalSteps = sortedSteps.length; // Number of transformation steps
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0); // 0 = initial state |0...0>
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x, 2x, 0.5x
  const [measurementShots, setMeasurementShots] = useState<Record<string, number> | null>(null);

  // Reset when algorithm changes
  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setMeasurementShots(null);
  }, [algorithm.id]);

  // Compute quantum statevector after executing gates up to current step
  const currentQuantumState = useMemo(() => {
    const qs = new QuantumState(numQubits);
    for (let i = 0; i < currentStepIndex; i++) {
      const stepNum = sortedSteps[i];
      const gatesAtStep = stepMap.get(stepNum) || [];
      gatesAtStep.forEach(g => {
        applyGateOpToState(qs, g);
      });
    }
    return qs;
  }, [numQubits, currentStepIndex, sortedSteps, stepMap]);

  // Gates executed at the most recent step
  const lastExecutedGates = useMemo(() => {
    if (currentStepIndex === 0) return [];
    const stepNum = sortedSteps[currentStepIndex - 1];
    return stepMap.get(stepNum) || [];
  }, [currentStepIndex, sortedSteps, stepMap]);

  // Next gates to be executed
  const nextGates = useMemo(() => {
    if (currentStepIndex >= totalSteps) return [];
    const stepNum = sortedSteps[currentStepIndex];
    return stepMap.get(stepNum) || [];
  }, [currentStepIndex, sortedSteps, stepMap]);

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.round(1200 / playbackSpeed);
    const timer = setInterval(() => {
      setCurrentStepIndex(prev => {
        if (prev >= totalSteps) {
          setIsPlaying(false);
          return totalSteps;
        }
        playGateClickSound(500 + prev * 60);
        return prev + 1;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, totalSteps, playbackSpeed]);

  const handleNextStep = () => {
    if (currentStepIndex < totalSteps) {
      playGateClickSound(600 + currentStepIndex * 40);
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      playGateClickSound(500);
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleReset = () => {
    playGateClickSound(400);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setMeasurementShots(null);
  };

  // Perform Monte Carlo measurement sampling of the current state
  const handleSampleMeasurements = () => {
    playMeasurementCollapseSound();
    const probs = currentQuantumState.probabilities();
    const counts: Record<string, number> = {};
    const shots = 100;
    const dim = 1 << numQubits;

    for (let s = 0; s < shots; s++) {
      const r = Math.random();
      let cumul = 0;
      let outcome = dim - 1;
      for (let i = 0; i < dim; i++) {
        cumul += probs[i] || 0;
        if (r < cumul) {
          outcome = i;
          break;
        }
      }
      const binStr = outcome.toString(2).padStart(numQubits, '0');
      counts[binStr] = (counts[binStr] || 0) + 1;
    }
    setMeasurementShots(counts);
  };

  const probs = currentQuantumState.probabilities();
  const sv = currentQuantumState.sv;
  const entropy = currentQuantumState.entropy();
  const dim = 1 << numQubits;

  // Format Dirac superposition equation for non-zero amplitudes
  const diracTerms = useMemo(() => {
    const terms: string[] = [];
    for (let i = 0; i < dim; i++) {
      const p = probs[i] || 0;
      if (p > 1e-4) {
        const binStr = i.toString(2).padStart(numQubits, '0');
        const amp = sv[i];
        const re = amp ? amp[0] : 0;
        const im = amp ? amp[1] : 0;
        const mag = Math.sqrt(re * re + im * im);
        const phase = Math.atan2(im, re);
        const phaseDeg = Math.round((phase * 180) / Math.PI);

        let coeffStr = mag.toFixed(3);
        if (phaseDeg !== 0) {
          coeffStr += `e^{i${phaseDeg}°}`;
        }
        terms.push(`${coeffStr}|${binStr}⟩`);
      }
    }
    return terms.length > 0 ? terms.join(' + ') : '|0...0⟩';
  }, [probs, sv, dim, numQubits]);

  // Contextual explanation for the current step
  const stepExplanation = useMemo(() => {
    if (currentStepIndex === 0) {
      return {
        title: 'Initial Classical Ground State |0...0⟩',
        body: `Register is prepared in the computational basis ground state |0⟩^{\\otimes ${numQubits}}. All probability mass P = 1.0 is concentrated in the |${'0'.repeat(numQubits)}⟩ state with zero entropy (S = 0.00 bits).`,
        physicsPrinciple: 'State Initialization & Reset'
      };
    }

    const prevGates = stepMap.get(sortedSteps[currentStepIndex - 1]) || [];
    const gateTypes = prevGates.map(g => g.type);

    if (gateTypes.includes('H')) {
      return {
        title: `Hadamard Transform (Step ${currentStepIndex} of ${totalSteps})`,
        body: 'Applies Walsh-Hadamard unitary H = \\frac{1}{\\sqrt{2}}\\begin{pmatrix}1 & 1\\\\ 1 & -1\\end{pmatrix}. Creates uniform superposition over computational states, transforming classical bits into coherent quantum wavefunctions.',
        physicsPrinciple: 'Coherent Quantum Superposition'
      };
    }

    if (gateTypes.some(t => t === 'CNOT' || t === 'CZ' || t === 'CY')) {
      return {
        title: `Entangling Multi-Qubit Unitary (Step ${currentStepIndex} of ${totalSteps})`,
        body: 'Applies controlled entangling operation. The joint statevector cannot be factored into tensor product |ψ_A⟩ ⊗ |ψ_B⟩. Generates non-local quantum correlations and Bell/GHZ state entanglement.',
        physicsPrinciple: 'Non-Local Quantum Entanglement'
      };
    }

    if (algorithm.id === 'grover' && currentStepIndex > 1) {
      return {
        title: `Grover Oracle & Amplitude Amplification (Step ${currentStepIndex} of ${totalSteps})`,
        body: 'Applies phase inversion (-1)^{f(x)} on the marked target state followed by diffusion operator D = 2|ψ₀⟩⟨ψ₀| - I. Inverts amplitudes about the mean, amplifying target solution probability.',
        physicsPrinciple: 'Constructive vs Destructive Interference'
      };
    }

    if (algorithm.id === 'deutsch_jozsa' || algorithm.id === 'bernstein_vazirani') {
      return {
        title: `Oracle Phase Kickback (Step ${currentStepIndex} of ${totalSteps})`,
        body: 'Evaluates global property of boolean function f(x) in a single query by kicking the relative phase into the control register via target ancilla in |-\\rangle state.',
        physicsPrinciple: 'Quantum Phase Kickback'
      };
    }

    return {
      title: `Unitary Transformation Matrix (Step ${currentStepIndex} of ${totalSteps})`,
      body: `Applied gates: ${prevGates.map(g => `${g.type}(q${g.qubit ?? g.target})`).join(', ')}. Evolved the ${dim}-dimensional Hilbert space statevector unitarily preserves norm ⟨ψ|ψ⟩ = 1.`,
      physicsPrinciple: 'Unitary Evolution U(t)'
    };
  }, [currentStepIndex, totalSteps, stepMap, sortedSteps, algorithm, numQubits, dim]);

  return (
    <div className="space-y-5 font-mono text-xs text-[#eaf8ff]">
      
      {/* Top Header Card */}
      <div className="p-4 rounded-xl bg-[#09141d] border border-[rgba(0,229,255,0.2)] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-sm flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#00e5ff]" />
              <span>Step-by-Step Unitary Evolution Analyzer</span>
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
              {algorithm.name} ({numQubits} Qubits)
            </span>
          </div>
          <p className="text-[11px] text-[#78909c] mt-0.5">
            Scrub discrete gate cycles to inspect how amplitudes, phases, and entropy evolve through Hilbert space.
          </p>
        </div>

        {/* Stepper Transport Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-[#050b11] hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
            title="Reset to Initial Ground State |0...0⟩"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handlePrevStep}
            disabled={currentStepIndex === 0}
            className="p-2 rounded-lg bg-[#050b11] hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-40 transition-colors cursor-pointer"
            title="Step Backward (Previous Gate)"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
                : 'bg-[#00e5ff] hover:bg-[#38bdf8] text-[#02060a] shadow-[#00e5ff]/20'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
          </button>

          <button
            onClick={handleNextStep}
            disabled={currentStepIndex >= totalSteps}
            className="p-2 rounded-lg bg-[#050b11] hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-40 transition-colors cursor-pointer"
            title="Step Forward (Execute Next Gate)"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Speed Switcher */}
          <div className="flex items-center bg-[#050b11] rounded-lg border border-slate-800 p-0.5">
            {[0.5, 1, 2].map(s => (
              <button
                key={s}
                onClick={() => setPlaybackSpeed(s)}
                className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                  playbackSpeed === s ? 'bg-[#09141d] text-[#00e5ff]' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <button
            onClick={() => onLoadCircuitToComposer(algorithm.gates, numQubits)}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 transition-all cursor-pointer ml-1"
            title="Load full algorithm circuit into the interactive composer"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Load to Composer</span>
          </button>
        </div>
      </div>

      {/* Scrubber Progress Slider */}
      <div className="p-3 rounded-xl bg-[#050b11] border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#78909c]">
            Execution Cycle: <strong className="text-white">{currentStepIndex} / {totalSteps} Steps</strong>
          </span>
          <span className="text-[#00e5ff] font-bold">
            {currentStepIndex === 0
              ? 'Stage 0: Ground Register |0...0⟩'
              : currentStepIndex === totalSteps
              ? 'Final Stage: Output Superposition'
              : `Step ${currentStepIndex}: ${lastExecutedGates.map(g => g.type).join(' + ')}`}
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={totalSteps}
          value={currentStepIndex}
          onChange={(e) => {
            playGateClickSound(550);
            setCurrentStepIndex(+e.target.value);
          }}
          className="w-full h-1.5 bg-slate-800 accent-[#00e5ff] rounded-lg cursor-pointer"
        />

        {/* Step Ticks */}
        <div className="flex items-center justify-between text-[9px] text-slate-500 px-1">
          <span>|0⟩ Ground</span>
          {sortedSteps.map((step, idx) => (
            <span
              key={step}
              className={`cursor-pointer hover:text-cyan-400 ${currentStepIndex === idx + 1 ? 'text-cyan-300 font-bold' : ''}`}
              onClick={() => setCurrentStepIndex(idx + 1)}
            >
              S{idx + 1}
            </span>
          ))}
          <span>Output |ψ_fin⟩</span>
        </div>
      </div>

      {/* Physics & Mathematical Explanation Banner */}
      <div className="p-4 rounded-xl bg-[#09141d] border border-cyan-500/30 space-y-2 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00e5ff] animate-ping" />
            <h4 className="text-white font-bold text-xs">{stepExplanation.title}</h4>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800 font-bold">
            {stepExplanation.physicsPrinciple}
          </span>
        </div>

        <p className="text-[11px] text-[#78909c] leading-relaxed">
          {stepExplanation.body}
        </p>

        {/* Dirac Superposition Formula */}
        <div className="p-2.5 rounded-lg bg-black/60 border border-slate-800 text-[11px] overflow-x-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-bold">|ψ({currentStepIndex})⟩ =</span>
            <span className="text-white font-semibold whitespace-nowrap">{diracTerms}</span>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-[10px] text-[#78909c]">
            <span>Entropy: <strong className="text-purple-400">{entropy.toFixed(3)} bits</strong></span>
            <span>Norm: <strong className="text-emerald-400">1.000</strong></span>
          </div>
        </div>
      </div>

      {/* Quantum Statevector Amplitude & Phase Bar Chart */}
      <div className="p-4 rounded-xl bg-[#050b11] border border-[rgba(0,229,255,0.2)] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[#00e5ff]" />
            <span className="font-bold text-white uppercase text-[11px]">
              Computational Basis Amplitudes &amp; Complex Phase Dials
            </span>
          </div>

          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> Phase 0°
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Phase +90°
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-rose-400" /> Phase ±180°
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-purple-400" /> Phase -90°
            </span>

            <button
              onClick={handleSampleMeasurements}
              className="px-2.5 py-1 rounded bg-[#09141d] hover:bg-slate-800 border border-slate-700 text-cyan-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Dice5 className="w-3 h-3 text-cyan-400" />
              <span>Sample 100 Shots</span>
            </button>
          </div>
        </div>

        {/* Amplitude Grid Bars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 pt-2">
          {Array.from({ length: dim }).map((_, i) => {
            const p = probs[i] || 0;
            const amp = sv[i];
            const re = amp ? amp[0] : 0;
            const im = amp ? amp[1] : 0;
            const mag = Math.sqrt(re * re + im * im);
            const phase = Math.atan2(im, re);
            const phaseDeg = Math.round((phase * 180) / Math.PI);
            const binStr = i.toString(2).padStart(numQubits, '0');

            // Phase Color
            let phaseColor = '#00e5ff'; // cyan
            if (phaseDeg > 45 && phaseDeg <= 135) phaseColor = '#10b981'; // green
            else if (Math.abs(phaseDeg) > 135) phaseColor = '#f43f5e'; // rose
            else if (phaseDeg < -45 && phaseDeg >= -135) phaseColor = '#a855f7'; // violet

            return (
              <div
                key={i}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-between space-y-2 transition-all ${
                  p > 0.05
                    ? 'bg-[#09141d] border-cyan-500/40 shadow-sm'
                    : 'bg-[#02050c] border-slate-900 opacity-60'
                }`}
              >
                {/* State Label */}
                <div className="flex items-center justify-between w-full text-[10px]">
                  <span className={`font-bold ${p > 0.05 ? 'text-white' : 'text-slate-500'}`}>
                    |{binStr}⟩
                  </span>
                  <span className="text-[9px] text-[#78909c]">
                    {(p * 100).toFixed(1)}%
                  </span>
                </div>

                {/* Vertical Amplitude Bar */}
                <div className="w-full h-24 bg-slate-950 rounded-lg flex items-end p-1 relative border border-slate-900">
                  <div
                    className="w-full rounded-md transition-all duration-300 relative"
                    style={{
                      height: `${Math.max(4, p * 100)}%`,
                      backgroundColor: phaseColor,
                      boxShadow: p > 0.05 ? `0 0 10px ${phaseColor}40` : 'none'
                    }}
                  />
                  {p > 0.05 && (
                    <div className="absolute top-1 right-1 text-[8px] font-bold text-white">
                      {phaseDeg}°
                    </div>
                  )}
                </div>

                {/* Phase Clock Vector */}
                <div className="flex items-center justify-between w-full text-[9px] text-[#78909c]">
                  <span>|c|={mag.toFixed(2)}</span>
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-slate-700 flex items-center justify-center"
                    style={{ transform: `rotate(${-phaseDeg}deg)` }}
                    title={`Relative phase θ = ${phaseDeg}°`}
                  >
                    <div className="w-1 h-0.5 bg-cyan-400 ml-auto" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Measurement Sampling Histogram Modal / Drawer */}
      {measurementShots && (
        <div className="p-4 rounded-xl bg-[#09141d] border border-emerald-500/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-emerald-300 font-bold text-xs uppercase flex items-center gap-1.5">
              <Dice5 className="w-4 h-4 text-emerald-400" />
              <span>Monte Carlo Measurement Sampling (100 Shots at Step {currentStepIndex})</span>
            </span>
            <button
              onClick={() => setMeasurementShots(null)}
              className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>

          <div className="space-y-1.5">
            {Object.entries(measurementShots)
              .sort((a, b) => b[1] - a[1])
              .map(([state, count]) => (
                <div key={state} className="flex items-center gap-3 text-xs">
                  <span className="w-14 font-bold text-white">|{state}⟩</span>
                  <div className="flex-1 h-3.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${count}%` }}
                    />
                  </div>
                  <span className="w-12 text-right font-bold text-emerald-300">{count} shots</span>
                </div>
              ))}
          </div>
        </div>
      )}

    </div>
  );
};

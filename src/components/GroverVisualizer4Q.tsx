import React, { useState, useMemo } from 'react';
import { 
  Play, 
  RotateCcw, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Binary, 
  HelpCircle,
  TrendingUp,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { GateOp } from '../types/quantum';

interface GroverVisualizer4QProps {
  onLoadCircuitToComposer: (gates: GateOp[], numQubits: number) => void;
}

export const GroverVisualizer4Q: React.FC<GroverVisualizer4QProps> = ({
  onLoadCircuitToComposer
}) => {
  const [targetBinary, setTargetBinary] = useState<string>('1011'); // 11 in decimal (|1011⟩)
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [showFormulas, setShowFormulas] = useState<boolean>(true);

  const targetDecimal = useMemo(() => parseInt(targetBinary, 2), [targetBinary]);

  // Total items N = 2^4 = 16
  const N = 16;
  const numQubits = 4;

  // Stages calculation for 4-qubit Grover
  // Step 0: Ground state |0000⟩
  // Step 1: Hadamard Wall H^⊗4 (Superposition: a_i = 1/√16 = 0.25)
  // Step 2: Iteration 1 - Oracle (Target phase inverted to -0.25)
  // Step 3: Iteration 1 - Diffusion (Target amplified to +0.6875, P ≈ 47.3%)
  // Step 4: Iteration 2 - Oracle (Target phase inverted to -0.6875)
  // Step 5: Iteration 2 - Diffusion (Target amplified to +0.9531, P ≈ 90.8%)
  // Step 6: Iteration 3 - Oracle (Target phase inverted to -0.9531)
  // Step 7: Iteration 3 - Diffusion (Target amplified to +0.9805, P ≈ 96.1% — PEAK!)
  // Step 8: Iteration 4 - Over-rotation demonstration (Target drops back to +0.55, P ≈ 30%)
  const stages = useMemo(() => {
    // 16 amplitudes
    const result = [];

    // Stage 0: Ground State |0000⟩
    {
      const amps = new Array(16).fill(0);
      amps[0] = 1.0;
      result.push({
        title: 'Stage 0: Ground State Preparation',
        subtitle: 'All register qubits initialized to |0000⟩ in computational basis',
        phase: 'init',
        iteration: 0,
        amps,
        mean: 1 / 16,
        targetProb: targetDecimal === 0 ? 1.0 : 0.0,
        explanation: 'The 4-qubit register begins in the state |0000⟩ with 100% deterministic probability on |0000⟩.'
      });
    }

    // Stage 1: Equal Superposition (H^⊗4)
    {
      const val = 1 / Math.sqrt(N); // 0.25
      const amps = new Array(16).fill(val);
      result.push({
        title: 'Stage 1: Equal Superposition (Hadamard Wall)',
        subtitle: 'H^⊗4 transforms |0000⟩ into uniform superposition |s⟩ = 1/4 ∑ |x⟩',
        phase: 'superposition',
        iteration: 0,
        amps,
        mean: val,
        targetProb: val * val, // 0.0625 = 6.25%
        explanation: 'Every one of the 16 computational basis states holds equal amplitude a = +0.25, giving uniform 6.25% measurement probability.'
      });
    }

    // Dynamic Simulation across 4 Grover Iterations
    let currentAmps = new Array(16).fill(1 / Math.sqrt(N));

    for (let iter = 1; iter <= 4; iter++) {
      // Oracle Phase Inversion: target negated
      const oracleAmps = [...currentAmps];
      oracleAmps[targetDecimal] = -oracleAmps[targetDecimal];
      const oracleMean = oracleAmps.reduce((a, b) => a + b, 0) / N;

      result.push({
        title: `Iteration ${iter}: Phase Inversion Oracle (U_ω)`,
        subtitle: `Marks target |${targetBinary}⟩ by flipping its phase: |${targetBinary}⟩ → −|${targetBinary}⟩`,
        phase: 'oracle',
        iteration: iter,
        amps: oracleAmps,
        mean: oracleMean,
        targetProb: oracleAmps[targetDecimal] * oracleAmps[targetDecimal],
        explanation: `The oracle applies a π phase shift strictly to the marked state |${targetBinary}⟩ without altering other states. Notice the target bar flips negative below zero while the average mean drops to ${oracleMean.toFixed(4)}.`
      });

      // Diffusion Operator / Inversion about the mean: a_x' = 2·mean - a_x
      const diffAmps = oracleAmps.map(a => 2 * oracleMean - a);
      const diffMean = diffAmps.reduce((a, b) => a + b, 0) / N;
      const targetP = diffAmps[targetDecimal] * diffAmps[targetDecimal];

      const isPeak = iter === 3;
      const isOver = iter === 4;

      result.push({
        title: `Iteration ${iter}: Diffusion Operator (Inversion About Mean)`,
        subtitle: `Reflects each amplitude across average mean: a' = 2μ − a`,
        phase: 'diffusion',
        iteration: iter,
        amps: diffAmps,
        mean: diffMean,
        targetProb: targetP,
        explanation: isOver
          ? `OVER-ROTATION WARNING: After optimal iteration k=3, a 4th iteration rotates the state PAST |ω⟩! Target probability collapses from 96.1% down to ${(targetP * 100).toFixed(1)}%. This demonstrates why Grover search must stop at k = ⌊(π/4)√N⌋.`
          : isPeak
          ? `OPTIMAL PEAK AMPLITUDE REACHED! Probability of measuring |${targetBinary}⟩ achieves ${(targetP * 100).toFixed(1)}% (96.1%). Notice the 15 non-target states have collapsed to near zero (< 0.3% each).`
          : `Because the target was negative (−a), reflecting across the positive mean μ boosts it far above all other states: a' = 2μ − (−a) = 2μ + a. Target probability surges to ${(targetP * 100).toFixed(1)}%!`
      });

      currentAmps = diffAmps;
    }

    return result;
  }, [targetBinary, targetDecimal, N]);

  const activeStage = stages[currentStep] || stages[0];

  // Build the complete 4-qubit circuit for Composer
  const handleLoadCircuit = () => {
    const gates: GateOp[] = [];
    let step = 0;

    // 1. Hadamard wall
    for (let q = 0; q < numQubits; q++) {
      gates.push({ type: 'H', qubit: q, step });
    }
    step++;

    // Run optimal 3 iterations
    for (let iter = 0; iter < 3; iter++) {
      // Oracle: X on 0-bits
      const bits = targetBinary.split('').map(Number);
      bits.forEach((b, q) => {
        if (b === 0) gates.push({ type: 'X', qubit: q, step });
      });
      step++;

      // Multi-controlled Z via H + CCX / CNOT on 4 qubits
      gates.push({ type: 'H', qubit: 3, step });
      step++;
      gates.push({ type: 'CCX', c1: 0, c2: 1, target: 2, step });
      step++;
      gates.push({ type: 'CNOT', control: 2, target: 3, step });
      step++;
      gates.push({ type: 'CCX', c1: 0, c2: 1, target: 2, step });
      step++;
      gates.push({ type: 'H', qubit: 3, step });
      step++;

      // Uncompute X
      bits.forEach((b, q) => {
        if (b === 0) gates.push({ type: 'X', qubit: q, step });
      });
      step++;

      // Diffusion Operator: H^⊗4 -> X^⊗4 -> MCZ -> X^⊗4 -> H^⊗4
      for (let q = 0; q < numQubits; q++) gates.push({ type: 'H', qubit: q, step });
      step++;
      for (let q = 0; q < numQubits; q++) gates.push({ type: 'X', qubit: q, step });
      step++;

      gates.push({ type: 'H', qubit: 3, step });
      step++;
      gates.push({ type: 'CCX', c1: 0, c2: 1, target: 2, step });
      step++;
      gates.push({ type: 'CNOT', control: 2, target: 3, step });
      step++;
      gates.push({ type: 'CCX', c1: 0, c2: 1, target: 2, step });
      step++;
      gates.push({ type: 'H', qubit: 3, step });
      step++;

      for (let q = 0; q < numQubits; q++) gates.push({ type: 'X', qubit: q, step });
      step++;
      for (let q = 0; q < numQubits; q++) gates.push({ type: 'H', qubit: q, step });
      step++;
    }

    onLoadCircuitToComposer(gates, 4);
  };

  return (
    <div className="p-6 rounded-lg bg-slate-900/40 border border-slate-800 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span>4-Qubit Grover Search: Step-by-Step Oracle &amp; Diffusion Visualizer</span>
            </h3>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
              N = 16 Items
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Detailed walkthrough of quantum amplitude amplification on an unstructured database of N = 16 elements.
            See how the <strong>Oracle (U_ω)</strong> inverts the marked state&apos;s phase, and the <strong>Diffusion Operator (U_s = 2|s⟩⟨s| − I)</strong>
            reflects all amplitudes about their mean, boosting target measurement probability to <strong>96.1%</strong> in exactly 3 iterations.
          </p>
        </div>

        <button
          onClick={handleLoadCircuit}
          className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-cyan-500/20 cursor-pointer transition-all"
        >
          <Cpu className="w-4 h-4" />
          <span>Load 4-Qubit Grover into Composer</span>
        </button>
      </div>

      {/* Target Selector Bar across all 16 states */}
      <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-semibold flex items-center gap-1.5">
            <Binary className="w-3.5 h-3.5 text-cyan-400" />
            <span>Select Target Marked State |ω⟩ (1 of 16):</span>
          </span>
          <span className="text-amber-400 font-bold">
            Target: |{targetBinary}⟩ (Decimal #{targetDecimal})
          </span>
        </div>

        <div className="grid grid-cols-8 md:grid-cols-16 gap-1 font-mono text-[11px]">
          {Array.from({ length: 16 }).map((_, idx) => {
            const bStr = idx.toString(2).padStart(4, '0');
            const isTarget = bStr === targetBinary;
            return (
              <button
                key={bStr}
                onClick={() => {
                  setTargetBinary(bStr);
                  setCurrentStep(0);
                }}
                className={`py-1.5 px-0.5 rounded text-center transition-all cursor-pointer ${
                  isTarget
                    ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-sm ring-1 ring-cyan-300'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                }`}
                title={`Mark basis state |${bStr}⟩ (${idx})`}
              >
                |{bStr}⟩
              </button>
            );
          })}
        </div>
      </div>

      {/* Stepper Navigation Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-30 text-slate-300 flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Previous Step</span>
          </button>

          <span className="text-slate-400 px-1">
            Step <strong className="text-white">{currentStep + 1}</strong> / {stages.length}
          </span>

          <button
            onClick={() => setCurrentStep(prev => Math.min(stages.length - 1, prev + 1))}
            disabled={currentStep === stages.length - 1}
            className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 text-white font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Next Step</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          <button
            onClick={() => setCurrentStep(0)}
            className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer ml-1"
            title="Reset to Ground State"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Stage Milestone Badge */}
        <div className="flex items-center gap-3">
          <span className="text-slate-400">Target Measurement Probability:</span>
          <span className={`text-base font-bold ${activeStage.targetProb > 0.8 ? 'text-emerald-400 font-extrabold text-lg' : activeStage.targetProb > 0.3 ? 'text-amber-400' : 'text-slate-300'}`}>
            {(activeStage.targetProb * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Stage Explainer Banner */}
      <div className={`p-4 rounded-lg border text-xs font-mono space-y-1.5 ${
        activeStage.phase === 'diffusion' && activeStage.iteration === 3
          ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
          : activeStage.phase === 'diffusion' && activeStage.iteration === 4
          ? 'bg-rose-950/40 border-rose-500/60 text-rose-200'
          : activeStage.phase === 'oracle'
          ? 'bg-amber-950/30 border-amber-500/50 text-amber-200'
          : 'bg-slate-950 border-slate-800 text-slate-300'
      }`}>
        <div className="flex items-center justify-between font-bold text-sm">
          <span>{activeStage.title}</span>
          <span className="text-[11px] font-semibold opacity-80 uppercase tracking-wider">
            Phase: {activeStage.phase}
          </span>
        </div>
        <div className="text-[11px] text-slate-400">{activeStage.subtitle}</div>
        <div className="pt-1 text-slate-200 leading-relaxed">{activeStage.explanation}</div>
      </div>

      {/* Interactive 16-State Amplitude Bar Chart with Mean Line */}
      <div className="p-6 rounded-lg bg-[#05070c] border border-slate-800 space-y-3 relative select-none">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-slate-800/60">
          <div className="flex items-center gap-4">
            <span className="text-white font-semibold">Statevector Amplitudes a_x (Range: −1.0 to +1.0)</span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
              <span>Target |{targetBinary}⟩</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" />
              <span>Non-Target States</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold">Average Mean μ = {activeStage.mean.toFixed(4)}</span>
          </div>
        </div>

        {/* Canvas Bar Chart Area */}
        <div className="h-64 relative w-full flex items-center justify-between px-2 pt-4">
          {/* Zero baseline */}
          <div className="absolute left-0 right-0 top-1/2 h-px bg-slate-700/80 z-0" />
          <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[9px] font-mono text-slate-500 pl-1">0.0</span>

          {/* Active Mean Line μ */}
          {activeStage.phase !== 'init' && (
            <div
              className="absolute left-6 right-2 h-0.5 border-t-2 border-dashed border-amber-400/90 z-20 transition-all duration-300"
              style={{
                top: `${50 - activeStage.mean * 50}%`
              }}
            >
              <span className="absolute right-0 -top-4 text-[10px] font-mono font-bold text-amber-300 bg-slate-950/80 px-1 rounded">
                μ = {activeStage.mean.toFixed(3)}
              </span>
            </div>
          )}

          {/* 16 Amplitude Bars */}
          {activeStage.amps.map((amp, idx) => {
            const bStr = idx.toString(2).padStart(4, '0');
            const isTarget = idx === targetDecimal;
            const isNegative = amp < 0;
            const barHeightPct = Math.min(100, Math.abs(amp) * 100);

            return (
              <div key={bStr} className="flex-1 flex flex-col items-center h-full relative z-10 mx-0.5">
                {/* Bar Container */}
                <div className="flex-1 w-full relative flex items-center justify-center">
                  <div
                    className={`w-full max-w-[22px] rounded-xs transition-all duration-300 absolute ${
                      isTarget
                        ? isNegative
                          ? 'bg-rose-500 shadow-sm shadow-rose-500/50'
                          : 'bg-cyan-400 shadow-sm shadow-cyan-400/50'
                        : 'bg-slate-700/80 hover:bg-slate-600'
                    }`}
                    style={{
                      height: `${barHeightPct / 2}%`,
                      top: isNegative ? '50%' : `${50 - barHeightPct / 2}%`
                    }}
                  />
                </div>

                {/* State Label */}
                <span
                  className={`text-[9px] font-mono mt-2 transition-colors ${
                    isTarget ? 'text-cyan-300 font-bold' : 'text-slate-500'
                  }`}
                >
                  |{bStr}⟩
                </span>
                {/* Value tooltip */}
                <span
                  className={`text-[8px] font-mono tabular-nums ${
                    isTarget ? 'text-cyan-300 font-bold' : 'text-slate-600'
                  }`}
                >
                  {amp >= 0 ? '+' : ''}{amp.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Operator Decomposition & Mathematical Derivation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        {/* Oracle Circuit Decomposition */}
        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold text-amber-300">Phase Inversion Oracle U_ω Implementation</span>
            <span className="text-[10px] text-slate-500">Unitary Reflection</span>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            The oracle acts as a diagonal operator: U_ω = I − 2|ω⟩⟨ω|.
            For target |{targetBinary}⟩, it evaluates whether the register matches the target string and flips its phase:
          </p>

          <div className="p-2.5 rounded bg-slate-900/80 border border-slate-850 space-y-1 text-[11px]">
            <div className="text-cyan-300 font-semibold">1. Bit-condition X-mask:</div>
            <div className="text-slate-400 pl-3">
              Apply X to qubits where bit is 0: {targetBinary.split('').map((b, i) => (b === '0' ? `X(q[${i}])` : null)).filter(Boolean).join(', ') || 'None (all 1s)'}
            </div>
            <div className="text-cyan-300 font-semibold mt-1">2. Multi-controlled Phase (MCZ):</div>
            <div className="text-slate-400 pl-3">
              H(q3) → CCX(q0, q1 → q2) → CNOT(q2 → q3) → CCX(q0, q1 → q2) → H(q3)
            </div>
            <div className="text-cyan-300 font-semibold mt-1">3. Uncompute X-mask:</div>
            <div className="text-slate-400 pl-3">
              Re-apply X to restore computational basis states.
            </div>
          </div>
        </div>

        {/* Diffusion Operator Decomposition */}
        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold text-cyan-300">Diffusion Operator U_s Implementation</span>
            <span className="text-[10px] text-slate-500">Inversion About Mean</span>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Reflects the statevector about the equal superposition |s⟩: U_s = 2|s⟩⟨s| − I = H^⊗4 (2|0000⟩⟨0000| − I) H^⊗4.
          </p>

          <div className="p-2.5 rounded bg-slate-900/80 border border-slate-850 space-y-1 text-[11px]">
            <div className="text-cyan-300 font-semibold">1. Basis Rotation:</div>
            <div className="text-slate-400 pl-3">H^⊗4 on all 4 qubits: |s⟩ → |0000⟩</div>
            <div className="text-cyan-300 font-semibold mt-1">2. Zero-state Reflection:</div>
            <div className="text-slate-400 pl-3">X^⊗4 → Multi-controlled Z → X^⊗4</div>
            <div className="text-cyan-300 font-semibold mt-1">3. Restore Superposition:</div>
            <div className="text-slate-400 pl-3">H^⊗4 on all 4 qubits completes the reflection across μ.</div>
          </div>
        </div>
      </div>

      {/* 2D Geometric Hilbert Space Rotation Derivation */}
      <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>Geometric State Space Rotation in Span(|ω⟩, |s^⊥⟩)</span>
          </span>
          <span className="text-cyan-300">θ = 2·arcsin(1/√16) ≈ 28.96°</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1 text-[11px]">
          <div className="p-2.5 rounded bg-slate-900 border border-slate-850">
            <span className="text-slate-500">Initial Angle θ₀:</span>
            <div className="text-sm font-bold text-slate-200 mt-0.5">14.48° (1/4 |ω⟩)</div>
            <div className="text-[10px] text-slate-500">P = sin²(14.48°) = 6.25%</div>
          </div>
          <div className="p-2.5 rounded bg-slate-900 border border-slate-850">
            <span className="text-slate-500">After Iteration 1:</span>
            <div className="text-sm font-bold text-slate-200 mt-0.5">43.44° (+28.96°)</div>
            <div className="text-[10px] text-slate-500">P = sin²(43.44°) = 47.3%</div>
          </div>
          <div className="p-2.5 rounded bg-slate-900 border border-slate-850">
            <span className="text-slate-500">After Iteration 2:</span>
            <div className="text-sm font-bold text-slate-200 mt-0.5">72.40° (+28.96°)</div>
            <div className="text-[10px] text-slate-500">P = sin²(72.40°) = 90.8%</div>
          </div>
          <div className="p-2.5 rounded bg-slate-900 border border-slate-850">
            <span className="text-slate-500">After Iteration 3 (Peak):</span>
            <div className="text-sm font-bold text-emerald-400 mt-0.5">101.36° (≈ 90° target)</div>
            <div className="text-[10px] text-emerald-400">P = sin²(101.36°) = 96.1%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

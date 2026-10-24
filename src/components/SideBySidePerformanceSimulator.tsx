import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Cpu, 
  Sparkles, 
  Zap, 
  TrendingUp, 
  Activity, 
  CheckCircle2, 
  Clock, 
  Sliders, 
  Layers, 
  ArrowRight,
  ShieldCheck,
  Flame,
  Scale
} from 'lucide-react';

export type BenchmarkAlgoId = 'grover' | 'shor' | 'deutsch_jozsa' | 'qft' | 'simon';

interface BenchmarkAlgoDef {
  id: BenchmarkAlgoId;
  name: string;
  tag: string;
  description: string;
  variableLabel: string;
  defaultVal: number;
  minVal: number;
  maxVal: number;
  stepVal: number;
  valFormatter: (v: number) => string;
  classicalName: string;
  classicalBigO: string;
  quantumName: string;
  quantumBigO: string;
  calcClassicalOps: (v: number) => number;
  calcQuantumOps: (v: number) => number;
  speedupType: 'QUADRATIC' | 'EXPONENTIAL';
}

const BENCHMARKS: BenchmarkAlgoDef[] = [
  {
    id: 'grover',
    name: "Grover's Search vs. Classical Linear Search",
    tag: 'SEARCH',
    description: 'Find a single marked record in an unsorted, unordered database of N elements.',
    variableLabel: 'Database Size (N items)',
    defaultVal: 1000000,
    minVal: 10000,
    maxVal: 10000000,
    stepVal: 50000,
    valFormatter: (v) => `${v.toLocaleString()} items`,
    classicalName: 'Linear Sequential Scan',
    classicalBigO: 'O(N)',
    quantumName: "Grover's Amplitude Amplification",
    quantumBigO: 'O(√N)',
    calcClassicalOps: (v) => Math.round(v / 2), // average case
    calcQuantumOps: (v) => Math.max(1, Math.round((Math.PI / 4) * Math.sqrt(v))),
    speedupType: 'QUADRATIC'
  },
  {
    id: 'shor',
    name: "Shor's Factoring vs. Classical GNFS",
    tag: 'FACTORING',
    description: 'Find prime factors of a composite RSA integer modulus of n bits.',
    variableLabel: 'Key Length (n bits)',
    defaultVal: 512,
    minVal: 64,
    maxVal: 2048,
    stepVal: 64,
    valFormatter: (v) => `${v} bits`,
    classicalName: 'General Number Field Sieve (GNFS)',
    classicalBigO: 'O(exp(c · (ln N)¹/³ (ln ln N)²/³))',
    quantumName: "Shor's Order-Finding QFT",
    quantumBigO: 'O(n³)',
    calcClassicalOps: (v) => {
      // Approximate GNFS scaling in operations
      if (v <= 128) return 500000;
      if (v <= 256) return 80000000;
      if (v <= 512) return 500000000000;
      return 1e18; // 2048-bit exceeds classical capacity
    },
    calcQuantumOps: (v) => Math.round(Math.pow(v, 3)),
    speedupType: 'EXPONENTIAL'
  },
  {
    id: 'deutsch_jozsa',
    name: 'Deutsch-Jozsa vs. Classical Oracle Trial',
    tag: 'ORACLE',
    description: 'Determine if an n-bit oracle function is Constant (all 0s/1s) or Balanced (50/50).',
    variableLabel: 'Input Bit Width (n bits)',
    defaultVal: 24,
    minVal: 4,
    maxVal: 32,
    stepVal: 2,
    valFormatter: (v) => `${v} bits (2^${v} inputs)`,
    classicalName: 'Deterministic Query Sampling',
    classicalBigO: 'O(2ⁿ⁻¹ + 1)',
    quantumName: 'Deutsch-Jozsa Superposition Interference',
    quantumBigO: 'O(1)',
    calcClassicalOps: (v) => Math.pow(2, v - 1) + 1,
    calcQuantumOps: () => 1,
    speedupType: 'EXPONENTIAL'
  },
  {
    id: 'qft',
    name: 'Quantum Fourier Transform vs. Classical FFT',
    tag: 'TRANSFORM',
    description: 'Compute the Discrete Fourier Transform over a vector of N = 2ⁿ state amplitudes.',
    variableLabel: 'Register Size (n qubits / N = 2ⁿ points)',
    defaultVal: 20,
    minVal: 4,
    maxVal: 28,
    stepVal: 2,
    valFormatter: (v) => `${v} qubits (N = ${(Math.pow(2, v)).toLocaleString()})`,
    classicalName: 'Cooley-Tukey Radix-2 FFT',
    classicalBigO: 'O(N log₂ N)',
    quantumName: 'Quantum Phase Kickback QFT',
    quantumBigO: 'O(n²)',
    calcClassicalOps: (v) => Math.round(Math.pow(2, v) * v),
    calcQuantumOps: (v) => Math.round((v * (v + 1)) / 2),
    speedupType: 'EXPONENTIAL'
  },
  {
    id: 'simon',
    name: "Simon's Algorithm vs. Classical Collision Search",
    tag: 'HIDDEN PERIOD',
    description: 'Find secret XOR period s for 2-to-1 function f(x) = f(x ⊕ s) on n bits.',
    variableLabel: 'Bit Width (n bits)',
    defaultVal: 24,
    minVal: 8,
    maxVal: 48,
    stepVal: 4,
    valFormatter: (v) => `${v} bits`,
    classicalName: 'Birthday Paradox Hash Table',
    classicalBigO: 'Ω(2^(n/2))',
    quantumName: "Simon's Quantum Sampler + Gaussian Elimination",
    quantumBigO: 'O(n)',
    calcClassicalOps: (v) => Math.round(Math.pow(2, v / 2)),
    calcQuantumOps: (v) => v + 4,
    speedupType: 'EXPONENTIAL'
  }
];

export const SideBySidePerformanceSimulator: React.FC = () => {
  const [selectedAlgoId, setSelectedAlgoId] = useState<BenchmarkAlgoId>('grover');
  const [paramValue, setParamValue] = useState<number>(1000000);
  const [simSpeed, setSimSpeed] = useState<number>(1); // 1x, 2x, 5x, 20x
  
  // Simulation Execution State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [classicalProgress, setClassicalProgress] = useState<number>(0); // 0 to 100
  const [quantumProgress, setQuantumProgress] = useState<number>(0);     // 0 to 100
  
  // Real-time Counters
  const [classicalCurrentOps, setClassicalCurrentOps] = useState<number>(0);
  const [quantumCurrentOps, setQuantumCurrentOps] = useState<number>(0);
  const [quantumTargetAmplitude, setQuantumTargetAmplitude] = useState<number>(0); // 0 to 100%
  const [simulationFinished, setSimulationFinished] = useState<boolean>(false);
  
  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const algo = BENCHMARKS.find(b => b.id === selectedAlgoId) || BENCHMARKS[0];
  const targetClassicalOps = algo.calcClassicalOps(paramValue);
  const targetQuantumOps = algo.calcQuantumOps(paramValue);
  const speedupRatio = (targetClassicalOps / Math.max(1, targetQuantumOps)).toFixed(1);

  // Sync parameter when switching algorithm
  const handleSelectAlgo = (id: BenchmarkAlgoId) => {
    setSelectedAlgoId(id);
    const def = BENCHMARKS.find(b => b.id === id)!;
    setParamValue(def.defaultVal);
    handleReset();
  };

  const handleReset = () => {
    setIsRunning(false);
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setClassicalProgress(0);
    setQuantumProgress(0);
    setClassicalCurrentOps(0);
    setQuantumCurrentOps(0);
    setQuantumTargetAmplitude(0);
    setSimulationFinished(false);
  };

  // Run or Pause simulation
  const handleToggleRun = () => {
    if (isRunning) {
      setIsRunning(false);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    } else {
      setIsRunning(true);
      startTimeRef.current = performance.now();
    }
  };

  // Animation Loop
  useEffect(() => {
    if (!isRunning) return;

    let localClassic = classicalCurrentOps;
    let localQuantum = quantumCurrentOps;

    const tick = () => {
      // Quantum completes in a few steps
      const quantumIncrement = Math.max(1, Math.ceil(targetQuantumOps / 60)) * simSpeed;
      localQuantum = Math.min(targetQuantumOps, localQuantum + quantumIncrement);
      
      const qProg = targetQuantumOps > 0 ? (localQuantum / targetQuantumOps) * 100 : 100;
      setQuantumProgress(qProg);
      setQuantumCurrentOps(localQuantum);
      setQuantumTargetAmplitude(Math.min(99.9, Math.round(qProg * 0.999 * 10) / 10));

      // Classical steps at normal sequential linear pace
      // We scale the visual pace so the quantum speedup is dramatically noticeable
      const classicalRatioPace = Math.max(1, Math.round(targetClassicalOps / (350 / simSpeed)));
      localClassic = Math.min(targetClassicalOps, localClassic + classicalRatioPace);
      
      const cProg = (localClassic / targetClassicalOps) * 100;
      setClassicalProgress(cProg);
      setClassicalCurrentOps(localClassic);

      if (localClassic >= targetClassicalOps && localQuantum >= targetQuantumOps) {
        setIsRunning(false);
        setSimulationFinished(true);
        return;
      }

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isRunning, simSpeed, targetClassicalOps, targetQuantumOps]);

  // Instantly finish both
  const handleInstantCompute = () => {
    setIsRunning(false);
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setClassicalProgress(100);
    setQuantumProgress(100);
    setClassicalCurrentOps(targetClassicalOps);
    setQuantumCurrentOps(targetQuantumOps);
    setQuantumTargetAmplitude(99.9);
    setSimulationFinished(true);
  };

  return (
    <div className="space-y-5 text-slate-200">
      {/* Algorithm Benchmark Selector Bar */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono">
        {BENCHMARKS.map(b => (
          <button
            key={b.id}
            onClick={() => handleSelectAlgo(b.id)}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedAlgoId === b.id
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>{b.name.split(' vs.')[0]}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono uppercase ${
              selectedAlgoId === b.id ? 'bg-slate-950/40 text-slate-900' : 'bg-slate-900 text-cyan-400'
            }`}>
              {b.speedupType}
            </span>
          </button>
        ))}
      </div>

      {/* Benchmark Control Bar & Dynamic Variable Slider */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex-1 min-w-[280px] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>{algo.variableLabel}:</span>
            </span>
            <span className="text-cyan-300 font-bold text-sm">
              {algo.valFormatter(paramValue)}
            </span>
          </div>

          <input
            type="range"
            min={algo.minVal}
            max={algo.maxVal}
            step={algo.stepVal}
            value={paramValue}
            onChange={(e) => {
              setParamValue(+e.target.value);
              handleReset();
            }}
            className="w-full h-1.5 bg-slate-800 accent-cyan-400 rounded-sm cursor-pointer"
          />
        </div>

        {/* Speed Multiplier & Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-800">
            <span className="text-slate-500 text-[11px]">Speed:</span>
            {[1, 2, 5, 20].map(s => (
              <button
                key={s}
                onClick={() => setSimSpeed(s)}
                className={`px-1.5 py-0.5 rounded text-[10px] cursor-pointer ${
                  simSpeed === s ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}×
              </button>
            ))}
          </div>

          <button
            onClick={handleToggleRun}
            className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
              isRunning 
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-amber-500/20'
                : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-cyan-500/20'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isRunning ? 'Pause Race' : classicalProgress > 0 ? 'Resume Race' : 'Start Side-by-Side Race'}</span>
          </button>

          <button
            onClick={handleInstantCompute}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer text-xs"
            title="Instantly calculate final speedup"
          >
            Instant Finish
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="Reset simulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Speedup Metric Telemetry HUD */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-center">
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-0.5">
          <div className="text-[10px] text-slate-500 uppercase">ASバMPTOTIC SPEEDUP</div>
          <div className="text-xl font-bold text-cyan-300">
            {speedupRatio}×
          </div>
          <div className="text-[10px] text-slate-400">Quantum Acceleration</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-0.5">
          <div className="text-[10px] text-slate-500 uppercase">CLASSICAL OPS BUDGET</div>
          <div className="text-lg font-bold text-rose-400 truncate">
            {targetClassicalOps.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400">{algo.classicalBigO}</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-0.5">
          <div className="text-[10px] text-slate-500 uppercase">QUANTUM UNITARY GATES</div>
          <div className="text-lg font-bold text-emerald-400">
            {targetQuantumOps.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400">{algo.quantumBigO}</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-0.5">
          <div className="text-[10px] text-slate-500 uppercase">OPERATIONS SAVED</div>
          <div className="text-lg font-bold text-amber-300 truncate">
            {(targetClassicalOps - targetQuantumOps).toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400">Queries Bypassed</div>
        </div>
      </div>

      {/* Side-by-Side Dual Lane Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LEFT LANE: Classical CPU (Sequential Processing) */}
        <div className="p-5 rounded-2xl border border-rose-500/30 bg-gradient-to-b from-slate-900/90 via-rose-950/10 to-slate-950 space-y-4 shadow-lg shadow-rose-950/10">
          {/* Lane Header */}
          <div className="flex items-center justify-between pb-3 border-b border-rose-900/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{algo.classicalName}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800/40 font-mono">
                    {algo.classicalBigO}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">Classical Von Neumann CPU Thread</div>
              </div>
            </div>

            <div className="text-right font-mono text-xs">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                classicalProgress >= 100 
                  ? 'bg-rose-900/60 text-rose-200 border border-rose-700' 
                  : isRunning 
                    ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse' 
                    : 'bg-slate-900 text-slate-500'
              }`}>
                {classicalProgress >= 100 ? 'COMPLETE' : isRunning ? 'SCANNING MEMORY...' : 'READY'}
              </span>
            </div>
          </div>

          {/* Progress Bar & Status */}
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Search Evaluation Progress:</span>
              <span className="text-rose-400 font-bold">{classicalProgress.toFixed(1)}%</span>
            </div>

            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-full transition-all duration-75"
                style={{ width: `${classicalProgress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
              <span>Ops Evaluated: {classicalCurrentOps.toLocaleString()}</span>
              <span>Target: {targetClassicalOps.toLocaleString()}</span>
            </div>
          </div>

          {/* Live Classical Execution Visualizer (Linear Array Scanning) */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 font-mono text-xs">
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Sequential Cache Inspection:</span>
              <span className="text-rose-400 text-[10px]">Indexed Loop</span>
            </div>

            {/* Simulated array blocks */}
            <div className="grid grid-cols-8 gap-1 py-1">
              {Array.from({ length: 16 }).map((_, idx) => {
                const isInspected = (idx / 16) * 100 <= classicalProgress;
                return (
                  <div
                    key={idx}
                    className={`h-7 rounded border flex items-center justify-center text-[10px] font-mono transition-colors ${
                      isInspected 
                        ? 'bg-rose-950/70 border-rose-600/70 text-rose-300' 
                        : 'bg-slate-900/60 border-slate-800 text-slate-600'
                    }`}
                  >
                    #{idx * Math.round(paramValue / 16)}
                  </div>
                );
              })}
            </div>

            <div className="text-[10px] text-slate-500 leading-tight">
              Each memory item must be fetched and compared sequentially. No superposition exists; worst-case requires scanning up to N elements.
            </div>
          </div>

          {/* Hardware & Energy Footprint */}
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1 font-mono text-[11px] text-slate-400">
            <div className="flex justify-between">
              <span>Assumed Clock Rate:</span>
              <span className="text-slate-300">3.5 GHz CPU Core</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Execution Time:</span>
              <span className="text-rose-300 font-bold">
                {targetClassicalOps > 1e9 ? '~Hours / Days' : targetClassicalOps > 1e6 ? `${(targetClassicalOps / 3.5e9 * 1000).toFixed(2)} ms` : `${(targetClassicalOps / 3.5e9 * 1e6).toFixed(1)} μs`}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT LANE: Quantum QPU (Coherent Interference & Superposition) */}
        <div className="p-5 rounded-2xl border border-cyan-500/40 bg-gradient-to-b from-slate-900/90 via-cyan-950/10 to-slate-950 space-y-4 shadow-lg shadow-cyan-950/10">
          {/* Lane Header */}
          <div className="flex items-center justify-between pb-3 border-b border-cyan-900/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{algo.quantumName}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40 font-mono font-bold">
                    {algo.quantumBigO}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">Quantum Processing Unit (QPU)</div>
              </div>
            </div>

            <div className="text-right font-mono text-xs">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                quantumProgress >= 100 
                  ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-700 shadow-xs' 
                  : isRunning 
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 animate-pulse' 
                    : 'bg-slate-900 text-slate-500'
              }`}>
                {quantumProgress >= 100 ? 'AMPLIFIED & MEASURED' : isRunning ? 'AMPLIFYING STATE...' : 'READY'}
              </span>
            </div>
          </div>

          {/* Progress Bar & Status */}
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Amplitude Amplification:</span>
              <span className="text-cyan-400 font-bold">{quantumProgress.toFixed(1)}%</span>
            </div>

            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-75"
                style={{ width: `${quantumProgress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
              <span>Unitary Passes: {quantumCurrentOps.toLocaleString()}</span>
              <span>Target: {targetQuantumOps.toLocaleString()}</span>
            </div>
          </div>

          {/* Live Quantum Wavefunction Amplitude Visualizer */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 font-mono text-xs">
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Target Eigenstate Probability |α|²:</span>
              <span className="text-emerald-400 font-bold text-xs">{quantumTargetAmplitude}%</span>
            </div>

            {/* Probability Amplitude Bar */}
            <div className="w-full h-7 bg-slate-900 rounded-lg border border-slate-800 overflow-hidden relative flex items-center px-3">
              <div 
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-cyan-600/80 to-emerald-500/80 transition-all duration-150"
                style={{ width: `${quantumTargetAmplitude}%` }}
              />
              <span className="relative z-10 text-[11px] font-bold text-white drop-shadow">
                P(|target⟩) = {quantumTargetAmplitude}%
              </span>
            </div>

            <div className="text-[10px] text-slate-500 leading-tight">
              Quantum diffusion operator reflects the statevector across the average amplitude, boosting the target state constructively while canceling noise destructively.
            </div>
          </div>

          {/* Hardware & Energy Footprint */}
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1 font-mono text-[11px] text-slate-400">
            <div className="flex justify-between">
              <span>Assumed Gate Clock Rate:</span>
              <span className="text-slate-300">25 MHz Transmon Coupler</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Execution Time:</span>
              <span className="text-emerald-300 font-bold">
                {`${(targetQuantumOps / 25e6 * 1e6).toFixed(2)} μs`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Speedup Synthesis Card */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/90 space-y-2 font-mono text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-200">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Real-Time Speedup Assessment ({algo.name}):</span>
        </div>
        <p className="text-slate-400 leading-relaxed font-sans text-xs">
          For an input instance of <strong>{algo.valFormatter(paramValue)}</strong>, the classical approach requires up to <strong>{targetClassicalOps.toLocaleString()} operations</strong>, whereas the quantum circuit achieves the exact solution in only <strong>{targetQuantumOps.toLocaleString()} operations</strong>. This delivers a <strong>{speedupRatio}× speedup advantage</strong>, proving why {algo.speedupType.toLowerCase()} quantum algorithms revolutionize {algo.tag.toLowerCase()} problems.
        </p>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Sliders, 
  Radio, 
  Zap, 
  Play, 
  RotateCcw, 
  Sparkles, 
  Cpu, 
  Layers, 
  Info, 
  CheckCircle2, 
  Clock, 
  Waves,
  ArrowRight,
  TrendingUp,
  Flame
} from 'lucide-react';
import { GateOp } from '../types/quantum';
import { useToast } from '../context/ToastContext';
import { playGateClickSound, playMeasurementCollapseSound } from '../utils/audio';

interface QuantumPulseStudioProps {
  onLoadToComposer?: (gates: GateOp[], qubits: number) => void;
}

export type PulseExperiment = 'RABI' | 'DRAG' | 'RAMSEY' | 'CROSS_RESONANCE';
export type PulseShape = 'GAUSSIAN' | 'DRAG' | 'SQUARE' | 'FLAT_TOP';

export const QuantumPulseStudio: React.FC<QuantumPulseStudioProps> = ({
  onLoadToComposer
}) => {
  const { showToast } = useToast();

  const [experiment, setExperiment] = useState<PulseExperiment>('RABI');
  const [pulseShape, setPulseShape] = useState<PulseShape>('DRAG');
  
  // Microwave pulse parameters
  const [amplitude, setAmplitude] = useState<number>(0.75); // 0.1 to 1.0
  const [duration, setDuration] = useState<number>(36); // ns (e.g. 10 to 80 ns)
  const [sigma, setSigma] = useState<number>(8); // ns (Gaussian width)
  const [detuning, setDetuning] = useState<number>(0); // MHz (-20 to +20 MHz)
  const [dragBeta, setDragBeta] = useState<number>(0.4); // DRAG coefficient
  const [anharmonicity, setAnharmonicity] = useState<number>(-330); // MHz (transmon alpha)
  const [echoEnabled, setEchoEnabled] = useState<boolean>(true); // for Ramsey / Hahn Echo

  // Sample discrete waveform points for visualization (0 to duration ns)
  const waveformSamples = useMemo(() => {
    const numPoints = 80;
    const dt = duration / numPoints;
    const mid = duration / 2;
    const points: Array<{ t: number; iVal: number; qVal: number }> = [];

    for (let idx = 0; idx <= numPoints; idx++) {
      const t = idx * dt;
      let iVal = 0;
      let qVal = 0;

      if (pulseShape === 'GAUSSIAN' || pulseShape === 'DRAG') {
        const exponent = -Math.pow(t - mid, 2) / (2 * Math.pow(sigma, 2));
        iVal = amplitude * Math.exp(exponent);

        if (pulseShape === 'DRAG' || experiment === 'DRAG') {
          // DRAG quadrature correction: Q(t) = -(beta / alpha) * dI/dt
          // dI/dt = I(t) * -(t - mid) / sigma^2
          const dIdt = -iVal * (t - mid) / Math.pow(sigma, 2);
          // Scale into visible range
          qVal = -(dragBeta * 15) * dIdt;
        }
      } else if (pulseShape === 'SQUARE') {
        iVal = t >= 2 && t <= duration - 2 ? amplitude : 0;
        qVal = 0;
      } else {
        // FLAT_TOP
        const rise = sigma * 1.5;
        if (t < rise) {
          iVal = amplitude * Math.exp(-Math.pow(t - rise, 2) / (2 * Math.pow(sigma / 2, 2)));
        } else if (t > duration - rise) {
          iVal = amplitude * Math.exp(-Math.pow(t - (duration - rise), 2) / (2 * Math.pow(sigma / 2, 2)));
        } else {
          iVal = amplitude;
        }
        qVal = 0;
      }

      points.push({ t, iVal, qVal });
    }

    return points;
  }, [amplitude, duration, sigma, pulseShape, dragBeta, experiment]);

  // Physics Simulation Curves based on active experiment
  const physicsData = useMemo(() => {
    if (experiment === 'RABI') {
      // Rabi oscillations: sweep duration t from 0 to 80 ns
      const sweepPoints: Array<{ x: number; p1: number }> = [];
      const rabiOmega = amplitude * 50; // MHz effective Rabi frequency
      const delta = detuning; // MHz
      const effOmega = Math.sqrt(Math.pow(rabiOmega, 2) + Math.pow(delta, 2));

      for (let t = 0; t <= 80; t += 1.5) {
        // P(|1>) = (Omega^2 / effOmega^2) * sin^2(effOmega * t * 2*pi / (2 * 1000))
        const arg = (effOmega * 2 * Math.PI * (t / 1000)) / 2;
        const p1 = Math.pow(rabiOmega / effOmega, 2) * Math.pow(Math.sin(arg * 10), 2);
        sweepPoints.push({ x: t, p1: Math.min(1.0, Math.max(0, p1)) });
      }

      // Exact current pulse duration population
      const currArg = (effOmega * 2 * Math.PI * (duration / 1000)) / 2;
      const currentP1 = Math.pow(rabiOmega / effOmega, 2) * Math.pow(Math.sin(currArg * 10), 2);

      // Gate calibration verdict
      let calibratedGate = 'Arbitrary Rotation';
      if (Math.abs(currentP1 - 1.0) < 0.08) calibratedGate = 'Pauli-X (π-Pulse, Bit Flip)';
      else if (Math.abs(currentP1 - 0.5) < 0.08) calibratedGate = 'Hadamard-equivalent (π/2-Pulse)';

      return {
        sweepPoints,
        currentP1,
        calibratedGate,
        metricLabel: 'State |1⟩ Population P(|1⟩)',
        xLabel: 'Pulse Duration (ns)'
      };
    } else if (experiment === 'DRAG') {
      // DRAG leakage suppression: compare Gaussian vs DRAG leakage to |2>
      const leakageNoDrag = 0.045 * Math.pow(amplitude, 2) * (18 / Math.max(sigma, 4));
      const leakageWithDrag = leakageNoDrag * Math.max(0.005, Math.pow(1 - dragBeta * 1.8, 2));

      const sweepPoints: Array<{ x: number; p1: number }> = [];
      for (let b = 0; b <= 1.0; b += 0.05) {
        const lk = leakageNoDrag * Math.max(0.005, Math.pow(1 - b * 1.8, 2));
        sweepPoints.push({ x: b, p1: lk * 100 }); // percentage
      }

      return {
        sweepPoints,
        currentP1: (1 - leakageWithDrag),
        calibratedGate: leakageWithDrag < 0.003 ? 'High-Fidelity DRAG Gate (Leakage < 0.3%)' : 'Sub-Optimal DRAG Parameters',
        leakageRate: leakageWithDrag * 100,
        unmitigatedLeakage: leakageNoDrag * 100,
        metricLabel: 'Leakage Rate into |2⟩ (%)',
        xLabel: 'DRAG Coefficient (β)'
      };
    } else if (experiment === 'RAMSEY') {
      // Ramsey & Hahn Echo: coherence decay
      const sweepPoints: Array<{ x: number; p1: number }> = [];
      const t2Star = 25; // microseconds
      const t2Echo = 75; // microseconds

      for (let tau = 0; tau <= 100; tau += 2) {
        const decay = echoEnabled ? Math.exp(-tau / t2Echo) : Math.exp(-tau / t2Star);
        const osc = echoEnabled ? decay : decay * Math.cos(2 * Math.PI * 0.05 * tau);
        const p1 = 0.5 + 0.5 * osc;
        sweepPoints.push({ x: tau, p1 });
      }

      return {
        sweepPoints,
        currentP1: 0.85,
        calibratedGate: echoEnabled ? 'Hahn Echo π-Refocused Sequence' : 'Free Induction Decay (T₂*)',
        metricLabel: 'Coherence Amplitude |⟨Z⟩|',
        xLabel: 'Free Precession Delay τ (μs)'
      };
    } else {
      // Cross-Resonance CNOT mechanism
      const sweepPoints: Array<{ x: number; p1: number }> = [];
      for (let t = 0; t <= 60; t += 2) {
        const entangleAngle = (t / 40) * Math.PI;
        sweepPoints.push({ x: t, p1: Math.pow(Math.sin(entangleAngle / 2), 2) });
      }

      return {
        sweepPoints,
        currentP1: 0.98,
        calibratedGate: 'Cross-Resonance Entangling CNOT',
        metricLabel: 'Bell State Fidelity F(|Φ⁺⟩)',
        xLabel: 'CR Drive Duration (ns)'
      };
    }
  }, [experiment, amplitude, duration, detuning, sigma, dragBeta, echoEnabled]);

  // Deploy calibrated physical pulse as a gate into Composer
  const handleDeployToComposer = () => {
    if (!onLoadToComposer) return;
    playGateClickSound(850);

    const gates: GateOp[] = [];
    if (experiment === 'RABI') {
      if (physicsData.currentP1 >= 0.85) {
        gates.push({ type: 'X', qubit: 0, step: 0 });
      } else {
        gates.push({ type: 'H', qubit: 0, step: 0 });
      }
    } else if (experiment === 'RAMSEY') {
      gates.push({ type: 'H', qubit: 0, step: 0 });
      if (echoEnabled) {
        gates.push({ type: 'X', qubit: 0, step: 1 });
      }
      gates.push({ type: 'H', qubit: 0, step: 2 });
    } else if (experiment === 'CROSS_RESONANCE') {
      gates.push({ type: 'H', qubit: 0, step: 0 });
      gates.push({ type: 'CNOT', control: 0, target: 1, step: 1 });
    } else {
      gates.push({ type: 'Rx', qubit: 0, step: 0, theta: Math.PI });
    }

    onLoadToComposer(gates, experiment === 'CROSS_RESONANCE' ? 2 : 1);
    showToast('Calibrated Pulse Deployed', 'success', `Loaded ${physicsData.calibratedGate} into Circuit Composer!`);
  };

  const handleResetPulse = () => {
    playGateClickSound(400);
    setAmplitude(0.75);
    setDuration(36);
    setSigma(8);
    setDetuning(0);
    setDragBeta(0.4);
    showToast('Pulse Parameters Reset', 'info', 'AWG defaults restored.');
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#03070c] text-slate-200 font-mono p-4 lg:p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#09141d] border border-[rgba(0,229,255,0.25)] shadow-xl shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-500/20">
            <Radio className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Microwave Pulse Control &amp; Hamiltonian Studio
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                OpenPulse / Low-Level Physics
              </span>
            </div>
            <p className="text-xs text-[#78909c]">
              Arbitrary Waveform Generator (AWG) microwave envelope synthesis, DRAG leakage removal &amp; Hamiltonian calibration
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <div className="flex bg-[#050b11] p-1 rounded-xl border border-slate-800">
            {[
              { id: 'RABI', label: 'Rabi Drive' },
              { id: 'DRAG', label: 'DRAG Leakage' },
              { id: 'RAMSEY', label: 'Ramsey / Echo' },
              { id: 'CROSS_RESONANCE', label: 'CR CNOT' }
            ].map(exp => (
              <button
                key={exp.id}
                onClick={() => {
                  playGateClickSound(650);
                  setExperiment(exp.id as PulseExperiment);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  experiment === exp.id
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {exp.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleResetPulse}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Reset AWG pulse parameters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {onLoadToComposer && (
            <button
              onClick={handleDeployToComposer}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-cyan-500/20 transition-all"
              title="Deploy physical calibrated pulse into Circuit Composer as a quantum gate"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Deploy to Composer</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace: Microwave Envelope Canvas (Top) + Physics Response (Bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: AWG Waveform Envelope Synthesizer (7 Cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-[#09141d] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-white border-b border-slate-800 pb-2">
            <span className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              Microwave Drive Channel d₀ Envelope (I &amp; Q Quadratures)
            </span>
            <span className="text-[10px] text-cyan-400">
              Duration: {duration} ns · Amplitude: {amplitude.toFixed(2)} a.u.
            </span>
          </div>

          {/* SVG Waveform Display */}
          <div className="w-full h-56 bg-[#050b11] rounded-xl border border-slate-800 p-3 relative flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 -1.1 100 2.2" preserveAspectRatio="none">
              {/* Zero baseline */}
              <line x1="0" y1="0" x2="100" y2="0" stroke="rgba(255,255,255,0.15)" strokeWidth="0.02" strokeDasharray="1" />

              {/* In-Phase I(t) Curve (Cyan) */}
              <polyline
                fill="none"
                stroke="#00e5ff"
                strokeWidth="0.04"
                points={waveformSamples.map(pt => `${(pt.t / duration) * 100},${-pt.iVal}`).join(' ')}
              />

              {/* Quadrature Q(t) DRAG Curve (Purple/Rose) */}
              {(pulseShape === 'DRAG' || experiment === 'DRAG') && (
                <polyline
                  fill="none"
                  stroke="#c084fc"
                  strokeWidth="0.035"
                  strokeDasharray="0.8"
                  points={waveformSamples.map(pt => `${(pt.t / duration) * 100},${-pt.qVal}`).join(' ')}
                />
              )}
            </svg>

            {/* In-Chart Legend */}
            <div className="absolute top-3 right-3 bg-[#09141d]/90 border border-slate-800 p-2 rounded-lg text-[10px] space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 bg-[#00e5ff]" />
                <span className="text-slate-300">In-Phase I(t) [Real]</span>
              </div>
              {(pulseShape === 'DRAG' || experiment === 'DRAG') && (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-0.5 bg-[#c084fc]" />
                  <span className="text-purple-300">DRAG Q(t) [Quadrature]</span>
                </div>
              )}
            </div>
          </div>

          {/* Envelope Envelope Controls */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div className="space-y-1">
              <span className="text-slate-400 text-[10px]">Shape:</span>
              <select
                value={pulseShape}
                onChange={e => setPulseShape(e.target.value as PulseShape)}
                className="w-full bg-[#050b11] border border-slate-800 rounded p-1.5 text-xs text-white outline-none focus:border-cyan-500"
              >
                <option value="GAUSSIAN">Gaussian</option>
                <option value="DRAG">DRAG (Derivative)</option>
                <option value="FLAT_TOP">Flat-Top Gaussian</option>
                <option value="SQUARE">Square Rect</option>
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">Duration (t):</span>
                <span className="text-white font-bold">{duration} ns</span>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                step="2"
                value={duration}
                onChange={e => setDuration(+e.target.value)}
                className="w-full h-1 bg-slate-800 accent-cyan-400 rounded cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">Width (σ):</span>
                <span className="text-white font-bold">{sigma} ns</span>
              </div>
              <input
                type="range"
                min="2"
                max="20"
                step="1"
                value={sigma}
                onChange={e => setSigma(+e.target.value)}
                className="w-full h-1 bg-slate-800 accent-cyan-400 rounded cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">Amplitude (A):</span>
                <span className="text-white font-bold">{amplitude.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={amplitude}
                onChange={e => setAmplitude(+e.target.value)}
                className="w-full h-1 bg-slate-800 accent-cyan-400 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right: Hamiltonian Quantum Response & Calibration (5 Cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#09141d] border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-white border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Hamiltonian Response Curve
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">
                {physicsData.metricLabel}
              </span>
            </div>

            {/* Response Curve SVG */}
            <div className="w-full h-44 bg-[#050b11] rounded-xl border border-slate-800 p-3 mt-3 relative">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Horizontal reference lines */}
                <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" strokeDasharray="2" />
                <line x1="0" y1="0" x2="100" y2="0" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" strokeDasharray="2" />

                {/* Response polyline */}
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  points={physicsData.sweepPoints.map((pt, idx) => {
                    const xNorm = (idx / (physicsData.sweepPoints.length - 1)) * 100;
                    const yNorm = 100 - pt.p1 * 100;
                    return `${xNorm},${yNorm}`;
                  }).join(' ')}
                />
              </svg>

              <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                <span>0</span>
                <span>{physicsData.xLabel}</span>
                <span>Max</span>
              </div>
            </div>
          </div>

          {/* Calibrated Gate Output Box */}
          <div className="p-3.5 rounded-xl bg-[#050b11] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Synthesized Physical Gate:</span>
              <span className="text-emerald-400 font-bold text-xs">
                {physicsData.calibratedGate}
              </span>
            </div>

            {experiment === 'DRAG' && (
              <div className="text-[11px] text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Unmitigated |2⟩ Leakage:</span>
                  <span className="text-rose-400 font-bold">{physicsData.unmitigatedLeakage?.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">With DRAG Correction:</span>
                  <span className="text-emerald-400 font-bold">{physicsData.leakageRate?.toFixed(2)}%</span>
                </div>
              </div>
            )}

            {experiment === 'RAMSEY' && (
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">Hahn Echo π-Pulse Refocusing:</span>
                <button
                  onClick={() => setEchoEnabled(!echoEnabled)}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-bold border transition-colors cursor-pointer ${
                    echoEnabled ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50' : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {echoEnabled ? 'Enabled (T₂ Echo)' : 'Free Induction (T₂*)'}
                </button>
              </div>
            )}
          </div>

          {/* Physics Theoretical Formula Note */}
          <div className="p-3 rounded-lg bg-[#050b11] border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">Hamiltonian Drive Dynamics: </span>
              H(t) = (ω₀₁ / 2) σ_z + Ω(t) cos(ω_d t + φ) σ_x. The pulse area ∫ Ω(t) dt governs the rotation angle θ on the Bloch sphere.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

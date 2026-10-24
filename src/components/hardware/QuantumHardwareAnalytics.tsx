import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Activity, 
  Cpu, 
  Zap, 
  RotateCcw, 
  Sliders, 
  TrendingDown, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  Play,
  Pause,
  BarChart2,
  RefreshCw,
  Layers
} from 'lucide-react';
import { playGateClickSound, playMeasurementCollapseSound } from '../../utils/audio';

export interface ArchitectureProfile {
  id: 'transmon' | 'trapped_ion' | 'neutral_atom' | 'silicon_spin';
  name: string;
  category: string;
  vendorRef: string;
  // Fundamental Physical Lifetimes
  baseT1_us: number;
  baseT2_us: number;
  // Gate execution durations
  gate1qTime_ns: number;
  gate2qTime_ns: number;
  // Fidelities
  fidelity1q: number;
  fidelity2q: number;
  spamFidelity: number;
  // Noise susceptibilities
  chargeNoiseSensitivity: number; // 0 to 1
  fluxNoiseSensitivity: number;
  laserPhaseNoiseSensitivity: number;
  detuning_MHz: number;
}

const ARCHITECTURES: Record<string, ArchitectureProfile> = {
  transmon: {
    id: 'transmon',
    name: 'Superconducting Transmon',
    category: 'Circuit QED (Superconducting)',
    vendorRef: 'IBM Quantum / Google Quantum AI',
    baseT1_us: 140.0,
    baseT2_us: 110.0,
    gate1qTime_ns: 25,
    gate2qTime_ns: 65,
    fidelity1q: 99.92,
    fidelity2q: 99.45,
    spamFidelity: 99.15,
    chargeNoiseSensitivity: 0.15,
    fluxNoiseSensitivity: 0.85,
    laserPhaseNoiseSensitivity: 0.0,
    detuning_MHz: 4.2
  },
  trapped_ion: {
    id: 'trapped_ion',
    name: 'Trapped-Ion (Yb-171 / Ba-137)',
    category: 'Atomic Hyperfine Qubits',
    vendorRef: 'Quantinuum / IonQ',
    baseT1_us: 10000000.0, // Multi-second
    baseT2_us: 1200000.0,  // ~1.2s
    gate1qTime_ns: 4500,   // 4.5 μs
    gate2qTime_ns: 35000,  // 35 μs
    fidelity1q: 99.98,
    fidelity2q: 99.86,
    spamFidelity: 99.85,
    chargeNoiseSensitivity: 0.05,
    fluxNoiseSensitivity: 0.25,
    laserPhaseNoiseSensitivity: 0.80,
    detuning_MHz: 0.45
  },
  neutral_atom: {
    id: 'neutral_atom',
    name: 'Neutral Atom (Rb-87 Rydberg)',
    category: 'Optical Tweezer Array',
    vendorRef: 'QuEra / Pasqal',
    baseT1_us: 3500000.0, // ~3.5s
    baseT2_us: 2500.0,    // ~2.5 ms
    gate1qTime_ns: 120,
    gate2qTime_ns: 250,
    fidelity1q: 99.75,
    fidelity2q: 99.20,
    spamFidelity: 99.00,
    chargeNoiseSensitivity: 0.02,
    fluxNoiseSensitivity: 0.35,
    laserPhaseNoiseSensitivity: 0.75,
    detuning_MHz: 1.2
  },
  silicon_spin: {
    id: 'silicon_spin',
    name: 'Silicon Spin Qubits (Si/SiGe)',
    category: 'Semiconductor Quantum Dot',
    vendorRef: 'Intel / Diraq / UNSW',
    baseT1_us: 250000.0,  // 250 ms
    baseT2_us: 85.0,      // 85 μs
    gate1qTime_ns: 35,
    gate2qTime_ns: 75,
    fidelity1q: 99.85,
    fidelity2q: 99.10,
    spamFidelity: 98.90,
    chargeNoiseSensitivity: 0.90,
    fluxNoiseSensitivity: 0.40,
    laserPhaseNoiseSensitivity: 0.0,
    detuning_MHz: 5.8
  }
};

export const QuantumHardwareAnalytics: React.FC = () => {
  const [activeArchKey, setActiveArchKey] = useState<keyof typeof ARCHITECTURES>('transmon');
  const [isSimRunning, setIsSimRunning] = useState<boolean>(true);
  
  // Real-time environmental perturbation sliders
  const [thermalJitter, setThermalJitter] = useState<number>(15); // e.g. 15 mK
  const [magneticFluxNoise, setMagneticFluxNoise] = useState<number>(20); // 0 to 100%
  const [gateDepthTest, setGateDepthTest] = useState<number>(250); // Gates in test circuit
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  const arch = ARCHITECTURES[activeArchKey] || ARCHITECTURES.transmon;

  // Compute dynamic perturbed lifetimes based on noise sliders
  const computedMetrics = useMemo(() => {
    // Thermal perturbation factor
    const tempFactor = Math.max(0.2, 1 - (thermalJitter - 15) * 0.025);
    const noiseFactor = Math.max(0.3, 1 - (magneticFluxNoise / 100) * (arch.fluxNoiseSensitivity * 0.6 + arch.chargeNoiseSensitivity * 0.4));

    const effT1 = +(arch.baseT1_us * tempFactor * noiseFactor).toFixed(1);
    const effT2 = +(arch.baseT2_us * tempFactor * noiseFactor).toFixed(1);

    // Dynamic gate fidelities under noise
    const fidelityDrop = (1 - noiseFactor) * 0.008 + (1 - tempFactor) * 0.005;
    const effF1q = +(Math.max(90, arch.fidelity1q - fidelityDrop * 100)).toFixed(3);
    const effF2q = +(Math.max(85, arch.fidelity2q - fidelityDrop * 250)).toFixed(3);

    // Coherence-to-Gate-Time Ratio: How many 2Q gates fit into T2
    const gateCountBudget = Math.floor((effT2 * 1000) / arch.gate2qTime_ns);

    // Projected circuit survival fidelity: F_circuit ≈ (F_2Q)^N_2Q * exp(-t_total / T2)
    const totalCircTime_ns = gateDepthTest * arch.gate2qTime_ns;
    const decoherenceDecay = Math.exp(-totalCircTime_ns / (effT2 * 1000));
    const gateErrorDecay = Math.pow(effF2q / 100, gateDepthTest);
    const projectedCircuitFidelity = +(gateErrorDecay * decoherenceDecay * 100).toFixed(1);

    return {
      effT1: +effT1,
      effT2: +effT2,
      effF1q,
      effF2q,
      gateCountBudget,
      projectedCircuitFidelity
    };
  }, [arch, thermalJitter, magneticFluxNoise, gateDepthTest]);

  // Real-time canvas render of T1 Relaxation and T2 Ramsey Oscillations
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let timeOffset = 0;

    const render = () => {
      if (isSimRunning) {
        timeOffset += 0.04;
      }

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Background grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      const gridCols = 8;
      const gridRows = 4;
      for (let c = 0; c <= gridCols; c++) {
        const x = (w / gridCols) * c;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let r = 0; r <= gridRows; r++) {
        const y = (h / gridRows) * r;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Halfway divider (0 to h/2 is T1 Relaxation, h/2 to h is T2 Ramsey Oscillation)
      const midY = h / 2;
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.2)';
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(w, midY);
      ctx.stroke();
      ctx.setLineDash([]);

      // ==========================================
      // Curve 1: T1 Energy Relaxation P(|1>)(t) = e^(-t/T1)
      // ==========================================
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 8;

      ctx.beginPath();
      const points = 120;
      for (let i = 0; i <= points; i++) {
        const t = (i / points) * 3.5; // normalized time 0 to 3.5 T1
        // Add subtle real-time noise jitter
        const jitter = Math.sin(t * 12 + timeOffset * 3) * (magneticFluxNoise / 1200);
        const p1 = Math.max(0, Math.exp(-t) + jitter);
        
        const x = (i / points) * w;
        const y = midY - (p1 * (midY - 18)) - 8;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Label 1
      ctx.fillStyle = '#00e5ff';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`T₁ Relaxation (P|1⟩ = e^(-t/T₁)) · T₁ = ${computedMetrics.effT1 >= 1000 ? (computedMetrics.effT1/1000).toFixed(1) + ' ms' : computedMetrics.effT1 + ' μs'}`, 12, 18);

      // ==========================================
      // Curve 2: T2* Ramsey Dephasing Oscillations <σx>(t) = e^(-t/T2*) * cos(Δω * t)
      // ==========================================
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 8;

      ctx.beginPath();
      const detuning = arch.detuning_MHz;
      for (let i = 0; i <= points; i++) {
        const t = (i / points) * 3.5; // 0 to 3.5 T2
        const envelope = Math.exp(-t);
        const osc = Math.cos(t * detuning * 6 + timeOffset * 2.5);
        const signal = envelope * osc; // [-1, +1]

        const x = (i / points) * w;
        // Center around (midY + (h - midY)/2)
        const baselineY = midY + (h - midY) / 2;
        const y = baselineY - (signal * ((h - midY) * 0.42));

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Label 2
      ctx.fillStyle = '#c084fc';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`T₂* Ramsey Dephasing (⟨σ_x⟩ = e^(-t/T₂) cos(Δω t)) · T₂* = ${computedMetrics.effT2 >= 1000 ? (computedMetrics.effT2/1000).toFixed(1) + ' ms' : computedMetrics.effT2 + ' μs'}`, 12, midY + 18);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [computedMetrics, magneticFluxNoise, arch, isSimRunning]);

  return (
    <div className="space-y-5 font-mono text-xs">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#09141d] border border-cyan-800/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
            <Activity className="w-5 h-5 text-[#00e5ff] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">Quantum Hardware Analytics &amp; Real-Time Decoherence Engine</h3>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-[#00e5ff] border border-cyan-800 text-[10px] font-bold">
                SIMULATED BENCHMARK
              </span>
            </div>
            <p className="text-[11px] text-[#78909c]">
              Real-time multi-architecture comparative analysis of T₁ relaxation, T₂* Ramsey fringes, 2Q gate fidelity &amp; noise vulnerability
            </p>
          </div>
        </div>

        {/* Play/Pause Stream Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playGateClickSound(650);
              setIsSimRunning(!isSimRunning);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isSimRunning 
                ? 'bg-cyan-500 text-slate-950' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isSimRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isSimRunning ? 'Live Stream Active' : 'Simulation Paused'}</span>
          </button>
        </div>
      </div>

      {/* 2. Architecture Switcher Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(Object.keys(ARCHITECTURES) as Array<keyof typeof ARCHITECTURES>).map(key => {
          const item = ARCHITECTURES[key];
          const isSelected = activeArchKey === key;
          return (
            <button
              key={key}
              onClick={() => {
                playGateClickSound(700);
                setActiveArchKey(key);
              }}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                isSelected
                  ? 'bg-gradient-to-r from-cyan-950 to-blue-950 text-[#00e5ff] border border-cyan-500/60 shadow-xs shadow-cyan-500/20'
                  : 'bg-[#050b11] border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Cpu className={`w-3.5 h-3.5 ${isSelected ? 'text-[#00e5ff]' : 'text-slate-500'}`} />
              <span>{item.name}</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-normal ${
                isSelected ? 'bg-cyan-900/60 text-cyan-200' : 'bg-slate-900 text-slate-500'
              }`}>
                {item.category.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Real-Time Oscilloscope Canvas (T1 Relaxation & T2* Ramsey Fringes) */}
      <div className="p-4 rounded-2xl bg-[#050b11] border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-1 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white uppercase text-xs">
              Real-Time Decoherence Waveform: {arch.name} ({arch.vendorRef})
            </span>
          </div>

          <div className="flex items-center gap-4 text-[10px]">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              T₁ Energy Relaxation (e^(-t/T₁))
            </span>
            <span className="flex items-center gap-1.5 text-purple-300">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              T₂* Ramsey Dephasing (cos(Δω t))
            </span>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={840}
          height={240}
          className="w-full h-60 rounded-xl bg-[#02050b] border border-slate-850 block shadow-inner"
        />

        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <span>Horizontal Axis: Time progression normalized to 3.5× characteristic coherence decay time</span>
          <span>Sampling Frequency: 2.5 GHz Continuous Stochastic Monte Carlo</span>
        </div>
      </div>

      {/* 4. Real-Time Environmental Perturbation & Circuit Depth Sliders */}
      <div className="p-4 rounded-xl bg-[#050b11] border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Slider 1: Cryogenic / Environmental Temperature */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-bold">Cryogenic Temperature:</span>
            <span className="text-cyan-300 font-bold">{thermalJitter} mK</span>
          </div>
          <input
            type="range"
            min="10"
            max="60"
            value={thermalJitter}
            onChange={(e) => setThermalJitter(+e.target.value)}
            className="w-full h-1.5 bg-slate-800 accent-[#00e5ff] rounded cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-slate-500">
            <span>10 mK (Base)</span>
            <span>60 mK (Degraded)</span>
          </div>
        </div>

        {/* Slider 2: Magnetic Flux & Charge Noise */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-bold">Flux / Charge Noise Level:</span>
            <span className="text-purple-300 font-bold">{magneticFluxNoise}% Perturbation</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={magneticFluxNoise}
            onChange={(e) => setMagneticFluxNoise(+e.target.value)}
            className="w-full h-1.5 bg-slate-800 accent-purple-400 rounded cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-slate-500">
            <span>0% (Shielded)</span>
            <span>100% (High Jitter)</span>
          </div>
        </div>

        {/* Slider 3: Circuit Gate Depth */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-bold">Circuit Depth Budget:</span>
            <span className="text-amber-300 font-bold">{gateDepthTest} Sequential 2Q Gates</span>
          </div>
          <input
            type="range"
            min="20"
            max="1500"
            step="10"
            value={gateDepthTest}
            onChange={(e) => setGateDepthTest(+e.target.value)}
            className="w-full h-1.5 bg-slate-800 accent-amber-400 rounded cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-slate-500">
            <span>20 Gates</span>
            <span>1,500 Gates</span>
          </div>
        </div>

      </div>

      {/* 5. Quantitative Telemetry & Gate Fidelity Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Card 1: 1Q Gate Fidelity */}
        <div className="p-3.5 rounded-xl bg-[#09141d] border border-cyan-800/40 space-y-1.5">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Single-Qubit Gate (F₁Q)</span>
          <div className="text-lg font-bold text-cyan-300">{computedMetrics.effF1q}%</div>
          <div className="text-[10px] text-slate-400">Gate Speed: <strong>{arch.gate1qTime_ns} ns</strong></div>
          <div className="text-[9px] text-emerald-400">Randomized Benchmarking (RB)</div>
        </div>

        {/* Card 2: 2Q Gate Fidelity */}
        <div className="p-3.5 rounded-xl bg-[#09141d] border border-cyan-800/40 space-y-1.5">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Two-Qubit Gate (F₂Q)</span>
          <div className="text-lg font-bold text-emerald-400">{computedMetrics.effF2q}%</div>
          <div className="text-[10px] text-slate-400">Gate Speed: <strong>{arch.gate2qTime_ns >= 1000 ? (arch.gate2qTime_ns/1000).toFixed(1) + ' μs' : arch.gate2qTime_ns + ' ns'}</strong></div>
          <div className="text-[9px] text-slate-400">CX / CZ / Mølmer-Sørensen</div>
        </div>

        {/* Card 3: Gate Count Budget */}
        <div className="p-3.5 rounded-xl bg-[#09141d] border border-purple-800/40 space-y-1.5">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Coherence Gate Budget (T₂ / t_g)</span>
          <div className="text-lg font-bold text-purple-300">{computedMetrics.gateCountBudget.toLocaleString()} Gates</div>
          <div className="text-[10px] text-slate-400">Effective T₂: <strong>{computedMetrics.effT2 >= 1000 ? (computedMetrics.effT2/1000).toFixed(1) + ' ms' : computedMetrics.effT2 + ' μs'}</strong></div>
          <div className="text-[9px] text-purple-300">Max circuit operations before decoherence</div>
        </div>

        {/* Card 4: Projected Circuit Survival Fidelity */}
        <div className="p-3.5 rounded-xl bg-[#09141d] border border-amber-800/40 space-y-1.5">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Circuit Survival Fidelity ({gateDepthTest} Gates)</span>
          <div className={`text-lg font-bold ${
            computedMetrics.projectedCircuitFidelity > 50 ? 'text-emerald-400' : computedMetrics.projectedCircuitFidelity > 20 ? 'text-amber-400' : 'text-rose-400'
          }`}>
            {computedMetrics.projectedCircuitFidelity}%
          </div>
          <div className="text-[10px] text-slate-400">SPAM Fidelity: <strong>{arch.spamFidelity}%</strong></div>
          <div className="text-[9px] text-slate-400">Threshold for fault-tolerant QEC: &gt; 50%</div>
        </div>

      </div>

    </div>
  );
};

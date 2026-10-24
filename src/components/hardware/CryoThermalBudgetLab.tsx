import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Flame, 
  Layers, 
  Rotate3d, 
  Sparkles, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  Info
} from 'lucide-react';
import { playGateClickSound } from '../../utils/audio';

export const CryoThermalBudgetLab: React.FC = () => {
  const [numCoaxLines, setNumCoaxLines] = useState<number>(48);
  const [readoutLines, setReadoutLines] = useState<number>(16);
  const [cryoType, setCryoType] = useState<'pulse_tube' | 'high_capacity'>('pulse_tube');

  // Multi-stage thermodynamic calculations
  const stageMetrics = useMemo(() => {
    // Dissipation per RF line across thermal stages
    // 50K stage: Stainless steel / CuNi outer conduction
    const q50K_mW = (numCoaxLines * 45) + (readoutLines * 50);
    const cap50K_W = cryoType === 'high_capacity' ? 40 : 25;

    // 4K stage: Pulse tube 2nd stage + HEMT LNA power (~8 mW per HEMT)
    const q4K_mW = (numCoaxLines * 4.2) + (readoutLines * 12.5); // HEMT bias
    const cap4K_W = cryoType === 'high_capacity' ? 2.5 : 1.5;

    // Still stage (0.8 K): He3/He4 distillation
    const qStill_mW = (numCoaxLines * 0.18) + (readoutLines * 0.25);
    const capStill_mW = cryoType === 'high_capacity' ? 60 : 35;

    // Cold plate (100 mK):
    const q100mK_uW = (numCoaxLines * 4.5) + (readoutLines * 6.0);
    const cap100mK_uW = cryoType === 'high_capacity' ? 250 : 150;

    // Mixing chamber (15 mK MXC): Sub-Kelvin floor (crucial limit!)
    // Passive conduction through NbTi/SS coax + RF 20 dB attenuator dissipation
    const qMXC_uW = +( (numCoaxLines * 0.12) + (readoutLines * 0.18) ).toFixed(2);
    const capMXC_uW = cryoType === 'high_capacity' ? 30 : 18;

    const mxcLoadPercent = Math.min(100, Math.round((+qMXC_uW / capMXC_uW) * 100));

    return {
      q50K: (q50K_mW / 1000).toFixed(2),
      cap50K: cap50K_W,
      q4K: (q4K_mW / 1000).toFixed(3),
      cap4K: cap4K_W,
      qStill: qStill_mW.toFixed(1),
      capStill: capStill_mW,
      q100mK: q100mK_uW.toFixed(1),
      cap100mK: cap100mK_uW,
      qMXC: qMXC_uW,
      capMXC: capMXC_uW,
      mxcLoadPercent
    };
  }, [numCoaxLines, readoutLines, cryoType]);

  const isThermalRunaway = stageMetrics.mxcLoadPercent >= 90;

  return (
    <div className="space-y-5 font-mono text-xs">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#09141d] border border-cyan-800/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
            <Flame className="w-5 h-5 text-[#00e5ff]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">Dilution Refrigerator Multi-Stage Thermal Budget Engineering</h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                isThermalRunaway ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-emerald-950 text-emerald-300 border-emerald-800'
              }`}>
                {isThermalRunaway ? 'THERMAL RUNAWAY RISK' : 'THERMALLY BALANCED'}
              </span>
            </div>
            <p className="text-[11px] text-[#78909c]">
              Calculates passive conduction, RF attenuation heat-loads, and sub-Kelvin cooling power across 50K, 4K, Still, and 15mK stages
            </p>
          </div>
        </div>

        {/* Cryostat Selector */}
        <div className="flex items-center gap-2 bg-[#050b11] p-1.5 rounded-xl border border-slate-800">
          <span className="text-slate-500 text-[10px] uppercase font-bold pl-1">Cryostat Size:</span>
          <button
            onClick={() => { playGateClickSound(650); setCryoType('pulse_tube'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              cryoType === 'pulse_tube' ? 'bg-[#00e5ff] text-[#02060a]' : 'text-slate-400 hover:text-white'
            }`}
          >
            Standard Laboratory (18 μW @ 15mK)
          </button>
          <button
            onClick={() => { playGateClickSound(650); setCryoType('high_capacity'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              cryoType === 'high_capacity' ? 'bg-[#00e5ff] text-[#02060a]' : 'text-slate-400 hover:text-white'
            }`}
          >
            Industrial Foundry (30 μW @ 15mK)
          </button>
        </div>
      </div>

      {/* 2. Coaxial Cabling & Drive Line Sliders */}
      <div className="p-4 rounded-xl bg-[#050b11] border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-bold">Microwave XY Drive Lines (NbTi / CuNi):</span>
            <span className="text-cyan-300 font-bold text-sm">{numCoaxLines} Lines</span>
          </div>
          <input
            type="range"
            min="12"
            max="256"
            step="4"
            value={numCoaxLines}
            onChange={(e) => setNumCoaxLines(+e.target.value)}
            className="w-full h-1.5 bg-slate-800 accent-[#00e5ff] rounded cursor-pointer"
          />
          <span className="text-[10px] text-slate-500">Each drive line requires -20 dB cold attenuator at 15 mK and -10 dB at Still</span>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-bold">Readout Lines with Cryo-HEMT Amplifiers:</span>
            <span className="text-purple-300 font-bold text-sm">{readoutLines} Output Chains</span>
          </div>
          <input
            type="range"
            min="4"
            max="64"
            step="2"
            value={readoutLines}
            onChange={(e) => setReadoutLines(+e.target.value)}
            className="w-full h-1.5 bg-slate-800 accent-purple-400 rounded cursor-pointer"
          />
          <span className="text-[10px] text-slate-500">Each HEMT amplifier dissipates ~8 mW at the 4 K pulse tube stage</span>
        </div>
      </div>

      {/* 3. Five-Stage Thermal Isotherm Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        
        {/* 50K Stage */}
        <div className="p-3.5 rounded-xl bg-[#050b11] border border-slate-800 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-bold text-[10px] uppercase">Stage 1</span>
            <span className="text-cyan-300 font-bold">50 Kelvin</span>
          </div>
          <div className="text-white font-bold text-sm">{stageMetrics.q50K} W Load</div>
          <div className="text-[10px] text-slate-400">Capacity: {stageMetrics.cap50K} W</div>
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
            <div className="bg-cyan-500 h-full" style={{ width: `${Math.min(100, (+stageMetrics.q50K / stageMetrics.cap50K) * 100)}%` }} />
          </div>
          <span className="text-[9px] text-slate-500 block">Outer Radiation Shield</span>
        </div>

        {/* 4K Stage */}
        <div className="p-3.5 rounded-xl bg-[#050b11] border border-slate-800 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-bold text-[10px] uppercase">Stage 2</span>
            <span className="text-cyan-300 font-bold">4.2 Kelvin</span>
          </div>
          <div className="text-white font-bold text-sm">{stageMetrics.q4K} W Load</div>
          <div className="text-[10px] text-slate-400">Capacity: {stageMetrics.cap4K} W</div>
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
            <div className="bg-cyan-500 h-full" style={{ width: `${Math.min(100, (+stageMetrics.q4K / stageMetrics.cap4K) * 100)}%` }} />
          </div>
          <span className="text-[9px] text-slate-500 block">HEMT Low-Noise Amplifiers</span>
        </div>

        {/* Still Stage */}
        <div className="p-3.5 rounded-xl bg-[#050b11] border border-slate-800 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-bold text-[10px] uppercase">Stage 3</span>
            <span className="text-purple-300 font-bold">0.8 Kelvin</span>
          </div>
          <div className="text-white font-bold text-sm">{stageMetrics.qStill} mW Load</div>
          <div className="text-[10px] text-slate-400">Capacity: {stageMetrics.capStill} mW</div>
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full" style={{ width: `${Math.min(100, (+stageMetrics.qStill / stageMetrics.capStill) * 100)}%` }} />
          </div>
          <span className="text-[9px] text-slate-500 block">³He/⁴He Isotope Separation</span>
        </div>

        {/* Cold Plate */}
        <div className="p-3.5 rounded-xl bg-[#050b11] border border-slate-800 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-bold text-[10px] uppercase">Stage 4</span>
            <span className="text-purple-300 font-bold">100 mKelvin</span>
          </div>
          <div className="text-white font-bold text-sm">{stageMetrics.q100mK} μW Load</div>
          <div className="text-[10px] text-slate-400">Capacity: {stageMetrics.cap100mK} μW</div>
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full" style={{ width: `${Math.min(100, (+stageMetrics.q100mK / stageMetrics.cap100mK) * 100)}%` }} />
          </div>
          <span className="text-[9px] text-slate-500 block">Intermediate Thermalization</span>
        </div>

        {/* Mixing Chamber (MXC) */}
        <div className={`p-3.5 rounded-xl border space-y-2 ${
          isThermalRunaway ? 'bg-rose-950/40 border-rose-500 shadow-md shadow-rose-500/20' : 'bg-[#09141d] border-cyan-800/60'
        }`}>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-bold text-[10px] uppercase">Stage 5 (MXC)</span>
            <span className="text-cyan-300 font-bold">15 mKelvin</span>
          </div>
          <div className="text-white font-bold text-sm">{stageMetrics.qMXC} μW Load</div>
          <div className="text-[10px] text-slate-400">Budget: {stageMetrics.capMXC} μW</div>
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
            <div 
              className={`h-full ${isThermalRunaway ? 'bg-rose-500' : 'bg-gradient-to-r from-cyan-500 to-emerald-400'}`} 
              style={{ width: `${stageMetrics.mxcLoadPercent}%` }} 
            />
          </div>
          <span className={`text-[9px] font-bold block ${isThermalRunaway ? 'text-rose-400' : 'text-emerald-400'}`}>
            {stageMetrics.mxcLoadPercent}% MXC Capacity Used
          </span>
        </div>

      </div>

      {/* 4. Industrial Cryocooler Engineering Guide */}
      <div className="p-4 rounded-xl bg-[#050b11] border border-slate-800 text-[11px] text-slate-400 leading-relaxed space-y-1">
        <span className="text-white font-bold block">Dilution Refrigerator Scaling Law (Enzmann-Pobell Equation):</span>
        <p>
          Cooling power at the mixing chamber scales quadratically with temperature: Q&#775;_mxc = 84 n&#775;_3 T_mxc&#178;. To scale from 100 to 1,000+ superconducting transmons without thermal runaway, cryogenic engineers use high-impedance NbTi superconducting coax cables, IR absorption Eccosorb filters, and integrated cryo-CMOS controller ASICs operating at 4 Kelvin.
        </p>
      </div>

    </div>
  );
};

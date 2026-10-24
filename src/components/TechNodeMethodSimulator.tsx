import React, { useState, useMemo } from 'react';
import { 
  Cpu, 
  Zap, 
  Activity, 
  Sliders, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw,
  Layers,
  Thermometer,
  ShieldCheck,
  Binary,
  ArrowRight
} from 'lucide-react';
import { playGateClickSound } from '../utils/audio';
import { TechNode } from './QuantumTechnologyMap3D';

interface TechNodeMethodSimulatorProps {
  node: TechNode;
}

export const TechNodeMethodSimulator: React.FC<TechNodeMethodSimulatorProps> = ({ node }) => {
  // Photonic state
  const [squeezeR, setSqueezeR] = useState<number>(1.2); // Squeezing parameter r (0.1 to 2.5)
  const [lossDb, setLossDb] = useState<number>(0.12); // Optical loss in dB/cm
  const [waveguideLen, setWaveguideLen] = useState<number>(5.0); // cm

  // Transmon state
  const [transmonEj, setTransmonEj] = useState<number>(16.5); // GHz
  const [transmonEc, setTransmonEc] = useState<number>(0.28); // GHz (280 MHz)
  const [transmonTemp, setTransmonTemp] = useState<number>(15); // mK

  // Trapped Ion state
  const [ionRabi, setIonRabi] = useState<number>(180); // kHz
  const [ionDetuning, setIonDetuning] = useState<number>(45); // kHz
  const [ionPhonons, setIonPhonons] = useState<number>(0.05); // thermal phonon quanta

  // Neutral Atom state
  const [atomN, setAtomN] = useState<number>(70); // principal quantum number
  const [atomDistance, setAtomDistance] = useState<number>(4.2); // um
  const [atomOmega, setAtomOmega] = useState<number>(4.5); // MHz

  // QEC / Surface code state
  const [qecDist, setQecDist] = useState<number>(5); // distance d
  const [qecPhysError, setQecPhysError] = useState<number>(0.0015); // 0.15%

  // Dilution fridge state
  const [fridgeFlowRate, setFridgeFlowRate] = useState<number>(450); // umol/s He-3
  const [fridgeTemp, setFridgeTemp] = useState<number>(15); // mK

  // Cryo-CMOS state
  const [cmosChannels, setCmosChannels] = useState<number>(512); // Qubit channels multiplexed
  const [cmosPowerPerChan, setCmosPowerPerChan] = useState<number>(45); // uW/channel

  // Calculations for active method
  const simResults = useMemo(() => {
    switch (node.id) {
      case 'photonic': {
        const totalLossDb = lossDb * waveguideLen;
        const transmission = Math.pow(10, -totalLossDb / 10);
        // Squeezing variance: V = e^(-2r) * transmission + (1 - transmission)
        const squeezedVariance = Math.exp(-2 * squeezeR) * transmission + (1 - transmission);
        const squeezingDb = -(10 * Math.log10(squeezedVariance)).toFixed(2);
        const homVisibility = ((transmission / (2 - transmission)) * 100).toFixed(1);
        const meanPhotons = (Math.pow(Math.sinh(squeezeR), 2) * transmission).toFixed(2);
        return {
          metric1: { label: 'Quadrature Squeezing', val: `${squeezingDb} dB`, note: 'Below vacuum shot noise' },
          metric2: { label: 'HOM Two-Photon Interference', val: `${homVisibility}%`, note: 'Quantum indistinguishability' },
          metric3: { label: 'Mean Squeezed Photons', val: `${meanPhotons} ⟨n⟩`, note: 'Per pulsed mode' },
          status: +squeezingDb >= 10 ? 'FAULT-TOLERANT GKP REGIME' : 'NEAR-THRESHOLD REGIME'
        };
      }
      case 'superconducting': {
        const ratio = (transmonEj / transmonEc).toFixed(1);
        const w01 = (Math.sqrt(8 * transmonEj * transmonEc) - transmonEc).toFixed(2);
        const alpha = (-transmonEc * 1000).toFixed(0); // MHz
        // Charge dispersion: epsilon_m ~ 2^4 * sqrt(2/pi) * (E_J/2E_C)^(3/4) * exp(-sqrt(8E_J/E_C))
        const sqrt8 = Math.sqrt(8 * (transmonEj / transmonEc));
        const chargeDispersionKhz = (transmonEc * 1e6 * 16 * Math.sqrt(2 / Math.PI) * Math.pow(transmonEj / (2 * transmonEc), 0.75) * Math.exp(-sqrt8)).toFixed(3);
        const kbT_GHz = (1.380649e-23 * (transmonTemp * 1e-3)) / 6.62607e-25;
        const thermalPop = (1 / (Math.exp((+w01 * 1e9 * 6.626e-34) / (1.38e-23 * transmonTemp * 1e-3)) - 1)).toExponential(2);
        return {
          metric1: { label: 'Transition Frequency (ω₀₁)', val: `${w01} GHz`, note: 'Microwave regime' },
          metric2: { label: 'Anharmonicity (α)', val: `${alpha} MHz`, note: 'Isolates computational subspace' },
          metric3: { label: 'Charge Noise Dispersion (ε₀)', val: `${chargeDispersionKhz} kHz`, note: 'Exponentially suppressed' },
          status: +ratio >= 50 ? 'OPTIMAL TRANSMON REGIME (E_J/E_C >> 1)' : 'SUB-OPTIMAL CHARGE NOISE SENSITIVITY'
        };
      }
      case 'trapped_ion': {
        const gateDurationUs = ((2 * Math.PI) / (ionDetuning * 1e3) * 1e6).toFixed(1);
        const motionalFidelity = Math.max(90, 100 - ionPhonons * 15 - Math.abs(ionRabi - ionDetuning * 3) * 0.01).toFixed(3);
        const couplingStrength = (ionRabi / (2 * ionDetuning)).toFixed(2);
        return {
          metric1: { label: 'Mølmer-Sørensen 2Q Gate Time', val: `${gateDurationUs} μs`, note: 'Phonon bus loop closure' },
          metric2: { label: 'Entangling Gate Fidelity', val: `${motionalFidelity}%`, note: 'State-of-the-art benchmark' },
          metric3: { label: 'Effective Spin-Phonon Coupling', val: `${couplingStrength} ηΩ`, note: 'Geometric phase area' },
          status: +motionalFidelity >= 99.8 ? 'FTQC FAULT-TOLERANT MARGIN' : 'NISQ OPERATIONAL MARGIN'
        };
      }
      case 'neutral_atom': {
        // C6 ~ n^11 scaling normalized around n=70 (C6 ~ 800 GHz um^6)
        const c6Normalized = 800 * Math.pow(atomN / 70, 11);
        // Rb = (C6 / hbar*Omega)^(1/6)
        const blockadeRadiusUm = Math.pow(c6Normalized / atomOmega, 1 / 6).toFixed(2);
        const ratio = atomDistance / +blockadeRadiusUm;
        const blockadeRatio = Math.pow(+blockadeRadiusUm / atomDistance, 6).toFixed(1);
        const czFidelity = (ratio <= 0.85 ? Math.max(90, 100 - Math.pow(ratio, 6) * 8) : Math.max(50, 99 - (ratio - 0.85) * 120)).toFixed(2);
        return {
          metric1: { label: 'Rydberg Blockade Radius (R_b)', val: `${blockadeRadiusUm} μm`, note: 'Conditional excitation zone' },
          metric2: { label: 'Blockade Strength (V_vdW / ℏΩ)', val: `${blockadeRatio}×`, note: 'Multi-qubit suppression' },
          metric3: { label: 'Projected 2Q CZ Gate Fidelity', val: `${czFidelity}%`, note: 'At R = ' + atomDistance + ' μm' },
          status: ratio < 0.85 ? 'STRONG BLOCKADE (HIGH-FIDELITY CZ)' : 'INSUFFICIENT BLOCKADE SEPARATION'
        };
      }
      case 'dilution_fridge': {
        // Q_dot = 84 * n_dot * T^2 [Watts] -> n_dot in mol/s
        const nDotMol = fridgeFlowRate * 1e-6;
        const tKelvin = fridgeTemp * 1e-3;
        const coolingPowerMicrowatts = (84 * nDotMol * Math.pow(tKelvin, 2) * 1e6).toFixed(1);
        const maxCoaxialLines = Math.floor(+coolingPowerMicrowatts / 0.15); // ~0.15 uW per line at MXC
        return {
          metric1: { label: 'Base Cooling Power at MXC', val: `${coolingPowerMicrowatts} μW`, note: 'Available thermal budget' },
          metric2: { label: 'Max Passive Coax Capacity', val: `${maxCoaxialLines} Lines`, note: 'Before thermal runaway' },
          metric3: { label: 'He-3 Circulation Rate', val: `${fridgeFlowRate} μmol/s`, note: 'Roots pumping throughput' },
          status: +coolingPowerMicrowatts >= 20 ? 'INDUSTRIAL ENTERPRISE STABILITY' : 'LIMITED THERMAL HEADROOM'
        };
      }
      case 'cryo_cmos': {
        const totalPowerMw = ((cmosChannels * cmosPowerPerChan) / 1000).toFixed(1);
        const wireReduction = (((cmosChannels * 2 - 4) / (cmosChannels * 2)) * 100).toFixed(1);
        const budgetPercent = ((+totalPowerMw / 1500) * 100).toFixed(1);
        return {
          metric1: { label: 'Total 4K Stage Dissipation', val: `${totalPowerMw} mW`, note: 'Out of 1,500 mW cooling budget' },
          metric2: { label: 'Wiring Loom Reduction', val: `${wireReduction}%`, note: 'From 2 lines/qubit to serial fibers' },
          metric3: { label: '4K Thermal Budget Consumption', val: `${budgetPercent}%`, note: 'Cryocooler capacity used' },
          status: +budgetPercent <= 60 ? 'COMMERCIAL CRYOGENIC MARGIN' : 'HIGH HEATLOAD WARNING'
        };
      }
      default: {
        // Default / QEC model
        const physicalQubits = (2 * Math.pow(qecDist, 2) - 1);
        const logError = (0.1 * Math.pow(qecPhysError / 0.01, (qecDist + 1) / 2)).toExponential(2);
        const syndromeTimeUs = 0.2 * qecDist;
        return {
          metric1: { label: 'Physical-to-Logical Footprint', val: `${physicalQubits} Qubits`, note: 'Rotated Surface Code (2d² - 1)' },
          metric2: { label: 'Projected Logical Error (p_L)', val: `${logError}`, note: 'Per syndrome measurement cycle' },
          metric3: { label: 'Syndrome Cycle Duration', val: `${syndromeTimeUs.toFixed(1)} μs`, note: 'FPGA decoding latency target' },
          status: qecPhysError < 0.01 ? 'BELOW FAULT-TOLERANCE THRESHOLD (p < 1%)' : 'ABOVE THRESHOLD (NOISE RUNAWAY)'
        };
      }
    }
  }, [node.id, squeezeR, lossDb, waveguideLen, transmonEj, transmonEc, transmonTemp, ionRabi, ionDetuning, ionPhonons, atomN, atomDistance, atomOmega, qecDist, qecPhysError, fridgeFlowRate, fridgeTemp, cmosChannels, cmosPowerPerChan]);

  return (
    <div className="p-4 rounded-xl bg-gradient-to-b from-[#09141d] to-[#040910] border border-cyan-500/40 space-y-4 font-mono text-xs">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-xs">Interactive QC Method Workbench</h4>
            <span className="text-[10px] text-slate-400">Live Physical Parameter Sandbox</span>
          </div>
        </div>

        <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold uppercase">
          {simResults.status}
        </span>
      </div>

      {/* Dynamic Sliders based on Node Type */}
      <div className="space-y-3">
        {node.id === 'photonic' && (
          <>
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Squeezing Parameter (r):</span>
                <span className="text-cyan-300 font-bold">{squeezeR.toFixed(2)} ({+(8.686 * squeezeR).toFixed(1)} dB initial)</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.2"
                step="0.05"
                value={squeezeR}
                onChange={(e) => setSqueezeR(+e.target.value)}
                className="w-full h-1.5 bg-slate-800 accent-[#00e5ff] rounded cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Waveguide Transmission Loss:</span>
                <span className="text-amber-300 font-bold">{lossDb.toFixed(2)} dB/cm (L = {waveguideLen} cm)</span>
              </div>
              <input
                type="range"
                min="0.02"
                max="0.35"
                step="0.01"
                value={lossDb}
                onChange={(e) => setLossDb(+e.target.value)}
                className="w-full h-1.5 bg-slate-800 accent-amber-400 rounded cursor-pointer"
              />
            </div>
          </>
        )}

        {node.id === 'superconducting' && (
          <>
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Josephson Coupling (E_J):</span>
                <span className="text-cyan-300 font-bold">{transmonEj.toFixed(1)} GHz</span>
              </div>
              <input
                type="range"
                min="8.0"
                max="28.0"
                step="0.5"
                value={transmonEj}
                onChange={(e) => setTransmonEj(+e.target.value)}
                className="w-full h-1.5 bg-slate-800 accent-[#00e5ff] rounded cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Charging Energy (E_C):</span>
                <span className="text-purple-300 font-bold">{+(transmonEc * 1000).toFixed(0)} MHz (E_J/E_C = {(transmonEj/transmonEc).toFixed(0)})</span>
              </div>
              <input
                type="range"
                min="0.18"
                max="0.45"
                step="0.01"
                value={transmonEc}
                onChange={(e) => setTransmonEc(+e.target.value)}
                className="w-full h-1.5 bg-slate-800 accent-purple-400 rounded cursor-pointer"
              />
            </div>
          </>
        )}

        {node.id === 'trapped_ion' && (
          <>
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Rabi Frequency (Ω/2π):</span>
                <span className="text-cyan-300 font-bold">{ionRabi} kHz</span>
              </div>
              <input
                type="range"
                min="80"
                max="350"
                step="10"
                value={ionRabi}
                onChange={(e) => setIonRabi(+e.target.value)}
                className="w-full h-1.5 bg-slate-800 accent-[#00e5ff] rounded cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Mølmer-Sørensen Detuning (δ/2π):</span>
                <span className="text-purple-300 font-bold">{ionDetuning} kHz</span>
              </div>
              <input
                type="range"
                min="20"
                max="80"
                step="5"
                value={ionDetuning}
                onChange={(e) => setIonDetuning(+e.target.value)}
                className="w-full h-1.5 bg-slate-800 accent-purple-400 rounded cursor-pointer"
              />
            </div>
          </>
        )}

        {node.id === 'neutral_atom' && (
          <>
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Principal Quantum Number (n):</span>
                <span className="text-amber-300 font-bold">n = {atomN} (C₆ ∝ n¹¹)</span>
              </div>
              <input
                type="range"
                min="55"
                max="85"
                step="1"
                value={atomN}
                onChange={(e) => setAtomN(+e.target.value)}
                className="w-full h-1.5 bg-slate-800 accent-amber-400 rounded cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Inter-Atomic Distance (R):</span>
                <span className="text-cyan-300 font-bold">{atomDistance.toFixed(1)} μm</span>
              </div>
              <input
                type="range"
                min="2.5"
                max="7.5"
                step="0.1"
                value={atomDistance}
                onChange={(e) => setAtomDistance(+e.target.value)}
                className="w-full h-1.5 bg-slate-800 accent-[#00e5ff] rounded cursor-pointer"
              />
            </div>
          </>
        )}

        {node.id === 'dilution_fridge' && (
          <>
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">He-3 Flow Rate (ṅ₃):</span>
                <span className="text-cyan-300 font-bold">{fridgeFlowRate} μmol/sec</span>
              </div>
              <input
                type="range"
                min="150"
                max="900"
                step="25"
                value={fridgeFlowRate}
                onChange={(e) => setFridgeFlowRate(+e.target.value)}
                className="w-full h-1.5 bg-slate-800 accent-[#00e5ff] rounded cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Mixing Chamber Temp (T_MXC):</span>
                <span className="text-amber-300 font-bold">{fridgeTemp} mK</span>
              </div>
              <input
                type="range"
                min="10"
                max="40"
                step="1"
                value={fridgeTemp}
                onChange={(e) => setFridgeTemp(+e.target.value)}
                className="w-full h-1.5 bg-slate-800 accent-amber-400 rounded cursor-pointer"
              />
            </div>
          </>
        )}

        {node.id === 'cryo_cmos' && (
          <>
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Qubit Channels Multiplexed:</span>
                <span className="text-cyan-300 font-bold">{cmosChannels} Qubits</span>
              </div>
              <input
                type="range"
                min="64"
                max="2048"
                step="64"
                value={cmosChannels}
                onChange={(e) => setCmosChannels(+e.target.value)}
                className="w-full h-1.5 bg-slate-800 accent-[#00e5ff] rounded cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Power Dissipation per Channel:</span>
                <span className="text-purple-300 font-bold">{cmosPowerPerChan} μW / Qubit</span>
              </div>
              <input
                type="range"
                min="15"
                max="120"
                step="5"
                value={cmosPowerPerChan}
                onChange={(e) => setCmosPowerPerChan(+e.target.value)}
                className="w-full h-1.5 bg-slate-800 accent-purple-400 rounded cursor-pointer"
              />
            </div>
          </>
        )}

        {/* Default fallback: QEC distance & error */}
        {!['photonic', 'superconducting', 'trapped_ion', 'neutral_atom', 'dilution_fridge', 'cryo_cmos'].includes(node.id) && (
          <>
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Surface Code Distance (d):</span>
                <span className="text-cyan-300 font-bold">d = {qecDist}</span>
              </div>
              <input
                type="range"
                min="3"
                max="11"
                step="2"
                value={qecDist}
                onChange={(e) => setQecDist(+e.target.value)}
                className="w-full h-1.5 bg-slate-800 accent-[#00e5ff] rounded cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Physical Gate Error Rate (p):</span>
                <span className="text-purple-300 font-bold">{(qecPhysError * 100).toFixed(2)}%</span>
              </div>
              <input
                type="range"
                min="0.0002"
                max="0.008"
                step="0.0002"
                value={qecPhysError}
                onChange={(e) => setQecPhysError(+e.target.value)}
                className="w-full h-1.5 bg-slate-800 accent-purple-400 rounded cursor-pointer"
              />
            </div>
          </>
        )}
      </div>

      {/* Live Calculated Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800">
        <div className="p-2 rounded-lg bg-slate-950 border border-slate-850">
          <span className="text-[10px] text-slate-400 block truncate">{simResults.metric1.label}</span>
          <span className="text-xs font-bold text-cyan-300 block">{simResults.metric1.val}</span>
          <span className="text-[9px] text-slate-500 block truncate">{simResults.metric1.note}</span>
        </div>

        <div className="p-2 rounded-lg bg-slate-950 border border-slate-850">
          <span className="text-[10px] text-slate-400 block truncate">{simResults.metric2.label}</span>
          <span className="text-xs font-bold text-emerald-400 block">{simResults.metric2.val}</span>
          <span className="text-[9px] text-slate-500 block truncate">{simResults.metric2.note}</span>
        </div>

        <div className="p-2 rounded-lg bg-slate-950 border border-slate-850">
          <span className="text-[10px] text-slate-400 block truncate">{simResults.metric3.label}</span>
          <span className="text-xs font-bold text-purple-300 block">{simResults.metric3.val}</span>
          <span className="text-[9px] text-slate-500 block truncate">{simResults.metric3.note}</span>
        </div>
      </div>

    </div>
  );
};

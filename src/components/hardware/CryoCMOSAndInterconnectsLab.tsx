import React, { useState, useMemo } from 'react';
import { 
  Cpu, 
  Layers, 
  Network, 
  Radio, 
  Sparkles, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  TrendingUp,
  Share2,
  ShieldCheck,
  Globe2
} from 'lucide-react';
import { playGateClickSound } from '../../utils/audio';

export const CryoCMOSAndInterconnectsLab: React.FC = () => {
  const [qubitScale, setQubitScale] = useState<number>(1024);
  const [controlArch, setControlArch] = useState<'legacy_coax' | 'cryo_cmos'>('cryo_cmos');
  const [activeInterconnect, setActiveInterconnect] = useState<'mw_optical' | 'cryo_waveguide' | 'ion_photonic'>('mw_optical');

  // Quantitative Wiring Bottleneck calculations
  const wiringComparison = useMemo(() => {
    // Legacy coax: ~2 coaxial cables per qubit (drive + flux/readout)
    const legacyWires = qubitScale * 2;
    const legacyHeatDissipation_W = (legacyWires * 0.035).toFixed(1);
    const legacyRackFootprint_m2 = (qubitScale * 0.015).toFixed(1);
    const legacyCablesWeight_kg = (legacyWires * 0.12).toFixed(1);

    // Cryo-CMOS: 4 Kelvin controller ASIC (Intel Horse Ridge / Gooseberry style)
    // 1 optical digital fiber pair per 256 qubits + local DAC/ADC on 4K stage
    const cmosFibers = Math.max(2, Math.ceil(qubitScale / 256) * 2);
    const cmosPower_mW = (Math.ceil(qubitScale / 128) * 85).toFixed(0); // ~85 mW per 128Q chiplet
    const cmosWireReduction = (((legacyWires - cmosFibers) / legacyWires) * 100).toFixed(1);

    return {
      legacyWires,
      legacyHeatDissipation_W,
      legacyRackFootprint_m2,
      legacyCablesWeight_kg,
      cmosFibers,
      cmosPower_mW,
      cmosWireReduction
    };
  }, [qubitScale]);

  return (
    <div className="space-y-6 font-mono text-xs">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#09141d] border border-cyan-800/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/50 flex items-center justify-center text-purple-400">
            <Network className="w-5 h-5 text-purple-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">Cryo-CMOS ASICs &amp; Quantum Interconnect Architecture</h3>
              <span className="px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-bold">
                MILLION-QUBIT SCALING ENGINE
              </span>
            </div>
            <p className="text-[11px] text-[#78909c]">
              Solves the physical cryogenic wiring bottleneck and models microwave-to-optical quantum transducers for multi-cryostat clusters
            </p>
          </div>
        </div>

        {/* Qubit Scale Slider */}
        <div className="flex items-center gap-3 bg-[#050b11] px-3.5 py-2 rounded-xl border border-slate-800">
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Scaling Target:</span>
            <span className="text-[#00e5ff] font-bold text-xs">{qubitScale.toLocaleString()} Qubits</span>
          </div>
          <input
            type="range"
            min="64"
            max="16384"
            step="128"
            value={qubitScale}
            onChange={(e) => setQubitScale(+e.target.value)}
            className="w-28 h-1.5 bg-slate-800 accent-[#00e5ff] rounded cursor-pointer"
          />
        </div>
      </div>

      {/* 2. The Wiring Bottleneck: Legacy Coaxial Loom vs 4K Cryo-CMOS ASICs */}
      <div className="p-4 rounded-xl bg-[#050b11] border border-slate-800 space-y-4">
        
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div>
            <h4 className="font-bold text-white text-xs uppercase flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Cryogenic Wiring Bottleneck &amp; Control Architecture</span>
            </h4>
            <p className="text-[10px] text-slate-400">
              Why 1,000+ qubits cannot scale with room-temperature coaxial cables and must transition to Cryo-CMOS on-chip micro-controllers
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-[#09141d] p-1 rounded-lg border border-slate-800 text-[10px]">
            <button
              onClick={() => { playGateClickSound(600); setControlArch('legacy_coax'); }}
              className={`px-3 py-1 rounded font-bold transition-all cursor-pointer ${
                controlArch === 'legacy_coax' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Legacy Room-Temp Loom
            </button>
            <button
              onClick={() => { playGateClickSound(650); setControlArch('cryo_cmos'); }}
              className={`px-3 py-1 rounded font-bold transition-all cursor-pointer ${
                controlArch === 'cryo_cmos' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              4K Cryo-CMOS Integrated ASIC
            </button>
          </div>
        </div>

        {/* Comparative Architecture Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Option A: Legacy Coax Loom */}
          <div className={`p-4 rounded-xl border space-y-3 transition-all ${
            controlArch === 'legacy_coax' 
              ? 'bg-amber-950/30 border-amber-500/80 shadow-md shadow-amber-500/10' 
              : 'bg-[#02050b] border-slate-850 opacity-70'
          }`}>
            <div className="flex justify-between items-center">
              <span className="font-bold text-amber-300 text-xs uppercase">Legacy Discrete Coax Cabling (Present)</span>
              <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[9px] font-bold">
                PHYSICAL LIMIT REACHED
              </span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-850">
                <span className="text-slate-400">Total Coaxial Lines Entering Cryostat:</span>
                <span className="text-white font-bold">{wiringComparison.legacyWires.toLocaleString()} Coax Cables</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-850">
                <span className="text-slate-400">Conduction Thermal Leakage to 4K:</span>
                <span className="text-rose-400 font-bold">{wiringComparison.legacyHeatDissipation_W} Watts (High Heatload)</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-850">
                <span className="text-slate-400">Room-Temp AWG/DAC Server Racks:</span>
                <span className="text-amber-300 font-bold">{wiringComparison.legacyRackFootprint_m2} m² Floor Space</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-850">
                <span className="text-slate-400">Coaxial Cable Loom Mass:</span>
                <span className="text-white font-bold">{wiringComparison.legacyCablesWeight_kg} kg of Copper/SS</span>
              </div>
            </div>

            <div className="text-[10px] text-amber-400/90 leading-relaxed pt-1">
              ⚠ At 10,000+ qubits, coaxial bundle physical cross-section exceeds the dilution refrigerator top-plate diameter, causing vacuum failure and thermal collapse.
            </div>
          </div>

          {/* Option B: Cryo-CMOS Integrated ASIC */}
          <div className={`p-4 rounded-xl border space-y-3 transition-all ${
            controlArch === 'cryo_cmos' 
              ? 'bg-cyan-950/40 border-cyan-400 shadow-md shadow-cyan-500/20' 
              : 'bg-[#02050b] border-slate-850 opacity-70'
          }`}>
            <div className="flex justify-between items-center">
              <span className="font-bold text-cyan-300 text-xs uppercase">Cryo-CMOS Monolithic ASIC (2026–2030+)</span>
              <span className="px-2 py-0.5 rounded bg-cyan-500 text-slate-950 text-[9px] font-bold">
                {wiringComparison.cmosWireReduction}% WIRE REDUCTION
              </span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-850">
                <span className="text-slate-400">Physical Lines Entering Cryostat:</span>
                <span className="text-emerald-400 font-bold">{wiringComparison.cmosFibers} Digital Optical Fibers</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-850">
                <span className="text-slate-400">4K Controller Thermal Dissipation:</span>
                <span className="text-cyan-300 font-bold">{wiringComparison.cmosPower_mW} mW (Well Within 1.5W 4K Budget)</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-850">
                <span className="text-slate-400">On-Chip Pulse Generation:</span>
                <span className="text-white font-bold">Cryo-DACs &amp; Direct FDM Modulators</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-850">
                <span className="text-slate-400">Semiconductor Process Node:</span>
                <span className="text-purple-300 font-bold">Intel 16 nm FinFET / TSMC 22 nm ULL</span>
              </div>
            </div>

            <div className="text-[10px] text-emerald-300 leading-relaxed pt-1">
              ✓ Enables scaling to 1,000,000 physical qubits inside a standard dilution cryostat by mounting controller chiplets directly on the 4K pulse tube plate.
            </div>
          </div>

        </div>

      </div>

      {/* 3. Quantum Interconnects: Microwave-to-Optical Transducers & Distributed QPUs */}
      <div className="p-4 rounded-xl bg-[#050b11] border border-slate-800 space-y-4">
        
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div>
            <h4 className="font-bold text-white text-xs uppercase flex items-center gap-2">
              <Share2 className="w-4 h-4 text-purple-400" />
              <span>Multi-QPU Modular Quantum Interconnects &amp; Transduction</span>
            </h4>
            <p className="text-[10px] text-slate-400">
              Connecting separate dilution refrigerators across room-temperature facilities to build modular quantum data centers
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-[#09141d] p-1 rounded-lg border border-slate-800 text-[10px]">
            {[
              { id: 'mw_optical' as const, label: 'Microwave-to-Optical Transducer' },
              { id: 'cryo_waveguide' as const, label: 'Cryo-Microwave Waveguide' },
              { id: 'ion_photonic' as const, label: 'Trapped-Ion Optical Switch' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => { playGateClickSound(600); setActiveInterconnect(item.id); }}
                className={`px-3 py-1 rounded font-bold transition-all cursor-pointer ${
                  activeInterconnect === item.id ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Interconnect Details */}
        <div className="p-4 rounded-xl bg-[#02050b] border border-slate-850 space-y-3">
          {activeInterconnect === 'mw_optical' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-xs">Piezo-Optomechanical Microwave-to-Optical Transduction</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  Quantum Efficiency η &gt; 50%
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Converts 5 GHz superconducting qubit microwave photons into 1550 nm telecom infrared photons using piezoelectric Lithium Niobate (LiNbO₃) optomechanical microcavities. This allows quantum entanglement to travel through conventional room-temperature optical telecom fiber cables, linking separate dilution refrigerators miles apart.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] pt-1">
                <div className="p-2 rounded bg-[#09141d] border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">RF Frequency (QPU):</span>
                  <span className="text-cyan-300 font-bold">4.80 GHz (Superconducting)</span>
                </div>
                <div className="p-2 rounded bg-[#09141d] border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Telecom Optical Wavelength:</span>
                  <span className="text-purple-300 font-bold">1550.12 nm (C-Band Fiber)</span>
                </div>
                <div className="p-2 rounded bg-[#09141d] border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Added Noise Quanta:</span>
                  <span className="text-emerald-400 font-bold">N_add &lt; 0.2 Photons</span>
                </div>
              </div>
            </div>
          )}

          {activeInterconnect === 'cryo_waveguide' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-xs">Cryogenic Microwave Waveguide Bridges (IBM Quantum System Two)</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Coherent Inter-Cryostat Bus
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Direct superconducting microwave coaxial bridges shielded at 15 mK, physically connecting multi-chip QPU modules across separate dilution refrigerator dewars up to 2 meters apart without optical conversion.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] pt-1">
                <div className="p-2 rounded bg-[#09141d] border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Transmission Loss:</span>
                  <span className="text-cyan-300 font-bold">&lt; 0.05 dB per meter</span>
                </div>
                <div className="p-2 rounded bg-[#09141d] border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Maximum Distance:</span>
                  <span className="text-amber-300 font-bold">2.5 Meters (Cryo-Bridge)</span>
                </div>
                <div className="p-2 rounded bg-[#09141d] border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Inter-Module 2Q Fidelity:</span>
                  <span className="text-emerald-400 font-bold">98.5% Cross-Chip CZ</span>
                </div>
              </div>
            </div>
          )}

          {activeInterconnect === 'ion_photonic' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-xs">Trapped-Ion Photonic Optical Switch Mesh</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Distributed Ion Traps
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Trapped barium/ytterbium ions emit single photons entangled with their electronic spin states. An ultra-fast MEMS optical cross-connect switch routes these photons to interfere at 50:50 beam splitters, generating remote Bell pairs between separate vacuum traps.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] pt-1">
                <div className="p-2 rounded bg-[#09141d] border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Entanglement Rate:</span>
                  <span className="text-cyan-300 font-bold">~1,000 Bell Pairs / sec</span>
                </div>
                <div className="p-2 rounded bg-[#09141d] border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Optical Switch Insertion Loss:</span>
                  <span className="text-purple-300 font-bold">&lt; 0.8 dB (MEMS Mesh)</span>
                </div>
                <div className="p-2 rounded bg-[#09141d] border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Remote Bell State Fidelity:</span>
                  <span className="text-emerald-400 font-bold">96.8% Verified</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 4. Global Hardware Technology Readiness Level (TRL) & Roadmap (2024–2035) */}
      <div className="p-4 rounded-xl bg-[#050b11] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h4 className="font-bold text-white text-xs uppercase flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Quantum Hardware Technology Roadmap &amp; Scaling Trajectory (2024–2035)</span>
            </h4>
            <p className="text-[10px] text-slate-400">
              Evolutionary transition across NISQ, Quantum Utility, Early Fault-Tolerance, and Industrial Megascale
            </p>
          </div>
          <span className="text-[10px] text-slate-500 font-bold uppercase">IEEE Quantum Roadmap v4.2</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px]">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 bg-[#09141d]">
                <th className="p-2.5">Hardware Modality</th>
                <th className="p-2.5 text-cyan-300">2024–2025 (NISQ Utility)</th>
                <th className="p-2.5 text-purple-300">2026–2028 (Early FTQC QEC)</th>
                <th className="p-2.5 text-emerald-300">2029–2035 (Megascale FTQC)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              <tr>
                <td className="p-2.5 font-bold text-white">Superconducting (IBM, Google, Rigetti)</td>
                <td className="p-2.5 text-slate-300">100–1,000 physical qubits; ZNE error mitigation; Heavy-Hex couplers</td>
                <td className="p-2.5 text-cyan-300 font-bold">Surface code distance d=5,7; 10–50 logical qubits; 4K Cryo-CMOS</td>
                <td className="p-2.5 text-emerald-400 font-bold">100,000+ qubits; Modular microwave waveguides; Million-qubit clusters</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-white">Trapped-Ion (Quantinuum, IonQ)</td>
                <td className="p-2.5 text-slate-300">32–64 qubits; 99.9% 2Q fidelity; Racetrack ion shuttling</td>
                <td className="p-2.5 text-purple-300 font-bold">Color codes &amp; Bacon-Shor; 100+ logical qubits; Integrated photonic traps</td>
                <td className="p-2.5 text-emerald-400 font-bold">Distributed optical switch fabric; High-repetition modular clusters</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-white">Neutral-Atom (QuEra, Harvard, Pasqal)</td>
                <td className="p-2.5 text-slate-300">256–1,000 physical atoms; 2D analog simulation; SLM rearrangement</td>
                <td className="p-2.5 text-purple-300 font-bold">Dual-species (Rb/Cs) syndrome extraction; 48+ transversal logical qubits</td>
                <td className="p-2.5 text-emerald-400 font-bold">10,000–100,000 atomic sites; 3D optical lattices; Reconfigurable routing</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-white">Silicon Spin (Intel, Diraq, UNSW)</td>
                <td className="p-2.5 text-slate-300">6–12 qubit prototypes; Nanometer gate pitch; Proof of exchange coupling</td>
                <td className="p-2.5 text-cyan-300 font-bold">100–1,000 quantum dots; Monolithic on-chip 1K CMOS integration</td>
                <td className="p-2.5 text-emerald-400 font-bold">Commercial 300 mm wafer volumes; 1,000,000 qubits on single silicon die</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-white">Topological Anyons (Microsoft Quantum)</td>
                <td className="p-2.5 text-slate-300">Majorana Zero Mode verification; Topological gap protocol demonstrations</td>
                <td className="p-2.5 text-purple-300 font-bold">First topological qubit prototype; Non-Abelian braiding verification</td>
                <td className="p-2.5 text-emerald-400 font-bold">Hardware-protected logical qubits with 100× lower physical footprint</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

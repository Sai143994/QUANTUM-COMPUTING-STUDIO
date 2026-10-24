import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Globe2, 
  ShieldAlert, 
  Layers, 
  CheckCircle2, 
  Flame, 
  Activity, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { playGateClickSound } from '../../utils/audio';

export interface ChokepointItem {
  id: string;
  name: string;
  category: 'Cryogenic Isotope' | 'Semiconductor Substrate' | 'Specialized Equipment' | 'Optics & Photonic';
  criticality: 'CRITICAL' | 'HIGH' | 'MODERATE';
  primaryProducers: string[];
  vulnerabilityScore: number; // 0 to 100
  description: string;
  geopoliticalRisk: string;
  quantumDependency: string;
  mitigationStrategy: string;
}

export const CHOKEPOINTS_DATA: ChokepointItem[] = [
  {
    id: 'helium3',
    name: 'Helium-3 (³He) Isotope',
    category: 'Cryogenic Isotope',
    criticality: 'CRITICAL',
    primaryProducers: ['United States (DOE Savannah River)', 'Russia (Rosatom Tritium Decay)', 'Canada (CANDU Reactors)'],
    vulnerabilityScore: 94,
    description: 'Ultra-rare non-radioactive isotope of helium formed solely as a byproduct of nuclear weapons tritium decay. Essential working fluid for sub-10 mK dilution refrigerators.',
    geopoliticalRisk: 'Global supply is strictly capped by nuclear stockpiles. Diplomatic embargoes and tritium decay rates limit worldwide commercial availability to < 10,000 liters/year.',
    quantumDependency: 'Every superconducting transmon and silicon spin quantum computer relies on ³He/⁴He dilution cooling to reach 15 mK.',
    mitigationStrategy: 'Closed-loop zero-boiloff gas recovery systems, pulsed tube pre-cooling, and higher-temperature (1 K) "Hot" silicon spin architectures.'
  },
  {
    id: 'dilution_cryostats',
    name: 'Sub-10 mK Dilution Refrigerators',
    category: 'Specialized Equipment',
    criticality: 'CRITICAL',
    primaryProducers: ['Finland (Bluefors)', 'United Kingdom (Oxford Instruments)', 'United States (FormFactor, Janis)'],
    vulnerabilityScore: 88,
    description: 'Precision cryogenic refrigerators that achieve sub-15 mK temperatures using continuous 3He/4He dilution circulation without liquid nitrogen.',
    geopoliticalRisk: 'Concentrated in 2 European nations and the US. Subject to strict Wassenaar Arrangement dual-use export controls; deliveries to non-allied nations are blocked.',
    quantumDependency: 'Sole physical environment capable of suppressing thermal quasiparticle excitation in superconducting transmons.',
    mitigationStrategy: 'Domestic sovereign cryogenics programs (e.g. CAS Hefei Cryogenics in China, French Sovereign Deeptech).'
  },
  {
    id: 'silicon28',
    name: 'Isotopically Pure Silicon-28 (²⁸Si > 99.999%)',
    category: 'Semiconductor Substrate',
    criticality: 'CRITICAL',
    primaryProducers: ['Russia (Centrifuge Enrichment)', 'Germany (Leibniz Institute / Siltronic)', 'Australia (Silicon Quantum Computing)'],
    vulnerabilityScore: 85,
    description: 'Natural silicon contains 4.7% ²⁹Si with nuclear spin I=1/2, which dephases electron spin qubits. ²⁸Si has zero nuclear spin (nuclear spin-free "semiconductor vacuum").',
    geopoliticalRisk: 'Historically, over 80% of world isotope centrifugation capacity for ultra-pure ²⁸Si was concentrated in Russian state nuclear facilities (Rosatom).',
    quantumDependency: 'Without ²⁸Si, silicon spin qubits suffer rapid dephasing (T₂* < 1 μs vs > 30 ms in enriched ²⁸Si).',
    mitigationStrategy: 'Western centrifuge capacity expansion (Urenco, European Consortium) and laser isotope separation (LIS) research in Australia.'
  },
  {
    id: 'ytterbium171',
    name: 'Enriched Ytterbium-171 (¹⁷¹Yb) & Barium-137',
    category: 'Cryogenic Isotope',
    criticality: 'HIGH',
    primaryProducers: ['United States (Oak Ridge National Lab)', 'Russia (Electrochemical Plant Zelenogorsk)', 'Netherlands (Urenco Stable Isotopes)'],
    vulnerabilityScore: 78,
    description: 'Hyperfine clock state ions providing clock-transition qubits immune to first-order magnetic field fluctuations.',
    geopoliticalRisk: 'Separation of stable isotopes relies on calutrons or specialized gas centrifuges with limited global batch production schedules.',
    quantumDependency: 'Powerhouse ion for Quantinuum, IonQ, and Oxford Ionics high-fidelity (> 99.9% 2Q) trapped-ion processors.',
    mitigationStrategy: 'US DOE Stable Isotope Production and Research Center (SIPRC) expansion at ORNL.'
  },
  {
    id: 'hemt_amplifiers',
    name: 'Cryogenic Low-Noise Amplifiers (HEMT LNAs)',
    category: 'Specialized Equipment',
    criticality: 'HIGH',
    primaryProducers: ['Sweden (Low Noise Factory)', 'United States (Caliper, QuinStar)', 'Switzerland (Zurich Instruments)'],
    vulnerabilityScore: 72,
    description: 'Gallium Arsenide (GaAs) and InP High Electron Mobility Transistors operating at 4 Kelvin with noise temperature < 2 K for single-photon microwave readout.',
    geopoliticalRisk: 'Extreme niche semiconductor fabrication requiring cryogenic wafer testing; single supplier bottlenecks in Nordic and US regions.',
    quantumDependency: 'Amplifies microvolt qubit readout pulses from the 15 mK mixing chamber to room-temperature digitizers.',
    mitigationStrategy: 'Superconducting Traveling Wave Parametric Amplifiers (JTWPA) and monolithic Cryo-CMOS integrated readout.'
  },
  {
    id: 'narrow_linewidth_lasers',
    name: 'Ultra-Narrow Linewidth UV/Blue Laser Systems',
    category: 'Optics & Photonic',
    criticality: 'MODERATE',
    primaryProducers: ['Germany (TOPTICA Photonics)', 'United States (M Squared, Coherent)', 'France (Oxxius)'],
    vulnerabilityScore: 68,
    description: 'Stabilized diode and frequency-doubled laser systems with linewidth < 1 kHz locked to high-finesse ULE optical cavities.',
    geopoliticalRisk: 'Critical for atomic quantum clocks, Rydberg excitation (318 nm, 480 nm), and neutral atom optical tweezer trapping.',
    quantumDependency: 'Trapped-ion and neutral-atom gates fail catastrophically if laser phase noise drifts outside sub-kHz margins.',
    mitigationStrategy: 'Photonic integrated circuit (PIC) microcomb lasers and planar waveguide distribution networks.'
  }
];

export const GlobalSupplyChainChokepoints: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>('helium3');

  const activeItem = CHOKEPOINTS_DATA.find(c => c.id === selectedId) || CHOKEPOINTS_DATA[0];

  return (
    <div className="space-y-6 font-mono text-xs">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#09141d] border border-cyan-800/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-amber-400">
            <ShieldAlert className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">Global Quantum Supply Chain &amp; Chokepoint Vulnerability Matrix</h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">
                GEOSTRATEGIC INTELLIGENCE
              </span>
            </div>
            <p className="text-[11px] text-[#78909c]">
              Critical minerals, cryogenic isotopes, dilution refrigerators, and equipment monopolies defining national technological sovereignty
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#050b11] px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          <Globe2 className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-400">Tracking:</span>
          <span className="text-white font-bold">{CHOKEPOINTS_DATA.length} Strategic Bottlenecks</span>
        </div>
      </div>

      {/* 2. Chokepoint Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {CHOKEPOINTS_DATA.map(item => {
          const isSelected = item.id === selectedId;
          return (
            <button
              key={item.id}
              onClick={() => {
                playGateClickSound(650);
                setSelectedId(item.id);
              }}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                isSelected
                  ? 'bg-gradient-to-r from-cyan-950/90 to-blue-950/90 border-cyan-400 shadow-md shadow-cyan-500/10'
                  : 'bg-[#050b11] border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                    item.criticality === 'CRITICAL' 
                      ? 'bg-rose-950 text-rose-300 border border-rose-800' 
                      : item.criticality === 'HIGH' 
                      ? 'bg-amber-950 text-amber-300 border border-amber-800' 
                      : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  }`}>
                    {item.criticality} RISK
                  </span>

                  <span className="text-amber-400 font-bold text-xs">
                    {item.vulnerabilityScore}/100 Index
                  </span>
                </div>

                <h4 className="font-bold text-sm text-white mt-1.5">{item.name}</h4>
                <span className="text-[10px] text-slate-400">{item.category}</span>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex justify-between items-center">
                <span>Top Producer: <strong className="text-white">{item.primaryProducers[0].split(' (')[0]}</strong></span>
                <span className="text-cyan-400 flex items-center gap-0.5">
                  Inspect <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Deep-Dive Chokepoint Dossier Card */}
      <div className="p-5 rounded-2xl bg-[#050b11] border border-cyan-800/40 space-y-4">
        
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-white">{activeItem.name}</h4>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                {activeItem.category}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {activeItem.description}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Vulnerability Score</span>
            <div className="text-2xl font-bold text-amber-400">{activeItem.vulnerabilityScore} / 100</div>
            <span className="text-[9px] text-rose-400">High Geopolitical Sensitivity</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          {/* Column 1: Primary Global Producers */}
          <div className="p-3.5 rounded-xl bg-[#09141d] border border-slate-800 space-y-2">
            <span className="text-[10px] text-slate-400 uppercase font-bold block flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Primary Producer Dominance:</span>
            </span>
            <div className="space-y-1 text-[11px]">
              {activeItem.primaryProducers.map((prod, idx) => (
                <div key={idx} className="p-2 rounded bg-slate-950 border border-slate-850 text-slate-200">
                  <span className="text-cyan-400 font-bold mr-1">#{idx + 1}</span> {prod}
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Quantum Architecture Dependency */}
          <div className="p-3.5 rounded-xl bg-[#09141d] border border-slate-800 space-y-2">
            <span className="text-[10px] text-slate-400 uppercase font-bold block flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span>Hardware Dependency Impact:</span>
            </span>
            <p className="text-[11px] text-slate-300 leading-relaxed p-2.5 rounded bg-slate-950 border border-slate-850">
              {activeItem.quantumDependency}
            </p>
          </div>

          {/* Column 3: Geopolitical Risk & Embargo Exposure */}
          <div className="p-3.5 rounded-xl bg-[#09141d] border border-slate-800 space-y-2">
            <span className="text-[10px] text-slate-400 uppercase font-bold block flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Geopolitical Sanctions Stance:</span>
            </span>
            <p className="text-[11px] text-slate-300 leading-relaxed p-2.5 rounded bg-slate-950 border border-slate-850">
              {activeItem.geopoliticalRisk}
            </p>
          </div>

        </div>

        {/* Strategic Mitigation Playbook */}
        <div className="p-3.5 rounded-xl bg-[#02050b] border border-emerald-800/40 text-[11px] space-y-1">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Allied Resilience &amp; Sovereign Mitigation Playbook:</span>
          </div>
          <p className="text-slate-300 leading-relaxed pl-6">
            {activeItem.mitigationStrategy}
          </p>
        </div>

      </div>

    </div>
  );
};

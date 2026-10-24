import React, { useState } from 'react';
import { 
  Cpu, 
  Layers, 
  Zap, 
  Sparkles, 
  Activity, 
  CheckCircle2, 
  Flame, 
  ShieldCheck, 
  Info,
  Maximize2
} from 'lucide-react';
import { playGateClickSound } from '../../utils/audio';

interface ModalityData {
  id: string;
  name: string;
  category: string;
  materials: string;
  fabProcess: string;
  operatingTemp: string;
  gateSpeed: string;
  coherenceTime: string;
  connectivity: string;
  hamiltonian: string;
  pros: string[];
  challenges: string[];
  crossSection: {
    substrate: string;
    layers: string[];
    junctionType: string;
  };
}

const MODALITIES: ModalityData[] = [
  {
    id: 'superconducting',
    name: 'Superconducting Transmon',
    category: 'Solid-State Circuit QED',
    materials: 'High-Resistivity Silicon, Nb/TiN, Al/AlOx/Al Josephson Junctions',
    fabProcess: 'E-beam lithography, Dolan bridge shadow evaporation (Al double-angle), SF₆/CHF₃ plasma etch',
    operatingTemp: '10–15 mK (Dilution Refrigerator Mixing Chamber)',
    gateSpeed: '10–40 ns (Single Qubit) / 30–80 ns (Two-Qubit CX/CZ)',
    coherenceTime: 'T₁ ~ 100–300 μs, T₂* ~ 80–200 μs',
    connectivity: 'Planar Nearest-Neighbor (Square Lattice, Heavy-Hex with Tunable Couplers)',
    hamiltonian: 'H = 4E_C(n - n_g)² - E_J cos(φ) ≈ ℏω₀₁ a†a - (α/2) a†a†aa',
    pros: [
      'Nanosecond fast gate execution times',
      'Leverages modern semiconductor cleanroom wafer lithography',
      'Microwave coaxial pulse control (4–8 GHz standard RF electronics)'
    ],
    challenges: [
      'Extreme sub-Kelvin millikelvin cryogenics required',
      'Charge noise and two-level fluctuators (TLS) at dielectric interfaces',
      'Planar 2D connectivity requires complex lattice routing for multi-qubit gates'
    ],
    crossSection: {
      substrate: 'High-Resistivity Silicon (100) > 10,000 Ω·cm',
      layers: ['Underbump Ti/Pt metallization', 'Nb/TiN coplanar waveguide ground plane (200 nm)', 'Al/AlOx/Al Josephson junction Dolan bridge (30 nm)'],
      junctionType: 'Dolan-bridge Al-AlOx-Al tunnel barrier (~1.5 nm oxide)'
    }
  },
  {
    id: 'trapped_ion',
    name: 'Trapped-Ion (QCCD Architecture)',
    category: 'Atomic Physics / Quantum Optics',
    materials: 'Microfabricated Gold on Fused Silica / Silicon, Ytterbium (¹⁷¹Yb⁺) / Barium (¹³⁷Ba⁺)',
    fabProcess: 'Electroplated gold RF Paul trap electrodes, laser-etched ion shuttling junctions, UHV chamber',
    operatingTemp: 'Room Temperature (300 K) or 4 K Cryo-pumping for Ultra-High Vacuum (10⁻¹¹ Torr)',
    gateSpeed: '1–10 μs (Single Qubit) / 15–100 μs (Mølmer-Sørensen Two-Qubit Entangler)',
    coherenceTime: 'T₁ > Hours (Hyperfine ground states), T₂ > Seconds/Minutes',
    connectivity: 'All-to-All Arbitrary Reconfigurability via shuttling and collective acoustic bus modes',
    hamiltonian: 'H = ℏω_ion σ_z/2 + ℏν (a†a + 1/2) + Ω(t) [σ_+ e^(-i(k·x - ω_L t)) + h.c.]',
    pros: [
      'Identical atomic qubits without manufacturing variances (zero fabrication drift)',
      'World-record two-qubit gate fidelities (> 99.9%)',
      'Complete all-to-all connectivity across ion crystal'
    ],
    challenges: [
      'Slower gate execution speeds (microsecond scale)',
      'Complex optical addressing lasers, AOMs, and UHV vacuum infrastructure',
      'Ion shuttling latency in large-scale QCCD architectures'
    ],
    crossSection: {
      substrate: 'Fused Silica / Sapphire with laser-drilled loading vias',
      layers: ['Ti/Pt adhesion layers', 'Electroplated 5 μm thick gold RF/DC segmented electrodes', 'Integrated optical fiber feedthroughs'],
      junctionType: 'Quadrupole RF Paul potential saddle null'
    }
  },
  {
    id: 'neutral_atom',
    name: 'Neutral Atom Optical Tweezers',
    category: 'Rydberg Atom Arrays',
    materials: 'Ultra-Cold Rubidium (⁸⁷Rb) or Strontium (⁸⁸Sr), High-NA Objective Lenses',
    fabProcess: 'Spatial Light Modulators (SLM), Acousto-Optic Deflectors (AOD), UHV 2D/3D glass cells',
    operatingTemp: 'Room Temp Vacuum Cell with laser-cooled microKelvin (μK) atomic clouds',
    gateSpeed: '50–200 ns (Single Qubit) / 100–300 ns (Rydberg Blockade Two-Qubit CZ)',
    coherenceTime: 'T₁ ~ Seconds (Hyperfine levels), T₂ ~ 1–3 ms',
    connectivity: 'Reconfigurable Dynamic 2D/3D geometry via optical tweezer coordinate movement',
    hamiltonian: 'H = ∑ (Ω_i/2) |g_i⟩⟨r_i| + h.c. - ∑ Δ_i |r_i⟩⟨r_i| + ∑ (C_6 / R_ij⁶) |r_i r_j⟩⟨r_i r_j|',
    pros: [
      'Massive physical qubit counts (256 to 10,000+ atomic sites)',
      'Real-time physical qubit shuttling and dynamic geometry reconfiguration',
      'Strong van der Waals Rydberg blockade interaction (C₆/R⁶)'
    ],
    challenges: [
      'Non-deterministic atom loading loss and trap vacancies (~99% fill rate)',
      'High laser optical power budgets and phase noise',
      'Fast auto-rearrangement sorting cycles required before decoherence'
    ],
    crossSection: {
      substrate: 'Anti-reflection coated UHV optical quartz cell',
      layers: ['High-NA microscope objective (NA > 0.65)', '2D optical dipole tweezer focus points (λ = 852 nm)', 'Counter-propagating Raman and Rydberg laser beams (λ = 480 nm, 297 nm)'],
      junctionType: 'Optical dipole trap potential well (~1 mK depth)'
    }
  },
  {
    id: 'photonic',
    name: 'Integrated Photonic CV / Dual-Rail',
    category: 'Integrated Quantum Photonics',
    materials: 'Silicon Nitride (Si₃N₄), Lithium Niobate on Insulator (LNOI), SNSPD Superconductors',
    fabProcess: 'CMOS-compatible photonic foundry lithography, low-loss optical waveguides (< 0.1 dB/m)',
    operatingTemp: 'Room Temp for optical chip; 4 K / 0.8 K for SNSPD single-photon detectors',
    gateSpeed: 'Picosecond optical propagation velocity / 10–100 MHz source repetition rate',
    coherenceTime: 'Flight-time limited (optical transmission attenuation)',
    connectivity: 'Integrated Mach-Zehnder reconfigurable beam splitter mesh',
    hamiltonian: 'H = ∑ ℏω_k a_k† a_k + ∑ g_ijkl (a_i† a_j† a_k a_l + h.c.)',
    pros: [
      'Room-temperature processor operation with zero refrigeration on the quantum core',
      'Ultra-high clock rate determined by photon transit time',
      'Direct compatibility with worldwide optical telecom fiber networks'
    ],
    challenges: [
      'Measurement-based non-deterministic entangling gates',
      'Photon loss in couplers and waveguide bends accumulates exponentially',
      'High squeeze-level requirements for fault-tolerant continuous-variable GKP codes'
    ],
    crossSection: {
      substrate: 'Thermal SiO₂ on Silicon (SOI Wafer)',
      layers: ['Low-loss Si₃N₄ strip waveguides (800 nm x 800 nm)', 'Thermo-optic / electro-optic phase modulators', 'Integrated Superconducting Nanowire Single-Photon Detectors (SNSPD)'],
      junctionType: 'Directional coupler Mach-Zehnder interferometer'
    }
  },
  {
    id: 'silicon_spin',
    name: 'Silicon Spin Qubits (Quantum Dots)',
    category: 'Semiconductor Spintronics',
    materials: 'Isotopically purified ²⁸Si, Si/SiGe heterostructures, Aluminum/Poly-Si gate stacks',
    fabProcess: 'Commercial 300 mm CMOS foundry lithography (Intel 18A / TSMC), EUV gate patterning (~50 nm pitch)',
    operatingTemp: '1.0–1.5 Kelvin ("Hot Qubits" allowing direct on-chip cryo-CMOS integration)',
    gateSpeed: '10–50 ns (Exchange J-coupling 2Q gate) / 100 ns (ESR/EDSR single qubit)',
    coherenceTime: 'T₁ > Seconds, T₂* ~ 20–100 μs (up to 30 ms with dynamical decoupling in ²⁸Si)',
    connectivity: 'Nearest-neighbor 2D array via tunable exchange barrier gates + long-range shuttling',
    hamiltonian: 'H = gμ_B B_z S_z + ∑ J(t) S_i · S_j + gμ_B B_AC(t) S_x',
    pros: [
      'Extremely compact footprint (~50 nm pitch, ~100× smaller than transmons)',
      'Direct compatibility with standard 300 mm silicon CMOS volume fab lines',
      'Operates at ~1 K, providing 100× more cryogenic cooling power than 15 mK'
    ],
    challenges: [
      'Valley-state splitting degeneracy and interfacial disorder in Si/SiGe',
      'Dense nanometer routing requires 3D vertical interconnect vias (TSVs)',
      'Cross-capacitance and electrostatic charge noise on gate electrodes'
    ],
    crossSection: {
      substrate: 'Isotopically purified ²⁸Si epitaxial layer on relaxed SiGe buffer',
      layers: ['ALD Al₂O₃ high-κ gate dielectric (10 nm)', 'Multi-layer overlapping Al/Ti/Au electrostatic gates (30 nm)', 'Vertical Through-Silicon Vias (TSVs) with backside routing'],
      junctionType: 'Electrostatic quantum dot potential well confinement'
    }
  },
  {
    id: 'topological',
    name: 'Topological Majorana Zero Modes',
    category: 'Topological Quantum Matter',
    materials: 'InAs/InSb Semiconductor Nanowires, Epitaxial Aluminum (Al), Magnetic Topological Insulators',
    fabProcess: 'MBE in-situ shadow epitaxy of superconducting Al on InAs nanowires, sub-Kelvin transport spectroscopy',
    operatingTemp: '20–30 mK (Zero-field topological superconductor phase)',
    gateSpeed: '100–500 ns (Topological braiding & measurement-based parity readout)',
    coherenceTime: 'Topologically protected: T₁ and T₂ theoretically exponential in system length exp(L/ξ)',
    connectivity: 'T-junction / Y-junction nanowire networks for non-Abelian braiding operations',
    hamiltonian: 'H = ∫ dx Ψ† [-ℏ²∂_x²/(2m*) - μ + iα_R σ_y ∂_x + V_Z σ_x] Ψ + Δ (Ψ_↑† Ψ_↓† + h.c.)',
    pros: [
      'Hardware-level topological error protection against local environmental decoherence',
      'Non-Abelian anyon exchange statistics for fault-tolerant geometric operations',
      'Potential to reduce surface-code physical qubit overhead by 100×'
    ],
    challenges: [
      'Demanding material quality requirements (sub-gap state suppression)',
      'Distinguishing true Majorana zero modes from trivial Andreev bound states',
      'Experimental proof of non-Abelian braiding currently under active verification'
    ],
    crossSection: {
      substrate: 'GaAs / InP wafer with buffer layer',
      layers: ['High spin-orbit InAs semiconductor nanowire core (~100 nm)', 'Epitaxially matched superconducting Al shell (10 nm)', 'Electrostatic depletion side-gates and tunnel barrier contacts'],
      junctionType: 'Majorana Zero Mode (γ_1, γ_2) localized at wire boundaries'
    }
  }
];

export const QubitModalityFabInspector: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>('superconducting');

  const mod = MODALITIES.find(m => m.id === selectedId) || MODALITIES[0];

  return (
    <div className="space-y-5 font-mono text-xs">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#09141d] border border-cyan-800/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
            <Cpu className="w-5 h-5 text-[#00e5ff]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">Physical Qubit Modality &amp; Cleanroom Fab Process Inspector</h3>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-bold">
                SEMICONDUCTOR &amp; QUANTUM FOUNDRY
              </span>
            </div>
            <p className="text-[11px] text-[#78909c]">
              Examines microfabrication processes, Hamiltonian dynamics, Dolan bridge junction barriers, and physical gate limits
            </p>
          </div>
        </div>

        {/* Modality Selector */}
        <div className="flex items-center gap-2 bg-[#050b11] p-1.5 rounded-xl border border-slate-800">
          {MODALITIES.map(item => (
            <button
              key={item.id}
              onClick={() => {
                playGateClickSound(650);
                setSelectedId(item.id);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedId === item.id
                  ? 'bg-[#00e5ff] text-[#02060a] shadow-xs shadow-[#00e5ff]/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              {item.name.split(' (')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Modality Deep-Dive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Fabrication Cross-Section & Hamiltonian Formulation (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="p-4 rounded-xl bg-[#050b11] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-white text-xs uppercase flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Microfabrication Cross-Section &amp; Material Stacks</span>
              </span>
              <span className="text-[10px] text-cyan-300">{mod.category}</span>
            </div>

            {/* Visual Material Stack Diagram */}
            <div className="p-4 rounded-xl bg-[#02050b] border border-slate-850 space-y-2">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Thin-Film Deposition Stack:</div>
              
              <div className="space-y-1.5 font-mono text-[11px]">
                {mod.crossSection.layers.map((layer, idx) => (
                  <div key={idx} className="p-2 rounded bg-[#09141d] border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-300 font-bold">{layer}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                      Layer {idx + 1}
                    </span>
                  </div>
                ))}
                
                <div className="p-2.5 rounded bg-slate-900 border border-slate-750 flex justify-between items-center text-slate-400">
                  <span>Substrate Wafer: <strong className="text-white">{mod.crossSection.substrate}</strong></span>
                  <span className="text-[10px] text-purple-300">Base Wafer</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-[11px] pt-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Cleanroom Fab Recipe:</span>
                <span className="text-white text-right max-w-sm">{mod.fabProcess}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Junction / Trap Interface:</span>
                <span className="text-cyan-300 font-bold">{mod.crossSection.junctionType}</span>
              </div>
            </div>
          </div>

          {/* Hamiltonian Physics Card */}
          <div className="p-4 rounded-xl bg-[#050b11] border border-slate-800 space-y-2 font-mono text-xs">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Physical Qubit Hamiltonian (Second-Quantized):</span>
            <div className="p-3 rounded-xl bg-[#02050b] border border-purple-800/40 text-purple-200 text-xs font-bold overflow-x-auto">
              {mod.hamiltonian}
            </div>
          </div>

        </div>

        {/* Right: Technical Specs & Engineering Tradeoffs (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="p-4 rounded-xl bg-[#09141d] border border-cyan-800/40 space-y-3 font-mono text-xs">
            <span className="text-[10px] text-slate-400 uppercase font-bold block pb-1 border-b border-slate-800">
              Operational Performance Parameters
            </span>

            <div className="space-y-2 text-[11px]">
              <div className="p-2 rounded bg-slate-950 border border-slate-850 flex justify-between">
                <span className="text-slate-400">Cryogenic / Operating Temp:</span>
                <span className="text-cyan-300 font-bold">{mod.operatingTemp}</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-850 flex justify-between">
                <span className="text-slate-400">Gate Execution Speed:</span>
                <span className="text-emerald-400 font-bold">{mod.gateSpeed}</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-850 flex justify-between">
                <span className="text-slate-400">Quantum Coherence Lifetime:</span>
                <span className="text-purple-300 font-bold">{mod.coherenceTime}</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-850 flex justify-between">
                <span className="text-slate-400">Qubit-to-Qubit Connectivity:</span>
                <span className="text-amber-300 font-bold text-right">{mod.connectivity}</span>
              </div>
            </div>
          </div>

          {/* Tradeoff Matrix */}
          <div className="p-4 rounded-xl bg-[#050b11] border border-slate-800 space-y-3 font-mono text-xs">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Engineering Tradeoff Analysis:</span>
            
            <div className="space-y-1.5 text-[10px]">
              <span className="text-emerald-400 font-bold block">✓ Industrial Advantages:</span>
              {mod.pros.map((p, i) => (
                <div key={i} className="flex items-start gap-1.5 text-slate-300">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{p}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1.5 text-[10px] pt-2 border-t border-slate-800">
              <span className="text-amber-400 font-bold block">⚠ Primary Scaling Bottlenecks:</span>
              {mod.challenges.map((c, i) => (
                <div key={i} className="flex items-start gap-1.5 text-slate-400">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

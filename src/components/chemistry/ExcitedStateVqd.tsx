import React, { useMemo } from 'react';
import { Sparkles, Activity, Sun, Layers, ArrowUpRight, Info } from 'lucide-react';
import { IndustrialMolecule, ExcitedStateSpec } from './ChemistryTypes';
import { getExcitedStates } from './IndustrialMolecules';

interface ExcitedStateVqdProps {
  molecule: IndustrialMolecule;
  groundEnergy: number;
}

export const ExcitedStateVqd: React.FC<ExcitedStateVqdProps> = ({ molecule, groundEnergy }) => {
  const states = useMemo(() => {
    return getExcitedStates(molecule, groundEnergy);
  }, [molecule, groundEnergy]);

  // Generate UV-Vis absorption spectrum points (wavelengths in nm: 180nm to 650nm)
  const uvVisSpectrum = useMemo(() => {
    const points: Array<{ lambda: number; absorbance: number }> = [];
    const peaks = states.filter(s => s.excitationEnergy_eV > 0).map(s => {
      // lambda (nm) = 1239.84 / E(eV)
      const wl = Math.round(1239.84 / s.excitationEnergy_eV);
      return { wl, strength: s.oscillatorStrength };
    });

    for (let wl = 160; wl <= 600; wl += 5) {
      let abs = 0;
      peaks.forEach(p => {
        // Gaussian broadening with sigma = 20nm
        const sigma = 18;
        abs += p.strength * Math.exp(-Math.pow(wl - p.wl, 2) / (2 * Math.pow(sigma, 2)));
      });
      points.push({ lambda: wl, absorbance: +abs.toFixed(3) });
    }

    return { points, peaks };
  }, [states]);

  const maxAbsorbance = Math.max(0.1, ...uvVisSpectrum.points.map(p => p.absorbance));

  return (
    <div className="space-y-5 font-mono text-xs">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#09141d] border border-purple-800/40">
        <div className="flex items-center gap-2">
          <Sun className="w-4 h-4 text-purple-400" />
          <div>
            <h4 className="font-bold text-white text-xs">Variational Quantum Deflation (VQD) &amp; Photochemistry Studio</h4>
            <p className="text-[10px] text-[#78909c]">
              Solves orthogonal electronic excited states S₁, S₂, T₁ via overlap penalty deflation: E_k(θ) = ⟨H⟩ + ∑ β_j |⟨Ψ_k|Ψ_j⟩|²
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded bg-purple-950 text-purple-300 border border-purple-800/60 text-[10px] font-bold">
          [PHOTOCHEMISTRY &amp; UV-VIS]
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Electronic State Energy Ladder (5 cols) */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-[#050b11] border border-slate-800 space-y-3">
          <span className="font-bold text-white text-xs block uppercase">Electronic State Jablonski Ladder</span>
          
          <div className="space-y-2">
            {states.map(s => {
              const isGround = s.stateIndex === 0;
              const isTriplet = s.spinMultiplicity.includes('Triplet');
              return (
                <div
                  key={s.stateIndex}
                  className={`p-3 rounded-lg border flex items-center justify-between text-[11px] ${
                    isGround
                      ? 'bg-cyan-950/40 border-cyan-800 text-cyan-200'
                      : isTriplet
                      ? 'bg-amber-950/30 border-amber-800/60 text-amber-200'
                      : 'bg-purple-950/40 border-purple-800 text-purple-200'
                  }`}
                >
                  <div>
                    <div className="font-bold text-white text-xs flex items-center gap-1.5">
                      <span>{s.label}</span>
                      <span className="text-[9px] text-slate-400">({s.spinMultiplicity})</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Energy: <strong className="text-white">{s.energy_Ha} Ha</strong>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-xs text-white">
                      {isGround ? 'Reference' : `+${s.excitationEnergy_eV} eV`}
                    </div>
                    {!isGround && (
                      <div className="text-[10px] text-slate-400">
                        f = {s.oscillatorStrength}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-lg bg-[#02050b] border border-slate-850 text-[10px] text-slate-400 leading-relaxed">
            Industrial photochemistry (solar cells, OLEDs, photodynamic cancer therapy) depends critically on non-adiabatic singlet-triplet intersystem crossing (ISC) and oscillator strengths f.
          </div>
        </div>

        {/* Right: UV-Vis Optical Absorption Spectrum (7 cols) */}
        <div className="lg:col-span-7 p-4 rounded-xl bg-[#050b11] border border-slate-800 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-xs uppercase">Simulated UV-Vis Optical Absorption Spectrum</span>
            <span className="text-[10px] text-purple-400">Dipole Allowed Transitions</span>
          </div>

          {/* SVG Spectrum Plot */}
          <div className="p-3 rounded-xl bg-[#02050b] border border-slate-850 flex items-center justify-center">
            <svg viewBox="0 0 450 180" className="w-full h-40 overflow-visible">
              <line x1="40" y1="150" x2="430" y2="150" stroke="#334155" strokeWidth="1.5" />
              <line x1="40" y1="20" x2="40" y2="150" stroke="#334155" strokeWidth="1.5" />

              {/* X axis ticks (180nm to 600nm) */}
              {[200, 300, 400, 500, 600].map(wl => {
                const x = 40 + ((wl - 160) / 440) * 390;
                return (
                  <g key={wl}>
                    <line x1={x} y1="147" x2={x} y2="153" stroke="#64748b" />
                    <text x={x} y="165" fill="#94a3b8" fontSize="9" textAnchor="middle">{wl}nm</text>
                  </g>
                );
              })}

              <text x="32" y="150" fill="#64748b" fontSize="8" textAnchor="end">0.0</text>
              <text x="32" y="25" fill="#64748b" fontSize="8" textAnchor="end">Max</text>

              {/* Spectrum path */}
              <path
                d={uvVisSpectrum.points.map((pt, i) => {
                  const x = 40 + ((pt.lambda - 160) / 440) * 390;
                  const y = 150 - (pt.absorbance / maxAbsorbance) * 125;
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}
                fill="none"
                stroke="#c084fc"
                strokeWidth="2.5"
              />

              {/* Peak annotations */}
              {uvVisSpectrum.peaks.map((p, idx) => {
                if (p.wl < 160 || p.wl > 600) return null;
                const x = 40 + ((p.wl - 160) / 440) * 390;
                const y = 150 - (p.strength / maxAbsorbance) * 125;
                return (
                  <g key={idx}>
                    <circle cx={x} cy={y} r="4" fill="#f59e0b" />
                    <text x={x} y={y - 8} fill="#fde68a" fontSize="9" textAnchor="middle" fontWeight="bold">
                      {p.wl}nm
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-400">
            <span>Spectral Range: <strong>Vacuum UV to Visible (160–600 nm)</strong></span>
            <span>HOMO-LUMO Gap: <strong className="text-cyan-300">{molecule.homoLumoGap_eV} eV</strong></span>
          </div>
        </div>

      </div>

    </div>
  );
};

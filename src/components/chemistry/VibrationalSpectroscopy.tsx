import React, { useMemo } from 'react';
import { IndustrialMolecule } from './ChemistryTypes';
import { Activity, Radio, Sparkles, TrendingDown, Info } from 'lucide-react';

interface VibrationalSpectroscopyProps {
  molecule: IndustrialMolecule;
  bondDistance: number;
}

export const VibrationalSpectroscopy: React.FC<VibrationalSpectroscopyProps> = ({
  molecule,
  bondDistance
}) => {
  // Compute vibrational frequency & harmonic force constant
  const vibProps = useMemo(() => {
    // Reduced mass mu = (m1 * m2)/(m1 + m2) in amu
    let m1 = 1.008; // default H
    let m2 = 1.008;
    if (molecule.id === 'LiH') { m1 = 6.94; m2 = 1.008; }
    else if (molecule.id === 'H2O') { m1 = 15.999; m2 = 2.016; }
    else if (molecule.id === 'N2') { m1 = 14.007; m2 = 14.007; }
    else if (molecule.id === 'CO2') { m1 = 12.011; m2 = 31.998; }
    else if (molecule.id === 'LiCoO2') { m1 = 58.93; m2 = 32.0; }
    else if (molecule.id === 'FeMoco') { m1 = 55.85; m2 = 32.06; }

    const mu = (m1 * m2) / (m1 + m2);

    // Harmonic force constant k = d^2 V / dR^2 at R_e (in N/m)
    const baseK = molecule.id === 'N2' ? 2295 : molecule.id === 'CO2' ? 1860 : molecule.id === 'H2' ? 575 : molecule.id === 'H2O' ? 845 : 380;
    
    // Anharmonic softening if stretched away from R_e
    const stretchRatio = bondDistance / molecule.equilibriumR;
    const forceConstant = Math.max(80, baseK * Math.exp(-2.2 * (stretchRatio - 1)));

    // nu_tilde (cm^-1) = (1 / (2 * pi * c)) * sqrt(k / mu)
    // 1 amu = 1.66054e-27 kg, c = 2.99792e10 cm/s
    const nu_cm1 = Math.round(130.28 * Math.sqrt(forceConstant / mu));

    // Zero-Point Vibrational Energy: ZPVE = 0.5 * h * c * nu (in mHa)
    // 1 cm^-1 = 4.55633e-6 Hartrees
    const zpve_mHa = +(0.5 * nu_cm1 * 4.55633e-3).toFixed(2);
    const zpve_kcal = +(zpve_mHa * 0.6275).toFixed(2);

    return {
      forceConstant: Math.round(forceConstant),
      reducedMass: +mu.toFixed(3),
      wavenumber: nu_cm1,
      zpve_mHa,
      zpve_kcal
    };
  }, [molecule, bondDistance]);

  // Generate IR Transmittance Spectrum (Wavenumber 400 to 4000 cm^-1)
  const irSpectrum = useMemo(() => {
    const points: Array<{ nu: number; transmittance: number }> = [];
    const peakNu = vibProps.wavenumber;
    const width = 80;

    for (let nu = 400; nu <= 4000; nu += 25) {
      // Gaussian absorption dip in transmittance
      const absorbance = 0.85 * Math.exp(-Math.pow(nu - peakNu, 2) / (2 * Math.pow(width, 2)));
      const t = Math.max(15, 100 - absorbance * 85);
      points.push({ nu, transmittance: +t.toFixed(1) });
    }

    return points;
  }, [vibProps.wavenumber]);

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#09141d] border border-cyan-800/40">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-[#00e5ff]" />
          <div>
            <h4 className="font-bold text-white text-xs">Molecular Vibrational Modes &amp; FTIR Infrared Spectroscopy</h4>
            <p className="text-[10px] text-[#78909c]">
              Extracts Born-Oppenheimer potential curvature k = &#8706;&#178;V/&#8706;R&#178; to predict zero-point vibrational energy (ZPVE) and fundamental IR absorption
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-slate-400">Harmonic Stretch: <strong className="text-cyan-300">{vibProps.wavenumber} cm&#8315;&#185;</strong></span>
          <span className="text-slate-400">ZPVE: <strong className="text-amber-400">{vibProps.zpve_mHa} mHa</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* FTIR Spectrum SVG (8 cols) */}
        <div className="lg:col-span-8 p-4 rounded-xl bg-[#050b11] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-xs uppercase">Simulated FTIR Infrared Transmission Spectrum</span>
            <span className="text-[10px] text-slate-400">Transmittance (%T) vs Wavenumber (cm&#8315;&#185;)</span>
          </div>

          <div className="p-3 rounded-xl bg-[#02050b] border border-slate-850 flex items-center justify-center">
            <svg viewBox="0 0 500 180" className="w-full h-40 overflow-visible">
              <line x1="40" y1="150" x2="480" y2="150" stroke="#334155" strokeWidth="1" />
              <line x1="40" y1="20" x2="40" y2="150" stroke="#334155" strokeWidth="1" />

              {/* Ticks on X (4000 to 400 cm^-1 standard IR reverse direction) */}
              {[4000, 3000, 2000, 1000, 400].map(nu => {
                const x = 40 + ((4000 - nu) / 3600) * 430;
                return (
                  <g key={nu}>
                    <line x1={x} y1="147" x2={x} y2="153" stroke="#64748b" />
                    <text x={x} y="165" fill="#94a3b8" fontSize="9" textAnchor="middle">{nu}</text>
                  </g>
                );
              })}

              <text x="32" y="150" fill="#64748b" fontSize="8" textAnchor="end">0%</text>
              <text x="32" y="85" fill="#64748b" fontSize="8" textAnchor="end">50%</text>
              <text x="32" y="25" fill="#64748b" fontSize="8" textAnchor="end">100%</text>

              {/* Spectrum path */}
              <path
                d={irSpectrum.map((pt, i) => {
                  const x = 40 + ((4000 - pt.nu) / 3600) * 430;
                  const y = 150 - (pt.transmittance / 100) * 125;
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}
                fill="none"
                stroke="#00e5ff"
                strokeWidth="2"
              />

              {/* Fundamental Peak Indicator */}
              <g>
                <circle
                  cx={40 + ((4000 - vibProps.wavenumber) / 3600) * 430}
                  cy={150 - (15 / 100) * 125}
                  r="4"
                  fill="#f59e0b"
                />
                <text
                  x={40 + ((4000 - vibProps.wavenumber) / 3600) * 430}
                  y={150 - (15 / 100) * 125 + 14}
                  fill="#fcd34d"
                  fontSize="9"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {vibProps.wavenumber} cm&#8315;&#185; (Fundamental)
                </text>
              </g>
            </svg>
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-500">
            <span>Spectral Window: Mid-Infrared (400–4000 cm&#8315;&#185;)</span>
            <span>Force Constant k: <strong className="text-slate-300">{vibProps.forceConstant} N/m</strong></span>
            <span>Reduced Mass &#956;: <strong className="text-slate-300">{vibProps.reducedMass} amu</strong></span>
          </div>
        </div>

        {/* Telemetry Cards (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-3 font-mono text-xs">
          
          <div className="p-4 rounded-xl bg-[#09141d] border border-slate-800 space-y-2.5">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Quantum Vibrational Telemetry</span>

            <div className="p-2 rounded bg-slate-950 border border-slate-850 flex justify-between">
              <span className="text-slate-400">Zero-Point Energy (ZPVE):</span>
              <span className="text-amber-400 font-bold">{vibProps.zpve_mHa} mHa</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-850 flex justify-between">
              <span className="text-slate-400">Thermochemical ZPVE:</span>
              <span className="text-white font-bold">{vibProps.zpve_kcal} kcal/mol</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-850 flex justify-between">
              <span className="text-slate-400">Vibrational Period &#964;:</span>
              <span className="text-cyan-300 font-bold">{(33.356 / (vibProps.wavenumber / 1000)).toFixed(1)} fs</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[10px] text-slate-400 leading-relaxed">
            Zero-Point Vibrational Energy (ZPVE) arises from quantum mechanical Heisenberg uncertainty &#916;x &#916;p &#8805; &#295;/2. Even at absolute zero (T = 0 K), molecular nuclei continue to oscillate in the ground state harmonic well.
          </div>

        </div>

      </div>

    </div>
  );
};

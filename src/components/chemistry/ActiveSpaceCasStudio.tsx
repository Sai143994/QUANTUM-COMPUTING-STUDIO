import React, { useState, useMemo } from 'react';
import { IndustrialMolecule } from './ChemistryTypes';
import { Layers, Sliders, Info, CheckCircle2, Zap, ArrowRight, Table } from 'lucide-react';

interface ActiveSpaceCasStudioProps {
  molecule: IndustrialMolecule;
}

export const ActiveSpaceCasStudio: React.FC<ActiveSpaceCasStudioProps> = ({ molecule }) => {
  const [selectedCas, setSelectedCas] = useState<string>('cas44');
  const [integralView, setIntegralView] = useState<'one_body' | 'two_body'>('one_body');

  const casConfig = useMemo(() => {
    if (selectedCas === 'cas22') {
      return { activeElectrons: 2, activeOrbitals: 2, coreOrbitals: Math.max(0, Math.floor((molecule.electrons - 2) / 2)), virtualOrbitals: 4, qubits: 4 };
    } else if (selectedCas === 'cas44') {
      return { activeElectrons: Math.min(molecule.electrons, 4), activeOrbitals: 4, coreOrbitals: Math.max(0, Math.floor((molecule.electrons - 4) / 2)), virtualOrbitals: 3, qubits: 8 };
    } else if (selectedCas === 'cas66') {
      return { activeElectrons: Math.min(molecule.electrons, 6), activeOrbitals: 6, coreOrbitals: Math.max(0, Math.floor((molecule.electrons - 6) / 2)), virtualOrbitals: 2, qubits: 12 };
    } else {
      // Full active space
      return { activeElectrons: molecule.electrons, activeOrbitals: molecule.activeOrbitals, coreOrbitals: 0, virtualOrbitals: 1, qubits: molecule.qubits.jordan_wigner };
    }
  }, [selectedCas, molecule]);

  // Generate 4x4 One-Body Core Hamiltonian Integrals h_pq (in Hartrees)
  const oneBodyMatrix = useMemo(() => {
    const dim = 4;
    const matrix: number[][] = [];
    for (let p = 0; p < dim; p++) {
      const row: number[] = [];
      for (let q = 0; q < dim; q++) {
        if (p === q) {
          row.push(+(-1.25 + p * 0.42).toFixed(4));
        } else {
          row.push(+(0.08 / (Math.abs(p - q) + 1)).toFixed(4));
        }
      }
      matrix.push(row);
    }
    return matrix;
  }, []);

  // Sample Two-Body Coulomb Integrals g_pqrs (Mulliken notation: (pq|rs))
  const sampleTwoBody = useMemo(() => {
    return [
      { notation: '(00|00)', value: 0.6744, type: 'Coulomb J₀₀' },
      { notation: '(00|11)', value: 0.5218, type: 'Coulomb J₀₁' },
      { notation: '(01|01)', value: 0.1812, type: 'Exchange K₀₁' },
      { notation: '(11|11)', value: 0.6289, type: 'Coulomb J₁₁' },
      { notation: '(01|23)', value: 0.0435, type: 'Correlated Hopping' },
      { notation: '(22|33)', value: 0.4891, type: 'Virtual Coulomb J₂₃' }
    ];
  }, []);

  return (
    <div className="space-y-5 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#09141d] border border-cyan-800/40">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#00e5ff]" />
          <div>
            <h4 className="font-bold text-white text-xs">Complete Active Space (CASSCF) &amp; Molecular Integrals</h4>
            <p className="text-[10px] text-[#78909c]">
              Partitions multi-electron Hilbert space into frozen core, dynamically entangled active orbitals, and discarded virtual space
            </p>
          </div>
        </div>

        {/* CAS Selector */}
        <div className="flex items-center gap-1 bg-[#050b11] p-1 rounded-lg border border-slate-800 text-[11px]">
          {[
            { id: 'cas22', label: 'CAS(2e, 2o)' },
            { id: 'cas44', label: 'CAS(4e, 4o)' },
            { id: 'cas66', label: 'CAS(6e, 6o)' },
            { id: 'full', label: 'Full CI Space' }
          ].map(cas => (
            <button
              key={cas.id}
              onClick={() => setSelectedCas(cas.id)}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                selectedCas === cas.id ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {cas.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Active Space Orbital Energy Diagram (6 cols) */}
        <div className="lg:col-span-6 p-4 rounded-xl bg-[#050b11] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-xs uppercase">Active Space Orbital Partitioning</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
              {casConfig.qubits} Qubits on QPU
            </span>
          </div>

          {/* Visual Orbital Ladder */}
          <div className="p-4 rounded-xl bg-[#02050b] border border-slate-850 space-y-3">
            
            {/* Virtual Orbitals */}
            <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800 border-dashed space-y-1">
              <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase">
                <span>Virtual Unoccupied Orbitals ({casConfig.virtualOrbitals} MOs)</span>
                <span>Discarded (Perturbative)</span>
              </div>
              <div className="flex gap-2">
                {Array.from({ length: Math.min(4, casConfig.virtualOrbitals) }).map((_, i) => (
                  <div key={i} className="flex-1 py-1 rounded bg-slate-900 border border-slate-800 text-center text-slate-500 text-[10px]">
                    LUMO+{i + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Active Space (Entangled on Quantum Processor) */}
            <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/60 space-y-2">
              <div className="flex justify-between text-[10px] text-cyan-300 font-bold uppercase">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  <span>Quantum Active Space: CAS({casConfig.activeElectrons}e, {casConfig.activeOrbitals}o)</span>
                </span>
                <span className="text-white">{casConfig.qubits} Entangled Qubits</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="p-2 rounded bg-[#09141d] border border-cyan-800 text-center">
                  <span className="block text-[9px] text-slate-400">HOMO-1</span>
                  <span className="text-white font-bold text-xs">⇈ (2e)</span>
                </div>
                <div className="p-2 rounded bg-[#09141d] border border-cyan-800 text-center">
                  <span className="block text-[9px] text-slate-400">HOMO</span>
                  <span className="text-white font-bold text-xs">⇈ (2e)</span>
                </div>
                <div className="p-2 rounded bg-[#09141d] border border-purple-800 text-center">
                  <span className="block text-[9px] text-purple-300">LUMO</span>
                  <span className="text-slate-400 font-bold text-xs">○ (0e)</span>
                </div>
                <div className="p-2 rounded bg-[#09141d] border border-purple-800 text-center">
                  <span className="block text-[9px] text-purple-300">LUMO+1</span>
                  <span className="text-slate-400 font-bold text-xs">○ (0e)</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 block leading-tight">
                Static correlation and multi-reference entanglement are computed with full exponential accuracy on the quantum hardware.
              </span>
            </div>

            {/* Core Orbitals */}
            <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-800/60 space-y-1">
              <div className="flex justify-between text-[10px] text-emerald-300 font-bold uppercase">
                <span>Frozen Core Orbitals ({casConfig.coreOrbitals} MOs)</span>
                <span>Mean-Field (Hartree-Fock)</span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 py-1 rounded bg-emerald-950/80 border border-emerald-700 text-center text-emerald-200 text-[10px]">
                  1s² Core (Frozen)
                </div>
                {casConfig.coreOrbitals > 1 && (
                  <div className="flex-1 py-1 rounded bg-emerald-950/80 border border-emerald-700 text-center text-emerald-200 text-[10px]">
                    2s² Core (Frozen)
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Right: Electronic Hamiltonian Integrals (h_pq & g_pqrs) (6 cols) */}
        <div className="lg:col-span-6 p-4 rounded-xl bg-[#050b11] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-xs uppercase flex items-center gap-1.5">
              <Table className="w-3.5 h-3.5 text-cyan-400" />
              <span>Molecular Integrals Tensor H_e</span>
            </span>

            {/* Toggle View */}
            <div className="flex items-center gap-1 bg-[#09141d] p-1 rounded-lg border border-slate-800 text-[10px]">
              <button
                onClick={() => setIntegralView('one_body')}
                className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                  integralView === 'one_body' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                1-Body h_pq
              </button>
              <button
                onClick={() => setIntegralView('two_body')}
                className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                  integralView === 'two_body' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                2-Body (pq|rs)
              </button>
            </div>
          </div>

          {integralView === 'one_body' ? (
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 block">
                One-Electron Core Integrals h_pq = ⟨p| -½∇² - ∑ (Z_A/r_A) |q⟩ (Kinetic + Nuclear Attraction)
              </span>
              <div className="p-3 rounded-xl bg-[#02050b] border border-slate-850 overflow-x-auto">
                <table className="w-full text-center text-[11px]">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-800">
                      <th className="p-1">p \ q</th>
                      <th className="p-1 text-cyan-400">0 (1σ)</th>
                      <th className="p-1 text-cyan-400">1 (2σ)</th>
                      <th className="p-1 text-cyan-400">2 (1π)</th>
                      <th className="p-1 text-cyan-400">3 (2π)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {oneBodyMatrix.map((row, pIdx) => (
                      <tr key={pIdx} className="border-b border-slate-850/60">
                        <td className="p-1.5 font-bold text-slate-500">{pIdx}</td>
                        {row.map((val, qIdx) => (
                          <td key={qIdx} className={`p-1.5 font-mono ${pIdx === qIdx ? 'text-cyan-300 font-bold' : 'text-slate-400'}`}>
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 block">
                Two-Electron Repulsion Integrals (ERI) g_pqrs = ⟨pq| 1/r₁₂ |rs⟩ (Coulomb J &amp; Exchange K)
              </span>
              <div className="grid grid-cols-2 gap-2">
                {sampleTwoBody.map((term, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-[#02050b] border border-slate-850 flex items-center justify-between text-[11px]">
                    <div>
                      <span className="font-bold text-purple-300 block">{term.notation}</span>
                      <span className="text-[9px] text-slate-500">{term.type}</span>
                    </div>
                    <span className="font-bold text-cyan-300">{term.value} Ha</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 rounded-lg bg-[#02050b] border border-slate-850 text-[10px] text-slate-400 leading-relaxed">
            These integrals are fed directly into the Second-Quantized Jordan-Wigner Hamiltonian generator to construct the multi-qubit Pauli operator algebra.
          </div>
        </div>

      </div>
    </div>
  );
};

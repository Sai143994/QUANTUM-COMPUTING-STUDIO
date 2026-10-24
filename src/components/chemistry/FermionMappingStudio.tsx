import React from 'react';
import { FermionMapping, PauliTerm, IndustrialMolecule } from './ChemistryTypes';
import { Layers, Network, Zap, CheckCircle2, Shield, Info, ArrowRight } from 'lucide-react';

interface FermionMappingStudioProps {
  molecule: IndustrialMolecule;
  selectedMapping: FermionMapping;
  onSelectMapping: (m: FermionMapping) => void;
  pauliTerms: PauliTerm[];
}

export const FermionMappingStudio: React.FC<FermionMappingStudioProps> = ({
  molecule,
  selectedMapping,
  onSelectMapping,
  pauliTerms
}) => {
  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#09141d] border border-cyan-800/40">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#00e5ff]" />
          <div>
            <h4 className="font-bold text-white text-xs">Second-Quantized Fermion-to-Qubit Isomorphism Studio</h4>
            <p className="text-[10px] text-[#78909c]">
              Maps electronic creation/annihilation operators a_p†, a_q satisfying CAR {`{a_p, a_q†} = δ_pq`} into non-local Pauli operators
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 text-[10px] font-bold">
          [FERMION ALGEBRA TRANSFORMATION]
        </span>
      </div>

      {/* Mapping Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          {
            id: 'jordan_wigner' as const,
            name: 'Jordan-Wigner (JW)',
            qubits: molecule.qubits.jordan_wigner,
            locality: 'O(N) Non-Local',
            desc: 'Encodes electron occupation directly into individual qubits: |n_k⟩ → |q_k⟩. Requires long Z-parity chains a_j† = (⊗_{k<j} Z_k) σ_j⁺.',
            pros: 'Direct occupation readout, simple circuit state preparation.',
            badge: 'Standard Basis'
          },
          {
            id: 'bravyi_kitaev' as const,
            name: 'Bravyi-Kitaev (BK)',
            qubits: molecule.qubits.bravyi_kitaev,
            locality: 'O(log N) Quasi-Local',
            desc: 'Encodes partial parity and occupation across a binary Fenwick tree. Bounds Pauli weight to logarithmic depth O(log N).',
            pros: 'Reduces CNOT count and circuit depth for large molecules.',
            badge: 'Logarithmic Weight'
          },
          {
            id: 'parity_2q_reduced' as const,
            name: 'Parity + 2Q Reduction (Z₂)',
            qubits: molecule.qubits.parity_reduced,
            locality: 'O(N) with Z₂ Tapering',
            desc: 'Encodes cumulative parity. Exploits Z₂ spin-up and spin-down particle number symmetry to taper off exactly 2 qubits.',
            pros: 'Saves 2 physical qubits with identical eigenvalue spectrum.',
            badge: 'Hardware Efficient'
          }
        ].map(m => {
          const isSelected = selectedMapping === m.id;
          return (
            <div
              key={m.id}
              onClick={() => onSelectMapping(m.id)}
              className={`p-4 rounded-xl border text-left cursor-pointer transition-all space-y-2.5 ${
                isSelected
                  ? 'bg-cyan-950/60 border-[#00e5ff] shadow-md shadow-cyan-500/20 scale-[1.02]'
                  : 'bg-[#050b11] border-slate-800 hover:border-slate-700 hover:bg-[#09141d]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">{m.name}</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                  isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  {m.qubits} Qubits
                </span>
              </div>

              <div className="text-[10px] text-cyan-400 font-bold">
                Pauli Weight: {m.locality}
              </div>

              <p className="text-[10px] text-slate-400 leading-relaxed">
                {m.desc}
              </p>

              <div className="pt-2 border-t border-slate-800/80 text-[10px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>{m.pros}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pauli Operator Expansion Stream */}
      <div className="p-4 rounded-xl bg-[#050b11] border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="font-bold text-white text-xs flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Second-Quantized Pauli Terms ({pauliTerms.length} Operators)</span>
          </span>
          <span className="text-[10px] text-slate-500">
            H_qubit = ∑ c_k · P_k where P_k ∈ {`{I, X, Y, Z}`}^N
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
          {pauliTerms.map((term, idx) => (
            <div key={idx} className="p-2 rounded-lg bg-[#09141d] border border-slate-850 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500">#{idx}</span>
                <span className="font-bold text-slate-200">{term.pauli}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] px-1 rounded bg-slate-800 text-slate-400">w={term.weight}</span>
                <span className={`font-bold ${term.coefficient < 0 ? 'text-rose-400' : 'text-cyan-300'}`}>
                  {term.coefficient > 0 ? `+${term.coefficient}` : term.coefficient}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

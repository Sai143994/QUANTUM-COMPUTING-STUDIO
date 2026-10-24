import React, { useMemo } from 'react';
import { ChemistryAnsatz, IndustrialMolecule } from './ChemistryTypes';
import { GitBranch, Layers, Zap, Info, ShieldCheck } from 'lucide-react';

interface AnsatzCircuitViewerProps {
  ansatz: ChemistryAnsatz;
  molecule: IndustrialMolecule;
  numQubits: number;
}

export const AnsatzCircuitViewer: React.FC<AnsatzCircuitViewerProps> = ({
  ansatz,
  molecule,
  numQubits
}) => {
  const circuitMetrics = useMemo(() => {
    let cnotCount = 0;
    let singleQubitGates = 0;
    let depth = 0;
    let parameterCount = 0;

    if (ansatz === 'uccsd') {
      // UCCSD: Singles + Doubles
      parameterCount = Math.max(2, Math.round(molecule.activeOrbitals * 1.5));
      cnotCount = numQubits >= 4 ? (numQubits - 1) * 8 + 12 : 6;
      singleQubitGates = cnotCount * 2 + numQubits;
      depth = Math.round(cnotCount * 1.8 + 6);
    } else if (ansatz === 'k_upccgsd') {
      parameterCount = Math.max(2, molecule.activeOrbitals);
      cnotCount = (numQubits - 1) * 4;
      singleQubitGates = cnotCount * 2;
      depth = Math.round(cnotCount * 1.2 + 4);
    } else if (ansatz === 'hardware_efficient') {
      parameterCount = numQubits * 4;
      cnotCount = (numQubits - 1) * 2;
      singleQubitGates = numQubits * 6;
      depth = 12;
    } else {
      // adapt_vqe
      parameterCount = Math.max(3, molecule.activeOrbitals);
      cnotCount = parameterCount * 8;
      singleQubitGates = cnotCount * 2;
      depth = Math.round(cnotCount * 1.4);
    }

    return { cnotCount, singleQubitGates, depth, parameterCount };
  }, [ansatz, molecule, numQubits]);

  return (
    <div className="space-y-4 font-mono text-xs">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#09141d] border border-cyan-800/40">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-[#00e5ff]" />
          <div>
            <h4 className="font-bold text-white text-xs">Variational Wavefunction Ansatz Quantum Circuit Synthesis</h4>
            <p className="text-[10px] text-[#78909c]">
              Compiles excitation generators e^(&#964;) into CNOT entangling ladders and parameterized single-qubit rotations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-slate-400">Circuit Depth: <strong className="text-cyan-300">{circuitMetrics.depth}</strong></span>
          <span className="text-slate-400">CNOT Count: <strong className="text-purple-400">{circuitMetrics.cnotCount}</strong></span>
          <span className="text-slate-400">Free Parameters: <strong className="text-amber-400">{circuitMetrics.parameterCount} (&#952;)</strong></span>
        </div>
      </div>

      {/* Schematic Circuit Wire Canvas */}
      <div className="p-4 rounded-2xl bg-[#02050b] border border-slate-800 overflow-x-auto">
        <div className="min-w-[620px] space-y-3">
          
          <div className="text-[10px] text-slate-500 pb-2 border-b border-slate-850 flex justify-between">
            <span>Reference State: |Φ₀⟩ = |1100...⟩ (Hartree-Fock)</span>
            <span>Single Excitation Layer: exp(θ₁·(a†a - h.c.))</span>
            <span>Double Excitation Entangler: exp(θ₂·(a†a†aa - h.c.))</span>
          </div>

          {Array.from({ length: Math.min(6, numQubits) }).map((_, qIdx) => {
            const isOccupiedInHf = qIdx < Math.min(2, numQubits / 2);
            return (
              <div key={qIdx} className="flex items-center gap-2">
                <div className="w-16 font-bold text-slate-400 text-[11px]">q[{qIdx}]</div>

                <div className="flex-1 h-10 rounded-lg bg-[#09141d] border border-slate-850/80 relative flex items-center px-2">
                  <div className="w-full h-0.5 bg-slate-700 absolute left-0 right-0 z-0" />

                  <div className="relative z-10 flex items-center gap-3 w-full">
                    {/* Reference State X Gate if occupied */}
                    {isOccupiedInHf ? (
                      <div className="w-7 h-7 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 flex items-center justify-center font-bold text-[10px] shadow-sm">
                        X
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded bg-slate-900 border border-slate-800 text-slate-600 flex items-center justify-center text-[10px]">
                        |0&#10217;
                      </div>
                    )}

                    {/* Single Excitation Rotations */}
                    <div className="w-12 h-7 rounded bg-cyan-950 border border-cyan-500 text-cyan-300 flex items-center justify-center font-bold text-[9px] shadow-sm">
                      Ry(&#952;&#8321;)
                    </div>

                    {/* CNOT Entangling ladder nodes */}
                    {qIdx % 2 === 0 ? (
                      <div className="w-5 h-5 rounded-full bg-purple-500 border border-white flex items-center justify-center text-[10px] text-white font-bold ml-2">
                        &#9679;
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-purple-950 border border-purple-500 text-purple-300 flex items-center justify-center font-bold text-[11px] ml-2">
                        &#8853;
                      </div>
                    )}

                    {/* Double Excitation Parameter */}
                    <div className="w-14 h-7 rounded bg-purple-950 border border-purple-500 text-purple-200 flex items-center justify-center font-bold text-[9px] ml-auto">
                      Rz(&#952;&#8322;)
                    </div>

                    {/* Final Basis Rotations */}
                    <div className="w-9 h-7 rounded bg-amber-950 border border-amber-500 text-amber-300 flex items-center justify-center font-bold text-[9px]">
                      Rx(-&#960;/2)
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

        </div>
      </div>

      {/* Ansatz Architecture Comparison Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-[#050b11] border border-cyan-800/40 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">UCCSD Chemically-Inspired</span>
          <span className="text-white font-bold text-xs block">Unitary Coupled-Cluster</span>
          <p className="text-[10px] text-slate-400">
            Gold-standard particle-conserving ansatz. Guarantees physical electron spin symmetry and immunity to non-physical Hilbert states.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#050b11] border border-purple-800/40 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">k-UpCCGSD Paired Clusters</span>
          <span className="text-purple-300 font-bold text-xs block">Low-Depth NISQ Ansatz</span>
          <p className="text-[10px] text-slate-400">
            Restricts double excitations to electron pairs (broken pairs excluded). Reduces CNOT count by 75% for near-term quantum processors.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#050b11] border border-amber-800/40 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">ADAPT-VQE Dynamic Pool</span>
          <span className="text-amber-300 font-bold text-xs block">Gradient-Grown Operator Pool</span>
          <p className="text-[10px] text-slate-400">
            Grows circuit iteratively by inserting operators with maximum gradient |&#10216;[H, A_k]&#10217;|. Minimizes gate count to exact necessity.
          </p>
        </div>
      </div>

    </div>
  );
};

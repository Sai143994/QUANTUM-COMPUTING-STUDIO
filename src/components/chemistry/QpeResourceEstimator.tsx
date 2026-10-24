import React, { useState, useMemo } from 'react';
import { IndustrialMolecule, QpeResourceEstimate } from './ChemistryTypes';
import { Cpu, ShieldCheck, Zap, Layers, Clock, TrendingUp, Info, CheckCircle2, SlidersHorizontal, ArrowRight, Activity, Sparkles } from 'lucide-react';
import { playGateClickSound } from '../../utils/audio';

interface QpeResourceEstimatorProps {
  molecule: IndustrialMolecule;
}

export const QpeResourceEstimator: React.FC<QpeResourceEstimatorProps> = ({ molecule }) => {
  const [targetError_mHa, setTargetError_mHa] = useState<number>(1.6); // 1.6 mHa standard chemical accuracy
  const [selectedAlgoIndex, setSelectedAlgoIndex] = useState<number>(0);
  const [dilutionStage, setDilutionStage] = useState<'15mK_mixing' | '100mK_cold' | '4K_cryo'>('15mK_mixing');

  // Precision scaling factor (Toffoli count scales as O(lambda / epsilon))
  const precisionFactor = 1.6 / targetError_mHa;

  const estimates: QpeResourceEstimate[] = useMemo(() => [
    {
      algorithm: 'Tensor Hypercontraction (THC)',
      logicalQubits: Math.max(8, molecule.activeOrbitals * 2 + 6),
      toffoliGates: Math.round(molecule.activeOrbitals * 4.5e5 * precisionFactor),
      tGates: Math.round(molecule.activeOrbitals * 1.8e6 * precisionFactor),
      codeDistance: targetError_mHa < 0.5 ? 25 : 21,
      physicalQubits: Math.round(Math.max(8, molecule.activeOrbitals * 2 + 6) * 2 * Math.pow(targetError_mHa < 0.5 ? 25 : 21, 2) * 1.4),
      runtime_hours: +( (0.8 + (molecule.activeOrbitals * 0.4)) * precisionFactor ).toFixed(1)
    },
    {
      algorithm: 'Qubitization (Double Factorization)',
      logicalQubits: Math.max(10, molecule.activeOrbitals * 2 + 12),
      toffoliGates: Math.round(molecule.activeOrbitals * 1.2e6 * precisionFactor),
      tGates: Math.round(molecule.activeOrbitals * 4.8e6 * precisionFactor),
      codeDistance: targetError_mHa < 0.5 ? 27 : 23,
      physicalQubits: Math.round(Math.max(10, molecule.activeOrbitals * 2 + 12) * 2 * Math.pow(targetError_mHa < 0.5 ? 27 : 23, 2) * 1.4),
      runtime_hours: +( (2.4 + (molecule.activeOrbitals * 0.9)) * precisionFactor ).toFixed(1)
    },
    {
      algorithm: 'Trotterized (First Order)',
      logicalQubits: molecule.qubits.jordan_wigner,
      toffoliGates: Math.round(molecule.activeOrbitals * 8.5e6 * precisionFactor),
      tGates: Math.round(molecule.activeOrbitals * 3.4e7 * precisionFactor),
      codeDistance: targetError_mHa < 0.5 ? 31 : 27,
      physicalQubits: Math.round(molecule.qubits.jordan_wigner * 2 * Math.pow(targetError_mHa < 0.5 ? 31 : 27, 2) * 1.4),
      runtime_hours: +( (18.5 + (molecule.activeOrbitals * 5.2)) * precisionFactor ).toFixed(1)
    }
  ], [molecule, precisionFactor, targetError_mHa]);

  const selectedEst = estimates[selectedAlgoIndex];

  // Distillation factories count: ~ 4 to 8 factories per 20 logical qubits
  const magicStateFactories = Math.max(2, Math.round(selectedEst.logicalQubits / 4));

  return (
    <div className="space-y-5 font-mono text-xs">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#050b11] border border-cyan-800/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
            <Cpu className="w-5 h-5 text-[#00e5ff]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-white">Fault-Tolerant Quantum Phase Estimation (QPE) Resource Estimator</h4>
              <span className="px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-bold">
                POST-NISQ 2028–2032+
              </span>
            </div>
            <p className="text-[11px] text-[#78909c]">
              Projects logical QPE execution costs: Block-encoding 1-norm &#955;, Toffoli gate depth, surface code distance d, and cryogenic physical footprint
            </p>
          </div>
        </div>

        {/* Target Precision Slider */}
        <div className="flex items-center gap-3 bg-[#09141d] px-3.5 py-2 rounded-xl border border-slate-800">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Target Precision (&#949;):</span>
            <span className={`font-bold text-xs ${targetError_mHa <= 1.6 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {targetError_mHa.toFixed(2)} mHa {targetError_mHa === 1.6 && '(1 kcal/mol)'}
            </span>
          </div>
          <input
            type="range"
            min="0.2"
            max="3.2"
            step="0.2"
            value={targetError_mHa}
            onChange={(e) => setTargetError_mHa(+e.target.value)}
            className="w-24 h-1.5 bg-slate-800 accent-cyan-400 rounded cursor-pointer"
          />
        </div>
      </div>

      {/* 2. Interactive Algorithm Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {estimates.map((est, idx) => {
          const isSelected = selectedAlgoIndex === idx;
          const isBest = idx === 0;
          return (
            <div
              key={idx}
              onClick={() => { playGateClickSound(650); setSelectedAlgoIndex(idx); }}
              className={`p-4 rounded-xl border space-y-3 cursor-pointer transition-all ${
                isSelected
                  ? 'bg-cyan-950/60 border-cyan-400 shadow-lg shadow-cyan-500/20 scale-[1.02]'
                  : 'bg-[#050b11] border-slate-800 hover:border-slate-700 hover:bg-[#09141d]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">{est.algorithm}</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                  isBest 
                    ? 'bg-cyan-500 text-slate-950' 
                    : isSelected 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {isBest ? 'MINIMAL OVERHEAD' : isSelected ? 'ACTIVE' : 'SELECT'}
                </span>
              </div>

              {/* Progress bar visual comparison relative to trotter */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Toffoli Gate Complexity</span>
                  <span className="text-cyan-300 font-bold">{est.toffoliGates.toExponential(2)}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(12, (est.toffoliGates / estimates[2].toffoliGates) * 100))}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Logical Qubits:</span>
                  <span className="text-white font-bold">{est.logicalQubits} Qubits</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Non-Clifford T-Gates:</span>
                  <span className="text-purple-300 font-bold">{est.tGates.toExponential(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Surface Code Distance:</span>
                  <span className="text-amber-300 font-bold">d = {est.codeDistance}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Physical Footprint:</span>
                  <span className="text-emerald-400 font-bold">~{est.physicalQubits.toLocaleString()} Qubits</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cryogenic Runtime:</span>
                  <span className="text-white font-bold">{est.runtime_hours} Hours</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Deep-Dive: Qubitization Walk & Block-Encoding Schematic */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Circuit Schematic of Block-Encoding & Qubitization Walk (7 cols) */}
        <div className="lg:col-span-7 p-4 rounded-xl bg-[#050b11] border border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-white text-xs uppercase flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Qubitization Quantum Walk Circuit: W = R_prep &#183; SELECT</span>
            </span>
            <span className="text-[10px] text-cyan-300">
              Heisenberg Limited (&#949; &#8733; 1/T)
            </span>
          </div>

          {/* Block Diagram */}
          <div className="p-3.5 rounded-xl bg-[#02050b] border border-slate-850 space-y-3">
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="w-20 font-bold text-slate-300">Phase Ancilla:</span>
              <div className="flex-1 h-8 rounded bg-[#09141d] border border-cyan-800 flex items-center justify-around px-2 text-cyan-300 font-bold">
                <span>H</span>
                <span className="text-slate-600">&#8594;</span>
                <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-600">Controlled-Walk (W)</span>
                <span className="text-slate-600">&#8594;</span>
                <span>QFT&#8224;</span>
                <span className="text-slate-600">&#8594;</span>
                <span className="text-emerald-400">Measure |&#981;&#10217;</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="w-20 font-bold text-slate-300">Selection Reg:</span>
              <div className="flex-1 h-8 rounded bg-[#09141d] border border-purple-800 flex items-center justify-around px-2 text-purple-300 font-bold">
                <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-600">PREP(&#955;)</span>
                <span className="text-slate-600">&#8594;</span>
                <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-600">SELECT(H)</span>
                <span className="text-slate-600">&#8594;</span>
                <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-600">PREP&#8224;</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="w-20 font-bold text-slate-300">System State:</span>
              <div className="flex-1 h-8 rounded bg-[#09141d] border border-slate-700 flex items-center justify-between px-3 text-slate-300">
                <span>|&#936;_target&#10217; ({molecule.electrons}e in {selectedEst.logicalQubits} logical qubits)</span>
                <span className="text-emerald-400 font-bold">Eigenstate Preserved</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
            <span>Selected Architecture: <strong className="text-white">{selectedEst.algorithm}</strong></span>
            <span>Hamiltonian 1-Norm (&#955;): <strong className="text-cyan-300">{(molecule.activeOrbitals * 14.2).toFixed(1)} Ha</strong></span>
          </div>
        </div>

        {/* Right: Dilution Refrigerator Physical Wafer Layout (5 cols) */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-[#050b11] border border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-white text-xs uppercase flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>Cryogenic 15 mK Wafer Footprint</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
              d = {selectedEst.codeDistance}
            </span>
          </div>

          {/* Visual Wafer Plaquette Layout */}
          <div className="p-3 rounded-xl bg-[#02050b] border border-slate-850 space-y-2">
            <div className="text-[10px] text-slate-400 flex justify-between">
              <span>Logical Data Patches: <strong className="text-cyan-300">{selectedEst.logicalQubits}</strong></span>
              <span>Magic State Factories: <strong className="text-purple-300">{magicStateFactories}</strong></span>
            </div>

            {/* Grid of Surface Code Patches */}
            <div className="grid grid-cols-6 gap-1 p-2 rounded-lg bg-[#010308] border border-slate-800">
              {Array.from({ length: 18 }).map((_, pIdx) => {
                const isFactory = pIdx >= 14;
                const isRouting = pIdx === 4 || pIdx === 9;
                return (
                  <div
                    key={pIdx}
                    className={`h-7 rounded flex items-center justify-center text-[8px] font-bold transition-transform hover:scale-105 ${
                      isFactory
                        ? 'bg-purple-950/80 border border-purple-500 text-purple-300'
                        : isRouting
                        ? 'bg-slate-900 border border-slate-800 text-slate-600'
                        : 'bg-cyan-950/80 border border-cyan-500 text-cyan-300'
                    }`}
                    title={isFactory ? '15-to-1 Magic State Factory' : isRouting ? 'Lattice Surgery Routing Channel' : `Logical Data Qubit Patch Q_${pIdx}`}
                  >
                    {isFactory ? 'T-Fact' : isRouting ? 'Route' : `Q${pIdx}`}
                  </div>
                );
              })}
            </div>

            <div className="p-2 rounded bg-slate-950 border border-slate-850 text-[10px] text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Physical Transmons per Logical Patch:</span>
                <span className="text-white font-bold">{2 * selectedEst.codeDistance * selectedEst.codeDistance}</span>
              </div>
              <div className="flex justify-between">
                <span>Syndrome Extraction Cycle Time:</span>
                <span className="text-cyan-300 font-bold">200 ns (1 MHz clock)</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Elevated Paradigm Comparison Table */}
      <div className="p-4 rounded-xl bg-[#050b11] border border-slate-800 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-white text-xs uppercase block">
            NISQ Variational VQE vs Fault-Tolerant QPE Industrial Paradigm Matrix
          </span>
          <span className="text-[10px] text-slate-500">
            Gold standard quantum chemistry comparison
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px]">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 bg-[#09141d]">
                <th className="p-2.5">Evaluation Dimension</th>
                <th className="p-2.5 text-cyan-400">Near-Term NISQ VQE (Present 2024–2026)</th>
                <th className="p-2.5 text-purple-400">Fault-Tolerant QPE (Future 2028+)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              <tr>
                <td className="p-2.5 font-bold text-slate-300">Energy Accuracy Guarantee</td>
                <td className="p-2.5 text-slate-400">Variational upper-bound ⟨H⟩ ≥ E₀; sensitive to shot noise &amp; barren plateaus</td>
                <td className="p-2.5 text-emerald-400 font-bold">Heisenberg-limited (1/T) exact eigenvalue projection without local minima</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-slate-300">Coherent Circuit Depth</td>
                <td className="p-2.5 text-slate-400">Shallow: O(1) to O(N²) entangling 2Q gates (within T₂ coherence time)</td>
                <td className="p-2.5 text-purple-300">Ultra-Deep: 10⁶–10⁸ Toffoli operations protected by active QEC</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-slate-300">Measurement Sample Complexity</td>
                <td className="p-2.5 text-slate-400">Massive: requires 10⁷–10⁹ Pauli expectation measurements for 1.6 mHa resolution</td>
                <td className="p-2.5 text-emerald-400 font-bold">Minimal: single or logarithmic phase register readouts yield exact energy</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-slate-300">Physical Hardware Scale</td>
                <td className="p-2.5 text-cyan-300">4–50 uncorrected physical superconducting transmons / trapped ions</td>
                <td className="p-2.5 text-amber-300">~20,000–50,000 physical qubits organized in surface-code lattice surgery</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

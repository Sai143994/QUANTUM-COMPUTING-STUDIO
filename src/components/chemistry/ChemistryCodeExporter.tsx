import React, { useState, useMemo } from 'react';
import { IndustrialMolecule, ChemistryAnsatz, ClassicalOptimizer } from './ChemistryTypes';
import { Code2, Copy, Check, Download } from 'lucide-react';

interface ChemistryCodeExporterProps {
  molecule: IndustrialMolecule;
  ansatz: ChemistryAnsatz;
  optimizer: ClassicalOptimizer;
  bondDistance: number;
}

export const ChemistryCodeExporter: React.FC<ChemistryCodeExporterProps> = ({
  molecule,
  ansatz,
  optimizer,
  bondDistance
}) => {
  const [activeCodeTab, setActiveCodeTab] = useState<'qiskit_nature' | 'openfermion' | 'pyscf'>('qiskit_nature');
  const [copied, setCopied] = useState<boolean>(false);

  // Generate Qiskit Nature 0.7+
  const qiskitNatureCode = useMemo(() => {
    return `# Qiskit Nature 0.7+ Production Electronic Structure Pipeline
from qiskit_nature.second_q.drivers import PySCFDriver
from qiskit_nature.second_q.mappers import JordanWignerMapper, ParityMapper
from qiskit_nature.second_q.circuit.library import UCCSD, HartreeFock
from qiskit_algorithms import VQE
from qiskit_algorithms.optimizers import COBYLA, SPSA
from qiskit.primitives import Estimator

# 1. Initialize PySCF Molecular Driver for ${molecule.formula}
driver = PySCFDriver(
    atom="${molecule.atoms.map(a => `${a.element} ${a.x * (bondDistance / molecule.equilibriumR)} ${a.y} ${a.z}`).join('; ')}",
    basis="sto-3g"
)
problem = driver.run()

# 2. Map Fermionic Hamiltonian to Qubit Operator
mapper = ParityMapper(num_particles=problem.num_particles)
qubit_hamiltonian = mapper.map(problem.hamiltonian.second_q_op())
print(f"Mapped Qubit Hamiltonian has {qubit_hamiltonian.num_qubits} Qubits")

# 3. Construct ${ansatz.toUpperCase()} Chemical Ansatz
ansatz = UCCSD(
    problem.num_spatial_orbitals,
    problem.num_particles,
    mapper,
    initial_state=HartreeFock(problem.num_spatial_orbitals, problem.num_particles, mapper)
)

# 4. Execute VQE Optimization
estimator = Estimator()
optimizer = ${optimizer === 'spsa' ? 'SPSA(maxiter=100)' : 'COBYLA(maxiter=80)'}

vqe = VQE(estimator, ansatz, optimizer)
result = vqe.compute_minimum_eigenvalue(qubit_hamiltonian)

print(f"Electronic Ground State: {result.eigenvalue.real:.5f} Ha")
print(f"Total Molecular Energy: {result.eigenvalue.real + problem.nuclear_repulsion_energy:.5f} Ha")
`;
  }, [molecule, ansatz, optimizer, bondDistance]);

  // Generate OpenFermion + Cirq
  const openFermionCode = useMemo(() => {
    return `# Google OpenFermion 1.6+ Electronic Hamiltonian Generator
import openfermion
from openfermion.chem import MolecularData
from openfermionpyscf import run_pyscf

# 1. Define Molecular Geometry (${molecule.name})
geometry = [
${molecule.atoms.map(a => `    ('${a.element}', (${(a.x * (bondDistance / molecule.equilibriumR)).toFixed(4)}, ${a.y}, ${a.z})),`).join('\n')}
]

molecule = MolecularData(
    geometry=geometry,
    basis='sto-3g',
    multiplicity=1,
    charge=0,
    description='${molecule.id}_active_space'
)

# 2. Run Classical Electronic Integral Calculation
molecule = run_pyscf(molecule, run_scf=1, run_fci=1)
print(f"Hartree-Fock Energy: {molecule.hf_energy:.5f} Ha")
print(f"Exact FCI Energy: {molecule.fci_energy:.5f} Ha")

# 3. Second-Quantized Fermion & Qubit Hamiltonian
fermion_hamiltonian = molecule.get_molecular_hamiltonian()
qubit_hamiltonian = openfermion.jordan_wigner(openfermion.get_fermion_operator(fermion_hamiltonian))
print(f"Number of Pauli Strings: {len(qubit_hamiltonian.terms)}")
`;
  }, [molecule, bondDistance]);

  // Generate PySCF Script
  const pyScfCode = useMemo(() => {
    return `# PySCF 2.4+ Classical Active Space (CASSCF) Integral Generator
from pyscf import gto, scf, mcscf

# 1. Molecular Structure Specification
mol = gto.M(
    atom="""
${molecule.atoms.map(a => `    ${a.element} ${(a.x * (bondDistance / molecule.equilibriumR)).toFixed(4)} ${a.y} ${a.z}`).join('\n')}
    """,
    basis='sto-3g',
    spin=0,
    charge=0
)

# 2. Mean-Field Hartree-Fock
mf = scf.RHF(mol)
mf.kernel()

# 3. Complete Active Space (CASSCF) (${molecule.electrons}e, ${molecule.activeOrbitals}o)
mycas = mcscf.CASSCF(mf, ncas=${molecule.activeOrbitals}, nelecas=${molecule.electrons})
mycas.kernel()

# Export One- and Two-Body Integrals for Quantum Processing
h1, e_core = mycas.get_h1eff()
h2 = mycas.get_h2eff()
print(f"Core Hamiltonian Matrix shape: {h1.shape}")
print(f"2-Electron Repulsion Tensor shape: {h2.shape}")
`;
  }, [molecule, bondDistance]);

  const activeContent = activeCodeTab === 'qiskit_nature' ? qiskitNatureCode : activeCodeTab === 'openfermion' ? openFermionCode : pyScfCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([activeContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${molecule.id.toLowerCase()}_${activeCodeTab}.py`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-5 rounded-2xl bg-[#050b11] border border-slate-800 space-y-4 font-mono text-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-[#00e5ff]" />
          <span className="font-bold text-white text-xs">Production Quantum Chemistry Code Exporter</span>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-[#09141d] p-1 rounded-lg border border-slate-800">
          {[
            { id: 'qiskit_nature', label: 'Qiskit Nature 0.7+' },
            { id: 'openfermion', label: 'OpenFermion + Cirq' },
            { id: 'pyscf', label: 'PySCF Driver' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCodeTab(tab.id as any)}
              className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                activeCodeTab === tab.id ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1 rounded bg-[#09141d] hover:bg-[#0c1a26] border border-slate-700 text-slate-300 text-xs flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1 rounded bg-[#09141d] hover:bg-[#0c1a26] border border-slate-700 text-slate-300 text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#00e5ff]" />
            <span>Download .py</span>
          </button>
        </div>
      </div>

      <pre className="p-4 rounded-xl bg-[#02050b] border border-slate-850 text-cyan-300 font-mono text-[11px] overflow-x-auto max-h-72 leading-relaxed">
        {activeContent}
      </pre>
    </div>
  );
};

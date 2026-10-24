import React, { useState } from 'react';
import { QpuBackend } from './TranspilerTypes';
import { Copy, Check, Code2, Download } from 'lucide-react';

interface CodeExportTabsProps {
  backend: QpuBackend;
  numQubits: number;
  transpiledGates: Array<{ step: number; type: string; qubits: number[]; isSwap?: boolean }>;
  optLevel: number;
}

export const CodeExportTabs: React.FC<CodeExportTabsProps> = ({
  backend,
  numQubits,
  transpiledGates,
  optLevel
}) => {
  const [activeCodeTab, setActiveCodeTab] = useState<'qasm3' | 'qiskit' | 'cirq' | 'pulse' | 'qir'>('qasm3');
  const [copied, setCopied] = useState<boolean>(false);

  // Generate OpenQASM 3.0
  const qasmCode = React.useMemo(() => {
    let out = `OPENQASM 3.0;\ninclude "stdgates.inc";\n\n// Backend: ${backend.name} (${backend.vendor})\n// Architecture: ${backend.architecture}\n// Optimization Level: O${optLevel}\n\n`;
    out += `qubit[${backend.qubitCount}] $q;\nbit[${numQubits}] $c;\n\n`;
    transpiledGates.forEach(op => {
      if (op.qubits.length === 1) {
        out += `${op.type.toLowerCase().replace(/[^a-z0-9]/g, '_')} $q[${op.qubits[0]}];\n`;
      } else if (op.qubits.length === 2) {
        out += `${op.type.toLowerCase().replace(/[^a-z0-9]/g, '_')} $q[${op.qubits[0]}], $q[${op.qubits[1]}];\n`;
      }
    });
    out += `\n// Readout Measurements\n`;
    for (let q = 0; q < numQubits; q++) {
      out += `$c[${q}] = measure $q[${q}];\n`;
    }
    return out;
  }, [backend, numQubits, transpiledGates, optLevel]);

  // Generate Qiskit 1.x Python
  const qiskitCode = React.useMemo(() => {
    return `# Qiskit 1.2+ Production QPU Transpilation Script
from qiskit import QuantumCircuit
from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager
from qiskit_ibm_runtime.fake_provider import FakeHeron

# 1. Target Hardware & Backend Configuration
backend = FakeHeron()  # Target: ${backend.name}
print(f"Target QPU: {backend.name} ({backend.num_qubits} Qubits)")

# 2. Build Abstract Circuit
qc = QuantumCircuit(${numQubits}, ${numQubits})
# Logical circuit operations
${transpiledGates.slice(0, 8).map(op => {
  if (op.qubits.length === 1) return `qc.${op.type.toLowerCase() === 'sx' ? 'sx' : op.type.toLowerCase() === 'h' ? 'h' : 'x'}(${op.qubits[0]})`;
  return `qc.cx(${op.qubits[0]}, ${op.qubits[1]})`;
}).join('\n')}
qc.measure_all()

# 3. Transpile via SABRE Noise-Adaptive Pass Manager
pm = generate_preset_pass_manager(optimization_level=${optLevel}, backend=backend)
transpiled_circuit = pm.run(qc)

print(f"Transpiled Depth: {transpiled_circuit.depth()}")
print(f"Native 2Q Operations: {transpiled_circuit.count_ops().get('ecr', transpiled_circuit.count_ops().get('cz', 0))}")
print(f"Layout Physical Mapping: {transpiled_circuit.layout.final_index_layout()}")
`;
  }, [backend, numQubits, transpiledGates, optLevel]);

  // Generate Google Cirq Python
  const cirqCode = React.useMemo(() => {
    return `# Google Cirq 1.4+ Target Hardware Transpilation
import cirq
from cirq.transformers import target_gatesets, optimize_for_target_gateset

# 1. Physical Grid Qubits
qubits = [cirq.GridQubit(i // 5, i % 5) for i in range(${numQubits})]

# 2. Native Gate Set (${backend.basisGates.join(', ')})
target_gateset = cirq.CZTargetGateset(
    atol=1e-8,
    allow_partial_czs=True
)

# 3. Construct Abstract Circuit
circuit = cirq.Circuit(
${transpiledGates.slice(0, 8).map(op => {
  if (op.qubits.length === 1) return `    cirq.${op.type === 'H' ? 'H' : 'X'}(qubits[${op.qubits[0]}]),`;
  return `    cirq.CZ(qubits[${op.qubits[0]}], qubits[${op.qubits[1]}]),`;
}).join('\n')}
)

# 4. Optimize for Device Topology
transpiled_circuit = optimize_for_target_gateset(circuit, gateset=target_gateset)
print(transpiled_circuit)
`;
  }, [backend, numQubits, transpiledGates]);

  // Generate OpenPulse Python
  const pulseCode = React.useMemo(() => {
    return `# Qiskit OpenPulse Calibrated Microwave Schedule
from qiskit import pulse
from qiskit.pulse import Play, Gaussian, Drag, ShiftPhase, DriveChannel

with pulse.build(name="calibrated_sx_drag") as pulse_schedule:
    d0 = DriveChannel(0)
    # Calibrated DRAG Half-Pi (SX) Microwave Envelope
    pulse.play(
        Drag(duration=140, amp=0.45, sigma=35, beta=0.35, name="sx_drag"),
        d0
    )
    # Zero-duration Virtual Z Phase Shift (McKay et al.)
    pulse.shift_phase(1.5707963, d0)

print(f"Pulse Schedule Total Duration: {pulse_schedule.duration} dt")
`;
  }, []);

  // Generate QIR (Quantum Intermediate Representation) LLVM Bitcode
  const qirCode = React.useMemo(() => {
    return `; ModuleID = 'QuantumStudio_TranspiledModule'
source_filename = "quantum_program.ll"
target datalayout = "e-m:e-p270:32:32-p271:32:32-p272:64:64-i64:64-f80:128-n8:16:32:64-S128"
target triple = "qir-target-unknown"

%Qubit = type opaque
%Result = type opaque

declare void @__quantum__qis__rz__body(double, %Qubit*)
declare void @__quantum__qis__sx__body(%Qubit*)
declare void @__quantum__qis__cz__body(%Qubit*, %Qubit*)
declare %Result* @__quantum__qis__mz__body(%Qubit*)

define void @QuantumKernel() #0 {
entry:
  ; Target QPU: ${backend.name} (Basis: ${backend.basisGates.join(', ')})
${transpiledGates.slice(0, 6).map((op, idx) => {
  if (op.qubits.length === 1) {
    return `  call void @__quantum__qis__sx__body(%Qubit* inttoptr (i64 ${op.qubits[0]} to %Qubit*))`;
  }
  return `  call void @__quantum__qis__cz__body(%Qubit* inttoptr (i64 ${op.qubits[0]} to %Qubit*), %Qubit* inttoptr (i64 ${op.qubits[1]} to %Qubit*))`;
}).join('\n')}
  ret void
}

attributes #0 = { "entry_point" "qir_profiles"="custom" }
`;
  }, [backend, transpiledGates]);

  const activeContent =
    activeCodeTab === 'qasm3'
      ? qasmCode
      : activeCodeTab === 'qiskit'
      ? qiskitCode
      : activeCodeTab === 'cirq'
      ? cirqCode
      : activeCodeTab === 'pulse'
      ? pulseCode
      : qirCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = activeCodeTab === 'qasm3' ? 'qasm' : activeCodeTab === 'qir' ? 'll' : 'py';
    const blob = new Blob([activeContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transpiled_${backend.id}_o${optLevel}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-5 rounded-2xl bg-[#050b11] border border-slate-800 space-y-3 font-mono text-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-[#00e5ff]" />
          <span className="font-bold text-white text-xs">Multi-Target Production Code Exporter</span>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-[#09141d] p-1 rounded-lg border border-slate-800">
          {[
            { id: 'qasm3', label: 'OpenQASM 3.0' },
            { id: 'qiskit', label: 'Qiskit 1.x (Python)' },
            { id: 'cirq', label: 'Google Cirq' },
            { id: 'pulse', label: 'OpenPulse (AWG)' },
            { id: 'qir', label: 'QIR (LLVM IR)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCodeTab(tab.id as any)}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                activeCodeTab === tab.id
                  ? 'bg-cyan-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1 rounded bg-[#09141d] hover:bg-[#0c1a26] border border-slate-700 text-slate-300 text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1 rounded bg-[#09141d] hover:bg-[#0c1a26] border border-slate-700 text-slate-300 text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#00e5ff]" />
            <span>Download</span>
          </button>
        </div>
      </div>

      <pre className="p-4 rounded-xl bg-[#02050b] border border-slate-850 text-cyan-300 font-mono text-[11px] overflow-x-auto max-h-64 leading-relaxed">
        {activeContent}
      </pre>
    </div>
  );
};

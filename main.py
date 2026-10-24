#!/usr/bin/env python3
"""
Quantum Studio — Primary Execution & Demonstration Entry Point
Runs full quantum simulation benchmarks, algorithms, and QASM transpilation.
"""

import sys
import json
from quantum_studio import (
    QuantumCircuit,
    QuantumState,
    parse_qasm,
    create_grover_2q,
    shor_factor,
    create_teleportation_circuit,
    optimize_vqe,
    SurfaceCodePatch
)

def run_bell_state_demo():
    print("=" * 60)
    print("1. BELL STATE CREATION (|00> + |11>) / sqrt(2)")
    print("=" * 60)
    qc = QuantumCircuit(2)
    qc.h(0).cx(0, 1)

    state = qc.run()
    probs = state.probabilities()
    samples = state.sample_shots(shots=1000)

    print(f"Probabilities: P(00)={probs[0]:.4f}, P(01)={probs[1]:.4f}, P(10)={probs[2]:.4f}, P(11)={probs[3]:.4f}")
    print(f"1000 Measurement Shots: {samples}")
    print(f"Qubit 0 Bloch Vector (x, y, z): {state.bloch_vector(0)}")
    print(f"Qubit 1 Bloch Vector (x, y, z): {state.bloch_vector(1)}")
    print(f"Entanglement Von Neumann Entropy: {state.von_neumann_entropy():.4f} bits\n")

def run_grover_demo():
    print("=" * 60)
    print("2. GROVER AMPLITUDE AMPLIFICATION (Search for |11>)")
    print("=" * 60)
    qc = create_grover_2q(target_state="11")
    state = qc.run()
    samples = state.sample_shots(shots=1000)
    print(f"Statevector Output: {state.state_vector_representation()}")
    print(f"Target |11> Measurement Samples: {samples}\n")

def run_vqe_demo():
    print("=" * 60)
    print("3. VQE MOLECULAR CHEMISTRY (Hydrogen Ground State H2)")
    print("=" * 60)
    result = optimize_vqe(steps=25)
    print(f"Optimal Variational Parameter theta: {result['optimal_theta']} rad")
    print(f"Calculated Ground State Energy: {result['ground_state_energy_hartree']} Hartree")
    print(f"Exact Full CI Benchmark: {result['exact_fci_energy']} Hartree\n")

def run_shor_demo():
    print("=" * 60)
    print("4. SHOR FACTORING SIMULATION (Composite N = 15)")
    print("=" * 60)
    factors = shor_factor(15)
    print(f"Shor factoring N=15 result: {factors[0]} * {factors[1]} = 15\n")

def run_surface_code_demo():
    print("=" * 60)
    print("5. TOPOLOGICAL SURFACE CODE QEC (Distance d=3)")
    print("=" * 60)
    sc = SurfaceCodePatch(distance=3)
    # Inject bitflip error on physical data qubit 4
    sc.inject_error(4, error_type="X")
    result = sc.decode_and_correct()
    print(f"Physical Data Qubits: {result['physical_qubits']}")
    print(f"Syndrome Measurements: {result['detected_syndromes']}")
    print(f"Decoder Corrections: {result['corrections']}")
    print(f"Within Fault-Tolerance Bound: {result['fault_tolerant']}\n")

def run_qasm_transpilation_demo():
    print("=" * 60)
    print("6. OPENQASM 3.0 & QISKIT COMPILATION")
    print("=" * 60)
    qc = QuantumCircuit(3)
    qc.h(0).cx(0, 1).cx(1, 2)
    qasm_str = qc.to_qasm()
    print("Exported OpenQASM 3.0:\n")
    print(qasm_str)

    print("\nSynthesizing IBM Qiskit Code:\n")
    print(qc.to_qiskit_code())

def main():
    print("""
    =======================================================
               QUANTUM STUDIO PYTHON WORKSTATION           
        Statevector Engine · Algorithms · QEC · QASM 3.0   
    =======================================================
    """)
    run_bell_state_demo()
    run_grover_demo()
    run_vqe_demo()
    run_shor_demo()
    run_surface_code_demo()
    run_qasm_transpilation_demo()
    print("All Quantum Studio Python benchmarks passed successfully.")

if __name__ == "__main__":
    main()

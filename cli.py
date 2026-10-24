#!/usr/bin/env python3
"""
Quantum Studio CLI — Command-Line Interface Tool
Execute QASM circuits, run benchmarks, and export Jupyter Notebooks.
"""

from __future__ import annotations
import argparse
import sys
import os
from quantum_studio import (
    QuantumCircuit,
    QuantumState,
    NoiseModel,
    parse_qasm,
    create_grover_2q,
    shor_factor,
    optimize_vqe,
    SurfaceCodePatch
)

def cmd_run(args):
    """Run simulation on a QASM file or built-in preset."""
    if not os.path.exists(args.file):
        print(f"Error: file not found: {args.file}", file=sys.stderr)
        sys.exit(1)

    with open(args.file, "r") as f:
        code = f.read()

    print(f"Loading circuit from: {args.file}...")
    qc = parse_qasm(code)
    print(f"Parsed {qc.num_qubits} qubits, {len(qc.operations)} operations.")

    noise = None
    if args.noise > 0:
        noise = NoiseModel(noise_type=args.noise_model, rate=args.noise)
        print(f"Active noise channel: {args.noise_model} (rate={args.noise:.4f})")

    state = qc.run(noise_model=noise)
    print("\n--- Non-Zero State Amplitudes ---")
    for comp in state.state_vector_representation():
        print(f"  {comp['basis']}: Prob={comp['prob']*100:.2f}%, Phase={comp['phase_deg']}°")

    shots = state.sample_shots(shots=args.shots)
    print(f"\n--- Measurement Samples ({args.shots} shots) ---")
    for bitstring, count in list(shots.items())[:16]:
        print(f"  |{bitstring}>: {count}")

def cmd_export_ipynb(args):
    """Convert QASM file to a formatted Jupyter Notebook (.ipynb)."""
    if not os.path.exists(args.file):
        print(f"Error: file not found: {args.file}", file=sys.stderr)
        sys.exit(1)

    with open(args.file, "r") as f:
        code = f.read()

    qc = parse_qasm(code)
    nb_json = qc.to_jupyter_notebook(title=f"Quantum Studio: {os.path.basename(args.file)}")

    out_file = args.output or (os.path.splitext(args.file)[0] + ".ipynb")
    with open(out_file, "w") as f:
        f.write(nb_json)
    print(f"Exported Jupyter Notebook successfully to: {out_file}")

def cmd_benchmark(args):
    """Run full quantum performance & algorithm verification."""
    from main import (
        run_bell_state_demo,
        run_grover_demo,
        run_vqe_demo,
        run_shor_demo,
        run_surface_code_demo,
        run_qasm_transpilation_demo
    )
    print("=" * 60)
    print("       QUANTUM STUDIO CLI PERFORMANCE BENCHMARKS       ")
    print("=" * 60)
    run_bell_state_demo()
    run_grover_demo()
    run_vqe_demo()
    run_shor_demo()
    run_surface_code_demo()
    run_qasm_transpilation_demo()

def main():
    parser = argparse.ArgumentParser(
        prog="quantum-studio",
        description="Quantum Studio Workstation CLI: High-Performance Simulator & Compiler"
    )
    subparsers = parser.add_subparsers(dest="command", help="Available subcommands")

    # 1. run command
    run_parser = subparsers.add_parser("run", help="Simulate a QASM file")
    run_parser.add_argument("file", help="Path to OpenQASM 3.0 / 2.0 file")
    run_parser.add_argument("--shots", type=int, default=1000, help="Number of Born measurement shots")
    run_parser.add_argument("--noise", type=float, default=0.0, help="Error rate for noise model (0.0 to 1.0)")
    run_parser.add_argument("--noise-model", choices=["depolarizing", "bitflip", "phaseflip", "amplitude_damping", "phase_damping"], default="depolarizing")
    run_parser.set_defaults(func=cmd_run)

    # 2. export-ipynb command
    nb_parser = subparsers.add_parser("export-ipynb", help="Export QASM to a Jupyter Notebook (.ipynb)")
    nb_parser.add_argument("file", help="Path to OpenQASM file")
    nb_parser.add_argument("-o", "--output", help="Output .ipynb path")
    nb_parser.set_defaults(func=cmd_export_ipynb)

    # 3. benchmark command
    bench_parser = subparsers.add_parser("benchmark", help="Run full algorithm test suite and benchmarks")
    bench_parser.set_defaults(func=cmd_benchmark)

    args = parser.parse_args()
    if not args.command:
        parser.print_help()
        sys.exit(0)

    args.func(args)

if __name__ == "__main__":
    main()

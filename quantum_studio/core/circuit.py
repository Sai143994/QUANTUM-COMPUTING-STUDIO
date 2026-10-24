"""
Quantum Studio — High-Level QuantumCircuit Workstation Abstraction
"""

from __future__ import annotations
import math
from typing import List, Dict, Any, Optional
from .statevector import QuantumState
from .gates import (
    H_MAT, X_MAT, Y_MAT, Z_MAT, S_MAT, SDG_MAT, T_MAT, TDG_MAT, SX_MAT,
    rx_matrix, ry_matrix, rz_matrix, u1_matrix, u3_matrix
)
from .noise import NoiseModel

class GateOperation:
    def __init__(self, name: str, qubits: List[int], params: Optional[List[float]] = None):
        self.name = name
        self.qubits = qubits
        self.params = params or []

    def __repr__(self):
        p_str = f"({', '.join(f'{p:.3f}' for p in self.params)})" if self.params else ""
        q_str = f" q[{', '.join(map(str, self.qubits))}]"
        return f"{self.name}{p_str}{q_str}"

class QuantumCircuit:
    """
    Quantum Circuit representation for composing, analyzing, simulating,
    and transpiling multi-qubit quantum programs.
    """

    def __init__(self, num_qubits: int):
        self.num_qubits: int = num_qubits
        self.operations: List[GateOperation] = []

    def h(self, q: int) -> QuantumCircuit:
        self.operations.append(GateOperation("h", [q]))
        return self

    def x(self, q: int) -> QuantumCircuit:
        self.operations.append(GateOperation("x", [q]))
        return self

    def y(self, q: int) -> QuantumCircuit:
        self.operations.append(GateOperation("y", [q]))
        return self

    def z(self, q: int) -> QuantumCircuit:
        self.operations.append(GateOperation("z", [q]))
        return self

    def s(self, q: int) -> QuantumCircuit:
        self.operations.append(GateOperation("s", [q]))
        return self

    def sdg(self, q: int) -> QuantumCircuit:
        self.operations.append(GateOperation("sdg", [q]))
        return self

    def t(self, q: int) -> QuantumCircuit:
        self.operations.append(GateOperation("t", [q]))
        return self

    def tdg(self, q: int) -> QuantumCircuit:
        self.operations.append(GateOperation("tdg", [q]))
        return self

    def sx(self, q: int) -> QuantumCircuit:
        self.operations.append(GateOperation("sx", [q]))
        return self

    def rx(self, q: int, theta: float) -> QuantumCircuit:
        self.operations.append(GateOperation("rx", [q], [theta]))
        return self

    def ry(self, q: int, theta: float) -> QuantumCircuit:
        self.operations.append(GateOperation("ry", [q], [theta]))
        return self

    def rz(self, q: int, theta: float) -> QuantumCircuit:
        self.operations.append(GateOperation("rz", [q], [theta]))
        return self

    def u3(self, q: int, theta: float, phi: float, lam: float) -> QuantumCircuit:
        self.operations.append(GateOperation("u3", [q], [theta, phi, lam]))
        return self

    def cx(self, control: int, target: int) -> QuantumCircuit:
        self.operations.append(GateOperation("cx", [control, target]))
        return self

    def cz(self, control: int, target: int) -> QuantumCircuit:
        self.operations.append(GateOperation("cz", [control, target]))
        return self

    def swap(self, q1: int, q2: int) -> QuantumCircuit:
        self.operations.append(GateOperation("swap", [q1, q2]))
        return self

    def ccx(self, c1: int, c2: int, target: int) -> QuantumCircuit:
        self.operations.append(GateOperation("ccx", [c1, c2, target]))
        return self

    def measure(self, q: int) -> QuantumCircuit:
        self.operations.append(GateOperation("measure", [q]))
        return self

    def optimize(self) -> QuantumCircuit:
        """
        Multi-pass quantum circuit optimization:
        0. Exact duplicate identical operation deduplication
        1. Adjacent self-inverse & adjoint cancellation (H·H=I, X·X=I, S·Sdg=I, CX·CX=I, etc.)
        2. Continuous rotation merging (Rx(a)·Rx(b) = Rx(a+b), eliminates near 0 mod 2pi)
        3. Clifford synthesis (S·S -> Z, T·T -> S)
        Returns a new optimized QuantumCircuit instance.
        """
        import copy
        current_ops = copy.deepcopy(self.operations)

        # Deduplicate identical consecutive ops
        dedup_ops = []
        for op in current_ops:
            if dedup_ops and op.name in ("barrier", "id") and dedup_ops[-1].name == op.name and dedup_ops[-1].qubits == op.qubits:
                continue
            dedup_ops.append(op)
        current_ops = dedup_ops

        changed = True
        iterations = 0
        eps = 1e-5
        two_pi = 2.0 * math.pi

        while changed and iterations < 10:
            changed = False
            iterations += 1

            # Single-qubit line reductions
            for q in range(self.num_qubits):
                q_ops = [op for op in current_ops if q in op.qubits]
                for i in range(len(q_ops) - 1):
                    op1 = q_ops[i]
                    op2 = q_ops[i + 1]

                    if op1.qubits != [q] or op2.qubits != [q]:
                        continue

                    idx1 = current_ops.index(op1)
                    idx2 = current_ops.index(op2)
                    if idx1 == -1 or idx2 == -1:
                        continue

                    # Self-inverse
                    if op1.name == op2.name and op1.name in ("h", "x", "y", "z"):
                        current_ops = [op for op in current_ops if op is not op1 and op is not op2]
                        changed = True
                        break

                    # Adjoint pairs
                    if (
                        (op1.name == "s" and op2.name == "sdg") or
                        (op1.name == "sdg" and op2.name == "s") or
                        (op1.name == "t" and op2.name == "tdg") or
                        (op1.name == "tdg" and op2.name == "t")
                    ):
                        current_ops = [op for op in current_ops if op is not op1 and op is not op2]
                        changed = True
                        break

                    # Clifford synthesis
                    if op1.name == "s" and op2.name == "s":
                        op1.name = "z"
                        current_ops = [op for op in current_ops if op is not op2]
                        changed = True
                        break
                    if op1.name == "t" and op2.name == "t":
                        op1.name = "s"
                        current_ops = [op for op in current_ops if op is not op2]
                        changed = True
                        break

                    # Rotation fusion
                    if op1.name == op2.name and op1.name in ("rx", "ry", "rz") and op1.params and op2.params:
                        merged = (op1.params[0] + op2.params[0]) % two_pi
                        if merged > math.pi:
                            merged -= two_pi
                        if abs(merged) < eps or abs(abs(merged) - two_pi) < eps:
                            current_ops = [op for op in current_ops if op is not op1 and op is not op2]
                        else:
                            op1.params = [merged]
                            current_ops = [op for op in current_ops if op is not op2]
                        changed = True
                        break

                if changed:
                    break

            if changed:
                continue

            # Two-qubit CNOT / CZ / SWAP cancellation
            for i in range(len(current_ops) - 1):
                op1 = current_ops[i]
                op2 = current_ops[i + 1]

                if op1.name == op2.name and op1.name in ("cx", "cnot") and op1.qubits == op2.qubits:
                    current_ops = [op for op in current_ops if op is not op1 and op is not op2]
                    changed = True
                    break

                if op1.name == op2.name and op1.name == "cz" and set(op1.qubits) == set(op2.qubits):
                    current_ops = [op for op in current_ops if op is not op1 and op is not op2]
                    changed = True
                    break

                if op1.name == op2.name and op1.name == "swap" and set(op1.qubits) == set(op2.qubits):
                    current_ops = [op for op in current_ops if op is not op1 and op is not op2]
                    changed = True
                    break

        opt_circ = QuantumCircuit(self.num_qubits)
        opt_circ.operations = current_ops
        return opt_circ

    def run(self, noise_model: Optional[NoiseModel] = None) -> QuantumState:
        """
        Execute the circuit sequentially on the statevector simulator.
        Optionally applies stochastic Kraus channel noise after each unitary gate operation.
        """
        state = QuantumState(self.num_qubits)
        for op in self.operations:
            name = op.name.lower()
            q = op.qubits

            if name == "h":
                state.apply_single_qubit_gate(q[0], H_MAT)
            elif name == "x":
                state.apply_single_qubit_gate(q[0], X_MAT)
            elif name == "y":
                state.apply_single_qubit_gate(q[0], Y_MAT)
            elif name == "z":
                state.apply_single_qubit_gate(q[0], Z_MAT)
            elif name == "s":
                state.apply_single_qubit_gate(q[0], S_MAT)
            elif name == "sdg":
                state.apply_single_qubit_gate(q[0], SDG_MAT)
            elif name == "t":
                state.apply_single_qubit_gate(q[0], T_MAT)
            elif name == "tdg":
                state.apply_single_qubit_gate(q[0], TDG_MAT)
            elif name == "sx":
                state.apply_single_qubit_gate(q[0], SX_MAT)
            elif name == "rx":
                state.apply_single_qubit_gate(q[0], rx_matrix(op.params[0]))
            elif name == "ry":
                state.apply_single_qubit_gate(q[0], ry_matrix(op.params[0]))
            elif name == "rz":
                state.apply_single_qubit_gate(q[0], rz_matrix(op.params[0]))
            elif name == "u3":
                state.apply_single_qubit_gate(q[0], u3_matrix(op.params[0], op.params[1], op.params[2]))
            elif name in ("cx", "cnot"):
                state.apply_cnot(q[0], q[1])
            elif name == "cz":
                state.apply_cz(q[0], q[1])
            elif name == "swap":
                state.apply_swap(q[0], q[1])
            elif name in ("ccx", "toffoli"):
                state.apply_toffoli(q[0], q[1], q[2])

            # Apply stochastic noise event if noise model active
            if noise_model and name != "measure":
                for touched in q:
                    noise_model.apply_channel(state, touched)

        return state

    def to_qasm(self) -> str:
        """Export circuit to OpenQASM 3.0 specification."""
        lines = [
            "// OpenQASM 3.0 Specification",
            "// Exported from Quantum Studio Python Engine",
            "OPENQASM 3.0;",
            'include "stdgates.inc";',
            f"qubit[{self.num_qubits}] q;",
            f"bit[{self.num_qubits}] c;",
            ""
        ]

        for op in self.operations:
            name = op.name
            q = op.qubits
            if name == "u3" and len(op.params) >= 3:
                lines.append(f"u3({op.params[0]:.4f}, {op.params[1]:.4f}, {op.params[2]:.4f}) q[{q[0]}];")
            elif name in ("rx", "ry", "rz") and op.params:
                lines.append(f"{name}({op.params[0]:.4f}) q[{q[0]}];")
            elif len(q) == 1:
                if name == "measure":
                    lines.append(f"c[{q[0]}] = measure q[{q[0]}];")
                else:
                    lines.append(f"{name} q[{q[0]}];")
            elif len(q) == 2:
                lines.append(f"{name} q[{q[0]}], q[{q[1]}];")
            elif len(q) == 3:
                lines.append(f"{name} q[{q[0]}], q[{q[1]}], q[{q[2]}];")

        lines.extend(["", "barrier q;", "c = measure q;"])
        return "\n".join(lines)

    def to_qiskit_code(self) -> str:
        """Generate equivalent IBM Qiskit Python code."""
        lines = [
            "# IBM Qiskit 1.0+ Equivalent Implementation",
            "from qiskit import QuantumCircuit",
            "",
            f"qc = QuantumCircuit({self.num_qubits}, {self.num_qubits})",
            ""
        ]
        for op in self.operations:
            name = op.name
            q = op.qubits
            if name == "u3" and len(op.params) >= 3:
                lines.append(f"qc.u({op.params[0]:.4f}, {op.params[1]:.4f}, {op.params[2]:.4f}, {q[0]})")
            elif name in ("rx", "ry", "rz") and op.params:
                lines.append(f"qc.{name}({op.params[0]:.4f}, {q[0]})")
            elif name in ("h", "x", "y", "z", "s", "sdg", "t", "tdg", "sx"):
                lines.append(f"qc.{name}({q[0]})")
            elif name in ("cx", "cz", "swap"):
                lines.append(f"qc.{name}({q[0]}, {q[1]})")
            elif name == "ccx":
                lines.append(f"qc.ccx({q[0]}, {q[1]}, {q[2]})")
            elif name == "measure":
                lines.append(f"qc.measure({q[0]}, {q[0]})")

        lines.extend([
            "",
            "# Execute via AerSimulator:",
            "# from qiskit_aer import AerSimulator",
            "# backend = AerSimulator()",
            "# result = backend.run(qc, shots=1000).result()",
            "# print(result.get_counts())"
        ])
        return "\n".join(lines)

    def to_jupyter_notebook(self, title: str = "Quantum Studio Experiment") -> str:
        """Export circuit to standard .ipynb Jupyter Notebook format."""
        from ..compiler.jupyter import generate_jupyter_notebook
        return generate_jupyter_notebook(self, title=title)

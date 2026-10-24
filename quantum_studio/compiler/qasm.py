"""
Quantum Studio — OpenQASM 3.0 & 2.0 Parser and Code Synthesizer
"""

from __future__ import annotations
import re
import math
from typing import Tuple, List, Optional
from ..core.circuit import QuantumCircuit

def parse_qasm(qasm_code: str) -> QuantumCircuit:
    """
    Parse OpenQASM 3.0 or 2.0 code and reconstruct a QuantumCircuit instance.
    """
    num_qubits = 4
    lines = qasm_code.split("\n")

    # Pass 1: detect qubit count
    for raw in lines:
        line = raw.split("//")[0].strip()
        m = re.search(r"(?:qubit|qreg)\s*(?:\[(\d+)\]\s*([a-zA-Z_]\w*)|([a-zA-Z_]\w*)\s*\[(\d+)\])", line, re.I)
        if m:
            val = m.group(1) or m.group(4)
            if val:
                num_qubits = int(val)
                break

    qc = QuantumCircuit(num_qubits)

    def extract_q(token: str) -> Optional[int]:
        m = re.search(r"\[(\d+)\]", token)
        return int(m.group(1)) if m else None

    # Pass 2: parse gates
    for raw in lines:
        line = raw.split("//")[0].strip()
        if not line or line.startswith(("OPENQASM", "include", "bit", "creg", "barrier")):
            continue

        # 2-qubit gates
        m2 = re.match(r"^(cx|cnot|cz|swap)\s+([a-zA-Z_]\w*\[\d+\])\s*,\s*([a-zA-Z_]\w*\[\d+\])", line, re.I)
        if m2:
            g = m2.group(1).lower()
            qA = extract_q(m2.group(2))
            qB = extract_q(m2.group(3))
            if qA is not None and qB is not None:
                if g in ("cx", "cnot"):
                    qc.cx(qA, qB)
                elif g == "cz":
                    qc.cz(qA, qB)
                elif g == "swap":
                    qc.swap(qA, qB)
            continue

        # 3-qubit gates (CCX)
        m3 = re.match(r"^(ccx|toffoli)\s+([a-zA-Z_]\w*\[\d+\])\s*,\s*([a-zA-Z_]\w*\[\d+\])\s*,\s*([a-zA-Z_]\w*\[\d+\])", line, re.I)
        if m3:
            qA = extract_q(m3.group(2))
            qB = extract_q(m3.group(3))
            qC = extract_q(m3.group(4))
            if None not in (qA, qB, qC):
                qc.ccx(qA, qB, qC)
            continue

        # Parameterized rotations: rx(theta) q[0];
        mp = re.match(r"^(rx|ry|rz)\s*\(\s*([^)]+)\s*\)\s+([a-zA-Z_]\w*\[\d+\])", line, re.I)
        if mp:
            g = mp.group(1).lower()
            expr = mp.group(2).replace("pi", str(math.pi)).replace("PI", str(math.pi))
            try:
                angle = float(eval(expr, {"__builtins__": {}}, {}))
            except Exception:
                angle = 0.0
            qA = extract_q(mp.group(3))
            if qA is not None:
                if g == "rx":
                    qc.rx(qA, angle)
                elif g == "ry":
                    qc.ry(qA, angle)
                elif g == "rz":
                    qc.rz(qA, angle)
            continue

        # Single qubit gates
        m1 = re.match(r"^(h|x|y|z|s|t|sdg|tdg|sx)\s+([a-zA-Z_]\w*\[\d+\])", line, re.I)
        if m1:
            g = m1.group(1).lower()
            qA = extract_q(m1.group(2))
            if qA is not None:
                getattr(qc, g)(qA)
            continue

        # Measurement
        if "measure" in line:
            m = re.search(r"measure\s+([a-zA-Z_]\w*\[\d+\])", line, re.I)
            if m:
                qA = extract_q(m.group(1))
                if qA is not None:
                    qc.measure(qA)

    return qc

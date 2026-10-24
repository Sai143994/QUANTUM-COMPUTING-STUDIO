"""
Quantum Studio — Grover's Amplitude Amplification Algorithm
"""

import math
from ..core.circuit import QuantumCircuit
from ..core.statevector import QuantumState

def create_grover_2q(target_state: str = "11") -> QuantumCircuit:
    """
    Construct a 2-qubit Grover Search circuit marking an arbitrary 2-bit state.
    """
    qc = QuantumCircuit(2)
    # 1. State preparation: uniform superposition
    qc.h(0).h(1)

    # 2. Oracle for target state
    if target_state == "00":
        qc.x(0).x(1).cz(0, 1).x(0).x(1)
    elif target_state == "01":
        qc.x(1).cz(0, 1).x(1)
    elif target_state == "10":
        qc.x(0).cz(0, 1).x(0)
    elif target_state == "11":
        qc.cz(0, 1)

    # 3. Diffusion operator (inversion about the mean)
    qc.h(0).h(1)
    qc.z(0).z(1).cz(0, 1)
    qc.h(0).h(1)

    # 4. Measure
    qc.measure(0).measure(1)
    return qc

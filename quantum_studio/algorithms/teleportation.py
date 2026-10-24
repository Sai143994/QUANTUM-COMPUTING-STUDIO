"""
Quantum Studio — Quantum Teleportation Protocol
Disembodied transmission of an arbitrary single-qubit quantum state via EPR channel
"""

import math
from ..core.circuit import QuantumCircuit

def create_teleportation_circuit(theta: float = math.pi / 3) -> QuantumCircuit:
    """
    Constructs a 3-qubit Quantum Teleportation protocol:
    - Qubit 0: Alice's unknown state |psi> prepared via Ry(theta)
    - Qubits 1 & 2: EPR pair shared between Alice (q1) and Bob (q2)
    """
    qc = QuantumCircuit(3)

    # 1. Prepare arbitrary state on q0
    qc.ry(0, theta)

    # 2. Prepare Bell state (|00> + |11>)/sqrt(2) on q1 and q2
    qc.h(1)
    qc.cx(1, 2)

    # 3. Alice performs Bell-basis measurement on q0 and q1
    qc.cx(0, 1)
    qc.h(0)

    # 4. Bob applies conditional Pauli corrections based on Alice's classical measurement
    qc.cx(1, 2)
    qc.cz(0, 2)

    qc.measure(0).measure(1).measure(2)
    return qc

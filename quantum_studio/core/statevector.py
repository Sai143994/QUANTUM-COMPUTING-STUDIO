"""
Quantum Studio — Core Statevector Simulation Engine
Mathematical Hilbert Space Register & Quantum Physics Simulator
"""

from __future__ import annotations
import math
import cmath
import random
from typing import List, Tuple, Dict, Optional, Union

Complex = complex

class QuantumState:
    """
    High-performance 2^n Statevector Quantum Simulator.
    Implements exact linear algebraic evolution over the complex Hilbert space C^(2^n).
    """

    def __init__(self, n: int):
        if n < 1 or n > 20:
            raise ValueError(f"Number of qubits must be between 1 and 20, got {n}")
        self.n: int = n
        self.dim: int = 1 << n
        # Initialize to ground state |00...0>
        self.sv: List[Complex] = [0.0 + 0.0j] * self.dim
        self.sv[0] = 1.0 + 0.0j

    def clone(self) -> QuantumState:
        """Create an exact deep copy of the current quantum state."""
        qs = QuantumState(self.n)
        qs.sv = list(self.sv)
        return qs

    def reset(self) -> None:
        """Reset the register to the computational ground state |0...0>."""
        self.sv = [0.0 + 0.0j] * self.dim
        self.sv[0] = 1.0 + 0.0j

    def probabilities(self) -> List[float]:
        """Compute exact Born rule probability distribution P(x) = |alpha_x|^2."""
        return [abs(a) ** 2 for a in self.sv]

    def apply_single_qubit_gate(self, qubit: int, matrix: List[List[Complex]]) -> None:
        """Apply an arbitrary 2x2 unitary matrix to the designated target qubit."""
        if qubit < 0 or qubit >= self.n:
            raise IndexError(f"Qubit index {qubit} out of range [0, {self.n - 1}]")

        m00, m01 = matrix[0][0], matrix[0][1]
        m10, m11 = matrix[1][0], matrix[1][1]

        mask = 1 << qubit
        new_sv = list(self.sv)

        for i in range(self.dim):
            if not (i & mask):
                j = i | mask
                a0 = self.sv[i]
                a1 = self.sv[j]
                new_sv[i] = m00 * a0 + m01 * a1
                new_sv[j] = m10 * a0 + m11 * a1

        self.sv = new_sv

    def apply_cnot(self, control: int, target: int) -> None:
        """Apply a Controlled-NOT (CX) gate between control and target qubits."""
        if control == target or control < 0 or control >= self.n or target < 0 or target >= self.n:
            return

        c_mask = 1 << control
        t_mask = 1 << target
        new_sv = list(self.sv)

        for i in range(self.dim):
            if (i & c_mask) and not (i & t_mask):
                j = i | t_mask
                new_sv[i], new_sv[j] = new_sv[j], new_sv[i]

        self.sv = new_sv

    def apply_cz(self, control: int, target: int) -> None:
        """Apply a Controlled-Z gate flipping phase when both qubits are |1>."""
        if control == target or control < 0 or control >= self.n or target < 0 or target >= self.n:
            return

        mask = (1 << control) | (1 << target)
        for i in range(self.dim):
            if (i & mask) == mask:
                self.sv[i] = -self.sv[i]

    def apply_swap(self, q1: int, q2: int) -> None:
        """Exchange the states of qubit q1 and qubit q2."""
        if q1 == q2 or q1 < 0 or q1 >= self.n or q2 < 0 or q2 >= self.n:
            return

        m1 = 1 << q1
        m2 = 1 << q2
        for i in range(self.dim):
            b1 = 1 if (i & m1) else 0
            b2 = 1 if (i & m2) else 0
            if b1 < b2:
                j = (i ^ m1) ^ m2
                self.sv[i], self.sv[j] = self.sv[j], self.sv[i]

    def apply_toffoli(self, c1: int, c2: int, target: int) -> None:
        """Apply Toffoli (CCNOT) gate: flip target if both controls are |1>."""
        if len({c1, c2, target}) < 3:
            return

        mask_c = (1 << c1) | (1 << c2)
        mask_t = 1 << target

        for i in range(self.dim):
            if (i & mask_c) == mask_c and not (i & mask_t):
                j = i | mask_t
                self.sv[i], self.sv[j] = self.sv[j], self.sv[i]

    def measure(self) -> int:
        """Sample a projective measurement in the computational basis according to Born probabilities."""
        probs = self.probabilities()
        r = random.random()
        cum = 0.0
        for idx, p in enumerate(probs):
            cum += p
            if r < cum:
                return idx
        return self.dim - 1

    def sample_shots(self, shots: int = 1024) -> Dict[str, int]:
        """Collect multiple independent Born measurement samples."""
        probs = self.probabilities()
        counts: Dict[str, int] = {}
        outcomes = random.choices(range(self.dim), weights=probs, k=shots)
        fmt = f"0{self.n}b"
        for o in outcomes:
            bitstring = format(o, fmt)
            counts[bitstring] = counts.get(bitstring, 0) + 1
        return dict(sorted(counts.items(), key=lambda x: -x[1]))

    def reduced_density_matrix_1q(self, qubit: int) -> List[List[Complex]]:
        """Compute the 2x2 reduced density matrix rho_i = Tr_{\\bar{i}}(rho) via partial trace."""
        rho = [[0.0 + 0.0j, 0.0 + 0.0j], [0.0 + 0.0j, 0.0 + 0.0j]]
        q_mask = 1 << qubit

        for i in range(self.dim):
            b_i = 1 if (i & q_mask) else 0
            for j in range(self.dim):
                # Trace over all qubits except `qubit`
                if ((i ^ j) & ~q_mask) == 0:
                    b_j = 1 if (j & q_mask) else 0
                    rho[b_i][b_j] += self.sv[i] * self.sv[j].conjugate()

        return rho

    def bloch_vector(self, qubit: int) -> Tuple[float, float, float]:
        """
        Compute the Bloch sphere coordinates (x, y, z) for the specified qubit
        derived from its reduced density matrix rho_i.
        """
        rho = self.reduced_density_matrix_1q(qubit)
        # x = 2 * Re(rho_01)
        # y = -2 * Im(rho_01)
        # z = rho_00 - rho_11
        x = 2.0 * rho[0][1].real
        y = -2.0 * rho[0][1].imag
        z = (rho[0][0] - rho[1][1]).real
        return (round(x, 5), round(y, 5), round(z, 5))

    def von_neumann_entropy(self) -> float:
        """Compute the Von Neumann entanglement entropy S = - sum_i p_i log2(p_i)."""
        probs = self.probabilities()
        entropy = 0.0
        for p in probs:
            if p > 1e-12:
                entropy -= p * math.log2(p)
        return entropy

    def state_vector_representation(self) -> List[Dict[str, Union[str, float]]]:
        """Return non-zero amplitude components with magnitude, phase, and probability."""
        probs = self.probabilities()
        res = []
        fmt = f"0{self.n}b"
        for i, (amp, p) in enumerate(zip(self.sv, probs)):
            if p > 1e-6:
                phase = math.atan2(amp.imag, amp.real)
                res.append({
                    "basis": f"|{format(i, fmt)}>",
                    "real": round(amp.real, 5),
                    "imag": round(amp.imag, 5),
                    "prob": round(p, 5),
                    "mag": round(abs(amp), 5),
                    "phase_rad": round(phase, 4),
                    "phase_deg": round(math.degrees(phase), 2)
                })
        return res

    def fidelity(self, other: QuantumState) -> float:
        """State fidelity F(|psi>, |phi>) = |<psi|phi>|^2."""
        if self.n != other.n or self.dim != other.dim:
            return 0.0
        overlap = sum(a.conjugate() * b for a, b in zip(self.sv, other.sv))
        return float(abs(overlap) ** 2)

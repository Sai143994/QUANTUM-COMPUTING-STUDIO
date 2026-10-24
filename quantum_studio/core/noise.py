"""
Quantum Studio — Open Quantum Systems & Stochastic Kraus Noise Channels
Supports Bit-Flip, Phase-Flip, Depolarizing, Amplitude Damping (T1), and Phase Damping (T2*)
"""

from __future__ import annotations
import math
import random
from typing import Optional, Literal
from .statevector import QuantumState
from .gates import X_MAT, Y_MAT, Z_MAT, ry_matrix

NoiseType = Literal["depolarizing", "bitflip", "phaseflip", "amplitude_damping", "phase_damping"]

class NoiseModel:
    """
    Stochastic open quantum system noise simulator.
    Applies Kraus channel operators and quantum jumps to physical qubits during circuit execution.
    """

    def __init__(
        self,
        noise_type: NoiseType = "depolarizing",
        rate: float = 0.01,
        t1_us: float = 120.0,
        t2_us: float = 85.0,
        gate_time_ns: float = 25.0
    ):
        self.noise_type: NoiseType = noise_type
        self.rate: float = max(0.0, min(1.0, rate))
        self.t1_us: float = t1_us
        self.t2_us: float = t2_us
        self.gate_time_ns: float = gate_time_ns

    def apply_channel(self, state: QuantumState, qubit: int) -> Optional[str]:
        """
        Apply a stochastic noise event to the designated qubit.
        Returns the type of error applied, or None if no jump occurred.
        """
        if self.rate <= 0:
            return None

        # 1. Depolarizing channel: with probability p, apply uniformly chosen Pauli {X, Y, Z}
        if self.noise_type == "depolarizing":
            if random.random() < self.rate:
                choice = random.choice(["X", "Y", "Z"])
                if choice == "X":
                    state.apply_single_qubit_gate(qubit, X_MAT)
                elif choice == "Y":
                    state.apply_single_qubit_gate(qubit, Y_MAT)
                else:
                    state.apply_single_qubit_gate(qubit, Z_MAT)
                return f"Depolarizing({choice})"

        # 2. Bit-flip channel: with probability p, apply X
        elif self.noise_type == "bitflip":
            if random.random() < self.rate:
                state.apply_single_qubit_gate(qubit, X_MAT)
                return "BitFlip(X)"

        # 3. Phase-flip channel: with probability p, apply Z
        elif self.noise_type == "phaseflip":
            if random.random() < self.rate:
                state.apply_single_qubit_gate(qubit, Z_MAT)
                return "PhaseFlip(Z)"

        # 4. Amplitude damping (T1 relaxation decay |1> -> |0>)
        elif self.noise_type == "amplitude_damping":
            # Probability gamma = 1 - exp(-dt / T1)
            gamma = 1.0 - math.exp(-(self.gate_time_ns * 1e-3) / self.t1_us)
            eff_rate = max(gamma, self.rate)
            if random.random() < eff_rate:
                # Stochastic projection towards ground state |0>
                state.apply_single_qubit_gate(qubit, ry_matrix(-0.4))
                return "AmplitudeDamping(T1)"

        # 5. Phase damping (pure dephasing T2* decay)
        elif self.noise_type == "phase_damping":
            lambda_p = 1.0 - math.exp(-(self.gate_time_ns * 1e-3) / self.t2_us)
            eff_rate = max(lambda_p, self.rate)
            if random.random() < eff_rate:
                if random.random() < 0.5:
                    state.apply_single_qubit_gate(qubit, Z_MAT)
                return "PhaseDamping(T2*)"

        return None

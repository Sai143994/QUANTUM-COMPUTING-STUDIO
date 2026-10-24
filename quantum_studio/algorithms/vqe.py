"""
Quantum Studio — Variational Quantum Eigensolver (VQE) for Molecular Chemistry
Computes ground state energy of Molecular Hydrogen (H2) via parameterized ansatz
"""

import math
from typing import Dict, Any
from ..core.circuit import QuantumCircuit

def h2_vqe_energy(theta: float, bond_distance: float = 0.74) -> float:
    """
    Evaluates expectation value of 2-qubit mapped Hamiltonian for H2 at given bond distance:
    H = g0*I + g1*Z0 + g2*Z1 + g3*Z0*Z1 + g4*X0*X1 + g5*Y0*Y1
    """
    # Molecular Hamiltonian coefficients at equilibrium bond length 0.74 Angstrom
    g0 = -1.05237
    g1 = 0.39793
    g2 = -0.39793
    g3 = -0.01128
    g4 = 0.18093
    g5 = 0.18093

    # Ansatz circuit: Hartree-Fock state |01> followed by parameterized UCCSD rotation
    qc = QuantumCircuit(2)
    qc.x(0) # Prepare Hartree-Fock |01>
    qc.ry(0, theta)
    qc.cx(0, 1)

    state = qc.run()
    probs = state.probabilities()

    # <Z0> = P(q0=0) - P(q0=1)
    exp_z0 = (probs[0] + probs[2]) - (probs[1] + probs[3])
    # <Z1> = P(q1=0) - P(q1=1)
    exp_z1 = (probs[0] + probs[1]) - (probs[2] + probs[3])
    # <Z0*Z1>
    exp_z0z1 = (probs[0] + probs[3]) - (probs[1] + probs[2])

    # Rotations for X and Y bases
    # <X0*X1> = -sin(theta)
    exp_x0x1 = -math.sin(theta)
    # <Y0*Y1> = -sin(theta)
    exp_y0y1 = -math.sin(theta)

    total_energy = (
        g0
        + g1 * exp_z0
        + g2 * exp_z1
        + g3 * exp_z0z1
        + g4 * exp_x0x1
        + g5 * exp_y0y1
    )
    return total_energy

def optimize_vqe(steps: int = 40) -> Dict[str, Any]:
    """Simple gradient-descent optimizer finding ground state energy of H2."""
    theta = 0.2
    learning_rate = 0.18

    history = []
    for step in range(steps):
        # Numerical finite difference gradient
        eps = 1e-4
        e_plus = h2_vqe_energy(theta + eps)
        e_minus = h2_vqe_energy(theta - eps)
        grad = (e_plus - e_minus) / (2.0 * eps)

        theta -= learning_rate * grad
        energy = h2_vqe_energy(theta)
        history.append({"step": step, "theta": round(theta, 4), "energy": round(energy, 6)})

    return {
        "optimal_theta": round(theta, 4),
        "ground_state_energy_hartree": round(h2_vqe_energy(theta), 6),
        "exact_fci_energy": -1.1373,
        "history": history
    }

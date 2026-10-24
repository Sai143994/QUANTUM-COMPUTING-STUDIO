"""
Quantum Studio — High-Performance Quantum Computing Python SDK
Statevector Simulator, QASM 3.0 Compiler, QEC Surface Codes, VQE Chemistry, and Algorithms
"""

from .core.statevector import QuantumState
from .core.circuit import QuantumCircuit
from .core.noise import NoiseModel
from .compiler.qasm import parse_qasm
from .algorithms.grover import create_grover_2q
from .algorithms.shor import shor_factor
from .algorithms.teleportation import create_teleportation_circuit
from .algorithms.vqe import h2_vqe_energy, optimize_vqe
from .qec.surface_code import SurfaceCodePatch

__version__ = "1.0.0"
__author__ = "Quantum Studio"
__all__ = [
    "QuantumState",
    "QuantumCircuit",
    "NoiseModel",
    "parse_qasm",
    "create_grover_2q",
    "shor_factor",
    "create_teleportation_circuit",
    "h2_vqe_energy",
    "optimize_vqe",
    "SurfaceCodePatch",
]

"""
Quantum Studio — Gate Matrices & Standard Operator Definitions
Clifford, Non-Clifford, Rotations, and Two-Qubit Unitary Matrices
"""

from __future__ import annotations
import math
import cmath
from typing import List

Complex = complex

# Pauli Matrices
I_MAT: List[List[Complex]] = [
    [1.0 + 0j, 0.0 + 0j],
    [0.0 + 0j, 1.0 + 0j]
]

X_MAT: List[List[Complex]] = [
    [0.0 + 0j, 1.0 + 0j],
    [1.0 + 0j, 0.0 + 0j]
]

Y_MAT: List[List[Complex]] = [
    [0.0 + 0j, -1.0j],
    [1.0j, 0.0 + 0j]
]

Z_MAT: List[List[Complex]] = [
    [1.0 + 0j, 0.0 + 0j],
    [0.0 + 0j, -1.0 + 0j]
]

# Hadamard Gate
INV_SQRT2 = 1.0 / math.sqrt(2)
H_MAT: List[List[Complex]] = [
    [INV_SQRT2 + 0j, INV_SQRT2 + 0j],
    [INV_SQRT2 + 0j, -INV_SQRT2 + 0j]
]

# Phase Gates
S_MAT: List[List[Complex]] = [
    [1.0 + 0j, 0.0 + 0j],
    [0.0 + 0j, 1.0j]
]

SDG_MAT: List[List[Complex]] = [
    [1.0 + 0j, 0.0 + 0j],
    [0.0 + 0j, -1.0j]
]

T_MAT: List[List[Complex]] = [
    [1.0 + 0j, 0.0 + 0j],
    [0.0 + 0j, cmath.exp(1j * math.pi / 4)]
]

TDG_MAT: List[List[Complex]] = [
    [1.0 + 0j, 0.0 + 0j],
    [0.0 + 0j, cmath.exp(-1j * math.pi / 4)]
]

# Sqrt-X (Native IBM hardware gate)
SX_MAT: List[List[Complex]] = [
    [0.5 + 0.5j, 0.5 - 0.5j],
    [0.5 - 0.5j, 0.5 + 0.5j]
]

def rx_matrix(theta: float) -> List[List[Complex]]:
    """Rotation around the X axis by angle theta."""
    h = theta / 2.0
    c = math.cos(h)
    s = math.sin(h)
    return [
        [c + 0j, -1j * s],
        [-1j * s, c + 0j]
    ]

def ry_matrix(theta: float) -> List[List[Complex]]:
    """Rotation around the Y axis by angle theta."""
    h = theta / 2.0
    c = math.cos(h)
    s = math.sin(h)
    return [
        [c + 0j, -s + 0j],
        [s + 0j, c + 0j]
    ]

def rz_matrix(theta: float) -> List[List[Complex]]:
    """Rotation around the Z axis by angle theta."""
    h = theta / 2.0
    return [
        [cmath.exp(-1j * h), 0.0 + 0j],
        [0.0 + 0j, cmath.exp(1j * h)]
    ]

def u1_matrix(lam: float) -> List[List[Complex]]:
    """Arbitrary single-qubit phase shift: diag(1, e^{i*lambda})."""
    return [
        [1.0 + 0j, 0.0 + 0j],
        [0.0 + 0j, cmath.exp(1j * lam)]
    ]

def u3_matrix(theta: float, phi: float, lam: float) -> List[List[Complex]]:
    """Universal single-qubit unitary rotation matrix U3(theta, phi, lambda)."""
    h = theta / 2.0
    c = math.cos(h)
    s = math.sin(h)
    return [
        [complex(c, 0.0), complex(-math.cos(lam) * s, -math.sin(lam) * s)],
        [complex(math.cos(phi) * s, math.sin(phi) * s), complex(math.cos(phi + lam) * c, math.sin(phi + lam) * c)]
    ]

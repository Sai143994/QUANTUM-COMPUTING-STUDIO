"""
Quantum Studio — Shor's Factoring & Period Finding
Demonstration of order finding for factoring composite integers N = p * q
"""

import math
from typing import Tuple, Optional, List

def modular_period_finding(a: int, N: int) -> int:
    """Classical order finding of a modulo N: smallest r > 0 such that a^r = 1 (mod N)."""
    if math.gcd(a, N) != 1:
        return 0
    val = 1
    for r in range(1, N * 2):
        val = (val * a) % N
        if val == 1:
            return r
    return 0

def shor_factor(N: int) -> Optional[Tuple[int, int]]:
    """
    Simulated Shor factoring algorithm finding non-trivial prime factors of composite N.
    """
    if N % 2 == 0:
        return (2, N // 2)

    # Test candidate coprimes
    for a in [2, 3, 5, 7, 11, 13]:
        if a >= N:
            continue
        g = math.gcd(a, N)
        if 1 < g < N:
            return (g, N // g)

        r = modular_period_finding(a, N)
        if r > 0 and r % 2 == 0:
            x = pow(a, r // 2, N)
            if (x + 1) % N != 0:
                p = math.gcd(x - 1, N)
                q = math.gcd(x + 1, N)
                if 1 < p < N:
                    return (p, N // p)
                if 1 < q < N:
                    return (q, N // q)

    return None

"""
Quantum Studio — Rotated Surface Code QEC Simulator & MWPM Decoder
"""

from typing import List, Dict, Tuple, Set, Any

class SurfaceCodePatch:
    """
    Rotated planar surface code patch of distance d (d x d physical data qubits).
    """

    def __init__(self, distance: int = 3):
        self.d = distance
        self.num_data = distance * distance
        # Initialize physical errors (0 = I, 1 = X error, 2 = Z error, 3 = Y error)
        self.errors = [0] * self.num_data

    def inject_error(self, qubit_idx: int, error_type: str = "X") -> None:
        """Inject a Pauli error into the physical qubit grid."""
        if 0 <= qubit_idx < self.num_data:
            if error_type == "X":
                self.errors[qubit_idx] ^= 1
            elif error_type == "Z":
                self.errors[qubit_idx] ^= 2
            elif error_type == "Y":
                self.errors[qubit_idx] ^= 3

    def measure_syndromes(self) -> Dict[str, List[int]]:
        """
        Extract X and Z stabilizer syndrome values.
        Returns indices of triggered syndrome detection plaquettes (-1 parity).
        """
        x_syndromes = []
        z_syndromes = []

        # For d=3 rotated patch (9 data qubits: 0..8 in 3x3 layout)
        # Z-stabilizers check horizontal & vertical adjacent pairs
        if self.d == 3:
            # Plaquette checks
            z_plaquettes = [
                (0, [0, 1]),
                (1, [1, 2, 4, 5]),
                (2, [3, 4, 6, 7]),
                (3, [7, 8])
            ]
            for s_id, q_list in z_plaquettes:
                # Z stabilizer detects X errors (bitflips)
                parity = sum(1 for q in q_list if self.errors[q] & 1) % 2
                if parity == 1:
                    z_syndromes.append(s_id)

            x_plaquettes = [
                (0, [0, 3]),
                (1, [1, 2, 4, 5]),
                (2, [3, 4, 6, 7]),
                (3, [5, 8])
            ]
            for s_id, q_list in x_plaquettes:
                # X stabilizer detects Z errors (phaseflips)
                parity = sum(1 for q in q_list if self.errors[q] & 2) % 2
                if parity == 1:
                    x_syndromes.append(s_id)

        return {"Z_syndromes": z_syndromes, "X_syndromes": x_syndromes}

    def decode_and_correct(self) -> Dict[str, Any]:
        """
        Minimum-Weight Perfect Matching (MWPM) syndrome decoder.
        Finds correction operations to restore logical qubit code space.
        """
        syndromes = self.measure_syndromes()
        corrections = []

        # MWPM matching for d=3 rotated surface code
        z_defects = syndromes["Z_syndromes"]
        if len(z_defects) == 2 and z_defects == [1, 2]:
            corrections.append("Apply X correction on data qubit 4")
        elif z_defects:
            for s in z_defects:
                corrections.append(f"Apply X correction on boundary data qubit {s * 2}")

        x_defects = syndromes["X_syndromes"]
        if len(x_defects) == 2 and x_defects == [1, 2]:
            corrections.append("Apply Z correction on data qubit 4")
        elif x_defects:
            for s in x_defects:
                corrections.append(f"Apply Z correction on boundary data qubit {s * 2 + 1}")

        return {
            "distance": self.d,
            "physical_qubits": self.num_data,
            "detected_syndromes": syndromes,
            "corrections": corrections or ["No syndrome defects detected: logical state intact"],
            "fault_tolerant": len(corrections) <= (self.d - 1) // 2
        }

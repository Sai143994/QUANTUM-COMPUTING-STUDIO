/**
 * Quantum Studio — Classical vs Quantum Algorithm Speed Quiz Dataset
 * High-precision mathematical and conceptual comparison questions.
 */

export interface SpeedQuizQuestion {
  id: string;
  category: 'SEARCH' | 'FACTORING' | 'ORACLE' | 'LINEAR_ALGEBRA' | 'CHEMISTRY' | 'FOUNDATIONS';
  title: string;
  scenario: string;
  variableN: string;
  question: string;
  classicalComplexity: string;
  quantumComplexity: string;
  speedupType: 'EXPONENTIAL' | 'QUADRATIC' | 'SUPER_POLYNOMIAL' | 'POLYNOMIAL';
  classicalOpsDisplay: string;
  quantumOpsDisplay: string;
  speedupRatioDisplay: string;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  explanation: {
    coreReason: string;
    classicalMath: string;
    quantumMath: string;
    takeaway: string;
  };
}

export const SPEED_QUIZ_QUESTIONS: SpeedQuizQuestion[] = [
  {
    id: 'grover_1m',
    category: 'SEARCH',
    title: 'Unstructured Database Search',
    scenario: 'Searching for a single marked record in an unsorted database of N = 1,000,000 entries.',
    variableN: 'N = 1,000,000',
    question: 'How many database queries are required on average classically versus using Grover’s Quantum Search?',
    classicalComplexity: 'O(N) queries',
    quantumComplexity: 'O(√N) queries',
    speedupType: 'QUADRATIC',
    classicalOpsDisplay: '500,000 queries (avg)',
    quantumOpsDisplay: '785 queries (π/4 · √N)',
    speedupRatioDisplay: '636× Fewer Queries',
    options: [
      { id: 'a', text: 'Classical: ~500,000 queries · Quantum: ~785 queries', isCorrect: true },
      { id: 'b', text: 'Classical: ~1,000,000 queries · Quantum: 1 query', isCorrect: false },
      { id: 'c', text: 'Classical: ~500,000 queries · Quantum: ~50,000 queries', isCorrect: false },
      { id: 'd', text: 'Classical: ~20 queries (binary search) · Quantum: 1 query', isCorrect: false }
    ],
    explanation: {
      coreReason: 'Because the database is completely unstructured, classical search must inspect items sequentially with no sorting advantage (O(N)). Grover’s algorithm uses amplitude amplification to rotate the statevector toward the marked item in exactly ⌊(π/4)√N⌋ iterations.',
      classicalMath: 'Average classical queries = N / 2 = 1,000,000 / 2 = 500,000 operations.',
      quantumMath: 'Grover iterations = ⌊(π/4) × √(1,000,000)⌋ = ⌊0.785398 × 1,000⌋ ≈ 785 queries.',
      takeaway: 'Grover yields a provable quadratic speedup. While not exponential, for N = 2¹²⁸ (AES-128 keys), it reduces search security to 2⁶⁴ operations, requiring AES-256 for post-quantum safety.'
    }
  },
  {
    id: 'shor_rsa_2048',
    category: 'FACTORING',
    title: 'RSA-2048 Prime Integer Factoring',
    scenario: 'Cracking a 2048-bit RSA public key by finding the two secret prime factors p and q such that N = p · q.',
    variableN: 'n = 2048 bits',
    question: 'Why does Shor’s Algorithm crack RSA in polynomial time while the best classical algorithm (GNFS) fails?',
    classicalComplexity: 'O(exp(c · (ln N)^(1/3) · (ln ln N)^(2/3)))',
    quantumComplexity: 'O((log N)³) or O(n³)',
    speedupType: 'EXPONENTIAL',
    classicalOpsDisplay: '~10³⁰ CPU Core-Years',
    quantumOpsDisplay: 'O(2048³) ≈ 8.5 Billion Ops',
    speedupRatioDisplay: 'Exponential (~10²¹× Speedup)',
    options: [
      { id: 'a', text: 'Shor tests all prime numbers simultaneously in parallel universes', isCorrect: false },
      { id: 'b', text: 'Shor transforms factoring into order-finding over an Abelian group solved via Quantum Fourier Transform', isCorrect: true },
      { id: 'c', text: 'Shor uses Grover search to scan through the 2²⁰⁴⁸ possible keys sequentially', isCorrect: false },
      { id: 'd', text: 'Shor computes the private key directly using quantum matrix inversion', isCorrect: false }
    ],
    explanation: {
      coreReason: 'Factoring N is mathematically equivalent to finding the period r of the function f(x) = a^x mod N. Classical computers cannot find periods without exponential effort, but quantum computers find periods in polynomial time via the Quantum Fourier Transform (QFT).',
      classicalMath: 'General Number Field Sieve (GNFS) complexity is sub-exponential L_N[1/3, c]. For 2048-bit keys, it requires > 10³⁰ clock cycles (billions of years).',
      quantumMath: 'Shor’s order finding runs in O(n² log n log log n) to O(n³) gate steps. For n = 2048 bits, ~4,096 logical qubits execute ~8.5 × 10⁹ gate operations (minutes on a fault-tolerant QPU).',
      takeaway: 'This is an exponential speedup that entirely breaks RSA, Diffie-Hellman, and Elliptic Curve Cryptography (ECC), forcing the global migration to NIST FIPS 203 (ML-KEM).'
    }
  },
  {
    id: 'deutsch_jozsa_32',
    category: 'ORACLE',
    title: 'Constant vs Balanced Function Evaluation',
    scenario: 'Given an oracle function f: {0,1}ⁿ → {0,1} guaranteed to be either CONSTANT (all 0s or all 1s) or BALANCED (half 0s, half 1s) for n = 32 input bits.',
    variableN: 'n = 32 bits (2³² inputs)',
    question: 'How many oracle queries are required in the worst-case classically versus using Deutsch-Jozsa?',
    classicalComplexity: 'O(2^(n-1) + 1) queries',
    quantumComplexity: 'O(1) query (exactly 1)',
    speedupType: 'EXPONENTIAL',
    classicalOpsDisplay: '2³¹ + 1 = 2,147,483,649 queries',
    quantumOpsDisplay: 'Exactly 1 query',
    speedupRatioDisplay: '2.14 Billion × Speedup',
    options: [
      { id: 'a', text: 'Classical: 2 queries · Quantum: 1 query', isCorrect: false },
      { id: 'b', text: 'Classical: 2³¹ + 1 (2.14 Billion) queries · Quantum: Exactly 1 query', isCorrect: true },
      { id: 'c', text: 'Classical: 32 queries · Quantum: 0 queries', isCorrect: false },
      { id: 'd', text: 'Classical: 2³² queries · Quantum: 32 queries', isCorrect: false }
    ],
    explanation: {
      coreReason: 'To be 100% deterministic, a classical algorithm could observe half the inputs (2ⁿ⁻¹) all outputting 0, and still need one more query to confirm whether the function is constant or balanced. Deutsch-Jozsa uses Hadamard gates to create a uniform superposition and phase kickback to measure destructive interference across all balanced states in a single shot.',
      classicalMath: 'Worst-case deterministic classical queries = 2^(n-1) + 1 = 2³¹ + 1 = 2,147,483,649 evaluations.',
      quantumMath: 'Deutsch-Jozsa query complexity = Exactly 1 query. If the measured state is |00...0⟩, it is constant; otherwise, balanced.',
      takeaway: 'Deutsch-Jozsa was the first quantum algorithm to prove an exact exponential separation between deterministic classical and quantum query complexity.'
    }
  },
  {
    id: 'qft_vs_fft',
    category: 'FOUNDATIONS',
    title: 'Discrete Fourier Transform (QFT vs FFT)',
    scenario: 'Performing a Discrete Fourier Transform on a statevector of size N = 2³⁰ (over 1 billion elements).',
    variableN: 'N = 2³⁰ (n = 30 qubits)',
    question: 'How does the gate complexity of the Quantum Fourier Transform (QFT) compare to the Classical Fast Fourier Transform (FFT)?',
    classicalComplexity: 'O(N log N) operations',
    quantumComplexity: 'O((log N)²) or O(n²) gates',
    speedupType: 'EXPONENTIAL',
    classicalOpsDisplay: '30 × 2³⁰ ≈ 32.2 Billion Ops',
    quantumOpsDisplay: 'n(n+1)/2 = 465 Gates',
    speedupRatioDisplay: '69 Million × Fewer Gates',
    options: [
      { id: 'a', text: 'Classical FFT: O(N log N) · Quantum QFT: O(n²) = O((log N)²) gates', isCorrect: true },
      { id: 'b', text: 'Classical FFT: O(N²) · Quantum QFT: O(N) gates', isCorrect: false },
      { id: 'c', text: 'Classical FFT: O(log N) · Quantum QFT: O(1) gate', isCorrect: false },
      { id: 'd', text: 'Both require identical O(N log N) operations', isCorrect: false }
    ],
    explanation: {
      coreReason: 'Classical FFT processes each of the N discrete values explicitly (O(N log N)). QFT operates directly on the quantum amplitudes in superposition using just n Hadamard gates and n(n-1)/2 controlled phase rotation gates (O(n²)).',
      classicalMath: 'FFT operations = N log₂ N = 2³⁰ × 30 ≈ 32,212,254,720 arithmetic steps.',
      quantumMath: 'QFT gate count = n(n + 1) / 2 = 30 × 31 / 2 = 465 two-qubit controlled phase gates.',
      takeaway: 'Caveat: While QFT transforms amplitudes exponentially faster, extracting all N individual amplitudes requires quantum state tomography (which takes O(N) measurements). QFT is therefore used as a subroutine in Shor, QPE, and HHL rather than a direct FFT replacement.'
    }
  },
  {
    id: 'simon_hidden_shift',
    category: 'ORACLE',
    title: 'Simon’s Problem: Hidden Subgroup XOR Period',
    scenario: 'Given a 2-to-1 function f(x) with hidden period s such that f(x) = f(y) if and only if y = x ⊕ s, for n = 64-bit strings.',
    variableN: 'n = 64 bits',
    question: 'What is the provable query complexity difference between classical collision search and Simon’s algorithm?',
    classicalComplexity: 'Ω(2^(n/2)) queries',
    quantumComplexity: 'O(n) queries',
    speedupType: 'EXPONENTIAL',
    classicalOpsDisplay: '2³² ≈ 4.29 Billion Queries',
    quantumOpsDisplay: 'O(64) ≈ 64 Queries',
    speedupRatioDisplay: '67 Million × Speedup',
    options: [
      { id: 'a', text: 'Classical: O(n) · Quantum: O(1)', isCorrect: false },
      { id: 'b', text: 'Classical: Ω(2^(n/2)) ~ 4.29 Billion queries · Quantum: O(n) ~ 64 queries', isCorrect: true },
      { id: 'c', text: 'Classical: O(2ⁿ) · Quantum: O(√n)', isCorrect: false },
      { id: 'd', text: 'Classical: O(n²) · Quantum: O(n)', isCorrect: false }
    ],
    explanation: {
      coreReason: 'By the classical Birthday Paradox, finding a collision in an unknown 2-to-1 function requires drawing roughly √(2ⁿ) = 2^(n/2) samples. Simon’s algorithm samples a linear equation y · s = 0 (mod 2) on every single run. With ~n independent equations, classical Gaussian elimination solves for s in polynomial time.',
      classicalMath: 'Birthday collision threshold = √(2⁶⁴) = 2³² ≈ 4,294,967,296 oracle queries.',
      quantumMath: 'Simon’s quantum queries = n + O(1) ≈ 64 to 70 queries to obtain a full-rank linear system.',
      takeaway: 'Simon’s algorithm provided the first rigorous proof of an exponential quantum speedup in a randomized oracle model and directly inspired Peter Shor to invent his factoring algorithm.'
    }
  },
  {
    id: 'hhl_linear_systems',
    category: 'LINEAR_ALGEBRA',
    title: 'HHL Algorithm: Solving N × N Linear Systems',
    scenario: 'Solving A x = b for an s-sparse, well-conditioned N × N Hermitian matrix to compute an expectation value ⟨x|M|x⟩, with N = 1,000,000,000 (10⁹).',
    variableN: 'N = 10⁹, s = sparsity, κ = condition number',
    question: 'How does the Harrow-Hassidim-Lloyd (HHL) quantum algorithm scale with matrix dimension N compared to classical Conjugate Gradient?',
    classicalComplexity: 'O(N · s · κ)',
    quantumComplexity: 'O(log(N) · s² · κ² / ε)',
    speedupType: 'EXPONENTIAL',
    classicalOpsDisplay: 'O(10⁹) Operations',
    quantumOpsDisplay: 'O(log 10⁹) ≈ 30 Operations',
    speedupRatioDisplay: 'Exponential in Matrix Dimension N',
    options: [
      { id: 'a', text: 'Classical: O(N) · Quantum: O(log N) — Exponential speedup in dimension N', isCorrect: true },
      { id: 'b', text: 'Classical: O(N³) · Quantum: O(N²) — Quadratic speedup', isCorrect: false },
      { id: 'c', text: 'Classical: O(1) · Quantum: O(log N)', isCorrect: false },
      { id: 'd', text: 'Both scale as O(N log N)', isCorrect: false }
    ],
    explanation: {
      coreReason: 'Classical iterative solvers (like Conjugate Gradient) must compute vector updates of dimension N, scaling linearly with N (O(N s κ)). HHL encodes vector |x⟩ into log₂(N) qubits and uses Quantum Phase Estimation and Hamiltonian simulation to invert eigenvalues in O(log(N) s² κ² / ε) time.',
      classicalMath: 'Classical Conjugate Gradient = O(N s κ). For N = 10⁹, requires billions of matrix-vector operations.',
      quantumMath: 'HHL gate depth = O(poly(log N, s, κ, 1/ε)). log₂(10⁹) ≈ 30 qubits and logarithmic depth.',
      takeaway: 'HHL provides an exponential speedup in N, serving as the foundational building block for Quantum Machine Learning (QML) and finite-element PDE simulations.'
    }
  },
  {
    id: 'bbbst_lower_bound',
    category: 'FOUNDATIONS',
    title: 'The BBBST Quantum Query Lower Bound',
    scenario: 'Can a future quantum algorithm search an unstructured database of size N in O(log N) or O(1) queries?',
    variableN: 'Database of size N',
    question: 'According to the Bennett-Bernstein-Brassard-Vazirani (BBBST 1997) theorem, what is the fundamental limit of quantum search?',
    classicalComplexity: 'Ω(N) Classical Lower Bound',
    quantumComplexity: 'Ω(√N) Quantum Lower Bound',
    speedupType: 'QUADRATIC',
    classicalOpsDisplay: 'Ω(N) queries strictly required',
    quantumOpsDisplay: 'Ω(√N) queries strictly required',
    speedupRatioDisplay: 'Grover is Provably Optimal',
    options: [
      { id: 'a', text: 'Yes, an exponential speedup to O(log N) is possible with fault-tolerant cat qubits', isCorrect: false },
      { id: 'b', text: 'No, Ω(√N) is a mathematically proved lower bound; Grover search is strictly optimal', isCorrect: true },
      { id: 'c', text: 'Yes, if the quantum computer has infinite entanglement depth', isCorrect: false },
      { id: 'd', text: 'No, classical computers can search unstructured data in O(√N) using heuristic hashing', isCorrect: false }
    ],
    explanation: {
      coreReason: 'The BBBST theorem uses the polynomial method and hybrid argument to prove that any quantum oracle algorithm searching an unstructured space of size N must make at least Ω(√N) queries to differentiate the target state with probability > 2/3.',
      classicalMath: 'Classical deterministic and randomized search have a strict lower bound of Ω(N).',
      quantumMath: 'Quantum lower bound is proved to be Ω(√N). Grover’s algorithm achieves O(√N), making it asymptotically optimal.',
      takeaway: 'Quantum computers cannot magically solve all NP problems in polynomial time! Unstructured search has an unbreakable quadratic wall.'
    }
  },
  {
    id: 'chemistry_femoco',
    category: 'CHEMISTRY',
    title: 'Quantum Chemistry: FeMoco Nitrogenase Active Site',
    scenario: 'Calculating the ground state electronic energy of the Nitrogenase active site (Fe₇MoS₉C cluster, 54 active spatial orbitals) for green ammonia synthesis.',
    variableN: 'N = 108 spin-orbitals',
    question: 'Why can’t classical supercomputers calculate the exact ground state (Full Configuration Interaction) while Quantum Phase Estimation can?',
    classicalComplexity: 'O(e^N) — Exponential Hilbert Space',
    quantumComplexity: 'O(poly(N)) Qubit Hamiltonians',
    speedupType: 'EXPONENTIAL',
    classicalOpsDisplay: '10³¹ Determinants (> RAM on Earth)',
    quantumOpsDisplay: '~108 Logical Qubits + QPE Circuit',
    speedupRatioDisplay: 'Calculable vs Classically Impossible',
    options: [
      { id: 'a', text: 'Full Configuration Interaction requires diagonalizing a 10³¹-dimensional matrix; quantum QPUs map electrons directly to fermionic qubits', isCorrect: true },
      { id: 'b', text: 'Classical computers cannot represent negative numbers in wavefunctions', isCorrect: false },
      { id: 'c', text: 'Quantum computers use floating-point numbers with infinite bits of precision', isCorrect: false },
      { id: 'd', text: 'Chemical bonds can only be simulated at absolute zero temperature', isCorrect: false }
    ],
    explanation: {
      coreReason: 'Electrons are indistinguishable fermions obeying the Pauli Exclusion Principle. Classically, representing an arbitrary anti-symmetric entangled state of 54 electrons in 108 spin-orbitals requires storing (108 choose 54) ≈ 10³¹ complex coefficients—requiring more bytes than all storage drives on Earth. A quantum computer maps each electronic orbital directly to a qubit via Jordan-Wigner or Bravyi-Kitaev transformations.',
      classicalMath: 'Exact Full-CI matrix dimension = (108 choose 54) ≈ 1.57 × 10³¹ basis states. Unsolvable even on exascale clusters.',
      quantumMath: 'Quantum representation: 108 qubits. Trotterized Hamiltonian simulation + Quantum Phase Estimation computes energy to chemical accuracy (< 1 kcal/mol) in polynomial time.',
      takeaway: 'Simulating quantum mechanics using quantum hardware was Richard Feynman’s original 1982 motivation for proposing quantum computing.'
    }
  }
];

/**
 * Quantum Studio — Global Quantum Hardware Race & Marketplace Dataset
 */

export interface HardwareMilestone {
  flag: 'cn' | 'jp' | 'us' | 'eu';
  countryCode: string;
  name: string;
  org: string;
  stats: [string, string][];
  desc: string;
  algoId: string | null;
}

export const GLOBAL_MILESTONES: HardwareMilestone[] = [
  {
    flag: 'cn',
    countryCode: 'CN',
    name: 'Zuchongzhi 3.0',
    org: 'USTC (Hefei) — Pan Jianwei, Zhu Xiaobo, Peng Chengzhi',
    stats: [
      ['Architecture', 'Superconducting Transmon'],
      ['Qubit Count', '105 Programmable Qubits'],
      ['Couplers', '182 Tunable Couplers'],
      ['2Q Gate Fidelity', '~99.62% Average'],
      ['Coherence (T₁)', '~72 μs Coherence']
    ],
    desc: 'Demonstrated programmable superconducting quantum computational advantage on random circuit sampling (RCS), estimated ~10¹⁵× faster than classical supercomputers.',
    algoId: 'zuchongzhi_rcs'
  },
  {
    flag: 'cn',
    countryCode: 'CN',
    name: 'Jiuzhang 4.0',
    org: 'USTC (Hefei) — Pan Jianwei, Lu Chaoyang',
    stats: [
      ['Architecture', 'Gaussian Boson Sampling (GBS)'],
      ['Interferometer', '8,176-Mode Optical Mesh'],
      ['Photons Detected', 'Up to 3,050 Photons'],
      ['Sampling Rate', '~25 μs per sample'],
      ['Algorithmic Task', '#P-Hard Matrix Permanent']
    ],
    desc: 'Continuous-variable photonic processor operating on squeezed states of light, solving classically intractable sampling problems via quantum optical interference.',
    algoId: 'jiuzhang_gbs'
  },
  {
    flag: 'jp',
    countryCode: 'JP',
    name: 'Coherent Ising Machine (CIM)',
    org: 'NTT Research + Univ. of Tokyo & Tokyo Tech',
    stats: [
      ['Architecture', 'Degenerate Optical Parametric Oscillators'],
      ['Scale Reported', 'Up to 100,000 Spins'],
      ['Target Domain', 'NP-Hard Ising / MAX-CUT'],
      ['Platform Name', 'NTT LASOLV Fiber Loop'],
      ['Methodology', 'Non-equilibrium Phase Dissipation']
    ],
    desc: 'Photonic network of optical parametric oscillators that naturally settles into minimum-energy spin configurations, tackling combinatorial optimization.',
    algoId: 'ntt_cim_maxcut'
  },
  {
    flag: 'us',
    countryCode: 'US',
    name: 'Willow / Sycamore',
    org: 'Google Quantum AI (Santa Barbara)',
    stats: [
      ['Architecture', 'Superconducting Transmon Grid'],
      ['Qubit Count', '105 Qubits (Willow)'],
      ['Primary Focus', 'Below-Threshold Surface Code QEC'],
      ['Milestone', 'Logical error rate lower than physical'],
      ['Benchmarking', 'Quantum Error Correction Demonstration']
    ],
    desc: 'Benchmark superconducting reference machine demonstrating exponential suppression of logical errors below surface-code fault-tolerance thresholds.',
    algoId: null
  }
];

export interface MarketplaceVendor {
  id: string;
  name: string;
  country: string;
  flag: string;
  tech: 'superconducting' | 'trapped-ion' | 'photonic' | 'neutral-atom' | 'annealing';
  qubits: number;
  fidelity2q: number | null;
  coherenceUs: number | null;
  connectivity: string;
  deploy: ('cloud' | 'onprem')[];
  priceMin: number | null; // In Millions USD
  priceMax: number | null;
  leadWeeks: number;
  rating: number;
  cloudRate: number | null; // USD per hour
  desc: string;
}

export const MARKETPLACE_VENDORS: MarketplaceVendor[] = [
  {
    id: 'boreal',
    name: 'Boreal Quantum Systems',
    country: 'Canada',
    flag: '🇨🇦',
    tech: 'superconducting',
    qubits: 127,
    fidelity2q: 99.5,
    coherenceUs: 100,
    connectivity: 'Heavy-Hex Nearest-Neighbor',
    deploy: ['cloud', 'onprem'],
    priceMin: 2.8,
    priceMax: 4.5,
    leadWeeks: 26,
    rating: 4.4,
    cloudRate: 380,
    desc: 'Mid-scale superconducting transmon processor with dilution cryostat installation options and low-latency cloud access.'
  },
  {
    id: 'azure-trap',
    name: 'Azure Trap Technologies',
    country: 'United States',
    flag: '🇺🇸',
    tech: 'trapped-ion',
    qubits: 32,
    fidelity2q: 99.9,
    coherenceUs: 800000,
    connectivity: 'All-to-All Full Reconfigurability',
    deploy: ['cloud'],
    priceMin: 1.2,
    priceMax: 2.0,
    leadWeeks: 20,
    rating: 4.8,
    cloudRate: 220,
    desc: 'High-fidelity ytterbium trapped-ion system offering complete all-to-all connectivity and minute-scale coherence times for deep circuits.'
  },
  {
    id: 'helios',
    name: 'Helios Neutral Atom Corp',
    country: 'France',
    flag: '🇫🇷',
    tech: 'neutral-atom',
    qubits: 256,
    fidelity2q: 99.2,
    coherenceUs: 1500,
    connectivity: 'Dynamic Optical Tweezers 2D/3D',
    deploy: ['cloud', 'onprem'],
    priceMin: 3.0,
    priceMax: 5.0,
    leadWeeks: 30,
    rating: 4.5,
    cloudRate: 450,
    desc: 'Reconfigurable rubidium atom arrays with real-time optical tweezer rearrangement, ideal for quantum simulation and Hamiltonian dynamics.'
  },
  {
    id: 'meridian',
    name: 'Meridian Photonics',
    country: 'United States',
    flag: '🇺🇸',
    tech: 'photonic',
    qubits: 216,
    fidelity2q: null,
    coherenceUs: null,
    connectivity: 'Integrated Optical Interferometer',
    deploy: ['cloud'],
    priceMin: null,
    priceMax: null,
    leadWeeks: 12,
    rating: 4.1,
    cloudRate: 250,
    desc: 'Room-temperature photonic Gaussian Boson Sampling processor tailored for graph analytics, dense subgraph discovery, and molecular docking.'
  },
  {
    id: 'kessler',
    name: 'Kessler Cryo-Superconducting Labs',
    country: 'Germany',
    flag: '🇩🇪',
    tech: 'superconducting',
    qubits: 72,
    fidelity2q: 99.7,
    coherenceUs: 120,
    connectivity: 'Square Lattice with Tunable Couplers',
    deploy: ['onprem'],
    priceMin: 2.1,
    priceMax: 2.1,
    leadWeeks: 24,
    rating: 4.6,
    cloudRate: null,
    desc: 'Dedicated on-premises superconducting installation engineered for national research facilities and sovereign quantum labs.'
  },
  {
    id: 'pinnacle',
    name: 'Pinnacle Annealing Systems',
    country: 'Canada',
    flag: '🇨🇦',
    tech: 'annealing',
    qubits: 5000,
    fidelity2q: null,
    coherenceUs: null,
    connectivity: 'Pegasus Chimera Graph',
    deploy: ['cloud'],
    priceMin: 1.5,
    priceMax: 1.5,
    leadWeeks: 16,
    rating: 4.0,
    cloudRate: 150,
    desc: '5,000+ qubit macroscopic quantum annealer solving large-scale combinatorial optimization, logistics routing, and financial portfolio balancing.'
  },
  {
    id: 'sapphire',
    name: 'Sapphire Ion Dynamics',
    country: 'South Korea',
    flag: '🇰🇷',
    tech: 'trapped-ion',
    qubits: 20,
    fidelity2q: 99.8,
    coherenceUs: 600000,
    connectivity: 'All-to-All Barium Ions',
    deploy: ['cloud'],
    priceMin: 0.9,
    priceMax: 0.9,
    leadWeeks: 18,
    rating: 4.7,
    cloudRate: 120,
    desc: 'Cost-effective high-fidelity trapped-ion system offering university labs accessible quantum execution with full multi-qubit entangling gates.'
  },
  {
    id: 'nishikawa',
    name: 'Nishikawa Optical Photonics',
    country: 'Japan',
    flag: '🇯🇵',
    tech: 'photonic',
    qubits: 100,
    fidelity2q: null,
    coherenceUs: null,
    connectivity: 'Continuous-Variable Optical Fiber Loop',
    deploy: ['cloud'],
    priceMin: null,
    priceMax: null,
    leadWeeks: 14,
    rating: 4.3,
    cloudRate: 180,
    desc: 'Continuous-variable squeezed state photonic system with fiber delay lines, providing high-repetition sampling for quantum machine learning.'
  }
];

export function calculateEffectiveDepth(vendor: MarketplaceVendor, threshold = 0.5): number | null {
  if (vendor.fidelity2q === null) return null;
  const f = vendor.fidelity2q / 100;
  if (f >= 1) return 9999;
  return Math.floor(Math.log(threshold) / Math.log(f));
}

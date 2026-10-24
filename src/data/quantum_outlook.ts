/**
 * Quantum Studio — Global Quantum Geopolitics, Country Initiatives & Future Horizons Dataset
 */

export interface CountryInitiative {
  id: string;
  country: string;
  code: string;
  flag: string;
  region: 'Americas' | 'Europe' | 'Asia-Pacific' | 'Global / Alliance';
  initiativeName: string;
  enactedYear: number;
  fundingUsdBillions: number;
  headlineSummary: string; // Plain English for everyone
  technicalDetails: string; // Deep technical analysis for developers
  flagshipPrograms: Array<{ name: string; org: string; focus: string }>;
  strategicPillars: string[];
  geopoliticalStance: string;
  exportControlStatus: string;
  pqcTransitionDeadline: string;
  sovereignInfrastructure: string;
  keyDebates: string[];
}

export interface FutureHorizon {
  id: string;
  title: string;
  timeframe: string;
  eraName: string;
  status: 'active-now' | 'near-term' | 'medium-term' | 'long-term';
  trlLevel: string; // Technology Readiness Level
  simplifiedExplanation: string; // For anyone
  technicalBreakthroughs: string[]; // For quantum developers
  keyMilestones: string[];
  physicalChallenges: string[];
  impactOnSociety: string;
}

export const GLOBAL_COUNTRY_INITIATIVES: CountryInitiative[] = [
  {
    id: 'usa',
    country: 'United States',
    code: 'US',
    flag: '🇺🇸',
    region: 'Americas',
    initiativeName: 'National Quantum Initiative Act (NQI) & CHIPS and Science Act',
    enactedYear: 2018,
    fundingUsdBillions: 3.8,
    headlineSummary: 'The United States leads a multi-agency, private-public model blending federal hubs (DOE, NSF, NIST) with tech giants (Google, IBM, Microsoft, Amazon) and startups (PsiQuantum, IonQ). The national priority is maintaining technical sovereignty, standardizing post-quantum cryptography, and preventing adversaries from achieving cryptanalytic surprise.',
    technicalDetails: 'Focuses on dual-track architectures: superconducting circuits (Google Willow below-threshold surface code, IBM 1,121-qubit Condor & Heron modular coupler networks) and trapped-ion/photonic scaling. Mandates rapid deployment of NIST FIPS 203 (ML-KEM) and FIPS 204 (ML-DSA) across federal networks via OMB Memorandum M-23-02 and National Security Memorandum 10 (NSM-10).',
    flagshipPrograms: [
      { name: 'DOE Quantum Information Science Research Centers', org: '5 National Labs (Argonne, Brookhaven, Fermilab, LBNL, ORNL)', focus: 'Superconducting Qubit Coherence, Quantum Materials & Networking' },
      { name: 'NIST Post-Quantum Cryptography Standardization', org: 'NIST', focus: 'Lattice-based FIPS 203/204/205 Standards' },
      { name: 'DARPA Quantum Benchmarking & US2QC', org: 'DARPA', focus: 'Fault-tolerant quantum computing feasibility verification' }
    ],
    strategicPillars: [
      'Commercial Ecosystem Commercialization',
      'National Defense & Cryptographic Modernization',
      'Export Controls on Cryogenic Dilution Fridges & Advanced Chips',
      'Domestic Semiconductor Supply Chain Reshoring'
    ],
    geopoliticalStance: 'Enforces strict unilateral and multilateral export controls on advanced quantum computers (>34 qubits with low error), sub-10mK dilution refrigerators, and specialized EDA software to prevent dual-use military exploitation.',
    exportControlStatus: 'Tier 1 Restrictions (Commerce Dept EAR Controls on quantum processors, cryogenic systems, and microwave components).',
    pqcTransitionDeadline: '2030 (Priority Systems) / 2035 (Full Decoupling of RSA/ECC via CNSA 2.0)',
    sovereignInfrastructure: 'Nationwide DOE Quantum Network testbeds connecting national laboratories in Chicago and Long Island; hybrid HPC-Quantum supercomputers at Summit and Frontier.',
    keyDebates: [
      'Balance between open academic science and national security restrictions on foreign graduate researchers.',
      'Antitrust vs strategic subsidies for domestic sovereign quantum hardware champions.',
      'Supply chain bottlenecks in isotope Helium-3 and high-density coaxial cabling.'
    ]
  },
  {
    id: 'china',
    country: 'China',
    code: 'CN',
    flag: '🇨🇳',
    region: 'Asia-Pacific',
    initiativeName: '14th & 15th Five-Year Plans & National Quantum S&T Megaproject',
    enactedYear: 2016,
    fundingUsdBillions: 15.3,
    headlineSummary: 'China has established the world’s largest state-funded quantum research infrastructure, anchored by the massive National Laboratory for Quantum Information Sciences in Hefei. China pursues a dual offensive in optical quantum supremacy (Jiuzhang), superconducting processors (Zuchongzhi), and the world’s first intercontinental quantum communication network (Micius satellite).',
    technicalDetails: 'World-leading achievements in Gaussian Boson Sampling (Jiuzhang 4.0 detecting >3,000 photons with classically unsimulatable sampling rates) and superconducting random circuit sampling (Zuchongzhi 3.0 with 105 qubits and 182 tunable couplers). Deployment of the 2,000-km Beijing-Shanghai Quantum Secure Direct Communication (QSDC) and satellite-to-ground entangled photon links.',
    flagshipPrograms: [
      { name: 'National Laboratory for Quantum Information Sciences', org: 'CAS / USTC (Hefei) — Pan Jianwei Team', focus: 'Comprehensive Superconducting, Photonic & Quantum Repeaters' },
      { name: 'Micius / Quantum Satellite Constellation', org: 'Chinese Academy of Sciences', focus: 'Space-to-Earth Entanglement Distribution & Relativistic QKD' },
      { name: 'Origin Quantum Computing Lab', org: 'Origin Quantum / CAS', focus: 'Superconducting Wukong Chip & Domestic Control Electronics' }
    ],
    strategicPillars: [
      'State-Directed Mega-Infrastructure Investment',
      'Quantum-Secure Communication Supremacy (QKD & Satellite Mesh)',
      'Indigenous Cryogenics & Microwave Electronics (Sanction Resistance)',
      'Hefei "Quantum Avenue" Industrial Cluster'
    ],
    geopoliticalStance: 'Treats quantum technology as a core strategic lever of national sovereignty and asymmetric technological capability. Prioritizes end-to-end self-reliance to bypass Western technology embargoes.',
    exportControlStatus: 'Strict reciprocal export restrictions on domestic quantum encryption devices and photonic components.',
    pqcTransitionDeadline: 'Parallel strategy: Domestic Lattice PQC algorithms combined with massive physical QKD backbone deployment.',
    sovereignInfrastructure: 'Beijing-Shanghai Quantum Secure Communication Trunk Line connecting financial nodes in Jinan, Hefei, and Shanghai; integrated space-ground quantum network.',
    keyDebates: [
      'Debate between physical Quantum Key Distribution (QKD) hardware vs mathematical Post-Quantum Cryptography (PQC).',
      'Overcoming Western embargoes on high-end microwave vector analyzers and sub-kelvin cryostats through indigenous Chinese manufacturing.',
      'Transparency and external replicability of state-sponsored supremacy benchmarks.'
    ]
  },
  {
    id: 'eu',
    country: 'European Union',
    code: 'EU',
    flag: '🇪🇺',
    region: 'Europe',
    initiativeName: 'EU Quantum Technologies Flagship & European Quantum Pact',
    enactedYear: 2018,
    fundingUsdBillions: 8.5,
    headlineSummary: 'The European Union prioritizes "Strategic Technological Autonomy" across its 27 member states, seeking to avoid dependency on American cloud platforms or Chinese hardware. Initiatives combine the €1B+ Quantum Flagship, EuroHPC quantum-supercomputing integration, and the EuroQCI sovereign communication network.',
    technicalDetails: 'Pioneering work in trapped-ion processors (AQT, Alpine Quantum Technologies), neutral atom quantum computing (Pasqal, 100+ to 1,000 neutral Rubidium/Strontium atoms), and spin qubits in silicon (QuTech Delft). Building EuroHPC hybrid quantum-classical supercomputing hubs in France, Germany, Spain, and Finland.',
    flagshipPrograms: [
      { name: 'EuroQCI (European Quantum Communication Infrastructure)', org: 'European Commission + ESA', focus: 'Pan-European Terrestrial & Satellite Quantum Encryption' },
      { name: 'OpenSuperQ / OpenSuperQPlus', org: 'Forschungszentrum Jülich & Consortia', focus: '100-to-1,000 Qubit Open European Quantum Computer' },
      { name: 'EuroHPC JU Quantum Integrations', org: 'EuroHPC (Jülich, BSC, CINECA, GENCI)', focus: 'Co-locating Quantum Accelerators with Classical Supercomputers' }
    ],
    strategicPillars: [
      'Open Science Combined with Strategic European Autonomy',
      'Neutral-Atom & Trapped-Ion Hardware Diversification',
      'Public Procurement of European Quantum Hardware for National Labs',
      'Ethical, Trustworthy & Green Quantum Computing Standards'
    ],
    geopoliticalStance: 'Balances collaborative international research with defensive measures to safeguard intellectual property. Enforces European ownership requirements for sensitive sovereign defense procurement.',
    exportControlStatus: 'Harmonized EU Dual-Use Export Control List (Regulation 2021/821) targeting quantum computers with gate fidelities above high-performance thresholds.',
    pqcTransitionDeadline: '2030–2032 (Member state mandates led by BSI in Germany and ANSSI in France).',
    sovereignInfrastructure: 'EuroQCI optical fiber testbeds across Germany, France, Italy, and the Netherlands; LUMI-Q quantum integration in Ostrava.',
    keyDebates: [
      'Fragmentation of national budgets between member states vs cohesive federalized European spending.',
      'Preventing the "brain drain" of top European quantum physicists to US Silicon Valley venture-backed firms.',
      'Energy efficiency and environmental sustainability benchmarks for cryogenic facilities.'
    ]
  },
  {
    id: 'uk',
    country: 'United Kingdom',
    code: 'GB',
    flag: '🇬🇧',
    region: 'Europe',
    initiativeName: 'National Quantum Strategy (10-Year £2.5 Billion Vision)',
    enactedYear: 2023,
    fundingUsdBillions: 3.2,
    headlineSummary: 'The UK launched an ambitious 10-year £2.5B National Quantum Strategy to establish Britain as a global "Quantum-Ready Nation" and attract top quantum talent. Anchor institutions like the National Quantum Computing Centre (NQCC) at Harwell provide open hardware testbeds.',
    technicalDetails: 'World-renowned strength in trapped-ion and neutral atom engineering (Oxford Ionics, Universal Quantum, Orca Computing). NQCC campus operates multiple on-premise quantum modalities (superconducting, trapped ions, photonics, and neutral atoms) with dedicated benchmarking protocols.',
    flagshipPrograms: [
      { name: 'NQCC (National Quantum Computing Centre)', org: 'STFC & UKRI (Harwell Campus)', focus: 'Open National Hardware Testbed with Multi-Architecture Access' },
      { name: 'National Quantum Technologies Programme (NQTP)', org: 'EPSRC + 4 University Hubs', focus: 'Quantum Sensors, Metrology, Imaging, and Computing' },
      { name: 'Quantum Readiness Missions', org: 'Department for Science, Innovation and Technology', focus: 'Deploying Quantum in Healthcare, Finance, and Civil Defense' }
    ],
    strategicPillars: [
      'World-Class University Commercialization Spinouts',
      'Regulatory Sandbox & Pro-Innovation Governance',
      'National Quantum Computing Centre (NQCC) Hardware Hub',
      'International Bilateral Treaties (AUKUS Pillar II, UK-US Quantum Cooperation)'
    ],
    geopoliticalStance: 'Active participant in AUKUS Pillar II (Advanced Capabilities) sharing quantum navigation, sensing, and defense algorithms with the US and Australia.',
    exportControlStatus: 'Strategic Export Controls aligned with Wassenaar Arrangement standards for high-depth quantum systems.',
    pqcTransitionDeadline: '2030 (Critical National Infrastructure) / 2035 (Broad Commercial Compliance).',
    sovereignInfrastructure: 'Harwell NQCC quantum testbed facility; dedicated UK Quantum Network (UKQN) optical backbone.',
    keyDebates: [
      'Attracting sustained growth capital beyond seed rounds to prevent British quantum startups from relocating to the US.',
      'Immigration visa pathways for international quantum scientists post-Brexit.'
    ]
  },
  {
    id: 'japan',
    country: 'Japan',
    code: 'JP',
    flag: '🇯🇵',
    region: 'Asia-Pacific',
    initiativeName: 'Quantum Technology and Innovation Strategy & Moonshot Goal 6',
    enactedYear: 2020,
    fundingUsdBillions: 2.9,
    headlineSummary: 'Japan leverages its legendary precision manufacturing, cryogenic materials, and optical optics expertise to target a universal, fault-tolerant quantum computer by 2050 (Moonshot Goal 6). RIKEN hosts domestic superconducting quantum computers, while NTT pioneers optical Coherent Ising Machines.',
    technicalDetails: 'Focuses on 64-qubit and 144-qubit domestic superconducting transmon processors deployed at RIKEN (Wako), optical parametric oscillator Coherent Ising Machines for combinatorial optimization (NTT LASOLV), and diamond nitrogen-vacancy (NV) center quantum sensors (Tokyo Tech).',
    flagshipPrograms: [
      { name: 'Moonshot R&D Program — Goal 6', org: 'JST / RIKEN (Yasunobu Nakamura Team)', focus: 'Realization of Fault-Tolerant Universal Quantum Computer by 2050' },
      { name: 'Q-LEAP (Quantum Leap Flagship Program)', org: 'MEXT', focus: 'Superconducting, Optical, and Solid-State Quantum Technologies' },
      { name: 'RIKEN Quantum Computing Center', org: 'RIKEN / Fujitsu / AIST', focus: 'Hybrid Supercomputer-Quantum Link (Fugaku + Quantum QPU)' }
    ],
    strategicPillars: [
      'Advanced Materials & Precision Manufacturing Leadership',
      'Integration of Fugaku Supercomputer with Quantum Processors',
      'Industrial Consortium Adoption (Toyota, Mitsubishi, Mizuho)',
      'Long-Term Horizon Focus (2050 Moonshot)'
    ],
    geopoliticalStance: 'Aligns closely with the US and G7 partners while positioning Japan as the premier supplier of specialized quantum components (dilution fridge components, microwave isolators, superconducting wires).',
    exportControlStatus: 'Foreign Exchange and Foreign Trade Act (FEFTA) controls on dual-use quantum technologies.',
    pqcTransitionDeadline: '2030 for government systems; coordinated with CRYPTREC recommendations.',
    sovereignInfrastructure: 'Fugaku-Quantum hybrid computing link at RIKEN Center for Computational Science (R-CCS) in Kobe.',
    keyDebates: [
      'Accelerating commercial deployment speed to match US and Chinese short-term breakthroughs.',
      'Overcoming corporate conservatism in adopting NISQ quantum workflows across legacy conglomerates.'
    ]
  },
  {
    id: 'india',
    country: 'India',
    code: 'IN',
    flag: '🇮🇳',
    region: 'Asia-Pacific',
    initiativeName: 'National Quantum Mission (NQM — ₹6,003 Crore)',
    enactedYear: 2023,
    fundingUsdBillions: 0.75,
    headlineSummary: 'Approved with ₹6,003 Crore ($750M USD), India’s National Quantum Mission aims to build 20-to-1,000 qubit intermediate quantum computers, inter-city quantum communication over 2,000 km, and quantum sensing hubs. India leverages its massive software engineering talent to pioneer quantum algorithms and quantum-safe cryptography.',
    technicalDetails: 'Targets 20-50 physical qubits within 3 years, 50-100 qubits in 5 years, and up to 1,000 qubits in 8 years using superconducting circuits and photonic platforms. The Raman Research Institute (RRI) and IIT Madras lead satellite-based QKD and fiber-based entanglement distribution.',
    flagshipPrograms: [
      { name: 'National Quantum Mission Thematic Hubs (T-Hubs)', org: 'DST (IISc, IITs, RRI, TIFR)', focus: 'Four Hubs: Computing, Communication, Sensing, and Materials' },
      { name: 'Quantum Information and Computing (QuIC) Lab', org: 'Raman Research Institute', focus: 'Entanglement Distribution, QKD & Single-Photon Detectors' },
      { name: 'IIT Madras Center for Quantum Information', org: 'IIT Madras', focus: 'Quantum Algorithms, Error Mitigation & PQC Migration' }
    ],
    strategicPillars: [
      'Harnessing Global Indian Software Engineering Talent',
      'Four Thematic National Hubs (Computing, Comm, Sensors, Materials)',
      'Domestic Defense Communications Security',
      'Affordable, Frugal High-Tech Engineering'
    ],
    geopoliticalStance: 'Pursues strategic autonomy; collaborates selectively through the Quad Quantum Partnership (US, India, Japan, Australia) while fostering indigenous capabilities.',
    exportControlStatus: 'Standard SCOMET (Special Chemicals, Organisms, Materials, Equipment and Technologies) dual-use regulations.',
    pqcTransitionDeadline: '2032 (Defense and Critical Infrastructure targeted).',
    sovereignInfrastructure: 'Delhi-Chandigarh 150km quantum testbed link; DRDO quantum key distribution testing ground.',
    keyDebates: [
      'Accelerating lab-to-market translation from academic IIT labs to commercial hardware startups.',
      'Securing high-purity cryogenic imports and semiconductor fabrication facilities domestically.'
    ]
  },
  {
    id: 'canada',
    country: 'Canada',
    code: 'CA',
    flag: '🇨🇦',
    region: 'Americas',
    initiativeName: 'National Quantum Strategy ($360M CAD)',
    enactedYear: 2023,
    fundingUsdBillions: 0.3,
    headlineSummary: 'Canada is the birthplace of commercial quantum computing (D-Wave quantum annealing) and home to world-class theoretical research at the Perimeter Institute and Institute for Quantum Computing (IQC) in Waterloo. The Canadian ecosystem punches far above its weight in quantum software and photonic quantum computing (Xanadu).',
    technicalDetails: 'Home to D-Wave Advantage (5,000+ qubit annealing), Xanadu Borealis (photonic quantum supremacy), and Photonic Inc. (silicon color centers in telecom band). Extensive national expertise in quantum algorithms and OpenQASM compilers.',
    flagshipPrograms: [
      { name: 'Institute for Quantum Computing (IQC)', org: 'University of Waterloo', focus: 'Foundational Physics, Trapped Ions & Quantum Cryptography' },
      { name: 'Perimeter Institute for Theoretical Physics', org: 'Perimeter Institute', focus: 'Quantum Information Theory, Entanglement & Many-Body Physics' }
    ],
    strategicPillars: [
      'Waterloo "Quantum Valley" Innovation Cluster',
      'Pioneering Photonic & Annealing Hardware',
      'Close Commercial Integration with US Tech Ecosystem'
    ],
    geopoliticalStance: 'Strong proponent of open global collaboration with Five Eyes allies, with protective reviews of foreign takeovers of domestic quantum intellectual property.',
    exportControlStatus: 'Export Control List Group 1 dual-use alignment.',
    pqcTransitionDeadline: '2030 (Treasury Board of Canada Secretariat guidelines).',
    sovereignInfrastructure: 'Waterloo-Toronto-Montreal quantum research corridor.',
    keyDebates: [
      'Preventing the acquisition of promising Canadian quantum startups by foreign multi-nationals.'
    ]
  },
  {
    id: 'australia',
    country: 'Australia',
    code: 'AU',
    flag: '🇦🇺',
    region: 'Asia-Pacific',
    initiativeName: 'National Quantum Strategy & Brisbane PsiQuantum Partnership',
    enactedYear: 2023,
    fundingUsdBillions: 0.94,
    headlineSummary: 'Australia is a pioneer in silicon spin qubits (UNSW Sydney, Michelle Simmons) and recently executed a historic AUD $940M federal/state investment in PsiQuantum to build the world’s first utility-scale fault-tolerant photonic quantum computer in Brisbane by 2027.',
    technicalDetails: 'Pioneered atomic-precision single-atom transistors in silicon (Silicon Quantum Computing, SQC) and room-temperature diamond quantum sensors (Quantum Brilliance). The Brisbane facility focuses on million-qubit photonic chips using standard tier-1 silicon foundry lithography.',
    flagshipPrograms: [
      { name: 'PsiQuantum Brisbane Quantum Facility', org: 'PsiQuantum + Commonwealth & QLD Governments', focus: '1 Million-Qubit Photonic Fault-Tolerant Computer' },
      { name: 'Silicon Quantum Computing (SQC)', org: 'UNSW Sydney (Michelle Simmons Team)', focus: 'Sub-Nanometer Precision Atom-in-Silicon Transistors' }
    ],
    strategicPillars: [
      'AUKUS Pillar II Quantum Defence Cooperation',
      'Silicon & Photonic Manufacturing Scaling',
      'Southern Hemisphere Quantum Hub Leadership'
    ],
    geopoliticalStance: 'Anchor of AUKUS Pillar II quantum initiatives and key Pacific partner in global democratic quantum supply chains.',
    exportControlStatus: 'Defense and Strategic Goods List (DSGL) controls on high-performance quantum technologies.',
    pqcTransitionDeadline: '2030 (Australian Cyber Security Centre ASD guidance).',
    sovereignInfrastructure: 'Brisbane Airport PsiQuantum quantum computer manufacturing & data center site.',
    keyDebates: [
      'Debate surrounding the unprecedented size of the public subsidy to a single hardware vendor (PsiQuantum) vs broad domestic academic grants.'
    ]
  }
];

export const FUTURE_QUANTUM_HORIZONS: FutureHorizon[] = [
  {
    id: 'h1_nisq',
    title: 'Horizon 1: NISQ & Quantum Utility',
    timeframe: '2024 – 2026 (Present Day)',
    eraName: 'Noisy Intermediate-Scale Quantum (NISQ)',
    status: 'active-now',
    trlLevel: 'TRL 7 – 8 (System Demonstration in Operational Environment)',
    simplifiedExplanation: 'Quantum computers have 100 to 1,000 physical qubits, but they are still noisy and prone to errors. Like early vacuum-tube computers, they can perform specialized mathematical sampling tasks that classical computers cannot simulate, but they cannot yet run general-purpose error-free code.',
    technicalBreakthroughs: [
      'Zero-Noise Extrapolation (ZNE) & Clifford Data Regression (CDR) error mitigation without full QEC.',
      'Demonstration of quantum utility on 100+ transmon qubits where quantum simulation rivals classical tensor networks.',
      'Dual-species and neutral-atom tweezer arrays exceeding 1,000 atom traps (Harvard/QuEra, Pasqal).'
    ],
    keyMilestones: [
      'Google Sycamore/Willow Random Circuit Sampling (>10¹⁵× speedup)',
      'USTC Jiuzhang 4.0 Gaussian Boson Sampling (>3,000 photons)',
      'IBM Quantum Utility experiments in condensed matter physics'
    ],
    physicalChallenges: [
      'Two-qubit gate fidelities stuck between 99.0% and 99.8% (still above the fault-tolerance threshold for long algorithms)',
      'Coherence times ($T_1, T_2$) limited to 50–300 microseconds in superconducting circuits by two-level system (TLS) dielectric defects'
    ],
    impactOnSociety: 'Academic supremacy proofs, material science exploratory simulations, and proof-of-concept logistics/portfolio optimization algorithms.'
  },
  {
    id: 'h2_ftqc',
    title: 'Horizon 2: Below-Threshold Logical Qubits',
    timeframe: '2026 – 2030 (Near-Term Future)',
    eraName: 'Early Fault-Tolerant Quantum Computing (FTQC)',
    status: 'near-term',
    trlLevel: 'TRL 5 – 6 (Technology Validated in Industrially Relevant Environment)',
    simplifiedExplanation: 'Instead of using noisy raw qubits directly, multiple physical qubits are grouped together to form a single "protected" logical qubit. When physical noise occurs, the error is detected and corrected faster than it spreads. For the first time, larger quantum chips have LOWER error rates than smaller ones.',
    technicalBreakthroughs: [
      'Rotated Surface Codes with distance $d=3, 5, 7$ operating demonstrably below physical error thresholds ($p < p_{th} \\approx 1\\%$).',
      'Real-time low-latency syndrome decoders running on cryogenic FPGAs inside or adjacent to the dilution fridge ($< 1\\,\\mu\\text{s}$ latency).',
      'Lattice surgery transversal Clifford operations ($CNOT_L$, $H_L$, $S_L$) between distinct logical patches.'
    ],
    keyMilestones: [
      'Google Willow demonstrating exponential error suppression with increasing code distance',
      'Quantinuum H2 achieving 56 entangled logical qubits using ion-trap shuttling',
      'Demonstration of fault-tolerant memory lifetime exceeding any constituent physical qubit'
    ],
    physicalChallenges: [
      'Physical qubit overhead: Each logical qubit requires 50 to 1,000 physical qubits depending on physical gate error rate',
      'Cryogenic wiring heat load: Routing 10,000+ coaxial lines into sub-kelvin cryostats without boiling liquid helium'
    ],
    impactOnSociety: 'First commercial quantum advantage in chemistry (accurate ground-state energies for small catalysts and battery electrolyte molecules).'
  },
  {
    id: 'h3_advantage',
    title: 'Horizon 3: Scalable Universal Advantage',
    timeframe: '2030 – 2035 (Medium-Term Future)',
    eraName: 'Industrial-Scale Fault-Tolerant Computing',
    status: 'medium-term',
    trlLevel: 'TRL 3 – 4 (Experimental Proof of Concept in Production Scale)',
    simplifiedExplanation: 'Quantum computers scale to thousands of logical qubits with massive "Magic State Distillation" factories to execute universal non-Clifford gates (like the T-gate). Quantum computers can run for hours or days without crashing, solving problems in drug discovery, nitrogen fixation for fertilizers, and breaking legacy RSA encryption.',
    technicalBreakthroughs: [
      'Universal Magic State Distillation (15-to-1 or 20-to-4 Bravyi-Kitaev $T$-factories) producing high-fidelity $|T\\rangle$ states ($10^{-12}$ error).',
      'Quantum Phase Estimation (QPE) executed to chemical precision on transition-metal complexes (e.g. FeMoco nitrogenase active site).',
      'Modular quantum optical interconnects linking multiple dilution fridges via photonic links without loss of entanglement.'
    ],
    keyMilestones: [
      'First quantum simulation of room-temperature superconductor candidates with exact many-body Hamiltonians',
      'Shor’s Algorithm factorization of large composite integers beyond classical capability',
      'Global mandate: Full retirement of RSA-2048 and ECC across all financial institutions'
    ],
    physicalChallenges: [
      'Massive resource consumption: Magic state distillation consumes 80% to 95% of all physical qubits in the system',
      'Cosmic ray and background radiation ionizing radiation creating correlated multi-qubit error bursts across the silicon die'
    ],
    impactOnSociety: 'Revolution in clean energy (Haber-Bosch catalyst replacement saving 1-2% of global energy), enzyme design, and mandatory global migration to Post-Quantum Cryptography.'
  },
  {
    id: 'h4_internet',
    title: 'Horizon 4: The Global Quantum Internet',
    timeframe: '2035 – 2045+ (Long-Term Future)',
    eraName: 'Distributed Quantum Mesh & Blind Quantum Cloud',
    status: 'long-term',
    trlLevel: 'TRL 1 – 2 (Basic Principles Observed & Conceptualized)',
    simplifiedExplanation: 'Quantum computers around the world are connected together using fiber optics and satellites carrying entangled light particles. Users can submit computational jobs to cloud quantum servers with mathematical guarantee of privacy (Blind Quantum Computing), and quantum sensors across the planet operate as a single telescope.',
    technicalBreakthroughs: [
      'Telecom-wavelength Quantum Repeaters using atomic frequency combs and spin-photon interfaces (Rare-earth ions, NV centers).',
      'Distributed quantum error correction across inter-city nodes with quantum state teleportation.',
      'Blind Quantum Computing (BQC): Quantum algorithms executed on untrusted cloud hardware where the server learns zero information about the circuit or data.'
    ],
    keyMilestones: [
      'Global entanglement distribution network connecting North America, Europe, and Asia via LEO/GEO quantum satellites',
      'Sub-picosecond atomic clock synchronization across continents enabling ultra-sensitive gravitational wave detection',
      'Very Long Baseline Interferometry (VLBI) optical telescopes enhanced by distributed quantum entanglement'
    ],
    physicalChallenges: [
      'Exponential photon absorption in optical fiber (~0.2 dB/km requires a quantum repeater every 50-100 km)',
      'Extremely high fidelity requirement for quantum memories ($> 99.99\\%$ photon-spin entanglement conversion)'
    ],
    impactOnSociety: 'Unconditional physical privacy for communications, planetary-scale quantum sensing for earthquake and climate prediction, and distributed global quantum computing clusters.'
  }
];

export const INTERNATIONAL_TREATIES_AND_DEBATES = [
  {
    topic: 'Export Controls on Cryogenic Equipment & Quantum Processors',
    alliancesInvolved: ['United States', 'European Union', 'Japan', 'Netherlands', 'Wassenaar Arrangement'],
    coreIssue: 'In 2024–2025, the US Bureau of Industry and Security (BIS), Japan, and the Netherlands placed coordinated export licensing restrictions on dilution refrigerators reaching sub-10 millikelvin temperatures, quantum processors with >34 physical qubits and low error rates, and specialized microwave synthesis equipment.',
    forEveryoneSummary: 'Countries are treating quantum parts like nuclear technology or cutting-edge microchips. Western nations are restricting exports of specialized super-coolers ("dilution fridges") to prevent other nations from building quantum weapons or deciphering classified communications.',
    developerInsight: 'Creates supply chain friction for academic labs relying on Bluefors (Finland) or Oxford Instruments (UK) cryostats. Sparks accelerated domestic substitution in China and India to build indigenous dilution fridges using closed-cycle pulse-tube cryocoolers.'
  },
  {
    topic: 'NIST Post-Quantum Cryptography (PQC) Standards: FIPS 203, 204 & 205',
    alliancesInvolved: ['NIST (USA)', 'BSI (Germany)', 'ANSSI (France)', 'ISO/IEC', 'NATO'],
    coreIssue: 'In August 2024, the US NIST finalized the world’s first formal Post-Quantum Cryptography standards: ML-KEM (FIPS 203, Kyber), ML-DSA (FIPS 204, Dilithium), and SLH-DSA (FIPS 205, SPHINCS+). All federal agencies and critical banks face binding timelines to replace RSA and Elliptic Curve Diffie-Hellman.',
    forEveryoneSummary: 'All standard digital locks on internet banking and passwords rely on math problems (like factoring large numbers) that a future quantum computer can easily crack. PQC replaces them with complex multi-dimensional lattice math that even quantum computers cannot break.',
    developerInsight: 'Developers must audit cryptographic agility. Key size overheads: ML-KEM-768 public key is 1,184 bytes (vs RSA 256 bytes), requiring adjustments to TCP packet MTU fragmentation and TLS handshake timeouts.'
  },
  {
    topic: 'Harvest Now, Decrypt Later (HNDL) Threat Strategy',
    alliancesInvolved: ['Five Eyes (US, UK, CA, AU, NZ)', 'NATO Defence Ministerial', 'Global Financial Sector'],
    coreIssue: 'Foreign intelligence agencies are actively intercepting and storing encrypted diplomatic, military, and corporate communications today, with the goal of decrypting them in the 2030s once a Cryptographically Relevant Quantum Computer (CRQC) is built.',
    forEveryoneSummary: 'Spies don’t need a quantum computer today to steal your secrets. They can download your encrypted messages now and keep them on hard drives until they build a quantum computer in 5 or 10 years to unlock them.',
    developerInsight: 'Mosca’s Theorem dictates urgency: if $X$ (data shelf life, e.g. 20 years for state secrets) + $Y$ (system migration time, e.g. 7 years) > $Z$ (time to quantum threat, e.g. 8 years), your data is ALREADY compromised today.'
  },
  {
    topic: 'Physical QKD (Hardware) vs Mathematical PQC (Software) Divide',
    alliancesInvolved: ['China & Eastern Europe (Pro-QKD)', 'US NSA, UK NCSC, French ANSSI (Pro-PQC)'],
    coreIssue: 'China has invested heavily in physical fiber and satellite Quantum Key Distribution (QKD), claiming information-theoretic security based on quantum physics. Conversely, the US NSA and Western cyber agencies advocate for mathematical Post-Quantum Cryptography (PQC), cautioning that QKD requires untrusted relay nodes and expensive dedicated fiber.',
    forEveryoneSummary: 'Two competing philosophies for internet security: China is physically shooting laser light particles across satellites and dedicated glass cables, while the US and Europe prefer upgrading the software math inside existing smartphones and routers.',
    developerInsight: 'QKD requires specialized detector hardware (SNSPD single-photon detectors) and trusted repeaters every 80 km. PQC is purely algorithmic and drops into existing IP networks over commodity silicon.'
  }
];

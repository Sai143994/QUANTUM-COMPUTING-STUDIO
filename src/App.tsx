import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  QuantumState, 
  Complex,
  GateType, 
  GateOp, 
  NoiseChannel, 
  CircuitCommit,
  GATES_REGISTRY, 
  rotationMatrix,
  u3Matrix,
  CZ_MATRIX,
  CY_MATRIX,
  ISWAP_MATRIX
} from './types/quantum';
import { useToast } from './context/ToastContext';
import { ALGORITHMS, AlgorithmItem } from './data/algorithms';
import { Navbar, ActiveTab, SimLifecycleStatus } from './components/Navbar';
import { TimelineCommitGraph } from './components/TimelineCommitGraph';
import { CircuitComposer } from './components/CircuitComposer';
import { BlochSpheres } from './components/BlochSpheres';
import { StatevectorInspector } from './components/StatevectorInspector';
import { EntanglementVisualizer } from './components/EntanglementVisualizer';
import { AlgorithmsExplorer } from './components/AlgorithmsExplorer';
import { QuantumLab } from './components/QuantumLab';
import { HardwareMarketplace } from './components/HardwareMarketplace';
import { GlobalQuantumOutlook } from './components/GlobalQuantumOutlook';
import { QuantumTechnologyMap3D } from './components/QuantumTechnologyMap3D';
import { QpuHardwareTranspiler } from './components/QpuHardwareTranspiler';
import { QuantumChemistryLab } from './components/QuantumChemistryLab';
import { QuantumCryptographyLab } from './components/QuantumCryptographyLab';
import { QuantumMachineLearningLab } from './components/QuantumMachineLearningLab';
import { QuantumErrorCorrectionStudio } from './components/QuantumErrorCorrectionStudio';
import { QuantumPulseStudio } from './components/QuantumPulseStudio';
import { QasmDrawer } from './components/QasmDrawer';
import { PythonDrawer } from './components/PythonDrawer';
import { QuantumSplashIntro } from './components/QuantumSplashIntro';
import { QuantumQuestModal } from './components/QuantumQuestModal';
import { QuantumQuest } from './data/quantum_quests';
import { QuantumComputingDashboard } from './components/QuantumComputingDashboard';

export default function App() {
  const [splashOpen, setSplashOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    try {
      const validTabs: ActiveTab[] = [
        'dashboard', 'composer', 'algorithms', 'transpiler',
        'chemistry', 'entanglement', 'cryptography', 'qml',
        'qec', 'pulse', 'lab', 'hardware', 'outlook', 'techmap'
      ];
      // 1. Check URL query param (?tab=...)
      const queryTab = new URLSearchParams(window.location.search).get('tab') as ActiveTab | null;
      if (queryTab && validTabs.includes(queryTab)) return queryTab;

      // 2. Check URL hash (#tab=... or #lab, etc.)
      const hash = window.location.hash.replace(/^#/, '');
      const tabMatch = hash.match(/^tab=([a-z0-9_-]+)/i);
      const hashTab = (tabMatch ? tabMatch[1] : hash).toLowerCase() as ActiveTab;
      if (hashTab && validTabs.includes(hashTab)) return hashTab;

      // 3. Check sessionStorage
      const saved = sessionStorage.getItem('qs_active_tab') as ActiveTab | null;
      if (saved && validTabs.includes(saved)) return saved;
    } catch {
      // Safe fallback
    }
    return 'dashboard';
  });
  const [numQubits, setNumQubits] = useState<number>(4);
  const [selectedGate, setSelectedGate] = useState<GateType>('H');
  const [rotAngle, setRotAngle] = useState<number>(Math.PI / 4);
  const [noise, setNoise] = useState<number>(0);
  const [noiseModel, setNoiseModel] = useState<NoiseChannel>('dephasing');
  const [shots, setShots] = useState<number>(10);
  const [speed, setSpeed] = useState<number>(5);

  const [simStep, setSimStep] = useState<number>(0);
  const [simRunning, setSimRunning] = useState<boolean>(false);
  const [simStatus, setSimStatus] = useState<SimLifecycleStatus>('IDLE');
  const [measurements, setMeasurements] = useState<Record<number, number>>({});
  const [qasmOpen, setQasmOpen] = useState<boolean>(false);
  const [pythonOpen, setPythonOpen] = useState<boolean>(false);
  const [questModalOpen, setQuestModalOpen] = useState<boolean>(false);
  const [activeQuest, setActiveQuest] = useState<QuantumQuest | null>(null);
  const [completedQuests, setCompletedQuests] = useState<Record<string, { stars: number; bestGates: number }>>(() => {
    try {
      const data = localStorage.getItem('quantum_quests_progress_v1');
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  });

  const [activeAlgoId, setActiveAlgoId] = useState<string>('bell');
  const [inspectorExpanded, setInspectorExpanded] = useState<boolean>(false);

  const { showToast } = useToast();

  // Initialize with Bell State
  const initialGates: GateOp[] = [
    { type: 'H', qubit: 0, step: 0 },
    { type: 'CNOT', control: 0, target: 1, step: 1 }
  ];
  const [circuit, setCircuit] = useState<GateOp[]>(initialGates);

  // Timeline commit history graph state
  const [commits, setCommits] = useState<CircuitCommit[]>([
    {
      id: 'c_0',
      timestamp: Date.now() - 60000,
      label: 'Initial Bell State',
      gates: initialGates,
      numQubits: 4,
      rotAngle: Math.PI / 4,
      actionType: 'preset'
    }
  ]);
  const [currentCommitId, setCurrentCommitId] = useState<string>('c_0');

  const [qstate, setQstate] = useState<QuantumState | null>(null);
  const [logLines, setLogLines] = useState<Array<{ msg: string; type: string; ts: number }>>([
    { msg: 'Quantum Studio simulation environment initialized', type: 'accent', ts: Date.now() },
    { msg: 'Loaded 4-qubit Hilbert register in ground state |0000⟩', type: 'dim', ts: Date.now() }
  ]);

  const addLog = useCallback((msg: string, type: 'accent' | 'warn' | 'err' | 'dim' = 'dim') => {
    setLogLines(prev => [...prev.slice(-80), { msg, type, ts: Date.now() }]);
  }, []);

  // Compute state synchronously when circuit or qubits change
  const computeStateSync = useCallback((customCircuit?: GateOp[], customQubits?: number) => {
    const n = customQubits !== undefined ? customQubits : numQubits;
    const circ = customCircuit !== undefined ? customCircuit : circuit;
    const qs = new QuantumState(n);

    const sortedSteps = [...new Set(circ.map(g => g.step))].sort((a, b) => a - b);
    sortedSteps.forEach(s => {
      const gates = circ.filter(g => g.step === s);
      gates.forEach(g => {
        applyGate(qs, g, rotAngle);
      });
    });

    setQstate(qs);
    return qs;
  }, [numQubits, circuit, rotAngle]);

  useEffect(() => {
    if (!simRunning) {
      computeStateSync();
    }
  }, [numQubits, circuit, rotAngle, computeStateSync, simRunning]);

  // Load circuit from URL hash if present
  useEffect(() => {
    try {
      const hash = window.location.hash;
      if (hash.startsWith('#circuit=')) {
        const encoded = hash.slice('#circuit='.length);
        const json = decodeURIComponent(atob(encoded));
        const data = JSON.parse(json);
        if (data && Array.isArray(data.gates)) {
          if (typeof data.numQubits === 'number') {
            setNumQubits(Math.max(1, Math.min(8, data.numQubits)));
          }
          if (typeof data.rotAngle === 'number') {
            setRotAngle(data.rotAngle);
          }
          setCircuit(data.gates);
          addLog(`Loaded shared circuit from URL permalink (${data.gates.length} gates)`, 'accent');
          showToast('Shared Circuit Loaded', 'success', `Loaded ${data.gates.length} gates from URL permalink.`);
        }
      }
    } catch (e) {
      console.warn('Could not parse circuit from URL hash', e);
    }
  }, [addLog, showToast]);

  // Synchronize activeTab to sessionStorage & URL hash across refreshes and multiple tabs
  useEffect(() => {
    try {
      sessionStorage.setItem('qs_active_tab', activeTab);
      const hash = window.location.hash;
      if (!hash.startsWith('#circuit=')) {
        window.history.replaceState(null, '', `#tab=${activeTab}`);
      }
    } catch {
      // Safe fallback
    }
  }, [activeTab]);

  // Handle browser back/forward or manual hash change
  useEffect(() => {
    const handleHashChange = () => {
      try {
        const validTabs: ActiveTab[] = [
          'dashboard', 'composer', 'algorithms', 'transpiler',
          'chemistry', 'entanglement', 'cryptography', 'qml',
          'qec', 'pulse', 'lab', 'hardware', 'outlook', 'techmap'
        ];
        const hash = window.location.hash.replace(/^#/, '');
        const tabMatch = hash.match(/^tab=([a-z0-9_-]+)/i);
        const hashTab = (tabMatch ? tabMatch[1] : hash).toLowerCase() as ActiveTab;
        if (hashTab && validTabs.includes(hashTab) && hashTab !== activeTab) {
          setActiveTab(hashTab);
        }
      } catch {}
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeTab]);

  function applyGate(qs: QuantumState, g: GateOp, angle: number) {
    const curAngle = g.angle !== undefined ? g.angle : angle;
    const n = qs.n;

    // Guard all gates against operating on qubits outside the active register
    if (g.qubit !== undefined && (g.qubit < 0 || g.qubit >= n)) return;
    if (g.control !== undefined && (g.control < 0 || g.control >= n)) return;
    if (g.target !== undefined && (g.target < 0 || g.target >= n)) return;
    if (g.q1 !== undefined && (g.q1 < 0 || g.q1 >= n)) return;
    if (g.q2 !== undefined && (g.q2 < 0 || g.q2 >= n)) return;
    if (g.c1 !== undefined && (g.c1 < 0 || g.c1 >= n)) return;
    if (g.c2 !== undefined && (g.c2 < 0 || g.c2 >= n)) return;
    if (g.t1 !== undefined && (g.t1 < 0 || g.t1 >= n)) return;
    if (g.t2 !== undefined && (g.t2 < 0 || g.t2 >= n)) return;

    if (g.type === 'CNOT' && g.control !== undefined && g.target !== undefined) {
      qs.applyCNOT(g.control, g.target);
    } else if (g.type === 'SWAP' && g.q1 !== undefined && g.q2 !== undefined) {
      qs.applySWAP(g.q1, g.q2);
    } else if (g.type === 'CCX' && g.c1 !== undefined && g.c2 !== undefined && g.target !== undefined) {
      qs.applyToffoli(g.c1, g.c2, g.target);
    } else if (g.type === 'CZ' && g.control !== undefined && g.target !== undefined) {
      qs.applyTwoQubitUnitary(g.control, g.target, CZ_MATRIX);
    } else if (g.type === 'CY' && g.control !== undefined && g.target !== undefined) {
      qs.applyTwoQubitUnitary(g.control, g.target, CY_MATRIX);
    } else if (g.type === 'ISWAP' && g.q1 !== undefined && g.q2 !== undefined) {
      qs.applyTwoQubitUnitary(g.q1, g.q2, ISWAP_MATRIX);
    } else if (g.type === 'CP' && g.control !== undefined && g.target !== undefined) {
      qs.applyControlledPhase(g.control, g.target, curAngle);
    } else if (g.type === 'CRX' && g.control !== undefined && g.target !== undefined) {
      const rxM = rotationMatrix('Rx', curAngle);
      const U: Complex[][] = [
        [[1, 0], [0, 0], [0, 0], [0, 0]],
        [[0, 0], [1, 0], [0, 0], [0, 0]],
        [[0, 0], [0, 0], rxM[0][0], rxM[0][1]],
        [[0, 0], [0, 0], rxM[1][0], rxM[1][1]]
      ];
      qs.applyTwoQubitUnitary(g.control, g.target, U);
    } else if (g.type === 'CRY' && g.control !== undefined && g.target !== undefined) {
      const ryM = rotationMatrix('Ry', curAngle);
      const U: Complex[][] = [
        [[1, 0], [0, 0], [0, 0], [0, 0]],
        [[0, 0], [1, 0], [0, 0], [0, 0]],
        [[0, 0], [0, 0], ryM[0][0], ryM[0][1]],
        [[0, 0], [0, 0], ryM[1][0], ryM[1][1]]
      ];
      qs.applyTwoQubitUnitary(g.control, g.target, U);
    } else if (g.type === 'CRZ' && g.control !== undefined && g.target !== undefined) {
      const rzM = rotationMatrix('Rz', curAngle);
      const U: Complex[][] = [
        [[1, 0], [0, 0], [0, 0], [0, 0]],
        [[0, 0], [1, 0], [0, 0], [0, 0]],
        [[0, 0], [0, 0], rzM[0][0], rzM[0][1]],
        [[0, 0], [0, 0], rzM[1][0], rzM[1][1]]
      ];
      qs.applyTwoQubitUnitary(g.control, g.target, U);
    } else if (g.type === 'SQRT_SWAP' && g.q1 !== undefined && g.q2 !== undefined) {
      const s2 = 0.5;
      const U: Complex[][] = [
        [[1, 0], [0, 0], [0, 0], [0, 0]],
        [[0, 0], [s2, s2], [s2, -s2], [0, 0]],
        [[0, 0], [s2, -s2], [s2, s2], [0, 0]],
        [[0, 0], [0, 0], [0, 0], [1, 0]]
      ];
      qs.applyTwoQubitUnitary(g.q1, g.q2, U);
    } else if (g.type === 'ECR' && g.control !== undefined && g.target !== undefined) {
      const invSqrt2 = 1 / Math.sqrt(2);
      const U: Complex[][] = [
        [[0, 0], [invSqrt2, 0], [0, 0], [0, invSqrt2]],
        [[invSqrt2, 0], [0, 0], [0, -invSqrt2], [0, 0]],
        [[0, 0], [0, invSqrt2], [0, 0], [invSqrt2, 0]],
        [[0, -invSqrt2], [0, 0], [invSqrt2, 0], [0, 0]]
      ];
      qs.applyTwoQubitUnitary(g.control, g.target, U);
    } else if (g.type === 'CSWAP' && g.control !== undefined && g.t1 !== undefined && g.t2 !== undefined) {
      qs.applyFredkin(g.control, g.t1, g.t2);
    } else if (g.qubit !== undefined) {
      if (g.type === 'Rx' || g.type === 'Ry' || g.type === 'Rz') {
        qs.applyGate(g.qubit, rotationMatrix(g.type, curAngle));
      } else if (g.type === 'U3') {
        const th = g.theta !== undefined ? g.theta : curAngle;
        const ph = g.phi !== undefined ? g.phi : 0;
        const lm = g.lam !== undefined ? g.lam : 0;
        qs.applyGate(g.qubit, u3Matrix(th, ph, lm));
      } else if (g.type === 'U1') {
        const u1M: [Complex[], Complex[]] = [[[1, 0], [0, 0]], [[0, 0], [Math.cos(curAngle), Math.sin(curAngle)]]];
        qs.applyGate(g.qubit, u1M);
      } else if (g.type === 'RESET') {
        qs.applyGate(g.qubit, [[[1, 0], [0, 0]], [[0, 0], [0, 0]]]);
      } else {
        const def = GATES_REGISTRY[g.type];
        if (def?.matrix) qs.applyGate(g.qubit, def.matrix);
      }
    }
  }

  // Create manual checkpoint commit
  const handleCheckpoint = useCallback((customLabel?: string) => {
    const newId = `c_${Date.now()}`;
    const label = customLabel || `Snapshot #${commits.length + 1} (${circuit.length}G)`;
    const newCommit: CircuitCommit = {
      id: newId,
      timestamp: Date.now(),
      label,
      gates: [...circuit],
      numQubits,
      rotAngle,
      actionType: 'add'
    };
    setCommits(prev => [...prev.slice(-24), newCommit]);
    setCurrentCommitId(newId);
    addLog(`Created timeline checkpoint: ${label}`, 'accent');
  }, [circuit, numQubits, rotAngle, commits.length, addLog]);

  // Restore state from timeline commit
  const handleSelectCommit = useCallback((commit: CircuitCommit) => {
    setCurrentCommitId(commit.id);
    setNumQubits(commit.numQubits);
    setRotAngle(commit.rotAngle);
    setCircuit([...commit.gates]);
    computeStateSync(commit.gates, commit.numQubits);
    addLog(`Rewound circuit state to timeline commit: ${commit.label}`, 'warn');
  }, [computeStateSync, addLog]);

  // Quantum Quest Handlers
  const handleSelectQuest = (quest: QuantumQuest) => {
    setActiveQuest(quest);
    setActiveTab('composer');
    setNumQubits(quest.qubits);
    const preloaded = quest.preloadedGates ? [...quest.preloadedGates] : [];
    setCircuit(preloaded);
    computeStateSync(preloaded, quest.qubits);
    showToast('Quest Armed', 'info', `Objective: ${quest.objective}`);
  };

  const handleSaveQuestProgress = (questId: string, stars: number, gates: number) => {
    setCompletedQuests(prev => {
      const existing = prev[questId];
      const bestStars = existing ? Math.max(existing.stars, stars) : stars;
      const bestGates = existing ? Math.min(existing.bestGates, gates) : gates;
      const next = { ...prev, [questId]: { stars: bestStars, bestGates } };
      try {
        localStorage.setItem('quantum_quests_progress_v1', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleResetQuestProgress = () => {
    setCompletedQuests({});
    try {
      localStorage.removeItem('quantum_quests_progress_v1');
    } catch {}
    showToast('Progress Cleared', 'info', 'All quest stars have been reset.');
  };

  // Animated execution runner with professional scientific lifecycle states
  const handleRunSimulation = async () => {
    if (simRunning) return;
    if (circuit.length === 0) {
      addLog('No gates placed in circuit to simulate', 'warn');
      return;
    }

    setSimRunning(true);
    setSimStep(0);

    // Phase 1: Validating unitary bounds & register topology
    setSimStatus('VALIDATING');
    addLog(`Phase 1/5 [VALIDATING]: Verifying Hilbert dimension (${1 << numQubits}) and gate operator bounds...`, 'dim');
    await new Promise(r => setTimeout(r, 60));

    // Phase 2: Compiling DAG & pulse schedule
    setSimStatus('COMPILING');
    addLog(`Phase 2/5 [COMPILING]: Synthesizing ${circuit.length} gates across ${numQubits} qubits into execution pipeline...`, 'dim');
    await new Promise(r => setTimeout(r, 80));

    // Phase 3: Executing unitary transformations
    setSimStatus('EXECUTING');
    addLog(`Phase 3/5 [EXECUTING]: Streaming coherent unitary gate operations to quantum register...`, 'accent');

    const qs = new QuantumState(numQubits);
    const sortedSteps = [...new Set(circuit.map(g => g.step))].sort((a, b) => a - b);
    const delayMs = Math.max(30, 450 / speed);

    for (let i = 0; i < sortedSteps.length; i++) {
      const step = sortedSteps[i];
      setSimStep(step);
      const gates = circuit.filter(g => g.step === step);
      gates.forEach(g => {
        applyGate(qs, g, rotAngle);
        // Apply stochastic channel noise if enabled
        if (noise > 0) {
          const eps = noise / 100;
          if (Math.random() < eps) {
            const touched = g.qubit ?? g.target ?? 0;
            if (noiseModel === 'bitflip') qs.applyGate(touched, GATES_REGISTRY.X.matrix!);
            else if (noiseModel === 'phaseflip') qs.applyGate(touched, GATES_REGISTRY.Z.matrix!);
            else if (noiseModel === 'depolarizing') qs.applyGate(touched, GATES_REGISTRY.Y.matrix!);
            else qs.applyGate(touched, rotationMatrix('Ry', -eps * 0.3));
          }
        }
      });
      setQstate(qs.clone());
      await new Promise(r => setTimeout(r, delayMs));
    }

    // Phase 4: Measuring Born projection probabilities
    setSimStatus('MEASURING');
    const totalShots = shots * 1000;
    addLog(`Phase 4/5 [MEASURING]: Sampling ${totalShots.toLocaleString()} projective Born measurements...`, 'dim');
    await new Promise(r => setTimeout(r, 40));

    const counts: Record<number, number> = {};
    for (let s = 0; s < totalShots; s++) {
      const m = qs.measure();
      counts[m] = (counts[m] || 0) + 1;
    }
    setMeasurements(counts);

    // Phase 5: Analyzing observable distributions & density matrices
    setSimStatus('ANALYZING');
    addLog(`Phase 5/5 [ANALYZING]: Calculating density matrix partial traces, entropy, and Bloch vectors...`, 'dim');
    await new Promise(r => setTimeout(r, 60));

    setSimStep(sortedSteps[sortedSteps.length - 1] + 1);
    setSimRunning(false);
    setSimStatus('COMPLETE');
    addLog(`Simulation complete: ${totalShots.toLocaleString()} Born measurement shots collected and telemetry synchronized`, 'accent');
  };

  // Import OpenQASM 3.0 code into live circuit
  const handleImportQasm = useCallback((importedQubits: number, importedGates: GateOp[]) => {
    setNumQubits(importedQubits);
    setCircuit(importedGates);
    computeStateSync(importedGates, importedQubits);

    const newId = `c_qasm_${Date.now()}`;
    const newCommit: CircuitCommit = {
      id: newId,
      timestamp: Date.now(),
      label: `QASM Import (${importedGates.length}G)`,
      gates: [...importedGates],
      numQubits: importedQubits,
      rotAngle,
      actionType: 'load'
    };
    setCommits(prev => [...prev.slice(-24), newCommit]);
    setCurrentCommitId(newId);
    addLog(`Imported OpenQASM 3.0: compiled ${importedGates.length} gates onto ${importedQubits} qubits`, 'accent');
  }, [computeStateSync, rotAngle, addLog]);

  const handleStepSimulation = () => {
    if (simRunning) return;
    const sortedSteps = [...new Set(circuit.map(g => g.step))].sort((a, b) => a - b);
    const nextStep = sortedSteps.find(s => s >= simStep);
    if (nextStep === undefined) {
      setSimStep(0);
      computeStateSync();
      addLog('Reset step pointer to beginning of circuit', 'dim');
      return;
    }
    setSimStep(nextStep + 1);
    addLog(`Stepped through time slot ${nextStep}`, 'dim');
  };

  const handleReset = () => {
    setSimStep(0);
    setSimStatus('IDLE');
    setMeasurements({});
    const qs = new QuantumState(numQubits);
    setQstate(qs);
    addLog('System statevector reset to computational ground state |0⟩', 'warn');
  };

  const handleLoadAlgorithm = (algo: AlgorithmItem, customGates?: GateOp[], switchTab = true, overrideQubits?: number) => {
    const gates = customGates || algo.gates;
    const maxQ = gates.reduce((m, g) => Math.max(
      m, g.qubit ?? -1, g.control ?? -1, g.target ?? -1, g.q1 ?? -1, g.q2 ?? -1, g.c1 ?? -1, g.c2 ?? -1
    ), 0);
    const targetQubits = overrideQubits !== undefined ? overrideQubits : Math.max(2, maxQ + 1);
    setNumQubits(targetQubits);
    setCircuit(gates);
    setActiveAlgoId(algo.id);
    if (switchTab) {
      setActiveTab('composer');
    }
    computeStateSync(gates, targetQubits);
    
    // Record commit
    const newId = `c_algo_${Date.now()}`;
    const newCommit: CircuitCommit = {
      id: newId,
      timestamp: Date.now(),
      label: algo.name,
      gates: [...gates],
      numQubits: targetQubits,
      rotAngle,
      actionType: 'preset'
    };
    setCommits(prev => [...prev.slice(-24), newCommit]);
    setCurrentCommitId(newId);
    addLog(`Loaded algorithm preset: ${algo.name}`, 'accent');
  };

  const handleShareCircuit = useCallback(() => {
    try {
      const payload = {
        numQubits,
        rotAngle,
        gates: circuit
      };
      const b64 = btoa(encodeURIComponent(JSON.stringify(payload)));
      const url = `${window.location.origin}${window.location.pathname}#circuit=${b64}`;
      navigator.clipboard.writeText(url);
      window.location.hash = `circuit=${b64}`;
      showToast('Circuit Permalink Copied', 'success', 'Shareable URL copied to clipboard!');
      addLog('Generated and copied shareable permalink to clipboard', 'accent');
    } catch {
      showToast('Sharing Failed', 'error', 'Could not generate shareable link.');
    }
  }, [numQubits, rotAngle, circuit, showToast, addLog]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#02060a] text-[#eaf8ff] quantum-grid-bg overflow-hidden font-sans">
      {/* Top Navbar - rendered in quantum workspace & engineering tabs, hidden on Dashboard */}
      {activeTab !== 'dashboard' && (
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          numQubits={numQubits}
          gateCount={circuit.length}
          simStatus={simStatus}
          onRun={handleRunSimulation}
          onReset={handleReset}
          onOpenQasm={() => setQasmOpen(true)}
          onOpenPython={() => setPythonOpen(true)}
          onOpenSplash={() => setSplashOpen(true)}
          onOpenQuests={() => setQuestModalOpen(true)}
          onShareCircuit={handleShareCircuit}
        />
      )}

      {/* Interactive Timeline Commit History Graph - rendered in workspace */}
      {activeTab !== 'dashboard' && (
        <TimelineCommitGraph
          commits={commits}
          currentCommitId={currentCommitId}
          onSelectCommit={handleSelectCommit}
          onCheckpoint={() => handleCheckpoint()}
          currentGatesCount={circuit.length}
        />
      )}

      {/* Main View Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {activeTab === 'dashboard' && (
          <QuantumComputingDashboard
            onNavigateTab={(tab) => setActiveTab(tab)}
            activeQubitsCount={numQubits}
            circuitGateCount={circuit.length}
            onLoadPresetToComposer={(gates, q) => {
              setNumQubits(q);
              setCircuit(gates);
              setActiveTab('composer');
              computeStateSync(gates, q);
            }}
          />
        )}

        {activeTab === 'composer' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Half: Circuit Canvas & Gate Palette */}
            <div className="flex-1 flex flex-col min-h-0">
              <CircuitComposer
                numQubits={numQubits}
                setNumQubits={setNumQubits}
                circuit={circuit}
                setCircuit={setCircuit}
                selectedGate={selectedGate}
                setSelectedGate={setSelectedGate}
                rotAngle={rotAngle}
                setRotAngle={setRotAngle}
                noise={noise}
                setNoise={setNoise}
                noiseModel={noiseModel}
                setNoiseModel={setNoiseModel}
                shots={shots}
                setShots={setShots}
                speed={speed}
                setSpeed={setSpeed}
                simStep={simStep}
                simRunning={simRunning}
                onRun={handleRunSimulation}
                onStep={handleStepSimulation}
                onReset={handleReset}
                qstate={qstate}
                activeQuest={activeQuest}
                onClearQuest={() => setActiveQuest(null)}
                onOpenQuestModal={() => setQuestModalOpen(true)}
                onSaveQuestProgress={handleSaveQuestProgress}
              />
            </div>

            {/* Middle: Bloch Sphere Projections */}
            <BlochSpheres numQubits={numQubits} qstate={qstate} />

            {/* Bottom Half: Statevector & Measurement Inspector */}
            <div className={`${inspectorExpanded ? 'h-96' : 'h-72'} shrink-0 transition-all duration-300`}>
              <StatevectorInspector
                numQubits={numQubits}
                qstate={qstate}
                measurements={measurements}
                shots={shots}
                logLines={logLines}
                circuit={circuit}
                noiseRate={noise}
                noiseModel={noiseModel}
                simStep={simStep}
                isExpanded={inspectorExpanded}
                onToggleExpand={() => setInspectorExpanded(!inspectorExpanded)}
              />
            </div>
          </div>
        )}

        {activeTab === 'algorithms' && (
          <AlgorithmsExplorer
            onLoadAlgorithm={(algo, custom, overrideQ) => handleLoadAlgorithm(algo, custom, true, overrideQ)}
            noiseModel={noiseModel}
            currentQubits={numQubits}
          />
        )}

        {activeTab === 'transpiler' && (
          <QpuHardwareTranspiler
            circuit={circuit}
            numQubits={numQubits}
            setCircuit={setCircuit}
            setNumQubits={setNumQubits}
          />
        )}

        {activeTab === 'chemistry' && (
          <QuantumChemistryLab />
        )}

        {activeTab === 'entanglement' && (
          <EntanglementVisualizer
            numQubits={numQubits}
            qstate={qstate}
            onSelectAlgorithm={(algo) => handleLoadAlgorithm(algo, undefined, false)}
            selectedAlgoId={activeAlgoId}
          />
        )}

        {activeTab === 'cryptography' && (
          <QuantumCryptographyLab
            onLoadToComposer={(gates, q) => {
              setNumQubits(q);
              setCircuit(gates);
              setActiveTab('composer');
              computeStateSync(gates, q);
            }}
          />
        )}

        {activeTab === 'qml' && (
          <QuantumMachineLearningLab
            onLoadToComposer={(gates, q) => {
              setNumQubits(q);
              setCircuit(gates);
              setActiveTab('composer');
              computeStateSync(gates, q);
            }}
          />
        )}

        {activeTab === 'qec' && (
          <QuantumErrorCorrectionStudio
            onLoadToComposer={(gates, q) => {
              setNumQubits(q);
              setCircuit(gates);
              setActiveTab('composer');
              computeStateSync(gates, q);
            }}
          />
        )}

        {activeTab === 'pulse' && (
          <QuantumPulseStudio
            onLoadToComposer={(gates, q) => {
              setNumQubits(q);
              setCircuit(gates);
              setActiveTab('composer');
              computeStateSync(gates, q);
            }}
          />
        )}

        {activeTab === 'lab' && (
          <QuantumLab />
        )}

        {activeTab === 'hardware' && (
          <HardwareMarketplace
            currentQubits={numQubits}
            circuitGateCount={circuit.length}
          />
        )}

        {activeTab === 'outlook' && (
          <GlobalQuantumOutlook />
        )}

        {activeTab === 'techmap' && (
          <QuantumTechnologyMap3D />
        )}
      </main>

      {/* OpenQASM 3.0 Drawer Modal */}
      <QasmDrawer
        isOpen={qasmOpen}
        onClose={() => setQasmOpen(false)}
        numQubits={numQubits}
        circuit={circuit}
        rotAngle={rotAngle}
        onImportCircuit={handleImportQasm}
      />

      {/* Python SDK & Code Exporter Drawer Modal */}
      <PythonDrawer
        isOpen={pythonOpen}
        onClose={() => setPythonOpen(false)}
        numQubits={numQubits}
        circuit={circuit}
        rotAngle={rotAngle}
      />

      {/* 3D Quantum Holographic Splash / Hero Landing Screen */}
      <QuantumSplashIntro
        isOpen={splashOpen}
        onEnter={() => setSplashOpen(false)}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSplashOpen(false);
        }}
      />

      {/* Quantum Quests & Circuit Puzzle Lab Modal */}
      <QuantumQuestModal
        isOpen={questModalOpen}
        onClose={() => setQuestModalOpen(false)}
        activeQuestId={activeQuest?.id || null}
        onSelectQuest={handleSelectQuest}
        completedQuests={completedQuests}
        onResetProgress={handleResetQuestProgress}
      />
    </div>
  );
}

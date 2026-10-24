import React, { useState } from 'react';
import { 
  ALGORITHMS, 
  SPEED_QUIZ, 
  AlgorithmItem 
} from '../data/algorithms';
import { 
  GateOp, 
  NoiseChannel, 
  QuantumState, 
  GATES_REGISTRY, 
  rotationMatrix,
  CZ_MATRIX,
  CY_MATRIX,
  ISWAP_MATRIX
} from '../types/quantum';
import { GroverVisualizer4Q } from './GroverVisualizer4Q';
import { ClassicalVsQuantumSpeedQuiz } from './ClassicalVsQuantumSpeedQuiz';
import { AlgorithmUnitaryStepper } from './AlgorithmUnitaryStepper';
import { 
  BookOpen, 
  Cpu, 
  Play, 
  ArrowRight, 
  Sparkles, 
  Activity, 
  Check, 
  HelpCircle,
  BarChart2,
  Code,
  Layers,
  Trophy,
  Compass
} from 'lucide-react';

interface AlgorithmsExplorerProps {
  onLoadAlgorithm: (algo: AlgorithmItem, customGates?: GateOp[], overrideQubits?: number) => void;
  noiseModel: NoiseChannel;
  currentQubits: number;
}

export const AlgorithmsExplorer: React.FC<AlgorithmsExplorerProps> = ({
  onLoadAlgorithm,
  noiseModel,
  currentQubits
}) => {
  const [selectedId, setSelectedId] = useState<string>('grover');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [subTab, setSubTab] = useState<'overview' | 'stepper' | 'grover4q' | 'quiz'>('overview');
  const [customGroverTarget, setCustomGroverTarget] = useState<string>('11');
  const [customDjMode, setCustomDjMode] = useState<'balanced' | 'constant0' | 'constant1'>('balanced');
  const [revealedQuiz, setRevealedQuiz] = useState<Record<string, boolean>>({});
  const [robustnessResults, setRobustnessResults] = useState<{
    algoId: string;
    levels: Array<{ pct: number; rate: number }>;
  } | null>(null);

  const selectedAlgo = ALGORITHMS.find(a => a.id === selectedId) || ALGORITHMS[0];
  const d = selectedAlgo.detail;
  const questions = SPEED_QUIZ[selectedAlgo.id] || [];

  const filteredAlgos = ALGORITHMS.filter(a => {
    if (filterTag === 'all') return true;
    if (filterTag === 'hardware') return a.tag === 'SUPERCONDUCTING' || a.tag === 'PHOTONIC' || a.tag === 'OPTIMIZATION';
    if (filterTag === 'oracles') return a.tag === 'SEARCH' || a.tag === 'ORACLE' || a.tag === 'HIDDEN PERIOD';
    return a.tag === 'ENTANGLEMENT' || a.tag === 'MULTI-ENTANGLE' || a.tag === 'TRANSFORM' || a.tag === 'FUNDAMENTAL';
  });

  // Custom oracle builders
  const getCustomGates = () => {
    if (selectedAlgo.id === 'grover') {
      const t = [+customGroverTarget[0], +customGroverTarget[1]];
      const gates: GateOp[] = [
        { type: 'H', qubit: 0, step: 0 },
        { type: 'H', qubit: 1, step: 0 }
      ];
      let step = 1;
      t.forEach((b, i) => { if (b === 0) gates.push({ type: 'X', qubit: i, step }); });
      step++;
      gates.push(
        { type: 'H', qubit: 1, step },
        { type: 'CNOT', control: 0, target: 1, step: step + 1 },
        { type: 'H', qubit: 1, step: step + 2 }
      );
      step += 3;
      t.forEach((b, i) => { if (b === 0) gates.push({ type: 'X', qubit: i, step }); });
      step++;
      // Diffuser
      gates.push(
        { type: 'H', qubit: 0, step },
        { type: 'H', qubit: 1, step },
        { type: 'X', qubit: 0, step: step + 1 },
        { type: 'X', qubit: 1, step: step + 1 },
        { type: 'H', qubit: 1, step: step + 2 },
        { type: 'CNOT', control: 0, target: 1, step: step + 3 },
        { type: 'H', qubit: 1, step: step + 4 },
        { type: 'X', qubit: 0, step: step + 5 },
        { type: 'X', qubit: 1, step: step + 5 },
        { type: 'H', qubit: 0, step: step + 6 },
        { type: 'H', qubit: 1, step: step + 6 }
      );
      return gates;
    }
    if (selectedAlgo.id === 'deutsch_jozsa') {
      const gates: GateOp[] = [
        { type: 'X', qubit: 2, step: 0 },
        { type: 'H', qubit: 0, step: 1 },
        { type: 'H', qubit: 1, step: 1 },
        { type: 'H', qubit: 2, step: 1 }
      ];
      let step = 2;
      if (customDjMode === 'balanced') {
        gates.push(
          { type: 'CNOT', control: 0, target: 2, step },
          { type: 'CNOT', control: 1, target: 2, step: step + 1 }
        );
        step += 2;
      } else if (customDjMode === 'constant1') {
        gates.push({ type: 'X', qubit: 2, step });
        step++;
      }
      gates.push(
        { type: 'H', qubit: 0, step },
        { type: 'H', qubit: 1, step }
      );
      return gates;
    }
    return undefined;
  };

  // Run fast Monte Carlo noise robustness
  const runRobustnessSweep = () => {
    const maxQ = Math.max(4, currentQubits);
    const gates = getCustomGates() || selectedAlgo.gates;
    const testLevels = [0, 5, 10, 20, 35, 50];

    const results = testLevels.map(pct => {
      const eps = pct / 100;
      let hits = 0;
      const trials = 40;
      for (let t = 0; t < trials; t++) {
        const qs = new QuantumState(maxQ);
        gates.forEach(g => {
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
            qs.applyControlledPhase(g.control, g.target, g.angle || Math.PI / 4);
          } else if (g.qubit !== undefined) {
            const def = GATES_REGISTRY[g.type];
            if (def?.matrix) qs.applyGate(g.qubit, def.matrix);
          }
          // Noise injection
          if (eps > 0 && Math.random() < eps) {
            const q = g.qubit ?? g.target ?? 0;
            qs.applyGate(q, GATES_REGISTRY.X.matrix!);
          }
        });
        const p = qs.probabilities();
        const topState = p.indexOf(Math.max(...p));
        // If ideal was concentrated on topState
        if (topState >= 0 && p[topState] > 0.25) hits++;
      }
      return { pct, rate: hits / trials };
    });

    setRobustnessResults({ algoId: selectedAlgo.id, levels: results });
  };

  const cVal = d.cFn(currentQubits);
  const qVal = d.qFn(currentQubits);
  const maxV = cVal === null ? qVal : Math.max(cVal, qVal, 1);
  const cPct = cVal === null ? 100 : Math.min(100, (cVal / maxV) * 100);
  const qPct = Math.min(100, (qVal / maxV) * 100);

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-[#07090e]">
      {/* Left Algorithm List */}
      <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col overflow-hidden">
        {/* Filter bar */}
        <div className="p-3 border-b border-slate-800 bg-slate-900/60 flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'all', label: 'All (14)' },
            { id: 'oracles', label: 'Oracles & Search' },
            { id: 'hardware', label: 'Hardware Benchmarks' },
            { id: 'foundational', label: 'Foundational' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterTag(f.id)}
              className={`px-2.5 py-1 rounded text-xs whitespace-nowrap transition-colors cursor-pointer ${
                filterTag === f.id
                  ? 'bg-slate-800 text-cyan-300 font-semibold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Algo list items */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredAlgos.map(a => (
            <button
              key={a.id}
              onClick={() => {
                setSelectedId(a.id);
                setRobustnessResults(null);
              }}
              className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                selectedId === a.id
                  ? 'bg-slate-900/90 border-cyan-500/50 shadow-xs'
                  : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-900/50 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-200">{a.name}</span>
                <span className="text-[10px] font-mono text-cyan-400 font-medium">{a.queries.speedup}</span>
              </div>
              <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{a.desc}</div>
              <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-slate-500">
                <span>{a.tag}</span>
                <span>·</span>
                <span>{a.gates.length} Gates</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Algorithm Detail Stage */}
      <div className="lg:col-span-8 p-6 overflow-y-auto space-y-6">
        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-1 pb-3 border-b border-slate-800 text-xs font-mono overflow-x-auto">
          <button
            onClick={() => setSubTab('overview')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              subTab === 'overview'
                ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Overview &amp; Scaling</span>
          </button>

          <button
            onClick={() => setSubTab('stepper')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              subTab === 'stepper'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow-xs font-bold'
                : 'text-cyan-400 hover:text-cyan-200 hover:bg-slate-900 border border-cyan-900/40'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Step-by-Step Unitary Evolution</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </button>

          <button
            onClick={() => setSubTab('grover4q')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              subTab === 'grover4q'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow-xs'
                : 'text-cyan-400 hover:text-cyan-200 hover:bg-slate-900 border border-cyan-900/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>4-Qubit Grover Walkthrough</span>
          </button>

          <button
            onClick={() => setSubTab('quiz')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              subTab === 'quiz'
                ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50 shadow-xs font-bold'
                : 'text-amber-400 hover:text-amber-200 hover:bg-slate-900 border border-amber-900/40'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Classical vs Quantum Speed Quiz</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          </button>
        </div>

        {subTab === 'stepper' ? (
          <AlgorithmUnitaryStepper
            algorithm={selectedAlgo}
            onLoadCircuitToComposer={(gates, qCount) => onLoadAlgorithm(selectedAlgo, gates, qCount)}
          />
        ) : subTab === 'grover4q' ? (
          <GroverVisualizer4Q
            onLoadCircuitToComposer={(gates, qCount) => onLoadAlgorithm(ALGORITHMS.find(a => a.id === 'grover')!, gates, qCount)}
          />
        ) : subTab === 'quiz' ? (
          <ClassicalVsQuantumSpeedQuiz />
        ) : (
          <>
            {/* Title & Action Banner */}
            <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight text-white">{selectedAlgo.name}</h2>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
                    {selectedAlgo.tag}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">{selectedAlgo.desc}</p>
              </div>

              <button
                onClick={() => onLoadAlgorithm(selectedAlgo, getCustomGates())}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 shadow-sm shadow-cyan-500/20 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Load into Circuit Composer</span>
              </button>
            </div>

            {/* Quick Link to 4-Qubit Grover Walkthrough if Grover is selected */}
            {selectedAlgo.id === 'grover' && (
              <div className="p-3.5 rounded-lg bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-between text-xs font-mono text-cyan-200">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Interactive 4-Qubit Grover Oracle &amp; Diffusion Visualizer is available!</span>
                </span>
                <button
                  onClick={() => setSubTab('grover4q')}
                  className="px-3 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Launch 4-Qubit Walkthrough</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Query Complexity Comparison Bars */}
            <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono font-semibold text-slate-300">
                <span>Query &amp; Operation Complexity (At n = {currentQubits} Qubits)</span>
                <span className="text-amber-400">{d.sLabel}</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="w-20 text-rose-400 font-semibold">Classical</span>
                  <div className="flex-1 h-5 bg-slate-950 rounded overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-rose-600 to-rose-400 flex items-center px-2 text-[10px] text-white font-bold transition-all duration-500"
                      style={{ width: `${cPct}%` }}
                    >
                      {d.cLbl(currentQubits)}
                    </div>
                  </div>
                  <span className="w-24 text-right text-rose-300">{d.bigO_c}</span>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="w-20 text-cyan-400 font-semibold">Quantum</span>
                  <div className="flex-1 h-5 bg-slate-950 rounded overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 flex items-center px-2 text-[10px] text-slate-950 font-bold transition-all duration-500"
                      style={{ width: `${qPct}%` }}
                    >
                      {d.qLbl(currentQubits)}
                    </div>
                  </div>
                  <span className="w-24 text-right text-cyan-300">{d.bigO_q}</span>
                </div>
              </div>
            </div>

            {/* Custom Oracle Builder when Grover or Deutsch-Jozsa is selected */}
            {selectedAlgo.id === 'grover' && (
              <div className="p-4 rounded-lg bg-slate-900/40 border border-cyan-500/30 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Interactive Custom Oracle Builder — Select Marked Target Bitstring</span>
                </div>
                <p className="text-xs text-slate-400">
                  Pick which 2-qubit basis state the oracle inverts. The Grover diffuser amplifies its probability to near 100%:
                </p>
                <div className="flex items-center gap-2">
                  {['00', '01', '10', '11'].map(target => (
                    <button
                      key={target}
                      onClick={() => setCustomGroverTarget(target)}
                      className={`px-3 py-1.5 rounded font-mono text-xs font-semibold transition-all cursor-pointer ${
                        customGroverTarget === target
                          ? 'bg-cyan-500 text-slate-950 shadow-xs'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Mark |{target}⟩
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedAlgo.id === 'deutsch_jozsa' && (
              <div className="p-4 rounded-lg bg-slate-900/40 border border-cyan-500/30 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Interactive Custom Oracle Builder — Function Type</span>
                </div>
                <p className="text-xs text-slate-400">
                  Configure the hidden oracle function to verify the zero-state measurement theorem:
                </p>
                <div className="flex items-center gap-2">
                  {[
                    { id: 'balanced', label: 'Balanced (f(x) = x₀ ⊕ x₁)' },
                    { id: 'constant0', label: 'Constant Zero (f(x) = 0)' },
                    { id: 'constant1', label: 'Constant One (f(x) = 1)' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setCustomDjMode(opt.id as any)}
                      className={`px-3 py-1.5 rounded font-mono text-xs font-semibold transition-all cursor-pointer ${
                        customDjMode === opt.id
                          ? 'bg-cyan-500 text-slate-950 shadow-xs'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Noise Robustness Monte Carlo Benchmark */}
            <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span>Monte Carlo Noise-Robustness Sweep ({noiseModel})</span>
                </div>
                <button
                  onClick={runRobustnessSweep}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium cursor-pointer"
                >
                  Run Sweep
                </button>
              </div>

              {robustnessResults && robustnessResults.algoId === selectedAlgo.id ? (
                <div className="grid grid-cols-6 gap-2 pt-1">
                  {robustnessResults.levels.map(lvl => (
                    <div key={lvl.pct} className="p-2 rounded bg-slate-950 border border-slate-800 text-center font-mono">
                      <div className="text-[10px] text-slate-500">ε = {lvl.pct}%</div>
                      <div className={`text-sm font-bold mt-1 ${lvl.rate > 0.7 ? 'text-emerald-400' : lvl.rate > 0.4 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {(lvl.rate * 100).toFixed(0)}%
                      </div>
                      <div className="text-[9px] text-slate-600">Success Rate</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 font-mono">
                  Click &quot;Run Sweep&quot; to test algorithm fidelity retention across 0% to 50% simulated channel noise.
                </div>
              )}
            </div>

            {/* Scaling Table if applicable */}
            {d.tableType === 'scaling' && (
              <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800 space-y-3">
                <div className="text-xs font-mono font-semibold text-slate-300">
                  Exact Scaling Across Register Sizes n = 2 … 8
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-left">
                        <th className="py-1.5 px-3">n</th>
                        <th className="py-1.5 px-3 text-rose-400">Classical</th>
                        <th className="py-1.5 px-3 text-cyan-400">Quantum</th>
                        <th className="py-1.5 px-3 text-amber-400">Ratio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {[2, 3, 4, 5, 6, 7, 8].map(nn => {
                        const c = d.cFn(nn);
                        const q = d.qFn(nn);
                        const sp = c === null ? '∞' : (c / Math.max(q, 0.001)).toFixed(1) + '×';
                        const isCurrent = nn === currentQubits;
                        return (
                          <tr key={nn} className={isCurrent ? 'bg-cyan-950/20 text-white font-semibold' : 'text-slate-300'}>
                            <td className="py-1.5 px-3">{nn} Qubits</td>
                            <td className="py-1.5 px-3 text-rose-300">{c !== null ? c.toLocaleString() : '∞'}</td>
                            <td className="py-1.5 px-3 text-cyan-300">{q.toLocaleString()}</td>
                            <td className="py-1.5 px-3 text-amber-300">{sp}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pseudocode Walkthrough */}
            <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800 space-y-2">
              <div className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-cyan-400" />
                <span>Formal Algorithm Pseudocode</span>
              </div>
              <div className="bg-[#05070a] p-3 rounded border border-slate-800/80 font-mono text-xs space-y-1">
                {d.pseudo.map((line, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-slate-700 w-5 select-none text-right">{idx + 1}</span>
                    <span className={line.t === 'kw' ? 'text-amber-300' : line.t === 'fn' ? 'text-cyan-400' : line.t === 'cm' ? 'text-slate-500' : 'text-emerald-400'}>
                      {line.s}
                    </span>
                    {line.r && <span className="text-slate-300">{line.r}</span>}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

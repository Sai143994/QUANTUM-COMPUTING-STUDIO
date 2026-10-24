import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Brain, 
  Play, 
  Pause, 
  RotateCcw, 
  Cpu, 
  Sparkles, 
  Sliders, 
  Activity, 
  CheckCircle2, 
  Layers, 
  Target, 
  TrendingDown, 
  TrendingUp,
  Zap,
  Info
} from 'lucide-react';
import { GateOp, QuantumState, rotationMatrix, GATES_REGISTRY } from '../types/quantum';
import { useToast } from '../context/ToastContext';
import { playGateClickSound, playMeasurementCollapseSound } from '../utils/audio';

interface QuantumMachineLearningLabProps {
  onLoadToComposer?: (gates: GateOp[], qubits: number) => void;
}

export type QmlDatasetType = 'CIRCLES' | 'MOONS' | 'XOR';
export type FeatureMapType = 'ZZ_FEATURE_MAP' | 'ANGLE_EMBEDDING' | 'PAULI_Y';

interface DataPoint {
  x: number;
  y: number;
  label: 0 | 1;
}

export const QuantumMachineLearningLab: React.FC<QuantumMachineLearningLabProps> = ({
  onLoadToComposer
}) => {
  const { showToast } = useToast();

  const [datasetType, setDatasetType] = useState<QmlDatasetType>('CIRCLES');
  const [featureMap, setFeatureMap] = useState<FeatureMapType>('ZZ_FEATURE_MAP');
  const [ansatzLayers, setAnsatzLayers] = useState<number>(2);
  const [learningRate, setLearningRate] = useState<number>(0.2);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [epoch, setEpoch] = useState<number>(0);
  const [lossHistory, setLossHistory] = useState<number[]>([]);
  const [accHistory, setAccHistory] = useState<number[]>([]);

  // Selected test point for live query
  const [testPoint, setTestPoint] = useState<{ x: number; y: number } | null>(null);

  // Trainable variational parameters: for 2 qubits, 2 params (Ry, Rz) per qubit per layer
  // Total params = 4 * ansatzLayers
  const [params, setParams] = useState<number[]>(() => {
    return Array.from({ length: 4 * 2 }, () => (Math.random() - 0.5) * 1.5);
  });

  // Re-initialize parameters when layers change
  useEffect(() => {
    setParams(Array.from({ length: 4 * ansatzLayers }, () => (Math.random() - 0.5) * 1.5));
    setEpoch(0);
    setLossHistory([]);
    setAccHistory([]);
  }, [ansatzLayers]);

  // Synthetic dataset generator
  const dataset: DataPoint[] = useMemo(() => {
    const points: DataPoint[] = [];
    const count = 40;

    if (datasetType === 'CIRCLES') {
      // Inner circle (label 0)
      for (let i = 0; i < count / 2; i++) {
        const r = 0.35 * Math.sqrt(Math.random());
        const theta = Math.random() * 2 * Math.PI;
        points.push({ x: r * Math.cos(theta), y: r * Math.sin(theta), label: 0 });
      }
      // Outer ring (label 1)
      for (let i = 0; i < count / 2; i++) {
        const r = 0.65 + 0.3 * Math.random();
        const theta = Math.random() * 2 * Math.PI;
        points.push({ x: r * Math.cos(theta), y: r * Math.sin(theta), label: 1 });
      }
    } else if (datasetType === 'MOONS') {
      // Top moon
      for (let i = 0; i < count / 2; i++) {
        const theta = Math.PI * Math.random();
        points.push({
          x: Math.cos(theta) * 0.7 - 0.2 + (Math.random() - 0.5) * 0.15,
          y: Math.sin(theta) * 0.7 + (Math.random() - 0.5) * 0.15,
          label: 0
        });
      }
      // Bottom moon
      for (let i = 0; i < count / 2; i++) {
        const theta = Math.PI * Math.random();
        points.push({
          x: 0.2 - Math.cos(theta) * 0.7 + (Math.random() - 0.5) * 0.15,
          y: 0.1 - Math.sin(theta) * 0.7 + (Math.random() - 0.5) * 0.15,
          label: 1
        });
      }
    } else {
      // XOR 4 quadrants
      const quadOffsets = [
        { x: -0.5, y: -0.5, label: 0 as const },
        { x: 0.5, y: 0.5, label: 0 as const },
        { x: -0.5, y: 0.5, label: 1 as const },
        { x: 0.5, y: -0.5, label: 1 as const }
      ];
      quadOffsets.forEach(q => {
        for (let i = 0; i < count / 4; i++) {
          points.push({
            x: q.x + (Math.random() - 0.5) * 0.35,
            y: q.y + (Math.random() - 0.5) * 0.35,
            label: q.label
          });
        }
      });
    }

    return points;
  }, [datasetType]);

  // Forward pass through Quantum State Simulator
  // Encodes (x, y) with Feature Map + applies Ansatz with current theta
  // Measures expectation <Z_0> in [-1, 1], returns predicted probability P(label=1)
  const predictQuantum = useCallback((x: number, y: number, currentParams: number[]): { expZ: number; probClass1: number } => {
    const qs = new QuantumState(2);

    // 1. Data Encoding Feature Map
    if (featureMap === 'ZZ_FEATURE_MAP') {
      // H on both
      const hMat = GATES_REGISTRY['H'].matrix!;
      qs.applyGate(0, hMat);
      qs.applyGate(1, hMat);

      // Rz(2*x) on q0, Rz(2*y) on q1
      qs.applyGate(0, rotationMatrix('Rz', 2 * x));
      qs.applyGate(1, rotationMatrix('Rz', 2 * y));

      // Entangling ZZ: CNOT -> Rz(2*(pi-x)*(pi-y)) -> CNOT
      qs.applyCNOT(0, 1);
      const zzAngle = 2 * (Math.PI - x) * (Math.PI - y);
      qs.applyGate(1, rotationMatrix('Rz', zzAngle));
      qs.applyCNOT(0, 1);
    } else if (featureMap === 'PAULI_Y') {
      // Ry(x * pi) on q0, Ry(y * pi) on q1
      qs.applyGate(0, rotationMatrix('Ry', x * Math.PI));
      qs.applyGate(1, rotationMatrix('Ry', y * Math.PI));
      qs.applyCNOT(0, 1);
    } else {
      // ANGLE_EMBEDDING: Rx(x * pi) on q0, Rx(y * pi) on q1
      qs.applyGate(0, rotationMatrix('Rx', x * Math.PI));
      qs.applyGate(1, rotationMatrix('Rx', y * Math.PI));
    }

    // 2. Variational Quantum Ansatz Layers
    let pIdx = 0;
    for (let l = 0; l < ansatzLayers; l++) {
      const th0 = currentParams[pIdx++] || 0;
      const phi0 = currentParams[pIdx++] || 0;
      const th1 = currentParams[pIdx++] || 0;
      const phi1 = currentParams[pIdx++] || 0;

      // Ry(th0), Rz(phi0) on q0
      qs.applyGate(0, rotationMatrix('Ry', th0));
      qs.applyGate(0, rotationMatrix('Rz', phi0));

      // Ry(th1), Rz(phi1) on q1
      qs.applyGate(1, rotationMatrix('Ry', th1));
      qs.applyGate(1, rotationMatrix('Rz', phi1));

      // Entangling CNOT
      qs.applyCNOT(0, 1);
    }

    // 3. Expectation Value <Z_0>
    // Z on qubit 0: +1 for |00> and |01>, -1 for |10> and |11>
    const probs = qs.probabilities();
    const p0 = (probs[0] || 0) + (probs[1] || 0); // qubit 0 is 0
    const p1 = (probs[2] || 0) + (probs[3] || 0); // qubit 0 is 1
    const expZ = p0 - p1; // in [-1, +1]
    const probClass1 = p1; // probability of class 1

    return { expZ, probClass1 };
  }, [featureMap, ansatzLayers]);

  // Compute overall dataset loss & accuracy
  const evaluateMetrics = useCallback((currentParams: number[]) => {
    let totalLoss = 0;
    let correct = 0;

    for (const pt of dataset) {
      const { probClass1 } = predictQuantum(pt.x, pt.y, currentParams);
      const predLabel = probClass1 >= 0.5 ? 1 : 0;
      if (predLabel === pt.label) correct++;

      // Binary Cross-Entropy Loss with epsilon clipping
      const eps = 1e-5;
      const p = Math.max(eps, Math.min(1 - eps, probClass1));
      const loss = -(pt.label * Math.log(p) + (1 - pt.label) * Math.log(1 - p));
      totalLoss += loss;
    }

    return {
      loss: totalLoss / dataset.length,
      accuracy: (correct / dataset.length) * 100
    };
  }, [dataset, predictQuantum]);

  // Single step gradient descent using Parameter Shift Rule
  const trainStep = useCallback(() => {
    const shift = Math.PI / 2;
    const gradients = new Array(params.length).fill(0);

    // Mini-batch or full dataset gradient accumulation
    for (let j = 0; j < params.length; j++) {
      // Forward shift theta_j + pi/2
      const paramsPlus = [...params];
      paramsPlus[j] += shift;
      const evalPlus = evaluateMetrics(paramsPlus);

      // Backward shift theta_j - pi/2
      const paramsMinus = [...params];
      paramsMinus[j] -= shift;
      const evalMinus = evaluateMetrics(paramsMinus);

      // Parameter Shift Rule derivative: dL/d_theta = (L_+ - L_-) / (2 * sin(shift)) = (L_+ - L_-) / 2
      gradients[j] = (evalPlus.loss - evalMinus.loss) / 2;
    }

    // Gradient update
    const nextParams = params.map((p, idx) => p - learningRate * gradients[idx]);
    const { loss, accuracy } = evaluateMetrics(nextParams);

    setParams(nextParams);
    setEpoch(prev => prev + 1);
    setLossHistory(prev => [...prev.slice(-40), loss]);
    setAccHistory(prev => [...prev.slice(-40), accuracy]);
  }, [params, learningRate, evaluateMetrics]);

  // Training Loop Effect
  useEffect(() => {
    if (!isTraining) return;
    const interval = setInterval(() => {
      trainStep();
    }, 120);

    return () => clearInterval(interval);
  }, [isTraining, trainStep]);

  // Current performance metrics
  const currentMetrics = useMemo(() => {
    return evaluateMetrics(params);
  }, [evaluateMetrics, params]);

  // Render 2D Decision Contour Surface
  // Sample 22x22 grid
  const gridResolution = 22;
  const contourGrid = useMemo(() => {
    const grid: Array<{ x: number; y: number; prob: number }> = [];
    for (let i = 0; i < gridResolution; i++) {
      for (let j = 0; j < gridResolution; j++) {
        const x = -1.0 + (i / (gridResolution - 1)) * 2.0;
        const y = -1.0 + (j / (gridResolution - 1)) * 2.0;
        const { probClass1 } = predictQuantum(x, y, params);
        grid.push({ x, y, prob: probClass1 });
      }
    }
    return grid;
  }, [predictQuantum, params]);

  // Handle canvas click to test arbitrary coordinate
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const normX = ((clickX / rect.width) * 2 - 1);
    const normY = -((clickY / rect.height) * 2 - 1); // invert Y
    setTestPoint({ x: normX, y: normY });
    playGateClickSound(650);
  };

  const testPointResult = useMemo(() => {
    if (!testPoint) return null;
    return predictQuantum(testPoint.x, testPoint.y, params);
  }, [testPoint, predictQuantum, params]);

  // Export Trained QML Circuit to Composer
  const handleExportCircuit = () => {
    if (!onLoadToComposer) return;
    playGateClickSound(850);

    const gates: GateOp[] = [];
    let step = 0;

    // Feature Map
    if (featureMap === 'ZZ_FEATURE_MAP') {
      gates.push({ type: 'H', qubit: 0, step: step });
      gates.push({ type: 'H', qubit: 1, step: step++ });
      gates.push({ type: 'Rz', qubit: 0, step: step });
      gates.push({ type: 'Rz', qubit: 1, step: step++ });
      gates.push({ type: 'CNOT', control: 0, target: 1, step: step++ });
      gates.push({ type: 'Rz', qubit: 1, step: step++ });
      gates.push({ type: 'CNOT', control: 0, target: 1, step: step++ });
    } else {
      gates.push({ type: 'Ry', qubit: 0, step: step });
      gates.push({ type: 'Ry', qubit: 1, step: step++ });
      gates.push({ type: 'CNOT', control: 0, target: 1, step: step++ });
    }

    // Variational Ansatz with trained angles
    let pIdx = 0;
    for (let l = 0; l < ansatzLayers; l++) {
      const th0 = params[pIdx++] || 0;
      const phi0 = params[pIdx++] || 0;
      const th1 = params[pIdx++] || 0;
      const phi1 = params[pIdx++] || 0;

      gates.push({ type: 'Ry', qubit: 0, step: step, theta: th0 });
      gates.push({ type: 'Rz', qubit: 0, step: step + 1, theta: phi0 });
      gates.push({ type: 'Ry', qubit: 1, step: step, theta: th1 });
      gates.push({ type: 'Rz', qubit: 1, step: step + 1, theta: phi1 });
      step += 2;

      gates.push({ type: 'CNOT', control: 0, target: 1, step: step++ });
    }

    // Measurement on readout qubit 0
    gates.push({ type: 'M', qubit: 0, step: step });

    onLoadToComposer(gates, 2);
    showToast('QML Circuit Deployed', 'success', `Loaded ${gates.length} trained VQC gates into Circuit Composer!`);
  };

  const handleResetWeights = () => {
    setParams(Array.from({ length: 4 * ansatzLayers }, () => (Math.random() - 0.5) * 1.5));
    setEpoch(0);
    setLossHistory([]);
    setAccHistory([]);
    setIsTraining(false);
    showToast('Ansatz Reset', 'info', 'Variational parameter weights re-initialized randomly.');
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#03070c] text-slate-200 font-mono p-4 lg:p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#09141d] border border-[rgba(0,229,255,0.25)] shadow-xl shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-md shadow-purple-500/20">
            <Brain className="w-6 h-6 text-purple-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Quantum Machine Learning (QML) &amp; VQC Studio
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-950 text-purple-300 border border-purple-500/30">
                Variational Quantum Classifier
              </span>
            </div>
            <p className="text-xs text-[#78909c]">
              Interactive parameterized quantum circuit (PQC) training with Parameter Shift Rule &amp; live 2D decision contours
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (!isTraining) playMeasurementCollapseSound();
              setIsTraining(!isTraining);
            }}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all ${
              isTraining
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white shadow-purple-500/20'
            }`}
          >
            {isTraining ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isTraining ? 'Pause Training' : 'Train VQC Model'}</span>
          </button>

          <button
            onClick={trainStep}
            disabled={isTraining}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-40"
            title="Perform a single gradient descent epoch"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Step</span>
          </button>

          <button
            onClick={handleResetWeights}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Reset Parameter Weights"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {onLoadToComposer && (
            <button
              onClick={handleExportCircuit}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm shadow-cyan-500/10"
              title="Deploy trained parameterized circuit into Circuit Composer canvas"
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Export to Composer</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace: Visual Decision Boundary (Left) + Architecture & Telemetry (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: 2D Quantum Decision Boundary Contour Canvas (7 Cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-[#09141d] border border-slate-800 flex flex-col space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-white border-b border-slate-800 pb-2">
            <span className="flex items-center gap-1.5">
              <Target className="w-4 h-4 text-purple-400" />
              Quantum Hilbert Space Decision Contour
            </span>
            <span className="text-[11px] text-slate-400">
              Click anywhere on grid to classify coordinate
            </span>
          </div>

          {/* SVG Decision Surface */}
          <div className="relative w-full aspect-square max-h-[440px] bg-[#050b11] rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center">
            <svg
              className="w-full h-full cursor-crosshair"
              viewBox="-1.05 -1.05 2.1 2.1"
              preserveAspectRatio="none"
              onClick={handleSvgClick}
            >
              {/* Decision Contour Cells */}
              {contourGrid.map((c, idx) => {
                // Prob in [0, 1]. Red (class 1) vs Cyan (class 0)
                const isClass1 = c.prob >= 0.5;
                const alpha = Math.abs(c.prob - 0.5) * 1.6;
                const fill = isClass1 
                  ? `rgba(244, 63, 94, ${Math.max(0.08, alpha * 0.4)})` 
                  : `rgba(0, 229, 255, ${Math.max(0.08, alpha * 0.4)})`;

                const cellSize = 2.0 / (gridResolution - 1);
                return (
                  <rect
                    key={idx}
                    x={c.x - cellSize / 2}
                    y={-c.y - cellSize / 2}
                    width={cellSize}
                    height={cellSize}
                    fill={fill}
                  />
                );
              })}

              {/* Grid Axis Guidelines */}
              <line x1="-1" y1="0" x2="1" y2="0" stroke="rgba(255,255,255,0.15)" strokeWidth="0.005" strokeDasharray="0.03" />
              <line x1="0" y1="-1" x2="0" y2="1" stroke="rgba(255,255,255,0.15)" strokeWidth="0.005" strokeDasharray="0.03" />

              {/* Data Points */}
              {dataset.map((pt, idx) => {
                const { probClass1 } = predictQuantum(pt.x, pt.y, params);
                const isCorrect = (probClass1 >= 0.5 ? 1 : 0) === pt.label;
                const ptColor = pt.label === 1 ? '#f43f5e' : '#00e5ff';

                return (
                  <g key={idx}>
                    {/* Ring showing correct vs incorrect */}
                    <circle
                      cx={pt.x}
                      cy={-pt.y}
                      r={0.035}
                      fill={ptColor}
                      stroke={isCorrect ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)'}
                      strokeWidth={0.01}
                      className="transition-all duration-200"
                    />
                  </g>
                );
              })}

              {/* Interactive Clicked Test Point */}
              {testPoint && (
                <g>
                  <circle
                    cx={testPoint.x}
                    cy={-testPoint.y}
                    r={0.06}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="0.015"
                    className="animate-ping"
                  />
                  <circle
                    cx={testPoint.x}
                    cy={-testPoint.y}
                    r={0.04}
                    fill="#fbbf24"
                    stroke="#000"
                    strokeWidth="0.01"
                  />
                </g>
              )}
            </svg>

            {/* Test Point Result Overlay Card */}
            {testPoint && testPointResult && (
              <div className="absolute bottom-3 left-3 bg-[#09141d]/90 border border-amber-500/50 backdrop-blur-md p-2.5 rounded-lg text-[11px] shadow-lg space-y-1">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  <span>Probed Coordinate ({testPoint.x.toFixed(2)}, {testPoint.y.toFixed(2)})</span>
                </div>
                <div className="text-slate-300">
                  Expectation &lang;Z₀&rang;: <span className="text-white font-bold">{testPointResult.expZ.toFixed(3)}</span>
                </div>
                <div>
                  Predicted Class: <span className={`font-bold ${testPointResult.probClass1 >= 0.5 ? 'text-rose-400' : 'text-cyan-400'}`}>
                    Class {testPointResult.probClass1 >= 0.5 ? '1 (Rose)' : '0 (Cyan)'} ({Math.round(testPointResult.probClass1 * 100)}% prob)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Color Legend */}
          <div className="flex items-center justify-between text-[11px] px-2 text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#00e5ff]" />
                <span>Class 0 (&lang;Z&rang; &gt; 0)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#f43f5e]" />
                <span>Class 1 (&lang;Z&rang; &lt; 0)</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full border border-emerald-500 bg-emerald-500/30" />
              <span>Correct</span>
              <span className="inline-block w-2.5 h-2.5 rounded-full border border-rose-500 bg-rose-500/30 ml-2" />
              <span>Misclassified</span>
            </div>
          </div>
        </div>

        {/* Right: Architecture, Training Parameters & Loss Curves (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Real-time Telemetry Metrics */}
          <div className="p-4 rounded-xl bg-[#09141d] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-white border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-400" />
                VQC Training Telemetry
              </span>
              <span className="text-[10px] text-purple-400 font-bold">Epoch {epoch}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-lg bg-[#050b11] border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center justify-center gap-1">
                  <TrendingDown className="w-3 h-3 text-cyan-400" />
                  Cross-Entropy Loss
                </div>
                <div className="text-xl font-bold text-cyan-400 mt-1">
                  {currentMetrics.loss.toFixed(3)}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#050b11] border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center justify-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  Accuracy
                </div>
                <div className="text-xl font-bold text-emerald-400 mt-1">
                  {currentMetrics.accuracy.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Sparkline History */}
            {lossHistory.length > 1 && (
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Loss Convergence:</span>
                  <span>{lossHistory[lossHistory.length - 1]?.toFixed(3)}</span>
                </div>
                <div className="h-10 w-full bg-[#050b11] rounded border border-slate-800 p-1 flex items-end gap-1">
                  {lossHistory.map((val, idx) => {
                    const maxLoss = Math.max(...lossHistory, 1.0);
                    const h = Math.max(10, Math.min(100, (val / maxLoss) * 100));
                    return (
                      <div
                        key={idx}
                        className="flex-1 bg-cyan-400/80 rounded-t-xs hover:bg-cyan-300 transition-all"
                        style={{ height: `${h}%` }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Dataset & Feature Map Configuration */}
          <div className="p-4 rounded-xl bg-[#09141d] border border-slate-800 space-y-4 text-xs">
            <div className="flex items-center justify-between text-xs font-bold text-white border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-purple-400" />
                Hyperparameters &amp; Architecture
              </span>
            </div>

            {/* Dataset Selection */}
            <div className="space-y-1.5">
              <label className="text-slate-400 text-[11px]">Benchmark 2D Dataset:</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'CIRCLES', label: 'Concentric' },
                  { id: 'MOONS', label: 'Moons' },
                  { id: 'XOR', label: 'XOR Gate' }
                ].map(d => (
                  <button
                    key={d.id}
                    onClick={() => {
                      setDatasetType(d.id as QmlDatasetType);
                      handleResetWeights();
                    }}
                    className={`py-1.5 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                      datasetType === d.id
                        ? 'bg-purple-950/80 text-purple-300 border-purple-500/50 shadow-xs'
                        : 'bg-[#050b11] text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Feature Map */}
            <div className="space-y-1.5">
              <label className="text-slate-400 text-[11px]">Quantum Feature Map (Encoding):</label>
              <select
                value={featureMap}
                onChange={e => {
                  setFeatureMap(e.target.value as FeatureMapType);
                  handleResetWeights();
                }}
                className="w-full bg-[#050b11] border border-slate-800 rounded-lg p-2 text-xs text-white outline-none focus:border-purple-500"
              >
                <option value="ZZ_FEATURE_MAP">Hadamard + ZZ Entangling Feature Map (Havlicek 2019)</option>
                <option value="ANGLE_EMBEDDING">Angle Embedding (Rx Rotations)</option>
                <option value="PAULI_Y">Pauli-Y Entangled Feature Map (Ry + CNOT)</option>
              </select>
            </div>

            {/* Ansatz Depth Layers */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Variational Ansatz Layers (L):</span>
                <span className="text-white font-bold">{ansatzLayers} Layers ({params.length} &theta; params)</span>
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="1"
                value={ansatzLayers}
                onChange={e => setAnsatzLayers(+e.target.value)}
                className="w-full h-1 bg-slate-800 accent-purple-400 rounded cursor-pointer"
              />
            </div>

            {/* Learning Rate */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Learning Rate (&eta;):</span>
                <span className="text-amber-300 font-bold">{learningRate}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.5"
                step="0.05"
                value={learningRate}
                onChange={e => setLearningRate(+e.target.value)}
                className="w-full h-1 bg-slate-800 accent-amber-400 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Mathematical Card */}
          <div className="p-3.5 rounded-xl bg-[#09141d] border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
            <div className="font-bold text-slate-200 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>Parameter Shift Rule Gradient Formula</span>
            </div>
            <p className="text-slate-400 leading-relaxed font-mono">
              &part;&lang;O&rang;/&part;&theta;&#x1D62; = [&lang;O&rang;(&theta;&#x1D62; + &pi;/2) - &lang;O&rang;(&theta;&#x1D62; - &pi;/2)] / 2
            </p>
            <p className="text-[10px] text-slate-500">
              Evaluates analytic quantum gradients without finite-difference approximation errors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

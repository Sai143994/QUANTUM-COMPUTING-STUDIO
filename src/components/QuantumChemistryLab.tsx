import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  Play, 
  RotateCcw, 
  Atom, 
  Layers, 
  Activity, 
  TrendingDown, 
  ChevronRight, 
  Info,
  CheckCircle2,
  Sliders,
  Flame,
  Award,
  Sun,
  Shield,
  Zap,
  Globe,
  Battery,
  Leaf,
  Table,
  Cpu,
  Code2,
  Clock,
  Radio,
  GitBranch,
  Network
} from 'lucide-react';
import { playGateClickSound, playMeasurementCollapseSound } from '../utils/audio';
import { 
  IndustrialMolecule, 
  FermionMapping, 
  ChemistryAnsatz, 
  ClassicalOptimizer 
} from './chemistry/ChemistryTypes';
import { 
  INDUSTRIAL_MOLECULES, 
  generatePauliHamiltonian 
} from './chemistry/IndustrialMolecules';
import { FermionMappingStudio } from './chemistry/FermionMappingStudio';
import { ExcitedStateVqd } from './chemistry/ExcitedStateVqd';
import { MoleculeStructure3D } from './chemistry/MoleculeStructure3D';
import { VqeOptimizerLab } from './chemistry/VqeOptimizerLab';
import { ActiveSpaceCasStudio } from './chemistry/ActiveSpaceCasStudio';
import { VariationalLandscape3D } from './chemistry/VariationalLandscape3D';
import { ReactionKineticsPathway } from './chemistry/ReactionKineticsPathway';
import { QpeResourceEstimator } from './chemistry/QpeResourceEstimator';
import { ChemistryCodeExporter } from './chemistry/ChemistryCodeExporter';
import { AnsatzCircuitViewer } from './chemistry/AnsatzCircuitViewer';
import { VibrationalSpectroscopy } from './chemistry/VibrationalSpectroscopy';

// Workspace Hub Types
type WorkspaceCategory = 'electronic' | 'hamiltonian' | 'vqe_solver' | 'kinetics' | 'ftqc_pipeline';

export const QuantumChemistryLab: React.FC = () => {
  const [selectedMolId, setSelectedMolId] = useState<string>('H2');
  const [bondDistance, setBondDistance] = useState<number>(0.741);
  const [ansatzType, setAnsatzType] = useState<ChemistryAnsatz>('uccsd');
  const [optimizerType, setOptimizerType] = useState<ClassicalOptimizer>('cobyla');
  const [mappingType, setMappingType] = useState<FermionMapping>('parity_2q_reduced');
  const [basisSet, setBasisSet] = useState<'sto-3g' | '6-31g*' | 'cc-pvdz'>('sto-3g');
  
  // Professional 2-Tier Hierarchical Workspace Navigation
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceCategory>('electronic');
  const [subSection, setSubSection] = useState<string>('pes');
  const [orbitalMode, setOrbitalMode] = useState<'bonding' | 'antibonding'>('bonding');

  const mol = useMemo(() => {
    return INDUSTRIAL_MOLECULES.find(m => m.id === selectedMolId) || INDUSTRIAL_MOLECULES[0];
  }, [selectedMolId]);

  // Point group symmetry & molecular mass lookup
  const molMetadata = useMemo(() => {
    const table: Record<string, { pointGroup: string; mass: string; spin: string }> = {
      H2: { pointGroup: 'D_∞h', mass: '2.016 g/mol', spin: 'Singlet (S=0)' },
      LiH: { pointGroup: 'C_∞v', mass: '7.95 g/mol', spin: 'Singlet (S=0)' },
      H2O: { pointGroup: 'C_2v', mass: '18.015 g/mol', spin: 'Singlet (S=0)' },
      N2: { pointGroup: 'D_∞h', mass: '28.014 g/mol', spin: 'Singlet (S=0)' },
      CO2: { pointGroup: 'D_∞h', mass: '44.01 g/mol', spin: 'Singlet (S=0)' },
      LiCoO2: { pointGroup: 'C_s', mass: '97.87 g/mol', spin: 'Doublet/Mixed' },
      FeMoco: { pointGroup: 'C_1', mass: '319.78 g/mol', spin: 'High-Spin S=3/2' }
    };
    return table[mol.id] || { pointGroup: 'C_1', mass: '44.0 g/mol', spin: 'Singlet' };
  }, [mol.id]);

  // Sync default bond distance when molecule changes
  useEffect(() => {
    setBondDistance(mol.equilibriumR);
  }, [mol]);

  // Sync default sub-section when switching primary workspace
  const handleWorkspaceChange = (ws: WorkspaceCategory) => {
    playGateClickSound(600);
    setActiveWorkspace(ws);
    if (ws === 'electronic') setSubSection('pes');
    else if (ws === 'hamiltonian') setSubSection('cas');
    else if (ws === 'vqe_solver') setSubSection('optimizer');
    else if (ws === 'kinetics') setSubSection('pathway');
    else if (ws === 'ftqc_pipeline') setSubSection('resource_estimator');
  };

  // Calculate potential energy surface values based on Morse Potential
  const getPESEnergy = (R: number, molObj: IndustrialMolecule) => {
    const Re = molObj.equilibriumR;
    const De = Math.abs(molObj.fciEnergy - molObj.hfEnergy) * 3.5 + 0.15;
    const a = 1.05 / Math.sqrt(Re);
    const Easymp = molObj.fciEnergy + De;
    return +(De * Math.pow(1 - Math.exp(-a * (R - Re)), 2) + Easymp - De).toFixed(4);
  };

  const exactFciEnergy = getPESEnergy(bondDistance, mol);
  const hartreeFockEnergy = +(exactFciEnergy + 0.042 + 0.038 / (bondDistance * bondDistance)).toFixed(4);
  const ccsdEnergy = +(exactFciEnergy + 0.0018 + 0.002 / bondDistance).toFixed(4);
  const correlationEnergy = +Math.abs(exactFciEnergy - hartreeFockEnergy).toFixed(4);

  // Variational energy state
  const [vqeEnergy, setVqeEnergy] = useState<number>(exactFciEnergy + 0.012);

  useEffect(() => {
    setVqeEnergy(+(exactFciEnergy + 0.012).toFixed(4));
  }, [exactFciEnergy]);

  // Pauli Hamiltonian terms
  const pauliTerms = useMemo(() => {
    return generatePauliHamiltonian(mol, bondDistance, mappingType);
  }, [mol, bondDistance, mappingType]);

  // Canvases
  const pesCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const orbitalCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render PES Plot
  useEffect(() => {
    if (activeWorkspace !== 'electronic' || subSection !== 'pes') return;
    const canvas = pesCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const padL = 60;
    const padR = 30;
    const padT = 30;
    const padB = 40;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    const rMin = mol.minR;
    const rMax = mol.maxR;

    const eMin = getPESEnergy(mol.equilibriumR, mol) - 0.06;
    const eMax = getPESEnergy(mol.minR, mol) + 0.06;

    const toX = (r: number) => padL + ((r - rMin) / (rMax - rMin)) * plotW;
    const toY = (e: number) => padT + (1 - (e - eMin) / (eMax - eMin)) * plotH;

    // Grid lines
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padT + (i / 4) * plotH;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(w - padR, y);
      ctx.stroke();

      const eVal = (eMax - (i / 4) * (eMax - eMin)).toFixed(2);
      ctx.fillStyle = '#64748b';
      ctx.font = '9px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${eVal} Ha`, padL - 8, y + 3);
    }

    // X Axis ticks
    for (let r = Math.ceil(rMin * 2) / 2; r <= rMax; r += 0.5) {
      const x = toX(r);
      ctx.fillStyle = '#64748b';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${r.toFixed(1)} Å`, x, h - padB + 16);
    }

    // 1. Classical Hartree-Fock Curve (Amber dashed)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    for (let x = 0; x <= plotW; x += 3) {
      const r = rMin + (x / plotW) * (rMax - rMin);
      const eFCI = getPESEnergy(r, mol);
      const eHF = eFCI + 0.042 + 0.038 / (r * r);
      const y = toY(eHF);
      if (x === 0) ctx.moveTo(padL + x, y);
      else ctx.lineTo(padL + x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Classical CCSD(T) Curve (Purple dotted)
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    for (let x = 0; x <= plotW; x += 3) {
      const r = rMin + (x / plotW) * (rMax - rMin);
      const eFCI = getPESEnergy(r, mol);
      const eCCSD = eFCI + 0.002 + 0.002 / r;
      const y = toY(eCCSD);
      if (x === 0) ctx.moveTo(padL + x, y);
      else ctx.lineTo(padL + x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Exact FCI Ground State Potential Curve (Cyan solid)
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    for (let x = 0; x <= plotW; x += 3) {
      const r = rMin + (x / plotW) * (rMax - rMin);
      const e = getPESEnergy(r, mol);
      const y = toY(e);
      if (x === 0) ctx.moveTo(padL + x, y);
      else ctx.lineTo(padL + x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Current Bond Distance Marker
    const curX = toX(bondDistance);
    const curY = toY(exactFciEnergy);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(curX, padT);
    ctx.lineTo(curX, h - padB);
    ctx.stroke();
    ctx.setLineDash([]);

    // Current VQE state marker
    const vqeY = toY(vqeEnergy);
    ctx.fillStyle = '#ec4899';
    ctx.shadowColor = '#ec4899';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(curX, vqeY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Exact state ground marker
    ctx.fillStyle = '#00e5ff';
    ctx.beginPath();
    ctx.arc(curX, curY, 4, 0, Math.PI * 2);
    ctx.fill();
  }, [activeWorkspace, subSection, bondDistance, mol, exactFciEnergy, vqeEnergy]);

  // Render LCAO Molecular Orbital
  useEffect(() => {
    if (activeWorkspace !== 'electronic' || subSection !== 'orbitals') return;
    const canvas = orbitalCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2 - 6;

    const dPx = Math.min(w * 0.55, bondDistance * 80);
    const xA = cx - dPx / 2;
    const xB = cx + dPx / 2;

    const step = 4;
    const isBonding = orbitalMode === 'bonding';

    for (let x = 0; x < w; x += step) {
      for (let y = 0; y < h; y += step) {
        const rA = Math.hypot(x - xA, y - cy) / 36;
        const rB = Math.hypot(x - xB, y - cy) / 36;
        const phiA = Math.exp(-rA);
        const phiB = Math.exp(-rB);
        const psi = isBonding ? (phiA + phiB) : (phiA - phiB);
        const density = psi * psi;

        if (density > 0.015) {
          const alpha = Math.min(0.85, density * 1.6);
          if (isBonding || psi > 0) {
            ctx.fillStyle = `rgba(0, 229, 255, ${alpha})`;
          } else {
            ctx.fillStyle = `rgba(244, 63, 94, ${alpha})`;
          }
          ctx.fillRect(x, y, step, step);
        }
      }
    }

    if (!isBonding) {
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(cx, 15);
      ctx.lineTo(cx, h - 25);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#f59e0b';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Nodal Plane (ψ=0)', cx, 12);
    }

    // Draw Nuclei
    [xA, xB].forEach((nx, i) => {
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(nx, cy, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#02060a';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(i === 0 ? 'N₁' : 'N₂', nx, cy);
    });
  }, [activeWorkspace, subSection, bondDistance, orbitalMode]);

  const activeQubitCount = mol.qubits[mappingType === 'parity_2q_reduced' ? 'parity_reduced' : mappingType === 'bravyi_kitaev' ? 'bravyi_kitaev' : 'jordan_wigner'];
  const isChemicalAccuracy = Math.abs(vqeEnergy - exactFciEnergy) < 0.0016;

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#030610] text-[#eaf8ff] p-5 space-y-5 font-sans">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[rgba(0,229,255,0.18)] font-mono">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#09141d] border border-[rgba(0,229,255,0.35)] flex items-center justify-center text-[#00e5ff] shadow-sm shadow-[#00e5ff]/20">
            <Atom className="w-6 h-6 text-[#00e5ff] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base text-white">Quantum Chemistry &amp; VQE Molecular Simulator</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-[#00e5ff] border border-cyan-800/60 font-semibold">
                Dirac-Fock · Qiskit Nature · InQuanto
              </span>
            </div>
            <p className="text-xs text-[#78909c]">
              Industrial electronic structure suite: potential energy surfaces, CASSCF partitioning, VQE circuits &amp; fault-tolerant QPE
            </p>
          </div>
        </div>

        {/* Industrial Molecule & Basis Set Selectors */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-[#09141d] px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-[#78909c] text-[10px] uppercase font-bold">Molecule:</span>
            <select
              value={selectedMolId}
              onChange={(e) => {
                playGateClickSound(700);
                setSelectedMolId(e.target.value);
              }}
              className="bg-transparent text-white font-bold outline-none cursor-pointer text-xs"
            >
              <optgroup label="Academic Calibration Benchmarks" className="bg-[#09141d]">
                <option value="H2">H₂ (Molecular Hydrogen)</option>
                <option value="LiH">LiH (Lithium Hydride)</option>
                <option value="H2O">H₂O (Water Molecule C₂ᵥ)</option>
              </optgroup>
              <optgroup label="Industrial Catalysts & Clean Energy" className="bg-[#09141d]">
                <option value="N2">N₂ (Haber-Bosch Nitrogenase)</option>
                <option value="FeMoco">[Fe₄S₃] FeMoco Active Site</option>
                <option value="CO2">CO₂ (Direct Air Carbon Capture)</option>
                <option value="LiCoO2">Li-Co-O₄ (Solid-State Battery Cathode)</option>
              </optgroup>
            </select>
          </div>

          {/* Basis Set Picker */}
          <div className="flex items-center gap-1.5 bg-[#09141d] px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-[#78909c] text-[10px] uppercase font-bold">Basis:</span>
            <select
              value={basisSet}
              onChange={(e) => {
                playGateClickSound(650);
                setBasisSet(e.target.value as any);
              }}
              className="bg-transparent text-cyan-300 font-bold outline-none cursor-pointer text-xs"
            >
              <option value="sto-3g" className="bg-[#09141d]">STO-3G (Minimal)</option>
              <option value="6-31g*" className="bg-[#09141d]">6-31G* (Polarized)</option>
              <option value="cc-pvdz" className="bg-[#09141d]">cc-pVDZ (Correlation-Consistent)</option>
            </select>
          </div>

          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold ${
            isChemicalAccuracy ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300' : 'bg-amber-950/80 border-amber-500 text-amber-300'
          }`}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            <span>Accuracy: {(Math.abs(vqeEnergy - exactFciEnergy) * 1000).toFixed(2)} mHa</span>
          </div>
        </div>
      </div>

      {/* Molecular Metadata Quick-Spec Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 rounded-xl bg-[#070e17] border border-slate-800/80 font-mono text-[11px]">
        <div className="flex flex-wrap items-center gap-3 text-slate-400">
          <span className="text-white font-bold">{mol.name} ({mol.formula})</span>
          <span>·</span>
          <span>Symmetry: <strong className="text-cyan-300">{molMetadata.pointGroup}</strong></span>
          <span>·</span>
          <span>Mass: <strong className="text-white">{molMetadata.mass}</strong></span>
          <span>·</span>
          <span>Spin: <strong className="text-purple-300">{molMetadata.spin}</strong></span>
          <span>·</span>
          <span>Active Space: <strong className="text-emerald-400">CAS({mol.electrons}e, {mol.activeOrbitals}o)</strong></span>
          <span>·</span>
          <span>E_nuc: <strong className="text-slate-300">{mol.nuclearRepulsionEnergy.toFixed(4)} Ha</strong></span>
        </div>

        <div className="flex items-center gap-2 text-slate-500 text-[10px]">
          <span>Basis: <strong className="text-cyan-400 uppercase">{basisSet}</strong></span>
          <span>·</span>
          <span>QPU Allocation: <strong className="text-white">{activeQubitCount} Logical Qubits</strong></span>
        </div>
      </div>

      {/* 2. Tier-1: Primary Professional Workspaces */}
      <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-1.5 p-1 bg-[#09141d] rounded-xl border border-slate-800">
          {[
            { id: 'electronic' as const, label: 'Electronic Structure & Spectroscopy', icon: Activity },
            { id: 'hamiltonian' as const, label: 'Active Space & Qubit Hamiltonian', icon: Layers },
            { id: 'vqe_solver' as const, label: 'VQE Variational Solver & Circuit', icon: Sliders },
            { id: 'kinetics' as const, label: 'Chemical Kinetics & Photochemistry', icon: Flame },
            { id: 'ftqc_pipeline' as const, label: 'Fault-Tolerant QPE & Pipeline', icon: Cpu }
          ].map(ws => {
            const Icon = ws.icon;
            const isCur = activeWorkspace === ws.id;
            return (
              <button
                key={ws.id}
                onClick={() => handleWorkspaceChange(ws.id)}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  isCur 
                    ? 'bg-[#00e5ff] text-[#02060a] shadow-xs' 
                    : 'text-[#78909c] hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{ws.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 text-[11px] text-[#78909c]">
          <span>Encoding: <strong className="text-white">{activeQubitCount} Qubits</strong></span>
          <span>·</span>
          <span>Correlation: <strong className="text-cyan-400">{(correlationEnergy * 1000).toFixed(1)} mHa</strong></span>
        </div>
      </div>

      {/* 3. Tier-2: Focused Sub-Sections Bar */}
      <div className="px-3 py-2 rounded-xl bg-[#050b11] border border-cyan-850/40 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 uppercase font-bold text-[10px] mr-1">Sub-Section:</span>
          
          {/* Sub-sections for 'electronic' */}
          {activeWorkspace === 'electronic' && [
            { id: 'pes', label: 'Potential Energy Surface (PES)', icon: Activity },
            { id: 'orbitals', label: 'LCAO Molecular Orbitals', icon: Sparkles },
            { id: 'vibrations', label: 'Vibrational Modes & FTIR', icon: Radio }
          ].map(sub => (
            <button
              key={sub.id}
              onClick={() => { playGateClickSound(600); setSubSection(sub.id); }}
              className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1.5 ${
                subSection === sub.id ? 'bg-cyan-950 text-cyan-300 border border-cyan-700' : 'text-slate-400 hover:text-white'
              }`}
            >
              <sub.icon className="w-3 h-3" />
              <span>{sub.label}</span>
            </button>
          ))}

          {/* Sub-sections for 'hamiltonian' */}
          {activeWorkspace === 'hamiltonian' && [
            { id: 'cas', label: 'CASSCF Complete Active Space', icon: Table },
            { id: 'mappings', label: 'Fermion-to-Qubit Mappings (JW/BK/Parity)', icon: Layers }
          ].map(sub => (
            <button
              key={sub.id}
              onClick={() => { playGateClickSound(600); setSubSection(sub.id); }}
              className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1.5 ${
                subSection === sub.id ? 'bg-cyan-950 text-cyan-300 border border-cyan-700' : 'text-slate-400 hover:text-white'
              }`}
            >
              <sub.icon className="w-3 h-3" />
              <span>{sub.label}</span>
            </button>
          ))}

          {/* Sub-sections for 'vqe_solver' */}
          {activeWorkspace === 'vqe_solver' && [
            { id: 'optimizer', label: 'Classical Optimizer Arena (COBYLA/SPSA/QNG)', icon: Sliders },
            { id: 'landscape', label: '3D Variational Landscape E(θ₁, θ₂)', icon: TrendingDown },
            { id: 'ansatz_circuit', label: 'Ansatz Quantum Circuit Synthesis', icon: GitBranch }
          ].map(sub => (
            <button
              key={sub.id}
              onClick={() => { playGateClickSound(600); setSubSection(sub.id); }}
              className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1.5 ${
                subSection === sub.id ? 'bg-cyan-950 text-cyan-300 border border-cyan-700' : 'text-slate-400 hover:text-white'
              }`}
            >
              <sub.icon className="w-3 h-3" />
              <span>{sub.label}</span>
            </button>
          ))}

          {/* Sub-sections for 'kinetics' */}
          {activeWorkspace === 'kinetics' && [
            { id: 'pathway', label: 'Reaction Coordinate & Eyring Theory', icon: Flame },
            { id: 'photochem', label: 'Excited States & UV-Vis (VQD)', icon: Sun }
          ].map(sub => (
            <button
              key={sub.id}
              onClick={() => { playGateClickSound(600); setSubSection(sub.id); }}
              className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1.5 ${
                subSection === sub.id ? 'bg-cyan-950 text-cyan-300 border border-cyan-700' : 'text-slate-400 hover:text-white'
              }`}
            >
              <sub.icon className="w-3 h-3" />
              <span>{sub.label}</span>
            </button>
          ))}

          {/* Sub-sections for 'ftqc_pipeline' */}
          {activeWorkspace === 'ftqc_pipeline' && [
            { id: 'resource_estimator', label: 'FTQC QPE Resource Estimator', icon: Cpu },
            { id: 'code_export', label: 'Production Code Exporter', icon: Code2 }
          ].map(sub => (
            <button
              key={sub.id}
              onClick={() => { playGateClickSound(600); setSubSection(sub.id); }}
              className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1.5 ${
                subSection === sub.id ? 'bg-cyan-950 text-cyan-300 border border-cyan-700' : 'text-slate-400 hover:text-white'
              }`}
            >
              <sub.icon className="w-3 h-3" />
              <span>{sub.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <Leaf className="w-3 h-3 text-emerald-400" />
          <span>{mol.industrialImpact}</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* WORKSPACE 1: ELECTRONIC STRUCTURE & SPECTROSCOPY */}
      {/* ========================================================================= */}
      {activeWorkspace === 'electronic' && (
        <>
          {subSection === 'pes' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-8 bg-[#050b11] border border-[rgba(0,229,255,0.2)] rounded-2xl p-4 flex flex-col space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#00e5ff]" />
                    <span className="font-bold text-white uppercase tracking-wider">
                      Potential Energy Dissociation Surface (PES)
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px]">
                    <span className="flex items-center gap-1 text-[#00e5ff]">
                      <span className="w-3 h-0.5 bg-[#00e5ff]" /> Exact FCI Ground State
                    </span>
                    <span className="flex items-center gap-1 text-purple-400">
                      <span className="w-3 h-0.5 bg-purple-400 border-dashed" /> Classical CCSD(T)
                    </span>
                    <span className="flex items-center gap-1 text-amber-400">
                      <span className="w-3 h-0.5 bg-amber-400 border-dashed" /> Hartree-Fock (HF)
                    </span>
                    <span className="flex items-center gap-1 text-pink-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-pink-500" /> VQE ⟨H⟩
                    </span>
                  </div>
                </div>

                <div className="flex-1 min-h-[280px] relative flex items-center justify-center">
                  <canvas
                    ref={pesCanvasRef}
                    width={640}
                    height={300}
                    className="w-full h-full max-h-[300px] block"
                  />
                </div>

                {/* Bond Length Slider */}
                <div className="p-3 rounded-xl bg-[#09141d] border border-slate-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[#78909c] font-semibold">Bond Length (R):</span>
                    <span className="text-[#00e5ff] font-bold text-sm">{bondDistance.toFixed(3)} Å</span>
                    {Math.abs(bondDistance - mol.equilibriumR) < 0.05 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-bold">
                        Equilibrium
                      </span>
                    )}
                  </div>

                  <div className="flex-1 max-w-md flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">{mol.minR} Å</span>
                    <input
                      type="range"
                      min={mol.minR}
                      max={mol.maxR}
                      step={0.01}
                      value={bondDistance}
                      onChange={(e) => setBondDistance(+e.target.value)}
                      className="w-full h-1.5 bg-slate-800 accent-[#00e5ff] rounded-lg cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-500">{mol.maxR} Å</span>
                  </div>

                  <button
                    onClick={() => setBondDistance(mol.equilibriumR)}
                    className="text-[11px] text-[#78909c] hover:text-white underline cursor-pointer"
                  >
                    Reset R_eq
                  </button>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col space-y-4 font-mono text-xs">
                <div className="p-4 rounded-xl bg-[#050b11] border border-slate-800">
                  <MoleculeStructure3D
                    molecule={mol}
                    bondDistanceScale={bondDistance / mol.equilibriumR}
                  />
                </div>

                <div className="p-4 rounded-xl bg-[#09141d] border border-[rgba(0,229,255,0.2)] space-y-3">
                  <span className="text-[11px] text-[#78909c] font-bold uppercase tracking-wider block">
                    Electronic Ground State Energy
                  </span>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-pink-500/20">
                      <span className="text-pink-400 block text-[10px]">VQE Energy ⟨H⟩:</span>
                      <span className="text-white font-bold text-sm">{vqeEnergy} Ha</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-[#00e5ff]/20">
                      <span className="text-[#00e5ff] block text-[10px]">Exact FCI Ground:</span>
                      <span className="text-white font-bold text-sm">{exactFciEnergy} Ha</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800">
                    <span className="text-[#78909c]">Chemical Accuracy:</span>
                    <span className="text-emerald-400 font-bold">&lt; 1.6 mHa (1 kcal/mol)</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#78909c]">Current Error |ΔE|:</span>
                    <span className={`font-bold ${Math.abs(vqeEnergy - exactFciEnergy) < 0.0016 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {(Math.abs(vqeEnergy - exactFciEnergy) * 1000).toFixed(2)} mHa
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#78909c]">Correlation Captured:</span>
                    <span className="text-cyan-300 font-bold">
                      {((1 - Math.abs(vqeEnergy - exactFciEnergy) / correlationEnergy) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-[#78909c] leading-relaxed">
                  <span className="text-white font-bold block mb-1">Quantum Advantage Frontier</span>
                  Classical CCSD(T) scales as O(N⁷) and fails for bond dissociation with multi-reference degeneracy. VQE scales polynomially O(N⁴) with quantum circuits.
                </div>
              </div>
            </div>
          )}

          {subSection === 'orbitals' && (
            <div className="p-5 rounded-2xl bg-[#050b11] border border-[rgba(0,229,255,0.2)] font-mono text-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#00e5ff]" />
                    <span>Hartree-Fock LCAO Molecular Orbital &amp; Electron Density Cloud |ψ(r)|²</span>
                  </h3>
                  <p className="text-[11px] text-[#78909c] mt-0.5">
                    Linear Combination of Atomic Orbitals: ψ_mol(r) = (φ_A ± φ_B) / √(2(1 ± S)).
                  </p>
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-[#09141d] rounded-lg border border-slate-800">
                  <button
                    onClick={() => setOrbitalMode('bonding')}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                      orbitalMode === 'bonding'
                        ? 'bg-[#00e5ff] text-[#02060a] shadow-xs'
                        : 'text-[#78909c] hover:text-white'
                    }`}
                  >
                    σ_g Bonding Orbital (Constructive)
                  </button>
                  <button
                    onClick={() => setOrbitalMode('antibonding')}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                      orbitalMode === 'antibonding'
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'text-[#78909c] hover:text-white'
                    }`}
                  >
                    σ_u* Anti-Bonding (Nodal Plane)
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center p-3 rounded-xl bg-[#02050c] border border-slate-800">
                <canvas
                  ref={orbitalCanvasRef}
                  width={600}
                  height={200}
                  className="max-w-full block"
                />
              </div>
            </div>
          )}

          {subSection === 'vibrations' && (
            <VibrationalSpectroscopy
              molecule={mol}
              bondDistance={bondDistance}
            />
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* WORKSPACE 2: ACTIVE SPACE & QUBIT HAMILTONIAN */}
      {/* ========================================================================= */}
      {activeWorkspace === 'hamiltonian' && (
        <>
          {subSection === 'cas' && (
            <ActiveSpaceCasStudio molecule={mol} />
          )}

          {subSection === 'mappings' && (
            <FermionMappingStudio
              molecule={mol}
              selectedMapping={mappingType}
              onSelectMapping={setMappingType}
              pauliTerms={pauliTerms}
            />
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* WORKSPACE 3: VQE VARIATIONAL SOLVER & CIRCUIT */}
      {/* ========================================================================= */}
      {activeWorkspace === 'vqe_solver' && (
        <>
          {subSection === 'optimizer' && (
            <VqeOptimizerLab
              exactEnergy={exactFciEnergy}
              currentEnergy={vqeEnergy}
              onUpdateEnergy={setVqeEnergy}
              ansatzType={ansatzType}
            />
          )}

          {subSection === 'landscape' && (
            <VariationalLandscape3D
              exactEnergy={exactFciEnergy}
              currentEnergy={vqeEnergy}
            />
          )}

          {subSection === 'ansatz_circuit' && (
            <AnsatzCircuitViewer
              ansatz={ansatzType}
              molecule={mol}
              numQubits={activeQubitCount}
            />
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* WORKSPACE 4: CHEMICAL KINETICS & PHOTOCHEMISTRY */}
      {/* ========================================================================= */}
      {activeWorkspace === 'kinetics' && (
        <>
          {subSection === 'pathway' && (
            <ReactionKineticsPathway molecule={mol} />
          )}

          {subSection === 'photochem' && (
            <ExcitedStateVqd
              molecule={mol}
              groundEnergy={exactFciEnergy}
            />
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* WORKSPACE 5: FAULT-TOLERANT QPE & PRODUCTION PIPELINE */}
      {/* ========================================================================= */}
      {activeWorkspace === 'ftqc_pipeline' && (
        <>
          {subSection === 'resource_estimator' && (
            <QpeResourceEstimator molecule={mol} />
          )}

          {subSection === 'code_export' && (
            <ChemistryCodeExporter
              molecule={mol}
              ansatz={ansatzType}
              optimizer={optimizerType}
              bondDistance={bondDistance}
            />
          )}
        </>
      )}

    </div>
  );
};

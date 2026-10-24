import React, { useState, useEffect } from 'react';
import { ActiveTab } from './Navbar';
import { playMeasurementCollapseSound, playGateClickSound, isAudioMuted, setAudioMuted } from '../utils/audio';
import { ChandelierHero3D, ChandelierViewMode } from './ChandelierHero3D';
import { 
  Rotate3d, 
  Play, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  ArrowLeftRight, 
  Flame, 
  Sparkles, 
  Radio, 
  Thermometer, 
  Shield, 
  Activity, 
  Gauge 
} from 'lucide-react';

interface QuantumComputingDashboardProps {
  onNavigateTab: (tab: ActiveTab) => void;
  activeQubitsCount?: number;
  circuitGateCount?: number;
  onLoadPresetToComposer?: (gates: any[], numQubits: number) => void;
}

export const QuantumComputingDashboard: React.FC<QuantumComputingDashboardProps> = ({
  onNavigateTab,
  activeQubitsCount = 4,
  circuitGateCount = 2
}) => {
  const [isFading, setIsFading] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [muted, setMutedState] = useState<boolean>(() => isAudioMuted());
  const [viewMode, setViewMode] = useState<ChandelierViewMode>('gold');
  const [motionSide, setMotionSide] = useState<'right' | 'left'>('right');
  const [liveTemp, setLiveTemp] = useState<number>(14.28);

  // Fluctuating cryo base telemetry
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTemp(+(14.28 + Math.sin(Date.now() / 2500) * 0.12).toFixed(2));
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  // Navigate to workspace with smooth transition & sound
  const handleOpenWorkspace = (targetTab: ActiveTab = 'composer') => {
    try {
      playMeasurementCollapseSound();
    } catch {
      // Audio fallback
    }
    setIsFading(true);
    setTimeout(() => {
      onNavigateTab(targetTab);
      setIsFading(false);
    }, 220);
  };

  const handleOpenAlgorithms = () => {
    try {
      playGateClickSound(750);
    } catch {
      // Audio fallback
    }
    setIsFading(true);
    setTimeout(() => {
      onNavigateTab('algorithms');
      setIsFading(false);
    }, 220);
  };

  const toggleMute = () => {
    const next = !muted;
    setAudioMuted(next);
    setMutedState(next);
    if (!next) {
      playGateClickSound(800);
    }
  };

  const toggleMotionSide = () => {
    playGateClickSound(650);
    setMotionSide(prev => prev === 'right' ? 'left' : 'right');
  };

  // Keyboard shortcuts: Space or Enter opens workspace
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleOpenWorkspace('composer');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      className={`relative w-full h-full overflow-hidden select-none bg-[#01030a] text-slate-100 transition-opacity duration-300 ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* ===================================================================== */}
      {/* 1. FLOATING 3D SHADER & CAMERA HUD CONTROLLER                         */}
      {/* ===================================================================== */}
      <div 
        className={`absolute top-4 ${
          motionSide === 'right' ? 'right-6' : 'left-6'
        } z-30 pointer-events-auto flex items-center gap-2 font-sans text-xs`}
      >
        {/* Visual Shader Switcher */}
        <div className="flex items-center gap-1 bg-[#030914]/85 backdrop-blur-xl p-1 rounded-xl border border-cyan-500/30 shadow-xl shadow-cyan-500/5">
          <button
            onClick={() => { playGateClickSound(600); setViewMode('gold'); }}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer font-semibold ${
              viewMode === 'gold'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-sm shadow-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
            title="PBR Gold & Chrome Cryostat Twin"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PBR Gold</span>
          </button>

          <button
            onClick={() => { playGateClickSound(600); setViewMode('thermal'); }}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer font-semibold ${
              viewMode === 'thermal'
                ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-sm shadow-orange-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
            title="FLIR Thermal False-Color Temperature Gradient"
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span className="hidden sm:inline">Thermal FLIR</span>
          </button>

          <button
            onClick={() => { playGateClickSound(600); setViewMode('xray'); }}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer font-semibold ${
              viewMode === 'xray'
                ? 'bg-gradient-to-r from-cyan-500 to-sky-400 text-slate-950 shadow-sm shadow-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Quantum Signal & RF Hologram"
          >
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Quantum RF</span>
          </button>
        </div>

        {/* Flip Motion Side Button */}
        <button
          onClick={toggleMotionSide}
          className="px-3 py-1.5 rounded-xl bg-[#030914]/85 backdrop-blur-xl border border-cyan-500/30 text-cyan-300 hover:text-white hover:border-cyan-400 transition-all cursor-pointer flex items-center gap-1.5 shadow-xl"
          title={`Move 3D Chandelier to ${motionSide === 'right' ? 'Left' : 'Right'} side`}
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline">Flip</span>
        </button>

        {/* 3D Auto-Rotation Toggle */}
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-2 rounded-xl backdrop-blur-xl border transition-all cursor-pointer ${
            autoRotate
              ? 'bg-[#030914]/85 border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.25)]'
              : 'bg-[#030914]/60 border-slate-800 text-slate-500 hover:text-slate-300'
          }`}
          title={autoRotate ? 'Pause 3D Rotation' : 'Resume 3D Rotation'}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '9s' }} />
        </button>

        {/* Audio Mute/Unmute */}
        <button
          onClick={toggleMute}
          className={`p-2 rounded-xl backdrop-blur-xl border transition-all cursor-pointer ${
            !muted
              ? 'bg-[#030914]/85 border-cyan-500/40 text-cyan-400'
              : 'bg-[#030914]/60 border-slate-800 text-slate-500 hover:text-slate-300'
          }`}
          title={muted ? 'Unmute Audio Feedback' : 'Mute Audio Feedback'}
        >
          {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* ===================================================================== */}
      {/* 2. DEDICATED 3D MOTION CHAMBER (OPPOSITE SIDE OF THE TEXT)            */}
      {/* ===================================================================== */}
      {/* When motionSide is 'right': positioned on the right half. When 'left': on left half. */}
      <div 
        className={`absolute top-0 h-full w-full lg:w-[54%] xl:w-[56%] z-0 pointer-events-auto transition-all duration-700 ${
          motionSide === 'right' ? 'right-0' : 'left-0'
        }`}
      >
        <ChandelierHero3D 
          reducedMotion={reducedMotion} 
          autoRotate={autoRotate}
          enableZoom={false}
          positionX={0}
          viewMode={viewMode}
        />
        
        {/* Soft radial vignette so 3D blends smoothly into the dark canvas */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#01030a] via-transparent to-transparent opacity-80" />
        <div className={`absolute inset-0 pointer-events-none bg-gradient-to-${motionSide === 'right' ? 'l' : 'r'} from-transparent to-[#01030a] w-32`} />
      </div>

      {/* Ambient Volumetric Glow Blobs */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        <div 
          className={`absolute top-[30%] ${motionSide === 'right' ? 'left-[10%]' : 'right-[10%]'} w-[28rem] h-[28rem] rounded-full bg-cyan-500/10 blur-[130px]`} 
        />
        <div 
          className={`absolute bottom-[20%] ${motionSide === 'right' ? 'right-[20%]' : 'left-[20%]'} w-[32rem] h-[32rem] rounded-full bg-blue-600/12 blur-[140px]`} 
        />
      </div>

      {/* ===================================================================== */}
      {/* 3. DEDICATED TYPOGRAPHY & INTERACTIVE HERO BLOCK                     */}
      {/* ===================================================================== */}
      <div 
        className={`relative z-10 w-full lg:w-[48%] xl:w-[46%] h-full flex flex-col justify-between p-8 sm:p-12 md:p-14 lg:p-16 transition-all duration-700 ${
          motionSide === 'right' ? 'ml-0 mr-auto' : 'mr-0 ml-auto'
        }`}
      >
        {/* Top spacer for header bar */}
        <div className="h-14" />

        {/* Center Typography & Call-To-Action Block */}
        <div className="my-auto max-w-xl">
          
          {/* Release Version & Telemetry Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-sans text-cyan-300 mb-5 backdrop-blur-md shadow-sm shadow-cyan-500/10">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-semibold tracking-wide">QUANTUM STUDIO v2.5</span>
            <span className="text-slate-600">·</span>
            <span className="text-amber-300 font-mono font-bold">{liveTemp} mK CRYO BASE</span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30">
              SUB-KELVIN
            </span>
          </div>

          {/* Main Architectural Hero Title */}
          <div className="flex flex-col select-none">
            <h1 className="font-heading font-extrabold tracking-tight text-white text-5xl sm:text-7xl lg:text-8xl leading-none drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
              QUANTUM
            </h1>
            <span className="font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 text-3xl sm:text-5xl lg:text-6xl tracking-tight mt-1.5">
              COMPUTING
            </span>
          </div>

          {/* Subtitle & Value Proposition */}
          <p className="mt-4 text-sm sm:text-base text-slate-300 font-sans leading-relaxed max-w-lg">
            End-to-end quantum computing platform bridging physical dilution architecture, Hilbert-space statevector simulation, and NISQ-to-Fault-Tolerant quantum pipelines.
          </p>

          {/* Feature Spec Tags */}
          <div className="flex flex-wrap items-center gap-2 mt-4 text-xs font-sans text-slate-300">
            <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 flex items-center gap-1.5 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Sub-Kelvin 15mK QPU
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 flex items-center gap-1.5 backdrop-blur-sm">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              99.96% Gate Fidelity
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 flex items-center gap-1.5 backdrop-blur-sm">
              <Radio className="w-3.5 h-3.5 text-purple-400" />
              OpenQASM 3.0 & Python
            </span>
          </div>

          {/* ================================================================= */}
          {/* TOP DEVELOPER ACTION BUTTONS                                     */}
          {/* ================================================================= */}
          <div className="mt-7 flex flex-wrap items-center gap-3.5 font-sans">
            
            {/* Button 1: OPEN QUANTUM WORKSPACE */}
            <button
              onClick={() => handleOpenWorkspace('composer')}
              className="group relative px-7 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wide text-[#010814] bg-gradient-to-r from-[#00d2ff] via-[#00e5ff] to-[#38bdf8] hover:from-[#38bdf8] hover:to-[#00f5ff] transition-all duration-200 cursor-pointer shadow-[0_0_25px_rgba(0,229,255,0.6)] hover:shadow-[0_0_40px_rgba(0,229,255,0.9)] hover:scale-102 active:scale-98 flex items-center gap-2.5 font-sans"
              title="Open Quantum Circuit Composer & Simulation Engine"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>OPEN CIRCUIT COMPOSER</span>
              <span className="text-base transition-transform group-hover:translate-x-1">→</span>
            </button>

            {/* Button 2: 3D CRYO LAB */}
            <button
              onClick={() => onNavigateTab('lab')}
              className="group relative px-6 py-3.5 sm:py-4 rounded-xl font-semibold text-xs sm:text-sm uppercase tracking-wide text-cyan-300 hover:text-white bg-[#021424]/80 hover:bg-[#062038] border border-cyan-500/40 hover:border-cyan-400 backdrop-blur-md transition-all duration-200 cursor-pointer shadow-[0_0_15px_rgba(0,229,255,0.15)] hover:shadow-[0_0_25px_rgba(0,229,255,0.35)] hover:scale-102 active:scale-98 flex items-center gap-2 font-sans"
              title="Open 3D Cryogenic Architecture & Quantum Engine Flow"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>3D CRYO LAB</span>
              <span className="text-base text-cyan-400 transition-transform group-hover:translate-x-1">→</span>
            </button>

            {/* Button 3: EXPLORE ALGORITHMS */}
            <button
              onClick={handleOpenAlgorithms}
              className="group relative px-5 py-3.5 sm:py-4 rounded-xl font-semibold text-xs sm:text-sm uppercase tracking-wide text-[#e2e8f0] hover:text-white bg-[#020b18]/60 hover:bg-[#07162b] border border-slate-700 hover:border-slate-600 backdrop-blur-md transition-all duration-200 cursor-pointer hover:scale-102 active:scale-98 flex items-center gap-2 font-sans"
              title="Explore Quantum Algorithms (Grover, QFT, Shor, Bell, GHZ)"
            >
              <BookOpen className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              <span>ALGORITHMS</span>
            </button>

          </div>

          {/* Quick Keyboard Hint */}
          <div className="mt-4 pl-1 flex items-center gap-2 text-xs font-sans text-slate-400">
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 font-bold font-mono text-[11px]">Space</span>
            <span>or</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 font-bold font-mono text-[11px]">Enter</span>
            <span>to open workspace immediately</span>
          </div>

        </div>

        {/* Bottom Left Corner Telemetry & Indicators */}
        <div className="flex items-center justify-between text-xs font-sans text-slate-400 pt-4">
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">QUBITS:</span>
              <span className="text-cyan-400 font-bold font-mono">{activeQubitsCount}</span>
            </div>
            <span className="text-slate-700">·</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">SUPERPOSITION:</span>
              <span className="text-emerald-400 font-bold">ACTIVE</span>
            </div>
            <span className="text-slate-700">·</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">ENTANGLEMENT:</span>
              <span className="text-cyan-300 font-bold">ENABLED</span>
            </div>
            <span className="text-slate-700">·</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">FIDELITY:</span>
              <span className="text-cyan-400 font-bold font-mono">99.96%</span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-slate-500 text-[11px]">
            <span>Drag mouse to orbit 3D chandelier</span>
          </div>
        </div>

      </div>

    </div>
  );
};

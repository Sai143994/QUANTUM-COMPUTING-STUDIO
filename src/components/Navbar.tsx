import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Code2, 
  Share2, 
  Sliders, 
  BookOpen, 
  ShoppingBag,
  Sparkles,
  RotateCcw,
  Play,
  Globe2,
  Volume2,
  VolumeX,
  HelpCircle,
  X,
  Command,
  Network,
  Atom,
  Activity,
  Layers,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Trophy,
  Brain,
  Radio,
  Menu,
  LayoutDashboard
} from 'lucide-react';
import { isAudioMuted, setAudioMuted, playGateClickSound, playMeasurementCollapseSound } from '../utils/audio';

export type ActiveTab = 'dashboard' | 'composer' | 'algorithms' | 'transpiler' | 'chemistry' | 'entanglement' | 'cryptography' | 'qml' | 'qec' | 'pulse' | 'lab' | 'hardware' | 'outlook' | 'techmap';

export type SimLifecycleStatus = 'IDLE' | 'VALIDATING' | 'COMPILING' | 'EXECUTING' | 'MEASURING' | 'ANALYZING' | 'COMPLETE' | 'RUNNING';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  numQubits: number;
  gateCount: number;
  simStatus: SimLifecycleStatus;
  onRun: () => void;
  onReset: () => void;
  onOpenQasm: () => void;
  onOpenPython?: () => void;
  onOpenSplash?: () => void;
  onOpenQuests?: () => void;
  onShareCircuit?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  numQubits,
  gateCount,
  simStatus,
  onRun,
  onReset,
  onOpenQasm,
  onOpenPython,
  onOpenSplash,
  onOpenQuests,
  onShareCircuit
}) => {
  const [muted, setMutedState] = useState<boolean>(() => isAudioMuted());
  const [helpOpen, setHelpOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const toggleMute = () => {
    const next = !muted;
    setAudioMuted(next);
    setMutedState(next);
    if (!next) {
      playGateClickSound(800);
    }
  };

  // Keyboard shortcut listener for ? / H
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        setHelpOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleRunClick = () => {
    playMeasurementCollapseSound();
    onRun();
  };

  const handleResetClick = () => {
    playGateClickSound(350);
    onReset();
  };

  const hilbertDim = Math.pow(2, numQubits);

  return (
    <>
      <header className="h-14 border-b border-[rgba(0,229,255,0.15)] bg-[#050b11]/95 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-6 flex items-center justify-between shadow-lg">
        
        {/* Zone 1: Wordmark & Precision Telemetry */}
        <div className="flex items-center gap-3.5 shrink-0">
          <a 
            href="/" 
            onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}
            className="flex items-center gap-2.5 text-base font-bold tracking-tight text-white group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-[#09141d] border border-[rgba(0,229,255,0.3)] flex items-center justify-center text-[#00e5ff] shadow-sm shadow-[#00e5ff]/20 group-hover:border-[#00e5ff] transition-all">
              <Atom className="w-4 h-4 text-[#00e5ff] animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-[#eaf8ff] tracking-tight text-sm font-heading group-hover:text-[#00e5ff] transition-colors">
                QUANTUM 3D ENGINEERING
              </span>
              <span className="text-[9px] font-sans text-cyan-400/80 tracking-widest uppercase font-semibold">
                ADVANCED PLATFORM
              </span>
            </div>
          </a>

          {/* Real Live Technical Telemetry Strip */}
          <div className="hidden xl:flex items-center gap-2 pl-3.5 border-l border-[rgba(0,229,255,0.12)] text-xs font-sans">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#09141d] border border-[rgba(0,229,255,0.15)]">
              <span className={`w-1.5 h-1.5 rounded-full ${
                simStatus === 'COMPLETE' 
                  ? 'bg-[#00a86b]' 
                  : simStatus === 'IDLE' 
                  ? 'bg-[#00e5ff]' 
                  : 'bg-[#d6a84f] animate-ping'
              }`} />
              <span className="uppercase text-[10px] font-semibold tracking-wider text-[#eaf8ff] font-sans">{simStatus}</span>
            </span>

            <span className="text-slate-700">·</span>

            <span className="px-2 py-0.5 rounded bg-[#09141d] border border-slate-800 text-[11px] text-[#00e5ff] font-bold font-mono">
              {numQubits} QUBITS
            </span>

            <span className="text-slate-700">·</span>

            <span className="text-[11px] text-[#78909c] font-sans">
              <strong className="text-[#eaf8ff] font-mono">{gateCount}</strong> GATES
            </span>

            <span className="text-slate-700">·</span>

            <span className="text-[10px] text-[#78909c] font-sans">
              HILBERT: <span className="text-[#00e5ff] font-semibold font-mono">{hilbertDim} DIM</span>
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (100% existing tabs preserved + cutting edge additions) */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-sans font-medium text-[#78909c]">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'composer', label: 'Composer', icon: Sliders },
            { id: 'algorithms', label: 'Algorithms', icon: BookOpen },
            { id: 'transpiler', label: 'QPC Transpiler', icon: Cpu },
            { id: 'chemistry', label: 'VQE Chemistry', icon: Atom },
            { id: 'entanglement', label: 'Entanglement', icon: Share2 },
            { id: 'cryptography', label: 'QKD Crypto', icon: ShieldCheck },
            { id: 'qml', label: 'QML Studio', icon: Brain },
            { id: 'qec', label: 'QEC Logical', icon: ShieldAlert },
            { id: 'pulse', label: 'Pulse AWG', icon: Radio },
            { id: 'lab', label: 'Quantum Lab', icon: Sparkles },
            { id: 'hardware', label: 'Hardware', icon: ShoppingBag },
            { id: 'outlook', label: 'Global Outlook', icon: Globe2 },
            { id: 'techmap', label: '3D Tech Matrix', icon: Network }
          ].map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as ActiveTab)}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer relative ${
                  isActive
                    ? 'bg-[#09141d] text-[#00e5ff] border border-[rgba(0,229,255,0.4)] shadow-xs shadow-[#00e5ff]/20 font-bold'
                    : 'text-[#78909c] hover:text-[#eaf8ff] hover:bg-[#09141d]/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#00e5ff]' : 'text-[#78909c]'}`} />
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#00e5ff] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Command Actions & Utilities */}
        <div className="flex items-center gap-2">
          
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            title="Toggle Navigation Menu"
            className="lg:hidden h-8 w-8 rounded-lg border border-[rgba(0,229,255,0.3)] bg-[#09141d] text-[#00e5ff] flex items-center justify-center transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          {/* Audio Mute / Unmute Toggle */}
          <button
            onClick={toggleMute}
            title={muted ? 'Unmute Audio Feedback' : 'Mute Audio Feedback'}
            className={`h-8 w-8 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
              muted
                ? 'border-slate-800 bg-[#09141d]/50 text-slate-500 hover:text-slate-300'
                : 'border-[rgba(0,229,255,0.3)] bg-[#09141d] text-[#00e5ff] hover:border-[#00e5ff]'
            }`}
          >
            {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Keyboard Shortcuts Dialog Trigger */}
          <button
            onClick={() => setHelpOpen(true)}
            title="Keyboard Shortcuts (?)"
            className="h-8 w-8 rounded-lg border border-[rgba(0,229,255,0.15)] bg-[#09141d] hover:border-[rgba(0,229,255,0.4)] text-[#78909c] hover:text-[#eaf8ff] flex items-center justify-center transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          <span className="text-[rgba(0,229,255,0.15)]">|</span>

          {onOpenQuests && (
            <button
              onClick={onOpenQuests}
              title="Quantum Circuit Challenges & Puzzles (Earn Stars)"
              className="h-8 px-2.5 rounded-lg border border-amber-500/40 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shadow-amber-500/10"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Quests</span>
            </button>
          )}

          {onOpenSplash && (
            <button
              onClick={onOpenSplash}
              title="Open 3D Quantum Computing Experience"
              className="h-8 px-2.5 rounded-lg border border-[rgba(0,229,255,0.35)] bg-cyan-950/40 hover:bg-cyan-950/80 text-[#00e5ff] text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shadow-[#00e5ff]/20 font-bold"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00e5ff]" />
              <span className="hidden sm:inline">3D Motion</span>
            </button>
          )}

          <button
            onClick={onOpenQasm}
            title="Export OpenQASM 3.0"
            className="h-8 px-2.5 rounded-lg border border-[rgba(0,229,255,0.2)] bg-[#09141d] hover:border-[rgba(0,229,255,0.4)] text-[#eaf8ff] text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5 text-[#00e5ff]" />
            <span className="hidden sm:inline">QASM</span>
          </button>

          {onOpenPython && (
            <button
              onClick={onOpenPython}
              title="Open Python SDK & Code Exporter"
              className="h-8 px-2.5 rounded-lg border border-emerald-500/30 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shadow-emerald-500/10"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Python</span>
            </button>
          )}

          {onShareCircuit && (
            <button
              onClick={onShareCircuit}
              title="Copy 1-Click Shareable Permalink (URL Hash)"
              className="h-8 px-2.5 rounded-lg border border-cyan-500/30 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shadow-cyan-500/10"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Share</span>
            </button>
          )}

          <button
            onClick={handleResetClick}
            title="Reset State & Circuit"
            className="h-8 px-2.5 rounded-lg border border-[rgba(0,229,255,0.15)] bg-[#09141d] hover:bg-[#0b1722] text-[#78909c] hover:text-[#eaf8ff] text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Reset</span>
          </button>

          <button
            onClick={handleRunClick}
            disabled={simStatus !== 'IDLE' && simStatus !== 'COMPLETE'}
            className="h-8 px-3.5 rounded-lg bg-[#00e5ff] hover:bg-[#38bdf8] disabled:opacity-50 text-[#02060a] font-bold text-xs font-mono flex items-center gap-1.5 shadow-sm shadow-[#00e5ff]/30 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{simStatus !== 'IDLE' && simStatus !== 'COMPLETE' ? `${simStatus}…` : 'RUN'}</span>
          </button>
        </div>
      </header>

      {/* Keyboard shortcuts modal */}
      {helpOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#09141d] border border-[rgba(0,229,255,0.25)] rounded-2xl max-w-md w-full p-5 shadow-2xl font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(0,229,255,0.15)]">
              <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
                <Command className="w-4 h-4 text-[#00e5ff]" />
                <span>Keyboard Shortcuts &amp; Controls</span>
              </h3>
              <button
                onClick={() => setHelpOpen(false)}
                className="text-[#78909c] hover:text-white p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-2.5 text-xs text-[#eaf8ff]">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-[#78909c]">Run State Simulation</span>
                <kbd className="px-2 py-0.5 rounded bg-[#0b1722] border border-[rgba(0,229,255,0.3)] font-mono text-[11px] text-[#00e5ff]">R</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-[#78909c]">Reset Circuit to Ground</span>
                <kbd className="px-2 py-0.5 rounded bg-[#0b1722] border border-[rgba(0,229,255,0.3)] font-mono text-[11px] text-[#00e5ff]">Esc</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-[#78909c]">Open OpenQASM 3.0 Exporter</span>
                <kbd className="px-2 py-0.5 rounded bg-[#0b1722] border border-[rgba(0,229,255,0.3)] font-mono text-[11px] text-[#00e5ff]">Q</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-[#78909c]">Toggle Keyboard Help</span>
                <kbd className="px-2 py-0.5 rounded bg-[#0b1722] border border-[rgba(0,229,255,0.3)] font-mono text-[11px] text-[#00e5ff]">?</kbd>
              </div>
            </div>

            <button
              onClick={() => setHelpOpen(false)}
              className="w-full py-2 bg-[#00e5ff] hover:bg-[#38bdf8] text-[#02060a] text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md lg:hidden flex flex-col p-4 animate-in fade-in duration-200">
          <div className="bg-[#09141d] border border-[rgba(0,229,255,0.3)] rounded-2xl w-full p-4 shadow-2xl font-mono flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(0,229,255,0.15)] shrink-0">
              <span className="font-bold text-white text-sm flex items-center gap-2">
                <Atom className="w-4 h-4 text-[#00e5ff]" />
                Quantum Studio Modules
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 overflow-y-auto py-3">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'composer', label: 'Composer', icon: Sliders },
                { id: 'algorithms', label: 'Algorithms', icon: BookOpen },
                { id: 'transpiler', label: 'QPC Transpiler', icon: Cpu },
                { id: 'chemistry', label: 'VQE Chemistry', icon: Atom },
                { id: 'entanglement', label: 'Entanglement', icon: Share2 },
                { id: 'cryptography', label: 'QKD Crypto', icon: ShieldCheck },
                { id: 'qml', label: 'QML Studio', icon: Brain },
                { id: 'qec', label: 'QEC Logical', icon: ShieldAlert },
                { id: 'pulse', label: 'Pulse AWG', icon: Radio },
                { id: 'lab', label: 'Quantum Lab', icon: Sparkles },
                { id: 'hardware', label: 'Hardware', icon: ShoppingBag },
                { id: 'outlook', label: 'Global Outlook', icon: Globe2 },
                { id: 'techmap', label: '3D Tech Matrix', icon: Network }
              ].map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      playGateClickSound(700);
                      setActiveTab(item.id as ActiveTab);
                      setMobileMenuOpen(false);
                    }}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/20'
                        : 'bg-[#050b11] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

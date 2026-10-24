import React, { useState } from 'react';
import { 
  Trophy, 
  Star, 
  HelpCircle, 
  CheckCircle2, 
  X, 
  Sparkles, 
  ChevronRight, 
  Zap, 
  Award,
  Layers,
  Flame
} from 'lucide-react';
import { QuantumQuest } from '../data/quantum_quests';
import { GateOp, QuantumState } from '../types/quantum';
import { playMeasurementCollapseSound, playGateClickSound } from '../utils/audio';
import { useToast } from '../context/ToastContext';

interface ActiveQuestBannerProps {
  quest: QuantumQuest;
  circuit: GateOp[];
  qstate: QuantumState | null;
  onClearQuest: () => void;
  onOpenQuestModal: () => void;
  onSaveProgress: (questId: string, stars: number, bestGates: number) => void;
}

export const ActiveQuestBanner: React.FC<ActiveQuestBannerProps> = ({
  quest,
  circuit,
  qstate,
  onClearQuest,
  onOpenQuestModal,
  onSaveProgress
}) => {
  const { showToast } = useToast();
  const [showHint, setShowHint] = useState<boolean>(false);
  const [victoryModalOpen, setVictoryModalOpen] = useState<boolean>(false);
  const [awardedStars, setAwardedStars] = useState<number>(0);

  // Compute live verification state
  const totalGates = circuit.length;
  const evaluation = React.useMemo(() => {
    if (!qstate) return { passed: false, fidelity: 0 };
    if (quest.targetStatevectorValidator) {
      return quest.targetStatevectorValidator(qstate);
    }
    // Fallback: compare probability distribution
    const p = qstate.probabilities();
    let sumAbsDiff = 0;
    quest.targetProbabilities.forEach((targetP, idx) => {
      sumAbsDiff += Math.abs((p[idx] || 0) - targetP);
    });
    const fidelity = Math.max(0, 1 - sumAbsDiff / 2);
    return { passed: fidelity > 0.98, fidelity };
  }, [quest, qstate, circuit]);

  // Check forbidden gates
  const forbiddenViolation = React.useMemo(() => {
    if (!quest.forbiddenGates) return null;
    const found = circuit.find(g => quest.forbiddenGates?.includes(g.type));
    return found ? found.type : null;
  }, [quest, circuit]);

  // Compute potential star rating
  const potentialStars = React.useMemo(() => {
    if (forbiddenViolation) return 0;
    if (totalGates <= quest.maxGates3Stars) return 3;
    if (totalGates <= quest.maxGates2Stars) return 2;
    return 1;
  }, [totalGates, quest, forbiddenViolation]);

  const handleVerify = () => {
    if (forbiddenViolation) {
      showToast('Constraint Violated', 'error', `The gate ${forbiddenViolation} is forbidden in this challenge!`);
      return;
    }

    if (!evaluation.passed) {
      playGateClickSound(300);
      showToast(
        'Target Not Reached Yet',
        'info',
        `Current state fidelity is ${(evaluation.fidelity * 100).toFixed(1)}%. Keep experimenting!`
      );
      return;
    }

    // Solved!
    playMeasurementCollapseSound();
    const stars = potentialStars;
    setAwardedStars(stars);
    setVictoryModalOpen(true);
    onSaveProgress(quest.id, stars, totalGates);
    showToast(
      '🎉 Quest Solved!',
      'success',
      `You solved ${quest.title} with ${totalGates} gates and earned ${stars} stars!`
    );
  };

  const fidelityPct = Math.round(evaluation.fidelity * 100);

  return (
    <>
      <div className="w-full bg-[#0a1622] border-b border-amber-500/30 px-4 py-2 font-mono flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-md">
        {/* Left: Quest Identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-500/30">
                Quest {quest.level}
              </span>
              <span className="font-bold text-white text-xs">
                {quest.title}
              </span>
              <button
                onClick={onOpenQuestModal}
                className="text-[10px] text-cyan-400 hover:underline cursor-pointer ml-1"
              >
                (Change)
              </button>
            </div>
            <div className="text-[11px] text-slate-300">
              Objective: <span className="text-cyan-300 font-bold">{quest.objective}</span>
            </div>
          </div>
        </div>

        {/* Center: Live Fidelity Gauge & Gate Budget */}
        <div className="flex items-center gap-4">
          {/* Fidelity meter */}
          <div className="flex flex-col gap-0.5 min-w-[130px]">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Target Fidelity:</span>
              <span className={`font-bold ${fidelityPct >= 98 ? 'text-emerald-400' : 'text-cyan-300'}`}>
                {fidelityPct}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  fidelityPct >= 98 ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-cyan-400'
                }`}
                style={{ width: `${Math.min(100, fidelityPct)}%` }}
              />
            </div>
          </div>

          {/* Gate Budget */}
          <div className="flex flex-col gap-0.5 text-[11px]">
            <span className="text-slate-400 text-[10px]">Gate Budget:</span>
            <span className="font-bold text-slate-200">
              {totalGates} gates {' '}
              <span className="text-amber-400 text-[10px]">
                ({potentialStars} ⭐)
              </span>
            </span>
          </div>

          {forbiddenViolation && (
            <span className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-500/40 text-rose-300 text-[10px] font-bold">
              🚫 {forbiddenViolation} Forbidden!
            </span>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowHint(!showHint)}
            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <HelpCircle className="w-3 h-3 text-cyan-400" />
            <span>Hint</span>
          </button>

          <button
            onClick={handleVerify}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
              evaluation.passed && !forbiddenViolation
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30 animate-pulse'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verify Solution</span>
          </button>

          <button
            onClick={onClearQuest}
            title="Exit Quest Mode"
            className="p-1 text-slate-500 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Hint Drawer */}
      {showHint && (
        <div className="w-full bg-[#071018] border-b border-cyan-500/20 px-4 py-2 text-xs font-mono flex items-start justify-between gap-3 text-cyan-200/90">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">Hint: </span>
              {quest.hint}
            </div>
          </div>
          <button
            onClick={() => setShowHint(false)}
            className="text-slate-500 hover:text-white p-0.5 cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Victory Celebration Modal */}
      {victoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#09141d] border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl font-mono text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto shadow-lg shadow-amber-500/20">
              <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
            </div>

            <div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                CHALLENGE CLEARED!
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                {quest.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Mathematical statevector equivalence achieved with {totalGates} gates!
              </p>
            </div>

            {/* Stars */}
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3].map(s => (
                <Star
                  key={s}
                  className={`w-7 h-7 transition-all ${
                    s <= awardedStars
                      ? 'fill-amber-400 text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                      : 'fill-slate-800 text-slate-700'
                  }`}
                />
              ))}
            </div>

            <div className="p-3 rounded-xl bg-[#050b11] border border-slate-800 text-xs text-slate-300 space-y-1">
              <div>Fidelity: <span className="text-emerald-400 font-bold">{(evaluation.fidelity * 100).toFixed(2)}%</span></div>
              <div>Gate Count: <span className="text-white font-bold">{totalGates}</span> (Budget: ≤{quest.maxGates3Stars} for 3⭐)</div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => setVictoryModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Keep Circuit
              </button>
              <button
                onClick={() => {
                  setVictoryModalOpen(false);
                  onOpenQuestModal();
                }}
                className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 cursor-pointer"
              >
                Next Challenge →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

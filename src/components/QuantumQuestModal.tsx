import React from 'react';
import { 
  Trophy, 
  Star, 
  X, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  HelpCircle, 
  Zap, 
  RotateCcw,
  Award,
  Layers
} from 'lucide-react';
import { QUANTUM_QUESTS, QuantumQuest } from '../data/quantum_quests';
import { GateOp } from '../types/quantum';
import { playGateClickSound } from '../utils/audio';

interface QuantumQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeQuestId: string | null;
  onSelectQuest: (quest: QuantumQuest) => void;
  completedQuests: Record<string, { stars: number; bestGates: number }>;
  onResetProgress: () => void;
}

export const QuantumQuestModal: React.FC<QuantumQuestModalProps> = ({
  isOpen,
  onClose,
  activeQuestId,
  onSelectQuest,
  completedQuests,
  onResetProgress
}) => {
  if (!isOpen) return null;

  const totalStars = Object.values(completedQuests).reduce((acc, c) => acc + c.stars, 0);
  const maxPossibleStars = QUANTUM_QUESTS.length * 3;
  const completedCount = Object.keys(completedQuests).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#09141d] border border-[rgba(0,229,255,0.3)] rounded-2xl max-w-4xl w-full p-6 shadow-2xl font-mono flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[rgba(0,229,255,0.15)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sm shadow-amber-500/20">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base tracking-tight">
                  Quantum Quests &amp; Circuit Puzzle Lab
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                  {totalStars} / {maxPossibleStars} Stars
                </span>
              </div>
              <p className="text-xs text-[#78909c]">
                Hands-on interactive quantum state engineering challenges with live automated grading
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#78909c] hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Overview Bar */}
        <div className="py-3 px-4 rounded-xl bg-[#050b11] border border-slate-800 my-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-slate-500 uppercase tracking-wider text-[10px]">Challenges Cleared:</span>
              <div className="text-white font-bold">{completedCount} of {QUANTUM_QUESTS.length}</div>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="text-slate-500 uppercase tracking-wider text-[10px]">Rank:</span>
              <div className="text-cyan-400 font-bold">
                {totalStars >= 15 ? 'Quantum Master (Level IV)' :
                 totalStars >= 9 ? 'Senior Qubit Engineer (Level III)' :
                 totalStars >= 3 ? 'Quantum Apprentice (Level II)' :
                 'Novice Entangler (Level I)'}
              </div>
            </div>
          </div>

          {completedCount > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Reset all challenge stars and progress?')) {
                  onResetProgress();
                }
              }}
              className="text-[10px] text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Progress</span>
            </button>
          )}
        </div>

        {/* Quest Grid */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1">
          {QUANTUM_QUESTS.map((quest, idx) => {
            const progress = completedQuests[quest.id];
            const isCompleted = !!progress;
            const stars = progress?.stars || 0;
            const isActive = activeQuestId === quest.id;

            return (
              <div
                key={quest.id}
                className={`p-4 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-cyan-950/30 border-cyan-500 shadow-md shadow-cyan-500/10'
                    : isCompleted
                    ? 'bg-[#050b11] border-emerald-500/30 hover:border-emerald-500/50'
                    : 'bg-[#050b11] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                        Level {quest.level}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        quest.category === 'BEGINNER' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30' :
                        quest.category === 'INTERMEDIATE' ? 'bg-cyan-950/60 text-cyan-400 border-cyan-500/30' :
                        quest.category === 'ADVANCED' ? 'bg-amber-950/60 text-amber-400 border-amber-500/30' :
                        'bg-purple-950/60 text-purple-400 border-purple-500/30'
                      }`}>
                        {quest.category}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        ({quest.qubits} Qubits)
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-sm">
                      {quest.title}
                    </h4>

                    <p className="text-xs text-slate-400 max-w-xl">
                      {quest.description}
                    </p>

                    <div className="pt-1 flex flex-wrap items-center gap-3 text-[11px]">
                      <span className="text-cyan-300 font-mono">
                        Target: <span className="text-white font-bold">{quest.objective}</span>
                      </span>
                      <span className="text-slate-500">·</span>
                      <span className="text-amber-400">
                        Budget: ≤{quest.maxGates3Stars} gates (⭐⭐⭐), ≤{quest.maxGates2Stars} gates (⭐⭐)
                      </span>
                    </div>

                    {quest.forbiddenGates && quest.forbiddenGates.length > 0 && (
                      <div className="text-[10px] text-rose-400 font-semibold pt-0.5">
                        ⚠️ Restriction: {quest.forbiddenGates.join(', ')} forbidden!
                      </div>
                    )}
                  </div>

                  {/* Actions & Star Display */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3].map(s => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s <= stars
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-slate-800 text-slate-700'
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        playGateClickSound(700);
                        onSelectQuest(quest);
                        onClose();
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                        isActive
                          ? 'bg-cyan-500 text-slate-950 shadow-cyan-500/30'
                          : isCompleted
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                          : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
                      }`}
                    >
                      <span>{isActive ? 'Armed in Canvas' : isCompleted ? 'Replay Quest' : 'Start Quest'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[rgba(0,229,255,0.15)] flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Select a quest to arm it on the Circuit Composer canvas with real-time fidelity grading.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

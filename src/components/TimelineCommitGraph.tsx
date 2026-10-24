import React, { useRef, useEffect } from 'react';
import { CircuitCommit, GateOp } from '../types/quantum';
import { GitCommit, History, RotateCcw, GitBranch, ArrowLeft, ArrowRight, Play } from 'lucide-react';

interface TimelineCommitGraphProps {
  commits: CircuitCommit[];
  currentCommitId: string;
  onSelectCommit: (commit: CircuitCommit) => void;
  onCheckpoint: () => void;
  currentGatesCount: number;
}

export const TimelineCommitGraph: React.FC<TimelineCommitGraphProps> = ({
  commits,
  currentCommitId,
  onSelectCommit,
  onCheckpoint,
  currentGatesCount
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const currentIndex = commits.findIndex(c => c.id === currentCommitId);
  const activeIndex = currentIndex >= 0 ? currentIndex : commits.length - 1;

  const handleScrub = (idx: number) => {
    const target = commits[idx];
    if (target) {
      onSelectCommit(target);
    }
  };

  return (
    <div className="bg-[#050b11] border-b border-[rgba(0,229,255,0.12)] px-4 py-2 flex flex-col gap-2 select-none font-mono">
      {/* Header bar */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[#00e5ff] font-semibold">
            <History className="w-3.5 h-3.5" />
            <span className="text-[11px] uppercase tracking-wider">Circuit Evolution Timeline</span>
          </div>
          <span className="text-slate-700">·</span>
          <span className="text-[11px] text-[#78909c]">
            {commits.length} State Commit{commits.length !== 1 ? 's' : ''} (Scrub to rewind)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Step Back / Forward Buttons */}
          <button
            onClick={() => activeIndex > 0 && handleScrub(activeIndex - 1)}
            disabled={activeIndex <= 0}
            className="p-1 rounded bg-[#09141d] border border-[rgba(0,229,255,0.15)] hover:border-[#00e5ff] disabled:opacity-30 text-[#eaf8ff] text-xs transition-colors cursor-pointer"
            title="Step Back in History"
          >
            <ArrowLeft className="w-3 h-3" />
          </button>
          <span className="text-[10px] text-[#78909c]">
            {activeIndex + 1}/{commits.length}
          </span>
          <button
            onClick={() => activeIndex < commits.length - 1 && handleScrub(activeIndex + 1)}
            disabled={activeIndex >= commits.length - 1}
            className="p-1 rounded bg-[#09141d] border border-[rgba(0,229,255,0.15)] hover:border-[#00e5ff] disabled:opacity-30 text-[#eaf8ff] text-xs transition-colors cursor-pointer"
            title="Step Forward in History"
          >
            <ArrowRight className="w-3 h-3" />
          </button>

          <span className="text-slate-700">|</span>

          <button
            onClick={onCheckpoint}
            className="px-2 py-0.5 rounded bg-[#09141d] border border-[rgba(0,229,255,0.25)] hover:border-[#00e5ff] text-[#00e5ff] text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
            title="Create manual checkpoint commit"
          >
            <GitCommit className="w-3 h-3" />
            <span>Checkpoint</span>
          </button>
        </div>
      </div>

      {/* Scrubbing Rail & Commit Nodes Graph */}
      <div className="flex items-center gap-3">
        {/* Horizontal interactive timeline graph */}
        <div 
          ref={containerRef}
          className="flex-1 h-9 bg-[#09141d] rounded-lg border border-[rgba(0,229,255,0.15)] relative flex items-center px-3 overflow-x-auto overflow-y-hidden"
        >
          {/* Connector Line behind nodes */}
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800" />
          
          {/* Active progress fill */}
          {commits.length > 1 && (
            <div 
              className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-[#7c4dff] to-[#00e5ff] transition-all duration-200"
              style={{
                width: `${(activeIndex / Math.max(1, commits.length - 1)) * 90}%`
              }}
            />
          )}

          {/* Commit Nodes */}
          <div className="relative z-10 flex items-center justify-between w-full min-w-fit gap-4 py-1">
            {commits.map((commit, idx) => {
              const isActive = idx === activeIndex;
              const isPast = idx < activeIndex;
              return (
                <button
                  key={commit.id}
                  onClick={() => onSelectCommit(commit)}
                  className="group relative flex flex-col items-center cursor-pointer transition-transform hover:scale-110 shrink-0"
                  title={`${commit.label} (${commit.gates.length} gates)`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-[#00e5ff] border-white ring-2 ring-[#00e5ff]/40 shadow-sm shadow-[#00e5ff]/50'
                        : isPast
                        ? 'bg-[#7c4dff] border-[#7c4dff]/70 hover:bg-[#7c4dff]'
                        : 'bg-[#0b1722] border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#02060a] font-bold' : 'bg-white/70'}`} />
                  </div>

                  {/* Micro label */}
                  <span
                    className={`text-[9px] tracking-tight whitespace-nowrap mt-1 max-w-[70px] truncate ${
                      isActive ? 'text-[#00e5ff] font-bold' : 'text-[#78909c] group-hover:text-[#eaf8ff]'
                    }`}
                  >
                    {commit.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current State Info readout */}
        {commits[activeIndex] && (
          <div className="hidden lg:flex items-center gap-2 bg-[#09141d] px-2.5 py-1 rounded-lg border border-[rgba(0,229,255,0.15)] text-[11px] shrink-0">
            <span className="text-[#78909c]">Rev:</span>
            <span className="text-[#00e5ff] font-semibold">{commits[activeIndex].label}</span>
            <span className="text-slate-700">·</span>
            <span className="text-[#eaf8ff]">{commits[activeIndex].gates.length} Gates</span>
            <span className="text-slate-700">·</span>
            <span className="text-[#d6a84f]">{commits[activeIndex].numQubits} Q</span>
          </div>
        )}
      </div>
    </div>
  );
};

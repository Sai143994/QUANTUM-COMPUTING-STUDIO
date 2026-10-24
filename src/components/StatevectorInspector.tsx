import React, { useState } from 'react';
import { QuantumState, C, GateOp, NoiseChannel } from '../types/quantum';
import { BarChart3, Binary, Activity, Terminal, Flame, Maximize2, Minimize2 } from 'lucide-react';
import { DecoherenceHeatmap } from './DecoherenceHeatmap';

interface StatevectorInspectorProps {
  numQubits: number;
  qstate: QuantumState | null;
  measurements: Record<number, number>;
  shots: number;
  logLines: Array<{ msg: string; type: string; ts: number }>;
  circuit?: GateOp[];
  noiseRate?: number;
  noiseModel?: NoiseChannel;
  simStep?: number;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const StatevectorInspector: React.FC<StatevectorInspectorProps> = ({
  numQubits,
  qstate,
  measurements,
  shots,
  logLines,
  circuit = [],
  noiseRate = 0,
  noiseModel = 'depolarizing',
  simStep = 0,
  isExpanded,
  onToggleExpand
}) => {
  const [tab, setTab] = useState<'probs' | 'amplitudes' | 'decoherence' | 'measure' | 'log'>('probs');

  const probs = qstate ? qstate.probabilities() : [];
  const sv = qstate ? qstate.sv : [];
  const entropy = qstate ? qstate.entropy() : 0;

  // Filter significant amplitudes
  const nonZeroAmplitudes = sv
    .map((amp, idx) => ({ idx, amp, prob: probs[idx] || 0 }))
    .filter(item => item.prob > 1e-6);

  // Measurement totals
  const totalMeasuredShots = Object.values(measurements).reduce((a, b) => a + b, 0);
  const sortedMeasurements = Object.entries(measurements)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 16);

  return (
    <div className="flex flex-col h-full bg-[#050b11] border-t border-[rgba(0,229,255,0.15)] text-[#eaf8ff] font-mono">
      {/* Sub-header tabs */}
      <div className="flex items-center justify-between border-b border-[rgba(0,229,255,0.12)] px-4 bg-[#09141d]/70 shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto text-xs">
          <button
            onClick={() => setTab('probs')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              tab === 'probs'
                ? 'border-[#00e5ff] text-[#00e5ff] font-bold'
                : 'border-transparent text-[#78909c] hover:text-[#eaf8ff]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Probabilities</span>
          </button>

          <button
            onClick={() => setTab('amplitudes')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              tab === 'amplitudes'
                ? 'border-[#00e5ff] text-[#00e5ff] font-bold'
                : 'border-transparent text-[#78909c] hover:text-[#eaf8ff]'
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            <span>Statevector Amplitudes</span>
          </button>

          <button
            onClick={() => setTab('decoherence')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              tab === 'decoherence'
                ? 'border-[#d6a84f] text-[#d6a84f] font-bold'
                : 'border-transparent text-[#78909c] hover:text-[#eaf8ff]'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-[#d6a84f]" />
            <span>Decoherence Heatmap</span>
            {noiseRate > 0 && (
              <span className="text-[10px] px-1 py-0.2 rounded bg-amber-950/80 text-[#d6a84f] border border-amber-800/40">
                {noiseRate}%
              </span>
            )}
          </button>

          <button
            onClick={() => setTab('measure')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              tab === 'measure'
                ? 'border-[#00e5ff] text-[#00e5ff] font-bold'
                : 'border-transparent text-[#78909c] hover:text-[#eaf8ff]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Measurement Sampling</span>
          </button>

          <button
            onClick={() => setTab('log')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              tab === 'log'
                ? 'border-[#00e5ff] text-[#00e5ff] font-bold'
                : 'border-transparent text-[#78909c] hover:text-[#eaf8ff]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Console Log</span>
          </button>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-[11px] text-[#78909c] hidden sm:flex items-center gap-2">
            <span>Entropy:</span>
            <span className="text-[#d6a84f] font-semibold">{entropy.toFixed(3)}b</span>
          </div>

          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="p-1 rounded text-[#78909c] hover:text-white hover:bg-[#09141d] transition-colors cursor-pointer"
              title={isExpanded ? "Collapse Inspector" : "Expand Inspector Height"}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Tab Panels */}
      <div className={`flex-1 overflow-y-auto ${tab === 'decoherence' ? 'p-0' : 'p-4'}`}>
        {tab === 'decoherence' && (
          <div className="h-full min-h-[220px]">
            <DecoherenceHeatmap
              numQubits={numQubits}
              qstate={qstate}
              circuit={circuit}
              noiseRate={noiseRate}
              noiseModel={noiseModel}
              simStep={simStep}
            />
          </div>
        )}

        {tab === 'probs' && (
          <div className="space-y-1.5 max-w-3xl">
            {probs.slice(0, Math.min(probs.length, 16)).map((p, idx) => {
              const label = idx.toString(2).padStart(numQubits, '0');
              const pct = (p * 100).toFixed(1);
              return (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  <span className="text-[#00e5ff] w-16 text-right font-medium">|{label}⟩</span>
                  <div className="flex-1 h-3.5 bg-[#09141d] rounded overflow-hidden border border-[rgba(0,229,255,0.15)]">
                    <div
                      className="h-full bg-gradient-to-r from-[#7c4dff] to-[#00e5ff] transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[#eaf8ff] w-14 text-right tabular-nums">{pct}%</span>
                </div>
              );
            })}
            {probs.length > 16 && (
              <div className="text-[11px] text-[#78909c] pt-2">
                + {probs.length - 16} additional computational basis states suppressed for brevity
              </div>
            )}
          </div>
        )}

        {tab === 'amplitudes' && (
          <div className="max-w-4xl space-y-1">
            <div className="grid grid-cols-4 text-[11px] font-semibold text-[#78909c] pb-1.5 border-b border-[rgba(0,229,255,0.15)]">
              <span>Basis State</span>
              <span>Complex Amplitude (a + bi)</span>
              <span>Modulus |amp|</span>
              <span>Phase Angle φ</span>
            </div>
            {nonZeroAmplitudes.length === 0 ? (
              <div className="text-xs text-[#78909c] py-4">No amplitudes with probability &gt; 1e-6</div>
            ) : (
              nonZeroAmplitudes.map(item => {
                const label = item.idx.toString(2).padStart(numQubits, '0');
                const [r, i] = item.amp;
                const sign = i >= 0 ? '+' : '-';
                const phase = (Math.atan2(i, r) * 180) / Math.PI;
                return (
                  <div key={item.idx} className="grid grid-cols-4 text-xs text-[#eaf8ff] py-1 border-b border-slate-900/60">
                    <span className="text-[#00e5ff] font-semibold">|{label}⟩</span>
                    <span className="text-[#7c4dff]">
                      {r.toFixed(4)} {sign} {Math.abs(i).toFixed(4)}i
                    </span>
                    <span className="text-white font-medium">{Math.sqrt(r * r + i * i).toFixed(4)}</span>
                    <span className="text-[#d6a84f]">{phase.toFixed(1)}°</span>
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab === 'measure' && (
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center justify-between text-xs pb-1 border-b border-[rgba(0,229,255,0.15)]">
              <span className="text-[#78909c]">Shot Sampling Statistics (Total: {totalMeasuredShots} shots)</span>
              <span className="text-[#00e5ff] font-medium">{shots} shots / run</span>
            </div>
            {sortedMeasurements.length === 0 ? (
              <div className="text-xs text-[#78909c] py-4">
                No measurement events yet. Press RUN or click measurement gates in composer.
              </div>
            ) : (
              <div className="space-y-1.5">
                {sortedMeasurements.map(([idxStr, count]) => {
                  const idx = parseInt(idxStr, 10);
                  const label = idx.toString(2).padStart(numQubits, '0');
                  const pct = totalMeasuredShots > 0 ? ((count / totalMeasuredShots) * 100).toFixed(1) : '0';
                  return (
                    <div key={idx} className="flex items-center gap-3 text-xs">
                      <span className="text-[#00e5ff] w-16 text-right font-medium">|{label}⟩</span>
                      <div className="flex-1 h-3.5 bg-[#09141d] rounded overflow-hidden border border-[rgba(0,229,255,0.15)]">
                        <div
                          className="h-full bg-gradient-to-r from-[#00a86b] to-[#00e5ff] transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-white w-20 text-right tabular-nums">
                        {count} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'log' && (
          <div className="space-y-1 text-xs">
            {logLines.map((l, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-slate-600 text-[10px]">
                  {new Date(l.ts).toLocaleTimeString()}
                </span>
                <span className={
                  l.type === 'accent' ? 'text-[#00e5ff] font-semibold' :
                  l.type === 'warn' ? 'text-[#d6a84f]' :
                  l.type === 'err' ? 'text-rose-400' :
                  'text-[#78909c]'
                }>
                  {l.msg}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

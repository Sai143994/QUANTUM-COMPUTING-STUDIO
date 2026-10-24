import React, { useState, useMemo } from 'react';
import { Radio, Activity, Clock, Sliders, Info, ShieldAlert } from 'lucide-react';
import { PulseScheduleSlot } from './TranspilerTypes';

interface PulseScheduleGanttProps {
  numQubits: number;
  transpiledGates: Array<{ step: number; type: string; qubits: number[]; isSwap?: boolean; duration_ns: number }>;
  dynamicalDecouplingEnabled: boolean;
}

export const PulseScheduleGantt: React.FC<PulseScheduleGanttProps> = ({
  numQubits,
  transpiledGates,
  dynamicalDecouplingEnabled
}) => {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  // Generate real-time pulse schedule slots across RF channels
  const { channels, scheduleSlots, totalDuration_ns } = useMemo(() => {
    const slots: PulseScheduleSlot[] = [];
    const channelList: Array<{ id: string; name: string; type: 'drive' | 'control' | 'readout' | 'decoupling' }> = [];

    // Create drive channels for each active logical qubit
    for (let q = 0; q < Math.min(5, numQubits); q++) {
      channelList.push({ id: `d${q}`, name: `Drive d[${q}] (f₀₁)`, type: 'drive' });
    }

    // Create cross-resonance control channels
    for (let q = 0; q < Math.min(4, numQubits - 1); q++) {
      channelList.push({ id: `u${q}_${q + 1}`, name: `Coupler u[${q},${q + 1}] (ECR/CZ)`, type: 'control' });
    }

    // Readout channel
    channelList.push({ id: `m0`, name: `Readout m[0..${numQubits - 1}] (Dispersive)`, type: 'readout' });

    let currentTimeline_ns = 0;

    transpiledGates.slice(0, 14).forEach((op, opIdx) => {
      const q = op.qubits[0] ?? 0;
      const is2Q = op.qubits.length > 1;

      if (is2Q) {
        const qCtrl = op.qubits[0];
        const qTgt = op.qubits[1];
        const cId = `u${Math.min(qCtrl, qTgt)}_${Math.max(qCtrl, qTgt)}`;

        // CR pulse slot
        slots.push({
          channel: channelList.find(c => c.id === cId) ? cId : 'd0',
          channelType: 'control',
          qubit: qCtrl,
          gateType: op.type,
          start_ns: currentTimeline_ns,
          duration_ns: op.duration_ns || 120,
          amplitude: 0.85,
          phase_rad: 0
        });

        currentTimeline_ns += (op.duration_ns || 120) + 15;
      } else {
        const isRZ = op.type.startsWith('RZ') || op.type === 'Z' || op.type === 'T' || op.type === 'S';
        const dur = isRZ ? 0 : 35; // Virtual Z has 0ns duration!

        slots.push({
          channel: `d${Math.min(4, q)}`,
          channelType: 'drive',
          qubit: q,
          gateType: op.type,
          start_ns: currentTimeline_ns,
          duration_ns: dur,
          amplitude: isRZ ? 0 : 0.45,
          phase_rad: 0,
          isVirtualZ: isRZ
        });

        currentTimeline_ns += dur + (isRZ ? 0 : 10);
      }
    });

    // If Dynamical Decoupling enabled, schedule XY4 Hahn echo pulses during idle periods
    if (dynamicalDecouplingEnabled) {
      for (let q = 0; q < Math.min(3, numQubits); q++) {
        slots.push({
          channel: `d${q}`,
          channelType: 'decoupling',
          qubit: q,
          gateType: 'DD_Echo(X)',
          start_ns: 60,
          duration_ns: 25,
          amplitude: 0.5,
          phase_rad: 0
        });
        slots.push({
          channel: `d${q}`,
          channelType: 'decoupling',
          qubit: q,
          gateType: 'DD_Echo(Y)',
          start_ns: 140,
          duration_ns: 25,
          amplitude: 0.5,
          phase_rad: Math.PI / 2
        });
      }
    }

    // Final readout pulses
    slots.push({
      channel: 'm0',
      channelType: 'readout',
      qubit: 0,
      gateType: 'Readout(300ns)',
      start_ns: currentTimeline_ns,
      duration_ns: 300,
      amplitude: 0.95,
      phase_rad: 0
    });

    currentTimeline_ns += 320;

    return {
      channels: channelList,
      scheduleSlots: slots,
      totalDuration_ns: currentTimeline_ns
    };
  }, [numQubits, transpiledGates, dynamicalDecouplingEnabled]);

  return (
    <div className="space-y-4 font-mono text-xs">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#09141d] border border-cyan-800/40">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#00e5ff]" />
          <div>
            <h4 className="font-bold text-white text-xs">OpenPulse Microwave AWG Timing Schedule (Gantt Chart)</h4>
            <p className="text-[10px] text-[#78909c]">
              Nanosecond-resolved execution timeline of microwave control pulses across physical drive, cross-resonance, and readout lines
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span className="text-slate-400">Total QPU Schedule: <strong className="text-cyan-300">{totalDuration_ns} ns</strong></span>
          <span className="text-slate-400">Channels: <strong className="text-white">{channels.length} RF Lines</strong></span>
        </div>
      </div>

      {/* Gantt Timeline Screen */}
      <div className="p-4 rounded-2xl bg-[#02050b] border border-slate-800 overflow-x-auto">
        <div className="min-w-[650px] space-y-3">
          
          {/* Timeline Time Header */}
          <div className="flex items-center text-[10px] text-slate-500 pb-2 border-b border-slate-850">
            <div className="w-44 font-bold text-slate-400">RF Channel Line</div>
            <div className="flex-1 flex justify-between px-2">
              <span>0 ns</span>
              <span>{Math.round(totalDuration_ns * 0.25)} ns</span>
              <span>{Math.round(totalDuration_ns * 0.5)} ns</span>
              <span>{Math.round(totalDuration_ns * 0.75)} ns</span>
              <span>{totalDuration_ns} ns</span>
            </div>
          </div>

          {/* Channel Rows */}
          {channels.map(ch => {
            const chSlots = scheduleSlots.filter(s => s.channel === ch.id);
            return (
              <div key={ch.id} className="flex items-center group">
                <div className="w-44 text-[11px] font-bold text-slate-300 truncate pr-2 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    ch.type === 'drive' ? 'bg-cyan-400' : ch.type === 'control' ? 'bg-purple-400' : 'bg-amber-400'
                  }`} />
                  <span>{ch.name}</span>
                </div>

                {/* Track lane */}
                <div className="flex-1 h-9 rounded-lg bg-[#09141d] border border-slate-850/80 relative flex items-center px-1 overflow-hidden">
                  {chSlots.map((slot, sIdx) => {
                    const leftPct = Math.min(95, Math.max(0, (slot.start_ns / totalDuration_ns) * 100));
                    const widthPct = Math.max(3, (slot.duration_ns / totalDuration_ns) * 100);

                    return (
                      <div
                        key={sIdx}
                        style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                        className={`absolute h-7 rounded px-1.5 flex items-center justify-center text-[9px] font-bold truncate transition-transform hover:scale-105 cursor-pointer shadow-sm ${
                          slot.isVirtualZ
                            ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-300 border-dashed'
                            : slot.channelType === 'decoupling'
                            ? 'bg-amber-950/80 border border-amber-500 text-amber-300'
                            : slot.channelType === 'control'
                            ? 'bg-purple-950/90 border border-purple-500 text-purple-200'
                            : 'bg-cyan-950/90 border border-cyan-500 text-cyan-200'
                        }`}
                        title={`${slot.gateType} | Start: ${slot.start_ns}ns | Dur: ${slot.duration_ns}ns`}
                      >
                        {slot.gateType}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

        </div>
      </div>

      {/* Legend & Scientific Telemetry */}
      <div className="p-3 border-t border-slate-800 bg-[#070e17] rounded-xl flex flex-wrap items-center justify-between text-[11px] text-[#78909c]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded bg-cyan-950 border border-cyan-500" />
            <span className="text-white">Single-Qubit Drive Pulse (SX / X)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded bg-purple-950 border border-purple-500" />
            <span className="text-purple-300">Cross-Resonance Flat-Top (ECR / CZ)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded bg-emerald-950 border border-emerald-500 border-dashed" />
            <span className="text-emerald-300">Virtual Z (0ns Frame Shift)</span>
          </span>
          {dynamicalDecouplingEnabled && (
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-2 rounded bg-amber-950 border border-amber-500" />
              <span className="text-amber-300">DD Echo (Hahn / XY4)</span>
            </span>
          )}
        </div>

        <span className="text-slate-500 text-[10px]">
          AWG Resolution: 0.25 ns (4.0 GSa/s DAC)
        </span>
      </div>

    </div>
  );
};

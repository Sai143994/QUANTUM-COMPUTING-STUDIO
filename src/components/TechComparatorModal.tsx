import React, { useState } from 'react';
import { 
  X, 
  ArrowRight, 
  Cpu, 
  Zap, 
  Clock, 
  Activity, 
  Thermometer, 
  Layers, 
  ShieldCheck, 
  Sparkles,
  Scale
} from 'lucide-react';
import { playGateClickSound } from '../utils/audio';
import { TECH_NODES, TechNode } from './QuantumTechnologyMap3D';

interface TechComparatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultId1?: string;
  defaultId2?: string;
}

export const TechComparatorModal: React.FC<TechComparatorModalProps> = ({
  isOpen,
  onClose,
  defaultId1 = 'superconducting',
  defaultId2 = 'photonic'
}) => {
  const [tech1Id, setTech1Id] = useState<string>(defaultId1);
  const [tech2Id, setTech2Id] = useState<string>(defaultId2);

  if (!isOpen) return null;

  const node1 = TECH_NODES.find(n => n.id === tech1Id) || TECH_NODES[0];
  const node2 = TECH_NODES.find(n => n.id === tech2Id) || TECH_NODES[3];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[90vh] bg-[#070a12] border border-cyan-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden font-mono text-xs">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 bg-[#09141d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Quantum Computing Architecture Comparator</h3>
              <p className="text-[11px] text-slate-400">Side-by-side industrial benchmark across physical modalities</p>
            </div>
          </div>

          <button
            onClick={() => { playGateClickSound(600); onClose(); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Comparison Dropdowns */}
        <div className="p-4 border-b border-slate-800/80 bg-[#050b11] grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Architecture A:</span>
            <select
              value={tech1Id}
              onChange={(e) => { playGateClickSound(650); setTech1Id(e.target.value); }}
              className="w-full p-2 rounded-lg bg-[#09141d] border border-slate-700 text-cyan-300 font-bold outline-none cursor-pointer"
            >
              {TECH_NODES.map(node => (
                <option key={node.id} value={node.id} className="bg-[#050b11]">
                  {node.name} (TRL {node.trl})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Architecture B:</span>
            <select
              value={tech2Id}
              onChange={(e) => { playGateClickSound(650); setTech2Id(e.target.value); }}
              className="w-full p-2 rounded-lg bg-[#09141d] border border-slate-700 text-purple-300 font-bold outline-none cursor-pointer"
            >
              {TECH_NODES.map(node => (
                <option key={node.id} value={node.id} className="bg-[#050b11]">
                  {node.name} (TRL {node.trl})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison Table Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="p-2 w-1/4">Evaluation Criterion</th>
                <th className="p-2 w-3/8 text-cyan-300 font-bold">{node1.shortName}</th>
                <th className="p-2 w-3/8 text-purple-300 font-bold">{node2.shortName}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-[11px]">
              
              <tr>
                <td className="p-2.5 font-bold text-slate-400">Technology Readiness</td>
                <td className="p-2.5 text-cyan-300 font-bold">TRL {node1.trl} / 9</td>
                <td className="p-2.5 text-purple-300 font-bold">TRL {node2.trl} / 9</td>
              </tr>

              <tr>
                <td className="p-2.5 font-bold text-slate-400">Era &amp; Horizon</td>
                <td className="p-2.5 text-slate-200 uppercase">{node1.era.replace('_', ' ')}</td>
                <td className="p-2.5 text-slate-200 uppercase">{node2.era.replace('_', ' ')}</td>
              </tr>

              <tr>
                <td className="p-2.5 font-bold text-slate-400">Physical Principle</td>
                <td className="p-2.5 text-slate-300 leading-relaxed font-sans">{node1.physicsPrinciple}</td>
                <td className="p-2.5 text-slate-300 leading-relaxed font-sans">{node2.physicsPrinciple}</td>
              </tr>

              <tr>
                <td className="p-2.5 font-bold text-slate-400">Present Benchmark Record</td>
                <td className="p-2.5 text-slate-300 leading-relaxed font-sans">{node1.presentState}</td>
                <td className="p-2.5 text-slate-300 leading-relaxed font-sans">{node2.presentState}</td>
              </tr>

              <tr>
                <td className="p-2.5 font-bold text-slate-400">Next-Gen Scaling Milestone</td>
                <td className="p-2.5 text-emerald-400 font-bold font-sans">{node1.futureMilestones}</td>
                <td className="p-2.5 text-purple-300 font-bold font-sans">{node2.futureMilestones}</td>
              </tr>

              <tr>
                <td className="p-2.5 font-bold text-slate-400">Active Bottlenecks</td>
                <td className="p-2.5 text-amber-300">
                  <ul className="list-disc pl-4 space-y-0.5">
                    {node1.bottlenecks.map((b, idx) => <li key={idx}>{b}</li>)}
                  </ul>
                </td>
                <td className="p-2.5 text-amber-300">
                  <ul className="list-disc pl-4 space-y-0.5">
                    {node2.bottlenecks.map((b, idx) => <li key={idx}>{b}</li>)}
                  </ul>
                </td>
              </tr>

              <tr>
                <td className="p-2.5 font-bold text-slate-400">Key Industry Leaders</td>
                <td className="p-2.5 text-cyan-200">{node1.leaders.join(', ')}</td>
                <td className="p-2.5 text-purple-200">{node2.leaders.join(', ')}</td>
              </tr>

            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-[#09141d] flex justify-between items-center text-[10px] text-slate-400">
          <span>Benchmarked against IEEE Quantum &amp; NIST FIPS Physical Criteria</span>
          <button
            onClick={() => { playGateClickSound(600); onClose(); }}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold cursor-pointer"
          >
            Close Comparator
          </button>
        </div>

      </div>
    </div>
  );
};

import React, { useMemo, useState } from 'react';
import { GateOp } from '../../types/quantum';
import { GitBranch, Layers, Zap, Info, CheckCircle2 } from 'lucide-react';

interface CircuitDagViewerProps {
  circuit: GateOp[];
  numQubits: number;
}

interface DagNode {
  id: string;
  gateIndex: number;
  type: string;
  qubits: number[];
  layer: number;
  isFrontLayer: boolean;
  isCriticalPath: boolean;
  predecessors: string[];
  successors: string[];
}

export const CircuitDagViewer: React.FC<CircuitDagViewerProps> = ({ circuit, numQubits }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Build DAG from circuit gate ops
  const { nodes, maxLayer, criticalPathNodes } = useMemo(() => {
    const lastQubitOp: Record<number, string> = {};
    const nodeMap: Record<string, DagNode> = {};
    const qubitLayer: Record<number, number> = {};

    for (let q = 0; q < numQubits; q++) {
      qubitLayer[q] = 0;
    }

    // Pass 1: create nodes & dependencies
    circuit.forEach((g, idx) => {
      const gId = `g_${idx}`;
      const involved: number[] = [];
      if (g.control !== undefined) involved.push(g.control);
      if (g.target !== undefined && !involved.includes(g.target)) involved.push(g.target);
      if (g.qubit !== undefined && !involved.includes(g.qubit)) involved.push(g.qubit);
      if (g.q1 !== undefined && !involved.includes(g.q1)) involved.push(g.q1);
      if (g.q2 !== undefined && !involved.includes(g.q2)) involved.push(g.q2);

      const preds: string[] = [];
      let layer = 0;
      involved.forEach(q => {
        if (lastQubitOp[q]) {
          if (!preds.includes(lastQubitOp[q])) preds.push(lastQubitOp[q]);
        }
        layer = Math.max(layer, qubitLayer[q] || 0);
      });

      nodeMap[gId] = {
        id: gId,
        gateIndex: idx,
        type: g.type,
        qubits: involved,
        layer,
        isFrontLayer: preds.length === 0,
        isCriticalPath: false,
        predecessors: preds,
        successors: []
      };

      involved.forEach(q => {
        lastQubitOp[q] = gId;
        qubitLayer[q] = layer + 1;
      });
    });

    // Populate successors
    Object.values(nodeMap).forEach(n => {
      n.predecessors.forEach(pId => {
        if (nodeMap[pId] && !nodeMap[pId].successors.includes(n.id)) {
          nodeMap[pId].successors.push(n.id);
        }
      });
    });

    // Identify critical path: longest path in DAG
    const maxL = Math.max(0, ...Object.values(nodeMap).map(n => n.layer));
    const critSet = new Set<string>();

    const traceBack = (nId: string) => {
      critSet.add(nId);
      const node = nodeMap[nId];
      if (!node) return;
      let maxPred: DagNode | null = null;
      node.predecessors.forEach(pId => {
        const p = nodeMap[pId];
        if (!maxPred || p.layer > maxPred.layer) {
          maxPred = p;
        }
      });
      if (maxPred) traceBack((maxPred as DagNode).id);
    };

    const terminalNodes = Object.values(nodeMap).filter(n => n.layer === maxL);
    terminalNodes.forEach(t => traceBack(t.id));

    Object.values(nodeMap).forEach(n => {
      n.isCriticalPath = critSet.has(n.id);
    });

    return {
      nodes: Object.values(nodeMap),
      maxLayer: maxL,
      criticalPathNodes: critSet
    };
  }, [circuit, numQubits]);

  const selectedNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) : null;

  return (
    <div className="flex flex-col gap-4 font-mono text-xs">
      {/* HUD Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#09141d] border border-cyan-800/40">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-[#00e5ff]" />
          <div>
            <h4 className="font-bold text-white text-xs">DAGCircuit Causal Graph Representation</h4>
            <p className="text-[10px] text-[#78909c]">
              Directed Acyclic Graph identifying independent parallel layers, front-layer readiness, and critical execution paths
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300 font-bold">Front Layer ({nodes.filter(n => n.isFrontLayer).length} Ready)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-amber-300 font-bold">Critical Path ({criticalPathNodes.size} Ops)</span>
          </span>
          <span className="text-slate-400">Total Layers: <strong className="text-white">{maxLayer + 1}</strong></span>
        </div>
      </div>

      {/* DAG Visualization Canvas / Node Flow */}
      <div className="p-4 rounded-2xl bg-[#02050b] border border-slate-800 overflow-x-auto min-h-[300px]">
        {nodes.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            Circuit is currently empty. Add gates in Composer or load a preset above to inspect DAG graph structure.
          </div>
        ) : (
          <div className="flex items-start gap-8 min-w-max pb-4">
            {Array.from({ length: maxLayer + 1 }).map((_, lIdx) => {
              const layerNodes = nodes.filter(n => n.layer === lIdx);
              return (
                <div key={lIdx} className="flex flex-col items-center gap-3">
                  <div className="text-[10px] font-bold text-slate-500 uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                    Layer {lIdx}
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {layerNodes.map(node => {
                      const isSelected = selectedNodeId === node.id;
                      const isTwoQubit = node.qubits.length > 1;
                      return (
                        <div
                          key={node.id}
                          onClick={() => setSelectedNodeId(node.id)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all w-32 shadow-sm ${
                            isSelected
                              ? 'bg-cyan-950/70 border-[#00e5ff] text-white shadow-md shadow-cyan-500/20 scale-105'
                              : node.isCriticalPath
                              ? 'bg-amber-950/30 border-amber-600/60 text-amber-200 hover:border-amber-400'
                              : node.isFrontLayer
                              ? 'bg-emerald-950/30 border-emerald-600/50 text-emerald-200 hover:border-emerald-400'
                              : isTwoQubit
                              ? 'bg-[#0b1b2b] border-cyan-800/40 text-cyan-200 hover:border-cyan-600'
                              : 'bg-[#09141d] border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-slate-400">#{node.gateIndex}</span>
                            {node.isFrontLayer && (
                              <span className="px-1 rounded bg-emerald-500 text-slate-950 font-bold text-[8px]">
                                READY
                              </span>
                            )}
                            {node.isCriticalPath && !node.isFrontLayer && (
                              <span className="px-1 rounded bg-amber-500 text-slate-950 font-bold text-[8px]">
                                CRIT
                              </span>
                            )}
                          </div>
                          <div className="font-bold text-sm text-white mt-0.5 flex items-center justify-between">
                            <span>{node.type}</span>
                            <span className="text-[10px] text-cyan-400 font-normal">
                              {node.qubits.length > 1
                                ? `q[${node.qubits[0]}], q[${node.qubits[1]}]`
                                : `q[${node.qubits[0]}]`}
                            </span>
                          </div>
                          <div className="text-[9px] text-slate-400 mt-1 flex justify-between">
                            <span>In: {node.predecessors.length}</span>
                            <span>Out: {node.successors.length}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Node Details Bar */}
      {selectedNode && (
        <div className="p-3 rounded-xl bg-[#09141d] border border-cyan-800/50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00e5ff]" />
            <span className="text-white font-bold">Selected Gate #{selectedNode.gateIndex} ({selectedNode.type}):</span>
            <span className="text-cyan-300">
              Qubits: {selectedNode.qubits.map(q => `q[${q}]`).join(', ')}
            </span>
            <span className="text-slate-400">· Layer: {selectedNode.layer}</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-slate-400">
              Dependencies ({selectedNode.predecessors.length}):{' '}
              <strong className="text-amber-300">
                {selectedNode.predecessors.map(p => `#${nodes.find(n => n.id === p)?.gateIndex}`).join(', ') || 'None (Front Layer)'}
              </strong>
            </span>
            <span className="text-slate-400">
              Unlocks ({selectedNode.successors.length}):{' '}
              <strong className="text-emerald-300">
                {selectedNode.successors.map(s => `#${nodes.find(n => n.id === s)?.gateIndex}`).join(', ') || 'Terminal'}
              </strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

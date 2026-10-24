import React, { useState, useMemo } from 'react';
import { 
  GLOBAL_MILESTONES, 
  MARKETPLACE_VENDORS, 
  MarketplaceVendor, 
  calculateEffectiveDepth 
} from '../data/hardware';
import { 
  ShoppingBag, 
  Globe2, 
  SlidersHorizontal, 
  Sparkles, 
  Calculator, 
  FileText, 
  Check, 
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Cpu,
  Radio,
  Layers,
  Flame,
  Activity,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Network
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { playGateClickSound } from '../utils/audio';
import { QpuFleetTelemetry } from './hardware/QpuFleetTelemetry';
import { QubitModalityFabInspector } from './hardware/QubitModalityFabInspector';
import { CryoThermalBudgetLab } from './hardware/CryoThermalBudgetLab';
import { CryoCMOSAndInterconnectsLab } from './hardware/CryoCMOSAndInterconnectsLab';
import { QuantumHardwareAnalytics } from './hardware/QuantumHardwareAnalytics';

interface HardwareMarketplaceProps {
  currentQubits: number;
  circuitGateCount: number;
}

type HardwareTab = 'fleet' | 'analytics' | 'modality_fab' | 'cryo_cmos' | 'cryo_budget' | 'procurement';

export const HardwareMarketplace: React.FC<HardwareMarketplaceProps> = ({
  currentQubits,
  circuitGateCount
}) => {
  const { showToast } = useToast();
  
  // Professional 5-Tier Hardware Engineering Workspace Navigation
  const [activeTab, setActiveTab] = useState<HardwareTab>('fleet');

  // Procurement sub-states
  const [techFilter, setTechFilter] = useState<string>('all');
  const [deployFilter, setDeployFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<string>('qubits-desc');
  const [rfqVendor, setRfqVendor] = useState<MarketplaceVendor | null>(null);
  const [tcoVendor, setTcoVendor] = useState<MarketplaceVendor | null>(null);
  const [tcoYears, setTcoYears] = useState<number>(3);
  const [tcoMonthlyHours, setTcoMonthlyHours] = useState<number>(40);

  // Filter and sort vendor list
  const filteredVendors = useMemo(() => {
    let list = MARKETPLACE_VENDORS.filter(v => {
      if (techFilter !== 'all' && v.tech !== techFilter) return false;
      if (deployFilter === 'cloud' && !v.deploy.includes('cloud')) return false;
      if (deployFilter === 'onprem' && !v.deploy.includes('onprem')) return false;
      return true;
    });

    if (sortOption === 'qubits-desc') list.sort((a, b) => b.qubits - a.qubits);
    else if (sortOption === 'fidelity-desc') list.sort((a, b) => (b.fidelity2q ?? 0) - (a.fidelity2q ?? 0));
    else if (sortOption === 'price-asc') list.sort((a, b) => (a.priceMin ?? 99) - (b.priceMin ?? 99));
    else if (sortOption === 'lead-asc') list.sort((a, b) => a.leadWeeks - b.leadWeeks);

    return list;
  }, [techFilter, deployFilter, sortOption]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#07090e] font-sans">
      
      {/* 1. Header Toolbar */}
      <div className="px-6 py-4 border-b border-slate-800 bg-[#09141d] flex flex-wrap items-center justify-between gap-4 font-mono text-xs shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-500/20">
            <Cpu className="w-6 h-6 text-[#00e5ff] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm text-white">Quantum Hardware &amp; Foundry Engineering Suite</h2>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-[#00e5ff] border border-cyan-800 text-[10px] font-bold">
                ENTERPRISE QPU BENCHMARK
              </span>
            </div>
            <p className="text-[11px] text-[#78909c]">
              Industrial QPU fleet telemetry, cleanroom fabrication diagnostics, dilution refrigeration budgets &amp; procurement exchange
            </p>
          </div>
        </div>

        {/* Live Composer Target Badge */}
        <div className="flex items-center gap-2.5 bg-[#050b11] px-3.5 py-2 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400">Target Circuit:</span>
          <span className="text-[#00e5ff] font-bold">{currentQubits} Qubits</span>
          <span className="text-slate-600">·</span>
          <span className="text-purple-300 font-bold">{circuitGateCount} Gates</span>
        </div>
      </div>

      {/* 2. Primary 4-Tab Industrial Workspace Navigation */}
      <div className="px-6 py-2 border-b border-slate-800/80 bg-[#060c14] flex flex-wrap items-center justify-between gap-3 font-mono text-xs shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'fleet' as const, label: 'QPU Fleet Operations & Calibration', icon: Radio, count: '156 Qubits' },
            { id: 'analytics' as const, label: 'Quantum Hardware Analytics', icon: Activity, count: 'Real-Time' },
            { id: 'modality_fab' as const, label: 'Physical Modality & Cleanroom Fab', icon: Layers, count: '6 Modalities' },
            { id: 'cryo_cmos' as const, label: 'Cryo-CMOS & Quantum Interconnects', icon: Network, count: 'Million-Qubit' },
            { id: 'cryo_budget' as const, label: 'Cryogenics & Thermal Budget Lab', icon: Flame, count: '15 mK Floor' },
            { id: 'procurement' as const, label: 'Commercial Registry & TCO Procurement', icon: ShoppingBag, count: '8 Vendors' }
          ].map(tab => {
            const Icon = tab.icon;
            const isCur = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playGateClickSound(600);
                  setActiveTab(tab.id);
                }}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  isCur
                    ? 'bg-[#00e5ff] text-[#02060a] shadow-xs shadow-[#00e5ff]/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
                  isCur ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-900 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>IEEE Quantum Standards Compliant</span>
        </div>
      </div>

      {/* 3. Scientific Workspace Viewport Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* TAB 1: QPU Fleet Operations & Live Telemetry Grid */}
          {activeTab === 'fleet' && (
            <QpuFleetTelemetry />
          )}

          {/* TAB: Quantum Hardware Analytics (Real-Time Decoherence & Fidelity) */}
          {activeTab === 'analytics' && (
            <QuantumHardwareAnalytics />
          )}

          {/* TAB 2: Physical Modality & Cleanroom Fab Process Inspector */}
          {activeTab === 'modality_fab' && (
            <QubitModalityFabInspector />
          )}

          {/* TAB 3: Cryo-CMOS ASICs & Quantum Interconnect Architecture */}
          {activeTab === 'cryo_cmos' && (
            <CryoCMOSAndInterconnectsLab />
          )}

          {/* TAB 4: Cryogenic Infrastructure & Dilution Thermal Budget Lab */}
          {activeTab === 'cryo_budget' && (
            <CryoThermalBudgetLab />
          )}

          {/* TAB 5: Commercial Hardware Registry & Enterprise Procurement */}
          {activeTab === 'procurement' && (
            <div className="space-y-6 font-mono text-xs">
              
              {/* Quantum Hardware Analytics Launch Panel */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-[#09141d] to-purple-950/70 border border-cyan-500/40 flex flex-wrap items-center justify-between gap-4 shadow-lg shadow-cyan-950/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                    <Activity className="w-5 h-5 text-[#00e5ff] animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-xs">Real-Time Quantum Hardware Analytics &amp; Decoherence Engine</h4>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[9px] font-bold">
                        ACTIVE BENCHMARK
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Simulate live T₁ relaxation waveforms, T₂* Ramsey fringes, and 2Q gate fidelities comparing Transmon vs Ion Trap vs Neutral Atom vs Silicon Spin
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { playGateClickSound(700); setActiveTab('analytics'); }}
                  className="px-4 py-2 rounded-xl bg-[#00e5ff] hover:bg-[#38bdf8] text-[#02060a] font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-cyan-500/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Launch Analytics Simulator</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              
              {/* Global Milestones Section */}
              <section className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Globe2 className="w-4 h-4 text-cyan-400" />
                      <span>Empirical Quantum Advantage Records (Peer-Reviewed Platforms)</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Standardized physical benchmarks from premier quantum research institutions across the US, China, Japan, and the EU
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {GLOBAL_MILESTONES.map(item => (
                    <div key={item.name} className="p-4 rounded-xl bg-[#050b11] border border-slate-800 space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-cyan-300">{item.countryCode}</span>
                          <span className="text-[10px] text-slate-500 uppercase">{item.flag}</span>
                        </div>
                        <h4 className="font-bold text-sm text-white mt-1">{item.name}</h4>
                        <div className="text-[10px] text-slate-400 line-clamp-1">{item.org}</div>
                        <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">{item.desc}</p>
                      </div>

                      <div className="space-y-1 pt-2 border-t border-slate-800 font-mono text-[10px]">
                        {item.stats.slice(0, 3).map(([label, val]) => (
                          <div key={label} className="flex justify-between text-slate-400">
                            <span>{label}:</span>
                            <span className="text-slate-200 font-bold">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Commercial Procurement Registry */}
              <section className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-cyan-400" />
                      <span>Commercial Quantum Hardware Procurement &amp; Exchange</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Compare multi-vendor qubit architectures, evaluate effective circuit depth budgets, and run TCO procurement models
                    </p>
                  </div>

                  {/* Filter Toolbar */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-[#050b11] px-2.5 py-1 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[10px]">Tech:</span>
                      <select
                        value={techFilter}
                        onChange={e => setTechFilter(e.target.value)}
                        className="bg-transparent text-cyan-300 outline-none cursor-pointer text-[11px]"
                      >
                        <option value="all" className="bg-[#050b11]">All Technologies</option>
                        <option value="superconducting" className="bg-[#050b11]">Superconducting</option>
                        <option value="trapped-ion" className="bg-[#050b11]">Trapped-Ion</option>
                        <option value="neutral-atom" className="bg-[#050b11]">Neutral-Atom</option>
                        <option value="photonic" className="bg-[#050b11]">Photonic (GBS)</option>
                        <option value="annealing" className="bg-[#050b11]">Quantum Annealing</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5 bg-[#050b11] px-2.5 py-1 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[10px]">Deploy:</span>
                      <select
                        value={deployFilter}
                        onChange={e => setDeployFilter(e.target.value)}
                        className="bg-transparent text-cyan-300 outline-none cursor-pointer text-[11px]"
                      >
                        <option value="all" className="bg-[#050b11]">Any Deployment</option>
                        <option value="cloud" className="bg-[#050b11]">Cloud Access</option>
                        <option value="onprem" className="bg-[#050b11]">On-Premises Dedicated</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5 bg-[#050b11] px-2.5 py-1 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[10px]">Sort:</span>
                      <select
                        value={sortOption}
                        onChange={e => setSortOption(e.target.value)}
                        className="bg-transparent text-cyan-300 outline-none cursor-pointer text-[11px]"
                      >
                        <option value="qubits-desc" className="bg-[#050b11]">Qubit Count (High → Low)</option>
                        <option value="fidelity-desc" className="bg-[#050b11]">2Q Fidelity (High → Low)</option>
                        <option value="price-asc" className="bg-[#050b11]">Price (Low → High)</option>
                        <option value="lead-asc" className="bg-[#050b11]">Lead Time (Fastest)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Vendors Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredVendors.map(vendor => {
                    const maxDepth = calculateEffectiveDepth(vendor);
                    const isCompatible = vendor.qubits >= currentQubits;
                    return (
                      <div
                        key={vendor.id}
                        className="p-4 rounded-xl bg-[#050b11] border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{vendor.flag}</span>
                              <div>
                                <h4 className="font-bold text-sm text-white">{vendor.name}</h4>
                                <div className="text-[10px] text-slate-400 capitalize">
                                  {vendor.tech.replace('-', ' ')} · {vendor.country}
                                </div>
                              </div>
                            </div>

                            <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                              isCompatible
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                                : 'bg-rose-950/80 text-rose-300 border border-rose-800'
                            }`}>
                              {isCompatible ? '✓ Compatible' : 'Incompatible'}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">{vendor.desc}</p>
                        </div>

                        {/* Specifications Matrix */}
                        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-[#02050b] border border-slate-850 text-xs">
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase">Qubits/Modes</span>
                            <div className="font-bold text-cyan-300">{vendor.qubits.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase">2Q Fidelity</span>
                            <div className="font-bold text-slate-200">
                              {vendor.fidelity2q ? `${vendor.fidelity2q}%` : 'Sampling Device'}
                            </div>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase">Effective Depth</span>
                            <div className="font-bold text-amber-300">
                              {maxDepth ? `~${maxDepth} Gates` : 'N/A'}
                            </div>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase">Lead Time</span>
                            <div className="font-bold text-slate-200">{vendor.leadWeeks} Weeks</div>
                          </div>
                        </div>

                        {/* Pricing & RFQ Actions */}
                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                          <div>
                            <div className="text-[9px] text-slate-500">Procurement Pricing</div>
                            <div className="font-bold text-xs text-white">
                              {vendor.priceMin ? `$${vendor.priceMin}M – $${vendor.priceMax}M` : 'Contact for Quote'}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => { playGateClickSound(600); setTcoVendor(vendor); }}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                              title="TCO Breakeven Calculator"
                            >
                              TCO
                            </button>
                            <button
                              onClick={() => { playGateClickSound(700); setRfqVendor(vendor); }}
                              className="px-3 py-1 rounded bg-[#00e5ff] hover:bg-[#38bdf8] text-[#02060a] text-xs font-bold cursor-pointer"
                            >
                              Request Quote
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

            </div>
          )}

        </div>
      </div>

      {/* RFQ Quote Generator Modal */}
      {rfqVendor && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#050b11] border border-cyan-800/60 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <FileText className="w-4 h-4 text-[#00e5ff]" />
                <span>Request for Quotation (RFQ) Formal Dossier</span>
              </div>
              <button
                onClick={() => setRfqVendor(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-slate-300">
              <div className="p-3 rounded-xl bg-[#02050b] border border-slate-850 space-y-1">
                <div><strong>Target Vendor:</strong> {rfqVendor.name} ({rfqVendor.country})</div>
                <div><strong>Architecture:</strong> {rfqVendor.tech} ({rfqVendor.qubits} Qubits)</div>
                <div><strong>Baseline Capital Cost:</strong> {rfqVendor.priceMin ? `$${rfqVendor.priceMin}M USD` : 'Negotiable'}</div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400">Research Group / Enterprise Entity:</label>
                <input
                  type="text"
                  defaultValue="Quantum Computing Laboratory & Foundry"
                  className="w-full px-3 py-1.5 rounded-lg bg-[#02050b] border border-slate-800 text-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400">Workload &amp; Circuit Specifications:</label>
                <textarea
                  rows={3}
                  defaultValue={`Deploying an active ${currentQubits}-qubit circuit target with ${circuitGateCount} gates requiring multi-qubit entangling operations.`}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#02050b] border border-slate-800 text-white outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  const rfqText = `[QUANTUM HARDWARE PROCUREMENT RFQ]\nTarget Vendor: ${rfqVendor.name}\nArchitecture: ${rfqVendor.tech}\nQubits: ${rfqVendor.qubits}\nActive Circuit: ${currentQubits} Qubits, ${circuitGateCount} Gates\nDeployment: ${rfqVendor.deploy.join(', ')}\nGenerated via Quantum Studio Procurement Hub.`;
                  navigator.clipboard?.writeText(rfqText).catch(() => {});
                  showToast('RFQ Package Generated', 'success', `Formal procurement dossier for ${rfqVendor.name} copied to clipboard.`);
                  setRfqVendor(null);
                }}
                className="px-4 py-2 rounded-lg bg-[#00e5ff] hover:bg-[#38bdf8] text-[#02060a] font-bold text-xs cursor-pointer shadow-md shadow-cyan-500/20"
              >
                Generate &amp; Copy RFQ Package
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TCO Breakeven Calculator Modal */}
      {tcoVendor && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#050b11] border border-cyan-800/60 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Calculator className="w-4 h-4 text-[#00e5ff]" />
                <span>Total Cost of Ownership (TCO) Financial Model</span>
              </div>
              <button
                onClick={() => setTcoVendor(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-slate-300">
                Comparing On-Premises Dedicated Purchase vs Cloud Consumption for <strong>{tcoVendor.name}</strong>:
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#02050b] border border-slate-800 space-y-1">
                  <span className="text-slate-500">Project Horizon:</span>
                  <div className="text-base font-bold text-white">{tcoYears} Years</div>
                  <input
                    type="range"
                    min="1"
                    max="7"
                    value={tcoYears}
                    onChange={e => setTcoYears(+e.target.value)}
                    className="w-full accent-cyan-400"
                  />
                </div>
                <div className="p-3 rounded-xl bg-[#02050b] border border-slate-800 space-y-1">
                  <span className="text-slate-500">Monthly Usage:</span>
                  <div className="text-base font-bold text-cyan-300">{tcoMonthlyHours} Hours/mo</div>
                  <input
                    type="range"
                    min="10"
                    max="160"
                    value={tcoMonthlyHours}
                    onChange={e => setTcoMonthlyHours(+e.target.value)}
                    className="w-full accent-cyan-400"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#02050b] border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Cloud Subscription Cost:</span>
                  <span className="text-cyan-300 font-bold">
                    ${(((tcoVendor.cloudRate || 250) * tcoMonthlyHours * 12 * tcoYears) / 1000).toFixed(0)}k USD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Estimated Capital Acquisition (CapEx):</span>
                  <span className="text-purple-300 font-bold">
                    {tcoVendor.priceMin ? `$${tcoVendor.priceMin}M USD` : 'Quote Only'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setTcoVendor(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

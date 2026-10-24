import React, { useState } from 'react';
import { 
  GLOBAL_COUNTRY_INITIATIVES, 
  FUTURE_QUANTUM_HORIZONS, 
  INTERNATIONAL_TREATIES_AND_DEBATES, 
  CountryInitiative, 
  FutureHorizon 
} from '../data/quantum_outlook';
import { IndustryIntelligenceDashboard } from './IndustryIntelligenceDashboard';
import { DailyQuantumBriefingView } from './DailyQuantumBriefingView';
import { GlobalSupplyChainChokepoints } from './outlook/GlobalSupplyChainChokepoints';
import { QuantumAlliancesMatrix } from './outlook/QuantumAlliancesMatrix';
import { PqcMigrationAuditor } from './outlook/PqcMigrationAuditor';
import { QuantumArchitectureAndHorizons } from './outlook/QuantumArchitectureAndHorizons';
import { playGateClickSound } from '../utils/audio';
import { 
  Globe2, 
  Calendar,
  Layers, 
  ShieldAlert, 
  Clock, 
  Sparkles, 
  BookOpen, 
  Cpu, 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  Building2, 
  Sliders, 
  Lock, 
  Zap, 
  ArrowUpRight,
  TrendingUp,
  Activity,
  FileText
} from 'lucide-react';

export const GlobalQuantumOutlook: React.FC = () => {
  const [subTab, setSubTab] = useState<'daily' | 'geopolitics' | 'chokepoints' | 'alliances' | 'pqc_audit' | 'intelligence' | 'horizons' | 'debates' | 'mosca'>('daily');
  const [regionFilter, setRegionFilter] = useState<'All' | 'Americas' | 'Europe' | 'Asia-Pacific'>('All');
  const [selectedCountryId, setSelectedCountryId] = useState<string>('usa');
  
  // Perspective toggle for Everyone vs Developer/Specialist
  const [audienceMode, setAudienceMode] = useState<'everyone' | 'technical'>('everyone');

  // Mosca's Theorem Calculator State
  const [shelfLifeX, setShelfLifeX] = useState<number>(15); // X: Data shelf life in years
  const [migrationTimeY, setMigrationTimeY] = useState<number>(5); // Y: Migration duration in years
  const [threatHorizonZ, setThreatHorizonZ] = useState<number>(8); // Z: Years until CRQC

  const filteredCountries = GLOBAL_COUNTRY_INITIATIVES.filter(c => {
    if (regionFilter === 'All') return true;
    return c.region === regionFilter;
  });

  const selectedCountry = GLOBAL_COUNTRY_INITIATIVES.find(c => c.id === selectedCountryId) || GLOBAL_COUNTRY_INITIATIVES[0];

  // Mosca Theorem Calculation: X + Y > Z means VULNERABLE TODAY
  const moscaSum = shelfLifeX + migrationTimeY;
  const isVulnerable = moscaSum > threatHorizonZ;
  const riskDeficit = moscaSum - threatHorizonZ;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#07090e] text-slate-200">
      {/* Top Outlook Header & Sub-Navigation */}
      <div className="border-b border-slate-800 bg-slate-900/60 px-4 py-3 shrink-0 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-sm shadow-cyan-500/20">
            <Globe2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Global Quantum Outlook &amp; Technology Horizons</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/40 font-mono">
                Present &amp; Future (2025–2045+)
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              National strategies, geopolitical alliances, international export controls, and future technological milestones explained for everyone.
            </p>
          </div>
        </div>

        {/* Audience Mode Switcher (Everyone vs Deep Technical) */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <span className="text-slate-500 text-[11px] pl-2 hidden sm:inline">Explanation:</span>
          <button
            onClick={() => setAudienceMode('everyone')}
            className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
              audienceMode === 'everyone'
                ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3 h-3" />
            <span>Accessible to Everyone</span>
          </button>

          <button
            onClick={() => setAudienceMode('technical')}
            className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
              audienceMode === 'technical'
                ? 'bg-slate-800 text-cyan-300 font-semibold border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3 h-3" />
            <span>Developer &amp; Policy Depth</span>
          </button>
        </div>
      </div>

      {/* Secondary Tab Bar */}
      <div className="px-4 py-2 border-b border-slate-800/80 bg-slate-950/70 flex items-center gap-2 overflow-x-auto text-xs shrink-0 font-mono">
        <button
          onClick={() => { playGateClickSound(600); setSubTab('daily'); }}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            subTab === 'daily'
              ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30 shadow-xs font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          <span>Daily Quantum Topic</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
        </button>

        <button
          onClick={() => { playGateClickSound(650); setSubTab('geopolitics'); }}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            subTab === 'geopolitics'
              ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30 shadow-xs font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Country Initiatives &amp; Strategies ({GLOBAL_COUNTRY_INITIATIVES.length})</span>
        </button>

        <button
          onClick={() => { playGateClickSound(650); setSubTab('chokepoints'); }}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            subTab === 'chokepoints'
              ? 'bg-slate-800 text-amber-300 border border-amber-500/40 shadow-xs font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>Supply Chain Chokepoints (³He, ²⁸Si)</span>
        </button>

        <button
          onClick={() => { playGateClickSound(650); setSubTab('alliances'); }}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            subTab === 'alliances'
              ? 'bg-slate-800 text-indigo-300 border border-indigo-500/40 shadow-xs font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Scale className="w-3.5 h-3.5 text-indigo-400" />
          <span>Defense Alliances (AUKUS / EuroQCI / Quad)</span>
        </button>

        <button
          onClick={() => { playGateClickSound(650); setSubTab('pqc_audit'); }}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            subTab === 'pqc_audit'
              ? 'bg-slate-800 text-rose-300 border border-rose-500/40 shadow-xs font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-rose-400" />
          <span>NIST CNSA 2.0 PQC Auditor</span>
        </button>

        <button
          onClick={() => { playGateClickSound(600); setSubTab('intelligence'); }}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            subTab === 'intelligence'
              ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30 shadow-xs font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Industry Intelligence</span>
        </button>

        <button
          onClick={() => { playGateClickSound(600); setSubTab('horizons'); }}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            subTab === 'horizons'
              ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30 shadow-xs font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Architecture &amp; Horizons</span>
        </button>

        <button
          onClick={() => { playGateClickSound(600); setSubTab('debates'); }}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            subTab === 'debates'
              ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30 shadow-xs font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Scale className="w-3.5 h-3.5 text-indigo-400" />
          <span>International Debates</span>
        </button>

        <button
          onClick={() => { playGateClickSound(600); setSubTab('mosca'); }}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            subTab === 'mosca'
              ? 'bg-slate-800 text-rose-300 border border-rose-500/30 shadow-xs font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-rose-400" />
          <span>&quot;Q-Day&quot; &amp; Mosca Theorem</span>
        </button>
      </div>

      {/* Main Tab Panels */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {/* TAB 0: Daily Quantum Topic of the Day */}
        {subTab === 'daily' && (
          <DailyQuantumBriefingView />
        )}

        {/* TAB: Supply Chain Chokepoints */}
        {subTab === 'chokepoints' && (
          <GlobalSupplyChainChokepoints />
        )}

        {/* TAB: Strategic Treaties & Alliances */}
        {subTab === 'alliances' && (
          <QuantumAlliancesMatrix />
        )}

        {/* TAB: NIST CNSA 2.0 PQC Migration Auditor */}
        {subTab === 'pqc_audit' && (
          <PqcMigrationAuditor />
        )}

        {/* TAB 1: Country Initiatives & Geopolitics */}
        {subTab === 'geopolitics' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Country Selector & Regional Filters */}
            <div className="lg:col-span-4 space-y-3">
              {/* Region Filter Buttons */}
              <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                {(['All', 'Americas', 'Europe', 'Asia-Pacific'] as const).map(r => (
                  <button
                    key={r}
                    onClick={() => setRegionFilter(r)}
                    className={`flex-1 py-1 text-center rounded transition-colors cursor-pointer text-[11px] ${
                      regionFilter === r
                        ? 'bg-slate-800 text-cyan-300 font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Country Cards List */}
              <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
                {filteredCountries.map(c => {
                  const isSelected = c.id === selectedCountryId;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCountryId(c.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900/90 border-cyan-500/60 shadow-xs'
                          : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/40 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{c.flag}</span>
                          <span className="font-bold text-xs text-white">{c.country}</span>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-cyan-400">
                          ${c.fundingUsdBillions}B USD
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-1 font-mono">
                        {c.initiativeName}
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-500">
                        <span>PQC: {c.pqcTransitionDeadline.split(' ')[0]}</span>
                        <span className="text-cyan-400 flex items-center gap-0.5">
                          Inspect <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Selected Country Deep Dive */}
            <div className="lg:col-span-8 space-y-4">
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
                {/* Nation Header Banner */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedCountry.flag}</span>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <span>{selectedCountry.country}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-normal">
                          {selectedCountry.region}
                        </span>
                      </h3>
                      <div className="text-xs font-mono text-cyan-400 mt-0.5">
                        {selectedCountry.initiativeName} (Enacted {selectedCountry.enactedYear})
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-mono text-slate-400">Committed Public Funding</div>
                    <div className="text-lg font-bold font-mono text-emerald-400">
                      ${selectedCountry.fundingUsdBillions.toFixed(2)} Billion USD
                    </div>
                  </div>
                </div>

                {/* Explanation Section (Dynamic by audience mode) */}
                <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      {audienceMode === 'everyone' ? 'How to Understand This Country’s Quantum Plan' : 'Technical & Geostrategic Breakdown'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {audienceMode === 'everyone' ? selectedCountry.headlineSummary : selectedCountry.technicalDetails}
                  </p>
                </div>

                {/* Strategic Pillars Badges */}
                <div className="space-y-1.5">
                  <div className="text-xs font-mono text-slate-400">Core National Pillars:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCountry.strategicPillars.map((p, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded bg-slate-800/70 border border-slate-700/60 text-[11px] font-mono text-slate-300 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                        <span>{p}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Flagship Programs */}
                <div className="space-y-2">
                  <div className="text-xs font-mono text-slate-400">National Flagship Labs &amp; Programs:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedCountry.flagshipPrograms.map((prog, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs font-mono">
                        <div className="font-bold text-cyan-300">{prog.name}</div>
                        <div className="text-slate-400 text-[11px] mt-0.5">{prog.org}</div>
                        <div className="text-slate-500 text-[10px] mt-1">Focus: {prog.focus}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Geopolitical & Export Policy Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                      <Scale className="w-3.5 h-3.5" />
                      <span>Export Control &amp; Sanctions Stance</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {selectedCountry.exportControlStatus}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-300">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Post-Quantum Transition Deadline</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                      {selectedCountry.pqcTransitionDeadline}
                    </p>
                  </div>
                </div>

                {/* Key Domestic Debates */}
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                  <div className="text-xs font-mono font-semibold text-slate-300">Current Hot Debates in This Country:</div>
                  <ul className="space-y-1">
                    {selectedCountry.keyDebates.map((d, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                        <span className="text-amber-400 shrink-0 mt-0.5">›</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Real-time Industry Intelligence Dashboard */}
        {subTab === 'intelligence' && (
          <IndustryIntelligenceDashboard />
        )}

        {/* TAB 2: Quantum Technology Architecture & Horizons */}
        {subTab === 'horizons' && (
          <QuantumArchitectureAndHorizons audienceMode={audienceMode} />
        )}

        {/* TAB 3: International Debates & Treaties */}
        {subTab === 'debates' && (
          <div className="space-y-6">
            <div className="max-w-3xl space-y-1">
              <h3 className="text-base font-bold text-white">
                Global Country Discussions &amp; Treaty Battlegrounds
              </h3>
              <p className="text-xs text-slate-400">
                The four central geopolitical discussions shaping international negotiations, tech treaties, export sanctions, and cyber defense agreements.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INTERNATIONAL_TREATIES_AND_DEBATES.map((deb, idx) => (
                <div key={idx} className="p-5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
                        Topic #{idx + 1}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white">{deb.topic}</h4>

                    <div className="text-[11px] font-mono text-cyan-400 flex flex-wrap gap-1">
                      <span className="text-slate-500">Key Alliances:</span>
                      {deb.alliancesInvolved.join(' · ')}
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs space-y-2">
                      <div className="text-slate-300 leading-relaxed">
                        <strong className="text-slate-200">The Core Friction:</strong> {deb.coreIssue}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-900/40 text-xs space-y-1">
                      <div className="text-cyan-400 font-semibold text-[11px] flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        <span>For Everyone (In Simple Terms):</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        {deb.forEveryoneSummary}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 text-xs space-y-1">
                      <div className="text-amber-400 font-semibold text-[11px] flex items-center gap-1">
                        <Cpu className="w-3 h-3" />
                        <span>Engineering &amp; Policy Insight:</span>
                      </div>
                      <p className="text-slate-400 leading-relaxed font-mono text-[11px]">
                        {deb.developerInsight}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Q-Day Threat & Mosca Theorem Calculator */}
        {subTab === 'mosca' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-rose-400" />
                <span>The &quot;Q-Day&quot; Quantum Threat &amp; Mosca&apos;s Theorem Calculator</span>
              </h3>
              <p className="text-xs text-slate-400">
                Dr. Michele Mosca (University of Waterloo) formulated the foundational theorem determining when an organization or government is already in the danger zone from quantum cryptanalysis.
              </p>
            </div>

            {/* Formula Card */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 font-mono text-xs space-y-2">
              <div className="text-amber-300 font-bold text-sm">
                Mosca&apos;s Theorem: If (X + Y &gt; Z), you are already too late.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-400 text-[11px] pt-1">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <strong className="text-cyan-300">X (Shelf Life):</strong> Years your confidential data must remain secure.
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <strong className="text-cyan-300">Y (Migration Time):</strong> Years required to re-engineer infrastructure to PQC.
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <strong className="text-rose-300">Z (Time to Q-Day):</strong> Years until a Cryptographically Relevant Quantum Computer exists.
                </div>
              </div>
            </div>

            {/* Interactive Calculator */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-xl border border-slate-800 bg-slate-900/40">
              {/* Sliders */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300">X — Data Shelf-Life:</span>
                    <span className="text-cyan-400 font-bold">{shelfLifeX} Years</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={shelfLifeX}
                    onChange={(e) => setShelfLifeX(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                  <div className="text-[10px] text-slate-500 font-mono">
                    Medical records: 20 yrs · Bank records: 10 yrs · Defense: 30 yrs
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300">Y — Migration Overhaul Time:</span>
                    <span className="text-cyan-400 font-bold">{migrationTimeY} Years</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={migrationTimeY}
                    onChange={(e) => setMigrationTimeY(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                  <div className="text-[10px] text-slate-500 font-mono">
                    Typical enterprise PKI / hardware security module migration: 4 to 8 years
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300">Z — Estimated Years Until Q-Day (CRQC):</span>
                    <span className="text-rose-400 font-bold">{threatHorizonZ} Years</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="20"
                    value={threatHorizonZ}
                    onChange={(e) => setThreatHorizonZ(Number(e.target.value))}
                    className="w-full accent-rose-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                  <div className="text-[10px] text-slate-500 font-mono">
                    Consensus estimate among NSA, GCHQ, and researchers: ~6 to 10 years (2031–2035)
                  </div>
                </div>
              </div>

              {/* Verdict Result Card */}
              <div className={`p-5 rounded-xl border flex flex-col justify-between ${
                isVulnerable
                  ? 'bg-rose-950/30 border-rose-800/80 text-rose-200'
                  : 'bg-emerald-950/30 border-emerald-800/80 text-emerald-200'
              }`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span>STATUS AUDIT:</span>
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      isVulnerable ? 'bg-rose-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
                    }`}>
                      {isVulnerable ? 'CRITICAL VULNERABILITY' : 'COMPLIANT MARGIN'}
                    </span>
                  </div>

                  <div className="font-mono text-2xl font-bold">
                    X + Y = {moscaSum} Years vs Z = {threatHorizonZ} Years
                  </div>

                  <p className="text-xs leading-relaxed">
                    {isVulnerable ? (
                      <>
                        <strong>Your communications are ALREADY compromised today by Harvest-Now-Decrypt-Later (HNDL).</strong> Adversaries intercepting your encrypted traffic right now will have cracked it {riskDeficit} years before your data loses its confidentiality value.
                      </>
                    ) : (
                      <>
                        <strong>Your transition window is currently positive.</strong> You have a {Math.abs(riskDeficit)}-year safety margin to complete PQC deployment before a Cryptographically Relevant Quantum Computer arrives.
                      </>
                    )}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 space-y-1.5 text-xs font-mono">
                  <div className="font-bold text-slate-300">Mandated PQC Algorithms to Implement:</div>
                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                      ML-KEM-768 (Kyber Encryption)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                      ML-DSA-65 (Dilithium Signatures)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                      SLH-DSA (Stateful Hash Signatures)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

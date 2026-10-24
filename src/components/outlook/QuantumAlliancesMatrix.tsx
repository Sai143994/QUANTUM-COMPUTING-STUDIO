import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Globe2, 
  Scale, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  ChevronRight,
  Lock,
  Zap
} from 'lucide-react';
import { playGateClickSound } from '../../utils/audio';

export interface AllianceProfile {
  id: string;
  name: string;
  acronym: string;
  members: string[];
  formationYear: number;
  strategicFocus: string;
  defenseSecurityMandate: string;
  exportControlAlignment: string;
  flagshipInitiative: string;
  keyChallenges: string;
}

export const ALLIANCES_DATA: AllianceProfile[] = [
  {
    id: 'aukus',
    name: 'AUKUS Trilateral Defense Partnership (Pillar II)',
    acronym: 'AUKUS Pillar II',
    members: ['United States', 'United Kingdom', 'Australia'],
    formationYear: 2021,
    strategicFocus: 'Undersea Quantum Sensing, GPS-Denied PNT (Positioning, Navigation & Timing), and Cryptanalytic Resilience',
    defenseSecurityMandate: 'Joint operational integration of atomic gravimeters, quantum magnetometers for submarine detection, and quantum-resistant military communications.',
    exportControlAlignment: 'International Traffic in Arms Regulations (ITAR) exemptions and reciprocal defense trade treaties between Washington, London, and Canberra.',
    flagshipInitiative: 'AUKUS Quantum Positioning Trials: Deploying atomic interferometric gyroscopes on naval surface combatants and nuclear submarines.',
    keyChallenges: 'Reconciling strict US ITAR regulatory export regimes with fast-moving Australian and British commercial quantum startups.'
  },
  {
    id: 'euroqci',
    name: 'European Quantum Communication Infrastructure',
    acronym: 'EuroQCI',
    members: ['27 European Union Member States', 'European Space Agency (ESA)'],
    formationYear: 2019,
    strategicFocus: 'Continental Sovereign Quantum Key Distribution (QKD) & European Quantum Internet Mesh',
    defenseSecurityMandate: 'Shielding European governmental critical infrastructure, energy grids, and diplomatic communications against foreign quantum interception.',
    exportControlAlignment: 'EU Dual-Use Regulation (EU 2021/821) harmonizing export restrictions on quantum computers with >34 physical qubits.',
    flagshipInitiative: 'Eagle-1 Satellite & SAGA: LEO quantum key distribution satellites cross-linked with 10,000 km of secure terrestrial fiber optic cables.',
    keyChallenges: 'Balancing pan-European sovereignty with industrial participation quotas among member states with varying quantum R&D maturity.'
  },
  {
    id: 'quad',
    name: 'Quadrilateral Security Dialogue Quantum Working Group',
    acronym: 'Quad Quantum',
    members: ['United States', 'Japan', 'India', 'Australia'],
    formationYear: 2021,
    strategicFocus: 'Supply Chain Diversification, Semiconductor Fab Resilience, and International Standards Harmonization',
    defenseSecurityMandate: 'Countering authoritarian quantum dominance by securing critical raw material supply chains (³He, ²⁸Si) and post-quantum cryptography standards.',
    exportControlAlignment: 'Coordinated multilateral investment screening and critical mineral supply security agreements.',
    flagshipInitiative: 'Quad Quantum Standards Taskforce: Aligning telecommunications and financial infrastructure to NIST FIPS 203/204 PQC standards.',
    keyChallenges: 'Integrating India’s massive domestic National Quantum Mission with established US-Japan commercial foundry supply chains.'
  },
  {
    id: 'wassenaar',
    name: 'Wassenaar Arrangement Multilateral Export Control Regime',
    acronym: 'Wassenaar Regime',
    members: ['42 Participating States (US, UK, Japan, Germany, France, South Korea, etc.)'],
    formationYear: 1996,
    strategicFocus: 'Multilateral Controls on Dual-Use Conventional Arms & High-Technology Goods',
    defenseSecurityMandate: 'Preventing destabilizing regional military accumulations of quantum cryptanalysis and quantum sensor intelligence platforms.',
    exportControlAlignment: 'Category 4 (Computers) & Category 3 (Electronics): Establishes technical metric thresholds beyond which quantum systems require national export licenses.',
    flagshipInitiative: 'Criterion 4A004: Universal restrictions on quantum processors with error rates < 10⁻³ and sub-10 mK dilution refrigerators with cooling power > 15 μW at 15 mK.',
    keyChallenges: 'Requires unanimous consensus among 42 member states; Russia is a formal participant, complicating consensus updates and prompting unilateral allied controls.'
  }
];

export const QuantumAlliancesMatrix: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>('aukus');

  const activeAlliance = ALLIANCES_DATA.find(a => a.id === selectedId) || ALLIANCES_DATA[0];

  return (
    <div className="space-y-6 font-mono text-xs">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#09141d] border border-cyan-800/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-500/50 flex items-center justify-center text-indigo-400">
            <Scale className="w-5 h-5 text-indigo-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">Geopolitical Treaties, Alliances &amp; Export Control Regimes</h3>
              <span className="px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] font-bold">
                MULTILATERAL FRAMEWORKS
              </span>
            </div>
            <p className="text-[11px] text-[#78909c]">
              Strategic defense agreements (AUKUS, EuroQCI, Quad) and Wassenaar dual-use export control criteria governing global quantum technology
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#050b11] px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-400">Coalition Frameworks:</span>
          <span className="text-white font-bold">{ALLIANCES_DATA.length} Key Treaties</span>
        </div>
      </div>

      {/* 2. Alliances Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {ALLIANCES_DATA.map(item => {
          const isSelected = item.id === selectedId;
          return (
            <button
              key={item.id}
              onClick={() => {
                playGateClickSound(650);
                setSelectedId(item.id);
              }}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'bg-gradient-to-r from-indigo-950/90 to-blue-950/90 border-indigo-400 shadow-md shadow-indigo-500/10'
                  : 'bg-[#050b11] border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800">
                    Est. {item.formationYear}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">
                    {item.members.length} Entities
                  </span>
                </div>

                <h4 className="font-bold text-sm text-white mt-2">{item.acronym}</h4>
                <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{item.name}</div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex justify-between items-center">
                <span className="line-clamp-1 text-slate-400">{item.members.slice(0, 2).join(', ')}...</span>
                <span className="text-indigo-400 flex items-center gap-0.5 shrink-0 ml-1">
                  Inspect <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Deep-Dive Alliance Card */}
      <div className="p-5 rounded-2xl bg-[#050b11] border border-indigo-800/40 space-y-4">
        
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-white">{activeAlliance.name}</h4>
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                {activeAlliance.acronym}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-1">
              <span className="text-slate-500">Member States:</span>
              <span className="text-cyan-300 font-bold">{activeAlliance.members.join(' · ')}</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Treaty Status</span>
            <div className="text-sm font-bold text-emerald-400">ACTIVE &amp; RATIFIED</div>
            <span className="text-[9px] text-slate-400">Operational Mandate</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          <div className="p-3.5 rounded-xl bg-[#09141d] border border-slate-800 space-y-2">
            <span className="text-[10px] text-slate-400 uppercase font-bold block flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Strategic Focus &amp; Objective:</span>
            </span>
            <p className="text-[11px] text-slate-200 leading-relaxed p-2.5 rounded bg-slate-950 border border-slate-850">
              {activeAlliance.strategicFocus}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#09141d] border border-slate-800 space-y-2">
            <span className="text-[10px] text-slate-400 uppercase font-bold block flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>Defense &amp; Security Mandate:</span>
            </span>
            <p className="text-[11px] text-slate-200 leading-relaxed p-2.5 rounded bg-slate-950 border border-slate-850">
              {activeAlliance.defenseSecurityMandate}
            </p>
          </div>

        </div>

        {/* Flagship Program & Export Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#02050b] border border-cyan-800/40 space-y-1">
            <span className="text-cyan-400 font-bold block text-[10px] uppercase">Flagship Operational Deployment:</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {activeAlliance.flagshipInitiative}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#02050b] border border-amber-800/40 space-y-1">
            <span className="text-amber-400 font-bold block text-[10px] uppercase">Export Control &amp; ITAR Alignment:</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {activeAlliance.exportControlAlignment}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};

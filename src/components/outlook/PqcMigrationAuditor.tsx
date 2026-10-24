import React, { useState } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  Sliders, 
  FileText,
  Copy,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { playGateClickSound } from '../../utils/audio';
import { useToast } from '../../context/ToastContext';

interface ChecklistItem {
  id: string;
  category: string;
  title: string;
  standard: string;
  deadlineYear: number;
  completed: boolean;
}

export const PqcMigrationAuditor: React.FC = () => {
  const { showToast } = useToast();
  const [sector, setSector] = useState<'finance' | 'defense' | 'healthcare' | 'tech'>('finance');
  
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: 'inv', category: 'Discovery', title: 'Automated Cryptographic Inventory (CBOM)', standard: 'NIST SP 800-227', deadlineYear: 2025, completed: true },
    { id: 'kem', category: 'Encryption', title: 'Deploy ML-KEM-768 (Kyber) for TLS 1.3 & IPsec', standard: 'FIPS 203', deadlineYear: 2030, completed: false },
    { id: 'sig', category: 'Authentication', title: 'Deploy ML-DSA (Dilithium) for Code & Cert Signing', standard: 'FIPS 204', deadlineYear: 2030, completed: false },
    { id: 'hash', category: 'Integrity', title: 'SLH-DSA (SPHINCS+) for Root CA Certificates', standard: 'FIPS 205', deadlineYear: 2033, completed: false },
    { id: 'hsm', category: 'Hardware', title: 'HSM Firmware Upgraded to Post-Quantum Microcode', standard: 'FIPS 140-3', deadlineYear: 2030, completed: true },
    { id: 'hybrid', category: 'Protocol', title: 'X25519 + Kyber768 Hybrid Key Exchange Active', standard: 'IETF RFC 9180', deadlineYear: 2026, completed: true },
    { id: 'rsa_dep', category: 'Decoupling', title: 'Full Deprecation of RSA-2048/4096 & ECDSA', standard: 'NSA CNSA 2.0', deadlineYear: 2035, completed: false }
  ]);

  const toggleItem = (id: string) => {
    playGateClickSound(650);
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const completedCount = checklist.filter(c => c.completed).length;
  const readinessPercent = Math.round((completedCount / checklist.length) * 100);

  // Time remaining to key deadlines from present (2026)
  const currentYear = 2026;
  const yearsTo2030 = Math.max(0, 2030 - currentYear);
  const yearsTo2035 = Math.max(0, 2035 - currentYear);

  return (
    <div className="space-y-6 font-mono text-xs">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#09141d] border border-cyan-800/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-500/50 flex items-center justify-center text-rose-400">
            <Lock className="w-5 h-5 text-rose-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">NIST CNSA 2.0 Post-Quantum Cryptography Migration Auditor</h3>
              <span className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold">
                MANDATORY COMPLIANCE
              </span>
            </div>
            <p className="text-[11px] text-[#78909c]">
              Assess enterprise readiness against NIST FIPS 203 (ML-KEM), FIPS 204 (ML-DSA), and NSA CNSA 2.0 cryptographic deadlines
            </p>
          </div>
        </div>

        {/* Sector Selector */}
        <div className="flex items-center gap-2 bg-[#050b11] p-1.5 rounded-xl border border-slate-800">
          <span className="text-slate-500 text-[10px] uppercase font-bold pl-1">Sector:</span>
          {[
            { id: 'finance' as const, label: 'Finance & Banking' },
            { id: 'defense' as const, label: 'Defense & Intel' },
            { id: 'healthcare' as const, label: 'Healthcare' },
            { id: 'tech' as const, label: 'Cloud / Telecom' }
          ].map(s => (
            <button
              key={s.id}
              onClick={() => { playGateClickSound(600); setSector(s.id); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                sector === s.id ? 'bg-[#00e5ff] text-[#02060a]' : 'text-slate-400 hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Official CNSA 2.0 Timeline Countdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-4 rounded-xl bg-[#050b11] border border-cyan-800/40 space-y-1">
          <div className="flex justify-between items-center text-[10px] text-slate-400">
            <span>PHASE 1: SOFTWARE &amp; FIRMWARE</span>
            <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">IN PROGRESS</span>
          </div>
          <div className="text-lg font-bold text-cyan-300">Target Year 2025–2030</div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Mandatory transition of software/firmware signing to stateful hash-based (LMS/XMSS) and ML-DSA signatures.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#050b11] border border-amber-800/40 space-y-1">
          <div className="flex justify-between items-center text-[10px] text-slate-400">
            <span>PHASE 2: NETWORKS &amp; BROWSERS</span>
            <span className="text-amber-400 font-bold">{yearsTo2030} Years Left</span>
          </div>
          <div className="text-lg font-bold text-amber-300">Target Year 2030</div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            All web browsers, operating systems, TLS 1.3 endpoints, and IPsec VPNs must mandate ML-KEM-768/1024 encryption.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#050b11] border border-rose-800/40 space-y-1">
          <div className="flex justify-between items-center text-[10px] text-slate-400">
            <span>PHASE 3: COMPLETE RSA DECOUPLING</span>
            <span className="text-rose-400 font-bold">{yearsTo2035} Years Left</span>
          </div>
          <div className="text-lg font-bold text-rose-300">Hard Cutoff 2035</div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Total prohibition of legacy classical public-key algorithms (RSA, Diffie-Hellman, ECDSA) on national security networks.
          </p>
        </div>

      </div>

      {/* 3. Interactive Readiness Checklist & Score Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Interactive Audit Checklist (8 cols) */}
        <div className="lg:col-span-8 p-4 rounded-xl bg-[#050b11] border border-slate-800 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <span className="font-bold text-white text-xs uppercase flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Enterprise Post-Quantum Compliance Checklist</span>
            </span>
            <span className="text-[10px] text-slate-400">Click to toggle deployment status</span>
          </div>

          <div className="space-y-2">
            {checklist.map(item => (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`w-full p-3 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  item.completed
                    ? 'bg-emerald-950/30 border-emerald-800/60'
                    : 'bg-[#02050b] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs ${
                    item.completed ? 'bg-emerald-500 text-slate-950' : 'border border-slate-700 text-transparent'
                  }`}>
                    ✓
                  </div>
                  <div>
                    <div className={`font-bold text-xs ${item.completed ? 'text-emerald-200' : 'text-slate-300'}`}>
                      {item.title}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Category: {item.category} · Benchmark Standard: <strong className="text-cyan-400">{item.standard}</strong>
                    </div>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono shrink-0 ${
                  item.completed 
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}>
                  Mandate: {item.deadlineYear}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Readiness Score & Action Plan (4 cols) */}
        <div className="lg:col-span-4 p-4 rounded-xl bg-[#09141d] border border-cyan-800/40 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-[10px] text-slate-400 uppercase font-bold block pb-1 border-b border-slate-800">
              Audit Compliance Health Score
            </span>

            <div className="text-center p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">PQC Readiness Index</span>
              <div className={`text-4xl font-bold ${readinessPercent >= 70 ? 'text-emerald-400' : readinessPercent >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                {readinessPercent}%
              </div>
              <span className="text-[10px] text-slate-400 block">
                {completedCount} of {checklist.length} Controls Implemented
              </span>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Harvest-Now-Decrypt-Later Risk:</span>
                <span className={`font-bold ${readinessPercent < 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {readinessPercent < 50 ? 'CRITICAL EXPOSURE' : 'PARTIALLY MITIGATED'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target Encryption Protocol:</span>
                <span className="text-cyan-300 font-bold">ML-KEM-768</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target Signature Protocol:</span>
                <span className="text-purple-300 font-bold">ML-DSA-65</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              const auditText = `[PQC CNSA 2.0 COMPLIANCE AUDIT DOSSIER]\nSector: ${sector.toUpperCase()}\nReadiness: ${readinessPercent}%\nImplemented: ${completedCount}/${checklist.length}\nTarget Deadlines: 2030 (Web/TLS), 2035 (RSA Decoupling)\nGenerated via Quantum Studio Global Outlook.`;
              navigator.clipboard?.writeText(auditText).catch(() => {});
              showToast('PQC Dossier Copied', 'success', 'Enterprise migration action plan copied to clipboard.');
            }}
            className="w-full py-2 rounded-xl bg-[#00e5ff] hover:bg-[#38bdf8] text-[#02060a] font-bold text-xs cursor-pointer shadow-md shadow-cyan-500/20 flex items-center justify-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Migration Action Plan</span>
          </button>
        </div>

      </div>

    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Key, 
  Lock, 
  Unlock, 
  Radio, 
  Eye, 
  EyeOff, 
  Play, 
  RotateCcw, 
  Sparkles, 
  Send, 
  Activity, 
  Check, 
  Copy, 
  Sliders, 
  ArrowRight,
  Info,
  Layers,
  Zap,
  Cpu
} from 'lucide-react';
import { GateOp } from '../types/quantum';
import { useToast } from '../context/ToastContext';
import { playGateClickSound, playMeasurementCollapseSound } from '../utils/audio';

interface QuantumCryptographyLabProps {
  onLoadToComposer?: (gates: GateOp[], qubits: number) => void;
}

interface PhotonRecord {
  index: number;
  aliceBit: number; // 0 or 1
  aliceBasis: 'Z' | 'X'; // Z: {|0>, |1>}, X: {|+>, |->}
  eveIntercepted: boolean;
  eveBasis?: 'Z' | 'X';
  eveMeasuredBit?: number;
  bobBasis: 'Z' | 'X';
  bobMeasuredBit: number;
  basisMatched: boolean;
  usedForSampleTest: boolean;
  bitError: boolean;
}

export const QuantumCryptographyLab: React.FC<QuantumCryptographyLabProps> = ({
  onLoadToComposer
}) => {
  const { showToast } = useToast();
  const [protocol, setProtocol] = useState<'BB84' | 'E91'>('BB84');
  const [numPhotons, setNumPhotons] = useState<number>(16);
  const [eveInterceptRate, setEveInterceptRate] = useState<number>(0); // 0 to 100%
  const [channelNoiseRate, setChannelNoiseRate] = useState<number>(2); // 0 to 20%
  const [testSampleSizePct, setTestSampleSizePct] = useState<number>(30); // 30% for QBER test
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Message to encrypt via One-Time Pad
  const [message, setMessage] = useState<string>('QUANTUM SECURE 2026');
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  // Simulation run state
  const [photons, setPhotons] = useState<PhotonRecord[]>(() => generatePhotons(16, 0, 2, 30));

  function generatePhotons(count: number, eveRate: number, noiseRate: number, samplePct: number): PhotonRecord[] {
    const list: PhotonRecord[] = [];
    for (let i = 0; i < count; i++) {
      const aliceBit = Math.random() < 0.5 ? 0 : 1;
      const aliceBasis: 'Z' | 'X' = Math.random() < 0.5 ? 'Z' : 'X';
      const bobBasis: 'Z' | 'X' = Math.random() < 0.5 ? 'Z' : 'X';

      let transmittedBit = aliceBit;
      let transmittedBasis = aliceBasis;

      // Eve eavesdropping
      const eveIntercepted = Math.random() * 100 < eveRate;
      let eveBasis: 'Z' | 'X' | undefined;
      let eveMeasuredBit: number | undefined;

      if (eveIntercepted) {
        eveBasis = Math.random() < 0.5 ? 'Z' : 'X';
        if (eveBasis === transmittedBasis) {
          eveMeasuredBit = transmittedBit;
        } else {
          // Basis mismatch collapses state randomly
          eveMeasuredBit = Math.random() < 0.5 ? 0 : 1;
        }
        // Resend photon in Eve's measured basis
        transmittedBit = eveMeasuredBit;
        transmittedBasis = eveBasis;
      }

      // Channel noise flip
      if (Math.random() * 100 < noiseRate) {
        transmittedBit = transmittedBit === 0 ? 1 : 0;
      }

      // Bob measurement
      let bobMeasuredBit: number;
      if (bobBasis === transmittedBasis) {
        bobMeasuredBit = transmittedBit;
      } else {
        // Measurement in wrong basis yields 50/50 collapse
        bobMeasuredBit = Math.random() < 0.5 ? 0 : 1;
      }

      const basisMatched = aliceBasis === bobBasis;

      list.push({
        index: i,
        aliceBit,
        aliceBasis,
        eveIntercepted,
        eveBasis,
        eveMeasuredBit,
        bobBasis,
        bobMeasuredBit,
        basisMatched,
        usedForSampleTest: false, // will mark in sifting
        bitError: basisMatched && aliceBit !== bobMeasuredBit
      });
    }

    // Mark sample test bits among matched basis bits
    const matched = list.filter(p => p.basisMatched);
    const sampleCount = Math.max(1, Math.floor(matched.length * (samplePct / 100)));
    const shuffled = [...matched].sort(() => Math.random() - 0.5);
    const sampleIndices = new Set(shuffled.slice(0, sampleCount).map(p => p.index));

    list.forEach(p => {
      if (sampleIndices.has(p.index)) {
        p.usedForSampleTest = true;
      }
    });

    return list;
  }

  const handleRunTransmission = () => {
    setIsSimulating(true);
    playMeasurementCollapseSound();
    setTimeout(() => {
      const next = generatePhotons(numPhotons, eveInterceptRate, channelNoiseRate, testSampleSizePct);
      setPhotons(next);
      setIsSimulating(false);
      showToast('Transmission Complete', 'success', `Sent ${numPhotons} photons through quantum channel.`);
    }, 400);
  };

  // Telemetry Metrics
  const metrics = useMemo(() => {
    const matched = photons.filter(p => p.basisMatched);
    const sampleTested = matched.filter(p => p.usedForSampleTest);
    const sampleErrors = sampleTested.filter(p => p.aliceBit !== p.bobMeasuredBit);
    const qber = sampleTested.length > 0 ? (sampleErrors.length / sampleTested.length) * 100 : 0;

    // Remaining bits form secret key (excluding sample test bits)
    const secretKeyBits = matched.filter(p => !p.usedForSampleTest);
    const keyAlice = secretKeyBits.map(p => p.aliceBit).join('');
    const keyBob = secretKeyBits.map(p => p.bobMeasuredBit).join('');

    // E91 CHSH inequality correlation S
    // S_max = 2*sqrt(2) ~ 2.828 with no Eve; S <= 2 with Eve intercepting
    const eveImpact = eveInterceptRate / 100;
    const chshValue = Math.max(1.4, 2.828 * (1 - eveImpact * 0.45) - (channelNoiseRate / 100) * 0.8);
    const e91Secure = chshValue > 2.0;

    // Shor-Preskill QBER Threshold is 11%
    const isChannelSecure = protocol === 'BB84' ? qber <= 11.0 : e91Secure;

    return {
      matchedCount: matched.length,
      sampleTestCount: sampleTested.length,
      sampleErrorsCount: sampleErrors.length,
      qber,
      keyAlice,
      keyBob,
      chshValue,
      isChannelSecure,
      secretKeyLength: keyAlice.length
    };
  }, [photons, eveInterceptRate, channelNoiseRate, protocol]);

  // One-Time Pad Encryption Demo
  const otpEncryption = useMemo(() => {
    if (!metrics.keyAlice || metrics.keyAlice.length === 0) {
      return { ciphertextHex: '', decryptedText: '', valid: false };
    }

    // Convert message ASCII to binary string
    let msgBin = '';
    for (let i = 0; i < message.length; i++) {
      msgBin += message.charCodeAt(i).toString(2).padStart(8, '0');
    }

    // Repeat key to match message length
    const fullKey = metrics.keyAlice.repeat(Math.ceil(msgBin.length / metrics.keyAlice.length)).slice(0, msgBin.length);

    // XOR Alice Message with QKD Key
    let cipherBin = '';
    for (let i = 0; i < msgBin.length; i++) {
      cipherBin += msgBin[i] === fullKey[i] ? '0' : '1';
    }

    // Convert ciphertext to hex for presentation
    let hex = '';
    for (let i = 0; i < cipherBin.length; i += 4) {
      hex += parseInt(cipherBin.slice(i, i + 4), 2).toString(16).toUpperCase();
    }

    // Decrypt using Bob's Key
    const bobFullKey = metrics.keyBob.repeat(Math.ceil(cipherBin.length / metrics.keyBob.length)).slice(0, cipherBin.length);
    let decryptedBin = '';
    for (let i = 0; i < cipherBin.length; i++) {
      decryptedBin += cipherBin[i] === bobFullKey[i] ? '0' : '1';
    }

    let decrypted = '';
    for (let i = 0; i < decryptedBin.length; i += 8) {
      const code = parseInt(decryptedBin.slice(i, i + 8), 2);
      decrypted += String.fromCharCode(code);
    }

    return {
      ciphertextHex: hex,
      decryptedText: decrypted,
      valid: metrics.isChannelSecure
    };
  }, [message, metrics]);

  // Export representative QKD trial to Circuit Composer
  const handleExportToComposer = () => {
    if (!onLoadToComposer) return;
    playGateClickSound(750);

    const gates: GateOp[] = [];

    if (protocol === 'BB84') {
      // 3 Qubits: q0=Alice, q1=Eve (if intercepted), q2=Bob
      // Alice prepares bit 1 on q0: X
      gates.push({ type: 'X', qubit: 0, step: 0 });
      // Alice encodes in X basis: H
      gates.push({ type: 'H', qubit: 0, step: 1 });

      if (eveInterceptRate > 0) {
        // Eve taps channel: CNOT onto Eve's ancilla q1
        gates.push({ type: 'CNOT', control: 0, target: 1, step: 2 });
        gates.push({ type: 'M', qubit: 1, step: 3 });
      }

      // Transmission to Bob (SWAP from q0 to q2)
      gates.push({ type: 'SWAP', q1: 0, q2: 2, step: 4 });
      // Bob measures in X basis: H then M
      gates.push({ type: 'H', qubit: 2, step: 5 });
      gates.push({ type: 'M', qubit: 2, step: 6 });

      onLoadToComposer(gates, 3);
      showToast('Loaded to Composer', 'success', 'BB84 quantum channel circuit loaded into canvas!');
    } else {
      // E91 Entanglement-based
      // Prepare Bell pair |Φ+> on (q0, q1)
      gates.push({ type: 'H', qubit: 0, step: 0 });
      gates.push({ type: 'CNOT', control: 0, target: 1, step: 1 });
      // Alice measurement angle (e.g. Ry(pi/4))
      gates.push({ type: 'Ry', qubit: 0, step: 2 });
      gates.push({ type: 'M', qubit: 0, step: 3 });
      // Bob measurement angle (e.g. Ry(3*pi/4))
      gates.push({ type: 'Ry', qubit: 1, step: 2 });
      gates.push({ type: 'M', qubit: 1, step: 3 });

      onLoadToComposer(gates, 2);
      showToast('Loaded to Composer', 'success', 'E91 Bell pair entanglement circuit loaded into canvas!');
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(metrics.keyAlice);
    setCopiedKey(true);
    showToast('Key Copied', 'success', 'Sifted quantum key copied to clipboard.');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#03070c] text-slate-200 font-mono p-4 lg:p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#09141d] border border-[rgba(0,229,255,0.25)] shadow-xl shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-500/20">
            <Radio className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Quantum Key Distribution &amp; Cryptography Studio
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                Information-Theoretic Security
              </span>
            </div>
            <p className="text-xs text-[#78909c]">
              Interactive BB84 &amp; E91 quantum optical cryptography with live Eve eavesdropping &amp; CHSH Bell test
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <div className="flex bg-[#050b11] p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => { setProtocol('BB84'); handleRunTransmission(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                protocol === 'BB84'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              BB84 Protocol
            </button>
            <button
              onClick={() => { setProtocol('E91'); handleRunTransmission(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                protocol === 'E91'
                  ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              E91 Entangled
            </button>
          </div>

          <button
            onClick={handleRunTransmission}
            disabled={isSimulating}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isSimulating ? 'animate-spin' : ''}`} />
            <span>Transmit Photons</span>
          </button>

          {onLoadToComposer && (
            <button
              onClick={handleExportToComposer}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Send representative QKD transaction to Circuit Composer canvas"
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Send to Composer</span>
            </button>
          )}
        </div>
      </div>

      {/* Optical Bench & Interactive Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Optical Channel Controls */}
        <div className="p-4 rounded-xl bg-[#09141d] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-white border-b border-slate-800 pb-2">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Quantum Channel Calibration
            </span>
            <span className="text-[10px] text-cyan-400">{protocol} Active</span>
          </div>

          {/* Number of Photons */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Photon Pulses Sent:</span>
              <span className="text-white font-bold">{numPhotons} Pulses</span>
            </div>
            <input
              type="range"
              min="8"
              max="32"
              step="4"
              value={numPhotons}
              onChange={e => setNumPhotons(+e.target.value)}
              className="w-full h-1 bg-slate-800 accent-cyan-400 rounded cursor-pointer"
            />
          </div>

          {/* Eve Intercept Rate */}
          <div className="space-y-1.5 p-3 rounded-lg bg-[#050b11] border border-rose-950/40">
            <div className="flex justify-between text-xs">
              <span className="text-rose-400 font-semibold flex items-center gap-1">
                {eveInterceptRate > 0 ? <Eye className="w-3.5 h-3.5 text-rose-400 animate-pulse" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
                Eve Intercept-Resend:
              </span>
              <span className="text-rose-400 font-bold">{eveInterceptRate}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={eveInterceptRate}
              onChange={e => setEveInterceptRate(+e.target.value)}
              className="w-full h-1 bg-slate-800 accent-rose-500 rounded cursor-pointer"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Eavesdropper intercepts photon, collapses state in random basis, and retransmits.
            </p>
          </div>

          {/* Channel Noise Rate */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Fibre Attenuation / Noise:</span>
              <span className="text-amber-300 font-bold">{channelNoiseRate}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="1"
              value={channelNoiseRate}
              onChange={e => setChannelNoiseRate(+e.target.value)}
              className="w-full h-1 bg-slate-800 accent-amber-400 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Security & QBER Telemetry Gauge */}
        <div className="p-4 rounded-xl bg-[#09141d] border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-white border-b border-slate-800 pb-2">
            <span className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              Cryptographic Channel Security
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              metrics.isChannelSecure
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                : 'bg-rose-950 text-rose-400 border border-rose-500/40 animate-pulse'
            }`}>
              {metrics.isChannelSecure ? 'UNCONDITIONALLY SECURE' : 'COMPROMISED (ABORT!)'}
            </span>
          </div>

          {/* Big Telemetry Numbers */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-lg bg-[#050b11] border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                {protocol === 'BB84' ? 'Quantum Bit Error (QBER)' : 'Bell CHSH Correlation (S)'}
              </div>
              <div className={`text-xl font-bold mt-1 ${
                metrics.isChannelSecure ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {protocol === 'BB84' ? `${metrics.qber.toFixed(1)}%` : metrics.chshValue.toFixed(2)}
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">
                {protocol === 'BB84' ? 'Threshold ≤ 11.0%' : 'Quantum limit = 2.83, Class ≤ 2'}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#050b11] border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Sifted Key Length</div>
              <div className="text-xl font-bold text-cyan-400 mt-1">
                {metrics.secretKeyLength} bits
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">
                {metrics.matchedCount} bases matched ({((metrics.matchedCount / numPhotons) * 100).toFixed(0)}%)
              </div>
            </div>
          </div>

          {/* Security explanation badge */}
          <div className={`p-2.5 rounded-lg text-xs border flex items-start gap-2 ${
            metrics.isChannelSecure
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
              : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
          }`}>
            {metrics.isChannelSecure ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="text-[11px] leading-relaxed">
              {metrics.isChannelSecure ? (
                <span>
                  No eavesdropping detected below threshold. Alice &amp; Bob share identical one-time pad keys!
                </span>
              ) : (
                <span>
                  Eve detected! Quantum no-cloning theorem guarantees eavesdropping disturbs the wave function, driving QBER &gt; 11%.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Live One-Time Pad Quantum Encryption Engine */}
        <div className="p-4 rounded-xl bg-[#09141d] border border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-white border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-400" />
                One-Time Pad (Vernam Cipher)
              </span>
              <span className="text-[10px] text-slate-400">Information-Theoretic</span>
            </div>

            <div className="space-y-2 mt-2">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider">
                Alice's Secret Plaintext Message:
              </label>
              <input
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value.toUpperCase())}
                maxLength={20}
                className="w-full bg-[#050b11] border border-slate-800 rounded px-2.5 py-1 text-xs text-white font-mono outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="space-y-2 p-2.5 rounded-lg bg-[#050b11] border border-slate-800 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Eve's Intercepted Ciphertext:</span>
              <span className="text-rose-400 font-bold truncate max-w-[150px]">
                {otpEncryption.ciphertextHex || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Bob's Decrypted Output:</span>
              <span className={`font-bold truncate max-w-[150px] ${
                metrics.isChannelSecure ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {metrics.isChannelSecure ? otpEncryption.decryptedText : 'CORRUPTED / ABORTED'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-slate-400">
              Key: <span className="text-cyan-300 font-bold">{metrics.keyAlice.slice(0, 12)}...</span>
            </span>
            <button
              onClick={handleCopyKey}
              className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 hover:bg-cyan-900 border border-cyan-500/30 text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
            >
              {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visual Photon Stream Table */}
      <div className="p-4 rounded-xl bg-[#09141d] border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-white">
          <span className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Quantum Optical Channel Photon Log (Alice → Eve → Bob)
          </span>
          <span className="text-[11px] text-slate-400">
            Showing {photons.length} transmitted photon wavepackets
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] text-slate-500 uppercase tracking-wider">
                <th className="py-2 px-2">#</th>
                <th className="py-2 px-2 text-cyan-400">Alice Bit</th>
                <th className="py-2 px-2 text-cyan-400">Alice Basis</th>
                <th className="py-2 px-2 text-rose-400">Eve Tap</th>
                <th className="py-2 px-2 text-amber-400">Bob Basis</th>
                <th className="py-2 px-2 text-amber-400">Bob Measured</th>
                <th className="py-2 px-2 text-center">Basis Match</th>
                <th className="py-2 px-2 text-right">Key Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {photons.map(p => {
                const eveSpied = p.eveIntercepted;
                return (
                  <tr 
                    key={p.index}
                    className={`hover:bg-slate-900/60 transition-colors ${
                      p.bitError ? 'bg-rose-950/20' : p.basisMatched ? 'bg-cyan-950/10' : ''
                    }`}
                  >
                    <td className="py-2 px-2 text-slate-500 font-bold">{p.index + 1}</td>
                    <td className="py-2 px-2 text-white font-bold">{p.aliceBit}</td>
                    <td className="py-2 px-2 text-cyan-300 font-semibold">{p.aliceBasis === 'Z' ? 'Z {0,1}' : 'X {+,-}'}</td>
                    <td className="py-2 px-2">
                      {eveSpied ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 font-semibold bg-rose-950/60 border border-rose-500/30 px-1.5 py-0.2 rounded">
                          <Eye className="w-3 h-3 text-rose-400" />
                          <span>{p.eveBasis}: {p.eveMeasuredBit}</span>
                        </span>
                      ) : (
                        <span className="text-slate-600 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-amber-300 font-semibold">{p.bobBasis === 'Z' ? 'Z {0,1}' : 'X {+,-}'}</td>
                    <td className="py-2 px-2 text-white font-bold">
                      <span className={p.bitError ? 'text-rose-400 underline font-extrabold' : ''}>
                        {p.bobMeasuredBit}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center">
                      {p.basisMatched ? (
                        <span className="text-emerald-400 font-bold">MATCH ✓</span>
                      ) : (
                        <span className="text-slate-600">DISCARD ✗</span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-right">
                      {p.basisMatched ? (
                        p.usedForSampleTest ? (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                            p.bitError ? 'bg-rose-950 text-rose-300 border border-rose-500/40' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {p.bitError ? 'TEST ERROR' : 'TEST SAMPLE'}
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-bold">
                            SIFTED KEY ({p.aliceBit})
                          </span>
                        )
                      ) : (
                        <span className="text-[10px] text-slate-600">REJECTED</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

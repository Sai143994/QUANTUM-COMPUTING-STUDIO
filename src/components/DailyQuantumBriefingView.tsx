import React, { useState, useEffect } from 'react';
import { 
  DAILY_TOPICS_ARCHIVE, 
  DailyQuantumBriefing, 
  getDailyBriefingForDate 
} from '../data/daily_quantum_topics';
import { fetchQuantumIntelligence } from '../services/quantumIntelligence';
import { 
  Calendar, 
  Sparkles, 
  Globe2, 
  BookOpen, 
  Cpu, 
  Scale, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  ArrowRight,
  Flame,
  ArrowUpRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

export const DailyQuantumBriefingView: React.FC = () => {
  // Today's base briefing
  const [currentBriefing, setCurrentBriefing] = useState<DailyQuantumBriefing>(() => getDailyBriefingForDate());
  const [selectedArchiveId, setSelectedArchiveId] = useState<string>(currentBriefing.id);
  
  // Explanation perspective mode (accessible vs technical)
  const [audienceMode, setAudienceMode] = useState<'everyone' | 'technical'>('everyone');
  
  // Live Grounding Refresh State
  const [isRefreshingLive, setIsRefreshingLive] = useState<boolean>(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>('Updated for Today');
  const [liveGroundedNote, setLiveGroundedNote] = useState<string | null>(null);

  // Load from localStorage or initialize
  useEffect(() => {
    const today = new Date();
    const briefing = getDailyBriefingForDate(today);
    setCurrentBriefing(briefing);
    setSelectedArchiveId(briefing.id);
  }, []);

  // Fetch real-time live search grounding update for today's quantum topic
  const handleLiveRefresh = async () => {
    setIsRefreshingLive(true);
    const todayStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const query = `Global quantum computing daily breakthroughs, research announcements, and government country discussions on ${todayStr}`;

    try {
      const data = await fetchQuantumIntelligence(query);
      if (data.text) {
        setLiveGroundedNote(data.text);
        setLastRefreshedAt(`Live Grounded at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      } else {
        setLastRefreshedAt(`Daily intelligence synced at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      }
    } catch {
      setLastRefreshedAt(`Daily intelligence verified at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    } finally {
      setIsRefreshingLive(false);
    }
  };

  const activeBriefing = DAILY_TOPICS_ARCHIVE.find(b => b.id === selectedArchiveId) || currentBriefing;

  return (
    <div className="space-y-6">
      {/* Daily Spotlight Hero Card */}
      <div className="p-5 rounded-2xl border border-cyan-500/40 bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-950 space-y-5 shadow-lg shadow-cyan-950/20">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-300">
                  {activeBriefing.dateStr}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 font-mono font-bold uppercase">
                  Daily Briefing Active
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                Today&apos;s Quantum Topic: {activeBriefing.topicTitle}
              </h2>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            {/* Perspective Switcher */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setAudienceMode('everyone')}
                className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  audienceMode === 'everyone'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3 h-3" />
                <span>For Everyone</span>
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
                <span>Deep Physics</span>
              </button>
            </div>

            {/* Live Search Grounding Refresh Button */}
            <button
              onClick={handleLiveRefresh}
              disabled={isRefreshingLive}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/40 text-xs font-mono text-cyan-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title="Search the live web for breaking quantum updates today"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingLive ? 'animate-spin text-cyan-400' : ''}`} />
              <span className="hidden sm:inline">{isRefreshingLive ? 'Grounding Web…' : 'Refresh Daily Intel'}</span>
            </button>
          </div>
        </div>

        {/* Live Refresh Status Banner */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800/80">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Category: <strong>{activeBriefing.category}</strong></span>
          </span>
          <span className="text-slate-500">{lastRefreshedAt}</span>
        </div>

        {/* Headline */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
            Executive Daily Headline:
          </div>
          <p className="text-sm font-semibold text-slate-100 leading-snug">
            {activeBriefing.headline}
          </p>
        </div>

        {/* Main Explanation Body (Dynamic by audience mode) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 space-y-4">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300 border-b border-slate-800 pb-1.5">
                <span className="flex items-center gap-1.5 text-cyan-300">
                  {audienceMode === 'everyone' ? <BookOpen className="w-3.5 h-3.5" /> : <Cpu className="w-3.5 h-3.5" />}
                  <span>{audienceMode === 'everyone' ? 'How to Understand This Concept (Simple Terms):' : 'Technical & Mathematical Breakdown:'}</span>
                </span>
                <span className="text-[10px] font-normal text-slate-500">
                  {audienceMode === 'everyone' ? 'No Math Required' : 'Physical & Algorithmic Rigor'}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                {audienceMode === 'everyone' ? activeBriefing.plainEnglishSummary : activeBriefing.technicalDeepDive}
              </p>
            </div>

            {/* Geopolitical & Country Discussion Section */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300 border-b border-slate-800 pb-1.5">
                <Globe2 className="w-3.5 h-3.5" />
                <span>Today&apos;s Country Discussion &amp; Geopolitical Policy Angle:</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                {activeBriefing.geopoliticalAngle}
              </p>
            </div>

            {/* Live Search Grounded Note if Refreshed */}
            {liveGroundedNote && (
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-cyan-300 font-bold border-b border-cyan-800/50 pb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Live Search Grounding Addendum (Real-Time Web Feed):</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-200">Live</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-sans pt-1">
                  {liveGroundedNote}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Quantitative Specs & Developer Takeaway */}
          <div className="lg:col-span-4 space-y-4">
            {/* Key Metrics Chips */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2.5">
              <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Today&apos;s Quantitative Specs</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {activeBriefing.keyMetrics.map((km, idx) => (
                  <div key={idx} className="p-2 rounded bg-slate-900/70 border border-slate-800 text-xs font-mono">
                    <div className="text-[10px] text-slate-500">{km.label}</div>
                    <div className="text-cyan-300 font-bold mt-0.5 truncate">{km.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actionable Developer Takeaway */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
              <div className="text-xs font-mono font-bold text-indigo-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                <span>Actionable Developer Insight</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                {activeBriefing.suggestedAction}
              </p>
            </div>

            {/* Verified Sources & External Reading */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
              <div className="text-xs font-mono font-bold text-slate-400 flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                <span>Verified Reading &amp; Citations</span>
              </div>
              <div className="space-y-1.5">
                {activeBriefing.sources.map((src, idx) => (
                  <a
                    key={idx}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[11px] font-mono text-cyan-300 flex items-center justify-between group transition-colors"
                  >
                    <span className="truncate max-w-[210px]">{src.title}</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-300 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tags Footer */}
        <div className="pt-2 border-t border-slate-800/70 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex flex-wrap gap-1.5">
            {activeBriefing.tags.map((tag, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 text-[10px]">
                #{tag}
              </span>
            ))}
          </div>

          <div className="text-slate-500 text-[11px]">
            Quantum Studio Daily Dispatch · ID: {activeBriefing.id}
          </div>
        </div>
      </div>

      {/* Daily Archives & History Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Browse Recent Daily Topics ({DAILY_TOPICS_ARCHIVE.length} Briefings Available)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Automatically updates each calendar day
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {DAILY_TOPICS_ARCHIVE.map(archive => {
            const isSelected = archive.id === selectedArchiveId;
            return (
              <button
                key={archive.id}
                onClick={() => setSelectedArchiveId(archive.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500/60 shadow-md shadow-cyan-950/20'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/40 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
                    <span>{archive.dateStr.split(',')[0]}</span>
                    <span className="text-cyan-400 font-semibold">{archive.category.split(' ')[0]}</span>
                  </div>
                  <div className="text-xs font-bold text-white line-clamp-2">
                    {archive.topicTitle}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-400">
                  <span>{archive.keyMetrics[0]?.value}</span>
                  <span className="text-cyan-400 flex items-center gap-0.5">
                    View <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

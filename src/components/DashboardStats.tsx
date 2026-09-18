import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Play, 
  Pause,
  Sparkles, 
  Clock, 
  Mail, 
  Volume2, 
  Sliders, 
  RefreshCw, 
  CheckCircle2, 
  Flame, 
  Star,
  Zap,
  ChevronDown,
  Info,
  Cpu
} from 'lucide-react';
import { EmailMessage, DigestStatus, AgentSettings } from '../types';

interface DashboardStatsProps {
  emails: EmailMessage[];
  status: DigestStatus;
  settings: AgentSettings;
  onPlayAllBriefing: () => void;
  isAudioActive: boolean;
  onOpenSettings: () => void;
  onTriggerCheck: () => void;
  isChecking: boolean;
  isAuthenticated: boolean;
  userEmail?: string | null;
  activeFilter: 'all' | 'unread' | 'urgent' | 'starred' | 'summarized';
  onSelectFilter: (filter: 'all' | 'unread' | 'urgent' | 'starred' | 'summarized') => void;
  onToggleAutoPlay: () => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  emails,
  status,
  settings,
  onPlayAllBriefing,
  isAudioActive,
  onOpenSettings,
  onTriggerCheck,
  isChecking,
  isAuthenticated,
  userEmail,
  activeFilter,
  onSelectFilter,
  onToggleAutoPlay,
}) => {
  const [showModelDetails, setShowModelDetails] = useState(false);
  const [countdownText, setCountdownText] = useState('Checking...');

  // Dynamic countdown calculation for next agent run
  useEffect(() => {
    const updateCountdown = () => {
      if (!status.nextCheck) {
        setCountdownText(`Every ${settings.intervalMinutes}m`);
        return;
      }
      const diffMs = status.nextCheck - Date.now();
      if (diffMs <= 0) {
        setCountdownText('Syncing soon...');
      } else {
        const mins = Math.floor(diffMs / (60 * 1000));
        const secs = Math.floor((diffMs % (60 * 1000)) / 1000);
        setCountdownText(`${mins}m ${secs < 10 ? '0' : ''}${secs}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [status.nextCheck, settings.intervalMinutes]);

  const summarizedCount = emails.filter((e) => !!e.summary).length;
  const urgentCount = emails.filter(
    (e) => e.summary?.sentiment === 'urgent' || e.summary?.sentiment === 'action_required' || e.priority === 'high'
  ).length;
  const unreadCount = emails.filter((e) => !e.read).length;
  const starredCount = emails.filter((e) => !!e.starred).length;

  const totalAudioTimeSeconds = emails.reduce((acc, e) => {
    if (e.summary) {
      return acc + (e.summary.estimatedReadSeconds || 18);
    }
    return acc;
  }, 0);

  const totalAudioMinutes = Math.max(1, Math.round(totalAudioTimeSeconds / 60));

  return (
    <section aria-label="Agent Control Deck" className="space-y-3">
      {/* Tactile Agent Control Console */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-4 border border-stone-800 shadow-sm relative">
        {/* Header line with Model & Status */}
        <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-stone-800 border border-stone-700 text-[11px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>NVIDIA NIM · gpt-oss-20b</span>
            </div>
            <button
              onClick={() => setShowModelDetails(!showModelDetails)}
              className="text-stone-400 hover:text-stone-200 transition-colors p-0.5 rounded"
              title="View NIM Model Specs"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSettings}
              className="text-xs text-stone-300 hover:text-amber-300 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-stone-800 transition-colors"
              title="Agent Settings"
            >
              <Sliders className="w-3 h-3" />
              <span>{settings.voiceName}</span>
            </button>
          </div>
        </div>

        {/* Expandable Model Details Tray */}
        {showModelDetails && (
          <div className="mb-3 p-2.5 rounded-xl bg-stone-800/80 border border-stone-700 text-[11px] text-stone-300 space-y-1">
            <div className="flex items-center justify-between text-stone-400 font-mono">
              <span>Endpoint</span>
              <span className="text-stone-200">integrate.api.nvidia.com/v1</span>
            </div>
            <div className="flex items-center justify-between text-stone-400 font-mono">
              <span>Inference Engine</span>
              <span className="text-amber-300">OpenAI GPT-OSS-20B (21B MoE)</span>
            </div>
            <div className="flex items-center justify-between text-stone-400 font-mono">
              <span>Reasoning Mode</span>
              <span className="text-emerald-400">Full Chain-of-Thought</span>
            </div>
          </div>
        )}

        {/* Action Row: Play Digest & Sync */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">
              Executive Audio Digest
            </h2>
            <p className="text-xs text-stone-400">
              {summarizedCount} briefed emails • ~{totalAudioMinutes} min total playback
            </p>
          </div>

          {/* Equalizer animation when playing */}
          {isAudioActive && (
            <div className="flex items-end gap-0.5 h-4 px-2">
              <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s] h-3" />
              <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.15s] h-4" />
              <span className="w-1 bg-amber-400 rounded-full animate-bounce h-2" />
              <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.25s] h-3.5" />
            </div>
          )}
        </div>

        {/* Controls Bar */}
        <div className="flex items-center gap-2 pt-1">
          <button
            id="play-all-digest-btn"
            onClick={onPlayAllBriefing}
            disabled={emails.length === 0}
            className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-stone-950 text-xs font-bold transition-all shadow-xs disabled:opacity-50"
          >
            {isAudioActive ? (
              <>
                <Volume2 className="w-4 h-4 text-stone-950 animate-pulse" />
                <span>Playing Briefing...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Play All ({totalAudioMinutes}m)</span>
              </>
            )}
          </button>

          <button
            onClick={onTriggerCheck}
            disabled={isChecking}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-[0.98] text-stone-200 text-xs font-medium border border-stone-700 transition-colors"
            title={isAuthenticated ? "Poll and summarize Gmail inbox immediately" : "Refresh inbox digest and run AI summaries"}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-amber-400' : ''}`} />
            <span>{isChecking ? 'Checking...' : isAuthenticated ? 'Sync Gmail' : 'Refresh Digest'}</span>
          </button>
        </div>

        {/* Bottom Status ticker with Auto-Play toggle and countdown */}
        <div className="flex items-center justify-between text-[11px] text-stone-400 mt-3 pt-2.5 border-t border-stone-800">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Next agent run: <strong className="text-stone-200 font-mono">{countdownText}</strong></span>
          </div>

          <button
            onClick={onToggleAutoPlay}
            className={`flex items-center gap-1 text-[11px] font-medium transition-colors px-1.5 py-0.5 rounded ${
              settings.autoPlayNext ? 'text-amber-300 bg-amber-950/40' : 'text-stone-500 hover:text-stone-300'
            }`}
            title="Automatically play the next email narration in playlist"
          >
            <span>Auto-Advance</span>
            <span className={`w-2 h-2 rounded-full ${settings.autoPlayNext ? 'bg-amber-400' : 'bg-stone-600'}`} />
          </button>
        </div>
      </div>

      {/* Interactive Quick-Filter Chips (Directly clickable, no nested cards) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => onSelectFilter('all')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-all text-xs whitespace-nowrap flex items-center gap-1.5 ${
            activeFilter === 'all'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
          }`}
        >
          <span>All</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-800 font-semibold">
            {emails.length}
          </span>
        </button>

        <button
          onClick={() => onSelectFilter('urgent')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-all text-xs whitespace-nowrap flex items-center gap-1.5 ${
            activeFilter === 'urgent'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
          }`}
        >
          <Flame className="w-3 h-3 text-rose-500" />
          <span>Action Needed</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800 font-semibold">
            {urgentCount}
          </span>
        </button>

        <button
          onClick={() => onSelectFilter('starred')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-all text-xs whitespace-nowrap flex items-center gap-1.5 ${
            activeFilter === 'starred'
              ? 'bg-amber-500 text-stone-950 font-semibold shadow-xs'
              : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
          }`}
        >
          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
          <span>Starred</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 font-semibold">
            {starredCount}
          </span>
        </button>

        <button
          onClick={() => onSelectFilter('unread')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-all text-xs whitespace-nowrap flex items-center gap-1.5 ${
            activeFilter === 'unread'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
          }`}
        >
          <span>Unread</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 font-semibold">
            {unreadCount}
          </span>
        </button>

        <button
          onClick={() => onSelectFilter('summarized')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-all text-xs whitespace-nowrap flex items-center gap-1.5 ${
            activeFilter === 'summarized'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
          }`}
        >
          <Volume2 className="w-3 h-3 text-amber-600" />
          <span>Audio Ready</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-800 font-semibold">
            {summarizedCount}
          </span>
        </button>
      </div>
    </section>
  );
};

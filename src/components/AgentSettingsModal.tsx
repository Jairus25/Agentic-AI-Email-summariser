import React from 'react';
import { 
  Radio, 
  Clock, 
  Volume2, 
  Sliders, 
  Play, 
  RefreshCw, 
  Cpu, 
  Gauge, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { AgentSettings, DigestStatus } from '../types';

interface AgentSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AgentSettings;
  onUpdateSettings: (newSettings: AgentSettings) => void;
  status: DigestStatus;
  onTriggerCheckNow: () => void;
  isChecking: boolean;
  isAuthenticated: boolean;
  onOpenOAuthHelp?: () => void;
}

export const AgentSettingsModal: React.FC<AgentSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  status,
  onTriggerCheckNow,
  isChecking,
  isAuthenticated,
  onOpenOAuthHelp,
}) => {
  if (!isOpen) return null;

  const voices = [
    { name: 'Kore', desc: 'Warm, clear, and executive (Default)' },
    { name: 'Puck', desc: 'Engaging, youthful, and energetic' },
    { name: 'Charon', desc: 'Deep, calm, and deliberate' },
    { name: 'Fenrir', desc: 'Crisp and authoritative' },
    { name: 'Zephyr', desc: 'Smooth, friendly, and natural' },
  ] as const;

  const intervals = [
    { value: 15, label: 'Every 15 min' },
    { value: 30, label: 'Every 30 min' },
    { value: 60, label: 'Every 1 hr (Default)' },
    { value: 120, label: 'Every 2 hrs' },
  ];

  const speedOptions = [0.8, 1.0, 1.25, 1.5, 2.0];

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex justify-center items-end sm:items-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-400 text-stone-950 flex items-center justify-center font-bold">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900">
                Agent & Inference Settings
              </h2>
              <p className="text-[11px] text-stone-500">
                Configure NVIDIA NIM gpt-oss-20b and audio player
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-xs font-semibold text-stone-600 hover:text-stone-950 px-2.5 py-1 rounded-lg hover:bg-stone-200 transition-colors"
          >
            Done
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Active Model Card */}
          <div className="rounded-xl bg-stone-900 text-stone-100 p-3.5 space-y-2.5 border border-stone-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-mono text-xs text-emerald-400 font-semibold">
                <Cpu className="w-3.5 h-3.5" />
                <span>NVIDIA NIM: openai/gpt-oss-20b</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                Online
              </span>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Inference powered by <strong>OpenAI GPT-OSS-20B</strong> hosted on NVIDIA NIM (21B MoE). Generates structured briefings with step-by-step chain-of-thought extraction.
            </p>

            <div className="flex items-center justify-between text-[11px] text-stone-400 pt-2 border-t border-stone-800 font-mono">
              <span>Endpoint:</span>
              <span className="text-stone-300 truncate max-w-[200px]">integrate.api.nvidia.com/v1</span>
            </div>
          </div>

          {/* Schedule Frequency */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-stone-500" />
              <span>Polling Frequency</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {intervals.map((intv) => (
                <button
                  key={intv.value}
                  onClick={() => onUpdateSettings({ ...settings, intervalMinutes: intv.value })}
                  className={`p-2.5 text-left rounded-xl border text-xs font-medium transition-all ${
                    settings.intervalMinutes === intv.value
                      ? 'border-amber-400 bg-amber-50 text-amber-950 font-semibold shadow-2xs'
                      : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {intv.label}
                </button>
              ))}
            </div>
          </div>

          {/* Default Playback Speed */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-stone-500" />
              <span>Default Audio Speed</span>
            </label>
            <div className="flex gap-2">
              {speedOptions.map((spd) => (
                <button
                  key={spd}
                  onClick={() => onUpdateSettings({ ...settings, playbackSpeed: spd })}
                  className={`flex-1 py-2 text-center rounded-xl border text-xs font-mono font-semibold transition-all ${
                    settings.playbackSpeed === spd
                      ? 'border-amber-400 bg-amber-400 text-stone-950 shadow-2xs'
                      : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Voice Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-stone-500" />
              <span>Synthesizer Voice Persona</span>
            </label>
            <div className="space-y-1.5">
              {voices.map((v) => (
                <div
                  key={v.name}
                  onClick={() => onUpdateSettings({ ...settings, voiceName: v.name as any })}
                  className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                    settings.voiceName === v.name
                      ? 'border-amber-400 bg-amber-50/80 text-amber-950 shadow-2xs'
                      : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-800'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block">{v.name}</span>
                    <span className="text-[11px] text-stone-500">{v.desc}</span>
                  </div>
                  {settings.voiceName === v.name && (
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="space-y-3 pt-2 border-t border-stone-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-stone-900 block">
                  Automatic Hourly Background Polling
                </span>
                <span className="text-[11px] text-stone-500">
                  Allow timer to regularly fetch & summarize inbox messages
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.autoCheckEnabled}
                onChange={(e) => onUpdateSettings({ ...settings, autoCheckEnabled: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-stone-900 block">
                  Continuous Auto-Advance Playlist
                </span>
                <span className="text-[11px] text-stone-500">
                  Continuously play audio briefings sequentially
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.autoPlayNext}
                onChange={(e) => onUpdateSettings({ ...settings, autoPlayNext: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Google Auth & Error 403 Troubleshooting */}
          <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Google OAuth & "Error 403" Access</span>
              </span>
              {onOpenOAuthHelp && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenOAuthHelp();
                  }}
                  className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline"
                >
                  Troubleshoot &rarr;
                </button>
              )}
            </div>
            <p className="text-[11px] text-stone-600 leading-normal">
              If Google displays <strong className="text-stone-800">"has not completed the Google verification process" (Error 403)</strong>, your account needs to be listed as an approved Test User in the Google Cloud Console, or you can log in directly using the developer's primary Google account.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 text-stone-100 text-xs font-semibold hover:bg-stone-800 transition-colors"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX,
  RotateCcw, 
  RotateCw, 
  SkipBack, 
  SkipForward, 
  Sparkles, 
  RefreshCw,
  Gauge
} from 'lucide-react';
import { EmailMessage } from '../types';

interface AudioPlayerBarProps {
  currentEmail: EmailMessage | null;
  isPlaying: boolean;
  isSynthesizing: boolean;
  currentTime: number; // in seconds
  duration: number; // in seconds
  playbackRate: number;
  onChangePlaybackRate: (speed: number) => void;
  onSeek: (seconds: number) => void;
  onSkipSeconds: (delta: number) => void;
  onPrevTrack: () => void;
  onNextTrack: () => void;
  onTogglePlay: (email: EmailMessage) => void;
  onStop: () => void;
  onSelectEmail: (email: EmailMessage) => void;
  voiceName: string;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  currentEmail,
  isPlaying,
  isSynthesizing,
  currentTime,
  duration,
  playbackRate,
  onChangePlaybackRate,
  onSeek,
  onSkipSeconds,
  onPrevTrack,
  onNextTrack,
  onTogglePlay,
  onStop,
  onSelectEmail,
  voiceName,
}) => {
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  if (!currentEmail) return null;

  const safeDuration = duration > 0 ? duration : (currentEmail.summary?.estimatedReadSeconds || 20);
  const progressPercent = Math.min(100, Math.max(0, (currentTime / safeDuration) * 100));

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const speedOptions = [0.8, 1.0, 1.25, 1.5, 2.0];

  return (
    <div
      id="mobile-audio-player-bar"
      className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 px-3 pb-3 pt-1 pointer-events-none"
    >
      <div className="pointer-events-auto bg-stone-900 text-stone-100 rounded-2xl shadow-xl border border-stone-800 p-3.5 transition-all">
        {/* Interactive Scrub Timeline Bar */}
        <div className="space-y-1 mb-2.5">
          <div className="relative group cursor-pointer">
            <input
              type="range"
              min="0"
              max={safeDuration}
              step="0.5"
              value={currentTime}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
            <span>{formatTime(currentTime)}</span>
            <div className="flex items-center gap-1 text-[10px] text-amber-400">
              {isPlaying && (
                <div className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 bg-amber-400 rounded-full animate-pulse h-2" />
                  <span className="w-0.5 bg-amber-400 rounded-full animate-pulse [animation-delay:-0.2s] h-3" />
                  <span className="w-0.5 bg-amber-400 rounded-full animate-pulse [animation-delay:-0.4s] h-1.5" />
                </div>
              )}
              <span>Voice: {voiceName}</span>
            </div>
            <span>{formatTime(safeDuration)}</span>
          </div>
        </div>

        {/* Email Metadata and Quick Click to Open */}
        <div className="flex items-center justify-between gap-3 mb-2">
          <button
            onClick={() => onSelectEmail(currentEmail)}
            className="flex-1 text-left min-w-0 group"
          >
            <p className="text-xs font-semibold text-stone-100 truncate group-hover:text-amber-300 transition-colors">
              {currentEmail.senderName}: {currentEmail.subject}
            </p>
            <p className="text-[11px] text-stone-400 truncate">
              {currentEmail.summary?.headline || currentEmail.snippet}
            </p>
          </button>

          {/* Speed chip */}
          <div className="relative">
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-[11px] font-mono font-medium text-amber-300 border border-stone-700 transition-colors"
              title="Playback speed"
            >
              {playbackRate}x
            </button>

            {showSpeedMenu && (
              <div className="absolute right-0 bottom-full mb-1 bg-stone-800 border border-stone-700 rounded-xl p-1 shadow-lg flex gap-1 z-50">
                {speedOptions.map((speed) => (
                  <button
                    key={speed}
                    onClick={() => {
                      onChangePlaybackRate(speed);
                      setShowSpeedMenu(false);
                    }}
                    className={`px-2 py-1 rounded-lg text-xs font-mono font-semibold transition-colors ${
                      playbackRate === speed
                        ? 'bg-amber-400 text-stone-950'
                        : 'text-stone-300 hover:bg-stone-700'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Interactive Deck Control Buttons */}
        <div className="flex items-center justify-between pt-1 border-t border-stone-800/80">
          <div className="flex items-center gap-1">
            <button
              onClick={onPrevTrack}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
              title="Previous email in digest"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={() => onSkipSeconds(-10)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors text-xs"
              title="Rewind 10s"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Main Play / Pause Button */}
          <div className="flex items-center gap-2">
            <button
              id="audio-player-toggle-btn"
              onClick={() => onTogglePlay(currentEmail)}
              disabled={isSynthesizing}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-stone-950 font-bold transition-all shadow-md active:scale-95 ${
                isSynthesizing
                  ? 'bg-stone-700 text-stone-400 cursor-not-allowed'
                  : 'bg-amber-400 hover:bg-amber-300'
              }`}
              title={isPlaying ? 'Pause narration' : 'Play narration'}
            >
              {isSynthesizing ? (
                <RefreshCw className="w-4 h-4 animate-spin text-stone-200" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={onStop}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
              title="Stop playback"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onSkipSeconds(10)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
              title="Forward 10s"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onNextTrack}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
              title="Next email in digest"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

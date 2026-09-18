import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Circle,
  Star,
  ChevronRight, 
  Flame, 
  Copy,
  Check,
  RefreshCw,
  Cpu,
  BrainCircuit,
  MessageSquare
} from 'lucide-react';
import { EmailMessage } from '../types';

interface EmailCardProps {
  email: EmailMessage;
  isPlaying: boolean;
  isSynthesizing: boolean;
  onPlayAudio: (email: EmailMessage) => void;
  onSelect: (email: EmailMessage) => void;
  onSummarizeNow: (email: EmailMessage) => void;
  onToggleStar: (emailId: string) => void;
  onToggleRead: (emailId: string) => void;
  onToggleActionItem: (emailId: string, actionItem: string) => void;
  isSummarizing: boolean;
}

export const EmailCard: React.FC<EmailCardProps> = ({
  email,
  isPlaying,
  isSynthesizing,
  onPlayAudio,
  onSelect,
  onSummarizeNow,
  onToggleStar,
  onToggleRead,
  onToggleActionItem,
  isSummarizing,
}) => {
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);

  const isUrgent =
    email.summary?.sentiment === 'urgent' ||
    email.priority === 'high' ||
    email.summary?.sentiment === 'action_required';

  const completedActions = email.completedActionItems || [];

  const handleCopySummary = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!email.summary) return;
    const textToCopy = `${email.summary.headline}\n\nKey Points:\n${email.summary.keyPoints.map(p => `• ${p}`).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <article
      id={`email-card-${email.id}`}
      className={`rounded-2xl border transition-all duration-200 bg-white ${
        isPlaying
          ? 'border-amber-400 shadow-md ring-2 ring-amber-400/20'
          : 'border-stone-200 hover:border-stone-300 shadow-2xs'
      } p-4 flex flex-col gap-3 relative`}
    >
      {/* Top Metadata Line & Interactive Badges */}
      <div className="flex items-center justify-between text-xs text-stone-500">
        <div className="flex items-center gap-1.5">
          {/* Read / Unread toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleRead(email.id);
            }}
            className="p-0.5 -ml-0.5 rounded text-stone-400 hover:text-stone-700 transition-colors"
            title={email.read ? 'Mark as unread' : 'Mark as read'}
          >
            <span
              className={`w-2 h-2 rounded-full inline-block transition-colors ${
                email.read ? 'bg-stone-300' : 'bg-blue-600 ring-2 ring-blue-100'
              }`}
            />
          </button>

          {isUrgent ? (
            <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-[11px] bg-rose-50 text-rose-700 border border-rose-200">
              <Flame className="w-3 h-3 text-rose-600" />
              Action Required
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded-full text-[11px] bg-stone-100 text-stone-700 capitalize">
              {email.category || 'general'}
            </span>
          )}

          {/* Model indicator tag */}
          {email.summary && (
            <span className="text-[10px] font-mono text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded flex items-center gap-1">
              <Cpu className="w-2.5 h-2.5 text-stone-400" />
              <span>gpt-oss-20b</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-stone-400 text-[11px]">{email.date}</span>

          {/* Star toggle button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar(email.id);
            }}
            className={`p-1 rounded-lg transition-colors ${
              email.starred
                ? 'text-amber-500 hover:text-amber-600'
                : 'text-stone-300 hover:text-stone-500'
            }`}
            title={email.starred ? 'Remove star' : 'Star email'}
          >
            <Star className={`w-3.5 h-3.5 ${email.starred ? 'fill-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Header Info */}
      <div 
        onClick={() => onSelect(email)}
        className="cursor-pointer group"
      >
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <h3 className="font-semibold text-stone-900 text-sm tracking-tight truncate group-hover:text-amber-800 transition-colors">
            {email.senderName}
          </h3>
          <span className="text-[11px] text-stone-400 truncate max-w-[130px] font-mono">
            {email.sender}
          </span>
        </div>
        <p className="text-xs font-medium text-stone-800 line-clamp-1">
          {email.subject}
        </p>
      </div>

      {/* AI Summary Highlight Box */}
      {email.summary ? (
        <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-stone-900 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Executive Briefing</span>
            </div>

            <div className="flex items-center gap-1.5">
              {email.summary.reasoning && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowReasoning(!showReasoning);
                  }}
                  className="text-[10px] text-stone-500 hover:text-stone-800 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-stone-200 transition-colors"
                  title="View model chain-of-thought"
                >
                  <BrainCircuit className="w-3 h-3 text-stone-500" />
                  <span>{showReasoning ? 'Hide CoT' : 'Reasoning'}</span>
                </button>
              )}

              <button
                onClick={handleCopySummary}
                className="text-[10px] text-stone-500 hover:text-stone-800 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-stone-200 transition-colors"
                title="Copy summary text"
              >
                {copiedSummary ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <p 
            onClick={() => onSelect(email)}
            className="text-xs text-stone-800 font-medium leading-relaxed cursor-pointer"
          >
            {email.summary.headline}
          </p>

          {/* Expandable Reasoning from GPT-OSS-20B */}
          {showReasoning && email.summary.reasoning && (
            <div className="p-2 rounded-lg bg-stone-100 border border-stone-200 text-[11px] text-stone-600 font-mono leading-normal animate-in fade-in duration-150">
              <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                <span>GPT-OSS-20B Chain of Thought:</span>
              </div>
              <p>{email.summary.reasoning}</p>
            </div>
          )}

          {/* Interactive Checklist for Action Items */}
          {email.summary.actionItems &&
            email.summary.actionItems.length > 0 &&
            email.summary.actionItems[0] !== 'None' && (
              <div className="pt-2 border-t border-stone-200/80 space-y-1">
                <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
                  Interactive Action Checklist
                </span>
                {email.summary.actionItems.map((action, idx) => {
                  const isDone = completedActions.includes(action);
                  return (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleActionItem(email.id, action);
                      }}
                      className={`w-full text-left flex items-start gap-2 text-xs p-1.5 rounded-lg border transition-colors ${
                        isDone
                          ? 'bg-emerald-50/70 border-emerald-200 text-stone-500 line-through'
                          : 'bg-white border-stone-200 text-stone-800 hover:border-amber-300'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-stone-400 mt-0.5 shrink-0" />
                      )}
                      <span className="leading-tight">{action}</span>
                    </button>
                  );
                })}
              </div>
            )}
        </div>
      ) : (
        <div 
          onClick={() => onSelect(email)}
          className="bg-stone-50 rounded-xl p-3 text-xs text-stone-500 line-clamp-2 cursor-pointer"
        >
          {email.snippet || email.bodySnippet || 'No preview available.'}
        </div>
      )}

      {/* Card Footer Actions */}
      <div className="flex items-center justify-between pt-1 border-t border-stone-100">
        {email.summary ? (
          <button
            id={`play-audio-btn-${email.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onPlayAudio(email);
            }}
            disabled={isSynthesizing}
            className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${
              isPlaying
                ? 'bg-amber-400 text-stone-950 shadow-xs'
                : 'bg-stone-900 text-stone-100 hover:bg-stone-800 active:scale-95'
            }`}
          >
            {isSynthesizing ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Synthesizing...</span>
              </>
            ) : isPlaying ? (
              <>
                <Pause className="w-3 h-3 fill-current" />
                <span>Pause Audio</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current ml-0.5" />
                <span>Listen ({email.summary.estimatedReadSeconds || 18}s)</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSummarizeNow(email);
            }}
            disabled={isSummarizing}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-900 bg-amber-300 hover:bg-amber-400 px-3 py-1.5 rounded-xl transition-colors active:scale-95"
          >
            {isSummarizing ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Reasoning with NIM...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3" />
                <span>Summarize (NIM)</span>
              </>
            )}
          </button>
        )}

        {/* View Details Link */}
        <button
          onClick={() => onSelect(email)}
          className="text-xs text-stone-600 hover:text-stone-950 inline-flex items-center gap-0.5 font-medium transition-colors p-1"
        >
          <span>Full Email</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </article>
  );
};

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Volume2, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Circle,
  AlertTriangle, 
  Mail, 
  User, 
  Calendar,
  Copy,
  Check,
  RefreshCw,
  Cpu,
  BrainCircuit,
  MessageSquare,
  Share2
} from 'lucide-react';
import { EmailMessage } from '../types';

interface EmailDetailModalProps {
  email: EmailMessage | null;
  onClose: () => void;
  isPlaying: boolean;
  isSynthesizing: boolean;
  onTogglePlay: (email: EmailMessage) => void;
  onRegenerateSummary: (email: EmailMessage) => void;
  onToggleActionItem: (emailId: string, actionItem: string) => void;
  isSummarizing: boolean;
  voiceName: string;
}

export const EmailDetailModal: React.FC<EmailDetailModalProps> = ({
  email,
  onClose,
  isPlaying,
  isSynthesizing,
  onTogglePlay,
  onRegenerateSummary,
  onToggleActionItem,
  isSummarizing,
  voiceName,
}) => {
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [showChainOfThought, setShowChainOfThought] = useState(true);

  if (!email) return null;

  const completedActions = email.completedActionItems || [];

  const handleCopyScript = () => {
    if (!email.summary?.audioNarrationText) return;
    navigator.clipboard.writeText(email.summary.audioNarrationText);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleCopyReplyDraft = () => {
    const draft = `Hi ${email.senderName},\n\nThank you for your email regarding "${email.subject}". I've received your note and am on it.\n\nBest regards,`;
    navigator.clipboard.writeText(draft);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex justify-center items-end sm:items-center p-0 sm:p-4">
      <div 
        className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200 animate-in slide-in-from-bottom duration-200"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 bg-stone-50">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-stone-950 transition-colors p-1 -ml-1 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Inbox</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-stone-600 bg-stone-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Cpu className="w-3 h-3 text-stone-600" />
              <span>NVIDIA NIM · gpt-oss-20b</span>
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 capitalize border border-stone-200">
              {email.category || 'General'}
            </span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Title & Metadata */}
          <div>
            <h2 className="text-base font-bold text-stone-900 tracking-tight leading-snug mb-2">
              {email.subject}
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
              <div className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-stone-400" />
                <span className="font-semibold text-stone-800">{email.senderName}</span>
                <span className="text-stone-400 font-mono">({email.sender})</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <span>{email.date}</span>
              </div>
            </div>
          </div>

          {/* AI Executive Audio & Summary Card */}
          <div className="rounded-2xl bg-stone-50 border border-stone-200 p-4 space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold shadow-2xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-stone-900">
                    Executive Briefing & Audio
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Voice: {voiceName} • Generated via NVIDIA NIM
                  </p>
                </div>
              </div>

              <button
                onClick={() => onRegenerateSummary(email)}
                disabled={isSummarizing}
                className="text-[11px] font-medium text-stone-700 hover:text-stone-950 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-200/80 hover:bg-stone-300 transition-colors"
                title="Re-run NIM reasoning on email"
              >
                <RefreshCw className={`w-3 h-3 ${isSummarizing ? 'animate-spin' : ''}`} />
                <span>{isSummarizing ? 'Reasoning...' : 'Re-summarize'}</span>
              </button>
            </div>

            {email.summary ? (
              <>
                {/* Headline */}
                <div className="bg-white p-3 rounded-xl border border-stone-200 text-xs font-semibold text-stone-900 leading-relaxed">
                  {email.summary.headline}
                </div>

                {/* Key Points */}
                <div>
                  <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                    Key Points
                  </h4>
                  <ul className="space-y-1.5 text-xs text-stone-700">
                    {email.summary.keyPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span className="leading-normal">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Interactive Action Items Checklist */}
                {email.summary.actionItems && email.summary.actionItems.length > 0 && (
                  <div className="pt-2 border-t border-stone-200">
                    <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Action Checklist (Tap to complete)</span>
                      </span>
                    </h4>
                    <div className="space-y-1.5">
                      {email.summary.actionItems.map((act, i) => {
                        const isDone = completedActions.includes(act);
                        return (
                          <button
                            key={i}
                            onClick={() => onToggleActionItem(email.id, act)}
                            className={`w-full text-left text-xs px-3 py-2 rounded-xl border transition-colors flex items-start gap-2 font-medium ${
                              isDone
                                ? 'bg-emerald-50 border-emerald-200 text-stone-500 line-through'
                                : 'bg-white text-stone-800 border-stone-200 hover:border-amber-300'
                            }`}
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-stone-400 mt-0.5 shrink-0" />
                            )}
                            <span className="leading-tight">{act}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* GPT-OSS-20B Chain-of-Thought Reasoning Section */}
                {email.summary.reasoning && (
                  <div className="pt-2 border-t border-stone-200">
                    <button
                      onClick={() => setShowChainOfThought(!showChainOfThought)}
                      className="flex items-center justify-between w-full text-xs font-bold text-stone-700 hover:text-stone-900 py-1"
                    >
                      <span className="flex items-center gap-1.5 font-mono text-[11px]">
                        <BrainCircuit className="w-3.5 h-3.5 text-amber-600" />
                        <span>GPT-OSS-20B Reasoning Output</span>
                      </span>
                      <span className="text-[10px] text-stone-400 font-normal">
                        {showChainOfThought ? 'Collapse' : 'Expand'}
                      </span>
                    </button>

                    {showChainOfThought && (
                      <div className="p-3 rounded-xl bg-stone-100 border border-stone-200 text-[11px] text-stone-700 font-mono leading-relaxed mt-1">
                        {email.summary.reasoning}
                      </div>
                    )}
                  </div>
                )}

                {/* Audio Player and Quick Actions */}
                <div className="pt-2 border-t border-stone-200 space-y-2">
                  <button
                    onClick={() => onTogglePlay(email)}
                    disabled={isSynthesizing}
                    className={`w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-xs ${
                      isPlaying
                        ? 'bg-amber-400 text-stone-950 hover:bg-amber-300'
                        : 'bg-stone-900 text-stone-100 hover:bg-stone-800 active:scale-[0.98]'
                    }`}
                  >
                    {isSynthesizing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                        <span>Synthesizing Voice...</span>
                      </>
                    ) : isPlaying ? (
                      <>
                        <Pause className="w-4 h-4 fill-current" />
                        <span>Pause Audio Briefing</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                        <span>Play Audio Briefing ({email.summary.estimatedReadSeconds || 18}s)</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyScript}
                      className="flex-1 py-1.5 px-3 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedScript ? 'Narration Copied' : 'Copy Audio Script'}</span>
                    </button>

                    <button
                      onClick={handleCopyReplyDraft}
                      className="flex-1 py-1.5 px-3 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      {copiedDraft ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <MessageSquare className="w-3.5 h-3.5" />}
                      <span>{copiedDraft ? 'Reply Copied' : 'Copy Quick Reply'}</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-4 text-center">
                <button
                  onClick={() => onRegenerateSummary(email)}
                  disabled={isSummarizing}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 text-stone-950 text-xs font-semibold hover:bg-amber-300 transition-colors shadow-xs"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSummarizing ? 'Reasoning with NIM...' : 'Generate Briefing via GPT-OSS-20B'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Original Email Content */}
          <div>
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
              Original Message Body
            </h4>
            <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200 text-xs text-stone-700 leading-relaxed font-mono whitespace-pre-wrap max-h-52 overflow-y-auto">
              {email.bodySnippet || email.snippet || '(Empty email content)'}
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 text-stone-100 text-xs font-semibold hover:bg-stone-800 transition-colors active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

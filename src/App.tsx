import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Radio, 
  Sparkles, 
  Search, 
  RefreshCw, 
  LogOut, 
  Inbox, 
  CheckCheck,
  CheckCircle2,
  Sliders,
  AlertCircle,
  Plus
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { EmailMessage, DigestStatus, AgentSettings } from './types';
import { SAMPLE_EMAILS } from './data/sampleEmails';
import { initAuth, googleSignIn, logoutGoogle, getCachedAccessToken } from './services/firebaseAuth';
import { fetchRecentEmails } from './services/gmailClient';
import { createPlayableAudioUrl, speakWithBrowserSynthesis } from './utils/audioPlayer';
import { DashboardStats } from './components/DashboardStats';
import { EmailCard } from './components/EmailCard';
import { EmailDetailModal } from './components/EmailDetailModal';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { AgentSettingsModal } from './components/AgentSettingsModal';
import { GoogleSignInButton } from './components/GoogleSignInButton';
import { OAuthHelpModal } from './components/OAuthHelpModal';
import { AddEmailModal } from './components/AddEmailModal';

export default function App() {
  // Auth state
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [isOAuthHelpOpen, setIsOAuthHelpOpen] = useState(false);
  const [isAddEmailOpen, setIsAddEmailOpen] = useState(false);

  // Email storage
  const [emails, setEmails] = useState<EmailMessage[]>(() => {
    const saved = localStorage.getItem('email_agent_emails');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return SAMPLE_EMAILS;
  });

  // Settings
  const [settings, setSettings] = useState<AgentSettings>(() => {
    const saved = localStorage.getItem('email_agent_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return {
      autoCheckEnabled: true,
      intervalMinutes: 60, // hourly
      voiceName: 'Kore',
      maxEmailsPerRun: 8,
      autoPlayNext: true,
      highPriorityAlerts: true,
      playbackSpeed: 1.0,
    };
  });

  // Agent Digest Status
  const [status, setStatus] = useState<DigestStatus>(() => ({
    lastChecked: Date.now() - 1000 * 60 * 15,
    nextCheck: Date.now() + 1000 * 60 * 45,
    intervalMinutes: 60,
    status: 'idle',
    emailsProcessed: 4,
    lastModelUsed: 'openai/gpt-oss-20b',
  }));

  // UI state
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'urgent' | 'starred' | 'summarized'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncingGmail, setIsSyncingGmail] = useState(false);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [synthesizingId, setSynthesizingId] = useState<string | null>(null);
  const [isBatchSummarizing, setIsBatchSummarizing] = useState(false);

  // Audio Playback
  const [currentPlayingEmail, setCurrentPlayingEmail] = useState<EmailMessage | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(settings.playbackSpeed || 1.0);

  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const browserSpeechCancelRef = useRef<(() => void) | null>(null);

  // Save state
  useEffect(() => {
    localStorage.setItem('email_agent_emails', JSON.stringify(emails));
  }, [emails]);

  useEffect(() => {
    localStorage.setItem('email_agent_settings', JSON.stringify(settings));
  }, [settings]);

  // Firebase Auth initialization
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        setNeedsAuth(false);
      },
      () => {
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  // Sync emails from Gmail when token is present
  const handleFetchGmail = async (accessToken: string) => {
    setIsSyncingGmail(true);
    setStatus((prev) => ({ ...prev, status: 'checking' }));
    try {
      const fetched = await fetchRecentEmails(accessToken, settings.maxEmailsPerRun);
      if (fetched.length > 0) {
        setEmails((existing) => {
          return fetched.map((newMsg) => {
            const match = existing.find((old) => old.id === newMsg.id);
            if (match && match.summary) {
              return { 
                ...newMsg, 
                summary: match.summary, 
                audioBase64: match.audioBase64,
                starred: match.starred,
                completedActionItems: match.completedActionItems
              };
            }
            return newMsg;
          });
        });

        // Automatically summarize newly fetched emails via NVIDIA NIM
        for (const item of fetched) {
          const already = emails.find((e) => e.id === item.id && e.summary);
          if (!already) {
            summarizeSingleEmail(item);
          }
        }
      }

      setStatus((prev) => ({
        ...prev,
        lastChecked: Date.now(),
        nextCheck: Date.now() + settings.intervalMinutes * 60 * 1000,
        status: 'idle',
        emailsProcessed: fetched.length,
        lastModelUsed: 'openai/gpt-oss-20b',
      }));
    } catch (err: any) {
      console.error('Gmail sync error:', err);
      if (err.message === 'AUTH_EXPIRED') {
        setNeedsAuth(true);
      }
      setStatus((prev) => ({
        ...prev,
        status: 'error',
        lastError: err.message || 'Failed to sync Gmail',
      }));
    } finally {
      setIsSyncingGmail(false);
    }
  };

  // Login handler
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setAuthNotice(null);
    try {
      const res = await googleSignIn();
      if (res.cancelled) {
        // User closed the popup, silently return without error
        return;
      }
      if (res.isAccessDenied || res.error?.includes('Error 403') || res.error?.includes('access_denied')) {
        setAuthNotice('Google access blocked (Error 403: app in testing mode). Only registered test users or the developer account can sign in.');
        setIsOAuthHelpOpen(true);
        return;
      }
      if (res.error) {
        setAuthNotice(res.error);
        return;
      }
      if (res.user && res.accessToken) {
        setUser(res.user);
        setToken(res.accessToken);
        setNeedsAuth(false);
        setAuthNotice(null);
        await handleFetchGmail(res.accessToken);
      }
    } catch (err: any) {
      console.warn('Sign-in status:', err?.message || err);
      setAuthNotice('Google sign-in was blocked or cancelled.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Add custom email to inbox and trigger immediate NVIDIA NIM analysis
  const handleAddCustomEmail = (newEmailData: Omit<EmailMessage, 'id'>) => {
    const newEmail: EmailMessage = {
      ...newEmailData,
      id: 'custom-' + Date.now(),
    };
    setEmails((prev) => [newEmail, ...prev]);
    // Immediately process with NVIDIA NIM
    setTimeout(() => {
      summarizeSingleEmail(newEmail);
    }, 200);
  };

  // Safe manual check: syncs Gmail if connected, or refreshes current briefing & NIM analysis
  const handleManualCheck = async () => {
    const currentToken = getCachedAccessToken() || token;
    if (currentToken) {
      await handleFetchGmail(currentToken);
    } else {
      setIsSyncingGmail(true);
      setStatus((prev) => ({ ...prev, status: 'checking' }));
      setTimeout(() => {
        for (const item of emails) {
          if (!item.summary) {
            summarizeSingleEmail(item);
          }
        }
        setStatus((prev) => ({
          ...prev,
          lastChecked: Date.now(),
          nextCheck: Date.now() + settings.intervalMinutes * 60 * 1000,
          status: 'idle',
          emailsProcessed: emails.length,
          lastModelUsed: 'openai/gpt-oss-20b',
        }));
        setIsSyncingGmail(false);
      }, 500);
    }
  };

  const handleLogout = async () => {
    await logoutGoogle();
    setUser(null);
    setToken(null);
    setNeedsAuth(true);
  };

  // Summarize email via NVIDIA NIM GPT-OSS-20B
  const summarizeSingleEmail = async (email: EmailMessage) => {
    setSummarizingId(email.id);
    try {
      const resp = await fetch('/api/email/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: email.sender,
          senderName: email.senderName,
          subject: email.subject,
          bodySnippet: email.bodySnippet || email.snippet,
          date: email.date,
        }),
      });

      if (!resp.ok) {
        throw new Error('Failed to summarize email via NVIDIA NIM');
      }

      const data = await resp.json();
      const summary = data.summary;

      setEmails((prev) =>
        prev.map((e) => {
          if (e.id === email.id) {
            return {
              ...e,
              summary: summary,
              priority: summary.priority || e.priority,
              category: summary.category || e.category,
              inferenceLatencyMs: data.latencyMs,
            };
          }
          return e;
        })
      );

      // Pre-synthesize audio narration
      if (summary?.audioNarrationText) {
        synthesizeAudioForEmail(email.id, summary.audioNarrationText);
      }
    } catch (e) {
      console.error('NVIDIA NIM Summarize error:', e);
    } finally {
      setSummarizingId(null);
    }
  };

  // Batch summarize all unsummarized emails
  const handleSummarizeAllUnread = async () => {
    setIsBatchSummarizing(true);
    try {
      for (const email of emails) {
        if (!email.summary) {
          await summarizeSingleEmail(email);
        }
      }
    } finally {
      setIsBatchSummarizing(false);
    }
  };

  // Generate audio via server TTS endpoint
  const synthesizeAudioForEmail = async (emailId: string, narrationText: string): Promise<string | null> => {
    setSynthesizingId(emailId);
    try {
      const resp = await fetch('/api/email/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: narrationText,
          voiceName: settings.voiceName,
        }),
      });

      if (!resp.ok) {
        throw new Error('TTS generation returned error');
      }

      const data = await resp.json();
      const base64Audio = data.audioBase64;

      setEmails((prev) =>
        prev.map((e) => (e.id === emailId ? { ...e, audioBase64: base64Audio, hasAudio: true } : e))
      );

      return base64Audio;
    } catch (e) {
      console.warn('TTS failed, falling back to Web Speech Synthesis:', e);
      return null;
    } finally {
      setSynthesizingId(null);
    }
  };

  // Play audio summary for an email
  const handleToggleAudio = async (email: EmailMessage) => {
    if (currentPlayingEmail?.id === email.id && isPlaying) {
      stopAudioPlayback();
      return;
    }

    stopAudioPlayback();
    setCurrentPlayingEmail(email);

    let audioBase64 = email.audioBase64;
    if (!audioBase64 && email.summary?.audioNarrationText) {
      audioBase64 = (await synthesizeAudioForEmail(email.id, email.summary.audioNarrationText)) || undefined;
    }

    const narrationScript = email.summary?.audioNarrationText || `${email.subject}. From ${email.senderName}.`;

    if (audioBase64) {
      try {
        const audioUrl = createPlayableAudioUrl(audioBase64, true);
        const audio = new Audio(audioUrl);
        audioElementRef.current = audio;
        audio.playbackRate = playbackSpeed;

        audio.onloadedmetadata = () => {
          setAudioDuration(audio.duration);
        };

        audio.ontimeupdate = () => {
          setCurrentTime(audio.currentTime);
          if (audio.duration) {
            setAudioDuration(audio.duration);
          }
        };

        audio.onended = () => {
          setIsPlaying(false);
          setCurrentTime(0);
          handleAudioFinished(email);
        };

        audio.onerror = () => {
          fallbackToSpeech(narrationScript, email);
        };

        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        fallbackToSpeech(narrationScript, email);
      }
    } else {
      fallbackToSpeech(narrationScript, email);
    }
  };

  const fallbackToSpeech = (text: string, email: EmailMessage) => {
    setIsPlaying(true);
    setCurrentTime(0);
    setAudioDuration(email.summary?.estimatedReadSeconds || 20);
    const cancel = speakWithBrowserSynthesis(text, () => {
      setIsPlaying(false);
      setCurrentTime(0);
      handleAudioFinished(email);
    });
    browserSpeechCancelRef.current = cancel;
  };

  const stopAudioPlayback = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
      audioElementRef.current = null;
    }
    if (browserSpeechCancelRef.current) {
      browserSpeechCancelRef.current();
      browserSpeechCancelRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleAudioFinished = (finishedEmail: EmailMessage) => {
    if (!settings.autoPlayNext) return;

    const currentIndex = emails.findIndex((e) => e.id === finishedEmail.id);
    if (currentIndex !== -1 && currentIndex + 1 < emails.length) {
      const nextEmail = emails[currentIndex + 1];
      setTimeout(() => {
        handleToggleAudio(nextEmail);
      }, 700);
    }
  };

  // Audio Scrubbing & Controls
  const handleSeek = (seconds: number) => {
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  const handleSkipSeconds = (delta: number) => {
    if (audioElementRef.current) {
      const newTime = Math.max(0, Math.min(audioDuration, audioElementRef.current.currentTime + delta));
      audioElementRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleChangePlaybackRate = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioElementRef.current) {
      audioElementRef.current.playbackRate = speed;
    }
    setSettings((prev) => ({ ...prev, playbackSpeed: speed }));
  };

  const handlePrevTrack = () => {
    if (!currentPlayingEmail) return;
    const idx = emails.findIndex((e) => e.id === currentPlayingEmail.id);
    if (idx > 0) {
      handleToggleAudio(emails[idx - 1]);
    }
  };

  const handleNextTrack = () => {
    if (!currentPlayingEmail) return;
    const idx = emails.findIndex((e) => e.id === currentPlayingEmail.id);
    if (idx !== -1 && idx + 1 < emails.length) {
      handleToggleAudio(emails[idx + 1]);
    }
  };

  const handlePlayAllDigest = () => {
    const firstSummarized = emails.find((e) => !!e.summary) || emails[0];
    if (firstSummarized) {
      handleToggleAudio(firstSummarized);
    }
  };

  // Interactive Inbox Item Actions
  const handleToggleStar = (emailId: string) => {
    setEmails((prev) =>
      prev.map((e) => (e.id === emailId ? { ...e, starred: !e.starred } : e))
    );
  };

  const handleToggleRead = (emailId: string) => {
    setEmails((prev) =>
      prev.map((e) => (e.id === emailId ? { ...e, read: !e.read } : e))
    );
  };

  const handleToggleActionItem = (emailId: string, actionItem: string) => {
    setEmails((prev) =>
      prev.map((e) => {
        if (e.id !== emailId) return e;
        const current = e.completedActionItems || [];
        const next = current.includes(actionItem)
          ? current.filter((a) => a !== actionItem)
          : [...current, actionItem];
        return { ...e, completedActionItems: next };
      })
    );
  };

  // Hourly background agent ticker
  useEffect(() => {
    if (!settings.autoCheckEnabled) return;

    const intervalMs = settings.intervalMinutes * 60 * 1000;
    const timer = setInterval(() => {
      console.log('⏰ Hourly Email Agent check triggered via NVIDIA NIM...');
      const currentToken = getCachedAccessToken() || token;
      if (currentToken) {
        handleFetchGmail(currentToken);
      } else {
        setStatus((prev) => ({
          ...prev,
          lastChecked: Date.now(),
          nextCheck: Date.now() + intervalMs,
        }));
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [settings.autoCheckEnabled, settings.intervalMinutes, token]);

  // Filter and search
  const filteredEmails = useMemo(() => {
    return emails.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          item.subject.toLowerCase().includes(q) ||
          item.senderName.toLowerCase().includes(q) ||
          item.sender.toLowerCase().includes(q) ||
          item.summary?.headline.toLowerCase().includes(q);
        if (!match) return false;
      }

      if (activeFilter === 'unread') return !item.read;
      if (activeFilter === 'starred') return !!item.starred;
      if (activeFilter === 'urgent') {
        return (
          item.summary?.sentiment === 'urgent' ||
          item.summary?.sentiment === 'action_required' ||
          item.priority === 'high'
        );
      }
      if (activeFilter === 'summarized') return !!item.summary;
      return true;
    });
  }, [emails, activeFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex justify-center selection:bg-amber-200">
      {/* Mobile App Container Frame */}
      <div className="w-full max-w-md min-h-screen bg-stone-50 border-x border-stone-200 flex flex-col relative pb-36">
        
        {/* Top App Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 px-4 py-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold shadow-2xs">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-bold tracking-tight text-stone-900">
                  AudioMail Agent
                </h1>
                <span className="text-[9px] font-mono px-1.5 py-0.2 bg-stone-100 text-stone-600 rounded border border-stone-200">
                  NVIDIA NIM
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-stone-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                <span>Every {settings.intervalMinutes}m • Voice: {settings.voiceName}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-1.5 bg-stone-100 px-2 py-1 rounded-full border border-stone-200 text-xs">
                <span className="text-[11px] font-medium text-stone-700 truncate max-w-[85px]">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  title="Sign out of Gmail"
                  className="text-stone-400 hover:text-rose-600 p-0.5 rounded transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <GoogleSignInButton 
                onClick={handleGoogleLogin} 
                isLoading={isLoggingIn} 
                onOpenHelp={() => setIsOAuthHelpOpen(true)}
              />
            )}

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors"
              title="Agent Settings"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main Content Dashboard */}
        <main className="flex-1 p-4 overflow-y-auto space-y-4">
          {/* Informative Auth / Popup Notice Banner */}
          {authNotice && (
            <div className="bg-amber-50 border border-amber-200 text-amber-950 rounded-2xl p-3 text-xs flex items-start justify-between gap-2 shadow-2xs">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="font-semibold text-amber-900">Sign-in Notice</p>
                  <p className="text-[11px] text-amber-800 leading-normal">{authNotice}</p>
                  <button
                    onClick={() => setIsOAuthHelpOpen(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 hover:underline pt-0.5"
                  >
                    <span>How to fix Error 403 / Allow joyboyluffy2019 &rarr;</span>
                  </button>
                </div>
              </div>
              <button
                onClick={() => setAuthNotice(null)}
                className="text-amber-600 hover:text-amber-950 text-xs px-1 font-semibold"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          )}

          {/* Top Audio Digest Card & Interactive Deck */}
          <DashboardStats
            emails={emails}
            status={status}
            settings={settings}
            onPlayAllBriefing={handlePlayAllDigest}
            isAudioActive={isPlaying}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onTriggerCheck={handleManualCheck}
            isChecking={isSyncingGmail}
            isAuthenticated={!!user}
            userEmail={user?.email}
            activeFilter={activeFilter}
            onSelectFilter={setActiveFilter}
            onToggleAutoPlay={() =>
              setSettings((s) => ({ ...s, autoPlayNext: !s.autoPlayNext }))
            }
          />

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sender, subject, or AI summary..."
              className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-8 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs px-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Email Inbox Stream Header with Batch Actions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-500 font-medium px-1">
              <span>Inbox Feed ({filteredEmails.length})</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsAddEmailOpen(true)}
                  className="hover:text-stone-900 inline-flex items-center gap-1 transition-colors text-[11px] text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 px-2 py-0.5 rounded-lg font-semibold"
                  title="Paste or compose custom email to analyze with NVIDIA NIM"
                >
                  <Plus className="w-3 h-3 text-stone-600" />
                  <span>Add Email</span>
                </button>

                <button
                  onClick={handleSummarizeAllUnread}
                  disabled={isBatchSummarizing}
                  className="hover:text-amber-800 text-[11px] font-semibold text-amber-700 inline-flex items-center gap-1 transition-colors"
                  title="Summarize all emails using NVIDIA NIM"
                >
                  <Sparkles className={`w-3 h-3 ${isBatchSummarizing ? 'animate-spin' : ''}`} />
                  <span>{isBatchSummarizing ? 'Processing...' : 'Summarize'}</span>
                </button>

                <button
                  onClick={() => {
                    const currentToken = getCachedAccessToken() || token;
                    if (currentToken) handleFetchGmail(currentToken);
                    else handleManualCheck();
                  }}
                  disabled={isSyncingGmail}
                  className="hover:text-stone-900 inline-flex items-center gap-1 transition-colors text-[11px]"
                  title="Sync inbox"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncingGmail ? 'animate-spin text-amber-500' : ''}`} />
                  <span>Sync</span>
                </button>
              </div>
            </div>

            {/* Email List */}
            {filteredEmails.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-2">
                <Inbox className="w-8 h-8 text-stone-400 mx-auto" />
                <p className="text-xs font-semibold text-stone-800">No emails match your filter</p>
                <p className="text-[11px] text-stone-500">
                  Try clearing the search query or reset filter to "All".
                </p>
                <button
                  onClick={() => {
                    setActiveFilter('all');
                    setSearchQuery('');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-stone-900 text-stone-100 text-xs font-medium hover:bg-stone-800"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredEmails.map((email) => (
                <EmailCard
                  key={email.id}
                  email={email}
                  isPlaying={isPlaying && currentPlayingEmail?.id === email.id}
                  isSynthesizing={synthesizingId === email.id}
                  onPlayAudio={handleToggleAudio}
                  onSelect={(item) => setSelectedEmail(item)}
                  onSummarizeNow={summarizeSingleEmail}
                  onToggleStar={handleToggleStar}
                  onToggleRead={handleToggleRead}
                  onToggleActionItem={handleToggleActionItem}
                  isSummarizing={summarizingId === email.id}
                />
              ))
            )}
          </div>
        </main>

        {/* Floating Persistent Interactive Audio Player Bar */}
        <AudioPlayerBar
          currentEmail={currentPlayingEmail}
          isPlaying={isPlaying}
          isSynthesizing={synthesizingId === currentPlayingEmail?.id}
          currentTime={currentTime}
          duration={audioDuration}
          playbackRate={playbackSpeed}
          onChangePlaybackRate={handleChangePlaybackRate}
          onSeek={handleSeek}
          onSkipSeconds={handleSkipSeconds}
          onPrevTrack={handlePrevTrack}
          onNextTrack={handleNextTrack}
          onTogglePlay={handleToggleAudio}
          onStop={stopAudioPlayback}
          onSelectEmail={(item) => setSelectedEmail(item)}
          voiceName={settings.voiceName}
        />

        {/* Detail Modal */}
        <EmailDetailModal
          email={selectedEmail}
          onClose={() => setSelectedEmail(null)}
          isPlaying={isPlaying && currentPlayingEmail?.id === selectedEmail?.id}
          isSynthesizing={synthesizingId === selectedEmail?.id}
          onTogglePlay={handleToggleAudio}
          onRegenerateSummary={summarizeSingleEmail}
          onToggleActionItem={handleToggleActionItem}
          isSummarizing={summarizingId === selectedEmail?.id}
          voiceName={settings.voiceName}
        />

        {/* Settings Modal */}
        <AgentSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onUpdateSettings={(newSettings) => setSettings(newSettings)}
          status={status}
          onTriggerCheckNow={handleManualCheck}
          isChecking={isSyncingGmail}
          isAuthenticated={!!user}
          onOpenOAuthHelp={() => setIsOAuthHelpOpen(true)}
        />

        {/* OAuth 403 Access Help Modal */}
        <OAuthHelpModal
          isOpen={isOAuthHelpOpen}
          onClose={() => setIsOAuthHelpOpen(false)}
          onOpenAddEmail={() => setIsAddEmailOpen(true)}
        />

        {/* Add / Compose Custom Email Modal */}
        <AddEmailModal
          isOpen={isAddEmailOpen}
          onClose={() => setIsAddEmailOpen(false)}
          onAddEmail={handleAddCustomEmail}
        />
      </div>
    </div>
  );
}

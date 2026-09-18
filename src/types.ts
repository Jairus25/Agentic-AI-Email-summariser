export interface EmailMessage {
  id: string;
  threadId?: string;
  sender: string;
  senderName: string;
  subject: string;
  snippet: string;
  bodySnippet: string;
  date: string;
  timestamp: number;
  read?: boolean;
  starred?: boolean;
  priority?: 'high' | 'medium' | 'low';
  category?: 'work' | 'personal' | 'updates' | 'finance' | 'general';
  
  // AI summary and audio
  summary?: EmailSummary;
  audioBase64?: string; // base64 pcm 24kHz audio from Gemini TTS
  audioDurationSeconds?: number;
  hasAudio?: boolean;
  completedActionItems?: string[];
  inferenceLatencyMs?: number;
}

export interface EmailSummary {
  headline: string;
  keyPoints: string[];
  actionItems: string[];
  sentiment: 'positive' | 'urgent' | 'neutral' | 'action_required';
  audioNarrationText: string;
  estimatedReadSeconds: number;
  reasoning?: string; // Chain-of-thought from GPT-OSS-20B
}

export interface DigestStatus {
  lastChecked: number | null;
  nextCheck: number | null;
  intervalMinutes: number;
  status: 'idle' | 'checking' | 'summarizing' | 'generating_audio' | 'error';
  lastError?: string;
  emailsProcessed: number;
  lastModelUsed?: string;
  lastLatencyMs?: number;
}

export interface AgentSettings {
  autoCheckEnabled: boolean;
  intervalMinutes: number; // default 60 (hourly)
  voiceName: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
  maxEmailsPerRun: number;
  autoPlayNext: boolean;
  highPriorityAlerts: boolean;
  playbackSpeed: number; // 1, 1.25, 1.5, 2.0
}

import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldAlert, 
  UserCheck, 
  PlusCircle, 
  X 
} from 'lucide-react';

interface OAuthHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddEmail?: () => void;
}

export const OAuthHelpModal: React.FC<OAuthHelpModalProps> = ({
  isOpen,
  onClose,
  onOpenAddEmail,
}) => {
  const [copiedEmail, setCopiedEmail] = React.useState(false);
  const [copiedLink, setCopiedLink] = React.useState(false);

  if (!isOpen) return null;

  const cloudConsoleUrl = 'https://console.cloud.google.com/apis/credentials/consent?project=gen-lang-client-0243169433';
  const developerEmail = 'erenuzumaki850@gmail.com';

  const handleCopy = (text: string, type: 'email' | 'link') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex justify-center items-end sm:items-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between bg-amber-50/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
              <ShieldAlert className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900">
                Fixing Google "Access Blocked / Error 403"
              </h2>
              <p className="text-[11px] text-amber-800">
                Why Google blocked your account & how to resolve it in 30 seconds
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-amber-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-stone-700">
          {/* Cause Explanation */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5 leading-relaxed">
            <div className="font-semibold text-stone-900 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Why did Google show "Error 403: access_denied"?</span>
            </div>
            <p className="text-[11px] text-stone-600">
              When an application requests sensitive Gmail permissions (<code className="bg-stone-200 px-1 py-0.2 rounded font-mono text-[10px]">gmail.readonly</code>) while in Google Cloud <strong>Testing</strong> mode, Google’s security policies automatically block all accounts except developer-registered <strong>Test Users</strong>.
            </p>
          </div>

          {/* Solution 1: Use Developer Account */}
          <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                <span>Option 1: Sign in with Developer Account</span>
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                Instant Access
              </span>
            </div>
            <p className="text-[11px] text-emerald-900">
              The project developer account already has pre-approved authorization. Simply select this account in the Google sign-in popup:
            </p>
            <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-emerald-300 font-mono text-xs">
              <span className="text-emerald-950 font-semibold truncate">{developerEmail}</span>
              <button
                onClick={() => handleCopy(developerEmail, 'email')}
                className="text-emerald-700 hover:text-emerald-900 flex items-center gap-1 text-[11px] font-medium"
              >
                {copiedEmail ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Solution 2: Add joyboyluffy2019 to Google Cloud Test Users */}
          <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-950 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                <span>Option 2: Add joyboyluffy2019@gmail.com as Test User</span>
              </span>
            </div>
            <p className="text-[11px] text-blue-900">
              To allow <strong>joyboyluffy2019@gmail.com</strong>, add it to your Google Cloud Console OAuth consent screen:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-blue-950 pl-1">
              <li>Open the <strong className="font-semibold">Google Cloud OAuth Consent Screen</strong>.</li>
              <li>Scroll down to the <strong className="font-semibold">Test users</strong> section.</li>
              <li>Click <strong className="font-semibold">+ ADD USERS</strong>, enter <code className="bg-blue-100 px-1 py-0.5 rounded font-mono text-[10px]">joyboyluffy2019@gmail.com</code>, and click <strong>Save</strong>.</li>
              <li>Return here and tap <strong>Connect Gmail Account</strong> to sign in successfully!</li>
            </ol>
            <a
              href={cloudConsoleUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              <span>Open Google Cloud Consent Screen</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Solution 3: Direct Email Analysis without OAuth */}
          <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-950 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                <span>Option 3: Paste Any Email Directly</span>
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded-full">
                No OAuth Needed
              </span>
            </div>
            <p className="text-[11px] text-amber-900 leading-normal">
              You can test the full capabilities of the <strong>NVIDIA NIM GPT-OSS-20B</strong> reasoning engine and audio narration right now by pasting any custom email or message thread!
            </p>
            {onOpenAddEmail && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAddEmail();
                }}
                className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs transition-colors shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Paste Custom Email for NIM Reasoning</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 text-stone-100 text-xs font-semibold hover:bg-stone-800 transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

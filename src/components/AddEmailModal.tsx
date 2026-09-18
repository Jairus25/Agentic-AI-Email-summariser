import React, { useState } from 'react';
import { Mail, Sparkles, X, Plus } from 'lucide-react';
import { EmailMessage } from '../types';

interface AddEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEmail: (email: Omit<EmailMessage, 'id'>) => void;
}

export const AddEmailModal: React.FC<AddEmailModalProps> = ({
  isOpen,
  onClose,
  onAddEmail,
}) => {
  const [sender, setSender] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;

    onAddEmail({
      threadId: 'manual-' + Date.now(),
      sender: senderEmail.trim() || 'team@work.com',
      senderName: sender.trim() || 'Colleague',
      subject: subject.trim(),
      snippet: body.slice(0, 100).trim() + '...',
      bodySnippet: body.trim(),
      date: 'Just now',
      timestamp: Date.now(),
      read: false,
      priority,
      category: 'work',
    });

    onClose();
    setSender('');
    setSenderEmail('');
    setSubject('');
    setBody('');
  };

  const handleInsertSample = () => {
    setSender('Sarah Jenkins');
    setSenderEmail('sarah.j@meridian-tech.io');
    setSubject('URGENT: Cloud Migration Deployment Window - Final Approval');
    setBody(
      'Hi team,\n\nWe have scheduled the primary production cloud migration for 11:00 PM EST tonight. Please review the updated rollback plan attached in Jira. We need sign-off from the infrastructure lead by 4:00 PM today, or we will have to reschedule the deployment window to next quarter. Let me know if you have any questions.\n\nBest,\nSarah'
    );
    setPriority('high');
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex justify-center items-end sm:items-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden animate-in slide-in-from-bottom duration-200">
        <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-400 text-stone-950 flex items-center justify-center font-bold">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900">Add Test Email</h2>
              <p className="text-[10px] text-stone-500">
                Process directly through NVIDIA NIM GPT-OSS-20B
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleInsertSample}
              className="text-[10px] bg-amber-100 hover:bg-amber-200 text-amber-900 px-2 py-1 rounded-md font-semibold transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-700" />
              <span>Sample</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                Sender Name
              </label>
              <input
                type="text"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                Sender Email
              </label>
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="alex@company.com"
                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-400 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
              Subject Line *
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Q3 Financial Review Meeting"
              className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
              Priority Flag
            </label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize border transition-all ${
                    priority === p
                      ? p === 'high'
                        ? 'bg-rose-100 text-rose-800 border-rose-400'
                        : p === 'medium'
                        ? 'bg-amber-100 text-amber-900 border-amber-400'
                        : 'bg-blue-100 text-blue-800 border-blue-400'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
              Email Content / Thread *
            </label>
            <textarea
              required
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Paste email message text, meeting invite details, or customer inquiry..."
              className="w-full p-2.5 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-400 outline-none leading-relaxed"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 active:scale-[0.99] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Process with NVIDIA NIM</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

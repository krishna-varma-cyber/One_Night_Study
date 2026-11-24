import React, { useEffect, useState } from 'react';
import { ExternalLink, KeyRound, X } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  hasSavedKey: boolean;
  maskedSuffix: string;
  notice?: string;
  onClose: () => void;
  onSaveNewKey: (key: string) => void;
  onKeepExistingKey: () => void;
  onRemoveKey: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  hasSavedKey,
  maskedSuffix,
  notice,
  onClose,
  onSaveNewKey,
  onKeepExistingKey,
  onRemoveKey,
}) => {
  const [inputKey, setInputKey] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Security: Never pre-fill old key
      setInputKey('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFirstSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputKey.trim();
    if (!trimmed) {
      setError('Please paste your Gemini API Key.');
      return;
    }
    setInputKey('');
    onSaveNewKey(trimmed);
  };

  const handleReplace = () => {
    const trimmed = inputKey.trim();
    if (!trimmed) {
      setError('Enter a new key to replace, or choose Keep Existing Key.');
      return;
    }
    setInputKey('');
    onSaveNewKey(trimmed);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="connect-brain-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-[#16171B] border border-white/[0.1] p-6 shadow-2xl space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center shrink-0">
              <KeyRound className="w-4 h-4 text-blue-400" />
            </div>
            <h2 id="connect-brain-title" className="text-lg font-semibold text-zinc-100">
              Connect Your Brain
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06] transition-colors"
            aria-label="Close popup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {notice ? (
          <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/25 rounded-xl px-3.5 py-2.5">
            {notice}
          </p>
        ) : null}

        {!hasSavedKey ? (
          <form onSubmit={handleFirstSave} className="space-y-4">
            <p className="text-sm leading-relaxed text-zinc-300">
              Enter your Gemini API Key. This key becomes the brain for this application. All
              roadmaps, blueprints and kits will be generated using your key.
            </p>

            <div className="space-y-2">
              <input
                type="password"
                value={inputKey}
                onChange={(e) => {
                  setInputKey(e.target.value);
                  setError('');
                }}
                autoComplete="off"
                placeholder="Paste your Gemini API Key here"
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#0D0E11] border border-white/[0.12] text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
              />
              {error ? <p className="text-xs text-red-400">{error}</p> : null}
            </div>

            <div>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 underline-offset-4 hover:underline"
              >
                <span>Get free key from aistudio.google.com</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:bg-white/[0.06] transition-colors whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors whitespace-nowrap"
              >
                Save &amp; Connect
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl bg-[#0D0E11] border border-white/[0.08] px-3.5 py-3 text-sm text-zinc-200 font-mono">
              Brain is already connected - ••••••••...{maskedSuffix}
            </div>

            <div className="space-y-2">
              <input
                type="password"
                value={inputKey}
                onChange={(e) => {
                  setInputKey(e.target.value);
                  setError('');
                }}
                autoComplete="off"
                placeholder="Enter new key to replace, or leave empty to keep old key"
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#0D0E11] border border-white/[0.12] text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
              />
              {error ? <p className="text-xs text-red-400">{error}</p> : null}
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={onKeepExistingKey}
                className="min-h-[44px] px-3.5 py-2 rounded-xl text-sm font-medium bg-white/[0.08] hover:bg-white/[0.13] text-zinc-100 transition-colors whitespace-nowrap"
              >
                Keep Existing Key
              </button>
              <button
                type="button"
                onClick={handleReplace}
                className="min-h-[44px] px-3.5 py-2 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors whitespace-nowrap"
              >
                Replace Key
              </button>
              <button
                type="button"
                onClick={onRemoveKey}
                className="min-h-[44px] px-3.5 py-2 rounded-xl text-sm font-medium bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/25 transition-colors whitespace-nowrap"
              >
                Remove Key
              </button>
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-3.5 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:bg-white/[0.06] transition-colors whitespace-nowrap"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

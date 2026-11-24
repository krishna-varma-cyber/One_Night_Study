import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface ThemeModalProps {
  isOpen: boolean;
  currentTheme: string;
  selectedModeLabel: string;
  onClose: () => void;
  onSaveTheme: (theme: string) => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  currentTheme,
  selectedModeLabel,
  onClose,
  onSaveTheme,
}) => {
  const [value, setValue] = useState(currentTheme);

  useEffect(() => {
    if (isOpen) {
      setValue(currentTheme);
    }
  }, [isOpen, currentTheme]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveTheme(value.trim());
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="theme-modal-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-[#16171B] border border-white/[0.1] p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-zinc-400">{selectedModeLabel}</p>
            <h2 id="theme-modal-title" className="text-lg font-semibold text-zinc-100 mt-0.5">
              Describe our theme in one line
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Describe how answers should be explained"
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#0D0E11] border border-white/[0.12] text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
          />

          <div className="flex items-center justify-between gap-2 pt-1">
            {currentTheme ? (
              <button
                type="button"
                onClick={() => {
                  onSaveTheme('');
                  onClose();
                }}
                className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors whitespace-nowrap"
              >
                Reset theme
              </button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2.5">
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
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

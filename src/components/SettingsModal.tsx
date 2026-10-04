import React from 'react';
import { User } from 'firebase/auth';
import {
  Settings,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  LogOut,
  Moon,
  Shield,
  Download,
  RotateCcw,
  Check,
} from 'lucide-react';

interface SettingsModalProps {
  user: User | null;
  settings: {
    soundEnabled: boolean;
    confettiEnabled: boolean;
    theme: 'dark' | 'greenish' | 'midnight' | 'slate' | 'amethyst' | 'ember';
    compactMode: boolean;
  };
  onUpdateSettings: (newSettings: Partial<SettingsModalProps['settings']>) => void;
  onLogout: () => void;
  onExportData: () => void;
  onResetData: () => void;
  onClose: () => void;
}

export function SettingsModal({
  user,
  settings,
  onUpdateSettings,
  onLogout,
  onExportData,
  onResetData,
  onClose,
}: SettingsModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6 my-8 text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-300">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100">Preferences & Settings</h2>
              <p className="text-xs text-neutral-400">Personalize your experience & cloud synchronization.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Account Info */}
        <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 min-w-0">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-10 h-10 rounded-full border border-emerald-500/40 object-cover shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center border border-emerald-500/30 shrink-0">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="min-w-0">
              <div className="font-bold text-neutral-200 truncate">
                {user?.displayName || 'Personal Account'}
              </div>
              <div className="text-neutral-400 font-mono text-[11px] truncate">{user?.email}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-rose-400 font-medium flex items-center gap-1.5 transition-colors shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Theme Settings */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-neutral-300">
            Dark Mode Palette
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: 'dark', label: 'Dark Forest', bg: 'bg-neutral-900 border-neutral-700' },
              { id: 'greenish', label: 'Emerald Sage', bg: 'bg-[#03120c] border-emerald-800' },
              { id: 'midnight', label: 'Obsidian OLED', bg: 'bg-black border-neutral-800' },
              { id: 'slate', label: 'Cyberpunk Slate', bg: 'bg-[#040d13] border-[#123347]' },
              { id: 'amethyst', label: 'Royal Amethyst', bg: 'bg-[#0e0717] border-[#351a54]' },
              { id: 'ember', label: 'Crimson Ember', bg: 'bg-[#140707] border-[#441a1a]' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onUpdateSettings({ theme: t.id as any })}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  settings.theme === t.id
                    ? 'border-emerald-500 ring-1 ring-emerald-500 bg-neutral-950 text-emerald-300 font-semibold'
                    : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:text-white'
                }`}
              >
                <div className={`w-full h-3 rounded ${t.bg} mb-1.5 border`} />
                <span className="text-[11px] block">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Toggles (Sound, Confetti, Density) */}
        <div className="space-y-3 pt-2 border-t border-neutral-800 text-xs">
          {/* Sound toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {settings.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-neutral-500" />
              )}
              <div>
                <span className="font-semibold text-neutral-200 block">Audio Feedback & Chimes</span>
                <span className="text-[11px] text-neutral-400">Play pleasant micro-tones upon completing tasks</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.soundEnabled ? 'bg-emerald-500' : 'bg-neutral-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Confetti toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <div>
                <span className="font-semibold text-neutral-200 block">Victory Confetti</span>
                <span className="text-[11px] text-neutral-400">Celebrate when 100% of today's tasks are done</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onUpdateSettings({ confettiEnabled: !settings.confettiEnabled })}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.confettiEnabled ? 'bg-emerald-500' : 'bg-neutral-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.confettiEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Data & Backup */}
        <div className="pt-2 border-t border-neutral-800 space-y-2 text-xs">
          <span className="font-semibold text-neutral-300 block">Cloud Data & Backup</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onExportData}
              className="flex-1 py-2 px-3 rounded-lg border border-neutral-800 bg-neutral-950 hover:bg-neutral-850 text-neutral-300 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-neutral-400" />
              <span>Export JSON Backup</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (confirm('Reset to initial starter demo tasks and records?')) {
                  onResetData();
                }
              }}
              className="py-2 px-3 rounded-lg border border-neutral-800 bg-neutral-950 hover:bg-neutral-850 text-amber-400 flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Starter Demo</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-semibold rounded-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

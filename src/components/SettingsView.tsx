import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { CustomCategory } from '../types/habit';
import {
  Settings,
  Volume2,
  VolumeX,
  Sparkles,
  Moon,
  Shield,
  Download,
  Upload,
  RotateCcw,
  Check,
  Tag,
  Palette,
  Bell,
  Calendar,
  Database,
  Play,
  Flame,
  Award,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface SettingsViewProps {
  user: User | null;
  settings: {
    soundEnabled: boolean;
    confettiEnabled: boolean;
    theme: 'dark' | 'greenish' | 'midnight' | 'slate' | 'amethyst' | 'ember';
    compactMode: boolean;
  };
  categories: CustomCategory[];
  onUpdateSettings: (newSettings: Partial<SettingsViewProps['settings']>) => void;
  onOpenCategories: () => void;
  onLogout: () => void;
  onExportData: () => void;
  onResetData: () => void;
}

export function SettingsView({
  user,
  settings,
  categories,
  onUpdateSettings,
  onOpenCategories,
  onLogout,
  onExportData,
  onResetData,
}: SettingsViewProps) {
  const [weekStart, setWeekStart] = useState<'monday' | 'sunday'>('monday');
  const [soundTestSuccess, setSoundTestSuccess] = useState<string | null>(null);

  const testAudioEffect = (type: 'check' | 'streak' | 'achievement') => {
    if (type === 'check') sound.playCheck();
    if (type === 'streak') sound.playCelebration();
    if (type === 'achievement') sound.playTimerDone();

    setSoundTestSuccess(`Played ${type} audio feedback!`);
    setTimeout(() => setSoundTestSuccess(null), 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-neutral-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-100 flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-emerald-400" />
            <span>Preferences & System Settings</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Customize dark themes, tactile sound physics, calendar scheduling, and data backups.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-neutral-400 px-3 py-1 rounded-lg bg-neutral-900 border border-neutral-800">
            Horizon v3.0 Pro
          </span>
        </div>
      </div>

      {/* SECTION 1: Appearance & Dark Theme Palette */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-neutral-200">
            Theme & Dark Palette
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              id: 'dark' as const,
              name: 'Forest Dark',
              desc: 'Emerald accents with neutral stone tones',
              bgClass: 'bg-neutral-950 border-neutral-800',
              accent: 'bg-emerald-400',
            },
            {
              id: 'greenish' as const,
              name: 'Emerald Sage',
              desc: 'Deep rich organic green tint throughout backgrounds',
              bgClass: 'bg-[#03120c] border-emerald-900',
              accent: 'bg-emerald-500',
            },
            {
              id: 'midnight' as const,
              name: 'Obsidian Midnight',
              desc: 'Deepest pure pitch black for OLED displays',
              bgClass: 'bg-black border-neutral-850',
              accent: 'bg-sky-400',
            },
            {
              id: 'slate' as const,
              name: 'Cyberpunk Slate',
              desc: 'Dark cyan hues with high contrast typography',
              bgClass: 'bg-[#040d13] border-[#123347]',
              accent: 'bg-teal-400',
            },
            {
              id: 'amethyst' as const,
              name: 'Royal Amethyst',
              desc: 'Deep luxury violet tones with purple glow',
              bgClass: 'bg-[#0e0717] border-[#351a54]',
              accent: 'bg-purple-500',
            },
            {
              id: 'ember' as const,
              name: 'Crimson Ember',
              desc: 'Deep ruby and rose tones for high intensity',
              bgClass: 'bg-[#140707] border-[#441a1a]',
              accent: 'bg-rose-500',
            },
          ].map((th) => {
            const isSelected = settings.theme === th.id;
            return (
              <button
                key={th.id}
                type="button"
                onClick={() => onUpdateSettings({ theme: th.id })}
                className={`p-4 rounded-xl border text-left space-y-2 transition-all relative ${
                  isSelected
                    ? 'border-emerald-500 bg-neutral-950 ring-1 ring-emerald-500/40'
                    : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-3.5 h-3.5 rounded-full ${th.accent}`} />
                    <span className="text-xs font-bold text-neutral-100">{th.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  {th.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Tactile Audio & Haptics */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-neutral-200">
              Audio Feedback & Tactile Physics
            </h3>
          </div>

          <button
            type="button"
            onClick={() => {
              const newState = !settings.soundEnabled;
              sound.toggleSound();
              onUpdateSettings({ soundEnabled: newState });
            }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold font-mono border transition-colors flex items-center gap-1.5 ${
              settings.soundEnabled
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700'
            }`}
          >
            {settings.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{settings.soundEnabled ? 'Enabled' : 'Muted'}</span>
          </button>
        </div>

        <p className="text-xs text-neutral-400">
          Subtle web-audio synthesized tactile clicks upon checking tasks, continuing streaks, and unlocking honors.
        </p>

        {/* Audio Test Bench */}
        <div className="pt-2 border-t border-neutral-800/80 space-y-2">
          <span className="text-[11px] text-neutral-400 uppercase font-mono tracking-wider block">
            Test Audio Synthesizer:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => testAudioEffect('check')}
              className="px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-emerald-500/50 text-neutral-300 text-xs flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Task Check Sound</span>
            </button>

            <button
              onClick={() => testAudioEffect('streak')}
              className="px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-amber-500/50 text-neutral-300 text-xs flex items-center gap-1.5 transition-colors"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Streak Ding</span>
            </button>

            <button
              onClick={() => testAudioEffect('achievement')}
              className="px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-indigo-500/50 text-neutral-300 text-xs flex items-center gap-1.5 transition-colors"
            >
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              <span>Honor Chord</span>
            </button>

            {soundTestSuccess && (
              <span className="text-xs text-emerald-400 font-mono animate-in fade-in">
                ✓ {soundTestSuccess}
              </span>
            )}
          </div>
        </div>

        {/* Confetti Toggle */}
        <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-neutral-200 block">
              Confetti Burst on All Tasks Done
            </span>
            <span className="text-[11px] text-neutral-400">
              Celebratory particle burst when reaching 100% daily completion.
            </span>
          </div>
          <button
            type="button"
            onClick={() => onUpdateSettings({ confettiEnabled: !settings.confettiEnabled })}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              settings.confettiEnabled ? 'bg-emerald-500' : 'bg-neutral-800'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                settings.confettiEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* SECTION 3: Habit Categories Management */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-neutral-200">
              Categories & Grouping ({categories.length})
            </h3>
          </div>

          <button
            onClick={onOpenCategories}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-colors"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Manage Categories</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-2.5 text-xs"
            >
              <span className="w-3 h-3 rounded-full bg-emerald-400 shrink-0" />
              <span className="font-semibold text-neutral-200 truncate">{cat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: Data Management & Backups */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-neutral-200">
            Data Backup & Restore
          </h3>
        </div>
        <p className="text-xs text-neutral-400">
          Your tasks and check-ins are synchronized to Google Cloud Firestore and backed up in browser storage.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
          <button
            onClick={onExportData}
            className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-emerald-500/40 text-left transition-colors flex items-center gap-3"
          >
            <Download className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-neutral-100 block">Export Full JSON Backup</span>
              <span className="text-[11px] text-neutral-400">Download complete dataset for migration or offline archive</span>
            </div>
          </button>

          <button
            onClick={() => {
              if (confirm('Reset to starter demo tasks, 3-month targets, and sample check-ins?')) {
                onResetData();
              }
            }}
            className="p-4 rounded-xl bg-neutral-950 border border-amber-500/20 hover:border-amber-500/40 text-left transition-colors flex items-center gap-3"
          >
            <RotateCcw className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-amber-300 block">Reset Starter Demo Data</span>
              <span className="text-[11px] text-neutral-400">Restore factory sample habits and 3-month roadmaps</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

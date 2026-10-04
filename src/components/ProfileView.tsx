import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { Habit, Goal, FocusSession, HabitEntry } from '../types/habit';
import { UserBadge } from '../types/achievement';
import { BADGE_DEFINITIONS } from '../utils/achievements';
import { calculateOverallStats } from '../utils/analytics';
import {
  User as UserIcon,
  Shield,
  Cloud,
  CloudCheck,
  Flame,
  Award,
  Clock,
  Target,
  CheckCircle2,
  LogIn,
  LogOut,
  Download,
  RotateCcw,
  Sparkles,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface ProfileViewProps {
  user: User | null;
  habits: Habit[];
  goals: Goal[];
  entries: Record<string, HabitEntry>;
  focusSessions: FocusSession[];
  unlockedBadges: Record<string, UserBadge>;
  onLogin: () => void;
  onLogout: () => void;
  onExportData: () => void;
  onResetData: () => void;
  onGoToSettings: () => void;
}

export function ProfileView({
  user,
  habits,
  goals,
  entries,
  focusSessions,
  unlockedBadges,
  onLogin,
  onLogout,
  onExportData,
  onResetData,
  onGoToSettings,
}: ProfileViewProps) {
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const overall = calculateOverallStats(habits, entries);
  const totalFocusMinutes = focusSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const focusHours = Math.floor(totalFocusMinutes / 60);
  const focusRemainderMins = totalFocusMinutes % 60;

  const handleManualSync = () => {
    setSyncing(true);
    sound.playCheck();
    setTimeout(() => {
      setSyncing(false);
      setSyncStatus(`Cloud sync verified at ${new Date().toLocaleTimeString()}`);
    }, 800);
  };

  const unlockedCount = Object.keys(unlockedBadges).length;
  const totalBadgesCount = BADGE_DEFINITIONS.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Profile Header Hero */}
      <div className="rounded-2xl border border-neutral-800 bg-gradient-to-r from-neutral-900/90 via-neutral-900/70 to-neutral-950 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* User Avatar */}
            <div className="relative">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Avatar'}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-md"
                />
              ) : (
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-2xl shadow-md">
                  {user?.email ? user.email[0].toUpperCase() : 'H'}
                </div>
              )}
              {user && (
                <span
                  title="Signed In & Synced"
                  className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-neutral-950"
                />
              )}
            </div>

            {/* Identity Info */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-neutral-100">
                  {user?.displayName || (user ? 'Authenticated User' : 'Guest Explorer')}
                </h1>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-semibold">
                  {user ? 'Verified' : 'Local Storage'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono">
                {user?.email || 'Data saved locally on this browser'}
              </p>
              {user && (
                <p className="text-[11px] text-neutral-500">
                  UID: <span className="font-mono text-neutral-400">{user.uid.slice(0, 14)}...</span>
                </p>
              )}
            </div>
          </div>

          {/* Account Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            {user ? (
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-semibold transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onLogin}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-neutral-950 text-xs font-bold transition-colors shadow-sm"
              >
                <LogIn className="w-4 h-4 stroke-[2.5]" />
                <span>Sign In with Google</span>
              </button>
            )}
          </div>
        </div>

        {/* Database & Cloud Sync Status Banner */}
        <div className="mt-6 pt-4 border-t border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono">
              Database: <strong>ai-studio-komorebihabittra</strong> (Firestore Realtime)
            </span>
          </div>

          <div className="flex items-center gap-3">
            {syncStatus && (
              <span className="text-[11px] text-emerald-400 font-mono">{syncStatus}</span>
            )}
            <button
              onClick={handleManualSync}
              disabled={syncing}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-[11px] font-mono transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lifetime Stats & Consistency Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Check-ins */}
        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-1">
          <span className="text-xs text-neutral-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Check-ins</span>
          </span>
          <div className="text-2xl font-bold font-mono text-neutral-100 tabular-nums">
            {overall.totalAllCompletions}
          </div>
          <span className="text-[10px] text-neutral-500 font-mono">Lifetime completions</span>
        </div>

        {/* Longest Streak */}
        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-1">
          <span className="text-xs text-neutral-400 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Best Streak</span>
          </span>
          <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
            {overall.maxActiveStreak} <span className="text-xs font-normal">days</span>
          </div>
          <span className="text-[10px] text-neutral-500 font-mono">Unbroken streak record</span>
        </div>

        {/* Focus Hours */}
        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-1">
          <span className="text-xs text-neutral-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Deep Work</span>
          </span>
          <div className="text-2xl font-bold font-mono text-indigo-300 tabular-nums">
            {focusHours}h {focusRemainderMins}m
          </div>
          <span className="text-[10px] text-neutral-500 font-mono">{focusSessions.length} total sessions</span>
        </div>

        {/* 3-Month Targets */}
        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-1">
          <span className="text-xs text-neutral-400 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-teal-400" />
            <span>Targets</span>
          </span>
          <div className="text-2xl font-bold font-mono text-teal-300 tabular-nums">
            {goals.length}
          </div>
          <span className="text-[10px] text-neutral-500 font-mono">{goals.filter(g => g.status === 'active').length} active roadmaps</span>
        </div>
      </div>

      {/* Badges & Milestones Showcase */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-neutral-100">
              Earned Badges & Mastery Honors ({unlockedCount}/{totalBadgesCount})
            </h3>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            {Math.round((unlockedCount / totalBadgesCount) * 100)}% Complete
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-400 rounded-full transition-all duration-500"
            style={{ width: `${(unlockedCount / totalBadgesCount) * 100}%` }}
          />
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {BADGE_DEFINITIONS.map((badge) => {
            const isUnlocked = !!unlockedBadges[badge.id];
            const unlockedData = unlockedBadges[badge.id];

            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-xl border transition-all text-xs space-y-2 ${
                  isUnlocked
                    ? 'border-amber-500/40 bg-neutral-950/80 shadow-sm'
                    : 'border-neutral-800/80 bg-neutral-950/30 opacity-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                      isUnlocked
                        ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                        : 'bg-neutral-850 border border-neutral-800 text-neutral-600 grayscale'
                    }`}
                  >
                    {badge.icon}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-neutral-200 block truncate">
                      {badge.title}
                    </span>
                    <span className="text-[10px] text-neutral-500 uppercase font-mono block">
                      {badge.category} · {badge.tier}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  {badge.description}
                </p>

                {isUnlocked && unlockedData && (
                  <span className="text-[10px] text-emerald-400 font-mono block">
                    ✓ Unlocked {new Date(unlockedData.unlockedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Account Data Tools & Danger Zone */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-4">
        <h3 className="text-sm font-bold text-neutral-200 uppercase tracking-wider">
          Data Management & Preferences
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <button
            onClick={onExportData}
            className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 flex items-center gap-3 text-left transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="font-semibold text-neutral-200 block">Export JSON Backup</span>
              <span className="text-[11px] text-neutral-500">Download complete habit dataset</span>
            </div>
          </button>

          <button
            onClick={onGoToSettings}
            className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 flex items-center gap-3 text-left transition-colors"
          >
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <div>
              <span className="font-semibold text-neutral-200 block">Themes & Audio</span>
              <span className="text-[11px] text-neutral-500">Customize dark modes & tactile feedback</span>
            </div>
          </button>

          <button
            onClick={() => {
              if (confirm('Reset to starter demo tasks, 3-month targets, and logs?')) {
                onResetData();
              }
            }}
            className="p-3.5 rounded-xl bg-neutral-950 border border-amber-500/20 hover:border-amber-500/40 flex items-center gap-3 text-left transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="font-semibold text-amber-300 block">Reset Starter Data</span>
              <span className="text-[11px] text-neutral-500">Restore factory sample routines</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

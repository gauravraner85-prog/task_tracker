import React, { useState } from 'react';
import { UserBadge } from '../types/achievement';
import { BADGE_DEFINITIONS } from '../utils/achievements';
import {
  Award,
  Zap,
  Flame,
  Shield,
  CheckCircle2,
  TrendingUp,
  Target,
  Crown,
  Clock,
  Brain,
  Sparkles,
  Compass,
  BookOpen,
  Lock,
  X,
} from 'lucide-react';

interface AchievementsModalProps {
  unlockedBadges: Record<string, UserBadge>;
  stats: {
    maxStreak: number;
    currentStreak: number;
    totalCompleted: number;
    totalFocusMinutes: number;
    totalGoals: number;
    totalReflections: number;
    totalCategories: number;
  };
  onClose: () => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Award,
  Zap,
  Flame,
  Shield,
  CheckCircle2,
  TrendingUp,
  Target,
  Crown,
  Clock,
  Brain,
  Sparkles,
  Compass,
  BookOpen,
};

const TIER_STYLES = {
  bronze: {
    border: 'border-amber-700/60',
    bg: 'bg-amber-950/20',
    text: 'text-amber-400',
    badge: 'bg-amber-600/20 text-amber-300 border-amber-600/40',
  },
  silver: {
    border: 'border-slate-400/50',
    bg: 'bg-slate-900/40',
    text: 'text-slate-300',
    badge: 'bg-slate-500/20 text-slate-200 border-slate-500/40',
  },
  gold: {
    border: 'border-yellow-500/60',
    bg: 'bg-yellow-950/20',
    text: 'text-yellow-400',
    badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
  },
  diamond: {
    border: 'border-cyan-400/60',
    bg: 'bg-cyan-950/20',
    text: 'text-cyan-300',
    badge: 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40',
  },
};

export function AchievementsModal({ unlockedBadges, stats, onClose }: AchievementsModalProps) {
  const [filter, setFilter] = useState<'all' | 'streak' | 'completion' | 'focus' | 'special'>('all');

  const totalUnlocked = Object.keys(unlockedBadges).length;
  const totalBadges = BADGE_DEFINITIONS.length;

  const filteredBadges = BADGE_DEFINITIONS.filter(
    (b) => filter === 'all' || b.category === filter
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6 my-8 text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
                <span>Achievements & Badges</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
                  {totalUnlocked} / {totalBadges}
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Milestone badges earned through daily discipline and focus.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-950 rounded-xl border border-neutral-800 text-xs overflow-x-auto">
          {[
            { id: 'all', label: 'All Badges' },
            { id: 'streak', label: 'Streaks' },
            { id: 'completion', label: 'Tasks' },
            { id: 'focus', label: 'Study & Focus' },
            { id: 'special', label: 'Special' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as typeof filter)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filter === tab.id
                  ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[60vh] overflow-y-auto pr-1">
          {filteredBadges.map((badge) => {
            const isUnlocked = !!unlockedBadges[badge.id];
            const progress = badge.progress(stats);
            const tierStyle = TIER_STYLES[badge.tier];
            const IconComponent = ICON_MAP[badge.icon] || Award;

            return (
              <div
                key={badge.id}
                className={`p-4 rounded-xl border transition-all ${
                  isUnlocked
                    ? `${tierStyle.border} ${tierStyle.bg} shadow-sm`
                    : 'border-neutral-800/80 bg-neutral-950/40 opacity-70'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Badge Icon */}
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                      isUnlocked
                        ? `${tierStyle.badge} shadow-sm`
                        : 'bg-neutral-900 border-neutral-800 text-neutral-600'
                    }`}
                  >
                    {isUnlocked ? (
                      <IconComponent className="w-5 h-5" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-neutral-200 truncate">
                        {badge.title}
                      </h4>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border border-neutral-800 text-neutral-400 bg-neutral-900">
                        {badge.tier}
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-400 leading-snug">
                      {badge.description}
                    </p>

                    {/* Progress Bar if locked */}
                    {!isUnlocked ? (
                      <div className="pt-2 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                          <span>{badge.conditionDescription}</span>
                          <span>{progress.current}/{progress.target}</span>
                        </div>
                        <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                          <div
                            className="h-full bg-neutral-600 rounded-full transition-all"
                            style={{ width: `${progress.percent}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="pt-1 flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Unlocked · {unlockedBadges[badge.id].unlockedAt ? new Date(unlockedBadges[badge.id].unlockedAt).toLocaleDateString() : 'Earned'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-800 text-xs text-neutral-400">
          <span>Complete daily tasks and maintain streaks to claim all 13 badges.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 font-semibold rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

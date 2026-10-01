import React from 'react';
import { Goal, GoalAnalytics } from '../types/habit';
import { Target, Clock, AlertTriangle, CheckCircle, TrendingUp, ChevronRight } from 'lucide-react';

interface GoalCardProps {
  goal: Goal;
  analytics: GoalAnalytics;
  onSelectGoal?: (goal: Goal) => void;
  onEditGoal?: (goal: Goal) => void;
  compact?: boolean;
}

const COLOR_MAP: Record<string, { border: string; bg: string; text: string; bar: string }> = {
  emerald: {
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    bar: 'bg-emerald-400',
  },
  sky: {
    border: 'border-sky-500/30',
    bg: 'bg-sky-500/10',
    text: 'text-sky-400',
    bar: 'bg-sky-400',
  },
  indigo: {
    border: 'border-indigo-500/30',
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    bar: 'bg-indigo-400',
  },
  amber: {
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    bar: 'bg-amber-400',
  },
  rose: {
    border: 'border-rose-500/30',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    bar: 'bg-rose-400',
  },
};

export function GoalCard({ goal, analytics, onSelectGoal, onEditGoal, compact }: GoalCardProps) {
  const colorScheme = COLOR_MAP[goal.color] || COLOR_MAP.emerald;

  // Pace status presentation
  const getPaceDisplay = () => {
    if (analytics.isOverdue) {
      return {
        label: `Overdue by ${analytics.delayDays}d`,
        icon: AlertTriangle,
        color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      };
    }
    if (analytics.paceStatus === 'ahead') {
      return {
        label: 'Ahead of Pace',
        icon: TrendingUp,
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      };
    }
    if (analytics.paceStatus === 'on_track') {
      return {
        label: 'On Track',
        icon: CheckCircle,
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      };
    }
    if (analytics.paceStatus === 'delayed') {
      return {
        label: `Delayed (${analytics.delayDays}d behind)`,
        icon: Clock,
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      };
    }
    return {
      label: `Delayed by ${analytics.delayDays}d`,
      icon: AlertTriangle,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    };
  };

  const pace = getPaceDisplay();
  const PaceIcon = pace.icon;

  if (compact) {
    return (
      <div
        onClick={() => onSelectGoal && onSelectGoal(goal)}
        className="group cursor-pointer rounded-xl border border-neutral-800 bg-neutral-900/70 hover:border-neutral-700 p-3.5 space-y-2.5 transition-all shadow-sm"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`w-2 h-2 rounded-full ${colorScheme.bar}`} />
            <h4 className="text-xs font-bold text-neutral-200 truncate group-hover:text-emerald-400 transition-colors">
              {goal.title}
            </h4>
          </div>
          <span className="text-[11px] font-mono font-semibold text-neutral-300 tabular-nums shrink-0">
            {analytics.daysRemaining}d left
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${colorScheme.bar} transition-all duration-300`}
              style={{ width: `${analytics.percentComplete}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-neutral-400">
            <span>
              {analytics.currentProgress}/{goal.targetMetricCount} {goal.metricUnit}
            </span>
            <span className="font-mono">{analytics.percentComplete}%</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4 shadow-sm hover:border-neutral-700/80 transition-all">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${colorScheme.bg} ${colorScheme.border} ${colorScheme.text}`}
          >
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight text-neutral-100">
              {goal.title}
            </h3>
            {goal.description && (
              <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">
                {goal.description}
              </p>
            )}
          </div>
        </div>

        {/* Countdown & Pace Status */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono font-bold text-neutral-200 bg-neutral-800/80 border border-neutral-700/80 rounded-lg px-2.5 py-1 tabular-nums">
            ⏳ {analytics.daysRemaining} days remaining
          </span>
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-medium border rounded-lg px-2.5 py-1 ${pace.color}`}
          >
            <PaceIcon className="w-3 h-3" />
            <span>{pace.label}</span>
          </span>
        </div>
      </div>

      {/* Progress & Pending Breakdown */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-300">
            Progress:{' '}
            <strong className="text-neutral-100 font-mono tabular-nums">
              {analytics.currentProgress}
            </strong>{' '}
            of {goal.targetMetricCount} {goal.metricUnit}
          </span>
          <span className="text-neutral-400">
            Pending:{' '}
            <strong className="text-amber-400 font-mono tabular-nums">
              {analytics.pendingCount}
            </strong>{' '}
            {goal.metricUnit}
          </span>
        </div>

        {/* Dual Progress Bar: Actual vs Expected Pace */}
        <div className="relative w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden">
          {/* Target pacing marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-neutral-400 z-10"
            style={{ left: `${analytics.expectedPercent}%` }}
            title={`Expected progress today: ${analytics.expectedPercent}%`}
          />
          {/* Actual progress */}
          <div
            className={`h-full ${colorScheme.bar} rounded-full transition-all duration-500`}
            style={{ width: `${analytics.percentComplete}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-0.5">
          <span>Target Date: {goal.targetDate}</span>
          <span>
            {analytics.percentComplete}% Complete (Timeline: {analytics.daysPassed}/{analytics.daysTotal}d)
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-neutral-800 text-xs">
        <span className="text-neutral-400">
          Linked Tasks: <strong className="text-neutral-300">{goal.linkedHabitIds?.length || 0}</strong>
        </span>

        <div className="flex items-center gap-2">
          {onSelectGoal && (
            <button
              onClick={() => onSelectGoal(goal)}
              className="text-emerald-400 hover:underline flex items-center gap-0.5"
            >
              <span>View Target Tasks</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
          {onEditGoal && (
            <button
              onClick={() => onEditGoal(goal)}
              className="text-neutral-400 hover:text-white px-2 py-1 rounded bg-neutral-800/80"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

import React from 'react';
import { Habit, HabitEntry } from '../types/habit';
import { calculateHabitStats, calculateDayOfWeekBreakdown, calculateOverallStats } from '../utils/analytics';
import { HabitIcon } from './HabitIcon';
import { CompletionTrendChart } from './CompletionTrendChart';
import { Flame, Target, TrendingUp, Award, Clock, Activity, CheckCircle2 } from 'lucide-react';

interface AnalyticsViewProps {
  habits: Habit[];
  entries: Record<string, HabitEntry>;
  onOpenNewHabit: () => void;
}

export function AnalyticsView({ habits, entries, onOpenNewHabit }: AnalyticsViewProps) {
  const activeHabits = habits.filter((h) => !h.archived);
  const overall = calculateOverallStats(habits, entries);
  const dayBreakdown = calculateDayOfWeekBreakdown(habits, entries);

  // Individual habit stats
  const habitStatsList = activeHabits.map((h) => ({
    habit: h,
    stats: calculateHabitStats(h, entries),
  }));

  // Sort by habit strength descending
  habitStatsList.sort((a, b) => b.stats.habitStrength - a.stats.habitStrength);

  // Time of day analysis
  const timeBuckets: Record<string, { scheduled: number; completed: number }> = {
    morning: { scheduled: 0, completed: 0 },
    afternoon: { scheduled: 0, completed: 0 },
    evening: { scheduled: 0, completed: 0 },
    anytime: { scheduled: 0, completed: 0 },
  };

  Object.values(entries).forEach((entry) => {
    const habit = habits.find((h) => h.id === entry.habitId);
    if (!habit) return;
    const bucket = timeBuckets[habit.timeOfDay] || timeBuckets.anytime;
    bucket.scheduled++;
    if (entry.status === 'completed') {
      bucket.completed++;
    }
  });

  return (
    <div className="space-y-8">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Habit Momentum</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-neutral-100 font-mono tabular-nums">
            {overall.avgStrength}%
          </div>
          <p className="text-xs text-neutral-500">
            Weighted exponential consistency across active habits.
          </p>
        </div>

        {/* Metric 2 */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Longest Streak</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-neutral-100 font-mono tabular-nums">
            {overall.maxActiveStreak} <span className="text-xs font-normal text-neutral-400">days</span>
          </div>
          <p className="text-xs text-neutral-500">
            Highest uninterrupted streak among active routines.
          </p>
        </div>

        {/* Metric 3 */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Total Check-ins</span>
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-neutral-100 font-mono tabular-nums">
            {overall.totalAllCompletions}
          </div>
          <p className="text-xs text-neutral-500">
            Cumulative successful completions logged in database.
          </p>
        </div>

        {/* Metric 4 */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Today&apos;s Score</span>
            <Target className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-neutral-100 font-mono tabular-nums">
            {overall.todayPercent}%
          </div>
          <p className="text-xs text-neutral-500">
            {overall.todayCompletedCount} of {overall.todayScheduledCount} targets checked today.
          </p>
        </div>
      </div>

      {/* 30-Day Completion Rate Trend Line Chart vs. Previous Period */}
      <CompletionTrendChart habits={habits} entries={entries} />

      {/* Charts Section: Day of Week Breakdown + Time of Day Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Day-of-Week Consistency Chart (2 Cols) */}
        <div className="lg:col-span-2 rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-200">
                Weekly Adherence Rhythm (Last 28 Days)
              </h3>
              <p className="text-xs text-neutral-400">
                Identify which days you perform best and where weekend fatigue occurs.
              </p>
            </div>
            <TrendingUp className="w-4 h-4 text-neutral-400" />
          </div>

          <div className="grid grid-cols-7 gap-3 pt-4 items-end min-h-[180px]">
            {dayBreakdown.map((item) => {
              const heightPct = Math.max(12, item.adherence);
              return (
                <div key={item.dayName} className="flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[11px] font-mono tabular-nums text-neutral-400 font-medium">
                    {item.adherence}%
                  </span>
                  {/* Bar */}
                  <div className="w-full max-w-[42px] h-32 bg-neutral-800/80 rounded-t-lg overflow-hidden flex flex-col justify-end p-0.5">
                    <div
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        item.adherence >= 80
                          ? 'bg-emerald-400'
                          : item.adherence >= 60
                          ? 'bg-teal-400'
                          : item.adherence >= 40
                          ? 'bg-sky-400'
                          : 'bg-amber-400'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-neutral-300">
                    {item.dayName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Time of Day Performance (1 Col) */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-200">
                Timing Slots Adherence
              </h3>
              <Clock className="w-4 h-4 text-neutral-400" />
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Habit completion rates grouped by circadian block.
            </p>
          </div>

          <div className="space-y-4 my-2">
            {[
              { id: 'morning', label: 'Morning Routines', icon: '🌅' },
              { id: 'afternoon', label: 'Afternoon Blocks', icon: '☀️' },
              { id: 'evening', label: 'Evening Rituals', icon: '🌙' },
            ].map((block) => {
              const data = timeBuckets[block.id] || { scheduled: 0, completed: 0 };
              const rate = data.scheduled > 0 ? Math.round((data.completed / data.scheduled) * 100) : 0;
              return (
                <div key={block.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-300 flex items-center gap-1.5">
                      <span>{block.icon}</span>
                      <span>{block.label}</span>
                    </span>
                    <span className="font-mono font-medium tabular-nums text-neutral-200">
                      {rate}% <span className="text-neutral-500 text-[10px]">({data.completed}/{data.scheduled})</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-neutral-800 text-[11px] text-neutral-400 italic">
            Habits anchored in the morning typically achieve 18-25% higher lifetime consistency.
          </div>
        </div>
      </div>

      {/* Habit Performance Leaderboard */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-200">
              Habit Strength & Reliability Index
            </h3>
            <p className="text-xs text-neutral-400">
              Ranking your routines by consistency, active streak, and 30-day adherence.
            </p>
          </div>
          <Award className="w-4 h-4 text-amber-400" />
        </div>

        <div className="divide-y divide-neutral-800/60">
          {habitStatsList.map(({ habit, stats }, idx) => (
            <div
              key={habit.id}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-semibold text-neutral-500 w-4">
                  #{idx + 1}
                </span>
                <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700/60 flex items-center justify-center text-neutral-300 shrink-0">
                  <HabitIcon name={habit.icon} className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-neutral-100 text-sm">{habit.title}</p>
                  <p className="text-neutral-400 text-[11px] capitalize">
                    {habit.category} · {habit.timeOfDay} {habit.targetTime ? `(${habit.targetTime})` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 justify-between sm:justify-end pl-7 sm:pl-0">
                <div className="text-left sm:text-right">
                  <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Streak</div>
                  <div className="font-mono font-bold text-amber-400 tabular-nums">
                    {stats.currentStreak}d (best {stats.longestStreak}d)
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-[10px] text-neutral-500 uppercase tracking-wider">30d Rate</div>
                  <div className="font-mono font-medium text-neutral-200 tabular-nums">
                    {stats.completionRate30d}%
                  </div>
                </div>

                <div className="text-left sm:text-right min-w-[80px]">
                  <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Strength</div>
                  <div className="font-mono font-bold text-emerald-400 tabular-nums">
                    {stats.habitStrength}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

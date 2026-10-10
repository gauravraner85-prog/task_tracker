import React, { useState } from 'react';
import { Habit, HabitEntry, Goal } from '../types/habit';
import { calculateHabitStats, calculateDayOfWeekBreakdown, calculateOverallStats } from '../utils/analytics';
import { calculateGoalAnalytics } from '../utils/goalAnalytics';
import { CompletionTrendChart } from './CompletionTrendChart';
import { TargetDayProgressGraph } from './TargetDayProgressGraph';
import { parseDateKey, getTodayKey } from '../utils/date';
import { Flame, Target, TrendingUp, Award, Clock, Activity, CheckCircle2, BarChart3, ListTodo } from 'lucide-react';

interface AnalyticsViewProps {
  habits: Habit[];
  goals?: Goal[];
  entries: Record<string, HabitEntry>;
  onOpenNewHabit: () => void;
}

export function AnalyticsView({ habits, goals = [], entries, onOpenNewHabit }: AnalyticsViewProps) {
  const [activeTab, setActiveTab] = useState<'tasks' | 'targets'>('tasks');
  const [selectedGoalId, setSelectedGoalId] = useState<string>(goals[0]?.id || '');
  const [inspectedDay, setInspectedDay] = useState<number>(1);

  const activeHabits = habits.filter((h) => !h.archived);
  const overall = calculateOverallStats(habits, entries);
  const dayBreakdown = calculateDayOfWeekBreakdown(habits, entries);

  // Selected target for day-wise graph
  const selectedGoal = goals.find((g) => g.id === selectedGoalId) || goals[0];
  const startDateObj = selectedGoal ? parseDateKey(selectedGoal.startDate) : new Date();
  const targetDateObj = selectedGoal ? parseDateKey(selectedGoal.targetDate) : new Date();
  const totalDays = selectedGoal
    ? Math.max(1, Math.round((targetDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1)
    : 30;
  const todayObj = parseDateKey(getTodayKey());
  const currentDayIndex = selectedGoal
    ? Math.min(
        totalDays,
        Math.max(1, Math.round((todayObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1)
      )
    : 1;

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

  // Target analytics calculations
  const targetAnalyticsList = goals.map((g) => ({
    goal: g,
    analytics: calculateGoalAnalytics(g, entries),
  }));

  const totalTargetVolume = targetAnalyticsList.reduce((acc, t) => acc + t.goal.targetMetricCount, 0);
  const completedTargetVolume = targetAnalyticsList.reduce((acc, t) => acc + t.analytics.currentProgress, 0);
  const avgTargetCompletion = targetAnalyticsList.length > 0
    ? Math.round(targetAnalyticsList.reduce((acc, t) => acc + t.analytics.percentComplete, 0) / targetAnalyticsList.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Analytics Scope Toggle: Tasks vs Targets */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div className="flex rounded-xl bg-neutral-900 border border-neutral-800 p-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'tasks'
                ? 'bg-neutral-800 text-emerald-300 shadow-sm font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>Daily Tasks Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('targets')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'targets'
                ? 'bg-neutral-800 text-emerald-300 shadow-sm font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Targets Analytics ({goals.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'tasks' ? (
        /* ================= DAILY TASKS ANALYTICS ================= */
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
                Weighted consistency across active habits.
              </p>
            </div>

            {/* Metric 2 */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Tasks Completed</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold tracking-tight text-neutral-100 font-mono tabular-nums">
                {overall.totalAllCompletions}
              </div>
              <p className="text-xs text-neutral-500">
                Total lifetime task repetitions fulfilled.
              </p>
            </div>

            {/* Metric 3 */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Best Streak Record</span>
                <Flame className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold tracking-tight text-neutral-100 font-mono tabular-nums">
                {overall.maxActiveStreak} <span className="text-sm font-normal text-neutral-400">days</span>
              </div>
              <p className="text-xs text-neutral-500">
                Longest unbroken streak recorded in history.
              </p>
            </div>

            {/* Metric 4 */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Today Reliability</span>
                <TrendingUp className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-bold tracking-tight text-neutral-100 font-mono tabular-nums">
                {overall.todayPercent}%
              </div>
              <p className="text-xs text-neutral-500">
                Completion rate for today&apos;s scheduled tasks.
              </p>
            </div>
          </div>

          {/* 30-Day Completion Trend Chart */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-200">
                  30-Day Execution Trajectory
                </h3>
                <p className="text-xs text-neutral-400">
                  Daily completed task volume across the past month
                </p>
              </div>
            </div>
            <CompletionTrendChart habits={habits} entries={entries} />
          </div>

          {/* Day of Week Consistency */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-4">
              <h3 className="text-sm font-bold text-neutral-200">
                Consistency by Day of Week
              </h3>
              <div className="space-y-3">
                {dayBreakdown.map((item) => (
                  <div key={item.dayName} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-neutral-300 font-medium">{item.dayName}</span>
                      <span className="text-neutral-400">{item.adherence}% ({item.completed}/{item.totalScheduled})</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-950 rounded-full overflow-hidden border border-neutral-850">
                      <div
                        className="h-full bg-emerald-400 rounded-full transition-all"
                        style={{ width: `${item.adherence}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Time of Day Distribution */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-4">
              <h3 className="text-sm font-bold text-neutral-200">
                Habit Time Allocation
              </h3>
              <div className="grid grid-cols-2 gap-3 pt-2">
                {Object.entries(timeBuckets).map(([slot, data]) => {
                  const rate = data.scheduled > 0 ? Math.round((data.completed / data.scheduled) * 100) : 0;
                  return (
                    <div key={slot} className="p-4 rounded-xl bg-neutral-950 border border-neutral-850 space-y-2">
                      <span className="text-xs font-bold text-neutral-300 capitalize block">
                        {slot}
                      </span>
                      <div className="text-xl font-bold font-mono text-emerald-400">
                        {rate}%
                      </div>
                      <span className="text-[11px] text-neutral-500 font-mono block">
                        {data.completed} completed
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= TARGETS ANALYTICS ================= */
        <div className="space-y-6">
          {/* Day-by-Day Target Progress & Improvement Graph */}
          {selectedGoal && (
            <div className="space-y-3">
              {goals.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  <span className="text-xs text-neutral-400 font-mono shrink-0">Select Target:</span>
                  {goals.map((g) => {
                    const isSelected = g.id === selectedGoal.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setSelectedGoalId(g.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
                          isSelected
                            ? 'bg-neutral-800 border-emerald-500 text-white font-bold'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {g.title}
                      </button>
                    );
                  })}
                </div>
              )}

              <TargetDayProgressGraph
                goal={selectedGoal}
                habits={habits}
                entries={entries}
                currentDayIndex={currentDayIndex}
                totalDays={totalDays}
                inspectedDay={inspectedDay}
                onSelectDay={(dayNum) => setInspectedDay(dayNum)}
              />
            </div>
          )}

          {/* Target Milestone Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-1">
              <span className="text-xs text-neutral-400 uppercase font-mono">Average Target Progress</span>
              <div className="text-2xl font-bold text-emerald-400 font-mono">{avgTargetCompletion}%</div>
              <span className="text-xs text-neutral-500">Across {goals.length} defined targets</span>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-1">
              <span className="text-xs text-neutral-400 uppercase font-mono">Completed Units</span>
              <div className="text-2xl font-bold text-white font-mono">{completedTargetVolume} / {totalTargetVolume}</div>
              <span className="text-xs text-neutral-500">Total milestone units achieved</span>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-1">
              <span className="text-xs text-neutral-400 uppercase font-mono">Active Targets</span>
              <div className="text-2xl font-bold text-sky-400 font-mono">{goals.filter((g) => g.status === 'active').length}</div>
              <span className="text-xs text-neutral-500">Currently in active execution</span>
            </div>
          </div>

          {/* Breakdown per target */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-4">
            <h3 className="text-sm font-bold text-neutral-200">
              Targets Progress & Trajectory
            </h3>

            {targetAnalyticsList.length > 0 ? (
              <div className="space-y-4">
                {targetAnalyticsList.map(({ goal, analytics }) => (
                  <div key={goal.id} className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-neutral-100 block text-sm">{goal.title}</span>
                        <span className="text-[11px] text-neutral-400 font-mono">
                          {goal.startDate} → {goal.targetDate} · {analytics.daysRemaining} days left
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase font-bold ${
                        analytics.paceStatus === 'ahead' || analytics.paceStatus === 'on_track'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      }`}>
                        {analytics.paceStatus.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono text-neutral-400">
                        <span>Progress: {analytics.currentProgress} / {goal.targetMetricCount} {goal.metricUnit}</span>
                        <span className="text-white font-bold">{analytics.percentComplete}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full transition-all"
                          style={{ width: `${analytics.percentComplete}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-500 italic py-4 text-center">
                No targets currently defined. Create a target to track analytics here.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Goal, Habit, HabitEntry, GoalNote } from '../types/habit';
import { calculateGoalAnalytics } from '../utils/goalAnalytics';
import { parseDateKey, getTodayKey, getPastNDays } from '../utils/date';
import { sound } from '../utils/audio';
import { HabitIcon } from './HabitIcon';
import {
  Target,
  Plus,
  AlertCircle,
  Calendar,
  Flame,
  CheckCircle2,
  TrendingUp,
  Clock,
  BookOpen,
  Edit3,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ListTodo,
  Check,
  Send,
} from 'lucide-react';

interface GoalsViewProps {
  goals: Goal[];
  habits: Habit[];
  entries: Record<string, HabitEntry>;
  selectedDateKey: string;
  onOpenNewGoal: () => void;
  onEditGoal: (goal: Goal) => void;
  onOpenNewHabitForGoal: (goalId: string) => void;
  onToggleComplete: (habit: Habit, value?: number, dateKey?: string) => void;
  onSaveGoalNotes: (goalId: string, noteText: string) => void;
}

export function GoalsView({
  goals,
  habits,
  entries,
  selectedDateKey,
  onOpenNewGoal,
  onEditGoal,
  onOpenNewHabitForGoal,
  onToggleComplete,
  onSaveGoalNotes,
}: GoalsViewProps) {
  const activeGoals = goals.filter((g) => g.status === 'active');
  const [selectedGoalId, setSelectedGoalId] = useState<string>(
    activeGoals[0]?.id || goals[0]?.id || ''
  );
  const [newNoteText, setNewNoteText] = useState('');

  // Target currently in view
  const currentGoal = goals.find((g) => g.id === selectedGoalId) || activeGoals[0] || goals[0];

  // If no goals at all
  if (!currentGoal) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-800 p-12 text-center space-y-4 bg-neutral-900/40 max-w-xl mx-auto my-12">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
          <Target className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-neutral-100">No 3-Month Targets Defined</h2>
          <p className="text-xs text-neutral-400">
            Define a high-leverage 3-month target milestone. All linked tasks, streaks, progress analytics, and strategic notes will be consolidated into this command hub.
          </p>
        </div>
        <button
          onClick={onOpenNewGoal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-bold rounded-xl text-xs transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create 3-Month Target</span>
        </button>
      </div>
    );
  }

  // Analytics for the selected target
  const analytics = calculateGoalAnalytics(currentGoal, entries);

  // Habits linked specifically to this target
  const linkedHabits = habits.filter(
    (h) => !h.archived && (h.goalId === currentGoal.id || currentGoal.linkedHabitIds?.includes(h.id))
  );

  // Target streak calculation (consecutive days with at least 1 linked task completed)
  const past30Days = getPastNDays(30, new Date());
  let targetStreak = 0;
  for (let i = past30Days.length - 1; i >= 0; i--) {
    const dKey = past30Days[i];
    const anyDone = linkedHabits.some((h) => {
      const e = entries[`${h.id}_${dKey}`];
      return e && e.status === 'completed';
    });
    if (anyDone) {
      targetStreak++;
    } else {
      // If it's today and not done yet, don't break streak if yesterday was completed
      if (i === past30Days.length - 1) continue;
      break;
    }
  }

  // Last 14 days mini consistency grid
  const past14Days = getPastNDays(14, new Date());

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    onSaveGoalNotes(currentGoal.id, newNoteText.trim());
    setNewNoteText('');
    sound.playCheck();
  };

  return (
    <div className="space-y-6">
      {/* Top Target Selector & Creator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight text-neutral-100 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-400" />
              <span>Target Milestone Command Center</span>
            </h2>
            <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
              {activeGoals.length} Active Targets
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Unified view of linked tasks, progress trajectories, strategic notes, and target consistency streaks.
          </p>
        </div>

        <button
          onClick={onOpenNewGoal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-bold rounded-lg text-xs transition-colors shadow-sm self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Target</span>
        </button>
      </div>

      {/* Target Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {goals.map((g) => {
          const isSelected = g.id === currentGoal.id;
          const a = calculateGoalAnalytics(g, entries);
          return (
            <button
              key={g.id}
              onClick={() => setSelectedGoalId(g.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-neutral-800 border-emerald-500/60 text-neutral-100 shadow-sm ring-1 ring-emerald-500/30'
                  : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-400' : 'bg-neutral-500'}`} />
              <span>{g.title}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-950 text-neutral-400 border border-neutral-800">
                {a.percentComplete}%
              </span>
            </button>
          );
        })}
      </div>

      {/* CURRENT TARGET COMMAND HUB: 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT COLUMN: TASKS & STRATEGY NOTES (7 Cols) ================= */}
        <div className="lg:col-span-7 space-y-5">
          {/* Target Headline Hero Card */}
          <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/80 space-y-4 shadow-sm relative overflow-hidden">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    {currentGoal.category}
                  </span>
                  <span className="text-xs text-neutral-500 font-mono">
                    {currentGoal.startDate} → {currentGoal.targetDate}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-neutral-100 tracking-tight">
                  {currentGoal.title}
                </h3>
                {currentGoal.description && (
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {currentGoal.description}
                  </p>
                )}
              </div>

              <button
                onClick={() => onEditGoal(currentGoal)}
                className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-750 flex items-center justify-center text-neutral-400 hover:text-white transition-colors shrink-0"
                title="Edit Target Details"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            {/* Main Progress Meter */}
            <div className="space-y-2 pt-2 border-t border-neutral-800">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-400">Total Progress:</span>
                <span className="text-neutral-100 font-bold tabular-nums">
                  {analytics.currentProgress} / {currentGoal.targetMetricCount} {currentGoal.metricUnit} ({analytics.percentComplete}%)
                </span>
              </div>
              <div className="w-full h-3 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800/80">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${analytics.percentComplete}%` }}
                />
              </div>
            </div>
          </div>

          {/* SECTION: Tasks & Habits Linked to this Target */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-neutral-200">
                  Target Tasks & Daily Habits ({linkedHabits.length})
                </h4>
              </div>

              <button
                onClick={() => onOpenNewHabitForGoal(currentGoal.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>+ Add Task to Target</span>
              </button>
            </div>

            {/* List of Tasks */}
            <div className="space-y-2.5">
              {linkedHabits.length > 0 ? (
                linkedHabits.map((habit) => {
                  const entry = entries[`${habit.id}_${selectedDateKey}`];
                  const isDoneToday = entry && entry.status === 'completed';

                  return (
                    <div
                      key={habit.id}
                      className="p-3.5 rounded-xl border border-neutral-800/80 bg-neutral-950/70 hover:border-neutral-700 transition-all flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Direct Checkbox */}
                        <button
                          type="button"
                          onClick={() => onToggleComplete(habit, habit.targetValue, selectedDateKey)}
                          className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all shrink-0 ${
                            isDoneToday
                              ? 'bg-emerald-500 border-emerald-500 text-neutral-950'
                              : 'bg-neutral-900 border-neutral-700 text-transparent hover:border-emerald-500'
                          }`}
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </button>

                        <div className="min-w-0">
                          <span
                            className={`font-semibold text-neutral-100 block truncate ${
                              isDoneToday ? 'line-through text-neutral-500' : ''
                            }`}
                          >
                            {habit.title}
                          </span>
                          <span className="text-[11px] text-neutral-400 capitalize block">
                            {habit.timeOfDay} · Target: {habit.targetValue} {habit.unit || 'times'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">
                          {isDoneToday ? '✓ Done Today' : 'Pending Today'}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 rounded-xl border border-dashed border-neutral-800 text-center space-y-2 bg-neutral-950/40">
                  <p className="text-xs text-neutral-400">
                    No tasks or habits currently assigned to this target.
                  </p>
                  <button
                    onClick={() => onOpenNewHabitForGoal(currentGoal.id)}
                    className="text-xs text-emerald-400 hover:underline font-semibold"
                  >
                    + Add your first task for {currentGoal.title}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* SECTION: Strategic Notes & Breakthrough Journal */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <h4 className="text-sm font-bold text-neutral-200">
                  Target Strategy Notes & Insights
                </h4>
              </div>
              <span className="text-[11px] text-neutral-500 font-mono">
                {currentGoal.notes?.length || 0} Notes
              </span>
            </div>

            {/* Note Input */}
            <form onSubmit={handleAddNoteSubmit} className="space-y-2">
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Log milestone notes, strategic tweaks, key breakthroughs, or blockers..."
                rows={2}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newNoteText.trim()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold rounded-lg text-xs transition-colors disabled:opacity-40"
                >
                  <Send className="w-3 h-3" />
                  <span>Save Note</span>
                </button>
              </div>
            </form>

            {/* Notes List */}
            <div className="space-y-2 pt-2 border-t border-neutral-800/80 max-h-64 overflow-y-auto pr-1">
              {currentGoal.notes && currentGoal.notes.length > 0 ? (
                currentGoal.notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-850 space-y-1 text-xs"
                  >
                    <p className="text-neutral-200 leading-relaxed whitespace-pre-wrap">
                      {note.text}
                    </p>
                    <span className="text-[10px] text-neutral-500 font-mono block">
                      {new Date(note.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-neutral-500 italic py-2">
                  No strategy notes logged yet for this target. Write observations as you execute.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: STREAK, REPORT & ANALYTICS (5 Cols) ================= */}
        <div className="lg:col-span-5 space-y-4">
          {/* Target Execution Streak Card */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Flame className="w-5 h-5 fill-amber-400/20" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-200">
                    Target Streak
                  </h4>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    Consecutive execution days
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-mono font-bold text-amber-400 tabular-nums">
                  {targetStreak} <span className="text-xs font-normal text-amber-300">Days</span>
                </div>
              </div>
            </div>

            {/* 14-Day Consistency Mini Heatmap */}
            <div className="space-y-1.5 pt-2 border-t border-neutral-800/80">
              <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 block">
                Last 14 Days Execution
              </span>
              <div className="grid grid-cols-7 gap-1.5">
                {past14Days.map((dKey) => {
                  const isDone = linkedHabits.some((h) => {
                    const e = entries[`${h.id}_${dKey}`];
                    return e && e.status === 'completed';
                  });
                  const dObj = parseDateKey(dKey);
                  return (
                    <div
                      key={dKey}
                      title={`${dKey}: ${isDone ? 'Completed' : 'No tasks done'}`}
                      className={`h-7 rounded-lg border flex flex-col items-center justify-center text-[9px] font-mono transition-colors ${
                        isDone
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                          : 'bg-neutral-950 border-neutral-800/80 text-neutral-600'
                      }`}
                    >
                      <span>{dObj.getDate()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Progress Report & Trajectory Analytics */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800/80">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                  Trajectory & Pace Report
                </h4>
              </div>
              <span
                className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full border ${
                  analytics.paceStatus === 'ahead' || analytics.paceStatus === 'on_track'
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                }`}
              >
                {analytics.paceStatus === 'ahead'
                  ? 'Ahead of Schedule'
                  : analytics.paceStatus === 'on_track'
                  ? 'On Track'
                  : `Delayed (${analytics.delayDays}d behind)`}
              </span>
            </div>

            {/* Key Analytics Metrics */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-850 space-y-1">
                <span className="text-[10px] text-neutral-500 block uppercase">Days Left</span>
                <span className="text-base font-bold text-neutral-100 tabular-nums">
                  ⏳ {analytics.daysRemaining} days
                </span>
                <span className="text-[10px] text-neutral-400 block font-sans">
                  of {analytics.daysTotal} total days
                </span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-850 space-y-1">
                <span className="text-[10px] text-neutral-500 block uppercase">Pending Volume</span>
                <span className="text-base font-bold text-amber-400 tabular-nums">
                  {analytics.pendingCount} {currentGoal.metricUnit}
                </span>
                <span className="text-[10px] text-neutral-400 block font-sans">
                  remaining to goal
                </span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-850 space-y-1">
                <span className="text-[10px] text-neutral-500 block uppercase">Daily Run Rate</span>
                <span className="text-base font-bold text-emerald-400 tabular-nums">
                  {analytics.daysRemaining > 0
                    ? (analytics.pendingCount / analytics.daysRemaining).toFixed(1)
                    : 0}{' '}
                  /day
                </span>
                <span className="text-[10px] text-neutral-400 block font-sans">
                  needed to finish on time
                </span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-850 space-y-1">
                <span className="text-[10px] text-neutral-500 block uppercase">Expected Pace</span>
                <span className="text-base font-bold text-neutral-200 tabular-nums">
                  {analytics.expectedPercent}%
                </span>
                <span className="text-[10px] text-neutral-400 block font-sans">
                  actual: {analytics.percentComplete}%
                </span>
              </div>
            </div>

            {/* Delivery Alert Advice */}
            <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 text-[11px] text-neutral-400 leading-relaxed">
              {analytics.paceStatus === 'ahead' ? (
                <span className="text-emerald-300">
                  🌟 Outstanding velocity! You are running ahead of the calculated schedule line. Keep steady to lock in this milestone early.
                </span>
              ) : analytics.paceStatus === 'on_track' ? (
                <span className="text-neutral-300">
                  🎯 You are pacing exactly on schedule. Maintain your regular task routines to deliver by {currentGoal.targetDate}.
                </span>
              ) : (
                <span className="text-amber-300">
                  ⚠️ Target delivery is experiencing delay. You need approximately{' '}
                  {(analytics.pendingCount / Math.max(1, analytics.daysRemaining)).toFixed(1)}{' '}
                  {currentGoal.metricUnit}/day to recover your delivery date.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

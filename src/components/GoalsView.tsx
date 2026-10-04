import React, { useState } from 'react';
import { Goal, Habit, HabitEntry } from '../types/habit';
import { calculateGoalAnalytics } from '../utils/goalAnalytics';
import { parseDateKey, getTodayKey, getPastNDays, formatDateKey } from '../utils/date';
import { sound } from '../utils/audio';
import { ProgressRocketWidget } from './ProgressRocketWidget';
import {
  Target,
  Plus,
  Flame,
  CheckCircle2,
  TrendingUp,
  Clock,
  Edit3,
  ListTodo,
  Check,
  Calendar,
  Quote,
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
  onSaveGoalNotes?: (goalId: string, noteText: string) => void;
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
}: GoalsViewProps) {
  const activeGoals = goals.filter((g) => g.status === 'active');
  const [selectedGoalId, setSelectedGoalId] = useState<string>(
    activeGoals[0]?.id || goals[0]?.id || ''
  );

  // Target currently selected
  const currentGoal = goals.find((g) => g.id === selectedGoalId) || activeGoals[0] || goals[0];

  // Calculate day-by-day dates
  const startDateObj = currentGoal ? parseDateKey(currentGoal.startDate) : new Date();
  const targetDateObj = currentGoal ? parseDateKey(currentGoal.targetDate) : new Date();
  const totalDays = currentGoal
    ? Math.max(1, Math.round((targetDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1)
    : 30;

  const todayObj = parseDateKey(getTodayKey());
  const currentDayIndex = currentGoal
    ? Math.min(
        totalDays,
        Math.max(1, Math.round((todayObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1)
      )
    : 1;

  // Selected day for inspection in middle screen (default to current day)
  const [inspectedDay, setInspectedDay] = useState<number>(currentDayIndex);

  // If no targets defined
  if (!currentGoal) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-800 p-12 text-center space-y-4 bg-neutral-900/40 max-w-lg mx-auto my-12">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
          <Target className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-neutral-100">No Targets Yet</h2>
          <p className="text-xs text-neutral-400">
            Set up your custom target to start tracking timeline days and milestone velocity.
          </p>
        </div>
        <button
          onClick={onOpenNewGoal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-bold rounded-xl text-xs transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Target</span>
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

  // Consecutive days streak for this target
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
      if (i === past30Days.length - 1) continue;
      break;
    }
  }

  // Compute inspected day's date string
  const inspectedDateObj = new Date(startDateObj);
  inspectedDateObj.setDate(startDateObj.getDate() + (inspectedDay - 1));
  const inspectedDateKey = formatDateKey(inspectedDateObj);
  const inspectedDayOfWeek = inspectedDateObj.getDay();

  // Tasks for inspected day
  const inspectedDayHabits = linkedHabits.filter((h) => {
    if (h.isOneTime) return h.specificDate === inspectedDateKey;
    return h.frequencyDays.includes(inspectedDayOfWeek);
  });

  const inspectedCompletedCount = inspectedDayHabits.filter((h) => {
    const e = entries[`${h.id}_${inspectedDateKey}`];
    return e && e.status === 'completed';
  }).length;

  // Motivation quotes with thinker pictures, changes automatically every 5 hours
  const TARGET_MOTIVATIONS = [
    {
      quote: "The impediment to action advances action. What stands in the way becomes the way.",
      author: "Marcus Aurelius",
      title: "Roman Emperor & Stoic Philosopher",
      avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=120&auto=format&fit=crop&q=80",
    },
    {
      quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
      author: "Aristotle",
      title: "Greek Polymath & Philosopher",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    },
    {
      quote: "Knowing is not enough, we must apply. Willing is not enough, we must do.",
      author: "Bruce Lee",
      title: "Martial Artist & Philosopher",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    },
    {
      quote: "You do not rise to the level of your goals. You fall to the level of your systems.",
      author: "James Clear",
      title: "Author of Atomic Habits",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    },
    {
      quote: "It is not that we have a short time to live, but that we waste a lot of it.",
      author: "Seneca",
      title: "Stoic Philosopher & Statesman",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80",
    },
    {
      quote: "Small daily improvements over time lead to stunning results.",
      author: "Robin Sharma",
      title: "Performance & Leadership Mentor",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80",
    },
  ];

  // Rotate quote every 5 hours
  const fiveHourBlock = Math.floor(Date.now() / (5 * 60 * 60 * 1000));
  const motivation = TARGET_MOTIVATIONS[fiveHourBlock % TARGET_MOTIVATIONS.length];

  return (
    <div className="space-y-4">
      {/* Top Target Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-800/80">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {goals.map((g) => {
            const isSelected = g.id === currentGoal.id;
            const a = calculateGoalAnalytics(g, entries);
            return (
              <button
                key={g.id}
                onClick={() => {
                  setSelectedGoalId(g.id);
                  setInspectedDay(1);
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-neutral-800 border-emerald-500/60 text-neutral-100 shadow-sm ring-1 ring-emerald-500/30'
                    : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-400' : 'bg-neutral-500'}`} />
                <span>{g.title}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-950 text-neutral-400 border border-neutral-800">
                  {a.percentComplete}%
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={onOpenNewGoal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-bold rounded-lg text-xs transition-colors shrink-0 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Add Target</span>
        </button>
      </div>

      {/* 2-COLUMN LAYOUT:
          - Left/Middle (7 cols):
              1. Compact Motivation card at top with thinker portrait picture (no "5h daily focus" badge)
              2. Day Details & Tasks in Middle Screen
          - Right Sidebar (5 cols):
              1. Top: Keep Pushing Progress Card matching user's reference image
              2. Below: 7-Days-per-Row Vertical Chain (no "D1 D2" headers, just clean numbers 1 2 3...)
      */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ================= MIDDLE COLUMN ================= */}
        <div className="lg:col-span-7 space-y-4">
          {/* 1. MOTIVATION CARD WITH PICTURE & AUTHOR (BIGGER TEXT, CLEAR PORTRAIT) */}
          <div className="p-4 sm:p-5 rounded-2xl border border-neutral-800 bg-neutral-900/80 flex items-center gap-4 shadow-sm relative overflow-hidden">
            {/* Thinker Portrait Picture */}
            <img
              src={motivation.avatar}
              alt={motivation.author}
              className="w-13 h-13 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-emerald-500/50 shrink-0 shadow-md ring-2 ring-emerald-500/20"
              onError={(e) => {
                // Fallback to initial avatar
                e.currentTarget.style.display = 'none';
              }}
            />

            <div className="min-w-0 flex-1">
              <p className="font-serif italic text-sm sm:text-base md:text-lg text-neutral-100 leading-snug">
                &ldquo;{motivation.quote}&rdquo;
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs font-bold text-emerald-400 font-mono">
                  {motivation.author}
                </span>
                <span className="text-[11px] text-neutral-400 font-mono hidden sm:inline">
                  · {motivation.title}
                </span>
              </div>
            </div>
          </div>

          {/* 2. DAY DETAILS & TASKS IN MIDDLE SCREEN */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-neutral-100">
                    Day {inspectedDay} Tasks
                  </h3>
                  {inspectedDay === currentDayIndex ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                      ⚡ Active Today
                    </span>
                  ) : inspectedDay < currentDayIndex ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700">
                      Passed
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-500 border border-neutral-800">
                      Upcoming
                    </span>
                  )}
                </div>
                <span className="text-xs text-neutral-400 font-mono">
                  {inspectedDateObj.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-emerald-400 tabular-nums">
                  {inspectedCompletedCount} / {inspectedDayHabits.length} Done
                </span>

                <button
                  onClick={() => onOpenNewHabitForGoal(currentGoal.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </button>
              </div>
            </div>

            {/* Task Items Checklist */}
            <div className="space-y-2">
              {inspectedDayHabits.length > 0 ? (
                inspectedDayHabits.map((habit) => {
                  const entry = entries[`${habit.id}_${inspectedDateKey}`];
                  const isDone = entry && entry.status === 'completed';

                  return (
                    <div
                      key={habit.id}
                      className="p-3 rounded-xl border border-neutral-800 bg-neutral-950/70 hover:border-neutral-700 transition-all flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Live Checkbox */}
                        <button
                          type="button"
                          onClick={() => onToggleComplete(habit, habit.targetValue, inspectedDateKey)}
                          className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all shrink-0 ${
                            isDone
                              ? 'bg-emerald-500 border-emerald-500 text-neutral-950 shadow-sm'
                              : 'bg-neutral-900 border-neutral-700 text-transparent hover:border-emerald-500'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>

                        <div className="min-w-0">
                          <span
                            className={`font-semibold text-neutral-100 block truncate ${
                              isDone ? 'line-through text-neutral-500' : ''
                            }`}
                          >
                            {habit.title}
                          </span>
                          <span className="text-[11px] text-neutral-400 capitalize block">
                            {habit.timeOfDay} · Target: {habit.targetValue} {habit.unit || 'units'}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 shrink-0">
                        {isDone ? '✓ Completed' : 'Pending'}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 rounded-xl border border-dashed border-neutral-800 text-center space-y-2 bg-neutral-950/40">
                  <p className="text-xs text-neutral-400">
                    No routine tasks scheduled for Day {inspectedDay}.
                  </p>
                  <button
                    onClick={() => onOpenNewHabitForGoal(currentGoal.id)}
                    className="text-xs text-emerald-400 hover:underline font-semibold"
                  >
                    + Link a daily task to {currentGoal.title}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDEBAR ================= */}
        <div className="lg:col-span-5 space-y-4">
          {/* 1. KEEP PUSHING PROGRESS WIDGET MATCHING REFERENCE IMAGE */}
          <ProgressRocketWidget
            title={currentGoal.title}
            subtitle={currentGoal.description || 'Building mastery one problem at a time — keep the momentum going!'}
            completed={analytics.currentProgress}
            total={currentGoal.targetMetricCount}
            progressLabel="Total progress"
            progressSublabel={`for ${currentGoal.title}`}
          />

          {/* 2. 7-DAYS-PER-ROW VERTICAL CHAIN (WITHOUT D1 D2 HEADERS, JUST CLEAN NUMBERS 1, 2, 3...) */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                  Timeline Chain ({totalDays} Days)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                Day {currentDayIndex} of {totalDays}
              </span>
            </div>

            {/* Vertical scrolling container for lines of 7 days */}
            <div className="max-h-60 overflow-y-auto pr-1 scrollbar-thin pt-1">
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: totalDays }).map((_, idx) => {
                  const dayNumber = idx + 1;
                  const isPassed = dayNumber < currentDayIndex;
                  const isCurrent = dayNumber === currentDayIndex;
                  const isInspected = dayNumber === inspectedDay;

                  return (
                    <button
                      key={dayNumber}
                      type="button"
                      onClick={() => {
                        setInspectedDay(dayNumber);
                        sound.playCheck();
                      }}
                      title={`Day ${dayNumber} (${isPassed ? 'Passed' : isCurrent ? 'Today' : 'Upcoming'}) - Click to view in middle screen`}
                      className={`h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold transition-all ${
                        isInspected
                          ? 'ring-2 ring-emerald-400 scale-105 z-10 shadow-sm'
                          : ''
                      } ${
                        isCurrent
                          ? 'bg-emerald-400 text-neutral-950 font-black'
                          : isPassed
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                          : 'bg-neutral-950 border border-neutral-800 text-neutral-500 hover:text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      {dayNumber}
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-[10px] text-neutral-500 text-center font-mono">
              Click any day number above to view tasks in the middle screen
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

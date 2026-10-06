import React, { useState } from 'react';
import { Goal, Habit, HabitEntry } from '../types/habit';
import { calculateGoalAnalytics } from '../utils/goalAnalytics';
import { parseDateKey, getTodayKey, getPastNDays, formatDateKey } from '../utils/date';
import { sound } from '../utils/audio';
import { ProgressRocketWidget } from './ProgressRocketWidget';
import { HabitIcon } from './HabitIcon';
import { resolveHabitVisuals } from '../utils/habitVisuals';
import { isHabitScheduledOnDate } from '../utils/habitSchedule';
import { CustomCategory } from '../types/habit';
import {
  Target,
  Plus,
  Flame,
  CheckCircle2,
  TrendingUp,
  Clock,
  Edit3,
  Trash2,
  ListTodo,
  Check,
  Calendar,
  Quote,
  FileText,
} from 'lucide-react';

const COLOR_CLASSES: Record<string, { bg: string; border: string; text: string }> = {
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  sky: { bg: 'bg-sky-500/10', border: 'border-sky-500/30', text: 'text-sky-400' },
  indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
  rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400' },
  teal: { bg: 'bg-teal-500/10', border: 'border-teal-500/30', text: 'text-teal-400' },
  violet: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
  orange: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
};

interface GoalsViewProps {
  goals: Goal[];
  habits: Habit[];
  entries: Record<string, HabitEntry>;
  categories?: CustomCategory[];
  selectedDateKey: string;
  onOpenNewGoal: () => void;
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal: (goalId: string) => void;
  onOpenNewHabitForGoal: (goalId: string, startingDateKey?: string) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
  onToggleComplete: (habit: Habit, value?: number, dateKey?: string) => void;
  onSaveGoalNotes?: (goalId: string, noteText: string) => void;
  onSaveHabitNote?: (habitId: string, noteText: string, dateKey?: string) => void;
}

export function GoalsView({
  goals,
  habits,
  entries,
  categories = [],
  selectedDateKey,
  onOpenNewGoal,
  onEditGoal,
  onDeleteGoal,
  onOpenNewHabitForGoal,
  onEditHabit,
  onDeleteHabit,
  onToggleComplete,
  onSaveGoalNotes,
  onSaveHabitNote,
}: GoalsViewProps) {
  const activeGoals = goals.filter((g) => g.status === 'active');
  const [selectedGoalId, setSelectedGoalId] = useState<string>(
    activeGoals[0]?.id || goals[0]?.id || ''
  );
  const [expandedNoteHabitId, setExpandedNoteHabitId] = useState<string | null>(null);
  const [draftNoteText, setDraftNoteText] = useState<string>('');

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

  // Tasks for inspected day: tasks added in-between target period only appear from that day to the end, never on previous days!
  const inspectedDayHabits = linkedHabits.filter((h) =>
    isHabitScheduledOnDate(h, inspectedDateKey, inspectedDayOfWeek)
  );

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

        <div className="flex items-center gap-2 shrink-0">
          {currentGoal && (
            <>
              <button
                type="button"
                onClick={() => onEditGoal(currentGoal)}
                title={`Edit "${currentGoal.title}"`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 rounded-lg text-xs font-semibold transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit Target</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete target "${currentGoal.title}"?`)) {
                    onDeleteGoal(currentGoal.id);
                  }
                }}
                title={`Delete "${currentGoal.title}"`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-rose-500/15 text-neutral-400 hover:text-rose-400 border border-neutral-800 hover:border-rose-500/30 rounded-lg text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Delete Target</span>
              </button>
            </>
          )}

          <button
            onClick={onOpenNewGoal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-bold rounded-lg text-xs transition-colors shrink-0 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Add Target</span>
          </button>
        </div>
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
                  onClick={() => onOpenNewHabitForGoal(currentGoal.id, inspectedDateKey)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </button>
              </div>
            </div>

            {/* Task Items Checklist */}
            <div className="space-y-2.5">
              {inspectedDayHabits.length > 0 ? (
                inspectedDayHabits.map((habit) => {
                  const entry = entries[`${habit.id}_${inspectedDateKey}`];
                  const isDone = entry && entry.status === 'completed';
                  const visuals = resolveHabitVisuals(habit, categories);
                  const colorScheme = COLOR_CLASSES[visuals.color] || COLOR_CLASSES.emerald;
                  const currentNote = entry?.notes || habit.notes || '';
                  const isNoteExpanded = expandedNoteHabitId === habit.id;

                  return (
                    <div
                      key={habit.id}
                      className={`p-3 md:px-4 md:py-3.5 rounded-xl border transition-all text-xs ${
                        isDone
                          ? 'bg-neutral-900/40 border-neutral-800/60'
                          : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700 shadow-sm'
                      }`}
                    >
                      {/* Main Task Header Row */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Live Checkbox matching home page */}
                          <button
                            type="button"
                            onClick={() => {
                              if (isDone) {
                                sound.playUncheck();
                                onToggleComplete(habit, 0, inspectedDateKey);
                              } else {
                                sound.playCheck();
                                onToggleComplete(habit, habit.targetValue, inspectedDateKey);
                              }
                            }}
                            aria-label={isDone ? 'Mark incomplete' : 'Mark done'}
                            className={`w-6 h-6 md:w-7 md:h-7 rounded-lg shrink-0 flex items-center justify-center border transition-all active:scale-90 ${
                              isDone
                                ? 'bg-emerald-500 border-emerald-400 text-neutral-950 shadow-sm shadow-emerald-500/20'
                                : 'border-neutral-700 bg-neutral-850 hover:border-emerald-500/60 text-transparent hover:text-neutral-500'
                            }`}
                          >
                            {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                          </button>

                          {/* Logo / Category Icon like home page */}
                          <div
                            className={`w-7 h-7 md:w-8 md:h-8 rounded-lg shrink-0 flex items-center justify-center border ${colorScheme.bg} ${colorScheme.border} ${colorScheme.text}`}
                          >
                            <HabitIcon name={visuals.icon} className="w-4 h-4" />
                          </div>

                          {/* Title and metadata */}
                          <div className="min-w-0 flex-1">
                            <span
                              className={`text-sm font-semibold tracking-tight block truncate ${
                                isDone ? 'text-neutral-400 line-through decoration-neutral-600' : 'text-neutral-100'
                              }`}
                            >
                              {habit.title}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border font-medium ${colorScheme.bg} ${colorScheme.border} ${colorScheme.text}`}>
                                {visuals.categoryLabel}
                              </span>
                              {habit.startDate && habit.startDate > currentGoal.startDate && (
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-amber-300 border border-neutral-700 font-medium">
                                  Starts {habit.startDate}
                                </span>
                              )}
                              <span className="text-[11px] text-neutral-400 capitalize">
                                · {habit.timeOfDay} · Target: {habit.targetValue} {habit.unit || 'units'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions & Status Badge */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`text-[10px] font-mono px-2.5 py-1 rounded-full border font-medium ${
                              isDone
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                            }`}
                          >
                            {isDone ? '✓ Completed' : 'Pending'}
                          </span>

                          {/* Note Expand/Collapse Trigger */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isNoteExpanded) {
                                setExpandedNoteHabitId(null);
                              } else {
                                setExpandedNoteHabitId(habit.id);
                                setDraftNoteText(currentNote);
                              }
                            }}
                            title={currentNote ? 'View/Edit Note' : 'Add Note'}
                            className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-colors ${
                              currentNote
                                ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 hover:bg-amber-500/25'
                                : 'border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800 hover:text-white text-neutral-400'
                            }`}
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditHabit(habit);
                            }}
                            title={`Edit "${habit.title}"`}
                            className="w-7 h-7 rounded-lg border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800 hover:text-white text-neutral-400 flex items-center justify-center transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Delete task "${habit.title}"?`)) {
                                onDeleteHabit(habit.id);
                              }
                            }}
                            title={`Delete "${habit.title}"`}
                            className="w-7 h-7 rounded-lg border border-neutral-800 bg-neutral-900/60 hover:bg-rose-500/15 hover:border-rose-500/30 hover:text-rose-400 text-neutral-400 flex items-center justify-center transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Note Preview if note exists and editor is collapsed */}
                      {currentNote && !isNoteExpanded && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedNoteHabitId(habit.id);
                            setDraftNoteText(currentNote);
                          }}
                          className="mt-2.5 text-left w-full px-2.5 py-1.5 rounded-lg bg-neutral-950/70 border border-neutral-800 hover:border-amber-500/40 text-neutral-300 text-[11px] flex items-start gap-1.5 transition-all group"
                        >
                          <FileText className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" />
                          <span className="line-clamp-2 italic text-neutral-300 group-hover:text-amber-200 flex-1">
                            {currentNote}
                          </span>
                          <span className="text-[10px] text-neutral-500 ml-auto shrink-0 group-hover:text-amber-400 font-mono">
                            Edit Note
                          </span>
                        </button>
                      )}

                      {/* Expandable Inline Note Editor */}
                      {isNoteExpanded && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="mt-3 pt-3 border-t border-neutral-800/80 space-y-2 animate-in fade-in-50 duration-150"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-amber-400" />
                              <span>Note for {habit.title}</span>
                            </span>
                            <span className="text-[10px] text-neutral-500 font-mono">
                              Day {inspectedDay}
                            </span>
                          </div>

                          <textarea
                            value={draftNoteText}
                            onChange={(e) => setDraftNoteText(e.target.value)}
                            placeholder="Add notes, key takeaways, links, or solutions for this task..."
                            rows={3}
                            className="w-full bg-neutral-950 border border-neutral-700/80 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50 rounded-lg p-2.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none resize-y"
                            autoFocus
                          />

                          <div className="flex items-center justify-between gap-2 pt-0.5">
                            {currentNote ? (
                              <button
                                type="button"
                                onClick={() => {
                                  onSaveHabitNote?.(habit.id, '', inspectedDateKey);
                                  setExpandedNoteHabitId(null);
                                  setDraftNoteText('');
                                }}
                                className="text-[11px] text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Remove note</span>
                              </button>
                            ) : (
                              <span />
                            )}

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setExpandedNoteHabitId(null);
                                  setDraftNoteText('');
                                }}
                                className="px-2.5 py-1 rounded-lg text-xs font-medium text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  onSaveHabitNote?.(habit.id, draftNoteText, inspectedDateKey);
                                  setExpandedNoteHabitId(null);
                                  setDraftNoteText('');
                                }}
                                className="px-3 py-1 rounded-lg text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-sm flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>Save Note</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-8 rounded-xl border border-dashed border-neutral-800 text-center space-y-2 bg-neutral-950/40">
                  <p className="text-xs text-neutral-400">
                    No routine tasks scheduled for Day {inspectedDay}.
                  </p>
                  <button
                    onClick={() => onOpenNewHabitForGoal(currentGoal.id, inspectedDateKey)}
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

import React, { useState } from 'react';
import { Habit, HabitEntry, Goal, CustomCategory } from '../types/habit';
import { HabitIcon } from './HabitIcon';
import { resolveHabitVisuals } from '../utils/habitVisuals';
import {
  Check,
  Flame,
  Clock,
  Play,
  X,
  PauseCircle,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
  Target,
  Calendar,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface HabitCardProps {
  habit: Habit;
  entry?: HabitEntry;
  linkedGoal?: Goal;
  categories?: CustomCategory[];
  currentStreak: number;
  habitStrength: number;
  onToggleComplete: (habit: Habit, value?: number) => void;
  onMarkMissed: (habit: Habit) => void;
  onMarkSkipped: (habit: Habit) => void;
  onOpenTimer: (habit: Habit) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
}

const COLOR_CLASSES: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
  },
  sky: {
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    text: 'text-sky-400',
    dot: 'bg-sky-400',
  },
  indigo: {
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    text: 'text-indigo-400',
    dot: 'bg-indigo-400',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
  },
  rose: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    text: 'text-rose-400',
    dot: 'bg-rose-400',
  },
  teal: {
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/30',
    text: 'text-teal-400',
    dot: 'bg-teal-400',
  },
  violet: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    dot: 'bg-purple-400',
  },
  orange: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
  },
};

export function HabitCard({
  habit,
  entry,
  linkedGoal,
  categories = [],
  currentStreak,
  habitStrength,
  onToggleComplete,
  onMarkMissed,
  onMarkSkipped,
  onOpenTimer,
  onEditHabit,
  onDeleteHabit,
}: HabitCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const visuals = resolveHabitVisuals(habit, categories);
  const colorScheme = COLOR_CLASSES[visuals.color] || COLOR_CLASSES.emerald;

  const isCompleted = entry?.status === 'completed';
  const isMissed = entry?.status === 'missed';
  const isSkipped = entry?.status === 'skipped';
  const currentValue = entry?.value ?? 0;

  const handleCheckClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCompleted) {
      sound.playUncheck();
      onToggleComplete(habit, 0);
    } else {
      sound.playCheck();
      onToggleComplete(habit, habit.targetValue);
    }
  };

  const handleStepValue = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation();
    const nextVal = Math.max(0, Math.min(habit.targetValue * 2, currentValue + delta));
    if (nextVal >= habit.targetValue && !isCompleted) {
      sound.playCheck();
    }
    onToggleComplete(habit, nextVal);
  };

  const getScheduleLabel = () => {
    if (habit.isOneTime) return habit.specificDate ? `Scheduled: ${habit.specificDate}` : 'One-time task';
    if (habit.frequencyDays.length === 7) return 'Everyday';
    if (
      habit.frequencyDays.length === 5 &&
      [1, 2, 3, 4, 5].every((d) => habit.frequencyDays.includes(d))
    )
      return 'Weekdays (Mon-Fri)';
    if (
      habit.frequencyDays.length === 2 &&
      [0, 6].every((d) => habit.frequencyDays.includes(d))
    )
      return 'Weekends (Sat-Sun)';
    const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return habit.frequencyDays.map((d) => names[d]).join(', ');
  };

  return (
    <div
      onClick={() => setIsExpanded(!isExpanded)}
      className={`group cursor-pointer rounded-xl border transition-all duration-200 overflow-hidden ${
        isCompleted
          ? 'bg-neutral-900/40 border-neutral-800/60'
          : isMissed
          ? 'bg-rose-950/20 border-rose-900/40'
          : isSkipped
          ? 'bg-neutral-900/30 border-neutral-800/40 opacity-75'
          : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700 shadow-sm'
      }`}
    >
      {/* Primary Clean Row: ONLY Checkbox, Category Icon, Task Title, and Expand Chevron */}
      <div className="p-3 md:px-4 md:py-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Checkmark trigger */}
          <button
            type="button"
            onClick={handleCheckClick}
            aria-label={isCompleted ? 'Mark incomplete' : 'Mark done'}
            className={`w-6 h-6 md:w-7 md:h-7 rounded-lg shrink-0 flex items-center justify-center border transition-all active:scale-90 ${
              isCompleted
                ? 'bg-emerald-500 border-emerald-400 text-neutral-950 shadow-sm shadow-emerald-500/20'
                : isMissed
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                : 'border-neutral-700 bg-neutral-850 hover:border-emerald-500/60 text-transparent hover:text-neutral-500'
            }`}
          >
            {isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
            {isMissed && <X className="w-3.5 h-3.5 stroke-[3]" />}
          </button>

          {/* Icon */}
          <div
            className={`w-7 h-7 md:w-8 md:h-8 rounded-lg shrink-0 flex items-center justify-center border ${colorScheme.bg} ${colorScheme.border} ${colorScheme.text}`}
          >
            <HabitIcon name={visuals.icon} className="w-4 h-4" />
          </div>

          {/* Task Title ONLY (Clean, bold, high contrast) */}
          <h3
            className={`text-sm md:text-base font-semibold tracking-tight truncate ${
              isCompleted
                ? 'text-neutral-400 line-through decoration-neutral-600'
                : 'text-neutral-100'
            }`}
          >
            {habit.title}
          </h3>
        </div>

        {/* Expand Chevron Icon on the far right */}
        <div className="flex items-center gap-2 shrink-0 text-neutral-400 group-hover:text-neutral-200">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {/* Expandable Section: EVERYTHING ELSE appears here on click! */}
      {isExpanded && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="px-4 pb-4 pt-2 border-t border-neutral-800/80 bg-neutral-950/60 space-y-3 text-xs"
        >
          {/* Metadata Grid (Scheduled time, Cadence, Streak, Linked Target) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-neutral-400">
            {habit.targetTime && (
              <div className="p-2 rounded-lg bg-neutral-900/60 border border-neutral-850">
                <span className="text-[10px] text-neutral-500 block">Time</span>
                <span className="font-mono text-neutral-200 font-medium">{habit.targetTime} ({habit.timeOfDay})</span>
              </div>
            )}

            <div className="p-2 rounded-lg bg-neutral-900/60 border border-neutral-850">
              <span className="text-[10px] text-neutral-500 block">Schedule</span>
              <span className="text-neutral-200 font-medium">{getScheduleLabel()}</span>
            </div>

            <div className="p-2 rounded-lg bg-neutral-900/60 border border-neutral-850">
              <span className="text-[10px] text-neutral-500 block">Streak</span>
              <span className="font-mono text-amber-400 font-semibold">{currentStreak} days 🔥</span>
            </div>

            {linkedGoal && (
              <div className="p-2 rounded-lg bg-neutral-900/60 border border-neutral-850">
                <span className="text-[10px] text-neutral-500 block">Target Goal</span>
                <span className="text-emerald-400 font-medium truncate block">{linkedGoal.title}</span>
              </div>
            )}
          </div>

          {/* Stepper or Timer Trigger if numeric/timer */}
          {habit.targetType === 'numeric' && (
            <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-neutral-400 block">Numeric Goal:</span>
                <span className="font-mono text-neutral-200 font-bold text-sm">
                  {currentValue} / {habit.targetValue} {habit.unit}
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-neutral-950 px-2 py-1 rounded-lg border border-neutral-800">
                <button
                  type="button"
                  onClick={(e) => handleStepValue(e, -Math.ceil(habit.targetValue / 5))}
                  disabled={currentValue <= 0}
                  className="w-7 h-7 rounded flex items-center justify-center font-mono font-bold text-neutral-400 hover:text-white disabled:opacity-30"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={(e) => handleStepValue(e, Math.ceil(habit.targetValue / 5))}
                  className="w-7 h-7 rounded flex items-center justify-center font-mono font-bold text-emerald-400 hover:text-emerald-300"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {habit.targetType === 'timer' && (
            <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-neutral-400 block">Focus Session:</span>
                <span className="font-mono text-indigo-300 font-bold text-sm">
                  {habit.targetValue} Minutes
                </span>
              </div>

              <button
                type="button"
                onClick={() => onOpenTimer(habit)}
                className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Launch Focus Timer</span>
              </button>
            </div>
          )}

          {/* Description */}
          {habit.description && (
            <div className="text-neutral-300 leading-relaxed bg-neutral-900/60 p-3 rounded-lg border border-neutral-800">
              <span className="font-semibold text-neutral-400 block mb-0.5 text-[11px]">Task Description:</span>
              {habit.description}
            </div>
          )}

          {/* Cue trigger */}
          {habit.cue && (
            <div className="p-2.5 rounded-lg bg-neutral-900/40 border border-neutral-850 text-neutral-400">
              <span className="text-neutral-500 block text-[10px]">Execution Trigger / Cue:</span>
              <span className="text-neutral-200 italic">&ldquo;{habit.cue}&rdquo;</span>
            </div>
          )}

          {/* Reason notes */}
          {entry?.notes && (
            <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/30 text-rose-300">
              <span className="font-semibold text-rose-400 block text-[10px]">Log Note:</span>
              {entry.notes}
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-800/60">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onMarkMissed(habit)}
                className="px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-rose-400 flex items-center gap-1.5 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Mark Missed</span>
              </button>

              <button
                type="button"
                onClick={() => onMarkSkipped(habit)}
                className="px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-sky-400 flex items-center gap-1.5 transition-colors"
              >
                <PauseCircle className="w-3.5 h-3.5" />
                <span>Skip Day</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onEditHabit(habit)}
                className="px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-neutral-400" />
                <span>Edit</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm(`Delete "${habit.title}"?`)) {
                    onDeleteHabit(habit.id);
                  }
                }}
                className="px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-rose-950/40 text-rose-500 hover:text-rose-400 flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

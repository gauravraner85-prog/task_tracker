import React, { useState } from 'react';
import { Habit, HabitEntry } from '../types/habit';
import { getWeekDays, parseDateKey, formatDateKey, getTodayKey } from '../utils/date';
import { HabitIcon } from './HabitIcon';
import { sound } from '../utils/audio';
import { ChevronLeft, ChevronRight, Check, X, PauseCircle, Calendar, Sparkles } from 'lucide-react';

interface WeekViewProps {
  habits: Habit[];
  entries: Record<string, HabitEntry>;
  onToggleComplete: (habit: Habit, value?: number, dateKey?: string) => void;
  onOpenNewHabit: () => void;
}

export function WeekView({
  habits,
  entries,
  onToggleComplete,
  onOpenNewHabit,
}: WeekViewProps) {
  const [currentWeekRef, setCurrentWeekRef] = useState<string>(getTodayKey());
  const weekDays = getWeekDays(currentWeekRef);
  const activeHabits = habits.filter((h) => !h.archived);

  // Navigate weeks
  const handlePrevWeek = () => {
    const d = parseDateKey(currentWeekRef);
    d.setDate(d.getDate() - 7);
    setCurrentWeekRef(formatDateKey(d));
  };

  const handleNextWeek = () => {
    const d = parseDateKey(currentWeekRef);
    d.setDate(d.getDate() + 7);
    setCurrentWeekRef(formatDateKey(d));
  };

  const handleCurrentWeek = () => {
    setCurrentWeekRef(getTodayKey());
  };

  // Compute daily totals for the week
  const dayStats = weekDays.map((day) => {
    const dayOfWeek = day.date.getDay();
    let scheduled = 0;
    let completed = 0;

    activeHabits.forEach((habit) => {
      if (habit.frequencyDays.includes(dayOfWeek)) {
        scheduled++;
        const entry = entries[`${habit.id}_${day.key}`];
        if (entry && entry.status === 'completed') {
          completed++;
        }
      }
    });

    const percent = scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0;
    return {
      ...day,
      scheduled,
      completed,
      percent,
    };
  });

  // Total weekly summary
  const totalWeeklyScheduled = dayStats.reduce((acc, d) => acc + d.scheduled, 0);
  const totalWeeklyCompleted = dayStats.reduce((acc, d) => acc + d.completed, 0);
  const weeklyRate = totalWeeklyScheduled > 0 ? Math.round((totalWeeklyCompleted / totalWeeklyScheduled) * 100) : 0;
  const perfectDaysCount = dayStats.filter((d) => d.scheduled > 0 && d.completed === d.scheduled).length;

  const firstDayStr = weekDays[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const lastDayStr = weekDays[6].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation & Weekly Metric Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-lg p-0.5">
            <button
              onClick={handlePrevWeek}
              aria-label="Previous week"
              className="w-8 h-8 rounded flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextWeek}
              aria-label="Next week"
              className="w-8 h-8 rounded flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-neutral-100">
                Weekly Adherence Matrix
              </h2>
              <button
                onClick={handleCurrentWeek}
                className="text-xs text-emerald-400 hover:underline"
              >
                This Week
              </button>
            </div>
            <p className="text-xs text-neutral-400 flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-neutral-500" />
              <span>{firstDayStr} – {lastDayStr}</span>
            </p>
          </div>
        </div>

        {/* Weekly Stats Badges */}
        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center gap-2">
            <span className="text-neutral-400">Weekly Adherence:</span>
            <span className="font-mono font-bold text-emerald-400 tabular-nums">{weeklyRate}%</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center gap-2">
            <span className="text-neutral-400">Perfect Days:</span>
            <span className="font-mono font-bold text-neutral-200 tabular-nums">{perfectDaysCount}/7</span>
          </div>
        </div>
      </div>

      {/* 7-Day Matrix Table */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900/90 text-xs text-neutral-400">
                <th className="py-3 px-4 font-semibold text-neutral-300 w-64">Habit</th>
                {dayStats.map((day) => (
                  <th key={day.key} className="py-3 px-2 text-center">
                    <div className="space-y-1">
                      <div className={`font-medium ${day.isToday ? 'text-emerald-400 font-bold' : 'text-neutral-300'}`}>
                        {day.dayName}
                      </div>
                      <div className={`text-[11px] font-mono tabular-nums ${day.isToday ? 'text-emerald-400' : 'text-neutral-400'}`}>
                        {day.dayNumber}
                      </div>
                      {/* Day completion micro bar */}
                      <div className="w-10 h-1 bg-neutral-800 rounded-full mx-auto overflow-hidden">
                        <div
                          className={`h-full ${day.percent === 100 ? 'bg-emerald-400' : 'bg-emerald-500/70'}`}
                          style={{ width: `${day.percent}%` }}
                        />
                      </div>
                    </div>
                  </th>
                ))}
                <th className="py-3 px-4 text-right font-semibold text-neutral-300 w-28">Progress</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-800/60 text-xs">
              {activeHabits.length > 0 ? (
                activeHabits.map((habit) => {
                  let habitWeekCompleted = 0;
                  let habitWeekScheduled = 0;

                  return (
                    <tr key={habit.id} className="hover:bg-neutral-850/50 transition-colors">
                      {/* Habit info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-neutral-800 border border-neutral-700/60 flex items-center justify-center text-neutral-300 shrink-0">
                            <HabitIcon name={habit.icon} className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-neutral-200 truncate max-w-[180px]">
                              {habit.title}
                            </p>
                            <p className="text-[11px] text-neutral-400 capitalize">
                              {habit.timeOfDay} {habit.targetTime ? `· ${habit.targetTime}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Day cells */}
                      {weekDays.map((day) => {
                        const dayOfWeek = day.date.getDay();
                        const isScheduled = habit.frequencyDays.includes(dayOfWeek);
                        const entry = entries[`${habit.id}_${day.key}`];

                        if (isScheduled) {
                          habitWeekScheduled++;
                          if (entry && entry.status === 'completed') {
                            habitWeekCompleted++;
                          }
                        }

                        if (!isScheduled) {
                          return (
                            <td key={day.key} className="py-3 px-2 text-center text-neutral-600 font-mono">
                              —
                            </td>
                          );
                        }

                        const isDone = entry?.status === 'completed';
                        const isMissed = entry?.status === 'missed';
                        const isSkipped = entry?.status === 'skipped';

                        return (
                          <td key={day.key} className="py-3 px-2 text-center">
                            <button
                              onClick={() => {
                                if (isDone) {
                                  sound.playUncheck();
                                  onToggleComplete(habit, 0, day.key);
                                } else {
                                  sound.playCheck();
                                  onToggleComplete(habit, habit.targetValue, day.key);
                                }
                              }}
                              title={`${habit.title} on ${day.dayName} (${isDone ? 'Completed' : isMissed ? 'Missed' : isSkipped ? 'Skipped' : 'Pending'}. Click to toggle)`}
                              className={`w-8 h-8 rounded-lg mx-auto flex items-center justify-center transition-all ${
                                isDone
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                                  : isMissed
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
                                  : isSkipped
                                  ? 'bg-neutral-800 text-sky-400 border border-neutral-700'
                                  : 'bg-neutral-800/40 text-neutral-500 border border-neutral-800 hover:border-neutral-600 hover:bg-neutral-800'
                              }`}
                            >
                              {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                              {isMissed && <X className="w-3.5 h-3.5 stroke-[2.5]" />}
                              {isSkipped && <PauseCircle className="w-3.5 h-3.5" />}
                              {!isDone && !isMissed && !isSkipped && (
                                <div className="w-2 h-2 rounded-full bg-neutral-600" />
                              )}
                            </button>
                          </td>
                        );
                      })}

                      {/* Weekly Rate */}
                      <td className="py-3 px-4 text-right">
                        <div className="font-mono font-medium tabular-nums text-neutral-300">
                          {habitWeekCompleted}/{habitWeekScheduled}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono tabular-nums">
                          {habitWeekScheduled > 0 ? Math.round((habitWeekCompleted / habitWeekScheduled) * 100) : 0}%
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-neutral-400">
                    <p>No active habits to display.</p>
                    <button
                      onClick={onOpenNewHabit}
                      className="mt-2 text-xs text-emerald-400 hover:underline"
                    >
                      + Create a habit
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend & Instructions */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400 px-1">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/40 inline-flex items-center justify-center text-emerald-400 text-[10px]">✓</span>
            <span>Done</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-500/20 border border-rose-500/40 inline-flex items-center justify-center text-rose-400 text-[10px]">✕</span>
            <span>Missed</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-neutral-800 border border-neutral-700 inline-flex items-center justify-center text-sky-400 text-[10px]">⏸</span>
            <span>Skipped / Rest Day</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-neutral-800/40 border border-neutral-800 inline-block" />
            <span>Pending</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="font-mono text-neutral-600">—</span>
            <span>Unscheduled</span>
          </span>
        </div>
        <p className="text-neutral-500 italic">Tip: Click any cell to quickly toggle or log status</p>
      </div>
    </div>
  );
}

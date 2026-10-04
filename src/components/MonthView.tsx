import React, { useState } from 'react';
import { Habit, HabitEntry, Goal } from '../types/habit';
import { getMonthDays, parseDateKey, formatDateKey, getPastNDays, getTodayKey } from '../utils/date';
import { HabitIcon } from './HabitIcon';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, AlertCircle, Target } from 'lucide-react';

interface MonthViewProps {
  habits: Habit[];
  goals?: Goal[];
  entries: Record<string, HabitEntry>;
  onSelectDate: (dateKey: string) => void;
  onOpenNewHabit: () => void;
}

export function MonthView({
  habits,
  goals = [],
  entries,
  onSelectDate,
  onOpenNewHabit,
}: MonthViewProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDayKey, setSelectedDayKey] = useState<string>(getTodayKey());
  const [selectedTargetId, setSelectedTargetId] = useState<string>('all');

  const activeHabits = habits.filter((h) => !h.archived);

  // Filter habits by target if selected
  const displayedHabits = activeHabits.filter((h) => {
    if (selectedTargetId === 'all') return true;
    const goal = goals.find((g) => g.id === selectedTargetId);
    return h.goalId === selectedTargetId || goal?.linkedHabitIds?.includes(h.id);
  });

  const calendarDays = getMonthDays(year, month);

  const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const handleCurrentMonth = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  };

  // Compute daily adherence map for current month
  const dayStatsMap = new Map<string, { scheduled: number; completed: number; missed: number; percent: number }>();
  let totalMonthScheduled = 0;
  let totalMonthCompleted = 0;
  let totalPerfectDays = 0;

  calendarDays.forEach((day) => {
    if (!day.isCurrentMonth) return;
    const dayOfWeek = day.date.getDay();
    let scheduled = 0;
    let completed = 0;
    let missed = 0;

    displayedHabits.forEach((habit) => {
      if (habit.frequencyDays.includes(dayOfWeek)) {
        scheduled++;
        const entry = entries[`${habit.id}_${day.key}`];
        if (entry && entry.status === 'completed') {
          completed++;
        } else if (entry && entry.status === 'missed') {
          missed++;
        }
      }
    });

    const percent = scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0;
    dayStatsMap.set(day.key, { scheduled, completed, missed, percent });

    totalMonthScheduled += scheduled;
    totalMonthCompleted += completed;
    if (scheduled > 0 && completed === scheduled) {
      totalPerfectDays++;
    }
  });

  const monthAdherence = totalMonthScheduled > 0 ? Math.round((totalMonthCompleted / totalMonthScheduled) * 100) : 0;

  // Selected Day Detailed Breakdown
  const selectedDateObj = parseDateKey(selectedDayKey);
  const selectedDayOfWeek = selectedDateObj.getDay();
  const selectedDayHabits = displayedHabits.filter((h) => h.frequencyDays.includes(selectedDayOfWeek));

  // Trailing 12-week GitHub style activity heatmap
  const trailing84Keys = getPastNDays(84); // 12 weeks
  const todayKey = getTodayKey();

  const getHeatmapColor = (percent: number, hasScheduled: boolean) => {
    if (!hasScheduled) return 'bg-neutral-900 border-neutral-800/60';
    if (percent === 0) return 'bg-neutral-850 border-neutral-800';
    if (percent < 40) return 'bg-emerald-950/60 border-emerald-900/40 text-emerald-300';
    if (percent < 75) return 'bg-emerald-800/60 border-emerald-700/50 text-emerald-200';
    if (percent < 100) return 'bg-emerald-600/80 border-emerald-500/60 text-emerald-100';
    return 'bg-emerald-400 border-emerald-300 text-neutral-950 font-bold';
  };

  return (
    <div className="space-y-8">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-lg p-0.5">
            <button
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="w-8 h-8 rounded flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              aria-label="Next month"
              className="w-8 h-8 rounded flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-neutral-100">
                {monthName}
              </h2>
              <button
                onClick={handleCurrentMonth}
                className="text-xs text-emerald-400 hover:underline"
              >
                Current Month
              </button>
            </div>
            <p className="text-xs text-neutral-400 flex items-center gap-1.5">
              <CalendarIcon className="w-3 h-3 text-neutral-500" />
              <span>Full Monthly Consistency Overview</span>
            </p>
          </div>
        </div>

        {/* Monthly Summary Badges */}
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <div className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center gap-2">
            <span className="text-neutral-400">Monthly Adherence:</span>
            <span className="font-mono font-bold text-emerald-400 tabular-nums">{monthAdherence}%</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center gap-2">
            <span className="text-neutral-400">Perfect 100% Days:</span>
            <span className="font-mono font-bold text-neutral-200 tabular-nums">{totalPerfectDays}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center gap-2">
            <span className="text-neutral-400">Total Check-ins:</span>
            <span className="font-mono font-bold text-sky-400 tabular-nums">{totalMonthCompleted}</span>
          </div>
        </div>
      </div>

      {/* Target Scope Filter Bar */}
      {goals.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs text-neutral-400 flex items-center gap-1 shrink-0 font-mono">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span>Scope:</span>
          </span>
          <button
            onClick={() => setSelectedTargetId('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedTargetId === 'all'
                ? 'bg-neutral-800 border-emerald-500/60 text-emerald-300 font-bold shadow-sm'
                : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            All Tasks ({activeHabits.length})
          </button>
          {goals.map((g) => {
            const count = activeHabits.filter((h) => h.goalId === g.id || g.linkedHabitIds?.includes(h.id)).length;
            const isSelected = selectedTargetId === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setSelectedTargetId(g.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-neutral-800 border-emerald-500/60 text-emerald-300 font-bold shadow-sm'
                    : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-400' : 'bg-neutral-500'}`} />
                <span>{g.title} ({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Grid: Calendar on Left, Selected Day Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 Cols) */}
        <div className="lg:col-span-2 rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-medium">
            <span>Day-by-Day Adherence Intensity</span>
            <div className="flex items-center gap-1.5">
              <span>Less</span>
              <span className="w-3 h-3 rounded bg-neutral-850 border border-neutral-800 inline-block" />
              <span className="w-3 h-3 rounded bg-emerald-950/60 border border-emerald-900/40 inline-block" />
              <span className="w-3 h-3 rounded bg-emerald-800/60 border border-emerald-700/50 inline-block" />
              <span className="w-3 h-3 rounded bg-emerald-600/80 border border-emerald-500/60 inline-block" />
              <span className="w-3 h-3 rounded bg-emerald-400 border border-emerald-300 inline-block" />
              <span>More</span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-neutral-400 py-1">
                {d}
              </div>
            ))}

            {calendarDays.map((day) => {
              const stats = dayStatsMap.get(day.key);
              const percent = stats?.percent ?? 0;
              const hasScheduled = (stats?.scheduled ?? 0) > 0;
              const isSelected = day.key === selectedDayKey;

              return (
                <button
                  key={day.key}
                  onClick={() => setSelectedDayKey(day.key)}
                  className={`min-h-[64px] sm:min-h-[72px] p-2 rounded-xl border flex flex-col justify-between text-left transition-all ${
                    isSelected
                      ? 'ring-2 ring-emerald-400 border-emerald-400'
                      : 'hover:border-neutral-600'
                  } ${
                    !day.isCurrentMonth
                      ? 'opacity-25 bg-neutral-950/40 border-neutral-900'
                      : getHeatmapColor(percent, hasScheduled)
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-mono font-medium tabular-nums ${
                        day.isToday ? 'text-emerald-300 underline font-bold' : ''
                      }`}
                    >
                      {day.dayNumber}
                    </span>
                    {hasScheduled && (
                      <span className="text-[10px] font-mono tabular-nums opacity-80">
                        {stats?.completed}/{stats?.scheduled}
                      </span>
                    )}
                  </div>

                  {hasScheduled ? (
                    <div className="text-[11px] font-mono font-bold tabular-nums">
                      {percent}%
                    </div>
                  ) : (
                    <div className="text-[10px] text-neutral-500 font-mono">—</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Inspector (1 Col) */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-200">
                  {selectedDateObj.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </h3>
                <p className="text-xs text-neutral-400">Day Details & Audit</p>
              </div>
              <button
                onClick={() => onSelectDate(selectedDayKey)}
                className="text-xs text-emerald-400 hover:underline"
              >
                Go to Today View
              </button>
            </div>

            {/* Habit Status on this day */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {selectedDayHabits.length > 0 ? (
                selectedDayHabits.map((habit) => {
                  const entry = entries[`${habit.id}_${selectedDayKey}`];
                  const isDone = entry?.status === 'completed';
                  const isMissed = entry?.status === 'missed';
                  const isSkipped = entry?.status === 'skipped';

                  return (
                    <div
                      key={habit.id}
                      className="p-2.5 rounded-lg border border-neutral-800/80 bg-neutral-950/60 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded bg-neutral-850 flex items-center justify-center text-neutral-300 shrink-0">
                          <HabitIcon name={habit.icon} className="w-3 h-3" />
                        </div>
                        <div className="truncate font-medium text-neutral-200">
                          {habit.title}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5 font-medium">
                        {isDone && (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Done</span>
                          </span>
                        )}
                        {isMissed && (
                          <span className="text-rose-400 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Missed</span>
                          </span>
                        )}
                        {isSkipped && (
                          <span className="text-sky-400">Skipped</span>
                        )}
                        {!isDone && !isMissed && !isSkipped && (
                          <span className="text-neutral-500">Pending</span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-neutral-500">
                  No habits scheduled on this day of week.
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-800 text-xs text-neutral-400 space-y-1">
            <p className="flex justify-between">
              <span>Day Adherence:</span>
              <span className="font-mono font-bold text-neutral-200">
                {dayStatsMap.get(selectedDayKey)?.percent ?? 0}%
              </span>
            </p>
            <p className="flex justify-between">
              <span>Completed:</span>
              <span className="font-mono text-neutral-200">
                {dayStatsMap.get(selectedDayKey)?.completed ?? 0} of {dayStatsMap.get(selectedDayKey)?.scheduled ?? 0}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* GitHub-style Long-Term Consistency Heatmap (Trailing 12 Weeks) */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-200">
              Long-Term Momentum Matrix (Past 12 Weeks)
            </h3>
            <p className="text-xs text-neutral-400">
              Visualizing daily consistency streaks and compounding habit volume.
            </p>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-1.5 min-w-[720px]">
            {Array.from({ length: 12 }).map((_, weekIdx) => {
              const weekSlice = trailing84Keys.slice(weekIdx * 7, weekIdx * 7 + 7);
              return (
                <div key={weekIdx} className="flex flex-col gap-1.5">
                  {weekSlice.map((dateKey) => {
                    const d = parseDateKey(dateKey);
                    const dayOfWeek = d.getDay();
                    let sched = 0;
                    let comp = 0;
                    activeHabits.forEach((h) => {
                      if (h.frequencyDays.includes(dayOfWeek)) {
                        sched++;
                        const entry = entries[`${h.id}_${dateKey}`];
                        if (entry && entry.status === 'completed') comp++;
                      }
                    });
                    const pct = sched > 0 ? Math.round((comp / sched) * 100) : 0;
                    const isToday = dateKey === todayKey;

                    return (
                      <button
                        key={dateKey}
                        onClick={() => setSelectedDayKey(dateKey)}
                        title={`${dateKey}: ${comp}/${sched} completed (${pct}%)`}
                        className={`w-4 h-4 rounded-sm border transition-transform hover:scale-125 ${
                          isToday ? 'ring-1 ring-emerald-400' : ''
                        } ${getHeatmapColor(pct, sched > 0)}`}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

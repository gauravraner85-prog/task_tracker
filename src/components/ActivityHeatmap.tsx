import React, { useState } from 'react';
import { Habit, HabitEntry } from '../types/habit';
import { getPastNDays, parseDateKey, getTodayKey } from '../utils/date';
import { HabitIcon } from './HabitIcon';
import { Check, Flame, Calendar, Award } from 'lucide-react';
import { sound } from '../utils/audio';

interface ActivityHeatmapProps {
  habits: Habit[];
  entries: Record<string, HabitEntry>;
  onToggleComplete?: (habit: Habit, value?: number, dateKey?: string) => void;
}

export function ActivityHeatmap({ habits, entries, onToggleComplete }: ActivityHeatmapProps) {
  const [activeTab, setActiveTab] = useState<'heatmap' | 'week_matrix'>('heatmap');
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number; total: number } | null>(null);

  const activeHabits = habits.filter((h) => !h.archived);
  const todayKey = getTodayKey();

  // 16-week GitLab / LeetCode style grid (112 days = 16 weeks * 7 days)
  const trailing112Days = getPastNDays(112);

  // Group into columns of 7 days (weeks)
  const weeks: string[][] = [];
  for (let i = 0; i < 16; i++) {
    weeks.push(trailing112Days.slice(i * 7, i * 7 + 7));
  }

  // Calculate day completion count map
  const dayActivityMap: Record<string, { completed: number; scheduled: number }> = {};
  trailing112Days.forEach((dateKey) => {
    const d = parseDateKey(dateKey);
    const dayOfWeek = d.getDay();
    let scheduled = 0;
    let completed = 0;

    activeHabits.forEach((h) => {
      if (h.frequencyDays.includes(dayOfWeek)) {
        scheduled++;
        const entry = entries[`${h.id}_${dateKey}`];
        if (entry && entry.status === 'completed') {
          completed++;
        }
      }
    });

    dayActivityMap[dateKey] = { completed, scheduled };
  });

  // Green square intensity (GitLab / LeetCode palette)
  const getShade = (completed: number, scheduled: number) => {
    if (completed === 0) return 'bg-neutral-900 border-neutral-800/80';
    const ratio = scheduled > 0 ? completed / scheduled : 1;
    if (ratio < 0.35) return 'bg-emerald-950 border-emerald-900/60 text-emerald-400';
    if (ratio < 0.7) return 'bg-emerald-800/80 border-emerald-700/60 text-emerald-300';
    if (ratio < 1) return 'bg-emerald-600 border-emerald-500/80 text-emerald-200';
    return 'bg-emerald-400 border-emerald-300 text-neutral-950 font-bold'; // 100% perfect day
  };

  // Trailing 7 days for the weekly matrix
  const past7Days = getPastNDays(7);
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Total completions in heatmap window
  const totalCompletedInWindow = Object.values(dayActivityMap).reduce((acc, d) => acc + d.completed, 0);

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 md:p-5 space-y-4 shadow-sm">
      {/* Switcher & Stats Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-0.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs">
            <button
              onClick={() => setActiveTab('heatmap')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                activeTab === 'heatmap'
                  ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Activity Grid (LeetCode / GitLab)
            </button>
            <button
              onClick={() => setActiveTab('week_matrix')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                activeTab === 'week_matrix'
                  ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              7-Day Task Matrix
            </button>
          </div>
        </div>

        {/* Quick summary stats */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-neutral-400">
            Total Check-ins:{' '}
            <strong className="text-emerald-400 font-bold">{totalCompletedInWindow}</strong>
          </span>
          <span className="text-neutral-600">·</span>
          <span className="text-neutral-400 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
            <strong className="text-amber-400">Active Momentum</strong>
          </span>
        </div>
      </div>

      {/* VIEW 1: Authentically Styled GitLab / LeetCode Activity Contribution Grid */}
      {activeTab === 'heatmap' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-medium text-neutral-300">
              16-Week Consistency Matrix
            </span>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span>Less</span>
              <span className="w-3 h-3 rounded-sm bg-neutral-900 border border-neutral-800 inline-block" />
              <span className="w-3 h-3 rounded-sm bg-emerald-950 border border-emerald-900 inline-block" />
              <span className="w-3 h-3 rounded-sm bg-emerald-800/80 border border-emerald-700 inline-block" />
              <span className="w-3 h-3 rounded-sm bg-emerald-600 border border-emerald-500 inline-block" />
              <span className="w-3 h-3 rounded-sm bg-emerald-400 border border-emerald-300 inline-block" />
              <span>More</span>
            </div>
          </div>

          {/* Grid Container */}
          <div className="overflow-x-auto pb-2">
            <div className="flex items-start gap-2 min-w-[680px]">
              {/* Day Labels on left */}
              <div className="flex flex-col gap-1 text-[10px] text-neutral-500 font-mono pt-0.5 shrink-0 select-none">
                <span className="h-3.5 flex items-center">Mon</span>
                <span className="h-3.5 flex items-center">Tue</span>
                <span className="h-3.5 flex items-center">Wed</span>
                <span className="h-3.5 flex items-center">Thu</span>
                <span className="h-3.5 flex items-center">Fri</span>
                <span className="h-3.5 flex items-center">Sat</span>
                <span className="h-3.5 flex items-center">Sun</span>
              </div>

              {/* 16 Columns (Weeks) */}
              <div className="flex gap-1">
                {weeks.map((weekSlice, wIdx) => (
                  <div key={wIdx} className="flex flex-col gap-1">
                    {weekSlice.map((dateKey) => {
                      const data = dayActivityMap[dateKey] || { completed: 0, scheduled: 0 };
                      const isToday = dateKey === todayKey;

                      return (
                        <div
                          key={dateKey}
                          onMouseEnter={() =>
                            setHoveredDay({
                              date: dateKey,
                              count: data.completed,
                              total: data.scheduled,
                            })
                          }
                          onMouseLeave={() => setHoveredDay(null)}
                          className={`w-3.5 h-3.5 rounded-sm border cursor-pointer transition-transform hover:scale-125 ${
                            isToday ? 'ring-1 ring-white' : ''
                          } ${getShade(data.completed, data.scheduled)}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tooltip / Inspection text */}
          <div className="text-xs text-neutral-400 font-mono h-5 flex items-center">
            {hoveredDay ? (
              <span className="text-neutral-200">
                <strong className="text-emerald-400">{hoveredDay.count}</strong> of {hoveredDay.total} tasks completed on{' '}
                <span className="text-neutral-300 font-semibold">{hoveredDay.date}</span>
              </span>
            ) : (
              <span className="text-neutral-500">
                Hover over any square to view daily task submissions
              </span>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: 7-Day Weekly Task Matrix with Check Ticks */}
      {activeTab === 'week_matrix' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[500px]">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400">
                <th className="py-2.5 px-3 font-semibold text-neutral-300">Task</th>
                {past7Days.map((dKey) => {
                  const d = parseDateKey(dKey);
                  const isCurrent = dKey === todayKey;
                  return (
                    <th key={dKey} className="py-2.5 px-2 text-center">
                      <span className={`block font-medium ${isCurrent ? 'text-emerald-400 font-bold' : ''}`}>
                        {daysOfWeek[d.getDay()]}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500 tabular-nums">
                        {d.getDate()}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {activeHabits.map((habit) => (
                <tr key={habit.id} className="hover:bg-neutral-850/40 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-neutral-200 flex items-center gap-2 truncate max-w-[200px]">
                    <div className="w-6 h-6 rounded bg-neutral-800 flex items-center justify-center shrink-0 text-neutral-300">
                      <HabitIcon name={habit.icon} className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">{habit.title}</span>
                  </td>

                  {past7Days.map((dKey) => {
                    const d = parseDateKey(dKey);
                    const isScheduled = habit.frequencyDays.includes(d.getDay());
                    const entry = entries[`${habit.id}_${dKey}`];
                    const isDone = entry?.status === 'completed';

                    if (!isScheduled) {
                      return (
                        <td key={dKey} className="py-2.5 px-2 text-center text-neutral-600 font-mono">
                          —
                        </td>
                      );
                    }

                    return (
                      <td key={dKey} className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (onToggleComplete) {
                              if (isDone) {
                                sound.playUncheck();
                                onToggleComplete(habit, 0, dKey);
                              } else {
                                sound.playCheck();
                                onToggleComplete(habit, habit.targetValue, dKey);
                              }
                            }
                          }}
                          className={`w-6 h-6 rounded-md mx-auto flex items-center justify-center transition-all ${
                            isDone
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                              : 'bg-neutral-850 text-neutral-600 border border-neutral-800 hover:border-neutral-600'
                          }`}
                        >
                          {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Goal, Habit, HabitEntry } from '../types/habit';
import { parseDateKey, formatDateKey, getTodayKey } from '../utils/date';
import { isHabitScheduledOnDate } from '../utils/habitSchedule';
import { TrendingUp, Award, Flame, Calendar, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';

interface TargetDayProgressGraphProps {
  goal: Goal;
  habits: Habit[];
  entries: Record<string, HabitEntry>;
  currentDayIndex: number;
  totalDays: number;
  inspectedDay: number;
  onSelectDay: (dayNumber: number) => void;
}

interface DayMetric {
  dayNumber: number;
  dateKey: string;
  dateLabel: string;
  isPassed: boolean;
  isCurrent: boolean;
  isUpcoming: boolean;
  scheduledCount: number;
  completedCount: number;
  completionRate: number; // 0 - 100
  cumulativeCompleted: number;
  expectedCumulative: number;
  improvedOverPrev: boolean;
  isConsistent: boolean;
  deltaCompleted: number;
  deltaRate: number;
  prevDayCompleted: number;
  prevDayRate: number;
}

export function TargetDayProgressGraph({
  goal,
  habits,
  entries,
  currentDayIndex,
  totalDays,
  inspectedDay,
  onSelectDay,
}: TargetDayProgressGraphProps) {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  const startDateObj = parseDateKey(goal.startDate);
  const linkedHabits = habits.filter(
    (h) => !h.archived && (h.goalId === goal.id || goal.linkedHabitIds?.includes(h.id))
  );

  // Compute daily metrics across all days of the target
  const dayMetrics: DayMetric[] = [];
  let runningCumulative = 0;
  let prevDayCompleted = 0;
  let prevDayRate = 0;

  for (let d = 1; d <= totalDays; d++) {
    const dayDate = new Date(startDateObj);
    dayDate.setDate(startDateObj.getDate() + (d - 1));
    const dateKey = formatDateKey(dayDate);
    const dayOfWeek = dayDate.getDay();

    const isPassed = d < currentDayIndex;
    const isCurrent = d === currentDayIndex;
    const isUpcoming = d > currentDayIndex;

    const scheduled = linkedHabits.filter((h) =>
      isHabitScheduledOnDate(h, dateKey, dayOfWeek)
    ).length;

    let completed = 0;
    linkedHabits.forEach((h) => {
      const e = entries[`${h.id}_${dateKey}`];
      if (e && e.status === 'completed') {
        completed++;
      }
    });

    if (isPassed || isCurrent) {
      runningCumulative += completed;
    }

    const completionRate = scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0;
    const expectedCumulative = Math.round((d / totalDays) * goal.targetMetricCount);

    const delta = completed - prevDayCompleted;
    const deltaRate = completionRate - prevDayRate;
    const improved =
      (isPassed || isCurrent) &&
      d > 1 &&
      (delta > 0 || (deltaRate > 0 && completed > 0));
    const isConsistent =
      (isPassed || isCurrent) &&
      d > 1 &&
      !improved &&
      completionRate >= 100 &&
      prevDayRate >= 100;

    dayMetrics.push({
      dayNumber: d,
      dateKey,
      dateLabel: dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      isPassed,
      isCurrent,
      isUpcoming,
      scheduledCount: scheduled,
      completedCount: completed,
      completionRate,
      cumulativeCompleted: runningCumulative,
      expectedCumulative,
      improvedOverPrev: improved,
      isConsistent,
      deltaCompleted: delta,
      deltaRate,
      prevDayCompleted,
      prevDayRate,
    });

    if (isPassed || isCurrent) {
      prevDayCompleted = completed;
      prevDayRate = completionRate;
    }
  }

  // Active highlighted day for the tooltip / details banner
  const activeDayNumber = hoveredDay ?? inspectedDay;
  const activeDay = dayMetrics[activeDayNumber - 1] || dayMetrics[0];

  // Global summary statistics for the target
  const maxDayCompleted = Math.max(1, ...dayMetrics.map((m) => m.completedCount));
  const activeDaysCount = Math.min(currentDayIndex, totalDays);
  const totalCompletedSoFar = dayMetrics[activeDaysCount - 1]?.cumulativeCompleted || 0;
  const improvedDaysCount = dayMetrics.filter((m) => m.improvedOverPrev).length;

  // SVG Coordinates calculation for cumulative progress curve
  const chartWidth = 560;
  const chartHeight = 110;
  const paddingX = 14;
  const paddingY = 16;
  const usableWidth = chartWidth - paddingX * 2;
  const usableHeight = chartHeight - paddingY * 2;

  const points = dayMetrics.map((m, idx) => {
    const x = paddingX + (idx / Math.max(1, totalDays - 1)) * usableWidth;
    const maxVal = Math.max(goal.targetMetricCount, totalCompletedSoFar, 1);
    const y = chartHeight - paddingY - (m.cumulativeCompleted / maxVal) * usableHeight;
    return { x, y, m };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  // Fill area under path
  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`
    : '';

  // Pace line path
  const pacePoints = dayMetrics.map((m, idx) => {
    const x = paddingX + (idx / Math.max(1, totalDays - 1)) * usableWidth;
    const maxVal = Math.max(goal.targetMetricCount, totalCompletedSoFar, 1);
    const y = chartHeight - paddingY - (m.expectedCumulative / maxVal) * usableHeight;
    return { x, y };
  });
  const paceD = pacePoints.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 space-y-4 shadow-sm select-none">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-800/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-neutral-100 flex items-center gap-1.5">
              <span>Day-by-Day Target Progress & Improvement</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {totalDays} Days
              </span>
            </h4>
            <p className="text-[11px] text-neutral-400">
              Track daily execution, milestone velocity, and day-over-day improvement
            </p>
          </div>
        </div>

        {/* Highlight badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {improvedDaysCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold font-mono">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>{improvedDaysCount} days improved</span>
            </span>
          )}
          <span className="text-[11px] font-mono text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
            Day {currentDayIndex} of {totalDays}
          </span>
        </div>
      </div>

      {/* Cumulative Trajectory SVG Curve */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-1 rounded-full bg-emerald-400 inline-block" />
              <span className="text-neutral-300 font-semibold">Actual Velocity</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 border-t border-dashed border-neutral-500 inline-block" />
              <span className="text-neutral-500">Target Pace</span>
            </span>
          </div>
          <span className="font-bold text-emerald-400">
            {totalCompletedSoFar} / {goal.targetMetricCount} {goal.metricUnit}
          </span>
        </div>

        <div className="w-full bg-neutral-950 rounded-xl p-2 border border-neutral-800/80 relative overflow-hidden">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-24 sm:h-28 overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Target Baseline Guide (Pace Line) */}
            <path
              d={paceD}
              fill="none"
              stroke="#525252"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />

            {/* Actual Filled Area */}
            <path
              d={areaD}
              fill="url(#curveGradient)"
            />

            {/* Actual Line Curve */}
            <path
              d={pathD}
              fill="none"
              stroke="#34d399"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Current day indicator pin */}
            {points[currentDayIndex - 1] && (
              <g>
                <line
                  x1={points[currentDayIndex - 1].x}
                  y1={paddingY}
                  x2={points[currentDayIndex - 1].x}
                  y2={chartHeight - paddingY}
                  stroke="#34d399"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <circle
                  cx={points[currentDayIndex - 1].x}
                  cy={points[currentDayIndex - 1].y}
                  r="5"
                  fill="#10b981"
                  stroke="#042f2e"
                  strokeWidth="2"
                  className="animate-pulse"
                />
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Day-by-Day Velocity & Improvement Bars */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-neutral-300">Daily Execution Bars (Day 1 → Day {totalDays})</span>
          <span className="text-[10px] text-neutral-500 font-mono">
            Hover or click any day to inspect
          </span>
        </div>

        {/* Scrollable grid of day bars */}
        <div className="overflow-x-auto pb-2 scrollbar-thin">
          <div
            className="flex items-end gap-1 sm:gap-1.5 pt-3 px-1 min-w-max"
            style={{ minWidth: `${Math.min(totalDays * 18, 700)}px` }}
          >
            {dayMetrics.map((m) => {
              const isSelected = m.dayNumber === activeDayNumber;
              const heightPercent = m.completedCount > 0
                ? Math.max(20, Math.round((m.completedCount / maxDayCompleted) * 100))
                : 12;

              let barBg = 'bg-neutral-800';
              let borderStyle = 'border-neutral-700/80';

              if (m.isCurrent) {
                barBg = m.completedCount > 0 ? 'bg-emerald-400' : 'bg-emerald-500/30';
                borderStyle = 'border-emerald-400 ring-2 ring-emerald-400/40';
              } else if (m.isPassed) {
                if (m.completionRate === 100) {
                  barBg = 'bg-emerald-500';
                  borderStyle = 'border-emerald-400';
                } else if (m.completedCount > 0) {
                  barBg = 'bg-emerald-600/70';
                  borderStyle = 'border-emerald-500/50';
                } else {
                  barBg = 'bg-neutral-850';
                  borderStyle = 'border-neutral-800';
                }
              } else {
                // Upcoming
                barBg = 'bg-neutral-900/60';
                borderStyle = 'border-dashed border-neutral-800';
              }

              return (
                <button
                  key={m.dayNumber}
                  type="button"
                  onClick={() => onSelectDay(m.dayNumber)}
                  onMouseEnter={() => setHoveredDay(m.dayNumber)}
                  onMouseLeave={() => setHoveredDay(null)}
                  title={`Day ${m.dayNumber} (${m.dateLabel}): ${m.completedCount}/${m.scheduledCount} done${m.improvedOverPrev ? ' • Improved!' : ''}`}
                  className={`group relative flex flex-col items-center justify-end transition-all focus:outline-none ${
                    isSelected ? 'scale-110 z-10' : 'hover:scale-105'
                  }`}
                  style={{ width: `${Math.max(14, Math.floor(540 / totalDays))}px` }}
                >
                  {/* Improvement Upward Indicator */}
                  {m.improvedOverPrev && (
                    <span className="absolute -top-3.5 text-[9px] text-emerald-400 font-bold leading-none animate-bounce">
                      ▲
                    </span>
                  )}
                  {m.isConsistent && (
                    <span className="absolute -top-3.5 text-[8px] text-sky-400 font-bold leading-none">
                      ★
                    </span>
                  )}

                  {/* Vertical Bar */}
                  <div
                    className={`w-full rounded-t-md border transition-all ${barBg} ${borderStyle} ${
                      isSelected ? 'ring-2 ring-emerald-300' : ''
                    }`}
                    style={{ height: `${heightPercent}px`, maxHeight: '64px' }}
                  />

                  {/* Day Number Label */}
                  <span
                    className={`text-[9px] font-mono mt-1 font-semibold block transition-colors ${
                      isSelected
                        ? 'text-emerald-300 font-bold'
                        : m.isCurrent
                        ? 'text-emerald-400 font-bold'
                        : 'text-neutral-500 group-hover:text-neutral-300'
                    }`}
                  >
                    {m.dayNumber}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Day Detail Banner / Improvement Breakdown */}
      {activeDay && (
        <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-mono font-bold text-emerald-400 shrink-0">
              D{activeDay.dayNumber}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-100">
                  Day {activeDay.dayNumber} ({activeDay.dateLabel})
                </span>
                {activeDay.isCurrent && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    Today
                  </span>
                )}
                {activeDay.improvedOverPrev && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 font-bold flex items-center gap-0.5">
                    <TrendingUp className="w-2.5 h-2.5" />
                    <span>Improved vs D{activeDay.dayNumber - 1}!</span>
                  </span>
                )}
                {activeDay.isConsistent && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-sky-400/20 text-sky-300 border border-sky-400/40 font-bold flex items-center gap-0.5">
                    <span>★ 100% Maintained</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                {activeDay.isUpcoming ? (
                  <span>Upcoming timeline day</span>
                ) : (
                  <span>
                    <strong className="text-neutral-200">{activeDay.completedCount} / {activeDay.scheduledCount}</strong> tasks completed ({activeDay.completionRate}%)
                    {activeDay.improvedOverPrev && (
                      <span className="text-emerald-400 font-mono font-semibold ml-1.5">
                        · ▲ Improved from Day {activeDay.dayNumber - 1} ({activeDay.prevDayRate}% → {activeDay.completionRate}%)
                      </span>
                    )}
                    {activeDay.isConsistent && (
                      <span className="text-sky-400 font-mono font-semibold ml-1.5">
                        · Strong consistency!
                      </span>
                    )}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onSelectDay(activeDay.dayNumber)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded-lg text-xs font-semibold transition-colors border border-neutral-700"
            >
              <span>View Day {activeDay.dayNumber} Tasks</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

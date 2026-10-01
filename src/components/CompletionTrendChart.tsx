import React, { useState } from 'react';
import { Habit, HabitEntry } from '../types/habit';
import { getPastNDays, parseDateKey, formatDateKey } from '../utils/date';
import { TrendingUp, TrendingDown, Minus, Calendar, Info } from 'lucide-react';

interface CompletionTrendChartProps {
  habits: Habit[];
  entries: Record<string, HabitEntry>;
}

interface DayDataPoint {
  index: number;
  currentDateKey: string;
  currentDateLabel: string;
  currentRate: number;
  currentCompleted: number;
  currentTotal: number;
  previousDateKey: string;
  previousDateLabel: string;
  previousRate: number;
  previousCompleted: number;
  previousTotal: number;
}

export function CompletionTrendChart({ habits, entries }: CompletionTrendChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<DayDataPoint | null>(null);

  // 1. Generate 30 days for Current Period and 30 days for Previous Period
  const today = new Date();
  const current30Keys = getPastNDays(30, today);

  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  const previous30Keys = getPastNDays(30, thirtyDaysAgo);

  const calculateDayStats = (dateKey: string) => {
    const date = parseDateKey(dateKey);
    const dayOfWeek = date.getDay();

    const scheduled = habits.filter((h) => {
      if (h.archived) return false;
      if (h.isOneTime) return h.specificDate === dateKey;
      return h.frequencyDays.includes(dayOfWeek);
    });

    let completed = 0;
    scheduled.forEach((h) => {
      const entry = entries[`${h.id}_${dateKey}`];
      if (entry && entry.status === 'completed') {
        completed++;
      }
    });

    const total = scheduled.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, rate };
  };

  const dataPoints: DayDataPoint[] = [];
  let currentSum = 0;
  let currentCountWithTasks = 0;
  let prevSum = 0;
  let prevCountWithTasks = 0;

  for (let i = 0; i < 30; i++) {
    const curKey = current30Keys[i];
    const prevKey = previous30Keys[i];

    const curStats = calculateDayStats(curKey);
    const prevStats = calculateDayStats(prevKey);

    const curDate = parseDateKey(curKey);
    const prevDate = parseDateKey(prevKey);

    if (curStats.total > 0) {
      currentSum += curStats.rate;
      currentCountWithTasks++;
    }
    if (prevStats.total > 0) {
      prevSum += prevStats.rate;
      prevCountWithTasks++;
    }

    dataPoints.push({
      index: i,
      currentDateKey: curKey,
      currentDateLabel: curDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      currentRate: curStats.rate,
      currentCompleted: curStats.completed,
      currentTotal: curStats.total,
      previousDateKey: prevKey,
      previousDateLabel: prevDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      previousRate: prevStats.rate,
      previousCompleted: prevStats.completed,
      previousTotal: prevStats.total,
    });
  }

  const currentAverage = currentCountWithTasks > 0 ? Math.round(currentSum / currentCountWithTasks) : 0;
  const previousAverage = prevCountWithTasks > 0 ? Math.round(prevSum / prevCountWithTasks) : 0;
  const delta = currentAverage - previousAverage;

  // SVG Chart Layout Math
  const width = 800;
  const height = 240;
  const paddingLeft = 45;
  const paddingRight = 25;
  const paddingTop = 25;
  const paddingBottom = 40;

  const innerWidth = width - paddingLeft - paddingRight;
  const innerHeight = height - paddingTop - paddingBottom;

  const getX = (idx: number) => paddingLeft + (idx / 29) * innerWidth;
  const getY = (val: number) => paddingTop + innerHeight - (Math.max(0, Math.min(100, val)) / 100) * innerHeight;

  // Path string generators
  const currentPoints = dataPoints.map((d, i) => `${getX(i)},${getY(d.currentRate)}`);
  const previousPoints = dataPoints.map((d, i) => `${getX(i)},${getY(d.previousRate)}`);

  const currentLinePath = `M ${currentPoints.join(' L ')}`;
  const previousLinePath = `M ${previousPoints.join(' L ')}`;

  // Area path for gradient under current line
  const areaPath = `M ${getX(0)},${getY(0)} L ${currentPoints.join(' L ')} L ${getX(29)},${getY(0)} Z`;

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
      {/* Top Header & Metric Comparison Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-800/80">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-neutral-100">
              30-Day Habit Completion Rate vs. Previous Period
            </h3>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Continuous daily adherence trend comparing the last 30 days against the preceding 30-day baseline.
          </p>
        </div>

        {/* Comparison Stats Pill */}
        <div className="flex items-center gap-3 shrink-0 text-xs">
          {/* Current Period Average */}
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Last 30d: <strong>{currentAverage}%</strong></span>
          </div>

          {/* Previous Period Average */}
          <div className="px-3 py-1.5 rounded-lg bg-neutral-800/80 border border-neutral-700/60 text-neutral-300 flex items-center gap-2 font-mono">
            <span className="w-2 h-0.5 border-t-2 border-dashed border-slate-400" />
            <span>Prev 30d: <strong>{previousAverage}%</strong></span>
          </div>

          {/* Growth Delta Indicator */}
          <div
            className={`px-3 py-1.5 rounded-lg border font-mono font-bold flex items-center gap-1 ${
              delta > 0
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : delta < 0
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-neutral-800 text-neutral-300 border-neutral-700'
            }`}
          >
            {delta > 0 ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : delta < 0 ? (
              <TrendingDown className="w-3.5 h-3.5" />
            ) : (
              <Minus className="w-3.5 h-3.5" />
            )}
            <span>{delta > 0 ? `+${delta}%` : `${delta}%`}</span>
          </div>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-56 select-none"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            <linearGradient id="currentAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Y-Axis Grid Lines & Labels */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = getY(val);
            return (
              <g key={val}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#262626"
                  strokeDasharray={val === 0 ? undefined : '3 3'}
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#737373"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Area Fill Under Current Line */}
          <path d={areaPath} fill="url(#currentAreaGradient)" />

          {/* Previous Period Line (Dashed Slate) */}
          <path
            d={previousLinePath}
            fill="none"
            stroke="#64748b"
            strokeWidth="2"
            strokeDasharray="4 4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.75"
          />

          {/* Current Period Line (Solid Emerald) */}
          <path
            d={currentLinePath}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hover Crosshair & Highlights */}
          {hoveredPoint && (
            <g>
              <line
                x1={getX(hoveredPoint.index)}
                y1={paddingTop}
                x2={getX(hoveredPoint.index)}
                y2={height - paddingBottom}
                stroke="#525252"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              {/* Previous period point circle */}
              <circle
                cx={getX(hoveredPoint.index)}
                cy={getY(hoveredPoint.previousRate)}
                r="4"
                fill="#64748b"
                stroke="#0a0a0a"
                strokeWidth="1.5"
              />
              {/* Current period point circle */}
              <circle
                cx={getX(hoveredPoint.index)}
                cy={getY(hoveredPoint.currentRate)}
                r="5"
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </g>
          )}

          {/* Interactive Invisible Hover Columns for each of the 30 days */}
          {dataPoints.map((point) => {
            const x = getX(point.index);
            const colWidth = innerWidth / 29;
            return (
              <rect
                key={point.index}
                x={x - colWidth / 2}
                y={paddingTop}
                width={colWidth}
                height={innerHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(point)}
              />
            );
          })}

          {/* X-Axis Date Labels at regular intervals */}
          {[0, 6, 12, 18, 24, 29].map((idx) => {
            const point = dataPoints[idx];
            if (!point) return null;
            return (
              <text
                key={idx}
                x={getX(idx)}
                y={height - 14}
                textAnchor={idx === 0 ? 'start' : idx === 29 ? 'end' : 'middle'}
                fill="#737373"
                fontSize="10"
                fontFamily="monospace"
              >
                {point.currentDateLabel}
              </text>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay Card */}
        {hoveredPoint && (
          <div
            className="absolute top-2 pointer-events-none p-2.5 rounded-xl bg-neutral-950/95 border border-neutral-700/80 shadow-2xl text-xs space-y-1.5 z-20 backdrop-blur-md"
            style={{
              left: `${Math.min(
                75,
                Math.max(12, (hoveredPoint.index / 29) * 100)
              )}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="flex items-center justify-between gap-4 font-bold border-b border-neutral-800 pb-1 text-neutral-200">
              <span>{hoveredPoint.currentDateLabel} (Day {hoveredPoint.index + 1})</span>
              <span className="font-mono text-emerald-400">
                {hoveredPoint.currentRate}%
              </span>
            </div>

            <div className="space-y-1 font-mono text-[11px]">
              <div className="flex items-center justify-between gap-4 text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Current Day:</span>
                </span>
                <span>
                  {hoveredPoint.currentCompleted}/{hoveredPoint.currentTotal} tasks ({hoveredPoint.currentRate}%)
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span>30 Days Prior ({hoveredPoint.previousDateLabel}):</span>
                </span>
                <span>
                  {hoveredPoint.previousCompleted}/{hoveredPoint.previousTotal} tasks ({hoveredPoint.previousRate}%)
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 pt-1 border-t border-neutral-850 text-neutral-300">
                <span>Period Comparison:</span>
                <span
                  className={`font-bold ${
                    hoveredPoint.currentRate >= hoveredPoint.previousRate
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}
                >
                  {hoveredPoint.currentRate >= hoveredPoint.previousRate ? '+' : ''}
                  {hoveredPoint.currentRate - hoveredPoint.previousRate}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart Footer Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1 text-neutral-400 border-t border-neutral-800/60 font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 bg-emerald-400 rounded-full" />
            <span className="text-neutral-300">Last 30 Days Adherence</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-slate-400" />
            <span className="text-neutral-400">Previous Period Baseline (-60d to -30d)</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-neutral-500">
          <Info className="w-3.5 h-3.5" />
          <span>Hover across chart to inspect day-over-day changes</span>
        </div>
      </div>
    </div>
  );
}

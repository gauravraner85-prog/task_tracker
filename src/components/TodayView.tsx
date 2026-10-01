import React, { useState } from 'react';
import { Habit, HabitEntry, DailyReflection, TimeOfDay, Goal, FocusSession } from '../types/habit';
import { HabitCard } from './HabitCard';
import { ActivityHeatmap } from './ActivityHeatmap';
import { DailyReflectionCard } from './DailyReflectionCard';
import { DailyQuotesWidget } from './DailyQuotesWidget';
import { calculateHabitStats } from '../utils/analytics';
import { parseDateKey, getRelativeDateLabel, formatDateKey, getTodayKey } from '../utils/date';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Clock,
  Play,
  Search,
  Flame,
  Zap,
  Sparkles,
  Target,
  BarChart3,
  Calendar,
  ArrowRight,
} from 'lucide-react';

interface TodayViewProps {
  habits: Habit[];
  goals: Goal[];
  entries: Record<string, HabitEntry>;
  focusSessions: FocusSession[];
  reflections: Record<string, DailyReflection>;
  selectedDateKey: string;
  onSelectDateKey: (dateKey: string) => void;
  onToggleComplete: (habit: Habit, value?: number, dateKey?: string) => void;
  onQuickAddTask: (title: string) => void;
  onMarkMissed: (habit: Habit) => void;
  onMarkSkipped: (habit: Habit) => void;
  onOpenTimer: (habit?: Habit) => void;
  onSaveFocusSession: (session: Omit<FocusSession, 'id' | 'completedAt'>) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
  onSaveReflection: (dateKey: string, reflection: Partial<DailyReflection>) => void;
  onOpenNewHabit: () => void;
  onOpenNewGoal: () => void;
  onGoToGoalsTab: () => void;
  onGoToMindsetTab?: () => void;
  onGoToAnalyticsTab?: () => void;
  onGoToWeekTab?: () => void;
}

export function TodayView({
  habits,
  goals,
  entries,
  focusSessions,
  reflections,
  selectedDateKey,
  onSelectDateKey,
  onToggleComplete,
  onMarkMissed,
  onMarkSkipped,
  onOpenTimer,
  onEditHabit,
  onDeleteHabit,
  onSaveReflection,
  onOpenNewHabit,
  onGoToGoalsTab,
  onGoToMindsetTab,
  onGoToAnalyticsTab,
  onGoToWeekTab,
}: TodayViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<'all' | TimeOfDay>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const selectedDate = parseDateKey(selectedDateKey);
  const dayOfWeek = selectedDate.getDay();

  // Filter tasks scheduled for this day
  const scheduledHabits = habits
    .filter((h) => {
      if (h.archived) return false;
      if (h.isOneTime) {
        return h.specificDate === selectedDateKey;
      }
      return h.frequencyDays.includes(dayOfWeek);
    })
    .sort((a, b) => {
      if (a.targetTime && b.targetTime) return a.targetTime.localeCompare(b.targetTime);
      if (a.targetTime) return -1;
      if (b.targetTime) return 1;
      return a.order - b.order;
    });

  // Calculate stats for today
  let completedCount = 0;
  scheduledHabits.forEach((h) => {
    const entry = entries[`${h.id}_${selectedDateKey}`];
    if (entry && entry.status === 'completed') {
      completedCount++;
    }
  });

  const totalCount = scheduledHabits.length;
  const pendingCount = Math.max(0, totalCount - completedCount);
  const percentComplete = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Max streak among habits
  const statsMap = new Map<string, ReturnType<typeof calculateHabitStats>>();
  let maxStreak = 0;
  habits.forEach((h) => {
    const s = calculateHabitStats(h, entries);
    statsMap.set(h.id, s);
    if (s.currentStreak > maxStreak) {
      maxStreak = s.currentStreak;
    }
  });

  // Today's total focus minutes logged
  const todayFocusMinutes = focusSessions
    .filter((s) => s.date === selectedDateKey)
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  // Apply filters & search query
  const visibleHabits = scheduledHabits.filter((h) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = h.title.toLowerCase().includes(q);
      const matchesDesc = h.description ? h.description.toLowerCase().includes(q) : false;
      if (!matchesTitle && !matchesDesc) return false;
    }

    if (timeFilter !== 'all' && h.timeOfDay !== timeFilter) return false;

    const entry = entries[`${h.id}_${selectedDateKey}`];
    const isCompleted = entry && entry.status === 'completed';

    if (statusFilter === 'pending' && isCompleted) return false;
    if (statusFilter === 'completed' && !isCompleted) return false;

    return true;
  });

  // Navigation helpers
  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    onSelectDateKey(formatDateKey(prev));
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    onSelectDateKey(formatDateKey(next));
  };

  const isToday = getRelativeDateLabel(selectedDateKey) === 'Today';

  // Circular progress calculations (Radius 22, Circumference = 138.2)
  const circleCircumference = 138.23;
  const strokeDashoffset = circleCircumference - (percentComplete / 100) * circleCircumference;

  const currentReflection = reflections[selectedDateKey] || {};

  return (
    <div className="space-y-6">
      {/* MAIN SCREEN SPLIT: 70% Tasks (Primary Focus) vs 30% Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ================= LEFT 70% COLUMN: TASKS ================= */}
        <div className="lg:col-span-8 space-y-4">
          {/* WISDOM OF THE DAY (Matched exactly to left big sidebar width) */}
          <DailyQuotesWidget dateKey={selectedDateKey} />

          {/* Search Bar & Instant Filters */}
          <div className="space-y-2">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3.5 text-neutral-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search today's tasks..."
                className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-xs text-neutral-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Segmented Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1 p-0.5 bg-neutral-900 border border-neutral-800 rounded-lg">
                {(['all', 'morning', 'afternoon', 'evening'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeFilter(t)}
                    className={`px-2.5 py-1 rounded-md capitalize transition-colors ${
                      timeFilter === t
                        ? 'bg-neutral-800 text-neutral-100 font-semibold shadow-sm'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 p-0.5 bg-neutral-900 border border-neutral-800 rounded-lg">
                {(['all', 'pending', 'completed'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2.5 py-1 rounded-md capitalize transition-colors ${
                      statusFilter === s
                        ? 'bg-neutral-800 text-neutral-100 font-semibold shadow-sm'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-2">
            {visibleHabits.length > 0 ? (
              visibleHabits.map((habit) => {
                const entry = entries[`${habit.id}_${selectedDateKey}`];
                const stats = statsMap.get(habit.id) || { currentStreak: 0, habitStrength: 50 };
                const linkedGoal = goals.find((g) => g.id === habit.goalId);

                return (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    entry={entry}
                    linkedGoal={linkedGoal}
                    currentStreak={stats.currentStreak}
                    habitStrength={stats.habitStrength}
                    onToggleComplete={onToggleComplete}
                    onMarkMissed={onMarkMissed}
                    onMarkSkipped={onMarkSkipped}
                    onOpenTimer={() => onOpenTimer(habit)}
                    onEditHabit={onEditHabit}
                    onDeleteHabit={onDeleteHabit}
                  />
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-neutral-800 p-8 text-center space-y-2.5 bg-neutral-900/30">
                <CheckCircle2 className="w-8 h-8 text-neutral-600 mx-auto" />
                <h3 className="text-sm font-semibold text-neutral-300">
                  {scheduledHabits.length === 0
                    ? 'No tasks scheduled for today'
                    : 'No tasks match current search or filters'}
                </h3>
                <button
                  onClick={onOpenNewHabit}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-neutral-950 text-xs font-semibold rounded-lg hover:bg-emerald-400 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Task</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT 30% SIDEBAR (Aligned to top & filled) ================= */}
        <div className="lg:col-span-4 space-y-4">
          {/* WIDGET 1: Date Navigator & Round Circular Progress Ring */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-4 space-y-3 shadow-sm">
            {/* Top row: Date navigation + Pending tag */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5 bg-neutral-950 border border-neutral-800 rounded-lg p-0.5 shrink-0">
                  <button
                    onClick={handlePrevDay}
                    aria-label="Previous day"
                    className="w-6 h-6 rounded flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-850 transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleNextDay}
                    aria-label="Next day"
                    className="w-6 h-6 rounded flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-850 transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold tracking-tight text-neutral-100">
                      {getRelativeDateLabel(selectedDateKey)}
                    </span>
                    {!isToday && (
                      <button
                        onClick={() => onSelectDateKey(getTodayKey())}
                        className="text-[11px] text-emerald-400 hover:underline font-medium"
                      >
                        Today
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400 font-mono">
                    {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Pending count badge */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>{pendingCount} Pending</span>
              </div>
            </div>

            {/* Circular Progress Ring & Numbers */}
            <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-[11px] text-neutral-400 font-medium block">Daily Execution</span>
                <div className="text-base font-mono font-bold text-neutral-100 tabular-nums">
                  {completedCount} <span className="text-xs text-neutral-500 font-normal">of</span> {totalCount} <span className="text-xs text-neutral-400 font-normal">Tasks Done</span>
                </div>
                <p className="text-[10px] text-neutral-500 font-mono">
                  {percentComplete === 100 && totalCount > 0
                    ? '🎉 100% completed today!'
                    : `${pendingCount} tasks remaining`}
                </p>
              </div>

              {/* Round Progress Circle */}
              <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 52 52">
                  <circle
                    cx="26"
                    cy="26"
                    r="22"
                    className="text-neutral-800"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="26"
                    cy="26"
                    r="22"
                    className="text-emerald-400 transition-all duration-500 ease-out"
                    strokeWidth="4"
                    strokeDasharray={circleCircumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>
                <span className="absolute text-xs font-mono font-bold text-neutral-100 tabular-nums">
                  {percentComplete}%
                </span>
              </div>
            </div>
          </div>

          {/* WIDGET 2: Focus & Study Timer Launch CTA */}
          <button
            type="button"
            onClick={() => onOpenTimer()}
            className="w-full p-3.5 rounded-xl border border-indigo-500/30 bg-neutral-900/80 hover:bg-neutral-850 hover:border-indigo-500/60 transition-all text-left flex items-center justify-between group shadow-sm"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 group-hover:scale-105 transition-transform">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-neutral-100 group-hover:text-indigo-300 transition-colors block truncate">
                  Launch Study / Focus Timer
                </span>
                <p className="text-[11px] text-neutral-400 font-mono truncate">
                  {Math.floor(todayFocusMinutes / 60)}h {todayFocusMinutes % 60}m logged today · Open full mode →
                </p>
              </div>
            </div>
            <Clock className="w-4 h-4 text-neutral-500 group-hover:text-indigo-400 transition-colors shrink-0 ml-2" />
          </button>

          {/* WIDGET 3: STREAK (PURE COUNT OF DAYS) */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Flame className="w-5 h-5 fill-amber-400/20" />
              </div>
              <div>
                <span className="text-xs font-semibold text-neutral-200 block">Daily Streak</span>
                <span className="text-[11px] text-neutral-500 font-mono">Unbroken consistency</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-mono font-bold text-amber-400 tabular-nums">
                {maxStreak} <span className="text-xs font-normal text-amber-300/80">Days</span>
              </div>
            </div>
          </div>

          {/* WIDGET 4: ENERGY & VITALITY CHECK-IN (Fills empty space) */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-4 space-y-2.5 shadow-sm text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Daily Energy Check-in</span>
              </span>
              <span className="text-[10px] font-mono text-neutral-400 capitalize">
                {currentReflection.mood ? `${currentReflection.mood}` : 'Tap to log'}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'great', icon: '⚡', label: 'High' },
                { id: 'good', icon: '✨', label: 'Good' },
                { id: 'neutral', icon: '🌱', label: 'Steady' },
                { id: 'low', icon: '🌧️', label: 'Low' },
              ].map((m) => {
                const isSelected = currentReflection.mood === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onSaveReflection(selectedDateKey, { mood: m.id as any })}
                    className={`py-2 rounded-lg border flex flex-col items-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold shadow-sm'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                    }`}
                  >
                    <span className="text-base">{m.icon}</span>
                    <span className="text-[10px]">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* WIDGET 5: DAILY MINDSET & PRIORITY INTENTION (Fills empty space) */}
          <div className="rounded-xl border border-neutral-800 bg-gradient-to-b from-neutral-900/80 to-neutral-950 p-4 space-y-3 shadow-sm text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-indigo-400 font-bold uppercase tracking-wider text-[11px]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Daily Mindset & Focus</span>
              </div>
              {onGoToMindsetTab && (
                <button
                  onClick={onGoToMindsetTab}
                  className="text-[10px] text-neutral-400 hover:text-indigo-300 font-mono"
                >
                  Full Hub →
                </button>
              )}
            </div>

            {/* Daily Intention input */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-neutral-400 uppercase font-mono tracking-wider block">
                Today&apos;s #1 Priority Intent
              </label>
              <input
                type="text"
                value={currentReflection.highlight || ''}
                onChange={(e) => onSaveReflection(selectedDateKey, { highlight: e.target.value })}
                placeholder="e.g. Finish core targets without distraction..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Mindset Anchor */}
            <div className="p-2.5 rounded-lg bg-indigo-950/20 border border-indigo-500/20 text-[11px] text-indigo-200/90 leading-relaxed font-sans">
              &ldquo;Mastering others is strength. Mastering yourself is true power.&rdquo;
            </div>
          </div>

          {/* WIDGET 6: WORKSPACE QUICK ACCESS MENU (Fills empty space) */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3.5 space-y-2 text-xs">
            <span className="text-[10px] text-neutral-500 uppercase font-mono tracking-wider block">
              Quick Workspace Hubs
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onGoToGoalsTab}
                className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-emerald-500/50 text-neutral-300 hover:text-emerald-300 transition-all text-left flex items-center justify-between group"
              >
                <div className="flex items-center gap-2 truncate">
                  <Target className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate font-semibold">Targets Hub</span>
                </div>
                <ArrowRight className="w-3 h-3 text-neutral-600 group-hover:text-emerald-400 transition-colors" />
              </button>

              {onGoToAnalyticsTab && (
                <button
                  onClick={onGoToAnalyticsTab}
                  className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-sky-500/50 text-neutral-300 hover:text-sky-300 transition-all text-left flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <BarChart3 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="truncate font-semibold">Analytics</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-neutral-600 group-hover:text-sky-400 transition-colors" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* OVERALL TRACKING SECTION: LeetCode / GitLab Activity Grid & 7-Day Matrix */}
      <section className="pt-2">
        <ActivityHeatmap
          habits={habits}
          entries={entries}
          onToggleComplete={onToggleComplete}
        />
      </section>

      {/* Compact Daily Reflection Card */}
      <DailyReflectionCard
        dateKey={selectedDateKey}
        reflection={reflections[selectedDateKey]}
        onSaveReflection={onSaveReflection}
      />
    </div>
  );
}

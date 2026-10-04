import React, { useState } from 'react';
import { Habit, HabitEntry, DailyReflection, TimeOfDay, Goal, FocusSession } from '../types/habit';
import { HabitCard } from './HabitCard';
import { ActivityHeatmap } from './ActivityHeatmap';
import { ProgressRocketWidget } from './ProgressRocketWidget';
import { DailyEnergyCheckin } from './DailyEnergyCheckin';
import { calculateHabitStats } from '../utils/analytics';
import { parseDateKey, getRelativeDateLabel, formatDateKey, getTodayKey } from '../utils/date';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Search,
  Flame,
  Target,
  BarChart3,
  Calendar,
  ArrowRight,
  Clock,
  Brain,
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
  onGoToTimerTab?: () => void;
  isCloudSynced?: boolean;
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
  onQuickAddTask,
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
  onGoToTimerTab,
  isCloudSynced = false,
}: TodayViewProps) {
  const [quickTitle, setQuickTitle] = useState('');
  const [timeFilter, setTimeFilter] = useState<'all' | TimeOfDay>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedDate = parseDateKey(selectedDateKey);
  const dayOfWeek = selectedDate.getDay();

  // Habits active for the selected date
  const scheduledHabits = habits.filter((h) => {
    if (h.archived) return false;
    if (h.isOneTime) return h.specificDate === selectedDateKey;
    return h.frequencyDays.includes(dayOfWeek);
  });

  const totalCount = scheduledHabits.length;
  const completedCount = scheduledHabits.filter((h) => {
    const entry = entries[`${h.id}_${selectedDateKey}`];
    return entry && entry.status === 'completed';
  }).length;
  const pendingCount = totalCount - completedCount;

  // Streak calculations
  const habitStats = habits.map((h) => calculateHabitStats(h, entries));
  const maxStreak = habitStats.reduce((max, s) => Math.max(max, s.currentStreak), 0);

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    onQuickAddTask(quickTitle.trim());
    setQuickTitle('');
  };

  // Filtered habits
  const filteredHabits = scheduledHabits.filter((h) => {
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
  const currentReflection = reflections[selectedDateKey] || {};

  return (
    <div className="space-y-6">
      {/* 1. TOP COMPONENT: DAILY ENERGY & MOOD CHECK-IN (STORES IN FIREBASE PER DATE KEY) */}
      <DailyEnergyCheckin
        dateKey={selectedDateKey}
        reflection={currentReflection}
        onSaveReflection={(updated) => onSaveReflection(selectedDateKey, updated)}
        isCloudSynced={isCloudSynced}
      />

      {/* 2. MAIN SCREEN SPLIT: Tasks on Left vs Metrics Sidebar on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ================= LEFT 70% COLUMN: TASKS ================= */}
        <div className="lg:col-span-8 space-y-4">
          {/* Search Bar & Instant Filters */}
          <div className="space-y-2">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3.5 text-neutral-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-neutral-900/60 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>

            {/* Time of Day & Completion Filters */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1 bg-neutral-900/60 p-1 rounded-lg border border-neutral-800">
                {(['all', 'morning', 'afternoon', 'evening', 'anytime'] as const).map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setTimeFilter(time)}
                    className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors ${
                      timeFilter === time
                        ? 'bg-neutral-800 text-emerald-300 font-semibold shadow-sm'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-neutral-900/60 p-1 rounded-lg border border-neutral-800">
                {(['all', 'pending', 'completed'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors ${
                      statusFilter === status
                        ? 'bg-neutral-800 text-emerald-300 font-semibold shadow-sm'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick-add Task Input */}
          <form onSubmit={handleQuickAddSubmit} className="relative">
            <input
              type="text"
              placeholder="+ Add a quick task for today and press Enter..."
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              className="w-full pl-4 pr-24 py-2.5 bg-neutral-900/40 hover:bg-neutral-900/70 focus:bg-neutral-900 border border-neutral-800 focus:border-emerald-500/60 rounded-xl text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none transition-all font-sans"
            />
            {quickTitle.trim() && (
              <button
                type="submit"
                className="absolute right-2 top-1.5 bottom-1.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors shadow-sm"
              >
                <span>Add</span>
              </button>
            )}
          </form>

          {/* Habit Cards List */}
          <div className="space-y-2.5">
            {filteredHabits.length > 0 ? (
              filteredHabits.map((habit) => {
                const entry = entries[`${habit.id}_${selectedDateKey}`];
                const stats = calculateHabitStats(habit, entries);
                const linkedGoal = habit.goalId ? goals.find((g) => g.id === habit.goalId) : undefined;

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

        {/* ================= RIGHT 30% SIDEBAR ================= */}
        <div className="lg:col-span-4 space-y-4">
          {/* Quick Date Switcher Bar */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5 bg-neutral-950 border border-neutral-800 rounded-lg p-0.5">
                <button
                  onClick={handlePrevDay}
                  aria-label="Previous day"
                  className="w-6 h-6 rounded flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleNextDay}
                  aria-label="Next day"
                  className="w-6 h-6 rounded flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <span className="font-semibold text-neutral-200">
                {getRelativeDateLabel(selectedDateKey)}
              </span>
              {!isToday && (
                <button
                  onClick={() => onSelectDateKey(getTodayKey())}
                  className="text-[11px] text-emerald-400 hover:underline font-mono"
                >
                  Today
                </button>
              )}
            </div>

            <span className="text-[11px] font-mono text-neutral-400">
              {pendingCount} Pending
            </span>
          </div>

          {/* WIDGET 1: Keep Pushing Progress Card matching user's reference image */}
          <ProgressRocketWidget
            completed={completedCount}
            total={totalCount}
            progressLabel="Total progress"
            progressSublabel="across today's tasks"
          />

          {/* WIDGET 2: STREAK (PURE COUNT OF DAYS) */}
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

          {/* WIDGET 3: WORKSPACE QUICK ACCESS MENU */}
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
                  <span className="truncate font-semibold">Targets</span>
                </div>
                <ArrowRight className="w-3 h-3 text-neutral-600 group-hover:text-emerald-400 transition-colors" />
              </button>

              {onGoToTimerTab && (
                <button
                  onClick={onGoToTimerTab}
                  className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-indigo-500/50 text-neutral-300 hover:text-indigo-300 transition-all text-left flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate font-semibold">Timer</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-neutral-600 group-hover:text-indigo-400 transition-colors" />
                </button>
              )}

              {onGoToMindsetTab && (
                <button
                  onClick={onGoToMindsetTab}
                  className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-purple-500/50 text-neutral-300 hover:text-purple-300 transition-all text-left flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Brain className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="truncate font-semibold">Mindset</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-neutral-600 group-hover:text-purple-400 transition-colors" />
                </button>
              )}

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

      {/* OVERALL TRACKING SECTION: Activity Heatmap */}
      <section className="pt-2">
        <ActivityHeatmap
          habits={habits}
          entries={entries}
          onToggleComplete={onToggleComplete}
        />
      </section>
    </div>
  );
}

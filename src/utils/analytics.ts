import { Habit, HabitEntry, HabitStats } from '../types/habit';
import { formatDateKey, getPastNDays, getTodayKey, parseDateKey } from './date';

export function calculateHabitStats(habit: Habit, entries: Record<string, HabitEntry>): HabitStats {
  const todayKey = getTodayKey();
  const past30Keys = getPastNDays(30);
  const past7Keys = getPastNDays(7);

  // Filter scheduled days
  let scheduled7Count = 0;
  let completed7Count = 0;
  let scheduled30Count = 0;
  let completed30Count = 0;
  let totalCompletions = 0;
  let lastCompletedDate: string | undefined;

  // Track all completions
  Object.values(entries).forEach((entry) => {
    if (entry.habitId === habit.id && entry.status === 'completed') {
      totalCompletions++;
      if (!lastCompletedDate || entry.date > lastCompletedDate) {
        lastCompletedDate = entry.date;
      }
    }
  });

  // Calculate 7-day rate
  past7Keys.forEach((dateKey) => {
    const d = parseDateKey(dateKey);
    const dayOfWeek = d.getDay();
    if (habit.frequencyDays.includes(dayOfWeek)) {
      scheduled7Count++;
      const entry = entries[`${habit.id}_${dateKey}`];
      if (entry && entry.status === 'completed') {
        completed7Count++;
      }
    }
  });

  // Calculate 30-day rate
  past30Keys.forEach((dateKey) => {
    const d = parseDateKey(dateKey);
    const dayOfWeek = d.getDay();
    if (habit.frequencyDays.includes(dayOfWeek)) {
      scheduled30Count++;
      const entry = entries[`${habit.id}_${dateKey}`];
      if (entry && entry.status === 'completed') {
        completed30Count++;
      }
    }
  });

  const completionRate7d = scheduled7Count > 0 ? Math.round((completed7Count / scheduled7Count) * 100) : 0;
  const completionRate30d = scheduled30Count > 0 ? Math.round((completed30Count / scheduled30Count) * 100) : 0;

  // Streak calculation (backwards from today/yesterday)
  let currentStreak = 0;
  let longestStreak = 0;

  // Check if today is completed
  const todayEntry = entries[`${habit.id}_${todayKey}`];
  let checkDate = parseDateKey(todayKey);

  if (todayEntry && todayEntry.status === 'completed') {
    currentStreak++;
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    // Today not completed yet, check if yesterday was completed so streak is still active
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Walk backwards
  for (let i = 0; i < 90; i++) {
    const dateKey = formatDateKey(checkDate);
    const dayOfWeek = checkDate.getDay();

    if (!habit.frequencyDays.includes(dayOfWeek)) {
      // Habit was not scheduled for this day, skip without breaking streak
      checkDate.setDate(checkDate.getDate() - 1);
      continue;
    }

    const entry = entries[`${habit.id}_${dateKey}`];
    if (entry && entry.status === 'completed') {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (entry && entry.status === 'skipped') {
      // Skipped/frozen day does not break streak
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate longest streak across history
  let tempStreak = 0;
  const sortedDates = Object.values(entries)
    .filter((e) => e.habitId === habit.id && e.status === 'completed')
    .map((e) => e.date)
    .sort();

  if (sortedDates.length > 0) {
    let prevDate: Date | null = null;
    sortedDates.forEach((dateStr) => {
      const curDate = parseDateKey(dateStr);
      if (!prevDate) {
        tempStreak = 1;
      } else {
        const diffDays = Math.round((curDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          // Check if intervening days were unscheduled
          let allUnscheduled = true;
          for (let step = 1; step < diffDays; step++) {
            const mid = new Date(prevDate);
            mid.setDate(prevDate.getDate() + step);
            if (habit.frequencyDays.includes(mid.getDay())) {
              allUnscheduled = false;
              break;
            }
          }
          if (allUnscheduled) {
            tempStreak++;
          } else {
            tempStreak = 1;
          }
        }
      }
      prevDate = curDate;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    });
  }
  longestStreak = Math.max(longestStreak, currentStreak);

  // Exponential moving habit strength (Atomic Habits momentum formula)
  // Strength decays by 0.95 each day without completion, and adds 0.1 on completion, capped at 1.0
  let strength = 0.5; // baseline
  const past60Keys = getPastNDays(60);
  past60Keys.forEach((k) => {
    const d = parseDateKey(k);
    if (!habit.frequencyDays.includes(d.getDay())) return; // skip unscheduled

    const entry = entries[`${habit.id}_${k}`];
    if (entry && entry.status === 'completed') {
      strength = strength * 0.95 + 0.1;
    } else if (entry && entry.status === 'skipped') {
      strength = strength * 0.99; // very slight decay for freeze
    } else {
      strength = strength * 0.93; // decay on missed
    }
  });

  const habitStrength = Math.min(100, Math.max(0, Math.round(strength * 100)));

  return {
    currentStreak,
    longestStreak,
    totalCompletions,
    completionRate7d,
    completionRate30d,
    habitStrength,
    lastCompletedDate,
  };
}

export interface DayAnalytics {
  dayName: string;
  adherence: number; // 0-100
  completed: number;
  totalScheduled: number;
}

export function calculateDayOfWeekBreakdown(habits: Habit[], entries: Record<string, HabitEntry>): DayAnalytics[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayIndices = [1, 2, 3, 4, 5, 6, 0]; // Mon=1 ... Sun=0

  const scheduledCounts = [0, 0, 0, 0, 0, 0, 0];
  const completedCounts = [0, 0, 0, 0, 0, 0, 0];

  const past28Keys = getPastNDays(28);

  past28Keys.forEach((dateKey) => {
    const d = parseDateKey(dateKey);
    const dayOfWeek = d.getDay();
    const targetIdx = dayIndices.indexOf(dayOfWeek);

    habits.forEach((habit) => {
      if (habit.archived) return;
      if (habit.frequencyDays.includes(dayOfWeek)) {
        scheduledCounts[targetIdx]++;
        const entry = entries[`${habit.id}_${dateKey}`];
        if (entry && entry.status === 'completed') {
          completedCounts[targetIdx]++;
        }
      }
    });
  });

  return days.map((dayName, idx) => {
    const sched = scheduledCounts[idx];
    const comp = completedCounts[idx];
    const adherence = sched > 0 ? Math.round((comp / sched) * 100) : 0;
    return {
      dayName,
      adherence,
      completed: comp,
      totalScheduled: sched,
    };
  });
}

export function calculateOverallStats(habits: Habit[], entries: Record<string, HabitEntry>) {
  const activeHabits = habits.filter((h) => !h.archived);
  const todayKey = getTodayKey();
  const todayDate = parseDateKey(todayKey);
  const todayDayOfWeek = todayDate.getDay();

  const todayScheduled = activeHabits.filter((h) => h.frequencyDays.includes(todayDayOfWeek));
  const todayCompleted = todayScheduled.filter((h) => {
    const entry = entries[`${h.id}_${todayKey}`];
    return entry && entry.status === 'completed';
  });

  const todayMissed = todayScheduled.filter((h) => {
    const entry = entries[`${h.id}_${todayKey}`];
    return entry && entry.status === 'missed';
  });

  const todayPending = todayScheduled.length - todayCompleted.length - todayMissed.length;
  const todayPercent = todayScheduled.length > 0 ? Math.round((todayCompleted.length / todayScheduled.length) * 100) : 0;

  // Calculate average habit strength across active habits
  const statsList = activeHabits.map((h) => calculateHabitStats(h, entries));
  const avgStrength = statsList.length > 0 ? Math.round(statsList.reduce((acc, s) => acc + s.habitStrength, 0) / statsList.length) : 0;
  const totalAllCompletions = statsList.reduce((acc, s) => acc + s.totalCompletions, 0);
  const maxActiveStreak = statsList.reduce((acc, s) => Math.max(acc, s.currentStreak), 0);

  return {
    todayScheduledCount: todayScheduled.length,
    todayCompletedCount: todayCompleted.length,
    todayMissedCount: todayMissed.length,
    todayPendingCount: todayPending,
    todayPercent,
    avgStrength,
    totalAllCompletions,
    maxActiveStreak,
  };
}

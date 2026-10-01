import { Goal, GoalAnalytics, HabitEntry } from '../types/habit';
import { parseDateKey, getTodayKey } from './date';

export function calculateGoalAnalytics(
  goal: Goal,
  entries: Record<string, HabitEntry>
): GoalAnalytics {
  const todayKey = getTodayKey();
  const today = parseDateKey(todayKey);
  const start = parseDateKey(goal.startDate);
  const target = parseDateKey(goal.targetDate);

  const oneDayMs = 1000 * 60 * 60 * 24;
  const daysTotal = Math.max(1, Math.round((target.getTime() - start.getTime()) / oneDayMs));
  const daysPassed = Math.max(0, Math.round((today.getTime() - start.getTime()) / oneDayMs));
  const rawRemaining = Math.round((target.getTime() - today.getTime()) / oneDayMs);
  const daysRemaining = Math.max(0, rawRemaining);
  const isOverdue = rawRemaining < 0;

  // Calculate actual completions linked to this goal between start and today
  let currentProgress = 0;
  const linkedIds = new Set(goal.linkedHabitIds || []);

  Object.values(entries).forEach((entry) => {
    if (linkedIds.size > 0 && !linkedIds.has(entry.habitId)) return;
    if (entry.status !== 'completed') return;
    if (entry.date >= goal.startDate && entry.date <= todayKey) {
      currentProgress++;
    }
  });

  const pendingCount = Math.max(0, goal.targetMetricCount - currentProgress);
  const percentComplete = goal.targetMetricCount > 0
    ? Math.min(100, Math.round((currentProgress / goal.targetMetricCount) * 100))
    : 0;

  const expectedPercent = Math.min(100, Math.round((daysPassed / daysTotal) * 100));

  // Determine pace status and delay days
  // Expected progress count at this point in time:
  const expectedCount = Math.round((daysPassed / daysTotal) * goal.targetMetricCount);
  const difference = currentProgress - expectedCount;

  // Rate of required progress per day
  const dailyRate = goal.targetMetricCount / daysTotal;
  const delayDays = dailyRate > 0 ? Math.round(Math.abs(difference) / dailyRate) : 0;

  let paceStatus: GoalAnalytics['paceStatus'] = 'on_track';
  if (isOverdue && pendingCount > 0) {
    paceStatus = 'critical';
  } else if (difference >= 3) {
    paceStatus = 'ahead';
  } else if (difference >= -2) {
    paceStatus = 'on_track';
  } else if (difference >= -7) {
    paceStatus = 'delayed';
  } else {
    paceStatus = 'critical';
  }

  return {
    daysTotal,
    daysPassed,
    daysRemaining,
    isOverdue,
    currentProgress,
    pendingCount,
    percentComplete,
    expectedPercent,
    paceStatus,
    delayDays,
  };
}

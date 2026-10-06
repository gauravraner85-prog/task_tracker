import { Habit } from '../types/habit';

/**
 * Returns the effective start date (YYYY-MM-DD) for a habit.
 * Tasks added in between a target period or created at a certain date
 * should only apply from this day onwards, and not on previous days.
 */
export function getHabitEffectiveStartDate(habit: Habit): string {
  if (habit.startDate) return habit.startDate;
  if (habit.isOneTime && habit.specificDate) return habit.specificDate;
  if (habit.createdAt) {
    try {
      // Handles ISO dates like "2026-10-06T12:09:12.000Z"
      return habit.createdAt.slice(0, 10);
    } catch {
      // fallback
    }
  }
  return '';
}

/**
 * Checks whether a habit is scheduled to be performed on a specific dateKey (YYYY-MM-DD).
 *
 * Rules:
 * 1. Archived habits are not scheduled.
 * 2. One-time tasks are only scheduled on their specificDate.
 * 3. Tasks added in-between a target period only apply from their startDate / createdAt onwards;
 *    they NEVER appear on previous days before their creation!
 * 4. If an optional endDate exists, the task does not appear after that date.
 * 5. Matches the day-of-week frequency (if dayOfWeek is supplied).
 */
export function isHabitScheduledOnDate(
  habit: Habit,
  dateKey: string,
  dayOfWeek?: number
): boolean {
  if (habit.archived) return false;

  // 1. One-time task check
  if (habit.isOneTime) {
    return habit.specificDate === dateKey;
  }

  // 2. Start date check (in-between target period or creation date)
  // Tasks added in between only appear from that day onwards!
  const effectiveStart = getHabitEffectiveStartDate(habit);
  if (effectiveStart && dateKey < effectiveStart) {
    return false;
  }

  // 3. Optional end date check
  if (habit.endDate && dateKey > habit.endDate) {
    return false;
  }

  // 4. Day-of-week frequency check
  if (dayOfWeek !== undefined) {
    return habit.frequencyDays.includes(dayOfWeek);
  }

  return true;
}

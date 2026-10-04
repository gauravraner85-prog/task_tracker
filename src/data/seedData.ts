import { Habit, HabitEntry, DailyReflection, Goal, CustomCategory, FocusSession } from '../types/habit';

export const DEFAULT_CATEGORIES: CustomCategory[] = [
  { id: 'health', label: 'Health & Vitality', icon: 'Sun', color: 'amber' },
  { id: 'productivity', label: 'Deep Work & Productivity', icon: 'Flame', color: 'indigo' },
  { id: 'learning', label: 'Study & Learning', icon: 'BookOpen', color: 'sky' },
  { id: 'mind', label: 'Mind & Mindfulness', icon: 'Brain', color: 'teal' },
  { id: 'fitness', label: 'Fitness & Physical', icon: 'Dumbbell', color: 'rose' },
  { id: 'routine', label: 'Daily Routine', icon: 'CheckSquare', color: 'emerald' },
  { id: 'coding', label: 'Coding & Tech', icon: 'Code', color: 'violet', isCustom: true },
  { id: 'finance', label: 'Wealth & Finance', icon: 'Coins', color: 'emerald', isCustom: true },
];

// Production state: start completely empty for the user
export const INITIAL_GOALS: Goal[] = [];
export const INITIAL_HABITS: Habit[] = [];

export function generateSeedEntries(): Record<string, HabitEntry> {
  return {};
}

export function generateSeedReflections(): Record<string, DailyReflection> {
  return {};
}

export function generateSeedFocusSessions(): FocusSession[] {
  return [];
}

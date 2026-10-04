import { Habit, HabitEntry, DailyReflection, Goal, FocusSession, CustomCategory } from '../types/habit';
import {
  INITIAL_HABITS,
  INITIAL_GOALS,
  DEFAULT_CATEGORIES,
  generateSeedEntries,
  generateSeedReflections,
  generateSeedFocusSessions,
} from '../data/seedData';

const STORAGE_KEYS = {
  HABITS: 'horizon_habits_v6',
  GOALS: 'horizon_goals_v6',
  ENTRIES: 'horizon_entries_v6',
  REFLECTIONS: 'horizon_reflections_v6',
  SESSIONS: 'horizon_sessions_v6',
  CATEGORIES: 'horizon_categories_v6',
};

export function loadCategories(): CustomCategory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  saveCategories(DEFAULT_CATEGORIES);
  return DEFAULT_CATEGORIES;
}

export function saveCategories(categories: CustomCategory[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch {
    // ignore
  }
}

export function loadHabits(): Habit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HABITS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // fallback
  }
  return [];
}

export function saveHabits(habits: Habit[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  } catch {
    // ignore
  }
}

export function loadGoals(): Goal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // fallback
  }
  return [];
}

export function saveGoals(goals: Goal[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  } catch {
    // ignore
  }
}

export function loadEntries(): Record<string, HabitEntry> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch {
    // fallback
  }
  return {};
}

export function saveEntries(entries: Record<string, HabitEntry>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
  } catch {
    // ignore
  }
}

export function loadFocusSessions(): FocusSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // fallback
  }
  return [];
}

export function saveFocusSessions(sessions: FocusSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  } catch {
    // ignore
  }
}

export function loadReflections(): Record<string, DailyReflection> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REFLECTIONS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch {
    // fallback
  }
  return {};
}

export function saveReflections(reflections: Record<string, DailyReflection>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify(reflections));
  } catch {
    // ignore
  }
}

export function exportBackupJSON(
  habits: Habit[],
  goals: Goal[],
  entries: Record<string, HabitEntry>,
  reflections: Record<string, DailyReflection>,
  focusSessions: FocusSession[],
  categories: CustomCategory[]
): string {
  return JSON.stringify(
    {
      version: 5,
      exportedAt: new Date().toISOString(),
      categories,
      goals,
      habits,
      entries,
      reflections,
      focusSessions,
    },
    null,
    2
  );
}

export function resetToSeedData(): {
  habits: Habit[];
  goals: Goal[];
  entries: Record<string, HabitEntry>;
  reflections: Record<string, DailyReflection>;
  focusSessions: FocusSession[];
  categories: CustomCategory[];
} {
  localStorage.removeItem(STORAGE_KEYS.HABITS);
  localStorage.removeItem(STORAGE_KEYS.GOALS);
  localStorage.removeItem(STORAGE_KEYS.ENTRIES);
  localStorage.removeItem(STORAGE_KEYS.REFLECTIONS);
  localStorage.removeItem(STORAGE_KEYS.SESSIONS);
  localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
  const habits = INITIAL_HABITS;
  const goals = INITIAL_GOALS;
  const entries = generateSeedEntries();
  const reflections = generateSeedReflections();
  const focusSessions = generateSeedFocusSessions();
  const categories = DEFAULT_CATEGORIES;
  saveHabits(habits);
  saveGoals(goals);
  saveEntries(entries);
  saveReflections(reflections);
  saveFocusSessions(focusSessions);
  saveCategories(categories);
  return { habits, goals, entries, reflections, focusSessions, categories };
}

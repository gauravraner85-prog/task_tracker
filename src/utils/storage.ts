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
  HABITS: 'komorebi_habits_v5',
  GOALS: 'komorebi_goals_v5',
  ENTRIES: 'komorebi_entries_v5',
  REFLECTIONS: 'komorebi_reflections_v5',
  SESSIONS: 'komorebi_sessions_v5',
  CATEGORIES: 'komorebi_categories_v5',
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
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  saveHabits(INITIAL_HABITS);
  return INITIAL_HABITS;
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
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  saveGoals(INITIAL_GOALS);
  return INITIAL_GOALS;
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
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch {
    // fallback
  }
  const initial = generateSeedEntries();
  saveEntries(initial);
  return initial;
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
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // fallback
  }
  const initial = generateSeedFocusSessions();
  saveFocusSessions(initial);
  return initial;
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
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch {
    // fallback
  }
  const initial = generateSeedReflections();
  saveReflections(initial);
  return initial;
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

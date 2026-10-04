import { Habit, HabitEntry, DailyReflection, Goal, FocusSession, CustomCategory } from '../types/habit';
import { DEFAULT_CATEGORIES } from '../data/seedData';

const STORAGE_KEYS = {
  HABITS: 'horizon_habits_v7',
  GOALS: 'horizon_goals_v7',
  ENTRIES: 'horizon_entries_v7',
  REFLECTIONS: 'horizon_reflections_v7',
  SESSIONS: 'horizon_sessions_v7',
  CATEGORIES: 'horizon_categories_v7',
};

// Known demo / seed IDs to permanently purge
export const DUMMY_HABIT_IDS = new Set([
  'habit_1',
  'habit_2',
  'habit_3',
  'habit_4',
  'habit_5',
  'habit_6',
]);

export const DUMMY_GOAL_IDS = new Set([
  'goal_q4_fitness',
  'goal_deep_work',
  'goal_mind_reading',
]);

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
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter((h) => !DUMMY_HABIT_IDS.has(h.id));
        return cleaned;
      }
    }
    // Also check older v6 key and purge any demo habits if migrating
    const rawV6 = localStorage.getItem('horizon_habits_v6');
    if (rawV6 !== null) {
      const parsed = JSON.parse(rawV6);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter((h) => !DUMMY_HABIT_IDS.has(h.id));
        saveHabits(cleaned);
        localStorage.removeItem('horizon_habits_v6');
        return cleaned;
      }
    }
  } catch {
    // fallback
  }
  return [];
}

export function saveHabits(habits: Habit[]): void {
  try {
    const cleaned = habits.filter((h) => !DUMMY_HABIT_IDS.has(h.id));
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(cleaned));
  } catch {
    // ignore
  }
}

export function loadGoals(): Goal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter((g) => !DUMMY_GOAL_IDS.has(g.id));
        return cleaned;
      }
    }
    const rawV6 = localStorage.getItem('horizon_goals_v6');
    if (rawV6 !== null) {
      const parsed = JSON.parse(rawV6);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter((g) => !DUMMY_GOAL_IDS.has(g.id));
        saveGoals(cleaned);
        localStorage.removeItem('horizon_goals_v6');
        return cleaned;
      }
    }
  } catch {
    // fallback
  }
  return [];
}

export function saveGoals(goals: Goal[]): void {
  try {
    const cleaned = goals.filter((g) => !DUMMY_GOAL_IDS.has(g.id));
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(cleaned));
  } catch {
    // ignore
  }
}

export function loadEntries(): Record<string, HabitEntry> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const cleaned: Record<string, HabitEntry> = {};
        for (const [k, v] of Object.entries(parsed)) {
          const entry = v as HabitEntry;
          if (entry && !DUMMY_HABIT_IDS.has(entry.habitId)) {
            cleaned[k] = entry;
          }
        }
        return cleaned;
      }
    }
  } catch {
    // fallback
  }
  return {};
}

export function saveEntries(entries: Record<string, HabitEntry>): void {
  try {
    const cleaned: Record<string, HabitEntry> = {};
    for (const [k, v] of Object.entries(entries)) {
      if (v && !DUMMY_HABIT_IDS.has(v.habitId)) {
        cleaned[k] = v;
      }
    }
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(cleaned));
  } catch {
    // ignore
  }
}

export function loadFocusSessions(): FocusSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((s) => !s.taskId || !DUMMY_HABIT_IDS.has(s.taskId));
      }
    }
  } catch {
    // fallback
  }
  return [];
}

export function saveFocusSessions(sessions: FocusSession[]): void {
  try {
    const cleaned = sessions.filter((s) => !s.taskId || !DUMMY_HABIT_IDS.has(s.taskId));
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(cleaned));
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
      version: 7,
      exportedAt: new Date().toISOString(),
      categories,
      goals: goals.filter((g) => !DUMMY_GOAL_IDS.has(g.id)),
      habits: habits.filter((h) => !DUMMY_HABIT_IDS.has(h.id)),
      entries,
      reflections,
      focusSessions,
    },
    null,
    2
  );
}

export function resetAllLocalData(): void {
  try {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    localStorage.removeItem('horizon_habits_v6');
    localStorage.removeItem('horizon_goals_v6');
    localStorage.removeItem('horizon_entries_v6');
    localStorage.removeItem('komorebi_habits_v5');
  } catch {
    // ignore
  }
}

export function resetToSeedData() {
  resetAllLocalData();
  return {
    categories: DEFAULT_CATEGORIES,
    habits: [] as Habit[],
    goals: [] as Goal[],
    entries: {} as Record<string, HabitEntry>,
    reflections: {} as Record<string, DailyReflection>,
    focusSessions: [] as FocusSession[],
  };
}

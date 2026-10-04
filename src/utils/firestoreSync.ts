import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Habit, Goal, HabitEntry, FocusSession, DailyReflection, CustomCategory } from '../types/habit';
import { UserBadge } from '../types/achievement';
import { DEFAULT_CATEGORIES } from '../data/seedData';
import {
  DUMMY_HABIT_IDS,
  DUMMY_GOAL_IDS,
  saveHabits,
  saveGoals,
  saveEntries,
  saveFocusSessions,
  saveReflections,
  saveCategories,
} from './storage';

/**
 * Strips out `undefined` fields recursively.
 * In Firestore, passing `undefined` in setDoc will throw a fatal error
 * which prevents habits, goals, and entries from saving!
 */
export function cleanDocData<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (
        value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        !(value instanceof Date)
      ) {
        result[key] = cleanDocData(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

export async function syncInitialUserDataIfEmpty(userId: string) {
  // Only ensure categories exist; NEVER seed dummy habits, goals, entries, or reflections
  const categoriesCol = `users/${userId}/categories`;
  try {
    const snap = await getDocs(collection(db, categoriesCol));
    if (snap.empty) {
      for (const c of DEFAULT_CATEGORIES) {
        await setDoc(doc(db, `users/${userId}/categories`, c.id), cleanDocData({ ...c, userId }));
      }
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, categoriesCol);
  }
}

export function subscribeToUserData(
  userId: string,
  callbacks: {
    onHabits: (habits: Habit[]) => void;
    onGoals: (goals: Goal[]) => void;
    onEntries: (entries: Record<string, HabitEntry>) => void;
    onFocusSessions: (sessions: FocusSession[]) => void;
    onReflections: (reflections: Record<string, DailyReflection>) => void;
    onCategories: (categories: CustomCategory[]) => void;
    onAchievements: (badges: Record<string, UserBadge>) => void;
  }
) {
  const unsubs: (() => void)[] = [];

  // Habits
  const habitsPath = `users/${userId}/habits`;
  const unsubHabits = onSnapshot(
    collection(db, habitsPath),
    (snap) => {
      const items: Habit[] = [];
      snap.forEach((d) => {
        const h = d.data() as Habit;
        if (DUMMY_HABIT_IDS.has(h.id) || DUMMY_HABIT_IDS.has(d.id)) {
          // Purge legacy demo habits from Firestore
          deleteDoc(doc(db, habitsPath, d.id)).catch(() => {});
        } else {
          items.push(h);
        }
      });
      items.sort((a, b) => a.order - b.order);
      callbacks.onHabits(items);
      saveHabits(items);
    },
    (err) => handleFirestoreError(err, OperationType.GET, habitsPath)
  );
  unsubs.push(unsubHabits);

  // Goals
  const goalsPath = `users/${userId}/goals`;
  const unsubGoals = onSnapshot(
    collection(db, goalsPath),
    (snap) => {
      const items: Goal[] = [];
      snap.forEach((d) => {
        const g = d.data() as Goal;
        if (DUMMY_GOAL_IDS.has(g.id) || DUMMY_GOAL_IDS.has(d.id)) {
          deleteDoc(doc(db, goalsPath, d.id)).catch(() => {});
        } else {
          items.push(g);
        }
      });
      callbacks.onGoals(items);
      saveGoals(items);
    },
    (err) => handleFirestoreError(err, OperationType.GET, goalsPath)
  );
  unsubs.push(unsubGoals);

  // Entries
  const entriesPath = `users/${userId}/entries`;
  const unsubEntries = onSnapshot(
    collection(db, entriesPath),
    (snap) => {
      const map: Record<string, HabitEntry> = {};
      snap.forEach((d) => {
        const entry = d.data() as HabitEntry;
        if (entry.habitId && DUMMY_HABIT_IDS.has(entry.habitId)) {
          deleteDoc(doc(db, entriesPath, d.id)).catch(() => {});
        } else {
          map[d.id] = entry;
        }
      });
      callbacks.onEntries(map);
      saveEntries(map);
    },
    (err) => handleFirestoreError(err, OperationType.GET, entriesPath)
  );
  unsubs.push(unsubEntries);

  // Focus Sessions
  const sessionsPath = `users/${userId}/focusSessions`;
  const unsubSessions = onSnapshot(
    collection(db, sessionsPath),
    (snap) => {
      const items: FocusSession[] = [];
      snap.forEach((d) => items.push(d.data() as FocusSession));
      callbacks.onFocusSessions(items);
      saveFocusSessions(items);
    },
    (err) => handleFirestoreError(err, OperationType.GET, sessionsPath)
  );
  unsubs.push(unsubSessions);

  // Reflections
  const reflectionsPath = `users/${userId}/reflections`;
  const unsubReflections = onSnapshot(
    collection(db, reflectionsPath),
    (snap) => {
      const map: Record<string, DailyReflection> = {};
      snap.forEach((d) => {
        map[d.id] = d.data() as DailyReflection;
      });
      callbacks.onReflections(map);
      saveReflections(map);
    },
    (err) => handleFirestoreError(err, OperationType.GET, reflectionsPath)
  );
  unsubs.push(unsubReflections);

  // Categories
  const categoriesPath = `users/${userId}/categories`;
  const unsubCategories = onSnapshot(
    collection(db, categoriesPath),
    (snap) => {
      const items: CustomCategory[] = [];
      snap.forEach((d) => items.push(d.data() as CustomCategory));
      const finalCats = items.length > 0 ? items : DEFAULT_CATEGORIES;
      callbacks.onCategories(finalCats);
      saveCategories(finalCats);
    },
    (err) => handleFirestoreError(err, OperationType.GET, categoriesPath)
  );
  unsubs.push(unsubCategories);

  // Achievements
  const achievementsPath = `users/${userId}/achievements`;
  const unsubAchievements = onSnapshot(
    collection(db, achievementsPath),
    (snap) => {
      const map: Record<string, UserBadge> = {};
      snap.forEach((d) => {
        const data = d.data() as UserBadge;
        map[data.badgeId] = data;
      });
      callbacks.onAchievements(map);
    },
    (err) => handleFirestoreError(err, OperationType.GET, achievementsPath)
  );
  unsubs.push(unsubAchievements);

  return () => {
    unsubs.forEach((unsub) => unsub());
  };
}

export async function saveHabitToFirestore(userId: string, habit: Habit) {
  const path = `users/${userId}/habits/${habit.id}`;
  try {
    const payload = cleanDocData({ ...habit, userId });
    await setDoc(doc(db, `users/${userId}/habits`, habit.id), payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteHabitFromFirestore(userId: string, habitId: string) {
  const path = `users/${userId}/habits/${habitId}`;
  try {
    await deleteDoc(doc(db, `users/${userId}/habits`, habitId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function saveGoalToFirestore(userId: string, goal: Goal) {
  const path = `users/${userId}/goals/${goal.id}`;
  try {
    const payload = cleanDocData({ ...goal, userId });
    await setDoc(doc(db, `users/${userId}/goals`, goal.id), payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function saveEntryToFirestore(userId: string, entry: HabitEntry) {
  const path = `users/${userId}/entries/${entry.id}`;
  try {
    const payload = cleanDocData({ ...entry, userId });
    await setDoc(doc(db, `users/${userId}/entries`, entry.id), payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function saveFocusSessionToFirestore(userId: string, session: FocusSession) {
  const path = `users/${userId}/focusSessions/${session.id}`;
  try {
    const payload = cleanDocData({ ...session, userId });
    await setDoc(doc(db, `users/${userId}/focusSessions`, session.id), payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function saveReflectionToFirestore(userId: string, reflection: DailyReflection) {
  const path = `users/${userId}/reflections/${reflection.date}`;
  try {
    const payload = cleanDocData({ ...reflection, userId });
    await setDoc(doc(db, `users/${userId}/reflections`, reflection.date), payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function saveCategoryToFirestore(userId: string, category: CustomCategory) {
  const path = `users/${userId}/categories/${category.id}`;
  try {
    const payload = cleanDocData({ ...category, userId });
    await setDoc(doc(db, `users/${userId}/categories`, category.id), payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteCategoryFromFirestore(userId: string, categoryId: string) {
  const path = `users/${userId}/categories/${categoryId}`;
  try {
    await deleteDoc(doc(db, `users/${userId}/categories`, categoryId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function saveAchievementToFirestore(userId: string, badgeId: string) {
  const path = `users/${userId}/achievements/${badgeId}`;
  try {
    const payload = cleanDocData({
      id: badgeId,
      badgeId,
      userId,
      unlockedAt: new Date().toISOString(),
    });
    await setDoc(doc(db, `users/${userId}/achievements`, badgeId), payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  query,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Habit, Goal, HabitEntry, FocusSession, DailyReflection, CustomCategory } from '../types/habit';
import { UserBadge } from '../types/achievement';
import { INITIAL_HABITS, INITIAL_GOALS, DEFAULT_CATEGORIES, generateSeedEntries, generateSeedReflections, generateSeedFocusSessions } from '../data/seedData';

export async function syncInitialUserDataIfEmpty(userId: string) {
  const habitsCol = `users/${userId}/habits`;
  try {
    const snap = await getDocs(collection(db, habitsCol));
    if (snap.empty) {
      // First-time user: seed personal data
      for (const h of INITIAL_HABITS) {
        await setDoc(doc(db, `users/${userId}/habits`, h.id), { ...h, userId });
      }
      for (const g of INITIAL_GOALS) {
        await setDoc(doc(db, `users/${userId}/goals`, g.id), { ...g, userId });
      }
      for (const c of DEFAULT_CATEGORIES) {
        await setDoc(doc(db, `users/${userId}/categories`, c.id), { ...c, userId });
      }
      const seedEntries = generateSeedEntries();
      for (const [key, entry] of Object.entries(seedEntries)) {
        await setDoc(doc(db, `users/${userId}/entries`, key), { ...entry, userId });
      }
      const seedReflections = generateSeedReflections();
      for (const [date, ref] of Object.entries(seedReflections)) {
        await setDoc(doc(db, `users/${userId}/reflections`, date), { ...ref, userId });
      }
      const seedSessions = generateSeedFocusSessions();
      for (const sess of seedSessions) {
        await setDoc(doc(db, `users/${userId}/focusSessions`, sess.id), { ...sess, userId });
      }
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, habitsCol);
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
      snap.forEach((d) => items.push(d.data() as Habit));
      items.sort((a, b) => a.order - b.order);
      callbacks.onHabits(items);
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
      snap.forEach((d) => items.push(d.data() as Goal));
      callbacks.onGoals(items);
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
        map[d.id] = d.data() as HabitEntry;
      });
      callbacks.onEntries(map);
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
      items.sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''));
      callbacks.onFocusSessions(items);
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
      callbacks.onCategories(items.length > 0 ? items : DEFAULT_CATEGORIES);
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
    await setDoc(doc(db, `users/${userId}/habits`, habit.id), { ...habit, userId });
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
    await setDoc(doc(db, `users/${userId}/goals`, goal.id), { ...goal, userId });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function saveEntryToFirestore(userId: string, entry: HabitEntry) {
  const path = `users/${userId}/entries/${entry.id}`;
  try {
    await setDoc(doc(db, `users/${userId}/entries`, entry.id), { ...entry, userId });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function saveFocusSessionToFirestore(userId: string, session: FocusSession) {
  const path = `users/${userId}/focusSessions/${session.id}`;
  try {
    await setDoc(doc(db, `users/${userId}/focusSessions`, session.id), { ...session, userId });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function saveReflectionToFirestore(userId: string, reflection: DailyReflection) {
  const path = `users/${userId}/reflections/${reflection.date}`;
  try {
    await setDoc(doc(db, `users/${userId}/reflections`, reflection.date), { ...reflection, userId });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function saveCategoryToFirestore(userId: string, category: CustomCategory) {
  const path = `users/${userId}/categories/${category.id}`;
  try {
    await setDoc(doc(db, `users/${userId}/categories`, category.id), { ...category, userId });
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
    await setDoc(doc(db, `users/${userId}/achievements`, badgeId), {
      id: badgeId,
      badgeId,
      userId,
      unlockedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

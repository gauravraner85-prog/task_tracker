import { Habit, HabitEntry, DailyReflection, Goal, CustomCategory } from '../types/habit';
import { getPastNDays, getTodayKey } from '../utils/date';

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

export const INITIAL_GOALS: Goal[] = [
  {
    id: 'goal_q4_fitness',
    title: '90-Day Peak Stamina & Conditioning',
    description: 'Transform cardiovascular capacity with consistent daily hydration, sunlight, and 10,000 steps.',
    category: 'fitness',
    color: 'emerald',
    startDate: '2026-09-01',
    targetDate: '2026-12-01', // 3-month target
    targetMetricCount: 75,
    metricUnit: 'sessions',
    status: 'active',
    linkedHabitIds: ['habit_1', 'habit_4'],
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'goal_deep_work',
    title: 'Focus Sprints & Project Shipping',
    description: 'Log 60 high-leverage deep work sprints without digital distractions to complete key milestones.',
    category: 'productivity',
    color: 'indigo',
    startDate: '2026-08-15',
    targetDate: '2026-11-15', // 3-month target
    targetMetricCount: 50,
    metricUnit: 'sprints',
    status: 'active',
    linkedHabitIds: ['habit_3'],
    createdAt: '2026-08-15T08:00:00Z',
  },
  {
    id: 'goal_mind_reading',
    title: 'Mindful Recovery & 1,000 Pages Read',
    description: 'Daily evening non-fiction reading and screen-free meditation to optimize sleep and cognitive sharpness.',
    category: 'learning',
    color: 'sky',
    startDate: '2026-09-15',
    targetDate: '2026-12-15', // 3-month target
    targetMetricCount: 45,
    metricUnit: 'check-ins',
    status: 'active',
    linkedHabitIds: ['habit_2', 'habit_5', 'habit_6'],
    createdAt: '2026-09-15T08:00:00Z',
  },
];

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'habit_1',
    title: 'Morning Sunlight & Hydration',
    description: 'Drink 500ml pure water with electrolytes and get 10 minutes of direct outdoor sunlight.',
    category: 'health',
    color: 'amber',
    icon: 'Sun',
    targetType: 'numeric',
    targetValue: 500,
    unit: 'ml',
    timeOfDay: 'morning',
    targetTime: '07:15',
    frequencyDays: [0, 1, 2, 3, 4, 5, 6],
    cue: 'Immediately upon getting out of bed',
    goalId: 'goal_q4_fitness',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    order: 0,
  },
  {
    id: 'habit_2',
    title: 'Meditation & Breathwork',
    description: 'Box breathing and mindful presence to center nervous system before digital inputs.',
    category: 'mind',
    color: 'teal',
    icon: 'Brain',
    targetType: 'timer',
    targetValue: 15,
    unit: 'mins',
    timeOfDay: 'morning',
    targetTime: '07:45',
    frequencyDays: [0, 1, 2, 3, 4, 5, 6],
    cue: 'Sit on meditation cushion with noise-canceling headphones',
    goalId: 'goal_mind_reading',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    order: 1,
  },
  {
    id: 'habit_3',
    title: 'Deep Work Sprint (60m)',
    description: 'High-leverage single-task execution with phone in airplane mode in another room.',
    category: 'productivity',
    color: 'indigo',
    icon: 'Flame',
    targetType: 'timer',
    targetValue: 60,
    unit: 'mins',
    timeOfDay: 'morning',
    targetTime: '09:00',
    frequencyDays: [1, 2, 3, 4, 5], // Weekdays
    cue: 'Start after opening day agenda and closing email tabs',
    goalId: 'goal_deep_work',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    order: 2,
  },
  {
    id: 'habit_4',
    title: '10,000 Daily Steps / Walk',
    description: 'Post-lunch brisk walk and movement breaks to optimize glucose and circulation.',
    category: 'fitness',
    color: 'emerald',
    icon: 'Footprints',
    targetType: 'numeric',
    targetValue: 10000,
    unit: 'steps',
    timeOfDay: 'afternoon',
    targetTime: '13:30',
    frequencyDays: [0, 1, 2, 3, 4, 5, 6],
    cue: 'Right after finishing midday lunch',
    goalId: 'goal_q4_fitness',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    order: 3,
  },
  {
    id: 'habit_5',
    title: 'Read 20 Pages Non-Fiction',
    description: 'Absorb philosophy, biology, engineering, or biographies. Highlight key insights.',
    category: 'learning',
    color: 'sky',
    icon: 'BookOpen',
    targetType: 'numeric',
    targetValue: 20,
    unit: 'pages',
    timeOfDay: 'evening',
    targetTime: '20:30',
    frequencyDays: [0, 1, 2, 3, 4, 5, 6],
    cue: 'While unwinding on the reading chair with herbal tea',
    goalId: 'goal_mind_reading',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    order: 4,
  },
  {
    id: 'habit_6',
    title: 'Digital Sunset (No Screens)',
    description: 'Dock phones and laptops away from bedroom 1 hour prior to sleep.',
    category: 'routine',
    color: 'rose',
    icon: 'Moon',
    targetType: 'boolean',
    targetValue: 1,
    timeOfDay: 'evening',
    targetTime: '22:00',
    frequencyDays: [0, 1, 2, 3, 4, 5, 6],
    cue: 'When the 10:00 PM alarm rings',
    goalId: 'goal_mind_reading',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    order: 5,
  },
];

export function generateSeedEntries(): Record<string, HabitEntry> {
  const entries: Record<string, HabitEntry> = {};
  const pastDays = getPastNDays(28); // 4 weeks of history
  const todayKey = getTodayKey();

  pastDays.forEach((dateKey, dayIdx) => {
    INITIAL_HABITS.forEach((habit, hIdx) => {
      if (dateKey === todayKey) {
        if (hIdx === 0) {
          const entryId = `${habit.id}_${dateKey}`;
          entries[entryId] = {
            id: entryId,
            habitId: habit.id,
            date: dateKey,
            status: 'completed',
            value: habit.targetValue,
            completedAt: `${dateKey}T07:22:00Z`,
          };
        }
        return;
      }

      const seedVal = (dayIdx * 7 + hIdx * 13) % 20;
      let status: 'completed' | 'missed' | 'skipped' = 'completed';
      let value = habit.targetValue;
      let note: string | undefined;

      if (seedVal === 3 || seedVal === 14) {
        status = 'missed';
        value = Math.floor(habit.targetValue * 0.3);
        note = 'Travel schedule / long meetings';
      } else if (seedVal === 9) {
        status = 'skipped';
        value = 0;
        note = 'Designated rest & recovery day';
      }

      const entryId = `${habit.id}_${dateKey}`;
      entries[entryId] = {
        id: entryId,
        habitId: habit.id,
        date: dateKey,
        status,
        value,
        notes: note,
        completedAt: status === 'completed' ? `${dateKey}T${habit.targetTime || '12:00'}:00Z` : undefined,
      };
    });
  });

  return entries;
}

export function generateSeedReflections(): Record<string, DailyReflection> {
  const reflections: Record<string, DailyReflection> = {};
  const pastDays = getPastNDays(14);
  const moods: ('great' | 'good' | 'neutral' | 'low')[] = ['great', 'good', 'great', 'good', 'neutral', 'great', 'good'];

  pastDays.forEach((dateKey, idx) => {
    const mood = moods[idx % moods.length];
    reflections[dateKey] = {
      date: dateKey,
      mood,
      energyLevel: (4 + (idx % 2)) as 4 | 5,
      note: idx === 13 ? 'Strong focus day, nailed the morning sunlight and deep work block early.' : 'Solid routine adherence.',
      highlight: 'Maintained consistency despite evening workload.',
    };
  });

  return reflections;
}

export function generateSeedFocusSessions(): import('../types/habit').FocusSession[] {
  const pastDays = getPastNDays(7);
  const sampleSessions: import('../types/habit').FocusSession[] = [];
  const titles = [
    { title: 'Deep Work Sprint', category: 'productivity' as const, minutes: 60 },
    { title: 'Study & System Architecture', category: 'learning' as const, minutes: 45 },
    { title: 'Focused Meditation', category: 'mind' as const, minutes: 15 },
    { title: 'Reading & Highlights', category: 'learning' as const, minutes: 30 },
  ];

  pastDays.forEach((dateKey, idx) => {
    // 1-2 sessions per day
    const session1 = titles[idx % titles.length];
    sampleSessions.push({
      id: `session_${dateKey}_1`,
      taskTitle: session1.title,
      category: session1.category,
      durationMinutes: session1.minutes,
      completedAt: `${dateKey}T10:00:00Z`,
      date: dateKey,
    });

    if (idx % 2 === 0) {
      const session2 = titles[(idx + 1) % titles.length];
      sampleSessions.push({
        id: `session_${dateKey}_2`,
        taskTitle: session2.title,
        category: session2.category,
        durationMinutes: session2.minutes,
        completedAt: `${dateKey}T15:30:00Z`,
        date: dateKey,
      });
    }
  });

  return sampleSessions;
}

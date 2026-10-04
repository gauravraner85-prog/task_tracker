export interface CustomCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
  isCustom?: boolean;
}

export type HabitCategory = string;

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime';

export type TargetType = 'boolean' | 'numeric' | 'timer';

export interface Habit {
  id: string;
  title: string;
  description?: string;
  category: HabitCategory;
  color: string; // e.g. 'emerald', 'sky', 'indigo', 'amber', 'rose', 'teal'
  icon: string; // Lucide icon identifier
  targetType: TargetType;
  targetValue: number; // 1 for boolean; numeric value (e.g. 2500 for ml, 30 for pages, 20 for mins)
  unit?: string; // 'ml', 'pages', 'mins', 'reps', 'km', etc.
  timeOfDay: TimeOfDay;
  targetTime?: string; // "07:30", "21:00"
  frequencyDays: number[]; // [0,1,2,3,4,5,6] (0=Sun, 6=Sat)
  cue?: string; // "Right after morning coffee"
  isOneTime?: boolean; // If true, only occurs on specificDate
  specificDate?: string; // YYYY-MM-DD for one-off tasks
  goalId?: string; // Linked parent target goal
  createdAt: string;
  archived?: boolean;
  order: number;
}

export type EntryStatus = 'completed' | 'missed' | 'skipped';

export interface HabitEntry {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  status: EntryStatus;
  value: number; // progress value achieved
  notes?: string;
  completedAt?: string;
}

export interface FocusSession {
  id: string;
  taskId?: string;
  taskTitle: string;
  category: HabitCategory;
  durationMinutes: number; // minutes spent focused
  completedAt: string; // ISO
  date: string; // YYYY-MM-DD
}

export interface DailyReflection {
  date: string; // YYYY-MM-DD
  mood?: 'great' | 'good' | 'neutral' | 'low' | 'tough' | 'energized' | 'focused' | 'calm' | 'tired' | 'stressed' | string;
  energyLevel?: 1 | 2 | 3 | 4 | 5 | 'low' | 'medium' | 'high' | number;
  note?: string;
  highlight?: string;
}

export interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate7d: number;
  completionRate30d: number;
  habitStrength: number; // 0-100%
  lastCompletedDate?: string;
}

export interface GoalNote {
  id: string;
  text: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: HabitCategory;
  color: string;
  startDate: string; // YYYY-MM-DD
  targetDate: string; // YYYY-MM-DD
  targetMetricCount: number; // target volume
  metricUnit: string; // "sessions", "check-ins", "hours", etc.
  durationDays?: number; // e.g. 7, 14, 30, 60, 90, 180 days
  status: 'active' | 'completed' | 'paused';
  linkedHabitIds?: string[];
  createdAt: string;
  notes?: GoalNote[];
}

export interface GoalAnalytics {
  daysTotal: number;
  daysPassed: number;
  daysRemaining: number;
  isOverdue: boolean;
  currentProgress: number;
  pendingCount: number;
  percentComplete: number;
  expectedPercent: number;
  paceStatus: 'ahead' | 'on_track' | 'delayed' | 'critical';
  delayDays: number;
}

export interface MotivationalCardData {
  id: string;
  title: string;
  quote: string;
  author: string;
  imagePath: string;
  categoryTag: string;
  reflectionPrompt: string;
}

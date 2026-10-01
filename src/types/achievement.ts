export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  category: 'streak' | 'completion' | 'focus' | 'special';
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  icon: string;
  conditionDescription: string;
  evaluate: (stats: {
    maxStreak: number;
    currentStreak: number;
    totalCompleted: number;
    totalFocusMinutes: number;
    totalGoals: number;
    totalReflections: number;
    totalCategories: number;
  }) => boolean;
  progress: (stats: {
    maxStreak: number;
    currentStreak: number;
    totalCompleted: number;
    totalFocusMinutes: number;
    totalGoals: number;
    totalReflections: number;
    totalCategories: number;
  }) => { current: number; target: number; percent: number };
}

export interface UserBadge {
  badgeId: string;
  unlockedAt: string;
}

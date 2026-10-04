import { Habit, CustomCategory } from '../types/habit';

export function resolveHabitVisuals(
  habit: Habit,
  categories: CustomCategory[] = []
): { icon: string; color: string; categoryLabel: string } {
  const cat = categories.find((c) => c.id === habit.category);
  const titleLower = (habit.title || '').toLowerCase();

  let autoIcon: string | undefined = cat?.icon;
  let autoColor: string | undefined = cat?.color;

  // Auto-detect based on title keywords if icon is default 'Target' or not set
  if (!habit.icon || habit.icon === 'Target') {
    if (
      titleLower.includes('dsa') ||
      titleLower.includes('code') ||
      titleLower.includes('leetcode') ||
      titleLower.includes('algo') ||
      titleLower.includes('react') ||
      titleLower.includes('python') ||
      titleLower.includes('sql') ||
      titleLower.includes('dev') ||
      titleLower.includes('program')
    ) {
      autoIcon = 'Code';
      autoColor = 'violet';
    } else if (
      titleLower.includes('interview') ||
      titleLower.includes('job') ||
      titleLower.includes('apply') ||
      titleLower.includes('applied') ||
      titleLower.includes('resume') ||
      titleLower.includes('career') ||
      titleLower.includes('hiring') ||
      titleLower.includes('portfolio') ||
      titleLower.includes('outreach')
    ) {
      autoIcon = 'Briefcase';
      autoColor = 'sky';
    } else if (
      titleLower.includes('read') ||
      titleLower.includes('book') ||
      titleLower.includes('study') ||
      titleLower.includes('course') ||
      titleLower.includes('learn') ||
      titleLower.includes('revise') ||
      titleLower.includes('revision')
    ) {
      autoIcon = 'BookOpen';
      autoColor = 'indigo';
    } else if (
      titleLower.includes('gym') ||
      titleLower.includes('workout') ||
      titleLower.includes('exercise') ||
      titleLower.includes('lift') ||
      titleLower.includes('run') ||
      titleLower.includes('steps') ||
      titleLower.includes('fitness') ||
      titleLower.includes('pushup')
    ) {
      autoIcon = 'Dumbbell';
      autoColor = 'rose';
    } else if (
      titleLower.includes('meditat') ||
      titleLower.includes('breath') ||
      titleLower.includes('journal') ||
      titleLower.includes('mind') ||
      titleLower.includes('reflect') ||
      titleLower.includes('peace')
    ) {
      autoIcon = 'Brain';
      autoColor = 'teal';
    } else if (
      titleLower.includes('water') ||
      titleLower.includes('hydrate') ||
      titleLower.includes('sun') ||
      titleLower.includes('sleep') ||
      titleLower.includes('wake') ||
      titleLower.includes('health')
    ) {
      autoIcon = 'Sun';
      autoColor = 'amber';
    } else if (
      titleLower.includes('money') ||
      titleLower.includes('save') ||
      titleLower.includes('invest') ||
      titleLower.includes('budget') ||
      titleLower.includes('finance')
    ) {
      autoIcon = 'Coins';
      autoColor = 'emerald';
    }
  }

  // If user explicitly chose a non-Target icon on the habit, honor it!
  const finalIcon =
    habit.icon && habit.icon !== 'Target'
      ? habit.icon
      : autoIcon || cat?.icon || 'CheckSquare';

  // Same for color
  const finalColor =
    habit.color && habit.color !== 'emerald'
      ? habit.color
      : autoColor || cat?.color || 'emerald';

  return {
    icon: finalIcon,
    color: finalColor,
    categoryLabel: cat?.label || habit.category || 'General',
  };
}

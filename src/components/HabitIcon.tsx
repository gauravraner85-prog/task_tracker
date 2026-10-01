import React from 'react';
import {
  Sun,
  Brain,
  Flame,
  Footprints,
  BookOpen,
  Moon,
  Droplets,
  Dumbbell,
  Sparkles,
  Heart,
  Coffee,
  CheckCircle2,
  Clock,
  Compass,
  Zap,
  Target,
  Smile,
  Shield,
  Activity,
  Briefcase,
  Code,
  Coins,
  Palette,
  Music,
  Laptop,
  GraduationCap,
  Folder,
  Rocket,
  Star,
  CheckSquare,
  TrendingUp,
  LucideProps,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  Sun,
  Brain,
  Flame,
  Footprints,
  BookOpen,
  Moon,
  Droplets,
  Dumbbell,
  Sparkles,
  Heart,
  Coffee,
  CheckCircle2,
  Clock,
  Compass,
  Zap,
  Target,
  Smile,
  Shield,
  Activity,
  Briefcase,
  Code,
  Coins,
  Palette,
  Music,
  Laptop,
  GraduationCap,
  Folder,
  Rocket,
  Star,
  CheckSquare,
  TrendingUp,
};

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);

interface HabitIconProps extends LucideProps {
  name: string;
}

export function HabitIcon({ name, ...props }: HabitIconProps) {
  const IconComponent = ICON_MAP[name] || Target;
  return <IconComponent {...props} />;
}

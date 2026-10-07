import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  CheckCircle2,
  Target,
  Calendar,
  BarChart3,
  Award,
  Tag,
  Settings,
  Plus,
  LogIn,
  Palette,
  Volume2,
  VolumeX,
  Rocket,
  ChevronDown,
  Clock,
  Brain,
} from 'lucide-react';
import { sound } from '../utils/audio';

export type AppTheme = 'dark' | 'greenish' | 'midnight' | 'slate' | 'amethyst' | 'ember';

interface SidebarProps {
  currentTab: 'today' | 'goals' | 'timer' | 'mindset' | 'week' | 'month' | 'analytics' | 'profile' | 'settings';
  onSelectTab: (tab: 'today' | 'goals' | 'timer' | 'mindset' | 'week' | 'month' | 'analytics' | 'profile' | 'settings') => void;
  user: User | null;
  unlockedBadgesCount: number;
  currentTheme: AppTheme;
  onSelectTheme: (theme: AppTheme) => void;
  onOpenAchievements: () => void;
  onOpenCategories: () => void;
  onOpenNewHabit: () => void;
  onOpenNewGoal: () => void;
  onLogin: () => void;
  onLogout: () => void;
  isTimerRunning?: boolean;
  timerFormatted?: string;
}

export function Sidebar({
  currentTab,
  onSelectTab,
  user,
  unlockedBadgesCount,
  currentTheme,
  onSelectTheme,
  onOpenAchievements,
  onOpenCategories,
  onOpenNewHabit,
  onLogin,
  isTimerRunning = false,
  timerFormatted = '00:00',
}: SidebarProps) {
  const [soundEnabled, setSoundEnabled] = useState(sound.enabled);
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);

  const toggleSound = () => {
    const newState = sound.toggleSound();
    setSoundEnabled(newState);
  };

  const navItems: {
    id: 'today' | 'goals' | 'week' | 'month' | 'analytics';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[] = [
    { id: 'today', label: 'Tasks', icon: CheckCircle2 },
    { id: 'goals', label: 'Targets', icon: Target },
    { id: 'week', label: 'Weekly Matrix', icon: Calendar },
    { id: 'month', label: 'Monthly Heatmap', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const themes: { id: AppTheme; label: string; color: string }[] = [
    { id: 'dark', label: 'Dark Forest', color: 'bg-neutral-800' },
    { id: 'greenish', label: 'Emerald Sage', color: 'bg-emerald-600' },
    { id: 'midnight', label: 'OLED Pure', color: 'bg-black border border-neutral-700' },
    { id: 'slate', label: 'Slate Teal', color: 'bg-teal-700' },
    { id: 'amethyst', label: 'Amethyst', color: 'bg-purple-700' },
    { id: 'ember', label: 'Crimson', color: 'bg-rose-700' },
  ];

  const currentThemeObj = themes.find((t) => t.id === currentTheme) || themes[0];

  return (
    <aside className="w-64 shrink-0 bg-neutral-950/80 backdrop-blur-md border-r border-neutral-800/80 flex flex-col h-screen sticky top-0 p-4 space-y-4 select-none z-30">
      {/* Brand Wordmark: Horizon */}
      <div className="flex items-center justify-between px-2 pt-1">
        <button
          onClick={() => onSelectTab('today')}
          className="flex items-center gap-2.5 group text-left focus:outline-none"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold group-hover:bg-emerald-500/20 transition-colors shadow-sm">
            <Rocket className="w-4 h-4 fill-emerald-400/20" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-neutral-100 group-hover:text-emerald-400 transition-colors block">
              Horizon
            </span>
            <span className="text-[10px] text-neutral-500 font-mono block -mt-0.5">
              Personal OS
            </span>
          </div>
        </button>

        {/* Audio feedback toggle */}
        <button
          type="button"
          onClick={toggleSound}
          title={soundEnabled ? 'Mute sound' : 'Enable sound'}
          className="w-7 h-7 rounded-lg border border-neutral-800 bg-neutral-900/60 flex items-center justify-center text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-neutral-500" />}
        </button>
      </div>

      {/* Primary CTA: New Task */}
      <div className="px-1">
        <button
          type="button"
          onClick={onOpenNewHabit}
          className="w-full py-2 px-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Task</span>
        </button>
      </div>

      {/* Main Workspace Navigation */}
      <div className="space-y-1 flex-1 overflow-y-auto pr-1 scrollbar-none">
        <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 px-3 block py-1">
          Menu
        </span>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-neutral-500'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold shrink-0 animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Utilities */}
        <div className="pt-3 border-t border-neutral-800/80 space-y-1">
          <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 px-3 block py-1">
            System
          </span>

          {/* Honors & Badges */}
          <button
            onClick={onOpenAchievements}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Honors & Badges</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
              {unlockedBadgesCount}
            </span>
          </button>

          {/* Categories */}
          <button
            onClick={onOpenCategories}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60 transition-colors"
          >
            <Tag className="w-4 h-4 text-indigo-400" />
            <span>Manage Categories</span>
          </button>

          {/* Settings Tab */}
          <button
            onClick={() => onSelectTab('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              currentTab === 'settings'
                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>

        {/* Clean Theme Palette Popover Selector (Doesn't show directly to save space) */}
        <div className="pt-3 border-t border-neutral-800/80 px-1">
          <button
            type="button"
            onClick={() => setIsThemePickerOpen(!isThemePickerOpen)}
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60 transition-all border border-transparent hover:border-neutral-800"
          >
            <div className="flex items-center gap-2">
              <Palette className="w-3.5 h-3.5 text-emerald-400" />
              <span>Theme Palette</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${currentThemeObj.color}`} />
              <ChevronDown className={`w-3 h-3 text-neutral-500 transition-transform ${isThemePickerOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {isThemePickerOpen && (
            <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2 mt-1.5 shadow-xl">
              <span className="text-[10px] uppercase font-mono text-neutral-400 block px-1">
                Choose Color Palette
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {themes.map((t) => {
                  const isSelected = currentTheme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        onSelectTheme(t.id);
                        setIsThemePickerOpen(false);
                      }}
                      className={`p-2 rounded-lg border text-left transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'border-emerald-500 bg-neutral-950 text-emerald-300 font-bold ring-1 ring-emerald-500/40'
                          : 'border-neutral-850 bg-neutral-950/60 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${t.color} shrink-0`} />
                      <span className="text-[10px] font-mono leading-none truncate">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Profile / Account Card */}
      <div className="pt-3 border-t border-neutral-800/80">
        {user ? (
          <button
            onClick={() => onSelectTab('profile')}
            className={`w-full p-2.5 rounded-xl border flex items-center gap-3 text-left transition-all ${
              currentTab === 'profile'
                ? 'bg-emerald-500/10 border-emerald-500/40'
                : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                className="w-8 h-8 rounded-full object-cover border border-emerald-500/40"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center justify-center">
                {user.email?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold text-neutral-200 block truncate">
                {user.displayName || 'Profile'}
              </span>
              <span className="text-[10px] text-neutral-500 font-mono block truncate">
                {user.email}
              </span>
            </div>
          </button>
        ) : (
          <button
            onClick={onLogin}
            className="w-full py-2 px-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-emerald-500/40 text-emerald-400 hover:text-emerald-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </aside>
  );
}

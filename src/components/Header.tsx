import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  MoreHorizontal,
  Plus,
  Volume2,
  VolumeX,
  RotateCcw,
  Download,
  Target,
  Award,
  Settings,
  LogIn,
  LogOut,
  Tag,
  CheckCircle2,
  Calendar,
  BarChart3,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface HeaderProps {
  currentTab: 'today' | 'goals' | 'week' | 'month' | 'analytics' | 'mindset' | 'profile' | 'settings';
  onSelectTab: (tab: 'today' | 'goals' | 'week' | 'month' | 'analytics' | 'mindset' | 'profile' | 'settings') => void;
  user: User | null;
  unlockedBadgesCount: number;
  onOpenAchievements: () => void;
  onOpenSettings?: () => void;
  onOpenNewHabit: () => void;
  onOpenNewGoal: () => void;
  onOpenCategories: () => void;
  onLogin: () => void;
  onLogout: () => void;
  onResetData: () => void;
  onExportData: () => void;
}

export function Header({
  currentTab,
  onSelectTab,
  user,
  unlockedBadgesCount,
  onOpenAchievements,
  onOpenNewHabit,
  onOpenNewGoal,
  onOpenCategories,
  onLogin,
  onLogout,
  onResetData,
  onExportData,
}: HeaderProps) {
  const [soundEnabled, setSoundEnabled] = useState(sound.enabled);
  const [showThreeDotsMenu, setShowThreeDotsMenu] = useState(false);

  const toggleSound = () => {
    const newState = sound.toggleSound();
    setSoundEnabled(newState);
  };

  const navItems = [
    { id: 'today' as const, label: 'Tasks' },
    { id: 'goals' as const, label: '3-Month Targets' },
    { id: 'week' as const, label: 'Weekly Matrix' },
    { id: 'month' as const, label: 'Monthly Heatmap' },
    { id: 'analytics' as const, label: 'Analytics' },
    { id: 'mindset' as const, label: 'Mindset & Visuals' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/80 px-4 lg:px-8 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand Wordmark (No hamburger menu on left!) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectTab('today')}
            className="text-left group flex items-center gap-2.5 focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-semibold group-hover:bg-emerald-500/20 transition-colors">
              木
            </div>
            <span className="text-base md:text-lg font-bold tracking-tight text-neutral-100 group-hover:text-emerald-400 transition-colors">
              Komorebi
            </span>
          </button>
        </div>

        {/* Center: All Navigation Menus */}
        <nav className="hidden md:flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none">
          {navItems.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-neutral-800/90 text-neutral-100 shadow-sm border border-neutral-700/60 font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right Side: 3 Dots Menu -> New Task -> Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* 1. THREE DOTS MENU (Positioned right after all menu items finished) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowThreeDotsMenu(!showThreeDotsMenu)}
              aria-label="More options"
              title="More Options & System Menu"
              className={`w-8 h-8 rounded-lg border transition-colors flex items-center justify-center text-xs ${
                showThreeDotsMenu
                  ? 'border-emerald-500 bg-neutral-850 text-emerald-400'
                  : 'border-neutral-800 bg-neutral-900/70 hover:bg-neutral-850 text-neutral-300 hover:text-white'
              }`}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {/* 3 Dots Dropdown Menu */}
            {showThreeDotsMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowThreeDotsMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl z-50 p-1.5 text-xs text-neutral-300 divide-y divide-neutral-800/80 animate-in fade-in zoom-in-95 duration-150">
                  {/* Primary Pages Shortcuts */}
                  <div className="p-1 space-y-0.5">
                    <button
                      onClick={() => {
                        setShowThreeDotsMenu(false);
                        onSelectTab('profile');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-800 flex items-center gap-2.5 text-neutral-200 hover:text-white transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-emerald-400" />
                      <span>User Profile Page</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowThreeDotsMenu(false);
                        onSelectTab('settings');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-800 flex items-center gap-2.5 text-neutral-200 hover:text-white transition-colors"
                    >
                      <Settings className="w-4 h-4 text-indigo-400" />
                      <span>Settings & Themes Page</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowThreeDotsMenu(false);
                        onOpenAchievements();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-800 flex items-center justify-between text-neutral-200 hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Award className="w-4 h-4 text-amber-400" />
                        <span>Honors & Badges</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                        {unlockedBadgesCount}
                      </span>
                    </button>
                  </div>

                  {/* Actions & Tools */}
                  <div className="p-1 space-y-0.5">
                    <button
                      onClick={() => {
                        setShowThreeDotsMenu(false);
                        onOpenNewGoal();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-800 flex items-center gap-2.5 text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <Target className="w-4 h-4" />
                      <span>+ New 3-Month Target</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowThreeDotsMenu(false);
                        onOpenCategories();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-800 flex items-center gap-2.5 text-neutral-300 hover:text-white transition-colors"
                    >
                      <Tag className="w-4 h-4 text-neutral-400" />
                      <span>Manage Categories</span>
                    </button>
                    <button
                      onClick={() => {
                        toggleSound();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-800 flex items-center justify-between text-neutral-300 hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        {soundEnabled ? (
                          <Volume2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <VolumeX className="w-4 h-4 text-neutral-500" />
                        )}
                        <span>Tactile Sound</span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-500">
                        {soundEnabled ? 'ON' : 'OFF'}
                      </span>
                    </button>
                  </div>

                  {/* Data & Backup */}
                  <div className="p-1 space-y-0.5">
                    <button
                      onClick={() => {
                        setShowThreeDotsMenu(false);
                        onExportData();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-800 flex items-center gap-2.5 text-neutral-300 hover:text-white transition-colors"
                    >
                      <Download className="w-4 h-4 text-neutral-400" />
                      <span>Export JSON Backup</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowThreeDotsMenu(false);
                        if (confirm('Reset to starter demo tasks, 3-month targets, and check-ins?')) {
                          onResetData();
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-800 flex items-center gap-2.5 text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset Starter Demo Data</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 2. NEW TASK PRIMARY CTA BUTTON */}
          <button
            type="button"
            onClick={onOpenNewHabit}
            className="flex items-center gap-1.5 px-3 md:px-3.5 py-1.5 text-xs font-bold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm active:scale-[0.98] whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span className="hidden sm:inline">New Task</span>
            <span className="sm:hidden">Add</span>
          </button>

          {/* 3. PROFILE BUTTON (Placed after New Task) */}
          {user ? (
            <button
              type="button"
              onClick={() => onSelectTab('profile')}
              title={`View Profile (${user.displayName || user.email})`}
              className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all shrink-0 relative ${
                currentTab === 'profile'
                  ? 'border-emerald-400 ring-2 ring-emerald-400/30'
                  : 'border-emerald-500/50 hover:border-emerald-400'
              }`}
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Avatar'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center justify-center">
                  {user.email?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onSelectTab('profile')}
              title="Open Profile Page"
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                currentTab === 'profile'
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
              }`}
            >
              <UserIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, loginWithGoogle, logoutUser } from './firebase';
import { Habit, HabitEntry, DailyReflection, Goal, GoalNote, FocusSession, CustomCategory } from './types/habit';
import { UserBadge } from './types/achievement';
import { BADGE_DEFINITIONS } from './utils/achievements';
import {
  loadHabits,
  saveHabits,
  loadGoals,
  saveGoals,
  loadEntries,
  saveEntries,
  loadReflections,
  saveReflections,
  loadFocusSessions,
  saveFocusSessions,
  loadCategories,
  saveCategories,
  resetToSeedData,
  exportBackupJSON,
} from './utils/storage';
import {
  syncInitialUserDataIfEmpty,
  subscribeToUserData,
  saveHabitToFirestore,
  deleteHabitFromFirestore,
  saveGoalToFirestore,
  saveEntryToFirestore,
  saveFocusSessionToFirestore,
  saveReflectionToFirestore,
  saveCategoryToFirestore,
  deleteCategoryFromFirestore,
  saveAchievementToFirestore,
} from './utils/firestoreSync';
import { getTodayKey } from './utils/date';
import { sound } from './utils/audio';
import { fireConfetti } from './utils/confetti';
import { Header } from './components/Header';
import { TodayView } from './components/TodayView';
import { GoalsView } from './components/GoalsView';
import { WeekView } from './components/WeekView';
import { MonthView } from './components/MonthView';
import { AnalyticsView } from './components/AnalyticsView';
import { MindsetHub } from './components/MindsetHub';
import { HabitFormModal } from './components/HabitFormModal';
import { GoalFormModal } from './components/GoalFormModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { FocusTrackerModal } from './components/FocusTrackerModal';
import { MissedReasonModal } from './components/MissedReasonModal';
import { AchievementsModal } from './components/AchievementsModal';
import { SettingsModal } from './components/SettingsModal';
import { ProfileView } from './components/ProfileView';
import { SettingsView } from './components/SettingsView';
import { LoginView } from './components/LoginView';
import { CheckCircle2, Target, Calendar, BarChart3, Sparkles } from 'lucide-react';

export default function App() {
  // Authentication & Guest State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [guestMode, setGuestMode] = useState(false);

  // App Data
  const [categories, setCategories] = useState<CustomCategory[]>(() => loadCategories());
  const [habits, setHabits] = useState<Habit[]>(() => loadHabits());
  const [goals, setGoals] = useState<Goal[]>(() => loadGoals());
  const [entries, setEntries] = useState<Record<string, HabitEntry>>(() => loadEntries());
  const [reflections, setReflections] = useState<Record<string, DailyReflection>>(() => loadReflections());
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(() => loadFocusSessions());
  const [unlockedBadges, setUnlockedBadges] = useState<Record<string, UserBadge>>({});

  // Navigation & Date
  const [currentTab, setCurrentTab] = useState<'today' | 'goals' | 'week' | 'month' | 'analytics' | 'mindset' | 'profile' | 'settings'>('today');
  const [selectedDateKey, setSelectedDateKey] = useState<string>(() => getTodayKey());

  // Preferences & Settings
  const [settings, setSettings] = useState<{
    soundEnabled: boolean;
    confettiEnabled: boolean;
    theme: 'dark' | 'midnight' | 'slate';
    compactMode: boolean;
  }>({
    soundEnabled: true,
    confettiEnabled: true,
    theme: 'dark',
    compactMode: false,
  });

  // Modals state
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFocusTrackerOpen, setIsFocusTrackerOpen] = useState(false);
  const [focusTask, setFocusTask] = useState<Habit | null>(null);
  const [missedModalState, setMissedModalState] = useState<{
    habit: Habit;
    mode: 'missed' | 'skipped';
  } | null>(null);

  // Firebase Auth Observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthInitialized(true);
    });
    return () => unsubscribe();
  }, []);

  // Firebase Firestore Real-Time Sync when logged in
  useEffect(() => {
    if (!currentUser) return;

    let isMounted = true;
    syncInitialUserDataIfEmpty(currentUser.uid).then(() => {
      if (!isMounted) return;
    });

    const unsubscribe = subscribeToUserData(currentUser.uid, {
      onHabits: (nextHabits) => setHabits(nextHabits),
      onGoals: (nextGoals) => setGoals(nextGoals),
      onEntries: (nextEntries) => setEntries(nextEntries),
      onFocusSessions: (nextSessions) => setFocusSessions(nextSessions),
      onReflections: (nextReflections) => setReflections(nextReflections),
      onCategories: (nextCategories) => setCategories(nextCategories),
      onAchievements: (nextBadges) => setUnlockedBadges(nextBadges),
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [currentUser]);

  // Overall Statistics for Achievements
  const totalCompleted = Object.values(entries).filter((e) => e.status === 'completed').length;
  let maxActiveStreak = 0;
  habits.forEach((h) => {
    let count = 0;
    Object.values(entries).forEach((e) => {
      if (e.habitId === h.id && e.status === 'completed') count++;
    });
    if (count > maxActiveStreak) maxActiveStreak = count;
  });

  const totalFocusMinutes = focusSessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  const stats = {
    maxStreak: maxActiveStreak,
    currentStreak: maxActiveStreak,
    totalCompleted,
    totalFocusMinutes,
    totalGoals: goals.length,
    totalReflections: Object.keys(reflections).length,
    totalCategories: categories.length,
  };

  // Evaluate & Award Badges
  useEffect(() => {
    BADGE_DEFINITIONS.forEach((badge) => {
      if (!unlockedBadges[badge.id] && badge.evaluate(stats)) {
        const newBadge: UserBadge = {
          badgeId: badge.id,
          unlockedAt: new Date().toISOString(),
        };
        const next = { ...unlockedBadges, [badge.id]: newBadge };
        setUnlockedBadges(next);
        sound.playCelebration();
        if (settings.confettiEnabled) fireConfetti();

        if (currentUser) {
          saveAchievementToFirestore(currentUser.uid, badge.id);
        }
      }
    });
  }, [stats.totalCompleted, stats.maxStreak, stats.totalFocusMinutes, stats.totalGoals, stats.totalReflections]);

  // Toggle habit / task completion
  const handleToggleComplete = (habit: Habit, value?: number, targetDateKey: string = selectedDateKey) => {
    const entryId = `${habit.id}_${targetDateKey}`;
    const existing = entries[entryId];

    const targetVal = value !== undefined ? value : habit.targetValue;
    const isCompleted = targetVal >= habit.targetValue;

    const updatedEntry: HabitEntry = {
      id: entryId,
      habitId: habit.id,
      date: targetDateKey,
      status: isCompleted ? 'completed' : 'missed',
      value: targetVal,
      completedAt: isCompleted ? new Date().toISOString() : undefined,
      notes: existing?.notes,
    };

    const nextEntries = {
      ...entries,
      [entryId]: updatedEntry,
    };

    setEntries(nextEntries);
    saveEntries(nextEntries);

    if (currentUser) {
      saveEntryToFirestore(currentUser.uid, updatedEntry);
    }

    if (isCompleted && targetDateKey === getTodayKey()) {
      const todayDate = new Date();
      const todayDayOfWeek = todayDate.getDay();
      const todayHabits = habits.filter((h) => {
        if (h.archived) return false;
        if (h.isOneTime) return h.specificDate === targetDateKey;
        return h.frequencyDays.includes(todayDayOfWeek);
      });

      const allDone = todayHabits.every((h) => {
        if (h.id === habit.id) return true;
        const e = nextEntries[`${h.id}_${targetDateKey}`];
        return e && e.status === 'completed';
      });

      if (allDone && todayHabits.length > 0) {
        sound.playCelebration();
        if (settings.confettiEnabled) fireConfetti();
      }
    }
  };

  // Quick Task Add
  const handleQuickAddTask = (title: string) => {
    const defaultCat = categories[0]?.id || 'productivity';
    const newTask: Habit = {
      id: `task_${Date.now()}`,
      title,
      category: defaultCat,
      color: 'emerald',
      icon: 'Target',
      targetType: 'boolean',
      targetValue: 1,
      timeOfDay: 'anytime',
      frequencyDays: [0, 1, 2, 3, 4, 5, 6],
      isOneTime: true,
      specificDate: selectedDateKey,
      createdAt: new Date().toISOString(),
      order: habits.length,
    };
    const nextHabits = [...habits, newTask];
    setHabits(nextHabits);
    saveHabits(nextHabits);
    if (currentUser) saveHabitToFirestore(currentUser.uid, newTask);
    sound.playCheck();
  };

  const handleMarkMissed = (habit: Habit) => {
    setMissedModalState({ habit, mode: 'missed' });
  };

  const handleMarkSkipped = (habit: Habit) => {
    setMissedModalState({ habit, mode: 'skipped' });
  };

  const handleConfirmMissedOrSkipped = (reason: string) => {
    if (!missedModalState) return;
    const { habit, mode } = missedModalState;
    const entryId = `${habit.id}_${selectedDateKey}`;

    const updatedEntry: HabitEntry = {
      id: entryId,
      habitId: habit.id,
      date: selectedDateKey,
      status: mode,
      value: 0,
      notes: reason,
    };

    const nextEntries = {
      ...entries,
      [entryId]: updatedEntry,
    };

    setEntries(nextEntries);
    saveEntries(nextEntries);
    if (currentUser) saveEntryToFirestore(currentUser.uid, updatedEntry);
    setMissedModalState(null);
  };

  const handleSaveHabit = (habitData: Omit<Habit, 'id' | 'createdAt' | 'order'> & { id?: string }) => {
    let nextHabits: Habit[];
    let savedHabit: Habit;
    if (habitData.id) {
      savedHabit = { ...habits.find((h) => h.id === habitData.id)!, ...habitData };
      nextHabits = habits.map((h) => (h.id === habitData.id ? savedHabit : h));
    } else {
      savedHabit = {
        ...habitData,
        id: `task_${Date.now()}`,
        createdAt: new Date().toISOString(),
        order: habits.length,
      };
      nextHabits = [...habits, savedHabit];
      sound.playCheck();
    }

    setHabits(nextHabits);
    saveHabits(nextHabits);
    if (currentUser) saveHabitToFirestore(currentUser.uid, savedHabit);
    setIsHabitModalOpen(false);
    setEditingHabit(null);
  };

  const handleDeleteHabit = (habitId: string) => {
    const nextHabits = habits.filter((h) => h.id !== habitId);
    setHabits(nextHabits);
    saveHabits(nextHabits);
    if (currentUser) deleteHabitFromFirestore(currentUser.uid, habitId);
  };

  const handleSaveGoal = (goalData: Omit<Goal, 'id' | 'createdAt'> & { id?: string }) => {
    let nextGoals: Goal[];
    let savedGoal: Goal;
    if (goalData.id) {
      savedGoal = { ...goals.find((g) => g.id === goalData.id)!, ...goalData };
      nextGoals = goals.map((g) => (g.id === goalData.id ? savedGoal : g));
    } else {
      savedGoal = {
        ...goalData,
        id: `goal_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      nextGoals = [...goals, savedGoal];
      sound.playCheck();
    }

    setGoals(nextGoals);
    saveGoals(nextGoals);
    if (currentUser) saveGoalToFirestore(currentUser.uid, savedGoal);
    setIsGoalModalOpen(false);
    setEditingGoal(null);
  };

  const handleSaveCategory = (newCat: CustomCategory) => {
    const nextCategories = [...categories, newCat];
    setCategories(nextCategories);
    saveCategories(nextCategories);
    if (currentUser) saveCategoryToFirestore(currentUser.uid, newCat);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const nextCategories = categories.filter((c) => c.id !== categoryId);
    setCategories(nextCategories);
    saveCategories(nextCategories);
    if (currentUser) deleteCategoryFromFirestore(currentUser.uid, categoryId);
  };

  const handleSaveFocusSession = (sessionData: Omit<FocusSession, 'id' | 'completedAt'>) => {
    const newSession: FocusSession = {
      ...sessionData,
      id: `session_${Date.now()}`,
      completedAt: new Date().toISOString(),
    };
    const nextSessions = [newSession, ...focusSessions];
    setFocusSessions(nextSessions);
    saveFocusSessions(nextSessions);
    if (currentUser) saveFocusSessionToFirestore(currentUser.uid, newSession);
  };

  const handleSaveReflection = (dateKey: string, reflectionData: Partial<DailyReflection>) => {
    const existing = reflections[dateKey] || { date: dateKey };
    const nextReflection: DailyReflection = {
      ...existing,
      ...reflectionData,
      date: dateKey,
    };
    const nextReflections = {
      ...reflections,
      [dateKey]: nextReflection,
    };
    setReflections(nextReflections);
    saveReflections(nextReflections);
    if (currentUser) saveReflectionToFirestore(currentUser.uid, nextReflection);
  };

  const handleResetData = () => {
    const data = resetToSeedData();
    setCategories(data.categories);
    setHabits(data.habits);
    setGoals(data.goals);
    setEntries(data.entries);
    setReflections(data.reflections);
    setFocusSessions(data.focusSessions);
    setSelectedDateKey(getTodayKey());
    sound.playCheck();
  };

  const handleExportData = () => {
    const jsonStr = exportBackupJSON(habits, goals, entries, reflections, focusSessions, categories);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `komorebi_execution_backup_${getTodayKey()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleLogout = async () => {
    await logoutUser();
    setIsSettingsOpen(false);
  };

  // If user is not authenticated and hasn't selected guest demo mode, show dedicated login gate!
  if (authInitialized && !currentUser && !guestMode) {
    return <LoginView onEnterGuestMode={() => setGuestMode(true)} />;
  }

  // Theme styling background
  const themeBg =
    settings.theme === 'midnight'
      ? 'bg-[#080d1a]'
      : settings.theme === 'slate'
      ? 'bg-[#050f0c]'
      : 'bg-neutral-950';

  return (
    <div className={`min-h-screen ${themeBg} text-neutral-100 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-300 transition-colors duration-300`}>
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        user={currentUser}
        unlockedBadgesCount={Object.keys(unlockedBadges).length}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenNewHabit={() => {
          setEditingHabit(null);
          setIsHabitModalOpen(true);
        }}
        onOpenNewGoal={() => {
          setEditingGoal(null);
          setIsGoalModalOpen(true);
        }}
        onOpenCategories={() => setIsCategoryModalOpen(true)}
        onLogin={() => loginWithGoogle()}
        onLogout={handleLogout}
        onResetData={handleResetData}
        onExportData={handleExportData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-5 pb-24 md:pb-10">
        {currentTab === 'today' && (
          <TodayView
            habits={habits}
            goals={goals}
            entries={entries}
            focusSessions={focusSessions}
            reflections={reflections}
            selectedDateKey={selectedDateKey}
            onSelectDateKey={setSelectedDateKey}
            onToggleComplete={handleToggleComplete}
            onQuickAddTask={handleQuickAddTask}
            onMarkMissed={handleMarkMissed}
            onMarkSkipped={handleMarkSkipped}
            onOpenTimer={(habit) => {
              setFocusTask(habit || null);
              setIsFocusTrackerOpen(true);
            }}
            onSaveFocusSession={handleSaveFocusSession}
            onEditHabit={(habit) => {
              setEditingHabit(habit);
              setIsHabitModalOpen(true);
            }}
            onDeleteHabit={handleDeleteHabit}
            onSaveReflection={handleSaveReflection}
            onOpenNewHabit={() => {
              setEditingHabit(null);
              setIsHabitModalOpen(true);
            }}
            onOpenNewGoal={() => {
              setEditingGoal(null);
              setIsGoalModalOpen(true);
            }}
            onGoToGoalsTab={() => setCurrentTab('goals')}
            onGoToMindsetTab={() => setCurrentTab('mindset')}
            onGoToAnalyticsTab={() => setCurrentTab('analytics')}
          />
        )}

        {currentTab === 'goals' && (
          <GoalsView
            goals={goals}
            habits={habits}
            entries={entries}
            selectedDateKey={selectedDateKey}
            onOpenNewGoal={() => {
              setEditingGoal(null);
              setIsGoalModalOpen(true);
            }}
            onEditGoal={(goal) => {
              setEditingGoal(goal);
              setIsGoalModalOpen(true);
            }}
            onOpenNewHabitForGoal={(goalId) => {
              const targetGoal = goals.find((g) => g.id === goalId);
              setEditingHabit({
                id: '',
                title: '',
                category: targetGoal?.category || categories[0]?.id || 'productivity',
                color: 'emerald',
                icon: 'Target',
                targetType: 'boolean',
                targetValue: 1,
                timeOfDay: 'anytime',
                frequencyDays: [0, 1, 2, 3, 4, 5, 6],
                goalId,
                order: habits.length,
                createdAt: new Date().toISOString(),
              });
              setIsHabitModalOpen(true);
            }}
            onToggleComplete={handleToggleComplete}
            onSaveGoalNotes={(goalId, noteText) => {
              const updatedGoals = goals.map((g) => {
                if (g.id !== goalId) return g;
                const newNote: GoalNote = {
                  id: `note_${Date.now()}`,
                  text: noteText,
                  createdAt: new Date().toISOString(),
                };
                return {
                  ...g,
                  notes: [newNote, ...(g.notes || [])],
                };
              });
              setGoals(updatedGoals);
              saveGoals(updatedGoals);
              const targetGoal = updatedGoals.find((g) => g.id === goalId);
              if (targetGoal && currentUser) {
                saveGoalToFirestore(currentUser.uid, targetGoal);
              }
            }}
          />
        )}

        {currentTab === 'week' && (
          <WeekView
            habits={habits}
            entries={entries}
            onToggleComplete={handleToggleComplete}
            onOpenNewHabit={() => {
              setEditingHabit(null);
              setIsHabitModalOpen(true);
            }}
          />
        )}

        {currentTab === 'month' && (
          <MonthView
            habits={habits}
            entries={entries}
            onSelectDate={(dateKey) => {
              setSelectedDateKey(dateKey);
              setCurrentTab('today');
            }}
            onOpenNewHabit={() => {
              setEditingHabit(null);
              setIsHabitModalOpen(true);
            }}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView
            habits={habits}
            entries={entries}
            onOpenNewHabit={() => {
              setEditingHabit(null);
              setIsHabitModalOpen(true);
            }}
          />
        )}

        {currentTab === 'mindset' && (
          <MindsetHub
            totalCompletions={totalCompleted}
            longestStreak={maxActiveStreak}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileView
            user={currentUser}
            habits={habits}
            goals={goals}
            entries={entries}
            focusSessions={focusSessions}
            unlockedBadges={unlockedBadges}
            onLogin={() => loginWithGoogle()}
            onLogout={handleLogout}
            onExportData={handleExportData}
            onResetData={handleResetData}
            onGoToSettings={() => setCurrentTab('settings')}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            user={currentUser}
            settings={settings}
            categories={categories}
            onUpdateSettings={(newSettings) => setSettings((prev) => ({ ...prev, ...newSettings }))}
            onOpenCategories={() => setIsCategoryModalOpen(true)}
            onLogout={handleLogout}
            onExportData={handleExportData}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Mobile Ergonomic Bottom Tab Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/90 backdrop-blur-md border-t border-neutral-800 grid grid-cols-5 items-center h-16 px-1">
        {[
          { id: 'today', label: 'Tasks', icon: CheckCircle2 },
          { id: 'goals', label: 'Targets', icon: Target },
          { id: 'week', label: 'Week', icon: Calendar },
          { id: 'analytics', label: 'Stats', icon: BarChart3 },
          { id: 'mindset', label: 'Mindset', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id as typeof currentTab)}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
                isActive ? 'text-emerald-400 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-1 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Achievements Digital Badges Modal */}
      {isAchievementsOpen && (
        <AchievementsModal
          unlockedBadges={unlockedBadges}
          stats={stats}
          onClose={() => setIsAchievementsOpen(false)}
        />
      )}

      {/* Preferences & Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          user={currentUser}
          settings={settings}
          onUpdateSettings={(newSettings) => setSettings((prev) => ({ ...prev, ...newSettings }))}
          onLogout={handleLogout}
          onExportData={handleExportData}
          onResetData={handleResetData}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Task Create / Edit Modal */}
      {isHabitModalOpen && (
        <HabitFormModal
          initialHabit={editingHabit}
          goals={goals}
          categories={categories}
          onClose={() => {
            setIsHabitModalOpen(false);
            setEditingHabit(null);
          }}
          onOpenCategoryManager={() => setIsCategoryModalOpen(true)}
          onSave={handleSaveHabit}
        />
      )}

      {/* Category Manager Modal */}
      {isCategoryModalOpen && (
        <CategoryManagerModal
          categories={categories}
          onClose={() => setIsCategoryModalOpen(false)}
          onSaveCategory={handleSaveCategory}
          onDeleteCategory={handleDeleteCategory}
        />
      )}

      {/* Target Goal Modal */}
      {isGoalModalOpen && (
        <GoalFormModal
          initialGoal={editingGoal}
          habits={habits}
          onClose={() => {
            setIsGoalModalOpen(false);
            setEditingGoal(null);
          }}
          onSave={handleSaveGoal}
        />
      )}

      {/* Study & Focus Tracker Modal */}
      {isFocusTrackerOpen && (
        <FocusTrackerModal
          tasks={habits}
          activeTask={focusTask}
          sessions={focusSessions}
          onClose={() => {
            setIsFocusTrackerOpen(false);
            setFocusTask(null);
          }}
          onSaveSession={handleSaveFocusSession}
          onCompleteTask={(task) => {
            handleToggleComplete(task, task.targetValue);
          }}
        />
      )}

      {/* Missed / Skipped Reason Modal */}
      {missedModalState && (
        <MissedReasonModal
          habit={missedModalState.habit}
          mode={missedModalState.mode}
          onClose={() => setMissedModalState(null)}
          onConfirm={handleConfirmMissedOrSkipped}
        />
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Habit, FocusSession } from '../types/habit';
import { sound } from '../utils/audio';
import {
  Play,
  Pause,
  RotateCcw,
  Maximize,
  Minimize,
  Clock,
  Sparkles,
  Flame,
  CheckCircle2,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';

interface TimerViewProps {
  habits: Habit[];
  activeHabitId?: string | null;
  isRunning: boolean;
  mode: 'pomodoro' | 'countdown' | 'stopwatch';
  timeRemaining: number;
  totalDuration: number;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onSetMode: (mode: 'pomodoro' | 'countdown' | 'stopwatch') => void;
  onSetDuration: (minutes: number) => void;
  onSelectHabit: (habitId: string | null) => void;
  onCompleteSession: (durationMinutes: number, habitId?: string) => void;
  pastSessions: FocusSession[];
}

export function TimerView({
  habits,
  activeHabitId,
  isRunning,
  mode,
  timeRemaining,
  totalDuration,
  onToggleTimer,
  onResetTimer,
  onSetMode,
  onSetDuration,
  onSelectHabit,
  onCompleteSession,
  pastSessions,
}: TimerViewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundMuted, setSoundMuted] = useState(!sound.enabled);

  // Keyboard shortcut: Space to toggle, F for fullscreen, Esc to exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        onToggleTimer();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        setIsFullscreen((prev) => !prev);
      } else if (e.code === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleTimer, isFullscreen]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = totalDuration > 0
    ? Math.min(100, Math.max(0, ((totalDuration - timeRemaining) / totalDuration) * 100))
    : 0;

  const activeHabit = habits.find((h) => h.id === activeHabitId);
  const todaySessions = pastSessions.filter((s) => {
    const today = new Date().toISOString().split('T')[0];
    return s.date === today;
  });
  const todayTotalMins = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  // Zen Fullscreen Environment
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black text-neutral-100 flex flex-col justify-between p-8 sm:p-12 select-none animate-fade-in">
        {/* Fullscreen Top Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-neutral-200">
                Zen Focus Mode · Background Active
              </span>
              <p className="text-xs text-neutral-500 font-mono">
                {activeHabit ? `Focusing on: ${activeHabit.title}` : 'General Deep Work Session'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const next = sound.toggleSound();
                setSoundMuted(!next);
              }}
              className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
            >
              {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              onClick={() => setIsFullscreen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-mono transition-colors"
            >
              <Minimize className="w-4 h-4" />
              <span>Exit Fullscreen (Esc)</span>
            </button>
          </div>
        </div>

        {/* Center Massive Digits */}
        <div className="flex flex-col items-center justify-center my-auto space-y-6">
          <div className="relative flex items-center justify-center">
            {/* Glowing aura */}
            <div className="absolute w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

            <div className="text-7xl sm:text-9xl md:text-[13rem] font-mono font-black tracking-tighter text-white tabular-nums select-none drop-shadow-[0_0_35px_rgba(52,211,153,0.3)]">
              {formatTime(timeRemaining)}
            </div>
          </div>

          {/* Progress bar in fullscreen */}
          {mode !== 'stopwatch' && (
            <div className="w-full max-w-xl h-2 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}

          {/* Action controls */}
          <div className="flex items-center gap-4 pt-4">
            <button
              onClick={onResetTimer}
              className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-6 h-6" />
            </button>

            <button
              onClick={onToggleTimer}
              className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all shadow-xl active:scale-95 ${
                isRunning
                  ? 'bg-amber-400 text-neutral-950 hover:bg-amber-300'
                  : 'bg-emerald-400 text-neutral-950 hover:bg-emerald-300 shadow-emerald-500/30'
              }`}
            >
              {isRunning ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
            </button>

            {mode !== 'stopwatch' && timeRemaining === 0 && (
              <button
                onClick={() => onCompleteSession(Math.round(totalDuration / 60), activeHabitId || undefined)}
                className="px-5 py-4 rounded-2xl bg-emerald-500 text-neutral-950 font-bold text-sm flex items-center gap-2 shadow-lg"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Save Completed</span>
              </button>
            )}
          </div>
        </div>

        {/* Fullscreen Bottom Hint */}
        <div className="text-center text-xs text-neutral-600 font-mono">
          Press Space to {isRunning ? 'Pause' : 'Resume'} · Runs continuously in background
        </div>
      </div>
    );
  }

  // Standard Page View
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-100">
              Focus & Study Timer
            </h1>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Timer runs in background across all views. Launch fullscreen for distraction-free work.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode switch */}
          <div className="flex rounded-xl bg-neutral-900 border border-neutral-800 p-1 text-xs font-semibold">
            <button
              onClick={() => onSetMode('pomodoro')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                mode === 'pomodoro'
                  ? 'bg-neutral-800 text-emerald-300 font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Pomodoro (25m)
            </button>
            <button
              onClick={() => onSetMode('countdown')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                mode === 'countdown'
                  ? 'bg-neutral-800 text-emerald-300 font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Countdown
            </button>
            <button
              onClick={() => onSetMode('stopwatch')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                mode === 'stopwatch'
                  ? 'bg-neutral-800 text-emerald-300 font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Stopwatch
            </button>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-neutral-700 text-neutral-200 font-semibold text-xs rounded-xl transition-all shadow-sm"
          >
            <Maximize className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fullscreen</span>
          </button>
        </div>
      </div>

      {/* Main Timer Display Card */}
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-8 sm:p-12 text-center space-y-6 shadow-md relative overflow-hidden">
        {/* Active Linked Habit Selector */}
        <div className="max-w-xs mx-auto">
          <label className="text-[10px] uppercase font-mono text-neutral-500 block mb-1.5">
            Link Timer to Habit (Optional)
          </label>
          <select
            value={activeHabitId || ''}
            onChange={(e) => onSelectHabit(e.target.value || null)}
            className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-emerald-500/60"
          >
            <option value="">General Focus / Deep Work</option>
            {habits.map((h) => (
              <option key={h.id} value={h.id}>
                {h.title} ({h.timeOfDay})
              </option>
            ))}
          </select>
        </div>

        {/* Big Digits Display */}
        <div className="relative py-4 select-none">
          <div className="text-6xl sm:text-8xl md:text-9xl font-mono font-black text-white tabular-nums tracking-tighter">
            {formatTime(timeRemaining)}
          </div>
          {isRunning && (
            <div className="text-xs font-mono text-emerald-400 font-bold mt-2 flex items-center justify-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Running in background</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {mode !== 'stopwatch' && (
          <div className="w-full max-w-md mx-auto h-2.5 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Quick Duration Buttons (When Countdown Mode) */}
        {mode === 'countdown' && !isRunning && (
          <div className="flex items-center justify-center gap-2 pt-2">
            {[10, 15, 25, 45, 60, 90].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => onSetDuration(mins)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                  Math.round(totalDuration / 60) === mins
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-bold'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        )}

        {/* Control Buttons: Reset, Play/Pause, Complete */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={onResetTimer}
            className="w-12 h-12 rounded-xl bg-neutral-950 border border-neutral-800 hover:bg-neutral-850 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={onToggleTimer}
            className={`px-8 py-3.5 rounded-2xl flex items-center justify-center gap-2.5 font-bold text-sm transition-all shadow-lg active:scale-95 ${
              isRunning
                ? 'bg-amber-400 text-neutral-950 hover:bg-amber-300 shadow-amber-500/20'
                : 'bg-emerald-400 text-neutral-950 hover:bg-emerald-300 shadow-emerald-500/30'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Start Session</span>
              </>
            )}
          </button>

          {(mode === 'stopwatch' || timeRemaining === 0 || timeRemaining < totalDuration) && (
            <button
              onClick={() => {
                const logged = mode === 'stopwatch'
                  ? Math.max(1, Math.round(timeRemaining / 60))
                  : Math.max(1, Math.round((totalDuration - timeRemaining) / 60));
                onCompleteSession(logged, activeHabitId || undefined);
                onResetTimer();
              }}
              className="px-4 py-3.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-emerald-500/50 text-neutral-200 hover:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Log Session</span>
            </button>
          )}
        </div>
      </div>

      {/* Today's Focus Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-1">
          <span className="text-[11px] font-mono text-neutral-400 uppercase">Today&apos;s Focus Time</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {Math.floor(todayTotalMins / 60)}h {todayTotalMins % 60}m
          </div>
          <span className="text-[11px] text-neutral-500">{todaySessions.length} total sessions logged</span>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-1">
          <span className="text-[11px] font-mono text-neutral-400 uppercase">Current Session Mode</span>
          <div className="text-2xl font-bold font-mono text-white capitalize">{mode}</div>
          <span className="text-[11px] text-neutral-500">Target duration: {Math.round(totalDuration / 60)} mins</span>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-1">
          <span className="text-[11px] font-mono text-neutral-400 uppercase">Fullscreen Shortcut</span>
          <div className="text-2xl font-bold font-mono text-sky-400">Press &apos;F&apos;</div>
          <span className="text-[11px] text-neutral-500">Space bar to play / pause anytime</span>
        </div>
      </div>
    </div>
  );
}

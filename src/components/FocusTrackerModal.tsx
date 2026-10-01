import React, { useState, useEffect, useRef } from 'react';
import { Habit, FocusSession, HabitCategory } from '../types/habit';
import { getTodayKey, getPastNDays, parseDateKey } from '../utils/date';
import { sound } from '../utils/audio';
import { fireConfetti } from '../utils/confetti';
import {
  Play,
  Pause,
  RotateCcw,
  X,
  Clock,
  Check,
  BarChart2,
  Volume2,
  VolumeX,
  BookOpen,
} from 'lucide-react';

interface FocusTrackerModalProps {
  tasks: Habit[];
  activeTask?: Habit | null;
  sessions: FocusSession[];
  onClose: () => void;
  onSaveSession: (session: Omit<FocusSession, 'id' | 'completedAt'>) => void;
  onCompleteTask?: (task: Habit) => void;
}

export function FocusTrackerModal({
  tasks,
  activeTask,
  sessions,
  onClose,
  onSaveSession,
  onCompleteTask,
}: FocusTrackerModalProps) {
  // Mode: 'countdown' (preset minutes) or 'stopwatch' (count up as you study/work)
  const [timerMode, setTimerMode] = useState<'stopwatch' | 'countdown'>(
    activeTask && activeTask.targetType === 'timer' ? 'countdown' : 'stopwatch'
  );

  const [selectedTaskId, setSelectedTaskId] = useState<string>(activeTask?.id || '');
  const [customSubject, setCustomSubject] = useState(activeTask ? activeTask.title : 'Study & Deep Work');
  const [category, setCategory] = useState<HabitCategory>(activeTask ? activeTask.category : 'learning');

  // Countdown duration (in seconds)
  const [countdownTarget, setCountdownTarget] = useState((activeTask?.targetValue || 25) * 60);

  // Elapsed or remaining seconds
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [countdownRemaining, setCountdownRemaining] = useState(countdownTarget);

  const [isRunning, setIsRunning] = useState(false);
  const [ambientSound, setAmbientSound] = useState(false);
  const [viewTab, setViewTab] = useState<'timer' | 'stats'>('timer');

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Sync when task changes
  const handleTaskChange = (taskId: string) => {
    setSelectedTaskId(taskId);
    const found = tasks.find((t) => t.id === taskId);
    if (found) {
      setCustomSubject(found.title);
      setCategory(found.category);
      if (found.targetType === 'timer' && found.targetValue) {
        setCountdownTarget(found.targetValue * 60);
        setCountdownRemaining(found.targetValue * 60);
      }
    }
  };

  // Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        if (timerMode === 'stopwatch') {
          setElapsedSeconds((s) => s + 1);
        } else {
          setCountdownRemaining((s) => {
            if (s <= 1) {
              // Reached 0 in countdown!
              setIsRunning(false);
              sound.playTimerDone();
              fireConfetti();
              return 0;
            }
            return s - 1;
          });
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timerMode]);

  // Ambient sound generator
  const toggleAmbientSound = () => {
    if (ambientSound) {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      setAmbientSound(false);
    } else {
      try {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.153852;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.016898;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.035;
          b6 = white * 0.115926;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(380, ctx.currentTime);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.06, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        whiteNoise.start();
        setAmbientSound(true);
      } catch {
        // ignore
      }
    }
  };

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  // Save session handler
  const handleFinishAndSave = () => {
    setIsRunning(false);
    const totalSecs =
      timerMode === 'stopwatch'
        ? elapsedSeconds
        : countdownTarget - countdownRemaining;

    const minutesLogged = Math.max(1, Math.round(totalSecs / 60));

    onSaveSession({
      taskId: selectedTaskId || undefined,
      taskTitle: customSubject.trim() || 'Focus Session',
      category,
      durationMinutes: minutesLogged,
      date: getTodayKey(),
    });

    sound.playCheck();
    fireConfetti();

    // If linked to a task, optionally complete it
    if (selectedTaskId && onCompleteTask) {
      const task = tasks.find((t) => t.id === selectedTaskId);
      if (task) onCompleteTask(task);
    }

    onClose();
  };

  // Reset
  const handleReset = () => {
    setIsRunning(false);
    if (timerMode === 'stopwatch') {
      setElapsedSeconds(0);
    } else {
      setCountdownRemaining(countdownTarget);
    }
  };

  // Formatting digits
  const activeSeconds = timerMode === 'stopwatch' ? elapsedSeconds : countdownRemaining;
  const displayHours = Math.floor(activeSeconds / 3600);
  const displayMinutes = Math.floor((activeSeconds % 3600) / 60);
  const displaySeconds = activeSeconds % 60;

  // Chart data calculations (past 7 days focus time)
  const past7Days = getPastNDays(7);
  const dailyFocusMap: Record<string, number> = {};
  past7Days.forEach((d) => (dailyFocusMap[d] = 0));

  sessions.forEach((s) => {
    if (dailyFocusMap[s.date] !== undefined) {
      dailyFocusMap[s.date] += s.durationMinutes;
    }
  });

  const todayMinutes = dailyFocusMap[getTodayKey()] || 0;
  const totalWeekMinutes = Object.values(dailyFocusMap).reduce((a, b) => a + b, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-5 text-center">
        {/* Header with Switcher & Close */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-1 p-0.5 bg-neutral-950 rounded-lg border border-neutral-800 text-xs">
            <button
              onClick={() => setViewTab('timer')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                viewTab === 'timer' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Session
            </button>
            <button
              onClick={() => setViewTab('stats')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                viewTab === 'stats' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Study Chart
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleAmbientSound}
              title={ambientSound ? 'Mute ambient sound' : 'Play soft focus background sound'}
              className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-emerald-400 flex items-center justify-center transition-colors"
            >
              {ambientSound ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab 1: Live Focus Timer */}
        {viewTab === 'timer' && (
          <div className="space-y-5">
            {/* Subject / Task Selector */}
            <div className="space-y-2 text-left">
              <label className="block text-[11px] text-neutral-400 uppercase tracking-wider font-semibold">
                What are you focusing on?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="e.g. Study Physics, Reading Chapter 4, Deep Work"
                  className="flex-1 bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
                {tasks.length > 0 && (
                  <select
                    value={selectedTaskId}
                    onChange={(e) => handleTaskChange(e.target.value)}
                    className="w-32 bg-neutral-950 border border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-neutral-200 focus:outline-none"
                  >
                    <option value="">Task...</option>
                    {tasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Mode Selector */}
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setTimerMode('stopwatch');
                  setIsRunning(false);
                }}
                className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
                  timerMode === 'stopwatch'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                }`}
              >
                Stopwatch (Count Up)
              </button>
              <button
                type="button"
                onClick={() => {
                  setTimerMode('countdown');
                  setIsRunning(false);
                }}
                className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
                  timerMode === 'countdown'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                }`}
              >
                Countdown Timer
              </button>
            </div>

            {/* If Countdown: Quick Presets */}
            {timerMode === 'countdown' && !isRunning && (
              <div className="flex items-center justify-center gap-1.5">
                {[15, 25, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => {
                      setCountdownTarget(mins * 60);
                      setCountdownRemaining(mins * 60);
                    }}
                    className={`px-2.5 py-0.5 rounded text-xs font-mono tabular-nums border transition-colors ${
                      countdownTarget === mins * 60
                        ? 'bg-emerald-400 text-neutral-950 font-bold border-emerald-400'
                        : 'bg-neutral-800 border-neutral-700 text-neutral-300'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            )}

            {/* Clock Digits Display */}
            <div className="py-4">
              <div className="text-5xl md:text-6xl font-mono font-bold tracking-tight text-neutral-100 tabular-nums">
                {displayHours > 0 ? `${String(displayHours).padStart(2, '0')}:` : ''}
                {String(displayMinutes).padStart(2, '0')}:{String(displaySeconds).padStart(2, '0')}
              </div>
              <p className="text-xs text-neutral-400 uppercase tracking-widest mt-2">
                {isRunning ? 'Session Active' : 'Paused / Ready'}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleReset}
                title="Reset"
                className="w-11 h-11 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsRunning(!isRunning)}
                className="h-12 px-7 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-400/20 transition-all active:scale-95"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start</span>
                  </>
                )}
              </button>

              <button
                onClick={handleFinishAndSave}
                disabled={activeSeconds === 0 && timerMode === 'stopwatch'}
                title="Complete & Log Session"
                className="h-12 px-4 rounded-xl bg-neutral-800 border border-neutral-700 hover:border-emerald-500/50 text-emerald-400 font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-40"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Log</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Study / Focus Chart & History */}
        {viewTab === 'stats' && (
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-neutral-200">
                  Focus Time Logged
                </h4>
                <p className="text-xs text-neutral-400">
                  Today: <strong className="text-emerald-400 font-mono">{Math.floor(todayMinutes / 60)}h {todayMinutes % 60}m</strong> · Week: <span className="font-mono">{Math.floor(totalWeekMinutes / 60)}h {totalWeekMinutes % 60}m</span>
                </p>
              </div>
              <BarChart2 className="w-4 h-4 text-emerald-400" />
            </div>

            {/* Daily Bar Chart */}
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
              <span className="text-[11px] text-neutral-500 uppercase font-semibold">
                Daily Focus Hours (Past 7 Days)
              </span>
              <div className="grid grid-cols-7 gap-2 pt-2 items-end h-28">
                {past7Days.map((dKey) => {
                  const dObj = parseDateKey(dKey);
                  const dayName = dObj.toLocaleDateString('en-US', { weekday: 'narrow' });
                  const mins = dailyFocusMap[dKey] || 0;
                  const maxMins = 180; // 3 hours scale
                  const heightPct = Math.min(100, Math.max(8, Math.round((mins / maxMins) * 100)));
                  const isToday = dKey === getTodayKey();

                  return (
                    <div key={dKey} className="flex flex-col items-center gap-1 h-full justify-end">
                      <span className="text-[10px] font-mono text-neutral-400 tabular-nums">
                        {mins > 0 ? `${Math.round(mins / 60 * 10) / 10}h` : '0'}
                      </span>
                      <div className="w-full bg-neutral-800 rounded-t-sm overflow-hidden flex flex-col justify-end h-16">
                        <div
                          className={`w-full transition-all duration-300 ${
                            isToday ? 'bg-emerald-400' : 'bg-emerald-600/70'
                          }`}
                          style={{ height: `${heightPct}%` }}
                        />
                      </div>
                      <span className={`text-[10px] ${isToday ? 'text-emerald-400 font-bold' : 'text-neutral-500'}`}>
                        {dayName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Sessions List */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              <span className="text-[11px] text-neutral-500 uppercase font-semibold block">
                Recent Sessions
              </span>
              {sessions.slice(0, 5).map((s) => (
                <div
                  key={s.id}
                  className="p-2 rounded-lg bg-neutral-950/70 border border-neutral-800 flex items-center justify-between text-xs"
                >
                  <div className="truncate pr-2">
                    <span className="text-neutral-200 font-medium truncate block">
                      {s.taskTitle}
                    </span>
                    <span className="text-[10px] text-neutral-500">{s.date}</span>
                  </div>
                  <span className="font-mono text-emerald-400 font-semibold tabular-nums shrink-0">
                    {s.durationMinutes} mins
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Habit } from '../types/habit';
import { HabitIcon } from './HabitIcon';
import { sound } from '../utils/audio';
import { fireConfetti } from '../utils/confetti';
import { Play, Pause, RotateCcw, X, Bell, Plus, Minus, Volume2, VolumeX } from 'lucide-react';

interface FocusTimerModalProps {
  habit: Habit;
  onClose: () => void;
  onCompleteHabit: (habit: Habit) => void;
}

export function FocusTimerModal({ habit, onClose, onCompleteHabit }: FocusTimerModalProps) {
  const initialSeconds = (habit.targetValue || 25) * 60;
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const [ambientSound, setAmbientSound] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((sec) => sec - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isActive) {
      // Completed!
      setIsActive(false);
      sound.playTimerDone();
      fireConfetti();
      onCompleteHabit(habit);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsRemaining, habit, onCompleteHabit]);

  // Ambient focus white noise / gentle drone
  const toggleAmbientSound = () => {
    if (ambientSound) {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      setAmbientSound(false);
    } else {
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        // Create pink noise buffer
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
          b6 = white * 0.115926;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, ctx.currentTime);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        whiteNoise.start();
        noiseNodeRef.current = whiteNoise;
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

  const handleAdjustTime = (deltaMinutes: number) => {
    const nextTotal = Math.max(60, totalSeconds + deltaMinutes * 60);
    setTotalSeconds(nextTotal);
    setSecondsRemaining((prev) => Math.max(0, prev + deltaMinutes * 60));
  };

  const handleReset = () => {
    setIsActive(false);
    setSecondsRemaining(totalSeconds);
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - secondsRemaining) / totalSeconds) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 shadow-2xl text-center space-y-6">
        {/* Top Bar inside modal */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <div className="w-6 h-6 rounded-lg bg-neutral-800 flex items-center justify-center text-emerald-400">
              <HabitIcon name={habit.icon} className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-neutral-200 truncate max-w-[200px]">
              {habit.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleAmbientSound}
              title={ambientSound ? 'Mute ambient focus sound' : 'Play soft focus background sound'}
              className="w-8 h-8 rounded-lg bg-neutral-800/80 border border-neutral-700/60 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
            >
              {ambientSound ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-neutral-800/80 border border-neutral-700/60 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Circular Countdown Timer */}
        <div className="relative w-56 h-56 mx-auto flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-neutral-800 stroke-current"
              strokeWidth="6"
              fill="transparent"
            />
            {/* Progress Arc */}
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-emerald-400 stroke-current transition-all duration-300"
              strokeWidth="6"
              strokeDasharray={276.46}
              strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Time digits */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-4xl md:text-5xl font-mono font-bold tracking-tight text-neutral-100 tabular-nums">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="text-xs text-neutral-400 uppercase tracking-widest mt-1">
              {isActive ? 'In Session' : 'Ready'}
            </span>
          </div>
        </div>

        {/* Time adjustment helpers */}
        {!isActive && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleAdjustTime(-5)}
              className="px-2.5 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-neutral-300 hover:bg-neutral-700 transition-colors flex items-center gap-1"
            >
              <Minus className="w-3 h-3" /> 5m
            </button>
            <button
              onClick={() => handleAdjustTime(5)}
              className="px-2.5 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-neutral-300 hover:bg-neutral-700 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> 5m
            </button>
          </div>
        )}

        {/* Primary Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleReset}
            title="Reset timer"
            className="w-12 h-12 rounded-2xl bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsActive(!isActive)}
            className="h-14 px-8 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-bold text-sm flex items-center gap-2.5 shadow-lg shadow-emerald-400/20 transition-all active:scale-95"
          >
            {isActive ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Start Focus</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setIsActive(false);
              sound.playTimerDone();
              fireConfetti();
              onCompleteHabit(habit);
            }}
            title="Finish & log complete immediately"
            className="w-12 h-12 rounded-2xl bg-neutral-800 border border-neutral-700 text-emerald-400 hover:bg-neutral-700 flex items-center justify-center transition-colors active:scale-95"
          >
            <Bell className="w-5 h-5" />
          </button>
        </div>

        {/* Habit Cue quote */}
        {habit.cue && (
          <p className="text-xs text-neutral-400 italic">
            Anchor: &ldquo;{habit.cue}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}

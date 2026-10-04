import React, { useState } from 'react';
import { DailyReflection } from '../types/habit';
import { Sparkles, Brain, Quote, Check, Calendar, ChevronLeft, ChevronRight, CloudCheck, Sun, Moon } from 'lucide-react';
import { formatDateKey, parseDateKey, getTodayKey, getRelativeDateLabel } from '../utils/date';
import { sound } from '../utils/audio';

interface MindsetViewProps {
  reflections: Record<string, DailyReflection>;
  selectedDateKey: string;
  onSelectDateKey: (dateKey: string) => void;
  onSaveReflection: (dateKey: string, reflection: Partial<DailyReflection>) => void;
  isCloudSynced?: boolean;
}

export function MindsetView({
  reflections,
  selectedDateKey,
  onSelectDateKey,
  onSaveReflection,
  isCloudSynced = false,
}: MindsetViewProps) {
  const [justSaved, setJustSaved] = useState(false);
  const currentReflection = reflections[selectedDateKey] || {};

  // Curated Stoic & Performance Wisdom
  const WISDOM_LIBRARY = [
    {
      quote: "You have power over your mind - not outside events. Realize this, and you will find strength.",
      author: "Marcus Aurelius",
      title: "Roman Emperor & Stoic Philosopher",
      avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=120&auto=format&fit=crop&q=80",
      prompt: "What external event can you stop stressing over and instead control your internal reaction?",
    },
    {
      quote: "We suffer more often in imagination than in reality.",
      author: "Seneca",
      title: "Stoic Statesman & Dramatist",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80",
      prompt: "What catastrophe in your mind has not actually happened in real life today?",
    },
    {
      quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      author: "Winston Churchill",
      title: "Statesman & Prime Minister",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      prompt: "What small courageous step will you take today regardless of past outcomes?",
    },
    {
      quote: "First say to yourself what you would be; and then do what you have to do.",
      author: "Epictetus",
      title: "Greek Stoic Philosopher",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
      prompt: "Who are you becoming with today's chosen actions?",
    },
  ];

  // Rotate based on day
  const dayHash = selectedDateKey.split('-').reduce((acc, part) => acc + parseInt(part, 10), 0);
  const wisdom = WISDOM_LIBRARY[dayHash % WISDOM_LIBRARY.length];

  const handlePrevDay = () => {
    const d = parseDateKey(selectedDateKey);
    d.setDate(d.getDate() - 1);
    onSelectDateKey(formatDateKey(d));
  };

  const handleNextDay = () => {
    const d = parseDateKey(selectedDateKey);
    d.setDate(d.getDate() + 1);
    onSelectDateKey(formatDateKey(d));
  };

  const updateField = (field: keyof DailyReflection, value: any) => {
    onSaveReflection(selectedDateKey, { [field]: value });
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header Bar with Date Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Brain className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-100 flex items-center gap-2">
              <span>Daily Mindset & Focus</span>
              {justSaved && (
                <span className="text-[11px] font-mono font-normal text-emerald-400 flex items-center gap-1">
                  <CloudCheck className="w-3.5 h-3.5" />
                  <span>{isCloudSynced ? 'Synced to Cloud' : 'Saved'}</span>
                </span>
              )}
            </h1>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Prime your cognitive focus for high execution, clarity, and mental resilience.
          </p>
        </div>

        {/* Date Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 bg-neutral-900 border border-neutral-800 rounded-xl p-1">
            <button
              onClick={handlePrevDay}
              aria-label="Previous day"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-semibold text-neutral-200">
              {getRelativeDateLabel(selectedDateKey)} ({selectedDateKey})
            </span>
            <button
              onClick={handleNextDay}
              aria-label="Next day"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => onSelectDateKey(getTodayKey())}
            className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-emerald-400 hover:underline"
          >
            Today
          </button>
        </div>
      </div>

      {/* Prominent Motivational Card with Thinker Portrait & Large Typography */}
      <div className="p-6 rounded-3xl border border-neutral-800 bg-neutral-900/80 shadow-md space-y-4 relative overflow-hidden">
        <Quote className="w-20 h-20 text-neutral-800/20 absolute -right-2 -bottom-2 pointer-events-none rotate-12" />

        <div className="flex items-start gap-5">
          <img
            src={wisdom.avatar}
            alt={wisdom.author}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-indigo-500/40 shrink-0 shadow-md"
          />
          <div className="space-y-2 min-w-0">
            <p className="font-serif italic text-base sm:text-lg md:text-xl text-neutral-100 leading-snug">
              &ldquo;{wisdom.quote}&rdquo;
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-400 font-mono">
                {wisdom.author}
              </span>
              <span className="text-[11px] text-neutral-400 font-mono">
                · {wisdom.title}
              </span>
            </div>
          </div>
        </div>

        {/* Reflection Anchor */}
        <div className="pt-3 border-t border-neutral-800/80 p-3 rounded-xl bg-neutral-950/60 border border-neutral-850">
          <span className="text-[10px] uppercase font-mono text-indigo-400 font-bold block mb-1">
            Focus Question:
          </span>
          <p className="text-xs text-neutral-300">
            {wisdom.prompt}
          </p>
        </div>
      </div>

      {/* 2 Interactive Reflection Sections: Morning Priority & Evening Review */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Morning Priority Intent */}
        <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-neutral-200">
              #1 Priority Focus for Today
            </h3>
          </div>
          <p className="text-xs text-neutral-400">
            If you only accomplish ONE thing today to make it a victory, what must it be?
          </p>
          <textarea
            value={currentReflection.highlight || ''}
            onChange={(e) => updateField('highlight', e.target.value)}
            rows={3}
            placeholder="e.g. Ship the core backend schema and complete 10k steps without excuse..."
            className="w-full bg-neutral-950 border border-neutral-800 text-neutral-100 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 font-mono resize-none leading-relaxed"
          />
        </div>

        {/* Evening Wins & Review */}
        <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-neutral-200">
              Evening Review & Wins
            </h3>
          </div>
          <p className="text-xs text-neutral-400">
            What went well today? What did you learn or overcome?
          </p>
          <textarea
            value={currentReflection.note || ''}
            onChange={(e) => updateField('note', e.target.value)}
            rows={3}
            placeholder="e.g. Stayed disciplined through the afternoon slump. Great consistency on focus sprints..."
            className="w-full bg-neutral-950 border border-neutral-800 text-neutral-100 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 font-mono resize-none leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}

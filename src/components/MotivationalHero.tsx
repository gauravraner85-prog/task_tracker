import React, { useState } from 'react';
import { MOTIVATIONAL_CARDS } from '../data/motivationalData';
import { ChevronRight, ChevronLeft, Sparkles, CheckCircle2 } from 'lucide-react';

interface MotivationalHeroProps {
  completedCount: number;
  totalScheduled: number;
  currentStreak: number;
  onExploreMindset: () => void;
}

export function MotivationalHero({
  completedCount,
  totalScheduled,
  currentStreak,
  onExploreMindset,
}: MotivationalHeroProps) {
  const [cardIndex, setCardIndex] = useState(0);
  const card = MOTIVATIONAL_CARDS[cardIndex];

  const handleNext = () => {
    setCardIndex((prev) => (prev + 1) % MOTIVATIONAL_CARDS.length);
  };

  const handlePrev = () => {
    setCardIndex((prev) => (prev - 1 + MOTIVATIONAL_CARDS.length) % MOTIVATIONAL_CARDS.length);
  };

  const percent = totalScheduled > 0 ? Math.round((completedCount / totalScheduled) * 100) : 0;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-900/60 transition-all">
      {/* Background Cinematic Visual */}
      <div className="absolute inset-0 z-0">
        <img
          src={card.imagePath}
          alt={card.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center brightness-[0.42] contrast-[1.08] transition-all duration-700 transform scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/65 to-neutral-950/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/90 via-neutral-950/40 to-transparent" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left Column: Inspiring Quote & Focus Prompt */}
        <div className="max-w-2xl space-y-3">
          {/* Metadata: clean unboxed text */}
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Daily Mindset</span>
            <span aria-hidden="true" className="text-neutral-500">·</span>
            <span className="text-neutral-300">{card.categoryTag}</span>
          </div>

          <blockquote className="space-y-1">
            <p className="text-lg md:text-xl font-medium tracking-tight text-neutral-100 italic leading-relaxed" style={{ textWrap: 'balance' }}>
              &ldquo;{card.quote}&rdquo;
            </p>
            <cite className="block text-xs md:text-sm font-normal text-neutral-400 not-italic">
              — {card.author}
            </cite>
          </blockquote>

          <p className="text-xs text-neutral-300/90 pt-1 line-clamp-1">
            <span className="text-neutral-400">Focus cue:</span> {card.reflectionPrompt}
          </p>

          {/* Navigation through cards */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                aria-label="Previous quote"
                className="w-7 h-7 rounded-md bg-neutral-900/80 border border-neutral-700/60 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next quote"
                className="w-7 h-7 rounded-md bg-neutral-900/80 border border-neutral-700/60 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <span className="text-xs text-neutral-400 tabular-nums">
              {cardIndex + 1} / {MOTIVATIONAL_CARDS.length}
            </span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <button
              onClick={onExploreMindset}
              className="text-xs text-neutral-300 hover:text-emerald-400 underline underline-offset-4 transition-colors"
            >
              View All 4 Cinematic Visuals & Principles
            </button>
          </div>
        </div>

        {/* Right Column: Daily Adherence Ring & Quick Status */}
        <div className="w-full md:w-auto shrink-0 bg-neutral-900/80 border border-neutral-800/80 rounded-xl p-4 md:p-5 flex items-center gap-5 backdrop-blur-md">
          {/* Progress Ring */}
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-neutral-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={percent === 100 ? 'text-emerald-400' : 'text-emerald-500'}
                strokeDasharray={`${percent}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-sm font-bold text-neutral-100 tabular-nums">
                {percent}%
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-neutral-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Today&apos;s Targets</span>
            </div>
            <div className="text-xl font-bold tracking-tight text-neutral-100 tabular-nums">
              {completedCount} <span className="text-xs font-normal text-neutral-400">of {totalScheduled} completed</span>
            </div>
            <div className="text-xs text-neutral-400">
              Active Streak: <span className="text-amber-400 font-semibold tabular-nums">{currentStreak} days</span> 🔥
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

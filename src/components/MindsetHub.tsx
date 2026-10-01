import React, { useState } from 'react';
import { MOTIVATIONAL_CARDS } from '../data/motivationalData';
import { Sparkles, Trophy, BookOpen, CheckCircle, ArrowRight } from 'lucide-react';

interface MindsetHubProps {
  totalCompletions: number;
  longestStreak: number;
  onSelectHeroCard?: (cardId: string) => void;
}

export function MindsetHub({ totalCompletions, longestStreak }: MindsetHubProps) {
  const [selectedImageModal, setSelectedImageModal] = useState<typeof MOTIVATIONAL_CARDS[0] | null>(null);

  const MILESTONES = [
    {
      id: 'm1',
      title: 'First Step',
      desc: 'Log your first habit completion',
      unlocked: totalCompletions >= 1,
      icon: '🌱',
    },
    {
      id: 'm2',
      title: 'Momentum Builder',
      desc: 'Achieve a 7-day uninterrupted streak',
      unlocked: longestStreak >= 7,
      icon: '🔥',
    },
    {
      id: 'm3',
      title: 'Atomic 21',
      desc: 'Build consistency for 21 days to form neurological pathways',
      unlocked: longestStreak >= 21,
      icon: '⚡',
    },
    {
      id: 'm4',
      title: 'Century Club',
      desc: 'Reach 100 cumulative habit check-ins',
      unlocked: totalCompletions >= 100,
      icon: '👑',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
          <Sparkles className="w-4 h-4" />
          <span>Mindset & Visual Sanctuary</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-neutral-100 mt-1">
          Inspiration, Visuals & Habit Philosophy
        </h2>
        <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
          High-resolution motivational artwork, behavioral architecture principles from James Clear & Stoic masters, and milestone achievements.
        </p>
      </div>

      {/* Motivational Visuals Gallery */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-neutral-200">
            Curated Motivational Visuals
          </h3>
          <span className="text-xs text-neutral-400">Click any visual to enlarge</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOTIVATIONAL_CARDS.map((card) => (
            <div
              key={card.id}
              onClick={() => setSelectedImageModal(card)}
              className="group cursor-pointer rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden hover:border-neutral-700 transition-all duration-300 shadow-sm flex flex-col"
            >
              {/* Image Container with 16:9 ratio */}
              <div className="relative aspect-video w-full overflow-hidden bg-neutral-950">
                <img
                  src={card.imagePath}
                  alt={card.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 brightness-[0.82]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <span className="text-[11px] font-medium text-emerald-400">
                    {card.categoryTag}
                  </span>
                  <h4 className="text-base font-bold text-neutral-100 mt-0.5">
                    {card.title}
                  </h4>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <blockquote className="space-y-1">
                  <p className="text-xs text-neutral-300 italic">
                    &ldquo;{card.quote}&rdquo;
                  </p>
                  <cite className="block text-[11px] text-neutral-400 not-italic">
                    — {card.author}
                  </cite>
                </blockquote>

                <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
                  <span className="truncate max-w-[220px]">
                    Cue: {card.reflectionPrompt}
                  </span>
                  <span className="text-emerald-400 font-medium group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                    Expand <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Habit Architecture Principles */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <h3 className="text-base font-semibold text-neutral-100">
            The 4 Golden Laws of High-Performance Routines
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {[
            {
              num: '01',
              title: 'The Two-Minute Rule',
              desc: 'When you start a new habit, it should take less than two minutes to do. Read one page. Do one pushup. Meditate for 60 seconds. Master the art of showing up first.',
            },
            {
              num: '02',
              title: 'Never Miss Twice',
              desc: 'Missing one day is an accident; missing twice is the start of a new, destructive habit. When you have a chaotic day, perform a micro-version rather than abandoning the streak.',
            },
            {
              num: '03',
              title: 'Habit Stacking & Anchors',
              desc: 'Tie your desired action to an established daily ritual: "After [Current Habit], I will [New Habit]". E.g., "After pouring my morning coffee, I will open my journal."',
            },
            {
              num: '04',
              title: 'Identity-Driven Habits',
              desc: 'The goal is not to read a book, the goal is to become a reader. The goal is not to run a marathon, it is to become a runner. Every action is a vote for who you wish to become.',
            },
          ].map((principle) => (
            <div
              key={principle.num}
              className="p-4 rounded-xl border border-neutral-800/80 bg-neutral-950/50 space-y-1.5"
            >
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
                <span>{principle.num}</span>
                <span className="text-neutral-200 font-sans text-sm font-semibold">{principle.title}</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {principle.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Personal Milestones */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h3 className="text-base font-semibold text-neutral-100">
            Milestones & Mastery Badges
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MILESTONES.map((m) => (
            <div
              key={m.id}
              className={`p-4 rounded-xl border transition-all ${
                m.unlocked
                  ? 'bg-neutral-950/80 border-emerald-500/30'
                  : 'bg-neutral-950/30 border-neutral-800/50 opacity-50'
              }`}
            >
              <div className="text-2xl mb-2">{m.icon}</div>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-neutral-100">{m.title}</h4>
                {m.unlocked && <CheckCircle className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-xs text-neutral-400 mt-1">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Enlarge Image Modal */}
      {selectedImageModal && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedImageModal(null)}
        >
          <div
            className="max-w-3xl w-full bg-neutral-900 border border-neutral-700/80 rounded-2xl overflow-hidden shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video w-full bg-black">
              <img
                src={selectedImageModal.imagePath}
                alt={selectedImageModal.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400">
                  {selectedImageModal.categoryTag}
                </span>
                <button
                  onClick={() => setSelectedImageModal(null)}
                  className="text-xs text-neutral-400 hover:text-white px-2 py-1 rounded bg-neutral-800"
                >
                  Close
                </button>
              </div>
              <h3 className="text-xl font-bold text-neutral-100">
                {selectedImageModal.title}
              </h3>
              <blockquote className="border-l-2 border-emerald-400 pl-4 py-1">
                <p className="text-sm text-neutral-200 italic">
                  &ldquo;{selectedImageModal.quote}&rdquo;
                </p>
                <cite className="block text-xs text-neutral-400 not-italic mt-1">
                  — {selectedImageModal.author}
                </cite>
              </blockquote>
              <p className="text-xs text-neutral-300">
                <span className="font-semibold text-neutral-400">Prompt:</span>{' '}
                {selectedImageModal.reflectionPrompt}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

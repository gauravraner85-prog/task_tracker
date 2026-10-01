import React from 'react';
import { Sparkles, Quote } from 'lucide-react';

interface DailyQuotesWidgetProps {
  dateKey: string;
}

interface QuoteItem {
  quote: string;
  author: string;
  title: string;
  image: string;
}

const DAILY_QUOTES: QuoteItem[] = [
  {
    quote: 'The impediment to action advances action. What stands in the way becomes the way.',
    author: 'Marcus Aurelius',
    title: 'Roman Emperor & Stoic Philosopher',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&q=80',
  },
  {
    quote: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
    author: 'Aristotle',
    title: 'Classical Philosopher & Polymath',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=200&q=80',
  },
  {
    quote: 'You do not rise to the level of your goals. You fall to the level of your systems.',
    author: 'James Clear',
    title: 'Author of Atomic Habits',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
  {
    quote: 'It is not that we have a short time to live, but that we waste a lot of it.',
    author: 'Seneca',
    title: 'Stoic Statesman & Dramatist',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
  {
    quote: 'Knowing is not enough, we must apply. Willing is not enough, we must do.',
    author: 'Bruce Lee',
    title: 'Martial Artist & Philosopher',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  },
  {
    quote: 'Simplicity is the ultimate sophistication. Principles outlast temporary trends.',
    author: 'Leonardo da Vinci',
    title: 'Renaissance Master & Polymath',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
  },
  {
    quote: 'Your time is limited, so don’t waste it living someone else’s life.',
    author: 'Steve Jobs',
    title: 'Visionary & Co-founder, Apple',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
  },
  {
    quote: 'First say to yourself what you would be; and then do what you have to do.',
    author: 'Epictetus',
    title: 'Greek Stoic Philosopher',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
  },
];

export function DailyQuotesWidget({ dateKey }: DailyQuotesWidgetProps) {
  // Deterministic daily quote selection based on the date key
  const hash = dateKey
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const quote = DAILY_QUOTES[hash % DAILY_QUOTES.length];

  return (
    <div className="w-full rounded-2xl border border-neutral-800 bg-gradient-to-r from-neutral-900/95 via-neutral-900/80 to-neutral-950 p-4 md:p-5 shadow-md relative overflow-hidden">
      {/* Decorative accent quotation watermark */}
      <Quote className="w-24 h-24 text-neutral-800/20 absolute -right-3 -bottom-4 pointer-events-none rotate-12" />

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 relative z-10">
        {/* Author Portrait */}
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden border-2 border-emerald-500/40 shrink-0 shadow-lg bg-neutral-850">
          <img
            src={quote.image}
            alt={quote.author}
            className="w-full h-full object-cover grayscale contrast-125"
          />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider text-[10px]">
            <Sparkles className="w-3 h-3" />
            <span>Wisdom of the Day</span>
          </div>

          <p className="font-serif italic text-sm md:text-base text-neutral-100 leading-relaxed tracking-wide">
            &ldquo;{quote.quote}&rdquo;
          </p>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-emerald-400">— {quote.author}</span>
            <span className="text-neutral-500 text-[11px] truncate">({quote.title})</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { DailyReflection } from '../types/habit';
import { Smile, Zap, PenLine, Check } from 'lucide-react';

interface DailyReflectionCardProps {
  dateKey: string;
  reflection?: DailyReflection;
  onSaveReflection: (dateKey: string, reflection: Partial<DailyReflection>) => void;
}

const MOODS: { id: DailyReflection['mood']; label: string; icon: string }[] = [
  { id: 'great', label: 'Energized', icon: '⚡' },
  { id: 'good', label: 'Solid', icon: '✨' },
  { id: 'neutral', label: 'Steady', icon: '🌱' },
  { id: 'low', label: 'Low', icon: '🌧️' },
  { id: 'tough', label: 'Exhausted', icon: '🔋' },
];

export function DailyReflectionCard({
  dateKey,
  reflection,
  onSaveReflection,
}: DailyReflectionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [noteText, setNoteText] = useState(reflection?.note || '');
  const [highlightText, setHighlightText] = useState(reflection?.highlight || '');
  const [currentEnergy, setCurrentEnergy] = useState<number>(
    typeof reflection?.energyLevel === 'number' ? reflection.energyLevel : 4
  );

  const handleMoodSelect = (mood: DailyReflection['mood']) => {
    onSaveReflection(dateKey, { mood, energyLevel: currentEnergy as 1 | 2 | 3 | 4 | 5 });
  };

  const handleSaveNotes = () => {
    onSaveReflection(dateKey, {
      note: noteText,
      highlight: highlightText,
      energyLevel: currentEnergy as 1 | 2 | 3 | 4 | 5,
    });
    setIsEditing(false);
  };

  return (
    <section className="rounded-xl border border-neutral-800/80 bg-neutral-900/60 p-4 md:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Smile className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold tracking-tight text-neutral-200">
            Daily Mindset & Energy Check-in
          </h3>
          <span aria-hidden="true" className="text-neutral-600">·</span>
          <span className="text-xs text-neutral-400">How did today feel?</span>
        </div>

        {/* Mood Selector Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {MOODS.map((m) => {
            const isSelected = reflection?.mood === m.id;
            return (
              <button
                key={m.id}
                onClick={() => handleMoodSelect(m.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'bg-neutral-800/70 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 border border-neutral-700/40'
                }`}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Note and Energy overview */}
      {!isEditing && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1 border-t border-neutral-800/60 text-xs">
          <div className="space-y-1 max-w-xl text-neutral-300">
            {reflection?.highlight && (
              <p className="font-medium text-emerald-400/90 truncate">
                Win of the day: &ldquo;{reflection.highlight}&rdquo;
              </p>
            )}
            {reflection?.note ? (
              <p className="text-neutral-400 italic line-clamp-1">
                &ldquo;{reflection.note}&rdquo;
              </p>
            ) : (
              <p className="text-neutral-500">
                No journal note added yet. Capture what worked or where friction happened.
              </p>
            )}
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800/70 text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800 transition-colors shrink-0"
          >
            <PenLine className="w-3.5 h-3.5" />
            <span>{reflection?.note ? 'Edit Log' : 'Add Daily Note'}</span>
          </button>
        </div>
      )}

      {/* Editing Form */}
      {isEditing && (
        <div className="space-y-3 pt-2 border-t border-neutral-800/60">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Top Win / Highlight
            </label>
            <input
              type="text"
              value={highlightText}
              onChange={(e) => setHighlightText(e.target.value)}
              placeholder="e.g. Completed deep work before noon without touching phone"
              className="w-full bg-neutral-950 border border-neutral-700/80 rounded-lg px-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Reflection Note (Frictions, Insights, Gratitude)
            </label>
            <textarea
              rows={2}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="e.g. Hydration made a huge difference in afternoon energy. Struggled with evening reading due to fatigue."
              className="w-full bg-neutral-950 border border-neutral-700/80 rounded-lg px-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Energy Rating */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Energy (1-5):</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setCurrentEnergy(lvl)}
                    className={`w-6 h-6 rounded flex items-center justify-center font-mono text-xs transition-colors ${
                      currentEnergy === lvl
                        ? 'bg-amber-400 text-neutral-950 font-bold'
                        : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-xs text-neutral-400 hover:text-neutral-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNotes}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-medium rounded-lg text-xs transition-colors"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

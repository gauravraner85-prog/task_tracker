import React, { useState } from 'react';
import { DailyReflection } from '../types/habit';
import { Zap, Smile, CloudCheck, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { sound } from '../utils/audio';

interface DailyEnergyCheckinProps {
  dateKey: string;
  reflection?: DailyReflection;
  onSaveReflection: (reflection: DailyReflection) => void;
  isCloudSynced?: boolean;
}

export function DailyEnergyCheckin({
  dateKey,
  reflection,
  onSaveReflection,
  isCloudSynced = false,
}: DailyEnergyCheckinProps) {
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // Energy levels: Low (1), Medium (3), High (5)
  const energyOptions: { id: 'low' | 'medium' | 'high'; levelNum: 1 | 3 | 5; label: string; iconCount: number; color: string; desc: string }[] = [
    { id: 'low', levelNum: 1, label: 'Low', iconCount: 1, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10', desc: 'Recharging / Low energy' },
    { id: 'medium', levelNum: 3, label: 'Medium', iconCount: 2, color: 'text-sky-400 border-sky-500/30 bg-sky-500/10', desc: 'Steady / Balanced focus' },
    { id: 'high', levelNum: 5, label: 'High', iconCount: 3, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10', desc: 'Peak stamina / Full speed' },
  ];

  // Mood options
  const moodOptions: { id: string; emoji: string; label: string }[] = [
    { id: 'energized', emoji: '⚡', label: 'Energized' },
    { id: 'focused', emoji: '🎯', label: 'Focused' },
    { id: 'calm', emoji: '😌', label: 'Calm' },
    { id: 'tired', emoji: '🥱', label: 'Tired' },
    { id: 'stressed', emoji: '😤', label: 'Stressed' },
  ];

  const currentEnergy = reflection?.energyLevel;
  const currentMood = reflection?.mood;

  const handleSelectEnergy = (levelNum: 1 | 3 | 5) => {
    sound.playCheck();
    const updated: DailyReflection = {
      date: dateKey,
      ...reflection,
      energyLevel: levelNum,
    };
    onSaveReflection(updated);
    flashSaved();
  };

  const handleSelectMood = (moodId: string) => {
    sound.playCheck();
    const updated: DailyReflection = {
      date: dateKey,
      ...reflection,
      mood: moodId as any,
    };
    onSaveReflection(updated);
    flashSaved();
  };

  const handleNoteChange = (text: string) => {
    const updated: DailyReflection = {
      date: dateKey,
      ...reflection,
      note: text,
    };
    onSaveReflection(updated);
    flashSaved();
  };

  const flashSaved = () => {
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 sm:p-5 shadow-sm space-y-3.5 relative overflow-hidden transition-all">
      {/* Top Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Zap className="w-4 h-4 fill-amber-400/20" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
              <span>Daily Energy & Mood Check-in</span>
              {justSaved && (
                <span className="text-[10px] font-mono font-normal text-emerald-400 flex items-center gap-1 animate-fade-in">
                  <CloudCheck className="w-3 h-3" />
                  <span>{isCloudSynced ? 'Saved to Cloud' : 'Saved'}</span>
                </span>
              )}
            </h3>
            <p className="text-[11px] text-neutral-400">
              Log your physiological state to track consistency correlations
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowNoteInput(!showNoteInput)}
          className="text-xs text-neutral-400 hover:text-emerald-300 flex items-center gap-1 font-mono transition-colors"
        >
          <span>{showNoteInput ? 'Hide note' : '+ Quick note'}</span>
          {showNoteInput ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Selectors Grid: Energy Level & Mood */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
        {/* 1. Energy Level: Low, Medium, High */}
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block font-semibold">
            Energy Level
          </span>
          <div className="grid grid-cols-3 gap-2">
            {energyOptions.map((opt) => {
              const isSelected = currentEnergy === opt.levelNum;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectEnergy(opt.levelNum)}
                  title={opt.desc}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                    isSelected
                      ? `${opt.color} ring-1 font-bold shadow-sm scale-[1.02]`
                      : 'border-neutral-800 bg-neutral-950/70 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: opt.iconCount }).map((_, i) => (
                      <Zap key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs font-semibold">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Mood Level */}
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block font-semibold">
            Current Mood
          </span>
          <div className="grid grid-cols-5 gap-1.5">
            {moodOptions.map((m) => {
              const isSelected = currentMood === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSelectMood(m.id)}
                  className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-0.5 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-bold ring-1 ring-emerald-500/30 scale-[1.03]'
                      : 'border-neutral-800 bg-neutral-950/70 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                  }`}
                >
                  <span className="text-base leading-none">{m.emoji}</span>
                  <span className="text-[10px] font-mono truncate max-w-full">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Expandable Note / Highlight */}
      {showNoteInput && (
        <div className="pt-2 border-t border-neutral-800/80 space-y-1.5">
          <label className="text-[10px] uppercase font-mono text-neutral-400 block">
            Daily Focus / Reflection Note
          </label>
          <textarea
            value={reflection?.note || ''}
            onChange={(e) => handleNoteChange(e.target.value)}
            placeholder="What is your main focus or mindset for today? What worked well?"
            rows={2}
            className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500/60 resize-none font-mono"
          />
        </div>
      )}
    </div>
  );
}

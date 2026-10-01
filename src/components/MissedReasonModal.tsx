import React, { useState } from 'react';
import { Habit } from '../types/habit';
import { HabitIcon } from './HabitIcon';
import { X, Check } from 'lucide-react';

interface MissedReasonModalProps {
  habit: Habit;
  mode: 'missed' | 'skipped';
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const QUICK_REASONS_MISSED = [
  'Work deadline / Overload',
  'Fatigue / Poor sleep',
  'Forgot / Lost track of time',
  'Travel / Out of routine',
  'Physical illness',
  'Low motivation',
];

const QUICK_REASONS_SKIPPED = [
  'Planned rest day',
  'Muscle recovery',
  'Holiday / Family event',
  'Injury rehabilitation',
];

export function MissedReasonModal({
  habit,
  mode,
  onClose,
  onConfirm,
}: MissedReasonModalProps) {
  const [selectedReason, setSelectedReason] = useState(
    mode === 'missed' ? QUICK_REASONS_MISSED[0] : QUICK_REASONS_SKIPPED[0]
  );
  const [customNote, setCustomNote] = useState('');

  const quickList = mode === 'missed' ? QUICK_REASONS_MISSED : QUICK_REASONS_SKIPPED;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = customNote.trim() ? `${selectedReason}: ${customNote.trim()}` : selectedReason;
    onConfirm(finalReason);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-rose-400">
              <HabitIcon name={habit.icon} className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-100">
                {mode === 'missed' ? 'Log Missed Habit' : 'Freeze / Skip Day'}
              </h3>
              <p className="text-xs text-neutral-400 truncate max-w-[240px]">
                {habit.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-neutral-400">
          {mode === 'missed'
            ? 'Accountability without judgment. Document what caused friction so you can optimize your cue or schedule.'
            : 'Skipping preserves your active streak as an intentional scheduled rest day.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-300">
              Quick Reason Tag
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickList.map((reason) => (
                <button
                  type="button"
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`px-3 py-2 rounded-lg text-xs text-left border transition-all ${
                    selectedReason === reason
                      ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300 font-medium'
                      : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-300">
              Optional Note
            </label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. Flight delay kept me awake until 2am"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-neutral-400 hover:text-neutral-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold rounded-lg text-xs transition-colors"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Confirm & Log</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

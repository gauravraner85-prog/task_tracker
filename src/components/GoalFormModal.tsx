import React, { useState } from 'react';
import { Goal, Habit, HabitCategory } from '../types/habit';
import { getTodayKey, formatDateKey } from '../utils/date';
import { X, Check, Target, Calendar } from 'lucide-react';

interface GoalFormModalProps {
  initialGoal?: Goal | null;
  habits: Habit[];
  onClose: () => void;
  onSave: (goalData: Omit<Goal, 'id' | 'createdAt'> & { id?: string }) => void;
}

const PRESET_DURATIONS = [
  { label: '7 Days', days: 7 },
  { label: '14 Days', days: 14 },
  { label: '1 Month', days: 30 },
  { label: '2 Months', days: 60 },
  { label: '3 Months', days: 90 },
  { label: '6 Months', days: 180 },
  { label: '1 Year', days: 365 },
];

export function GoalFormModal({ initialGoal, habits, onClose, onSave }: GoalFormModalProps) {
  const todayKey = getTodayKey();

  const [title, setTitle] = useState(initialGoal?.title || '');
  const [description, setDescription] = useState(initialGoal?.description || '');
  const [category, setCategory] = useState<HabitCategory>(initialGoal?.category || 'productivity');
  const [color, setColor] = useState(initialGoal?.color || 'emerald');

  const [startDate, setStartDate] = useState(initialGoal?.startDate || todayKey);
  const [durationDays, setDurationDays] = useState<number>(initialGoal?.durationDays || 90);

  // Compute targetDate from startDate + durationDays
  const computeEndDate = (start: string, days: number) => {
    const [y, m, d] = start.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + days);
    return formatDateKey(date);
  };

  const [targetDate, setTargetDate] = useState(
    initialGoal?.targetDate || computeEndDate(todayKey, 90)
  );

  const [targetMetricCount, setTargetMetricCount] = useState(initialGoal?.targetMetricCount || 60);
  const [metricUnit, setMetricUnit] = useState(initialGoal?.metricUnit || 'sessions');
  const [linkedHabitIds, setLinkedHabitIds] = useState<string[]>(initialGoal?.linkedHabitIds || []);
  const [error, setError] = useState('');

  // Handle Preset duration click
  const handleSelectPreset = (days: number) => {
    setDurationDays(days);
    setTargetDate(computeEndDate(startDate, days));
  };

  const handleCustomDaysChange = (days: number) => {
    const valid = Math.max(1, days);
    setDurationDays(valid);
    setTargetDate(computeEndDate(startDate, valid));
  };

  const toggleLinkedHabit = (habitId: string) => {
    if (linkedHabitIds.includes(habitId)) {
      setLinkedHabitIds(linkedHabitIds.filter((id) => id !== habitId));
    } else {
      setLinkedHabitIds([...linkedHabitIds, habitId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a target title');
      return;
    }

    onSave({
      id: initialGoal?.id,
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      color,
      startDate,
      targetDate,
      durationDays,
      targetMetricCount: Number(targetMetricCount) || 1,
      metricUnit: metricUnit.trim() || 'sessions',
      status: 'active',
      linkedHabitIds,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-5 my-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-bold text-neutral-100">
              {initialGoal ? 'Edit Target' : 'Create New Target'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Target Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. 100 Deep Work Sprints, Fitness Transformation, Learn React"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Flexible Duration Selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Target Duration
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_DURATIONS.map((preset) => (
                <button
                  key={preset.days}
                  type="button"
                  onClick={() => handleSelectPreset(preset.days)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    durationDays === preset.days
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom Days Input */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <label className="block text-[11px] text-neutral-500 mb-0.5">Custom Days</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={durationDays}
                  onChange={(e) => handleCustomDaysChange(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-neutral-200"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutral-500 mb-0.5">Target Deadline</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => {
                    setTargetDate(e.target.value);
                    const [y, m, d] = e.target.value.split('-').map(Number);
                    const end = new Date(y, m - 1, d);
                    const [sy, sm, sd] = startDate.split('-').map(Number);
                    const start = new Date(sy, sm - 1, sd);
                    const diff = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000));
                    setDurationDays(diff);
                  }}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1 text-xs text-neutral-200"
                />
              </div>
            </div>
          </div>

          {/* Target Quantity & Unit */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Target Volume
              </label>
              <input
                type="number"
                min="1"
                value={targetMetricCount}
                onChange={(e) => setTargetMetricCount(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-neutral-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Unit Name
              </label>
              <input
                type="text"
                placeholder="sessions, hours, units"
                value={metricUnit}
                onChange={(e) => setMetricUnit(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-neutral-100"
              />
            </div>
          </div>

          {/* Link Supporting Tasks */}
          {habits.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Link Tasks to this Target
              </label>
              <div className="max-h-24 overflow-y-auto space-y-1 p-1 bg-neutral-950/60 rounded-lg border border-neutral-800">
                {habits.map((h) => {
                  const isSelected = linkedHabitIds.includes(h.id);
                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => toggleLinkedHabit(h.id)}
                      className={`w-full px-2.5 py-1.5 rounded text-xs flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-emerald-500/20 text-emerald-300 font-medium'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <span className="truncate">{h.title}</span>
                      {isSelected && <Check className="w-3 h-3 text-emerald-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-neutral-400 hover:text-neutral-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-lg text-xs transition-colors"
            >
              {initialGoal ? 'Save Target' : 'Create Target'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

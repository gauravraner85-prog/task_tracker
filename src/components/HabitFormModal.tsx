import React, { useState } from 'react';
import { Habit, HabitCategory, TargetType, TimeOfDay, Goal, CustomCategory } from '../types/habit';
import { HabitIcon, AVAILABLE_ICONS } from './HabitIcon';
import { getTodayKey } from '../utils/date';
import { X, Check, Target, Calendar, Repeat, CalendarDays, Plus, Palette } from 'lucide-react';

interface HabitFormModalProps {
  initialHabit?: Habit | null;
  goals?: Goal[];
  categories: CustomCategory[];
  onClose: () => void;
  onOpenCategoryManager: () => void;
  onSave: (habitData: Omit<Habit, 'id' | 'createdAt' | 'order'> & { id?: string }) => void;
}

const COLORS = ['emerald', 'sky', 'indigo', 'amber', 'rose', 'teal', 'violet', 'orange'];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function HabitFormModal({
  initialHabit,
  goals = [],
  categories = [],
  onClose,
  onOpenCategoryManager,
  onSave,
}: HabitFormModalProps) {
  const [title, setTitle] = useState(initialHabit?.title || '');
  const [description, setDescription] = useState(initialHabit?.description || '');
  const [category, setCategory] = useState<HabitCategory>(
    initialHabit?.category || categories[0]?.id || 'productivity'
  );
  const [color, setColor] = useState(initialHabit?.color || 'emerald');
  const [icon, setIcon] = useState(initialHabit?.icon || 'Target');
  const [targetType, setTargetType] = useState<TargetType>(initialHabit?.targetType || 'boolean');
  const [targetValue, setTargetValue] = useState(initialHabit?.targetValue || 1);
  const [unit, setUnit] = useState(initialHabit?.unit || '');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(initialHabit?.timeOfDay || 'morning');
  const [targetTime, setTargetTime] = useState(initialHabit?.targetTime || '08:00');
  const [frequencyDays, setFrequencyDays] = useState<number[]>(
    initialHabit?.frequencyDays || [0, 1, 2, 3, 4, 5, 6]
  );
  const [isOneTime, setIsOneTime] = useState(initialHabit?.isOneTime || false);
  const [specificDate, setSpecificDate] = useState(initialHabit?.specificDate || getTodayKey());
  const [goalId, setGoalId] = useState<string>(initialHabit?.goalId || '');
  const [cue, setCue] = useState(initialHabit?.cue || '');
  const [showAdvancedStyle, setShowAdvancedStyle] = useState(false);
  const [error, setError] = useState('');

  // When category changes, auto-apply matching color & icon if default
  const handleCategoryChange = (catId: string) => {
    setCategory(catId);
    const found = categories.find((c) => c.id === catId);
    if (found) {
      setColor(found.color);
      setIcon(found.icon);
    }
  };

  const toggleDay = (dayIndex: number) => {
    if (frequencyDays.includes(dayIndex)) {
      if (frequencyDays.length === 1) return;
      setFrequencyDays(frequencyDays.filter((d) => d !== dayIndex));
    } else {
      setFrequencyDays([...frequencyDays, dayIndex].sort());
    }
  };

  const setEveryday = () => setFrequencyDays([0, 1, 2, 3, 4, 5, 6]);
  const setWeekdays = () => setFrequencyDays([1, 2, 3, 4, 5]);
  const setWeekends = () => setFrequencyDays([0, 6]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a task or routine name');
      return;
    }

    onSave({
      id: initialHabit?.id,
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      color,
      icon,
      targetType,
      targetValue: targetType === 'boolean' ? 1 : Number(targetValue) || 1,
      unit: targetType === 'numeric' ? unit.trim() || 'units' : targetType === 'timer' ? 'mins' : undefined,
      timeOfDay,
      targetTime: targetTime || undefined,
      frequencyDays: isOneTime ? [0, 1, 2, 3, 4, 5, 6] : frequencyDays,
      isOneTime,
      specificDate: isOneTime ? specificDate : undefined,
      goalId: goalId || undefined,
      cue: cue.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8 shadow-2xl space-y-5 my-8 text-left">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div>
            <h2 className="text-base md:text-lg font-bold text-neutral-100">
              {initialHabit ? 'Edit Task' : 'Add New Task'}
            </h2>
            <p className="text-xs text-neutral-400">
              Set name, customizable category, schedule, and targets.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Task Name *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Study System Design, 15m Breathwork, 45m Deep Work"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3.5 py-2 text-xs md:text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Customizable Category Selector */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-neutral-300">
                Category
              </label>
              <button
                type="button"
                onClick={onOpenCategoryManager}
                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-medium"
              >
                <Plus className="w-3 h-3" />
                <span>Manage / Custom Categories</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-32 overflow-y-auto p-1 bg-neutral-950/60 rounded-xl border border-neutral-800">
              {categories.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`p-2 rounded-lg border flex items-center gap-2 text-left transition-all ${
                      isSelected
                        ? 'bg-neutral-800 border-emerald-500/70 ring-1 ring-emerald-500 text-white shadow-sm'
                        : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div className="w-5 h-5 rounded flex items-center justify-center bg-neutral-800 shrink-0">
                      <HabitIcon name={cat.icon} className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-medium truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Advanced Custom Color & Icon Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvancedStyle(!showAdvancedStyle)}
              className="text-[11px] text-neutral-400 hover:text-neutral-200 flex items-center gap-1.5"
            >
              <Palette className="w-3.5 h-3.5 text-neutral-500" />
              <span>{showAdvancedStyle ? 'Hide Icon & Color overrides' : 'Customize Icon & Color directly →'}</span>
            </button>

            {showAdvancedStyle && (
              <div className="mt-2.5 p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                {/* Color */}
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1 uppercase font-semibold">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`w-5 h-5 rounded-full border-2 transition-all ${
                          color === c ? 'border-white scale-110' : 'border-transparent'
                        } ${
                          c === 'emerald'
                            ? 'bg-emerald-500'
                            : c === 'sky'
                            ? 'bg-sky-500'
                            : c === 'indigo'
                            ? 'bg-indigo-500'
                            : c === 'amber'
                            ? 'bg-amber-500'
                            : c === 'rose'
                            ? 'bg-rose-500'
                            : c === 'teal'
                            ? 'bg-teal-500'
                            : c === 'violet'
                            ? 'bg-violet-500'
                            : 'bg-orange-500'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Icon Picker */}
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1 uppercase font-semibold">
                    Select Icon
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto p-1 bg-neutral-900/60 rounded-lg border border-neutral-850">
                    {AVAILABLE_ICONS.map((iconName) => (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setIcon(iconName)}
                        className={`w-6 h-6 rounded flex items-center justify-center transition-all ${
                          icon === iconName
                            ? 'bg-emerald-500 text-neutral-950 font-bold'
                            : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                        }`}
                      >
                        <HabitIcon name={iconName} className="w-3.5 h-3.5" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Description (Shown on expand) */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Description (Revealed on click)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed instructions or context. Kept hidden on the main home screen to prevent clutter, and shown when clicked."
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3.5 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Cadence: Recurring Routine vs Specific Date Task */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Cadence & Recurrence
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsOneTime(false)}
                className={`py-2 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-colors ${
                  !isOneTime
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>Recurring Routine</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOneTime(true)}
                className={`py-2 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-colors ${
                  isOneTime
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Single Date Task</span>
              </button>
            </div>

            {/* If Recurring: Day selector */}
            {!isOneTime ? (
              <div className="mt-2.5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-400">Scheduled Days:</span>
                  <div className="flex items-center gap-1.5">
                    <button type="button" onClick={setEveryday} className="text-neutral-400 hover:text-emerald-400">
                      Daily
                    </button>
                    <span className="text-neutral-600">·</span>
                    <button type="button" onClick={setWeekdays} className="text-neutral-400 hover:text-emerald-400">
                      Weekdays
                    </button>
                    <span className="text-neutral-600">·</span>
                    <button type="button" onClick={setWeekends} className="text-neutral-400 hover:text-emerald-400">
                      Weekends
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {DAY_LABELS.map((dayLabel, idx) => {
                    const isSelected = frequencyDays.includes(idx);
                    return (
                      <button
                        key={dayLabel}
                        type="button"
                        onClick={() => toggleDay(idx)}
                        className={`py-1.5 rounded-lg text-xs font-medium border text-center transition-colors ${
                          isSelected
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-500 hover:text-neutral-300'
                        }`}
                      >
                        {dayLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mt-2.5">
                <label className="block text-[11px] text-neutral-400 mb-1">
                  Due / Scheduled Date
                </label>
                <input
                  type="date"
                  value={specificDate}
                  onChange={(e) => setSpecificDate(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          {/* Link to Target Goal */}
          {goals.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span>Link to Target Milestone (Optional)</span>
              </label>
              <select
                value={goalId}
                onChange={(e) => setGoalId(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="">No target linked (Stand-alone task)</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    🎯 {g.title} (Target: {g.targetDate})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Time Block & Target Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Time Block
              </label>
              <select
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value as TimeOfDay)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-200 capitalize focus:outline-none focus:border-emerald-500"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="anytime">Anytime</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Target Time
              </label>
              <input
                type="time"
                value={targetTime}
                onChange={(e) => setTargetTime(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Tracking Mode */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Tracking Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'boolean', label: 'Done / Not Done' },
                { id: 'numeric', label: 'Numeric Metric' },
                { id: 'timer', label: 'Focus Timer' },
              ].map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => {
                    setTargetType(t.id as TargetType);
                    if (t.id === 'timer' && targetValue === 1) setTargetValue(20);
                    if (t.id === 'numeric' && targetValue === 1) setTargetValue(10);
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-colors ${
                    targetType === t.id
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {targetType === 'numeric' && (
              <div className="grid grid-cols-2 gap-3 mt-2.5">
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Target Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={targetValue}
                    onChange={(e) => setTargetValue(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-neutral-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    placeholder="e.g. ml, pages, steps"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-neutral-100"
                  />
                </div>
              </div>
            )}

            {targetType === 'timer' && (
              <div className="mt-2.5">
                <label className="block text-[11px] text-neutral-400 mb-1">Focus Duration (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={targetValue}
                  onChange={(e) => setTargetValue(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-neutral-100"
                />
              </div>
            )}
          </div>

          {/* Trigger Cue */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Trigger Cue / Execution Anchor (Optional)
            </label>
            <input
              type="text"
              value={cue}
              onChange={(e) => setCue(e.target.value)}
              placeholder="e.g. Immediately upon finishing lunch"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3.5 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-neutral-400 hover:text-neutral-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl text-xs transition-colors shadow-md active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{initialHabit ? 'Save Changes' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

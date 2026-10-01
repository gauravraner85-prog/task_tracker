import React, { useState } from 'react';
import { CustomCategory } from '../types/habit';
import { HabitIcon, AVAILABLE_ICONS } from './HabitIcon';
import { X, Plus, Trash2, Check, Sparkles, Tag } from 'lucide-react';
import { sound } from '../utils/audio';

interface CategoryManagerModalProps {
  categories: CustomCategory[];
  onClose: () => void;
  onSaveCategory: (category: CustomCategory) => void;
  onDeleteCategory: (categoryId: string) => void;
}

const COLOR_PALETTE = [
  { id: 'emerald', bg: 'bg-emerald-500', label: 'Emerald' },
  { id: 'sky', bg: 'bg-sky-500', label: 'Sky' },
  { id: 'indigo', bg: 'bg-indigo-500', label: 'Indigo' },
  { id: 'amber', bg: 'bg-amber-500', label: 'Amber' },
  { id: 'rose', bg: 'bg-rose-500', label: 'Rose' },
  { id: 'teal', bg: 'bg-teal-500', label: 'Teal' },
  { id: 'violet', bg: 'bg-violet-500', label: 'Violet' },
  { id: 'orange', bg: 'bg-orange-500', label: 'Orange' },
];

export function CategoryManagerModal({
  categories,
  onClose,
  onSaveCategory,
  onDeleteCategory,
}: CategoryManagerModalProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Tag');
  const [selectedColor, setSelectedColor] = useState('emerald');
  const [error, setError] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) {
      setError('Please provide a category name');
      return;
    }

    const id = newLabel.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    const newCat: CustomCategory = {
      id: `${id}_${Date.now()}`,
      label: newLabel.trim(),
      icon: selectedIcon,
      color: selectedColor,
      isCustom: true,
    };

    onSaveCategory(newCat);
    sound.playCheck();
    setNewLabel('');
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-5 my-6 text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-neutral-100">
                Manage Categories
              </h2>
              <p className="text-xs text-neutral-400">
                Customize category names, icons, and theme accents.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Existing Categories List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-300">
              Active Categories ({categories.length})
            </span>
            {!isCreating && (
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Category</span>
              </button>
            )}
          </div>

          <div className="max-h-56 overflow-y-auto space-y-1.5 p-1 bg-neutral-950/60 rounded-xl border border-neutral-800">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-2.5 rounded-lg bg-neutral-900/70 border border-neutral-800/80 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center border border-white/10 shrink-0 text-white ${
                      COLOR_PALETTE.find((c) => c.id === cat.color)?.bg || 'bg-emerald-500'
                    }`}
                  >
                    <HabitIcon name={cat.icon} className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold text-neutral-200 truncate">
                    {cat.label}
                  </span>
                  {cat.isCustom && (
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                      Custom
                    </span>
                  )}
                </div>

                {cat.isCustom && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete custom category "${cat.label}"?`)) {
                        onDeleteCategory(cat.id);
                      }
                    }}
                    title="Delete Category"
                    className="w-6 h-6 rounded flex items-center justify-center text-neutral-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Create Form */}
        {isCreating && (
          <form onSubmit={handleCreate} className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3.5">
            <div className="flex items-center justify-between border-b border-neutral-850 pb-2">
              <span className="text-xs font-bold text-neutral-200">
                New Custom Category
              </span>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-[11px] text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            {error && (
              <div className="p-2 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Category Label *</label>
              <input
                type="text"
                required
                value={newLabel}
                onChange={(e) => {
                  setNewLabel(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g. Coding & Tech, College, Guitar Practice"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Color Accent */}
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Color Palette</label>
              <div className="flex items-center gap-2">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedColor(c.id)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      selectedColor === c.id ? 'border-white scale-110 shadow-sm' : 'border-transparent'
                    } ${c.bg}`}
                  />
                ))}
              </div>
            </div>

            {/* Icon Picker */}
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Select Icon</label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-neutral-900/60 rounded-lg border border-neutral-800">
                {AVAILABLE_ICONS.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setSelectedIcon(iconName)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                      selectedIcon === iconName
                        ? 'bg-emerald-500 text-neutral-950 font-bold'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`}
                  >
                    <HabitIcon name={iconName} className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1 text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Save Category</span>
              </button>
            </div>
          </form>
        )}

        <div className="flex justify-end pt-2 border-t border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-semibold rounded-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

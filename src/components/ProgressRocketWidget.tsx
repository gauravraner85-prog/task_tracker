import React from 'react';
import { Rocket } from 'lucide-react';

interface ProgressRocketWidgetProps {
  userName?: string | null;
  title?: string;
  subheading?: string;
  subtitle?: string;
  completed: number;
  total: number;
  progressLabel?: string;
  progressSublabel?: string;
}

export function ProgressRocketWidget({
  userName,
  title,
  subheading,
  subtitle,
  completed,
  total,
  progressLabel = 'Total progress',
  progressSublabel = 'across all tasks',
}: ProgressRocketWidgetProps) {
  const percent = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;

  // SVG Circular progress math
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  // Active glowing dot angle math
  const angle = (percent / 100) * 360 - 90;
  const dotX = 54 + radius * Math.cos((angle * Math.PI) / 180);
  const dotY = 54 + radius * Math.sin((angle * Math.PI) / 180);

  const displayName = userName ? userName.split(' ')[0] : 'Champion';

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 sm:p-6 space-y-4 shadow-md select-none relative overflow-hidden">
      {/* Subtle green ambient accent on right border like the reference image */}
      <div className="absolute right-0 top-3 bottom-3 w-1 bg-emerald-500 rounded-l-full" />

      {/* Top Header: Rocket icon + Main Heading + Subheading */}
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-sm shrink-0 mt-0.5">
          <Rocket className="w-5 h-5 fill-emerald-400/30" />
        </div>
        <div className="min-w-0 flex-1 pr-2">
          {/* Main Target Heading: BIGGER, BOLD, HIGH-CONTRAST */}
          <h3 className="text-2xl sm:text-3xl font-black text-neutral-100 tracking-tight leading-tight break-words">
            {title || `Keep pushing, ${displayName}!`}
          </h3>

          {/* Subheading: slightly shorter / smaller than main heading, clearly visible */}
          {subheading && (
            <p className="text-sm sm:text-base font-semibold text-emerald-400 leading-snug mt-1.5 break-words">
              {subheading}
            </p>
          )}

          {/* Optional description/subtitle */}
          {subtitle && subtitle !== subheading && (
            <p className="text-xs text-neutral-400 leading-relaxed mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-neutral-800/80" />

      {/* Bottom Section: Circular Ring on Left + Total Progress on Right */}
      <div className="flex items-center gap-5">
        {/* Circular Progress Ring */}
        <div className="relative w-[108px] h-[108px] shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 108 108">
            {/* Background Track */}
            <circle
              cx="54"
              cy="54"
              r={radius}
              stroke="currentColor"
              strokeWidth="9"
              fill="transparent"
              className="text-neutral-850"
            />
            {/* Emerald Progress Stroke */}
            <circle
              cx="54"
              cy="54"
              r={radius}
              stroke="currentColor"
              strokeWidth="9"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-emerald-500 transition-all duration-500 ease-out"
            />
          </svg>

          {/* Active Glowing Dot on Progress Ring */}
          {percent > 0 && percent < 100 && (
            <div
              className="absolute w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] pointer-events-none -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${dotX}px`,
                top: `${dotY}px`,
              }}
            />
          )}

          {/* Center Text: Percentage & Count */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-extrabold text-neutral-100 font-mono tracking-tight tabular-nums leading-none">
              {percent}%
            </span>
            <span className="text-[11px] text-neutral-400 font-mono mt-1 tabular-nums">
              {completed}/{total}
            </span>
          </div>
        </div>

        {/* Right Details */}
        <div className="space-y-0.5">
          <h4 className="text-base font-bold text-neutral-100 tracking-tight">
            {progressLabel}
          </h4>
          <p className="text-xs text-neutral-400">
            {progressSublabel}
          </p>
        </div>
      </div>
    </div>
  );
}

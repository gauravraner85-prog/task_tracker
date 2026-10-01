import React, { useState } from 'react';
import { loginWithGoogle } from '../firebase';
import {
  Sparkles,
  Target,
  Flame,
  CheckCircle2,
  Clock,
  Shield,
  Award,
  ArrowRight,
} from 'lucide-react';

interface LoginViewProps {
  onEnterGuestMode: () => void;
}

export function LoginView({ onEnterGuestMode }: LoginViewProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setError(err?.message || 'Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-7 text-center">
        {/* Brand Logo */}
        <div className="space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-500/10">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-100">
            Komorebi Execution
          </h1>
          <p className="text-xs md:text-sm text-neutral-400 max-w-sm mx-auto">
            High-discipline personal operating system for daily habits, 3-month target milestones, and study focus.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 gap-2 text-left text-xs">
          <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>70/30 Workspace</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-tight">
              Distraction-free task list with side stopwatch & countdown targets.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-1">
            <div className="flex items-center gap-1.5 text-indigo-400 font-semibold">
              <Flame className="w-3.5 h-3.5" />
              <span>LeetCode Grid</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-tight">
              16-week contribution heatmap of green squares for daily momentum.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <Award className="w-3.5 h-3.5" />
              <span>Achievements</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-tight">
              Unlock 13 digital milestone badges as you conquer daily streaks.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-1">
            <div className="flex items-center gap-1.5 text-sky-400 font-semibold">
              <Shield className="w-3.5 h-3.5" />
              <span>Firebase Cloud</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-tight">
              Personalized private Firestore synchronization across all devices.
            </p>
          </div>
        </div>

        {/* Auth CTA Card */}
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 shadow-xl">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-neutral-200">
              Sign In to Your Workspace
            </h2>
            <p className="text-xs text-neutral-400">
              Only you have access to your private tasks, targets, and streaks.
            </p>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-left">
              {error}
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-xs md:text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-md disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{loading ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>

          {/* Guest preview option */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onEnterGuestMode}
              className="text-xs text-neutral-400 hover:text-emerald-400 flex items-center justify-center gap-1 mx-auto transition-colors"
            >
              <span>Explore workspace in demo mode</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        <p className="text-[11px] text-neutral-500">
          Secured with Google Firebase Authentication & Zero-Trust Firestore Security Rules.
        </p>
      </div>
    </div>
  );
}

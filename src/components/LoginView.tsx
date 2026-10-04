import React, { useState } from 'react';
import { loginWithGoogle, loginWithEmail, signUpWithEmail } from '../firebase';
import { Mail, Lock, ArrowRight, Sparkles, AlertCircle, Rocket, Copy, Check, ExternalLink } from 'lucide-react';

interface LoginViewProps {
  onEnterGuestMode: () => void;
}

export function LoginView({ onEnterGuestMode }: LoginViewProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);

  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
  const isUnauthorizedDomain = error?.includes('unauthorized-domain');

  const handleCopyHost = () => {
    if (currentHost) {
      navigator.clipboard.writeText(currentHost);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      setError(err?.message || 'Failed to sign in with Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please provide both email and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        await signUpWithEmail(email.trim(), password);
      } else {
        await loginWithEmail(email.trim(), password);
      }
    } catch (err: any) {
      console.error('Email auth error:', err);
      let msg = err?.message || 'Authentication failed. Please check credentials.';
      if (msg.includes('user-not-found') || msg.includes('invalid-credential') || msg.includes('wrong-password')) {
        msg = 'Invalid email or password.';
      } else if (msg.includes('email-already-in-use')) {
        msg = 'An account with this email already exists. Please sign in.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-center items-center px-4 py-8 relative">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold mx-auto shadow-sm">
            <Rocket className="w-6 h-6 fill-emerald-400/20" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-100">
            {isSignUp ? 'Create your account' : 'Welcome to Horizon'}
          </h1>
          <p className="text-xs text-neutral-400">
            {isSignUp ? 'Start tracking habits and targets' : 'Sign in to access your habits, targets, and streaks'}
          </p>
        </div>

        {/* Card */}
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 shadow-xl">
          {error && (
            <div className="space-y-3">
              {isUnauthorizedDomain ? (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2.5">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Authorize this Vercel domain in Firebase</span>
                  </div>
                  <p className="text-[11px] text-amber-200/80 leading-relaxed">
                    Firebase requires new hosting domains to be whitelisted before allowing Google Sign-in.
                  </p>
                  <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-emerald-400 truncate">
                      {currentHost || 'your-app.vercel.app'}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyHost}
                      className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 flex items-center gap-1 text-[10px] font-mono shrink-0 transition-colors"
                    >
                      {copiedDomain ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedDomain ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="space-y-1 text-[11px] text-neutral-400">
                    <p>1. Open <a href="https://console.firebase.google.com/project/gen-lang-client-0827449773/authentication/settings" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline inline-flex items-center gap-0.5">Firebase Console Settings <ExternalLink className="w-2.5 h-2.5" /></a></p>
                    <p>2. Scroll to <strong>Authorized domains</strong> → click <strong>Add domain</strong>.</p>
                    <p>3. Paste your domain and click <strong>Save</strong>.</p>
                  </div>
                  <div className="pt-1 border-t border-amber-500/20 text-[11px] text-neutral-400">
                    💡 <em>Tip: You can also sign in right now using <strong>Email & Password</strong> below or continue as <strong>Guest</strong> without waiting!</em>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          )}

          {/* 1. Email / Password Form (FIRST) */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-neutral-400 block">Email address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-neutral-500 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-neutral-400 block">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-neutral-500 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-bold text-xs transition-colors shadow-sm disabled:opacity-50 mt-1"
            >
              {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* 2. Divider */}
          <div className="relative flex items-center justify-center my-3">
            <div className="w-full border-t border-neutral-800" />
            <span className="bg-neutral-900 px-3 text-[11px] text-neutral-500 uppercase font-mono">
              or continue with Google
            </span>
          </div>

          {/* 3. Google Sign-in (BELOW Email & Password) */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-sm disabled:opacity-50"
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
            <span>Continue with Google</span>
          </button>

          {/* Toggle between Sign In and Sign Up */}
          <div className="pt-2 text-center text-xs">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-neutral-400 hover:text-emerald-400 transition-colors"
            >
              {isSignUp ? (
                <span>Already have an account? <strong className="text-emerald-400">Sign in</strong></span>
              ) : (
                <span>Don&apos;t have an account? <strong className="text-emerald-400">Sign up</strong></span>
              )}
            </button>
          </div>
        </div>

        {/* Demo Mode Link */}
        <div className="text-center">
          <button
            type="button"
            onClick={onEnterGuestMode}
            className="text-xs text-neutral-500 hover:text-neutral-300 flex items-center justify-center gap-1.5 mx-auto transition-colors font-mono"
          >
            <span>Explore in demo mode</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

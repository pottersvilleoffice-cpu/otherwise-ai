import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, ArrowRight, AlertCircle, Info, Sparkles, Check } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { authModalState, closeAuthModal, login, signup, error } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>(authModalState.mode);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [socialInfo, setSocialInfo] = useState<string | null>(null);

  if (!authModalState.isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (mode === 'signup') {
      if (!name.trim()) {
        setLocalError('Please enter your full name');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setLocalError('Password must be at least 6 characters');
        return;
      }
      setSubmitting(true);
      const res = await signup(name.trim(), email.trim(), password);
      setSubmitting(false);
      if (!res.success) {
        setLocalError(res.error || 'Sign up failed');
      }
    } else {
      if (!email.trim() || !password) {
        setLocalError('Please enter your email and password');
        return;
      }
      setSubmitting(true);
      const res = await login(email.trim(), password);
      setSubmitting(false);
      if (!res.success) {
        setLocalError(res.error || 'Invalid credentials');
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setLocalError('Please enter your email address to reset password');
      return;
    }
    setSubmitting(true);
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      setForgotSent(true);
    } catch {
      setForgotSent(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSocialClick = (provider: string) => {
    setSocialInfo(
      `${provider} OAuth is currently in sandbox setup. For immediate full workspace access, use the email & password authentication below.`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#090b10] border border-white/[0.14] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-white rounded-full bg-white/[0.05] hover:bg-white/[0.1] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="font-serif text-sm tracking-[0.25em] text-white/90 uppercase mb-1">
            OTHERWISE
          </div>
          <div className="text-[10px] font-mono tracking-[0.2em] text-amber-300 uppercase mb-3">
            ONE AI. EVERY POSSIBILITY.
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl text-white font-bold tracking-wide">
            {showForgot ? 'Reset Password' : mode === 'signup' ? 'Create Account' : 'Welcome back.'}
          </h2>

          <p className="text-xs text-neutral-400 mt-1 font-light">
            {showForgot
              ? 'Enter your email to receive recovery instructions.'
              : mode === 'signup'
              ? 'Create. Imagine. Learn. Build. Discover what could be possible.'
              : 'Your possibilities are waiting.'}
          </p>
        </div>

        {/* Error / Alert notice */}
        {(localError || error) && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{localError || error}</span>
          </div>
        )}

        {/* Social Info Notice */}
        {socialInfo && (
          <div className="mb-4 p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <div className="flex-1 text-[11px] leading-relaxed">
              <span>{socialInfo}</span>
              <button
                onClick={() => setSocialInfo(null)}
                className="block text-white underline mt-1 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {showForgot ? (
          /* Forgot Password View */
          forgotSent ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <p className="text-sm text-neutral-200">
                If an account exists for <span className="font-semibold text-white">{email}</span>, a recovery link has been dispatched.
              </p>
              <button
                onClick={() => {
                  setShowForgot(false);
                  setForgotSent(false);
                }}
                className="w-full h-11 rounded-xl bg-white text-black font-serif font-bold text-xs uppercase tracking-wider hover:bg-neutral-200"
              >
                Back to Log In
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-neutral-400 block mb-1">EMAIL ADDRESS</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.05] border border-white/[0.12] text-sm text-white focus:outline-none focus:border-amber-300"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgot(false)}
                  className="flex-1 h-11 rounded-xl bg-white/[0.06] text-neutral-300 text-xs font-mono uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-11 rounded-xl bg-white text-black font-serif font-bold text-xs tracking-wider uppercase hover:bg-neutral-200 disabled:opacity-50"
                >
                  {submitting ? 'Sending...' : 'Send Link'}
                </button>
              </div>
            </form>
          )
        ) : (
          /* Main Login / Signup Form */
          <>
            {/* Social Authentication Row */}
            <div className="space-y-2 mb-5">
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => handleSocialClick('Google')}
                  className="h-10 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-neutral-300 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                    <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z" />
                    <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 17.4C3.7 21.1 7.5 24 12 24z" />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialClick('Apple')}
                  className="h-10 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-neutral-300 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.7 19.5c-.8 1.2-1.7 2.4-3 2.4-1.3 0-1.7-.8-3.2-.8s-2 .8-3.2.8c-1.3 0-2.3-1.3-3.2-2.5-1.7-2.5-3-7-1.3-10 0.8-1.5 2.3-2.4 4-2.4 1.2 0 2.4.8 3.1.8s2-.9 3.5-.9c1.5 0 2.8.7 3.6 1.9-3.1 1.7-2.6 6.1.5 7.4-.7 1.8-1.6 3.8-2.8 5.3zM15.5 3.5c.7-.9 1.1-2.1 1-3.3-1.1.1-2.3.7-3 1.6-.6.8-1.2 2-1 3.2 1.2.1 2.3-.6 3-1.5z" />
                  </svg>
                  <span>Apple</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialClick('Microsoft')}
                  className="h-10 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-neutral-300 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 23 23">
                    <path fill="#f35325" d="M1 1h10v10H1z" />
                    <path fill="#81bc06" d="M12 1h10v10H12z" />
                    <path fill="#05a6f0" d="M1 12h10v10H1z" />
                    <path fill="#ffba08" d="M12 12h10v10H12z" />
                  </svg>
                  <span>Microsoft</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialClick('GitHub')}
                  className="h-10 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-neutral-300 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    <span>GitHub</span>
                  </div>
                  <span className="text-[9px] text-neutral-500 font-sans">Setup Req.</span>
                </button>
              </div>

              {/* Continue with ChatGPT (explicitly marked as OAuth configuration required; never faking login) */}
              <button
                type="button"
                onClick={() => handleSocialClick('ChatGPT / OpenAI')}
                className="w-full h-9 px-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-neutral-400 flex items-center justify-between text-xs font-mono cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Continue with ChatGPT</span>
                </div>
                <span className="text-[9px] text-neutral-500">OAuth Config Pending</span>
              </button>

              <div className="relative flex items-center justify-center my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/[0.08]" />
                </div>
                <span className="relative px-3 bg-[#090b10] text-[10px] font-mono uppercase text-neutral-400">
                  OR WITH CREDENTIALS
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'signup' && (
                <div>
                  <label className="text-xs font-mono text-neutral-400 block mb-1">FULL NAME</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Your full name"
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.05] border border-white/[0.12] text-sm text-white focus:outline-none focus:border-amber-300"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-mono text-neutral-400 block mb-1">EMAIL ADDRESS</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.05] border border-white/[0.12] text-sm text-white focus:outline-none focus:border-amber-300"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-mono text-neutral-400">PASSWORD</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setShowForgot(true)}
                      className="text-[11px] font-mono text-amber-300/80 hover:text-amber-200 cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.05] border border-white/[0.12] text-sm text-white focus:outline-none focus:border-amber-300"
                  />
                </div>
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="text-xs font-mono text-neutral-400 block mb-1">CONFIRM PASSWORD</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.05] border border-white/[0.12] text-sm text-white focus:outline-none focus:border-amber-300"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-xl bg-white text-neutral-950 font-serif font-bold text-xs tracking-[0.18em] uppercase flex items-center justify-center gap-2 hover:bg-neutral-200 active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-lg mt-4"
              >
                <span>{submitting ? 'Authenticating...' : mode === 'signup' ? 'CREATE ACCOUNT' : 'LOG IN'}</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>

              {mode === 'login' && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('alex@otherwise.ai');
                      setPassword('password123');
                      setLocalError(null);
                    }}
                    className="text-[11px] font-mono text-neutral-400 hover:text-amber-300 underline cursor-pointer"
                  >
                    Fill Demo Credentials (Alex Mercer)
                  </button>
                </div>
              )}
            </form>

            {/* Toggle Mode */}
            <div className="mt-5 pt-4 border-t border-white/[0.06] text-center text-xs text-neutral-400">
              {mode === 'signup' ? (
                <span>
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setMode('login');
                      setLocalError(null);
                    }}
                    className="text-amber-200 hover:text-white font-medium underline underline-offset-4 cursor-pointer"
                  >
                    Log In
                  </button>
                </span>
              ) : (
                <span>
                  Don't have an account yet?{' '}
                  <button
                    onClick={() => {
                      setMode('signup');
                      setLocalError(null);
                    }}
                    className="text-amber-200 hover:text-white font-medium underline underline-offset-4 cursor-pointer"
                  >
                    Create Account
                  </button>
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

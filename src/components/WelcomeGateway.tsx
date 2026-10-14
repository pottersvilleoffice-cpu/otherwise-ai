import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAI } from '../context/AIContext';
import {
  Sparkles,
  ArrowRight,
  Compass,
  Lock,
  Mail,
  User,
  AlertCircle,
  Info,
  Check,
  Eye,
  EyeOff,
  PenTool,
  Music,
  Box,
  Code,
  GraduationCap,
  Heart,
  HelpCircle,
} from 'lucide-react';

export const WelcomeGateway: React.FC = () => {
  const { isFirstVisit, enterGuestMode, login, signup, error: authError } = useAuth();
  const { setActiveNav } = useAI();

  const [view, setView] = useState<'gateway' | 'signup' | 'login'>('gateway');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [socialInfo, setSocialInfo] = useState<string | null>(null);

  // Forgot Password modal/view inside Login
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Don't render if not first visit
  if (!isFirstVisit) return null;

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSocialInfo(null);

    if (!name.trim()) {
      setLocalError('Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setLocalError('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    const res = await signup(name.trim(), email.trim(), password);
    setSubmitting(false);

    if (!res.success) {
      setLocalError(res.error || 'Failed to create account');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSocialInfo(null);

    if (!email.trim() || !password) {
      setLocalError('Please enter both your email and password');
      return;
    }

    setSubmitting(true);
    const res = await login(email.trim(), password);
    setSubmitting(false);

    if (!res.success) {
      setLocalError(res.error || 'Invalid credentials');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setLocalError('Please enter your email address');
      return;
    }
    setSubmitting(true);
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() }),
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
      `${provider} OAuth authentication requires provider credentials to be configured in cloud settings. For immediate, secure, and persistent workspace access, please sign up or log in with Email & Password below, or explore in Guest mode.`
    );
  };

  const fillDemoAccount = () => {
    setEmail('alex@otherwise.ai');
    setPassword('password123');
    setLocalError(null);
  };

  const capabilities = [
    { title: 'OTHERWISE AI', desc: 'Central multi-disciplinary intelligence', icon: Sparkles, color: 'text-amber-300' },
    { title: 'Writing AI', desc: 'Poetry, scripts, prose & essays', icon: PenTool, color: 'text-rose-300' },
    { title: 'Song & Music AI', desc: 'Lyrics, BPM, chords & arrangement', icon: Music, color: 'text-fuchsia-300' },
    { title: '3D Spatial AI', desc: 'Procedural meshes & Three.js viewports', icon: Box, color: 'text-cyan-300' },
    { title: 'Code & Web AI', desc: 'Architecture, TypeScript & engines', icon: Code, color: 'text-emerald-300' },
    { title: 'Alternate Realities', desc: 'Interactive branching timelines', icon: Compass, color: 'text-amber-200' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#040508] text-[#edf0f5] flex flex-col justify-between selection:bg-amber-900/40 selection:text-amber-100">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-gradient-to-br from-amber-500/10 via-purple-500/5 to-transparent rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[15%] w-[600px] h-[600px] bg-gradient-to-tr from-sky-500/10 via-indigo-500/5 to-transparent rounded-full blur-[140px]" />
      </div>

      {/* Top Bar inside Gateway */}
      <header className="relative z-20 w-full px-6 py-5 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <span className="font-serif text-lg tracking-[0.25em] text-white font-bold">
            OTHERWISE
          </span>
          <span className="hidden sm:inline-block text-[10px] font-mono tracking-widest text-amber-300/80 px-2 py-0.5 rounded-full border border-amber-400/20 bg-amber-400/5">
            ONE AI. EVERY POSSIBILITY.
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <button
            onClick={() => {
              enterGuestMode();
              setActiveNav('about');
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span>Meet the Author</span>
          </button>

          <button
            onClick={enterGuestMode}
            className="px-4 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-neutral-300 hover:text-white transition-all cursor-pointer"
          >
            Explore as Guest →
          </button>
        </div>
      </header>

      {/* Main Content Router */}
      <main className="relative z-20 flex-1 flex items-center justify-center px-4 py-8 max-w-5xl mx-auto w-full">
        {/* VIEW 1: GATEWAY OVERVIEW */}
        {view === 'gateway' && (
          <div className="w-full text-center space-y-10 max-w-3xl animate-in fade-in zoom-in-95 duration-500">
            {/* Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] text-xs font-mono tracking-[0.25em] text-neutral-300 uppercase shadow-lg">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>ONE AI. EVERY POSSIBILITY.</span>
            </div>

            {/* Brand Wordmark & Headline */}
            <div className="space-y-4">
              <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl font-bold tracking-[0.2em] text-white drop-shadow-2xl">
                OTHERWISE
              </h1>

              <p className="font-serif text-xl sm:text-2xl md:text-3xl text-amber-100 font-light tracking-wide max-w-2xl mx-auto leading-relaxed">
                “Create. Imagine. Learn. Build. Discover what could be possible.”
              </p>

              <p className="font-sans text-xs sm:text-sm text-neutral-400 font-light max-w-lg mx-auto">
                Every choice creates a life you never lived. Step inside an all-in-one creative intelligence platform built for curious dreamers.
              </p>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setView('signup');
                  setLocalError(null);
                  setSocialInfo(null);
                }}
                className="w-full sm:w-auto h-13 px-8 rounded-2xl bg-white text-neutral-950 font-serif font-bold text-xs uppercase tracking-[0.2em] hover:bg-neutral-200 active:scale-95 transition-all cursor-pointer shadow-xl flex items-center justify-center gap-2"
              >
                <span>SIGN UP</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>

              <button
                onClick={() => {
                  setView('login');
                  setLocalError(null);
                  setSocialInfo(null);
                }}
                className="w-full sm:w-auto h-13 px-8 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.14] text-white font-serif font-semibold text-xs uppercase tracking-[0.2em] active:scale-95 transition-all cursor-pointer flex items-center justify-center"
              >
                LOG IN
              </button>

              <button
                onClick={enterGuestMode}
                className="w-full sm:w-auto h-13 px-6 rounded-2xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-200 font-mono text-xs uppercase tracking-wider active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>PREVIEW WORKSPACE</span>
              </button>
            </div>

            {/* Interactive Capability Grid */}
            <div className="pt-6 border-t border-white/[0.08]">
              <div className="text-[10px] font-mono tracking-[0.25em] text-neutral-500 uppercase mb-4">
                INTEGRATED CAPABILITIES
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-left">
                {capabilities.map((c, i) => {
                  const Icon = c.icon;
                  return (
                    <div
                      key={i}
                      className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
                    >
                      <Icon className={`w-4 h-4 ${c.color} mb-1.5`} />
                      <div className="font-serif text-[11px] text-white font-semibold truncate">
                        {c.title}
                      </div>
                      <div className="text-[9px] text-neutral-400 font-light truncate">
                        {c.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Meet the Author teaser */}
            <div className="pt-2">
              <button
                onClick={() => {
                  enterGuestMode();
                  setActiveNav('about');
                }}
                className="inline-flex items-center gap-2 text-xs font-serif italic text-neutral-400 hover:text-amber-200 transition-colors cursor-pointer"
              >
                <span>“Created by <strong className="text-neutral-200 font-semibold not-italic">David Bodunde</strong>, a 15-year-old student at Pottersville School who refused to wait to begin.”</span>
                <span className="not-italic text-amber-300 font-mono text-[11px]">Read the story →</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: SIGN UP PAGE */}
        {view === 'signup' && (
          <div className="w-full max-w-md bg-[#090b10] border border-white/[0.14] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="text-center space-y-1">
              <div className="font-serif text-xs tracking-[0.25em] text-white/80 uppercase">
                OTHERWISE
              </div>
              <div className="text-[10px] font-mono tracking-[0.2em] text-amber-300 uppercase">
                ONE AI. EVERY POSSIBILITY.
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-white font-bold tracking-wide pt-1">
                Create Account
              </h2>
              <p className="text-xs text-neutral-400 font-light">
                “Create. Imagine. Learn. Build. Discover what could be possible.”
              </p>
            </div>

            {/* Error & Info Alerts */}
            {(localError || authError) && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{localError || authError}</span>
              </div>
            )}

            {socialInfo && (
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2">
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

            {/* Social Options with explicit status labels */}
            <div className="space-y-2">
              <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest text-center">
                SOCIAL AUTHENTICATION
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {/* Google */}
                <button
                  type="button"
                  onClick={() => handleSocialClick('Google')}
                  className="h-10 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-neutral-300 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                      <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z" />
                      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 17.4C3.7 21.1 7.5 24 12 24z" />
                    </svg>
                    <span>Google</span>
                  </div>
                  <span className="text-[9px] text-neutral-500 font-sans">Setup Req.</span>
                </button>

                {/* Apple */}
                <button
                  type="button"
                  onClick={() => handleSocialClick('Apple')}
                  className="h-10 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-neutral-300 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M18.7 19.5c-.8 1.2-1.7 2.4-3 2.4-1.3 0-1.7-.8-3.2-.8s-2 .8-3.2.8c-1.3 0-2.3-1.3-3.2-2.5-1.7-2.5-3-7-1.3-10 0.8-1.5 2.3-2.4 4-2.4 1.2 0 2.4.8 3.1.8s2-.9 3.5-.9c1.5 0 2.8.7 3.6 1.9-3.1 1.7-2.6 6.1.5 7.4-.7 1.8-1.6 3.8-2.8 5.3zM15.5 3.5c.7-.9 1.1-2.1 1-3.3-1.1.1-2.3.7-3 1.6-.6.8-1.2 2-1 3.2 1.2.1 2.3-.6 3-1.5z" />
                    </svg>
                    <span>Apple</span>
                  </div>
                  <span className="text-[9px] text-neutral-500 font-sans">Setup Req.</span>
                </button>

                {/* Microsoft */}
                <button
                  type="button"
                  onClick={() => handleSocialClick('Microsoft')}
                  className="h-10 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-neutral-300 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 23 23">
                      <path fill="#f35325" d="M1 1h10v10H1z" />
                      <path fill="#81bc06" d="M12 1h10v10H12z" />
                      <path fill="#05a6f0" d="M1 12h10v10H1z" />
                      <path fill="#ffba08" d="M12 12h10v10H12z" />
                    </svg>
                    <span>Microsoft</span>
                  </div>
                  <span className="text-[9px] text-neutral-500 font-sans">Setup Req.</span>
                </button>

                {/* GitHub */}
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
            </div>

            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.08]" />
              </div>
              <span className="relative px-3 bg-[#090b10] text-[10px] font-mono uppercase text-neutral-400">
                OR REGISTER WITH EMAIL
              </span>
            </div>

            {/* Email / Password Sign Up Form */}
            <form onSubmit={handleSignupSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-mono text-neutral-400 block mb-1">FULL NAME</label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Ada Lovelace"
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.05] border border-white/[0.12] text-sm text-white focus:outline-none focus:border-amber-300"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-neutral-400 block mb-1">EMAIL ADDRESS</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="creator@example.com"
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.05] border border-white/[0.12] text-sm text-white focus:outline-none focus:border-amber-300"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-neutral-400 block mb-1">PASSWORD</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full h-11 pl-10 pr-10 rounded-xl bg-white/[0.05] border border-white/[0.12] text-sm text-white focus:outline-none focus:border-amber-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-neutral-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-neutral-400 block mb-1">CONFIRM PASSWORD</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.05] border border-white/[0.12] text-sm text-white focus:outline-none focus:border-amber-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-xl bg-white text-neutral-950 font-serif font-bold text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-2 hover:bg-neutral-200 active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-lg mt-4"
              >
                <span>{submitting ? 'Creating Account...' : 'CREATE ACCOUNT'}</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
            </form>

            {/* Bottom Navigation between Views */}
            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono">
              <button
                onClick={() => setView('gateway')}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                ← Back
              </button>

              <div>
                <span className="text-neutral-400">Already registered? </span>
                <button
                  onClick={() => {
                    setView('login');
                    setLocalError(null);
                    setSocialInfo(null);
                  }}
                  className="text-amber-300 hover:underline font-semibold cursor-pointer"
                >
                  Log In
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: LOGIN PAGE */}
        {view === 'login' && (
          <div className="w-full max-w-md bg-[#090b10] border border-white/[0.14] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="text-center space-y-1">
              <div className="font-serif text-xs tracking-[0.25em] text-white/80 uppercase">
                OTHERWISE
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-white font-bold tracking-wide">
                Welcome back.
              </h2>
              <p className="text-xs text-neutral-400 font-light italic">
                “Your possibilities are waiting.”
              </p>
            </div>

            {/* Error & Info Alerts */}
            {(localError || authError) && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{localError || authError}</span>
              </div>
            )}

            {socialInfo && (
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2">
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
              /* Forgot password mode */
              forgotSent ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <p className="text-sm text-neutral-200">
                    If an account exists for <span className="font-semibold text-white">{forgotEmail}</span>, recovery instructions have been sent.
                  </p>
                  <button
                    onClick={() => {
                      setShowForgot(false);
                      setForgotSent(false);
                    }}
                    className="w-full h-11 rounded-xl bg-white text-black font-serif font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 cursor-pointer"
                  >
                    Back to Log In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="text-xs font-mono text-neutral-400 block mb-1">ACCOUNT EMAIL</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                        placeholder="creator@example.com"
                        className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.05] border border-white/[0.12] text-sm text-white focus:outline-none focus:border-amber-300"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
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
              /* Regular Login Mode */
              <>
                {/* Social Login Options */}
                <div className="space-y-2">
                  <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest text-center">
                    SOCIAL LOGIN
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => handleSocialClick('Google')}
                      className="h-10 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-neutral-300 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                          <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                          <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                          <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z" />
                          <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 17.4C3.7 21.1 7.5 24 12 24z" />
                        </svg>
                        <span>Google</span>
                      </div>
                      <span className="text-[9px] text-neutral-500 font-sans">Setup Req.</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSocialClick('Apple')}
                      className="h-10 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-neutral-300 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M18.7 19.5c-.8 1.2-1.7 2.4-3 2.4-1.3 0-1.7-.8-3.2-.8s-2 .8-3.2.8c-1.3 0-2.3-1.3-3.2-2.5-1.7-2.5-3-7-1.3-10 0.8-1.5 2.3-2.4 4-2.4 1.2 0 2.4.8 3.1.8s2-.9 3.5-.9c1.5 0 2.8.7 3.6 1.9-3.1 1.7-2.6 6.1.5 7.4-.7 1.8-1.6 3.8-2.8 5.3zM15.5 3.5c.7-.9 1.1-2.1 1-3.3-1.1.1-2.3.7-3 1.6-.6.8-1.2 2-1 3.2 1.2.1 2.3-.6 3-1.5z" />
                        </svg>
                        <span>Apple</span>
                      </div>
                      <span className="text-[9px] text-neutral-500 font-sans">Setup Req.</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSocialClick('Microsoft')}
                      className="h-10 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-neutral-300 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 23 23">
                          <path fill="#f35325" d="M1 1h10v10H1z" />
                          <path fill="#81bc06" d="M12 1h10v10H12z" />
                          <path fill="#05a6f0" d="M1 12h10v10H1z" />
                          <path fill="#ffba08" d="M12 12h10v10H12z" />
                        </svg>
                        <span>Microsoft</span>
                      </div>
                      <span className="text-[9px] text-neutral-500 font-sans">Setup Req.</span>
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

                  {/* Continue with ChatGPT (clearly marked unavailable, never faking login) */}
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
                </div>

                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/[0.08]" />
                  </div>
                  <span className="relative px-3 bg-[#090b10] text-[10px] font-mono uppercase text-neutral-400">
                    OR EMAIL & PASSWORD
                  </span>
                </div>

                {/* Email Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                  <div>
                    <label className="text-xs font-mono text-neutral-400 block mb-1">EMAIL ADDRESS</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="creator@example.com"
                        className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.05] border border-white/[0.12] text-sm text-white focus:outline-none focus:border-amber-300"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-mono text-neutral-400">PASSWORD</label>
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgot(true);
                          setForgotEmail(email);
                        }}
                        className="text-[11px] font-mono text-amber-300/80 hover:text-amber-200 cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full h-11 pl-10 pr-10 rounded-xl bg-white/[0.05] border border-white/[0.12] text-sm text-white focus:outline-none focus:border-amber-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-neutral-500 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 rounded-xl bg-white text-neutral-950 font-serif font-bold text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-2 hover:bg-neutral-200 active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-lg mt-4"
                  >
                    <span>{submitting ? 'Authenticating...' : 'LOG IN'}</span>
                    <ArrowRight className="w-4 h-4 text-black" />
                  </button>

                  {/* One-click demo account */}
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={fillDemoAccount}
                      className="text-[11px] font-mono text-neutral-400 hover:text-amber-300 underline cursor-pointer"
                    >
                      Fill Demo Credentials (Alex Mercer)
                    </button>
                  </div>
                </form>

                {/* Bottom Navigation between Views */}
                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono">
                  <button
                    onClick={() => setView('gateway')}
                    className="text-neutral-400 hover:text-white cursor-pointer"
                  >
                    ← Back
                  </button>

                  <div>
                    <span className="text-neutral-400">Need an account? </span>
                    <button
                      onClick={() => {
                        setView('signup');
                        setLocalError(null);
                        setSocialInfo(null);
                      }}
                      className="text-amber-300 hover:underline font-semibold cursor-pointer"
                    >
                      Create Account
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Gateway Footer */}
      <footer className="relative z-20 w-full px-6 py-4 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto text-xs text-neutral-500 font-mono border-t border-white/[0.06] gap-2">
        <div>
          OTHERWISE © 2026 // Built by a student at Pottersville School
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              enterGuestMode();
              setActiveNav('about');
            }}
            className="hover:text-amber-200 cursor-pointer"
          >
            Philosophy & Story
          </button>
          <span>·</span>
          <button
            onClick={enterGuestMode}
            className="hover:text-white cursor-pointer"
          >
            Continue as Guest
          </button>
        </div>
      </footer>
    </div>
  );
};

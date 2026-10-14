import React, { useState } from 'react';
import { useAI } from '../context/AIContext';
import { useTimeline } from '../context/TimelineContext';
import { useAuth } from '../context/AuthContext';
import { Sparkles, User, LogIn, LogOut, Settings, Check, Key } from 'lucide-react';

export const Header: React.FC = () => {
  const { activeNav, setActiveNav, setIsKeysModalOpen } = useAI();
  const { timelines } = useTimeline();
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
  const [userDropdown, setUserDropdown] = useState(false);

  const navItems: Array<{ id: 'home' | 'ai' | 'community' | 'messages' | 'profile'; label: string; badge?: number }> = [
    { id: 'home', label: 'Home' },
    { id: 'ai', label: 'Chat' },
    { id: 'community', label: 'Community' },
    { id: 'messages', label: 'Messages' },
    { id: 'profile', label: 'Profile' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#06070a]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element Brand Wordmark */}
        <button
          onClick={() => setActiveNav('home')}
          className="text-left group cursor-pointer focus:outline-none"
        >
          <span className="font-serif text-lg tracking-[0.22em] text-white/95 group-hover:text-white transition-colors duration-200">
            OTHERWISE
          </span>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-7 text-xs font-medium tracking-wider uppercase text-neutral-400">
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`transition-colors hover:text-white py-1 relative flex items-center gap-1.5 cursor-pointer ${
                  isActive ? 'text-white font-semibold' : ''
                }`}
              >
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="text-[10px] font-mono text-amber-300">({item.badge})</span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-white/80" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action / User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsKeysModalOpen(true)}
            title="AI Provider Keys (Suno, Google Veo, Luma)"
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-neutral-400 hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-mono"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">API Keys</span>
          </button>

          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdown(!userDropdown)}
                className="flex items-center gap-2 p-1 pl-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-xs transition-colors cursor-pointer"
              >
                <span className="font-mono text-white text-[11px] truncate max-w-[110px]">
                  {user.name.split(' ')[0]}
                </span>
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-indigo-500 text-black font-bold flex items-center justify-center text-[10px]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </button>

              {userDropdown && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#0c0e14] border border-white/[0.12] p-1.5 shadow-2xl z-50 text-xs font-mono">
                  <div className="px-3 py-2 border-b border-white/[0.06] mb-1">
                    <p className="text-white font-medium truncate">{user.name}</p>
                    <p className="text-[10px] text-neutral-400 truncate">{user.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setActiveNav('profile');
                      setUserDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-neutral-300 hover:text-white hover:bg-white/[0.06] flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 text-neutral-400" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsKeysModalOpen(true);
                      setUserDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-neutral-300 hover:text-white hover:bg-white/[0.06] flex items-center gap-2"
                  >
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>AI Provider Keys</span>
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setUserDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/20 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('login')}
                className="px-3 py-1.5 text-xs font-mono text-neutral-300 hover:text-white uppercase tracking-wider cursor-pointer transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-serif font-bold tracking-wider text-black bg-white hover:bg-neutral-200 rounded-lg transition-all cursor-pointer shadow-sm"
              >
                <span>Sign Up</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

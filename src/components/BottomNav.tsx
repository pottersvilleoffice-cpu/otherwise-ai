import React from 'react';
import { useAI } from '../context/AIContext';
import { useTimeline } from '../context/TimelineContext';
import { Home, MessageSquare, MessageCircle, Users, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeNav, setActiveNav } = useAI();
  const { activeTab } = useTimeline();

  // Hide bottom nav during full-screen immersion wizard or reveal when in otherwise mode
  if (activeNav === 'otherwise' && (activeTab === 'wizard' || activeTab === 'reveal')) {
    return null;
  }

  const tabs = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'ai' as const, label: 'Chat', icon: MessageSquare },
    { id: 'community' as const, label: 'Community', icon: Users },
    { id: 'messages' as const, label: 'Messages', icon: MessageCircle },
    { id: 'profile' as const, label: 'Profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#07080c]/95 backdrop-blur-lg border-t border-white/[0.08] pb-safe">
      <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeNav === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveNav(tab.id)}
              className="flex flex-col items-center justify-center h-full min-h-[44px] min-w-[40px] transition-colors relative cursor-pointer"
            >
              <Icon
                className={`w-4 h-4 transition-transform duration-200 ${
                  isActive ? 'text-amber-200 scale-110' : 'text-neutral-400'
                }`}
              />
              <span
                className={`text-[8px] tracking-wider uppercase mt-1 font-medium transition-colors truncate ${
                  isActive ? 'text-white' : 'text-neutral-400'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 bg-amber-300 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

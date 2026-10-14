import React, { useState } from 'react';
import { useTimeline } from '../context/TimelineContext';
import { useAI } from '../context/AIContext';
import { useAuth } from '../context/AuthContext';
import { HistoryView } from './HistoryView';
import {
  Sparkles,
  RotateCcw,
  GitBranch,
  Globe,
  Compass,
  Trash2,
  Check,
  MessageSquare,
  Box,
  Music,
  PenTool,
  Code,
  Folder,
  User,
  Settings,
  Shield,
  Bell,
  Palette,
  FileText,
  LogOut,
  Edit3,
  Clock,
} from 'lucide-react';

interface ProfileViewProps {
  onStartMessage?: (userId: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onStartMessage }) => {
  const { stats, timelines, resetAllData, selectTimeline } = useTimeline();
  const { creations, conversations, projects, setActiveNav, selectConversation, setCreateSubTab, selectProject } = useAI();
  const { user, isAuthenticated, openAuthModal, logout, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'history' | 'creations' | 'projects' | 'timelines' | 'files' | 'settings'>('history');
  const [editingProfile, setEditingProfile] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || 'Explorer');
  const [bioInput, setBioInput] = useState(user?.bio || 'Creator and explorer of alternate possibilities.');
  const [profileSaved, setProfileSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // Account Settings state
  const [themePreference, setThemePreference] = useState('cinematic');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [streamResponses, setStreamResponses] = useState(true);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name: nameInput.trim(),
      bio: bioInput.trim(),
      preferences: {
        theme: themePreference,
        notifications: notificationsEnabled,
        streamResponses,
      },
    });
    setEditingProfile(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const creationFiles = creations.filter((c) => c.type === 'doc');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-16">
      {/* Profile Banner */}
      <div className="p-6 sm:p-10 rounded-3xl border border-white/[0.1] bg-[#090b10] shadow-2xl mb-10 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-400 to-indigo-500 p-0.5 shadow-xl">
              <div className="w-full h-full rounded-[14px] bg-[#0c0e14] flex items-center justify-center text-2xl font-serif font-bold text-white uppercase">
                {user?.name ? user.name.charAt(0) : 'O'}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-serif text-2xl sm:text-3xl text-white font-bold tracking-wide">
                  {user?.name || 'The Wanderer'}
                </h2>
                {isAuthenticated && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                    Verified
                  </span>
                )}
              </div>

              <p className="text-xs font-mono text-neutral-400 mb-2">
                {user?.email || 'Anonymous Session (Local Storage)'}
              </p>

              <p className="text-xs text-neutral-300 font-light max-w-md">
                {user?.bio || 'Explorer of creative possibilities across writing, code, 3D, and alternate timelines.'}
              </p>

              <div className="text-[10px] font-mono text-neutral-500 mt-2">
                MEMBER SINCE // {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'October 2026'}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setEditingProfile(!editingProfile)}
                  className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.1] text-xs font-mono text-white uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={logout}
                  className="px-3 py-2 rounded-xl bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 text-xs font-mono text-red-300 uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.1] text-xs font-mono text-white uppercase cursor-pointer transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="px-5 py-2.5 rounded-xl bg-white text-black font-serif font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 cursor-pointer shadow-lg transition-colors"
                >
                  Create Account
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Edit Profile Form Inline */}
        {editingProfile && (
          <form onSubmit={handleSaveProfile} className="mt-8 pt-6 border-t border-white/[0.08] space-y-4 max-w-xl">
            <h4 className="text-xs font-mono text-amber-300 uppercase tracking-widest">
              UPDATE PROFILE DETAILS
            </h4>
            <div>
              <label className="text-[10px] font-mono text-neutral-400 block mb-1">NAME</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-lg bg-white/[0.05] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-300"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-neutral-400 block mb-1">BIO</label>
              <textarea
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                rows={2}
                className="w-full p-3 rounded-lg bg-white/[0.05] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-300"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditingProfile(false)}
                className="px-3 py-1.5 rounded-lg bg-white/[0.05] text-xs font-mono text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-white text-black font-serif font-bold text-xs uppercase tracking-wider hover:bg-neutral-200"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}

        {profileSaved && (
          <div className="mt-4 p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <Check className="w-3.5 h-3.5" />
            <span>Profile successfully updated!</span>
          </div>
        )}
      </div>

      {/* 4 Quantitative Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] text-center">
          <div className="font-mono text-3xl sm:text-4xl font-bold text-white tabular-nums mb-1">
            {projects.length}
          </div>
          <div className="text-[10px] sm:text-xs font-mono text-neutral-400 uppercase tracking-wider">
            Active Projects
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] text-center">
          <div className="font-mono text-3xl sm:text-4xl font-bold text-amber-200 tabular-nums mb-1">
            {creations.length}
          </div>
          <div className="text-[10px] sm:text-xs font-mono text-neutral-400 uppercase tracking-wider">
            Saved Creations
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] text-center">
          <div className="font-mono text-3xl sm:text-4xl font-bold text-sky-200 tabular-nums mb-1">
            {timelines.length}
          </div>
          <div className="text-[10px] sm:text-xs font-mono text-neutral-400 uppercase tracking-wider">
            Alternate Timelines
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] text-center">
          <div className="font-mono text-3xl sm:text-4xl font-bold text-emerald-200 tabular-nums mb-1">
            {conversations.length}
          </div>
          <div className="text-[10px] sm:text-xs font-mono text-neutral-400 uppercase tracking-wider">
            Conversations
          </div>
        </div>
      </div>

      {/* Sections Tab Bar */}
      <div className="border-b border-white/[0.08] pb-4 mb-8 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs font-mono uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'history'
              ? 'bg-amber-400 text-black font-bold'
              : 'text-neutral-400 hover:text-white bg-white/[0.03]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>AI HISTORY</span>
        </button>

        <button
          onClick={() => setActiveTab('creations')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'creations'
              ? 'bg-white text-black font-semibold'
              : 'text-neutral-400 hover:text-white bg-white/[0.03]'
          }`}
        >
          MY CREATIONS ({creations.length})
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'projects'
              ? 'bg-white text-black font-semibold'
              : 'text-neutral-400 hover:text-white bg-white/[0.03]'
          }`}
        >
          MY PROJECTS ({projects.length})
        </button>

        <button
          onClick={() => setActiveTab('timelines')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'timelines'
              ? 'bg-white text-black font-semibold'
              : 'text-neutral-400 hover:text-white bg-white/[0.03]'
          }`}
        >
          MY TIMELINES ({timelines.length})
        </button>

        <button
          onClick={() => setActiveTab('files')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'files'
              ? 'bg-white text-black font-semibold'
              : 'text-neutral-400 hover:text-white bg-white/[0.03]'
          }`}
        >
          MY FILES ({creationFiles.length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-white text-black font-semibold'
              : 'text-neutral-400 hover:text-white bg-white/[0.03]'
          }`}
        >
          ACCOUNT SETTINGS
        </button>
      </div>

      {/* Tab 0: AI HISTORY */}
      {activeTab === 'history' && <HistoryView />}

      {/* Tab 1: MY CREATIONS */}
      {activeTab === 'creations' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {creations.map((cr) => (
              <div
                key={cr.id}
                onClick={() => {
                  setCreateSubTab(cr.type as any);
                  setActiveNav('create');
                }}
                className="p-5 rounded-2xl border border-white/[0.08] bg-[#080a0f] hover:border-white/[0.2] transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 uppercase mb-2">
                    <span className="text-amber-300 font-bold">{cr.type}</span>
                    <span>{new Date(cr.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-serif text-base text-white font-semibold group-hover:text-amber-100 transition-colors mb-2">
                    {cr.title}
                  </h4>
                  <p className="text-xs text-neutral-400 font-light line-clamp-3 leading-relaxed mb-4">
                    {cr.preview}
                  </p>
                </div>
                <div className="pt-3 border-t border-white/[0.06] text-xs font-mono text-neutral-400 group-hover:text-white flex items-center justify-between">
                  <span>Open in Studio →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: MY PROJECTS */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => {
                  selectProject(proj.id);
                  setActiveNav('projects');
                }}
                className="p-5 rounded-2xl border border-white/[0.08] bg-[#080a0f] hover:border-white/[0.2] transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-mono text-amber-300 uppercase block mb-1">
                    {proj.category}
                  </span>
                  <h4 className="font-serif text-lg text-white font-bold mb-2">{proj.name}</h4>
                  <p className="text-xs text-neutral-400 font-light line-clamp-2 mb-4">
                    {proj.description}
                  </p>
                </div>
                <div className="pt-3 border-t border-white/[0.06] text-xs font-mono text-neutral-400 flex items-center justify-between">
                  <span>{proj.itemIds.length} Assets Attached</span>
                  <span className="text-white">Open Project →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: MY TIMELINES */}
      {activeTab === 'timelines' && (
        <div className="space-y-4">
          {timelines.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 font-light">
              No alternate timelines generated yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {timelines.map((tl) => (
                <div
                  key={tl.id}
                  onClick={() => {
                    selectTimeline(tl.id);
                    setActiveNav('otherwise');
                  }}
                  className="p-5 rounded-2xl border border-white/[0.08] bg-[#080a0f] hover:border-amber-400/50 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="truncate pr-4">
                    <span className="text-[10px] font-mono text-amber-300 uppercase block mb-1">
                      {tl.parallelSelf.archetype}
                    </span>
                    <h4 className="font-serif text-lg text-white font-semibold truncate">{tl.title}</h4>
                    <p className="text-xs text-neutral-400 truncate mt-1">{tl.location}</p>
                  </div>
                  <span className="text-xs font-mono text-neutral-300 shrink-0">Inhabit Life →</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: MY FILES */}
      {activeTab === 'files' && (
        <div className="p-8 rounded-2xl border border-white/[0.08] bg-[#080a0f] text-center text-neutral-400 space-y-3">
          <FileText className="w-8 h-8 text-sky-400 mx-auto" />
          <h4 className="font-serif text-lg text-white font-semibold">Analyzed Files & Docs</h4>
          <p className="text-xs font-light max-w-md mx-auto">
            Uploaded PDFs, spreadsheets, and markdown documentation analyzed through FILES AI are secured in your private account workspace.
          </p>
        </div>
      )}

      {/* Tab 5: ACCOUNT SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-3xl">
          {/* Appearance & Preferences */}
          <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#080a0f] space-y-4">
            <h4 className="font-serif text-lg text-white font-semibold flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-300" />
              <span>Appearance & Display</span>
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <button
                onClick={() => setThemePreference('cinematic')}
                className={`p-3 rounded-xl border text-left cursor-pointer ${
                  themePreference === 'cinematic'
                    ? 'border-amber-400 bg-amber-400/10 text-white'
                    : 'border-white/10 text-neutral-400'
                }`}
              >
                <span className="block font-semibold mb-0.5">Cinematic Dark</span>
                <span className="text-[10px] text-neutral-500">Starlight embers & deep obsidian</span>
              </button>
              <button
                onClick={() => setThemePreference('minimal')}
                className={`p-3 rounded-xl border text-left cursor-pointer ${
                  themePreference === 'minimal'
                    ? 'border-amber-400 bg-amber-400/10 text-white'
                    : 'border-white/10 text-neutral-400'
                }`}
              >
                <span className="block font-semibold mb-0.5">Minimal Charcoal</span>
                <span className="text-[10px] text-neutral-500">Subtle clean slate contrast</span>
              </button>
            </div>
          </div>

          {/* Notifications & AI Behavior */}
          <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#080a0f] space-y-4">
            <h4 className="font-serif text-lg text-white font-semibold flex items-center gap-2">
              <Bell className="w-4 h-4 text-sky-400" />
              <span>Notifications & Workflow</span>
            </h4>
            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-neutral-300">Generation completion feedback</span>
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="rounded bg-neutral-800 border-white/20 text-amber-400"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-neutral-300">Streaming multi-turn response playback</span>
                <input
                  type="checkbox"
                  checked={streamResponses}
                  onChange={(e) => setStreamResponses(e.target.checked)}
                  className="rounded bg-neutral-800 border-white/20 text-amber-400"
                />
              </label>
            </div>
          </div>

          {/* Privacy & Connected Accounts */}
          <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#080a0f] space-y-4">
            <h4 className="font-serif text-lg text-white font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Privacy & Connected Accounts</span>
            </h4>
            <p className="text-xs text-neutral-400 font-light">
              Your generated storylines, 3D specs, and chat sessions are strictly private to this account.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-neutral-400">
              <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-center">
                <span>Google: Sandbox</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-center">
                <span>Apple: Sandbox</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-center">
                <span>GitHub: Sandbox</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-center">
                <span>Microsoft: Sandbox</span>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="pt-4 flex items-center justify-between">
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="px-4 py-2 rounded-xl bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 text-xs font-mono text-red-300 uppercase cursor-pointer"
              >
                Log Out of Account
              </button>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs font-mono uppercase cursor-pointer"
              >
                Log In
              </button>
            )}

            {!confirmReset ? (
              <button
                onClick={() => setConfirmReset(true)}
                className="text-xs font-mono text-neutral-500 hover:text-red-400 uppercase transition-colors cursor-pointer"
              >
                Clear Local Archive
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-400 font-mono">Confirm?</span>
                <button
                  onClick={() => {
                    resetAllData();
                    setConfirmReset(false);
                  }}
                  className="px-2 py-1 rounded bg-red-600 text-white text-[10px] font-mono uppercase"
                >
                  Yes
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-2 py-1 text-neutral-400 text-[10px] font-mono uppercase"
                >
                  No
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

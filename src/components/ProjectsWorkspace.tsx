import React, { useState } from 'react';
import { useAI } from '../context/AIContext';
import { useTimeline } from '../context/TimelineContext';
import {
  FolderPlus,
  Folder,
  Layers,
  Box,
  Music,
  PenTool,
  Code,
  Gamepad2,
  Trash2,
  Plus,
  Sparkles,
  ArrowRight,
  Bookmark,
  Compass,
} from 'lucide-react';

export const ProjectsWorkspace: React.FC = () => {
  const {
    projects,
    activeProjectId,
    selectProject,
    createProject,
    deleteProject,
    creations,
    deleteCreation,
    setCreateSubTab,
    setActiveNav,
  } = useAI();
  const { timelines, selectTimeline } = useTimeline();

  const [newProjectModal, setNewProjectModal] = useState(false);
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projCategory, setProjCategory] = useState('Game Development');

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [viewingCreationId, setViewingCreationId] = useState<string | null>(null);

  const activeProject = projects.find((p) => p.id === activeProjectId) || null;

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim()) return;
    createProject(projName.trim(), projDesc.trim(), projCategory);
    setProjName('');
    setProjDesc('');
    setNewProjectModal(false);
  };

  const projectItems = activeProject
    ? creations.filter((c) => activeProject.itemIds.includes(c.id) || c.projectId === activeProject.id)
    : [];

  const filteredCreations =
    activeFilter === 'all'
      ? creations
      : creations.filter((c) => c.type === activeFilter);

  const viewingItem = creations.find((c) => c.id === viewingCreationId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6 mb-8">
        <div>
          <div className="text-xs font-mono uppercase tracking-[0.25em] text-neutral-400 mb-1">
            INTELLIGENT REPOSITORY
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-white font-bold tracking-wide">
            PROJECTS & CREATIONS
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 font-light mt-1">
            Group your cross-tool assets into persistent projects with shared AI context.
          </p>
        </div>

        <button
          onClick={() => setNewProjectModal(true)}
          className="h-11 px-5 rounded-xl bg-white text-neutral-950 font-serif font-bold text-xs tracking-wider uppercase flex items-center gap-2 hover:bg-neutral-200 cursor-pointer self-start sm:self-auto"
        >
          <FolderPlus className="w-4 h-4 text-black" />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Ribbon */}
      <div className="mb-10">
        <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-3 flex items-center justify-between">
          <span>ACTIVE PROJECTS ({projects.length})</span>
          {activeProject && (
            <button
              onClick={() => selectProject(null)}
              className="text-[11px] text-amber-300 hover:underline cursor-pointer"
            >
              Clear Active Selection
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {projects.map((proj) => {
            const isSelected = proj.id === activeProjectId;
            const itemsCount = creations.filter(
              (c) => proj.itemIds.includes(c.id) || c.projectId === proj.id
            ).length;

            return (
              <div
                key={proj.id}
                onClick={() => selectProject(proj.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-400/80 bg-amber-400/10 shadow-[0_0_25px_rgba(251,191,36,0.12)]'
                    : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 uppercase mb-2">
                    <span className="text-amber-300">{proj.category}</span>
                    <span>{itemsCount} ASSETS</span>
                  </div>
                  <h3 className="font-serif text-lg text-white font-semibold mb-1">
                    {proj.name}
                  </h3>
                  <p className="text-xs text-neutral-400 font-light line-clamp-2">
                    {proj.description || 'No description provided.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-neutral-500">
                    {isSelected ? 'ACTIVE CONTEXT' : 'CLICK TO SELECT'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProject(proj.id);
                    }}
                    className="p-1 text-neutral-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Project Banner if selected */}
      {activeProject && (
        <div className="mb-10 p-6 rounded-3xl border border-amber-400/30 bg-gradient-to-r from-amber-950/20 via-black to-black">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 block mb-1">
                PROJECT CONTEXT ENGAGED
              </span>
              <h3 className="font-serif text-2xl text-white font-bold">{activeProject.name}</h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-xl font-light">
                {activeProject.description} — All generations in Writing, 3D, Music, and Code will align with this project's lore.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs font-mono">
              <button
                onClick={() => {
                  setCreateSubTab('game');
                  setActiveNav('create');
                }}
                className="px-3 py-1.5 rounded-lg bg-white text-black font-semibold uppercase hover:bg-neutral-200 cursor-pointer"
              >
                + Game Asset
              </button>
              <button
                onClick={() => {
                  setCreateSubTab('3d');
                  setActiveNav('create');
                }}
                className="px-3 py-1.5 rounded-lg bg-white/[0.08] text-white uppercase hover:bg-white/[0.15] cursor-pointer"
              >
                + 3D Model
              </button>
              <button
                onClick={() => {
                  setCreateSubTab('song');
                  setActiveNav('create');
                }}
                className="px-3 py-1.5 rounded-lg bg-white/[0.08] text-white uppercase hover:bg-white/[0.15] cursor-pointer"
              >
                + Music
              </button>
            </div>
          </div>
        </div>
      )}

      {/* My Creations Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4 mb-6">
          <div className="text-sm font-mono uppercase tracking-wider text-white">
            MY CREATIONS ({creations.length})
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs font-mono">
            {['all', 'story', 'song', '3d', 'game', 'code', 'doc'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1 rounded-lg uppercase tracking-wider transition-colors cursor-pointer ${
                  activeFilter === filter
                    ? 'bg-white text-black font-semibold'
                    : 'bg-white/[0.04] text-neutral-400 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Creations Grid */}
        {filteredCreations.length === 0 ? (
          <div className="text-center py-16 text-neutral-500 font-light">
            No creations found in this category. Generate something in CREATE studio!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCreations.map((item) => (
              <div
                key={item.id}
                onClick={() => setViewingCreationId(item.id)}
                className="p-5 rounded-2xl border border-white/[0.08] bg-[#080a0f] hover:border-white/[0.2] transition-all flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 uppercase mb-2">
                    <span className="text-amber-300 font-bold">{item.type}</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>

                  <h4 className="font-serif text-base text-white font-semibold group-hover:text-amber-100 transition-colors mb-2">
                    {item.title}
                  </h4>

                  <p className="text-xs text-neutral-400 font-light line-clamp-3 leading-relaxed mb-4">
                    {item.preview}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-neutral-400">
                  <span className="text-white group-hover:underline">Inspect Asset →</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCreation(item.id);
                    }}
                    className="p-1 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Creation Preview Modal */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-[#090b10] border border-white/[0.14] rounded-3xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono text-amber-300 uppercase tracking-widest block">
                  {viewingItem.type.toUpperCase()} SPECIFICATION
                </span>
                <h3 className="font-serif text-2xl text-white font-bold">{viewingItem.title}</h3>
              </div>
              <button
                onClick={() => setViewingCreationId(null)}
                className="p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="prose prose-invert max-w-none text-neutral-200 text-sm leading-relaxed font-light whitespace-pre-wrap mb-6">
              {viewingItem.content}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(viewingItem.content);
                  alert('Copied asset content to clipboard!');
                }}
                className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs tracking-wider uppercase"
              >
                Copy Content
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {newProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form
            onSubmit={handleCreateProject}
            className="w-full max-w-md bg-[#090b10] border border-white/[0.14] rounded-3xl p-6 sm:p-8 space-y-4"
          >
            <h3 className="font-serif text-2xl text-white font-bold tracking-wide">
              CREATE NEW PROJECT
            </h3>
            <p className="text-xs text-neutral-400 font-light">
              Projects maintain unified context across characters, 3D assets, music, and scripts.
            </p>

            <div>
              <label className="text-xs font-mono text-neutral-300 block mb-1">PROJECT NAME</label>
              <input
                type="text"
                value={projName}
                onChange={(e) => setProjName(e.target.value)}
                placeholder="e.g. Project: Midnight Outpost"
                required
                className="w-full h-11 px-3 rounded-xl bg-white/[0.05] border border-white/10 text-white text-sm focus:outline-none focus:border-amber-300"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-neutral-300 block mb-1">CATEGORY</label>
              <select
                value={projCategory}
                onChange={(e) => setProjCategory(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-[#0e1017] border border-white/10 text-white text-sm focus:outline-none"
              >
                <option value="Game Development">Game Development</option>
                <option value="Worldbuilding & Novel">Worldbuilding & Novel</option>
                <option value="Interactive Media">Interactive Media</option>
                <option value="Audio & Music Concept">Audio & Music Concept</option>
                <option value="Software & Tech Concept">Software & Tech Concept</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-neutral-300 block mb-1">DESCRIPTION & LORE</label>
              <textarea
                value={projDesc}
                onChange={(e) => setProjDesc(e.target.value)}
                rows={3}
                placeholder="Summary of universe rules, tone, and goals..."
                className="w-full p-3 rounded-xl bg-white/[0.05] border border-white/10 text-white text-sm focus:outline-none focus:border-amber-300"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setNewProjectModal(false)}
                className="px-4 py-2 text-xs font-mono text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-11 px-6 rounded-xl bg-white text-black font-semibold text-xs font-serif uppercase tracking-wider hover:bg-neutral-200"
              >
                Create Project
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

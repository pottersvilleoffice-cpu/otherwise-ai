import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAI } from '../context/AIContext';
import { CommunityPost, CommunityComment } from '../types/community';
import { AICard } from '../types/ai';
import { AICardComponent } from './AICardComponent';
import { LyriaMusicPlayer } from './LyriaMusicPlayer';
import { VeoVideoPlayer } from './VeoVideoPlayer';
import {
  Users,
  Sparkles,
  Heart,
  Flame,
  MessageSquare,
  Share2,
  MoreVertical,
  Flag,
  UserX,
  Trash2,
  Send,
  Plus,
  Filter,
  Check,
  UserPlus,
  UserCheck,
  TrendingUp,
  Video,
  Music,
  ImageIcon,
  X,
} from 'lucide-react';

interface CommunityViewProps {
  onOpenProfile?: (userId: string) => void;
  onStartMessage?: (userId: string) => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  onOpenProfile,
  onStartMessage,
}) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { creations, setActiveNav } = useAI();

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // New post state
  const [postContent, setPostContent] = useState('');
  const [selectedCreationId, setSelectedCreationId] = useState<string | null>(null);

  // Expanded comments state
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentsMap, setCommentsMap] = useState<Record<string, CommunityComment[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [replyParentMap, setReplyParentMap] = useState<Record<string, string | null>>({});

  // Report & Block Modals
  const [reportModalPostId, setReportModalPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('Inappropriate content');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitted, setReportReasonSubmitted] = useState(false);

  const [activeUserMenu, setActiveUserMenu] = useState<string | null>(null);

  const currentUserId = user?.id || 'usr-david';
  const currentUserName = user?.name || 'David Bodunde';
  const currentUserHandle = `@${(user?.name || 'davidbodunde').toLowerCase().replace(/\s+/g, '')}`;

  const fetchPosts = async (filter = activeFilter) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/community/posts?filter=${filter}`, {
        headers: { 'x-user-id': currentUserId },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.posts) {
          setPosts(data.posts);
        }
      }
    } catch (e) {
      console.warn('[Community] Fetch posts error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(activeFilter);
  }, [activeFilter]);

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const handleCreatePost = async () => {
    if (!postContent.trim() && !selectedCreationId) return;

    let attachedCard: AICard | undefined = undefined;
    let videoData: any = undefined;
    let audioData: any = undefined;
    let imageData: any = undefined;
    let mediaType: 'image' | 'video' | 'audio' | 'card' | 'none' = 'none';

    if (selectedCreationId) {
      const found = creations.find((c) => c.id === selectedCreationId);
      if (found) {
        if (found.type === 'song' && found.metadata?.lyrics) {
          audioData = {
            title: found.title,
            genre: found.metadata.genre || 'Music',
            mood: found.metadata.mood || 'Full Track',
            bpm: found.metadata.bpm || 120,
            vocalStyle: 'Harmonic Vocals',
            instruments: ['Rhythm Stems', 'Melodic Lead'],
            lyrics: found.metadata.lyrics || [],
            musicGenerationPrompt: found.title,
            coverArtConcept: found.title,
            audioUrl: found.metadata.audioUrl,
          };
          mediaType = 'audio';
        } else if (found.type === 'video' && found.metadata?.url) {
          videoData = {
            id: found.id,
            url: found.metadata.url,
            title: found.title,
            prompt: found.title,
            aspectRatio: found.metadata.aspectRatio || '16:9',
            duration: 5,
            model: 'Google Veo 2.0',
          };
          mediaType = 'video';
        } else if (found.type === 'image' && (found.preview || found.metadata?.url)) {
          imageData = {
            id: found.id,
            url: found.metadata?.url || found.preview,
            prompt: found.title,
            aspectRatio: '1:1',
          };
          mediaType = 'image';
        }
      }
    }

    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: postContent.trim(),
          card: attachedCard,
          mediaType,
          videoData,
          audioData,
          imageData,
          userId: currentUserId,
          userName: currentUserName,
          userHandle: currentUserHandle,
        }),
      });

      if (res.ok) {
        setPostContent('');
        setSelectedCreationId(null);
        setCreateModalOpen(false);
        fetchPosts(activeFilter);
      }
    } catch (e) {
      console.error('Create post error:', e);
    }
  };

  const handleToggleReaction = async (postId: string, reactionType: 'like' | 'sparkle' | 'fire' | 'mindblown') => {
    try {
      const res = await fetch(`/api/community/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reactionType, userId: currentUserId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.post) {
          setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, ...data.post } : p)));
        }
      }
    } catch (e) {
      console.error('Toggle reaction error:', e);
    }
  };

  const handleToggleComments = async (postId: string) => {
    const isExpanded = !!expandedComments[postId];
    setExpandedComments((prev) => ({ ...prev, [postId]: !isExpanded }));

    if (!isExpanded && !commentsMap[postId]) {
      try {
        const res = await fetch(`/api/community/posts/${postId}/comments`);
        if (res.ok) {
          const data = await res.json();
          if (data.comments) {
            setCommentsMap((prev) => ({ ...prev, [postId]: data.comments }));
          }
        }
      } catch (e) {
        console.error('Fetch comments error:', e);
      }
    }
  };

  const handleAddComment = async (postId: string) => {
    const text = (commentInputs[postId] || '').trim();
    if (!text) return;

    const parentId = replyParentMap[postId] || undefined;

    try {
      const res = await fetch(`/api/community/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: text,
          parentId,
          userId: currentUserId,
          userName: currentUserName,
          userHandle: currentUserHandle,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.comment) {
          setCommentsMap((prev) => ({
            ...prev,
            [postId]: [...(prev[postId] || []), data.comment],
          }));
          setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
          setReplyParentMap((prev) => ({ ...prev, [postId]: null }));
          setPosts((prev) =>
            prev.map((p) => (p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p))
          );
        }
      }
    } catch (e) {
      console.error('Add comment error:', e);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const res = await fetch(`/api/community/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': currentUserId },
      });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      }
    } catch (e) {
      console.error('Delete post error:', e);
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      const res = await fetch(`/api/community/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': currentUserId },
      });
      if (res.ok) {
        setCommentsMap((prev) => ({
          ...prev,
          [postId]: (prev[postId] || []).filter((c) => c.id !== commentId),
        }));
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, commentsCount: Math.max(0, p.commentsCount - 1) } : p))
        );
      }
    } catch (e) {
      console.error('Delete comment error:', e);
    }
  };

  const handleToggleFollow = async (authorId: string) => {
    try {
      const res = await fetch(`/api/community/users/${authorId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId }),
      });
      if (res.ok) {
        fetchPosts(activeFilter);
      }
    } catch (e) {
      console.error('Toggle follow error:', e);
    }
  };

  const handleReportPost = async () => {
    if (!reportModalPostId) return;
    try {
      await fetch('/api/community/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterId: currentUserId,
          targetType: 'post',
          targetId: reportModalPostId,
          reason: reportReason,
          details: reportDetails,
        }),
      });
      setReportReasonSubmitted(true);
      setTimeout(() => {
        setReportModalPostId(null);
        setReportReasonSubmitted(false);
      }, 1800);
    } catch (e) {
      console.error('Report post error:', e);
    }
  };

  const handleBlockUser = async (blockedUserId: string) => {
    try {
      await fetch('/api/community/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, blockedUserId }),
      });
      fetchPosts(activeFilter);
      setActiveUserMenu(null);
    } catch (e) {
      console.error('Block user error:', e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-6 h-6 text-amber-400" />
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide">
              OTHERWISE Community
            </h1>
          </div>
          <p className="text-xs text-neutral-400 font-light">
            Share AI music, Google Veo videos, generative art, and shareable cards with creators worldwide.
          </p>
        </div>

        <button
          onClick={() => {
            if (!isAuthenticated) openAuthModal();
            else setCreateModalOpen(true);
          }}
          className="self-start md:self-auto px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-black font-bold text-xs shadow-lg transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Post or AI Card</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar: Profile & Navigation (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          {/* User Profile Summary Card */}
          <div className="rounded-3xl border border-white/[0.12] bg-[#090b10] p-5 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-indigo-600 text-black font-bold flex items-center justify-center text-lg shadow-lg">
                {currentUserName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white truncate">{currentUserName}</h3>
                <p className="text-xs font-mono text-neutral-400 truncate">{currentUserHandle}</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 font-light mb-4 leading-relaxed">
              {user?.bio || 'Curious creator exploring alternate timelines, generative music, and 3D worlds.'}
            </p>

            <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-white/[0.06] text-center font-mono text-xs">
              <div>
                <p className="text-white font-bold">{creations.length}</p>
                <p className="text-[10px] text-neutral-500 uppercase">Creations</p>
              </div>
              <div>
                <p className="text-white font-bold">148</p>
                <p className="text-[10px] text-neutral-500 uppercase">Followers</p>
              </div>
              <div>
                <p className="text-white font-bold">32</p>
                <p className="text-[10px] text-neutral-500 uppercase">Following</p>
              </div>
            </div>

            <button
              onClick={() => setActiveNav('profile')}
              className="w-full mt-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-mono text-neutral-200 hover:text-white transition-colors cursor-pointer text-center"
            >
              View Full Profile
            </button>
          </div>

          {/* Feed Filter Categories */}
          <div className="rounded-3xl border border-white/[0.08] bg-[#080a0f] p-4 font-mono text-xs space-y-1">
            <p className="text-[10px] text-neutral-500 uppercase px-3 py-1 font-bold">Feed Categories</p>
            {[
              { id: 'all', label: 'All Community Posts', icon: Users },
              { id: 'trending', label: 'Trending', icon: TrendingUp },
              { id: 'video', label: 'Google Veo Videos', icon: Video },
              { id: 'song', label: 'Music & Songs', icon: Music },
              { id: 'image', label: 'AI Artwork', icon: ImageIcon },
              { id: 'card', label: 'AI Cards', icon: Sparkles },
            ].map((cat) => {
              const Icon = cat.icon;
              const isActive = activeFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleFilterChange(cat.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-400/20 text-amber-200 font-bold border border-amber-400/30'
                      : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className="w-4 h-4 text-amber-400" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Middle Main Column: Social Feed (9 cols) */}
        <div className="lg:col-span-9 space-y-6">
          {/* Create Post Prompt Banner */}
          <div
            onClick={() => {
              if (!isAuthenticated) openAuthModal();
              else setCreateModalOpen(true);
            }}
            className="rounded-3xl border border-white/[0.1] bg-[#090c12] p-4 sm:p-5 flex items-center gap-4 cursor-pointer hover:border-amber-400/40 transition-all shadow-xl"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-indigo-600 text-black font-bold flex items-center justify-center text-sm shrink-0">
              {currentUserName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3 text-xs text-neutral-400 font-light">
              Share a new AI creation, song track, Google Veo video, or card with the community...
            </div>
            <button className="px-3.5 py-2 rounded-xl bg-amber-400 text-black font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-md">
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Post</span>
            </button>
          </div>

          {/* Posts Feed */}
          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-block w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs font-mono text-neutral-400">Loading Community Feed...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-white/[0.08] bg-[#080a0f]">
              <Users className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
              <h3 className="font-serif text-lg text-white mb-1">No Posts in this Feed</h3>
              <p className="text-xs text-neutral-400 mb-6">Be the first creator to share in this category!</p>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 text-black font-bold text-xs cursor-pointer"
              >
                Create First Post
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-3xl border border-white/[0.12] bg-[#090b10] p-5 sm:p-6 shadow-2xl transition-all duration-200 hover:border-white/20"
                >
                  {/* Author Header */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        onClick={() => onOpenProfile && onOpenProfile(post.author.id)}
                        className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-indigo-600 text-black font-bold flex items-center justify-center text-sm shrink-0 shadow-lg cursor-pointer hover:opacity-90"
                      >
                        {post.author.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4
                            onClick={() => onOpenProfile && onOpenProfile(post.author.id)}
                            className="text-xs sm:text-sm font-bold text-white truncate cursor-pointer hover:text-amber-300 transition-colors"
                          >
                            {post.author.name}
                          </h4>
                          {post.author.id !== currentUserId && (
                            <button
                              onClick={() => handleToggleFollow(post.author.id)}
                              className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-amber-400/40 text-amber-300 hover:bg-amber-400/20 transition-colors cursor-pointer"
                            >
                              + Follow
                            </button>
                          )}
                        </div>
                        <p className="text-[10px] font-mono text-neutral-400 truncate">
                          {post.author.handle} · {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    {/* Options Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setActiveUserMenu(activeUserMenu === post.id ? null : post.id)}
                        className="p-1.5 rounded-full bg-white/[0.04] text-neutral-400 hover:text-white cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeUserMenu === post.id && (
                        <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#0d0f17] border border-white/[0.16] p-1.5 shadow-2xl z-40 font-mono text-xs">
                          {post.userId !== currentUserId && onStartMessage && (
                            <button
                              onClick={() => {
                                onStartMessage(post.userId);
                                setActiveUserMenu(null);
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl text-neutral-200 hover:text-white hover:bg-white/[0.06] flex items-center gap-2 cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                              <span>Private Message</span>
                            </button>
                          )}
                          {onOpenProfile && (
                            <button
                              onClick={() => {
                                onOpenProfile(post.author.id);
                                setActiveUserMenu(null);
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/[0.06] flex items-center gap-2 cursor-pointer"
                            >
                              <Users className="w-3.5 h-3.5 text-neutral-400" />
                              <span>View Profile</span>
                            </button>
                          )}
                          {post.userId === currentUserId && (
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="w-full text-left px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-950/30 flex items-center gap-2 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Post</span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setReportModalPostId(post.id);
                              setActiveUserMenu(null);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-neutral-300 hover:bg-white/[0.06] flex items-center gap-2 cursor-pointer"
                          >
                            <Flag className="w-3.5 h-3.5 text-amber-400" />
                            <span>Report Content</span>
                          </button>
                          {post.userId !== currentUserId && (
                            <button
                              onClick={() => handleBlockUser(post.userId)}
                              className="w-full text-left px-3 py-2 rounded-xl text-neutral-400 hover:text-rose-300 hover:bg-rose-950/20 flex items-center gap-2 cursor-pointer"
                            >
                              <UserX className="w-3.5 h-3.5" />
                              <span>Block User</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Post Text Content */}
                  {post.content && (
                    <p className="text-xs sm:text-sm text-neutral-200 font-light mb-4 leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>
                  )}

                  {/* Attached Media Rendering */}
                  <div className="mb-4">
                    {post.card && <AICardComponent card={post.card} compact />}

                    {post.audioData && !post.card && (
                      <div className="rounded-2xl border border-white/10 bg-black/40 p-2">
                        <LyriaMusicPlayer song={post.audioData} />
                      </div>
                    )}

                    {post.videoData && !post.card && (
                      <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/40">
                        <VeoVideoPlayer video={post.videoData} />
                      </div>
                    )}

                    {post.imageData && !post.card && (
                      <div className="rounded-2xl overflow-hidden border border-white/10 max-h-96">
                        <img src={post.imageData.url} alt="Shared" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Reaction Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.06] text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleReaction(post.id, 'like')}
                        className="px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-rose-500/20 border border-white/[0.08] text-neutral-300 hover:text-rose-300 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Heart className="w-3.5 h-3.5 text-rose-400" />
                        <span>{post.reactions.like || 0}</span>
                      </button>

                      <button
                        onClick={() => handleToggleReaction(post.id, 'sparkle')}
                        className="px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-amber-500/20 border border-white/[0.08] text-neutral-300 hover:text-amber-300 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>{post.reactions.sparkle || 0}</span>
                      </button>

                      <button
                        onClick={() => handleToggleReaction(post.id, 'fire')}
                        className="px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-orange-500/20 border border-white/[0.08] text-neutral-300 hover:text-orange-300 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Flame className="w-3.5 h-3.5 text-orange-400" />
                        <span>{post.reactions.fire || 0}</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleToggleComments(post.id)}
                      className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] text-neutral-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{post.commentsCount || 0} Comments</span>
                    </button>
                  </div>

                  {/* Expandable Comments Section */}
                  {expandedComments[post.id] && (
                    <div className="mt-4 pt-4 border-t border-white/[0.08] space-y-3 font-mono text-xs">
                      {/* Comments List */}
                      {commentsMap[post.id] && commentsMap[post.id].length > 0 ? (
                        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                          {commentsMap[post.id].map((cm) => (
                            <div key={cm.id} className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-start justify-between gap-2">
                              <div>
                                <p className="text-[10px] text-amber-300 font-bold mb-0.5">{cm.author.name} <span className="text-neutral-500 font-normal">{cm.author.handle}</span></p>
                                <p className="text-xs text-neutral-200 font-light">{cm.content}</p>
                              </div>
                              {cm.userId === currentUserId && (
                                <button
                                  onClick={() => handleDeleteComment(post.id, cm.id)}
                                  className="text-neutral-500 hover:text-rose-400 p-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-neutral-500 italic">No comments yet. Start the conversation!</p>
                      )}

                      {/* Comment Input */}
                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="text"
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                          placeholder="Write a comment..."
                          className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400/50"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="p-2 rounded-xl bg-amber-400 text-black font-bold cursor-pointer hover:bg-amber-300"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Post Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#0a0c12] border border-white/[0.16] rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <span>Create Community Post</span>
              </h3>
              <button onClick={() => setCreateModalOpen(false)} className="p-1.5 rounded-full bg-white/[0.05] text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              rows={4}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="What creative insight, song, video, or AI concept would you like to share?"
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400/50 resize-none"
            />

            {/* Select Creation to Attach */}
            {creations.length > 0 && (
              <div className="font-mono text-xs space-y-1">
                <label className="text-[10px] text-neutral-400 block font-bold uppercase">Attach AI Creation (Optional)</label>
                <select
                  value={selectedCreationId || ''}
                  onChange={(e) => setSelectedCreationId(e.target.value || null)}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none"
                >
                  <option value="" className="bg-neutral-900">None (Text Only)</option>
                  {creations.map((c) => (
                    <option key={c.id} value={c.id} className="bg-neutral-900">
                      [{c.type.toUpperCase()}] {c.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
              <button
                onClick={() => setCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 text-xs font-mono cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePost}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 text-black font-bold text-xs cursor-pointer shadow-lg hover:brightness-110"
              >
                Post to Community
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Content Modal */}
      {reportModalPostId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#0a0c12] border border-white/[0.16] rounded-3xl p-6 space-y-4 font-mono text-xs shadow-2xl">
            <h3 className="font-serif text-lg text-white font-bold flex items-center gap-2">
              <Flag className="w-5 h-5 text-amber-400" />
              <span>Report Content</span>
            </h3>

            {reportSubmitted ? (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-center font-bold">
                Report submitted successfully. Thank you for keeping Community safe!
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] text-neutral-400 block font-bold">Reason for Report</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="Inappropriate content" className="bg-neutral-900">Inappropriate content</option>
                    <option value="Spam or misleading" className="bg-neutral-900">Spam or misleading</option>
                    <option value="Harassment or abuse" className="bg-neutral-900">Harassment or abuse</option>
                    <option value="Copyright / Intellectual Property" className="bg-neutral-900">Copyright / Intellectual Property</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-neutral-400 block font-bold">Details (Optional)</label>
                  <textarea
                    rows={3}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Provide additional context..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
                  <button
                    onClick={() => setReportModalPostId(null)}
                    className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] text-neutral-300 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReportPost}
                    className="px-4 py-1.5 rounded-xl bg-amber-400 text-black font-bold cursor-pointer hover:bg-amber-300"
                  >
                    Submit Report
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

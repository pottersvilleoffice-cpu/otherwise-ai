import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  MessageSquare,
  UserX,
  Flag,
  Calendar,
  X,
  Sparkles,
  Heart,
  Share2,
  Check,
} from 'lucide-react';

interface PublicUser {
  id: string;
  name: string;
  handle: string;
  avatarUrl?: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
  createdAt: string;
}

interface UserProfileModalProps {
  userId: string | null;
  onClose: () => void;
  onStartMessage: (userId: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  userId,
  onClose,
  onStartMessage,
}) => {
  const { user: currentUser } = useAuth();
  const currentUserId = currentUser?.id || 'usr-david';

  const [profileUser, setProfileUser] = useState<PublicUser | null>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [reported, setReported] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);

    const loadProfile = async () => {
      try {
        const res = await fetch(`/api/users/${userId}`, {
          headers: { 'x-user-id': currentUserId },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setProfileUser(data.user);
          }
        }

        // Fetch user's public community posts
        const postsRes = await fetch('/api/community/posts', {
          headers: { 'x-user-id': currentUserId },
        });
        if (postsRes.ok) {
          const pData = await postsRes.json();
          if (pData.posts) {
            setUserPosts(pData.posts.filter((p: any) => p.userId === userId));
          }
        }
      } catch (err) {
        console.error('Error loading public profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId, currentUserId]);

  if (!userId) return null;

  const isOwnProfile = profileUser?.id === currentUserId;

  const handleToggleFollow = async () => {
    if (!profileUser) return;
    try {
      const res = await fetch(`/api/community/users/${profileUser.id}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.isFollowing);
        setProfileUser((prev) =>
          prev
            ? {
                ...prev,
                followersCount: data.isFollowing ? prev.followersCount + 1 : Math.max(0, prev.followersCount - 1),
              }
            : null
        );
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const handleBlock = async () => {
    if (!profileUser) return;
    try {
      await fetch('/api/community/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, blockedUserId: profileUser.id }),
      });
      setBlocked(true);
      setTimeout(onClose, 1500);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleReport = async () => {
    if (!profileUser) return;
    try {
      await fetch('/api/community/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterId: currentUserId,
          targetType: 'user',
          targetId: profileUser.id,
          reason: 'Inappropriate behavior',
        }),
      });
      setReported(true);
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-xl bg-[#0a0d14] border border-white/[0.14] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6 max-h-[90vh] flex flex-col">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 hover:text-white transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {loading ? (
          <div className="py-20 text-center font-mono text-xs text-neutral-500">
            Loading creator profile...
          </div>
        ) : !profileUser ? (
          <div className="py-20 text-center space-y-2">
            <p className="text-sm text-neutral-400">User profile not found.</p>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/[0.06] text-xs font-mono text-white"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="overflow-y-auto space-y-6 pr-1">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-400 to-indigo-600 text-black font-bold flex items-center justify-center text-xl shadow-xl shrink-0">
                  {profileUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">
                    {profileUser.name}
                  </h2>
                  <p className="text-xs font-mono text-amber-300 mb-1">{profileUser.handle}</p>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400">
                    <Calendar className="w-3 h-3" />
                    <span>
                      Joined{' '}
                      {new Date(profileUser.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              {!isOwnProfile && (
                <div className="flex items-center gap-2 self-stretch sm:self-center">
                  <button
                    onClick={() => {
                      onClose();
                      onStartMessage(profileUser.id);
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white text-black font-serif font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-black" />
                    <span>Message</span>
                  </button>

                  <button
                    onClick={handleToggleFollow}
                    className={`px-3.5 py-2.5 rounded-xl border text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                      isFollowing
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                        : 'border-white/[0.1] bg-white/[0.05] text-white hover:bg-white/[0.1]'
                    }`}
                  >
                    {isFollowing ? 'Following' : '+ Follow'}
                  </button>
                </div>
              )}
            </div>

            {/* Bio */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <p className="text-xs text-neutral-300 font-light leading-relaxed">
                {profileUser.bio || 'Explorer and creator on OTHERWISE.'}
              </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <p className="text-lg font-bold text-white font-mono">{userPosts.length}</p>
                <p className="text-[10px] font-mono text-neutral-400 uppercase">Public Posts</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <p className="text-lg font-bold text-white font-mono">{profileUser.followersCount}</p>
                <p className="text-[10px] font-mono text-neutral-400 uppercase">Followers</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <p className="text-lg font-bold text-white font-mono">{profileUser.followingCount}</p>
                <p className="text-[10px] font-mono text-neutral-400 uppercase">Following</p>
              </div>
            </div>

            {/* Public Community Creations */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                Public Community Posts ({userPosts.length})
              </h4>
              {userPosts.length === 0 ? (
                <p className="text-xs text-neutral-500 font-mono py-4 text-center">
                  No public posts shared yet.
                </p>
              ) : (
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {userPosts.map((post) => (
                    <div
                      key={post.id}
                      className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs space-y-1.5"
                    >
                      <p className="text-neutral-200">{post.content}</p>
                      <div className="flex items-center gap-3 text-[10px] font-mono text-neutral-500">
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        <span>·</span>
                        <span>{post.reactions?.like || 0} Likes</span>
                        <span>·</span>
                        <span>{post.commentsCount || 0} Comments</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Security actions on other users */}
            {!isOwnProfile && (
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-neutral-500">
                <button
                  onClick={handleReport}
                  disabled={reported}
                  className="hover:text-amber-400 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>{reported ? 'Reported' : 'Report Creator'}</span>
                </button>

                <button
                  onClick={handleBlock}
                  disabled={blocked}
                  className="hover:text-rose-400 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>{blocked ? 'Blocked' : 'Block Creator'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

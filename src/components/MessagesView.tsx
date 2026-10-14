import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare,
  Search,
  Plus,
  Send,
  MoreVertical,
  Check,
  CheckCheck,
  Trash2,
  UserX,
  Flag,
  LogOut,
  ArrowLeft,
  User,
  ShieldAlert,
  Clock,
  Sparkles,
  X,
} from 'lucide-react';

interface ParticipantUser {
  id: string;
  name: string;
  handle: string;
  avatarUrl?: string;
  bio?: string;
}

interface ConversationItem {
  id: string;
  participants: string[];
  participantUsers: ParticipantUser[];
  lastMessage?: {
    text: string;
    senderId: string;
    createdAt: string;
  };
  unreadCount: number;
  updatedAt: string;
}

interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  status: 'sent' | 'delivered' | 'read';
}

interface MessagesViewProps {
  initialTargetUserId?: string | null;
  onViewUserProfile?: (userId: string) => void;
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  initialTargetUserId,
  onViewUserProfile,
}) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const currentUserId = user?.id || 'usr-david';

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Search & New Chat state
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [userSearchResults, setUserSearchResults] = useState<ParticipantUser[]>([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);

  // Active Menu / Modals
  const [conversationMenuOpen, setConversationMenuOpen] = useState(false);
  const [activeMessageIdMenu, setActiveMessageIdMenu] = useState<string | null>(null);
  const [blockConfirmUser, setBlockConfirmUser] = useState<ParticipantUser | null>(null);
  const [reportModalUser, setReportModalUser] = useState<ParticipantUser | null>(null);
  const [reportReason, setReportReason] = useState('Harassment or spam');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch all user conversations
  const fetchConversations = async (silent = false) => {
    if (!silent) setLoadingConvs(true);
    try {
      const res = await fetch('/api/messages/conversations', {
        headers: { 'x-user-id': currentUserId },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.conversations) {
          setConversations(data.conversations);
          // If initialTargetUserId is passed and no active conv is set, find or create it
          if (initialTargetUserId && !activeConversationId) {
            const existing = data.conversations.find((c: ConversationItem) =>
              c.participants.includes(initialTargetUserId)
            );
            if (existing) {
              setActiveConversationId(existing.id);
            } else {
              startConversationWithUser(initialTargetUserId);
            }
          }
        }
      }
    } catch (err) {
      console.warn('[Messages] Fetch conversations error:', err);
    } finally {
      if (!silent) setLoadingConvs(false);
    }
  };

  // Fetch messages for active conversation
  const fetchActiveMessages = async (convId: string, silent = false) => {
    if (!convId) return;
    if (!silent) setLoadingMessages(true);
    try {
      const res = await fetch(`/api/messages/conversations/${convId}`, {
        headers: { 'x-user-id': currentUserId },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.messages) {
          setMessages(data.messages);
        }
      }
    } catch (err) {
      console.warn('[Messages] Fetch messages error:', err);
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, [currentUserId]);

  // Load messages when activeConversationId changes
  useEffect(() => {
    if (activeConversationId) {
      fetchActiveMessages(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Real-time polling interval: checks for new messages and conversation updates every 3 seconds
  useEffect(() => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(() => {
      fetchConversations(true);
      if (activeConversationId) {
        fetchActiveMessages(activeConversationId, true);
      }
    }, 3000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [activeConversationId, currentUserId]);

  // Search users for new chat modal
  const handleSearchUsers = async (query: string) => {
    setUserSearchLoading(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`, {
        headers: { 'x-user-id': currentUserId },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.users) {
          setUserSearchResults(data.users);
        }
      }
    } catch (e) {
      console.warn('[Messages] User search error:', e);
    } finally {
      setUserSearchLoading(false);
    }
  };

  const startConversationWithUser = async (targetUserId: string) => {
    try {
      const res = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUserId,
        },
        body: JSON.stringify({ targetUserId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.conversation) {
          setIsNewChatModalOpen(false);
          setActiveConversationId(data.conversation.id);
          await fetchConversations(true);
        }
      }
    } catch (err) {
      console.error('[Messages] Start conversation error:', err);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeConversationId || isSending) return;

    const textToSend = inputText.trim();
    setInputText('');
    setIsSending(true);

    // Optimistic UI insert
    const tempId = `temp_${Date.now()}`;
    const optimisticMessage: DirectMessage = {
      id: tempId,
      conversationId: activeConversationId,
      senderId: currentUserId,
      text: textToSend,
      createdAt: new Date().toISOString(),
      status: 'sent',
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const res = await fetch(`/api/messages/conversations/${activeConversationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUserId,
        },
        body: JSON.stringify({ text: textToSend }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setMessages((prev) =>
            prev.map((m) => (m.id === tempId ? data.message : m))
          );
          fetchConversations(true);
        }
      } else {
        // Remove optimistic if failed
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      }
    } catch (err) {
      console.error('[Messages] Send message error:', err);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const res = await fetch(`/api/messages/messages/${messageId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': currentUserId },
      });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
        setActiveMessageIdMenu(null);
        fetchConversations(true);
      }
    } catch (err) {
      console.error('[Messages] Delete message error:', err);
    }
  };

  const handleLeaveConversation = async (convId: string) => {
    try {
      const res = await fetch(`/api/messages/conversations/${convId}/leave`, {
        method: 'POST',
        headers: { 'x-user-id': currentUserId },
      });
      if (res.ok) {
        setActiveConversationId(null);
        setConversationMenuOpen(false);
        fetchConversations();
      }
    } catch (err) {
      console.error('[Messages] Leave conversation error:', err);
    }
  };

  const handleBlockUser = async (targetUserId: string) => {
    try {
      await fetch('/api/community/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, blockedUserId: targetUserId }),
      });
      setBlockConfirmUser(null);
      setConversationMenuOpen(false);
      if (activeConversationId) {
        handleLeaveConversation(activeConversationId);
      }
    } catch (err) {
      console.error('[Messages] Block user error:', err);
    }
  };

  const handleReportUser = async () => {
    if (!reportModalUser) return;
    try {
      await fetch('/api/community/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterId: currentUserId,
          targetType: 'user',
          targetId: reportModalUser.id,
          reason: reportReason,
          details: reportDetails,
        }),
      });
      setReportSuccess(true);
      setTimeout(() => {
        setReportSuccess(false);
        setReportModalUser(null);
        setReportDetails('');
      }, 2000);
    } catch (err) {
      console.error('[Messages] Report user error:', err);
    }
  };

  // Find the other participant in active conversation
  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const otherParticipant = activeConversation?.participantUsers.find(
    (p) => p.id !== currentUserId
  ) || activeConversation?.participantUsers[0];

  // Filter conversations by search
  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const otherUser = c.participantUsers.find((p) => p.id !== currentUserId) || c.participantUsers[0];
    return (
      otherUser?.name.toLowerCase().includes(q) ||
      otherUser?.handle.toLowerCase().includes(q) ||
      c.lastMessage?.text.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-8 h-[calc(100vh-4.5rem)] min-h-[550px] flex flex-col">
      {/* Top Section Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-300">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-lg sm:text-xl font-bold text-white tracking-wide">
              Direct Messages
            </h1>
            <p className="text-[11px] font-mono text-neutral-400">
              Encrypted 1-on-1 private conversations · Never shared in Community
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setIsNewChatModalOpen(true);
            handleSearchUsers('');
          }}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-serif font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4 text-black stroke-[3]" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Main Messaging Container: Split-Pane */}
      <div className="flex-1 rounded-3xl border border-white/[0.1] bg-[#080a0f] shadow-2xl flex overflow-hidden">
        {/* Left Pane: Inbox / Conversation List */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-white/[0.08] flex flex-col bg-[#07090e] shrink-0 ${
            activeConversationId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Search Bar */}
          <div className="p-3 border-b border-white/[0.06]">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-neutral-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
            {loadingConvs ? (
              <div className="p-8 text-center text-xs font-mono text-neutral-500">
                Loading conversations...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto text-neutral-500">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <p className="text-xs text-neutral-400">No conversations found</p>
                <button
                  onClick={() => {
                    setIsNewChatModalOpen(true);
                    handleSearchUsers('');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.06] text-[11px] font-mono text-amber-300 hover:bg-white/[0.1] transition-colors"
                >
                  + Start a Conversation
                </button>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const other = conv.participantUsers.find((p) => p.id !== currentUserId) || conv.participantUsers[0];
                const isActive = activeConversationId === conv.id;
                const formattedTime = conv.updatedAt
                  ? new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '';

                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversationId(conv.id)}
                    className={`w-full text-left p-3.5 flex items-center gap-3 transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-amber-400/15 border-l-4 border-amber-400'
                        : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    {/* User Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-400 to-indigo-600 text-black font-bold flex items-center justify-center text-sm shadow-md">
                        {other?.name ? other.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#07090e]" />
                    </div>

                    {/* Metadata */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold text-white truncate max-w-[140px]">
                          {other?.name || 'User'}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500 shrink-0">
                          {formattedTime}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs text-neutral-400 truncate font-light">
                          {conv.lastMessage?.text || 'Started a new conversation'}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-black text-[9px] font-mono font-bold shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Active Chat View */}
        <div
          className={`flex-1 flex flex-col bg-[#090b10] ${
            !activeConversationId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeConversationId && otherParticipant ? (
            <>
              {/* Chat Header */}
              <div className="h-16 border-b border-white/[0.08] px-4 flex items-center justify-between bg-[#080a0f]/80 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-3">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setActiveConversationId(null)}
                    className="md:hidden p-1.5 rounded-lg bg-white/[0.05] text-neutral-300 hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  {/* Avatar */}
                  <div
                    onClick={() => onViewUserProfile && onViewUserProfile(otherParticipant.id)}
                    className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-indigo-600 text-black font-bold flex items-center justify-center text-sm cursor-pointer shadow-md"
                  >
                    {otherParticipant.name.charAt(0).toUpperCase()}
                  </div>

                  <div
                    onClick={() => onViewUserProfile && onViewUserProfile(otherParticipant.id)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs sm:text-sm font-bold text-white hover:text-amber-300 transition-colors">
                        {otherParticipant.name}
                      </h3>
                      <span className="text-[10px] font-mono text-neutral-500">
                        {otherParticipant.handle}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Active now · Direct Message</span>
                    </div>
                  </div>
                </div>

                {/* Conversation Menu */}
                <div className="relative">
                  <button
                    onClick={() => setConversationMenuOpen(!conversationMenuOpen)}
                    className="p-2 rounded-xl hover:bg-white/[0.08] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {conversationMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#0c0e14] border border-white/[0.12] p-1.5 shadow-2xl z-50 text-xs font-mono">
                      <button
                        onClick={() => {
                          setConversationMenuOpen(false);
                          if (onViewUserProfile) onViewUserProfile(otherParticipant.id);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/[0.06] flex items-center gap-2"
                      >
                        <User className="w-3.5 h-3.5 text-neutral-400" />
                        <span>View Public Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          setConversationMenuOpen(false);
                          setReportModalUser(otherParticipant);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-neutral-300 hover:text-amber-300 hover:bg-white/[0.06] flex items-center gap-2"
                      >
                        <Flag className="w-3.5 h-3.5 text-amber-400" />
                        <span>Report User</span>
                      </button>

                      <button
                        onClick={() => {
                          setConversationMenuOpen(false);
                          setBlockConfirmUser(otherParticipant);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-950/20 flex items-center gap-2"
                      >
                        <UserX className="w-3.5 h-3.5 text-rose-400" />
                        <span>Block User</span>
                      </button>

                      <button
                        onClick={() => handleLeaveConversation(activeConversationId)}
                        className="w-full text-left px-3 py-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/[0.06] flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Leave Conversation</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {/* Security Badge */}
                <div className="max-w-md mx-auto text-center p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] mb-4">
                  <p className="text-[10px] font-mono text-neutral-400 leading-relaxed">
                    🔒 Messages are strictly end-to-end private between you and <span className="text-amber-300 font-bold">{otherParticipant.name}</span>. No third party or community member can view this thread.
                  </p>
                </div>

                {loadingMessages ? (
                  <div className="py-12 text-center text-xs font-mono text-neutral-500">
                    Loading message history...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-16 text-center space-y-2">
                    <p className="text-xs text-neutral-400">No messages yet.</p>
                    <p className="text-[11px] text-neutral-500 font-mono">
                      Say hello to {otherParticipant.name} to start your conversation!
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === currentUserId;
                    const timeFormatted = new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group relative`}
                      >
                        {/* Bubble */}
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                            isMe
                              ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-black font-medium shadow-md rounded-br-xs'
                              : 'bg-white/[0.07] text-neutral-100 border border-white/[0.08] shadow-sm rounded-bl-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                          <div
                            className={`flex items-center justify-end gap-1 mt-1 text-[9px] font-mono ${
                              isMe ? 'text-black/70' : 'text-neutral-400'
                            }`}
                          >
                            <span>{timeFormatted}</span>
                            {isMe && (
                              <span title={msg.status === 'read' ? 'Read' : msg.status === 'delivered' ? 'Delivered' : 'Sent'}>
                                {msg.status === 'read' ? (
                                  <CheckCheck className="w-3 h-3 text-black stroke-[2.5]" />
                                ) : msg.status === 'delivered' ? (
                                  <CheckCheck className="w-3 h-3 text-black/60 stroke-[2]" />
                                ) : (
                                  <Check className="w-3 h-3 text-black/60 stroke-[2]" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Message Actions (Delete own message) */}
                        {isMe && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="text-[10px] font-mono text-neutral-500 hover:text-red-400 flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Field */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 sm:p-4 border-t border-white/[0.08] bg-[#080a0f] shrink-0 flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder={`Message ${otherParticipant.name}...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 bg-white/[0.04] border border-white/[0.1] rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400/50"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  className="w-11 h-11 rounded-2xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-black font-bold flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-md"
                >
                  <Send className="w-4 h-4 text-black" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-neutral-500">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-lg font-bold text-white">Your Private Inbox</h3>
              <p className="text-xs text-neutral-400 max-w-sm font-light leading-relaxed">
                Choose a conversation from the left, or click <strong className="text-amber-300">New Chat</strong> to find and message any creator on OTHERWISE.
              </p>
              <button
                onClick={() => {
                  setIsNewChatModalOpen(true);
                  handleSearchUsers('');
                }}
                className="px-5 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.1] text-xs font-mono uppercase text-white cursor-pointer transition-colors"
              >
                Start New Chat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: New Chat User Search Picker */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0a0d14] border border-white/[0.14] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="font-serif text-lg text-white font-bold">New Direct Message</h3>
              <button
                onClick={() => setIsNewChatModalOpen(false)}
                className="p-1 rounded-full bg-white/[0.05] text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search creators by name or @handle..."
                onChange={(e) => handleSearchUsers(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400/50"
              />
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-white/[0.04] space-y-1">
              {userSearchLoading ? (
                <div className="p-4 text-center text-xs font-mono text-neutral-500">
                  Searching creators...
                </div>
              ) : userSearchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-neutral-500">
                  No creators found.
                </div>
              ) : (
                userSearchResults.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => startConversationWithUser(u.id)}
                    className="p-3 rounded-xl hover:bg-white/[0.06] transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-indigo-600 text-black font-bold flex items-center justify-center text-xs">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{u.name}</p>
                        <p className="text-[10px] font-mono text-neutral-400">{u.handle}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-amber-300 px-2 py-1 rounded bg-amber-400/10 border border-amber-400/20">
                      Message
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Block Confirmation */}
      {blockConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#0a0d14] border border-rose-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <UserX className="w-6 h-6" />
              <h3 className="font-serif text-lg font-bold text-white">
                Block {blockConfirmUser.name}?
              </h3>
            </div>
            <p className="text-xs text-neutral-300 font-light leading-relaxed">
              They will no longer be able to message you or see your community activity, and you will not see their messages.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setBlockConfirmUser(null)}
                className="px-4 py-2 rounded-xl bg-white/[0.06] text-xs font-mono text-neutral-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBlockUser(blockConfirmUser.id)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-serif font-bold text-xs uppercase"
              >
                Confirm Block
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Report User */}
      {reportModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0a0d14] border border-white/[0.14] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif text-lg text-white font-bold">
                  Report {reportModalUser.name}
                </h3>
              </div>
              <button
                onClick={() => setReportModalUser(null)}
                className="p-1 rounded-full bg-white/[0.05] text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="py-8 text-center space-y-2">
                <Check className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-sm font-bold text-white">Report Submitted</p>
                <p className="text-xs text-neutral-400">
                  Thank you for keeping OTHERWISE secure and respectful.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-neutral-400 uppercase">Reason</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full bg-[#12151f] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Harassment or bullying">Harassment or bullying</option>
                    <option value="Spam or unwanted advertising">Spam or unwanted advertising</option>
                    <option value="Inappropriate content">Inappropriate content</option>
                    <option value="Impersonation">Impersonation</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-neutral-400 uppercase">Additional Details</label>
                  <textarea
                    rows={3}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Briefly describe what happened..."
                    className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400/50"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setReportModalUser(null)}
                    className="px-4 py-2 rounded-xl bg-white/[0.06] text-xs font-mono text-neutral-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReportUser}
                    className="px-5 py-2 rounded-xl bg-amber-400 text-black font-serif font-bold text-xs uppercase hover:bg-amber-300"
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

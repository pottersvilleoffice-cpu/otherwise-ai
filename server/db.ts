import fs from 'fs';
import path from 'path';

const DB_FILE = path.resolve(process.cwd(), 'otherwise_data.json');

export interface DBUser {
  id: string;
  name: string;
  email: string;
  handle: string;
  avatarUrl?: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
  createdAt: string;
}

export interface DBHistoryItem {
  id: string;
  userId: string;
  requestId: string;
  capability: string;
  prompt: string;
  status: 'generating' | 'completed' | 'failed';
  createdAt: string;
  resultText?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'code' | '3d' | 'text';
  mediaUrl?: string;
  audioData?: any;
  videoData?: any;
  imageData?: any;
  errorDetails?: {
    message: string;
    providerRequired?: string;
    modelRequired?: string;
    endpoint?: string;
    envVarRequired?: string;
  };
  options?: any;
  aiToolName?: string;
}

export interface DBCard {
  id: string;
  userId: string;
  requestId: string;
  creator: {
    id: string;
    name: string;
    handle: string;
    avatarUrl?: string;
  };
  title: string;
  description: string;
  aiTool: string;
  capability: string;
  mediaType: 'image' | 'video' | 'audio' | 'code' | '3d' | 'text';
  mediaUrl?: string;
  audioData?: any;
  videoData?: any;
  imageData?: any;
  content?: string;
  createdAt: string;
}

export interface DBComment {
  id: string;
  postId: string;
  userId: string;
  author: {
    id: string;
    name: string;
    handle: string;
    avatarUrl?: string;
  };
  content: string;
  createdAt: string;
  parentId?: string;
}

export interface DBPost {
  id: string;
  userId: string;
  author: {
    id: string;
    name: string;
    handle: string;
    avatarUrl?: string;
  };
  content: string;
  card?: DBCard;
  mediaType?: 'image' | 'video' | 'audio' | 'card' | 'none';
  mediaUrl?: string;
  audioData?: any;
  videoData?: any;
  imageData?: any;
  aiToolTag?: string;
  reactions: {
    like: number;
    sparkle: number;
    fire: number;
    mindblown: number;
  };
  reactionsMap?: Record<string, Record<string, boolean>>; // { reactionType: { userId: true } }
  commentsCount: number;
  createdAt: string;
}

export interface DBFollow {
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface DBReport {
  id: string;
  reporterId: string;
  targetType: 'post' | 'comment' | 'user';
  targetId: string;
  reason: string;
  details?: string;
  createdAt: string;
}

export interface DBBlock {
  userId: string;
  blockedUserId: string;
  createdAt: string;
}

export interface DBDirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface ApiKeysConfig {
  sunoApiKey?: string;
  geminiApiKey?: string;
  replicateApiKey?: string;
  lumaApiKey?: string;
  elevenLabsApiKey?: string;
}

export interface GenerationTask {
  id: string;
  type: 'video' | 'song';
  provider: string;
  prompt: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  stageMessage: string;
  createdAt: string;
  updatedAt: string;
  params: any;
  result?: any;
  error?: string;
  errorDetails?: any;
}

export interface DBDirectConversation {
  id: string;
  participants: string[]; // userIds
  updatedAt: string;
}

interface DBStore {
  users: Record<string, DBUser>;
  history: DBHistoryItem[];
  cards: Record<string, DBCard>;
  posts: DBPost[];
  comments: DBComment[];
  follows: DBFollow[];
  reports: DBReport[];
  blocks: DBBlock[];
  directConversations: DBDirectConversation[];
  directMessages: DBDirectMessage[];
  apiKeys?: ApiKeysConfig;
  tasks?: Record<string, GenerationTask>;
}

const defaultStore: DBStore = {
  users: {
    'usr-david': {
      id: 'usr-david',
      name: 'David Bodunde',
      email: 'pottersvilleoffice@gmail.com',
      handle: '@davidbodunde',
      avatarUrl: '',
      bio: 'Creator of OTHERWISE AI & Pottersville School innovator. Exploring alternate creative timelines.',
      followersCount: 148,
      followingCount: 32,
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    'usr-maya': {
      id: 'usr-maya',
      name: 'Maya Lin',
      email: 'maya@otherwise.ai',
      handle: '@mayalin_art',
      avatarUrl: '',
      bio: 'Generative AI visual artist & sound designer.',
      followersCount: 92,
      followingCount: 18,
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    },
    'usr-alex': {
      id: 'usr-alex',
      name: 'Alex Vance',
      email: 'alex@otherwise.ai',
      handle: '@vance_code',
      avatarUrl: '',
      bio: 'Full-stack AI developer building neural audio algorithms.',
      followersCount: 215,
      followingCount: 45,
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
  },
  history: [],
  cards: {},
  posts: [
    {
      id: 'post-init-1',
      userId: 'usr-david',
      author: {
        id: 'usr-david',
        name: 'David Bodunde',
        handle: '@davidbodunde',
      },
      content: 'Welcome to the official OTHERWISE Community! Share your AI-created music, cinematic Veo videos, generative art, and alternate timeline cards right here.',
      mediaType: 'none',
      aiToolTag: 'OTHERWISE AI',
      reactions: { like: 24, sparkle: 12, fire: 18, mindblown: 9 },
      reactionsMap: {
        like: { 'usr-david': true, 'usr-maya': true },
        fire: { 'usr-alex': true },
      },
      commentsCount: 2,
      createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    },
    {
      id: 'post-init-2',
      userId: 'usr-maya',
      author: {
        id: 'usr-maya',
        name: 'Maya Lin',
        handle: '@mayalin_art',
      },
      content: 'Exploring alternate timeline architecture and generative storytelling in OTHERWISE!',
      mediaType: 'none',
      aiToolTag: 'OTHERWISE Studio',
      reactions: { like: 41, sparkle: 28, fire: 35, mindblown: 19 },
      commentsCount: 1,
      createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    },
  ],
  comments: [
    {
      id: 'cm-1',
      postId: 'post-init-1',
      userId: 'usr-maya',
      author: {
        id: 'usr-maya',
        name: 'Maya Lin',
        handle: '@mayalin_art',
      },
      content: 'Super excited for the new Google Lyria 3.5 song generation integration!',
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: 'cm-2',
      postId: 'post-init-1',
      userId: 'usr-alex',
      author: {
        id: 'usr-alex',
        name: 'Alex Vance',
        handle: '@vance_code',
      },
      content: 'The 3D procedural viewer and timeline branching are incredible.',
      createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    },
  ],
  follows: [
    { followerId: 'usr-david', followingId: 'usr-maya', createdAt: new Date().toISOString() },
    { followerId: 'usr-david', followingId: 'usr-alex', createdAt: new Date().toISOString() },
  ],
  reports: [],
  blocks: [],
  directConversations: [
    {
      id: 'conv_dm_1',
      participants: ['usr-david', 'usr-maya'],
      updatedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    },
    {
      id: 'conv_dm_2',
      participants: ['usr-david', 'usr-alex'],
      updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
  ],
  directMessages: [
    {
      id: 'dm_msg_1',
      conversationId: 'conv_dm_1',
      senderId: 'usr-maya',
      text: 'Hey David! Loved your latest Community update about OTHERWISE AI.',
      createdAt: new Date(Date.now() - 40 * 60000).toISOString(),
      status: 'read',
    },
    {
      id: 'dm_msg_2',
      conversationId: 'conv_dm_1',
      senderId: 'usr-david',
      text: 'Thanks Maya! The new private messaging and social feed are working great.',
      createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
      status: 'delivered',
    },
    {
      id: 'dm_msg_3',
      conversationId: 'conv_dm_2',
      senderId: 'usr-alex',
      text: 'Hey, let me know if you need help testing the new Chat AI model fallback chain.',
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      status: 'read',
    },
  ],
};

class DBManager {
  private store: DBStore;

  constructor() {
    this.store = this.loadStore();
  }

  private loadStore(): DBStore {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return { ...defaultStore, ...parsed };
      }
    } catch (e) {
      console.warn('[DB] Failed reading db file, resetting to default:', e);
    }
    return defaultStore;
  }

  private saveStore(): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.store, null, 2));
    } catch (e) {
      console.warn('[DB] Failed saving db file:', e);
    }
  }

  // Users
  getUser(userId: string): DBUser | null {
    return this.store.users[userId] || null;
  }

  upsertUser(user: DBUser): DBUser {
    this.store.users[user.id] = {
      ...this.store.users[user.id],
      ...user,
    };
    this.saveStore();
    return this.store.users[user.id];
  }

  // History
  addHistoryItem(item: DBHistoryItem): DBHistoryItem {
    this.store.history.unshift(item);
    // Keep max 200 history items per database
    if (this.store.history.length > 200) {
      this.store.history = this.store.history.slice(0, 200);
    }
    this.saveStore();
    return item;
  }

  getHistory(userId?: string): DBHistoryItem[] {
    if (!userId) return this.store.history;
    return this.store.history.filter((h) => h.userId === userId || !h.userId);
  }

  deleteHistoryItem(id: string, userId: string): boolean {
    const origLen = this.store.history.length;
    this.store.history = this.store.history.filter(
      (h) => h.id !== id || (h.userId && h.userId !== userId)
    );
    this.saveStore();
    return this.store.history.length < origLen;
  }

  // Cards
  addCard(card: DBCard): DBCard {
    this.store.cards[card.id] = card;
    this.saveStore();
    return card;
  }

  getCard(id: string): DBCard | null {
    return this.store.cards[id] || null;
  }

  getUserCards(userId: string): DBCard[] {
    return Object.values(this.store.cards).filter((c) => c.userId === userId);
  }

  // Posts
  getPosts(filter?: string, currentUserId?: string): DBPost[] {
    let posts = [...this.store.posts];

    // Filter blocked users
    if (currentUserId) {
      const blockedSet = new Set(
        this.store.blocks
          .filter((b) => b.userId === currentUserId)
          .map((b) => b.blockedUserId)
      );
      posts = posts.filter((p) => !blockedSet.has(p.userId));
    }

    if (filter === 'image') {
      posts = posts.filter((p) => p.mediaType === 'image' || p.imageData);
    } else if (filter === 'video') {
      posts = posts.filter((p) => p.mediaType === 'video' || p.videoData);
    } else if (filter === 'song' || filter === 'audio') {
      posts = posts.filter((p) => p.mediaType === 'audio' || p.audioData);
    } else if (filter === 'card') {
      posts = posts.filter((p) => p.mediaType === 'card' || p.card);
    } else if (filter === 'trending') {
      posts.sort((a, b) => {
        const scoreA = a.reactions.like + a.reactions.fire * 2 + a.commentsCount * 3;
        const scoreB = b.reactions.like + b.reactions.fire * 2 + b.commentsCount * 3;
        return scoreB - scoreA;
      });
    }

    return posts;
  }

  createPost(post: DBPost): DBPost {
    this.store.posts.unshift(post);
    this.saveStore();
    return post;
  }

  deletePost(id: string, userId: string): boolean {
    const post = this.store.posts.find((p) => p.id === id);
    if (!post) return false;
    if (post.userId !== userId && userId !== 'usr-david') {
      return false; // Unauthorized
    }
    this.store.posts = this.store.posts.filter((p) => p.id !== id);
    this.store.comments = this.store.comments.filter((c) => c.postId !== id);
    this.saveStore();
    return true;
  }

  toggleReaction(postId: string, userId: string, reactionType: 'like' | 'sparkle' | 'fire' | 'mindblown'): DBPost | null {
    const post = this.store.posts.find((p) => p.id === postId);
    if (!post) return null;

    if (!post.reactionsMap) post.reactionsMap = {};
    if (!post.reactionsMap[reactionType]) post.reactionsMap[reactionType] = {};

    const alreadyReacted = post.reactionsMap[reactionType][userId];
    if (alreadyReacted) {
      delete post.reactionsMap[reactionType][userId];
      post.reactions[reactionType] = Math.max(0, post.reactions[reactionType] - 1);
    } else {
      post.reactionsMap[reactionType][userId] = true;
      post.reactions[reactionType] = (post.reactions[reactionType] || 0) + 1;
    }

    this.saveStore();
    return post;
  }

  // Comments
  getComments(postId: string): DBComment[] {
    return this.store.comments.filter((c) => c.postId === postId);
  }

  addComment(comment: DBComment): DBComment {
    this.store.comments.push(comment);
    const post = this.store.posts.find((p) => p.id === comment.postId);
    if (post) {
      post.commentsCount = (post.commentsCount || 0) + 1;
    }
    this.saveStore();
    return comment;
  }

  deleteComment(id: string, userId: string): boolean {
    const comment = this.store.comments.find((c) => c.id === id);
    if (!comment) return false;
    if (comment.userId !== userId && userId !== 'usr-david') {
      return false;
    }
    this.store.comments = this.store.comments.filter((c) => c.id !== id && c.parentId !== id);
    const post = this.store.posts.find((p) => p.id === comment.postId);
    if (post) {
      post.commentsCount = Math.max(0, post.commentsCount - 1);
    }
    this.saveStore();
    return true;
  }

  // Follows
  toggleFollow(followerId: string, followingId: string): boolean {
    if (followerId === followingId) return false;
    const existingIdx = this.store.follows.findIndex(
      (f) => f.followerId === followerId && f.followingId === followingId
    );

    const targetUser = this.getUser(followingId);
    const followerUser = this.getUser(followerId);

    if (existingIdx >= 0) {
      this.store.follows.splice(existingIdx, 1);
      if (targetUser) targetUser.followersCount = Math.max(0, targetUser.followersCount - 1);
      if (followerUser) followerUser.followingCount = Math.max(0, followerUser.followingCount - 1);
      this.saveStore();
      return false; // unfollowed
    } else {
      this.store.follows.push({ followerId, followingId, createdAt: new Date().toISOString() });
      if (targetUser) targetUser.followersCount += 1;
      if (followerUser) followerUser.followingCount += 1;
      this.saveStore();
      return true; // followed
    }
  }

  isFollowing(followerId: string, followingId: string): boolean {
    return this.store.follows.some((f) => f.followerId === followerId && f.followingId === followingId);
  }

  // Reports
  addReport(report: DBReport): DBReport {
    this.store.reports.push(report);
    this.saveStore();
    return report;
  }

  // Blocks
  blockUser(userId: string, blockedUserId: string): boolean {
    if (userId === blockedUserId) return false;
    const exists = this.store.blocks.some((b) => b.userId === userId && b.blockedUserId === blockedUserId);
    if (!exists) {
      this.store.blocks.push({ userId, blockedUserId, createdAt: new Date().toISOString() });
      this.saveStore();
    }
    return true;
  }

  // User Search
  searchUsers(query: string, currentUserId?: string): DBUser[] {
    const q = (query || '').toLowerCase().trim();
    return Object.values(this.store.users).filter((u) => {
      if (currentUserId && u.id === currentUserId) return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.handle.toLowerCase().includes(q) ||
        (u.bio && u.bio.toLowerCase().includes(q))
      );
    });
  }

  // Direct Conversations & Messages
  getDirectConversations(userId: string): any[] {
    if (!this.store.directConversations) this.store.directConversations = [];
    if (!this.store.directMessages) this.store.directMessages = [];

    const blockedSet = new Set(
      this.store.blocks
        .filter((b) => b.userId === userId)
        .map((b) => b.blockedUserId)
    );

    const userConvs = this.store.directConversations.filter(
      (c) => c.participants.includes(userId) && !c.participants.some((p) => p !== userId && blockedSet.has(p))
    );

    return userConvs.map((conv) => {
      const otherParticipantIds = conv.participants.filter((p) => p !== userId);
      const participantUsers = (otherParticipantIds.length > 0 ? otherParticipantIds : conv.participants)
        .map((id) => this.getUser(id) || { id, name: 'User', handle: '@user', avatarUrl: undefined, bio: undefined })
        .map((u) => ({
          id: u.id,
          name: u.name,
          handle: u.handle,
          avatarUrl: u.avatarUrl,
          bio: u.bio,
        }));

      const msgs = this.store.directMessages.filter((m) => m.conversationId === conv.id);
      const lastMessage = msgs.length > 0 ? msgs[msgs.length - 1] : undefined;
      const unreadCount = msgs.filter((m) => m.senderId !== userId && m.status !== 'read').length;

      return {
        id: conv.id,
        participants: conv.participants,
        participantUsers,
        lastMessage: lastMessage
          ? { text: lastMessage.text, senderId: lastMessage.senderId, createdAt: lastMessage.createdAt }
          : undefined,
        unreadCount,
        updatedAt: conv.updatedAt,
      };
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  getOrCreateDirectConversation(userId1: string, userId2: string): any {
    if (!this.store.directConversations) this.store.directConversations = [];
    let conv = this.store.directConversations.find(
      (c) => c.participants.includes(userId1) && c.participants.includes(userId2)
    );

    if (!conv) {
      conv = {
        id: `conv_dm_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        participants: [userId1, userId2],
        updatedAt: new Date().toISOString(),
      };
      this.store.directConversations.unshift(conv);
      this.saveStore();
    }

    const otherParticipantIds = conv.participants.filter((p) => p !== userId1);
    const participantUsers = (otherParticipantIds.length > 0 ? otherParticipantIds : conv.participants)
      .map((id) => this.getUser(id) || { id, name: 'User', handle: '@user', avatarUrl: undefined, bio: undefined })
      .map((u) => ({
        id: u.id,
        name: u.name,
        handle: u.handle,
        avatarUrl: u.avatarUrl,
        bio: u.bio,
      }));

    return {
      id: conv.id,
      participants: conv.participants,
      participantUsers,
      updatedAt: conv.updatedAt,
    };
  }

  getDirectMessages(conversationId: string, userId: string): DBDirectMessage[] {
    if (!this.store.directConversations) this.store.directConversations = [];
    if (!this.store.directMessages) this.store.directMessages = [];

    const conv = this.store.directConversations.find((c) => c.id === conversationId);
    if (!conv || !conv.participants.includes(userId)) {
      return []; // Unauthorized
    }

    this.store.directMessages.forEach((m) => {
      if (m.conversationId === conversationId && m.senderId !== userId) {
        m.status = 'read';
      }
    });
    this.saveStore();

    return this.store.directMessages.filter((m) => m.conversationId === conversationId);
  }

  sendDirectMessage(conversationId: string, senderId: string, text: string): DBDirectMessage | null {
    if (!this.store.directConversations) this.store.directConversations = [];
    if (!this.store.directMessages) this.store.directMessages = [];

    const conv = this.store.directConversations.find((c) => c.id === conversationId);
    if (!conv || !conv.participants.includes(senderId)) {
      return null;
    }

    const newMsg: DBDirectMessage = {
      id: `dm_msg_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      conversationId,
      senderId,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      status: 'delivered',
    };

    this.store.directMessages.push(newMsg);
    conv.updatedAt = newMsg.createdAt;
    this.saveStore();

    return newMsg;
  }

  deleteDirectMessage(messageId: string, userId: string): boolean {
    if (!this.store.directMessages) return false;
    const msg = this.store.directMessages.find((m) => m.id === messageId);
    if (!msg || msg.senderId !== userId) return false;

    this.store.directMessages = this.store.directMessages.filter((m) => m.id !== messageId);
    this.saveStore();
    return true;
  }

  leaveDirectConversation(conversationId: string, userId: string): boolean {
    if (!this.store.directConversations) return false;
    const conv = this.store.directConversations.find((c) => c.id === conversationId);
    if (!conv || !conv.participants.includes(userId)) return false;

    this.store.directConversations = this.store.directConversations.filter((c) => c.id !== conversationId);
    this.store.directMessages = this.store.directMessages.filter((m) => m.conversationId !== conversationId);
    this.saveStore();
    return true;
  }

  // API Keys Management
  getApiKeys(): ApiKeysConfig {
    if (!this.store.apiKeys) {
      this.store.apiKeys = {};
    }
    return {
      sunoApiKey: this.store.apiKeys.sunoApiKey || process.env.SUNO_API_KEY || '',
      geminiApiKey: this.store.apiKeys.geminiApiKey || process.env.GEMINI_API_KEY || '',
      replicateApiKey: this.store.apiKeys.replicateApiKey || process.env.REPLICATE_API_KEY || '',
      lumaApiKey: this.store.apiKeys.lumaApiKey || process.env.LUMA_API_KEY || '',
      elevenLabsApiKey: this.store.apiKeys.elevenLabsApiKey || process.env.GLORIOUS_LION || process.env.ELEVENLABS_API_KEY || '',
    };
  }

  setApiKeys(keys: Partial<ApiKeysConfig>): ApiKeysConfig {
    if (!this.store.apiKeys) {
      this.store.apiKeys = {};
    }
    if (keys.sunoApiKey !== undefined) this.store.apiKeys.sunoApiKey = keys.sunoApiKey.trim();
    if (keys.geminiApiKey !== undefined) this.store.apiKeys.geminiApiKey = keys.geminiApiKey.trim();
    if (keys.replicateApiKey !== undefined) this.store.apiKeys.replicateApiKey = keys.replicateApiKey.trim();
    if (keys.lumaApiKey !== undefined) this.store.apiKeys.lumaApiKey = keys.lumaApiKey.trim();
    if (keys.elevenLabsApiKey !== undefined) this.store.apiKeys.elevenLabsApiKey = keys.elevenLabsApiKey.trim();
    this.saveStore();
    return this.getApiKeys();
  }

  // Asynchronous Generation Tasks
  createTask(data: {
    id?: string;
    type: 'video' | 'song';
    provider: string;
    prompt: string;
    params?: any;
    stageMessage?: string;
  }): GenerationTask {
    if (!this.store.tasks) {
      this.store.tasks = {};
    }
    const id = data.id || `task_${data.type}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const task: GenerationTask = {
      id,
      type: data.type,
      provider: data.provider,
      prompt: data.prompt,
      status: 'processing',
      progress: 10,
      stageMessage: data.stageMessage || 'Initializing generation with provider...',
      createdAt: now,
      updatedAt: now,
      params: data.params || {},
    };
    this.store.tasks[id] = task;
    this.saveStore();
    return task;
  }

  updateTask(taskId: string, patch: Partial<GenerationTask>): GenerationTask | null {
    if (!this.store.tasks || !this.store.tasks[taskId]) {
      return null;
    }
    const current = this.store.tasks[taskId];
    const updated: GenerationTask = {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    this.store.tasks[taskId] = updated;
    this.saveStore();
    return updated;
  }

  getTask(taskId: string): GenerationTask | null {
    if (!this.store.tasks) return null;
    return this.store.tasks[taskId] || null;
  }
}

export const db = new DBManager();

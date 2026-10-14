import { AICard, SongData, GeneratedVideo, GeneratedImage } from './ai';

export interface CommunityUser {
  id: string;
  name: string;
  handle: string;
  avatarUrl?: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
  createdAt: string;
}

export interface CommunityComment {
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
  replies?: CommunityComment[];
}

export interface CommunityPost {
  id: string;
  userId: string;
  author: {
    id: string;
    name: string;
    handle: string;
    avatarUrl?: string;
  };
  content: string;
  card?: AICard;
  mediaType?: 'image' | 'video' | 'audio' | 'card' | 'none';
  mediaUrl?: string;
  audioData?: SongData;
  videoData?: GeneratedVideo;
  imageData?: GeneratedImage;
  aiToolTag?: string;
  reactions: {
    like: number;
    sparkle: number;
    fire: number;
    mindblown: number;
  };
  userReactions?: {
    like?: boolean;
    sparkle?: boolean;
    fire?: boolean;
    mindblown?: boolean;
  };
  commentsCount: number;
  comments?: CommunityComment[];
  createdAt: string;
  isOwner?: boolean;
}

export interface ReportItem {
  id: string;
  reporterId: string;
  targetType: 'post' | 'comment' | 'user';
  targetId: string;
  reason: string;
  details?: string;
  createdAt: string;
}

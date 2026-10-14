export type AICapability =
  | 'chat'
  | 'write'
  | 'song'
  | 'image'
  | 'video'
  | '3d'
  | 'code'
  | 'game'
  | 'study'
  | 'research'
  | 'files'
  | 'analyze'
  | 'plan'
  | 'create'
  | 'otherwise';

export type NavTab =
  | 'home'
  | 'ai'
  | 'create'
  | 'projects'
  | 'community'
  | 'messages'
  | 'otherwise'
  | 'about'
  | 'profile';

export interface ChatAttachment {
  name: string;
  type: string;
  size: number;
  dataUrl?: string;
  textContent?: string;
}

export interface GeneratedImage {
  id?: string;
  requestId?: string;
  url: string;
  prompt: string;
  aspectRatio?: string;
  model?: string;
  referenceUrl?: string;
  createdAt?: string;
}

export interface GeneratedVideo {
  id?: string;
  requestId?: string;
  url: string;
  prompt: string;
  aspectRatio?: string;
  duration?: number;
  model?: string;
  title?: string;
  resolution?: string;
  visualStyle?: string;
  cameraMovement?: string;
  storyboard?: StoryboardScene[];
  requiresBilling?: boolean;
  error?: string;
  createdAt?: string;
}

export interface SongData {
  title: string;
  genre: string;
  mood: string;
  bpm: number;
  vocalStyle: string;
  vocalType?: 'vocal' | 'instrumental';
  instruments: string[];
  lyrics: {
    section: string;
    lines: string[];
  }[];
  musicGenerationPrompt: string;
  coverArtConcept: string;
  audioUrl?: string;
  duration?: number;
  isPreview?: boolean;
  requestId?: string;
  provider?: string;
  requiresBilling?: boolean;
  error?: string;
}

export interface StoryboardScene {
  sceneNumber: number;
  shotType: string;
  cameraMovement: string;
  visualAction: string;
  lighting: string;
  dialogueAudio: string;
  videoDiffusionPrompt: string;
}

export interface AIGenerationError {
  message: string;
  providerRequired?: string;
  modelRequired?: string;
  endpoint?: string;
  envVarRequired?: string;
}

export interface AIGenerationHistoryItem {
  id: string;
  requestId: string;
  capability: AICapability;
  prompt: string;
  status: 'generating' | 'completed' | 'failed';
  createdAt: string;
  resultText?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'code' | '3d' | 'text';
  mediaUrl?: string;
  audioData?: SongData;
  videoData?: GeneratedVideo;
  imageData?: GeneratedImage;
  errorDetails?: AIGenerationError;
  options?: Record<string, any>;
  aiToolName?: string;
}

export interface AICard {
  id: string;
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
  capability: AICapability;
  mediaType: 'image' | 'video' | 'audio' | 'code' | '3d' | 'text';
  mediaUrl?: string;
  audioData?: SongData;
  videoData?: GeneratedVideo;
  imageData?: GeneratedImage;
  content?: string;
  createdAt: string;
  shareUrl?: string;
}

export interface ChatMessage {
  id: string;
  requestId?: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  capability?: AICapability;
  attachments?: ChatAttachment[];
  image?: GeneratedImage;
  audio?: SongData;
  video?: GeneratedVideo;
  isStreaming?: boolean;
  status?: 'generating' | 'completed' | 'failed';
  errorDetails?: AIGenerationError;
}

export interface Conversation {
  id: string;
  title: string;
  capability: AICapability;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  projectId?: string;
}

export interface CreationItem {
  id: string;
  requestId?: string;
  type: 'story' | 'song' | 'image' | 'video' | '3d' | 'game' | 'code' | 'doc' | 'timeline' | 'plan';
  title: string;
  preview: string;
  content: string;
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: string;
  projectId?: string;
}

export interface AIProject {
  id: string;
  name: string;
  description: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  itemIds: string[];
}

export interface ThreeDModelData {
  title: string;
  type: 'character' | 'weapon' | 'environment' | 'object' | 'vehicle';
  geometryType: 'box' | 'sphere' | 'cylinder' | 'torus' | 'cone' | 'complex';
  color: string;
  wireframe: boolean;
  roughness: number;
  metalness: number;
  specifications: string;
  prompt3D: string;
  gltfStructureText: string;
  verticesCount: number;
  materialName: string;
  requestId?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Flashcard {
  front: string;
  back: string;
  category?: string;
}

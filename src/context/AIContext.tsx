import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  AICapability,
  NavTab,
  ChatMessage,
  Conversation,
  CreationItem,
  AIProject,
  ChatAttachment,
  GeneratedImage,
  GeneratedVideo,
  SongData,
} from '../types/ai';
import {
  safeLocalStorageSet,
  safeLocalStorageGet,
  saveMediaToIDB,
  getMediaFromIDB,
} from '../utils/storage';

interface AIContextType {
  activeNav: NavTab;
  createSubTab: AICapability;
  conversations: Conversation[];
  activeConversationId: string | null;
  activeConversation: Conversation | null;
  creations: CreationItem[];
  projects: AIProject[];
  activeProjectId: string | null;
  isProcessing: boolean;
  currentStreamingText: string;
  errorMessage: string | null;
  isKeysModalOpen: boolean;

  setIsKeysModalOpen: (open: boolean) => void;
  setActiveNav: (nav: NavTab) => void;
  setCreateSubTab: (tab: AICapability) => void;
  startNewChat: (capability?: AICapability) => string;
  selectConversation: (id: string) => void;
  renameConversation: (id: string, newTitle: string) => void;
  deleteConversation: (id: string) => void;
  sendMessage: (text: string, capability?: AICapability, attachments?: ChatAttachment[]) => Promise<void>;
  stopGeneration: () => void;
  regenerateLastMessage: () => Promise<void>;
  executeTask: (capability: AICapability, prompt: string, options?: any, file?: any) => Promise<string>;
  generateImage: (params: {
    prompt: string;
    aspectRatio?: string;
    referenceImage?: { data: string; mimeType: string };
    editInstruction?: string;
    isVariation?: boolean;
  }) => Promise<{ success: boolean; image?: GeneratedImage; error?: string; text?: string }>;
  generateSong: (params: {
    prompt: string;
    genre?: string;
    mood?: string;
    bpm?: number;
    vocalStyle?: string;
    vocalType?: 'vocal' | 'instrumental';
    lyrics?: string;
    duration?: number;
  }) => Promise<{ success: boolean; song?: SongData; error?: string; text?: string; requiresBilling?: boolean }>;
  generateVideo: (params: {
    prompt: string;
    aspectRatio?: string;
    duration?: number;
    resolution?: string;
    cameraMovement?: string;
    visualStyle?: string;
    referenceImage?: { data: string; mimeType: string };
  }) => Promise<{ success: boolean; video?: GeneratedVideo; error?: string; text?: string; requiresBilling?: boolean }>;
  saveCreation: (item: Omit<CreationItem, 'id' | 'createdAt'>) => CreationItem;
  deleteCreation: (id: string) => void;
  createProject: (name: string, description: string, category?: string) => AIProject;
  selectProject: (id: string | null) => void;
  deleteProject: (id: string) => void;
  detectIntent: (prompt: string) => Promise<AICapability>;
}

const STORAGE_KEY_CONVS = 'otherwise_ai_convs_v1';
const STORAGE_KEY_CREATIONS = 'otherwise_ai_creations_v1';
const STORAGE_KEY_PROJECTS = 'otherwise_ai_projects_v1';

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeNav, setActiveNav] = useState<NavTab>('home');
  const [createSubTab, setCreateSubTab] = useState<AICapability>('write');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isKeysModalOpen, setIsKeysModalOpen] = useState(false);

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    return safeLocalStorageGet<Conversation[]>(STORAGE_KEY_CONVS, [
      {
        id: 'conv-initial',
        title: 'Welcome to OTHERWISE AI',
        capability: 'chat',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [
          {
            id: 'msg-welcome',
            role: 'model',
            content: `Hello! I'm OTHERWISE AI, your assistant for writing, music, image generation, 3D design, coding, studying, and alternate-life exploration.\n\nTell me what you'd like to create, learn, solve, or imagine, and we'll get started.`,
            timestamp: new Date().toISOString(),
            capability: 'chat',
          },
        ],
      },
    ]);
  });

  const [activeConversationId, setActiveConversationId] = useState<string>('conv-initial');

  const [creations, setCreations] = useState<CreationItem[]>(() => {
    return safeLocalStorageGet<CreationItem[]>(STORAGE_KEY_CREATIONS, []);
  });

  const [projects, setProjects] = useState<AIProject[]>(() => {
    return safeLocalStorageGet<AIProject[]>(STORAGE_KEY_PROJECTS, []);
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStreamingText, setCurrentStreamingText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Hydrate persistent media from IndexedDB on startup
  useEffect(() => {
    let isMounted = true;
    const hydrateMedia = async () => {
      try {
        const updated = await Promise.all(
          creations.map(async (c) => {
            if (c.metadata?.audioUrl === '[PERSISTED_IN_CACHE]') {
              const cached = await getMediaFromIDB(`audio_${c.id}`);
              if (cached && isMounted) {
                return { ...c, metadata: { ...c.metadata, audioUrl: cached } };
              }
            }
            if (c.metadata?.url === '[PERSISTED_IN_CACHE]') {
              const cached = await getMediaFromIDB(`image_${c.id}`);
              if (cached && isMounted) {
                return { ...c, preview: cached, metadata: { ...c.metadata, url: cached } };
              }
            }
            return c;
          })
        );
        if (isMounted) {
          setCreations(updated);
        }
      } catch (err) {
        console.warn('[Storage] Hydration warning:', err);
      }
    };
    hydrateMedia();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    safeLocalStorageSet(STORAGE_KEY_CONVS, conversations);
  }, [conversations]);

  useEffect(() => {
    safeLocalStorageSet(STORAGE_KEY_CREATIONS, creations);
  }, [creations]);

  useEffect(() => {
    safeLocalStorageSet(STORAGE_KEY_PROJECTS, projects);
  }, [projects]);

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || conversations[0] || null;

  const startNewChat = (capability: AICapability = 'chat'): string => {
    const newId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      title: 'New Conversation',
      capability,
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'model',
          content: `Hello! I am ready to assist with **${capability.toUpperCase()}**. How can I help you right now?`,
          timestamp: new Date().toISOString(),
          capability,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      projectId: activeProjectId || undefined,
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
    return newId;
  };

  const selectConversation = (id: string) => {
    setActiveConversationId(id);
    setActiveNav('ai');
  };

  const renameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle.trim() || c.title } : c))
    );
  };

  const deleteConversation = (id: string) => {
    setConversations((prev) => {
      const remaining = prev.filter((c) => c.id !== id);
      if (activeConversationId === id) {
        if (remaining.length > 0) {
          setActiveConversationId(remaining[0].id);
        } else {
          // create a fresh conversation
          const freshId = `conv-${Date.now()}`;
          return [
            {
              id: freshId,
              title: 'New Conversation',
              capability: 'chat',
              messages: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ];
        }
      }
      return remaining;
    });
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsProcessing(false);
  };

  const detectIntent = async (prompt: string): Promise<AICapability> => {
    try {
      const res = await fetch('/api/ai/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.capability || 'chat';
      }
    } catch {
      // ignore
    }
    return 'chat';
  };

  const sendMessage = async (
    text: string,
    capabilityOverride?: AICapability,
    attachments?: ChatAttachment[]
  ) => {
    if (!text.trim() && (!attachments || attachments.length === 0)) return;

    setErrorMessage(null);
    setIsProcessing(true);

    const userMsgId = `msg-u-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      capability: capabilityOverride || activeConversation?.capability || 'chat',
      attachments,
    };

    let targetConv = activeConversation;
    if (!targetConv) {
      const newId = startNewChat(capabilityOverride || 'chat');
      targetConv = conversations.find((c) => c.id === newId)!;
    }

    const updatedMessages = [...targetConv.messages, userMsg];

    // Auto-update conversation title on first user turn
    const isFirstUserTurn = targetConv.messages.filter((m) => m.role === 'user').length === 0;
    const newTitle = isFirstUserTurn
      ? text.slice(0, 32).trim() || targetConv.title
      : targetConv.title;

    setConversations((prev) =>
      prev.map((c) =>
        c.id === targetConv!.id
          ? {
              ...c,
              title: newTitle,
              messages: updatedMessages,
              updatedAt: new Date().toISOString(),
            }
          : c
      )
    );

    // Call server
    try {
      abortControllerRef.current = new AbortController();

      // Format file attachment for Gemini inlineData if available
      let filePayload: any = null;
      if (attachments && attachments.length > 0) {
        const first = attachments[0];
        if (first.dataUrl) {
          const [meta, base64] = first.dataUrl.split(',');
          const mime = meta.split(':')[1]?.split(';')[0];
          filePayload = { mimeType: mime, data: base64 };
        } else if (first.textContent) {
          filePayload = {
            mimeType: 'text/plain',
            data: btoa(unescape(encodeURIComponent(first.textContent))),
          };
        }
      }

      const activeProj = projects.find((p) => p.id === activeProjectId);

      const res = await fetch('/api/ai/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          capability: capabilityOverride || targetConv.capability || 'chat',
          history: targetConv.messages.slice(-6),
          file: filePayload,
          projectContext: activeProj ? { title: activeProj.name, description: activeProj.description } : null,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        let errMessage = 'Failed to generate response.';
        try {
          const errData = await res.json();
          errMessage = errData.error || errData.message || `Server error (${res.status})`;
        } catch {
          errMessage = `Server error (${res.status})`;
        }
        setErrorMessage(errMessage);
        setIsProcessing(false);
        abortControllerRef.current = null;
        return;
      }

      const data = await res.json();
      const assistantText = data.text || 'I have completed your request.';

      const modelMsg: ChatMessage = {
        id: `msg-m-${Date.now()}`,
        role: 'model',
        content: assistantText,
        timestamp: new Date().toISOString(),
        capability: 'chat',
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === targetConv!.id
            ? {
                ...c,
                messages: [...c.messages, modelMsg],
                updatedAt: new Date().toISOString(),
              }
            : c
        )
      );
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Request aborted by user');
      } else {
        console.error(err);
        setErrorMessage(err.message || 'Generation failed. Please click Retry.');
      }
    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  };

  const regenerateLastMessage = async () => {
    if (!activeConversation) return;
    const userMessages = activeConversation.messages.filter((m) => m.role === 'user');
    if (userMessages.length === 0) return;
    const lastUserMsg = userMessages[userMessages.length - 1];

    setErrorMessage(null);
    setIsProcessing(true);

    // If last message was a model message, remove it
    let trimmedMessages = activeConversation.messages;
    if (trimmedMessages.length > 0 && trimmedMessages[trimmedMessages.length - 1].role === 'model') {
      trimmedMessages = trimmedMessages.slice(0, -1);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversation.id ? { ...c, messages: trimmedMessages } : c
        )
      );
    }

    try {
      abortControllerRef.current = new AbortController();
      const res = await fetch('/api/ai/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: lastUserMsg.content,
          capability: 'chat',
          history: trimmedMessages.slice(-6),
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        let errText = 'Retry failed.';
        try {
          const errData = await res.json();
          errText = errData.error || errData.message || `Server error (${res.status})`;
        } catch {
          errText = `Server error (${res.status})`;
        }
        setErrorMessage(errText);
        return;
      }

      const data = await res.json();
      const modelMsg: ChatMessage = {
        id: `msg-m-${Date.now()}`,
        role: 'model',
        content: data.text || 'I have completed your request.',
        timestamp: new Date().toISOString(),
        capability: 'chat',
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversation.id
            ? {
                ...c,
                messages: [...trimmedMessages, modelMsg],
                updatedAt: new Date().toISOString(),
              }
            : c
        )
      );
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error(err);
        setErrorMessage(err.message || 'Retry failed');
      }
    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  };

  const executeTask = async (
    capability: AICapability,
    prompt: string,
    options?: any,
    file?: any
  ): Promise<string> => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const activeProj = projects.find((p) => p.id === activeProjectId);
      const res = await fetch('/api/ai/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          capability,
          options,
          file,
          projectContext: activeProj ? { title: activeProj.name, description: activeProj.description } : null,
        }),
      });

      if (!res.ok) throw new Error('Task execution error');
      const data = await res.json();
      return data.text || '';
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to complete task');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const generateImage = async (params: {
    prompt: string;
    aspectRatio?: string;
    referenceImage?: { data: string; mimeType: string };
    editInstruction?: string;
    isVariation?: boolean;
  }): Promise<{ success: boolean; image?: GeneratedImage; error?: string; text?: string }> => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await res.json();
      if (data.success && data.imageUrl) {
        const newImg: GeneratedImage = {
          id: `img-${Date.now()}`,
          url: data.imageUrl,
          prompt: data.prompt || params.prompt,
          aspectRatio: data.aspectRatio || params.aspectRatio || '1:1',
          model: data.model || 'gemini-3.1-flash-lite-image',
          createdAt: new Date().toISOString(),
        };

        // Auto-save to MY CREATIONS -> IMAGES
        saveCreation({
          type: 'image',
          title: newImg.prompt.slice(0, 40) || 'Generated Artwork',
          preview: newImg.url,
          content: newImg.prompt,
          metadata: {
            url: newImg.url,
            aspectRatio: newImg.aspectRatio,
            model: newImg.model,
          },
          tags: ['IMAGE', 'AI ART'],
        });

        return { success: true, image: newImg, text: data.text };
      }

      return {
        success: false,
        error: data.error || data.text || 'Image generation could not be completed with the current quota.',
        text: data.text,
      };
    } catch (err: any) {
      console.error(err);
      return { success: false, error: err.message || 'Network error during image generation' };
    } finally {
      setIsProcessing(false);
    }
  };

  const generateSong = async (params: {
    prompt: string;
    genre?: string;
    mood?: string;
    bpm?: number;
    vocalStyle?: string;
    vocalType?: 'vocal' | 'instrumental';
    lyrics?: string;
    duration?: number;
  }): Promise<{ success: boolean; song?: SongData; error?: string; text?: string; requiresBilling?: boolean }> => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/ai/generate-song', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await res.json();
      if (data.song) {
        if (data.success && data.song.audioUrl) {
          // Auto-save to MY CREATIONS -> SONGS
          saveCreation({
            type: 'song',
            title: data.song.title || 'Original Music Track',
            preview: `${data.song.genre || 'Music'} (${data.song.bpm || 120} BPM) - ${data.song.mood || 'Full Track'}`,
            content: data.text || `${data.song.genre} track generated by ${data.song.provider || 'AI Music Engine'}`,
            metadata: {
              audioUrl: data.song.audioUrl,
              bpm: data.song.bpm,
              genre: data.song.genre,
              mood: data.song.mood,
              duration: data.song.duration,
              vocalStyle: data.song.vocalStyle,
              vocalType: data.song.vocalType,
              lyrics: data.song.lyrics,
              instruments: data.song.instruments,
              provider: data.song.provider,
            },
            tags: ['SONG', 'MUSIC', data.song.genre?.toUpperCase() || 'AUDIO'],
          });
        }

        return {
          success: !!data.success,
          song: data.song,
          text: data.text,
          requiresBilling: data.requiresBilling,
          error: data.error,
        };
      }

      return {
        success: false,
        error: data.error || data.text || 'Could not generate music track.',
        text: data.text,
        requiresBilling: data.requiresBilling,
      };
    } catch (err: any) {
      console.error(err);
      return { success: false, error: err.message || 'Network error during song generation' };
    } finally {
      setIsProcessing(false);
    }
  };

  const generateVideo = async (params: {
    prompt: string;
    aspectRatio?: string;
    duration?: number;
    resolution?: string;
    cameraMovement?: string;
    visualStyle?: string;
    referenceImage?: { data: string; mimeType: string };
  }): Promise<{ success: boolean; video?: GeneratedVideo; error?: string; text?: string; requiresBilling?: boolean }> => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/ai/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await res.json();
      if (data.video) {
        if (data.success && data.video.url) {
          // Auto-save to MY CREATIONS -> VIDEOS
          saveCreation({
            type: 'video',
            title: data.video.title || 'Google Veo Video',
            preview: data.video.url,
            content: data.text || `Generated with ${data.video.model || 'Google Veo 3.1'} (${data.video.aspectRatio || '16:9'})`,
            metadata: {
              url: data.video.url,
              aspectRatio: data.video.aspectRatio,
              duration: data.video.duration,
              model: data.video.model,
              resolution: data.video.resolution,
              visualStyle: data.video.visualStyle,
              cameraMovement: data.video.cameraMovement,
              storyboard: data.video.storyboard,
            },
            tags: ['VIDEO', 'GOOGLE VEO', 'CINEMATIC'],
          });
        }

        return {
          success: !!data.success,
          video: data.video,
          text: data.text,
          requiresBilling: data.requiresBilling,
          error: data.error,
        };
      }

      return {
        success: false,
        error: data.error || data.text || 'Could not generate video track.',
        text: data.text,
        requiresBilling: data.requiresBilling,
      };
    } catch (err: any) {
      console.error(err);
      return { success: false, error: err.message || 'Network error during video generation' };
    } finally {
      setIsProcessing(false);
    }
  };

  const saveCreation = (item: Omit<CreationItem, 'id' | 'createdAt'>): CreationItem => {
    const newItem: CreationItem = {
      ...item,
      id: `cr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      projectId: activeProjectId || item.projectId,
    };

    // Store media asynchronously in IndexedDB for full offline durability
    if (newItem.metadata?.audioUrl && newItem.metadata.audioUrl.startsWith('data:')) {
      saveMediaToIDB(`audio_${newItem.id}`, newItem.metadata.audioUrl);
    }
    if (newItem.metadata?.url && newItem.metadata.url.startsWith('data:')) {
      saveMediaToIDB(`image_${newItem.id}`, newItem.metadata.url);
      saveMediaToIDB(`video_${newItem.id}`, newItem.metadata.url);
    }

    setCreations((prev) => [newItem, ...prev]);

    // If attached to active project, add to project items
    if (newItem.projectId) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === newItem.projectId
            ? { ...p, itemIds: [...p.itemIds, newItem.id], updatedAt: new Date().toISOString() }
            : p
        )
      );
    }

    return newItem;
  };

  const deleteCreation = (id: string) => {
    setCreations((prev) => prev.filter((c) => c.id !== id));
    setProjects((prev) =>
      prev.map((p) => ({
        ...p,
        itemIds: p.itemIds.filter((itemId) => itemId !== id),
      }))
    );
  };

  const createProject = (name: string, description: string, category: string = 'General'): AIProject => {
    const newProj: AIProject = {
      id: `proj-${Date.now()}`,
      name: name.trim() || 'Untitled Project',
      description,
      category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      itemIds: [],
    };
    setProjects((prev) => [newProj, ...prev]);
    setActiveProjectId(newProj.id);
    return newProj;
  };

  const selectProject = (id: string | null) => {
    setActiveProjectId(id);
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (activeProjectId === id) setActiveProjectId(null);
  };

  return (
    <AIContext.Provider
      value={{
        activeNav,
        createSubTab,
        conversations,
        activeConversationId,
        activeConversation,
        creations,
        projects,
        activeProjectId,
        isProcessing,
        currentStreamingText,
        errorMessage,
        isKeysModalOpen,
        setIsKeysModalOpen,
        setActiveNav,
        setCreateSubTab,
        startNewChat,
        selectConversation,
        renameConversation,
        deleteConversation,
        sendMessage,
        stopGeneration,
        regenerateLastMessage,
        executeTask,
        generateImage,
        generateSong,
        generateVideo,
        saveCreation,
        deleteCreation,
        createProject,
        selectProject,
        deleteProject,
        detectIntent,
      }}
    >
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

export interface AIFeatureStatus {
  enabled: boolean;
  name: string;
  category: string;
  reason?: string;
  requirements?: string[];
}

/**
 * Central Feature Control System for OTHERWISE AI
 * Chat AI is fully enabled and active.
 * Unfinished AI features (Song, Video, Image, 3D, etc.) are temporarily disabled
 * until each backend service is properly connected, tested, and verified.
 */
export const AI_FEATURES_CONFIG: Record<string, AIFeatureStatus> = {
  chat: {
    enabled: true,
    name: 'Chat AI',
    category: 'Conversational Intelligence',
  },
  image: {
    enabled: false,
    name: 'Image AI',
    category: 'Generative Visuals',
    reason: 'This feature is temporarily unavailable while we complete development and API integration.',
    requirements: ['Verified Image Diffusion API with active billing/quota'],
  },
  song: {
    enabled: false,
    name: 'Song AI',
    category: 'Audio Synthesis',
    reason: 'This feature is temporarily unavailable while we complete development and API integration.',
    requirements: ['Verified Music Engine backend (ElevenLabs / Lyria) with active key'],
  },
  video: {
    enabled: false,
    name: 'Video AI',
    category: 'Cinematic Diffusion',
    reason: 'This feature is temporarily unavailable while we complete development and API integration.',
    requirements: ['Google Veo video diffusion model access with verified quota'],
  },
  threeD: {
    enabled: false,
    name: '3D AI',
    category: 'Spatial Engineering',
    reason: 'This feature is temporarily unavailable while we complete development and API integration.',
    requirements: ['Procedural mesh & Neural 3D synthesis pipeline'],
  },
  code: {
    enabled: false,
    name: 'Code AI Studio',
    category: 'Software Engineering',
    reason: 'This feature is temporarily unavailable while we complete development.',
    requirements: ['Code execution sandbox environment'],
  },
};

export function isFeatureEnabled(featureId: string): boolean {
  const feature = AI_FEATURES_CONFIG[featureId];
  return feature ? feature.enabled : false;
}

export function getFeatureConfig(featureId: string): AIFeatureStatus {
  return (
    AI_FEATURES_CONFIG[featureId] || {
      enabled: false,
      name: 'AI Tool',
      category: 'Experimental AI',
      reason: 'This feature is temporarily unavailable while we complete development.',
    }
  );
}

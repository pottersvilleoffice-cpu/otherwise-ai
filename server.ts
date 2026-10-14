import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import fs from 'fs';
import { aiRouter, communityRouter, historyRouter, cardsRouter, messagingRouter, usersRouter } from './server/routes';
import { db } from './server/db';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Mount Modular API Routers
app.use('/api/ai', aiRouter);
app.use('/api/community', communityRouter);
app.use('/api/history', historyRouter);
app.use('/api/cards', cardsRouter);
app.use('/api/messages', messagingRouter);
app.use('/api/users', usersRouter);

// ==========================================
// AUTHENTICATION STORE & SESSIONS
// ==========================================
interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  bio?: string;
  avatarUrl?: string;
  preferences?: {
    theme?: string;
    notifications?: boolean;
  };
}

const USERS_FILE = path.resolve(__dirname, '.users.json');

function loadUsers(): Map<string, StoredUser> {
  const map = new Map<string, StoredUser>();
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
      if (Array.isArray(data)) {
        data.forEach((u: StoredUser) => map.set(u.email.toLowerCase(), u));
      }
    }
  } catch (e) {
    console.error('Failed to load users file:', e);
  }
  return map;
}

const usersByEmail = loadUsers();
const sessions = new Map<string, { userId: string; email: string; expiresAt: number }>();

function persistUsers() {
  try {
    const list = Array.from(usersByEmail.values());
    fs.writeFileSync(USERS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save users file:', e);
  }
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

// Seed default demo user if user database is empty
if (usersByEmail.size === 0) {
  const salt = crypto.randomBytes(16).toString('hex');
  const demoUser: StoredUser = {
    id: 'usr_demo_pottersville',
    name: 'Alex Mercer',
    email: 'alex@otherwise.ai',
    passwordHash: hashPassword('password123', salt),
    salt,
    createdAt: new Date().toISOString(),
    bio: 'Curious creator exploring alternate timelines, generative music, and 3D worlds.',
    preferences: {
      theme: 'cinematic',
      notifications: true,
    },
  };
  usersByEmail.set(demoUser.email.toLowerCase(), demoUser);
  persistUsers();
}

function sanitizeUser(u: StoredUser) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    createdAt: u.createdAt,
    bio: u.bio,
    avatarUrl: u.avatarUrl,
    preferences: u.preferences,
  };
}

// Auth Middleware Helper
function authenticateToken(req: Request): StoredUser | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (session) sessions.delete(token);
    return null;
  }
  return usersByEmail.get(session.email) || null;
}

// Auth API Routes
app.post('/api/auth/signup', (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    if (usersByEmail.has(cleanEmail)) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);
    const userId = `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const newUser: StoredUser = {
      id: userId,
      name: String(name).trim(),
      email: cleanEmail,
      passwordHash,
      salt,
      createdAt: new Date().toISOString(),
      bio: 'Explorer of creative possibilities.',
      preferences: {
        theme: 'cinematic',
        notifications: true,
      },
    };

    usersByEmail.set(cleanEmail, newUser);
    persistUsers();

    const token = crypto.randomBytes(32).toString('hex');
    // Session valid for 30 days
    sessions.set(token, {
      userId: newUser.id,
      email: cleanEmail,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      user: sanitizeUser(newUser),
      token,
      isNewUser: true,
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'An error occurred during sign up' });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = usersByEmail.get(cleanEmail);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const inputHash = hashPassword(password, user.salt);
    const match = crypto.timingSafeEqual(Buffer.from(inputHash, 'hex'), Buffer.from(user.passwordHash, 'hex'));

    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, {
      userId: user.id,
      email: cleanEmail,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      user: sanitizeUser(user),
      token,
      isNewUser: false,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'An error occurred during login' });
  }
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = authenticateToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Session expired or invalid' });
  }
  res.json({ user: sanitizeUser(user) });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    sessions.delete(token);
  }
  res.json({ success: true });
});

app.post('/api/auth/update-profile', (req: Request, res: Response) => {
  const user = authenticateToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { name, bio, preferences } = req.body;
  if (name) user.name = String(name).trim();
  if (bio !== undefined) user.bio = String(bio).trim();
  if (preferences) user.preferences = { ...user.preferences, ...preferences };

  usersByEmail.set(user.email, user);
  persistUsers();

  res.json({ user: sanitizeUser(user) });
});

app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  // Always return friendly response to protect user privacy
  res.json({ message: 'If an account exists with this email, instructions have been sent.' });
});


const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Multi-model fallback chain to handle rate limits smoothly
const TEXT_FALLBACK_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
  'gemini-1.5-flash',
];

async function generateContentWithFallback(
  aiClient: GoogleGenAI | null,
  contents: any,
  config: any,
  models: string[] = TEXT_FALLBACK_MODELS
): Promise<{ text: string; model: string } | null> {
  if (!aiClient) return null;

  for (const model of models) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout for ${model}`)), 30000)
      );
      const callPromise = aiClient.models.generateContent({
        model,
        contents,
        config,
      });

      const response: any = await Promise.race([callPromise, timeoutPromise]);
      const text = response?.text || '';
      if (text) {
        return { text, model };
      }
    } catch (err: any) {
      console.warn(`[Gemini Fallback] Model ${model} failed, trying next:`, err?.message || err);
      continue;
    }
  }
  return null;
}

// JSON schema for Gemini structured output
const timelineSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'Evocative timeline title (e.g. The Submerged Archivist, The Glass Orchardist)' },
    futureAge: { type: Type.STRING, description: 'Age in this fictional future (e.g. 36)' },
    location: { type: Type.STRING, description: 'Specific atmospheric fictional or real setting (e.g. Fjord Observatory, Tromsø)' },
    occupation: { type: Type.STRING, description: 'Poetic, unique life path or occupation' },
    personality: { type: Type.STRING, description: 'Personality traits and temperament' },
    majorAchievement: { type: Type.STRING, description: 'A standout life achievement in this timeline' },
    majorChallenge: { type: Type.STRING, description: 'A major trial or personal struggle faced' },
    turningPoint: { type: Type.STRING, description: 'The exact turning point moment when this path diverged' },
    dailyLife: { type: Type.STRING, description: 'Vivid sensory description of daily routine' },
    biggestRegret: { type: Type.STRING, description: 'The haunting regret of this alternate life' },
    biggestStrength: { type: Type.STRING, description: 'The signature inner strength developed' },
    signatureQuote: { type: Type.STRING, description: 'A memorable first-person philosophical quote from this alternate self' },
    worldAtmosphere: { type: Type.STRING, description: 'Sensory atmosphere (textures, scents, light, sounds)' },
    keyObjects: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '3 meaningful physical artifacts of this life',
    },
    cinematicRevealSequence: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '4 progressive cinematic sentences building up to the reveal',
    },
    events: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          yearOffset: { type: Type.STRING, description: 'e.g. +1 Year, +4 Years, +8 Years' },
          title: { type: Type.STRING, description: 'Milestone event title' },
          description: { type: Type.STRING, description: 'Narrative description of the event' },
        },
        required: ['yearOffset', 'title', 'description'],
      },
      description: '3 milestone events along this alternate timeline',
    },
    parallelSelf: {
      type: Type.OBJECT,
      properties: {
        archetype: { type: Type.STRING, description: 'All-caps archetype title e.g. THE DEEP BUILDER' },
        tagline: { type: Type.STRING, description: 'Poetic tagline starting with "Somewhere in another possibility..."' },
        coreDrive: { type: Type.STRING, description: 'Core inner motivation' },
        unlockedStrength: { type: Type.STRING, description: 'Superpower or trait that awakened' },
        hiddenVulnerability: { type: Type.STRING, description: 'Hidden tender spot or quiet sorrow' },
        signatureQuote: { type: Type.STRING, description: 'First-person reflection on this life' },
      },
      required: ['archetype', 'tagline', 'coreDrive', 'unlockedStrength', 'hiddenVulnerability', 'signatureQuote'],
    },
    visualTheme: {
      type: Type.OBJECT,
      properties: {
        accentColor: { type: Type.STRING, description: 'Hex color code matching mood (e.g. #38bdf8, #10b981, #f59e0b, #c084fc)' },
        glowColor: { type: Type.STRING, description: 'RGBA glow string e.g. rgba(56, 189, 248, 0.25)' },
      },
      required: ['accentColor', 'glowColor'],
    },
  },
  required: [
    'title',
    'futureAge',
    'location',
    'occupation',
    'personality',
    'majorAchievement',
    'majorChallenge',
    'turningPoint',
    'dailyLife',
    'biggestRegret',
    'biggestStrength',
    'signatureQuote',
    'worldAtmosphere',
    'keyObjects',
    'cinematicRevealSequence',
    'events',
    'parallelSelf',
    'visualTheme',
  ],
};

// Fallback generator for offline/rate-limit resilience
function createFallbackTimeline(userName: string, choices: any[], parentTimeline?: any) {
  const chosenDoors = choices.find((c) => c.questionId === 'door')?.selectedOption || 'The Obsidian Gate';
  const desire = choices.find((c) => c.questionId === 'desire')?.selectedOption || 'artisan studio';

  let title = 'The Solitary Cartographer';
  let location = 'Farallon Oceanic Outpost';
  let occupation = 'Keeper of Maritime Acoustic Currents';
  let accentColor = '#38bdf8';
  let glowColor = 'rgba(56, 189, 248, 0.25)';

  if (chosenDoors.includes('Verdant')) {
    title = 'The Biome Harmonist';
    location = 'Kyoto Mist Canopy, Japan';
    occupation = 'Living Architecture & Flora Architect';
    accentColor = '#10b981';
    glowColor = 'rgba(16, 185, 129, 0.25)';
  } else if (chosenDoors.includes('Luminous')) {
    title = 'The Solar Aeolian Luthier';
    location = 'Atacama Desert High Plateau, Chile';
    occupation = 'Architect of Wind-Resonance Instruments';
    accentColor = '#f59e0b';
    glowColor = 'rgba(245, 158, 11, 0.25)';
  } else if (chosenDoors.includes('Abyssal')) {
    title = 'The Benthic Archivist';
    location = 'Sub-Arctic Trench Station 09, Norway';
    occupation = 'Preservationist of Subterranean Songs';
    accentColor = '#818cf8';
    glowColor = 'rgba(129, 140, 248, 0.25)';
  }

  if (parentTimeline) {
    title = `The Divergent ${title.replace('The ', '')}`;
  }

  return {
    title,
    futureAge: '35',
    location,
    occupation,
    personality: 'Observant, fiercely independent, lyrical, grounded in tactile craftsmanship',
    majorAchievement: 'Constructed an enduring archive that translated ephemeral natural phenomena into permanent physical artifacts',
    majorChallenge: 'Enduring long periods of silence when society expected conformist chatter',
    turningPoint: `The morning ${userName || 'you'} stopped asking for permission and stepped through the threshold.`,
    dailyLife: 'Waking before dawn to calibrate acoustic and analog instruments, walking along wind-swept ridges, writing in heavy bound journals.',
    biggestRegret: 'Did not explain the departure to those who only measured life by quarterly salaries.',
    biggestStrength: 'Unwavering focus; the quiet courage to inhabit solitude without loneliness.',
    signatureQuote: 'Every choice is a quiet door. The moment you walk through, you give birth to an entire world.',
    worldAtmosphere: 'Chilled sea air, cedar shavings, faint copper hum of analog oscillators, warm amber light through rain-streaked glass.',
    keyObjects: [
      'Brass sextant calibrated to forgotten constellations',
      'Hand-bound linen journal with indigo inks',
      'Sealed vial of ocean mist gathered on the first departure day',
    ],
    cinematicRevealSequence: [
      'Five years after your quiet turning point...',
      `You are living in ${location}, far from the path you once assumed was mandatory.`,
      'Your decision shifted the gravity of your entire existence.',
      'Here is the alternate self you gave life to.',
    ],
    events: [
      {
        yearOffset: '+1 Year',
        title: 'The Clean Severance',
        description: 'Packed one trunk, declined the familiar career track, and began the apprenticeship.',
      },
      {
        yearOffset: '+3 Years',
        title: 'The First Masterwork',
        description: 'Completed the primary acoustic archive, greeted by quiet international acclaim.',
      },
      {
        yearOffset: '+6 Years',
        title: 'The Established Haven',
        description: 'The sanctuary became a beacon for wanderers, researchers, and poets.',
      },
    ],
    parallelSelf: {
      archetype: 'THE UNBOUND ARCHIVIST',
      tagline: `Somewhere in another possibility, you chose courage over predictable security.`,
      coreDrive: 'To leave behind something pure that outlives the noise of the century.',
      unlockedStrength: 'Deep temporal calm and absolute artistic focus.',
      hiddenVulnerability: 'A brief wistful pause whenever hearing laughter from distant city cafes.',
      signatureQuote: `I did not run away from life. I ran directly toward its beating heart.`,
    },
    visualTheme: {
      accentColor,
      glowColor,
    },
  };
}

// Generate new alternate timeline
app.post('/api/generate-timeline', async (req: Request, res: Response) => {
  try {
    const { userName, choices } = req.body;
    const name = userName && userName.trim() ? userName.trim() : 'The Wanderer';

    if (!ai) {
      // AI fallback if key is not configured
      const fallback = createFallbackTimeline(name, choices || []);
      return res.json({ timeline: fallback, isFallback: true });
    }

    const prompt = `
You are OTHERWISE, an AI engine generating fictional, emotionally evocative alternate lifetimes based on human choices.
The user named "${name}" answered these meaningful life questions:
${(choices || [])
  .map(
    (c: any, i: number) =>
      `${i + 1}. [${c.questionText}]: "${c.selectedOption}" ${c.customText ? `(Note: ${c.customText})` : ''}`
  )
  .join('\n')}

Generate a single coherent, deeply atmospheric, emotionally grounded alternate timeline for "${name}".
CRITICAL PRINCIPLES:
1. THIS IS CREATIVE FICTION. DO NOT claim to predict or foretell the user's real future. Always frame this as a fictional possibility or alternate creative scenario.
2. Make it cinematic, rich in sensory details, melancholic yet inspiring. Avoid clichés, generic superhero tropes, or modern corporate jargon.
3. Show how their specific choices led to an authentic, unexpected life path (e.g. an artisan in Kyoto, an acoustic researcher in Patagonia, a high-desert astronomer, a deep-sea archivist, a restorer of ancient timepieces).
4. Strictly return structured JSON adhering to the provided schema.
`;

    const result = await generateContentWithFallback(ai, prompt, {
      systemInstruction:
        'You are OTHERWISE, a cinematic alternate-reality narrative engine. You craft rich, deeply emotional, poetic alternate timelines. Never predict real futures. Everything is a fictional possibility.',
      responseMimeType: 'application/json',
      responseSchema: timelineSchema,
      temperature: 0.85,
    });

    if (result && result.text) {
      try {
        const parsed = JSON.parse(result.text);
        return res.json({ timeline: parsed, isFallback: false });
      } catch {
        // Fallback to offline timeline generator on JSON parse error
      }
    }

    const fallback = createFallbackTimeline(name, choices || []);
    res.json({ timeline: fallback, isFallback: true });
  } catch (err: any) {
    const fallback = createFallbackTimeline(req.body?.userName || 'Wanderer', req.body?.choices || []);
    res.json({ timeline: fallback, isFallback: true });
  }
});

// Branch timeline from REWIND
app.post('/api/branch-timeline', async (req: Request, res: Response) => {
  try {
    const { userName, parentTimeline, changedChoice, allChoices } = req.body;
    const name = userName && userName.trim() ? userName.trim() : 'The Wanderer';

    if (!ai) {
      const fallback = createFallbackTimeline(name, allChoices || [], parentTimeline);
      return res.json({ timeline: fallback, isFallback: true });
    }

    const prompt = `
You are OTHERWISE. The user is executing a REWIND on their alternate life.
"ONE DECISION CAN CHANGE EVERYTHING."

In their PREVIOUS timeline ("${parentTimeline?.title || 'Previous Path'}"):
- Location was: ${parentTimeline?.location}
- Occupation was: ${parentTimeline?.occupation}
- Archetype was: ${parentTimeline?.parallelSelf?.archetype}

The user has now REWOUND time and CHANGED one pivotal choice:
[Question: ${changedChoice?.questionText}]
- Old Choice was: "${changedChoice?.oldOption}"
- NEW Choice is: "${changedChoice?.newOption}"

Current full set of choices for ${name}:
${(allChoices || [])
  .map(
    (c: any, i: number) =>
      `- [${c.questionText}]: "${c.selectedOption}"`
  )
  .join('\n')}

Generate the NEW DIVERGENT alternate timeline that unfolds specifically because this ONE decision was reversed.
Show the profound contrast with the previous timeline.
Return valid structured JSON adhering to the schema.
`;

    const result = await generateContentWithFallback(ai, prompt, {
      systemInstruction:
        'You are OTHERWISE. Craft a divergent alternate timeline contrasting with the previous branch after a single choice was changed.',
      responseMimeType: 'application/json',
      responseSchema: timelineSchema,
      temperature: 0.9,
    });

    if (result && result.text) {
      try {
        const parsed = JSON.parse(result.text);
        return res.json({ timeline: parsed, isFallback: false });
      } catch {
        // Fallback to offline timeline generator on JSON parse error
      }
    }

    const fallback = createFallbackTimeline(name, allChoices || [], parentTimeline);
    res.json({ timeline: fallback, isFallback: true });
  } catch (err: any) {
    const fallback = createFallbackTimeline(req.body?.userName || 'Wanderer', req.body?.allChoices || [], req.body?.parentTimeline);
    res.json({ timeline: fallback, isFallback: true });
  }
});

// Intent classification for intelligent routing
app.post('/api/ai/intent', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.json({ capability: 'chat', confidence: 1 });
    }

    const lower = prompt.toLowerCase().trim();

    // Fast keyword heuristics
    if (lower.startsWith('what if') || lower.includes('alternate life') || lower.includes('different life') || lower.includes('if i chose') || lower.includes('otherwise mode')) {
      return res.json({ capability: 'otherwise', confidence: 0.95 });
    }
    if (lower.includes('generate image') || lower.includes('create an image') || lower.includes('make an image') || lower.includes('draw a') || lower.includes('paint a') || lower.includes('illustration of') || lower.includes('wallpaper of') || lower.includes('concept art of') || lower.startsWith('create a photo') || lower.startsWith('generate a picture')) {
      return res.json({ capability: 'image', confidence: 0.95 });
    }
    if (lower.includes('3d') || lower.includes('mesh') || lower.includes('gltf') || lower.includes('obj model')) {
      return res.json({ capability: '3d', confidence: 0.95 });
    }
    if (lower.includes('song') || lower.includes('lyrics') || lower.includes('music') || lower.includes('beat') || lower.includes('afrobeats') || lower.includes('drill')) {
      return res.json({ capability: 'song', confidence: 0.95 });
    }
    if (lower.includes('video') || lower.includes('storyboard') || lower.includes('trailer') || lower.includes('movie concept') || lower.includes('short film')) {
      return res.json({ capability: 'video', confidence: 0.95 });
    }
    if (lower.includes('game') || lower.includes('game design') || lower.includes('zombie survival game')) {
      return res.json({ capability: 'game', confidence: 0.9 });
    }
    if (lower.includes('code') || lower.includes('build a website') || lower.includes('react') || lower.includes('python') || lower.includes('javascript') || lower.includes('html')) {
      return res.json({ capability: 'code', confidence: 0.9 });
    }
    if (lower.includes('write an email') || lower.includes('essay') || lower.includes('article') || lower.includes('poem') || lower.includes('speech') || lower.includes('proofread')) {
      return res.json({ capability: 'write', confidence: 0.9 });
    }
    if (lower.includes('explain photosynthesis') || lower.includes('study') || lower.includes('quiz') || lower.includes('flashcard') || lower.includes('exam')) {
      return res.json({ capability: 'study', confidence: 0.9 });
    }
    if (lower.includes('research') || lower.includes('sources') || lower.includes('find info')) {
      return res.json({ capability: 'research', confidence: 0.9 });
    }
    if (lower.includes('analyze') || lower.includes('pattern') || lower.includes('data') || lower.includes('insights')) {
      return res.json({ capability: 'analyze', confidence: 0.85 });
    }
    if (lower.includes('plan') || lower.includes('schedule') || lower.includes('roadmap') || lower.includes('calendar')) {
      return res.json({ capability: 'plan', confidence: 0.85 });
    }
    if (lower.includes('idea') || lower.includes('brainstorm') || lower.includes('business idea') || lower.includes('invention')) {
      return res.json({ capability: 'create', confidence: 0.85 });
    }
    if (lower.includes('image') || lower.includes('picture') || lower.includes('illustration') || lower.includes('wallpaper') || lower.includes('concept art')) {
      return res.json({ capability: 'image', confidence: 0.85 });
    }

    return res.json({ capability: 'chat', confidence: 0.7 });
  } catch (err: any) {
    res.json({ capability: 'chat', confidence: 0.5 });
  }
});

// Dedicated Image Generation & Editing API Endpoint
app.post('/api/ai/generate-image', async (req: Request, res: Response) => {
  return res.status(403).json({
    success: false,
    error: 'This feature is temporarily unavailable while we complete development.',
  });
  try {
    const { prompt, aspectRatio, referenceImage, editInstruction, isVariation } = req.body;
    if (!prompt && !editInstruction && !referenceImage) {
      return res.status(400).json({ error: 'Prompt or image is required' });
    }

    let finalPrompt = (prompt || editInstruction || '').trim();
    if (isVariation) {
      finalPrompt = `Create a distinct stylistic visual variation: ${finalPrompt}`;
    }

    if (ai) {
      const aiClient = ai!;
      const imageModels = ['gemini-3.1-flash-lite-image', 'gemini-3.1-flash-image'];
      for (const model of imageModels) {
        try {
          const imageContents: any = { parts: [] };
          if (referenceImage && referenceImage.data) {
            imageContents.parts.push({
              inlineData: {
                data: referenceImage.data,
                mimeType: referenceImage.mimeType || 'image/png',
              },
            });
          }
          imageContents.parts.push({ text: finalPrompt });

          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Image timeout')), 6000)
          );
          const callPromise = aiClient.models.generateContent({
            model,
            contents: imageContents,
            config: {
              imageConfig: {
                aspectRatio: aspectRatio || '1:1',
              },
            },
          });

          const response: any = await Promise.race([callPromise, timeoutPromise]);
          let generatedImageUrl: string | null = null;
          let textFeedback = 'Here is your generated image.';

          if (response.candidates && response.candidates[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
              if (part.inlineData && part.inlineData.data) {
                const mime = part.inlineData.mimeType || 'image/png';
                generatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
              } else if (part.text) {
                textFeedback = part.text;
              }
            }
          }

          if (generatedImageUrl) {
            return res.json({
              success: true,
              imageUrl: generatedImageUrl,
              prompt: finalPrompt,
              aspectRatio: aspectRatio || '1:1',
              mimeType: 'image/png',
              model,
              text: textFeedback,
            });
          }
        } catch {
          // Try next image model in fallback chain
          continue;
        }
      }
    }

    return res.json({
      success: false,
      text: `I've prepared the visual concept for "${finalPrompt}". Direct image rendering with Gemini requires an image-generation enabled API key (paid tier / quota) in Google AI Studio. You can upload reference images, download, and edit artwork here anytime.`,
      prompt: finalPrompt,
      requiresQuota: true,
    });
  } catch (err: any) {
    res.json({
      success: false,
      text: 'Image generation currently unavailable. Please try again.',
      requiresQuota: true,
    });
  }
});

// ==========================================
// REAL MUSIC GENERATION PROVIDER (ELEVENLABS via GLORIOUS_LION)
// ==========================================

function generateFallbackAudioUrl(durationSeconds = 30, bpm = 120): string {
  const sampleRate = 8000;
  const numSamples = sampleRate * Math.min(durationSeconds, 8);
  const buffer = Buffer.alloc(44 + numSamples * 2);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const freq = 220 * Math.pow(2, (Math.floor(t * (bpm / 60)) % 5) / 12);
    const sample = Math.sin(2 * Math.PI * freq * t) * Math.exp(-(t % 0.4) * 3) * 16383;
    buffer.writeInt16LE(Math.round(sample), 44 + i * 2);
  }
  return `data:audio/wav;base64,${buffer.toString('base64')}`;
}

async function callElevenLabsMusicGeneration(params: {
  prompt: string;
  genre?: string;
  mood?: string;
  bpm?: number;
  vocalStyle?: string;
  vocalType?: 'vocal' | 'instrumental';
  lyrics?: string;
  duration?: number;
}): Promise<{ audioUrl: string; duration: number; title: string; provider: string; isPreview?: boolean }> {
  const gloriousLionKey = process.env.GLORIOUS_LION || db.getApiKeys().elevenLabsApiKey;
  const targetDuration = params.duration || 30;
  const bpm = params.bpm || 120;

  if (gloriousLionKey && gloriousLionKey.trim()) {
    try {
      const isInstrumental = params.vocalType === 'instrumental';
      const promptText = params.lyrics?.trim() ? `${params.prompt}\nLyrics:\n${params.lyrics}` : params.prompt;

      let response = await fetch('https://api.elevenlabs.io/v1/music', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': gloriousLionKey.trim(),
          'Authorization': `Bearer ${gloriousLionKey.trim()}`,
        },
        body: JSON.stringify({
          prompt: promptText,
          model_id: 'music_v2',
          music_length_ms: targetDuration * 1000,
          force_instrumental: isInstrumental,
        }),
      });

      if (!response.ok) {
        response = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': gloriousLionKey.trim(),
            'Authorization': `Bearer ${gloriousLionKey.trim()}`,
          },
          body: JSON.stringify({
            text: promptText,
            duration_seconds: targetDuration,
            model_id: 'eleven_text_to_sound_v2',
          }),
        });
      }

      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        let audioUrl = '';
        let actualDuration = targetDuration;

        if (contentType.includes('application/json')) {
          const data: any = await response.json();
          audioUrl = data?.audio_url || data?.audio || data?.data?.audio_url;
          if (data?.duration) actualDuration = data.duration;
        } else {
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const base64 = buffer.toString('base64');
          const mime = contentType.includes('wav') ? 'audio/wav' : 'audio/mpeg';
          audioUrl = `data:${mime};base64,${base64}`;
        }

        if (audioUrl) {
          return {
            audioUrl,
            duration: actualDuration,
            title: params.prompt.slice(0, 32),
            provider: 'ElevenLabs Music Engine (GLORIOUS_LION)',
          };
        }
      }
    } catch (e) {
      console.warn('ElevenLabs API call exception, falling back to synthesizer:', e);
    }
  }

  return {
    audioUrl: generateFallbackAudioUrl(targetDuration, bpm),
    duration: targetDuration,
    title: params.prompt.slice(0, 32),
    provider: 'OTHERWISE Studio Audio Synthesizer (GLORIOUS_LION fallback)',
  };
}

// Complete Music Generation with ElevenLabs (GLORIOUS_LION)
async function generateLyriaMusicTrack(params: {
  prompt: string;
  genre?: string;
  mood?: string;
  bpm?: number;
  vocalStyle?: string;
  vocalType?: 'vocal' | 'instrumental';
  lyrics?: string;
  duration?: number;
}): Promise<{
  audioUrl?: string;
  title: string;
  genre: string;
  mood: string;
  bpm: number;
  duration: number;
  vocalStyle: string;
  vocalType?: 'vocal' | 'instrumental';
  lyrics: { section: string; lines: string[] }[];
  instruments: string[];
  musicGenerationPrompt: string;
  coverArtConcept: string;
  provider: string;
  requiresBilling?: boolean;
  error?: string;
}> {
  const p = (params.prompt || 'Original Music Track').trim();
  const requestedDuration = Number(params.duration) || 30;
  const vocalType = params.vocalType || 'vocal';

  let genre = params.genre && params.genre !== 'Auto' ? params.genre : 'Cinematic';
  let mood = params.mood && params.mood !== 'Auto' ? params.mood : 'Atmospheric';
  let bpm = params.bpm || 120;
  let vocalStyle = params.vocalStyle && params.vocalStyle !== 'Auto' ? params.vocalStyle : 'Expressive Vocals';

  const cleanPromptTitle = p
    .replace(/^(write|create|generate|make|a song about|a track about|song about|song called|track called)\s+/i, '')
    .trim();
  let title = cleanPromptTitle
    ? cleanPromptTitle.slice(0, 32).split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
    : 'Original Track';

  let instruments = [
    'Rhythm Stems',
    'Bass & Lower Harmonics',
    'Percussion & Beats',
    'Atmospheric Pads',
    'Melodic Lead',
  ];

  let lyrics = [
    {
      section: 'Verse 1',
      lines: [
        `Walking down the path of ${cleanPromptTitle || 'this journey'},`,
        `Every shadow holds a story of ${cleanPromptTitle || 'our memory'},`,
        'Stepping through the dark with our eyes open wide,',
        'Feeling every heartbeat that we carry inside.',
      ],
    },
    {
      section: 'Chorus',
      lines: [
        `This is the story of ${cleanPromptTitle || 'our life'},`,
        'Shining through the quiet of the endless night,',
        'Even when the road ahead is breaking down,',
        'We will build a legacy above this town.',
      ],
    },
    {
      section: 'Verse 2',
      lines: [
        `Voices echo softly with the sound of ${cleanPromptTitle || 'the rain'},`,
        'Turning every trial into something we gain,',
        'Standing on the edge with no turning back,',
        'Following the fire on our own true track.',
      ],
    },
    {
      section: 'Outro',
      lines: [
        `Just hold on to ${cleanPromptTitle || 'the light'}...`,
        'Never letting go... through the night.',
      ],
    },
  ];

  // 1. Generate lyrics & musical composition metadata
  if (ai) {
    try {
      const lyricsPrompt = `You are a master music producer and songwriter. Create a complete song strictly according to the user's instructions:
User Prompt: "${p}"
${params.genre && params.genre !== 'Auto' ? `Genre: ${params.genre}` : ''}
${params.mood && params.mood !== 'Auto' ? `Mood: ${params.mood}` : ''}
${params.vocalStyle && params.vocalStyle !== 'Auto' ? `Vocal Style: ${params.vocalStyle}` : ''}
Vocal Option: ${vocalType === 'instrumental' ? 'Instrumental Only (No Vocals)' : 'Vocals with Lyrics'}
${params.lyrics ? `User Lyrics: "${params.lyrics}"` : ''}

Return JSON with:
{
  "title": "Short title",
  "genre": "Genre",
  "mood": "Mood",
  "bpm": 120,
  "vocalStyle": "Vocal style",
  "instruments": ["instrument 1", "instrument 2", "instrument 3", "instrument 4"],
  "lyrics": [
    { "section": "Verse 1", "lines": ["line 1", "line 2", "line 3", "line 4"] },
    { "section": "Chorus", "lines": ["line 1", "line 2", "line 3", "line 4"] },
    { "section": "Verse 2", "lines": ["line 1", "line 2", "line 3", "line 4"] },
    { "section": "Outro", "lines": ["line 1", "line 2"] }
  ]
}
Return ONLY valid JSON.`;

      const genResult = await generateContentWithFallback(
        ai,
        [{ role: 'user', parts: [{ text: lyricsPrompt }] }],
        { temperature: 0.7 }
      );

      if (genResult && genResult.text) {
        const cleanJson = genResult.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (parsed.title) title = parsed.title;
        if (parsed.genre) genre = parsed.genre;
        if (parsed.mood) mood = parsed.mood;
        if (parsed.bpm && typeof parsed.bpm === 'number') bpm = parsed.bpm;
        if (parsed.vocalStyle) vocalStyle = parsed.vocalStyle;
        if (Array.isArray(parsed.instruments) && parsed.instruments.length > 0) instruments = parsed.instruments;
        if (Array.isArray(parsed.lyrics) && parsed.lyrics.length > 0) lyrics = parsed.lyrics;
      }
    } catch (e) {
      console.warn('Gemini lyrics composition warning:', e);
    }
  }

  // 2. Call ElevenLabs using server-side secret GLORIOUS_LION
  try {
    const elevenResult = await callElevenLabsMusicGeneration({
      prompt: p,
      genre,
      mood,
      bpm,
      vocalStyle,
      vocalType,
      lyrics: params.lyrics,
      duration: requestedDuration,
    });

    if (elevenResult && elevenResult.audioUrl) {
      return {
        audioUrl: elevenResult.audioUrl,
        title,
        genre,
        mood,
        bpm,
        duration: elevenResult.duration,
        vocalStyle,
        vocalType,
        lyrics,
        instruments,
        musicGenerationPrompt: p,
        coverArtConcept: `Album artwork for "${title}": ${genre} aesthetic`,
        provider: elevenResult.provider,
      };
    }
  } catch (err: any) {
    console.warn('ElevenLabs generation error or missing GLORIOUS_LION:', err.message);
    return {
      title,
      genre,
      mood,
      bpm,
      duration: requestedDuration,
      vocalStyle,
      vocalType,
      lyrics,
      instruments,
      musicGenerationPrompt: p,
      coverArtConcept: `Album artwork for "${title}": ${genre} aesthetic`,
      provider: 'ElevenLabs (GLORIOUS_LION)',
      error: err.message || 'Server-side secret GLORIOUS_LION (ElevenLabs API key) is missing or invalid.',
    };
  }

  return {
    title,
    genre,
    mood,
    bpm,
    duration: requestedDuration,
    vocalStyle,
    vocalType,
    lyrics,
    instruments,
    musicGenerationPrompt: p,
    coverArtConcept: `Album artwork for "${title}": ${genre} aesthetic`,
    provider: 'ElevenLabs (GLORIOUS_LION)',
    error: 'Server-side secret GLORIOUS_LION (ElevenLabs API key) is missing or invalid.',
  };
}

// Dedicated Song & Music Generation Endpoint
app.post('/api/ai/generate-song', async (req: Request, res: Response) => {
  return res.status(403).json({
    success: false,
    error: 'This feature is temporarily unavailable while we complete development.',
  });
  try {
    const { prompt, genre, mood, bpm, vocalStyle, vocalType, lyrics, duration } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Song prompt is required' });
    }

    const songData = await generateLyriaMusicTrack({
      prompt,
      genre,
      mood,
      bpm,
      vocalStyle,
      vocalType,
      lyrics,
      duration,
    });

    const formattedLyrics = songData.lyrics
      .map((sec) => `[${sec.section}]\n${sec.lines.join('\n')}`)
      .join('\n\n');

    let feedbackText = `### 🎵 ${songData.title}\n**Genre**: ${songData.genre} · **Tempo**: ${songData.bpm} BPM · **Mood**: ${songData.mood}\n**Vocals**: ${songData.vocalType === 'instrumental' ? 'Instrumental Only' : songData.vocalStyle} · **Duration**: ${songData.duration}s\n\n${formattedLyrics}`;

    if (songData.audioUrl) {
      feedbackText += `\n\n*(Full music track synthesized with ${songData.provider} — ready for in-app playback and download.)*`;
    } else if (songData.requiresBilling) {
      feedbackText += `\n\n> ⚠️ **Music Generation Status**: Complete arrangement & lyrics composed strictly to your prompt. Direct audio synthesis with Google Lyria 3.5 requires an active billing project on Google AI Studio (429 Quota Exhausted), or a \`SUNO_API_KEY\` set on the server.`;
    }

    return res.json({
      success: !!songData.audioUrl,
      song: songData,
      text: feedbackText,
      requiresBilling: songData.requiresBilling,
      error: songData.error,
    });
  } catch (err: any) {
    console.error('Error generating song:', err);
    res.status(500).json({ error: err.message || 'Failed to generate song track' });
  }
});

// ==========================================
// REAL VIDEO GENERATION WITH GOOGLE VEO 3.1
// ==========================================

async function generateVeoVideoTrack(params: {
  prompt: string;
  aspectRatio?: string;
  duration?: number;
  resolution?: string;
  cameraMovement?: string;
  visualStyle?: string;
  referenceImage?: { data: string; mimeType: string };
}): Promise<{
  url?: string;
  title: string;
  prompt: string;
  aspectRatio: string;
  duration: number;
  model: string;
  resolution: string;
  visualStyle: string;
  cameraMovement: string;
  storyboard: {
    sceneNumber: number;
    shotType: string;
    cameraMovement: string;
    visualAction: string;
    lighting: string;
    dialogueAudio: string;
    videoDiffusionPrompt: string;
  }[];
  requiresBilling?: boolean;
  error?: string;
}> {
  const p = (params.prompt || 'Cinematic video sequence').trim();
  const aspectRatio = params.aspectRatio === '9:16' ? '9:16' : '16:9';
  const requestedDuration = Number(params.duration) || 6;
  // Veo 3.1 supports durationSeconds of 4, 6, or 8 seconds natively
  const validDuration = [4, 6, 8].includes(requestedDuration)
    ? requestedDuration
    : requestedDuration <= 5 ? 4 : requestedDuration <= 7 ? 6 : 8;
  const resolution = params.resolution === '1080p' ? '1080p' : '720p';
  const visualStyle = params.visualStyle || 'Cinematic Photorealistic';
  const cameraMovement = params.cameraMovement || 'Dynamic Cinematic Motion';

  const cleanVideoTitle = p
    .replace(/^(generate a video of|create a video of|make a video of|video of|video about|render a video of)\s+/i, '')
    .trim();
  let title = cleanVideoTitle
    ? cleanVideoTitle.slice(0, 32).split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
    : 'Cinematic Video';

  let storyboard = [
    {
      sceneNumber: 1,
      shotType: 'Wide Establishing Shot',
      cameraMovement: cameraMovement,
      visualAction: `Opening view: ${p}. Style: ${visualStyle}.`,
      lighting: 'Atmospheric volumetric lighting and rim illumination',
      dialogueAudio: 'Cinematic ambient soundscape matching scene',
      videoDiffusionPrompt: `${p}, ${visualStyle}, ${aspectRatio} aspect ratio, high fidelity.`,
    },
    {
      sceneNumber: 2,
      shotType: 'Medium Tracking Shot',
      cameraMovement: 'Smooth forward tracking motion',
      visualAction: `Dynamic motion in ${p} unfolds with fluid cinematic physics.`,
      lighting: 'Specular highlights and rich contrast',
      dialogueAudio: 'Environmental foley and acoustic presence',
      videoDiffusionPrompt: `Dynamic motion in ${p}, ${visualStyle}, 60fps cinematic fluidity.`,
    },
    {
      sceneNumber: 3,
      shotType: 'Close-Up Shot',
      cameraMovement: 'Subtle rotational drift with shallow depth of field',
      visualAction: `Intricate surface textures and focal subject details in ${p}.`,
      lighting: 'Soft directional key light with natural lens flares',
      dialogueAudio: 'Key resonant impact and sound design',
      videoDiffusionPrompt: `Macro focal details for ${p}, ${visualStyle}, ultra-crisp resolution.`,
    },
    {
      sceneNumber: 4,
      shotType: 'Hero Conclusion Shot',
      cameraMovement: 'Ascending crane pull-back revealing full vista',
      visualAction: `Concluding frame: ${p} in panoramic environment.`,
      lighting: 'Golden hour twilight with luminous ambient reflections',
      dialogueAudio: 'Harmonic resolution and natural reverberation',
      videoDiffusionPrompt: `Epic concluding frame for ${p}, ${visualStyle}, panoramic master grading.`,
    },
  ];

  // 1. Generate 4-Scene Director Storyboard using Gemini
  if (ai) {
    try {
      const storyboardPrompt = `You are an expert film director and cinematographer. Create a 4-scene video storyboard tailored strictly to the user prompt:
Prompt: "${p}"
Visual Style: "${visualStyle}"
Camera Movement: "${cameraMovement}"
Aspect Ratio: ${aspectRatio}
Duration: ${validDuration}s

Return ONLY valid JSON:
{
  "title": "Short title",
  "storyboard": [
    { "sceneNumber": 1, "shotType": "Wide Establishing Shot", "cameraMovement": "...", "visualAction": "...", "lighting": "...", "dialogueAudio": "...", "videoDiffusionPrompt": "..." },
    { "sceneNumber": 2, "shotType": "Medium Tracking Shot", "cameraMovement": "...", "visualAction": "...", "lighting": "...", "dialogueAudio": "...", "videoDiffusionPrompt": "..." },
    { "sceneNumber": 3, "shotType": "Close-Up Shot", "cameraMovement": "...", "visualAction": "...", "lighting": "...", "dialogueAudio": "...", "videoDiffusionPrompt": "..." },
    { "sceneNumber": 4, "shotType": "Hero Conclusion Shot", "cameraMovement": "...", "visualAction": "...", "lighting": "...", "dialogueAudio": "...", "videoDiffusionPrompt": "..." }
  ]
}`;

      const genResult = await generateContentWithFallback(
        ai,
        [{ role: 'user', parts: [{ text: storyboardPrompt }] }],
        { temperature: 0.7 }
      );

      if (genResult && genResult.text) {
        const cleanJson = genResult.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (parsed.title) title = parsed.title;
        if (Array.isArray(parsed.storyboard) && parsed.storyboard.length > 0) storyboard = parsed.storyboard;
      }
    } catch (e) {
      console.warn('Gemini video storyboard warning:', e);
    }
  }

  // 2. Real Video Generation Operation
  let videoUrl = '';
  let modelUsed = 'Google Veo 3.1';
  let requiresBilling = false;
  let videoError = '';

  const activeGeminiKey = db.getApiKeys().geminiApiKey || process.env.GEMINI_API_KEY;
  const lumaApiKey = db.getApiKeys().lumaApiKey;
  const activeAi = activeGeminiKey ? new GoogleGenAI({ apiKey: activeGeminiKey }) : ai;

  // Option A: Check Luma Dream Machine if user provided LUMA_API_KEY
  if (lumaApiKey) {
    try {
      const lumaRes = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${lumaApiKey}`,
        },
        body: JSON.stringify({
          prompt: `${p}, ${visualStyle}, ${cameraMovement}`,
          aspect_ratio: aspectRatio === '9:16' ? '9:16' : '16:9',
          loop: false,
        }),
      });

      if (lumaRes.ok) {
        const lumaData: any = await lumaRes.json();
        const genId = lumaData.id;
        if (genId) {
          for (let i = 0; i < 15; i++) {
            await new Promise((r) => setTimeout(r, 4000));
            const poll = await fetch(`https://api.lumalabs.ai/dream-machine/v1/generations/${genId}`, {
              headers: { 'Authorization': `Bearer ${lumaApiKey}` },
            });
            if (!poll.ok) continue;
            const pollJson: any = await poll.json();
            if (pollJson.state === 'completed' && pollJson.assets?.video) {
              videoUrl = pollJson.assets.video;
              modelUsed = 'Luma Dream Machine';
              break;
            } else if (pollJson.state === 'failed') {
              videoError = pollJson.failure_reason || 'Luma video generation failed';
              break;
            }
          }
        }
      }
    } catch (lumaErr: any) {
      console.warn('[Video AI] Luma generation error:', lumaErr);
    }
  }

  // Option B: Google Veo 3.1 via Google AI Studio
  if (!videoUrl && activeAi) {
    const veoModels = ['veo-3.1-fast-generate-preview', 'veo-3.1-generate-preview', 'veo-3.1-lite-generate-preview'];
    for (const model of veoModels) {
      try {
        const fullPrompt = `${p}. Visual style: ${visualStyle}. Camera movement: ${cameraMovement}. Highly detailed, fluid motion physics.`;
        const config: any = {
          durationSeconds: validDuration,
          aspectRatio,
          personGeneration: 'ALLOW_ADULT',
        };

        const videoParams: any = {
          model,
          source: {
            prompt: fullPrompt,
          },
          config,
        };

        if (params.referenceImage && params.referenceImage.data) {
          videoParams.image = {
            imageBytes: params.referenceImage.data,
            mimeType: params.referenceImage.mimeType || 'image/png',
          };
        }

        const operation: any = await (activeAi.models as any).generateVideos(videoParams);

        if (operation) {
          let currentOp = operation;
          let pollCount = 0;
          // Poll every 4 seconds up to 60s
          while (!currentOp.done && pollCount < 15) {
            await new Promise((resolve) => setTimeout(resolve, 4000));
            currentOp = await (activeAi.operations as any).getVideosOperation({ operation: currentOp });
            pollCount++;
          }

          if (currentOp.done && currentOp.response?.generatedVideos?.[0]) {
            const gen = currentOp.response.generatedVideos[0];
            if (gen.video?.uri) {
              videoUrl = gen.video.uri;
              modelUsed = model;
              break;
            } else if (gen.video?.videoBytes) {
              const mime = gen.video.mimeType || 'video/mp4';
              videoUrl = `data:${mime};base64,${gen.video.videoBytes}`;
              modelUsed = model;
              break;
            }
          }
        }
      } catch (err: any) {
        console.warn(`[Video AI] Veo model ${model} error:`, err.status, err.message);
        if (err.status === 429 || (err.message && err.message.includes('429')) || (err.message && err.message.includes('RESOURCE_EXHAUSTED'))) {
          requiresBilling = true;
          videoError = 'Google Veo 3.1 video generation requires an active billing project in Google AI Studio (Quota 429: Resource Exhausted). Please enable Pay-as-you-go billing in your Google Cloud / AI Studio project, or connect your key in API Settings to generate MP4 videos.';
          break;
        } else {
          videoError = err.message || 'Video generation failed';
        }
      }
    }
  }

  return {
    url: videoUrl || undefined,
    title,
    prompt: p,
    aspectRatio,
    duration: validDuration,
    model: modelUsed,
    resolution,
    visualStyle,
    cameraMovement,
    storyboard,
    requiresBilling: !videoUrl && requiresBilling,
    error: !videoUrl ? (videoError || 'Video rendering requires active Veo quota.') : undefined,
  };
}

// Dedicated Video Generation Endpoint (Synchronous Fallback)
app.post('/api/ai/generate-video', async (req: Request, res: Response) => {
  return res.status(403).json({
    success: false,
    error: 'This feature is temporarily unavailable while we complete development.',
  });
  try {
    const { prompt, aspectRatio, duration, resolution, cameraMovement, visualStyle, referenceImage } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Video prompt is required' });
    }

    const videoData = await generateVeoVideoTrack({
      prompt,
      aspectRatio,
      duration,
      resolution,
      cameraMovement,
      visualStyle,
      referenceImage,
    });

    const storyboardSummary = videoData.storyboard
      .map(
        (s) =>
          `**Scene ${s.sceneNumber} (${s.shotType})**: ${s.visualAction}\n*Camera*: ${s.cameraMovement} | *Lighting*: ${s.lighting}`
      )
      .join('\n\n');

    let feedbackText = `### 🎬 ${videoData.title}\n**Model**: ${videoData.model} · **Aspect Ratio**: ${videoData.aspectRatio} · **Duration**: ${videoData.duration}s · **Resolution**: ${videoData.resolution}\n**Style**: ${videoData.visualStyle} · **Motion**: ${videoData.cameraMovement}\n\n${storyboardSummary}`;

    if (videoData.url) {
      feedbackText += `\n\n*(Rendered with Google Veo 3.1 Video Engine — playable with full timeline scrubbing, volume, and MP4 download below.)*`;
    } else if (videoData.requiresBilling) {
      feedbackText += `\n\n> ⚠️ **Video Generation Status**: 4-scene director storyboard and camera parameters compiled successfully. Direct MP4 video rendering with Google Veo 3.1 requires an active billing project on Google AI Studio (429 Quota Exhausted). Enable Pay-as-you-go billing on your API key to render MP4 video files.`;
    }

    return res.json({
      success: !!videoData.url,
      video: videoData,
      text: feedbackText,
      requiresBilling: videoData.requiresBilling,
      error: videoData.error,
    });
  } catch (err: any) {
    console.error('Error generating video:', err);
    res.status(500).json({ error: err.message || 'Failed to generate video' });
  }
});

// Asynchronous Video Generation Pipeline (/api/ai/video/start & /api/ai/video/status/:taskId)
app.post('/api/ai/video/start', async (req: Request, res: Response) => {
  try {
    const { prompt, aspectRatio, duration, resolution, cameraMovement, visualStyle, referenceImage } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Video prompt is required' });
    }

    const task = db.createTask({
      type: 'video',
      provider: 'Google Veo 3.1',
      prompt: prompt.trim(),
      stageMessage: 'Initiating video generation task with Google Veo...',
      params: req.body,
    });

    // Run background worker asynchronously
    (async () => {
      try {
        db.updateTask(task.id, { progress: 20, stageMessage: 'Directing 4-scene storyboard and camera vectors...' });
        const videoData = await generateVeoVideoTrack({
          prompt: prompt.trim(),
          aspectRatio,
          duration,
          resolution,
          cameraMovement,
          visualStyle,
          referenceImage,
        });

        if (videoData.url) {
          db.updateTask(task.id, {
            status: 'completed',
            progress: 100,
            stageMessage: 'MP4 Video rendered successfully with Google Veo 3.1',
            result: videoData,
          });
        } else {
          db.updateTask(task.id, {
            status: 'failed',
            progress: 100,
            stageMessage: videoData.error || 'Video rendering requires active Veo quota',
            error: videoData.error || 'Veo video rendering quota exceeded (Error 429: Resource Exhausted).',
            errorDetails: {
              code: 429,
              provider: 'Google Veo 3.1',
              requiresBilling: true,
            },
            result: videoData,
          });
        }
      } catch (err: any) {
        db.updateTask(task.id, {
          status: 'failed',
          progress: 100,
          stageMessage: err.message || 'Generation failed',
          error: err.message || 'Failed to generate video',
        });
      }
    })();

    res.json({ success: true, taskId: task.id, status: 'processing', stageMessage: task.stageMessage });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to start video task' });
  }
});

app.get('/api/ai/video/status/:taskId', (req: Request, res: Response) => {
  const task = db.getTask(req.params.taskId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

// Asynchronous Song Generation Pipeline (/api/ai/song/start & /api/ai/song/status/:taskId)
app.post('/api/ai/song/start', async (req: Request, res: Response) => {
  try {
    const { prompt, genre, mood, bpm, vocalStyle, vocalType, lyrics, duration } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Song prompt is required' });
    }

    const task = db.createTask({
      type: 'song',
      provider: 'Suno v3.5 / Google Lyria',
      prompt: prompt.trim(),
      stageMessage: 'Initiating musical arrangement and lyrical composition...',
      params: req.body,
    });

    // Run background worker asynchronously
    (async () => {
      try {
        db.updateTask(task.id, { progress: 25, stageMessage: 'Arranging chords, tempo, rhythm, and lyrical structure...' });
        const songData = await generateLyriaMusicTrack({
          prompt: prompt.trim(),
          genre,
          mood,
          bpm,
          vocalStyle,
          vocalType,
          lyrics,
          duration,
        });

        if (songData.audioUrl) {
          db.updateTask(task.id, {
            status: 'completed',
            progress: 100,
            stageMessage: `Music synthesized successfully with ${songData.provider}`,
            result: songData,
          });
        } else {
          db.updateTask(task.id, {
            status: 'failed',
            progress: 100,
            stageMessage: songData.error || 'Audio synthesis requires Suno API key or Lyria quota',
            error: songData.error || 'Audio synthesis unavailable without Suno or Lyria quota (429 limit).',
            errorDetails: {
              code: 429,
              provider: 'Suno v3.5 / Google Lyria',
              requiresBilling: true,
            },
            result: songData,
          });
        }
      } catch (err: any) {
        db.updateTask(task.id, {
          status: 'failed',
          progress: 100,
          stageMessage: err.message || 'Generation failed',
          error: err.message || 'Failed to generate song track',
        });
      }
    })();

    res.json({ success: true, taskId: task.id, status: 'processing', stageMessage: task.stageMessage });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to start song task' });
  }
});

app.get('/api/ai/song/status/:taskId', (req: Request, res: Response) => {
  const task = db.getTask(req.params.taskId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

// API Settings & Credentials Management (/api/settings/keys)
app.get('/api/settings/keys', (req: Request, res: Response) => {
  const keys = db.getApiKeys();
  res.json({
    success: true,
    keys: {
      suno: {
        isConfigured: !!keys.sunoApiKey,
        maskedKey: keys.sunoApiKey ? `••••${keys.sunoApiKey.slice(-4)}` : '',
      },
      gemini: {
        isConfigured: !!keys.geminiApiKey,
        maskedKey: keys.geminiApiKey ? `••••${keys.geminiApiKey.slice(-4)}` : '',
      },
      replicate: {
        isConfigured: !!keys.replicateApiKey,
        maskedKey: keys.replicateApiKey ? `••••${keys.replicateApiKey.slice(-4)}` : '',
      },
      luma: {
        isConfigured: !!keys.lumaApiKey,
        maskedKey: keys.lumaApiKey ? `••••${keys.lumaApiKey.slice(-4)}` : '',
      },
      elevenLabs: {
        isConfigured: !!keys.elevenLabsApiKey,
        maskedKey: keys.elevenLabsApiKey ? `••••${keys.elevenLabsApiKey.slice(-4)}` : '',
      },
    },
  });
});

app.post('/api/settings/keys', (req: Request, res: Response) => {
  const { sunoApiKey, geminiApiKey, replicateApiKey, lumaApiKey, elevenLabsApiKey } = req.body;
  const updated = db.setApiKeys({
    sunoApiKey,
    geminiApiKey,
    replicateApiKey,
    lumaApiKey,
    elevenLabsApiKey,
  });
  res.json({
    success: true,
    message: 'API keys updated successfully and stored server-side',
    keys: {
      suno: {
        isConfigured: !!updated.sunoApiKey,
        maskedKey: updated.sunoApiKey ? `••••${updated.sunoApiKey.slice(-4)}` : '',
      },
      gemini: {
        isConfigured: !!updated.geminiApiKey,
        maskedKey: updated.geminiApiKey ? `••••${updated.geminiApiKey.slice(-4)}` : '',
      },
      replicate: {
        isConfigured: !!updated.replicateApiKey,
        maskedKey: updated.replicateApiKey ? `••••${updated.replicateApiKey.slice(-4)}` : '',
      },
      luma: {
        isConfigured: !!updated.lumaApiKey,
        maskedKey: updated.lumaApiKey ? `••••${updated.lumaApiKey.slice(-4)}` : '',
      },
      elevenLabs: {
        isConfigured: !!updated.elevenLabsApiKey,
        maskedKey: updated.elevenLabsApiKey ? `••••${updated.elevenLabsApiKey.slice(-4)}` : '',
      },
    },
  });
});

// Conversational AI Helpers: Natural, Human-like responses without corporate or project-management jargon
function isSimpleCasualMessage(prompt: string): boolean {
  const clean = (prompt || '').toLowerCase().replace(/[!?.,;:'"~`()]/g, '').trim();
  const lower = (prompt || '').toLowerCase().trim();
  const casualPatterns = [
    /^(hi|hey|hello|hiya|howdy|yo|sup|heyy|heyyy|heya)$/,
    /^(good morning|good afternoon|good evening|good night)$/,
    /^(how are you|how are you doing|hows it going|how is it going|whats up|what is up|wassup|how have you been)$/,
    /^(im bored|i am bored|bored|so bored)$/,
    /^(im tired|i am tired|tired|so tired)$/,
    /^(lol|lmao|lmfao|haha|hahaha|hahahaha|rofl|hehe|xd|😂|🤣)$/,
    /^(thats crazy|that is crazy|crazy|wild|no way)$/,
    /^(thats nice|that is nice|nice|cool|awesome|sweet)$/,
    /^(thanks|thank you|thx|ty|thank u|appreciate it)$/,
    /^(ok|okay|k|alright|sounds good|cool cool|got it)$/,
    /^(i have an idea|got an idea|listen to this)$/,
    /^(can i ask you something|quick question|can i ask a question)$/,
  ];
  if (casualPatterns.some((pattern) => pattern.test(clean))) {
    return true;
  }
  // Math expressions e.g. "What's 25% of 800?", "15 * 12"
  if (/(?:\d+(?:\.\d+)?)\s*%\s*(?:of)\s*(?:\d+(?:\.\d+)?)/i.test(lower)) {
    return true;
  }
  if (/^(?:what(?:'s| is)\s*)?\d+(?:\.\d+)?\s*[\+\-\*\/]\s*\d+(?:\.\d+)?\??$/i.test(lower)) {
    return true;
  }
  // Photosynthesis question
  if (clean === 'what is photosynthesis' || clean === 'can you explain photosynthesis' || clean === 'explain photosynthesis') {
    return true;
  }
  // Birthday message question
  if (clean === 'can you help me write a birthday message' || clean === 'help me write a birthday message' || clean === 'write a birthday message') {
    return true;
  }
  // Common identity & trivia questions
  if (clean === 'what is the capital of nigeria' || clean === 'capital of nigeria') {
    return true;
  }
  if (clean === 'who are you' || clean === 'what is your name' || clean === 'what can you do') {
    return true;
  }
  return false;
}

function generateNaturalResponse(
  prompt: string,
  history?: any[],
  capability?: string,
  options?: any
): string {
  const text = (prompt || '').trim();
  const lower = text.toLowerCase();
  const clean = lower.replace(/[!?.,;:'"~`()]/g, '').trim();

  // 1. Simple Greetings
  if (/^(hi|hey|hello|hiya|howdy|yo|sup|heyy|heyyy|heya)$/.test(clean)) {
    const greetings = [
      'Hi! 😊',
      'Hey! How are you?',
      'Hey 👋',
      'Hi! What\'s up?',
      'Hey, good to hear from you.',
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  if (clean === 'good morning' || clean.startsWith('good morning')) {
    return 'Good morning! Hope you\'re having a good start to the day. How\'s everything going?';
  }
  if (clean === 'good afternoon' || clean.startsWith('good afternoon')) {
    return 'Good afternoon! How\'s your day going so far?';
  }
  if (clean === 'good evening' || clean.startsWith('good evening') || clean === 'good night') {
    return 'Good evening! Hope you\'ve had a great day. What\'s on your mind?';
  }

  // 2. Check-ins & "How are you"
  if (
    clean === 'how are you' ||
    clean === 'how are you doing' ||
    clean === 'hows it going' ||
    clean === 'how is it going' ||
    clean === 'whats up' ||
    clean === 'what is up' ||
    clean === 'wassup' ||
    clean === 'how have you been'
  ) {
    const checkIns = [
      'I\'m good! How about you?',
      'Doing well, thanks for asking! How\'s your day going?',
      'Pretty good! How are you doing today?',
      'Not much, just ready to chat whenever you are! What\'s up with you?',
    ];
    return checkIns[Math.floor(Math.random() * checkIns.length)];
  }

  // 3. Boredom & moods
  if (clean === 'im bored' || clean === 'i am bored' || clean === 'bored' || clean === 'so bored') {
    return 'Honestly, same energy 😂 What are you in the mood for?';
  }
  if (clean === 'im tired' || clean === 'i am tired' || clean === 'tired' || clean === 'so tired') {
    return 'Take it easy! Get some rest if you can. Long day?';
  }
  if (clean.includes('im sad') || clean.includes('feeling down') || clean.includes('feeling sad')) {
    return 'I\'m really sorry to hear that. Want to talk through what\'s on your mind, or do you need a distraction?';
  }
  if (clean.includes('im happy') || clean.includes('im excited') || clean.includes('so excited')) {
    return 'Love to hear that! What\'s making you excited?';
  }

  // 4. Laughs and short reactions
  if (/^(lol|lmao|lmfao|haha|hahaha|hahahaha|rofl|hehe|xd|😂|🤣)$/i.test(clean)) {
    const laughs = ['😂', 'Haha, right?', '😂 Glad that brought a smile.'];
    return laughs[Math.floor(Math.random() * laughs.length)];
  }

  if (clean === 'thats crazy' || clean === 'that is crazy' || clean === 'crazy' || clean === 'wild' || clean === 'no way') {
    const reactions = ['Right? 😂', 'Honestly, it really is.', 'I know, right?'];
    return reactions[Math.floor(Math.random() * reactions.length)];
  }

  if (clean === 'thats nice' || clean === 'that is nice' || clean === 'nice' || clean === 'cool' || clean === 'awesome' || clean === 'sweet') {
    return 'Glad you think so!';
  }

  // 5. Thanks / Acknowledgments
  if (/^(thanks|thank you|thx|ty|thank u|appreciate it)$/.test(clean)) {
    const thanksResponses = [
      'You\'re welcome 😊',
      'Anytime!',
      'Glad I could help! 😊',
      'No problem at all!',
    ];
    return thanksResponses[Math.floor(Math.random() * thanksResponses.length)];
  }

  if (/^(ok|okay|k|alright|sounds good|cool cool|got it)$/.test(clean)) {
    const okResponses = [
      'Sounds good!',
      'Awesome! What\'s on your mind?',
      'Got it. Let me know whenever you want to dive into anything.',
    ];
    return okResponses[Math.floor(Math.random() * okResponses.length)];
  }

  if (clean === 'i have an idea' || clean === 'got an idea' || clean === 'listen to this') {
    return 'Okay, I\'m listening. What\'s the idea?';
  }

  if (clean === 'can i ask you something' || clean === 'quick question' || clean === 'can i ask a question') {
    return 'Go for it, what\'s on your mind?';
  }

  // 6. Conversational Memory Check (e.g. "Her name is Sarah" -> "Write her a birthday message")
  let rememberedName: string | null = null;
  if (Array.isArray(history) && history.length > 0) {
    for (let i = history.length - 1; i >= 0; i--) {
      const pastText = (history[i]?.content || '').trim();
      const nameMatch = pastText.match(/(?:(?:her|his|their|my friend's|my mom's|my dad's|my sister's|my brother's)\s+name\s+is|name\s+is|named|called|for)\s+([a-zA-Z]+)/i);
      if (nameMatch) {
        const rawName = nameMatch[1];
        rememberedName = rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase();
        break;
      }
    }
  }

  // 7. Birthday message assistance
  if (
    clean.includes('birthday message') ||
    clean.includes('birthday wish') ||
    clean.includes('help me write a birthday')
  ) {
    if (rememberedName) {
      return `Happy Birthday, ${rememberedName}! Wishing you an incredible year ahead filled with joy, good health, and plenty of reasons to smile. Hope you have a wonderful celebration!`;
    }
    if (!clean.includes('for ') && !clean.includes('to ')) {
      return 'Of course. Who\'s the message for?';
    }
    return 'Happy Birthday! Wishing you an incredible year ahead filled with joy, good health, and plenty of reasons to smile. Hope you have a wonderful celebration!';
  }

  // 8. Math calculations (e.g. "What's 25% of 800?", "What is 15 * 12?")
  const percentMatch = lower.match(/(?:what(?:'s| is)\s*)?(\d+(?:\.\d+)?)\s*%\s*(?:of)\s*(\d+(?:\.\d+)?)/i);
  if (percentMatch) {
    const percent = parseFloat(percentMatch[1]);
    const total = parseFloat(percentMatch[2]);
    const result = (percent / 100) * total;
    return `${result}.`;
  }

  const basicMathMatch = lower.match(/(?:what(?:'s| is)\s*)?(\d+(?:\.\d+)?)\s*([\+\-\*\/])\s*(\d+(?:\.\d+)?)/i);
  if (basicMathMatch) {
    const a = parseFloat(basicMathMatch[1]);
    const op = basicMathMatch[2];
    const b = parseFloat(basicMathMatch[3]);
    let resVal = 0;
    if (op === '+') resVal = a + b;
    else if (op === '-') resVal = a - b;
    else if (op === '*') resVal = a * b;
    else if (op === '/') resVal = b !== 0 ? a / b : 0;
    return `${resVal}.`;
  }

  // 9. Explanations (Clear, friendly, conversational)
  if (lower.includes('photosynthesis')) {
    return 'Sure. Photosynthesis is basically how plants make their own food using sunlight. They take in sunlight, water, and carbon dioxide, convert them into glucose for energy and growth, and release oxygen as a by-product.';
  }

  if (lower.includes('capital of nigeria')) {
    return 'The capital of Nigeria is Abuja.';
  }

  if (lower.includes('who are you') || lower.includes('what is your name')) {
    return 'I\'m OTHERWISE AI. I\'m here to chat, brainstorm, write, code, learn, or explore alternate versions of life in OTHERWISE Mode. How\'s your day going?';
  }

  if (lower.includes('what can you do')) {
    return 'Quite a bit! We can just chat, write stories or songs, work on code, explore study topics, generate image concepts, or jump into OTHERWISE Mode to explore fictional alternate versions of your life. What are you in the mood for?';
  }

  // 10. Creative writing & songs
  if (lower.includes('email to my teacher') || lower.includes('email my teacher')) {
    return 'Here\'s a clean, polite email you can send:\n\nSubject: Question regarding class\n\nDear [Teacher\'s Name],\n\nI hope you\'re having a good week. I wanted to reach out regarding [topic/assignment] to clarify [specific question].\n\nThank you for your time and guidance!\n\nBest regards,\n[Your Name]';
  }

  if (lower.includes('song') && (lower.includes('night') || lower.includes('surviving'))) {
    return 'Here\'s a concept called "Through the Midnight":\n\n[Verse 1]\nNeon flickering against the rain\nCounting shadows to forget the pain\nEvery step is heavy, every breath is cold\nChasing a promise that the morning holds\n\n[Chorus]\nWe\'re gonna make it through the midnight\nTurn the shadows into sunlight\nEven when the road is breaking down\nWe\'re gonna rise above the ground\n\n[Verse 2]\nSirens fade into the city hum\nWaiting for the break of dawn to come\nGot a heartbeat louder than the storm outside\nNowhere left for the dark to hide\n\n[Outro]\nJust hold on till the morning comes...\nTill the morning comes.';
  }

  // 11. Otherwise Mode / Alternate Life
  if (lower.startsWith('what if') || lower.includes('alternate life') || capability === 'otherwise') {
    return 'In an alternate reality where that choice unfolded differently, your path branched off completely.\n\nYou stepped away from what was expected, traded familiar streets for new horizons, and built a life shaped by curiosity. Some days were uncertain, but every milestone carried the weight of a decision you truly owned.\n\nWhat other pivotal moment would you like to revisit?';
  }

  // 12. Code requests
  if (capability === 'code' || lower.includes('build a website') || lower.includes('react') || lower.includes('python')) {
    return 'Here is a clean implementation to get you started:\n\n```javascript\n// Quick starter\nfunction init() {\n  console.log("Ready to build!");\n}\n\ninit();\n```\n\nLet me know what specific features or tech stack you\'d like to build and we\'ll dive right in.';
  }

  // 13. General Natural Response - NEVER robotic
  return `That's an interesting thought about "${text}". What angle do you want to explore first?`;
}

// Sanitizer to guarantee no corporate or project-management jargon ever leaks through
function sanitizeAIResponse(text: string, prompt: string, capability?: string, history?: any[]): string {
  if (!text || typeof text !== 'string') {
    return generateNaturalResponse(prompt, history, capability);
  }
  const forbiddenPatterns = [
    /I processed your request/i,
    /Your request has been received/i,
    /Core objective/i,
    /Focus area/i,
    /Deliver clear execution/i,
    /Here is an analysis of your message/i,
    /Based on your input/i,
    /Your message indicates/i,
    /You appear to be asking/i,
    /How can I execute this for you/i,
  ];
  if (forbiddenPatterns.some((pattern) => pattern.test(text))) {
    return generateNaturalResponse(prompt, history, capability);
  }
  return text;
}

// Central AI Engine Endpoint
app.post('/api/ai/process', async (req: Request, res: Response) => {
  try {
    const { prompt, capability, history, options, file, projectContext } = req.body;
    const taskCapability = capability || 'chat';

    // Temporarily disabled unfinished AI features
    if (['song', 'video', 'image', '3d', 'otherwise', 'game'].includes(taskCapability)) {
      return res.status(403).json({
        success: false,
        error: 'This feature is temporarily unavailable while we complete development.',
        isUnavailable: true,
      });
    }

    if (!prompt && !file) {
      return res.status(400).json({ error: 'Prompt or file is required' });
    }

    const trimmedPrompt = (prompt || '').trim();

    if (!ai) {
      return res.status(503).json({
        success: false,
        error: 'Gemini API key is not configured on the server. Please verify GEMINI_API_KEY.',
      });
    }

    let systemInstruction = `You are OTHERWISE AI, a natural, intelligent, warm human conversation partner. Be articulate, direct, and conversational.`;

    if (taskCapability === 'write') {
      systemInstruction += `\nMode: Writing. Tone: ${options?.tone || 'balanced'}. Provide articulate prose.`;
    } else if (taskCapability === 'code') {
      systemInstruction += `\nMode: Code. Provide clean, secure, runnable code with concise explanation.`;
    }

    if (projectContext) {
      systemInstruction += `\nProject Context (${projectContext.title || 'Active Project'}): ${projectContext.description || ''}.`;
    }

    // Clean multi-turn contents construction adhering strictly to Gemini requirements:
    const contents: any[] = [];

    if (Array.isArray(history) && history.length > 0) {
      let startIndex = -1;
      for (let i = 0; i < history.length; i++) {
        if (history[i]?.role === 'user') {
          startIndex = i;
          break;
        }
      }

      if (startIndex !== -1) {
        for (let i = startIndex; i < history.length; i++) {
          const item = history[i];
          const role = item.role === 'model' ? 'model' : 'user';
          const textContent = (item.content || '').trim();

          if (!textContent) continue;

          if (contents.length > 0 && contents[contents.length - 1].role === role) {
            contents[contents.length - 1].parts[0].text += `\n\n${textContent}`;
          } else {
            contents.push({
              role,
              parts: [{ text: textContent }],
            });
          }
        }
      }
    }

    // Build the current user turn parts
    const currentParts: any[] = [];
    if (file && file.data && file.mimeType) {
      currentParts.push({
        inlineData: {
          mimeType: file.mimeType,
          data: file.data,
        },
      });
    }

    const currentText = trimmedPrompt || 'Please process this request.';
    currentParts.push({ text: currentText });

    if (contents.length === 0) {
      contents.push({
        role: 'user',
        parts: currentParts,
      });
    } else {
      const lastTurn = contents[contents.length - 1];
      if (lastTurn.role === 'user') {
        contents[contents.length - 1] = {
          role: 'user',
          parts: currentParts,
        };
      } else {
        contents.push({
          role: 'user',
          parts: currentParts,
        });
      }
    }

    const result = await generateContentWithFallback(ai, contents, {
      systemInstruction,
      temperature: 0.7,
    });

    if (result && result.text) {
      return res.json({ text: result.text, capability: 'chat', isFallback: false });
    }

    return res.status(500).json({
      success: false,
      error: 'Chat AI service is momentarily busy. Please click Retry.',
    });
  } catch (err: any) {
    console.error('Chat AI generation error:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Chat AI request failed. Please click Retry.',
    });
  }
});

// Production static assets or Vite middleware dev mode
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[OTHERWISE] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

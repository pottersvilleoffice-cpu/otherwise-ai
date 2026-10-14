export interface UserChoice {
  id: string;
  questionId: string;
  questionText: string;
  selectedOption: string;
  customText?: string;
}

export interface TimelineEvent {
  yearOffset: string;
  title: string;
  description: string;
}

export interface ParallelSelf {
  archetype: string;
  tagline: string;
  coreDrive: string;
  unlockedStrength: string;
  hiddenVulnerability: string;
  signatureQuote: string;
}

export interface Timeline {
  id: string;
  parentId: string | null;
  branchChoiceSummary?: string;
  title: string;
  userName: string;
  futureAge: string;
  location: string;
  occupation: string;
  personality: string;
  majorAchievement: string;
  majorChallenge: string;
  turningPoint: string;
  dailyLife: string;
  biggestRegret: string;
  biggestStrength: string;
  signatureQuote: string;
  worldAtmosphere: string;
  keyObjects: string[];
  cinematicRevealSequence: string[];
  events: TimelineEvent[];
  parallelSelf: ParallelSelf;
  visualTheme: {
    gradient: string;
    accentColor: string;
    bgImage?: string;
    glowColor: string;
  };
  choices: UserChoice[];
  depth: number;
  createdAt: string;
  lastVisitedAt: string;
  category?: 'UNEXPECTED' | 'BEAUTIFUL' | 'EXTREME' | 'CREATIVE' | 'NEW_WORLDS';
}

export interface LifeQuestion {
  id: string;
  title: string;
  prompt: string;
  subtext?: string;
  category: string;
  options: {
    label: string;
    description: string;
    iconName?: string;
    visualTone?: string;
  }[];
  allowCustom?: boolean;
}

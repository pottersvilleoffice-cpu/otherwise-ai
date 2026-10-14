import React, { createContext, useContext, useState, useEffect } from 'react';
import { Timeline, UserChoice } from '../types/timeline';
import { EXPLORE_TIMELINES } from '../data/exploreWorlds';

interface UserStats {
  worldsAltered: number;
  timelinesCreated: number;
  decisionsRevisited: number;
  branchesExplored: number;
}

interface TimelineContextType {
  timelines: Timeline[];
  activeTimeline: Timeline | null;
  activeTimelineId: string | null;
  activeTab: 'home' | 'wizard' | 'timeline' | 'reveal' | 'tree' | 'compare' | 'worlds' | 'explore' | 'profile';
  userName: string;
  userChoices: UserChoice[];
  stats: UserStats;
  isGenerating: boolean;
  generationError: string | null;
  comparePair: [Timeline, Timeline] | null;
  rewindSourceTimeline: Timeline | null;
  setUserName: (name: string) => void;
  setUserChoices: (choices: UserChoice[]) => void;
  setActiveTab: (tab: TimelineContextType['activeTab']) => void;
  selectTimeline: (timelineId: string) => void;
  startNewJourney: () => void;
  generateInitialTimeline: (name: string, choices: UserChoice[]) => Promise<Timeline | null>;
  branchFromRewind: (
    parentTimeline: Timeline,
    changedChoiceId: string,
    newChoiceValue: string,
    updatedChoices: UserChoice[]
  ) => Promise<Timeline | null>;
  openCompare: (t1: Timeline, t2?: Timeline) => void;
  openRewind: (timeline: Timeline) => void;
  deleteTimeline: (timelineId: string) => void;
  resetAllData: () => void;
}

const STORAGE_KEY_TIMELINES = 'otherwise_timelines_v1';
const STORAGE_KEY_STATS = 'otherwise_stats_v1';
const STORAGE_KEY_USER = 'otherwise_username_v1';

const TimelineContext = createContext<TimelineContextType | undefined>(undefined);

export const TimelineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userName, setUserNameState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_USER) || '';
  });

  const [timelines, setTimelines] = useState<Timeline[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TIMELINES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load timelines from storage', e);
    }
    return [];
  });

  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STATS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load stats from storage', e);
    }
    return {
      worldsAltered: 0,
      timelinesCreated: 0,
      decisionsRevisited: 0,
      branchesExplored: 0,
    };
  });

  const [activeTimelineId, setActiveTimelineId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TimelineContextType['activeTab']>('home');
  const [userChoices, setUserChoices] = useState<UserChoice[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [comparePair, setComparePair] = useState<[Timeline, Timeline] | null>(null);
  const [rewindSourceTimeline, setRewindSourceTimeline] = useState<Timeline | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TIMELINES, JSON.stringify(timelines));
    } catch (e) {
      console.error('Failed to persist timelines', e);
    }
  }, [timelines]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
    } catch (e) {
      console.error('Failed to persist stats', e);
    }
  }, [stats]);

  const setUserName = (name: string) => {
    setUserNameState(name);
    try {
      localStorage.setItem(STORAGE_KEY_USER, name);
    } catch (e) {
      console.warn('Failed to save username to localStorage', e);
    }
  };

  const activeTimeline =
    timelines.find((t) => t.id === activeTimelineId) ||
    EXPLORE_TIMELINES.find((t) => t.id === activeTimelineId) ||
    (timelines.length > 0 ? timelines[0] : null);

  const selectTimeline = (timelineId: string) => {
    setActiveTimelineId(timelineId);
    setStats((prev) => ({
      ...prev,
      branchesExplored: prev.branchesExplored + 1,
    }));
    setActiveTab('timeline');
  };

  const startNewJourney = () => {
    setUserChoices([]);
    setGenerationError(null);
    setActiveTab('wizard');
  };

  const openRewind = (timeline: Timeline) => {
    setRewindSourceTimeline(timeline);
    setActiveTab('tree'); // Tree view holds the rewind orchestrator
  };

  const openCompare = (t1: Timeline, t2?: Timeline) => {
    let second = t2;
    if (!second) {
      // Find another timeline
      second =
        timelines.find((t) => t.id !== t1.id) ||
        EXPLORE_TIMELINES.find((t) => t.id !== t1.id) ||
        EXPLORE_TIMELINES[0];
    }
    setComparePair([t1, second]);
    setActiveTab('compare');
  };

  const generateInitialTimeline = async (name: string, choices: UserChoice[]): Promise<Timeline | null> => {
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const res = await fetch('/api/generate-timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: name, choices }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      const raw = data.timeline;

      // Assign matching image if available from explore or fallback artwork
      const newTimeline: Timeline = {
        id: `tl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        parentId: null,
        title: raw.title || 'The Solitary Cartographer',
        userName: name || 'You',
        futureAge: raw.futureAge || '35',
        location: raw.location || 'Echo Sanctuary, Coastal Ridge',
        occupation: raw.occupation || 'Keeper of Lost Coordinates',
        personality: raw.personality || 'Attuned, silent, luminous',
        majorAchievement: raw.majorAchievement || 'Mapped what everyone else ignored',
        majorChallenge: raw.majorChallenge || 'Enduring the quiet threshold',
        turningPoint: raw.turningPoint || 'The morning you stopped looking back',
        dailyLife: raw.dailyLife || 'Waking with the dawn tide, recording signals in cold ink.',
        biggestRegret: raw.biggestRegret || 'Not departing ten years earlier',
        biggestStrength: raw.biggestStrength || 'Unshakable presence in silence',
        signatureQuote: raw.signatureQuote || 'Every decision leaves behind another version of your life.',
        worldAtmosphere: raw.worldAtmosphere || 'Salt mist, cedar scent, warm tungsten light.',
        keyObjects: raw.keyObjects && raw.keyObjects.length > 0 ? raw.keyObjects : ['Brass compass', 'Indigo journal', 'Cedar whistle'],
        cinematicRevealSequence:
          raw.cinematicRevealSequence && raw.cinematicRevealSequence.length > 0
            ? raw.cinematicRevealSequence
            : [
                'Five years after your quiet turning point...',
                'You are living in a place you once thought was only a dream.',
                'Your decision transformed the fabric of your days.',
                'Here is the life that stepped into being.',
              ],
        events: raw.events || [
          { yearOffset: '+1 Year', title: 'The Threshold', description: 'Taking the first unapproved step.' },
          { yearOffset: '+4 Years', title: 'The Awakening', description: 'The craft becomes second nature.' },
          { yearOffset: '+8 Years', title: 'The Enduring Mark', description: 'Leaving a permanent trace on the world.' },
        ],
        parallelSelf: raw.parallelSelf || {
          archetype: 'THE PILGRIM',
          tagline: 'Somewhere in another possibility, you took the uncharted trail.',
          coreDrive: 'To discover reality as it is.',
          unlockedStrength: 'Immunity to haste.',
          hiddenVulnerability: 'Longing for what was left behind.',
          signatureQuote: 'I chose the silence that speaks.',
        },
        visualTheme: {
          gradient: 'from-slate-900/80 via-blue-950/70 to-black',
          accentColor: raw.visualTheme?.accentColor || '#38bdf8',
          glowColor: raw.visualTheme?.glowColor || 'rgba(56, 189, 248, 0.25)',
          bgImage: '/src/assets/images/void_horizon_portal_1791336496977.jpg',
        },
        choices,
        depth: 0,
        createdAt: new Date().toISOString(),
        lastVisitedAt: new Date().toISOString(),
      };

      setTimelines((prev) => [newTimeline, ...prev]);
      setActiveTimelineId(newTimeline.id);
      setStats((prev) => ({
        ...prev,
        timelinesCreated: prev.timelinesCreated + 1,
        worldsAltered: prev.worldsAltered + 1,
      }));

      // Switch to cinematic reveal first!
      setActiveTab('reveal');
      return newTimeline;
    } catch (err: any) {
      console.error('Timeline generation failed:', err);
      setGenerationError(err.message || 'Failed to generate possibility');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const branchFromRewind = async (
    parentTimeline: Timeline,
    changedChoiceId: string,
    newChoiceValue: string,
    updatedChoices: UserChoice[]
  ): Promise<Timeline | null> => {
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const oldChoice = parentTimeline.choices.find((c) => c.id === changedChoiceId);
      const res = await fetch('/api/branch-timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: parentTimeline.userName,
          parentTimeline,
          changedChoice: {
            questionId: oldChoice?.questionId,
            questionText: oldChoice?.questionText,
            oldOption: oldChoice?.selectedOption,
            newOption: newChoiceValue,
          },
          allChoices: updatedChoices,
        }),
      });

      if (!res.ok) throw new Error('Branch API error');
      const data = await res.json();
      const raw = data.timeline;

      const newTimeline: Timeline = {
        id: `tl-branch-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        parentId: parentTimeline.id,
        branchChoiceSummary: `Rewound: "${oldChoice?.selectedOption.slice(0, 30)}..." → "${newChoiceValue.slice(0, 30)}..."`,
        title: raw.title || `Branch of ${parentTimeline.title}`,
        userName: parentTimeline.userName,
        futureAge: raw.futureAge || parentTimeline.futureAge,
        location: raw.location || 'Divergent Sanctorum',
        occupation: raw.occupation || 'Wanderer of Alternate Horizons',
        personality: raw.personality || 'Contemplative and transformed',
        majorAchievement: raw.majorAchievement || 'Chose the second chance and mastered it',
        majorChallenge: raw.majorChallenge || 'Living with the knowledge of another life',
        turningPoint: `The moment you rewound time and decided: "${newChoiceValue}"`,
        dailyLife: raw.dailyLife || 'Every morning starts with the gratitude of someone who lived twice.',
        biggestRegret: raw.biggestRegret || 'Wondering about the original timeline',
        biggestStrength: raw.biggestStrength || 'The profound realization that no fate is fixed',
        signatureQuote: raw.signatureQuote || 'One decision was all it took to become someone else.',
        worldAtmosphere: raw.worldAtmosphere || parentTimeline.worldAtmosphere,
        keyObjects: raw.keyObjects || parentTimeline.keyObjects,
        cinematicRevealSequence: [
          'You reached into the past and changed one pivotal choice.',
          `Instead of ${oldChoice?.selectedOption.slice(0, 35)}...`,
          `You chose: ${newChoiceValue.slice(0, 35)}...`,
          'A brand new timeline opened in the dark.',
        ],
        events: raw.events || parentTimeline.events,
        parallelSelf: raw.parallelSelf || {
          archetype: 'THE DIVERGENT SELF',
          tagline: 'Born from a decision you finally dared to reverse.',
          coreDrive: 'To explore the branch not taken.',
          unlockedStrength: 'Freedom from inevitability.',
          hiddenVulnerability: 'Echoes of the alternate memory.',
          signatureQuote: 'I lived two lives in a single heart.',
        },
        visualTheme: {
          gradient: 'from-amber-950/70 via-stone-900/80 to-black',
          accentColor: raw.visualTheme?.accentColor || '#f59e0b',
          glowColor: raw.visualTheme?.glowColor || 'rgba(245, 158, 11, 0.25)',
          bgImage:
            raw.visualTheme?.accentColor === '#10b981'
              ? '/src/assets/images/tokyo_canopy_biolab_1791336513959.jpg'
              : raw.visualTheme?.accentColor === '#38bdf8'
              ? '/src/assets/images/deep_ocean_observatory_1791336524682.jpg'
              : '/src/assets/images/desert_sound_sanctuary_1791336535841.jpg',
        },
        choices: updatedChoices,
        depth: (parentTimeline.depth || 0) + 1,
        createdAt: new Date().toISOString(),
        lastVisitedAt: new Date().toISOString(),
      };

      setTimelines((prev) => [newTimeline, ...prev]);
      setActiveTimelineId(newTimeline.id);
      setStats((prev) => ({
        ...prev,
        timelinesCreated: prev.timelinesCreated + 1,
        decisionsRevisited: prev.decisionsRevisited + 1,
        worldsAltered: prev.worldsAltered + 1,
      }));

      // Switch to reveal sequence
      setActiveTab('reveal');
      return newTimeline;
    } catch (err: any) {
      console.error('Branch generation failed:', err);
      setGenerationError(err.message || 'Branch generation error');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteTimeline = (timelineId: string) => {
    setTimelines((prev) => prev.filter((t) => t.id !== timelineId));
    if (activeTimelineId === timelineId) {
      setActiveTimelineId(null);
      setActiveTab('worlds');
    }
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEY_TIMELINES);
    localStorage.removeItem(STORAGE_KEY_STATS);
    setTimelines([]);
    setActiveTimelineId(null);
    setStats({
      worldsAltered: 0,
      timelinesCreated: 0,
      decisionsRevisited: 0,
      branchesExplored: 0,
    });
    setActiveTab('home');
  };

  return (
    <TimelineContext.Provider
      value={{
        timelines,
        activeTimeline,
        activeTimelineId,
        activeTab,
        userName,
        userChoices,
        stats,
        isGenerating,
        generationError,
        comparePair,
        rewindSourceTimeline,
        setUserName,
        setUserChoices,
        setActiveTab,
        selectTimeline,
        startNewJourney,
        generateInitialTimeline,
        branchFromRewind,
        openCompare,
        openRewind,
        deleteTimeline,
        resetAllData,
      }}
    >
      {children}
    </TimelineContext.Provider>
  );
};

export const useTimeline = () => {
  const context = useContext(TimelineContext);
  if (!context) {
    throw new Error('useTimeline must be used within a TimelineProvider');
  }
  return context;
};

import { LifeQuestion } from '../types/timeline';

export const LIFE_QUESTIONS: LifeQuestion[] = [
  {
    id: 'desire',
    title: 'THE UNPURSUED',
    prompt: "What's something you've always secretly wanted to try?",
    subtext: 'The path you left untouched in the back of your mind.',
    category: 'desire',
    options: [
      {
        label: 'Disappear into a secluded coastal studio & craft physical art',
        description: 'Leaving behind noise for wood, pigments, stone, and silence.',
        visualTone: 'from-amber-950/40 via-stone-900/60 to-black',
      },
      {
        label: 'Lead an expedition into unmapped deep-sea or polar realms',
        description: 'Where human signal ends and the ancient world remains unbroken.',
        visualTone: 'from-cyan-950/40 via-blue-950/60 to-black',
      },
      {
        label: 'Build an open sanctuary for thinkers, wanderers & outcasts',
        description: 'A physical hearth where people rebuild who they are.',
        visualTone: 'from-emerald-950/40 via-teal-950/60 to-black',
      },
      {
        label: 'Invent a technology that alters human perception or memory',
        description: 'Stepping beyond the consensus barrier of the known senses.',
        visualTone: 'from-purple-950/40 via-indigo-950/60 to-black',
      },
    ],
    allowCustom: true,
  },
  {
    id: 'freedom',
    title: 'UNJUDGED',
    prompt: 'What would you choose if nobody on Earth could judge you?',
    subtext: 'No expectations, no family echoes, no societal milestones.',
    category: 'freedom',
    options: [
      {
        label: 'Abandon conventional career ambition for radical simplicity',
        description: 'A small dwelling, tending ancient trees, waking with the dawn.',
        visualTone: 'from-stone-900/40 via-zinc-900/60 to-black',
      },
      {
        label: 'Pour every ounce of energy into an obsessive masterwork',
        description: 'No balance, no compromises, only pure ruthless creation.',
        visualTone: 'from-rose-950/40 via-red-950/60 to-black',
      },
      {
        label: 'Live as an anonymous nomad across oceans with no permanent home',
        description: 'Never remaining in one country longer than a season.',
        visualTone: 'from-sky-950/40 via-slate-900/60 to-black',
      },
      {
        label: 'Study strange forgotten disciplines that yield no money or fame',
        description: 'Ancient archaeoastronomy, lost languages, or sacred botany.',
        visualTone: 'from-violet-950/40 via-purple-950/60 to-black',
      },
    ],
    allowCustom: true,
  },
  {
    id: 'core_drive',
    title: 'THE CALLING',
    prompt: 'Which instinct defines your deeper nature?',
    subtext: 'When every external layer is stripped away.',
    category: 'calling',
    options: [
      {
        label: 'To BUILD something tangible that outlasts human memory',
        description: 'Monuments, archives, architectures of endurance.',
        visualTone: 'from-orange-950/40 via-amber-950/60 to-black',
      },
      {
        label: 'To EXPLORE beyond the edge of what has been charted',
        description: 'Venture where maps turn into blank ink.',
        visualTone: 'from-blue-950/40 via-indigo-950/60 to-black',
      },
      {
        label: 'To PROTECT the vulnerable, the endangered, and the delicate',
        description: 'Guarding living heritage, sanctuary, and tender lives.',
        visualTone: 'from-emerald-950/40 via-green-950/60 to-black',
      },
      {
        label: 'To DISCOVER a hidden truth the world has forgotten or missed',
        description: 'Decoding the laws beneath phenomena and consciousness.',
        visualTone: 'from-fuchsia-950/40 via-purple-950/60 to-black',
      },
    ],
  },
  {
    id: 'fear',
    title: 'THE SHADOW',
    prompt: 'What scares you more: failure or regret?',
    subtext: 'Every life choice is an exchange between these two gravity wells.',
    category: 'fear',
    options: [
      {
        label: 'REGRET scares me more',
        description: 'The agonizing question of "What could have been?" is far worse than crashing while trying.',
        visualTone: 'from-amber-900/30 via-zinc-900/70 to-black',
      },
      {
        label: 'FAILURE scares me more',
        description: 'Losing what has been painstakingly gathered, disappointing those who counted on me.',
        visualTone: 'from-blue-900/30 via-zinc-900/70 to-black',
      },
      {
        label: 'BEING FORGOTTEN in routine',
        description: 'Drifting into an unexamined, comfortable slumber that steals decades.',
        visualTone: 'from-purple-900/30 via-zinc-900/70 to-black',
      },
    ],
  },
  {
    id: 'anchor',
    title: 'THE ESSENCE',
    prompt: 'What truly matters most to you when the night is quiet?',
    subtext: 'The single thread you would hold onto in an unraveling world.',
    category: 'values',
    options: [
      {
        label: 'Absolute autonomous freedom over my time and mind',
        description: 'Unbeholden to masters, deadlines, or false obligations.',
        visualTone: 'from-cyan-950/40 via-stone-900/60 to-black',
      },
      {
        label: 'Profound devotion to a small circle of soulmates & loves',
        description: 'Depth of genuine human intimacy over broad worldly recognition.',
        visualTone: 'from-rose-950/40 via-stone-900/60 to-black',
      },
      {
        label: 'Living with relentless curiosity and poetic wonder',
        description: 'Never losing the childhood spark of sheer amazement at existence.',
        visualTone: 'from-amber-950/40 via-stone-900/60 to-black',
      },
      {
        label: 'Leaving the world measurably kinder and less lonely',
        description: 'Healing wounds in the collective fabric before departing.',
        visualTone: 'from-teal-950/40 via-stone-900/60 to-black',
      },
    ],
  },
  {
    id: 'door',
    title: 'THE THRESHOLD',
    prompt: 'Choose one door.',
    subtext: 'Step across. There is no turning back on this side of reality.',
    category: 'threshold',
    options: [
      {
        label: 'The Obsidian Gate',
        description: 'Carved of dark volcanic glass, radiating faint warm heat. Leaning into deep mystery and radical rebirth.',
        visualTone: 'from-neutral-900 via-stone-950 to-black',
      },
      {
        label: 'The Verdant Archway',
        description: 'Woven from living wisteria, moss and ancient oak. Leaning into harmony, natural resonance and grounded peace.',
        visualTone: 'from-emerald-950 via-teal-950 to-black',
      },
      {
        label: 'The Luminous Aperture',
        description: 'Hovering ring of pale amber dawn and horizon wind. Leaning into audacious invention and uncharted altitude.',
        visualTone: 'from-amber-950 via-yellow-950/60 to-black',
      },
      {
        label: 'The Abyssal Vault',
        description: 'Submerged basalt arch surrounded by dark phosphorescent tide. Leaning into quiet depth and unspoken truths.',
        visualTone: 'from-blue-950 via-indigo-950 to-black',
      },
    ],
  },
];

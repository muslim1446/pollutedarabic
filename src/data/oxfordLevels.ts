import { OxfordLevel, OxfordLevelMeta } from '../types';

export const OXFORD_LEVELS: OxfordLevelMeta[] = [
  {
    id: 'all',
    code: 'All',
    name: 'All Levels',
    cefr: 'A1 to C1',
    description: 'Practice with Modern Standard Arabic words and announcements across all difficulty levels'
  },
  {
    id: 'A1',
    code: 'A1',
    name: 'Beginner',
    cefr: 'A1',
    description: 'Everyday MSA: Arabic numbers ٠–١٠٠, greetings, simple nouns, emphatic س/ص and ت/ط pairs'
  },
  {
    id: 'A2',
    code: 'A2',
    name: 'Elementary',
    cefr: 'A2',
    description: 'Daily life MSA: transport, time, mosque/market phrases, long-vs-short vowels, ث/س and ذ/ز'
  },
  {
    id: 'B1',
    code: 'B1',
    name: 'Intermediate',
    cefr: 'B1',
    description: 'School, travel and clinic announcements; pharyngeals ح/ه and ع/أ, uvular ق/ك'
  },
  {
    id: 'B2',
    code: 'B2',
    name: 'Upper Intermediate',
    cefr: 'B2',
    description: 'Fast PA speech and noisy stations; gemination (shadda), sun/moon letters, formal discourse'
  },
  {
    id: 'C1',
    code: 'C1',
    name: 'Advanced',
    cefr: 'C1',
    description: 'Subtle MSA distinctions: emphatic spread, case endings, rapid news-style announcements'
  }
];

export function getOxfordLevelMeta(level?: OxfordLevel): OxfordLevelMeta {
  if (!level || level === 'all') return OXFORD_LEVELS[0];
  return OXFORD_LEVELS.find((l) => l.id === level) || OXFORD_LEVELS[0];
}

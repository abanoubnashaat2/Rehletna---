import { RIDDLES, VERSE_CHALLENGES, LINK_CHALLENGES, QUOTE_CHALLENGES, MATH_QUESTIONS, SCAVENGER_ITEMS } from '../constants';
import { Riddle, VerseChallenge, LinkChallenge, QuoteChallenge, MathQuestion, ScavengerItem } from '../types';

// Keys for LocalStorage
const KEYS = {
  RIDDLES: 'rehletna_content_riddles',
  VERSES: 'rehletna_content_verses',
  LINKS: 'rehletna_content_links',
  QUOTES: 'rehletna_content_quotes',
  MATH: 'rehletna_content_math',
  SCAVENGER: 'rehletna_content_scavenger'
};

// Generic getter and setter
const getData = <T>(key: string, defaultData: T[]): T[] => {
  const saved = localStorage.getItem(key);
  if (saved) {
    return JSON.parse(saved);
  }
  return defaultData;
};

const saveData = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Specific Accessors
export const ContentManager = {
  getRiddles: () => getData<Riddle>(KEYS.RIDDLES, RIDDLES),
  saveRiddles: (data: Riddle[]) => saveData(KEYS.RIDDLES, data),

  getVerses: () => getData<VerseChallenge>(KEYS.VERSES, VERSE_CHALLENGES),
  saveVerses: (data: VerseChallenge[]) => saveData(KEYS.VERSES, data),

  getLinks: () => getData<LinkChallenge>(KEYS.LINKS, LINK_CHALLENGES),
  saveLinks: (data: LinkChallenge[]) => saveData(KEYS.LINKS, data),

  getQuotes: () => getData<QuoteChallenge>(KEYS.QUOTES, QUOTE_CHALLENGES),
  saveQuotes: (data: QuoteChallenge[]) => saveData(KEYS.QUOTES, data),

  getMath: () => getData<MathQuestion>(KEYS.MATH, MATH_QUESTIONS),
  saveMath: (data: MathQuestion[]) => saveData(KEYS.MATH, data),

  getScavenger: () => getData<ScavengerItem>(KEYS.SCAVENGER, SCAVENGER_ITEMS),
  saveScavenger: (data: ScavengerItem[]) => saveData(KEYS.SCAVENGER, data),
};

export const AuthManager = {
  login: (name: string, isAdmin: boolean) => {
    localStorage.setItem('rehletna_user', JSON.stringify({ name, isAdmin }));
  },
  logout: () => {
    localStorage.removeItem('rehletna_user');
  },
  getUser: () => {
    const u = localStorage.getItem('rehletna_user');
    return u ? JSON.parse(u) : null;
  }
};
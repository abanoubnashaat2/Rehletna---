export interface Riddle {
  id: number;
  type?: 'text' | 'emoji'; // Added type
  question: string;
  answer: string;
  hint: string;
}

export interface ScavengerItem {
  id: number;
  title: string;
  description: string;
  points: number;
  icon?: string;
}

export interface MathQuestion {
  id: number;
  question: string;
  answer: number;
  explanation: string;
}

export interface VerseChallenge {
  id: number;
  level: number; // Added level property
  type: 'missing_word' | 'arrange' | 'reference';
  text?: string; // Full text
  words?: string[]; // For arrange
  missing?: string; // For missing word
  options?: string[]; // For reference/missing
  correct: string;
}

export interface LinkChallenge {
  id: number;
  items: string[];
  answer: string;
  options: string[];
}

export interface QuoteChallenge {
  id: number;
  quote: string;
  answer: string;
  options: string[];
}
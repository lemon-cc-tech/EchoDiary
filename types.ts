export interface EmotionData {
  label: string;
  color: string; // Hex code
}

export interface JournalEntry {
  id: string; // YYYY-MM-DD
  date: string; // Full ISO string or formatted date
  rawTranscript: string;
  diaryNarrative: string;
  daySummary: string;
  journalSummary: string[]; // Bullet points
  emotion: EmotionData;
  categories: string[];
  lastUpdated: number; // Timestamp
}

export type VisualTheme = 'echoism' | 'material-you';

export interface AppPreferences {
  userName: string;
  diaryStyle: DiaryStyle;
  diaryLanguage: DiaryLanguage;
  theme: 'light' | 'dark';
  visualTheme: VisualTheme;
  apiKey?: string; // Optional user-provided API key
}

export enum DiaryStyle {
  SIMPLE = 'Simple & Direct',
  MINIMAL_POETIC = 'Minimal Poetic',
  DETAILED = 'Detailed & Analytical',
  GRATITUDE = 'Gratitude Focused'
}

export enum DiaryLanguage {
  ENGLISH = 'English',
  SPANISH = 'Spanish',
  HINDI = 'Hindi',
  FRENCH = 'French',
  MATCH_INPUT = 'Match Input'
}

export type ViewState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'ERROR';
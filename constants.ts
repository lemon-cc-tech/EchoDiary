import { DiaryLanguage, DiaryStyle } from "./types";

export const DEFAULT_PREFERENCES = {
  userName: 'Traveler',
  diaryStyle: DiaryStyle.SIMPLE,
  diaryLanguage: DiaryLanguage.ENGLISH,
  theme: 'dark' as const,
  visualTheme: 'echoism' as const,
};

export const AI_MODEL_NAME = 'gemini-2.5-flash';

// Helper to format date key YYYY-MM-DD
export const getTodayKey = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateFriendly = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

export const formatDateShort = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Helper to determine if color is light (for contrast text)
export const isLightColor = (hex: string): boolean => {
  if (!hex) return true;
  // Handle 3-digit hex and remove hash
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map(char => char + char).join('');
  }
  if (c.length !== 6) return true; // Fallback to light handling if invalid

  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  
  // Perceived brightness (YIQ formula)
  const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return brightness > 160; // Threshold adjusted for aesthetic preference on pastels
};
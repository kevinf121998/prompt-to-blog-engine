import { Brief } from '@/types/brief';

const BRIEF_STORAGE_KEY = 'radBrief_v1';

export const saveBriefToStorage = (brief: Brief): void => {
  try {
    localStorage.setItem(BRIEF_STORAGE_KEY, JSON.stringify(brief));
  } catch (error) {
    console.error('Failed to save brief to localStorage:', error);
  }
};

export const getBriefFromStorage = (): Brief | null => {
  try {
    const stored = localStorage.getItem(BRIEF_STORAGE_KEY);
    if (!stored) return null;
    
    const brief = JSON.parse(stored);
    return brief;
  } catch (error) {
    console.error('Failed to load brief from localStorage:', error);
    return null;
  }
};

export const clearBriefFromStorage = (): void => {
  try {
    localStorage.removeItem(BRIEF_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear brief from localStorage:', error);
  }
};

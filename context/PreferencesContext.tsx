import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppPreferences, DiaryLanguage, DiaryStyle, VisualTheme } from '../types';
import { DEFAULT_PREFERENCES } from '../constants';

interface PreferencesContextType extends AppPreferences {
  setUserName: (name: string) => void;
  setDiaryStyle: (style: DiaryStyle) => void;
  setDiaryLanguage: (lang: DiaryLanguage) => void;
  setVisualTheme: (theme: VisualTheme) => void;
  setApiKey: (key: string) => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error("usePreferences must be used within PreferencesProvider");
  return context;
};

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<AppPreferences>(() => {
    const saved = localStorage.getItem('echo_preferences');
    // Merge saved preferences with default to ensure consistency
    return saved ? { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) } : DEFAULT_PREFERENCES;
  });

  useEffect(() => {
    localStorage.setItem('echo_preferences', JSON.stringify(preferences));
    
    // Inject Visual Theme Class
    const body = document.body;
    body.classList.remove('theme-echoism', 'theme-material-you');
    
    if (preferences.visualTheme) {
      body.classList.add(`theme-${preferences.visualTheme}`);
    }

  }, [preferences]);

  const setUserName = (userName: string) => setPreferences(prev => ({ ...prev, userName }));
  const setDiaryStyle = (diaryStyle: DiaryStyle) => setPreferences(prev => ({ ...prev, diaryStyle }));
  const setDiaryLanguage = (diaryLanguage: DiaryLanguage) => setPreferences(prev => ({ ...prev, diaryLanguage }));
  const setVisualTheme = (visualTheme: VisualTheme) => setPreferences(prev => ({ ...prev, visualTheme }));
  const setApiKey = (apiKey: string) => setPreferences(prev => ({ ...prev, apiKey }));

  return (
    <PreferencesContext.Provider value={{ ...preferences, setUserName, setDiaryStyle, setDiaryLanguage, setVisualTheme, setApiKey }}>
      {children}
    </PreferencesContext.Provider>
  );
};
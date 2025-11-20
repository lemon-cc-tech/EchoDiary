import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { JournalEntry } from '../types';
import { getTodayKey } from '../constants';

interface JournalContextType {
  entries: Record<string, JournalEntry>;
  getTodaysEntry: () => JournalEntry | null;
  updateTodaysEntry: (update: Partial<JournalEntry>) => void;
  replaceAllEntries: (newEntries: Record<string, JournalEntry>) => void;
  isProcessing: boolean;
  setIsProcessing: (loading: boolean) => void;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export const useJournal = () => {
  const context = useContext(JournalContext);
  if (!context) throw new Error("useJournal must be used within JournalProvider");
  return context;
};

export const JournalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // FIX: Load synchronously in initializer to prevent race conditions/data loss
  const [entries, setEntries] = useState<Record<string, JournalEntry>>(() => {
    try {
      const saved = localStorage.getItem('echo_journal_entries');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error("Failed to load entries from local storage", e);
      return {};
    }
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const entriesRef = useRef(entries); // For auto-save interval access

  // Update Ref when state changes
  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  // Immediate save helper
  const saveImmediately = (newEntries: Record<string, JournalEntry>) => {
    localStorage.setItem('echo_journal_entries', JSON.stringify(newEntries));
  };

  // Auto-save mechanism + Save on Close
  useEffect(() => {
    // Interval Save
    const interval = setInterval(() => {
      localStorage.setItem('echo_journal_entries', JSON.stringify(entriesRef.current));
    }, 10000); // Save every 10 seconds

    // Save on tab close/refresh
    const handleBeforeUnload = () => {
      localStorage.setItem('echo_journal_entries', JSON.stringify(entriesRef.current));
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const getTodaysEntry = (): JournalEntry | null => {
    const key = getTodayKey();
    return entries[key] || null;
  };

  const updateTodaysEntry = (update: Partial<JournalEntry>) => {
    const key = getTodayKey();
    setEntries(prev => {
      const existing = prev[key];
      const newEntry: JournalEntry = existing
        ? { ...existing, ...update, lastUpdated: Date.now() }
        : {
            id: key,
            date: new Date().toISOString(),
            rawTranscript: '',
            diaryNarrative: '',
            daySummary: '',
            journalSummary: [],
            emotion: { label: 'Neutral', color: '#d6d3d1' }, // Default Stone-300
            categories: [],
            lastUpdated: Date.now(),
            ...update
          };
      
      const nextState = { ...prev, [key]: newEntry };
      saveImmediately(nextState);
      return nextState;
    });
  };

  // Safe method to replace all entries (e.g. for import)
  const replaceAllEntries = (newEntries: Record<string, JournalEntry>) => {
    setEntries(newEntries);
    saveImmediately(newEntries);
  };

  return (
    <JournalContext.Provider value={{ entries, getTodaysEntry, updateTodaysEntry, replaceAllEntries, isProcessing, setIsProcessing }}>
      {children}
    </JournalContext.Provider>
  );
};
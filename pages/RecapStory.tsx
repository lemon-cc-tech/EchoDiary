import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJournal } from '../context/JournalContext';
import { usePreferences } from '../context/PreferencesContext';
import { JournalEntry } from '../types';
import { X, Pause, Play, SpeakerHigh, Heart, Wind, ArrowLeft } from 'phosphor-react';
import { isLightColor } from '../constants';

// --- Slide Types ---
type SlideType = 'intro' | 'emotion' | 'themes' | 'stats' | 'quote';

const RecapStory: React.FC = () => {
  const { period, id } = useParams<{ period: string; id: string }>();
  const navigate = useNavigate();
  const { entries } = useJournal();
  const { userName } = usePreferences();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  // --- Data Aggregation ---
  const storyData = useMemo(() => {
    if (!id || !period) return null;

    const allEntries = Object.values(entries) as JournalEntry[];
    let filtered: JournalEntry[] = [];
    let title = "";
    let subtitle = "";

    if (period === 'weekly') {
        const startDate = new Date(id); // ID is Sunday
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        
        filtered = allEntries.filter(e => {
            const d = new Date(e.date);
            return d >= startDate && d <= endDate;
        });
        title = "This Week";
        subtitle = `${startDate.toLocaleDateString('en-US', {month:'short', day:'numeric'})} - ${endDate.toLocaleDateString('en-US', {month:'short', day:'numeric'})}`;
    } else if (period === 'monthly') {
        filtered = allEntries.filter(e => e.id.startsWith(id)); // ID is YYYY-MM
        const [year, month] = id.split('-');
        const dateObj = new Date(Number(year), Number(month)-1);
        title = dateObj.toLocaleDateString('en-US', { month: 'long' });
        subtitle = `${year}`;
    } else if (period === 'yearly') {
        filtered = allEntries.filter(e => e.id.startsWith(id)); // ID is YYYY
        title = id;
        subtitle = "Year in Review";
    }

    if (filtered.length === 0) return null;

    // Metrics
    const moodCounts: Record<string, { count: number; color: string }> = {};
    const catCounts: Record<string, number> = {};
    let totalWords = 0;
    const quotes: {text: string, date: string}[] = [];

    filtered.forEach(e => {
        // Mood
        if (!moodCounts[e.emotion.label]) moodCounts[e.emotion.label] = { count: 0, color: e.emotion.color };
        moodCounts[e.emotion.label].count++;
        
        // Cats
        e.categories?.forEach(c => catCounts[c] = (catCounts[c] || 0) + 1);
        
        // Words
        totalWords += e.diaryNarrative.split(' ').length;

        // Quotes (from summaries)
        if (e.daySummary) quotes.push({ text: e.daySummary, date: e.date });
    });

    // Dominant Mood
    const topMood = Object.entries(moodCounts).sort((a, b) => b[1].count - a[1].count)[0];
    
    // Top Categories
    const topCats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(c => c[0]);

    // Random Quote
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    return {
        title,
        subtitle,
        count: filtered.length,
        topMood: topMood ? { label: topMood[0], color: topMood[1].color } : { label: 'Neutral', color: '#78716c' },
        topCats,
        totalWords,
        randomQuote
    };

  }, [entries, period, id]);

  // --- Slides Config ---
  const SLIDES: SlideType[] = ['intro', 'emotion', 'themes', 'stats', 'quote'];
  const DURATION = 5000; // 5 seconds per slide

  // --- Timer Logic ---
  useEffect(() => {
    if (isPaused || !storyData) return;

    const timer = setInterval(() => {
        setProgress(old => {
            if (old >= 100) {
                // Next slide
                if (currentSlide < SLIDES.length - 1) {
                    setCurrentSlide(c => c + 1);
                    return 0;
                } else {
                    // End
                    clearInterval(timer);
                    navigate(-1); 
                    return 100;
                }
            }
            return old + (100 / (DURATION / 100)); // Update every 100ms
        });
    }, 100);

    return () => clearInterval(timer);
  }, [currentSlide, isPaused, storyData, navigate, SLIDES.length]);

  // Reset progress on slide change
  useEffect(() => {
      setProgress(0);
  }, [currentSlide]);


  // --- Render Helpers ---
  if (!storyData) {
      return (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-8 bg-stone-50 dark:bg-stone-900 transition-colors duration-500">
              <div className="flex flex-col items-center text-center space-y-6 animate-fade-in-up">
                  <div className="w-20 h-20 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 dark:text-stone-500">
                     <Wind size={40} weight="duotone" />
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl text-stone-800 dark:text-stone-100 mb-2">Silence prevails, {userName}</h2>
                    <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed max-w-xs mx-auto">
                        No echoes were found for this period. The pages of this chapter are yet to be written.
                    </p>
                  </div>
                  <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center px-6 py-3 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 rounded-full shadow-sm border border-stone-200 dark:border-stone-700 font-medium text-sm hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                  >
                    <ArrowLeft size={16} className="mr-2" />
                    Return to Haven
                  </button>
              </div>
          </div>
      );
  }

  const isLightTheme = isLightColor(storyData.topMood.color);
  const textColor = isLightTheme ? 'text-stone-900' : 'text-white';
  const subTextColor = isLightTheme ? 'text-stone-700' : 'text-white/80';

  // Background Style (Dynamic based on mood)
  const bgStyle = {
      backgroundColor: storyData.topMood.color,
  };

  const handleTap = (e: React.MouseEvent, side: 'left' | 'right') => {
      e.stopPropagation();
      if (side === 'left') {
          if (currentSlide > 0) setCurrentSlide(c => c - 1);
      } else {
          if (currentSlide < SLIDES.length - 1) setCurrentSlide(c => c + 1);
          else navigate(-1);
      }
  };

  return (
    <div 
        className="fixed inset-0 z-[100] flex flex-col transition-colors duration-1000 ease-in-out overflow-hidden"
        style={bgStyle}
    >
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2 pt-4 safe-top">
            {SLIDES.map((_, idx) => (
                <div key={idx} className="h-1 flex-1 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                    <div 
                        className="h-full bg-white transition-all duration-100 ease-linear"
                        style={{ 
                            width: idx < currentSlide ? '100%' : idx === currentSlide ? `${progress}%` : '0%' 
                        }}
                    />
                </div>
            ))}
        </div>

        {/* Controls Header */}
        <div className="absolute top-6 right-4 z-20 flex items-center gap-4 safe-top">
             <button onClick={() => setIsPaused(!isPaused)} className={`p-2 rounded-full bg-black/10 backdrop-blur-md ${textColor}`}>
                {isPaused ? <Play weight="fill" /> : <Pause weight="fill" />}
             </button>
             <button onClick={() => navigate(-1)} className={`p-2 rounded-full bg-black/10 backdrop-blur-md ${textColor}`}>
                <X weight="bold" />
             </button>
        </div>

        {/* Tap Zones */}
        <div className="absolute inset-0 z-10 flex">
            <div className="w-1/3 h-full" onClick={(e) => handleTap(e, 'left')} />
            <div className="w-2/3 h-full" onClick={(e) => handleTap(e, 'right')} />
        </div>

        {/* --- SLIDE CONTENT --- */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-0 animate-fade-in-up">
            
            {/* 1. INTRO */}
            {SLIDES[currentSlide] === 'intro' && (
                <>
                    <p className={`text-sm uppercase tracking-[0.3em] font-bold mb-6 opacity-70 ${textColor}`}>Resonance</p>
                    <h1 className={`font-serif text-5xl md:text-7xl mb-4 leading-tight ${textColor}`}>
                        {storyData.title}
                    </h1>
                    <p className={`font-sans text-xl ${subTextColor}`}>
                        {storyData.subtitle}
                    </p>
                    <div className="mt-12 opacity-60">
                        <p className={`text-sm ${textColor}`}>Tap to explore</p>
                    </div>
                </>
            )}

            {/* 2. EMOTION */}
            {SLIDES[currentSlide] === 'emotion' && (
                <>
                    <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center mb-8 shadow-inner animate-pulse-slow">
                        <Heart size={64} weight="fill" className={isLightTheme ? 'text-stone-800' : 'text-white'} />
                    </div>
                    <p className={`text-2xl font-serif mb-2 ${subTextColor}`}>Your dominant vibe was</p>
                    <h2 className={`text-5xl md:text-6xl font-bold uppercase tracking-wide ${textColor}`}>
                        {storyData.topMood.label}
                    </h2>
                </>
            )}

            {/* 3. THEMES */}
            {SLIDES[currentSlide] === 'themes' && (
                <>
                     <p className={`text-xl font-serif mb-8 ${subTextColor}`}>You focused on</p>
                     <div className="flex flex-wrap justify-center gap-4 max-w-md">
                        {storyData.topCats.map((cat, i) => (
                            <span 
                                key={cat} 
                                className={`px-6 py-3 rounded-full text-lg font-medium backdrop-blur-md shadow-sm animate-scale-in
                                    ${isLightTheme ? 'bg-stone-900/10 text-stone-900' : 'bg-white/20 text-white'}
                                `}
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                #{cat}
                            </span>
                        ))}
                     </div>
                     {storyData.topCats.length === 0 && <p className={textColor}>No specific themes detected.</p>}
                </>
            )}

            {/* 4. STATS */}
            {SLIDES[currentSlide] === 'stats' && (
                <div className="grid grid-cols-1 gap-8 w-full max-w-sm">
                    <div className={`p-8 rounded-3xl backdrop-blur-md bg-white/10 border border-white/20`}>
                        <p className={`text-sm uppercase tracking-widest mb-2 opacity-70 ${textColor}`}>Total Entries</p>
                        <p className={`text-6xl font-bold ${textColor}`}>{storyData.count}</p>
                    </div>
                    <div className={`p-8 rounded-3xl backdrop-blur-md bg-white/10 border border-white/20`}>
                        <p className={`text-sm uppercase tracking-widest mb-2 opacity-70 ${textColor}`}>Words Spoken</p>
                        <p className={`text-6xl font-bold ${textColor}`}>{storyData.totalWords}</p>
                    </div>
                </div>
            )}

             {/* 5. QUOTE */}
             {SLIDES[currentSlide] === 'quote' && (
                <>
                    <SpeakerHigh size={48} weight="duotone" className={`mb-8 opacity-80 ${textColor}`} />
                    <blockquote className={`font-serif text-2xl md:text-3xl leading-relaxed italic mb-6 max-w-lg ${textColor}`}>
                        "{storyData.randomQuote.text}"
                    </blockquote>
                    <div className={`w-16 h-1 bg-current rounded-full opacity-30 mb-4 ${textColor}`} />
                    <p className={`text-sm uppercase tracking-widest opacity-70 ${textColor}`}>
                        {new Date(storyData.randomQuote.date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric' })}
                    </p>
                </>
            )}

        </div>
        
        {/* Footer Brand */}
        <div className={`absolute bottom-8 text-center w-full text-[10px] uppercase tracking-[0.2em] opacity-40 ${textColor}`}>
            EchoDiary Resonance
        </div>
    </div>
  );
};

export default RecapStory;
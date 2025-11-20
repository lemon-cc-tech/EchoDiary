import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJournal } from '../context/JournalContext';
import { usePreferences } from '../context/PreferencesContext';
import { formatDateFriendly, isLightColor } from '../constants';
import { ArrowLeft, Tag, CalendarBlank } from 'phosphor-react';

const EntryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { entries } = useJournal();
  const { visualTheme } = usePreferences();
  const isMaterial = visualTheme === 'material-you';

  const entry = id ? entries[id] : null;

  const moodCardStyles = useMemo(() => {
    const bgColor = entry?.emotion?.color || '#78716c';
    const isLight = isLightColor(bgColor);
    
    return {
      containerClass: isLight ? 'text-stone-800' : 'text-white',
      badgeClass: isLight ? 'bg-stone-900/10' : 'bg-white/20',
      opacityClass: isLight ? 'opacity-90' : 'opacity-95',
      bgStyle: { backgroundColor: bgColor }
    };
  }, [entry?.emotion?.color]);

  if (!entry) {
    return (
      <div className="px-6 pt-8 flex flex-col items-center justify-center h-[50vh]">
        <p className="text-stone-500">Entry not found.</p>
        <button 
          onClick={() => navigate('/archive')}
          className="mt-4 text-teal-600 font-medium hover:underline"
        >
          Return to Archive
        </button>
      </div>
    );
  }

  // Theme-specific styles matching Home.tsx
  const headerTextClass = isMaterial ? "text-[#171C1B] dark:text-[#E1E3E3]" : "text-stone-800 dark:text-stone-100";

  return (
    <div className="px-6 pt-8 pb-32">
      {/* Header */}
      <header className="mb-6 flex items-center">
        <button 
          onClick={() => navigate(-1)} 
          className={`mr-4 p-2 rounded-full shadow-sm active:scale-95 transition-transform border ${isMaterial ? 'bg-[#F0F2F1] dark:bg-[#2D3131] border-transparent text-[#171C1B] dark:text-[#E1E3E3]' : 'bg-white dark:bg-stone-800 border-stone-100 dark:border-stone-700 text-stone-600 dark:text-stone-300'}`}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className={`font-serif text-2xl ${headerTextClass}`}>
            {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long' })}
          </h1>
          <div className="flex items-center text-stone-500 dark:text-stone-400 text-xs uppercase tracking-wide mt-0.5">
            <CalendarBlank size={14} className="mr-1.5" />
            {formatDateFriendly(entry.date)}
          </div>
        </div>
      </header>

      <div className="space-y-6">
        {/* Emotion Card */}
        <div 
          className={`p-6 shadow-sm transition-all duration-500 animate-fade-in-up ${moodCardStyles.containerClass} ${isMaterial ? 'rounded-[24px]' : 'rounded-3xl'}`}
          style={moodCardStyles.bgStyle}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold uppercase tracking-widest opacity-80`}>Emotional Tone</span>
            <span className={`px-3 py-1 rounded-full text-xs backdrop-blur-sm font-medium ${moodCardStyles.badgeClass}`}>
              {entry.emotion.label}
            </span>
          </div>
          <p className={`font-serif text-lg leading-snug ${moodCardStyles.opacityClass}`}>
            "{entry.daySummary}"
          </p>
        </div>

        {/* Tags Row */}
        {entry.categories && entry.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 animate-fade-in-up">
            {entry.categories.map((cat, i) => (
              <div key={i} className={`flex items-center px-3 py-1 rounded-full border ${isMaterial ? 'bg-[#F0F2F1] dark:bg-[#2D3131] border-transparent' : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700'}`}>
                <Tag size={12} className="text-stone-400 mr-1.5" weight="fill" />
                <span className={`text-xs font-medium ${isMaterial ? 'text-[#171C1B] dark:text-[#E1E3E3]' : 'text-stone-600 dark:text-stone-300'}`}>{cat}</span>
              </div>
            ))}
          </div>
        )}

        {/* Narrative Card (The Diary) */}
        <div 
          className={`p-6 shadow-sm border animate-fade-in-up ${isMaterial 
            ? 'bg-white dark:bg-[#1E2121] border-transparent rounded-[24px]' 
            : 'bg-white dark:bg-stone-800 border-stone-100 dark:border-stone-700 rounded-3xl'}`}
        >
          <h3 className="text-xs font-bold uppercase text-stone-400 mb-4 tracking-widest">Diary Entry</h3>
          <div className={`prose dark:prose-invert font-serif leading-relaxed ${isMaterial ? 'text-[#171C1B] dark:text-[#E1E3E3]' : 'text-stone-700 dark:text-stone-300'}`}>
            {entry.diaryNarrative.split('\n').map((para, idx) => (
              <p key={idx} className="mb-4 last:mb-0">{para}</p>
            ))}
          </div>
        </div>

        {/* Key Points */}
        {entry.journalSummary && entry.journalSummary.length > 0 && (
          <div 
            className={`p-6 animate-fade-in-up ${isMaterial ? 'bg-[#F0F2F1] dark:bg-[#2D3131] rounded-[24px]' : 'bg-stone-100 dark:bg-stone-800/50 rounded-3xl'}`}
          >
            <h3 className="text-xs font-bold uppercase text-stone-500 mb-4 tracking-widest">Moments of Clarity</h3>
            <ul className="space-y-3">
              {entry.journalSummary.map((point, i) => (
                <li key={i} className={`flex items-start text-sm ${isMaterial ? 'text-[#404944] dark:text-[#C4C7C5]' : 'text-stone-600 dark:text-stone-400'}`}>
                  <span className="mr-3 text-teal-500 mt-1">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default EntryDetail;
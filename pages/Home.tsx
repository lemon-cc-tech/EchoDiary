import React, { useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useJournal } from '../context/JournalContext';
import { usePreferences } from '../context/PreferencesContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { generateJournalEntry } from '../services/geminiService';
import { formatDateFriendly, isLightColor } from '../constants';
import { Microphone, PenNib, Sparkle, Tag } from 'phosphor-react';

const Home: React.FC = () => {
  const { getTodaysEntry, updateTodaysEntry, setIsProcessing, isProcessing } = useJournal();
  const preferences = usePreferences();
  const { visualTheme, userName } = preferences;
  const entry = getTodaysEntry();
  const isMaterial = visualTheme === 'material-you';

  const processAudio = useCallback(async (newText: string) => {
    setIsProcessing(true);
    const currentRaw = entry?.rawTranscript || '';
    const combinedTranscript = `${currentRaw} ${newText}`.trim();
    
    updateTodaysEntry({ rawTranscript: combinedTranscript });

    const aiResult = await generateJournalEntry({
      transcript: combinedTranscript,
      currentEntry: entry,
      preferences: { style: preferences.diaryStyle, language: preferences.diaryLanguage }
    });

    if (aiResult) {
      updateTodaysEntry(aiResult);
    }
    setIsProcessing(false);
  }, [entry, preferences, updateTodaysEntry, setIsProcessing]);

  const { 
    isListening, 
    startListening, 
    stopListening, 
    interimTranscript 
  } = useSpeechRecognition(processAudio);

  // Calculate contrast values for the mood card
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

  // Theme-specific text colors for headers if needed (M3 vs Echo)
  const headerTextClass = isMaterial ? "text-[#171C1B] dark:text-[#E1E3E3]" : "text-stone-800 dark:text-stone-100";
  const subTextClass = isMaterial ? "text-[#404944] dark:text-[#C4C7C5]" : "text-stone-500 dark:text-stone-400";

  return (
    <div className="px-6 pt-6">
      {/* Header */}
      <header className="mb-8">
        <h1 className={`font-serif text-4xl mb-1 ${headerTextClass}`}>Today</h1>
        <p className={`font-sans text-sm uppercase tracking-wide ${subTextClass}`}>
          {formatDateFriendly(new Date().toISOString())}
        </p>
      </header>

      {/* Content Area */}
      <div className="space-y-6 pb-32">
        {!entry?.diaryNarrative && !isProcessing ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-60 animate-fade-in-up">
            <PenNib size={48} className="text-stone-300 mb-4" weight="duotone" />
            <p className={`text-lg font-serif ${isMaterial ? 'text-[#404944] dark:text-[#C4C7C5]' : 'text-stone-500'}`}>
              The page awaits your voice, {userName}.
            </p>
            <p className="text-stone-400 text-sm mt-2">Hold the button below to let your thoughts flow.</p>
          </div>
        ) : (
          <>
             {/* Loading State */}
             {isProcessing && (
              <div className={`flex items-center justify-center p-4 rounded-2xl shadow-sm animate-pulse ${isMaterial ? 'bg-white dark:bg-[#1E2121]' : 'bg-white dark:bg-stone-800'}`}>
                <Sparkle size={20} className="text-teal-500 mr-2 animate-spin" />
                <span className="text-sm text-stone-500">Weaving your story...</span>
              </div>
            )}

            {/* Entry Display */}
            {entry?.diaryNarrative && (
              <>
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

                {/* Narrative Card */}
                <div 
                  className={`p-6 shadow-sm border animate-fade-in-up ${isMaterial 
                    ? 'bg-white dark:bg-[#1E2121] border-transparent rounded-[24px]' 
                    : 'bg-white dark:bg-stone-800 border-stone-100 dark:border-stone-700 rounded-3xl'}`}
                >
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
              </>
            )}
          </>
        )}
      </div>

      {/* Portaled Elements */}
      {createPortal(
        <>
          {/* Overlay */}
          <div 
            className={`fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center px-6 transition-all duration-300 ${
              isListening ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`}
            style={{ pointerEvents: isListening ? 'auto' : 'none' }}
          >
            <div className="max-w-lg w-full text-center space-y-8">
               <div className="flex flex-col items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-ping absolute" />
                  <span className="w-2 h-2 bg-red-500 rounded-full relative" />
                  <p className="text-stone-400 text-xs uppercase tracking-[0.2em] mt-4 font-medium">Listening</p>
              </div>
              <p className="text-white font-serif text-2xl md:text-3xl leading-relaxed">
                {interimTranscript || `Speak from the heart, ${userName}...`}
              </p>
              <p className="text-stone-500 text-sm">Release to preserve this moment</p>
            </div>
          </div>

          {/* Record FAB */}
          <div 
            className="fixed left-0 right-0 flex justify-center z-[70] pointer-events-none transition-all duration-300 animate-fade-in-up"
            style={{ 
              bottom: isMaterial ? 'calc(7rem + env(safe-area-inset-bottom))' : 'calc(6rem + env(safe-area-inset-bottom))' // Adjust for taller Nav in M3
            }}
          >
            <div className="relative flex items-center justify-center pointer-events-auto">
                {isListening && (
                  <>
                    <div className="absolute w-16 h-16 bg-red-500 rounded-full animate-ripple opacity-50" />
                    <div className="absolute w-16 h-16 bg-red-500 rounded-full animate-ripple opacity-50" style={{ animationDelay: '1s' }} />
                  </>
                )}
                
                <button
                  onMouseDown={startListening}
                  onMouseUp={stopListening}
                  onTouchStart={startListening}
                  onTouchEnd={stopListening}
                  onContextMenu={(e) => e.preventDefault()}
                  className={`relative z-10 shadow-xl transition-all duration-300 flex items-center justify-center overflow-hidden
                    ${isListening 
                        ? 'bg-red-500 scale-110 shadow-red-500/40 w-16 h-16 rounded-full' 
                        : isMaterial
                            ? 'bg-teal-200 text-teal-900 hover:bg-teal-300 shadow-md w-[64px] h-[64px] rounded-[20px]' // Material 3 Large FAB style
                            : 'bg-teal-600 hover:bg-teal-500 active:scale-90 shadow-teal-600/30 w-16 h-16 rounded-full' // Echoism Circle
                    }
                  `}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                  aria-label="Record entry"
                >
                  <Microphone 
                    size={28} 
                    weight="fill" 
                    className={`transition-transform ${isListening ? 'scale-110 text-white' : isMaterial ? 'text-teal-900' : 'text-white'}`} 
                  />
                </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default Home;
import React from 'react';
import { useJournal } from '../context/JournalContext';
import { usePreferences } from '../context/PreferencesContext';
import { formatDateShort, isLightColor } from '../constants';
import { CloudSlash } from 'phosphor-react';
import { useNavigate } from 'react-router-dom';
import { JournalEntry } from '../types';

const Archive: React.FC = () => {
  const { entries } = useJournal();
  const { userName } = usePreferences();
  const navigate = useNavigate();

  // Sort entries newest first
  const sortedEntries = (Object.values(entries) as JournalEntry[]).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="px-6 pt-8">
      <header className="mb-8">
        <h1 className="font-serif text-4xl text-stone-800 dark:text-stone-100 mb-1">Archive</h1>
        <p className="text-stone-500 dark:text-stone-400 font-sans text-sm uppercase tracking-wide">
          Echoes of {userName}'s past journeys
        </p>
      </header>

      <div className="space-y-4 pb-4">
        {sortedEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
            <CloudSlash size={48} className="text-stone-300 mb-4" />
            <p className="text-stone-500">Your archive is silent, yet waiting, {userName}.</p>
          </div>
        ) : (
          sortedEntries.map((entry, index) => {
            const isLight = isLightColor(entry.emotion.color);
            return (
              <div 
                key={entry.id}
                onClick={() => navigate(`/archive/${entry.id}`)}
                className="bg-white dark:bg-stone-800 p-5 rounded-2xl shadow-sm border-l-[6px] border-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors cursor-pointer group"
                style={{ 
                  borderLeftColor: entry.emotion.color,
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-serif text-lg text-stone-800 dark:text-stone-100">
                      {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long' })}
                    </h3>
                    <p className="text-xs text-stone-400 uppercase font-medium">
                      {formatDateShort(entry.date)}
                    </p>
                  </div>
                  <div 
                    className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-stone-900' : 'text-white'}`}
                    style={{ backgroundColor: entry.emotion.color }}
                  >
                    {entry.emotion.label}
                  </div>
                </div>
                <p className="text-stone-600 dark:text-stone-400 text-sm line-clamp-2 font-serif opacity-90 mb-3">
                  {entry.daySummary}
                </p>
                
                {/* Categories / Tags */}
                {entry.categories && entry.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-auto pt-2 border-t border-stone-100 dark:border-stone-700/50">
                    {entry.categories.map((cat, i) => (
                      <span key={i} className="text-[10px] font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
                        #{cat}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Archive;
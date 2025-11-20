import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJournal } from '../context/JournalContext';
import { usePreferences } from '../context/PreferencesContext';
import { ArrowLeft, CalendarCheck, PlayCircle, Wind } from 'phosphor-react';
import { JournalEntry } from '../types';

const RecapList: React.FC = () => {
  const { entries } = useJournal();
  const navigate = useNavigate();
  const { visualTheme, userName } = usePreferences();
  const isMaterial = visualTheme === 'material-you';

  const months = useMemo(() => {
    const allEntries = Object.values(entries) as JournalEntry[];
    const groups: Record<string, { count: number, label: string, key: string, year: number }> = {};

    allEntries.forEach(entry => {
        const date = new Date(entry.date);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
        const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        if (!groups[key]) {
            groups[key] = { count: 0, label, key, year: date.getFullYear() };
        }
        groups[key].count++;
    });

    return Object.values(groups).sort((a, b) => b.key.localeCompare(a.key)); // Newest first
  }, [entries]);

  // Group by Year
  const years = useMemo(() => {
      const y: Record<number, typeof months> = {};
      months.forEach(m => {
          if (!y[m.year]) y[m.year] = [];
          y[m.year].push(m);
      });
      return Object.entries(y).sort((a, b) => Number(b[0]) - Number(a[0]));
  }, [months]);

  return (
    <div className="px-6 pt-8 pb-10 min-h-[60vh]">
       <header className="mb-8 flex items-center">
        <button 
          onClick={() => navigate(-1)} 
          className={`mr-4 p-2 rounded-full shadow-sm active:scale-95 transition-transform border ${isMaterial ? 'bg-[#F0F2F1] dark:bg-[#2D3131] border-transparent text-[#171C1B] dark:text-[#E1E3E3]' : 'bg-white dark:bg-stone-800 border-stone-100 dark:border-stone-700 text-stone-600 dark:text-stone-300'}`}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className={`font-serif text-2xl ${isMaterial ? 'text-[#171C1B] dark:text-[#E1E3E3]' : 'text-stone-800 dark:text-stone-100'}`}>
            Archives
          </h1>
        </div>
      </header>

      <div className="space-y-8">
          {years.map(([year, yearMonths]) => (
              <div key={year} className="animate-fade-in-up">
                  <h2 className="text-xs font-bold uppercase text-stone-400 mb-4 tracking-widest ml-1">{year}</h2>
                  <div className="grid grid-cols-1 gap-3">
                      {yearMonths.map((m) => (
                          <button
                            key={m.key}
                            onClick={() => navigate(`/recap/view/monthly/${m.key}`)}
                            className={`flex items-center justify-between p-5 rounded-2xl shadow-sm transition-all active:scale-95 group text-left
                                ${isMaterial 
                                    ? 'bg-[#F0F2F1] dark:bg-[#2D3131] hover:bg-teal-100 dark:hover:bg-teal-900/30' 
                                    : 'bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 hover:border-teal-500 dark:hover:border-teal-500'
                                }
                            `}
                          >
                             <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isMaterial ? 'bg-white dark:bg-stone-700 text-stone-600 dark:text-stone-300' : 'bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400'}`}>
                                    <CalendarCheck size={20} weight="duotone" />
                                </div>
                                <div>
                                    <h3 className={`font-serif text-lg font-medium ${isMaterial ? 'text-[#171C1B] dark:text-[#E1E3E3]' : 'text-stone-800 dark:text-stone-100'}`}>
                                        {m.label.split(' ')[0]}
                                    </h3>
                                    <p className="text-xs text-stone-500 dark:text-stone-400">{m.count} Entries</p>
                                </div>
                             </div>
                             <PlayCircle size={28} weight="fill" className="text-stone-300 group-hover:text-teal-500 transition-colors" />
                          </button>
                      ))}
                  </div>
              </div>
          ))}
          
          {months.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in-up">
                  <div className="w-20 h-20 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 dark:text-stone-500 mb-6">
                     <Wind size={40} weight="duotone" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl text-stone-800 dark:text-stone-100 mb-2">Silence prevails, {userName}</h2>
                    <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed max-w-xs mx-auto">
                        Your archive is waiting for its first chapter.
                    </p>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};

export default RecapList;
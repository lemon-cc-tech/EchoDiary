import React, { useMemo } from 'react';
import { useJournal } from '../context/JournalContext';
import { usePreferences } from '../context/PreferencesContext';
import { ChartBarHorizontal } from 'phosphor-react';
import { JournalEntry } from '../types';

const Dashboard: React.FC = () => {
  const { entries } = useJournal();
  const { userName } = usePreferences();

  const analytics = useMemo(() => {
    const allEntries = Object.values(entries) as JournalEntry[];
    if (allEntries.length === 0) return null;

    // Mood Distribution
    const moodCounts: Record<string, { count: number, color: string }> = {};
    allEntries.forEach(e => {
      const label = e.emotion.label;
      if (!moodCounts[label]) {
        moodCounts[label] = { count: 0, color: e.emotion.color };
      }
      moodCounts[label].count += 1;
    });

    const moodStats = Object.entries(moodCounts)
      .map(([label, data]) => ({
        label,
        color: data.color,
        percentage: Math.round((data.count / allEntries.length) * 100)
      }))
      .sort((a, b) => b.percentage - a.percentage);

    // Categories
    const categoryCounts: Record<string, number> = {};
    allEntries.forEach(e => {
      if (e.categories) {
        e.categories.forEach(cat => {
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });
      }
    });

    const topCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8); // Top 8

    return { moodStats, topCategories };
  }, [entries]);

  return (
    <div className="px-6 pt-8 pb-8">
      <header className="mb-8">
        <h1 className="font-serif text-4xl text-stone-800 dark:text-stone-100 mb-1">Insights</h1>
        <p className="text-stone-500 dark:text-stone-400 font-sans text-sm uppercase tracking-wide">
          The patterns of {userName}'s inner world
        </p>
      </header>

      {!analytics ? (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
          <ChartBarHorizontal size={48} className="text-stone-300 mb-4" />
          <p className="text-stone-500">Reflect more to uncover the hidden patterns.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Mood Distribution */}
          <div className="bg-white dark:bg-stone-800 p-6 rounded-3xl shadow-sm">
            <h3 className="text-xs font-bold uppercase text-stone-400 mb-6 tracking-widest">Emotional Spectrum</h3>
            <div className="space-y-4">
              {analytics.moodStats.map((mood) => (
                <div key={mood.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-stone-700 dark:text-stone-300">{mood.label}</span>
                    <span className="text-stone-400">{mood.percentage}%</span>
                  </div>
                  <div className="h-3 w-full bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${mood.percentage}%`, backgroundColor: mood.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Common Themes */}
          <div className="bg-white dark:bg-stone-800 p-6 rounded-3xl shadow-sm">
            <h3 className="text-xs font-bold uppercase text-stone-400 mb-6 tracking-widest">Recurring Threads</h3>
            <div className="flex flex-wrap gap-2">
              {analytics.topCategories.map(([cat, count]) => (
                <div 
                  key={cat}
                  className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-700/50 text-stone-600 dark:text-stone-300 text-sm font-medium flex items-center"
                >
                  {cat}
                  <span className="ml-2 text-xs bg-white dark:bg-stone-600 px-1.5 py-0.5 rounded-md text-stone-400 dark:text-stone-200">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
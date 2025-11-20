import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PaintBrush, CirclesFour } from 'phosphor-react';
import { usePreferences } from '../context/PreferencesContext';
import { VisualTheme } from '../types';

const ThemeSettings: React.FC = () => {
  const navigate = useNavigate();
  const { visualTheme, setVisualTheme } = usePreferences();

  const themes: { id: VisualTheme; name: string; desc: string; icon: any }[] = [
    {
      id: 'echoism',
      name: 'Echoism',
      desc: 'The original serene experience. Matte surfaces, soft stones, and clarity.',
      icon: PaintBrush
    },
    {
      id: 'material-you',
      name: 'Material You 3',
      desc: 'Google’s modern design language. Dynamic shapes, spirited colors, and high contrast.',
      icon: CirclesFour
    }
  ];

  return (
    <div className="px-6 pt-8 pb-10">
      <header className="mb-8 flex items-center">
        <button 
          onClick={() => navigate(-1)} 
          className="mr-4 p-2 bg-white dark:bg-stone-800 rounded-full shadow-sm text-stone-600 dark:text-stone-300 active:scale-95 transition-transform border border-stone-100 dark:border-stone-700"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-serif text-2xl text-stone-800 dark:text-stone-100">Theme</h1>
        </div>
      </header>

      <div className="space-y-4">
        {themes.map((theme, index) => {
          const Icon = theme.icon;
          const isSelected = visualTheme === theme.id;
          
          return (
            <button
              key={theme.id}
              onClick={() => setVisualTheme(theme.id)}
              className={`w-full text-left relative overflow-hidden rounded-3xl p-6 transition-all duration-300 border-2 group
                ${isSelected 
                  ? 'border-teal-500 bg-white dark:bg-stone-800/90 shadow-md ring-2 ring-teal-500/20' 
                  : 'border-transparent bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700/50'
                }
              `}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4 relative z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-300
                  ${isSelected 
                    ? 'bg-teal-500 text-white shadow-md' 
                    : 'bg-stone-100 text-stone-500 dark:bg-stone-700 dark:text-stone-400 group-hover:bg-stone-200 dark:group-hover:bg-stone-600'
                  }
                `}>
                  <Icon size={24} weight={isSelected ? 'fill' : 'duotone'} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-serif text-lg ${isSelected ? 'text-teal-700 dark:text-teal-300 font-medium' : 'text-stone-800 dark:text-stone-100'}`}>
                      {theme.name}
                    </h3>
                    {isSelected && (
                      <span className="w-3 h-3 rounded-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
                    )}
                  </div>
                  <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                    {theme.desc}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeSettings;
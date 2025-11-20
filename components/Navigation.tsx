import React from 'react';
import { NavLink } from 'react-router-dom';
import { House, Archive, ChartPieSlice, User } from 'phosphor-react';
import { usePreferences } from '../context/PreferencesContext';

const Navigation: React.FC = () => {
  const { visualTheme } = usePreferences();
  const isMaterial = visualTheme === 'material-you';

  // -- Styles --
  
  // Container
  // Updated Echoism Dark Mode: lighter background (stone-800) and visible border (stone-700) for separation
  const echoismContainer = "fixed bottom-0 left-0 right-0 z-50 pb-safe bg-white/90 dark:bg-stone-800/90 backdrop-blur-lg border-t border-stone-200 dark:border-stone-700 rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.04)] transition-all duration-500";
  const materialContainer = "fixed bottom-0 left-0 right-0 z-50 pb-safe bg-[#F0F2F1] dark:bg-[#1E2121] transition-all duration-500"; // M3 Surface Container

  // Link
  const getEchoismLinkClass = (isActive: boolean) => `flex flex-col items-center justify-center w-full h-full py-3 transition-colors duration-300 ${
    isActive 
      ? 'text-teal-600 dark:text-teal-400' 
      : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300'
  }`;

  const getMaterialLinkClass = (isActive: boolean) => `flex flex-col items-center justify-center w-full h-full py-2 transition-all duration-300 gap-1 ${
    isActive 
      ? 'text-[#042120] dark:text-[#E0E3E2] font-bold' // On Surface Variant
      : 'text-[#404944] dark:text-[#C4C7C5] font-medium' // On Surface Variant
  }`;

  const iconSize = 26;

  return (
    <nav className={isMaterial ? materialContainer : echoismContainer}>
      <div className={`max-w-2xl mx-auto flex justify-around items-center px-2 w-full ${isMaterial ? 'h-20' : 'h-16'}`}>
        {[
          { path: '/', icon: House, label: 'Today', end: true },
          { path: '/archive', icon: Archive, label: 'Echoes' },
          { path: '/dashboard', icon: ChartPieSlice, label: 'Patterns' },
          { path: '/profile', icon: User, label: 'Haven' },
        ].map((item) => (
          <NavLink 
            key={item.path}
            to={item.path} 
            end={item.end}
            className={({ isActive }) => isMaterial ? getMaterialLinkClass(isActive) : getEchoismLinkClass(isActive)}
          >
            {({ isActive }) => (
              <>
                {isMaterial ? (
                  // Material You Pill Indicator
                  <div className={`px-5 py-1 rounded-full transition-all duration-300 ${
                    isActive 
                      ? 'bg-teal-200 dark:bg-teal-700' // Secondary Container
                      : 'bg-transparent'
                  }`}>
                    <item.icon size={24} weight={isActive ? "fill" : "regular"} />
                  </div>
                ) : (
                  // Echoism Icon
                  <item.icon size={iconSize} weight={isActive ? "fill" : "duotone"} />
                )}
                
                <span className={`text-[10px] md:text-xs ${isMaterial ? 'tracking-wide' : 'mt-0.5'}`}>
                   {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
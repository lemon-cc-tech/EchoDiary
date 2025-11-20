import React from 'react';
import Navigation from './Navigation';
import { Outlet, useLocation } from 'react-router-dom';
import { usePreferences } from '../context/PreferencesContext';

const Layout: React.FC = () => {
  const { visualTheme } = usePreferences();
  const isMaterial = visualTheme === 'material-you';
  const location = useLocation();

  // Conditional classes based on theme
  const bgClasses = isMaterial 
    ? "bg-[#F4F7F6] dark:bg-[#191C1C] text-[#171C1B] dark:text-[#E1E3E3]" 
    : "bg-stone-50 dark:bg-stone-900 text-stone-800 dark:text-stone-100";

  return (
    <div className={`min-h-[100dvh] transition-colors duration-300 flex flex-col ${bgClasses}`}>
      <main className="flex-1 max-w-2xl w-full mx-auto pb-32 relative pt-safe">
        <div key={location.pathname} className="animate-morph-in w-full h-full">
          <Outlet />
        </div>
      </main>
      <Navigation />
    </div>
  );
};

export default Layout;

import React, { useMemo, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { usePreferences } from '../context/PreferencesContext';
import { useJournal } from '../context/JournalContext';
import { CaretRight, Moon, Sun, Gear, PencilSimple, Sparkle, BookBookmark, Fire, Calendar, RewindCircle, Infinity, ArrowRight } from 'phosphor-react';
import { JournalEntry } from '../types';

// --- Helper Components ---

const StatCard: React.FC<{ label: string; value: string | number; icon: any; colorClass: string }> = ({ label, value, icon: Icon, colorClass }) => (
  <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-stone-800 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-700/50">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${colorClass} bg-opacity-10`}>
      <Icon size={16} weight="fill" className={colorClass.replace('bg-', 'text-')} />
    </div>
    <span className="font-serif text-xl font-bold text-stone-800 dark:text-stone-100">{value}</span>
    <span className="text-[10px] uppercase tracking-wider text-stone-400 font-medium">{label}</span>
  </div>
);

// Horizontal Tile Style for Resonance
const ResonanceTile: React.FC<{ title: string; subtitle: string; icon: any; onClick: () => void; isMaterial: boolean; color: string }> = ({ title, subtitle, icon: Icon, onClick, isMaterial, color }) => (
    <button 
      onClick={onClick}
      className={`w-[calc(50%-0.5rem)] md:w-48 flex-shrink-0 h-40 md:h-44 p-4 md:p-5 flex flex-col justify-between rounded-3xl shadow-sm transition-all duration-300 active:scale-95 text-left snap-start
        ${isMaterial 
            ? 'bg-[#F0F2F1] dark:bg-[#2D3131] hover:bg-white dark:hover:bg-[#363a3a]' 
            : 'bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700/50 hover:border-teal-200 dark:hover:border-teal-800'
        }
      `}
    >
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color} bg-opacity-20`}>
            <Icon size={20} weight="fill" className={color.replace('bg-', 'text-')} />
        </div>
        <div>
            <h3 className={`font-serif text-lg font-medium leading-tight mb-1 truncate ${isMaterial ? 'text-[#171C1B] dark:text-[#E1E3E3]' : 'text-stone-800 dark:text-stone-100'}`}>
                {title}
            </h3>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wide truncate">{subtitle}</p>
        </div>
    </button>
);

const Profile: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { userName, setUserName, visualTheme } = usePreferences();
  const { entries } = useJournal();
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const navigate = useNavigate();
  const resonanceRef = useRef<HTMLDivElement>(null);

  const isMaterial = visualTheme === 'material-you';

  // --- Stats Logic ---
  const stats = useMemo(() => {
    const allEntries = Object.values(entries) as JournalEntry[];
    const totalEntries = allEntries.length;

    // Calculate Streak
    // Sort dates descending
    const dates = allEntries.map(e => e.id).sort().reverse();
    let streak = 0;
    if (dates.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      // Check if streak is active (has entry today or yesterday)
      const lastEntry = dates[0];
      if (lastEntry === today || lastEntry === yesterday) {
        streak = 1;
        let currentDate = new Date(lastEntry);
        
        for (let i = 1; i < dates.length; i++) {
          const prevDate = new Date(dates[i]);
          const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
          
          if (diffDays === 1) {
            streak++;
            currentDate = prevDate;
          } else {
            break;
          }
        }
      }
    }

    return { totalEntries, streak };
  }, [entries]);

  const handleNameSave = () => {
    if (tempName.trim()) {
      setUserName(tempName.trim());
    }
    setIsEditing(false);
  };

  // Get start of current week (Sunday)
  const getThisWeekKey = () => {
      const d = new Date();
      const day = d.getDay();
      const diff = d.getDate() - day; // adjust when day is sunday
      const startOfWeek = new Date(d.setDate(diff));
      return startOfWeek.toISOString().split('T')[0]; // returns YYYY-MM-DD of Sunday
  };
  
  const getCurrentYear = () => new Date().getFullYear().toString();

  const scrollResonanceRight = () => {
    if (resonanceRef.current) {
      const scrollAmount = resonanceRef.current.offsetWidth / 2;
      resonanceRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="px-6 pt-8 pb-20">
      
      {/* Identity Section */}
      <div className="flex flex-col items-center mb-8">
        {/* Doodle Avatar */}
        <div className="relative w-32 h-32 mb-6 group">
          <div className={`absolute inset-0 rounded-full blur-xl opacity-50 animate-pulse-slow ${isMaterial ? 'bg-teal-300 dark:bg-teal-800' : 'bg-stone-200 dark:bg-stone-700'}`}></div>
          <div className={`relative w-full h-full rounded-full overflow-hidden border-4 shadow-inner flex items-center justify-center
            ${isMaterial 
              ? 'bg-[#F0F2F1] dark:bg-[#2D3131] border-white dark:border-stone-600' 
              : 'bg-stone-100 dark:bg-stone-800 border-white dark:border-stone-700'
            }`}>
              {/* Doodle Composition */}
              <div className="relative w-full h-full">
                 {/* Abstract Head Shape */}
                 <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-24 bg-stone-300 dark:bg-stone-600 rounded-t-[40px] opacity-30"></div>
                 {/* The "Mind" Sparkle */}
                 <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
                    <Sparkle size={48} weight="duotone" className={`animate-pulse-slow ${isMaterial ? 'text-teal-500' : 'text-stone-500 dark:text-stone-300'}`} />
                 </div>
                 {/* Orbiting Elements */}
                 <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-orange-300 dark:bg-orange-400 opacity-60 animate-[spin_4s_linear_infinite]" />
                 <div className="absolute bottom-8 left-6 w-2 h-2 rounded-full bg-teal-400 opacity-60 animate-[pulse_3s_ease-in-out_infinite]" />
              </div>
          </div>
          <button className="absolute bottom-1 right-1 p-2 bg-teal-500 text-white rounded-full shadow-md hover:bg-teal-600 transition-colors active:scale-95">
            <PencilSimple size={16} weight="bold" />
          </button>
        </div>

        {/* Name Edit */}
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input 
              autoFocus
              type="text" 
              value={tempName} 
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
              className="text-center font-serif text-2xl bg-transparent border-b-2 border-teal-500 outline-none text-stone-800 dark:text-stone-100 w-48 pb-1"
            />
            <button onClick={handleNameSave} className="text-teal-600 font-bold text-sm">Save</button>
          </div>
        ) : (
          <div className="text-center group cursor-pointer" onClick={() => { setTempName(userName); setIsEditing(true); }}>
            <h2 className="font-serif text-3xl text-stone-800 dark:text-stone-100 flex items-center justify-center gap-2">
              {userName}
            </h2>
            <p className="text-sm text-stone-400 uppercase tracking-widest mt-1 group-hover:text-teal-500 transition-colors">The Journalist</p>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard 
          label="Total Entries" 
          value={stats.totalEntries} 
          icon={BookBookmark} 
          colorClass="bg-indigo-500"
        />
        <StatCard 
          label="Day Streak" 
          value={stats.streak} 
          icon={Fire} 
          colorClass="bg-orange-500"
        />
      </div>

      {/* Resonance (Recap) Section - Horizontal */}
      <div className="mb-8">
         <div className="flex items-center justify-between px-1 mb-3">
            <h2 className="text-xs font-bold uppercase text-stone-500 tracking-widest">Resonance</h2>
            <button 
              onClick={scrollResonanceRight}
              className="text-stone-400 hover:text-teal-500 transition-colors p-1 active:scale-95"
              aria-label="Scroll Right"
            >
              <ArrowRight size={16} weight="bold" />
            </button>
         </div>
         {/* Standard scroll container aligned with page padding */}
         <div 
            ref={resonanceRef}
            className="flex gap-4 overflow-x-auto pb-4 snap-x scrollbar-hide scroll-smooth"
         >
            <ResonanceTile 
                title="Weekly Pulse" 
                subtitle="Last 7 Days" 
                icon={RewindCircle}
                color="bg-violet-500"
                isMaterial={isMaterial}
                onClick={() => navigate(`/recap/view/weekly/${getThisWeekKey()}`)}
            />
            <ResonanceTile 
                title="Monthly Archives" 
                subtitle="Past Journals" 
                icon={Calendar}
                color="bg-pink-500"
                isMaterial={isMaterial}
                onClick={() => navigate('/recap/list')}
            />
             <ResonanceTile 
                title="Yearly Review" 
                subtitle={getCurrentYear()} 
                icon={Infinity}
                color="bg-amber-500"
                isMaterial={isMaterial}
                onClick={() => navigate(`/recap/view/yearly/${getCurrentYear()}`)}
            />
         </div>
      </div>

      {/* Settings Menu */}
      <div className={`rounded-3xl overflow-hidden shadow-sm ${isMaterial ? 'bg-[#F0F2F1] dark:bg-[#2D3131]' : 'bg-white dark:bg-stone-800'}`}>
        
        {/* Dark Mode Toggle */}
        <div className="p-4 flex items-center justify-between border-b border-stone-100 dark:border-stone-700/50">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-300">
                 {isDark ? <Moon size={20} weight="fill" /> : <Sun size={20} weight="fill" />}
              </div>
              <span className="font-medium text-stone-700 dark:text-stone-200">Dark Mode</span>
           </div>
           <button 
            onClick={toggleTheme}
            className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${isDark ? 'bg-teal-600' : 'bg-stone-300'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${isDark ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Settings Link */}
        <Link to="/settings" className="p-4 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-white/5 transition-colors">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-700 flex items-center justify-center text-stone-500 dark:text-stone-300">
                 <Gear size={20} weight="duotone" />
              </div>
              <span className="font-medium text-stone-700 dark:text-stone-200">Settings</span>
           </div>
           <CaretRight size={18} className="text-stone-400" />
        </Link>

      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-stone-300 dark:text-stone-600 font-mono">EchoDiary v1.4</p>
      </div>

    </div>
  );
};

export default Profile;

import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePreferences } from '../context/PreferencesContext';
import { useJournal } from '../context/JournalContext';
import { DiaryLanguage, DiaryStyle } from '../types';
import { ArrowLeft, CheckCircle, DownloadSimple, UploadSimple, Brain, Database, CaretDown, Globe, Palette, CaretRight, Key, Eye, EyeSlash } from 'phosphor-react';

// --- Helper Components Defined Outside to Prevent Re-renders ---

interface StyleOptionProps {
  value: DiaryStyle;
  label: string;
  desc: string;
  currentValue: DiaryStyle;
  onSelect: (val: DiaryStyle) => void;
}

const StyleOption: React.FC<StyleOptionProps> = ({ value, label, desc, currentValue, onSelect }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onSelect(value);
    }}
    className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 flex justify-between items-center mb-2 ${
      currentValue === value 
        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' 
        : 'border-stone-100 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:border-teal-200 dark:hover:border-stone-600'
    }`}
  >
    <div>
      <h4 className={`font-medium text-sm transition-colors ${currentValue === value ? 'text-teal-700 dark:text-teal-300' : 'text-stone-700 dark:text-stone-300'}`}>
        {label}
      </h4>
      <p className="text-[10px] text-stone-400 mt-0.5">{desc}</p>
    </div>
    {currentValue === value && (
      <div className="animate-[scaleIn_0.2s_ease-out_forwards]">
        <CheckCircle size={20} weight="fill" className="text-teal-500" />
      </div>
    )}
  </button>
);

interface LangOptionProps {
  value: DiaryLanguage;
  label: string;
  currentValue: DiaryLanguage;
  onSelect: (val: DiaryLanguage) => void;
}

const LangOption: React.FC<LangOptionProps> = ({ value, label, currentValue, onSelect }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onSelect(value);
    }}
    className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 flex justify-between items-center mb-2 ${
      currentValue === value 
        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' 
        : 'border-stone-100 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:border-teal-200 dark:hover:border-stone-600'
    }`}
  >
    <span className={`font-medium text-sm transition-colors ${currentValue === value ? 'text-teal-700 dark:text-teal-300' : 'text-stone-700 dark:text-stone-300'}`}>
      {label}
    </span>
    {currentValue === value && (
      <div className="animate-[scaleIn_0.2s_ease-out_forwards]">
        <CheckCircle size={20} weight="fill" className="text-teal-500" />
      </div>
    )}
  </button>
);

interface AccordionItemProps {
  id: string;
  title: string;
  icon: any;
  currentValue: string;
  children?: React.ReactNode;
  delay: string;
  isOpen: boolean;
  onToggle: (id: string) => void;
  isLoaded: boolean;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ 
  id, 
  title, 
  icon: Icon, 
  currentValue, 
  children,
  delay,
  isOpen,
  onToggle,
  isLoaded
}) => {
  return (
    <div 
      className={`bg-white dark:bg-stone-800 rounded-3xl shadow-sm overflow-hidden transition-all duration-500 opacity-0 ${isLoaded ? 'animate-fade-in-up' : ''}`}
      style={{ animationDelay: delay }}
    >
      <button 
        onClick={() => onToggle(id)}
        className="w-full p-5 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-700/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${isOpen ? 'bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400' : 'bg-stone-100 text-stone-500 dark:bg-stone-700/50 dark:text-stone-400'}`}>
            <Icon size={20} weight="duotone" />
          </div>
          <div className="text-left">
            <p className="text-stone-800 dark:text-stone-200 font-medium text-sm">{title}</p>
            <p className="text-[10px] text-stone-400 uppercase tracking-wider mt-0.5">{currentValue}</p>
          </div>
        </div>
        <CaretDown 
          size={18} 
          className={`text-stone-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="p-5 pt-0 border-t border-stone-100 dark:border-stone-700/50 mt-2">
          <div className="pt-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { diaryStyle, diaryLanguage, setDiaryStyle, setDiaryLanguage, apiKey, setApiKey } = usePreferences();
  const { replaceAllEntries } = useJournal();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  // Trigger animations on mount
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleToggle = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  // --- Data Management Logic ---

  const handleExport = () => {
    const data = {
      entries: JSON.parse(localStorage.getItem('echo_journal_entries') || '{}'),
      preferences: JSON.parse(localStorage.getItem('echo_preferences') || '{}'),
      theme: localStorage.getItem('echo_theme') || 'light',
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `echodiary-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportStatus('loading');
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const data = JSON.parse(result);

        // Basic validation
        if (!data.entries || !data.preferences) {
          throw new Error("Invalid backup file format");
        }

        if (window.confirm("This will overwrite your current journal entries and settings. Are you sure?")) {
            // Preferences are safe to direct write (no auto-save timer)
            localStorage.setItem('echo_preferences', JSON.stringify(data.preferences));
            if (data.theme) localStorage.setItem('echo_theme', data.theme);
            
            // Journal Entries: Use context method to safely replace state and prevent auto-save overwrites
            replaceAllEntries(data.entries);

            setImportStatus('success');
            // Reload to apply changes to all contexts cleanly
            setTimeout(() => window.location.reload(), 1000);
        } else {
            setImportStatus('idle');
        }

      } catch (error) {
        console.error("Import failed", error);
        setImportStatus('error');
        setTimeout(() => setImportStatus('idle'), 3000);
      } finally {
        // Reset input value to allow re-import of same file
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
      }
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="px-6 pt-8 pb-10">
      <header className="mb-8 flex items-center animate-fade-in-up opacity-0" style={{ animationFillMode: 'forwards' }}>
        <button onClick={() => navigate(-1)} className="mr-4 p-2 bg-white dark:bg-stone-800 rounded-full shadow-sm text-stone-600 dark:text-stone-300 active:scale-95 transition-transform">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-serif text-2xl text-stone-800 dark:text-stone-100">Settings</h1>
        </div>
      </header>

      <div className="space-y-6">
        
        {/* Appearance Group */}
        <div className="space-y-4">
           <div className="flex items-center gap-2 px-1 animate-fade-in-up opacity-0" style={{ animationDelay: '50ms', animationFillMode: 'forwards' }}>
            <h2 className="text-xs font-bold uppercase text-stone-500 tracking-widest">Appearance</h2>
          </div>

          {/* Theme Link */}
          <Link 
            to="/settings/theme" 
            className={`flex items-center justify-between p-5 bg-white dark:bg-stone-800 rounded-3xl shadow-sm hover:bg-stone-50 dark:hover:bg-stone-700/30 transition-all duration-500 opacity-0 ${isLoaded ? 'animate-fade-in-up' : ''}`}
            style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-500 dark:bg-stone-700/50 dark:text-stone-400 flex items-center justify-center">
                <Palette size={20} weight="duotone" />
              </div>
              <div className="text-left">
                <p className="text-stone-800 dark:text-stone-200 font-medium text-sm">Visual Theme</p>
                <p className="text-[10px] text-stone-400 uppercase tracking-wider mt-0.5">Select your aesthetic</p>
              </div>
            </div>
            <CaretRight size={18} className="text-stone-400" />
          </Link>
        </div>

        {/* Journaling Intelligence Group */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 px-1 animate-fade-in-up opacity-0" style={{ animationDelay: '150ms', animationFillMode: 'forwards' }}>
            <h2 className="text-xs font-bold uppercase text-stone-500 tracking-widest">Journaling Intelligence</h2>
          </div>

          {/* Narrative Voice Accordion */}
          <AccordionItem 
            id="voice"
            title="Narrative Voice"
            icon={Brain}
            currentValue={diaryStyle}
            delay="200ms"
            isOpen={expandedSection === "voice"}
            onToggle={handleToggle}
            isLoaded={isLoaded}
          >
             <StyleOption value={DiaryStyle.MINIMAL_POETIC} label="Minimal Poetic" desc="Brief, lyrical, and emotionally resonant." currentValue={diaryStyle} onSelect={setDiaryStyle} />
             <StyleOption value={DiaryStyle.SIMPLE} label="Simple & Direct" desc="Clear, honest, and unadorned." currentValue={diaryStyle} onSelect={setDiaryStyle} />
             <StyleOption value={DiaryStyle.DETAILED} label="Detailed & Analytical" desc="Deep, thoughtful, and exploratory." currentValue={diaryStyle} onSelect={setDiaryStyle} />
             <StyleOption value={DiaryStyle.GRATITUDE} label="Gratitude Focused" desc="Bright, thankful, and appreciative." currentValue={diaryStyle} onSelect={setDiaryStyle} />
          </AccordionItem>

          {/* Spoken Tongue Accordion */}
          <AccordionItem 
            id="language"
            title="Spoken Tongue"
            icon={Globe}
            currentValue={diaryLanguage}
            delay="250ms"
            isOpen={expandedSection === "language"}
            onToggle={handleToggle}
            isLoaded={isLoaded}
          >
             <LangOption value={DiaryLanguage.ENGLISH} label="English" currentValue={diaryLanguage} onSelect={setDiaryLanguage} />
             <LangOption value={DiaryLanguage.SPANISH} label="Spanish" currentValue={diaryLanguage} onSelect={setDiaryLanguage} />
             <LangOption value={DiaryLanguage.FRENCH} label="French" currentValue={diaryLanguage} onSelect={setDiaryLanguage} />
             <LangOption value={DiaryLanguage.HINDI} label="Hindi" currentValue={diaryLanguage} onSelect={setDiaryLanguage} />
             <LangOption value={DiaryLanguage.MATCH_INPUT} label="Match Input Language" currentValue={diaryLanguage} onSelect={setDiaryLanguage} />
          </AccordionItem>

          {/* API Configuration Accordion */}
           <AccordionItem 
            id="api"
            title="Brain Power"
            icon={Key}
            currentValue={apiKey ? 'Custom Key Set' : 'Default System Key'}
            delay="275ms"
            isOpen={expandedSection === "api"}
            onToggle={handleToggle}
            isLoaded={isLoaded}
          >
            <div className="p-1">
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-3 leading-relaxed">
                  Provide your own Google Gemini API key to power EchoDiary. Leave empty to use the default system key.
                </p>
                <div className="relative">
                  <input 
                    type={showKey ? "text" : "password"}
                    value={apiKey || ''}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter Gemini API Key"
                    className="w-full p-4 pr-12 rounded-2xl bg-stone-50 dark:bg-stone-700/50 border-2 border-stone-100 dark:border-stone-700 text-stone-700 dark:text-stone-200 focus:border-teal-500 outline-none transition-colors text-sm font-mono"
                  />
                  <button 
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
                  >
                    {showKey ? <EyeSlash size={20} /> : <Eye size={20} />}
                  </button>
                </div>
            </div>
          </AccordionItem>

        </div>

        {/* Data Sanctuary Group */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 px-1 animate-fade-in-up opacity-0" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
            <h2 className="text-xs font-bold uppercase text-stone-500 tracking-widest">Data Sanctuary</h2>
          </div>
          
          <div 
            className="grid grid-cols-2 gap-4 animate-fade-in-up opacity-0" 
            style={{ animationDelay: '350ms', animationFillMode: 'forwards' }}
          >
            {/* Export Button */}
            <button 
              onClick={handleExport}
              className="flex flex-col items-center justify-center p-6 bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 rounded-3xl shadow-sm active:scale-95 transition-all hover:bg-stone-50 dark:hover:bg-stone-700"
            >
              <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-3">
                <DownloadSimple size={20} weight="bold" />
              </div>
              <span className="text-sm font-medium text-stone-700 dark:text-stone-200">Export Data</span>
            </button>

            {/* Import Button */}
            <button 
              onClick={handleImportClick}
              disabled={importStatus === 'loading'}
              className="flex flex-col items-center justify-center p-6 bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 rounded-3xl shadow-sm active:scale-95 transition-all hover:bg-stone-50 dark:hover:bg-stone-700"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".json" 
                className="hidden" 
              />
              
              {importStatus === 'loading' ? (
                 <div className="w-10 h-10 rounded-full border-2 border-teal-500 border-t-transparent animate-spin mb-3" />
              ) : (
                 <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-400 mb-3">
                    <UploadSimple size={20} weight="bold" />
                 </div>
              )}
              
              <span className="text-sm font-medium text-stone-700 dark:text-stone-200">
                {importStatus === 'success' ? 'Imported!' : 'Import Data'}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Archive from './pages/Archive';
import EntryDetail from './pages/EntryDetail';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ThemeSettings from './pages/ThemeSettings';
import RecapList from './pages/RecapList';
import RecapStory from './pages/RecapStory';
import { ThemeProvider } from './context/ThemeContext';
import { PreferencesProvider } from './context/PreferencesContext';
import { JournalProvider } from './context/JournalContext';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <PreferencesProvider>
        <JournalProvider>
          <HashRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="archive" element={<Archive />} />
                <Route path="archive/:id" element={<EntryDetail />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
                <Route path="settings/theme" element={<ThemeSettings />} />
                <Route path="recap/list" element={<RecapList />} />
              </Route>
              {/* Full screen route outside of Layout for immersive experience */}
              <Route path="/recap/view/:period/:id" element={<RecapStory />} />
            </Routes>
          </HashRouter>
        </JournalProvider>
      </PreferencesProvider>
    </ThemeProvider>
  );
};

export default App;
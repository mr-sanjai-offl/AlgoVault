import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useSync } from './hooks/useSync';
import { useTheme } from './hooks/useTheme';
import { DashboardPage } from './pages/DashboardPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';

type Page = 'dashboard' | 'history' | 'settings';

export function App() {
  const { isAuthenticated, isLoading, avatarUrl } = useAuth();
  const { isSyncing, triggerManualSync } = useSync();
  const { theme, toggleTheme } = useTheme();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-on-background">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="w-full h-full bg-background overflow-y-auto no-scrollbar">
        <LoginPage />
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-surface-container-lowest flex flex-col relative mx-auto overflow-hidden text-on-background transition-colors duration-300">
      {/* TopAppBar */}
      <header className="flex justify-between items-center w-full px-container-padding h-14 flex-shrink-0 sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-outline-variant/10">
        <div className="flex items-center gap-2">
          <img src="/icons/icon-32.png" className="w-5 h-5" alt="AlgoVault Logo" />
          <div className="text-headline-main font-headline-main font-bold text-primary">AlgoVault</div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="text-on-surface-variant hover:text-primary transition-colors duration-200"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          <button 
            onClick={triggerManualSync}
            disabled={isSyncing}
            className={`text-on-surface-variant hover:text-primary transition-colors duration-200 ${isSyncing ? 'animate-spin opacity-50' : ''}`}
            title="Sync Now"
          >
            <span className="material-symbols-outlined text-[20px]">sync</span>
          </button>
          <button 
            onClick={() => setCurrentPage('settings')}
            className="w-8 h-8 rounded-full border-2 border-primary/30 ring-2 ring-primary/10 overflow-hidden hover:scale-105 transition-all flex items-center justify-center bg-surface-container"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Account" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-primary text-[18px]">person</span>
            )}
          </button>
        </div>
      </header>

      {/* Navigation Tabs (Derived from TopAppBar logic) */}
      <nav className="flex w-full px-container-padding bg-background border-b border-outline-variant/10 flex-shrink-0">
        <div className="flex gap-6 w-full h-10 items-center">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'history', label: 'History' },
            { id: 'settings', label: 'Settings' },
          ].map((tab) => {
            const isActive = currentPage === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentPage(tab.id as Page)}
                className={`h-full flex items-center transition-all duration-200 text-body-md ${
                  isActive 
                    ? 'text-primary font-bold border-b-2 border-primary' 
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content Area - This must scroll */}
      <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth px-container-padding py-stack-space">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 pb-10">
          {currentPage === 'dashboard' && <DashboardPage onNavigate={setCurrentPage} />}
          {currentPage === 'history' && <HistoryPage />}
          {currentPage === 'settings' && <SettingsPage />}
        </div>
      </main>

      {/* Visual Polish: Background Gradients */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/5 blur-[120px] rounded-full"></div>
      </div>
    </div>
  );
}

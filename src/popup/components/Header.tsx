import React from 'react';

type Page = 'dashboard' | 'history' | 'settings';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  username?: string;
  avatarUrl?: string;
}

export function Header({ currentPage, onNavigate, username, avatarUrl }: HeaderProps) {
  const tabs: { id: Page; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Overview', icon: 'grid_view' },
    { id: 'history', label: 'History', icon: 'history' },
    { id: 'settings', label: 'Config', icon: 'tune' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-white/5 pt-4">
      <div className="flex flex-col gap-4">
        {/* Top Brand Bar */}
        <div className="flex justify-between items-center px-container-padding">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-background text-2xl font-bold">terminal</span>
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-on-surface uppercase">AlgoVault</h1>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                <span className="text-[9px] font-bold text-muted uppercase">Connected</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => onNavigate('settings')}
            className="w-10 h-10 rounded-2xl bg-surface border border-white/5 flex items-center justify-center hover:bg-surface-container transition-colors"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={username} className="w-full h-full rounded-2xl object-cover" />
            ) : (
              <span className="material-symbols-outlined text-muted text-xl">person</span>
            )}
          </button>
        </div>

        {/* Tab Navigation */}
        <nav className="flex px-container-padding gap-6 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = currentPage === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className={`relative pb-3 flex items-center gap-2 transition-all ${
                  isActive ? 'text-on-surface' : 'text-muted hover:text-on-surface'
                }`}
              >
                <span className={`material-symbols-outlined text-lg ${isActive ? 'text-primary' : ''}`} style={{ fontVariationSettings: isActive ? "'FILL' 1" : "" }}>
                  {tab.icon}
                </span>
                <span className={`text-xs font-bold uppercase tracking-widest ${isActive ? '' : 'opacity-60'}`}>
                  {tab.label}
                </span>
                
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full shadow-glow-primary"></div>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

import React from 'react';
import { useStats } from '../hooks/useStats';
import { useSync } from '../hooks/useSync';
import { useSettings } from '../hooks/useSettings';

interface DashboardPageProps {
  onNavigate: (page: 'dashboard' | 'history' | 'settings') => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { stats, isLoading } = useStats();
  const { isSyncing, triggerManualSync } = useSync();
  const { config, updateConfig } = useSettings();

  if (isLoading || !stats || !config) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const toggleLiveSync = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateConfig({ autoSync: !config.autoSync });
  };

  return (
    <div className="space-y-element-gap">
      {/* Welcome Header */}
      <div className="flex items-end justify-between mb-2">
        <div>
          <h1 className="font-display-sm text-display-sm text-on-surface">Overview</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Your developer workflow status</p>
        </div>
        <button 
          onClick={toggleLiveSync}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all active:scale-95 ${
            config.autoSync 
              ? 'bg-secondary/10 border-secondary/20 text-secondary' 
              : 'bg-surface-container-high border-outline-variant/10 text-on-surface-variant grayscale opacity-70'
          }`}
          title={config.autoSync ? "Live Sync is ON (Click to disable)" : "Live Sync is OFF (Click to enable)"}
        >
          <div className={`w-2 h-2 rounded-full ${config.autoSync ? 'bg-secondary pulse-emerald' : 'bg-on-surface-variant'}`}></div>
          <span className="font-label-caps text-label-caps uppercase tracking-widest font-bold">
            {config.autoSync ? 'Live Sync' : 'Paused'}
          </span>
        </button>
      </div>

      {/* Stats Grid (Bento Style) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-card-padding rounded-xl flex flex-col justify-between col-span-2 min-h-[100px]">
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Total Solved</span>
          <div className="flex items-baseline gap-2">
            <span className="font-display-sm text-[36px] leading-none text-primary">{stats.total}</span>
            <span className="font-code-sm text-code-sm text-secondary">
              {stats.lastSolved ? '+1 today' : 'Get started!'}
            </span>
          </div>
        </div>
        
        <div className="glass-card p-4 rounded-xl space-y-1 border-l-4 border-l-secondary-fixed-dim">
          <span className="font-label-caps text-label-caps text-secondary-fixed-dim">EASY</span>
          <div className="font-headline-main text-headline-main text-on-surface">{stats.easy}</div>
        </div>
        
        <div className="glass-card p-4 rounded-xl space-y-1 border-l-4 border-l-tertiary">
          <span className="font-label-caps text-label-caps text-tertiary">MEDIUM</span>
          <div className="font-headline-main text-headline-main text-on-surface">{stats.medium}</div>
        </div>
        
        <div className="glass-card p-4 rounded-xl space-y-1 border-l-4 border-l-error col-span-2">
          <div className="flex justify-between items-center">
            <span className="font-label-caps text-label-caps text-error">HARD</span>
            <span className="font-code-sm text-code-sm text-on-surface-variant">Top 5% speed</span>
          </div>
          <div className="font-headline-main text-headline-main text-on-surface">{stats.hard}</div>
        </div>
      </div>

      {/* Last Synced Section */}
      <section className="space-y-3">
        <h2 className="font-label-caps text-label-caps text-on-surface-variant px-1 uppercase tracking-widestest">Latest Activity</h2>
        <div className="glass-card p-card-padding rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3">
            <span className="font-code-sm text-code-sm text-on-surface-variant opacity-50 uppercase">
              {stats.lastSolved ? stats.lastSolved.date : 'No Activity'}
            </span>
          </div>
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <span className="material-symbols-outlined text-primary text-[24px]">
                {stats.lastSolved ? 'check_circle' : 'pending'}
              </span>
            </div>
            <div>
              <h3 className="font-headline-main text-on-surface leading-tight truncate max-w-[200px]">
                {stats.lastSolved ? stats.lastSolved.title : 'Ready to Sync'}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`font-label-caps text-[9px] px-2 py-0.5 rounded border uppercase tracking-widest ${
                  stats.lastSolved 
                    ? 'border-secondary-fixed-dim/30 bg-secondary-fixed-dim/10 text-secondary-fixed-dim' 
                    : 'border-outline-variant/30 bg-surface-container-high text-on-surface-variant'
                }`}>
                  {stats.lastSolved ? 'Completed' : 'Awaiting'}
                </span>
                <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  {stats.lastSolved ? `Difficulty: ${stats.lastSolved.difficulty}` : 'LeetCode Vault'}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              <span className="font-body-md text-on-surface font-medium">{stats.currentStreak} Day Streak</span>
            </div>
            <button 
              onClick={() => onNavigate('history')}
              className="text-primary font-label-caps text-label-caps hover:underline uppercase tracking-widest"
            >
              View All
            </button>
          </div>
        </div>
      </section>

      {/* Record Section */}
      <div 
        onClick={() => onNavigate('history')}
        className="glass-card p-4 rounded-xl flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center border border-white/5">
            <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
          </div>
          <div>
            <div className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Personal Record</div>
            <div className="font-body-md text-on-surface">Longest Streak: <span className="font-bold text-tertiary">{stats.longestStreak} days</span></div>
          </div>
        </div>
        <span className="material-symbols-outlined text-on-surface-variant opacity-30 group-hover:opacity-100 group-hover:text-primary transition-all">chevron_right</span>
      </div>

      {/* Sync Button */}
      <div className="pt-2">
        <button 
          onClick={triggerManualSync}
          disabled={isSyncing}
          className="w-full bg-primary text-on-primary-container h-12 rounded-xl flex items-center justify-center gap-2 font-bold shadow-[0_0_20px_rgba(173,198,255,0.2)] active:scale-[0.98] transition-transform"
        >
          <span className={`material-symbols-outlined text-[20px] ${isSyncing ? 'animate-spin' : ''}`}>sync</span>
          {isSyncing ? 'Syncing...' : 'Sync Queue Now'}
        </button>
      </div>
    </div>
  );
}

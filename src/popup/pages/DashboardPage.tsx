import React, { useMemo } from 'react';
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

  const platformStats = useMemo(() => {
    if (!stats?.groupedSubmissions) return { leetcode: 0, codeforces: 0 };
    let lc = 0, cf = 0;
    
    Object.values(stats.groupedSubmissions).forEach(problems => {
      problems.forEach(p => {
        const path = p.githubPath?.toLowerCase() || '';
        if (path.includes('leetcode')) lc++;
        else if (path.includes('codeforces')) cf++;
      });
    });
    
    return { leetcode: lc, codeforces: cf };
  }, [stats]);

  if (isLoading || !stats || !config) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const toggleLiveSync = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateConfig({ autoSync: !config.autoSync });
  };

  return (
    <div className="space-y-element-gap relative z-10">
      {/* Welcome Header */}
      <div className="flex items-end justify-between mb-4 animate-slide-up" style={{ animationDelay: '0ms' }}>
        <div>
          <h1 className="font-display-sm text-[28px] text-on-surface font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Overview
          </h1>
          <p className="font-body-sm text-on-surface-variant font-medium">Unified Developer Portfolio</p>
        </div>
        <button 
          onClick={toggleLiveSync}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all active:scale-95 shadow-sm ${
            config.autoSync 
              ? 'bg-secondary/15 border-secondary/30 text-secondary' 
              : 'bg-surface-container border-outline-variant/20 text-on-surface-variant grayscale opacity-70'
          }`}
          title={config.autoSync ? "Live Sync is ON (Click to disable)" : "Live Sync is OFF (Click to enable)"}
        >
          <div className={`w-2 h-2 rounded-full ${config.autoSync ? 'bg-secondary pulse-emerald shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-on-surface-variant'}`}></div>
          <span className="font-label-caps text-[10px] uppercase tracking-widest font-bold">
            {config.autoSync ? 'Live Sync' : 'Paused'}
          </span>
        </button>
      </div>

      {/* Platform Breakdown */}
      <div className="flex gap-2 mb-4 animate-slide-up" style={{ animationDelay: '50ms' }}>
        {['leetcode', 'codeforces'].map((p) => {
          const count = platformStats[p as keyof typeof platformStats];
          const name = p === 'leetcode' ? 'LeetCode' : 'Codeforces';
          const iconUrl = `https://${p}.com/favicon.ico`;
          return (
            <div key={p} className="flex-1 glass-card p-2 rounded-lg flex flex-col items-center justify-center gap-1 group hover:border-primary/50 transition-colors">
              <img src={iconUrl} className={`w-4 h-4 rounded-sm ${p === 'codeforces' ? 'bg-white' : ''} group-hover:scale-110 transition-transform`} alt={name} />
              <span className="font-code-sm text-[11px] text-on-surface-variant">{count}</span>
            </div>
          );
        })}
      </div>

      {/* Stats Grid (Bento Style) */}
      <div className="grid grid-cols-2 gap-3 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="glass-card p-card-padding rounded-2xl flex flex-col justify-between col-span-2 min-h-[110px] bg-gradient-to-br from-surface-container/40 to-primary/5">
          <span className="font-label-caps text-on-surface-variant uppercase tracking-widest">Total Solved</span>
          <div className="flex items-baseline gap-3">
            <span className="font-display-sm text-[48px] leading-none text-on-surface font-bold tracking-tighter">
              {stats.total}
            </span>
            <span className="font-code-sm text-secondary font-medium bg-secondary/10 px-2 py-0.5 rounded border border-secondary/20">
              {stats.lastSolved ? '+1 today' : 'Get started!'}
            </span>
          </div>
        </div>
        
        <div className="glass-card p-4 rounded-2xl space-y-2 border-t-2 border-t-secondary-fixed-dim/50 hover:bg-secondary/5">
          <span className="font-label-caps text-secondary-fixed-dim font-bold tracking-widest">EASY</span>
          <div className="font-headline-main text-[24px] text-on-surface font-bold">{stats.easy}</div>
        </div>
        
        <div className="glass-card p-4 rounded-2xl space-y-2 border-t-2 border-t-tertiary/50 hover:bg-tertiary/5">
          <span className="font-label-caps text-tertiary font-bold tracking-widest">MEDIUM</span>
          <div className="font-headline-main text-[24px] text-on-surface font-bold">{stats.medium}</div>
        </div>
        
        <div className="glass-card p-4 rounded-2xl space-y-2 border-t-2 border-t-error/50 col-span-2 hover:bg-error/5 flex items-center justify-between">
          <div>
            <span className="font-label-caps text-error font-bold tracking-widest">HARD / ADVANCED</span>
            <div className="font-headline-main text-[24px] text-on-surface font-bold mt-1">{stats.hard}</div>
          </div>
          <span className="material-symbols-outlined text-[32px] text-error/30 group-hover:text-error/60 transition-colors">diamond</span>
        </div>
      </div>

      {/* Last Synced Section */}
      <section className="space-y-3 pt-2 animate-slide-up" style={{ animationDelay: '150ms' }}>
        <h2 className="font-label-caps text-on-surface-variant px-1 uppercase tracking-widest">Latest Activity</h2>
        <div className="glass-card p-4 rounded-2xl relative overflow-hidden group hover:border-primary/40">
          <div className="absolute top-0 right-0 p-3">
            <span className="font-code-sm text-[10px] text-on-surface-variant opacity-70 uppercase font-medium">
              {stats.lastSolved ? stats.lastSolved.date : 'No Activity'}
            </span>
          </div>
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner group-hover:bg-primary/20 transition-colors">
              <span className="material-symbols-outlined text-primary text-[24px]">
                {stats.lastSolved ? 'task_alt' : 'hourglass_empty'}
              </span>
            </div>
            <div>
              <h3 className="font-headline-main text-[16px] text-on-surface leading-tight truncate max-w-[190px] font-bold">
                {stats.lastSolved ? stats.lastSolved.title : 'Ready to Sync'}
              </h3>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`font-label-caps text-[9px] px-2 py-0.5 rounded uppercase font-bold tracking-widest ${
                  stats.lastSolved 
                    ? 'border border-secondary/30 bg-secondary/10 text-secondary' 
                    : 'border border-outline-variant/30 bg-surface-container-high text-on-surface-variant'
                }`}>
                  {stats.lastSolved ? 'Completed' : 'Awaiting'}
                </span>
                <span className="font-body-sm text-[11px] text-on-surface-variant font-medium">
                  {stats.lastSolved ? `Rank: ${stats.lastSolved.difficulty}` : 'Multi-Platform'}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-outline-variant/30 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              <span className="font-body-md text-on-surface font-semibold tracking-wide">{stats.currentStreak} Day Streak</span>
            </div>
            <button 
              onClick={() => onNavigate('history')}
              className="text-primary font-label-caps hover:underline uppercase tracking-widest flex items-center gap-1 font-bold"
            >
              History <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* Record Section */}
      <div 
        onClick={() => onNavigate('history')}
        className="glass-card p-4 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-surface-container transition-all animate-slide-up mt-2"
        style={{ animationDelay: '200ms' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center border border-tertiary/20 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
          </div>
          <div>
            <div className="font-label-caps text-on-surface-variant uppercase tracking-widest">Personal Record</div>
            <div className="font-body-md text-on-surface font-medium">Longest Streak: <span className="font-bold text-tertiary ml-1">{stats.longestStreak} days</span></div>
          </div>
        </div>
        <span className="material-symbols-outlined text-on-surface-variant opacity-30 group-hover:opacity-100 group-hover:text-primary transition-all group-hover:translate-x-1">chevron_right</span>
      </div>

      {/* Sync Button */}
      <div className="pt-4 pb-6 animate-slide-up" style={{ animationDelay: '250ms' }}>
        <button 
          onClick={triggerManualSync}
          disabled={isSyncing}
          className="w-full bg-primary text-white h-12 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] disabled:opacity-50 disabled:grayscale transition-all hover:bg-primary/90"
        >
          <span className={`material-symbols-outlined text-[20px] ${isSyncing ? 'animate-spin' : ''}`}>sync</span>
          {isSyncing ? 'Syncing Queue...' : 'Sync Queue Now'}
        </button>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

export function SettingsPage() {
  const { 
    config, repos, isLoading, isSaving, 
    updateConfig, exportData, clearData, triggerBulkSync
  } = useSettings();
  const { username, avatarUrl, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [clearInput, setClearInput] = useState('');

  const handleClearData = async () => {
    if (clearInput.toUpperCase() === 'CLEAR') {
      await clearData();
      setShowClearConfirm(false);
      setClearInput('');
      // Force reload stats if needed, or rely on clearData hook to refresh
    }
  };

  if (isLoading || !config) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-element-gap pb-20">
      {/* GitHub Account Section */}
      <section className="glass-card p-card-padding rounded-xl flex flex-col gap-unit animate-slide-up" style={{ animationDelay: '0ms' }}>
        <h2 className="text-label-caps font-label-caps text-on-surface-variant mb-2 uppercase tracking-widestest">GitHub Account</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full border-2 border-primary/30 ring-4 ring-primary/5 overflow-hidden flex items-center justify-center bg-surface-container">
              {avatarUrl ? (
                <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-primary text-2xl">person</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-body-lg font-bold">{username}</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                <span className="text-label-caps text-secondary font-bold uppercase tracking-tight">Active Sync</span>
              </div>
            </div>
          </div>
          
          {showLogoutConfirm ? (
            <div className="flex gap-2">
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="px-2 py-1 text-on-surface-variant text-[10px] uppercase font-bold hover:underline"
              >
                Cancel
              </button>
              <button 
                onClick={logout}
                className="px-3 py-1 bg-error text-white text-[10px] rounded font-bold uppercase tracking-widest shadow-sm"
              >
                Confirm Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowLogoutConfirm(true)}
              className="px-3 py-1.5 border border-error/30 text-error text-body-sm rounded-lg hover:bg-error/10 transition-all font-medium uppercase tracking-widest"
            >
              Disconnect
            </button>
          )}
        </div>
      </section>

      {/* Appearance Section */}
      <section className="glass-card p-card-padding rounded-xl flex flex-col gap-4 animate-slide-up" style={{ animationDelay: '50ms' }}>
        <h2 className="text-label-caps font-label-caps text-on-surface-variant uppercase tracking-widestest">Appearance</h2>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-body-md font-medium">Dark Mode</span>
            <span className="text-body-sm text-on-surface-variant">Switch between light and dark themes</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={theme === 'dark'} 
              onChange={(e) => setTheme(e.target.checked ? 'dark' : 'light')}
              className="sr-only peer" 
            />
            <div className="w-10 h-5 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-container"></div>
          </label>
        </div>
      </section>

      {/* Repository Config */}
      <section className="glass-card p-card-padding rounded-xl flex flex-col gap-stack-space animate-slide-up" style={{ animationDelay: '100ms' }}>
        <h2 className="text-label-caps font-label-caps text-on-surface-variant mb-2 uppercase tracking-widestest">Repository Config</h2>
        <div className="flex flex-col gap-unit">
          <label className="text-body-sm text-on-surface-variant">Select Repository</label>
          <div className="relative group">
            <select
              value={config.repoFullName}
              onChange={(e) => {
                const repo = repos.find(r => r.fullName === e.target.value);
                if (repo) {
                  updateConfig({ 
                    repoFullName: repo.fullName,
                    repoOwner: repo.owner,
                    repoName: repo.name,
                    branch: repo.defaultBranch
                  });
                }
              }}
              className="w-full bg-surface-container-low border border-outline-variant/10 rounded-lg px-3 py-2 text-body-md text-on-surface appearance-none outline-none focus:border-primary/30 transition-all cursor-pointer"
            >
              <option value="">Select repository...</option>
              {repos.map((r) => (
                <option key={r.fullName} value={r.fullName}>
                  {r.fullName}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
          </div>
        </div>
        <div className="flex flex-col gap-unit pt-2">
          <label className="text-body-sm text-on-surface-variant">Branch</label>
          <input
            type="text"
            value={config.branch}
            onChange={(e) => updateConfig({ branch: e.target.value })}
            className="w-full bg-surface-container-low border border-outline-variant/10 rounded-lg px-3 py-2 text-code-sm font-code-sm text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
            placeholder="main"
          />
        </div>
      </section>

      {/* Integrations Section */}
      <section className="glass-card p-card-padding rounded-xl flex flex-col gap-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <h2 className="text-label-caps font-label-caps text-on-surface-variant uppercase tracking-widestest flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">extension</span>
          Platform Integrations
        </h2>
        
        {/* LeetCode (Default) */}
        <div className="flex flex-col gap-3 p-3 bg-surface-container/50 border border-white/5 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="https://leetcode.com/favicon.ico" className="w-5 h-5 rounded" alt="LeetCode" />
              <span className="text-body-md font-bold text-on-surface">LeetCode</span>
            </div>
            <button
              onClick={() => triggerBulkSync('leetcode')}
              className="px-3 py-1.5 bg-primary/10 text-primary text-label-caps font-bold uppercase tracking-widest rounded-md border border-primary/20 hover:bg-primary/20 transition-all active:scale-95"
            >
              Bulk Sync
            </button>
          </div>
          <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">Default Platform - Active</span>
        </div>

        {/* Codeforces */}
        <div className="flex flex-col gap-3 p-3 bg-surface-container/50 border border-white/5 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="https://codeforces.com/favicon.ico" className="w-5 h-5 rounded bg-white" alt="Codeforces" />
              <span className="text-body-md font-bold text-on-surface">Codeforces</span>
            </div>
            <button
              onClick={() => triggerBulkSync('codeforces')}
              className="px-3 py-1.5 bg-primary/10 text-primary text-label-caps font-bold uppercase tracking-widest rounded-md border border-primary/20 hover:bg-primary/20 transition-all active:scale-95"
            >
              Bulk Sync
            </button>
          </div>
        </div>
      </section>

      {/* Sync Preferences */}
      <section className="glass-card p-card-padding rounded-xl flex flex-col gap-4 animate-slide-up" style={{ animationDelay: '150ms' }}>
        <h2 className="text-label-caps font-label-caps text-on-surface-variant uppercase tracking-widestest">Sync Preferences</h2>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-body-md font-medium">Auto-sync on Accepted</span>
            <span className="text-body-sm text-on-surface-variant">Automatically commit solutions</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={config.autoSync} 
              onChange={() => updateConfig({ autoSync: !config.autoSync })}
              className="sr-only peer" 
            />
            <div className="w-10 h-5 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-container"></div>
          </label>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-body-md font-medium">Notifications</span>
            <span className="text-body-sm text-on-surface-variant">Push alerts for sync status</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={config.notifications} 
              onChange={() => updateConfig({ notifications: !config.notifications })}
              className="sr-only peer" 
            />
            <div className="w-10 h-5 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-container"></div>
          </label>
        </div>
      </section>

      {/* Data Management */}
      <section className="glass-card p-card-padding rounded-xl flex flex-col gap-3 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <h2 className="text-label-caps font-label-caps text-on-surface-variant uppercase tracking-widestest">Data Management</h2>
        <button 
          onClick={exportData}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-outline-variant/10 hover:bg-white/5 transition-all text-body-md font-medium uppercase tracking-widest"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export History (JSON)
        </button>
        
        {showClearConfirm ? (
          <div className="flex flex-col gap-3 p-3 bg-error/5 border border-error/20 rounded-lg">
            <p className="text-body-sm text-error font-medium">This will wipe all local history and stats. This cannot be undone.</p>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-on-surface-variant uppercase font-bold">Type "CLEAR" to verify</label>
              <input 
                type="text" 
                value={clearInput}
                onChange={(e) => setClearInput(e.target.value)}
                placeholder="CLEAR"
                className="w-full bg-surface-container-lowest border border-error/30 rounded px-2 py-1 text-code-sm text-error outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => { setShowClearConfirm(false); setClearInput(''); }}
                className="flex-1 py-2 text-on-surface-variant text-body-sm font-bold border border-outline-variant/20 rounded hover:bg-white/5"
              >
                Cancel
              </button>
              <button 
                onClick={handleClearData}
                disabled={clearInput.toUpperCase() !== 'CLEAR'}
                className="flex-1 py-2 bg-error text-white text-body-sm font-bold rounded shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Wipe All Data
              </button>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setShowClearConfirm(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-error/20 text-error/80 hover:bg-error/10 transition-all text-body-md font-medium uppercase tracking-widest"
          >
            <span className="material-symbols-outlined text-[18px]">delete_forever</span>
            Clear All Local Data
          </button>
        )}
      </section>

      {/* Version Footer */}
      <footer className="mt-4 flex flex-col items-center gap-1">
        <span className="text-label-caps font-label-caps text-on-surface-variant/40 uppercase tracking-[0.2em]">AlgoVault v1.0.3-Stable</span>
        <span className="text-body-sm text-on-surface-variant/30 italic">Developed for high-flow engineering</span>
      </footer>
    </div>
  );
}

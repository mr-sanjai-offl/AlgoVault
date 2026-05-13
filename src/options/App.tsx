import React from 'react';
import { SettingsPage } from '../popup/pages/SettingsPage';
import { useAuth } from '../popup/hooks/useAuth';
import { LoginPage } from '../popup/pages/LoginPage';


export function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="relative flex h-8 w-8 mx-auto">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-8 w-8 bg-primary"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-background relative overflow-hidden">
      <div className="max-w-2xl mx-auto py-12 relative z-10">
        <div className="flex items-center gap-4 mb-10 px-container-padding">
          <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-on-primary-container text-3xl">terminal</span>
          </div>
          <div>
            <h1 className="text-display-sm font-display-sm text-primary">AlgoVault Settings</h1>
            <p className="text-body-sm text-on-surface-variant">Configure your development automation environment</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden shadow-2xl">
          {isAuthenticated ? <SettingsPage /> : <LoginPage />}
        </div>
      </div>

      {/* Background Visuals */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/5 blur-[150px] rounded-full"></div>
      </div>
    </div>
  );
}


import React from 'react';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const { startAuth, isAuthenticating, error } = useAuth();

  return (
    <div className="w-full max-w-[400px] mx-auto px-container-padding pb-20">
      <section className="py-10 flex flex-col items-center text-center">
        <div className="mb-6 relative">
          <div className="absolute -inset-4 bg-primary/10 blur-2xl rounded-full"></div>
          <div className="relative p-2 rounded-2xl border border-primary/20 overflow-hidden w-24 h-24">
            <img src="/icons/icon-128.png" className="w-full h-full object-contain" alt="AlgoVault Logo" />
          </div>
        </div>
        <h2 className="text-display-sm font-display-sm text-on-surface mb-2">AlgoVault</h2>
        <p className="text-body-md font-body-md text-on-surface-variant mb-8 max-w-[320px]">
          Seamlessly sync LeetCode solutions to GitHub
        </p>
        
        {error && (
          <div className="mb-6 bg-error/10 border border-error/20 p-3 rounded-lg flex items-center gap-3 w-full">
            <span className="material-symbols-outlined text-error">error</span>
            <span className="text-body-sm text-error font-medium">{error}</span>
          </div>
        )}

        <button 
          onClick={startAuth}
          disabled={isAuthenticating}
          className="w-full bg-primary text-on-primary-container font-headline-main font-bold py-4 rounded-lg flex items-center justify-center gap-3 active:scale-[0.98] shadow-[0_0_15px_rgba(173,198,255,0.3)] transition-all hover:shadow-[0_0_25px_rgba(173,198,255,0.5)] disabled:opacity-50"
        >
          {isAuthenticating ? (
            <>
              <div className="w-5 h-5 border-2 border-on-primary-container/20 border-t-on-primary-container rounded-full animate-spin"></div>
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">hub</span>
              Login with GitHub
            </>
          )}
        </button>
        <p className="mt-4 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-widestest">
          Trusted by 2,000+ developers
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3 mb-10">
        <div className="col-span-2 glass-card rounded-xl p-card-padding flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <span className="material-symbols-outlined text-secondary pulse-emerald" style={{ fontVariationSettings: "'FILL' 1" }}>data_thresholding</span>
            </div>
            <span className="text-label-caps font-label-caps text-secondary bg-secondary/10 px-2 py-1 rounded border border-secondary/20 uppercase tracking-widest">Live Sync</span>
          </div>
          <div>
            <h3 className="text-headline-main font-headline-main text-on-surface mb-1">Auto GitHub Sync</h3>
            <p className="text-body-sm font-body-sm text-on-surface-variant">Push accepted solutions automatically to your repository.</p>
          </div>
        </div>
        
        <div className="glass-card rounded-xl p-card-padding flex flex-col gap-2">
          <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>folder_zip</span>
          <h3 className="text-body-md font-body-md font-bold text-on-surface">Organized Folders</h3>
          <p className="text-body-sm font-body-sm text-on-surface-variant leading-tight">Structured by topic and difficulty.</p>
        </div>
        
        <div className="glass-card rounded-xl p-card-padding flex flex-col gap-2">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>leaderboard</span>
          <h3 className="text-body-md font-body-md font-bold text-on-surface">Progress Dashboard</h3>
          <p className="text-body-sm font-body-sm text-on-surface-variant leading-tight">Track your coding journey metrics.</p>
        </div>

        <div className="col-span-2 glass-card rounded-xl p-card-padding flex items-center gap-4">
          <div className="p-3 bg-on-surface-variant/10 rounded-full">
            <span className="material-symbols-outlined text-on-surface" style={{ fontVariationSettings: "'FILL' 1" }}>encrypted</span>
          </div>
          <div>
            <h3 className="text-body-md font-body-md font-bold text-on-surface">Fully Private</h3>
            <p className="text-body-sm font-body-sm text-on-surface-variant">Everything stays on your device securely.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

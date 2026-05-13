import React from 'react';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const { startAuth, deviceCode, isPolling, error } = useAuth();

  if (deviceCode && isPolling) {
    return (
      <div className="w-full max-w-[400px] flex flex-col gap-element-gap relative px-container-padding py-10">
        <header className="flex flex-col items-center justify-center mb-4 gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center">
              <img src="/icons/icon-128.png" className="w-full h-full object-cover" alt="Logo" />
            </div>
            <h1 className="text-headline-main font-headline-main font-bold tracking-tight text-primary">AlgoVault</h1>
          </div>
          <p className="text-on-surface-variant text-body-sm">GitHub Authentication Required</p>
        </header>

        <main className="flex flex-col gap-element-gap">
          <div className="glass-card rounded-xl p-card-padding flex flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-2 w-full">
              <span className="text-label-caps font-label-caps text-on-surface-variant uppercase tracking-widest">Device Verification Code</span>
              <div className="flex items-center justify-between w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-4 group">
                <span className="text-display-sm font-code-sm font-bold tracking-[0.2em] text-primary select-all">
                  {deviceCode.userCode}
                </span>
                <button 
                  onClick={() => navigator.clipboard.writeText(deviceCode.userCode)}
                  className="flex items-center justify-center p-2 rounded hover:bg-white/5 text-on-surface-variant transition-all active:scale-95" 
                  title="Copy code"
                >
                  <span className="material-symbols-outlined">content_copy</span>
                </button>
              </div>
            </div>
            <div className="w-full space-y-3">
              <a 
                href={deviceCode.verificationUri}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 bg-primary text-on-primary font-bold rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                Open GitHub verification page
              </a>
              <p className="text-body-sm text-on-surface-variant text-center px-4">
                Paste the code above into the GitHub authorization screen to link your account.
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-error/10 border border-error/20 p-3 rounded-lg flex items-center gap-3">
              <span className="material-symbols-outlined text-error">error</span>
              <span className="text-body-sm text-error font-medium">{error}</span>
            </div>
          )}

          <div className="glass-card rounded-lg p-3 flex items-center justify-center gap-3 bg-surface-container-low/50">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
            </div>
            <span className="text-body-sm font-medium text-secondary animate-pulse uppercase tracking-widest">Waiting for authorization...</span>
          </div>
        </main>
      </div>
    );
  }

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
          disabled={isPolling}
          className="w-full bg-primary text-on-primary-container font-headline-main font-bold py-4 rounded-lg flex items-center justify-center gap-3 active:scale-[0.98] shadow-[0_0_15px_rgba(173,198,255,0.3)] transition-all hover:shadow-[0_0_25px_rgba(173,198,255,0.5)] disabled:opacity-50"
        >
          {isPolling ? (
            <>
              <div className="w-5 h-5 border-2 border-on-primary-container/20 border-t-on-primary-container rounded-full animate-spin"></div>
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">hub</span>
              Connect GitHub
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

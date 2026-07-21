import React from 'react';
import type { HistoryItem } from '@shared/types/messages';

interface HistoryListProps {
  items: HistoryItem[];
  onPush: (jobId: string) => void;
}

export function HistoryList({ items, onPush }: HistoryListProps) {
  if (items.length === 0) {
    return (
      <div className="mt-4 p-8 border-2 border-dashed border-outline-variant/20 rounded-xl flex flex-col items-center justify-center text-center animate-slide-up">
        <span className="material-symbols-outlined text-outline-variant text-[32px] mb-2">history_toggle_off</span>
        <p className="text-body-sm text-on-surface-variant font-medium">No submissions found in your vault.</p>
      </div>
    );
  }

  const getPlatformIcon = (path?: string) => {
    if (!path) return 'https://leetcode.com/favicon.ico';
    const lowerPath = path.toLowerCase();
    if (lowerPath.includes('codeforces')) return 'https://codeforces.com/favicon.ico';
    if (lowerPath.includes('hackerrank')) return 'https://hackerrank.com/favicon.ico';
    return 'https://leetcode.com/favicon.ico'; // default
  };

  return (
    <div className="flex flex-col gap-element-gap pb-20 mt-2">
      {items.map((item, index) => (
        <div 
          key={item.id} 
          className="glass-card p-4 rounded-xl flex flex-col gap-3 group hover:border-primary/30 animate-slide-up"
          style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <img src={getPlatformIcon(item.githubPath)} className={`w-4 h-4 rounded-sm ${getPlatformIcon(item.githubPath).includes('codeforces') ? 'bg-white' : ''}`} alt="platform" />
              <h3 className="font-headline-main text-[15px] font-bold text-on-surface truncate max-w-[200px] leading-tight">{item.title}</h3>
            </div>
            <div className={`flex items-center gap-1.5 ${
              item.status === 'synced' ? 'text-secondary' : 
              item.status === 'failed' ? 'text-error' : 'text-tertiary'
            }`}>
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: item.status === 'synced' ? "'FILL' 1" : "" }}>
                {item.status === 'synced' ? 'check_circle' : 
                 item.status === 'failed' ? 'error' : 'hourglass_empty'}
              </span>
              <span className="text-label-caps font-bold uppercase tracking-widest">
                {item.status === 'synced' ? 'Synced' : 
                 item.status === 'failed' ? 'Failed' : 'Pending'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-widest ${
                item.difficulty.toLowerCase() === 'easy' ? 'border-secondary/30 bg-secondary/15 text-secondary' :
                item.difficulty.toLowerCase() === 'medium' ? 'border-tertiary/30 bg-tertiary/15 text-tertiary' :
                'border-error/30 bg-error/15 text-error'
              }`}>
                {item.difficulty}
              </span>
              <span className="text-code-sm text-on-surface-variant opacity-80 font-medium bg-surface-container-high px-2 py-0.5 rounded-md border border-outline-variant/30">{item.language}</span>
            </div>
            {(item.status === 'failed' || item.status === 'pending') && (
              <button 
                onClick={() => onPush(item.id)}
                className="text-primary text-[10px] font-bold flex items-center gap-1 hover:underline uppercase tracking-widest bg-primary/10 px-2 py-1 rounded-md active:scale-95 transition-all"
              >
                RETRY
                <span className="material-symbols-outlined text-[14px]">refresh</span>
              </button>
            )}
          </div>

          <div className="mt-1 pt-2 border-t border-outline-variant/20 flex justify-between items-center">
            <div className="text-[9px] text-on-surface-variant uppercase tracking-widest font-bold">
              {item.status === 'synced' ? `SYNCED ${formatTime(item.syncedAt)}` : 
               item.status === 'failed' ? `FAILED ${formatTime(item.syncedAt)}` : 'QUEUED FOR SYNC'}
            </div>
          </div>
        </div>
      ))}
      
      {/* Empty State / Footer */}
      {items.length > 0 && (
        <div className="mt-2 p-6 border-2 border-dashed border-outline-variant/10 rounded-xl flex flex-col items-center justify-center text-center opacity-50 animate-slide-up" style={{ animationDelay: '500ms' }}>
          <span className="material-symbols-outlined text-outline-variant text-[24px] mb-1">done_all</span>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">End of history</p>
        </div>
      )}
    </div>
  );
}

function formatTime(date: string | number) {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'JUST NOW';
  if (minutes < 60) return `${minutes} MINS AGO`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} HOURS AGO`;
  return new Date(date).toLocaleDateString().toUpperCase();
}

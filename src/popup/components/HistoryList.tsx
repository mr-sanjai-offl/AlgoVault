import React from 'react';
import type { HistoryItem } from '@shared/types/messages';

interface HistoryListProps {
  items: HistoryItem[];
  onPush: (jobId: string) => void;
}

export function HistoryList({ items, onPush }: HistoryListProps) {
  if (items.length === 0) {
    return (
      <div className="mt-4 p-8 border-2 border-dashed border-outline-variant/20 rounded-xl flex flex-col items-center justify-center text-center">
        <span className="material-symbols-outlined text-outline-variant text-[32px] mb-2">history_toggle_off</span>
        <p className="text-body-sm text-on-surface-variant">No submissions found in your vault.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-element-gap pb-20">
      {items.map((item) => (
        <div key={item.id} className="glass-card p-card-padding rounded-lg transition-all duration-200 flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <h3 className="font-headline-main text-body-md font-semibold text-on-surface">{item.title}</h3>
            <div className={`flex items-center gap-2 ${
              item.status === 'synced' ? 'text-secondary' : 
              item.status === 'failed' ? 'text-error' : 'text-tertiary'
            }`}>
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: item.status === 'synced' ? "'FILL' 1" : "" }}>
                {item.status === 'synced' ? 'check_circle' : 
                 item.status === 'failed' ? 'replay' : 'schedule'}
              </span>
              <span className="text-label-caps font-label-caps uppercase tracking-widest">
                {item.status === 'synced' ? 'Synced' : 
                 item.status === 'failed' ? 'Failed' : 'Pending'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className={`px-2 py-0.5 rounded border text-label-caps font-label-caps uppercase tracking-widest ${
              item.difficulty.toLowerCase() === 'easy' ? 'border-secondary/30 bg-secondary/15 text-secondary' :
              item.difficulty.toLowerCase() === 'medium' ? 'border-tertiary/30 bg-tertiary/15 text-tertiary' :
              'border-error/30 bg-error/15 text-error'
            }`}>
              {item.difficulty}
            </span>
            <span className="text-code-sm font-code-sm text-on-surface-variant opacity-70">{item.language}</span>
          </div>

          <div className="mt-1 flex justify-between items-center">
            <div className="text-label-caps font-label-caps text-outline text-[9px] uppercase tracking-widest">
              {item.status === 'synced' ? `SYNCED ${formatTime(item.syncedAt)}` : 
               item.status === 'failed' ? `FAILED ${formatTime(item.syncedAt)}` : 'QUEUED FOR SYNC'}
            </div>
            {(item.status === 'failed' || item.status === 'pending') && (
              <button 
                onClick={() => onPush(item.id)}
                className="text-primary text-label-caps font-label-caps flex items-center gap-1 hover:underline uppercase tracking-widest"
              >
                RETRY NOW
              </button>
            )}
          </div>
        </div>
      ))}
      
      {/* Empty State / Footer */}
      <div className="mt-4 p-8 border-2 border-dashed border-outline-variant/20 rounded-xl flex flex-col items-center justify-center text-center">
        <span className="material-symbols-outlined text-outline-variant text-[32px] mb-2">history_toggle_off</span>
        <p className="text-body-sm text-on-surface-variant">Showing latest submissions from your linked account.</p>
      </div>
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

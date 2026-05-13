import React, { useEffect } from 'react';
import { HistoryList } from '../components/HistoryList';
import { useHistory } from '../hooks/useHistory';
import { useSync } from '../hooks/useSync';

export function HistoryPage() {
  const {
    history,
    isLoading,
    filter,
    fetchHistory,
    changeFilter,
    retryJob,
  } = useHistory();
  const { isSyncing, triggerManualSync } = useSync();

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const filters: Array<{ value: 'all' | 'synced' | 'failed' | 'pending'; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'synced', label: 'Synced' },
    { value: 'failed', label: 'Failed' },
    { value: 'pending', label: 'Pending' },
  ];

  return (
    <div className="flex-1 flex flex-col relative h-full">
      {/* Filter Section */}
      <section className="mb-6 mt-2">
        <div className="flex gap-2 p-1 bg-surface-container-high rounded-lg">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => changeFilter(f.value)}
              className={`flex-1 py-1.5 px-3 text-label-caps font-label-caps rounded transition-all uppercase tracking-widest ${
                filter === f.value 
                  ? 'bg-primary text-on-primary-container shadow-sm font-bold' 
                  : 'text-on-surface-variant hover:bg-white/5'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {/* History List */}
      <div className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : (
          <HistoryList items={history?.items ?? []} onPush={retryJob} />
        )}
      </div>

      {/* Contextual Sync Widget (Floating Action equivalent) */}
      <div className="sticky bottom-0 left-0 right-0 p-container-padding bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none">
        <button 
          onClick={triggerManualSync}
          disabled={isSyncing}
          className="pointer-events-auto w-full bg-primary text-on-primary-container h-12 rounded-xl flex items-center justify-center gap-2 font-bold shadow-[0_0_20px_rgba(173,198,255,0.2)] active:scale-[0.98] transition-transform"
        >
          <span className={`material-symbols-outlined ${isSyncing ? 'animate-spin' : ''}`}>sync</span>
          {isSyncing ? 'Syncing...' : 'Sync Queue Now'}
        </button>
      </div>
    </div>
  );
}

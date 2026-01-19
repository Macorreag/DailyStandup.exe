
import React from 'react';
import { GitBranch, Trash2 } from 'lucide-react';
import { getDailyHistory, clearDailyHistory } from '../dailyHistory';
import { DailyHistoryEntry } from '../types';

const HistoryPanel: React.FC = () => {
  const [history, setHistory] = React.useState<DailyHistoryEntry[]>([]);

  React.useEffect(() => {
    setHistory(getDailyHistory());
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const handleClearHistory = () => {
    if (confirm('¿Estás seguro de que quieres eliminar todo el historial de dailys?')) {
      clearDailyHistory();
      setHistory([]);
    }
  };

  const renderGitLogEntry = (entry: DailyHistoryEntry, index: number) => {
    const isFirst = index === 0;
    const displayDate = entry.id.split('-').slice(0, 3).join('-');
    return (
      <div key={entry.createdAt} className="mb-4 animate-fade-in">
        <div className="flex items-start gap-3">
          {/* Branch visual */}
          <div className="flex flex-col items-center">
            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isFirst ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-indigo-500'}`} />
            {index < history.length - 1 && (
              <div className="w-0.5 flex-1 min-h-[80px] bg-slate-700" />
            )}
          </div>

          {/* Log content */}
          <div className="flex-1 space-y-1.5 min-w-0">
            {/* Commit header */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-amber-400 font-mono text-xs">commit</span>
              <span className="text-amber-400/70 font-mono text-xs">{displayDate}</span>
              {isFirst && (
                <span className="text-[8px] font-mono bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  HEAD
                </span>
              )}
            </div>

            {/* Date */}
            <div className="text-slate-500 font-mono text-[10px]">
              {formatDate(entry.date)}
            </div>

            {/* Participants */}
            <div className="pl-3 border-l border-slate-800 space-y-1">
              <p className="text-slate-400 font-mono text-[10px]">Participants:</p>
              <div className="flex flex-wrap gap-1">
                {entry.participantsOrder.map((name, idx) => (
                  <span key={idx} className="text-slate-500 font-mono text-[10px] bg-slate-800/50 px-1.5 py-0.5 rounded">
                    {idx + 1}) {name}
                  </span>
                ))}
              </div>
              
              {/* Duration & Next owner */}
              <div className="flex items-center gap-3 pt-1">
                <span className="text-slate-600 font-mono text-[10px]">
                  Duration: <span className="text-purple-400">{formatDuration(entry.totalDuration)}</span>
                </span>
                <span className="text-slate-600 font-mono text-[10px]">
                  Next: <span className="text-indigo-400 font-bold">{entry.nextOwner}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="bg-slate-900/60 border border-slate-700/60 rounded-2xl backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900/40 px-4 py-3 border-b border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500/80" />
            <div className="w-2 h-2 rounded-full bg-amber-500/80" />
            <div className="w-2 h-2 rounded-full bg-emerald-500/80" />
          </div>
          <div className="flex items-center gap-2 ml-2">
            <GitBranch className="w-3.5 h-3.5 text-amber-500/70" />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.15em] font-bold">
              Daily_History.log
            </span>
          </div>
        </div>
        
        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1 px-2 py-1 text-[9px] font-mono border border-red-500/30 rounded hover:bg-red-500/10 transition-all text-red-500 uppercase tracking-wider font-bold bg-red-500/5"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto max-h-[350px] scrollbar-thin">
        {history.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <GitBranch className="w-8 h-8 text-slate-700 mx-auto" />
            <p className="text-slate-500 font-mono text-xs">No hay dailys registradas aún.</p>
            <p className="text-slate-600 font-mono text-[10px]">
              Completa tu primera daily para ver el historial aquí.
            </p>
          </div>
        ) : (
          <>
            <div className="text-[9px] font-mono text-slate-600 mb-3 uppercase tracking-wider">
              $ daily log ({history.length} {history.length === 1 ? 'entry' : 'entries'})
            </div>
            {history.map((entry, index) => renderGitLogEntry(entry, index))}
          </>
        )}

        {/* Cursor */}
        {history.length > 0 && (
          <div className="text-slate-600 flex items-center gap-1 mt-2">
            <span className="animate-pulse text-xs">_</span>
          </div>
        )}
      </div>
    </section>
  );
};

export default HistoryPanel;

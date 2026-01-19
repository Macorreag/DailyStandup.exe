
import React, { useEffect, useRef } from 'react';
import { GitBranch, ArrowLeft, Trash2 } from 'lucide-react';
import { getDailyHistory, clearDailyHistory } from '../dailyHistory';
import { DailyHistoryEntry } from '../types';

interface HistoryViewProps {
  onBack: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ onBack }) => {
  const history = getDailyHistory();
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
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
      onBack();
    }
  };

  const renderGitLogEntry = (entry: DailyHistoryEntry, index: number) => {
    const isFirst = index === 0;
    return (
      <div key={entry.id + entry.createdAt} className="mb-6 animate-fade-in">
        {/* Git branch line indicator */}
        <div className="flex items-start gap-4">
          {/* Branch visual */}
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full ${isFirst ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]' : 'bg-indigo-500'}`} />
            {index < history.length - 1 && (
              <div className="w-0.5 h-full min-h-[120px] bg-slate-700" />
            )}
          </div>

          {/* Log content */}
          <div className="flex-1 space-y-2">
            {/* Commit header */}
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-mono text-sm">commit</span>
              <span className="text-amber-400/70 font-mono text-sm">{entry.id}</span>
              {isFirst && (
                <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 ml-2">
                  HEAD
                </span>
              )}
            </div>

            {/* Date */}
            <div className="text-slate-500 font-mono text-xs">
              Date:   {formatDate(entry.date)}
            </div>

            {/* Message body */}
            <div className="pl-4 border-l-2 border-slate-800 mt-3 space-y-3">
              <p className="text-slate-300 font-mono text-sm">Daily standup</p>
              
              {/* Participants order */}
              <div className="space-y-1">
                <p className="text-slate-400 font-mono text-xs">Participants order:</p>
                {entry.participantsOrder.map((name, idx) => (
                  <p key={idx} className="text-slate-500 font-mono text-xs pl-4">
                    {idx + 1}) {name}
                  </p>
                ))}
              </div>

              {/* Duration */}
              <p className="text-slate-500 font-mono text-xs">
                Duration: <span className="text-purple-400">{formatDuration(entry.totalDuration)}</span>
              </p>

              {/* Next owner */}
              <p className="text-slate-400 font-mono text-xs">
                Next owner: <span className="text-indigo-400 font-bold">{entry.nextOwner}</span>
              </p>
            </div>

            {/* Separator */}
            <div className="border-t border-dashed border-slate-800 mt-4 pt-2" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 rounded-xl border border-amber-500/30">
            <GitBranch className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight font-mono text-white">Daily_History.log</h2>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em]">
              {history.length} {history.length === 1 ? 'entry' : 'entries'} found
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-2 px-3 py-2 text-[10px] font-mono border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-all text-red-500 uppercase tracking-widest font-bold bg-red-500/5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear_Log
            </button>
          )}
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-[10px] font-mono border border-slate-700 rounded-lg hover:bg-slate-800 transition-all text-slate-400 uppercase tracking-widest font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
        </div>
      </div>

      {/* Terminal-like log viewer */}
      <div className="bg-[#0a0f1e]/80 border border-slate-800/60 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
        {/* Window controls */}
        <div className="bg-slate-900/40 px-5 py-3 border-b border-slate-800/60 flex items-center gap-2">
          <div className="flex gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] ml-4 font-bold">
            $ daily log
          </span>
        </div>

        {/* Log content */}
        <div className="p-6 overflow-y-auto max-h-[600px] scrollbar-thin">
          {history.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <GitBranch className="w-12 h-12 text-slate-700 mx-auto" />
              <p className="text-slate-500 font-mono text-sm">No hay dailys registradas aún.</p>
              <p className="text-slate-600 font-mono text-xs">
                Completa tu primera daily para ver el historial aquí.
              </p>
            </div>
          ) : (
            <>
              {history.map((entry, index) => renderGitLogEntry(entry, index))}
              <div ref={terminalEndRef} />
            </>
          )}

          {/* Cursor */}
          {history.length > 0 && (
            <div className="text-slate-500 flex items-center gap-2 mt-4">
              <span className="animate-pulse">_</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryView;

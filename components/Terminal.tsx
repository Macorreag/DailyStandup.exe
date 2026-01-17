
import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface TerminalProps {
  logs: LogEntry[];
}

const Terminal: React.FC<TerminalProps> = ({ logs }) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'SUCCESS': return 'text-emerald-400';
      case 'WARN': return 'text-amber-400';
      case 'ERROR': return 'text-red-400';
      default: return 'text-indigo-400';
    }
  };

  return (
    <div className="bg-[#0a0f1e]/80 border border-slate-800/60 rounded-2xl overflow-hidden flex flex-col h-[200px] shadow-2xl backdrop-blur-md">
      <div className="bg-slate-900/40 px-5 py-3 border-b border-slate-800/60 flex items-center gap-2">
        <div className="flex gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
        </div>
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] ml-4 font-bold">Daily_Scheduler.sh</span>
      </div>
      <div className="p-5 overflow-y-auto flex-1 font-mono text-[11px] leading-relaxed scrollbar-thin">
        {logs.map((log) => (
          <div key={log.id} className="mb-1.5 animate-fade-in flex gap-3">
            <span className="text-slate-600 flex-shrink-0">[{log.timestamp}]</span>
            <span className={`font-bold flex-shrink-0 min-w-[65px] ${getLevelColor(log.level)}`}>{log.level}</span>
            <span className="text-slate-400 tracking-wide">{log.message}</span>
          </div>
        ))}
        <div className="text-slate-500 flex items-center gap-2 mt-2">
          <span className="animate-pulse">_</span>
        </div>
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};

export default Terminal;

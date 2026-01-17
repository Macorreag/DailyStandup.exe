
import React, { useMemo, useState, useEffect } from 'react';
import { Participant, ParticipantStatus } from '../types';
import { Trophy, Crown, RefreshCw, BarChart3, Users, Clock, Search, Loader2 } from 'lucide-react';

interface FinishedViewProps {
  participants: Participant[];
  onReset: () => void;
}

const FinishedView: React.FC<FinishedViewProps> = ({ participants, onReset }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [scannedName, setScannedName] = useState('');
  const [revealProgress, setRevealProgress] = useState(0);

  // El líder real se decide al inicio pero se oculta tras la animación
  const nextLeader = useMemo(() => {
    return participants[Math.floor(Math.random() * participants.length)];
  }, [participants]);

  useEffect(() => {
    let iteration = 0;
    const maxIterations = 40;
    const intervalTime = 75; // ms

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * participants.length);
      setScannedName(participants[randomIndex].name);
      setRevealProgress((iteration / maxIterations) * 100);
      iteration++;

      if (iteration >= maxIterations) {
        clearInterval(interval);
        setScannedName(nextLeader.name);
        setIsRevealed(true);
        setRevealProgress(100);
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [participants, nextLeader]);

  const stats = useMemo(() => {
    const totalTime = participants.reduce((acc, p) => acc + p.speakingTime, 0);
    const avgTime = totalTime / (participants.length || 1);
    const completed = participants.filter(p => p.status === ParticipantStatus.COMPLETED).length;
    
    return {
      totalTime,
      avgTime,
      completed,
      skipped: participants.length - completed
    };
  }, [participants]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-4">
        <div className="inline-block p-4 bg-emerald-500/20 rounded-2xl border border-emerald-500/30 mb-2">
          <Trophy className="w-12 h-12 text-emerald-500" />
        </div>
        <h2 className="text-4xl font-bold tracking-tight font-mono uppercase">Daily_Completed.exe</h2>
        <p className="text-slate-400 font-mono text-sm uppercase tracking-[0.2em]">Session integrity verified: 100%</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl flex flex-col items-center gap-3">
          <Users className="w-6 h-6 text-indigo-400" />
          <div className="text-center">
            <div className="text-2xl font-bold font-mono">{stats.completed}/{participants.length}</div>
            <div className="text-[10px] text-slate-500 uppercase font-mono">Nodes_Finished</div>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl flex flex-col items-center gap-3">
          <Clock className="w-6 h-6 text-purple-400" />
          <div className="text-center">
            <div className="text-2xl font-bold font-mono">{formatTime(stats.totalTime)}</div>
            <div className="text-[10px] text-slate-500 uppercase font-mono">Total_Duration</div>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl flex flex-col items-center gap-3">
          <BarChart3 className="w-6 h-6 text-amber-400" />
          <div className="text-center">
            <div className="text-2xl font-bold font-mono">{formatTime(stats.avgTime)}</div>
            <div className="text-[10px] text-slate-500 uppercase font-mono">Avg_Report_Latency</div>
          </div>
        </div>
      </div>

      {/* Leader Reveal Section */}
      <div className={`bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border transition-all duration-700 rounded-3xl p-8 relative overflow-hidden shadow-2xl ${isRevealed ? 'border-indigo-500/30' : 'border-slate-700/30'}`}>
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <div className="flex items-center gap-2 text-indigo-300 font-mono text-xs tracking-widest uppercase">
            {isRevealed ? <Crown className="w-4 h-4 fill-indigo-400/20" /> : <Search className="w-4 h-4 animate-spin" />}
            {isRevealed ? 'Next Cycle Administrator' : 'Calculating_Next_Administrator'}
            {isRevealed ? <Crown className="w-4 h-4 fill-indigo-400/20" /> : <Search className="w-4 h-4 animate-spin" />}
          </div>
          
          <div className={`w-24 h-24 rounded-full bg-slate-900 border-2 transition-all duration-500 flex items-center justify-center shadow-2xl ${isRevealed ? 'border-indigo-500 shadow-indigo-500/30' : 'border-slate-700 shadow-slate-900'}`}>
            {isRevealed ? (
              <Users className="w-12 h-12 text-indigo-400 animate-scale-in" />
            ) : (
              <Loader2 className="w-10 h-10 text-slate-600 animate-spin" />
            )}
          </div>

          <h3 className={`text-5xl font-black font-mono tracking-tighter uppercase transition-all duration-300 ${isRevealed ? 'text-white scale-110' : 'text-slate-600 blur-[2px]'}`}>
            {scannedName}
          </h3>

          {!isRevealed ? (
            <div className="w-full max-w-xs space-y-2">
              <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-100 ease-out" 
                  style={{ width: `${revealProgress}%` }}
                />
              </div>
              <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                Analyzing node productivity metrics...
              </p>
            </div>
          ) : (
            <p className="text-slate-400 max-w-sm font-mono text-xs uppercase leading-relaxed animate-fade-in">
              The system has designated this node to lead the next synchronization event. Prepare for protocol deployment.
            </p>
          )}
        </div>
        
        {/* Background glow for the leader section */}
        {isRevealed && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none animate-pulse" />
        )}
      </div>

      <div className="flex justify-center pt-4">
        <button 
          onClick={onReset}
          className="flex items-center gap-3 px-10 py-4 bg-slate-800 border border-slate-700 rounded-2xl hover:bg-slate-700 transition-all font-mono font-bold text-slate-200 group active:scale-95 shadow-xl"
        >
          <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
          SYSTEM_REBOOT
        </button>
      </div>
    </div>
  );
};

export default FinishedView;

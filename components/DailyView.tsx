
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Participant, ParticipantStatus, LogEntry, 
} from '../types';
import { 
  RotateCcw, SkipForward, CheckCircle2, 
  Clock, LayoutGrid, Circle, Timer, Cpu, ArrowRightCircle, MoreHorizontal
} from 'lucide-react';
import { SYSTEM_MESSAGES } from '../constants';
import Terminal from './Terminal';
import CircularTimer from './CircularTimer';

interface DailyViewProps {
  participants: Participant[];
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
  addLog: (message: string, level: LogEntry['level']) => void;
  logs: LogEntry[];
  onFinish: () => void;
  autoTransition: boolean;
  maxSeconds: number;
}

const DailyView: React.FC<DailyViewProps> = ({ 
  participants, setParticipants, addLog, logs, onFinish, autoTransition, maxSeconds 
}) => {
  const [currentSpeakerId, setCurrentSpeakerId] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionTick, setSelectionTick] = useState('');
  const [newParticipantName, setNewParticipantName] = useState('');
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoSelectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pending = participants.filter(p => p.status === ParticipantStatus.PENDING);
  const activeSpeaker = participants.find(p => p.id === currentSpeakerId);

  useEffect(() => {
    if (currentSpeakerId) {
      timerRef.current = setInterval(() => {
        setParticipants(prev => prev.map(p => 
          p.id === currentSpeakerId ? { ...p, speakingTime: p.speakingTime + 1 } : p
        ));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentSpeakerId, setParticipants]);

  useEffect(() => {
    if (pending.length === 0 && !currentSpeakerId && !isSelecting && participants.length > 0) {
      onFinish();
    }
  }, [pending.length, currentSpeakerId, isSelecting, participants.length, onFinish]);

  const selectNext = useCallback(() => {
    if (pending.length === 0 || isSelecting) return;
    
    setIsSelecting(true);
    addLog(SYSTEM_MESSAGES.SCANNING, 'INFO');
    
    let iterations = 0;
    const maxIterations = 15;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * pending.length);
      setSelectionTick(pending[randomIndex].name);
      iterations++;
      
      if (iterations >= maxIterations) {
        clearInterval(interval);
        const winner = pending[Math.floor(Math.random() * pending.length)];
        
        setParticipants(prev => prev.map(p => 
          p.id === winner.id ? { ...p, status: ParticipantStatus.SPEAKING } : p
        ));
        setCurrentSpeakerId(winner.id);
        setIsSelecting(false);
        addLog(SYSTEM_MESSAGES.TARGET_LOCKED(winner.name), 'SUCCESS');
      }
    }, 80);
  }, [pending, addLog, setParticipants, isSelecting]);

  useEffect(() => {
    if (autoTransition && !currentSpeakerId && !isSelecting && pending.length > 0) {
      if (autoSelectTimeoutRef.current) clearTimeout(autoSelectTimeoutRef.current);
      
      autoSelectTimeoutRef.current = setTimeout(() => {
        addLog("AUTO_TRANSITION_PROTOCOL: Searching for next available node...", "INFO");
        selectNext();
      }, 1500);
    }
    
    return () => {
      if (autoSelectTimeoutRef.current) clearTimeout(autoSelectTimeoutRef.current);
    };
  }, [currentSpeakerId, isSelecting, pending.length, selectNext, addLog, autoTransition]);

  const handleAction = (status: ParticipantStatus) => {
    if (!currentSpeakerId || !activeSpeaker) return;

    let logMsg = "";
    if (status === ParticipantStatus.COMPLETED) logMsg = SYSTEM_MESSAGES.COMPLETING(activeSpeaker.name);
    if (status === ParticipantStatus.SKIPPED) logMsg = SYSTEM_MESSAGES.SKIPPING(activeSpeaker.name);
    if (status === ParticipantStatus.PENDING) logMsg = SYSTEM_MESSAGES.DEFERRING(activeSpeaker.name);

    addLog(logMsg, status === ParticipantStatus.COMPLETED ? 'SUCCESS' : 'WARN');

    setParticipants(prev => prev.map(p => 
      p.id === currentSpeakerId ? { ...p, status } : p
    ));
    setCurrentSpeakerId(null);
  };

  const rewindUser = (id: string) => {
    setParticipants(prev => prev.map(p => 
      p.id === id ? { ...p, status: ParticipantStatus.PENDING, speakingTime: 0 } : p
    ));
    addLog(`Registry reverted: Node [${participants.find(p=>p.id===id)?.name}] re-queued.`, 'INFO');
  };

  const addNewParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newParticipantName.trim();
    
    if (!trimmedName) return;
    
    // Check if participant already exists
    if (participants.some(p => p.name.toLowerCase() === trimmedName.toLowerCase())) {
      addLog(`Node [${trimmedName}] already exists in the system.`, 'WARN');
      setNewParticipantName('');
      return;
    }
    
    const newParticipant: Participant = {
      id: crypto.randomUUID(),
      name: trimmedName,
      status: ParticipantStatus.PENDING,
      speakingTime: 0
    };
    
    setParticipants(prev => [...prev, newParticipant]);
    addLog(`New node registered: [${trimmedName}] added to queue.`, 'INFO');
    setNewParticipantName('');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex flex-col gap-6 h-full min-h-[750px]">
      {/* Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
        
        {/* Left Section: Monitor */}
        <div className="lg:col-span-3 flex flex-col">
          <section className="bg-[#1e293b]/20 border border-slate-700/40 rounded-2xl p-5 backdrop-blur-md flex flex-col h-full shadow-inner">
            <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-6 flex items-center justify-between">
              <span className="flex items-center gap-2"><LayoutGrid className="w-4 h-4 text-slate-500" /> SYSTEM_NODE_MONITOR</span>
              <span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-md text-[9px] border border-indigo-500/20 font-bold">{pending.length} PENDING</span>
            </h3>
            
            <div className="space-y-2 overflow-y-auto pr-2 flex-1 scrollbar-thin">
              {participants.map((p) => {
                const isSpeaking = p.id === currentSpeakerId;
                const isPending = p.status === ParticipantStatus.PENDING;
                const isDone = p.status === ParticipantStatus.COMPLETED;
                const isSkipped = p.status === ParticipantStatus.SKIPPED;
                const hasFinished = isDone || isSkipped;

                return (
                  <div 
                    key={p.id} 
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-300 ${
                      isSpeaking 
                        ? 'bg-[#1e293b] border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)] ring-1 ring-indigo-500/40' 
                        : 'bg-transparent border-transparent hover:border-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="flex-shrink-0">
                        {isSpeaking ? (
                          <div className="w-3.5 h-3.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                        ) : isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 drop-shadow-[0_0_5px_rgba(16,185,129,0.3)]" />
                        ) : isSkipped ? (
                          <SkipForward className="w-5 h-5 text-amber-500" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-slate-600" />
                        )}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <span className={`text-sm font-medium truncate ${hasFinished ? 'text-slate-500' : 'text-slate-200'}`}>
                          {p.name}
                        </span>
                        {(isSpeaking || hasFinished) && (
                          <span className={`text-[10px] font-mono flex items-center gap-1 mt-0.5 ${isSpeaking ? 'text-indigo-400' : 'text-slate-500'}`}>
                            <Timer className="w-2.5 h-2.5" /> {formatTime(p.speakingTime)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSpeaking ? (
                        <span className="text-[9px] font-mono bg-indigo-600 text-white px-2 py-0.5 rounded-md font-black tracking-widest uppercase">Active</span>
                      ) : hasFinished && (
                        <button 
                          onClick={() => rewindUser(p.id)}
                          className="p-1.5 text-slate-700 hover:text-indigo-400 transition-all opacity-60 hover:opacity-100"
                          title="Rewind Node"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Optional: Add new participant input */}
            <div className="mt-3 pt-3 border-t border-slate-800/30">
              <form onSubmit={addNewParticipant} className="flex gap-2">
                <input
                  type="text"
                  value={newParticipantName}
                  onChange={(e) => setNewParticipantName(e.target.value)}
                  placeholder="Add participant..."
                  className="flex-1 bg-slate-900/30 border border-slate-800/40 rounded-lg px-3 py-2 text-xs text-slate-400 placeholder:text-slate-600 focus:outline-none focus:border-slate-700/60 focus:bg-slate-900/40 transition-all"
                />
                <button
                  type="submit"
                  disabled={!newParticipantName.trim()}
                  className="px-3 py-2 bg-slate-800/40 border border-slate-700/40 rounded-lg text-xs text-slate-500 hover:text-slate-400 hover:border-slate-600/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  title="Add participant"
                >
                  <ArrowRightCircle className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </section>
        </div>

        {/* Right Section: Core Processor */}
        <div className="lg:col-span-9 flex flex-col">
          <div className="bg-[#050914] border border-slate-700/50 rounded-2xl flex flex-col h-full relative overflow-hidden shadow-2xl">
            {/* Window Controls Decor */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-800/50">
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em] font-bold">Active Standup</span>
              <MoreHorizontal className="w-4 h-4 text-slate-700" />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
              {!currentSpeakerId && !isSelecting && (
                <div className="text-center space-y-8 animate-fade-in flex flex-col items-center">
                  <div className="w-36 h-36 flex items-center justify-center bg-slate-900/40 rounded-full border border-slate-800 shadow-inner">
                    <Cpu className={`w-16 h-16 text-slate-700 ${autoTransition ? 'animate-pulse' : ''}`} />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-2xl font-black font-mono tracking-tighter uppercase text-slate-600">
                      {autoTransition ? 'Scanning_Nodes...' : 'Awaiting_Command'}
                    </h2>
                    {!autoTransition && (
                      <button 
                        onClick={selectNext}
                        className="group flex items-center gap-3 px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-mono font-black text-xs tracking-[0.2em] shadow-2xl shadow-indigo-600/30 transition-all active:scale-95"
                      >
                        Execute_Selector
                      </button>
                    )}
                  </div>
                </div>
              )}

              {isSelecting && (
                <div className="text-center space-y-12 py-12">
                  <div className="text-8xl font-mono font-black text-indigo-500 tracking-tighter uppercase drop-shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                    {selectionTick}
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex gap-2.5">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                    </div>
                    <span className="text-indigo-400 font-mono text-[10px] tracking-[0.5em] uppercase font-bold">Node_Sync_In_Progress</span>
                  </div>
                </div>
              )}

              {currentSpeakerId && activeSpeaker && (
                <div className="w-full flex flex-col items-center animate-scale-in">
                  <div className="relative w-full max-w-[400px]">
                    <CircularTimer 
                      seconds={activeSpeaker.speakingTime} 
                      maxSeconds={maxSeconds} 
                    />
                  </div>
                  
                  <div className="text-center space-y-4 mt-8 mb-12">
                    <h2 className="text-7xl font-black tracking-tighter text-white font-mono uppercase">
                      {activeSpeaker.name}
                    </h2>
                  </div>

                  {/* Actions according to the screenshot layout */}
                  <div className="flex items-center gap-12">
                    <div className="flex flex-col items-center gap-3">
                      <button 
                        onClick={() => handleAction(ParticipantStatus.PENDING)}
                        className="w-14 h-14 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-500/5 text-slate-400 hover:text-indigo-400 rounded-full flex items-center justify-center transition-all shadow-lg"
                      >
                        <RotateCcw className="w-6 h-6" />
                      </button>
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Defer</span>
                    </div>

                    <button 
                      onClick={() => handleAction(ParticipantStatus.COMPLETED)}
                      className="px-12 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-mono text-sm font-black tracking-[0.2em] uppercase transition-all shadow-2xl shadow-indigo-600/40 flex items-center gap-4 group active:scale-95"
                    >
                      <div className="p-1 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                      Complete Turn
                    </button>

                    <div className="flex flex-col items-center gap-3">
                      <button 
                        onClick={() => handleAction(ParticipantStatus.SKIPPED)}
                        className="w-14 h-14 bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-amber-500/5 text-slate-400 hover:text-amber-400 rounded-full flex items-center justify-center transition-all shadow-lg"
                      >
                        <SkipForward className="w-6 h-6" />
                      </button>
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Skip</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full Width Terminal */}
      <div className="animate-fade-in mt-2">
        <Terminal logs={logs} />
      </div>
    </div>
  );
};

export default DailyView;

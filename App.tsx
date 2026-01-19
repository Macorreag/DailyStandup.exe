
import React, { useState, useCallback, useEffect } from 'react';
import { Participant, ParticipantStatus, AppMode, LogEntry } from './types';
import { TERMINAL_BOOT_LOGS, MAX_TIME_SECONDS } from './constants';
import SetupView from './components/SetupView';
import DailyView from './components/DailyView';
import FinishedView from './components/FinishedView';
import HistoryView from './components/HistoryView';
import { Terminal as TerminalIcon, ShieldAlert, GitBranch } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.SETUP);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [autoTransition, setAutoTransition] = useState(true);
  const [maxTimeSeconds, setMaxTimeSeconds] = useState(MAX_TIME_SECONDS);
  const [logs, setLogs] = useState<LogEntry[]>(
    TERMINAL_BOOT_LOGS.map((msg, i) => ({
      id: `boot-${i}`,
      timestamp: new Date().toLocaleTimeString(),
      level: 'INFO',
      message: msg
    }))
  );

  const addLog = useCallback((message: string, level: LogEntry['level'] = 'INFO') => {
    const newLog: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      level,
      message
    };
    setLogs(prev => [...prev.slice(-49), newLog]);
  }, []);

  const handleStartDaily = (names: string[], configAutoTransition: boolean, configMaxSeconds: number) => {
    const newParticipants: Participant[] = names.map(name => ({
      id: crypto.randomUUID(),
      name: name.trim(),
      status: ParticipantStatus.PENDING,
      speakingTime: 0
    }));
    setParticipants(newParticipants);
    setAutoTransition(configAutoTransition);
    setMaxTimeSeconds(configMaxSeconds);
    setMode(AppMode.DAILY);
    addLog(`System initialized with ${newParticipants.length} participants.`, 'SUCCESS');
    addLog(`Auto-transition mode: ${configAutoTransition ? 'ENABLED' : 'DISABLED'}`, 'INFO');
    addLog(`Time limit per node: ${Math.floor(configMaxSeconds / 60)}m ${configMaxSeconds % 60}s`, 'INFO');
  };

  const resetAll = useCallback(() => {
    setParticipants(prev => prev.map(p => ({
      ...p,
      status: ParticipantStatus.PENDING,
      speakingTime: 0
    })));
    setMode(AppMode.SETUP);
    setLogs([]);
    addLog("System reset requested. Returning to setup kernel.", "WARN");
  }, [addLog]);

  const finishDaily = useCallback(() => {
    setMode(AppMode.SUMMARY);
    addLog("Standup cycle completed successfully.", "SUCCESS");
  }, [addLog]);

  const showHistory = useCallback(() => {
    setMode(AppMode.HISTORY);
    addLog("Loading daily history log...", "INFO");
  }, [addLog]);

  const backFromHistory = useCallback(() => {
    setMode(AppMode.SETUP);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-100 flex flex-col p-4 md:p-6 font-sans selection:bg-indigo-500/30">
      {/* Header aligned as per screenshot */}
      <header className="mb-6 flex items-center justify-between animate-fade-in max-w-[1400px] mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30">
            <TerminalIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight font-mono text-white leading-none">DailyStandup.exe</h1>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em] mt-1">Version 2.5.0-LITE</p>
          </div>
        </div>
        
        {mode !== AppMode.SETUP && mode !== AppMode.HISTORY && (
          <button 
            onClick={resetAll}
            className="flex items-center gap-2 px-4 py-2 text-[10px] font-mono border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-all text-red-500 uppercase tracking-widest font-bold bg-red-500/5"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Abort_System
          </button>
        )}

        {mode === AppMode.SETUP && (
          <button 
            onClick={showHistory}
            className="flex items-center gap-2 px-4 py-2 text-[10px] font-mono border border-amber-500/30 rounded-lg hover:bg-amber-500/10 transition-all text-amber-500 uppercase tracking-widest font-bold bg-amber-500/5"
          >
            <GitBranch className="w-3.5 h-3.5" />
            View_History
          </button>
        )}
      </header>

      <main className="flex-1 w-full max-w-[1400px] mx-auto flex flex-col gap-6">
        {mode === AppMode.SETUP && (
          <SetupView onStart={handleStartDaily} />
        )}
        
        {mode === AppMode.DAILY && (
          <DailyView 
            participants={participants} 
            setParticipants={setParticipants} 
            addLog={addLog}
            logs={logs}
            onFinish={finishDaily}
            autoTransition={autoTransition}
            maxSeconds={maxTimeSeconds}
          />
        )}

        {mode === AppMode.SUMMARY && (
          <FinishedView 
            participants={participants} 
            onReset={resetAll} 
          />
        )}

        {mode === AppMode.HISTORY && (
          <HistoryView onBack={backFromHistory} />
        )}
      </main>
    </div>
  );
};

export default App;

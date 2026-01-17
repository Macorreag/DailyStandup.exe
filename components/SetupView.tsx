
import React, { useState, useEffect } from 'react';
import { UserPlus, X, Play, Save, Check, Database, Edit3, ArrowDownToLine, ArrowUpFromLine, Zap, ZapOff, Clock } from 'lucide-react';
import { DEFAULT_NAMES, MAX_TIME_SECONDS } from '../constants';

interface SetupViewProps {
  onStart: (names: string[], autoTransition: boolean, maxSeconds: number) => void;
}

const LOCAL_STORAGE_KEY = 'daily_standup_config_v2';

interface PersistedConfig {
  names: string[];
  maxTimeMinutes: number;
  autoTransition: boolean;
}

const SetupView: React.FC<SetupViewProps> = ({ onStart }) => {
  const [input, setInput] = useState('');
  const [storedConfig, setStoredConfig] = useState<PersistedConfig>({
    names: DEFAULT_NAMES,
    maxTimeMinutes: Math.floor(MAX_TIME_SECONDS / 60),
    autoTransition: true
  });
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);
  const [isEditingDefaults, setIsEditingDefaults] = useState(false);
  const [tempDefaultsInput, setTempDefaultsInput] = useState('');
  const [autoTransition, setAutoTransition] = useState(true);
  const [maxTimeMinutes, setMaxTimeMinutes] = useState(5);

  // Sincronizar estado local con localStorage al montar
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as PersistedConfig;
        const config = {
          names: Array.isArray(parsed.names) ? parsed.names : DEFAULT_NAMES,
          maxTimeMinutes: typeof parsed.maxTimeMinutes === 'number' ? parsed.maxTimeMinutes : 5,
          autoTransition: typeof parsed.autoTransition === 'boolean' ? parsed.autoTransition : true
        };
        setStoredConfig(config);
        setAutoTransition(config.autoTransition);
        setMaxTimeMinutes(config.maxTimeMinutes);
      } catch (e) {
        setStoredConfig({ names: DEFAULT_NAMES, maxTimeMinutes: 5, autoTransition: true });
      }
    }
  }, []);

  const saveToStorage = (names: string[], minutes: number, autoTrans: boolean) => {
    const config: PersistedConfig = { names, maxTimeMinutes: minutes, autoTransition: autoTrans };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
    setStoredConfig(config);
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 2000);
  };

  const handlePullFromStorage = () => {
    setInput(storedConfig.names.join(', '));
    setMaxTimeMinutes(storedConfig.maxTimeMinutes);
    setAutoTransition(storedConfig.autoTransition);
  };

  const handlePushToStorage = () => {
    const names = input
      .split(/[,\n]/)
      .map(name => name.trim())
      .filter(name => name.length > 0);
    saveToStorage(names.length > 0 ? names : storedConfig.names, maxTimeMinutes, autoTransition);
  };

  const handleUpdateDefaultsDirectly = () => {
    const names = tempDefaultsInput
      .split(/[,\n]/)
      .map(name => name.trim())
      .filter(name => name.length > 0);
    saveToStorage(names, maxTimeMinutes, autoTransition);
    setIsEditingDefaults(false);
  };

  const startEditingDefaults = () => {
    setTempDefaultsInput(storedConfig.names.join(', '));
    setIsEditingDefaults(true);
  };

  const currentNames = input
    .split(/[,\n]/)
    .map(name => name.trim())
    .filter(name => name.length > 0);

  const removeName = (index: number) => {
    const updated = currentNames.filter((_, i) => i !== index);
    setInput(updated.join(', '));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
      
      {/* SECCIÓN IZQUIERDA: EDITOR DE SESIÓN ACTUAL */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-6 rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 font-mono text-white">
              <UserPlus className="w-5 h-5 text-indigo-400" />
              SESSION_INIT_BUFFER
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={handlePullFromStorage}
                className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 bg-indigo-400/10 px-2 py-1.5 rounded border border-indigo-500/20"
              >
                <ArrowDownToLine className="w-3 h-3" />
                PULL_DEFAULTS
              </button>
              <button 
                onClick={handlePushToStorage}
                className={`text-[10px] font-mono transition-all flex items-center gap-1 px-2 py-1.5 rounded border ${
                  showSavedFeedback 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' 
                  : 'bg-slate-700/50 text-slate-400 border-slate-600 hover:text-white hover:bg-slate-600'
                }`}
              >
                {showSavedFeedback ? <Check className="w-3 h-3" /> : <ArrowUpFromLine className="w-3 h-3" />}
                {showSavedFeedback ? 'STORAGE_UPDATED' : 'PUSH_TO_STORAGE'}
              </button>
            </div>
          </div>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Introduce nombres separados por comas..."
            className="w-full h-64 bg-slate-900/80 border border-slate-700 rounded-xl p-4 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono text-sm resize-none mb-6 placeholder:text-slate-600 shadow-inner"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* CONFIGURACIÓN DE TRANSICIÓN */}
            <div className="p-4 bg-slate-900/40 border border-slate-700/50 rounded-xl flex items-center justify-between transition-all hover:border-slate-600/50">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-colors ${autoTransition ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}>
                  {autoTransition ? <Zap className="w-5 h-5" /> : <ZapOff className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-xs font-mono font-bold uppercase tracking-widest text-slate-300">Auto-Transition Protocol</p>
                  <p className="text-[10px] font-mono text-slate-500">Auto selection after completion</p>
                </div>
              </div>
              <button 
                onClick={() => setAutoTransition(!autoTransition)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${autoTransition ? 'bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.4)]' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${autoTransition ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* CONFIGURACIÓN DE TIEMPO */}
            <div className="p-4 bg-slate-900/40 border border-slate-700/50 rounded-xl flex items-center justify-between transition-all hover:border-slate-600/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-mono font-bold uppercase tracking-widest text-slate-300">Time Limit Protocol</p>
                  <p className="text-[10px] font-mono text-slate-500">Set minutes per participant</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  min="1" 
                  max="60"
                  value={maxTimeMinutes}
                  onChange={(e) => setMaxTimeMinutes(parseInt(e.target.value) || 1)}
                  className="w-12 bg-slate-800 border border-slate-700 rounded-md py-1 px-2 text-center text-xs font-mono text-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => onStart(currentNames, autoTransition, maxTimeMinutes * 60)}
            disabled={currentNames.length === 0}
            className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-bold text-lg transition-all transform active:scale-95 ${
              currentNames.length > 0 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-600/20 text-white' 
              : 'bg-slate-700 text-slate-500 cursor-not-allowed border border-slate-600 opacity-50'
            }`}
          >
            <Play className={`w-5 h-5 ${currentNames.length > 0 ? 'fill-white' : ''}`} />
            EXECUTE_STANDUP.run
          </button>
        </div>

        {/* PREVIEW DE SESIÓN */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
            Session Cluster Preview ({currentNames.length} nodes)
          </h3>
          <div className="flex flex-wrap gap-2">
            {currentNames.map((name, idx) => (
              <div 
                key={`${name}-${idx}`} 
                className="group relative bg-slate-800/40 border border-slate-700/50 px-3 py-1.5 rounded-lg flex items-center gap-2 hover:border-indigo-500/30 transition-all animate-scale-in"
              >
                <span className="text-xs font-medium text-slate-300">{name}</span>
                <button 
                  onClick={() => removeName(idx)}
                  className="text-slate-600 hover:text-red-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECCIÓN DERECHA: GESTIÓN DE LOCAL STORAGE */}
      <div className="lg:col-span-5 space-y-6">
        <section className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-6 backdrop-blur-sm border-dashed">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-mono text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-500/70" />
              Persistent_Storage_Hub
            </h2>
            {!isEditingDefaults ? (
              <button 
                onClick={startEditingDefaults}
                className="p-2 text-slate-500 hover:text-amber-400 transition-all bg-slate-800/50 rounded-lg border border-slate-700"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditingDefaults(false)}
                  className="px-2 py-1 text-[10px] font-mono text-slate-400 hover:text-white"
                >
                  CANCEL
                </button>
                <button 
                  onClick={handleUpdateDefaultsDirectly}
                  className="px-2 py-1 text-[10px] font-mono bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded hover:bg-amber-500/20"
                >
                  SAVE
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {/* CONFIGURACIÓN GUARDADA */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500">DEFAULT_TIME:</span>
                <span className="text-[10px] font-mono text-indigo-400">{storedConfig.maxTimeMinutes} MINS</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500">AUTO_TRANSITION:</span>
                <span className={`text-[10px] font-mono ${storedConfig.autoTransition ? 'text-emerald-500' : 'text-slate-600'}`}>
                  {storedConfig.autoTransition ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>
            </div>

            <div className="h-px bg-slate-800 w-full" />

            {isEditingDefaults ? (
              <textarea
                value={tempDefaultsInput}
                onChange={(e) => setTempDefaultsInput(e.target.value)}
                className="w-full h-40 bg-slate-950 border border-amber-500/30 rounded-xl p-3 text-slate-300 font-mono text-xs focus:ring-1 focus:ring-amber-500/50 resize-none"
              />
            ) : (
              <div className="space-y-4">
                <span className="text-[10px] font-mono text-slate-600 uppercase">Default Nodes:</span>
                <div className="flex flex-wrap gap-2">
                  {storedConfig.names.map((name, idx) => (
                    <span 
                      key={`stored-${name}-${idx}`}
                      className="px-2 py-1 bg-slate-800/80 border border-slate-700/50 rounded text-[10px] font-mono text-slate-500"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SetupView;

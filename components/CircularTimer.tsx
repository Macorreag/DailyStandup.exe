
import React from 'react';

interface CircularTimerProps {
  seconds: number;
  maxSeconds: number;
}

const CircularTimer: React.FC<CircularTimerProps> = ({ seconds, maxSeconds }) => {
  const size = 300;
  const center = size / 2;
  const strokeWidth = 14;
  const radius = (size / 2) - strokeWidth; 
  const circumference = 2 * Math.PI * radius;
  
  const progress = Math.min(seconds / maxSeconds, 1);
  const offset = circumference - (progress * circumference);
  
  const isOverTime = seconds > maxSeconds;

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="relative flex items-center justify-center w-full aspect-square mx-auto max-w-[320px]">
      <svg 
        viewBox={`0 0 ${size} ${size}`} 
        className="w-full h-full overflow-visible drop-shadow-[0_0_20px_rgba(99,102,241,0.15)]"
        preserveAspectRatio="xMidYMid meet"
      >
        <g transform={`rotate(-90 ${center} ${center})`}>
          <circle
            cx={center}
            cy={center}
            r={radius}
            className="stroke-slate-800/60"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            className={`transition-all duration-1000 ease-linear ${
              isOverTime 
                ? 'stroke-red-500 animate-pulse' 
                : 'stroke-indigo-500'
            }`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            style={{ 
              filter: !isOverTime ? 'drop-shadow(0 0 10px rgba(99,102,241,0.6))' : 'none' 
            }}
          />
          {/* Knob detail at the end of progress */}
          <circle
            cx={center + radius * Math.cos(progress * 2 * Math.PI)}
            cy={center + radius * Math.sin(progress * 2 * Math.PI)}
            r="6"
            className={isOverTime ? 'fill-red-500' : 'fill-white shadow-xl'}
          />
        </g>
      </svg>
      
      <div className={`absolute inset-0 flex flex-col items-center justify-center font-mono pointer-events-none select-none`}>
        {/* Status Pill Inside Circle - GREEN & PULSING as requested */}
        <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-2 animate-pulse">
           <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
           <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-[0.2em]">Speaking_Mode_Active</span>
        </div>

        <span className={`text-7xl font-black tracking-tighter tabular-nums leading-none ${isOverTime ? 'text-red-500' : 'text-white'}`}>
          {formatTime(seconds)}
        </span>
        
        <span className="text-[10px] uppercase text-slate-500 tracking-[0.5em] mt-6 font-bold opacity-70">
          {isOverTime ? 'LIMIT_EXCEEDED' : 'MINUTES'}
        </span>
      </div>
    </div>
  );
};

export default CircularTimer;

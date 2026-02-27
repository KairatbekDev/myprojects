import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Music, Volume2 } from 'lucide-react';

export const SpotifyWidget: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(35);

  // Имитация движения трека
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setProgress((p) => (p >= 100 ? 0 : p + 0.5));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  return (
    <div className="bg-[#09090b] border border-white/5 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-600/10 blur-[50px] rounded-full group-hover:bg-blue-600/20 transition-all" />

      <div className="relative z-10 flex items-center gap-5">
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg ${isPlaying ? 'bg-blue-600 rotate-0 scale-105' : 'bg-zinc-800 -rotate-6'}`}>
          <Music className={`${isPlaying ? 'text-white' : 'text-zinc-500'} animate-pulse`} size={32} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-black italic uppercase tracking-tighter truncate text-lg">NEON_DRIFT_2077</h4>
          <p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.3em] mt-1">Sytem_Audio_Driver</p>
          <div className="flex items-center gap-2 mt-2 opacity-50">
             <Volume2 size={12} />
             <div className="w-12 h-1 bg-zinc-800 rounded-full">
                <div className="w-2/3 h-full bg-zinc-400" />
             </div>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-5 relative z-10">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden cursor-pointer">
            <div 
              className="h-full bg-gradient-to-r from-blue-700 to-blue-400 transition-all duration-1000 ease-linear shadow-[0_0_15px_rgba(37,99,235,0.5)]" 
              style={{ width: `${progress}%` }} 
            />
          </div>
          <div className="flex justify-between text-[8px] font-mono text-zinc-600 uppercase font-bold tracking-widest">
            <span>01:24</span>
            <span>03:45</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center px-2">
          <button className="text-zinc-600 hover:text-white transition-colors"><SkipBack size={22} fill="currentColor" /></button>
          
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-black hover:scale-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          >
            {isPlaying ? <Pause size={28} fill="black" /> : <Play size={28} fill="black" className="ml-1" />}
          </button>

          <button className="text-zinc-600 hover:text-white transition-colors"><SkipForward size={22} fill="currentColor" /></button>
        </div>
      </div>

      {/* Visualizer bars */}
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-1 opacity-10 h-10 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="w-1 bg-blue-500 rounded-t-full transition-all duration-300"
            style={{ 
              height: isPlaying ? `${Math.random() * 100}%` : '10%',
              transitionDelay: `${i * 0.05}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

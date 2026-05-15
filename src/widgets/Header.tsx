import React from 'react';
import { Command } from 'lucide-react';

interface HeaderProps {
  userEmail: string | null;
  time: string;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({ userEmail, time, onSignOut }) => {
  return (
    <header className="px-4 py-4 md:px-10 md:py-6 flex items-center z-40 bg-black/20 backdrop-blur-md border-b border-white/5 gap-4">
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
          <Command size={20} className="text-white" />
        </div>
        <h1 className="text-white font-black text-xl italic tracking-tighter uppercase hidden sm:block">Kairat.sys</h1>
      </div>

      {userEmail && (
        <div className="flex flex-col border-l border-white/10 pl-4 flex-shrink-0">
          <span className="text-[7px] text-zinc-500 tracking-[0.3em] font-bold opacity-50 uppercase">Operator</span>
          <span className="text-[10px] text-blue-400 font-mono font-black">
            {userEmail.split('@')[0].toUpperCase()}
          </span>
        </div>
      )}

      <div className="flex-1" />

      <p className="text-blue-500 font-mono font-black text-sm md:text-lg flex-shrink-0">{time}</p>

      <button
        onClick={onSignOut}
        className="flex-shrink-0 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-all text-[10px] font-bold uppercase"
      >
        Exit_Session
      </button>
    </header>
  );
};

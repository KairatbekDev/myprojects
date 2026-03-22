import React from 'react';
import { Command, Search } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface HeaderProps {
  userEmail: string | null;
  time: string;
}

export const Header: React.FC<HeaderProps> = ({ userEmail, time }) => {
  return (
    <header className="px-4 py-4 md:px-10 md:py-8 flex justify-between items-center z-40 bg-black/20 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
          <Command size={20} className="text-white" />
        </div>
        <h1 className="text-white font-black text-xl italic tracking-tighter uppercase hidden sm:block">Kairat.sys</h1>
      </div>
      
      {userEmail && (
        <div className="flex flex-col ml-3 border-l border-white/10 pl-3">
          <span className="text-[7px] text-zinc-500 tracking-[0.3em] font-bold opacity-50 uppercase">Operator</span>
          <span className="text-[10px] text-blue-400 font-mono font-black">
            {userEmail.split('@')[0].toUpperCase()}
          </span>
        </div>
      )}

      <button 
        onClick={async () => await supabase.auth.signOut()}
        className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-all text-[10px] font-bold uppercase ml-4"
      >
        Exit_Session
      </button>
      
      <div className="flex-1 max-w-sm mx-4">
        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5 focus-within:border-blue-500/40 transition-all">
          <Search size={16} className="text-zinc-600" />
          <input className="bg-transparent outline-none text-[10px] font-bold tracking-widest w-full text-white uppercase" placeholder="SCAN_NODES..." />
        </div>
      </div>

      <p className="text-blue-500 font-mono font-black text-sm md:text-xl">{time}</p>
    </header>
  );
};

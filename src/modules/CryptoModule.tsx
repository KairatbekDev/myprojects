import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowUpRight, Wallet } from 'lucide-react';

export const CryptoModule = () => {
  return (
    <div className="space-y-6 p-2">
      <div className="flex items-center gap-4 text-emerald-500">
        <div className="p-3 bg-emerald-500/10 rounded-2xl">
          <Wallet size={32} />
        </div>
        <div>
          <h2 className="text-white text-2xl font-black italic uppercase tracking-tighter">Finance_Node</h2>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em]">Net: Mainnet_v6</p>
        </div>
      </div>

      <div className="p-6 bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-[2rem] text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={40} /></div>
        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Total_Balance</p>
        <h3 className="text-4xl font-black italic text-white tracking-tighter">$142,069.42</h3>
        <div className="mt-4 flex justify-center gap-2">
           <span className="text-[8px] px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-full font-bold">+12.4% (24h)</span>
        </div>
      </div>

      <button className="w-full bg-white text-black py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-emerald-400 transition-colors shadow-xl">
        Transfer_Funds
      </button>
    </div>
  );
};

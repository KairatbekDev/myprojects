import React from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, ShoppingCart, MessageSquare, Send } from 'lucide-react';

export const AuthModule = () => (
  <div className="space-y-8 p-4">
    <div className="flex items-center gap-4 text-blue-500">
       <Fingerprint size={48} />
       <h2 className="text-white text-3xl font-black italic uppercase tracking-tighter">Neural_Auth</h2>
    </div>
    <div className="h-40 bg-blue-500/5 border border-blue-500/20 rounded-3xl flex items-center justify-center relative overflow-hidden">
       <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-blue-500/30"><Fingerprint size={80}/></motion.div>
       <motion.div animate={{ top: ["0%", "100%", "0%"] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute inset-x-0 h-1 bg-blue-500 shadow-[0_0_15px_blue]" />
    </div>
    <button className="w-full bg-blue-600 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.4em] text-white">Authorize_Protocol</button>
  </div>
);

export const ShopModule = () => (
  <div className="space-y-8 p-4">
    <div className="flex items-center gap-4 text-emerald-500">
       <ShoppingCart size={48} />
       <h2 className="text-white text-3xl font-black italic uppercase tracking-tighter">Quantum_Pay</h2>
    </div>
    <div className="p-8 bg-zinc-900/50 rounded-3xl border border-white/5 text-center">
       <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 text-emerald-500">Wallet_Balance</p>
       <h3 className="text-4xl font-black italic text-white">$42,069.00</h3>
    </div>
    <button className="w-full bg-emerald-600 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.4em] text-white">Execute_Transaction</button>
  </div>
);

export const ChatModule = () => (
  <div className="space-y-6 p-4">
    <div className="flex items-center gap-4 text-purple-500">
       <MessageSquare size={48} />
       <h2 className="text-white text-3xl font-black italic uppercase tracking-tighter">Signal_Nexus</h2>
    </div>
    <div className="h-48 bg-black/50 border border-white/5 rounded-3xl p-6 space-y-4 overflow-y-auto font-mono text-[11px]">
       <div className="bg-purple-500/10 p-3 rounded-2xl border border-purple-500/20 text-white italic">Node_Status: Encrypted_Link_Ready</div>
       <div className="bg-zinc-900/80 p-3 rounded-2xl text-zinc-400 ml-4">Waiting for inbound signal...</div>
    </div>
    <div className="flex gap-4">
       <input className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-6 text-[10px] uppercase font-bold text-white outline-none focus:border-purple-500" placeholder="SIGNAL..." />
       <button className="p-4 bg-purple-600 rounded-xl text-white shadow-lg shadow-purple-900/20"><Send size={20}/></button>
    </div>
  </div>
);

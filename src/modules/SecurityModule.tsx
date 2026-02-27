import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck, Lock } from 'lucide-react';
import { useStore, useSystemActions } from '../store/useStore';

export const SecurityModule = () => {
  const isExploiting = useStore((s) => s.isExploiting);
  const status = useStore((s) => s.status);
  const { addLog } = useSystemActions();

  return (
    <motion.div 
      animate={{ 
        borderColor: isExploiting ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.05)',
        backgroundColor: isExploiting ? 'rgba(127, 29, 29, 0.1)' : 'rgba(24, 24, 27, 0.4)'
      }}
      className="p-8 rounded-[3rem] border backdrop-blur-2xl transition-colors duration-500"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">
            Security_Core
          </h3>
          <p className="text-[10px] text-zinc-500 font-mono">STATUS: {status}</p>
        </div>
        <motion.div 
          animate={isExploiting ? { rotate: [0, -10, 10, 0] } : {}}
          transition={{ repeat: Infinity, duration: 0.2 }}
        >
          {isExploiting ? <ShieldAlert className="text-red-500" size={32} /> : <ShieldCheck className="text-blue-500" size={32} />}
        </motion.div>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-black/40 rounded-2xl border border-white/5 flex justify-between items-center">
          <span className="text-xs font-bold text-zinc-400 uppercase">Firewall Integrity</span>
          <span className={`text-xs font-mono ${isExploiting ? 'text-red-500' : 'text-green-500'}`}>
            {isExploiting ? 'COMPROMISED' : '100%'}
          </span>
        </div>
        
        <button 
          onClick={() => addLog("Manual security override initiated...")}
          className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
        >
          Refresh Protocols
        </button>
      </div>
    </motion.div>
  );
};

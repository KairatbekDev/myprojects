import React from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, KeyRound, Shield } from 'lucide-react';

export const SecurityModule = () => {
  return (
    <div className="space-y-6">
      {/* Заголовок внутри модуля */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-white text-2xl font-black italic uppercase tracking-tighter">Neural Identity</h2>
          <p className="text-[10px] text-blue-500 font-bold uppercase tracking-[0.4em]">Security_Vault_v5</p>
        </div>
        <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
          <Shield size={24} className="text-blue-500" />
        </div>
      </div>

      {/* Сектор Сканирования (ELITE DESIGN) */}
      <div className="relative h-56 bg-blue-500/5 border border-blue-500/20 rounded-[3rem] flex flex-col items-center justify-center overflow-hidden group">
        {/* Сетка и лазерный луч */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,blue_1px,transparent_1px)] bg-[size:20px_20px]" />
        
        <motion.div 
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.5, 1, 0.5] 
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="relative z-10"
        >
          <Fingerprint size={80} className="text-blue-500" />
        </motion.div>

        {/* Анимированная линия сканера */}
        <motion.div 
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_15px_blue] z-20"
        />

        <div className="absolute bottom-6 flex gap-2 text-center">
          <div className="w-1 h-1 bg-blue-500 rounded-full animate-ping" />
          <p className="text-[7px] font-black text-blue-500 uppercase tracking-[0.5em]">Scanning_Biometrics...</p>
        </div>
      </div>

      {/* Информационная панель доступа */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-zinc-900/50 border border-white/5 rounded-2xl relative overflow-hidden group hover:border-blue-500/30 transition-colors">
          <p className="text-[8px] font-black text-zinc-600 uppercase mb-1">Security_Level</p>
          <h4 className="text-white font-black italic text-sm">CLASS_AAA</h4>
          <div className="absolute bottom-0 left-0 h-[2px] bg-blue-600 w-full opacity-30 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="p-4 bg-zinc-900/50 border border-white/5 rounded-2xl hover:border-blue-500/30 transition-colors">
          <p className="text-[8px] font-black text-zinc-600 uppercase mb-1">Encryption</p>
          <h4 className="text-white font-black italic text-sm">AES_512_X</h4>
        </div>
      </div>

      {/* Форма ввода с эффектами */}
      <div className="space-y-4">
        <div className="group relative p-5 bg-black/40 border border-white/10 rounded-2xl transition-all focus-within:border-blue-500/50 shadow-inner">
          <div className="flex items-center gap-3">
            <KeyRound size={18} className="text-blue-500" />
            <input 
              className="bg-transparent outline-none text-[10px] font-black tracking-[0.2em] w-full text-white uppercase placeholder:text-zinc-800" 
              placeholder="ENTER_PRIVATE_PASSPHRASE" 
              type="password"
            />
          </div>
        </div>

        <button className="relative w-full overflow-hidden bg-blue-600 py-6 rounded-[2rem] group active:scale-95 transition-all shadow-[0_15px_30px_rgba(37,99,235,0.3)]">
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <span className="relative text-[11px] font-black uppercase tracking-[0.4em] text-white flex items-center justify-center gap-2">
            <Shield size={16} fill="white" /> Authorize_Session
          </span>
        </button>
      </div>

      {/* Технический подвал */}
      <div className="flex justify-between items-center opacity-30 px-2 pt-4">
        <p className="text-[7px] font-mono text-zinc-500 uppercase">Auth_v5.0.2 // Node_22</p>
        <div className="flex gap-1">
          <div className="w-4 h-1 bg-blue-500/50 rounded-full" />
          <div className="w-2 h-1 bg-zinc-800 rounded-full" />
        </div>
      </div>
    </div>
  );
};

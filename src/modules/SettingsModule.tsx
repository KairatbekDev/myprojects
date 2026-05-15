import React, { useState } from 'react';
import { User, MessageCircle, Lock, ChevronRight, ExternalLink, Moon, Sun, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsProps {
  userEmail: string | null;
  currentTheme: 'dark' | 'light';
  onThemeChange: (theme: 'dark' | 'light') => void;
}

export const SettingsModule: React.FC<SettingsProps> = ({ userEmail, currentTheme, onThemeChange }) => {
  const [resetStatus, setResetStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  const handlePasswordReset = async () => {
    if (!userEmail) return;
    setResetLoading(true);
    setResetStatus(null);

    const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
      redirectTo: window.location.origin,
    });

    setResetStatus(
      error
        ? { type: 'error', msg: 'Security error: ' + error.message }
        : { type: 'success', msg: `Reset instructions sent to ${userEmail}` }
    );
    setResetLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-10">
      <h2 className="text-white font-black uppercase italic text-3xl tracking-tighter">System_Config</h2>

      <section className="space-y-4">
        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em] ml-6">Interface_Settings</p>
        <button
          onClick={() => onThemeChange(currentTheme === 'dark' ? 'light' : 'dark')}
          className="w-full bg-zinc-900/20 border border-white/5 p-6 rounded-[2rem] flex items-center justify-between hover:bg-white/5 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              {currentTheme === 'dark'
                ? <Moon className="text-blue-400" size={20} />
                : <Sun className="text-yellow-500" size={20} />
              }
            </div>
            <div className="text-left">
              <span className="block text-white font-bold uppercase text-xs">Visual_Environment</span>
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest">Mode: {currentTheme}</span>
            </div>
          </div>
          <div className={`w-10 h-5 rounded-full border border-white/10 relative ${currentTheme === 'dark' ? 'bg-zinc-800' : 'bg-blue-600'}`}>
            <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full transition-all ${currentTheme === 'dark' ? 'left-1 bg-zinc-600' : 'right-1 bg-white'}`} />
          </div>
        </button>
      </section>

      <section className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-400 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.3)] flex-shrink-0">
            <User size={40} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.3em] mb-1">Authenticated_Operator</p>
            <p className="text-2xl font-black text-white italic truncate">
              {userEmail?.split('@')[0].toUpperCase() ?? 'ROOT'}
            </p>
            <p className="text-xs text-zinc-500 font-mono mt-1 truncate">{userEmail}</p>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em] ml-6">Security_Protocols</p>

        <AnimatePresence>
          {resetStatus && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`p-4 rounded-2xl flex items-start gap-3 ${resetStatus.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}
            >
              {resetStatus.type === 'success'
                ? <CheckCircle size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                : <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
              }
              <p className={`text-[10px] font-bold uppercase tracking-wide ${resetStatus.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                {resetStatus.msg}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handlePasswordReset}
          disabled={resetLoading || !userEmail}
          className="w-full bg-zinc-900/20 border border-white/5 p-6 rounded-[2rem] flex items-center justify-between hover:bg-red-500/5 hover:border-red-500/20 transition-all group disabled:opacity-50"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-xl group-hover:bg-red-500/20 transition-colors">
              <Lock className="text-red-500" size={20} />
            </div>
            <div className="text-left">
              <span className="block text-white font-bold uppercase text-xs">Reset_Master_Password</span>
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest">
                {resetLoading ? 'Sending...' : 'Automated_Email_Service'}
              </span>
            </div>
          </div>
          <ChevronRight size={18} className="text-zinc-700 group-hover:text-red-500 transition-colors" />
        </button>
      </div>

      <div className="space-y-4">
        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em] ml-6">External_Comm</p>
        <a
          href="https://t.me/YOUR_BOT_USERNAME"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-blue-600/5 border border-blue-500/10 p-6 rounded-[2rem] flex items-center justify-between hover:bg-blue-600/10 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <MessageCircle className="text-blue-400" size={20} />
            </div>
            <div className="text-left">
              <span className="block text-white font-bold uppercase text-xs">Direct_Bot_Support</span>
              <span className="text-[9px] text-blue-500/60 uppercase tracking-widest">Telegram_Gateway</span>
            </div>
          </div>
          <ExternalLink size={18} className="text-blue-500/40 group-hover:text-blue-400 transition-colors" />
        </a>
      </div>
    </div>
  );
};

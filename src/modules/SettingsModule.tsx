import React from 'react';
import { User, MessageCircle, Lock, ChevronRight, ExternalLink, Moon, Sun } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface SettingsProps {
  userEmail: string | null;
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

export const SettingsModule = ({ userEmail, currentTheme, onThemeChange }: SettingsProps) => {
  
  const toggleTheme = () => {
    onThemeChange(currentTheme === 'dark' ? 'light' : 'dark');
  };

  const handlePasswordReset = async () => {
    if (userEmail) {
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: window.location.origin,
      });
      
      if (error) {
        alert("Ошибка безопасности: " + error.message);
      } else {
        alert("Протокол запущен: Инструкции отправлены на " + userEmail);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-10">
      <h2 className="text-white font-black uppercase italic text-3xl tracking-tighter">System_Config</h2>

      {/* Переключатель темы */}
      <section className="space-y-4">
        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em] ml-6">Interface_Settings</p>
        <button 
          onClick={toggleTheme}
          className="w-full bg-zinc-900/20 border border-white/5 p-6 rounded-[2rem] flex items-center justify-between hover:bg-white/5 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              {currentTheme === 'dark' ? <Moon className="text-blue-400" size={20} /> : <Sun className="text-yellow-500" size={20} />}
            </div>
            <div>
              <span className="block text-white font-bold uppercase text-xs">Visual_Environment</span>
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest block text-left">Mode: {currentTheme}</span>
            </div>
          </div>
          <div className={`w-10 h-5 rounded-full border border-white/10 relative ${currentTheme === 'dark' ? 'bg-zinc-800' : 'bg-blue-600'}`}>
            <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full transition-all ${currentTheme === 'dark' ? 'left-1 bg-zinc-600' : 'right-1 bg-white'}`} />
          </div>
        </button>
      </section>

      {/* Профиль */}
      <section className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-400 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.3)]">
            <User size={40} className="text-white" />
          </div>
          <div>
            <p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.3em] mb-1">Authenticated_Operator</p>
            <p className="text-2xl font-black text-white italic truncate max-w-[200px]">
              {userEmail?.split('@')[0].toUpperCase() || 'ROOT'}
            </p>
            <p className="text-xs text-zinc-500 font-mono mt-1">{userEmail}</p>
          </div>
        </div>
      </section>

      {/* Безопасность */}
      <div className="space-y-4">
        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em] ml-6">Security_Protocols</p>
        <button 
          onClick={handlePasswordReset}
          className="w-full bg-zinc-900/20 border border-white/5 p-6 rounded-[2rem] flex items-center justify-between hover:bg-red-500/5 hover:border-red-500/20 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-xl group-hover:bg-red-500/20 transition-colors">
              <Lock className="text-red-500" size={20} />
            </div>
            <div className="text-left">
              <span className="block text-white font-bold uppercase text-xs">Reset_Master_Password</span>
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest">Automated_Email_Service</span>
            </div>
          </div>
          <ChevronRight size={18} className="text-zinc-700 group-hover:text-red-500 transition-colors" />
        </button>
      </div>

      {/* Поддержка */}
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

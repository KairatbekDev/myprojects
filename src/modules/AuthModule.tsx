import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, User, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface AuthProps {
  onLogin: () => void;
}

export const AuthModule = ({ onLogin }: AuthProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(''); // Стейт для почты уже есть, отлично

  // Добавляем async, чтобы работать с базой данных
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    // 1. Вытаскиваем пароль из формы (в твоей верстке это последний input)
    const password = (e.target as any).elements[isLogin ? 1 : 2].value;

    if (isLogin) {
      // --- ЛОГИКА ВХОДА ---
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      if (error) throw error;
      console.log('Успешный вход!');
    } else {
      // --- ЛОГИКА РЕГИСТРАЦИИ ---
      const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });
      if (error) throw error;
      
      alert('Аккаунт успешно создан! Теперь вы можете войти.');
      setIsLogin(true); 
      setLoading(false);
      return;
    }

    onLogin();

  } catch (error: any) {
    console.error('Ошибка:', error.message);
    alert(error.message || 'Произошла ошибка при аутентификации');
  } finally {
    setLoading(false);
  }
};
         
  return (
    <div className="fixed inset-0 z-[200] bg-[#020202] flex items-center justify-center p-6 overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/10 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] bg-zinc-900/30 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
            <Zap size={32} className="text-white fill-white" />
          </div>
          <h2 className="text-white text-3xl font-black italic uppercase tracking-tighter">
            {isLogin ? 'Welcome_Back' : 'Create_Account'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500" size={18} />
              <input required type="text" placeholder="USERNAME" className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-white outline-none focus:border-blue-500/50 uppercase tracking-widest" />
            </div>
          )}
          
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500" size={18} />
            <input 
              required 
              type="email" 
              placeholder="EMAIL_ADDRESS" 
              value={email} // Привязываем значение к стейту
              onChange={(e) => setEmail(e.target.value)} // Обновляем стейт при вводе
              className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-white outline-none focus:border-blue-500/50 uppercase tracking-widest" 
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500" size={18} />
            <input required type="password" placeholder="PASSWORD" className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-white outline-none focus:border-blue-500/50 uppercase tracking-widest" />
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl text-white font-black uppercase text-[10px] tracking-[0.4em] flex items-center justify-center gap-3 mt-6"
          >
            {loading ? <RefreshCw className="animate-spin" size={18} /> : <> {isLogin ? 'Authorize' : 'Initialize'} <ArrowRight size={16} /> </>}
          </motion.button>
        </form>

        <div className="mt-8 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-[9px] font-black text-zinc-600 hover:text-blue-400 uppercase tracking-widest">
            {isLogin ? "Don't have an account? Create_One" : "Already registered? Login_System"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

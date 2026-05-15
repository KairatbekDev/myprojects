import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, ArrowRight, Zap, RefreshCw, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth, AuthMode } from '../hooks/useAuth';

interface AuthModuleProps {
  onLogin: () => void;
}

export const AuthModule: React.FC<AuthModuleProps> = ({ onLogin }) => {
  const { signIn, signUp, resetPassword, resendConfirmation } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showResend, setShowResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const resetState = () => {
    setError(null);
    setSuccessMsg(null);
    setShowResend(false);
    setPassword('');
  };

  const switchMode = (next: AuthMode) => {
    resetState();
    setMode(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    if (mode === 'login') {
      const err = await signIn(email, password);
      if (err) {
        setError(err);
        if (err.toLowerCase().includes('confirm')) setShowResend(true);
      } else {
        onLogin();
      }
    } else if (mode === 'signup') {
      const err = await signUp(email, password);
      if (err) {
        setError(err);
      } else {
        setSuccessMsg('Account created! Check your email to confirm, then log in.');
        setShowResend(true);
      }
    } else if (mode === 'reset') {
      const err = await resetPassword(email);
      if (err) {
        setError(err);
      } else {
        setSuccessMsg(`Password reset instructions sent to ${email}`);
      }
    }

    setLoading(false);
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError(null);
    const err = await resendConfirmation(email);
    if (err) {
      setError(err);
    } else {
      setSuccessMsg('Confirmation email resent. Check your inbox.');
    }
    setResendLoading(false);
  };

  const titles: Record<AuthMode, string> = {
    login: 'Welcome_Back',
    signup: 'Create_Account',
    reset: 'Reset_Password',
  };

  const buttonLabels: Record<AuthMode, string> = {
    login: 'Authorize',
    signup: 'Initialize',
    reset: 'Send_Reset',
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#020202] flex items-center justify-center p-6 overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/10 blur-[120px] rounded-full pointer-events-none" />

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-full max-w-[400px] bg-zinc-900/30 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative z-10"
        >
          {mode !== 'login' && (
            <button
              onClick={() => switchMode('login')}
              className="flex items-center gap-2 text-zinc-600 hover:text-white transition-colors text-[9px] font-black uppercase tracking-widest mb-8"
            >
              <ArrowLeft size={14} /> Back_to_Login
            </button>
          )}

          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
              <Zap size={32} className="text-white fill-white" />
            </div>
            <h2 className="text-white text-3xl font-black italic uppercase tracking-tighter">
              {titles[mode]}
            </h2>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3"
              >
                <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] font-bold text-red-400 uppercase tracking-wide leading-relaxed">{error}</p>
              </motion.div>
            )}
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3"
              >
                <CheckCircle size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide leading-relaxed">{successMsg}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input
                required
                type="email"
                placeholder="EMAIL_ADDRESS"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-white outline-none focus:border-blue-500/50 uppercase tracking-widest transition-colors"
              />
            </div>

            {mode !== 'reset' && (
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  required
                  type="password"
                  placeholder="PASSWORD"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-white outline-none focus:border-blue-500/50 uppercase tracking-widest transition-colors"
                />
              </div>
            )}

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 py-4 rounded-2xl text-white font-black uppercase text-[10px] tracking-[0.4em] flex items-center justify-center gap-3 mt-6 transition-colors shadow-lg shadow-blue-600/20"
            >
              {loading
                ? <RefreshCw className="animate-spin" size={18} />
                : <>{buttonLabels[mode]} <ArrowRight size={16} /></>
              }
            </motion.button>
          </form>

          {showResend && email && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4"
            >
              <button
                onClick={handleResend}
                disabled={resendLoading}
                className="w-full py-3 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {resendLoading ? <RefreshCw className="animate-spin" size={14} /> : <RefreshCw size={14} />}
                Resend_Confirmation
              </button>
            </motion.div>
          )}

          <div className="mt-8 flex flex-col items-center gap-3">
            {mode === 'login' && (
              <>
                <button
                  onClick={() => switchMode('signup')}
                  className="text-[9px] font-black text-zinc-600 hover:text-blue-400 uppercase tracking-widest transition-colors"
                >
                  No account? Create_One
                </button>
                <button
                  onClick={() => switchMode('reset')}
                  className="text-[9px] font-black text-zinc-700 hover:text-zinc-400 uppercase tracking-widest transition-colors"
                >
                  Forgot_Password?
                </button>
              </>
            )}
            {mode === 'signup' && (
              <button
                onClick={() => switchMode('login')}
                className="text-[9px] font-black text-zinc-600 hover:text-blue-400 uppercase tracking-widest transition-colors"
              >
                Already registered? Login_System
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

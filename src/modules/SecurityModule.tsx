import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, KeyRound, Shield, RefreshCw } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useToast } from '../hooks/useToast';

interface SecurityStats {
  totalEvents: number;
  authEvents: number;
  errorEvents: number;
  warningEvents: number;
}

const EMPTY_STATS: SecurityStats = {
  totalEvents: 0,
  authEvents: 0,
  errorEvents: 0,
  warningEvents: 0,
};

export const SecurityModule: React.FC = () => {
  const [stats, setStats] = useState<SecurityStats>(EMPTY_STATS);
  const [statsLoading, setStatsLoading] = useState(true);
  const [tableAvailable, setTableAvailable] = useState(true);
  const toast = useToast();

  const fetchStats = async () => {
    setStatsLoading(true);
    const { data, error } = await supabase
      .from('access_logs')
      .select('event_type');

    if (error) {
      if (error.message.includes('does not exist') || error.code === '42P01') {
        setTableAvailable(false);
      } else {
        toast.error('Security scan error: ' + error.message);
      }
      setStatsLoading(false);
      return;
    }

    setTableAvailable(true);
    const rows = (data ?? []) as Array<{ event_type: string }>;
    setStats({
      totalEvents: rows.length,
      authEvents: rows.filter((r) => r.event_type === 'AUTH').length,
      errorEvents: rows.filter((r) => r.event_type === 'ERROR').length,
      warningEvents: rows.filter((r) => r.event_type === 'WARNING').length,
    });
    setStatsLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-white text-2xl font-black italic uppercase tracking-tighter">Neural Identity</h2>
          <p className="text-[10px] text-blue-500 font-bold uppercase tracking-[0.4em]">Security_Vault_v5</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchStats}
            disabled={statsLoading}
            className="p-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl border border-blue-500/20 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={`text-blue-500 ${statsLoading ? 'animate-spin' : ''}`} />
          </button>
          <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
            <Shield size={24} className="text-blue-500" />
          </div>
        </div>
      </div>

      {/* Scan Sector */}
      <div className="relative h-44 bg-blue-500/5 border border-blue-500/20 rounded-[3rem] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,blue_1px,transparent_1px)] bg-[size:20px_20px]" />
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="relative z-10"
        >
          <Fingerprint size={64} className="text-blue-500" />
        </motion.div>
        <motion.div
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_15px_blue] z-20"
        />
        <div className="absolute bottom-4 flex gap-2 items-center">
          <div className="w-1 h-1 bg-blue-500 rounded-full animate-ping" />
          <p className="text-[7px] font-black text-blue-500 uppercase tracking-[0.5em]">Scanning_Biometrics...</p>
        </div>
      </div>

      {/* Live Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Total_Events', value: statsLoading ? '...' : tableAvailable ? stats.totalEvents.toString() : 'N/A' },
          { label: 'Auth_Events', value: statsLoading ? '...' : tableAvailable ? stats.authEvents.toString() : 'N/A' },
          {
            label: 'Warnings',
            value: statsLoading ? '...' : tableAvailable ? stats.warningEvents.toString() : 'N/A',
            alert: !statsLoading && tableAvailable && stats.warningEvents > 0,
          },
          {
            label: 'Errors',
            value: statsLoading ? '...' : tableAvailable ? stats.errorEvents.toString() : 'N/A',
            alert: !statsLoading && tableAvailable && stats.errorEvents > 0,
          },
        ].map(({ label, value, alert }) => (
          <div
            key={label}
            className={`p-4 bg-zinc-900/50 border rounded-2xl relative overflow-hidden group transition-colors ${
              alert ? 'border-red-500/30 hover:border-red-500/50' : 'border-white/5 hover:border-blue-500/30'
            }`}
          >
            <p className="text-[8px] font-black text-zinc-600 uppercase mb-1">{label}</p>
            <h4 className={`font-black italic text-base ${alert ? 'text-red-400' : 'text-white'}`}>{value}</h4>
            <div className={`absolute bottom-0 left-0 h-[2px] w-full opacity-30 group-hover:opacity-100 transition-opacity ${alert ? 'bg-red-500' : 'bg-blue-600'}`} />
          </div>
        ))}
      </div>

      {!tableAvailable && (
        <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl text-[9px] text-yellow-400/70 font-mono">
          access_logs table not found. Run: <code className="text-yellow-400">CREATE TABLE public.access_logs (...)</code> — see terminal for DDL.
        </div>
      )}

      {/* Passphrase Input */}
      <div className="group relative p-5 bg-black/40 border border-white/10 rounded-2xl focus-within:border-blue-500/50 transition-all shadow-inner">
        <div className="flex items-center gap-3">
          <KeyRound size={18} className="text-blue-500 flex-shrink-0" />
          <input
            className="bg-transparent outline-none text-[10px] font-black tracking-[0.2em] w-full text-white uppercase placeholder:text-zinc-800"
            placeholder="ENTER_PRIVATE_PASSPHRASE"
            type="password"
          />
        </div>
      </div>

      <button className="relative w-full overflow-hidden bg-blue-600 py-5 rounded-[2rem] group active:scale-95 transition-all shadow-[0_15px_30px_rgba(37,99,235,0.3)]">
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        <span className="relative text-[11px] font-black uppercase tracking-[0.4em] text-white flex items-center justify-center gap-2">
          <Shield size={16} fill="white" /> Authorize_Session
        </span>
      </button>

      <div className="flex justify-between items-center opacity-30 px-2">
        <p className="text-[7px] font-mono text-zinc-500 uppercase">Auth_v5.0.2 // Node_22</p>
        <div className="flex gap-1">
          <div className="w-4 h-1 bg-blue-500/50 rounded-full" />
          <div className="w-2 h-1 bg-zinc-800 rounded-full" />
        </div>
      </div>
    </div>
  );
};

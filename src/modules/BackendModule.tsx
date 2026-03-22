import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Server, Database, Code2, Cpu, CheckCircle2,
  XCircle, RefreshCw, ChevronRight, Terminal, Globe, 
  Activity, Zap, ShieldCheck, Search
} from 'lucide-react';

// --- ДАННЫЕ (Вынесем для чистоты) ---
const endpoints = [
  { method: 'GET',    path: '/api/v1/users',      status: 200, ms: 42, load: '2%'  },
  { method: 'POST',   path: '/api/v1/auth/login',  status: 200, ms: 87, load: '12%' },
  { method: 'GET',    path: '/api/v1/projects',    status: 200, ms: 31, load: '5%'  },
  { method: 'DELETE', path: '/api/v1/sessions/:id',status: 204, ms: 19, load: '1%'  },
  { method: 'GET',    path: '/api/v1/logs',        status: 500, ms: 203, load: '45%' },
];

const levelColor: Record<string, string> = {
  INFO:  'text-blue-400',
  WARN:  'text-yellow-400',
  ERROR: 'text-red-400',
};

const tabs = ['Эндпоинты', 'База данных', 'Логи', 'Конфиг'];

export const BackendModule = () => {
  const [activeTab, setActiveTab] = useState('Эндпоинты');
  const [spinning, setSpinning] = useState(false);
  const [cpuLoad, setCpuLoad] = useState(12);

  // Имитация живой нагрузки CPU
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuLoad(Math.floor(Math.random() * (45 - 12 + 1) + 12));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setSpinning(true);
    setTimeout(() => setSpinning(false), 1000);
  };

  return (
    <div className="space-y-6 p-2 md:p-6 font-sans">

      {/* HEADER С ЭФФЕКТОМ СВЕЧЕНИЯ */}
      <div className="flex items-center justify-between bg-orange-500/5 p-6 rounded-[2.5rem] border border-orange-500/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[50px]" />
        <div className="flex items-center gap-5 relative z-10">
          <div className="p-4 bg-orange-500 rounded-2xl shadow-[0_0_20px_rgba(249,115,22,0.4)]">
            <Server size={32} className="text-white" />
          </div>
          <div>
            <h2 className="text-white text-3xl font-black italic uppercase tracking-tighter leading-none">
              Backend_Lab <span className="text-orange-500 text-sm not-italic ml-2">V2.0</span>
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em]">
                System_Node: Operational // Uptime: 124h
              </p>
            </div>
          </div>
        </div>
        <button onClick={handleRefresh} className="relative z-10 p-4 bg-black/40 border border-white/5 rounded-2xl text-zinc-400 hover:text-orange-500 transition-all active:scale-90">
          <motion.div animate={{ rotate: spinning ? 360 : 0 }} transition={{ duration: 0.8, ease: "easeInOut" }}>
            <RefreshCw size={20} />
          </motion.div>
        </button>
      </div>

      {/* LIVE MONITORING CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-5 group hover:border-orange-500/30 transition-all">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[9px] font-black text-zinc-500 uppercase">CPU_Load</p>
            <Cpu size={14} className="text-orange-500" />
          </div>
          <div className="flex items-end gap-3">
             <h4 className="text-2xl font-black text-white italic">{cpuLoad}%</h4>
             <div className="flex-1 h-1.5 bg-zinc-800 rounded-full mb-2 overflow-hidden">
                <motion.div animate={{ width: `${cpuLoad}%` }} className="h-full bg-orange-500 shadow-[0_0_10px_orange]" />
             </div>
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-5">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[9px] font-black text-zinc-500 uppercase">Database_IO</p>
            <Database size={14} className="text-blue-500" />
          </div>
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-emerald-500" />
            <span className="text-white font-black italic uppercase text-lg tracking-tight">Stable_Link</span>
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-5">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[9px] font-black text-zinc-500 uppercase">Security_Layer</p>
            <ShieldCheck size={14} className="text-emerald-500" />
          </div>
          <p className="text-white font-black italic uppercase text-lg tracking-tight">AES_256_Active</p>
        </div>
      </div>

      {/* TABS (ELITE DOCK STYLE) */}
      <div className="flex p-1.5 bg-zinc-900/80 backdrop-blur-xl border border-white/5 rounded-[1.5rem] w-fit mx-auto md:mx-0">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-6 py-2.5 rounded-[1.2rem] text-[9px] font-black uppercase tracking-widest transition-all ${
              activeTab === t
                ? 'bg-orange-600 text-white shadow-[0_5px_15px_rgba(234,88,12,0.3)]'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* CONTENT AREA */}
      <div className="min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.3 }}
          >
            {/* ЭНДПОИНТЫ */}
            {activeTab === 'Эндпоинты' && (
              <div className="grid gap-3">
                {endpoints.map((e, i) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    key={i}
                    className="flex flex-col md:flex-row md:items-center justify-between bg-zinc-900/40 border border-white/5 rounded-[1.8rem] p-5 hover:bg-zinc-900/60 transition-all group"
                  >
                    <div className="flex items-center gap-6 mb-3 md:mb-0">
                      <div className={`px-4 py-1.5 rounded-full text-[9px] font-black ${
                        e.method === 'GET' ? 'bg-blue-500/10 text-blue-400' : 
                        e.method === 'POST' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {e.method}
                      </div>
                      <span className="text-white font-mono text-xs font-bold tracking-tight">{e.path}</span>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                      <div className="text-right">
                        <p className="text-[7px] font-black text-zinc-600 uppercase mb-0.5">Response</p>
                        <p className={`text-[10px] font-black ${e.status < 400 ? 'text-emerald-500' : 'text-red-500'}`}>{e.status} OK</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[7px] font-black text-zinc-600 uppercase mb-0.5">Latency</p>
                        <p className="text-[10px] text-white font-black italic">{e.ms}ms</p>
                      </div>
                      <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center group-hover:border-orange-500/50 transition-colors">
                        <Zap size={14} className="text-zinc-700 group-hover:text-orange-500" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* ДРУГИЕ ВКЛАДКИ (КОРОТКО) */}
            {activeTab === 'База данных' && (
               <div className="p-10 text-center bg-zinc-900/20 border border-dashed border-white/10 rounded-[3rem]">
                  <Database size={40} className="mx-auto text-zinc-800 mb-4" />
                  <p className="text-xs font-black uppercase text-zinc-600 tracking-widest italic">SQL_Mirroring_Protocol_Active</p>
                  <button className="mt-6 px-8 py-4 bg-orange-600 text-white font-black uppercase text-[10px] rounded-2xl shadow-lg">Query_Explorer</button>
               </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

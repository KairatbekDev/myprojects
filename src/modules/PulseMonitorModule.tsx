import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Cpu, Zap } from 'lucide-react';
import { getLiveLoad, getInitialPulse } from '../services/PulseService';

export const PulseMonitorModule = () => {
  const [pulse, setPulse] = useState(getInitialPulse());

  useEffect(() => {
    const timer = setInterval(() => {
      setPulse(prev => [...prev.slice(1), getLiveLoad()]);
    }, 800); // Обновление каждые 0.8 сек
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-md">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-white font-black italic uppercase text-2xl tracking-tighter flex items-center gap-3">
            <Activity className="text-blue-500 animate-pulse" size={24} />
            System_Pulse_v2
          </h2>
          <p className="text-[8px] text-zinc-500 font-bold tracking-[0.3em] uppercase mt-1">Real-time_Telemetry_Stream</p>
        </div>
        <div className="flex gap-2">
           <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[9px] font-black text-blue-500 uppercase">Active_Link</div>
        </div>
      </div>

      {/* ГРАФИК */}
      <div className="flex items-end gap-1.5 h-40 mb-8 px-2 border-b border-white/5 pb-2">
        {pulse.map((val, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${val}%` }}
            className={`flex-1 rounded-t-lg transition-colors duration-500 ${
              val > 75 ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 
              val > 50 ? 'bg-yellow-500' : 'bg-blue-600'
            }`}
          />
        ))}
      </div>

      {/* МЕТРИКИ */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-black/40 p-5 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-colors">
          <div className="flex items-center gap-2 text-zinc-500 mb-2">
            <Cpu size={14} />
            <span className="text-[8px] font-bold uppercase tracking-widest">Core_Load</span>
          </div>
          <p className="text-2xl font-black text-white italic">{pulse[pulse.length - 1]}%</p>
        </div>
        <div className="bg-black/40 p-5 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-colors">
          <div className="flex items-center gap-2 text-zinc-500 mb-2">
            <Zap size={14} />
            <span className="text-[8px] font-bold uppercase tracking-widest">Stability</span>
          </div>
          <p className="text-2xl font-black text-green-500 italic">99.9%</p>
        </div>
      </div>
    </div>
  );
};

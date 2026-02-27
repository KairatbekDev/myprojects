import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { analyticsEngine, SystemSnapshot } from '../services/AnalyticsService';
import { Activity, ShieldAlert, Cpu, BarChart } from 'lucide-react';

export const AnalyticsModule = () => {
  const [snapshot, setSnapshot] = useState<SystemSnapshot | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setSnapshot(analyticsEngine.generateSnapshot());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!snapshot) return <div className="text-zinc-500 animate-pulse font-mono">INITIALIZING_ENGINE...</div>;

  return (
    <div className="bg-zinc-900/40 border border-white/5 rounded-[3rem] p-10 backdrop-blur-2xl">
      <div className="flex justify-between items-start mb-12">
        <div>
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Neural_Pulse_Monitor</h2>
          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.5em] mt-2 italic">Deep Analysis active since boot _</p>
        </div>
        <div className={`px-6 py-2 rounded-2xl font-black italic text-xs shadow-lg transition-colors ${
          snapshot.threatLevel === 'CRITICAL' ? 'bg-red-600 text-white animate-bounce' : 
          snapshot.threatLevel === 'HIGH' ? 'bg-orange-500 text-white' : 'bg-blue-600 text-white'
        }`}>
          LEVEL: {snapshot.threatLevel}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <DataPoint label="Processor Load" val={`${snapshot.cpuUsage}%`} sub="4.2 GHz Turbo" />
        <DataPoint label="Memory Buffer" val={`${snapshot.memoryUsage} GB`} sub="DDR5-6400" />
        <DataPoint label="Active Nodes" val={snapshot.activeThreads.toString()} sub="Synced" />
        <DataPoint label="Latency" val={snapshot.networkLatency} sub="Stable" />
      </div>

      <div className="mt-12 p-6 bg-black/40 border border-white/5 rounded-[2rem] flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center">
               <Activity className="text-blue-500" />
            </div>
            <div>
               <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Real-time Stream</div>
               <div className="text-sm font-bold text-white italic">Aggregated_System_Metrics.log</div>
            </div>
         </div>
         <button className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Export Report</button>
      </div>
    </div>
  );
};

const DataPoint = ({ label, val, sub }: any) => (
  <div className="space-y-3">
    <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{label}</div>
    <div className="text-3xl font-black text-white italic tracking-tighter font-mono">{val}</div>
    <div className="text-[8px] font-bold text-blue-500/60 uppercase tracking-widest">{sub}</div>
  </div>
);

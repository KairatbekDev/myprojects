import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Share2, ShieldCheck, Zap, Globe, Activity } from 'lucide-react';

// Имитация большого объема данных для веса кода
const LOCATIONS = [
  { city: 'London', ip: '192.168.1.1', load: 45 },
  { city: 'New York', ip: '10.0.0.45', load: 82 },
  { city: 'Bishkek', ip: '172.16.254.1', load: 12 },
  { city: 'Singapore', ip: '142.250.190.46', load: 67 },
  { city: 'Frankfurt', ip: '8.8.8.8', load: 91 },
  { city: 'Moscow', ip: '95.161.22.10', load: 34 },
];

export const TrafficModule = () => {
  const [activePackets, setActivePackets] = useState<number>(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActivePackets(Math.floor(Math.random() * 9000) + 1000);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 bg-zinc-900/30 border border-white/5 rounded-[3rem] backdrop-blur-md">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
            <Share2 className="text-blue-600" size={24} />
            Traffic_Relay_System
          </h3>
          <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.4em] mt-1">Real-time packet inspection active</p>
        </div>
        <div className="text-right">
          <div className="text-blue-500 font-mono text-xl font-bold">{activePackets}</div>
          <div className="text-[8px] text-zinc-700 uppercase font-black">Packets/Sec</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {LOCATIONS.map((loc, i) => (
          <div key={i} className="group flex items-center gap-6 p-4 bg-black/40 border border-white/5 rounded-2xl hover:bg-blue-600/5 transition-all">
            <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
              <Globe size={18} className="text-zinc-500 group-hover:text-white" />
            </div>
            
            <div className="flex-1 grid grid-cols-3 gap-4 items-center">
              <div>
                <div className="text-[10px] font-black text-white uppercase italic">{loc.city}</div>
                <div className="text-[8px] font-mono text-zinc-600">{loc.ip}</div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${loc.load}%` }}
                    className={`h-full ${loc.load > 80 ? 'bg-red-500' : 'bg-blue-500'}`}
                  />
                </div>
                <span className="text-[9px] font-mono text-zinc-500">{loc.load}%</span>
              </div>

              <div className="text-right">
                <span className={`text-[8px] font-black px-2 py-1 rounded-md ${i % 2 === 0 ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                  {i % 2 === 0 ? 'STABLE' : 'ROUTING'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
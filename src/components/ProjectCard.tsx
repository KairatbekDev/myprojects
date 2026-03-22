import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Shield, Zap, Terminal, Activity, Globe, MessageSquare, Database } from 'lucide-react';

export const ProjectCard = ({ p, onClick }: any) => {
  const icons: any = { Shield, Zap, Terminal, Activity, Globe, MessageSquare, Database };
  const IconComponent = icons[p.icon] || Shield;

  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }} 
      onClick={() => onClick(p.id)}
      className="relative p-8 bg-zinc-900/20 border border-white/5 rounded-[2.5rem] group cursor-pointer hover:bg-zinc-900/40 transition-all shadow-2xl"
    >
      <div className="text-blue-500 mb-6 group-hover:scale-110 transition-transform">
        <IconComponent size={24} />
      </div>
      <h3 className="text-white font-black italic uppercase text-2xl tracking-tighter mb-1">{p.name}</h3>
      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{p.Tech}</p>
      <div className="mt-8 flex justify-between items-center opacity-30 group-hover:opacity-100 transition-opacity">
         <span className="text-[7px] font-bold uppercase tracking-widest flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> Node_Active
         </span>
         <ChevronRight size={16} />
      </div>
    </motion.div>
  );
};

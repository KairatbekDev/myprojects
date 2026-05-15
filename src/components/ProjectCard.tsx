import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Shield,
  Zap,
  Terminal,
  Activity,
  Globe,
  MessageSquare,
  Database,
  Info,
  X,
  Target,
  Cpu,
  TrendingUp,
  Lightbulb,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { Project } from '../types';

const ICON_MAP: Record<string, LucideIcon> = {
  Shield,
  Zap,
  Terminal,
  Terminal_Shell: Terminal,
  Activity,
  Globe,
  MessageSquare,
  Database,
};

interface StarField {
  label: string;
  abbr: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

function buildStar(p: Project): StarField[] {
  const fields: StarField[] = [];
  if (p.description)
    fields.push({
      label: 'Situation',
      abbr: 'S',
      value: p.description,
      icon: <Lightbulb size={10} />,
      color: 'text-blue-400',
    });
  if (p.challenge)
    fields.push({
      label: 'Task',
      abbr: 'T',
      value: p.challenge,
      icon: <Target size={10} />,
      color: 'text-yellow-400',
    });
  if (p.architecture)
    fields.push({
      label: 'Action',
      abbr: 'A',
      value: p.architecture,
      icon: <Cpu size={10} />,
      color: 'text-purple-400',
    });
  if (p.status)
    fields.push({
      label: 'Result',
      abbr: 'R',
      value: p.status,
      icon: <TrendingUp size={10} />,
      color: 'text-emerald-400',
    });
  return fields;
}

interface ProjectCardProps {
  p: Project;
  onClick: (id: number) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ p, onClick }) => {
  const [showStar, setShowStar] = useState(false);
  const IconComponent = ICON_MAP[p.icon] ?? Shield;
  const starFields = buildStar(p);
  const hasStar = starFields.length > 0;

  const handleStarToggle = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setShowStar((v) => !v);
  };

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.015 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => !showStar && onClick(p.id)}
      className="relative p-8 bg-zinc-900/20 border border-white/5 rounded-[2.5rem] group cursor-pointer hover:bg-zinc-900/40 transition-colors shadow-2xl overflow-hidden"
    >
      {/* Top accent line on hover */}
      <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start justify-between mb-4">
        <div className="text-blue-500 group-hover:scale-110 transition-transform">
          <IconComponent size={24} />
        </div>
        {hasStar && (
          <button
            onClickCapture={handleStarToggle}
            onTouchStartCapture={handleStarToggle}
            className={`p-1.5 rounded-lg transition-colors text-[8px] font-black uppercase tracking-widest flex items-center gap-1 ${
              showStar
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-white/5 text-zinc-600 hover:text-blue-400 hover:bg-blue-500/10 border border-transparent'
            }`}
          >
            {showStar ? <X size={10} /> : <Info size={10} />}
            <span>S.T.A.R</span>
          </button>
        )}
      </div>

      <h3 className="text-white font-black italic uppercase text-2xl tracking-tighter mb-1">
        {p.name}
      </h3>
      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{p.Tech}</p>

      <AnimatePresence mode="wait">
        {showStar ? (
          <motion.div
            key="star"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mt-4 pt-4 border-t border-white/5 overflow-hidden"
          >
            <div className="space-y-3">
              {starFields.map((field) => (
                <div key={field.abbr}>
                  <div className={`flex items-center gap-1.5 mb-0.5 ${field.color}`}>
                    {field.icon}
                    <span className="text-[8px] font-black uppercase tracking-[0.3em]">
                      [{field.abbr}] {field.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-relaxed pl-4">
                    {field.value}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-[8px] text-zinc-700 mt-3 italic">
              Tap S.T.A.R again to close · Tap card to open module
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {p.description && (
              <p className="text-[10px] text-zinc-500 mt-3 leading-relaxed line-clamp-2">
                {p.description}
              </p>
            )}
            {p.challenge && (
              <p className="text-[9px] text-blue-500/60 font-bold uppercase tracking-widest mt-2 truncate">
                ⚡ {p.challenge}
              </p>
            )}
            <div className="mt-8 flex justify-between items-center opacity-30 group-hover:opacity-100 transition-opacity">
              <span className="text-[7px] font-bold uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> Node_Active
              </span>
              <ChevronRight size={16} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

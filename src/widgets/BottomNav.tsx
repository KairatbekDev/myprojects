import React from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { LayoutDashboard, Terminal, Shield, Settings } from 'lucide-react';
import { TabId } from '../types';

interface NavItem {
  id: TabId;
  icon: React.ReactNode;
  label: string;
}

interface BottomNavProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

const menuItems: NavItem[] = [
  { id: 'dashboard', icon: <LayoutDashboard size={22} />, label: 'Dash' },
  { id: 'shell', icon: <Terminal size={22} />, label: 'Shell' },
  { id: 'security', icon: <Shield size={22} />, label: 'Sec' },
  { id: 'settings', icon: <Settings size={22} />, label: 'Sys' },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-lg h-20 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] z-50 flex items-center justify-around px-6 shadow-2xl">
      <LayoutGroup id="bottom-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className="relative flex flex-col items-center gap-1 group"
          >
            {activeTab === item.id && (
              <motion.div
                layoutId="navGlow"
                className="absolute -inset-3 bg-blue-600/10 border border-blue-500/20 rounded-2xl shadow-lg shadow-blue-500/10"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <div className={`${activeTab === item.id ? 'text-blue-500 scale-110' : 'text-zinc-600 group-hover:text-white'} transition-all relative z-10`}>
              {item.icon}
            </div>
            <span className={`text-[8px] font-black uppercase tracking-widest z-10 ${activeTab === item.id ? 'text-blue-400' : 'text-zinc-700'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </LayoutGroup>
    </nav>
  );
};

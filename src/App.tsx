import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { 
  LayoutDashboard, Shield, Zap, Search, Activity, Cpu, 
  Box, X, ChevronRight, Terminal, Bell, Settings, 
  ShoppingCart, MessageSquare, Globe, Command, 
  Database, HardDrive, Smartphone
} from 'lucide-react';

// === ИМПОРТ ВСЕХ ТВОИХ МОДУЛЕЙ ===
import { SecurityModule } from './modules/SecurityModule';
import { CryptoModule } from './modules/CryptoModule';
import { TerminalModule } from './modules/TerminalModule';
import { AnalyticsModule } from './modules/AnalyticsModule';
import { TrafficModule } from './modules/TrafficModule';
// Если в ProjectContent лежат AuthModule и ChatModule:
import { AuthModule, ChatModule } from './modules/ProjectContent';
import { BackendModule } from './modules/BackendModule';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(t);
  }, []);

  // Список проектов — теперь их 6, как ты и хотел
  const projects = [
    { id: 1, name: "Security_Core", tech: "Biometric / AES", icon: <Shield size={24}/> },
    { id: 2, name: "Crypto_Vault", tech: "Web3 / Ledger", icon: <Zap size={24}/> },
    { id: 3, name: "Terminal_Shell", tech: "Zsh / Root", icon: <Terminal size={24}/> },
    { id: 4, name: "Net_Analytics", tech: "Data / Logic", icon: <Activity size={24}/> },
    { id: 5, name: "Traffic_Control", tech: "Gateway / API", icon: <Globe size={24}/> },
    { id: 6, name: "Neural_Chat", tech: "AI / Message", icon: <MessageSquare size={24}/> },
    { id: 7, name: "Backend_Lab", tech: "API / Server / DB", icon: <Database size={24}/> }
  ];

  return (
    <div className="fixed inset-0 bg-[#020202] text-zinc-400 font-sans flex flex-col overflow-hidden selection:bg-blue-500/30">
      
      {/* Элитный фон с шумом и градиентом */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1a1a1a_0%,#020202_100%)] opacity-70" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* HEADER: Адаптив под мобилки и ПК */}
      <header className="px-4 py-4 md:px-10 md:py-8 flex justify-between items-center z-40 bg-black/20 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              <Command size={20} className="text-white" />
           </div>
           <h1 className="text-white font-black text-xl italic tracking-tighter uppercase hidden sm:block">Kairat.sys</h1>
        </div>
        
        <div className="flex-1 max-w-sm mx-4">
           <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5 focus-within:border-blue-500/40 transition-all">
              <Search size={16} className="text-zinc-600" />
              <input className="bg-transparent outline-none text-[10px] font-bold tracking-widest w-full text-white uppercase" placeholder="SCAN_NODES..." />
           </div>
        </div>

        <p className="text-blue-500 font-mono font-black text-sm md:text-xl">{time}</p>
      </header>

      {/* GRID: 1 колонка на мобилках, 2 на планшетах, 3 на ПК */}
      <main className="flex-1 overflow-y-auto relative z-10 p-6 md:p-12 pb-32 custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {projects.map((p) => (
              <motion.div 
                key={p.id} 
                whileHover={{ y: -8, scale: 1.02 }} 
                onClick={() => setSelectedProject(p.id)}
                className="relative p-8 bg-zinc-900/20 border border-white/5 rounded-[2.5rem] group cursor-pointer hover:bg-zinc-900/40 transition-all overflow-hidden shadow-2xl"
              >
                <div className="text-blue-500 mb-6 group-hover:scale-110 transition-transform">{p.icon}</div>
                <h3 className="text-white font-black italic uppercase text-2xl tracking-tighter mb-1">{p.name}</h3>
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{p.tech}</p>
                <div className="mt-8 flex justify-between items-center opacity-30 group-hover:opacity-100 transition-opacity">
                   <span className="text-[7px] font-bold uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> Node_Active
                   </span>
                   <ChevronRight size={16} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* BOTTOM DOCK: Хотбар как на iPhone */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-lg h-20 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] z-50 flex items-center justify-around px-6 shadow-2xl">
        <LayoutGroup id="bottom-nav">
          {[
            { id: 'dashboard', icon: <LayoutDashboard size={22}/>, label: 'Dash' },
            { id: 'shell', icon: <Terminal size={22}/>, label: 'Shell' },
            { id: 'security', icon: <Shield size={22}/>, label: 'Sec' },
            { id: 'settings', icon: <Settings size={22}/>, label: 'Sys' },
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className="relative flex flex-col items-center gap-1 group">
              {activeTab === item.id && (
                <motion.div layoutId="navGlow" className="absolute -inset-3 bg-blue-600/10 border border-blue-500/20 rounded-2xl shadow-lg shadow-blue-500/10" transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />
              )}
              <div className={`${activeTab === item.id ? 'text-blue-500 scale-110' : 'text-zinc-600 group-hover:text-white'} transition-all relative z-10`}>
                {item.icon}
              </div>
              <span className={`text-[8px] font-black uppercase tracking-widest z-10 ${activeTab === item.id ? 'text-blue-400' : 'text-zinc-700'}`}>{item.label}</span>
            </button>
          ))}
        </LayoutGroup>
      </nav>

      {/* PROJECT MANAGER: Тут подключаются ВСЕ файлы */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#050505] border border-white/10 w-full max-w-2xl rounded-[3.5rem] p-8 md:p-12 relative overflow-y-auto max-h-[90vh] custom-scrollbar shadow-[0_0_100px_rgba(0,0,0,1)]"
            >
              <button onClick={() => setSelectedProject(null)} className="absolute top-10 right-10 text-zinc-600 hover:text-white transition-transform hover:rotate-90">
                <X size={32}/>
              </button>

              <div className="mt-4">
                 {/* ЛОГИКА ОТОБРАЖЕНИЯ МОДУЛЕЙ */}
                 {selectedProject === 1 && <SecurityModule />}
                 {selectedProject === 2 && <CryptoModule />}
                 {selectedProject === 3 && <TerminalModule />}
                 {selectedProject === 4 && <AnalyticsModule />}
                 {selectedProject === 5 && <TrafficModule />}
                 {selectedProject === 6 && <ChatModule />}
                 {selectedProject === 7 && <BackendModule />}
                 
                 {/* Если ID не найден, покажем заглушку */}
                 {!projects.find(p => p.id === selectedProject) && (
                   <div className="text-center py-20 text-zinc-800 font-black italic uppercase tracking-widest">Node_Sync_Error</div>
                 )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

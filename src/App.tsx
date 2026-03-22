import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// === ИМПОРТ ВИДЖЕТОВ И КОМПОНЕНТОВ ===
import { Header } from './widgets/Header';
import { BottomNav } from './widgets/BottomNav';
import { ProjectCard } from './components/ProjectCard';

// === ИМПОРТ МОДУЛЕЙ ===
import { SecurityModule } from './modules/SecurityModule';
import { CryptoModule } from './modules/CryptoModule';
import { TerminalModule } from './modules/TerminalModule';
import { AnalyticsModule } from './modules/AnalyticsModule';
import { TrafficModule } from './modules/TrafficModule';
import { AuthModule } from './modules/AuthModule'; 
import { ChatModule } from './modules/ProjectContent'; 
import { BackendModule } from './modules/BackendModule';
import { PulseMonitorModule } from './modules/PulseMonitorModule';
import { SettingsModule } from './modules/SettingsModule';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [theme, setTheme] = useState('dark'); // 'dark' или 'light'
  
  // Загрузка проектов
  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase.from('Projects').select('*');
      if (data) setProjects(data);
    };
    fetchProjects();
  }, []);

  // Время
  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(t);
  }, []);

  // Аутентификация
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setIsAuthenticated(!!session);
      setUserEmail(session?.user?.email || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setIsAuthenticated(!!session);
      setUserEmail(session?.user?.email || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!isAuthenticated) return <AuthModule onLogin={() => setIsAuthenticated(true)} />;

  return (
    <div className="fixed inset-0 bg-[#020202] text-zinc-400 font-sans flex flex-col overflow-hidden selection:bg-blue-500/30">
      
      {/* Фон */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1a1a1a_0%,#020202_100%)] opacity-70" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* ВЫЗОВ ВИДЖЕТА ХЕДЕРА */}
      <Header userEmail={userEmail} time={time} />

      <main className="flex-1 overflow-y-auto relative z-10 p-6 md:p-12 pb-32 custom-scrollbar">
        <div className="max-w-7xl mx-auto h-full">
          <AnimatePresence mode="wait">
            
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10"
              >
          <div className="max-w-md mx-auto">
       <PulseMonitorModule />
    </div>
                
                {/* ВЫЗОВ КОМПОНЕНТА КАРТОЧКИ */}
                {projects.map((p) => (
                  <ProjectCard key={p.id} p={p} onClick={setSelectedProject} />
                ))}
              </motion.div>
            )}

            {activeTab === 'shell' && (
              <motion.div key="shell" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                <TerminalModule />
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div key="sec" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <SecurityModule />
              </motion.div>
            )}

            {activeTab === 'settings' && (
  <motion.div 
    key="set" 
    initial={{ opacity: 0, x: -20 }} 
    animate={{ opacity: 1, x: 0 }} 
    exit={{ opacity: 0, x: 20 }}
  >
    <SettingsModule 
      userEmail={userEmail} 
      currentTheme={theme} 
      onThemeChange={setTheme} 
    />
  </motion.div>
)}
            

          </AnimatePresence>
        </div>
      </main>
      
      {/* ВЫЗОВ ВИДЖЕТА НАВИГАЦИИ */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* MODAL PROJECT MANAGER */}
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
                 {selectedProject === 1 && <SecurityModule />}
                 {selectedProject === 2 && <CryptoModule />}
                 {selectedProject === 3 && <TerminalModule />}
                 {selectedProject === 4 && <AnalyticsModule />}
                 {selectedProject === 5 && <TrafficModule />}
                 {selectedProject === 6 && <ChatModule />}
                 {selectedProject === 7 && <BackendModule />}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
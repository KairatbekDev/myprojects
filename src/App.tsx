import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

import { useAuth } from './hooks/useAuth';
import { useProjects } from './hooks/useProjects';
import { useClock } from './hooks/useClock';
import { TabId } from './types';

import { Header } from './widgets/Header';
import { BottomNav } from './widgets/BottomNav';
import { ProjectCard } from './components/ProjectCard';
import { SkeletonCard } from './components/SkeletonCard';

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

const TAB_PAGE_VARIANTS = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export default function App() {
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const { projects, isLoading: projectsLoading } = useProjects();
  const time = useClock();

  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#020202] flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="text-blue-500 font-mono font-black text-sm uppercase tracking-[0.5em]"
        >
          Initializing...
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthModule onLogin={() => {}} />;
  }

  const userEmail = user?.email ?? null;

  return (
    <div className="fixed inset-0 bg-[#020202] text-zinc-400 font-sans flex flex-col overflow-hidden selection:bg-blue-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1a1a1a_0%,#020202_100%)] opacity-70 pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none grain-overlay" />

      <Header userEmail={userEmail} time={time} onSignOut={signOut} />

      <main className="flex-1 overflow-y-auto relative z-10 p-4 md:p-10 pb-32 custom-scrollbar">
        <div className="max-w-7xl mx-auto h-full">
          <AnimatePresence mode="wait">

            {activeTab === 'dashboard' && (
              <motion.div
                key="dash"
                variants={TAB_PAGE_VARIANTS}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
              >
                <div className="sm:col-span-2 lg:col-span-1">
                  <PulseMonitorModule />
                </div>

                {projectsLoading
                  ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                  : projects.map((p) => (
                      <ProjectCard key={p.id} p={p} onClick={setSelectedProject} />
                    ))
                }
              </motion.div>
            )}

            {activeTab === 'shell' && (
              <motion.div
                key="shell"
                variants={TAB_PAGE_VARIANTS}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="h-full"
              >
                <TerminalModule />
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="sec"
                variants={TAB_PAGE_VARIANTS}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.25 }}
              >
                <SecurityModule />
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="set"
                variants={TAB_PAGE_VARIANTS}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.25 }}
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

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <AnimatePresence>
        {selectedProject !== null && (
          <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="bg-[#050505] border border-white/10 w-full max-w-2xl rounded-[3.5rem] p-8 md:p-12 relative overflow-y-auto max-h-[90vh] custom-scrollbar shadow-[0_0_100px_rgba(0,0,0,1)]"
            >
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-8 right-8 text-zinc-600 hover:text-white transition-transform hover:rotate-90 duration-300"
              >
                <X size={28} />
              </button>

              <div className="mt-2">
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

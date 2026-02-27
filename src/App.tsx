import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Terminal as TerminalIcon, Shield, Settings, 
  Zap, Search, Activity, Cpu, Bell, Database, Lock, Eye, Wifi, 
  ChevronRight, Server, Globe, Box, Code2, ShoppingCart, MessageSquare, 
  HardDrive, X, Fingerprint, KeyRound 
} from 'lucide-react';

export default function App() {
  // --- СОСТОЯНИЯ (STATE) ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [isDeploying, setIsDeploying] = useState(false);
  
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalLines, setTerminalLines] = useState([
    '# KAIRAT_OS_V5 INITIALIZED...',
    '# READY FOR NEW DEPLOYMENTS',
    '# TYPE "HELP" TO START'
  ]);

  // Список проектов из твоего списка
  const [projects] = useState([
    { id: 1, name: "Auth_System", tech: "JWT / OAuth", load: "01", color: "text-blue-400", icon: <Lock size={20}/> },
    { id: 2, name: "Shop_Cart", tech: "Redux / Stripe", load: "02", color: "text-emerald-400", icon: <ShoppingCart size={20}/> },
    { id: 3, name: "Realtime_Chat", tech: "Socket.io", load: "03", color: "text-purple-400", icon: <MessageSquare size={20}/> },
    { id: 4, name: "Cloud_Storage", tech: "AWS S3 / Node", load: "04", color: "text-orange-400", icon: <HardDrive size={20}/> }
  ]);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = terminalInput.toLowerCase().trim();
    if (!input) return;
    let res = `# ERROR: UNKNOWN_CMD`;
    if (input === 'help') res = 'CMDS: STATUS, SCAN, PROJECTS, CLEAR';
    if (input === 'status') res = 'SYSTEM OK. ALL NODES ENCRYPTED.';
    if (input === 'clear') { setTerminalLines([]); setTerminalInput(''); return; }
    setTerminalLines(prev => [...prev, `> ${terminalInput}`, res]);
    setTerminalInput('');
  };

  const startDeploy = () => {
    setIsDeploying(true);
    setActiveTab('terminal');
    setTerminalLines(prev => [...prev, '>>> INITIALIZING GLOBAL DEPLOY...', '>>> PACKING MODULES...', '>>> SYNCING WITH CLOUD...']);
    setTimeout(() => {
      setTerminalLines(prev => [...prev, '>>> DEPLOY SUCCESSFUL. SYSTEM LIVE.']);
      setIsDeploying(false);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 bg-[#050505] text-slate-300 font-sans flex overflow-hidden selection:bg-blue-500/30">
      
      {/* SIDEBAR */}
      <aside className="w-20 lg:w-64 bg-zinc-950 border-r border-white/5 flex flex-col shrink-0 z-50">
        <div className="p-4 lg:p-8 border-b border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <Zap size={20} fill="white" className="text-white" />
          </div>
          <span className="hidden lg:block font-black text-xl italic text-white uppercase tracking-tighter">KAIRAT.DEV</span>
        </div>
        <nav className="flex-1 p-3 lg:p-4 space-y-2 mt-6">
          <NavBtn active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20} />} label="Portfolio" />
          <NavBtn active={activeTab === 'terminal'} onClick={() => setActiveTab('terminal')} icon={<TerminalIcon size={20} />} label="Engine" />
          <NavBtn active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={<Shield size={20} />} label="Security" />
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 h-screen overflow-y-auto bg-black relative custom-scrollbar">
        <header className="p-4 lg:p-6 border-b border-white/5 flex justify-between items-center bg-black/40 backdrop-blur-xl sticky top-0 z-40">
          <div className="flex items-center gap-4 bg-zinc-900/50 px-4 py-2 rounded-2xl border border-white/5 w-full max-w-[400px]">
            <Search size={16} className="text-zinc-600" />
            <input className="bg-transparent outline-none text-[10px] font-bold tracking-[0.2em] w-full text-white uppercase" placeholder="SEARCH SYSTEM..." />
          </div>
          <div className="font-mono text-blue-500 font-bold text-sm ml-4">{time}</div>
        </header>

        <div className="p-6 lg:p-10 max-w-7xl mx-auto pb-24">
          <AnimatePresence mode="wait">
            
            {activeTab === 'dashboard' && (
              <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <MiniStat label="Active Apps" val="04" icon={<Box size={14}/>} />
                   <MiniStat label="Security" val="MAX" icon={<Shield size={14}/>} />
                   <MiniStat label="Load" val="1.2k" icon={<Zap size={14}/>} />
                   <MiniStat label="Uptime" val="100%" icon={<Activity size={14}/>} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   <div className="lg:col-span-2 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {projects.map((p) => (
                           <motion.div 
                             key={p.id} 
                             onClick={() => setSelectedProject(p.id)}
                             whileHover={{ scale: 1.02 }}
                             whileTap={{ scale: 0.98 }}
                             className="bg-zinc-900/40 border border-white/5 p-6 rounded-[2rem] hover:border-blue-500/30 transition-all group cursor-pointer"
                           >
                              <div className={`${p.color} mb-4 group-hover:scale-110 transition-transform`}>{p.icon}</div>
                              <h4 className="text-white font-black uppercase text-lg italic">{p.name}</h4>
                              <p className="text-[10px] text-zinc-500 mt-2 font-bold uppercase tracking-widest">{p.tech} // ID: {p.load}</p>
                           </motion.div>
                         ))}
                      </div>
                      
                      <Card title="Traffic Pulse" icon={<Activity size={14}/>}>
                        <div className="h-32 flex items-end gap-1 overflow-hidden">
                          {[40, 70, 45, 90, 65, 30, 85, 40, 60, 20, 95, 50, 60, 40, 75].map((h, i) => (
                            <motion.div key={i} animate={{ height: [`${h}%`, `${h-20}%`, `${h}%`] }} transition={{ repeat: Infinity, duration: 2, delay: i*0.1 }} className="flex-1 bg-blue-500/20 rounded-t-sm border-t border-blue-500/40" />
                          ))}
                        </div>
                      </Card>
                   </div>

                   <div className="space-y-6">
                      <Card title="Resource Usage" icon={<Cpu size={14}/>}>
                        <div className="space-y-4">
                          <Stat label="Backend" val="42%" color="bg-blue-600" />
                          <Stat label="Database" val="68%" color="bg-indigo-600" />
                        </div>
                      </Card>

                      <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
                         <Server size={100} className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform" />
                         <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Project Manager</p>
                         <h4 className="text-2xl font-black italic mt-1">PUSH TO PROD</h4>
                         <button 
                            disabled={isDeploying}
                            onClick={startDeploy}
                            className={`mt-6 bg-white text-blue-600 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all ${isDeploying ? 'opacity-50' : 'scale-100'}`}
                         >
                            {isDeploying ? 'Deploying...' : 'Launch Now'}
                         </button>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'terminal' && (
              <motion.div key="term" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#080808] border border-blue-500/20 rounded-3xl h-[600px] flex flex-col overflow-hidden shadow-2xl relative">
                 <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%] pointer-events-none" />
                 <div className="bg-zinc-900/80 p-4 border-b border-white/5 flex justify-between items-center relative z-20">
                    <span className="font-mono text-[9px] text-blue-500 uppercase tracking-widest font-black italic">Neural_Shell_v5.0</span>
                 </div>
                 <div className="flex-1 p-6 font-mono text-sm overflow-y-auto space-y-1 relative z-10">
                    {terminalLines.map((line, i) => (
                      <p key={i} className={line.startsWith('>') ? "text-blue-400 font-bold" : line.startsWith('>>>') ? "text-yellow-400 italic" : "text-emerald-500/80"}>
                        {line}
                      </p>
                    ))}
                    <form onSubmit={handleTerminalSubmit} className="flex gap-2 pt-2">
                       <span className="text-blue-500 font-bold animate-pulse">{'>'}</span>
                       <input value={terminalInput} onChange={(e) => setTerminalInput(e.target.value)} className="bg-transparent outline-none w-full text-white caret-blue-500" autoFocus />
                    </form>
                 </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* --- МОДАЛЬНЫЕ ОКНА ПРОЕКТОВ --- */}
        <AnimatePresence>
          {/* ПРОЕКТ 01: AUTH SYSTEM */}
          {selectedProject === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-zinc-900 border border-white/10 w-full max-w-md rounded-[3rem] p-10 relative">
                <button onClick={() => setSelectedProject(null)} className="absolute top-8 right-8 text-zinc-500 hover:text-white"><X size={24} /></button>
                <div className="text-center mb-10">
                   <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/30"><Fingerprint size={32} className="text-blue-500" /></div>
                   <h2 className="text-white font-black text-2xl uppercase italic tracking-tighter">Secure Access</h2>
                   <p className="text-[10px] text-zinc-500 font-bold uppercase mt-2 tracking-widest">Project_01: Auth_Module</p>
                </div>
                <div className="space-y-4">
                   <div className="bg-black/50 border border-white/5 p-4 rounded-2xl flex items-center gap-4"><Search size={18} className="text-zinc-600" /><input className="bg-transparent outline-none w-full text-sm font-bold uppercase" placeholder="USERNAME" /></div>
                   <div className="bg-black/50 border border-white/5 p-4 rounded-2xl flex items-center gap-4"><KeyRound size={18} className="text-zinc-600" /><input type="password" className="bg-transparent outline-none w-full text-sm font-bold uppercase" placeholder="PASSWORD" /></div>
                   <button className="w-full bg-blue-600 py-4 rounded-2xl text-white font-black uppercase text-xs tracking-[0.3em]">Initialize Link</button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ПРОЕКТ 02: SHOP CART */}
          {selectedProject === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-zinc-950 border border-emerald-500/20 w-full max-w-lg rounded-[2.5rem] p-8 relative overflow-hidden">
                <button onClick={() => setSelectedProject(null)} className="absolute top-6 right-6 text-zinc-500 hover:text-white"><X size={24} /></button>
                <div className="flex items-center gap-4 mb-8">
                   <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-500"><ShoppingCart size={24} /></div>
                   <div><h3 className="text-white font-black uppercase italic tracking-tighter text-xl">Nexus Checkout</h3><p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Project_02 // Secure_Order</p></div>
                </div>
                <div className="space-y-3 mb-8">
                   <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex gap-4 items-center">
                         <div className="w-10 h-10 bg-zinc-800 rounded-lg animate-pulse" />
                         <div><p className="text-[10px] text-white font-bold uppercase">Neural_Link_v1</p><p className="text-[8px] text-zinc-500 font-bold uppercase">Qty: 1</p></div>
                      </div>
                      <span className="text-emerald-400 font-mono text-sm font-bold">$499.00</span>
                   </div>
                </div>
                <button className="w-full bg-emerald-600 py-4 rounded-2xl text-white font-black uppercase text-xs tracking-[0.2em]">Complete Payment</button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
          {/* ПРОЕКТ 03: REALTIME CHAT */}
          {selectedProject === 3 && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} 
                className="bg-zinc-900 border border-purple-500/20 w-full max-w-lg h-[600px] rounded-[3rem] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.15)]"
              >
                {/* Header */}
                <div className="p-6 border-b border-white/5 bg-purple-500/5 flex justify-between items-center">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-600/20 rounded-full flex items-center justify-center text-purple-400 border border-purple-500/30">
                         <MessageSquare size={20} />
                      </div>
                      <div>
                         <h3 className="text-white font-black uppercase italic tracking-tighter">Neural_Chat</h3>
                         <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Global_Node_01</span>
                         </div>
                      </div>
                   </div>
                   <button onClick={() => setSelectedProject(null)} className="text-zinc-500 hover:text-white transition-colors">
                      <X size={24} />
                   </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar bg-black/20">
                   <div className="flex flex-col gap-1 max-w-[80%]">
                      <span className="text-[8px] text-purple-400 font-bold uppercase px-2">System_Bot</span>
                      <div className="bg-zinc-800/50 p-4 rounded-3xl rounded-tl-none border border-white/5 text-sm">
                         Welcome to the encrypted channel. All messages are end-to-end encrypted.
                      </div>
                   </div>
                   
                   <div className="flex flex-col gap-1 max-w-[80%] ml-auto items-end">
                      <span className="text-[8px] text-zinc-500 font-bold uppercase px-2">You (Kairat)</span>
                      <div className="bg-purple-600 p-4 rounded-3xl rounded-tr-none text-white text-sm shadow-lg shadow-purple-900/20">
                         Is the connection secure?
                      </div>
                   </div>
                </div>

                {/* Input Area */}
                <div className="p-6 bg-zinc-950/50 border-t border-white/5">
                   <div className="bg-black border border-white/5 rounded-2xl p-2 flex items-center gap-2 focus-within:border-purple-500/50 transition-all">
                      <input 
                        className="bg-transparent flex-1 outline-none p-2 text-sm text-white placeholder:text-zinc-700 font-bold uppercase" 
                        placeholder="Type encrypted message..."
                      />
                      <button className="bg-purple-600 hover:bg-purple-500 p-3 rounded-xl text-white transition-all shadow-lg">
                         <Send size={18} />
                      </button>
                   </div>
                </div>
              </motion.div>
            </motion.div>
          )}
                {/* ПРОЕКТ 04: CLOUD STORAGE */}
          {selectedProject === 4 && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, rotateX: 20 }} animate={{ scale: 1, rotateX: 0 }} 
                className="bg-zinc-900 border border-orange-500/20 w-full max-w-lg rounded-[3rem] p-8 relative overflow-hidden shadow-[0_0_50px_rgba(249,115,22,0.1)]"
              >
                {/* Header */}
                <button onClick={() => setSelectedProject(null)} className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors">
                   <X size={24} />
                </button>

                <div className="flex items-center gap-4 mb-10">
                   <div className="p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20 text-orange-500">
                      <HardDrive size={28} />
                   </div>
                   <div>
                      <h3 className="text-white font-black uppercase italic tracking-tighter text-xl">Cloud_Vault</h3>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest text-orange-500/60">Project_04 // AWS_S3_Linked</p>
                   </div>
                </div>

                {/* Drop Zone */}
                <div className="border-2 border-dashed border-white/5 rounded-[2rem] p-12 text-center group hover:border-orange-500/40 transition-all cursor-pointer bg-white/[0.02]">
                   <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Box size={24} className="text-zinc-500 group-hover:text-orange-500" />
                   </div>
                   <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em]">Drag & Drop Assets</p>
                   <p className="text-[8px] text-zinc-600 font-bold uppercase mt-2">Max size: 512MB</p>
                </div>

                {/* Recent Uploads */}
                <div className="mt-8 space-y-3">
                   <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3">
                         <Code2 size={16} className="text-orange-500" />
                         <span className="text-[10px] text-white font-bold uppercase tracking-widest">system_core.bin</span>
                      </div>
                      <div className="w-24 h-1 bg-zinc-800 rounded-full overflow-hidden">
                         <motion.div initial={{ width: 0 }} animate={{ width: '75%' }} className="h-full bg-orange-500" />
                      </div>
                   </div>
                </div>

                <button className="w-full mt-8 bg-orange-600 hover:bg-orange-500 py-4 rounded-2xl text-white font-black uppercase text-xs tracking-[0.3em] transition-all">
                   Sync With Cloud
                </button>
              </motion.div>
            </motion.div>
          )}
          
      </main>
    </div>
  );
}

// Вспомогательные компоненты
function NavBtn({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all relative group ${active ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
      <div className={`${active ? 'scale-110' : 'group-hover:text-blue-400'} transition-transform`}>{icon}</div>
      <span className="hidden lg:block text-[10px] font-black uppercase tracking-widest italic">{label}</span>
      {active && <motion.div layoutId="glow" className="absolute inset-0 bg-white/10 rounded-2xl" />}
    </button>
  );
}

function MiniStat({ label, val, icon }: any) {
  return (
    <div className="bg-zinc-900/40 border border-white/5 p-4 rounded-2xl text-center">
       <div className="text-blue-500 flex justify-center mb-1">{icon}</div>
       <p className="text-[8px] text-zinc-600 uppercase tracking-widest font-black">{label}</p>
       <p className="text-white font-black italic">{val}</p>
    </div>
  );
}

function Card({ title, icon, children }: any) {
  return (
    <div className="bg-zinc-950/50 border border-white/5 p-6 rounded-3xl shadow-xl">
      <div className="flex items-center gap-2 mb-4 text-[10px] text-zinc-500 uppercase font-black tracking-widest italic">{icon} {title}</div>
      {children}
    </div>
  );
}

function Stat({ label, val, color }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[9px] uppercase font-black"><span className="text-zinc-600">{label}</span><span className="text-white font-mono">{val}</span></div>
      <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: val }} className={`h-full ${color}`} />
      </div>
    </div>
  );
}

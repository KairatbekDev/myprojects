import React, { useState, useRef, useEffect } from 'react';
import { useStore, useSystemActions } from '../store/useStore';

export const TerminalModule = () => {
  const [input, setInput] = useState('');
  const logs = useStore((s) => s.terminalLogs);
  const isExploiting = useStore((s) => s.isExploiting);
  const { addLog, setExploit, clearTerminal } = useSystemActions();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Исправляем баг скролла: теперь он плавный и точный
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [logs]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    if (!cmd) return;

    addLog(`RUN_CMD: ${cmd}`);

    // Профессиональная обработка команд через Switch
    switch(cmd) {
      case 'help':
        addLog('AVAIL: EXPLOIT_ON, EXPLOIT_OFF, CLEAR, STATUS');
        break;
      case 'exploit_on':
        setExploit(true);
        addLog('WARNING: SECURITY_OVERRIDE_ACTIVE');
        break;
      case 'exploit_off':
        setExploit(false);
        addLog('SUCCESS: SYSTEM_STABILIZED');
        break;
      case 'clear':
        clearTerminal();
        break;
      default:
        addLog(`ERR: COMMAND_NOT_FOUND "${cmd}"`);
    }
    setInput('');
  };

  return (
    <div className={`h-[450px] flex flex-col p-6 rounded-[2rem] border transition-all duration-500 backdrop-blur-xl ${
      isExploiting ? 'border-red-500/50 bg-red-950/10' : 'border-white/5 bg-zinc-900/20'
    }`}>
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1 mb-4 font-mono text-[11px] custom-scrollbar">
        {logs.map((log, i) => (
          <div key={i} className={log.includes('ERR') || log.includes('WARNING') ? 'text-red-400' : 'text-blue-400/70'}>
            <span className="opacity-30 mr-2 font-bold">#</span>{log}
          </div>
        ))}
      </div>
      
      <form onSubmit={handleCommand} className="flex gap-3 border-t border-white/5 pt-4">
        <span className={`${isExploiting ? 'text-red-500' : 'text-blue-500'} font-black italic`}>$root:</span>
        <input 
          className="bg-transparent outline-none flex-1 text-white placeholder:text-zinc-800"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ENTER_CMD_"
          autoFocus
        />
      </form>
    </div>
  );
};

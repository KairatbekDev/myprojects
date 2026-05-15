import React, { useState, useRef, useEffect } from 'react';
import { useStore, useSystemActions } from '../store/useStore';
import { supabase } from '../supabaseClient';
import { AccessLog } from '../types';
import { useToast } from '../hooks/useToast';

const HELP_TEXT = [
  'AVAILABLE COMMANDS:',
  '  help          — show this menu',
  '  logs          — fetch last 10 access logs from db',
  '  status        — count events by type from db',
  '  whoami        — show current operator info',
  '  exploit_on    — activate security override',
  '  exploit_off   — stabilize system',
  '  clear         — clear terminal buffer',
];

export const TerminalModule: React.FC = () => {
  const [input, setInput] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const logs = useStore((s) => s.terminalLogs);
  const isExploiting = useStore((s) => s.isExploiting);
  const { addLog, setExploit, clearTerminal } = useSystemActions();
  const scrollRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [logs]);

  const fetchLogs = async () => {
    setIsFetching(true);
    addLog('QUERY: SELECT * FROM access_logs ORDER BY created_at DESC LIMIT 10');
    const { data, error } = await supabase
      .from('access_logs')
      .select('event_type, message, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      if (error.message.includes('does not exist') || error.code === '42P01') {
        addLog('ERR: Table access_logs not found — run setup SQL (see chat)');
        toast.error('Table access_logs missing — check chat for DDL');
      } else {
        addLog(`ERR: ${error.message}`);
        toast.error(error.message);
      }
    } else if (!data || data.length === 0) {
      addLog('INFO: No log entries found in access_logs');
    } else {
      data.forEach((row: Pick<AccessLog, 'event_type' | 'message' | 'created_at'>) => {
        const ts = new Date(row.created_at).toLocaleTimeString();
        addLog(`[${ts}] [${row.event_type}] ${row.message}`);
      });
      toast.success(`Loaded ${data.length} log entries`);
    }
    setIsFetching(false);
  };

  const fetchStatus = async () => {
    setIsFetching(true);
    addLog('QUERY: SELECT event_type, COUNT(*) FROM access_logs GROUP BY event_type');
    const { data, error } = await supabase
      .from('access_logs')
      .select('event_type');

    if (error) {
      if (error.message.includes('does not exist') || error.code === '42P01') {
        addLog('ERR: Table access_logs not found — run setup SQL (see chat)');
        toast.error('Table access_logs missing — check chat for DDL');
      } else {
        addLog(`ERR: ${error.message}`);
      }
    } else if (!data || data.length === 0) {
      addLog('STATUS: No events recorded yet');
    } else {
      const counts: Record<string, number> = {};
      data.forEach((r: { event_type: string }) => {
        counts[r.event_type] = (counts[r.event_type] ?? 0) + 1;
      });
      addLog(`STATUS: Total events — ${data.length}`);
      Object.entries(counts).forEach(([type, count]) => {
        addLog(`  ${type.padEnd(10)} ${count} events`);
      });
      toast.info(`Status loaded — ${data.length} total events`);
    }
    setIsFetching(false);
  };

  const fetchWhoAmI = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      addLog(`OPERATOR: ${user.email}`);
      addLog(`UID:      ${user.id}`);
      addLog(`CREATED:  ${new Date(user.created_at).toLocaleDateString()}`);
      addLog(`PROVIDER: ${user.app_metadata?.provider ?? 'email'}`);
    } else {
      addLog('ERR: No active session found');
    }
  };

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    if (!cmd || isFetching) return;
    setInput('');

    addLog(`$ ${cmd}`);

    switch (cmd) {
      case 'help':
        HELP_TEXT.forEach((line) => addLog(line));
        break;
      case 'logs':
        await fetchLogs();
        break;
      case 'status':
        await fetchStatus();
        break;
      case 'whoami':
        await fetchWhoAmI();
        break;
      case 'exploit_on':
        setExploit(true);
        addLog('WARNING: SECURITY_OVERRIDE_ACTIVE');
        toast.warn('Security override engaged');
        break;
      case 'exploit_off':
        setExploit(false);
        addLog('SUCCESS: SYSTEM_STABILIZED');
        toast.success('System stabilized');
        break;
      case 'clear':
        clearTerminal();
        break;
      default:
        addLog(`ERR: Command not found — "${cmd}". Type help for available commands.`);
    }
  };

  return (
    <div
      className={`h-[480px] flex flex-col p-5 md:p-6 rounded-[2rem] border transition-all duration-500 backdrop-blur-xl ${
        isExploiting ? 'border-red-500/50 bg-red-950/10' : 'border-white/5 bg-zinc-900/20'
      }`}
    >
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/5">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
        </div>
        <span className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-600">
          {isFetching ? 'FETCHING...' : 'KAIRAT_SHELL_v5'}
        </span>
        <div className={`w-2 h-2 rounded-full ${isFetching ? 'bg-yellow-500 animate-pulse' : 'bg-emerald-500'}`} />
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-0.5 mb-4 font-mono text-[11px] custom-scrollbar">
        {logs.map((log, i) => (
          <div
            key={i}
            className={
              log.startsWith('ERR') || log.includes('WARNING')
                ? 'text-red-400'
                : log.startsWith('SUCCESS') || log.startsWith('INFO:')
                ? 'text-emerald-400/80'
                : log.startsWith('$')
                ? 'text-white font-bold'
                : log.startsWith('QUERY')
                ? 'text-yellow-400/70'
                : 'text-blue-400/70'
            }
          >
            {log}
          </div>
        ))}
        {isFetching && (
          <div className="text-yellow-400/70 animate-pulse">Querying database...</div>
        )}
      </div>

      <form onSubmit={handleCommand} className="flex gap-3 border-t border-white/5 pt-3">
        <span className={`${isExploiting ? 'text-red-500' : 'text-blue-500'} font-black italic flex-shrink-0`}>
          $root:
        </span>
        <input
          className="bg-transparent outline-none flex-1 text-white placeholder:text-zinc-800 font-mono text-sm min-w-0"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isFetching ? 'waiting...' : 'type a command_'}
          disabled={isFetching}
          autoFocus
        />
      </form>
    </div>
  );
};

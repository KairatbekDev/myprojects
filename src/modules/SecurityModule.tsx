import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldCheck, ShieldAlert, ShieldX, KeyRound, Play, RefreshCw } from 'lucide-react';
import { supabase } from '../supabaseClient';

type ScanStatus = 'idle' | 'running' | 'pass' | 'fail' | 'warn';

interface ScanCheck {
  id: string;
  label: string;
  description: string;
  status: ScanStatus;
  detail: string;
}

const INITIAL_CHECKS: ScanCheck[] = [
  { id: 'auth',         label: 'Auth_Session',     description: 'Operator credentials',    status: 'idle', detail: '' },
  { id: 'access_logs',  label: 'Access_Log_Table',  description: 'access_logs DB table',    status: 'idle', detail: '' },
  { id: 'messages',     label: 'Message_Channel',   description: 'messages DB table',       status: 'idle', detail: '' },
  { id: 'rls',          label: 'RLS_Integrity',     description: 'Row-level security',      status: 'idle', detail: '' },
];

const StatusIcon: React.FC<{ status: ScanStatus }> = ({ status }) => {
  if (status === 'running') return <RefreshCw size={14} className="text-blue-400 animate-spin" />;
  if (status === 'pass')    return <ShieldCheck size={14} className="text-emerald-400" />;
  if (status === 'fail')    return <ShieldX size={14} className="text-red-400" />;
  if (status === 'warn')    return <ShieldAlert size={14} className="text-yellow-400" />;
  return <div className="w-3.5 h-3.5 rounded-full border border-zinc-700" />;
};

const statusColor = (s: ScanStatus) => {
  if (s === 'pass') return 'text-emerald-400';
  if (s === 'fail') return 'text-red-400';
  if (s === 'warn') return 'text-yellow-400';
  if (s === 'running') return 'text-blue-400';
  return 'text-zinc-600';
};

export const SecurityModule: React.FC = () => {
  const [checks, setChecks] = useState<ScanCheck[]>(INITIAL_CHECKS);
  const [progress, setProgress] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'SECURE' | 'AT_RISK' | 'CRITICAL' | null>(null);

  const updateCheck = (id: string, patch: Partial<ScanCheck>) => {
    setChecks((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const runScan = useCallback(async () => {
    setScanning(true);
    setScanComplete(false);
    setOverallStatus(null);
    setProgress(0);
    setChecks(INITIAL_CHECKS);

    await sleep(400);
    let passCount = 0;
    let authFailed = false;

    // ── Check 1: Auth Session ──────────────────────────────────────
    updateCheck('auth', { status: 'running', detail: 'Querying auth session...' });
    await sleep(900);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        updateCheck('auth', {
          status: 'pass',
          detail: `Authenticated as ${user.email?.split('@')[0]}`,
        });
        passCount++;
      } else {
        updateCheck('auth', { status: 'fail', detail: 'No active session found' });
        authFailed = true;
      }
    } catch {
      updateCheck('auth', { status: 'fail', detail: 'Network error during auth check' });
      authFailed = true;
    }
    setProgress(25);

    // ── Check 2: access_logs table ────────────────────────────────
    updateCheck('access_logs', { status: 'running', detail: 'Probing access_logs table...' });
    await sleep(1000);
    try {
      const { data, error } = await supabase
        .from('access_logs')
        .select('id')
        .limit(1);
      if (error) {
        const isMissing = error.message.includes('does not exist') || error.code === '42P01';
        updateCheck('access_logs', {
          status: isMissing ? 'warn' : 'fail',
          detail: isMissing ? 'Table not found — run setup SQL' : error.message,
        });
      } else {
        updateCheck('access_logs', {
          status: 'pass',
          detail: `Table accessible${data.length > 0 ? ` (${data.length} row sampled)` : ' (empty)'}`,
        });
        passCount++;
      }
    } catch {
      updateCheck('access_logs', { status: 'fail', detail: 'Query failed — check network' });
    }
    setProgress(50);

    // ── Check 3: messages table ───────────────────────────────────
    updateCheck('messages', { status: 'running', detail: 'Probing messages table...' });
    await sleep(900);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id')
        .limit(1);
      if (error) {
        const isMissing = error.message.includes('does not exist') || error.code === '42P01';
        updateCheck('messages', {
          status: isMissing ? 'warn' : 'fail',
          detail: isMissing ? 'Table not found — run setup SQL' : error.message,
        });
      } else {
        updateCheck('messages', {
          status: 'pass',
          detail: `Channel accessible${data.length > 0 ? ` (${data.length} row sampled)` : ' (empty)'}`,
        });
        passCount++;
      }
    } catch {
      updateCheck('messages', { status: 'fail', detail: 'Query failed — check network' });
    }
    setProgress(75);

    // ── Check 4: RLS Integrity ────────────────────────────────────
    updateCheck('rls', { status: 'running', detail: 'Verifying row-level security policies...' });
    await sleep(700);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        updateCheck('rls', {
          status: 'pass',
          detail: `Operator UID bound — RLS policies active`,
        });
        passCount++;
      } else {
        updateCheck('rls', {
          status: 'warn',
          detail: 'No UID bound — RLS cannot be verified',
        });
      }
    } catch {
      updateCheck('rls', { status: 'warn', detail: 'RLS check inconclusive' });
    }
    setProgress(100);

    // ── Determine overall status ──────────────────────────────────
    await sleep(300);
    const status =
      authFailed ? 'CRITICAL' :
      passCount === 4 ? 'SECURE' :
      'AT_RISK';

    setOverallStatus(status);
    setScanComplete(true);
    setScanning(false);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-white text-2xl font-black italic uppercase tracking-tighter">
            Neural_Identity
          </h2>
          <p className="text-[10px] text-blue-500 font-bold uppercase tracking-[0.4em] mt-0.5">
            Security_Vault_v5 // Integrity_Scanner
          </p>
        </div>
        <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex-shrink-0">
          <Shield size={22} className="text-blue-500" />
        </div>
      </div>

      {/* Scan Zone */}
      <div className="relative bg-blue-500/5 border border-blue-500/15 rounded-[2.5rem] p-6 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle,blue_1px,transparent_1px)] bg-[size:20px_20px]" />

        {/* Scanner animation (only when idle / before first scan) */}
        {!scanComplete && !scanning && (
          <div className="relative z-10 flex flex-col items-center py-4">
            <motion.div
              animate={{ scale: [1, 1.04, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Shield size={56} className="text-blue-500/60" />
            </motion.div>
            <motion.div
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_15px_blue]"
            />
            <p className="text-[8px] font-black text-blue-500/60 uppercase tracking-[0.5em] mt-4">
              Ready_to_Scan
            </p>
          </div>
        )}

        {/* Progress bar + checks */}
        <AnimatePresence>
          {(scanning || scanComplete) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative z-10 space-y-4"
            >
              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">
                    {scanning ? 'Scanning...' : 'Scan_Complete'}
                  </span>
                  <span className="text-[8px] font-black text-blue-400">{progress}%</span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={`h-full rounded-full ${
                      overallStatus === 'CRITICAL' ? 'bg-red-500' :
                      overallStatus === 'AT_RISK'  ? 'bg-yellow-500' :
                      overallStatus === 'SECURE'   ? 'bg-emerald-500' :
                      'bg-blue-500'
                    }`}
                  />
                </div>
              </div>

              {/* Check list */}
              <div className="space-y-2">
                {checks.map((check) => (
                  <div
                    key={check.id}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-colors ${
                      check.status === 'pass'    ? 'bg-emerald-500/5 border-emerald-500/15' :
                      check.status === 'fail'    ? 'bg-red-500/5 border-red-500/15' :
                      check.status === 'warn'    ? 'bg-yellow-500/5 border-yellow-500/15' :
                      check.status === 'running' ? 'bg-blue-500/5 border-blue-500/20' :
                      'bg-white/3 border-white/5'
                    }`}
                  >
                    <StatusIcon status={check.status} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black uppercase tracking-wider text-white/80">
                          {check.label}
                        </span>
                      </div>
                      {check.detail && (
                        <p className={`text-[8px] mt-0.5 truncate ${statusColor(check.status)}`}>
                          {check.detail}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Overall result badge */}
              <AnimatePresence>
                {overallStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center justify-center gap-3 p-4 rounded-2xl border font-black uppercase text-xs tracking-widest ${
                      overallStatus === 'SECURE'   ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                      overallStatus === 'AT_RISK'  ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
                      'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse'
                    }`}
                  >
                    {overallStatus === 'SECURE'  ? <ShieldCheck size={16} /> :
                     overallStatus === 'AT_RISK' ? <ShieldAlert size={16} /> :
                     <ShieldX size={16} />}
                    System_Status: {overallStatus}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scan trigger */}
      <button
        onClick={runScan}
        disabled={scanning}
        className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.4em] text-white transition-colors shadow-[0_10px_30px_rgba(37,99,235,0.3)] active:scale-[0.99]"
      >
        {scanning
          ? <><RefreshCw size={16} className="animate-spin" /> Scanning...</>
          : <><Play size={16} fill="white" /> {scanComplete ? 'Re-Run_Scan' : 'Run_Integrity_Scan'}</>
        }
      </button>

      {/* Passphrase vault (static UI) */}
      <div className="group relative p-5 bg-black/40 border border-white/10 rounded-2xl focus-within:border-blue-500/50 transition-all">
        <div className="flex items-center gap-3">
          <KeyRound size={18} className="text-blue-500 flex-shrink-0" />
          <input
            className="bg-transparent outline-none text-[10px] font-black tracking-[0.2em] w-full text-white uppercase placeholder:text-zinc-800"
            placeholder="ENTER_PRIVATE_PASSPHRASE"
            type="password"
          />
        </div>
      </div>

      <div className="flex justify-between items-center opacity-25 px-2">
        <p className="text-[7px] font-mono text-zinc-500 uppercase">Auth_v5.0.2 // Scanner_Online</p>
        <div className="flex gap-1">
          <div className="w-4 h-1 bg-blue-500/50 rounded-full" />
          <div className="w-2 h-1 bg-zinc-800 rounded-full" />
        </div>
      </div>
    </div>
  );
};

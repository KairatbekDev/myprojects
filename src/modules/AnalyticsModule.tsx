import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { analyticsEngine, SystemSnapshot } from '../services/AnalyticsService';
import { Activity, Database, RefreshCw } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useToast } from '../hooks/useToast';

interface DbStats {
  totalLogs: number;
  totalMessages: number;
  lastEventTime: string | null;
}

interface DataPointProps {
  label: string;
  val: string;
  sub: string;
  live?: boolean;
}

const DataPoint: React.FC<DataPointProps> = ({ label, val, sub, live }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{label}</div>
      {live && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
    </div>
    <div className="text-2xl md:text-3xl font-black text-white italic tracking-tighter font-mono">{val}</div>
    <div className="text-[8px] font-bold text-blue-500/60 uppercase tracking-widest">{sub}</div>
  </div>
);

export const AnalyticsModule: React.FC = () => {
  const [snapshot, setSnapshot] = useState<SystemSnapshot | null>(null);
  const [dbStats, setDbStats] = useState<DbStats | null>(null);
  const [dbLoading, setDbLoading] = useState(true);
  const [tableAvailable, setTableAvailable] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      setSnapshot(analyticsEngine.generateSnapshot());
    }, 2000);
    setSnapshot(analyticsEngine.generateSnapshot());
    return () => clearInterval(interval);
  }, []);

  const fetchDbStats = async () => {
    setDbLoading(true);

    const [logsRes, msgsRes] = await Promise.all([
      supabase.from('access_logs').select('created_at', { count: 'exact', head: false }),
      supabase.from('messages').select('id', { count: 'exact', head: false }),
    ]);

    if (logsRes.error) {
      if (logsRes.error.message.includes('does not exist') || logsRes.error.code === '42P01') {
        setTableAvailable(false);
      } else {
        toast.error('Analytics DB error: ' + logsRes.error.message);
      }
      setDbLoading(false);
      return;
    }

    setTableAvailable(true);
    const logsData = logsRes.data as Array<{ created_at: string }> | null;
    const lastEvent = logsData && logsData.length > 0
      ? logsData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
      : null;

    setDbStats({
      totalLogs: logsData?.length ?? 0,
      totalMessages: msgsRes.data?.length ?? 0,
      lastEventTime: lastEvent ? new Date(lastEvent).toLocaleTimeString() : null,
    });
    setDbLoading(false);
  };

  useEffect(() => {
    fetchDbStats();
  }, []);

  if (!snapshot) {
    return <div className="text-zinc-500 animate-pulse font-mono text-sm">INITIALIZING_ENGINE...</div>;
  }

  return (
    <div className="bg-zinc-900/40 border border-white/5 rounded-[3rem] p-6 md:p-10 backdrop-blur-2xl">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8 md:mb-12">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tighter">Neural_Pulse_Monitor</h2>
          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.5em] mt-2 italic">
            Deep Analysis active since boot _
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDbStats}
            disabled={dbLoading}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={`text-zinc-400 ${dbLoading ? 'animate-spin' : ''}`} />
          </button>
          <div className={`px-4 md:px-6 py-2 rounded-2xl font-black italic text-xs shadow-lg transition-colors ${
            snapshot.threatLevel === 'CRITICAL' ? 'bg-red-600 text-white animate-bounce' :
            snapshot.threatLevel === 'HIGH' ? 'bg-orange-500 text-white' :
            'bg-blue-600 text-white'
          }`}>
            LEVEL: {snapshot.threatLevel}
          </div>
        </div>
      </div>

      {/* Simulated live metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        <DataPoint label="Processor Load" val={`${snapshot.cpuUsage}%`} sub="4.2 GHz Turbo" live />
        <DataPoint label="Memory Buffer" val={`${snapshot.memoryUsage} GB`} sub="DDR5-6400" live />
        <DataPoint label="Active Nodes" val={snapshot.activeThreads.toString()} sub="Synced" live />
        <DataPoint label="Latency" val={snapshot.networkLatency} sub="Stable" live />
      </div>

      {/* Real DB stats section */}
      <div className="mt-8 md:mt-10 border-t border-white/5 pt-6 md:pt-8">
        <div className="flex items-center gap-2 mb-4">
          <Database size={14} className="text-blue-500" />
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500">
            Live_Database_Metrics
          </span>
        </div>

        {tableAvailable ? (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total_Logs', val: dbLoading ? '...' : (dbStats?.totalLogs ?? 0).toString(), sub: 'access_logs' },
              { label: 'Messages', val: dbLoading ? '...' : (dbStats?.totalMessages ?? 0).toString(), sub: 'messages' },
              { label: 'Last_Event', val: dbLoading ? '...' : (dbStats?.lastEventTime ?? 'none'), sub: 'timestamp' },
            ].map(({ label, val, sub }) => (
              <div key={label} className="bg-black/30 rounded-2xl p-4 border border-white/5">
                <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">{label}</div>
                <div className="text-lg font-black text-white italic font-mono">{val}</div>
                <div className="text-[7px] text-blue-500/50 uppercase tracking-widest mt-1">{sub}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl text-[9px] text-yellow-400/70">
            access_logs table not found. Create it in Supabase to see real DB metrics.
          </div>
        )}
      </div>

      <div className="mt-6 p-5 bg-black/40 border border-white/5 rounded-[2rem] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Activity className="text-blue-500" size={18} />
          </div>
          <div>
            <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Real-time Stream</div>
            <div className="text-sm font-bold text-white italic">Aggregated_System_Metrics.log</div>
          </div>
        </div>
        <button className="px-6 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap">
          Export Report
        </button>
      </div>
    </div>
  );
};

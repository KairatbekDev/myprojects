import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { analyticsEngine, SystemSnapshot } from '../services/AnalyticsService';
import { Activity, Database, RefreshCw, Zap } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useToast } from '../hooks/useToast';

// ── SVG Sparkline ─────────────────────────────────────────────────────────────

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 400,
  height = 72,
  color = '#3b82f6',
}) => {
  if (data.length < 2) return null;
  const pad = 6;
  const innerH = height - pad * 2;

  const toX = (i: number) => ((i / (data.length - 1)) * width).toFixed(1);
  const toY = (v: number) => (height - pad - (v / 100) * innerH).toFixed(1);

  const linePts = data.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');
  const areaPath =
    `M 0,${height} ` +
    data.map((v, i) => `L ${toX(i)},${toY(v)}`).join(' ') +
    ` L ${width},${height} Z`;

  const lastX = parseFloat(toX(data.length - 1));
  const lastY = parseFloat(toY(data[data.length - 1]));
  const latestVal = data[data.length - 1];
  const dotColor =
    latestVal > 75 ? '#ef4444' : latestVal > 50 ? '#f59e0b' : color;

  const gradId = `spark-grad-${color.replace('#', '')}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={dotColor} stopOpacity="0.25" />
          <stop offset="100%" stopColor={dotColor} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <path d={areaPath} fill={`url(#${gradId})`} />
      {/* Line */}
      <polyline
        points={linePts}
        fill="none"
        stroke={dotColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Animated dot at latest value */}
      <circle cx={lastX} cy={lastY} r="3" fill={dotColor} />
      <circle cx={lastX} cy={lastY} r="5" fill={dotColor} opacity="0.3">
        <animate attributeName="r" values="3;7;3" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
};

// ── DataPoint ─────────────────────────────────────────────────────────────────

interface DataPointProps {
  label: string;
  val: string;
  sub: string;
  live?: boolean;
  alert?: boolean;
}

const DataPoint: React.FC<DataPointProps> = ({ label, val, sub, live, alert }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{label}</span>
      {live && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
    </div>
    <div className={`text-2xl md:text-3xl font-black italic tracking-tighter font-mono ${alert ? 'text-red-400' : 'text-white'}`}>
      {val}
    </div>
    <div className="text-[8px] font-bold text-blue-500/60 uppercase tracking-widest">{sub}</div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

interface DbStats {
  totalLogs: number;
  totalMessages: number;
  lastEventTime: string | null;
}

const SPARK_LENGTH = 40;
const initSpark = () =>
  Array.from({ length: SPARK_LENGTH }, () => Math.floor(Math.random() * 55) + 20);

export const AnalyticsModule: React.FC = () => {
  const [snapshot, setSnapshot] = useState<SystemSnapshot | null>(null);
  const [sparkData, setSparkData] = useState<number[]>(initSpark);
  const [dbStats, setDbStats] = useState<DbStats | null>(null);
  const [dbLoading, setDbLoading] = useState(true);
  const [tableAvailable, setTableAvailable] = useState(true);
  const [liveEventDelta, setLiveEventDelta] = useState(0);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const toast = useToast();

  // ── Simulated metrics + sparkline update ──────────────────────────────────
  useEffect(() => {
    const snap = analyticsEngine.generateSnapshot();
    setSnapshot(snap);
    const interval = setInterval(() => {
      const next = analyticsEngine.generateSnapshot();
      setSnapshot(next);
      setSparkData((prev) => [...prev.slice(1), next.cpuUsage]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // ── DB stats + Realtime subscription ─────────────────────────────────────
  const fetchDbStats = useCallback(async () => {
    setDbLoading(true);

    const [logsRes, msgsRes] = await Promise.all([
      supabase.from('access_logs').select('created_at'),
      supabase.from('messages').select('id'),
    ]);

    if (logsRes.error) {
      if (logsRes.error.message.includes('does not exist') || logsRes.error.code === '42P01') {
        setTableAvailable(false);
      } else {
        toast.error('Analytics error: ' + logsRes.error.message);
      }
      setDbLoading(false);
      return;
    }

    setTableAvailable(true);
    const logsData = (logsRes.data ?? []) as Array<{ created_at: string }>;
    const lastEvent =
      logsData.length > 0
        ? [...logsData].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0].created_at
        : null;

    setDbStats({
      totalLogs: logsData.length,
      totalMessages: (msgsRes.data ?? []).length,
      lastEventTime: lastEvent ? new Date(lastEvent).toLocaleTimeString() : null,
    });
    setLiveEventDelta(0);
    setDbLoading(false);
  }, []);

  useEffect(() => {
    fetchDbStats();

    // Subscribe to access_logs inserts for live delta counter
    channelRef.current = supabase
      .channel('analytics:access_logs')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'access_logs' },
        () => {
          setLiveEventDelta((n) => n + 1);
          setDbStats((prev) =>
            prev ? { ...prev, totalLogs: prev.totalLogs + 1 } : prev
          );
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [fetchDbStats]);

  if (!snapshot) {
    return (
      <div className="text-zinc-500 animate-pulse font-mono text-sm">
        INITIALIZING_ENGINE...
      </div>
    );
  }

  const latestCpu = sparkData[sparkData.length - 1];

  return (
    <div className="bg-zinc-900/40 border border-white/5 rounded-[3rem] p-6 md:p-10 backdrop-blur-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tighter">
            Neural_Pulse_Monitor
          </h2>
          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.5em] mt-1 italic">
            Deep Analysis active since boot _
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={fetchDbStats}
            disabled={dbLoading}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={`text-zinc-400 ${dbLoading ? 'animate-spin' : ''}`} />
          </button>
          <div
            className={`px-4 py-2 rounded-2xl font-black italic text-xs shadow-lg ${
              snapshot.threatLevel === 'CRITICAL' ? 'bg-red-600 text-white animate-bounce' :
              snapshot.threatLevel === 'HIGH'     ? 'bg-orange-500 text-white' :
              'bg-blue-600 text-white'
            }`}
          >
            THREAT: {snapshot.threatLevel}
          </div>
        </div>
      </div>

      {/* SVG Sparkline — Network Pulse */}
      <div className="mb-8 bg-black/30 border border-white/5 rounded-[2rem] p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity size={13} className="text-blue-500" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500">
              Network_Pulse_Stream
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-white font-black">{latestCpu}%</span>
            {liveEventDelta > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-[8px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20"
              >
                +{liveEventDelta} live
              </motion.span>
            )}
          </div>
        </div>
        <Sparkline data={sparkData} height={72} />
        <div className="flex justify-between mt-2">
          <span className="text-[7px] text-zinc-700 font-mono">
            {snapshot.timestamp} — 40 samples
          </span>
          <span className="text-[7px] text-zinc-700 font-mono uppercase">
            {latestCpu > 75 ? 'HIGH_LOAD' : latestCpu > 50 ? 'MED_LOAD' : 'STABLE'}
          </span>
        </div>
      </div>

      {/* Simulated live metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <DataPoint label="CPU_Load"      val={`${snapshot.cpuUsage}%`}      sub="4.2 GHz Turbo"    live />
        <DataPoint label="Memory_Buffer" val={`${snapshot.memoryUsage} GB`} sub="DDR5-6400"        live />
        <DataPoint label="Active_Nodes"  val={snapshot.activeThreads.toString()} sub="Synced"      live />
        <DataPoint label="Latency"       val={snapshot.networkLatency}      sub="Stable"           live />
      </div>

      {/* Real DB stats */}
      <div className="border-t border-white/5 pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Database size={13} className="text-blue-500" />
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500">
            Live_Database_Metrics
          </span>
        </div>

        {tableAvailable ? (
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: 'Total_Logs',
                val: dbLoading ? '...' : ((dbStats?.totalLogs ?? 0) + liveEventDelta).toString(),
                sub: 'access_logs',
                live: true,
              },
              {
                label: 'Messages',
                val: dbLoading ? '...' : (dbStats?.totalMessages ?? 0).toString(),
                sub: 'messages',
                live: false,
              },
              {
                label: 'Last_Event',
                val: dbLoading ? '...' : (dbStats?.lastEventTime ?? 'none'),
                sub: 'timestamp',
                live: false,
              },
            ].map(({ label, val, sub, live }) => (
              <div key={label} className="bg-black/30 rounded-2xl p-4 border border-white/5">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">
                    {label}
                  </span>
                  {live && <Zap size={8} className="text-blue-500" />}
                </div>
                <div className="text-base md:text-lg font-black text-white italic font-mono">{val}</div>
                <div className="text-[7px] text-blue-500/50 uppercase tracking-widest mt-1">{sub}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl text-[9px] text-yellow-400/70 font-mono">
            access_logs table not found. Create it in Supabase to see real DB metrics.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 p-5 bg-black/40 border border-white/5 rounded-[2rem] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Activity className="text-blue-500" size={16} />
          </div>
          <div>
            <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">
              Real-time Stream
            </div>
            <div className="text-sm font-bold text-white italic">
              Aggregated_System_Metrics.log
            </div>
          </div>
        </div>
        <button className="px-6 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap">
          Export_Report
        </button>
      </div>
    </div>
  );
};

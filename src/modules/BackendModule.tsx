/**
 * BackendModule.tsx
 * 
 * Модуль «Backend_Lab» — интерактивная панель для бэкенд-разработки.
 * Здесь вы можете отслеживать статус API-эндпоинтов, управлять базой данных,
 * следить за серверными логами и редактировать конфигурацию сервера.
 * 
 * Раздел создан для удобного редактирования и расширения серверной части проекта.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Server, Database, Code2, Cpu, CheckCircle2,
  XCircle, RefreshCw, ChevronRight, Terminal, Globe
} from 'lucide-react';

const endpoints = [
  { method: 'GET',    path: '/api/v1/users',      status: 200, ms: 42  },
  { method: 'POST',   path: '/api/v1/auth/login',  status: 200, ms: 87  },
  { method: 'GET',    path: '/api/v1/projects',    status: 200, ms: 31  },
  { method: 'DELETE', path: '/api/v1/sessions/:id',status: 204, ms: 19  },
  { method: 'GET',    path: '/api/v1/logs',        status: 500, ms: 203 },
];

const logs = [
  { time: '12:00:01', level: 'INFO',  msg: 'Сервер запущен на порту 8000' },
  { time: '12:00:03', level: 'INFO',  msg: 'Подключение к базе данных установлено' },
  { time: '12:01:14', level: 'WARN',  msg: 'Высокое время отклика: /api/v1/logs (203ms)' },
  { time: '12:02:55', level: 'ERROR', msg: 'Исключение: Connection pool exceeded limit' },
  { time: '12:03:10', level: 'INFO',  msg: 'Кэш очищен успешно' },
];

const methodColor: Record<string, string> = {
  GET:    'text-blue-400',
  POST:   'text-emerald-400',
  DELETE: 'text-red-400',
  PUT:    'text-yellow-400',
};

const levelColor: Record<string, string> = {
  INFO:  'text-blue-400',
  WARN:  'text-yellow-400',
  ERROR: 'text-red-400',
};

const tabs = ['Эндпоинты', 'База данных', 'Логи', 'Конфиг'];

export const BackendModule = () => {
  const [activeTab, setActiveTab] = useState('Эндпоинты');
  const [spinning, setSpinning] = useState(false);

  const handleRefresh = () => {
    setSpinning(true);
    setTimeout(() => setSpinning(false), 1000);
  };

  return (
    <div className="space-y-6 p-4">

      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-orange-500">
          <Server size={48} />
          <div>
            <h2 className="text-white text-3xl font-black italic uppercase tracking-tighter">
              Backend_Lab
            </h2>
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
              Панель разработки серверной части
            </p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          className="p-3 bg-zinc-900 border border-white/10 rounded-xl text-zinc-400 hover:text-white hover:border-orange-500/40 transition-all"
        >
          <motion.div animate={{ rotate: spinning ? 360 : 0 }} transition={{ duration: 0.8 }}>
            <RefreshCw size={18} />
          </motion.div>
        </button>
      </div>

      {/* Статус-бар */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Статус сервера', value: 'Online', ok: true },
          { label: 'База данных',    value: 'PostgreSQL', ok: true },
          { label: 'Ошибки (24ч)',   value: '1 ошибка', ok: false },
        ].map((s) => (
          <div key={s.label} className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
            <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600">{s.label}</p>
            <div className="flex items-center gap-2">
              {s.ok
                ? <CheckCircle2 size={14} className="text-emerald-500" />
                : <XCircle size={14} className="text-red-500" />}
              <span className={`text-[11px] font-black ${s.ok ? 'text-emerald-400' : 'text-red-400'}`}>{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Вкладки */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
              activeTab === t
                ? 'bg-orange-600/20 border-orange-500/40 text-orange-400'
                : 'bg-zinc-900/40 border-white/5 text-zinc-600 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Контент вкладок */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >

          {/* === ЭНДПОИНТЫ === */}
          {activeTab === 'Эндпоинты' && (
            <div className="space-y-2">
              <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                <Globe size={10} /> REST API — доступные маршруты
              </p>
              {endpoints.map((e, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-zinc-900/60 border border-white/5 rounded-2xl px-5 py-3 hover:border-orange-500/20 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <span className={`text-[9px] font-black w-14 ${methodColor[e.method] ?? 'text-zinc-400'}`}>
                      {e.method}
                    </span>
                    <span className="text-white font-mono text-[11px]">{e.path}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-[9px] font-black ${e.status < 400 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {e.status}
                    </span>
                    <span className="text-[9px] text-zinc-600">{e.ms}ms</span>
                    <ChevronRight size={12} className="text-zinc-700 group-hover:text-orange-500 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* === БАЗА ДАННЫХ === */}
          {activeTab === 'База данных' && (
            <div className="space-y-3">
              <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                <Database size={10} /> Таблицы PostgreSQL
              </p>
              {['users', 'sessions', 'projects', 'logs', 'settings'].map((table) => (
                <div key={table} className="flex items-center justify-between bg-zinc-900/60 border border-white/5 rounded-2xl px-5 py-4 hover:border-orange-500/20 transition-all group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Database size={14} className="text-orange-500/60" />
                    <span className="text-white font-mono text-[12px]">{table}</span>
                  </div>
                  <ChevronRight size={12} className="text-zinc-700 group-hover:text-orange-500 transition-colors" />
                </div>
              ))}
              <button className="w-full mt-2 bg-orange-600/10 border border-orange-500/20 py-4 rounded-2xl font-black uppercase text-[9px] tracking-[0.3em] text-orange-400 hover:bg-orange-600/20 transition-all">
                Открыть SQL-консоль
              </button>
            </div>
          )}

          {/* === ЛОГИ === */}
          {activeTab === 'Логи' && (
            <div className="space-y-2">
              <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                <Terminal size={10} /> Серверные логи (последние записи)
              </p>
              <div className="bg-black/60 border border-white/5 rounded-3xl p-5 font-mono space-y-2 max-h-52 overflow-y-auto">
                {logs.map((l, i) => (
                  <div key={i} className="flex items-start gap-3 text-[10px]">
                    <span className="text-zinc-700 shrink-0">{l.time}</span>
                    <span className={`font-black w-12 shrink-0 ${levelColor[l.level] ?? 'text-zinc-400'}`}>{l.level}</span>
                    <span className="text-zinc-300">{l.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* === КОНФИГ === */}
          {activeTab === 'Конфиг' && (
            <div className="space-y-3">
              <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                <Cpu size={10} /> Конфигурация сервера (редактируемая)
              </p>
              {[
                { key: 'HOST',        value: '0.0.0.0'     },
                { key: 'PORT',        value: '8000'         },
                { key: 'DB_URL',      value: 'postgres://...' },
                { key: 'JWT_SECRET',  value: '••••••••••••' },
                { key: 'LOG_LEVEL',   value: 'INFO'         },
                { key: 'CORS_ORIGIN', value: '*'            },
              ].map((c) => (
                <div key={c.key} className="flex items-center gap-4 bg-zinc-900/60 border border-white/5 rounded-2xl px-5 py-3">
                  <span className="text-orange-400 font-mono text-[10px] font-black w-28 shrink-0">{c.key}</span>
                  <Code2 size={10} className="text-zinc-700 shrink-0" />
                  <span className="text-zinc-300 font-mono text-[10px]">{c.value}</span>
                </div>
              ))}
              <button className="w-full mt-2 bg-orange-600/10 border border-orange-500/20 py-4 rounded-2xl font-black uppercase text-[9px] tracking-[0.3em] text-orange-400 hover:bg-orange-600/20 transition-all">
                Сохранить конфигурацию
              </button>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
};

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Server, Database, Code2, Cpu, RefreshCw,
  Terminal, Activity, Zap, ShieldCheck,
  Download, Music, Gamepad2, CheckCircle,
  FileArchive, FileAudio, AlertCircle, Clock,
  Layers, GitBranch, Globe, WifiHigh,
  Image, Wrench, Palette, MapPin,
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { AccessLog } from '../types';
import { useToast } from '../hooks/useToast';

// ─────────────────────────────────────────────────────────────────────────────
// СТАТИЧЕСКИЕ ДАННЫЕ — вынесены наверх для удобства редактирования
// ─────────────────────────────────────────────────────────────────────────────

/** Список API-эндпоинтов для вкладки "Эндпоинты" */
const ENDPOINTS = [
  { method: 'GET',    path: '/api/v1/users',       status: 200, ms: 42,  load: '2%'  },
  { method: 'POST',   path: '/api/v1/auth/login',   status: 200, ms: 87,  load: '12%' },
  { method: 'GET',    path: '/api/v1/projects',     status: 200, ms: 31,  load: '5%'  },
  { method: 'DELETE', path: '/api/v1/sessions/:id', status: 204, ms: 19,  load: '1%'  },
  { method: 'GET',    path: '/api/v1/logs',         status: 500, ms: 203, load: '45%' },
];

/** Конфигурация всего технологического стека системы */
const STACK_CONFIG = [
  { name: 'React',          version: '18.2.0',  status: 'ACTIVE',     color: 'text-blue-400'    },
  { name: 'TypeScript',     version: '4.7.4',   status: 'ACTIVE',     color: 'text-blue-500'    },
  { name: 'Tailwind CSS',   version: '4.2.1',   status: 'ACTIVE',     color: 'text-cyan-400'    },
  { name: 'Supabase',       version: '2.99.1',  status: 'CONNECTED',  color: 'text-emerald-400' },
  { name: 'Framer Motion',  version: '12.34.3', status: 'ACTIVE',     color: 'text-purple-400'  },
  { name: 'Zustand',        version: '5.0.11',  status: 'ACTIVE',     color: 'text-orange-400'  },
  { name: 'Vite',           version: '8.0.3',   status: 'ACTIVE',     color: 'text-yellow-400'  },
];

/** Мета-информация о сборке системы */
const BUILD_META = {
  version:     'v2.0.4-beta',
  environment: 'PRODUCTION',
  node:        'Node_22_LTS',
  region:      'EU-CENTRAL-1',
  buildHash:   'a3f7c9d',
};

// ─────────────────────────────────────────────────────────────────────────────
// ТИПЫ ДЛЯ МОДУЛЯ ЗАГРУЗОК
// ─────────────────────────────────────────────────────────────────────────────

/** Статусы процесса скачивания файла */
type DownloadStatus = 'idle' | 'downloading' | 'done';

/** Состояние прогресса скачивания одного файла */
interface DownloadState {
  progress: number;   // от 0 до 100
  status: DownloadStatus;
}

/** Описание одного файла в хабе загрузок */
interface DownloadFile {
  id:       string;   // уникальный ключ для state
  category: string;   // "Игры" | "Музыка"
  name:     string;   // отображаемое имя без расширения
  ext:      string;   // расширение файла
  size:     string;   // размер в человекочитаемом виде
  url:      string;   // URL для реального скачивания (пустая строка = симуляция)
  icon:     React.ReactNode;
}

/** Каталог файлов, разбитый по категориям.
 *  Чтобы привязать реальный файл — замените url на ссылку из Supabase Storage. */
const DOWNLOAD_FILES: DownloadFile[] = [
  {
    id:       'cp-ost',
    category: 'Фото',
    name:     'Cat',
    ext:      'Jpg',
    size:     '90,59 KB',
    url:      'https://svkebnkghhsaayookptu.supabase.co/storage/v1/object/public/downloads/IMG_20260423_042317%20(3).jpg',  // ← сюда вставить публичный URL из Supabase Storage
    icon:     <FileAudio size={16} className="text-purple-400" />,
  },
  {
    id:       'synth-wave',
    category: 'Музыка',
    name:     'SynthWave_Beats_2077',
    ext:      'mp3',
    size:     '32.7 MB',
    url:      '',  // ← сюда вставить публичный URL из Supabase Storage
    icon:     <Music size={16} className="text-pink-400" />,
  },
  {
    id:       'retro-arcade',
    category: 'Игры',
    name:     'Retro_Arcade_Pack',
    ext:      'zip',
    size:     '124.5 MB',
    url:      '',  // ← сюда вставить публичный URL из Supabase Storage
    icon:     <Gamepad2 size={16} className="text-emerald-400" />,
  },
  {
    id:       'cyber-runner',
    category: 'Игры',
    name:     'CyberRunner_Demo_v0.9',
    ext:      'zip',
    size:     '89.1 MB',
    url:      '',  // ← сюда вставить публичный URL из Supabase Storage
    icon:     <FileArchive size={16} className="text-orange-400" />,
  },
  {
    id:       'test-cat',
    category: 'Игры',
    name:     'Cat',
    ext:      'Jpg',
    size:     '90,59 KB',
    url:      'https://svkebnkghhsaayookptu.supabase.co/storage/v1/object/public/downloads/IMG_20260423_042317%20(3).jpg',
    icon:     <Music size={16} className="text-green-400" />,
  },

  // ── НОВЫЕ СЛОТЫ — заполните url из Supabase Storage ────────────────────────

  // Категория: Фото (2 слота)
  {
    id:       'photo-slot-1',
    category: 'Фото',
    name:     'Пустой слот [Фото-1]',
    ext:      'jpg',
    size:     '—',
    url:      '',
    icon:     <FileAudio size={16} className="text-blue-400" />,
  },
  {
    id:       'photo-slot-2',
    category: 'Фото',
    name:     'Пустой слот [Фото-2]',
    ext:      'png',
    size:     '—',
    url:      '',
    icon:     <FileAudio size={16} className="text-blue-400" />,
  },

  // Категория: Моды (3 слота)
  {
    id:       'mod-slot-1',
    category: 'Моды',
    name:     'Пустой слот [Мод-1]',
    ext:      'zip',
    size:     '—',
    url:      '',
    icon:     <FileArchive size={16} className="text-orange-400" />,
  },
  {
    id:       'mod-slot-2',
    category: 'Моды',
    name:     'Пустой слот [Мод-2]',
    ext:      'zip',
    size:     '—',
    url:      '',
    icon:     <FileArchive size={16} className="text-orange-400" />,
  },
  {
    id:       'mod-slot-3',
    category: 'Моды',
    name:     'Пустой слот [Мод-3]',
    ext:      'zip',
    size:     '—',
    url:      '',
    icon:     <FileArchive size={16} className="text-orange-400" />,
  },

  // Категория: Текстурпаки (3 слота)
  {
    id:       'texture-slot-1',
    category: 'Текстурпаки',
    name:     'Пустой слот [Текстурпак-1]',
    ext:      'zip',
    size:     '—',
    url:      '',
    icon:     <FileArchive size={16} className="text-pink-400" />,
  },
  {
    id:       'texture-slot-2',
    category: 'Текстурпаки',
    name:     'Пустой слот [Текстурпак-2]',
    ext:      'zip',
    size:     '—',
    url:      '',
    icon:     <FileArchive size={16} className="text-pink-400" />,
  },
  {
    id:       'texture-slot-3',
    category: 'Текстурпаки',
    name:     'Пустой слот [Текстурпак-3]',
    ext:      'zip',
    size:     '—',
    url:      '',
    icon:     <FileArchive size={16} className="text-pink-400" />,
  },

  // Категория: Миры (2 слота)
  {
    id:       'world-slot-1',
    category: 'Миры',
    name:     'Пустой слот [Мир-1]',
    ext:      'zip',
    size:     '—',
    url:      '',
    icon:     <FileArchive size={16} className="text-cyan-400" />,
  },
  {
    id:       'world-slot-2',
    category: 'Миры',
    name:     'Пустой слот [Мир-2]',
    ext:      'zip',
    size:     '—',
    url:      '',
    icon:     <FileArchive size={16} className="text-cyan-400" />,
  },
];

/**
 * Конфигурация иконок и цветов заголовков для каждой категории загрузок.
 * Чтобы добавить новую категорию — просто добавь сюда строку и запись в DOWNLOAD_FILES.
 */
const CATEGORY_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  'Музыка':      { icon: <Music size={13} className="text-purple-400" />,     color: 'text-purple-400' },
  'Игры':        { icon: <Gamepad2 size={13} className="text-emerald-400" />, color: 'text-emerald-400' },
  'Фото':        { icon: <Image size={13} className="text-blue-400" />,       color: 'text-blue-400' },
  'Моды':        { icon: <Wrench size={13} className="text-orange-400" />,    color: 'text-orange-400' },
  'Текстурпаки': { icon: <Palette size={13} className="text-pink-400" />,     color: 'text-pink-400' },
  'Миры':        { icon: <MapPin size={13} className="text-cyan-400" />,      color: 'text-cyan-400' },
};

// ─────────────────────────────────────────────────────────────────────────────
// ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ
// ─────────────────────────────────────────────────────────────────────────────

/** Маппинг цветов для event_type лога */
const LOG_TYPE_STYLE: Record<string, string> = {
  INFO:    'text-blue-400 bg-blue-500/10 border-blue-500/20',
  WARN:    'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  WARNING: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  ERROR:   'text-red-400 bg-red-500/10 border-red-500/20',
  SUCCESS: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  AUTH:    'text-purple-400 bg-purple-500/10 border-purple-500/20',
};

/** Форматирование ISO-даты в компактный вид для отображения в логах */
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('ru-RU', {
    month:  '2-digit',
    day:    '2-digit',
    hour:   '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

// ─────────────────────────────────────────────────────────────────────────────
// ГЛАВНЫЙ КОМПОНЕНТ
// ─────────────────────────────────────────────────────────────────────────────

// Список вкладок — добавлена новая вкладка "Загрузки"
const TABS = ['Эндпоинты', 'База данных', 'Логи', 'Конфиг', 'Загрузки'];

interface BackendModuleProps {
  /** Вкладка, которая будет активна при первом рендере.
   *  По умолчанию открывается "Эндпоинты". */
  initialTab?: string;
}

export const BackendModule = ({ initialTab }: BackendModuleProps = {}) => {
  // ── Общие состояния ──────────────────────────────────────────────────────

  /** Текущая активная вкладка.
   *  Если передан initialTab (например "Загрузки" из нижней навигации) — открывается сразу нужная вкладка. */
  const [activeTab, setActiveTab] = useState(initialTab ?? 'Эндпоинты');

  /** Вращается ли иконка обновления в шапке */
  const [spinning, setSpinning] = useState(false);

  /** Текущая нагрузка CPU (имитация) */
  const [cpuLoad, setCpuLoad] = useState(12);

  // ── Состояния вкладки "Конфиг" ───────────────────────────────────────────

  /** Текущее эмулируемое значение пинга к БД (35–45 мс) */
  const [dbPing, setDbPing] = useState(38);

  // ── Состояния вкладки "Логи" ─────────────────────────────────────────────

  /** Массив логов, загруженных из Supabase access_logs */
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);

  /** Идёт ли сейчас загрузка логов */
  const [logsLoading, setLogsLoading] = useState(false);

  /** Сообщение об ошибке при загрузке логов */
  const [logsError, setLogsError] = useState<string | null>(null);

  /** true если таблица access_logs не существует в БД */
  const [logsTableMissing, setLogsTableMissing] = useState(false);

  // ── Состояния вкладки "Загрузки" ─────────────────────────────────────────

  /**
   * Словарь состояний скачивания: ключ = id файла, значение = { progress, status }
   * Например: { 'cp-ost': { progress: 45, status: 'downloading' } }
   */
  const [downloadStates, setDownloadStates] = useState<Record<string, DownloadState>>({});

  /** Хук для показа всплывающих уведомлений */
  const toast = useToast();

  /** Ref для хранения интервалов скачивания — чтобы не создавать утечку памяти */
  const downloadIntervals = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  // ── Эффекты ──────────────────────────────────────────────────────────────

  /** Имитация живой нагрузки CPU (обновляется каждые 2 секунды) */
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuLoad(Math.floor(Math.random() * (45 - 12 + 1) + 12));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Имитация пинга к базе данных (35–45 мс).
   * Реальный пинг показать без серверного кода нельзя, поэтому эмулируем.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setDbPing(Math.floor(Math.random() * (45 - 35 + 1) + 35));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Загружаем логи из Supabase, когда пользователь переходит на вкладку "Логи".
   * Не грузим заранее — экономим запросы к БД.
   */
  useEffect(() => {
    if (activeTab === 'Логи') {
      fetchAccessLogs();
    }
  }, [activeTab]);

  /** Очищаем все активные интервалы скачивания при размонтировании компонента */
  useEffect(() => {
    return () => {
      Object.values(downloadIntervals.current).forEach(clearInterval);
    };
  }, []);

  // ── Обработчики ──────────────────────────────────────────────────────────

  /** Вращает иконку refresh в шапке на 1 секунду */
  const handleRefresh = () => {
    setSpinning(true);
    setTimeout(() => setSpinning(false), 1000);
  };

  /**
   * Загружает последние 20 записей из таблицы access_logs.
   * Если таблица не найдена (код 42P01) — показываем специальную заглушку.
   */
  const fetchAccessLogs = useCallback(async () => {
    setLogsLoading(true);
    setLogsError(null);
    setLogsTableMissing(false);

    const { data, error } = await supabase
      .from('access_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      // Проверяем, не существует ли таблица вообще
      if (error.message.includes('does not exist') || error.code === '42P01') {
        setLogsTableMissing(true);
      } else {
        setLogsError(error.message);
      }
    } else {
      // Приводим данные к типу AccessLog[]
      setAccessLogs((data as AccessLog[]) ?? []);
    }

    setLogsLoading(false);
  }, []);

  /**
   * Обработчик скачивания файла.
   * @param fileId   — уникальный идентификатор файла (для state)
   * @param fileName — имя файла (для тоста и download-атрибута)
   * @param fileUrl  — URL для реального скачивания (пустая строка = симуляция)
   */
  const handleDownload = useCallback((fileId: string, fileName: string, fileUrl: string) => {
    // Если уже идёт скачивание этого файла — игнорируем клик
    if (downloadStates[fileId]?.status === 'downloading') return;

    // Сбрасываем прогресс и ставим статус "скачивается"
    setDownloadStates(prev => ({
      ...prev,
      [fileId]: { progress: 0, status: 'downloading' },
    }));

    // Текущий прогресс в замыкании — чтобы избежать stale state в интервале
    let progress = 0;

    // Очищаем предыдущий интервал для этого файла (на случай повторного нажатия)
    if (downloadIntervals.current[fileId]) {
      clearInterval(downloadIntervals.current[fileId]);
    }

    /**
     * Каждые 80 мс увеличиваем прогресс на случайное значение (3–14%).
     * Итого: 100% / ~8% среднее ≈ ~12 шагов × 80мс ≈ ~1 секунда.
     * Чуть замедляем ближе к 100%, чтобы выглядело естественно.
     */
    downloadIntervals.current[fileId] = setInterval(() => {
      // Замедление в конце: если прогресс > 85%, шаг меньше
      const step = progress > 85
        ? Math.floor(Math.random() * 3 + 1)
        : Math.floor(Math.random() * 12 + 3);

      progress = Math.min(progress + step, 100);

      setDownloadStates(prev => ({
        ...prev,
        [fileId]: { progress, status: 'downloading' },
      }));

      // Когда достигли 100% — завершаем
      if (progress >= 100) {
        clearInterval(downloadIntervals.current[fileId]);

        setDownloadStates(prev => ({
          ...prev,
          [fileId]: { progress: 100, status: 'done' },
        }));

        if (fileUrl) {
          // Если есть реальный URL — инициируем настоящее скачивание через <a>
          const link = document.createElement('a');
          link.href = fileUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          toast.success(`[DOWNLOAD] ${fileName} — поток данных открыт`);
        } else {
          // Файл не привязан — информируем пользователя
          toast.info(
            `[DOWNLOAD] Подготовка потока данных... Файл успешно имитирован. ` +
            `Для привязки реального файла добавьте URL в Supabase Storage.`
          );
        }

        // Через 3 секунды сбрасываем статус обратно в "idle"
        setTimeout(() => {
          setDownloadStates(prev => ({
            ...prev,
            [fileId]: { progress: 0, status: 'idle' },
          }));
        }, 3000);
      }
    }, 80);
  }, [downloadStates, toast]);

  // ── Рендер ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 p-2 md:p-4 font-sans">

      {/* ── ШАПКА С ЭФФЕКТОМ СВЕЧЕНИЯ ─────────────────────────────────── */}
      <div className="flex items-center justify-between bg-orange-500/5 p-5 md:p-6 rounded-[2.5rem] border border-orange-500/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[50px] pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10 min-w-0">
          <div className="p-3 md:p-4 bg-orange-500 rounded-2xl shadow-[0_0_20px_rgba(249,115,22,0.4)] flex-shrink-0">
            <Server size={28} className="text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-white text-2xl md:text-3xl font-black italic uppercase tracking-tighter leading-none truncate">
              Backend_Lab <span className="text-orange-500 text-sm not-italic ml-2">V2.0</span>
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              <p className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em] truncate">
                System_Node: Operational // Uptime: 124h
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          className="relative z-10 p-3 md:p-4 bg-black/40 border border-white/5 rounded-2xl text-zinc-400 hover:text-orange-500 transition-all active:scale-90 flex-shrink-0"
        >
          <motion.div
            animate={{ rotate: spinning ? 360 : 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          >
            <RefreshCw size={18} />
          </motion.div>
        </button>
      </div>

      {/* ── КАРТОЧКИ МОНИТОРИНГА ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CPU нагрузка (живая) */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-5 hover:border-orange-500/30 transition-all">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[9px] font-black text-zinc-500 uppercase">CPU_Load</p>
            <Cpu size={14} className="text-orange-500" />
          </div>
          <div className="flex items-end gap-3">
            <h4 className="text-2xl font-black text-white italic">{cpuLoad}%</h4>
            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full mb-2 overflow-hidden">
              <motion.div
                animate={{ width: `${cpuLoad}%` }}
                transition={{ duration: 0.8 }}
                className="h-full bg-orange-500 shadow-[0_0_10px_orange]"
              />
            </div>
          </div>
        </div>

        {/* Статус базы данных */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-5">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[9px] font-black text-zinc-500 uppercase">Database_IO</p>
            <Database size={14} className="text-blue-500" />
          </div>
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-emerald-500" />
            <span className="text-white font-black italic uppercase text-lg tracking-tight">
              Stable_Link
            </span>
          </div>
        </div>

        {/* Уровень безопасности */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-5">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[9px] font-black text-zinc-500 uppercase">Security_Layer</p>
            <ShieldCheck size={14} className="text-emerald-500" />
          </div>
          <p className="text-white font-black italic uppercase text-lg tracking-tight">
            AES_256_Active
          </p>
        </div>
      </div>

      {/* ── ВКЛАДКИ ─────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto pb-1">
        <div className="flex p-1.5 bg-zinc-900/80 backdrop-blur-xl border border-white/5 rounded-[1.5rem] w-fit">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 md:px-6 py-2.5 rounded-[1.2rem] text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === t
                  ? 'bg-orange-600 text-white shadow-[0_5px_15px_rgba(234,88,12,0.3)]'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── КОНТЕНТНАЯ ОБЛАСТЬ ──────────────────────────────────────────── */}
      <div className="min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.25 }}
          >

            {/* ════════════════ ВКЛАДКА: ЭНДПОИНТЫ ════════════════ */}
            {activeTab === 'Эндпоинты' && (
              <div className="grid gap-3">
                {ENDPOINTS.map((e, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex flex-col md:flex-row md:items-center justify-between bg-zinc-900/40 border border-white/5 rounded-[1.8rem] p-5 hover:bg-zinc-900/60 transition-all group"
                  >
                    <div className="flex items-center gap-4 md:gap-6 mb-3 md:mb-0">
                      <div className={`px-3 py-1.5 rounded-full text-[9px] font-black flex-shrink-0 ${
                        e.method === 'GET'    ? 'bg-blue-500/10 text-blue-400' :
                        e.method === 'POST'   ? 'bg-emerald-500/10 text-emerald-400' :
                        e.method === 'DELETE' ? 'bg-red-500/10 text-red-400' :
                        'bg-zinc-500/10 text-zinc-400'
                      }`}>
                        {e.method}
                      </div>
                      <span className="text-white font-mono text-xs font-bold tracking-tight truncate">
                        {e.path}
                      </span>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-6 md:gap-8 border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                      <div className="text-right">
                        <p className="text-[7px] font-black text-zinc-600 uppercase mb-0.5">Response</p>
                        <p className={`text-[10px] font-black ${e.status < 400 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {e.status}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[7px] font-black text-zinc-600 uppercase mb-0.5">Latency</p>
                        <p className="text-[10px] text-white font-black italic">{e.ms}ms</p>
                      </div>
                      <div className="w-9 h-9 rounded-full border border-white/5 flex items-center justify-center group-hover:border-orange-500/50 transition-colors flex-shrink-0">
                        <Zap size={13} className="text-zinc-700 group-hover:text-orange-500" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* ════════════════ ВКЛАДКА: БАЗА ДАННЫХ ════════════════ */}
            {activeTab === 'База данных' && (
              <div className="p-8 md:p-10 text-center bg-zinc-900/20 border border-dashed border-white/10 rounded-[3rem]">
                <Database size={40} className="mx-auto text-zinc-800 mb-4" />
                <p className="text-xs font-black uppercase text-zinc-600 tracking-widest italic">
                  SQL_Mirroring_Protocol_Active
                </p>
                <button className="mt-6 px-8 py-4 bg-orange-600 text-white font-black uppercase text-[10px] rounded-2xl shadow-lg active:scale-95 transition-transform">
                  Query_Explorer
                </button>
              </div>
            )}

            {/* ════════════════ ВКЛАДКА: ЛОГИ ════════════════ */}
            {activeTab === 'Логи' && (
              <div className="space-y-3">

                {/* Шапка с кнопкой обновления */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-orange-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                      Access_Log_Stream // Supabase
                    </span>
                  </div>
                  <button
                    onClick={fetchAccessLogs}
                    disabled={logsLoading}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw size={12} className={`text-zinc-400 ${logsLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Состояние: загрузка */}
                {logsLoading && (
                  <div className="flex items-center gap-3 p-6 text-zinc-600 animate-pulse">
                    <RefreshCw size={14} className="animate-spin" />
                    <span className="text-[10px] font-mono uppercase">Загрузка потока данных...</span>
                  </div>
                )}

                {/* Состояние: таблица не найдена */}
                {!logsLoading && logsTableMissing && (
                  <div className="p-6 bg-yellow-500/5 border border-yellow-500/20 rounded-3xl flex items-start gap-3">
                    <AlertCircle size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-black text-yellow-400 uppercase tracking-wider">
                        Таблица access_logs не найдена
                      </p>
                      <p className="text-[9px] text-zinc-600 mt-1 font-mono">
                        Создайте таблицу через Supabase SQL Editor — SQL-скрипт находится в разделе Terminal → команда «logs».
                      </p>
                    </div>
                  </div>
                )}

                {/* Состояние: ошибка запроса */}
                {!logsLoading && logsError && (
                  <div className="p-5 bg-red-500/5 border border-red-500/20 rounded-3xl flex items-start gap-3">
                    <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-[9px] font-mono text-red-400">{logsError}</p>
                  </div>
                )}

                {/* Состояние: таблица есть, но записей нет */}
                {!logsLoading && !logsTableMissing && !logsError && accessLogs.length === 0 && (
                  <div className="p-8 text-center border border-dashed border-white/5 rounded-3xl">
                    <Clock size={28} className="mx-auto text-zinc-800 mb-3" />
                    <p className="text-[10px] font-mono text-zinc-600 italic">
                      [SYSTEM] Ожидание системных прерываний...
                    </p>
                    <p className="text-[9px] font-mono text-zinc-700 mt-1">
                      Записей не обнаружено.
                    </p>
                  </div>
                )}

                {/* Состояние: логи успешно загружены */}
                {!logsLoading && !logsTableMissing && !logsError && accessLogs.length > 0 && (
                  <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                    {accessLogs.map((log) => {
                      // Стиль зависит от типа события: INFO / ERROR / AUTH и т.д.
                      const style = LOG_TYPE_STYLE[log.event_type] ?? 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
                      return (
                        <motion.div
                          key={log.id}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex flex-col sm:flex-row sm:items-center gap-2 p-4 bg-zinc-900/30 border border-white/5 rounded-2xl font-mono text-[10px]"
                        >
                          {/* Тип события (бейдж) */}
                          <span className={`px-2.5 py-1 rounded-full border text-[8px] font-black uppercase flex-shrink-0 ${style}`}>
                            {log.event_type}
                          </span>

                          {/* Текст сообщения */}
                          <span className="text-zinc-300 flex-1 truncate">{log.message}</span>

                          {/* Время события */}
                          <span className="text-zinc-700 text-[8px] flex-shrink-0">
                            {fmtDate(log.created_at)}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ════════════════ ВКЛАДКА: КОНФИГ ════════════════ */}
            {activeTab === 'Конфиг' && (
              <div className="space-y-5">

                {/* Блок мета-информации о сборке */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { label: 'Version',      value: BUILD_META.version,     icon: <GitBranch size={12} className="text-orange-400" /> },
                    { label: 'Environment',  value: BUILD_META.environment,  icon: <Globe size={12} className="text-blue-400" /> },
                    { label: 'Node_Runtime', value: BUILD_META.node,         icon: <Cpu size={12} className="text-emerald-400" /> },
                    { label: 'Region',       value: BUILD_META.region,       icon: <Globe size={12} className="text-purple-400" /> },
                    { label: 'DB_Status',    value: 'CONNECTED',             icon: <Database size={12} className="text-emerald-400" /> },
                    { label: 'DB_Ping',      value: `${dbPing}ms`,           icon: <WifiHigh size={12} className="text-blue-400" /> },
                  ].map(({ label, value, icon }) => (
                    <div
                      key={label}
                      className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 hover:border-orange-500/20 transition-colors"
                    >
                      <div className="flex items-center gap-1.5 mb-1.5 opacity-70">
                        {icon}
                        <span className="text-[7px] font-black uppercase tracking-widest text-zinc-600">
                          {label}
                        </span>
                      </div>
                      <p className="text-white font-black italic text-sm tracking-tight truncate">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Хэш сборки */}
                <div className="flex items-center gap-3 px-5 py-3 bg-black/40 border border-white/5 rounded-2xl font-mono">
                  <Code2 size={13} className="text-zinc-600 flex-shrink-0" />
                  <span className="text-[9px] text-zinc-600 uppercase tracking-widest">Build_Hash:</span>
                  <span className="text-[9px] text-orange-400 font-bold">{BUILD_META.buildHash}</span>
                </div>

                {/* Стек технологий */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Layers size={13} className="text-orange-500" />
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500">
                      Technology_Stack
                    </p>
                  </div>

                  <div className="space-y-2">
                    {STACK_CONFIG.map((item, i) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-center justify-between bg-zinc-900/30 border border-white/5 rounded-2xl px-5 py-3 hover:border-white/10 transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          {/* Цветная точка-индикатор */}
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                          <span className="text-white font-black text-xs uppercase tracking-wider">
                            {item.name}
                          </span>
                          <span className="text-[9px] font-mono text-zinc-600">v{item.version}</span>
                        </div>

                        {/* Статус пакета */}
                        <span className={`text-[8px] font-black uppercase tracking-widest ${item.color}`}>
                          {item.status}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════ ВКЛАДКА: ЗАГРУЗКИ (DOWNLOAD_HUB) ════════════════ */}
            {activeTab === 'Загрузки' && (
              <div className="space-y-5">

                {/* Шапка хаба */}
                <div className="flex items-center gap-3 p-5 bg-blue-500/5 border border-blue-500/10 rounded-3xl">
                  <div className="p-3 bg-blue-500/15 rounded-2xl flex-shrink-0">
                    <Download size={22} className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-black italic uppercase tracking-tighter text-lg">
                      Download_Hub
                    </h3>
                    <p className="text-[8px] text-blue-400/60 font-black uppercase tracking-widest mt-0.5">
                      Центр_загрузок // Encrypted_Stream_Protocol
                    </p>
                  </div>
                </div>

                {/* Рендерим файлы динамически — категории вычисляются из DOWNLOAD_FILES в порядке появления.
                    Чтобы добавить новую категорию — достаточно добавить файл в DOWNLOAD_FILES и строку в CATEGORY_CONFIG. */}
                {Array.from(new Set(DOWNLOAD_FILES.map(f => f.category))).map((category) => {
                  // Фильтруем только файлы нужной категории
                  const files = DOWNLOAD_FILES.filter(f => f.category === category);
                  // Получаем иконку и цвет заголовка из конфига (фолбэк — серая иконка)
                  const catCfg = CATEGORY_CONFIG[category] ?? {
                    icon: <FileArchive size={13} className="text-zinc-500" />,
                    color: 'text-zinc-500',
                  };

                  return (
                    <div key={category} className="space-y-3">
                      {/* Заголовок категории с иконкой из CATEGORY_CONFIG */}
                      <div className="flex items-center gap-2">
                        {catCfg.icon}
                        <p className={`text-[9px] font-black uppercase tracking-[0.4em] ${catCfg.color}`}>
                          {category}
                        </p>
                      </div>

                      {/* Карточки файлов */}
                      {files.map((file) => {
                        // Получаем текущее состояние скачивания этого файла
                        const state = downloadStates[file.id] ?? { progress: 0, status: 'idle' as DownloadStatus };
                        const isDone        = state.status === 'done';
                        const isDownloading = state.status === 'downloading';

                        return (
                          <div
                            key={file.id}
                            className="bg-zinc-900/40 border border-white/5 rounded-[2rem] p-5 hover:border-white/10 transition-all"
                          >
                            {/* Верхняя строка: иконка, имя, размер */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2.5 bg-white/5 rounded-xl flex-shrink-0">
                                  {file.icon}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-white font-black text-xs uppercase tracking-tight truncate">
                                    {file.name}
                                  </p>
                                  <p className="text-[8px] text-zinc-600 font-mono mt-0.5">
                                    .{file.ext} · {file.size}
                                  </p>
                                </div>
                              </div>

                              {/* Кнопка скачивания */}
                              <button
                                onClick={() => handleDownload(file.id, `${file.name}.${file.ext}`, file.url)}
                                disabled={isDownloading}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 flex-shrink-0 ml-3 ${
                                  isDone
                                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                                    : isDownloading
                                    ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                                }`}
                              >
                                {isDone ? (
                                  <><CheckCircle size={13} /> Done</>
                                ) : isDownloading ? (
                                  <><RefreshCw size={13} className="animate-spin" /> {state.progress}%</>
                                ) : (
                                  <><Download size={13} /> Скачать</>
                                )}
                              </button>
                            </div>

                            {/* Прогресс-бар (виден только во время скачивания или по завершении) */}
                            <AnimatePresence>
                              {(isDownloading || isDone) && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="overflow-hidden"
                                >
                                  {/* Фон трека прогресс-бара */}
                                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                    <motion.div
                                      animate={{ width: `${state.progress}%` }}
                                      transition={{ duration: 0.15, ease: 'linear' }}
                                      className={`h-full rounded-full ${
                                        isDone
                                          ? 'bg-emerald-500'
                                          : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]'
                                      }`}
                                    />
                                  </div>

                                  {/* Подпись под прогресс-баром */}
                                  <div className="flex justify-between mt-1.5">
                                    <span className="text-[7px] font-mono text-zinc-700 uppercase">
                                      {isDone ? 'Поток_завершён' : 'Открытие_потока_данных...'}
                                    </span>
                                    <span className={`text-[7px] font-black font-mono ${isDone ? 'text-emerald-500' : 'text-blue-400'}`}>
                                      {state.progress}%
                                    </span>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}

                {/* Подсказка для разработчика — где привязать реальные файлы */}
                <div className="p-4 bg-orange-500/5 border border-orange-500/15 rounded-2xl flex items-start gap-3">
                  <AlertCircle size={13} className="text-orange-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[8px] text-orange-400/70 font-mono leading-relaxed">
                    Для подключения реальных файлов: загрузите их в Supabase Storage, получите публичную ссылку и замените пустые строки <code className="text-orange-400">url: ''</code> в массиве DOWNLOAD_FILES в файле BackendModule.tsx.
                  </p>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

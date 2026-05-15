import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToasts, useAppActions } from '../store/useAppStore';
import { ToastType } from '../types';

const TOAST_CONFIG: Record<ToastType, { icon: React.ReactNode; border: string; bg: string; text: string }> = {
  success: {
    icon: <CheckCircle size={15} />,
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
  },
  error: {
    icon: <XCircle size={15} />,
    border: 'border-red-500/30',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
  },
  warning: {
    icon: <AlertTriangle size={15} />,
    border: 'border-yellow-500/30',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
  },
  info: {
    icon: <Info size={15} />,
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
  },
};

export const ToastContainer: React.FC = () => {
  const toasts = useToasts();
  const { removeToast } = useAppActions();

  return (
    <div className="fixed top-4 right-4 z-[500] flex flex-col gap-2 pointer-events-none max-w-[calc(100vw-2rem)] w-80">
      <AnimatePresence>
        {toasts.map((toast) => {
          const cfg = TOAST_CONFIG[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl ${cfg.bg} ${cfg.border}`}
            >
              <span className={`flex-shrink-0 mt-0.5 ${cfg.text}`}>{cfg.icon}</span>
              <p className={`flex-1 text-[10px] font-bold uppercase tracking-wide leading-relaxed ${cfg.text}`}>
                {toast.message}
              </p>
              <button
                onClick={() => removeToast(toast.id)}
                className={`flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity ${cfg.text}`}
              >
                <X size={13} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { eventService, SystemEvent } from '../services/EventService';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';

export const NotificationCenter = () => {
  const [events, setEvents] = useState<SystemEvent[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newEvent = eventService.generateEvent();
      setEvents(prev => [newEvent, ...prev].slice(0, 3)); // Держим только 3 последних
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-10 right-10 z-[100] space-y-4 pointer-events-none">
      <AnimatePresence>
        {events.map(event => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className="w-80 bg-zinc-950/90 border border-white/10 backdrop-blur-2xl p-5 rounded-3xl shadow-2xl flex gap-4 pointer-events-auto"
          >
            <div className={`mt-1 ${
              event.type === 'ERROR' ? 'text-red-500' : 
              event.type === 'WARNING' ? 'text-yellow-500' : 
              event.type === 'SUCCESS' ? 'text-green-500' : 'text-blue-500'
            }`}>
              {event.type === 'ERROR' && <XCircle size={18} />}
              {event.type === 'WARNING' && <AlertCircle size={18} />}
              {event.type === 'SUCCESS' && <CheckCircle2 size={18} />}
              {event.type === 'INFO' && <Info size={18} />}
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">{event.time}</div>
              <div className="text-[11px] font-bold text-white mt-1 leading-relaxed italic">{event.message}</div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

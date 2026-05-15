import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, MessageSquare, Send, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { ChatMessage } from '../types';
import { useToast } from '../hooks/useToast';

export const AuthModule = () => (
  <div className="space-y-8 p-4">
    <div className="flex items-center gap-4 text-blue-500">
      <Fingerprint size={48} />
      <h2 className="text-white text-3xl font-black italic uppercase tracking-tighter">Neural_Auth</h2>
    </div>
    <div className="h-40 bg-blue-500/5 border border-blue-500/20 rounded-3xl flex items-center justify-center relative overflow-hidden">
      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-blue-500/30">
        <Fingerprint size={80} />
      </motion.div>
      <motion.div
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="absolute inset-x-0 h-1 bg-blue-500 shadow-[0_0_15px_blue]"
      />
    </div>
    <button className="w-full bg-blue-600 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.4em] text-white">
      Authorize_Protocol
    </button>
  </div>
);

export const ChatModule: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tableError, setTableError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let subscription: ReturnType<typeof supabase.channel> | null = null;

    const init = async () => {
      setLoading(true);
      setTableError(null);

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        if (error.message.includes('does not exist') || error.code === '42P01') {
          setTableError('TABLE_MISSING');
        } else {
          setTableError(error.message);
          toast.error('Failed to load messages: ' + error.message);
        }
        setLoading(false);
        return;
      }

      setMessages((data as ChatMessage[]) ?? []);
      setLoading(false);

      subscription = supabase
        .channel('public:messages')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as ChatMessage]);
          }
        )
        .subscribe();
    };

    init();

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = input.trim();
    if (!content || sending || tableError) return;

    setSending(true);
    setInput('');

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('messages').insert({
      content,
      user_id: user?.id ?? null,
      user_email: user?.email ?? 'anonymous',
    });

    if (error) {
      toast.error('Send failed: ' + error.message);
      setInput(content);
    }
    setSending(false);
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-4 p-2">
      <div className="flex items-center gap-4 text-purple-500">
        <MessageSquare size={36} />
        <div>
          <h2 className="text-white text-2xl font-black italic uppercase tracking-tighter">Signal_Nexus</h2>
          <p className="text-[9px] text-purple-500/60 font-bold uppercase tracking-widest">
            Realtime_Encrypted_Channel
          </p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="h-52 bg-black/50 border border-white/5 rounded-3xl p-4 space-y-3 overflow-y-auto font-mono text-[11px] custom-scrollbar"
      >
        {loading && (
          <div className="flex items-center gap-2 text-zinc-600 animate-pulse">
            <RefreshCw size={12} className="animate-spin" />
            <span>Connecting to channel...</span>
          </div>
        )}

        {tableError === 'TABLE_MISSING' && (
          <div className="flex items-start gap-2 text-yellow-400/80">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Table not found.</p>
              <p className="text-zinc-500 text-[10px] mt-1">Run the setup SQL shown below this panel to create the messages table, then reload.</p>
            </div>
          </div>
        )}

        {!loading && !tableError && messages.length === 0 && (
          <div className="text-zinc-700 italic">No signals yet. Send the first one.</div>
        )}

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-purple-500/8 border border-purple-500/15 p-3 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-black text-purple-400/80 uppercase">
                {msg.user_email?.split('@')[0] ?? 'anon'}
              </span>
              <span className="text-[8px] text-zinc-700">{formatTime(msg.created_at)}</span>
            </div>
            <p className="text-white/80">{msg.content}</p>
          </motion.div>
        ))}
      </div>

      <form onSubmit={handleSend} className="flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!!tableError || sending}
          className="flex-1 bg-zinc-900/60 border border-white/10 rounded-2xl px-5 py-3 text-[11px] uppercase font-bold text-white outline-none focus:border-purple-500/50 transition-colors placeholder:text-zinc-700 disabled:opacity-40 min-w-0"
          placeholder={tableError ? 'CHANNEL_UNAVAILABLE' : 'TRANSMIT_SIGNAL...'}
        />
        <button
          type="submit"
          disabled={!!tableError || sending || !input.trim()}
          className="p-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 rounded-2xl text-white shadow-lg shadow-purple-900/20 transition-colors flex-shrink-0"
        >
          {sending ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </form>

      {tableError === 'TABLE_MISSING' && (
        <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl text-[9px] font-mono text-yellow-400/70 space-y-1">
          <p className="font-black text-yellow-400 mb-2">Run this SQL in your Supabase dashboard → SQL Editor:</p>
          <pre className="whitespace-pre-wrap text-[8px] leading-relaxed">{`CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_all" ON public.messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_own" ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);`}</pre>
        </div>
      )}
    </div>
  );
};

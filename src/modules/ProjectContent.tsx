import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, MessageSquare, Send, RefreshCw, AlertCircle, Check, CheckCheck } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { ChatMessage } from '../types';
import { useToast } from '../hooks/useToast';
import { logEvent } from '../services/LogService';

// ── AuthModule (kept from original) ──────────────────────────────────────────

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

// ── Types ─────────────────────────────────────────────────────────────────────

interface PendingMessage {
  tempId: string;
  content: string;
  created_at: string;
  user_email: string;
}

// ── ChatModule ────────────────────────────────────────────────────────────────

const DDL_HINT = `CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_all" ON public.messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_own" ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);`;

export const ChatModule: React.FC = () => {
  const [messages, setMessages]     = useState<ChatMessage[]>([]);
  const [pending, setPending]       = useState<PendingMessage[]>([]);
  const [input, setInput]           = useState('');
  const [sending, setSending]       = useState(false);
  const [loading, setLoading]       = useState(true);
  const [tableError, setTableError] = useState<string | null>(null);
  const [myEmail, setMyEmail]       = useState<string | null>(null);
  const scrollRef                   = useRef<HTMLDivElement>(null);
  const toast                       = useToast();

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => { scrollToBottom(); }, [messages, pending]);

  // Get current user email once
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setMyEmail(user?.email ?? null);
    });
  }, []);

  // Fetch history + subscribe to realtime
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const init = async () => {
      setLoading(true);
      setTableError(null);

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(60);

      if (error) {
        setTableError(
          error.message.includes('does not exist') || error.code === '42P01'
            ? 'TABLE_MISSING'
            : error.message
        );
        setLoading(false);
        return;
      }

      setMessages((data as ChatMessage[]) ?? []);
      setLoading(false);

      channel = supabase
        .channel('public:messages:chat')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          (payload) => {
            const newMsg = payload.new as ChatMessage;
            setMessages((prev) => {
              // Prevent duplicates
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
            // Remove matching pending message once confirmed
            setPending((prev) =>
              prev.filter(
                (p) => !(p.content === newMsg.content && p.user_email === newMsg.user_email)
              )
            );
          }
        )
        .subscribe();
    };

    init();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = input.trim();
    if (!content || sending || tableError) return;

    setSending(true);
    setInput('');

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const tempId   = `pending-${Date.now()}`;
    const userEmail = user?.email ?? 'anonymous';

    // Optimistic message
    const optimistic: PendingMessage = {
      tempId,
      content,
      created_at: new Date().toISOString(),
      user_email: userEmail,
    };
    setPending((prev) => [...prev, optimistic]);

    const { error } = await supabase.from('messages').insert({
      content,
      user_id: user?.id ?? null,
      user_email: userEmail,
    });

    if (error) {
      toast.error('Send failed: ' + error.message);
      setInput(content);
      setPending((prev) => prev.filter((p) => p.tempId !== tempId));
    } else {
      // Log the event (fire-and-forget)
      logEvent({
        event_type: 'INFO',
        message: `Chat message sent`,
        metadata: { length: content.length },
      });
    }
    setSending(false);
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const isMe = (email: string | null) => !!email && email === myEmail;

  return (
    <div className="space-y-4 p-2">
      {/* Header */}
      <div className="flex items-center gap-4 text-purple-500">
        <MessageSquare size={32} />
        <div>
          <h2 className="text-white text-2xl font-black italic uppercase tracking-tighter">Signal_Nexus</h2>
          <p className="text-[9px] text-purple-500/60 font-bold uppercase tracking-widest">
            Realtime_Encrypted_Channel
          </p>
        </div>
      </div>

      {/* Message area */}
      <div
        ref={scrollRef}
        className="h-56 bg-black/50 border border-white/5 rounded-3xl p-4 space-y-2.5 overflow-y-auto font-mono text-[11px] custom-scrollbar"
      >
        {loading && (
          <div className="flex items-center gap-2 text-zinc-600 animate-pulse">
            <RefreshCw size={11} className="animate-spin" />
            <span>Connecting to channel...</span>
          </div>
        )}

        {tableError === 'TABLE_MISSING' && (
          <div className="flex items-start gap-2 text-yellow-400/80">
            <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[10px]">Table not found.</p>
              <p className="text-zinc-500 text-[9px] mt-0.5">Run the DDL below to create the messages table, then reload.</p>
            </div>
          </div>
        )}

        {!loading && !tableError && messages.length === 0 && pending.length === 0 && (
          <div className="text-zinc-700 italic text-[10px]">No signals yet. Send the first one.</div>
        )}

        {/* Confirmed messages */}
        {messages.map((msg) => {
          const mine = isMe(msg.user_email);
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl ${
                  mine
                    ? 'bg-blue-600/15 border border-blue-500/20 rounded-br-sm'
                    : 'bg-purple-500/8 border border-purple-500/12 rounded-bl-sm'
                }`}
              >
                {!mine && (
                  <p className="text-[8px] font-black text-purple-400/80 uppercase mb-1">
                    {msg.user_email?.split('@')[0] ?? 'anon'}
                  </p>
                )}
                <p className="text-white/85 leading-relaxed">{msg.content}</p>
                <div className={`flex items-center gap-1.5 mt-1.5 ${mine ? 'justify-end' : 'justify-start'}`}>
                  <span className="text-[7px] text-zinc-600">{formatTime(msg.created_at)}</span>
                  {mine && <CheckCheck size={10} className="text-blue-400" />}
                  {!mine && <Check size={10} className="text-zinc-600" />}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Optimistic / pending messages */}
        {pending.map((msg) => (
          <motion.div
            key={msg.tempId}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 0.65, y: 0 }}
            className="flex flex-col items-end"
          >
            <div className="max-w-[85%] p-3 rounded-2xl bg-blue-600/8 border border-blue-500/15 rounded-br-sm">
              <p className="text-white/60 leading-relaxed">{msg.content}</p>
              <div className="flex items-center gap-1.5 mt-1.5 justify-end">
                <span className="text-[7px] text-zinc-700">{formatTime(msg.created_at)}</span>
                <RefreshCw size={9} className="text-zinc-600 animate-spin" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input row */}
      <form onSubmit={handleSend} className="flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!!tableError || sending}
          className="flex-1 bg-zinc-900/60 border border-white/10 rounded-2xl px-5 py-3 text-[11px] font-bold text-white outline-none focus:border-purple-500/50 transition-colors placeholder:text-zinc-700 disabled:opacity-40 min-w-0 uppercase tracking-wide"
          placeholder={tableError ? 'CHANNEL_UNAVAILABLE' : 'TRANSMIT_SIGNAL...'}
        />
        <button
          type="submit"
          disabled={!!tableError || sending || !input.trim()}
          className="p-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 rounded-2xl text-white shadow-lg shadow-purple-900/20 transition-colors flex-shrink-0 active:scale-95"
        >
          {sending ? <RefreshCw size={17} className="animate-spin" /> : <Send size={17} />}
        </button>
      </form>

      {/* DDL hint for missing table */}
      <AnimatePresence>
        {tableError === 'TABLE_MISSING' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl text-[9px] font-mono text-yellow-400/70 space-y-1"
          >
            <p className="font-black text-yellow-400 mb-2 text-[10px]">
              Run this in Supabase → SQL Editor:
            </p>
            <pre className="whitespace-pre-wrap text-[8px] leading-relaxed text-yellow-400/60">{DDL_HINT}</pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

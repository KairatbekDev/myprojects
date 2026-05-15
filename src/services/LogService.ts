import { supabase } from '../supabaseClient';

export type LogEventType = 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS' | 'AUTH';

export interface LogEntry {
  event_type: LogEventType;
  message: string;
  metadata?: Record<string, unknown>;
}

/**
 * Central event logging service.
 * Inserts into access_logs table.
 * Always fails silently — logging must NEVER crash the app.
 */
export const logEvent = async (entry: LogEntry): Promise<void> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from('access_logs').insert({
      event_type: entry.event_type,
      message: entry.message,
      user_id: user?.id ?? null,
      metadata: entry.metadata ?? {},
    });
  } catch {
    // Intentional: logging failures must never surface to the user
  }
};

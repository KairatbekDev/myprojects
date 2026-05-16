export interface Project {
  id: number;
  name: string;
  Tech: string;
  icon: string;
  description?: string;
  challenge?: string;
  architecture?: string;
  status?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
}

export type AuthMode = 'login' | 'signup' | 'reset';

export type TabId = 'dashboard' | 'shell' | 'downloads' | 'security' | 'settings';

export interface TabItem {
  id: TabId;
  label: string;
}

export type ThreatLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export type Theme = 'dark' | 'light';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastNotification {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export interface AccessLog {
  id: string;
  event_type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS' | 'AUTH';
  message: string;
  user_id: string | null;
  ip_address: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string | null;
  user_email: string | null;
  content: string;
  created_at: string;
}

export interface LogCount {
  event_type: string;
  count: number;
}

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

export type TabId = 'dashboard' | 'shell' | 'security' | 'settings';

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

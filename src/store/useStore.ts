import { create } from 'zustand';

// Строгая типизация — признак профи
export type SystemStatus = 'STABLE' | 'WARNING' | 'CRITICAL';

interface SystemState {
  isExploiting: boolean;
  status: SystemStatus;
  terminalLogs: string[];
  
  // Объединяем экшены в один объект — это стандарт для чистого кода
  actions: {
    addLog: (msg: string) => void;
    setExploit: (val: boolean) => void;
    setStatus: (status: SystemStatus) => void;
    clearTerminal: () => void;
  }
}

export const useStore = create<SystemState>((set) => ({
  isExploiting: false,
  status: 'STABLE',
  terminalLogs: ['[SYSTEM]: KAIRAT_OS_V5_ONLINE'],

  actions: {
    addLog: (msg) => set((state) => ({ 
      terminalLogs: [...state.terminalLogs, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-50) 
    })),
    
    setExploit: (val) => set({ 
      isExploiting: val,
      status: val ? 'CRITICAL' : 'STABLE' 
    }),

    setStatus: (status) => set({ status }),

    clearTerminal: () => set({ terminalLogs: ['> SYSTEM_BUFFER_CLEARED'] })
  }
}));

// Селектор для удобного доступа к экшенам
export const useSystemActions = () => useStore((s) => s.actions);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SystemStatus = 'STABLE' | 'WARNING' | 'CRITICAL';

interface SystemState {
  isExploiting: boolean;
  status: SystemStatus;
  terminalLogs: string[];
  actions: {
    addLog: (msg: string) => void;
    setExploit: (val: boolean) => void;
    setStatus: (status: SystemStatus) => void;
    clearTerminal: () => void;
  };
}

export const useStore = create<SystemState>()(
  persist(
    (set) => ({
      isExploiting: false,
      status: 'STABLE',
      terminalLogs: ['[SYSTEM]: KAIRAT_OS_V5_ONLINE'],

      actions: {
        addLog: (msg) =>
          set((state) => ({
            terminalLogs: [
              ...state.terminalLogs,
              `[${new Date().toLocaleTimeString()}] ${msg}`,
            ].slice(-50),
          })),

        setExploit: (val) =>
          set({
            isExploiting: val,
            status: val ? 'CRITICAL' : 'STABLE',
          }),

        setStatus: (status) => set({ status }),

        clearTerminal: () => set({ terminalLogs: ['> SYSTEM_BUFFER_CLEARED'] }),
      },
    }),
    {
      name: 'kairat-terminal-v1',
      // Only persist the log history — actions are always reconstructed from code
      partialize: (s) => ({ terminalLogs: s.terminalLogs }),
      // Merge persisted logs into current state without overwriting actions
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<SystemState>),
      }),
    }
  )
);

export const useSystemActions = () => useStore((s) => s.actions);

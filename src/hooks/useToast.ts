import { useAppActions } from '../store/useAppStore';
import { ToastType } from '../types';

export const useToast = () => {
  const { addToast } = useAppActions();

  return {
    success: (msg: string) => addToast(msg, 'success'),
    error: (msg: string) => addToast(msg, 'error'),
    info: (msg: string) => addToast(msg, 'info'),
    warn: (msg: string) => addToast(msg, 'warning'),
    show: (msg: string, type: ToastType = 'info') => addToast(msg, type),
  };
};

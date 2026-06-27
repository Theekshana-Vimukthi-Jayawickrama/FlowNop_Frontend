import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  show: (message: string, type?: 'success' | 'error' | 'info', duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'info', duration = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }
    },
    [dismiss]
  );

  const success = useCallback((message: string, duration?: number) => show(message, 'success', duration), [show]);
  const error = useCallback((message: string, duration?: number) => show(message, 'error', duration), [show]);
  const info = useCallback((message: string, duration?: number) => show(message, 'info', duration), [show]);

  return (
    <ToastContext.Provider value={{ show, success, error, info, dismiss }}>
      {children}
      {/* Toast Overlay Container */}
      <div 
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none select-none max-w-sm w-full"
        id="toast-container"
      >
        {toasts.map((toast) => {
          let bgColor = 'bg-surface/90 border-border-color text-text-main';
          let Icon = Info;
          let iconColor = 'text-primary';

          if (toast.type === 'success') {
            bgColor = 'bg-surface/95 border-success/30 text-text-main dark:bg-slate-900/95';
            Icon = CheckCircle;
            iconColor = 'text-success';
          } else if (toast.type === 'error') {
            bgColor = 'bg-surface/95 border-danger/30 text-text-main dark:bg-slate-900/95';
            Icon = AlertCircle;
            iconColor = 'text-danger';
          }

          return (
            <div
              key={toast.id}
              className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md pointer-events-auto transition-all duration-300 animate-slide-in ${bgColor}`}
              role="alert"
              id={`toast-${toast.type}-${toast.id}`}
            >
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 text-xs font-semibold leading-relaxed break-words">
                {toast.message}
              </div>
              <button
                onClick={() => dismiss(toast.id)}
                className="p-0.5 rounded-md hover:bg-muted text-text-muted hover:text-text-main transition-colors cursor-pointer shrink-0"
                type="button"
                aria-label="Dismiss toast"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;

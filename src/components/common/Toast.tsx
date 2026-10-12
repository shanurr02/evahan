import React, { createContext, useContext, useState } from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';
import { ToastMessage } from '../../types';

interface ToastContextType {
  showToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const icons = {
            success: <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />,
            warning: <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />,
            error: <AlertOctagon className="h-4 w-4 text-red-500 shrink-0" />,
            info: <Info className="h-4 w-4 text-red-400 shrink-0" />,
          };

          const borders = {
            success: 'border-emerald-800/60 bg-[#080d09]/95 text-emerald-200',
            warning: 'border-amber-800/60 bg-[#120e06]/95 text-amber-200',
            error: 'border-red-700/70 bg-[#140608]/95 text-red-200 shadow-lg shadow-red-950/40',
            info: 'border-red-900/60 bg-[#0e0708]/95 text-red-200',
          };

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start justify-between rounded-lg border p-2.5 shadow-xl backdrop-blur-md transition-all ${
                borders[toast.type]
              }`}
            >
              <div className="flex items-start gap-2.5">
                {icons[toast.type]}
                <div>
                  <h4 className="text-xs font-bold leading-none">{toast.title}</h4>
                  <p className="mt-1 text-[11px] opacity-80 leading-tight">{toast.message}</p>
                </div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-zinc-400 hover:text-white ml-2 p-0.5"
              >
                <X className="h-3 w-3" />
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
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

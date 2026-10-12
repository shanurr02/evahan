import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: 'md' | 'lg' | 'xl';
  actions?: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = 'lg',
  actions,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClass = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }[width];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity dark:bg-black/75"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-6">
        <div
          className={`w-screen ${widthClass} border-l border-slate-200 bg-white text-slate-800 shadow-2xl flex flex-col dark:border-[#222c42] dark:bg-[#0d1322] dark:text-zinc-100`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 dark:border-[#1c263d]">
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight dark:text-white">{title}</h2>
              {subtitle && <p className="text-xs text-slate-500 dark:text-zinc-400">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2">
              {actions}
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors dark:text-zinc-400 dark:hover:bg-[#151e33] dark:hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 text-xs">{children}</div>
        </div>
      </div>
    </div>
  );
};

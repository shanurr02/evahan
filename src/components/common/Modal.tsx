import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity dark:bg-black/75"
        onClick={onClose}
      />

      {/* Dialog box */}
      <div
        className={`relative w-full ${widthClasses[maxWidth]} rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xl transition-all z-10 max-h-[90vh] flex flex-col text-slate-800 dark:border-[#222c42] dark:bg-[#0d1322] dark:text-zinc-100`}
      >
        <div className="flex items-start justify-between border-b border-slate-200 pb-3 dark:border-[#1c263d]">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight dark:text-white">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors dark:text-zinc-400 dark:hover:bg-[#151e33] dark:hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 overflow-y-auto pr-1 text-xs">{children}</div>
      </div>
    </div>
  );
};

import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts?: ToastMessage[];
  onDismiss?: (id: string) => void;
  // Single toast props
  show?: boolean;
  message?: string;
  type?: 'success' | 'warning' | 'error' | 'info';
  onClose?: () => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts = [], onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full no-print">
      {toasts.map((toast) => {
        const bg =
          toast.type === 'success'
            ? 'bg-emerald-900/90 text-emerald-100 border-emerald-700'
            : toast.type === 'warning'
            ? 'bg-amber-900/90 text-amber-100 border-amber-700'
            : toast.type === 'error'
            ? 'bg-rose-900/90 text-rose-100 border-rose-700'
            : 'bg-slate-900/90 text-slate-100 border-slate-700';

        const Icon =
          toast.type === 'success'
            ? CheckCircle2
            : toast.type === 'warning'
            ? AlertTriangle
            : toast.type === 'error'
            ? XCircle
            : Info;

        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-3 ${bg}`}
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium leading-relaxed flex-1">{toast.message}</p>
            {onDismiss && (
              <button
                onClick={() => onDismiss(toast.id)}
                className="p-1 rounded-md hover:bg-white/10 transition text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const Toast: React.FC<ToastProps> = ({
  show = false,
  message = '',
  type = 'info',
  onClose,
}) => {
  useEffect(() => {
    if (show && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show || !message) return null;

  const bg =
    type === 'success'
      ? 'bg-emerald-900/95 text-emerald-100 border-emerald-700'
      : type === 'warning'
      ? 'bg-amber-900/95 text-amber-100 border-amber-700'
      : type === 'error'
      ? 'bg-rose-900/95 text-rose-100 border-rose-700'
      : 'bg-slate-900/95 text-slate-100 border-slate-700';

  const Icon =
    type === 'success'
      ? CheckCircle2
      : type === 'warning'
      ? AlertTriangle
      : type === 'error'
      ? XCircle
      : Info;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full no-print">
      <div
        className={`flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-3 ${bg}`}
      >
        <Icon className="w-5 h-5 shrink-0 mt-0.5" />
        <p className="text-sm font-medium leading-relaxed flex-1">{message}</p>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-white/10 transition text-white/70 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

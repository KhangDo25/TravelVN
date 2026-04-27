import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' },
    error: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
    info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' }
  };

  const { icon: Icon, color, bg, border } = config[type];

  return (
    <div className={`fixed top-24 right-4 z-[100] flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm animate-in slide-in-from-right fade-in duration-300 ${bg} ${border}`}>
      <Icon className={`h-5 w-5 mt-0.5 ${color}`} />
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-800">{message}</p>
      </div>
      <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
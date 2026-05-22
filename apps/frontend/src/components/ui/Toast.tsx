import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const TYPE_CONFIG = {
    success: {
      icon: CheckCircle,
      bg: 'from-emerald-500/20 to-emerald-600/20',
      border: 'border-emerald-500/50',
      iconColor: 'text-emerald-400'
    },
    error: {
      icon: XCircle,
      bg: 'from-red-500/20 to-red-600/20',
      border: 'border-red-500/50',
      iconColor: 'text-red-400'
    },
    warning: {
      icon: AlertCircle,
      bg: 'from-amber-500/20 to-amber-600/20',
      border: 'border-amber-500/50',
      iconColor: 'text-amber-400'
    },
    info: {
      icon: Info,
      bg: 'from-blue-500/20 to-blue-600/20',
      border: 'border-blue-500/50',
      iconColor: 'text-blue-400'
    }
  };

  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className={`p-4 bg-gradient-to-r ${config.bg} backdrop-blur-xl border ${config.border} rounded-xl shadow-lg max-w-sm`}
        >
          <div className="flex items-start gap-3">
            <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white">{title}</h4>
              {message && (
                <p className="text-sm text-slate-300 mt-1">{message}</p>
              )}
            </div>
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => onClose(id), 300);
              }}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
  }>;
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
};

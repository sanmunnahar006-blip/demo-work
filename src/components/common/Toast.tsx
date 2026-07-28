import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className={`flex items-center justify-between p-4 rounded-2xl border backdrop-blur-xl shadow-2xl ${
          type === 'success'
            ? 'bg-[#0F160C] border-[#8EF012]/40 text-white'
            : type === 'error'
            ? 'bg-[#1E1012] border-red-500/40 text-white'
            : type === 'warning'
            ? 'bg-[#1E1910] border-amber-500/40 text-white'
            : 'bg-[#101520] border-blue-500/40 text-white'
        }`}
      >
        <div className="flex items-center gap-3">
          {type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#8EF012] shrink-0" />}
          {type === 'error' && <XCircle className="w-5 h-5 text-red-400 shrink-0" />}
          {type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />}
          {type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
          <p className="text-xs font-semibold">{message}</p>
        </div>

        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors ml-3"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
};

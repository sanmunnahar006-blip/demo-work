import React from 'react';
import { X, Bell, CheckCircle2, AlertCircle, Clock, Info } from 'lucide-react';
import { Notification } from '../../types';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs font-sans">
      <div className="bg-[#0F131C] border-l border-[#222F47] w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#222F47] flex items-center justify-between bg-[#121724]">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#8EF012]" />
            <h3 className="text-sm font-bold text-white">System Notifications</h3>
          </div>

          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button onClick={onClearAll} className="text-[11px] text-gray-400 hover:text-white">
                Clear All
              </button>
            )}
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500">
              No unread notifications.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => onMarkAsRead(n.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  n.isRead
                    ? 'bg-[#121724] border-[#222B3D] opacity-60'
                    : 'bg-[#161C2B] border-[#8EF012]/40 shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-xs font-bold text-white">{n.title}</h4>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed">{n.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

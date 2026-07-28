import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Plus, 
  Menu, 
  Lock, 
  Globe, 
  Sparkles,
  UserPlus,
  FolderPlus,
  DollarSign,
  CheckSquare
} from 'lucide-react';
import { NavigationTab } from './Sidebar';

interface HeaderProps {
  activeTab?: NavigationTab;
  onOpenSearch?: () => void;
  onOpenNotifications?: () => void;
  onLock?: () => void;
  onLockSession?: () => void;
  onOpenMobileSidebar?: () => void;
  unreadNotificationsCount?: number;
  unreadCount?: number;
  onQuickAction?: (action: 'add-client' | 'add-project' | 'add-payment' | 'add-task') => void;
  agencyName?: string;
  timeZone?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab = 'dashboard',
  onOpenSearch = () => {},
  onOpenNotifications = () => {},
  onLock,
  onLockSession,
  onOpenMobileSidebar = () => {},
  unreadNotificationsCount,
  unreadCount,
  onQuickAction = (_action: 'add-client' | 'add-project' | 'add-payment' | 'add-task') => {},
  agencyName = 'SOLVEX',
  timeZone = 'America/Los_Angeles',
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [showQuickAddMenu, setShowQuickAddMenu] = useState(false);

  const handleLock = onLock || onLockSession || (() => {});
  const effectiveUnread = unreadNotificationsCount ?? unreadCount ?? 0;

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          timeZone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [timeZone]);

  const getTabTitle = (tab?: NavigationTab | string) => {
    switch (tab) {
      case 'dashboard': return 'Executive Overview';
      case 'clients': return 'Client Directory & CRM';
      case 'projects': return 'Project Engineering Portfolio';
      case 'payments': return 'Financial Ledger & Invoices';
      case 'timeline': return 'Client Communications Timeline';
      case 'tasks': return 'Task Operations';
      case 'files': return 'Asset & Document Manager';
      case 'reports': return 'Business Analytics & Reports';
      case 'audit': return 'Security & Audit Logs';
      case 'settings': return 'System Settings & Backups';
      default: return 'Overview';
    }
  };

  return (
    <header className="h-18 bg-[#0B0E17] border-b border-[#1C2333] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 font-sans backdrop-blur-xl bg-opacity-90">
      {/* Left: Mobile Menu & Page Title */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#161D2E] transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-sm sm:text-base font-bold text-white tracking-wide capitalize flex items-center gap-2">
            {getTabTitle(activeTab)}
          </h2>
          <p className="text-[11px] text-gray-400 hidden sm:block">
            {agencyName} Enterprise Operations Engine
          </p>
        </div>
      </div>

      {/* Center: Global Search Bar Trigger */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-2 bg-[#121724] border border-[#222B3D] hover:border-[#8EF012]/50 rounded-xl text-gray-400 text-xs transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-gray-500 group-hover:text-[#8EF012] transition-colors" />
            <span>Search clients, projects, invoices, phone numbers...</span>
          </div>
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-gray-400 bg-[#1A2234] border border-[#2A354E] rounded">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search button on small screens */}
        <button
          onClick={onOpenSearch}
          className="md:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#161D2E]"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Live Clock Indicator */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-[#121724] border border-[#222B3D] rounded-xl text-xs font-mono text-gray-300">
          <Globe className="w-3.5 h-3.5 text-[#8EF012]" />
          <span>{currentTime || '00:00:00 AM'}</span>
        </div>

        {/* Quick Add Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowQuickAddMenu(!showQuickAddMenu)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#8EF012] hover:bg-[#a2f734] text-black font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(142,240,18,0.2)] transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">Quick Add</span>
          </button>

          {showQuickAddMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-[#121724] border border-[#222B3D] rounded-xl shadow-2xl py-1.5 z-50 text-xs text-gray-300 animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => { onQuickAction('add-client'); setShowQuickAddMenu(false); }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-[#1C2438] hover:text-[#8EF012] text-left transition-colors"
              >
                <UserPlus className="w-4 h-4 text-[#8EF012]" />
                <span>New Client</span>
              </button>
              <button
                onClick={() => { onQuickAction('add-project'); setShowQuickAddMenu(false); }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-[#1C2438] hover:text-[#8EF012] text-left transition-colors"
              >
                <FolderPlus className="w-4 h-4 text-emerald-400" />
                <span>New Project</span>
              </button>
              <button
                onClick={() => { onQuickAction('add-payment'); setShowQuickAddMenu(false); }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-[#1C2438] hover:text-[#8EF012] text-left transition-colors"
              >
                <DollarSign className="w-4 h-4 text-amber-400" />
                <span>Record Payment</span>
              </button>
              <button
                onClick={() => { onQuickAction('add-task'); setShowQuickAddMenu(false); }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-[#1C2438] hover:text-[#8EF012] text-left transition-colors"
              >
                <CheckSquare className="w-4 h-4 text-blue-400" />
                <span>Create Task</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Icon Button */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2.5 bg-[#121724] hover:bg-[#1A2234] border border-[#222B3D] text-gray-300 rounded-xl transition-colors"
          title="System Notifications"
        >
          <Bell className="w-4 h-4" />
          {effectiveUnread > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#8EF012] text-black text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
              {effectiveUnread}
            </span>
          )}
        </button>

        {/* Master Lock Session Button */}
        <button
          onClick={handleLock}
          className="p-2.5 bg-[#121724] hover:bg-red-950/40 hover:border-red-800/40 border border-[#222B3D] text-gray-400 hover:text-red-400 rounded-xl transition-colors"
          title="Lock Master Session"
        >
          <Lock className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

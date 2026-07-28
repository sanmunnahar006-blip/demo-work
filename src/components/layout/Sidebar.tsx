import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  CreditCard, 
  Clock, 
  CheckSquare, 
  FolderCheck, 
  BarChart3, 
  ShieldAlert, 
  Settings, 
  LogOut, 
  Sparkles,
  ChevronRight,
  X
} from 'lucide-react';

export type NavigationTab = 
  | 'dashboard' 
  | 'clients' 
  | 'projects' 
  | 'payments' 
  | 'timeline' 
  | 'tasks' 
  | 'files' 
  | 'reports' 
  | 'audit' 
  | 'settings';

interface SidebarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  onLock?: () => void;
  onLockSession?: () => void;
  isOpenMobile?: boolean;
  setIsOpenMobile?: (open: boolean) => void;
  unreadNotificationsCount?: number;
  activeProjectsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onLock,
  onLockSession,
  isOpenMobile = false,
  setIsOpenMobile = (_open: boolean) => {},
  activeProjectsCount = 0,
}) => {
  const handleLock = onLock || onLockSession || (() => {});
  const safeSetIsOpenMobile = typeof setIsOpenMobile === 'function' ? setIsOpenMobile : () => {};

  const navItems: Array<{ id: NavigationTab; label: string; icon: any; badge?: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'projects', label: 'Projects', icon: Briefcase, badge: activeProjectsCount ? String(activeProjectsCount) : undefined },
    { id: 'payments', label: 'Payments & Invoices', icon: CreditCard },
    { id: 'timeline', label: 'Communication Timeline', icon: Clock },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'files', label: 'File Manager', icon: FolderCheck },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'audit', label: 'Audit Logs', icon: ShieldAlert },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (tab: NavigationTab) => {
    setActiveTab(tab);
    safeSetIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div 
          onClick={() => safeSetIsOpenMobile(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Main Container */}
      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-50 w-64 bg-[#0A0D14] border-r border-[#1C2333] flex flex-col transition-transform duration-300 ease-in-out font-sans ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-18 px-5 border-b border-[#1C2333] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#131826] border border-[#8EF012]/40 flex items-center justify-center shadow-[0_0_15px_rgba(142,240,18,0.2)]">
              <Sparkles className="w-5 h-5 text-[#8EF012]" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wider text-white uppercase flex items-center gap-1.5">
                SOLVEX
                <span className="w-2 h-2 rounded-full bg-[#8EF012] animate-pulse" />
              </h1>
              <p className="text-[10px] text-gray-400 font-medium tracking-tight">Enterprise Client Suite</p>
            </div>
          </div>

          <button
            onClick={() => safeSetIsOpenMobile(false)}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1A2130]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
          <div className="px-3 pb-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            Core Operations
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id as NavigationTab)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                  isActive
                    ? 'bg-[#8EF012] text-black shadow-[0_0_20px_rgba(142,240,18,0.2)] font-bold'
                    : 'text-gray-400 hover:text-white hover:bg-[#131926]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-black' : 'text-gray-400 group-hover:text-[#8EF012]'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-black text-[#8EF012]' : 'bg-[#1C2333] text-gray-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Lock System & Footer */}
        <div className="p-3 border-t border-[#1C2333] space-y-2 shrink-0">
          <div className="bg-[#101420] border border-[#1E2638] rounded-xl p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Security Mode</span>
              <span className="text-[#8EF012] font-mono text-[10px] font-semibold bg-[#8EF012]/10 px-1.5 py-0.5 rounded border border-[#8EF012]/30">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Master Password Session</p>
          </div>

          <button
            onClick={handleLock}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-950/30 hover:bg-red-900/40 border border-red-800/40 text-red-300 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Lock Session</span>
          </button>
        </div>
      </aside>
    </>
  );
};

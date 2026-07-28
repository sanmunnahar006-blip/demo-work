import React from 'react';
import { 
  Users, 
  Briefcase, 
  DollarSign, 
  AlertCircle, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  FileText
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { DashboardStats, Project, Payment } from '../../types';

interface DashboardProps {
  stats: DashboardStats | null;
  loading: boolean;
  onNavigate: (tab: any) => void;
  onViewInvoice?: (payment: Payment) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  loading,
  onNavigate,
  onViewInvoice,
}) => {
  if (loading || !stats) {
    return (
      <div className="p-8 space-y-6 animate-pulse font-sans">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-[#121724] border border-[#222B3D] rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-[#121724] border border-[#222B3D] rounded-2xl" />
          <div className="h-80 bg-[#121724] border border-[#222B3D] rounded-2xl" />
        </div>
      </div>
    );
  }

  // Monthly Revenue Data Simulation for Charts
  const revenueChartData = [
    { month: 'Jan', revenue: 32500, due: 0 },
    { month: 'Feb', revenue: 45000, due: 10000 },
    { month: 'Mar', revenue: 60000, due: 15000 },
    { month: 'Apr', revenue: 35000, due: 5000 },
    { month: 'May', revenue: 30000, due: 12000 },
    { month: 'Jun', revenue: 25000, due: 8000 },
    { month: 'Jul', revenue: stats.monthlyRevenue || 57500, due: stats.totalDue || 22000 },
  ];

  // Pie chart project breakdown
  const projectBreakdownData = [
    { name: 'Running', value: stats.runningProjects || 3, color: '#8EF012' },
    { name: 'Completed', value: stats.completedProjects || 1, color: '#10B981' },
    { name: 'Pending', value: stats.pendingProjects || 1, color: '#F59E0B' },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 font-sans max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#121824] via-[#161F33] to-[#0E131F] border border-[#222F47] rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#8EF012]/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8EF012]/10 border border-[#8EF012]/30 text-[#8EF012] text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SOLVEX Internal Operations Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Executive Agency Dashboard
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Real-time portfolio metrics, financial balances, active project deadlines, and communication records.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('clients')}
              className="px-4 py-2.5 bg-[#8EF012] hover:bg-[#a2f734] text-black font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(142,240,18,0.25)] transition-all flex items-center gap-2"
            >
              <span>Manage Clients</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('projects')}
              className="px-4 py-2.5 bg-[#1C2538] hover:bg-[#25324C] border border-[#2D3C5C] text-white font-bold text-xs rounded-xl transition-all"
            >
              View Projects
            </button>
          </div>
        </div>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Clients */}
        <div 
          onClick={() => onNavigate('clients')}
          className="bg-[#121724] border border-[#222B3D] hover:border-[#8EF012]/40 rounded-2xl p-5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Total Clients</span>
            <div className="w-9 h-9 rounded-xl bg-[#1C2438] text-[#8EF012] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-white">{stats.totalClients}</div>
            <div className="flex items-center gap-2 mt-1.5 text-[11px]">
              <span className="text-[#8EF012] font-semibold">{stats.activeClients} Active</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400">{stats.inactiveClients} Lead/Hold</span>
            </div>
          </div>
        </div>

        {/* Running Projects */}
        <div 
          onClick={() => onNavigate('projects')}
          className="bg-[#121724] border border-[#222B3D] hover:border-[#8EF012]/40 rounded-2xl p-5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Running Projects</span>
            <div className="w-9 h-9 rounded-xl bg-[#1C2438] text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-white">{stats.runningProjects}</div>
            <div className="flex items-center gap-2 mt-1.5 text-[11px]">
              <span className="text-emerald-400 font-semibold">{stats.completedProjects} Delivered</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400">{stats.pendingProjects} Pending</span>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-[#121724] border border-[#222B3D] rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Total Collected</span>
            <div className="w-9 h-9 rounded-xl bg-[#1C2438] text-[#8EF012] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-white">{formatCurrency(stats.totalRevenue)}</div>
            <div className="flex items-center gap-1 mt-1.5 text-[11px] text-[#8EF012]">
              <TrendingUp className="w-3 h-3" />
              <span>Contract Paid Revenue</span>
            </div>
          </div>
        </div>

        {/* Total Outstanding Due */}
        <div className="bg-[#121724] border border-[#222B3D] rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Outstanding Due</span>
            <div className="w-9 h-9 rounded-xl bg-[#1C2438] text-amber-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-amber-400">{formatCurrency(stats.totalDue)}</div>
            <div className="flex items-center gap-1 mt-1.5 text-[11px] text-amber-400">
              <span>Pending Client Collections</span>
            </div>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-[#121724] border border-[#222B3D] rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Monthly Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-[#1C2438] text-blue-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-white">{formatCurrency(stats.monthlyRevenue)}</div>
            <div className="flex items-center gap-1 mt-1.5 text-[11px] text-gray-400">
              <span>Current Month Collections</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Revenue Growth Chart */}
        <div className="lg:col-span-2 bg-[#121724] border border-[#222B3D] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Revenue Trajectory & Due Balances</h3>
              <p className="text-xs text-gray-400 mt-0.5">Historical monthly collections versus active pending dues</p>
            </div>
            <span className="text-[10px] font-mono text-[#8EF012] bg-[#8EF012]/10 border border-[#8EF012]/30 px-2.5 py-1 rounded-lg">
              REAL-TIME SYNC
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8EF012" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8EF012" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#4B5563" fontSize={11} tickLine={false} />
                <YAxis stroke="#4B5563" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F131C', borderColor: '#222B3D', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  formatter={(value: any) => [`$${value.toLocaleString()}`, 'Amount']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8EF012" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Breakdown Chart */}
        <div className="bg-[#121724] border border-[#222B3D] rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide mb-1">Project Portfolio Distribution</h3>
            <p className="text-xs text-gray-400 mb-4">Breakdown of agency projects by execution status</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {projectBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0F131C', borderColor: '#222B3D', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#1C2333] text-center">
            {projectBreakdownData.map((item) => (
              <div key={item.name} className="p-2 rounded-xl bg-[#171D2B]">
                <div className="text-[10px] text-gray-400">{item.name}</div>
                <div className="text-sm font-bold mt-0.5" style={{ color: item.color }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower Row: Upcoming Deadlines & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <div className="bg-[#121724] border border-[#222B3D] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#8EF012]" />
              <h3 className="text-sm font-bold text-white">Upcoming Project Milestones</h3>
            </div>
            <button
              onClick={() => onNavigate('projects')}
              className="text-xs text-[#8EF012] hover:underline font-semibold"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {stats.upcomingDeadlines.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-500">No pending deadlines</div>
            ) : (
              stats.upcomingDeadlines.map((p) => (
                <div key={p.id} className="p-3.5 bg-[#171D2B] border border-[#222B3D] rounded-xl flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">{p.clientName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/40 text-amber-300 font-semibold block">
                      {p.deadline}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-1 block">Due: {formatCurrency(p.dueAmount)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-[#121724] border border-[#222B3D] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Recent Payment Transactions</h3>
            </div>
            <button
              onClick={() => onNavigate('payments')}
              className="text-xs text-[#8EF012] hover:underline font-semibold"
            >
              Full History
            </button>
          </div>

          <div className="space-y-3">
            {stats.recentPayments.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-500">No payment records</div>
            ) : (
              stats.recentPayments.map((pay) => (
                <div key={pay.id} className="p-3.5 bg-[#171D2B] border border-[#222B3D] rounded-xl flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">{pay.invoiceNumber}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#8EF012]/10 text-[#8EF012] border border-[#8EF012]/30">
                        {pay.paymentMethod}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">{pay.clientName}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-bold text-emerald-400">{formatCurrency(pay.amount)}</div>
                      <div className="text-[10px] text-gray-500">{pay.date}</div>
                    </div>

                    {onViewInvoice && (
                      <button
                        onClick={() => onViewInvoice(pay)}
                        className="p-1.5 rounded-lg bg-[#222B3D] hover:bg-[#2F3C56] text-gray-300 hover:text-white transition-colors"
                        title="Generate Printable Invoice PDF"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

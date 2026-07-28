import React from 'react';
import { BarChart3, Download, TrendingUp, DollarSign, Users, Briefcase, Calendar } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Client, Project, Payment } from '../../types';

interface ReportsViewProps {
  clients: Client[];
  projects: Project[];
  payments: Payment[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  clients,
  projects,
  payments,
}) => {
  const totalContractVal = projects.reduce((acc, p) => acc + p.budget, 0);
  const totalPaidVal = projects.reduce((acc, p) => acc + p.paidAmount, 0);
  const totalDueVal = projects.reduce((acc, p) => acc + p.dueAmount, 0);

  const monthlyReportData = [
    { month: 'Q1 2026', revenue: 137500, projects: 2 },
    { month: 'Q2 2026', revenue: 90000, projects: 2 },
    { month: 'Q3 2026 (Proj)', revenue: 86000, projects: 1 },
  ];

  const sourceData = [
    { name: 'Referral', count: clients.filter(c => c.source === 'Referral').length || 1, color: '#8EF012' },
    { name: 'Website', count: clients.filter(c => c.source === 'Website').length || 1, color: '#3B82F6' },
    { name: 'LinkedIn', count: clients.filter(c => c.source === 'LinkedIn').length || 1, color: '#A855F7' },
    { name: 'Organic', count: clients.filter(c => c.source === 'Organic').length || 1, color: '#10B981' },
  ];

  const exportReportCSV = () => {
    const csvData = [
      ['Report Category', 'Value'],
      ['Total Contract Volume', totalContractVal],
      ['Total Collected Revenue', totalPaidVal],
      ['Total Outstanding Due', totalDueVal],
      ['Active Clients Count', clients.length],
      ['Active Projects Count', projects.length],
    ].map(e => e.join(',')).join('\n');

    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvData);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `solvex_executive_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 font-sans max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#1C2333]">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#8EF012]" />
            Business Analytics & Executive Reports
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Revenue metrics, quarterly contract growth, client acquisition breakdown, and financial performance
          </p>
        </div>

        <button
          onClick={exportReportCSV}
          className="px-4 py-2 bg-[#8EF012] hover:bg-[#a2f734] text-black font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(142,240,18,0.25)] transition-all flex items-center gap-1.5"
        >
          <Download className="w-4 h-4 stroke-[3]" />
          <span>Export Executive Summary CSV</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-[#121724] border border-[#222B3D] rounded-2xl">
          <span className="text-xs font-medium text-gray-400 uppercase">Total Portfolio Value</span>
          <div className="text-2xl font-black text-white mt-1">${totalContractVal.toLocaleString()}</div>
        </div>
        <div className="p-5 bg-[#121724] border border-[#222B3D] rounded-2xl">
          <span className="text-xs font-medium text-gray-400 uppercase">Total Collections</span>
          <div className="text-2xl font-black text-[#8EF012] mt-1">${totalPaidVal.toLocaleString()}</div>
        </div>
        <div className="p-5 bg-[#121724] border border-[#222B3D] rounded-2xl">
          <span className="text-xs font-medium text-gray-400 uppercase">Pending Receivable Due</span>
          <div className="text-2xl font-black text-amber-400 mt-1">${totalDueVal.toLocaleString()}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-[#121724] border border-[#222B3D] rounded-2xl">
          <h3 className="text-sm font-bold text-white mb-4">Quarterly Revenue Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyReportData}>
                <XAxis dataKey="month" stroke="#4B5563" fontSize={11} />
                <YAxis stroke="#4B5563" fontSize={11} tickFormatter={(v) => `$${v/1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#0F131C', borderColor: '#222B3D', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="revenue" fill="#8EF012" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 bg-[#121724] border border-[#222B3D] rounded-2xl">
          <h3 className="text-sm font-bold text-white mb-4">Client Acquisition Source Channels</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sourceData} cx="50%" cy="50%" outerRadius={80} dataKey="count" label={({ name }) => name}>
                  {sourceData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0F131C', borderColor: '#222B3D', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

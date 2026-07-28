import React, { useState } from 'react';
import { 
  CreditCard, 
  Search, 
  Plus, 
  FileText, 
  Printer, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { Payment, Project } from '../../types';

interface PaymentsListProps {
  payments: Payment[];
  projects: Project[];
  loading: boolean;
  onRecordPayment: () => void;
  onViewInvoice: (payment: Payment) => void;
  onDeletePayment: (id: string) => void;
}

export const PaymentsList: React.FC<PaymentsListProps> = ({
  payments,
  projects,
  loading,
  onRecordPayment,
  onViewInvoice,
  onDeletePayment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredPayments = payments.filter((p) => {
    const matchesSearch = 
      p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.transactionId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalCollected = payments.filter(p => p.status === 'Paid').reduce((acc, p) => acc + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'Pending').reduce((acc, p) => acc + p.amount, 0);

  const formatCurrency = (val: number) => `$${val.toLocaleString()}`;

  return (
    <div className="p-4 sm:p-8 space-y-6 font-sans max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#1C2333]">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#8EF012]" />
            Financial Ledger & Invoices
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Track client payment milestones, transaction receipts, and printable PDF invoices
          </p>
        </div>

        <button
          onClick={onRecordPayment}
          className="px-4 py-2 bg-[#8EF012] hover:bg-[#a2f734] text-black font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(142,240,18,0.25)] transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Record New Payment</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-[#121724] border border-[#222B3D] rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-gray-400">Total Confirmed Collections</span>
            <div className="text-2xl font-black text-[#8EF012] mt-1">{formatCurrency(totalCollected)}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#1C2438] text-[#8EF012] flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-[#121724] border border-[#222B3D] rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-gray-400">Pending Invoice Verifications</span>
            <div className="text-2xl font-black text-amber-400 mt-1">{formatCurrency(totalPending)}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#1C2438] text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#121724] border border-[#222B3D] rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search invoice #, client, transaction..."
            className="w-full pl-10 pr-4 py-2 bg-[#171D2B] border border-[#2A344A] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#8EF012]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-[#171D2B] border border-[#2A344A] rounded-xl text-xs text-white focus:outline-none focus:border-[#8EF012]"
        >
          <option value="ALL">All Payment Statuses</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="h-64 bg-[#121724] border border-[#222B3D] rounded-2xl animate-pulse" />
      ) : filteredPayments.length === 0 ? (
        <div className="p-12 text-center bg-[#121724] border border-[#222B3D] rounded-2xl text-xs text-gray-500">
          No payment records found.
        </div>
      ) : (
        <div className="bg-[#121724] border border-[#222B3D] rounded-2xl overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#161C2B] text-gray-400 uppercase font-bold text-[10px] border-b border-[#222B3D]">
              <tr>
                <th className="p-4">Invoice #</th>
                <th className="p-4">Client & Project</th>
                <th className="p-4">Method & Transaction</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C2333]">
              {filteredPayments.map((pay) => (
                <tr key={pay.id} className="hover:bg-[#161D2E] transition-colors">
                  <td className="p-4 font-mono font-bold text-white">{pay.invoiceNumber}</td>
                  <td className="p-4">
                    <div className="font-bold text-white">{pay.clientName}</div>
                    <div className="text-[11px] text-gray-400">{pay.projectName}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-gray-200">{pay.paymentMethod}</div>
                    <div className="text-[10px] font-mono text-gray-500">{pay.transactionId}</div>
                  </td>
                  <td className="p-4 font-extrabold text-emerald-400">{formatCurrency(pay.amount)}</td>
                  <td className="p-4 font-mono">{pay.date}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      pay.status === 'Paid' ? 'bg-[#8EF012]/15 text-[#8EF012]' : 'bg-amber-950/80 text-amber-400'
                    }`}>
                      {pay.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onViewInvoice(pay)}
                        className="px-2.5 py-1 bg-[#1C2538] hover:bg-[#283550] text-gray-200 rounded-lg transition-colors flex items-center gap-1 font-semibold text-[11px]"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#8EF012]" />
                        <span>Invoice PDF</span>
                      </button>
                      <button
                        onClick={() => onDeletePayment(pay.id)}
                        className="p-1.5 text-gray-400 hover:text-red-400"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

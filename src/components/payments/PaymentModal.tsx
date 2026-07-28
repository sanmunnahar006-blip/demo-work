import React, { useState, useEffect } from 'react';
import { X, CreditCard, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { Payment, Project, PaymentMethod, PaymentStatus } from '../../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (paymentData: Partial<Payment>) => Promise<void>;
  projects: Project[];
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  projects,
}) => {
  const [formData, setFormData] = useState<Partial<Payment>>({
    projectId: '',
    amount: 10000,
    paymentMethod: 'Bank Transfer',
    transactionId: '',
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Paid',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const selectedProj = projects.length > 0 ? projects[0] : null;
      setFormData({
        projectId: selectedProj ? selectedProj.id : '',
        amount: selectedProj ? selectedProj.dueAmount || 10000 : 10000,
        paymentMethod: 'Bank Transfer',
        transactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        date: new Date().toISOString().split('T')[0],
        status: 'Paid',
        notes: 'Milestone installment payment',
      });
      setError(null);
    }
  }, [isOpen, projects]);

  if (!isOpen) return null;

  const handleProjectChange = (projId: string) => {
    const proj = projects.find(p => p.id === projId);
    setFormData({
      ...formData,
      projectId: projId,
      amount: proj ? proj.dueAmount || 5000 : 5000,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectId || !formData.amount) {
      setError('Please select a project and enter the payment amount.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-sans">
      <div className="bg-[#0F131C] border border-[#222F47] rounded-3xl w-full max-w-xl shadow-2xl relative overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#222F47] flex items-center justify-between bg-[#121724]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1A2234] border border-[#8EF012]/40 text-[#8EF012] flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Record Transaction & Generate Invoice</h3>
              <p className="text-xs text-gray-400">Updates project paid balances and logs financial audit trail</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-[#1C2538]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Select Project *</label>
            <select
              required
              value={formData.projectId || ''}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white text-xs focus:outline-none focus:border-[#8EF012]"
            >
              <option value="">-- Select Project --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Due: ${p.dueAmount.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Payment Amount ($) *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white text-xs focus:outline-none focus:border-[#8EF012]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Payment Method</label>
              <select
                value={formData.paymentMethod || 'Bank Transfer'}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                className="w-full px-3.5 py-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white text-xs focus:outline-none focus:border-[#8EF012]"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Stripe">Stripe</option>
                <option value="Wise">Wise</option>
                <option value="Crypto">Crypto (USDT / USDC)</option>
                <option value="PayPal">PayPal</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Invoice Number</label>
              <input
                type="text"
                value={formData.invoiceNumber || ''}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white text-xs focus:outline-none focus:border-[#8EF012]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Transaction ID / Reference</label>
              <input
                type="text"
                value={formData.transactionId || ''}
                onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white text-xs focus:outline-none focus:border-[#8EF012]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Payment Date</label>
              <input
                type="date"
                value={formData.date || ''}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white text-xs focus:outline-none focus:border-[#8EF012]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Payment Status</label>
              <select
                value={formData.status || 'Paid'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as PaymentStatus })}
                className="w-full px-3.5 py-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white text-xs focus:outline-none focus:border-[#8EF012]"
              >
                <option value="Paid">Paid & Confirmed</option>
                <option value="Pending">Pending Verification</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Notes</label>
            <input
              type="text"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Deposit milestone 1"
              className="w-full px-3.5 py-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white text-xs focus:outline-none focus:border-[#8EF012]"
            />
          </div>

          <div className="pt-4 border-t border-[#222F47] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-[#1C2438] hover:bg-[#25314C] text-gray-300 font-bold text-xs rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-[#8EF012] hover:bg-[#a2f734] text-black font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(142,240,18,0.25)]"
            >
              {submitting ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

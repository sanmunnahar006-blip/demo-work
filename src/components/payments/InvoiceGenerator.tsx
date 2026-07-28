import React, { useRef } from 'react';
import { X, Printer, Download, Sparkles, Building, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Payment, Client, Project, AgencySettings } from '../../types';
import jsPDF from 'jspdf';

interface InvoiceGeneratorProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
  agencySettings?: AgencySettings;
}

export const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({
  payment,
  isOpen,
  onClose,
  agencySettings,
}) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !payment) return null;

  const agencyName = agencySettings?.agencyName || 'SOLVEX';
  const tagline = agencySettings?.tagline || 'Enterprise Web Engineering';
  const address = agencySettings?.address || '700 Tech Plaza, Suite 1200, Silicon Valley, CA';
  const taxId = agencySettings?.taxId || 'US-998822110';
  const email = agencySettings?.email || 'contact@solvex.io';
  const phone = agencySettings?.phone || '+1 (800) 555-7658';

  const formatCurrency = (val: number) => `$${val.toLocaleString()}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    if (invoiceRef.current) {
      doc.html(invoiceRef.current, {
        callback: function (pdf) {
          pdf.save(`${payment.invoiceNumber}_SOLVEX.pdf`);
        },
        x: 20,
        y: 20,
        width: 550,
        windowWidth: 800,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto font-sans">
      <div className="bg-[#0F131C] border border-[#222F47] rounded-3xl w-full max-w-4xl shadow-2xl my-8 relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Controls */}
        <div className="px-6 py-4 bg-[#121724] border-b border-[#222F47] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#8EF012]" />
            <h3 className="text-sm font-bold text-white">Official Agency Invoice Preview</h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-[#1C2538] hover:bg-[#283550] border border-[#2D3C5C] text-gray-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-[#8EF012]" />
              <span>Print Invoice</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="px-4 py-1.5 bg-[#8EF012] hover:bg-[#a2f734] text-black font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(142,240,18,0.2)] transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 stroke-[3]" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-xl hover:bg-[#1C2538] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Document Canvas */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white text-slate-900" ref={invoiceRef}>
          {/* Printable Letterhead */}
          <div className="flex justify-between items-start pb-8 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-[#8EF012] font-black text-lg">
                  S
                </div>
                <h1 className="text-2xl font-black tracking-wider text-black">{agencyName}</h1>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">{tagline}</p>
              <p className="text-[11px] text-slate-500 mt-2 max-w-xs">{address}</p>
              <p className="text-[11px] text-slate-500">Tax ID: {taxId} • {email}</p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full font-mono text-xs font-extrabold uppercase">
                {payment.status === 'Paid' ? 'PAID & RECEIPTED' : payment.status}
              </span>
              <h2 className="text-xl font-mono font-bold text-slate-900 mt-3">{payment.invoiceNumber}</h2>
              <p className="text-xs text-slate-500 mt-1">Issue Date: {payment.date}</p>
              <p className="text-xs text-slate-500">Transaction ID: {payment.transactionId}</p>
            </div>
          </div>

          {/* Billed To */}
          <div className="grid grid-cols-2 gap-8 my-8 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Billed To Client</span>
              <h3 className="text-sm font-bold text-slate-900">{payment.clientName}</h3>
              <p className="text-slate-600 mt-1">Assigned Project: <strong>{payment.projectName}</strong></p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Payment Method</span>
              <p className="text-sm font-bold text-slate-900">{payment.paymentMethod}</p>
              <p className="text-slate-500 mt-1">Currency: USD ($)</p>
            </div>
          </div>

          {/* Itemized Table */}
          <table className="w-full text-left text-xs text-slate-800 mb-8 border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-100 font-bold text-slate-600 uppercase text-[10px]">
              <tr>
                <th className="p-3">Deliverable Description</th>
                <th className="p-3 text-right">Qty</th>
                <th className="p-3 text-right">Amount ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="p-3">
                  <div className="font-bold text-slate-900">{payment.projectName}</div>
                  <div className="text-[11px] text-slate-500">{payment.notes || 'Engineering deliverable milestone payment'}</div>
                </td>
                <td className="p-3 text-right font-mono">1</td>
                <td className="p-3 text-right font-mono font-bold">{formatCurrency(payment.amount)}</td>
              </tr>
            </tbody>
          </table>

          {/* Total Breakdown */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(payment.amount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax (0.00%)</span>
                <span className="font-mono">$0.00</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-300 text-sm font-black text-slate-900">
                <span>Total Amount Paid</span>
                <span className="font-mono text-emerald-600">{formatCurrency(payment.amount)}</span>
              </div>
            </div>
          </div>

          {/* Footer Terms */}
          <div className="pt-6 border-t border-slate-200 text-[10px] text-slate-400 text-center space-y-1">
            <p className="font-medium text-slate-600">Thank you for working with {agencyName}.</p>
            <p>This is a computer-generated official receipt issued by SOLVEX Enterprise Operations.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

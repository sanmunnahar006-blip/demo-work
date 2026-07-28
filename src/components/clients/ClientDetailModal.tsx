import React from 'react';
import { 
  X, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Calendar, 
  MessageSquare, 
  Briefcase, 
  DollarSign, 
  FileText, 
  Tag, 
  Clock, 
  ExternalLink,
  Edit2,
  Plus
} from 'lucide-react';
import { Client, Project, Communication, Payment } from '../../types';

interface ClientDetailModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  communications: Communication[];
  payments: Payment[];
  onEdit: (client: Client) => void;
  onAddCommunication: (client: Client) => void;
  onAddProject: (client: Client) => void;
}

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  client,
  isOpen,
  onClose,
  projects,
  communications,
  payments,
  onEdit,
  onAddCommunication,
  onAddProject,
}) => {
  if (!isOpen || !client) return null;

  const clientProjects = projects.filter(p => p.clientId === client.id);
  const clientCommunications = communications.filter(c => c.clientId === client.id);
  const clientPayments = payments.filter(p => p.clientId === client.id);

  const totalContractValue = clientProjects.reduce((acc, p) => acc + p.budget, 0);
  const totalPaid = clientProjects.reduce((acc, p) => acc + p.paidAmount, 0);
  const totalDue = clientProjects.reduce((acc, p) => acc + p.dueAmount, 0);

  const formatCurrency = (val: number) => `$${val.toLocaleString()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto font-sans">
      <div className="bg-[#0F131C] border border-[#222F47] rounded-3xl w-full max-w-5xl shadow-2xl my-8 relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Profile Cover */}
        <div className="px-6 py-6 bg-gradient-to-r from-[#141A28] via-[#1A2234] to-[#0E131F] border-b border-[#222F47] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 relative">
          <div className="flex items-center gap-4">
            <img
              src={client.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(client.name)}`}
              alt={client.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-[#8EF012]/50 shadow-[0_0_20px_rgba(142,240,18,0.2)]"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">{client.name}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  client.status === 'Active' ? 'bg-[#8EF012]/15 text-[#8EF012] border border-[#8EF012]/30' : 'bg-gray-800 text-gray-300'
                }`}>
                  {client.status}
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-0.5 font-medium">
                {client.designation ? `${client.designation} at ` : ''}
                <strong className="text-[#8EF012]">{client.company}</strong>
              </p>
              <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-gray-500" />
                <span>{client.city ? `${client.city}, ` : ''}{client.country}</span>
                <span className="mx-1.5">•</span>
                <span>Since {client.clientSince}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onEdit(client)}
              className="px-3.5 py-2 bg-[#1C2538] hover:bg-[#283550] border border-[#2D3C5C] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-[#1C2538] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#121724] border border-[#222B3D]">
              <span className="text-[11px] text-gray-400 uppercase font-semibold">Total Contract Value</span>
              <div className="text-xl font-extrabold text-white mt-1">{formatCurrency(totalContractValue)}</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#121724] border border-[#222B3D]">
              <span className="text-[11px] text-gray-400 uppercase font-semibold">Total Revenue Collected</span>
              <div className="text-xl font-extrabold text-[#8EF012] mt-1">{formatCurrency(totalPaid)}</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#121724] border border-[#222B3D]">
              <span className="text-[11px] text-gray-400 uppercase font-semibold">Current Outstanding Balance</span>
              <div className="text-xl font-extrabold text-amber-400 mt-1">{formatCurrency(totalDue)}</div>
            </div>
          </div>

          {/* Contact Details Grid */}
          <div>
            <h3 className="text-xs font-bold text-[#8EF012] uppercase tracking-wider mb-3">
              Direct Contact Channels & Socials
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <a href={`mailto:${client.email}`} className="p-3 bg-[#131826] border border-[#222B3D] rounded-xl flex items-center gap-3 hover:border-[#8EF012]/40 transition-colors group">
                <Mail className="w-4 h-4 text-[#8EF012]" />
                <div className="min-w-0">
                  <span className="text-[10px] text-gray-400 block">Email</span>
                  <span className="text-white font-medium truncate block group-hover:text-[#8EF012]">{client.email}</span>
                </div>
              </a>

              {client.phone && (
                <a href={`tel:${client.phone}`} className="p-3 bg-[#131826] border border-[#222B3D] rounded-xl flex items-center gap-3 hover:border-[#8EF012]/40 transition-colors group">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-gray-400 block">Phone</span>
                    <span className="text-white font-medium truncate block">{client.phone}</span>
                  </div>
                </a>
              )}

              {client.whatsapp && (
                <a href={`https://wa.me/${client.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="p-3 bg-[#131826] border border-[#222B3D] rounded-xl flex items-center gap-3 hover:border-[#8EF012]/40 transition-colors group">
                  <MessageSquare className="w-4 h-4 text-emerald-500" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-gray-400 block">WhatsApp</span>
                    <span className="text-white font-medium truncate block">{client.whatsapp}</span>
                  </div>
                </a>
              )}

              {client.website && (
                <a href={client.website} target="_blank" rel="noreferrer" className="p-3 bg-[#131826] border border-[#222B3D] rounded-xl flex items-center gap-3 hover:border-[#8EF012]/40 transition-colors group">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-gray-400 block">Website</span>
                    <span className="text-white font-medium truncate block flex items-center gap-1">
                      <span>Visit</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </a>
              )}
            </div>
          </div>

          {/* Client Projects */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-[#8EF012] uppercase tracking-wider">
                Associated Projects ({clientProjects.length})
              </h3>
              <button
                onClick={() => onAddProject(client)}
                className="text-xs text-[#8EF012] hover:underline font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Project</span>
              </button>
            </div>

            <div className="space-y-3">
              {clientProjects.length === 0 ? (
                <div className="p-6 bg-[#121724] border border-[#222B3D] rounded-xl text-center text-xs text-gray-500">
                  No projects assigned to this client yet.
                </div>
              ) : (
                clientProjects.map((p) => (
                  <div key={p.id} className="p-4 bg-[#121724] border border-[#222B3D] rounded-xl flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{p.name}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1C2538] text-gray-300">
                          {p.type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1">{p.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-white">{formatCurrency(p.budget)}</div>
                      <div className="text-[10px] text-[#8EF012] mt-0.5 font-medium">{p.status}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Communications History */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-[#8EF012] uppercase tracking-wider">
                Communication Log ({clientCommunications.length})
              </h3>
              <button
                onClick={() => onAddCommunication(client)}
                className="text-xs text-[#8EF012] hover:underline font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Note/Meeting</span>
              </button>
            </div>

            <div className="space-y-3">
              {clientCommunications.length === 0 ? (
                <div className="p-6 bg-[#121724] border border-[#222B3D] rounded-xl text-center text-xs text-gray-500">
                  No communication entries logged yet.
                </div>
              ) : (
                clientCommunications.map((c) => (
                  <div key={c.id} className="p-4 bg-[#121724] border border-[#222B3D] rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-[#1C2538] text-[#8EF012] font-mono text-[10px]">
                          {c.type}
                        </span>
                        {c.summary}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {new Date(c.date).toLocaleDateString()}
                      </span>
                    </div>
                    {c.details && <p className="text-xs text-gray-300 leading-relaxed pt-1">{c.details}</p>}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Notes */}
          {client.notes && (
            <div className="p-4 bg-[#121724] border border-[#222B3D] rounded-xl space-y-1">
              <h4 className="text-xs font-bold text-gray-400 uppercase">Internal Notes</h4>
              <p className="text-xs text-gray-300 leading-relaxed">{client.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

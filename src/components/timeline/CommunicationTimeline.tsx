import React, { useState } from 'react';
import { 
  Clock, 
  MessageSquare, 
  Phone, 
  Mail, 
  Video, 
  FileText, 
  Plus, 
  Trash2, 
  User, 
  Calendar,
  X
} from 'lucide-react';
import { Communication, Client, CommunicationType } from '../../types';

interface TimelineProps {
  communications: Communication[];
  clients: Client[];
  loading: boolean;
  onAddCommunication: (data: Partial<Communication>) => Promise<void>;
  onDeleteCommunication: (id: string) => Promise<void>;
}

export const CommunicationTimeline: React.FC<TimelineProps> = ({
  communications,
  clients,
  loading,
  onAddCommunication,
  onDeleteCommunication,
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newComm, setNewComm] = useState<Partial<Communication>>({
    clientId: clients.length > 0 ? clients[0].id : '',
    type: 'Call',
    summary: '',
    details: '',
    followUpDate: '',
  });

  const filteredComms = communications.filter((c) => {
    const matchesClient = selectedClientId === 'ALL' || c.clientId === selectedClientId;
    const matchesType = typeFilter === 'ALL' || c.type === typeFilter;
    return matchesClient && matchesType;
  });

  const getIcon = (type: CommunicationType) => {
    switch (type) {
      case 'Call': return <Phone className="w-4 h-4 text-emerald-400" />;
      case 'WhatsApp': return <MessageSquare className="w-4 h-4 text-emerald-500" />;
      case 'Meeting': return <Video className="w-4 h-4 text-blue-400" />;
      case 'Email': return <Mail className="w-4 h-4 text-[#8EF012]" />;
      case 'Follow Up': return <Clock className="w-4 h-4 text-amber-400" />;
      default: return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComm.clientId || !newComm.summary) return;
    await onAddCommunication(newComm);
    setIsModalOpen(false);
    setNewComm({
      clientId: clients.length > 0 ? clients[0].id : '',
      type: 'Call',
      summary: '',
      details: '',
      followUpDate: '',
    });
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 font-sans max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#1C2333]">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#8EF012]" />
            Client Communication Timeline
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Chronological audit log of client calls, emails, WhatsApp messages, and meetings
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#8EF012] hover:bg-[#a2f734] text-black font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(142,240,18,0.25)] transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Log Communication</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-[#121724] border border-[#222B3D] rounded-2xl p-4 flex flex-wrap items-center gap-4">
        <div>
          <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Filter Client</label>
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="px-3 py-2 bg-[#171D2B] border border-[#2A344A] rounded-xl text-xs text-white focus:outline-none focus:border-[#8EF012]"
          >
            <option value="ALL">All Clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Filter Channel</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-[#171D2B] border border-[#2A344A] rounded-xl text-xs text-white focus:outline-none focus:border-[#8EF012]"
          >
            <option value="ALL">All Channels</option>
            <option value="Call">Phone Call</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Meeting">Meeting</option>
            <option value="Email">Email</option>
            <option value="Note">Internal Note</option>
          </select>
        </div>
      </div>

      {/* Timeline Stream */}
      {loading ? (
        <div className="h-64 bg-[#121724] border border-[#222B3D] rounded-2xl animate-pulse" />
      ) : filteredComms.length === 0 ? (
        <div className="p-12 text-center bg-[#121724] border border-[#222B3D] rounded-2xl text-xs text-gray-500">
          No communication timeline entries recorded.
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#222B3D]">
          {filteredComms.map((comm) => (
            <div key={comm.id} className="relative group">
              {/* Timeline Bullet */}
              <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-[#121724] border-2 border-[#8EF012] flex items-center justify-center shrink-0 z-10 shadow-[0_0_10px_rgba(142,240,18,0.3)]">
                <div className="w-1.5 h-1.5 bg-[#8EF012] rounded-full" />
              </div>

              {/* Card */}
              <div className="bg-[#121724] border border-[#222B3D] hover:border-[#8EF012]/40 rounded-2xl p-5 transition-all shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1C2333]">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-[#1C2538]">
                      {getIcon(comm.type)}
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-white">{comm.summary}</h3>
                      <p className="text-xs text-gray-400">
                        Client: <strong className="text-[#8EF012]">{comm.clientName}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-gray-400 bg-[#171D2B] px-2.5 py-1 rounded-lg border border-[#222B3D]">
                      {new Date(comm.date).toLocaleString()}
                    </span>
                    <button
                      onClick={() => onDeleteCommunication(comm.id)}
                      className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {comm.details && (
                  <p className="text-xs text-gray-300 leading-relaxed pt-3">
                    {comm.details}
                  </p>
                )}

                {comm.followUpDate && (
                  <div className="mt-3 pt-3 border-t border-[#1C2333] flex items-center gap-2 text-xs text-amber-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Scheduled Follow-Up: <strong>{comm.followUpDate}</strong></span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-sans">
          <div className="bg-[#0F131C] border border-[#222F47] rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#222F47]">
              <h3 className="text-sm font-bold text-white">Log Communication Record</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Select Client *</label>
                <select
                  required
                  value={newComm.clientId}
                  onChange={(e) => setNewComm({ ...newComm, clientId: e.target.value })}
                  className="w-full p-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white focus:outline-none focus:border-[#8EF012]"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Channel Type</label>
                  <select
                    value={newComm.type}
                    onChange={(e) => setNewComm({ ...newComm, type: e.target.value as CommunicationType })}
                    className="w-full p-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white focus:outline-none focus:border-[#8EF012]"
                  >
                    <option value="Call">Call</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Email">Email</option>
                    <option value="Note">Internal Note</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Follow-up Date</label>
                  <input
                    type="date"
                    value={newComm.followUpDate || ''}
                    onChange={(e) => setNewComm({ ...newComm, followUpDate: e.target.value })}
                    className="w-full p-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white focus:outline-none focus:border-[#8EF012]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Summary Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Architecture review & Security Briefing"
                  value={newComm.summary}
                  onChange={(e) => setNewComm({ ...newComm, summary: e.target.value })}
                  className="w-full p-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white focus:outline-none focus:border-[#8EF012]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Details & Meeting Notes</label>
                <textarea
                  rows={3}
                  value={newComm.details}
                  onChange={(e) => setNewComm({ ...newComm, details: e.target.value })}
                  placeholder="Key discussion points, decisions made, next steps..."
                  className="w-full p-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white focus:outline-none focus:border-[#8EF012]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#1C2438] text-gray-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#8EF012] text-black font-bold rounded-xl"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

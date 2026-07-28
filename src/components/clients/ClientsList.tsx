import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Printer, 
  MoreVertical, 
  Mail, 
  Phone, 
  MapPin, 
  ExternalLink,
  Edit,
  Trash2,
  Eye,
  Building,
  Tag,
  Grid,
  List
} from 'lucide-react';
import { Client, ClientStatus, ClientSource } from '../../types';

interface ClientsListProps {
  clients: Client[];
  loading: boolean;
  onAddClient: () => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
  onViewClient: (client: Client) => void;
}

export const ClientsList: React.FC<ClientsListProps> = ({
  clients,
  loading,
  onAddClient,
  onEditClient,
  onDeleteClient,
  onViewClient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'company' | 'date'>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filter & Sort Logic
  const filteredClients = clients
    .filter((c) => {
      const matchesSearch = 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.country.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
      const matchesSource = sourceFilter === 'ALL' || c.source === sourceFilter;

      return matchesSearch && matchesStatus && matchesSource;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'company') return a.company.localeCompare(b.company);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const exportCSV = () => {
    const headers = ['ID', 'Name', 'Company', 'Designation', 'Email', 'Phone', 'Country', 'Status', 'Source'];
    const rows = filteredClients.map(c => [
      c.id,
      `"${c.name}"`,
      `"${c.company}"`,
      `"${c.designation}"`,
      c.email,
      c.phone,
      c.country,
      c.status,
      c.source
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `solvex_clients_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printList = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 font-sans max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#1C2333]">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#8EF012]" />
            Client Directory & CRM
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage agency clients, contacts, status tags, and duplicate detection
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 bg-[#121724] hover:bg-[#1A2234] border border-[#222B3D] text-gray-300 hover:text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={printList}
            className="px-3.5 py-2 bg-[#121724] hover:bg-[#1A2234] border border-[#222B3D] text-gray-300 hover:text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            title="Print Client List"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print</span>
          </button>

          <button
            onClick={onAddClient}
            className="px-4 py-2 bg-[#8EF012] hover:bg-[#a2f734] text-black font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(142,240,18,0.25)] transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add New Client</span>
          </button>
        </div>
      </div>

      {/* Filter & Control Bar */}
      <div className="bg-[#121724] border border-[#222B3D] rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, company, email, phone..."
            className="w-full pl-10 pr-4 py-2 bg-[#171D2B] border border-[#2A344A] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#8EF012]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#171D2B] border border-[#2A344A] rounded-xl text-xs text-white focus:outline-none focus:border-[#8EF012]"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active Clients</option>
            <option value="Inactive">Inactive</option>
            <option value="Lead">Lead / Prospect</option>
            <option value="On Hold">On Hold</option>
          </select>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 bg-[#171D2B] border border-[#2A344A] rounded-xl text-xs text-white focus:outline-none focus:border-[#8EF012]"
          >
            <option value="ALL">All Sources</option>
            <option value="Organic">Organic</option>
            <option value="Referral">Referral</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Website">Website</option>
            <option value="Upwork">Upwork</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-[#171D2B] border border-[#2A344A] rounded-xl text-xs text-white focus:outline-none focus:border-[#8EF012]"
          >
            <option value="date">Sort: Recent First</option>
            <option value="name">Sort: Client Name</option>
            <option value="company">Sort: Company</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-[#171D2B] border border-[#2A344A] rounded-xl text-gray-400">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#253046] text-[#8EF012]' : 'hover:text-white'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-[#253046] text-[#8EF012]' : 'hover:text-white'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Clients Grid / Table */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-56 bg-[#121724] border border-[#222B3D] rounded-2xl" />
          ))}
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="p-12 text-center bg-[#121724] border border-[#222B3D] rounded-2xl">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white">No clients found</h3>
          <p className="text-xs text-gray-400 mt-1">Try resetting search query or add a new client profile.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="bg-[#121724] border border-[#222B3D] hover:border-[#8EF012]/40 rounded-2xl p-5 transition-all flex flex-col justify-between group shadow-lg"
            >
              <div>
                {/* Header Profile Row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={client.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(client.name)}`}
                      alt={client.name}
                      className="w-12 h-12 rounded-xl object-cover border border-[#222B3D] group-hover:border-[#8EF012]/50 transition-colors"
                    />
                    <div>
                      <h3 className="text-sm font-extrabold text-white group-hover:text-[#8EF012] transition-colors line-clamp-1">
                        {client.name}
                      </h3>
                      <p className="text-xs text-gray-300 font-medium line-clamp-1 mt-0.5">
                        {client.company || 'Individual Client'}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    client.status === 'Active' ? 'bg-[#8EF012]/15 text-[#8EF012] border border-[#8EF012]/30' : 'bg-gray-800 text-gray-300'
                  }`}>
                    {client.status}
                  </span>
                </div>

                {/* Details List */}
                <div className="space-y-2 text-xs text-gray-400 mb-4">
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-[#8EF012] shrink-0" />
                    <span className="truncate text-gray-300">{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2 truncate">
                      <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    <span>{client.city ? `${client.city}, ` : ''}{client.country}</span>
                  </div>
                </div>

                {/* Tags */}
                {client.tags && client.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {client.tags.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded bg-[#1A2234] text-[10px] text-gray-300 font-medium">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div className="pt-3 border-t border-[#1C2333] flex items-center justify-between gap-2">
                <button
                  onClick={() => onViewClient(client)}
                  className="px-3 py-1.5 bg-[#1C2538] hover:bg-[#26334D] text-gray-300 hover:text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5 text-[#8EF012]" />
                  <span>View Details</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditClient(client)}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-[#1C2538] rounded-lg transition-colors"
                    title="Edit Client"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteClient(client.id)}
                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                    title="Delete Client"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-[#121724] border border-[#222B3D] rounded-2xl overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#161C2B] text-gray-400 uppercase font-bold text-[10px] border-b border-[#222B3D]">
              <tr>
                <th className="p-4">Client / Company</th>
                <th className="p-4">Email & Contact</th>
                <th className="p-4">Location</th>
                <th className="p-4">Source</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C2333]">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-[#161D2E] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={client.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(client.name)}`}
                        alt={client.name}
                        className="w-9 h-9 rounded-lg object-cover"
                      />
                      <div>
                        <div className="font-bold text-white">{client.name}</div>
                        <div className="text-[11px] text-gray-400">{client.company}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>{client.email}</div>
                    <div className="text-[11px] text-gray-500">{client.phone}</div>
                  </td>
                  <td className="p-4">
                    {client.city ? `${client.city}, ` : ''}{client.country}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-[#1C2538] text-[10px] text-gray-300 font-mono">
                      {client.source}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      client.status === 'Active' ? 'bg-[#8EF012]/20 text-[#8EF012]' : 'bg-gray-800 text-gray-300'
                    }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => onViewClient(client)} className="p-1.5 text-gray-400 hover:text-white">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => onEditClient(client)} className="p-1.5 text-gray-400 hover:text-white">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDeleteClient(client.id)} className="p-1.5 text-gray-400 hover:text-red-400">
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

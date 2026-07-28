import React, { useState } from 'react';
import { Search, X, Users, Briefcase, CreditCard, ArrowRight } from 'lucide-react';
import { Client, Project, Payment } from '../../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  projects: Project[];
  payments: Payment[];
  onSelectClient: (client: Client) => void;
  onSelectProject: (project: Project) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  clients,
  projects,
  payments,
  onSelectClient,
  onSelectProject,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filteredClients = query.trim() ? clients.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.company.toLowerCase().includes(query.toLowerCase()) ||
    c.email.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4) : [];

  const filteredProjects = query.trim() ? projects.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.clientName.toLowerCase().includes(query.toLowerCase()) ||
    p.technology.some(t => t.toLowerCase().includes(query.toLowerCase()))
  ).slice(0, 4) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md font-sans">
      <div className="bg-[#0F131C] border border-[#222F47] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#222F47] flex items-center gap-3 bg-[#121724]">
          <Search className="w-5 h-5 text-[#8EF012] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Global Search: Type client name, project title, invoice #, tech stack..."
            className="w-full bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
          />
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4 text-xs custom-scrollbar">
          {!query.trim() ? (
            <div className="text-center py-8 text-gray-500">
              Start typing to search clients, active projects, or transaction records...
            </div>
          ) : (
            <>
              {/* Clients Section */}
              {filteredClients.length > 0 && (
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-[#8EF012] mb-2 tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    Clients ({filteredClients.length})
                  </h4>
                  <div className="space-y-1">
                    {filteredClients.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => { onSelectClient(c); onClose(); }}
                        className="p-2.5 rounded-xl bg-[#161C2B] hover:bg-[#1E273A] border border-[#222B3D] flex items-center justify-between cursor-pointer group transition-colors"
                      >
                        <div>
                          <div className="font-bold text-white group-hover:text-[#8EF012]">{c.name}</div>
                          <div className="text-[11px] text-gray-400">{c.company} • {c.email}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-[#8EF012]" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects Section */}
              {filteredProjects.length > 0 && (
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-blue-400 mb-2 tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    Projects ({filteredProjects.length})
                  </h4>
                  <div className="space-y-1">
                    {filteredProjects.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => { onSelectProject(p); onClose(); }}
                        className="p-2.5 rounded-xl bg-[#161C2B] hover:bg-[#1E273A] border border-[#222B3D] flex items-center justify-between cursor-pointer group transition-colors"
                      >
                        <div>
                          <div className="font-bold text-white group-hover:text-blue-400">{p.name}</div>
                          <div className="text-[11px] text-gray-400">{p.clientName} • ${p.budget.toLocaleString()}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredClients.length === 0 && filteredProjects.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No matching results found for "{query}".
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

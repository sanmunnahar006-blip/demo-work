import React, { useState, useEffect } from 'react';
import { X, Briefcase, DollarSign, Calendar, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { Project, Client, ProjectPriority, ProjectStatus } from '../../types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: Partial<Project>) => Promise<void>;
  projectToEdit?: Project | null;
  clients: Client[];
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  projectToEdit,
  clients,
}) => {
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    clientId: '',
    type: 'Full Web Application',
    description: '',
    technology: ['React', 'TypeScript', 'Tailwind CSS'],
    budget: 25000,
    paidAmount: 10000,
    currency: 'USD',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'High',
    status: 'In Progress',
    startDate: new Date().toISOString().split('T')[0],
    assignedNotes: '',
  });

  const [techInput, setTechInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectToEdit) {
      setFormData(projectToEdit);
    } else {
      setFormData({
        name: '',
        clientId: clients.length > 0 ? clients[0].id : '',
        type: 'Full Web Application',
        description: '',
        technology: ['React 19', 'TypeScript', 'Tailwind CSS'],
        budget: 35000,
        paidAmount: 15000,
        currency: 'USD',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'High',
        status: 'In Progress',
        startDate: new Date().toISOString().split('T')[0],
        assignedNotes: '',
      });
    }
    setError(null);
  }, [projectToEdit, isOpen, clients]);

  if (!isOpen) return null;

  const handleAddTech = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && techInput.trim()) {
      e.preventDefault();
      const newTech = Array.from(new Set([...(formData.technology || []), techInput.trim()]));
      setFormData({ ...formData, technology: newTech });
      setTechInput('');
    }
  };

  const handleRemoveTech = (techToRem: string) => {
    setFormData({ ...formData, technology: (formData.technology || []).filter(t => t !== techToRem) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.clientId) {
      setError('Project Title and Client Selection are required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto font-sans">
      <div className="bg-[#0F131C] border border-[#222F47] rounded-3xl w-full max-w-3xl shadow-2xl my-8 relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#222F47] flex items-center justify-between shrink-0 bg-[#121724]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1A2234] border border-[#8EF012]/40 text-[#8EF012] flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {projectToEdit ? 'Edit Project Specifications' : 'Launch New Client Project'}
              </h3>
              <p className="text-xs text-gray-400">Configure deliverables, tech stack, budget, and milestones</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-[#1C2538] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Title & Client */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Project Name *</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. NextGen Institutional Trading Terminal"
                className="w-full px-3.5 py-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white text-xs focus:outline-none focus:border-[#8EF012]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Assigned Client *</label>
              <select
                required
                value={formData.clientId || ''}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white text-xs focus:outline-none focus:border-[#8EF012]"
              >
                <option value="">-- Select Client --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.company || 'Individual'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Project Type & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Project Type</label>
              <input
                type="text"
                value={formData.type || ''}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="e.g. Full Web App, E-commerce, UI/UX"
                className="w-full px-3.5 py-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white text-xs focus:outline-none focus:border-[#8EF012]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Priority Level</label>
              <select
                value={formData.priority || 'High'}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as ProjectPriority })}
                className="w-full px-3.5 py-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white text-xs focus:outline-none focus:border-[#8EF012]"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Project Status</label>
              <select
                value={formData.status || 'In Progress'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                className="w-full px-3.5 py-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white text-xs focus:outline-none focus:border-[#8EF012]"
              >
                <option value="Inquiry">Inquiry</option>
                <option value="Proposal Sent">Proposal Sent</option>
                <option value="Approved">Approved</option>
                <option value="In Progress">In Progress</option>
                <option value="Revision">Revision</option>
                <option value="Testing">Testing</option>
                <option value="Delivered">Delivered</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Budget & Payments */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#121724] border border-[#222B3D]">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Total Budget ($)</label>
              <input
                type="number"
                min="0"
                value={formData.budget ?? 0}
                onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white text-xs focus:outline-none focus:border-[#8EF012]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Paid Amount ($)</label>
              <input
                type="number"
                min="0"
                value={formData.paidAmount ?? 0}
                onChange={(e) => setFormData({ ...formData, paidAmount: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white text-xs focus:outline-none focus:border-[#8EF012]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Due Balance (Auto-calc)</label>
              <div className="px-3.5 py-2.5 bg-[#1A2234] border border-[#2A344A] rounded-xl text-amber-400 font-bold text-xs">
                ${Math.max(0, (formData.budget || 0) - (formData.paidAmount || 0)).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate || ''}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white text-xs focus:outline-none focus:border-[#8EF012]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Deadline Date</label>
              <input
                type="date"
                value={formData.deadline || ''}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white text-xs focus:outline-none focus:border-[#8EF012]"
              />
            </div>
          </div>

          {/* Tech Stack Tags */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Technology Stack (Press Enter to add)</label>
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={handleAddTech}
              placeholder="e.g. Next.js, Node.js, WebGL, Tailwind, PostgreSQL"
              className="w-full px-3.5 py-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white text-xs focus:outline-none focus:border-[#8EF012]"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(formData.technology || []).map((t) => (
                <span key={t} className="px-2 py-0.5 rounded bg-[#1C2538] border border-[#2D3C5C] text-[11px] text-[#8EF012] flex items-center gap-1">
                  {t}
                  <button type="button" onClick={() => handleRemoveTech(t)} className="hover:text-red-400">×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Project Description & Scope</label>
            <textarea
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed architecture requirements and scope overview..."
              className="w-full px-3.5 py-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white text-xs focus:outline-none focus:border-[#8EF012]"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[#222F47] flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-[#1C2438] hover:bg-[#25314C] text-gray-300 font-bold text-xs rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-[#8EF012] hover:bg-[#a2f734] text-black font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(142,240,18,0.25)] transition-all disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

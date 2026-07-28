import React, { useState } from 'react';
import { 
  Briefcase, 
  Search, 
  Plus, 
  Clock, 
  DollarSign, 
  Grid, 
  List, 
  Kanban, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  Layers
} from 'lucide-react';
import { Project, Client, ProjectStatus, ProjectPriority } from '../../types';
import { KanbanBoard } from './KanbanBoard';

interface ProjectsListProps {
  projects: Project[];
  clients: Client[];
  loading: boolean;
  onAddProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onUpdateStatus: (projectId: string, newStatus: ProjectStatus) => void;
}

export const ProjectsList: React.FC<ProjectsListProps> = ({
  projects,
  clients,
  loading,
  onAddProject,
  onEditProject,
  onDeleteProject,
  onUpdateStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'kanban'>('grid');

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.technology.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || p.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const formatCurrency = (val: number) => `$${val.toLocaleString()}`;

  return (
    <div className="p-4 sm:p-8 space-y-6 font-sans max-w-7xl mx-auto">
      {/* Page Title & Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#1C2333]">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#8EF012]" />
            Project Engineering Portfolio
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Track web development deliverables, milestone budgets, status flows, and technology stacks
          </p>
        </div>

        <button
          onClick={onAddProject}
          className="px-4 py-2 bg-[#8EF012] hover:bg-[#a2f734] text-black font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(142,240,18,0.25)] transition-all flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter & View Bar */}
      <div className="bg-[#121724] border border-[#222B3D] rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search project, tech, client..."
            className="w-full pl-10 pr-4 py-2 bg-[#171D2B] border border-[#2A344A] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#8EF012]"
          />
        </div>

        {/* Filters & View switcher */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#171D2B] border border-[#2A344A] rounded-xl text-xs text-white focus:outline-none focus:border-[#8EF012]"
          >
            <option value="ALL">All Statuses</option>
            <option value="In Progress">In Progress</option>
            <option value="Testing">Testing</option>
            <option value="Completed">Completed</option>
            <option value="Inquiry">Inquiry</option>
            <option value="Proposal Sent">Proposal Sent</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-[#171D2B] border border-[#2A344A] rounded-xl text-xs text-white focus:outline-none focus:border-[#8EF012]"
          >
            <option value="ALL">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* View Toggles */}
          <div className="flex items-center p-1 bg-[#171D2B] border border-[#2A344A] rounded-xl text-gray-400">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#253046] text-[#8EF012]' : 'hover:text-white'}`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-[#253046] text-[#8EF012]' : 'hover:text-white'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'kanban' ? 'bg-[#253046] text-[#8EF012]' : 'hover:text-white'}`}
              title="Kanban Board View"
            >
              <Kanban className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-60 bg-[#121724] border border-[#222B3D] rounded-2xl" />
          ))}
        </div>
      ) : viewMode === 'kanban' ? (
        <KanbanBoard
          projects={filteredProjects}
          onUpdateStatus={onUpdateStatus}
          onEditProject={onEditProject}
        />
      ) : filteredProjects.length === 0 ? (
        <div className="p-12 text-center bg-[#121724] border border-[#222B3D] rounded-2xl">
          <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white">No projects found</h3>
          <p className="text-xs text-gray-400 mt-1">Create a new project or adjust search filters.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((p) => {
            const progressPercent = Math.min(100, Math.round((p.paidAmount / (p.budget || 1)) * 100));
            return (
              <div
                key={p.id}
                className="bg-[#121724] border border-[#222B3D] hover:border-[#8EF012]/40 rounded-2xl p-5 transition-all flex flex-col justify-between group shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1C2538] text-gray-300">
                      {p.type}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      p.status === 'Completed' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40' :
                      p.status === 'In Progress' ? 'bg-[#8EF012]/15 text-[#8EF012] border border-[#8EF012]/30' :
                      'bg-amber-950/80 text-amber-400 border border-amber-800/40'
                    }`}>
                      {p.status}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-white group-hover:text-[#8EF012] transition-colors line-clamp-1 mb-1">
                    {p.name}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-1 mb-3">{p.clientName}</p>

                  <p className="text-xs text-gray-300 line-clamp-2 mb-4 leading-relaxed">
                    {p.description}
                  </p>

                  {/* Tech stack badges */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {p.technology.map((tech) => (
                      <span key={tech} className="px-2 py-0.5 rounded bg-[#1A2234] border border-[#2A354E] text-[10px] text-[#8EF012]">
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                      <span>Payment Milestone</span>
                      <span className="font-bold text-white">{progressPercent}% Paid</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#1C2538] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#8EF012] transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Financials & Action Footer */}
                <div className="pt-3 border-t border-[#1C2333] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-gray-500 block">Total Budget</span>
                    <span className="font-extrabold text-white">{formatCurrency(p.budget)}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-500 block">Due Balance</span>
                    <span className="font-bold text-amber-400">{formatCurrency(p.dueAmount)}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditProject(p)}
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-[#1C2538] rounded-lg transition-colors"
                      title="Edit Project"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteProject(p.id)}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-[#121724] border border-[#222B3D] rounded-2xl overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#161C2B] text-gray-400 uppercase font-bold text-[10px] border-b border-[#222B3D]">
              <tr>
                <th className="p-4">Project Name & Client</th>
                <th className="p-4">Type</th>
                <th className="p-4">Budget</th>
                <th className="p-4">Paid</th>
                <th className="p-4">Due</th>
                <th className="p-4">Deadline</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C2333]">
              {filteredProjects.map((p) => (
                <tr key={p.id} className="hover:bg-[#161D2E] transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-white">{p.name}</div>
                    <div className="text-[11px] text-gray-400">{p.clientName}</div>
                  </td>
                  <td className="p-4">{p.type}</td>
                  <td className="p-4 font-bold text-white">{formatCurrency(p.budget)}</td>
                  <td className="p-4 text-emerald-400 font-bold">{formatCurrency(p.paidAmount)}</td>
                  <td className="p-4 text-amber-400 font-bold">{formatCurrency(p.dueAmount)}</td>
                  <td className="p-4 font-mono text-[11px]">{p.deadline}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#8EF012]/15 text-[#8EF012]">
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => onEditProject(p)} className="p-1.5 text-gray-400 hover:text-white">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDeleteProject(p.id)} className="p-1.5 text-gray-400 hover:text-red-400">
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

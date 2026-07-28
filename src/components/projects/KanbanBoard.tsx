import React from 'react';
import { Project, ProjectStatus } from '../../types';
import { Briefcase, Clock, DollarSign, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface KanbanBoardProps {
  projects: Project[];
  onUpdateStatus: (projectId: string, newStatus: ProjectStatus) => void;
  onEditProject: (project: Project) => void;
}

const KANBAN_COLUMNS: { id: ProjectStatus; label: string; color: string }[] = [
  { id: 'Inquiry', label: 'Inquiry / Lead', color: 'border-blue-500 text-blue-400' },
  { id: 'Proposal Sent', label: 'Proposal Sent', color: 'border-amber-500 text-amber-400' },
  { id: 'In Progress', label: 'In Progress', color: 'border-[#8EF012] text-[#8EF012]' },
  { id: 'Testing', label: 'Testing & QA', color: 'border-purple-500 text-purple-400' },
  { id: 'Completed', label: 'Completed', color: 'border-emerald-500 text-emerald-400' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  projects,
  onUpdateStatus,
  onEditProject,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4 font-sans">
      {KANBAN_COLUMNS.map((col) => {
        const columnProjects = projects.filter((p) => p.status === col.id);
        return (
          <div key={col.id} className="bg-[#121724] border border-[#222B3D] rounded-2xl p-4 flex flex-col h-[650px]">
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1C2333]">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full border ${col.color.split(' ')[0]} bg-current`} />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">{col.label}</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#1C2538] text-[10px] text-gray-300 font-bold">
                {columnProjects.length}
              </span>
            </div>

            {/* Column Cards Container */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {columnProjects.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-center text-[11px] text-gray-600 border border-dashed border-[#222B3D] rounded-xl">
                  No projects
                </div>
              ) : (
                columnProjects.map((p) => (
                  <div
                    key={p.id}
                    className="bg-[#161C2B] border border-[#222B3D] hover:border-[#8EF012]/50 rounded-xl p-3.5 space-y-2.5 transition-all shadow-md group cursor-pointer"
                    onClick={() => onEditProject(p)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-white group-hover:text-[#8EF012] transition-colors leading-snug">
                        {p.name}
                      </h4>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${
                        p.priority === 'Urgent' ? 'bg-red-950/80 text-red-400 border border-red-800/50' : 'bg-[#222B3D] text-gray-300'
                      }`}>
                        {p.priority}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-400 truncate">{p.clientName}</p>

                    {/* Tech tags */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {p.technology.slice(0, 2).map((tech) => (
                        <span key={tech} className="px-1.5 py-0.2 rounded bg-[#1F283C] text-[9px] text-gray-300">
                          {tech}
                        </span>
                      ))}
                      {p.technology.length > 2 && (
                        <span className="text-[9px] text-gray-500">+{p.technology.length - 2}</span>
                      )}
                    </div>

                    {/* Financial & Deadline Footer */}
                    <div className="pt-2 border-t border-[#222B3D] flex items-center justify-between text-[10px]">
                      <span className="font-bold text-white">${p.budget.toLocaleString()}</span>
                      <span className="text-gray-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-[#8EF012]" />
                        {p.deadline}
                      </span>
                    </div>

                    {/* Quick Move Select */}
                    <div className="pt-1 flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={p.status}
                        onChange={(e) => onUpdateStatus(p.id, e.target.value as ProjectStatus)}
                        className="bg-[#121724] border border-[#222B3D] text-[10px] text-gray-300 rounded px-1.5 py-0.5 focus:outline-none focus:border-[#8EF012]"
                      >
                        <option value="Inquiry">Move: Inquiry</option>
                        <option value="Proposal Sent">Move: Proposal</option>
                        <option value="Approved">Move: Approved</option>
                        <option value="In Progress">Move: In Progress</option>
                        <option value="Testing">Move: Testing</option>
                        <option value="Completed">Move: Completed</option>
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
